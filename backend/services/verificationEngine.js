/**
 * Verification Engine — Independent Business Logic Module
 * 
 * Handles the complete citizen verification lifecycle:
 *   Officer Completion → Under Verification → 3-Citizen Vote → Completed / Failed
 * 
 * All verification counts are calculated from real database records.
 * The frontend NEVER decides verification outcomes.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurable verification window (in milliseconds)
const VERIFICATION_WINDOW_MS = parseInt(process.env.VERIFICATION_WINDOW_HOURS || '168', 10) * 60 * 60 * 1000; // default 168h = 7 days
const REQUIRED_VERIFICATIONS = 3;

// Persistent JSON storage paths
const complaintsFilePath = path.join(__dirname, '../../data/sample_complaints.json');
const verificationsFilePath = path.join(__dirname, '../../data/verifications.json');

// ─── JSON File Helpers ───────────────────────────────────────────────────────

const loadComplaints = () => {
  try {
    if (fs.existsSync(complaintsFilePath)) {
      return JSON.parse(fs.readFileSync(complaintsFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('[VerificationEngine] Error reading complaints file:', err.message);
  }
  return [];
};

const saveComplaints = (complaints) => {
  try {
    fs.writeFileSync(complaintsFilePath, JSON.stringify(complaints, null, 2), 'utf8');
  } catch (err) {
    console.error('[VerificationEngine] Error saving complaints file:', err.message);
  }
};

const loadVerifications = () => {
  try {
    if (fs.existsSync(verificationsFilePath)) {
      return JSON.parse(fs.readFileSync(verificationsFilePath, 'utf8'));
    }
  } catch (err) {
    console.error('[VerificationEngine] Error reading verifications file:', err.message);
  }
  return [];
};

const saveVerifications = (verifications) => {
  try {
    fs.writeFileSync(verificationsFilePath, JSON.stringify(verifications, null, 2), 'utf8');
  } catch (err) {
    console.error('[VerificationEngine] Error saving verifications file:', err.message);
  }
};

// ─── SHA-256 Audit Hashing ───────────────────────────────────────────────────

let latestHash = '0'.repeat(64);
const hashAuditEvent = (data) => {
  const prev = latestHash;
  latestHash = crypto.createHash('sha256').update(prev + JSON.stringify(data)).digest('hex');
  return { previousHash: prev, hash: latestHash };
};

// ─── Helper: Generate Verification ID ────────────────────────────────────────

let verificationCounter = 0;
const generateVerificationId = () => {
  verificationCounter++;
  const ts = Date.now().toString(36).toUpperCase();
  return `VER-${ts}-${String(verificationCounter).padStart(4, '0')}`;
};

// ─── Helper: Resolve citizen identity ────────────────────────────────────────

const resolveCitizenId = (citizen) => {
  return citizen.citizenId || citizen.email || citizen.mobile || citizen.name || 'anonymous';
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. SUBMIT COMPLETION — Officer marks work as completed with proof
// ═════════════════════════════════════════════════════════════════════════════

const submitCompletion = ({ complaintId, officer, completionProof, completionNotes }) => {
  if (!complaintId) throw { status: 400, message: 'complaintId is required' };
  if (!completionProof) throw { status: 400, message: 'Completion proof (photo) is required' };
  if (!officer || !officer.name) throw { status: 400, message: 'Officer identity is required' };

  const store = loadComplaints();
  let comp = store.find((c) => c.complaintId === complaintId);

  if (!comp) {
    throw { status: 404, message: `Complaint ${complaintId} not found` };
  }

  const now = new Date();
  const deadline = new Date(now.getTime() + VERIFICATION_WINDOW_MS);

  // Store previous completion attempt in history (if re-completing after failure)
  if (!comp.completion_history) comp.completion_history = [];
  if (comp.completed_by && comp.completion_proof) {
    comp.completion_history.push({
      proof: comp.completion_proof,
      notes: comp.completion_notes,
      officer: comp.completed_by,
      completedAt: comp.completed_at,
      verificationResult: comp.verification_status || 'FAILED'
    });
  }

  // Update complaint fields
  comp.status = 'Under Verification';
  comp.completion_proof = completionProof;
  comp.completion_notes = completionNotes || '';
  comp.resolutionProof = completionProof; // backward compat
  comp.resolutionNotes = completionNotes || ''; // backward compat
  comp.completed_by = {
    id: officer.id || officer.email || officer.name,
    name: officer.name,
    email: officer.email || '',
    role: officer.role || 'officer',
    department: officer.department || ''
  };
  comp.completed_at = now.toISOString();
  comp.verification_status = 'PENDING';
  comp.verification_deadline = deadline.toISOString();
  comp.verification_attempts = (comp.verification_attempts || 0) + 1;
  comp.verified_count = 0;
  comp.rejected_count = 0;
  comp.verificationsCount = 0;
  comp.requiredVerifications = REQUIRED_VERIFICATIONS;
  comp.pendingVerificationStartedAt = now.toISOString();
  comp.verificationWindowDays = Math.ceil(VERIFICATION_WINDOW_MS / (24 * 60 * 60 * 1000));

  // Add audit timeline entry
  if (!comp.auditTimeline) comp.auditTimeline = [];
  const audit = hashAuditEvent({
    event: 'OFFICER_COMPLETED',
    complaintId,
    officer: officer.name,
    proof: completionProof,
    timestamp: now.toISOString()
  });
  comp.auditTimeline.push({
    event: 'Officer Marked Completed & Uploaded Proof',
    actor: officer.name,
    actorRole: 'officer',
    timestamp: now.toISOString(),
    details: { proof: completionProof, notes: completionNotes },
    hash: audit.hash
  });
  comp.blockchainHash = audit.hash;

  // Clear any old verification records for this complaint (fresh round)
  const allVerifications = loadVerifications();
  const filteredVerifications = allVerifications.filter((v) => v.complaintId !== complaintId);
  saveVerifications(filteredVerifications);

  // Clear legacy verifications array
  comp.verifications = [];

  saveComplaints(store);

  console.log(`[VerificationEngine] Complaint ${complaintId} moved to Under Verification by ${officer.name}. Deadline: ${deadline.toISOString()}`);

  return {
    success: true,
    message: `Complaint ${complaintId} is now Under Verification. 3 citizen verifications required within ${comp.verificationWindowDays} days.`,
    data: comp
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// 2. SUBMIT VERIFICATION — Citizen votes on a complaint
// ═════════════════════════════════════════════════════════════════════════════

const submitVerification = ({ complaintId, citizen, vote, feedback, location }) => {
  if (!complaintId) throw { status: 400, message: 'complaintId is required' };
  if (!vote || !['VERIFIED', 'REJECTED'].includes(vote)) {
    throw { status: 400, message: 'vote must be VERIFIED or REJECTED' };
  }
  if (!citizen || (!citizen.name && !citizen.email && !citizen.citizenId)) {
    throw { status: 401, message: 'Authenticated citizen identity is required' };
  }

  const store = loadComplaints();
  const comp = store.find((c) => c.complaintId === complaintId);

  if (!comp) {
    throw { status: 404, message: `Complaint ${complaintId} not found` };
  }

  // Validate complaint is in verification state
  const validStatuses = ['Under Verification', 'Pending Verification'];
  if (!validStatuses.includes(comp.status)) {
    throw { status: 400, message: `Complaint is not Under Verification. Current status: ${comp.status}` };
  }

  // Check verification deadline
  if (comp.verification_deadline) {
    const deadline = new Date(comp.verification_deadline);
    if (new Date() > deadline) {
      // Auto-expire
      handleVerificationExpiry(comp, store);
      throw { status: 410, message: 'Verification window has expired. Complaint returned to assignment queue.' };
    }
  }

  const citizenId = resolveCitizenId(citizen);

  // Anti-abuse: officer cannot verify own work
  if (comp.completed_by) {
    const officerId = comp.completed_by.id || comp.completed_by.email || comp.completed_by.name;
    if (citizenId === officerId || 
        (citizen.email && citizen.email === comp.completed_by.email) ||
        (citizen.name && citizen.name === comp.completed_by.name && comp.completed_by.role === 'officer')) {
      throw { status: 403, message: 'You cannot verify your own completed work.' };
    }
  }

  // Anti-abuse: check duplicate vote — 1 vote per citizen per problem in 7-day window
  const allVerifications = loadVerifications();
  const normalizedCitizenEmail = citizen.email ? citizen.email.trim().toLowerCase() : '';
  const normalizedCitizenName = citizen.name ? citizen.name.trim().toLowerCase() : '';
  const normalizedCitizenId = citizenId ? citizenId.trim().toLowerCase() : '';

  const existingVote = allVerifications.find((v) => {
    if (v.complaintId !== complaintId) return false;
    const vId = (v.citizenId || '').trim().toLowerCase();
    const vEmail = (v.citizenEmail || '').trim().toLowerCase();
    const vName = (v.citizenName || '').trim().toLowerCase();

    const matchId = normalizedCitizenId && vId && (vId === normalizedCitizenId || vId === normalizedCitizenEmail);
    const matchEmail = normalizedCitizenEmail && vEmail && vEmail === normalizedCitizenEmail;
    const matchName = normalizedCitizenName && vName && vName === normalizedCitizenName;

    return matchId || matchEmail || matchName;
  });

  if (existingVote) {
    throw {
      status: 400,
      message: `Duplicate vote blocked: You have already submitted a verification vote (${existingVote.vote}) for this problem. A citizen cannot verify a problem more than once in a 7-day window.`
    };
  }

  // Also check comp.verifications array
  if (Array.isArray(comp.verifications)) {
    const existingInComp = comp.verifications.find((v) => {
      const vId = (v.citizenId || '').trim().toLowerCase();
      const vEmail = (v.citizenEmail || '').trim().toLowerCase();
      const vName = (v.citizenName || '').trim().toLowerCase();

      const matchId = normalizedCitizenId && vId && (vId === normalizedCitizenId || vId === normalizedCitizenEmail);
      const matchEmail = normalizedCitizenEmail && vEmail && vEmail === normalizedCitizenEmail;
      const matchName = normalizedCitizenName && vName && vName === normalizedCitizenName;

      return matchId || matchEmail || matchName;
    });

    if (existingInComp) {
      throw {
        status: 400,
        message: `Duplicate vote blocked: You have already verified this problem. A citizen cannot verify a problem more than once in a 7-day window.`
      };
    }
  }

  // Create verification record
  const now = new Date();
  const verificationRecord = {
    verificationId: generateVerificationId(),
    complaintId,
    citizenId,
    citizenName: citizen.name || 'Verified Citizen',
    citizenEmail: citizen.email || '',
    vote,
    feedback: feedback || '',
    location: location || {},
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  allVerifications.push(verificationRecord);
  saveVerifications(allVerifications);

  // Recalculate counts from database records (NEVER trust frontend)
  const complaintVotes = allVerifications.filter((v) => v.complaintId === complaintId);
  const verifiedCount = complaintVotes.filter((v) => v.vote === 'VERIFIED').length;
  const rejectedCount = complaintVotes.filter((v) => v.vote === 'REJECTED').length;

  comp.verified_count = verifiedCount;
  comp.rejected_count = rejectedCount;
  comp.verificationsCount = verifiedCount; // backward compat

  // Update legacy verifications array for backward compat with full identity
  if (!comp.verifications) comp.verifications = [];
  comp.verifications.push({
    citizenId,
    citizenEmail: citizen.email || '',
    citizenName: verificationRecord.citizenName,
    comment: feedback || (vote === 'VERIFIED' ? 'Verified work completion at site.' : 'Work not completed — rejected.'),
    verifiedAt: now.toISOString(),
    vote
  });

  // Add audit timeline entry
  if (!comp.auditTimeline) comp.auditTimeline = [];
  const audit = hashAuditEvent({
    event: vote === 'VERIFIED' ? 'CITIZEN_VERIFIED' : 'CITIZEN_REJECTED',
    complaintId,
    citizenId,
    citizenName: citizen.name,
    vote,
    verifiedCount,
    rejectedCount,
    timestamp: now.toISOString()
  });
  comp.auditTimeline.push({
    event: vote === 'VERIFIED'
      ? `Citizen Verified (${verifiedCount}/${REQUIRED_VERIFICATIONS})`
      : `Citizen Rejected Work`,
    actor: citizen.name || citizenId,
    actorRole: 'citizen',
    timestamp: now.toISOString(),
    details: { vote, feedback, verifiedCount, rejectedCount },
    hash: audit.hash
  });
  comp.blockchainHash = audit.hash;

  // ─── Evaluate Transition Rules ───
  let transitionMessage = '';

  if (vote === 'REJECTED') {
    // Rejection: increase priority, mark failed, return to assignment queue
    comp.priority_weight = (comp.priority_weight || 1) + 1;
    comp.verification_failures = (comp.verification_failures || 0) + 1;
    comp.verification_status = 'FAILED';
    comp.status = 'Not Assigned';

    const failAudit = hashAuditEvent({
      event: 'VERIFICATION_FAILED',
      complaintId,
      priority_weight: comp.priority_weight,
      verification_failures: comp.verification_failures,
      timestamp: now.toISOString()
    });
    comp.auditTimeline.push({
      event: `Verification Failed — Priority Increased to ${comp.priority_weight}`,
      actor: 'System',
      actorRole: 'system',
      timestamp: now.toISOString(),
      details: {
        priority_weight: comp.priority_weight,
        verification_failures: comp.verification_failures,
        reason: 'Citizen rejected officer work completion'
      },
      hash: failAudit.hash
    });
    comp.blockchainHash = failAudit.hash;

    transitionMessage = `Verification failed. Complaint returned to assignment queue with priority weight ${comp.priority_weight}.`;
    console.log(`[VerificationEngine] Complaint ${complaintId} REJECTED by ${citizen.name}. Priority weight: ${comp.priority_weight}, Failures: ${comp.verification_failures}`);

  } else if (verifiedCount >= REQUIRED_VERIFICATIONS) {
    // 3 verified — mark completed
    comp.status = 'Completed';
    comp.verification_status = 'VERIFIED';

    const completeAudit = hashAuditEvent({
      event: 'VERIFICATION_COMPLETE',
      complaintId,
      verifiedCount,
      timestamp: now.toISOString()
    });
    comp.auditTimeline.push({
      event: `Community Verification Complete (${verifiedCount}/${REQUIRED_VERIFICATIONS}) — Complaint Completed`,
      actor: 'System',
      actorRole: 'system',
      timestamp: now.toISOString(),
      details: { verifiedCount, rejectedCount },
      hash: completeAudit.hash
    });
    comp.blockchainHash = completeAudit.hash;

    transitionMessage = `All ${REQUIRED_VERIFICATIONS} citizen verifications received. Complaint marked as COMPLETED.`;
    console.log(`[VerificationEngine] Complaint ${complaintId} VERIFIED by ${verifiedCount} citizens. Status: COMPLETED.`);

  } else {
    transitionMessage = `Verification recorded (${verifiedCount}/${REQUIRED_VERIFICATIONS}). Awaiting more citizen verifications.`;
  }

  saveComplaints(store);

  return {
    success: true,
    message: transitionMessage,
    verification: verificationRecord,
    data: comp,
    counts: { verified: verifiedCount, rejected: rejectedCount, required: REQUIRED_VERIFICATIONS }
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. GET TWIN CITY VERIFICATIONS — Complaints needing citizen verification
// ═════════════════════════════════════════════════════════════════════════════

const getTwinCityVerifications = ({ citizenId, citizenEmail, citizenName, zone, ward } = {}) => {
  const store = loadComplaints();
  const allVerifications = loadVerifications();
  const now = new Date();

  // Check for expired verifications and transition them
  let needsSave = false;
  store.forEach((comp) => {
    if ((comp.status === 'Under Verification' || comp.status === 'Pending Verification') && comp.verification_deadline) {
      const deadline = new Date(comp.verification_deadline);
      if (now > deadline && comp.verification_status === 'PENDING') {
        handleVerificationExpiry(comp, store);
        needsSave = true;
      }
    }
  });
  if (needsSave) saveComplaints(store);

  // Filter complaints in verification states
  const verificationStatuses = ['Under Verification', 'Pending Verification'];
  let pendingList = store.filter((c) => verificationStatuses.includes(c.status));

  // Optionally filter by locality/zone/ward
  if (zone) {
    pendingList = pendingList.filter((c) => {
      const compZone = c.jurisdiction?.zoneName || c.jurisdiction?.zone || '';
      return compZone.toLowerCase().includes(zone.toLowerCase());
    });
  }
  if (ward) {
    pendingList = pendingList.filter((c) => {
      const compWard = c.jurisdiction?.ward || '';
      return compWard === ward;
    });
  }

  // Sort by priority_weight (higher priority first), then by deadline (closest first)
  pendingList.sort((a, b) => {
    const wA = a.priority_weight || 1;
    const wB = b.priority_weight || 1;
    if (wB !== wA) return wB - wA;
    const dA = a.verification_deadline ? new Date(a.verification_deadline).getTime() : Infinity;
    const dB = b.verification_deadline ? new Date(b.verification_deadline).getTime() : Infinity;
    return dA - dB;
  });

  // Annotate each with citizen-specific voting info (enforce 1 vote per citizen in 7-day window)
  const normalizedCitizenId = (citizenId || '').trim().toLowerCase();
  const normalizedCitizenEmail = (citizenEmail || '').trim().toLowerCase();
  const normalizedCitizenName = (citizenName || '').trim().toLowerCase();
  const hasCitizenContext = normalizedCitizenId || normalizedCitizenEmail || normalizedCitizenName;

  const annotated = pendingList.map((comp) => {
    const votes = allVerifications.filter((v) => v.complaintId === comp.complaintId);
    const verifiedCount = votes.filter((v) => v.vote === 'VERIFIED').length;
    const rejectedCount = votes.filter((v) => v.vote === 'REJECTED').length;

    let hasVoted = false;
    let userVote = null;
    let canVote = true;

    if (hasCitizenContext) {
      const myVote = votes.find((v) => {
        const vId = (v.citizenId || '').trim().toLowerCase();
        const vEmail = (v.citizenEmail || '').trim().toLowerCase();
        const vName = (v.citizenName || '').trim().toLowerCase();

        const matchId = normalizedCitizenId && vId && (vId === normalizedCitizenId || vId === normalizedCitizenEmail);
        const matchEmail = normalizedCitizenEmail && vEmail && vEmail === normalizedCitizenEmail;
        const matchName = normalizedCitizenName && vName && vName === normalizedCitizenName;

        return matchId || matchEmail || matchName;
      });

      if (myVote) {
        hasVoted = true;
        userVote = myVote.vote;
        canVote = false;
      }

      // Also check comp.verifications array
      if (!hasVoted && Array.isArray(comp.verifications)) {
        const legacyVote = comp.verifications.find((v) => {
          const vId = (v.citizenId || '').trim().toLowerCase();
          const vEmail = (v.citizenEmail || '').trim().toLowerCase();
          const vName = (v.citizenName || '').trim().toLowerCase();

          const matchId = normalizedCitizenId && vId && (vId === normalizedCitizenId || vId === normalizedCitizenEmail);
          const matchEmail = normalizedCitizenEmail && vEmail && vEmail === normalizedCitizenEmail;
          const matchName = normalizedCitizenName && vName && vName === normalizedCitizenName;

          return matchId || matchEmail || matchName;
        });

        if (legacyVote) {
          hasVoted = true;
          userVote = legacyVote.vote || 'VERIFIED';
          canVote = false;
        }
      }

      // Check if citizen is the completing officer
      if (comp.completed_by) {
        const officerId = (comp.completed_by.id || comp.completed_by.email || comp.completed_by.name || '').trim().toLowerCase();
        if (normalizedCitizenId === officerId || normalizedCitizenEmail === officerId || normalizedCitizenName === officerId) {
          canVote = false;
        }
      }
    }

    // Calculate time remaining
    let timeRemainingMs = null;
    let timeRemainingHuman = '';
    if (comp.verification_deadline) {
      timeRemainingMs = new Date(comp.verification_deadline).getTime() - now.getTime();
      if (timeRemainingMs > 0) {
        const hours = Math.floor(timeRemainingMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        timeRemainingHuman = days > 0 ? `${days}d ${remainingHours}h` : `${hours}h`;
      } else {
        timeRemainingHuman = 'Expired';
      }
    }

    return {
      ...comp,
      verified_count: verifiedCount,
      rejected_count: rejectedCount,
      verificationsCount: verifiedCount, // backward compat
      requiredVerifications: REQUIRED_VERIFICATIONS,
      hasVoted,
      userVote,
      canVote,
      timeRemainingMs,
      timeRemainingHuman,
      voters: votes.map((v) => ({
        citizenId: v.citizenId,
        citizenEmail: v.citizenEmail,
        citizenName: v.citizenName,
        vote: v.vote,
        feedback: v.feedback,
        createdAt: v.createdAt
      }))
    };
  });

  return {
    success: true,
    count: annotated.length,
    data: annotated
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. GET VERIFICATION STATUS — Detailed status for a single complaint
// ═════════════════════════════════════════════════════════════════════════════

const getVerificationStatus = (complaintId) => {
  const store = loadComplaints();
  const comp = store.find((c) => c.complaintId === complaintId);

  if (!comp) {
    throw { status: 404, message: `Complaint ${complaintId} not found` };
  }

  const allVerifications = loadVerifications();
  const votes = allVerifications.filter((v) => v.complaintId === complaintId);
  const verifiedCount = votes.filter((v) => v.vote === 'VERIFIED').length;
  const rejectedCount = votes.filter((v) => v.vote === 'REJECTED').length;

  let timeRemainingMs = null;
  if (comp.verification_deadline) {
    timeRemainingMs = new Date(comp.verification_deadline).getTime() - Date.now();
  }

  return {
    success: true,
    data: {
      complaintId,
      status: comp.status,
      verification_status: comp.verification_status || 'NONE',
      priority_weight: comp.priority_weight || 1,
      verification_attempts: comp.verification_attempts || 0,
      verification_failures: comp.verification_failures || 0,
      verified_count: verifiedCount,
      rejected_count: rejectedCount,
      required: REQUIRED_VERIFICATIONS,
      verification_deadline: comp.verification_deadline,
      timeRemainingMs,
      completed_by: comp.completed_by,
      completed_at: comp.completed_at,
      completion_proof: comp.completion_proof || comp.resolutionProof,
      completion_notes: comp.completion_notes || comp.resolutionNotes,
      completion_history: comp.completion_history || [],
      voters: votes.map((v) => ({
        verificationId: v.verificationId,
        citizenName: v.citizenName,
        vote: v.vote,
        feedback: v.feedback,
        createdAt: v.createdAt
      })),
      auditTimeline: comp.auditTimeline || []
    }
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// INTERNAL: Handle Verification Expiry
// ═════════════════════════════════════════════════════════════════════════════

const handleVerificationExpiry = (comp, store) => {
  const now = new Date();
  comp.priority_weight = (comp.priority_weight || 1) + 1;
  comp.verification_failures = (comp.verification_failures || 0) + 1;
  comp.verification_status = 'EXPIRED';
  comp.status = 'Not Assigned';

  if (!comp.auditTimeline) comp.auditTimeline = [];
  const audit = hashAuditEvent({
    event: 'VERIFICATION_EXPIRED',
    complaintId: comp.complaintId,
    priority_weight: comp.priority_weight,
    timestamp: now.toISOString()
  });
  comp.auditTimeline.push({
    event: `Verification Expired — Priority Increased to ${comp.priority_weight}`,
    actor: 'System',
    actorRole: 'system',
    timestamp: now.toISOString(),
    details: {
      priority_weight: comp.priority_weight,
      verification_failures: comp.verification_failures,
      reason: 'Verification window expired without required citizen verifications'
    },
    hash: audit.hash
  });
  comp.blockchainHash = audit.hash;

  console.log(`[VerificationEngine] Complaint ${comp.complaintId} EXPIRED. Priority weight: ${comp.priority_weight}, Failures: ${comp.verification_failures}`);
};

module.exports = {
  submitCompletion,
  submitVerification,
  getTwinCityVerifications,
  getVerificationStatus,
  REQUIRED_VERIFICATIONS,
  VERIFICATION_WINDOW_MS
};
