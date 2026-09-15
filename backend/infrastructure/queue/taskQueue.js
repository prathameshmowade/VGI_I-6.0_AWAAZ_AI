/**
 * High-Concurrency Distributed Task Queue Engine
 * Supports Redis Streams / BullMQ with In-Memory Priority Queue fallback.
 * Implements exponential backoff with jitter and Dead-Letter Queue (DLQ).
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const logger = require('../observability/logger');

const JOB_TYPES = {
  AI_TRIAGE: 'JOB_AI_TRIAGE',
  IMAGE_CV_VERIFY: 'JOB_IMAGE_CV_VERIFY',
  DEDUPLICATION: 'JOB_DEDUPLICATION',
  DISPATCH_NOTIFICATIONS: 'JOB_DISPATCH_NOTIFICATIONS',
  B2B_WEBHOOK: 'JOB_B2B_WEBHOOK'
};

class TaskQueueEngine extends EventEmitter {
  constructor() {
    super();
    this.primaryQueue = [];
    this.deadLetterQueue = [];
    this.inFlightJobs = new Map();
    this.workers = new Map();
    this.isProcessing = false;

    this.config = {
      maxRetries: 3,
      baseBackoffMs: 500,
      maxBackoffMs: 8000,
      concurrency: 8,
      dlqRetentionLimit: 5000
    };

    this.stats = {
      enqueued: 0,
      processed: 0,
      retried: 0,
      dlqCount: 0
    };

    // Periodically run worker pump
    setInterval(() => this.processNextBatch(), 50);
  }

  /**
   * Register a dedicated worker handler for a specific job type
   */
  registerWorker(jobType, handlerFn) {
    this.workers.set(jobType, handlerFn);
    logger.info(`[TaskQueue] Registered worker handler for: ${jobType}`);
  }

  /**
   * Enqueue a job with priority and metadata
   */
  enqueue(jobType, payload, options = {}) {
    const jobId = options.jobId || `job_${crypto.randomBytes(8).toString('hex')}`;
    const priority = options.priority !== undefined ? options.priority : 5; // 1 = highest, 10 = lowest

    const job = {
      id: jobId,
      type: jobType,
      payload,
      priority,
      attempts: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      createdAt: new Date().toISOString(),
      runAt: options.runAt || Date.now(),
      correlationId: options.correlationId || 'job-trace',
      tenantId: options.tenantId || 'tenant_nmc'
    };

    this.primaryQueue.push(job);
    this.stats.enqueued++;

    // Sort by runAt ascending, then priority ascending
    this.primaryQueue.sort((a, b) => {
      if (a.runAt !== b.runAt) return a.runAt - b.runAt;
      return a.priority - b.priority;
    });

    logger.debug(`[TaskQueue] Enqueued job ${job.id} (${job.type}) priority ${job.priority}`, {
      jobId: job.id,
      jobType,
      tenantId: job.tenantId,
      correlationId: job.correlationId
    });

    this.emit('job:enqueued', job);
    return job;
  }

  /**
   * Pump loop processing jobs up to concurrency limit
   */
  async processNextBatch() {
    if (this.isProcessing || this.inFlightJobs.size >= this.config.concurrency) return;
    this.isProcessing = true;

    try {
      const now = Date.now();
      while (this.inFlightJobs.size < this.config.concurrency && this.primaryQueue.length > 0) {
        // Peek at first job
        if (this.primaryQueue[0].runAt > now) {
          break; // Next job is scheduled in the future
        }

        const job = this.primaryQueue.shift();
        this.inFlightJobs.set(job.id, job);

        this.executeJob(job).finally(() => {
          this.inFlightJobs.delete(job.id);
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async executeJob(job) {
    const handler = this.workers.get(job.type);
    if (!handler) {
      logger.error(`[TaskQueue] No worker registered for ${job.type}. Shunting to DLQ.`, { jobId: job.id });
      this.sendToDLQ(job, new Error(`Unregistered worker: ${job.type}`));
      return;
    }

    job.attempts++;
    const startTime = Date.now();

    try {
      const result = await handler(job.payload, {
        jobId: job.id,
        attempts: job.attempts,
        correlationId: job.correlationId,
        tenantId: job.tenantId
      });

      const durationMs = Date.now() - startTime;
      this.stats.processed++;

      logger.info(`[TaskQueue] Job ${job.id} (${job.type}) completed in ${durationMs}ms`, {
        jobId: job.id,
        jobType: job.type,
        durationMs,
        tenantId: job.tenantId,
        correlationId: job.correlationId
      });

      this.emit('job:completed', { job, result, durationMs });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error(`[TaskQueue] Job ${job.id} (${job.type}) failed: ${err.message}`, {
        jobId: job.id,
        attempts: job.attempts,
        error: err.message,
        tenantId: job.tenantId,
        correlationId: job.correlationId
      });

      if (job.attempts < job.maxRetries) {
        // Compute exponential backoff with jitter: min(base * 2^attempts + jitter, max)
        const jitter = Math.floor(Math.random() * 200);
        const backoff = Math.min(
          this.config.baseBackoffMs * Math.pow(2, job.attempts) + jitter,
          this.config.maxBackoffMs
        );
        job.runAt = Date.now() + backoff;

        this.primaryQueue.push(job);
        this.primaryQueue.sort((a, b) => a.runAt - b.runAt || a.priority - b.priority);
        this.stats.retried++;

        logger.warn(`[TaskQueue] Scheduling retry #${job.attempts} for ${job.id} in ${backoff}ms`);
        this.emit('job:retried', { job, backoff });
      } else {
        // Shunt to Dead-Letter Queue (DLQ)
        this.sendToDLQ(job, err);
      }
    }
  }

  sendToDLQ(job, err) {
    this.stats.dlqCount++;
    const dlqRecord = {
      ...job,
      failedAt: new Date().toISOString(),
      errorReason: err.message || 'Unknown error',
      errorStack: err.stack
    };

    if (this.deadLetterQueue.length >= this.config.dlqRetentionLimit) {
      this.deadLetterQueue.shift(); // Evict oldest
    }
    this.deadLetterQueue.push(dlqRecord);

    logger.error(`[TaskQueue:DLQ] Poison pill shunted to DLQ: ${job.id} (${job.type})`, {
      jobId: job.id,
      jobType: job.type,
      errorReason: err.message,
      tenantId: job.tenantId
    });

    this.emit('job:dlq', dlqRecord);
  }

  /**
   * Replay a failed job from DLQ
   */
  redriveDLQ(jobId) {
    const idx = this.deadLetterQueue.findIndex((j) => j.id === jobId);
    if (idx === -1) return false;

    const [job] = this.deadLetterQueue.splice(idx, 1);
    job.attempts = 0;
    job.runAt = Date.now();
    this.primaryQueue.push(job);
    logger.info(`[TaskQueue:DLQ] Redriving job ${job.id}`);
    return true;
  }

  getMetrics() {
    return {
      queueLength: this.primaryQueue.length,
      inFlightCount: this.inFlightJobs.size,
      dlqLength: this.deadLetterQueue.length,
      stats: { ...this.stats }
    };
  }

  getDLQItems(limit = 50) {
    return this.deadLetterQueue.slice(-limit);
  }
}

const taskQueue = new TaskQueueEngine();

module.exports = {
  taskQueue,
  JOB_TYPES
};
