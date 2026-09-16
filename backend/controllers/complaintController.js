const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { recordAuditEvent } = require('../services/blockchainService');
const verificationEngine = require('../services/verificationEngine');
const geoH3Service = require('../services/geoH3Service');
const pHashService = require('../services/pHashService');
const guardrailService = require('../services/guardrailService');
const { taskQueue, JOB_TYPES } = require('../infrastructure/queue/taskQueue');
const logger = require('../infrastructure/observability/logger');

const { generateUniqueComplaintId, generateUniqueIntakeId } = require('../utils/idGenerator');

// Centralized Database Store — single source of truth
const { loadComplaints: loadDatabase, saveComplaints: saveDatabase, syncComplaintToMongo } = require('../utils/databaseStore');

const getComplaints = async (req, res) => {
  const tenantId = req.tenantId || req.headers['x-tenant-id'] || 'tenant_nmc';
  const { h3Cell, status, citizenEmail, citizenPhone, citizenId } = req.query;

  try {
    if (mongoose.connection.readyState === 1) {
      const filter = { tenantId };
      if (h3Cell) filter.$or = [{ h3IndexRes8: h3Cell }, { h3IndexRes9: h3Cell }];
      if (status) filter.status = status;
      if (citizenEmail) filter.citizenEmail = citizenEmail;
      if (citizenPhone) filter.citizenPhone = citizenPhone;
      if (citizenId) filter.citizenId = citizenId;

      const dbComplaints = await Complaint.find(filter).sort({ priority_weight: -1, createdAt: -1 });
      if (dbComplaints && dbComplaints.length > 0) {
        return res.json({ success: true, tenantId, count: dbComplaints.length, data: dbComplaints });
      }
    }
  } catch (err) {
    // Fall back to persistent JSON storage
  }

  let store = loadDatabase();
  // Filter by tenant if present in store, or default to tenant_nmc
  store = store.filter((c) => !c.tenantId || c.tenantId === tenantId);
  if (h3Cell) {
    store = store.filter((c) => c.h3IndexRes8 === h3Cell || c.h3IndexRes9 === h3Cell);
  }
  if (status) {
    store = store.filter((c) => c.status === status);
  }
  if (citizenEmail || citizenPhone || citizenId) {
    store = store.filter((c) => {
      if (citizenEmail && c.citizenEmail && c.citizenEmail.toLowerCase() === citizenEmail.toLowerCase()) return true;
      if (citizenPhone && c.citizenPhone && c.citizenPhone.includes(citizenPhone)) return true;
      if (citizenId && c.citizenId === citizenId) return true;
      return false;
    });
  }

  // Sort by priority_weight descending so failed-verification complaints appear first
  store.sort((a, b) => (b.priority_weight || 1) - (a.priority_weight || 1));
  return res.json({ success: true, tenantId, count: store.length, data: store });
};

const getComplaintById = async (req, res) => {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const dbComp = await Complaint.findOne({ complaintId: id });
      if (dbComp) return res.json({ success: true, data: dbComp });
    }
  } catch (err) {}
  
  const store = loadDatabase();
  const found = store.find((x) => x.complaintId === id);
  if (!found) return res.status(404).json({ success: false, message: 'Complaint not found' });
  return res.json({ success: true, data: found });
};

/**
 * Asynchronous High-Speed Decoupled Intake (<30ms response)
 * Returns HTTP 202 Accepted and lightweight tracking reference.
 * Enqueues heavy AI classification, pHash deduplication, and routing to background worker.
 */
