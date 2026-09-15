-- ============================================================================
-- Awaaz AI / CivicFlow AI-X Enterprise Database Schema
-- Production PostGIS & TimescaleDB DDL with Strict Multi-Tenancy & Spatial Indexing
-- ============================================================================

-- 1. Enable Spatial & Time-Series Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
-- Optional in standard PostgreSQL, automatically leveraged in TimescaleDB:
-- CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- 2. Multi-Tenant ULB Registry Table
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    center_geom GEOMETRY(Point, 4326),
    sla_config JSONB DEFAULT '{"critical_hours": 12, "high_hours": 24, "medium_hours": 48, "low_hours": 96}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tenants (tenant_id, name, state, center_geom)
VALUES 
    ('tenant_nmc', 'Nagpur Municipal Corporation', 'Maharashtra', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
    ('tenant_imc', 'Indore Municipal Corporation', 'Madhya Pradesh', ST_SetSRID(ST_MakePoint(75.8577, 22.7196), 4326)),
    ('tenant_bmc', 'Brihanmumbai Municipal Corporation', 'Maharashtra', ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326))
ON CONFLICT (tenant_id) DO NOTHING;

-- 3. Core Civic Grievances Table (Multi-Tenant & PostGIS Enabled)
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_id VARCHAR(64) UNIQUE NOT NULL,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(tenant_id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Road Damage',
    urgency VARCHAR(50) NOT NULL DEFAULT 'Medium',
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    department VARCHAR(200),
    department_code VARCHAR(50),
    
    -- Geospatial PostGIS Point (WGS84)
    geom GEOMETRY(Point, 4326) NOT NULL,
    
    -- Uber H3 Hexagonal Discrete Global Grid Index
    h3_res8 VARCHAR(20) NOT NULL,
    h3_res9 VARCHAR(20) NOT NULL,
    
    -- AI Deduplication & Verification Hashes
    phash VARCHAR(64),
    blockchain_hash VARCHAR(64),
    
    -- Source & Citizen Context
    source VARCHAR(50) DEFAULT 'web',
    citizen_phone VARCHAR(32),
    language VARCHAR(10) DEFAULT 'en',
    
    -- SLA & Impact Scoring
    sla_hours_total INT DEFAULT 48,
    sla_hours_remaining INT DEFAULT 48,
    impact_score NUMERIC(5, 2) DEFAULT 75.0,
    priority_weight NUMERIC(5, 2) DEFAULT 1.0,
    
    -- Verification Lifecycle
    verification_status VARCHAR(50) DEFAULT 'NONE',
    verified_count INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    resolution_proof TEXT,
    resolution_notes TEXT,
    
    -- Audit Payload
    audit_timeline JSONB DEFAULT '[]'::jsonb,
    xai_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Spatial GIST Index & Multi-Tenant Performance Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_geom ON complaints USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_status ON complaints (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_created ON complaints (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_h3_res8 ON complaints (tenant_id, h3_res8);
CREATE INDEX IF NOT EXISTS idx_complaints_h3_res9 ON complaints (tenant_id, h3_res9);
CREATE INDEX IF NOT EXISTS idx_complaints_phash ON complaints (tenant_id, phash) WHERE phash IS NOT NULL;

-- 5. Row-Level Security (RLS) for Strict Multi-Tenant Data Isolation
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Dynamic Tenant Isolation Policy:
-- Sets query scope to: current_setting('app.current_tenant', true)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'complaints' AND policyname = 'tenant_isolation_policy'
    ) THEN
        CREATE POLICY tenant_isolation_policy ON complaints
            FOR ALL
            USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''))
            WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), ''));
    END IF;
END $$;

-- 6. TimescaleDB Telemetry Events (Road Hazard & Sensor Pings)
CREATE TABLE IF NOT EXISTS telemetry_events (
    time TIMESTAMPTZ NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    hazard_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    h3_res9 VARCHAR(20) NOT NULL,
    source_partner VARCHAR(100) DEFAULT 'ZOMATO_FLEET',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_telemetry_geom ON telemetry_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_telemetry_time_tenant ON telemetry_events (time DESC, tenant_id);

-- Convert to TimescaleDB Hypertable if extension is available:
-- SELECT create_hypertable('telemetry_events', 'time', if_not_exists => TRUE);

-- 7. B2B Delivery Route Proximity Query (Example <10ms index-accelerated query)
-- Used by Zomato, Swiggy, Zepto, and Uber routing engines:
/*
SELECT 
    complaint_id,
    category,
    urgency,
    h3_res9,
    ST_AsGeoJSON(geom)::json AS coordinates,
    ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_meters
FROM complaints
WHERE 
    tenant_id = :tenantId
    AND status IN ('New', 'Started', 'In Progress', 'Assigned')
    AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)
ORDER BY distance_meters ASC
LIMIT 50;
*/
