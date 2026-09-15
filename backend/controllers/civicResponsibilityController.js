const {
  resolveResponsibility,
  determineWard,
  getOfficerProfile,
  getContractorProfile,
  getContractorComparison,
  findOfficer,
  findContractor,
  parseGPSFromLocation
} = require('../services/jurisdictionService');

const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, '../../data/sample_complaints.json');

/**
 * GET /api/civic/jurisdiction?lat=...&lng=...
 * Determine ward, zone, department from GPS coordinates.
 */
const getJurisdiction = (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng query parameters required' });

  const ward = determineWard(parseFloat(lat), parseFloat(lng));
  return res.json({
    success: true,
    data: {
      ward: ward.wardId,
      wardName: ward.wardName,
      zone: ward.zone,
      zoneName: ward.zoneName,
      method: ward.method
    }
  });
};

/**
 * GET /api/civic/officers/responsible?ward=...&department=...
 * Get the responsible officer for a ward and department.
 */
const getResponsibleOfficer = (req, res) => {
  const { ward, department } = req.query;
  if (!ward || !department) return res.status(400).json({ success: false, message: 'ward and department query parameters required' });

  const officer = findOfficer(ward, department);
  if (!officer) return res.status(404).json({ success: false, message: 'No officer found for this jurisdiction' });

  return res.json({
    success: true,
    data: {
      id: officer.officerId,
      name: officer.name,
      designation: officer.designation,
      departmentName: officer.departmentName,
      jurisdiction: officer.jurisdiction,
      stats: officer.stats
    }
  });
};

/**
 * GET /api/civic/contractors/responsible?ward=...&department=...
 * Get the responsible contractor for a ward and department.
 */
const getResponsibleContractor = (req, res) => {
  const { ward, department } = req.query;
  if (!ward || !department) return res.status(400).json({ success: false, message: 'ward and department query parameters required' });

  const contractor = findContractor(ward, department);
  if (!contractor) return res.status(404).json({ success: false, message: 'No contractor found for this jurisdiction' });

  return res.json({
    success: true,
    data: {
      id: contractor.contractorId,
      name: contractor.name,
      departmentId: contractor.departmentId,
      assignedWards: contractor.assignedWards,
      stats: contractor.stats
    }
  });
};

/**
 * GET /api/civic/complaints/:id/responsibility
 * One clean API — full responsibility chain for a complaint.
 */
const getComplaintResponsibility = (req, res) => {
  const { id } = req.params;

  // Load complaint from JSON store
  let complaint = null;
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      complaint = data.find(c => c.complaintId === id);
    }
  } catch (err) {}

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // If responsibility already resolved on the complaint, return it
  // Otherwise, resolve it now from GPS + category
  let lat = 22.7510, lng = 75.8920; // Default Indore coords (Vijay Nagar)
  if (complaint.location) {
    if (typeof complaint.location === 'object' && complaint.location.lat) {
      lat = complaint.location.lat;
      lng = complaint.location.lng;
    } else if (typeof complaint.location === 'string') {
      const parsed = parseGPSFromLocation(complaint.location);
      if (parsed) { lat = parsed.lat; lng = parsed.lng; }
    }
  }

  const category = complaint.category || 'Road Damage';
  const responsibility = resolveResponsibility(lat, lng, category);

  return res.json({
    success: true,
    data: {
      complaintId: id,
      category,
      ...responsibility
    }
  });
};

/**
 * GET /api/civic/officers/:id/profile
 * Officer profile with stats and area coverage.
 */
const getOfficerProfileById = (req, res) => {
  const { id } = req.params;
  const profile = getOfficerProfile(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Officer not found' });

  return res.json({
    success: true,
    data: {
      officerId: profile.officerId,
      name: profile.name,
      designation: profile.designation,
      departmentId: profile.departmentId,
      departmentName: profile.departmentName,
      jurisdiction: profile.jurisdiction,
      responsibilities: profile.responsibilities,
      stats: profile.stats,
      areaCovered: profile.areaCovered
    }
  });
};

/**
 * GET /api/civic/contractors/:id/profile
 * Contractor profile with performance metrics.
 */
const getContractorProfileById = (req, res) => {
  const { id } = req.params;
  const profile = getContractorProfile(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Contractor not found' });

  return res.json({
    success: true,
    data: {
      contractorId: profile.contractorId,
      name: profile.name,
      departmentId: profile.departmentId,
      assignedWards: profile.assignedWards,
      contactOffice: profile.contactOffice,
      registrationNo: profile.registrationNo,
      stats: profile.stats,
      contractDetails: profile.contractDetails,
      calculatedPerformanceScore: profile.calculatedPerformanceScore,
      performanceBadge: profile.performanceBadge
    }
  });
};

/**
 * GET /api/civic/contractors/compare?ward=...
 * Contractor comparison table for admin.
 */
const getContractorsComparison = (req, res) => {
  const { ward } = req.query;
  const comparison = getContractorComparison(ward);
  return res.json({ success: true, data: comparison });
};

module.exports = {
  getJurisdiction,
  getResponsibleOfficer,
  getResponsibleContractor,
  getComplaintResponsibility,
  getOfficerProfileById,
  getContractorProfileById,
  getContractorsComparison
};