const ingestComplaintAsync = async (req, res) => {
  const startTime = Date.now();
  const tenantId = req.tenantId || req.body.tenantId || 'tenant_nmc';
  const correlationId = req.correlationId || `ing_${Date.now()}`;

  try {
    const store = loadDatabase();
    const intakeId = generateUniqueIntakeId(store, req.body.intakeReference || req.body.intakeId);
    const newComplaintId = generateUniqueComplaintId(store, req.body.complaintId || req.body._id);

    // 1. PII Redaction & Guardrail Sanitization
    const sanitized = guardrailService.processGrievancePayload({
      title: req.body.title || 'Civic Issue Report',
      description: req.body.description || ''
    });

    // 2. Fast Coordinate & H3 Hex Calculation
    const { parseGPSFromLocation } = require('../services/jurisdictionService');
    const locationStr = req.body.location || '';
    const gps = parseGPSFromLocation(locationStr);
    const h3Res8 = geoH3Service.latLngToCell(gps.lat, gps.lng, 8);
    const h3Res9 = geoH3Service.latLngToCell(gps.lat, gps.lng, 9);

    // 3. Perceptual Image Hash (dHash) for Zero-GPU Duplicate Detection
    const imagePayload = req.body.proof || req.body.photoUrl || req.body.image;
    const pHash = pHashService.computeDHash(imagePayload);

    // 4. Fast Spatial Duplicate Check
    const dupCheck = pHashService.findSpatialDuplicates(pHash, h3Res8, store);

    // 5. Enqueue background heavy processing
    taskQueue.enqueue(
      JOB_TYPES.AI_TRIAGE,
      {
        complaintId: newComplaintId,
        intakeId,
        tenantId,
        title: sanitized.title,
        description: sanitized.description,
        category: req.body.category,
        location: locationStr,
        gps,
        h3Res8,
        h3Res9,
        pHash,
        isDuplicate: dupCheck.isDuplicate,
        duplicateParentId: dupCheck.primaryDuplicate?.complaintId || null
      },
      {
        priority: req.body.urgency === 'Critical' ? 1 : 5,
        correlationId,
        tenantId
      }
    );

    // 6. Fast preliminary database record creation
    const preliminaryRecord = {
      complaintId: newComplaintId,
      intakeReference: intakeId,
      tenantId,
      title: sanitized.title,
      description: sanitized.description,
      category: req.body.category || 'Road Damage',
      urgency: req.body.urgency || 'High Priority',
      status: 'Accepted',
      department: 'Municipal Corporation Intake Desk',
      location: locationStr,
      h3IndexRes8: h3Res8,
      h3IndexRes9: h3Res9,
      pHash,
      isDuplicate: dupCheck.isDuplicate,
      duplicateCount: dupCheck.duplicateCount,
      duplicateParentId: dupCheck.primaryDuplicate?.complaintId || null,
      source: req.body.source || 'web',
      citizenPhone: req.body.citizenPhone || null,
      createdAt: new Date().toISOString()
    };

    store.unshift(preliminaryRecord);
    saveDatabase(store);

    const latencyMs = Date.now() - startTime;
    logger.info(`[FastIngest] Acknowledged ${intakeId} in ${latencyMs}ms (202 Accepted)`, {
      intakeId,
      newComplaintId,
      tenantId,
      latencyMs
    });

    return res.status(202).json({
      success: true,
      status: 'ACCEPTED',
      intakeReference: intakeId,
      complaintId: newComplaintId,
      tenantId,
      h3Cell: h3Res8,
      isDuplicate: dupCheck.isDuplicate,
      duplicateParentId: dupCheck.primaryDuplicate?.complaintId || null,
      message: 'Grievance received and enqueued for asynchronous AI classification',
      estimatedProcessingMs: 250,
      trackingUrl: `/citizen?track=${newComplaintId}`,
      receivedAt: new Date().toISOString()
    });
  } catch (err) {
    logger.error(`[FastIngest] Ingestion error: ${err.message}`, { error: err.message });
    return res.status(500).json({ success: false, message: 'Fast ingestion error: ' + err.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const store = loadDatabase();
    const newId = generateUniqueComplaintId(store, req.body.complaintId || req.body._id);
    const tenantId = req.tenantId || req.body.tenantId || 'tenant_nmc';
    
    // Privacy Shield PII redaction & Constitutional Guardrails
    const sanitized = guardrailService.processGrievancePayload({
      title: req.body.title || 'Civic Issue Report',
      description: req.body.description || ''
    });
    const title = sanitized.title;
    const description = sanitized.description;
      
    // Record SHA-256 Cryptographic Audit Hash
    const auditRecord = recordAuditEvent({ complaintId: newId, title, description, timestamp: new Date().toISOString() });

    // AI Auto-Classification Engine (handles "Other / Miscellaneous" and semantic keyword triage)
    const { classifyComplaintLocally } = require('../services/aiService');
    const aiTriage = classifyComplaintLocally({
      title,
      description,
      category: req.body.category,
      customCategory: req.body.customCategory
    });

    // Civic Responsibility Resolution — GPS → Ward → Officer → Asset → Contractor → Contract
    const { resolveResponsibility, parseGPSFromLocation } = require('../services/jurisdictionService');
    const locationStr = req.body.location || '';
    const gps = parseGPSFromLocation(locationStr);
    const responsibility = resolveResponsibility(gps.lat, gps.lng, aiTriage.category);

    // Geospatial Uber H3 Indexing
    const h3Res8 = geoH3Service.latLngToCell(gps.lat, gps.lng, 8);
    const h3Res9 = geoH3Service.latLngToCell(gps.lat, gps.lng, 9);

    // Perceptual Image Hash (dHash) for Zero-GPU Duplicate Detection
    const imagePayload = req.body.proof || req.body.photoUrl || req.body.image;
    const pHash = pHashService.computeDHash(imagePayload);
    const dupCheck = pHashService.findSpatialDuplicates(pHash, h3Res8, store);

    const newComplaint = {
      complaintId: newId,
      tenantId,
      h3IndexRes8: h3Res8,
      h3IndexRes9: h3Res9,
      pHash,
      title,
      description,
      category: aiTriage.category,
      urgency: req.body.urgency || aiTriage.urgency || 'High Priority',
      status: 'Assigned',
      department: aiTriage.department,
      departmentCode: aiTriage.departmentCode,
      location: locationStr,
      citizenId: req.body.citizenId || null,
      citizenEmail: req.body.citizenEmail || null,
      citizenName: req.body.citizenName || null,
      citizenPhone: req.body.citizenPhone || req.body.mobile || null,
      jurisdiction: {
        ward: responsibility.jurisdiction.ward,
        zone: responsibility.jurisdiction.zone,
        zoneName: responsibility.jurisdiction.zoneName
      },
      officerId: responsibility.officer ? responsibility.officer.id : null,
      assetId: responsibility.asset ? responsibility.asset.id : null,
      contractorId: responsibility.contractor ? responsibility.contractor.id : null,
      workOrderId: responsibility.workOrder || null,
      responsibilityData: {
        officer: responsibility.officer,
        contractor: responsibility.contractor,
        asset: responsibility.asset,
        project: responsibility.project,
        slaHours: responsibility.slaHours,
        explanation: responsibility.explanation
      },
      isAutoClassified: aiTriage.isAutoClassified,
      confidenceScore: aiTriage.confidenceScore || 96,
      slaHoursTotal: responsibility.slaHours || 48,
      slaHoursRemaining: responsibility.slaHours || 48,
      impactScore: Math.floor(Math.random() * 10) + 85,
      isDuplicate: dupCheck.isDuplicate,
      duplicateCount: dupCheck.duplicateCount,
      duplicateParentId: dupCheck.primaryDuplicate?.complaintId || null,
      blockchainHash: auditRecord.hash,
      // Verification lifecycle defaults
      priority_weight: 1,
      verification_status: 'NONE',
      verification_attempts: 0,
      verification_failures: 0,
      verified_count: 0,
      rejected_count: 0,
      xaiData: {
        confidence: aiTriage.confidenceScore || 96,
        reasoning: aiTriage.xaiReasoning,
        rulesApplied: ['School & Hospital Proximity Priority Rule', 'Municipal Service Routing Protocol'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      xaiExplanation: {
        confidence: aiTriage.confidenceScore || 96,
        reasoning: aiTriage.xaiReasoning,
        rulesApplied: ['School & Hospital Proximity Priority Rule'],
        similarCases: ['CMP-2025-8891', 'CMP-2025-9102']
      },
      auditTimeline: [{
        event: 'Complaint Created & AI Triaged',
        actor: 'System',
        actorRole: 'system',
        timestamp: new Date().toISOString(),
        details: { category: aiTriage.category, department: aiTriage.department, urgency: aiTriage.urgency },
        hash: auditRecord.hash
      }],
      createdAt: new Date().toISOString()
    };

    // Save to persistent JSON storage
    store.unshift(newComplaint);
    saveDatabase(store);

    // Also attempt MongoDB save
    try {
      await Complaint.create(newComplaint);
    } catch (err) {}

    console.log(`[DB SUCCESS] Complaint ${newId} saved with Civic Responsibility Mapping — Ward: ${responsibility.jurisdiction.ward}, Officer: ${responsibility.officer ? responsibility.officer.name : 'N/A'}, Contractor: ${responsibility.contractor ? responsibility.contractor.name : 'N/A'}`);

    return res.status(201).json({
      success: true,
      message: 'Complaint successfully registered with civic responsibility mapping',
      data: newComplaint
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    return res.status(500).json({ success: false, message: 'Server error saving complaint' });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolutionProof, resolutionNotes } = req.body;
  const store = loadDatabase();
  let comp = store.find((x) => x.complaintId === id);

  if (!comp) {
    // If ticket not in JSON store yet, create entry so status update is never lost
    comp = {
      complaintId: id,
      title: req.body.title || 'Municipal Grievance Issue',
      description: req.body.description || 'Grievance ticket under officer resolution',
      category: req.body.category || 'Road Damage',
      urgency: 'High Priority',
      status,
      priority_weight: 1,
      verification_status: 'NONE',
      verification_attempts: 0,
      verification_failures: 0,
      createdAt: new Date().toISOString()
    };
    store.unshift(comp);
  }

  comp.status = status;
  if (resolutionProof) comp.resolutionProof = resolutionProof;
  if (resolutionNotes) comp.resolutionNotes = resolutionNotes;

  // Add audit timeline entry
  if (!comp.auditTimeline) comp.auditTimeline = [];
  const audit = recordAuditEvent({ complaintId: id, status, timestamp: new Date().toISOString() });
  comp.auditTimeline.push({
    event: `Status Updated to "${status}"`,
    actor: req.body.actorName || 'Officer',
    actorRole: req.body.actorRole || 'officer',
    timestamp: new Date().toISOString(),
    details: { status, resolutionProof, resolutionNotes },
    hash: audit.hash
  });
  comp.blockchainHash = audit.hash;

  saveDatabase(store);

  try {
    await Complaint.updateOne(
      { complaintId: id },
      { 
        status, 
        ...(resolutionProof && { resolutionProof }),
        ...(resolutionNotes && { resolutionNotes }),
        auditTimeline: comp.auditTimeline,
        blockchainHash: comp.blockchainHash
      },
      { upsert: true }
    );
  } catch (err) {}

  // Dispatch resolution notification to citizen if complaint reached resolved/completed state
  const isResolvedStatus = ['Resolved', 'Completed', 'Verified & Resolved'].includes(status);
  if (isResolvedStatus) {
    try {
      const { dispatchResolutionNotification } = require('../services/notificationService');
      dispatchResolutionNotification(comp, {
        actorName: req.body.actorName || 'Municipal Officer',
        actorRole: req.body.actorRole || 'officer',
        resolutionProof: resolutionProof || comp.resolutionProof,
        resolutionNotes: resolutionNotes || comp.resolutionNotes
      }).catch(e => console.warn('[Notification Trigger]', e.message));
    } catch (e) {}
  }

  console.log(`[STATUS UPDATE] Ticket ${id} status updated to '${status}'. Stored in database.`);

  return res.json({ success: true, message: `Status updated to ${status}`, data: comp });
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPLETE COMPLAINT — Officer uploads proof and moves to Under Verification
// POST /api/complaints/:id/complete
// ═════════════════════════════════════════════════════════════════════════════

const completeComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionProof, resolutionProof, completionNotes, resolutionNotes, officer } = req.body;

    const proof = completionProof || resolutionProof;
    const notes = completionNotes || resolutionNotes || '';

    // Build officer identity from request body or auth context
    const officerData = officer || {
      id: req.body.officerId || req.body.officerEmail || 'officer-unknown',
      name: req.body.officerName || 'Municipal Officer',
      email: req.body.officerEmail || '',
      role: 'officer',
      department: req.body.officerDepartment || ''
    };

    const result = verificationEngine.submitCompletion({
      complaintId: id,
      officer: officerData,
      completionProof: proof,
      completionNotes: notes
    });

    // Sync to MongoDB
    try {
      await Complaint.updateOne(
        { complaintId: id },
        { $set: result.data },
        { upsert: true }
      );
    } catch (err) {}

    // Dispatch completion & resolution notification to citizen
    try {
      const { dispatchResolutionNotification } = require('../services/notificationService');
      dispatchResolutionNotification(result.data, {
        actorName: officerData.name,
        actorRole: officerData.role || 'officer',
        resolutionProof: proof,
        resolutionNotes: notes
      }).catch(e => console.warn('[Notification Trigger]', e.message));
    } catch (e) {}

    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Server error completing complaint';
    console.error(`[COMPLETE ERROR] ${message}`);
    return res.status(status).json({ success: false, message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// VERIFY COMPLAINT — Citizen casts VERIFIED or REJECTED vote
// POST /api/complaints/:id/verify
// ═════════════════════════════════════════════════════════════════════════════

const verifyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote, status: voteStatus, feedback, comment, citizenName, citizenId, citizenEmail, location } = req.body;

    // Resolve vote value: accept "vote" field, or legacy "status" field, or default to VERIFIED
    const resolvedVote = vote || voteStatus || 'VERIFIED';
    const normalizedVote = resolvedVote.toUpperCase() === 'REJECTED' ? 'REJECTED' : 'VERIFIED';

    // Build citizen identity from request body
    const citizen = {
      citizenId: citizenId || citizenEmail || citizenName || 'citizen-anonymous',
      name: citizenName || 'Verified Citizen',
      email: citizenEmail || ''
    };

    const result = verificationEngine.submitVerification({
      complaintId: id,
      citizen,
      vote: normalizedVote,
      feedback: feedback || comment || '',
      location: location || {}
    });

    // Sync to MongoDB
    try {
      await Complaint.updateOne(
        { complaintId: id },
        { $set: result.data },
        { upsert: true }
      );
    } catch (err) {}

    // If verification marked complaint as Completed/VERIFIED, dispatch resolution notification
    if (result.data?.status === 'Completed' || result.data?.verification_status === 'VERIFIED') {
      try {
        const { dispatchResolutionNotification } = require('../services/notificationService');
        dispatchResolutionNotification(result.data, {
          actorName: 'Community Consensus Verified',
          actorRole: 'citizen-consensus',
          resolutionProof: result.data.completion_proof || result.data.resolutionProof,
          resolutionNotes: 'Verified and certified closed by community consensus.'
        }).catch(e => console.warn('[Notification Trigger]', e.message));
      } catch (e) {}
    }

    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Server error processing verification';
    console.error(`[VERIFY ERROR] ${message}`);
    return res.status(status).json({ success: false, message });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// TWIN CITY VERIFICATIONS — Get complaints needing citizen verification
// GET /api/complaints/twin-city/verifications (or /api/twin-city/verifications)
// ═════════════════════════════════════════════════════════════════════════════

const getTwinCityVerifications = async (req, res) => {
  try {
    const { citizenId, citizenEmail, citizenName, zone, ward } = req.query;

    const result = verificationEngine.getTwinCityVerifications({
      citizenId,
      citizenEmail,
      citizenName,
      zone,
      ward
    });

    return res.json(result);
  } catch (err) {
    console.error('[TWIN CITY ERROR]', err.message || err);
    return res.status(500).json({ success: false, message: 'Server error fetching verification feed' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// VERIFICATION STATUS — Detailed verification progress for a complaint
// GET /api/complaints/:id/verification-status
// ═════════════════════════════════════════════════════════════════════════════

const getVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = verificationEngine.getVerificationStatus(id);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || 'Server error fetching verification status';
    return res.status(status).json({ success: false, message });
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  ingestComplaintAsync,
  updateStatus,
  completeComplaint,
  verifyComplaint,
  getTwinCityVerifications,
  getVerificationStatus
};
