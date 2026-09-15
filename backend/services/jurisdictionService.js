/**
 * Jurisdiction Engine — Civic Responsibility Mapping
 * 
 * Resolves GPS coordinates → Ward → Department → Officer → Asset → Contractor → Contract
 * Responsibility comes from authoritative administrative/contract data, NOT AI guessing.
 */

const path = require('path');
const fs = require('fs');

// Load civic knowledge graph data
const dataDir = path.join(__dirname, '../../data');
const loadJSON = (file) => {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); }
  catch (e) { console.error(`[JurisdictionEngine] Failed to load ${file}:`, e.message); return []; }
};

const wardBoundaries = loadJSON('wardBoundaries.json');
const officers = loadJSON('officers.json');
const contractors = loadJSON('contractors.json');
const contracts = loadJSON('contracts.json');
const assets = loadJSON('assets.json');
const wards = loadJSON('wards.json');
const departments = loadJSON('departments.json');

// Department code mapping from AI service categories
const CATEGORY_TO_DEPT = {
  'Road Damage': 'DEPT_ROAD',
  'Road': 'DEPT_ROAD',
  'Water Supply': 'DEPT_WATER',
  'Water Pipeline': 'DEPT_WATER',
  'Sanitation': 'DEPT_SAN',
  'Drainage': 'DEPT_SAN',
  'Electrical': 'DEPT_ELEC',
  'Streetlight': 'DEPT_ELEC',
  'Parks': 'DEPT_PARK',
  'Park': 'DEPT_PARK'
};

// Asset type mapping from categories
const CATEGORY_TO_ASSET_TYPE = {
  'Road Damage': 'Road',
  'Road': 'Road',
  'Water Supply': 'Water Pipeline',
  'Water Pipeline': 'Water Pipeline',
  'Sanitation': 'Drainage',
  'Drainage': 'Drainage',
  'Electrical': 'Streetlight',
  'Streetlight': 'Streetlight',
  'Parks': 'Park',
  'Park': 'Park'
};

/**
 * Point-in-polygon test using ray casting algorithm.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Array} polygon - Array of {lat, lng} vertices
 * @returns {boolean}
 */
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate distance between two GPS points (Haversine formula, returns km).
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Determine ward from GPS coordinates.
 * Uses point-in-polygon; falls back to nearest ward centroid.
 */
function determineWard(lat, lng) {
  // Try point-in-polygon first
  for (const ward of wardBoundaries) {
    if (pointInPolygon(lat, lng, ward.polygon)) {
      return {
        wardId: ward.wardId,
        wardName: ward.wardName,
        zoneId: ward.zoneId,
        zoneName: ward.zoneName,
        zone: ward.zone,
        method: 'polygon'
      };
    }
  }

  // Fallback: nearest ward centroid
  let nearest = null;
  let minDist = Infinity;
  for (const ward of wardBoundaries) {
    const centroid = ward.polygon.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat / ward.polygon.length, lng: acc.lng + p.lng / ward.polygon.length }),
      { lat: 0, lng: 0 }
    );
    const dist = haversineDistance(lat, lng, centroid.lat, centroid.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = ward;
    }
  }

  if (nearest) {
    return {
      wardId: nearest.wardId,
      wardName: nearest.wardName,
      zoneId: nearest.zoneId,
      zoneName: nearest.zoneName,
      zone: nearest.zone,
      method: 'nearest_centroid'
    };
  }

  // Hard fallback: Ward 12 (Vijay Nagar — demo default)
  return {
    wardId: '12',
    wardName: 'Ward 12 — Vijay Nagar',
    zoneId: 'vijay-nagar',
    zoneName: 'Vijay Nagar Zone',
    zone: 'East',
    method: 'default'
  };
}

/**
 * Find the nearest infrastructure asset of the right type within a ward.
 */
function findNearestAsset(lat, lng, wardId, assetType) {
  const wardAssets = assets.filter(a => a.ward === wardId && a.type === assetType);
  if (wardAssets.length === 0) {
    // Fallback: any asset in the ward
    const anyAsset = assets.find(a => a.ward === wardId);
    return anyAsset || null;
  }

  let nearest = null;
  let minDist = Infinity;
  for (const asset of wardAssets) {
    const dist = haversineDistance(lat, lng, asset.coordinates.lat, asset.coordinates.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = asset;
    }
  }
  return nearest;
}

