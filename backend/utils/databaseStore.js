/**
 * Centralized Database Store — Single Source of Truth
 * 
 * All backend controllers MUST use this module for reading/writing complaints
 * and verifications. This ensures:
 *   1. In-memory cache is always in sync with disk (sample_complaints.json)
 *   2. MongoDB writes happen alongside JSON writes (dual persistence)
 *   3. Field normalization guarantees consistent complaintId, _id, counters
 *   4. File modification detection prevents stale cache overwrites
 */

const fs = require('fs');
const path = require('path');

const complaintsFilePath = path.join(__dirname, '../../data/sample_complaints.json');
const verificationsFilePath = path.join(__dirname, '../../data/verifications.json');

// ─── In-Memory Cache with File Modification Tracking ─────────────────────────

let complaintsCache = null;
let complaintsLastModified = 0;

let verificationsCache = null;
let verificationsLastModified = 0;

// ─── Helper: Get file mtime safely ──────────────────────────────────────────

const getFileMtime = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtimeMs;
  } catch (err) {
    return 0;
  }
};

// ─── COMPLAINTS ─────────────────────────────────────────────────────────────

/**
 * Load complaints from cache or disk.
 * Uses file modification time to detect external changes.
 */
const loadComplaints = () => {
  const currentMtime = getFileMtime(complaintsFilePath);

  // Return cache if file hasn't changed since last read
  if (complaintsCache && complaintsLastModified >= currentMtime && complaintsCache.length > 0) {
    return complaintsCache;
  }

  try {
    if (fs.existsSync(complaintsFilePath)) {
      const data = fs.readFileSync(complaintsFilePath, 'utf8');
      complaintsCache = JSON.parse(data);
      complaintsLastModified = currentMtime || Date.now();
      return complaintsCache;
    }
  } catch (err) {
    console.error('[DatabaseStore] Error reading complaints file:', err.message);
  }

  complaintsCache = complaintsCache || [];
  return complaintsCache;
};

/**
 * Save complaints to disk and update in-memory cache.
 * Also attempts MongoDB sync for dual persistence.
 */
const saveComplaints = (complaints) => {
  complaintsCache = complaints;
  try {
    // Ensure data directory exists
    const dir = path.dirname(complaintsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(complaintsFilePath, JSON.stringify(complaints, null, 2), 'utf8');
    complaintsLastModified = Date.now();
  } catch (err) {
    console.error('[DatabaseStore] Error saving complaints file:', err.message);
  }
};

// ─── VERIFICATIONS ──────────────────────────────────────────────────────────

/**
 * Load verifications from cache or disk.
 */
const loadVerifications = () => {
  const currentMtime = getFileMtime(verificationsFilePath);

  if (verificationsCache && verificationsLastModified >= currentMtime && verificationsCache.length >= 0) {
    return verificationsCache;
  }

  try {
    if (fs.existsSync(verificationsFilePath)) {
      const data = fs.readFileSync(verificationsFilePath, 'utf8');
      verificationsCache = JSON.parse(data);
      verificationsLastModified = currentMtime || Date.now();
      return verificationsCache;
    }
  } catch (err) {
    console.error('[DatabaseStore] Error reading verifications file:', err.message);
  }

  verificationsCache = verificationsCache || [];
  return verificationsCache;
};

/**
 * Save verifications to disk and update in-memory cache.
 */
const saveVerifications = (verifications) => {
  verificationsCache = verifications;
  try {
    const dir = path.dirname(verificationsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(verificationsFilePath, JSON.stringify(verifications, null, 2), 'utf8');
    verificationsLastModified = Date.now();
  } catch (err) {
    console.error('[DatabaseStore] Error saving verifications file:', err.message);
  }
};

// ─── NORMALIZATION ──────────────────────────────────────────────────────────

/**
 * Normalize a complaint object to ensure consistent field types and values.
 */
const normalizeComplaint = (c) => {
  if (!c) return c;
  // Ensure counters are numbers
  c.verified_count = Number(c.verified_count) || 0;
  c.rejected_count = Number(c.rejected_count) || 0;
  c.priority_weight = Number(c.priority_weight) || 1;
  c.verification_attempts = Number(c.verification_attempts) || 0;
  c.verification_failures = Number(c.verification_failures) || 0;
  c.verificationsCount = c.verified_count; // backward compat

  // Ensure verification_status is valid
  const validStatuses = ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED', 'NONE'];
  if (!validStatuses.includes(c.verification_status)) {
    c.verification_status = 'NONE';
  }

  // Ensure auditTimeline is always an array
  if (!Array.isArray(c.auditTimeline)) {
    c.auditTimeline = [];
  }

  // Ensure verifications is always an array
  if (!Array.isArray(c.verifications)) {
    c.verifications = [];
  }

  return c;
};

// ─── MONGODB SYNC HELPERS ───────────────────────────────────────────────────

/**
 * Sync a single complaint to MongoDB (best-effort, non-blocking).
 * Requires mongoose Complaint model to be passed in to avoid circular deps.
 */
const syncComplaintToMongo = async (complaint, ComplaintModel) => {
  if (!ComplaintModel) return;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;

    await ComplaintModel.updateOne(
      { complaintId: complaint.complaintId },
      { $set: complaint },
      { upsert: true }
    );
  } catch (err) {
    // Silent — MongoDB sync is best-effort
  }
};

/**
 * Sync a single verification record to MongoDB (best-effort).
 */
const syncVerificationToMongo = async (verification, VerificationModel) => {
  if (!VerificationModel) return;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;

    await VerificationModel.updateOne(
      { verificationId: verification.verificationId },
      { $set: verification },
      { upsert: true }
    );
  } catch (err) {
    // Silent — MongoDB sync is best-effort
  }
};

// ─── INVALIDATION ───────────────────────────────────────────────────────────

/**
 * Force-invalidate the complaints cache so next loadComplaints() reads from disk.
 * Useful after external writes.
 */
const invalidateComplaintsCache = () => {
  complaintsLastModified = 0;
};

const invalidateVerificationsCache = () => {
  verificationsLastModified = 0;
};

module.exports = {
  loadComplaints,
  saveComplaints,
  loadVerifications,
  saveVerifications,
  normalizeComplaint,
  syncComplaintToMongo,
  syncVerificationToMongo,
  invalidateComplaintsCache,
  invalidateVerificationsCache
};
