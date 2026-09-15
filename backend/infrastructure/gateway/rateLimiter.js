/**
 * High-Performance Sliding Window Token Bucket Rate Limiter
 * Enforces per-API-Key and per-IP quotas for high-concurrency B2B telemetry feeds.
 */

const logger = require('../observability/logger');

const TIERS = {
  PUBLIC: { name: 'Public', capacity: 100, windowMs: 60 * 1000 },
  DEVELOPER: { name: 'Developer', capacity: 1000, windowMs: 60 * 1000 },
  ENTERPRISE: { name: 'Enterprise', capacity: 50000, windowMs: 60 * 1000 }
};

// Known partner API keys mapped to tiers
const PARTNER_KEYS = {
  'key_zomato_prod_7781a': { partner: 'Zomato', tier: 'ENTERPRISE' },
  'key_swiggy_prod_9923b': { partner: 'Swiggy', tier: 'ENTERPRISE' },
  'key_zepto_prod_4412c': { partner: 'Zepto', tier: 'ENTERPRISE' },
  'key_uber_prod_1190d': { partner: 'Uber', tier: 'ENTERPRISE' },
  'key_dev_demo_test': { partner: 'CivicDev', tier: 'DEVELOPER' }
};

class SlidingWindowRateLimiter {
  constructor() {
    this.windows = new Map();
    // Periodically evict stale windows
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  getBucketKey(req) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey) return `apikey:${apiKey}`;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1';
    return `ip:${ip}`;
  }

  getTierConfig(req) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (apiKey && PARTNER_KEYS[apiKey]) {
      return TIERS[PARTNER_KEYS[apiKey].tier];
    }
    return TIERS.PUBLIC;
  }

  middleware() {
    return (req, res, next) => {
      const bucketKey = this.getBucketKey(req);
      const tier = this.getTierConfig(req);
      const now = Date.now();

      if (!this.windows.has(bucketKey)) {
        this.windows.set(bucketKey, {
          tokens: tier.capacity - 1,
          lastRefill: now
        });
        res.setHeader('X-RateLimit-Limit', tier.capacity);
        res.setHeader('X-RateLimit-Remaining', tier.capacity - 1);
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + tier.windowMs) / 1000));
        return next();
      }

      const bucket = this.windows.get(bucketKey);
      const elapsed = now - bucket.lastRefill;

      // Refill tokens proportional to elapsed time
      if (elapsed > 0) {
        const refillRate = tier.capacity / tier.windowMs;
        const refilled = elapsed * refillRate;
        bucket.tokens = Math.min(tier.capacity, bucket.tokens + refilled);
        bucket.lastRefill = now;
      }

      const resetEpoch = Math.ceil((now + tier.windowMs) / 1000);
      res.setHeader('X-RateLimit-Limit', tier.capacity);

      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
        res.setHeader('X-RateLimit-Reset', resetEpoch);
        return next();
      }

      // Quota exceeded: Return 429
      const retryAfterSeconds = Math.ceil((tier.windowMs - (now - bucket.lastRefill)) / 1000) || 1;
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', resetEpoch);
      res.setHeader('Retry-After', retryAfterSeconds);

      logger.warn(`[RateLimiter] Quota exceeded for ${bucketKey}. Tier: ${tier.name}`, {
        bucketKey,
        tier: tier.name
      });

      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit quota exceeded (${tier.capacity} requests per minute for ${tier.name} tier).`,
        retryAfterSeconds,
        upgradeInfo: 'Contact api-support@awaaz.gov.in for enterprise rate limit increases.'
      });
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.windows.entries()) {
      if (now - bucket.lastRefill > 5 * 60 * 1000) {
        this.windows.delete(key);
      }
    }
  }
}

const rateLimiter = new SlidingWindowRateLimiter();

module.exports = {
  rateLimiter,
  TIERS,
  PARTNER_KEYS
};