/**
 * Find the responsible officer for a ward and department.
 */
function findOfficer(wardId, departmentCode) {
  return officers.find(o => o.jurisdiction.ward === wardId && o.departmentId === departmentCode) ||
    officers.find(o => o.departmentId === departmentCode) ||
    null;
}

/**
 * Find the responsible contractor for a ward and department.
 */
function findContractor(wardId, departmentCode) {
  return contractors.find(c => c.departmentId === departmentCode && c.assignedWards.includes(wardId)) ||
    contractors.find(c => c.departmentId === departmentCode) ||
    null;
}

/**
 * Find the active contract/work order for a ward and department.
 */
function findContract(wardId, departmentCode) {
  return contracts.find(c => c.ward === wardId && c.departmentId === departmentCode && c.status === 'Active') ||
    null;
}

/**
 * Get department display name from department code.
 */
function getDepartmentName(departmentCode) {
  const dept = departments.find(d => d.id === departmentCode);
  return dept ? dept.name : departmentCode;
}

/**
 * Full civic responsibility resolution.
 * GPS → Ward → Department → Officer → Asset → Contractor → Contract
 */
function resolveResponsibility(lat, lng, category) {
  const departmentCode = CATEGORY_TO_DEPT[category] || 'DEPT_ROAD';
  const assetType = CATEGORY_TO_ASSET_TYPE[category] || 'Road';

  // 1. Determine ward from GPS
  const ward = determineWard(lat, lng);

  // 2. Find responsible officer
  const officer = findOfficer(ward.wardId, departmentCode);

  // 3. Find nearest asset
  const asset = findNearestAsset(lat, lng, ward.wardId, assetType);

  // 4. Find contractor (from asset or ward/dept)
  const contractor = asset
    ? (contractors.find(c => c.contractorId === asset.contractorId) || findContractor(ward.wardId, departmentCode))
    : findContractor(ward.wardId, departmentCode);

  // 5. Find active contract
  const contract = findContract(ward.wardId, departmentCode);

  // 6. Get SLA from contract or default
  const slaHours = contract ? contract.slaHours : (departmentCode === 'DEPT_WATER' || departmentCode === 'DEPT_ELEC' ? 24 : 48);

  return {
    jurisdiction: {
      ward: ward.wardId,
      zone: ward.zone,
      zoneName: ward.zoneName,
      wardName: ward.wardName,
      method: ward.method
    },
    department: {
      code: departmentCode,
      name: getDepartmentName(departmentCode)
    },
    officer: officer ? {
      id: officer.officerId,
      name: officer.name,
      designation: officer.designation,
      departmentName: officer.departmentName,
      stats: officer.stats
    } : null,
    asset: asset ? {
      id: asset.assetId,
      type: asset.type,
      name: asset.name
    } : null,
    contractor: contractor ? {
      id: contractor.contractorId,
      name: contractor.name,
      stats: contractor.stats
    } : null,
    workOrder: contract ? contract.workOrderId : null,
    project: contract ? contract.project : null,
    slaHours,
    explanation: getResponsibilityExplanation(ward, departmentCode, category, officer, asset, contractor, contract)
  };
}

/**
 * Explainable AI — generates human-readable reasons why each entity is responsible.
 */
function getResponsibilityExplanation(ward, departmentCode, category, officer, asset, contractor, contract) {
  const steps = [];

  steps.push({
    check: '✓',
    label: `Complaint category: ${category}`,
    detail: `Mapped to ${getDepartmentName(departmentCode)}`
  });

  steps.push({
    check: '✓',
    label: `GPS location: ${ward.wardName}`,
    detail: `Zone: ${ward.zoneName} (${ward.zone})`
  });

  if (asset) {
    steps.push({
      check: '✓',
      label: `Infrastructure asset: ${asset.assetId}`,
      detail: asset.name
    });
  }

  if (officer) {
    steps.push({
      check: '✓',
      label: `Jurisdiction: ${ward.wardName} ${getDepartmentName(departmentCode)}`,
      detail: `Responsible officer: ${officer.name} (${officer.designation})`
    });
  }

  if (contract) {
    steps.push({
      check: '✓',
      label: `Active maintenance contract: ${contract.workOrderId}`,
      detail: contract.project
    });
  }

  if (contractor) {
    steps.push({
      check: '✓',
      label: `Assigned contractor: ${contractor.name}`,
      detail: `Performance score: ${contractor.stats ? contractor.stats.performanceScore + '%' : 'N/A'}`
    });
  }

  return steps;
}

