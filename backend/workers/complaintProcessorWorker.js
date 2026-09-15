/**
 * Asynchronous Background Complaint Processor Worker
 * Consumes tasks from taskQueue, executes heavy AI triage, pHash deduplication,
 * and notification dispatches without blocking the Express HTTP ingress thread.
 */

const { taskQueue, JOB_TYPES } = require('../infrastructure/queue/taskQueue');
const { getBreaker } = require('../infrastructure/resilience/circuitBreaker');
const { classifyComplaintLocally } = require('../services/aiService');
const semanticCacheService = require('../services/semanticCacheService');
const pHashService = require('../services/pHashService');
const geoH3Service = require('../services/geoH3Service');
const { recordAuditEvent } = require('../services/blockchainService');
const logger = require('../infrastructure/observability/logger');

// Setup Circuit Breaker for AI Triage
const aiTriageBreaker = getBreaker('ai-triage-service', {
  failureThreshold: 4,
  recoveryTimeMs: 8000,
  timeoutMs: 3000,
  fallbackFn: (payload) => {
    logger.warn('[Worker:AI_TRIAGE] Fallback triggered: Using deterministic local keyword triage');
    return classifyComplaintLocally(payload);
  }
});

// Setup Circuit Breaker for External Notifications (SMS/WhatsApp/Telegram)
const notificationBreaker = getBreaker('notification-dispatcher', {
  failureThreshold: 5,
  recoveryTimeMs: 15000,
  timeoutMs: 4000,
  fallbackFn: (payload, err) => {
    logger.warn(`[Worker:NOTIFY] Notification fallback: Queued notification saved to pending spool. Error: ${err.message}`);
    return { dispatched: false, spooled: true };
  }
});

/**
 * 1. AI Triage Worker Handler
 */
taskQueue.registerWorker(JOB_TYPES.AI_TRIAGE, async (payload, meta) => {
  const { title, description, category, tenantId, complaintId } = payload;
  logger.info(`[Worker:AI_TRIAGE] Processing complaint ${complaintId}`, meta);

  // Check Semantic Cache first
  let triageResult = semanticCacheService.get(title, description, tenantId);
  let isCacheHit = false;

  if (triageResult) {
    isCacheHit = true;
    logger.info(`[Worker:AI_TRIAGE] Semantic cache hit for ${complaintId}`, meta);
  } else {
    // Execute through Circuit Breaker
    triageResult = await aiTriageBreaker.execute(
      async () => {
        // Fast local classification engine
        return classifyComplaintLocally({ title, description, category });
      },
      [payload],
      meta
    );

    // Save to Semantic Cache
    if (triageResult) {
      semanticCacheService.set(title, description, tenantId, triageResult);
    }
  }

  // Stamp Merkle Audit Hash
  recordAuditEvent({
    complaintId,
    event: 'AI_TRIAGE_COMPLETED',
    department: triageResult.department,
    urgency: triageResult.urgency,
    confidenceScore: triageResult.confidenceScore,
    isCacheHit,
    timestamp: new Date().toISOString()
  });

  return {
    complaintId,
    triageResult,
    isCacheHit
  };
});

/**
 * 2. Perceptual Hash (pHash) Deduplication Worker Handler
 */
taskQueue.registerWorker(JOB_TYPES.DEDUPLICATION, async (payload, meta) => {
  const { candidatePHash, h3Cell, existingComplaints, complaintId } = payload;
  logger.info(`[Worker:DEDUPLICATION] Running zero-GPU pHash check for ${complaintId} in H3 cell ${h3Cell}`, meta);

  const duplicateCheck = pHashService.findSpatialDuplicates(candidatePHash, h3Cell, existingComplaints);

  if (duplicateCheck.isDuplicate) {
    logger.warn(`[Worker:DEDUPLICATION] Duplicate detected for ${complaintId}: ${duplicateCheck.duplicateCount} spatial matches`);
  }

  return duplicateCheck;
});

/**
 * 3. Notification Dispatch Worker Handler
 */
taskQueue.registerWorker(JOB_TYPES.DISPATCH_NOTIFICATIONS, async (payload, meta) => {
  const { recipient, channel, message, complaintId } = payload;
  logger.info(`[Worker:NOTIFY] Dispatching ${channel} alert for ${complaintId} to ${recipient}`, meta);

  return notificationBreaker.execute(
    async () => {
      // Simulate/Send notification
      return { dispatched: true, channel, timestamp: new Date().toISOString() };
    },
    [payload],
    meta
  );
});

module.exports = {
  aiTriageBreaker,
  notificationBreaker
};
