/**
 * High-Throughput B2B Service API Gateway
 * Provides low-latency (<50ms) road hazard telemetry feeds, H3 micro-zone heatmaps,
 * and delivery fleet sensor ingestion for Zomato, Swiggy, Zepto, and Uber.
 */

const express = require('express');
const router = express.Router();
const { rateLimiter } = require('../infrastructure/gateway/rateLimiter');
const geoH3Service = require('../services/geoH3Service');
const b2bWebhookService = require('../services/b2bWebhookService');
const Complaint = require('../models/Complaint');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../../data/sample_complaints.json');

function loadComplaints() {
  try {
    if (fs.existsSync(dataFilePath)) {
      return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }
  } catch (e) {}
  return [];
}

// In-Memory Edge Cache (30s TTL)
let edgeCache = {
  data: null,
  cachedAt: 0,
  ttlMs: 30 * 1000
};

// Apply sliding window token bucket rate limiter to all B2B routes
router.use(rateLimiter.middleware());

/**
 * GET /api/v1/b2b/telemetry/hazards
 * Low-latency (<50ms) road hazard feed for delivery navigation engines
 */
router.get('/telemetry/hazards', (req, res) => {
  const startTime = Date.now();
  const tenantId = req.tenantId || req.headers['x-tenant-id'] || 'tenant_nmc';
  const { lat, lng, radiusMeters, category, h3Cell } = req.query;

  // Set HTTP edge caching headers (30s TTL, stale-while-revalidate)
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=15');
  res.setHeader('X-Cache-Engine', 'Awaaz-Edge-Spatial-V2');

  const now = Date.now();
  let complaints = [];

  // Check 30s edge cache
  if (edgeCache.data && now - edgeCache.cachedAt < edgeCache.ttlMs && !lat && !h3Cell) {
    complaints = edgeCache.data;
    res.setHeader('X-Cache', 'HIT');
  } else {
    complaints = loadComplaints();
    edgeCache.data = complaints;
    edgeCache.cachedAt = now;
    res.setHeader('X-Cache', 'MISS');
  }

  // Filter only active road hazards (Road Damage, Water Supply pipeline burst, Electrical wire hazard)
  let hazards = complaints.filter(
    (c) =>
      (!c.tenantId || c.tenantId === tenantId) &&
      ['New', 'Assigned', 'In Progress', 'Started', 'Accepted'].includes(c.status) &&
      ['Road Damage', 'Water Supply', 'Electrical'].includes(c.category)
  );

  // Filter by H3 cell if specified
  if (h3Cell) {
    hazards = hazards.filter((c) => c.h3IndexRes8 === h3Cell || c.h3IndexRes9 === h3Cell);
  }

  // Filter by spatial radius if coordinates provided
  if (lat && lng) {
    const qLat = parseFloat(lat);
    const qLng = parseFloat(lng);
    const qRad = parseInt(radiusMeters, 10) || 5000;

    hazards = hazards
      .map((h) => {
        const hLat = h.location?.lat || 21.1458;
        const hLng = h.location?.lng || 79.0882;
        const dist = geoH3Service.getDistanceMeters(qLat, qLng, hLat, hLng);
        return { ...h, distanceMeters: dist };
      })
      .filter((h) => h.distanceMeters <= qRad)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  const durationMs = Date.now() - startTime;
  res.setHeader('X-Response-Time-Ms', durationMs);

  return res.json({
    success: true,
    feed: 'CivicFlow-B2B-Hazard-Stream',
    tenantId,
    timestamp: new Date().toISOString(),
    latencyMs: durationMs,
    count: hazards.length,
    hazards: hazards.slice(0, 100).map((h) => ({
      hazardId: h.complaintId,
      type: h.category,
      severity: h.urgency,
      status: h.status,
      h3Res8: h.h3IndexRes8 || '8861892433fffff',
      h3Res9: h.h3IndexRes9 || '8961892433fffff',
      location: h.location,
      distanceMeters: h.distanceMeters !== undefined ? h.distanceMeters : null,
      reportedAt: h.createdAt
    }))
  });
});

/**
 * GET /api/v1/b2b/telemetry/hex-heatmap
 * Uber H3 hexagonal spatial aggregation for live municipal heatmaps
 */
router.get('/telemetry/hex-heatmap', (req, res) => {
  const tenantId = req.tenantId || 'tenant_nmc';
  const complaints = loadComplaints().filter((c) => !c.tenantId || c.tenantId === tenantId);
  const clusters = geoH3Service.clusterComplaintsByHex(complaints, 8);

  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.json({
    success: true,
    tenantId,
    totalClusters: clusters.length,
    clusters
  });
});

/**
 * POST /api/v1/b2b/telemetry/sensor-ping
 * Ingests road condition sensor telemetry from delivery partner fleets
 */
router.post('/telemetry/sensor-ping', (req, res) => {
  const { partnerId, lat, lng, bumpSeverity, speedKmh } = req.body;
  const tenantId = req.tenantId || 'tenant_nmc';

  const h3Cell = geoH3Service.latLngToCell(lat || 21.1458, lng || 79.0882, 9);

  // If severe bump reported, trigger webhook alert
  if (bumpSeverity === 'CRITICAL' || bumpSeverity === 'HIGH') {
    b2bWebhookService.dispatchEvent(
      'hazard.pothole',
      {
        detectedBy: partnerId || 'ZOMATO_FLEET',
        lat,
        lng,
        h3Cell,
        bumpSeverity,
        speedKmh: speedKmh || 35
      },
      tenantId
    );
  }

  return res.status(202).json({
    success: true,
    status: 'INGESTED',
    h3Cell,
    tenantId,
    recordedAt: new Date().toISOString()
  });
});

/**
 * GET /api/v1/b2b/subscribers
 * Lists registered webhook partner subscriptions
 */
router.get('/subscribers', (req, res) => {
  return res.json({
    success: true,
    subscribers: b2bWebhookService.getSubscribers()
  });
});

module.exports = router;
