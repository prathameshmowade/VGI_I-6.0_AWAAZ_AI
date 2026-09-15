/**
 * High-Throughput Circuit Breaker for AI & External Services
 * Prevents cascading failures and protects event loop under high load
 */

const logger = require('../observability/logger');

const STATE = {
  CLOSED: 'CLOSED',       // Normal operation, calls go through
  OPEN: 'OPEN',           // Degradation detected, fail fast to fallback
  HALF_OPEN: 'HALF_OPEN'  // Testing if dependent service has recovered
};

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;       // 5 consecutive failures trips circuit
    this.recoveryTimeMs = options.recoveryTimeMs || 10000;       // Wait 10s before testing HALF-OPEN
    this.timeoutMs = options.timeoutMs || 3000;                  // Max latency per call (3s)
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.fallbackFn = options.fallbackFn || null;
    this.stats = {
      totalCalls: 0,
      totalFailures: 0,
      totalFallbacks: 0,
      totalTimeouts: 0
    };
  }

  async execute(asyncFn, fallbackArgs = [], contextMeta = {}) {
    this.stats.totalCalls++;

    // Check if OPEN circuit should transition to HALF-OPEN
    if (this.state === STATE.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeMs) {
        this.state = STATE.HALF_OPEN;
        logger.info(`[CircuitBreaker:${this.name}] Transitioned to HALF_OPEN (probing health)`, contextMeta);
      } else {
        // Fast-fail to fallback
        this.stats.totalFallbacks++;
        logger.warn(`[CircuitBreaker:${this.name}] Fast-failing to fallback (State: OPEN)`, contextMeta);
        return this.triggerFallback(fallbackArgs, new Error('CircuitBreaker is OPEN'));
      }
    }

    try {
      // Wrap call in timeout promise
      const result = await Promise.race([
        asyncFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout of ${this.timeoutMs}ms exceeded`)), this.timeoutMs)
        )
      ]);

      this.onSuccess(contextMeta);
      return result;
    } catch (err) {
      return this.onFailure(err, fallbackArgs, contextMeta);
    }
  }

  onSuccess(contextMeta) {
    if (this.state === STATE.HALF_OPEN) {
      this.state = STATE.CLOSED;
      this.failureCount = 0;
      logger.info(`[CircuitBreaker:${this.name}] Service recovered. Transitioned to CLOSED`, contextMeta);
    }
    this.failureCount = 0;
    this.successCount++;
  }

  onFailure(err, fallbackArgs, contextMeta) {
    this.failureCount++;
    this.stats.totalFailures++;
    this.lastFailureTime = Date.now();

    if (err.message && err.message.includes('Timeout')) {
      this.stats.totalTimeouts++;
    }

    logger.error(`[CircuitBreaker:${this.name}] Failure ${this.failureCount}/${this.failureThreshold}: ${err.message}`, {
      ...contextMeta,
      error: err.message,
      stack: err.stack
    });

    if (this.failureCount >= this.failureThreshold || this.state === STATE.HALF_OPEN) {
      this.state = STATE.OPEN;
      logger.error(`[CircuitBreaker:${this.name}] Failure threshold breached! Circuit tripped to OPEN`, contextMeta);
    }

    this.stats.totalFallbacks++;
    return this.triggerFallback(fallbackArgs, err);
  }

  triggerFallback(fallbackArgs, originalError) {
    if (typeof this.fallbackFn === 'function') {
      return this.fallbackFn(...fallbackArgs, originalError);
    }
    throw originalError;
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      ...this.stats
    };
  }
}

// Registry for all system circuit breakers
const breakers = new Map();

function getBreaker(name, options) {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker(name, options));
  }
  return breakers.get(name);
}

module.exports = {
  CircuitBreaker,
  getBreaker,
  STATE
};