/**
 * Get officer profile by ID.
 */
function getOfficerProfile(officerId) {
  const officer = officers.find(o => o.officerId === officerId);
  if (!officer) return null;

  // Get all wards this officer covers
  const coveredWards = wards.filter(w => w.officerIds && w.officerIds.includes(officerId));

  return {
    ...officer,
    areaCovered: coveredWards.map(w => ({
      wardId: w.wardId,
      wardName: w.wardName,
      zoneName: w.zoneName
    }))
  };
}

/**
 * Get contractor profile by ID.
 */
function getContractorProfile(contractorId) {
  const contractor = contractors.find(c => c.contractorId === contractorId);
  if (!contractor) return null;

  // Get active contracts for this contractor
  const activeContracts = contracts.filter(c => contractor.activeContracts.includes(c.workOrderId));

  // Calculate weighted performance score
  const s = contractor.stats;
  const calculatedScore = Math.round(
    (s.slaCompliance * 0.40) +
    (s.resolutionRate * 0.25) +
    (s.citizenSatisfaction * 0.20) +
    ((100 - s.repeatComplaints) * 0.15)
  );

  return {
    ...contractor,
    contractDetails: activeContracts,
    calculatedPerformanceScore: calculatedScore,
    performanceBadge: calculatedScore >= 85 ? '🏆 Good Performance' : calculatedScore >= 70 ? '⚠️ Needs Improvement' : '🔴 Below Standards'
  };
}

/**
 * Get contractor comparison for a ward or all wards.
 */
function getContractorComparison(wardId) {
  let filtered = contractors;
  if (wardId) {
    filtered = contractors.filter(c => c.assignedWards.includes(wardId));
  }

  return filtered.map(c => ({
    contractorId: c.contractorId,
    name: c.name,
    departmentId: c.departmentId,
    assignedWards: c.assignedWards,
    activeWorks: c.stats.totalAssigned - c.stats.completed,
    slaCompliance: c.stats.slaCompliance,
    overdue: c.stats.overdue,
    performanceScore: c.stats.performanceScore,
    performanceBadge: c.stats.performanceScore >= 85 ? '🏆 Good' : c.stats.performanceScore >= 70 ? '⚠️ Needs Improvement' : '🔴 Below Standards'
  }));
}

/**
 * Parse GPS coordinates from the complaint location string.
 * Handles formats like: "Live GPS: 22.7510° N, 75.8920° E (Vijay Nagar)"
 */
function parseGPSFromLocation(locationStr) {
  if (!locationStr) return null;

  // Try "21.1458° N, 79.0882° E" format
  const gpsMatch = locationStr.match(/([\d.]+)°?\s*N?\s*,?\s*([\d.]+)°?\s*E?/i);
  if (gpsMatch) {
    const lat = parseFloat(gpsMatch[1]);
    const lng = parseFloat(gpsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lng > 0) return { lat, lng };
  }

  // Try raw "lat,lng" format
  const rawMatch = locationStr.match(/([\d.]+)\s*,\s*([\d.]+)/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat > 15 && lat < 35 && lng > 68 && lng < 98) return { lat, lng };
  }

  // Default Indore coordinates for demo (Vijay Nagar)
  return { lat: 22.7510, lng: 75.8920 };
}

module.exports = {
  determineWard,
  resolveResponsibility,
  getResponsibilityExplanation,
  getOfficerProfile,
  getContractorProfile,
  getContractorComparison,
  parseGPSFromLocation,
  findOfficer,
  findContractor,
  findContract,
  findNearestAsset
};
