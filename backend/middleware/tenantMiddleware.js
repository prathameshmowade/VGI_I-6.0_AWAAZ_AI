/**
 * Multi-Tenancy Scoping Middleware
 * Enforces strict isolation per Urban Local Body (ULB) / Corporation:
 * e.g., tenant_nmc (Nagpur), tenant_imc (Indore), tenant_bmc (Brihanmumbai)
 */

const VALID_TENANTS = {
  tenant_nmc: {
    name: 'Nagpur Municipal Corporation',
    code: 'NMC',
    centerCoords: { lat: 21.1458, lng: 79.0882 },
    defaultWards: 16,
    defaultZones: 10
  },
  tenant_imc: {
    name: 'Indore Municipal Corporation',
    code: 'IMC',
    centerCoords: { lat: 22.7196, lng: 75.8577 },
    defaultWards: 19,
    defaultZones: 12
  },
  tenant_bmc: {
    name: 'Brihanmumbai Municipal Corporation',
    code: 'BMC',
    centerCoords: { lat: 19.0760, lng: 72.8777 },
    defaultWards: 24,
    defaultZones: 6
  },
  tenant_nagarpalika_x: {
    name: 'Katol Nagar Palika',
    code: 'KNP',
    centerCoords: { lat: 21.2678, lng: 78.5833 },
    defaultWards: 8,
    defaultZones: 2
  }
};

const DEFAULT_TENANT = 'tenant_nmc';

function tenantMiddleware(req, res, next) {
  // Extract tenant ID from header, query param, or subdomain
  let tenantId =
    req.headers['x-tenant-id'] ||
    req.query.tenantId ||
    req.body?.tenantId;

  if (!tenantId && req.hostname) {
    // E.g., imc.awaaz.gov.in -> tenant_imc
    const subdomain = req.hostname.split('.')[0]?.toLowerCase();
    if (subdomain === 'imc') tenantId = 'tenant_imc';
    else if (subdomain === 'bmc') tenantId = 'tenant_bmc';
    else if (subdomain === 'nmc') tenantId = 'tenant_nmc';
  }

  // Sanitize and validate
  tenantId = (tenantId || DEFAULT_TENANT).toLowerCase().trim();
  if (!VALID_TENANTS[tenantId]) {
    tenantId = DEFAULT_TENANT;
  }

  req.tenantId = tenantId;
  req.tenantConfig = VALID_TENANTS[tenantId];
  res.setHeader('X-Tenant-ID', tenantId);

  next();
}

module.exports = {
  tenantMiddleware,
  VALID_TENANTS,
  DEFAULT_TENANT
};
