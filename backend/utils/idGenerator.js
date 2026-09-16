/**
 * Collision-Proof Monotonic Unique ID Generator for Awaaz AI Grievance Intake
 */

function generateUniqueComplaintId(store = [], requestedId = null) {
  const existingIds = new Set(
    (store || [])
      .map((c) => (c?.complaintId || c?._id || '').trim().toUpperCase())
      .filter(Boolean)
  );

  // If a valid custom requestedId was provided that is not already taken, use it
  if (requestedId && typeof requestedId === 'string') {
    const cleanReq = requestedId.trim().toUpperCase();
    if (cleanReq.startsWith('CMP-2026-') && !existingIds.has(cleanReq)) {
      return cleanReq;
    }
  }

  // Scan existing sequential IDs to find the current highest sequential counter
  let maxSeq = 18;
  for (const item of store || []) {
    const id = item?.complaintId || item?._id || '';
    const match = id.match(/CMP-2026-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      // Track valid sequential IDs (ignore high random seeds > 300 to keep clean 019, 020...)
      if (!isNaN(num) && num < 300 && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `CMP-2026-${String(nextSeq).padStart(3, '0')}`;

  // Ensure absolute uniqueness against any existing ticket in the database
  while (existingIds.has(candidate.toUpperCase())) {
    nextSeq++;
    candidate = `CMP-2026-${String(nextSeq).padStart(3, '0')}`;
  }

  return candidate;
}

function generateUniqueIntakeId(store = [], requestedId = null) {
  const existingIds = new Set(
    (store || [])
      .map((c) => (c?.intakeReference || c?.intakeId || '').trim().toUpperCase())
      .filter(Boolean)
  );

  let maxSeq = 18;
  for (const item of store || []) {
    const id = item?.intakeReference || item?.intakeId || '';
    const match = id.match(/ING-2026-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `ING-2026-${String(nextSeq).padStart(4, '0')}`;

  while (existingIds.has(candidate.toUpperCase())) {
    nextSeq++;
    candidate = `ING-2026-${String(nextSeq).padStart(4, '0')}`;
  }

  return candidate;
}

module.exports = {
  generateUniqueComplaintId,
  generateUniqueIntakeId
};
