/**
 * OpenTelemetry-Compatible Structured JSON Logger
 * Propagates correlation IDs across HTTP -> Queue -> Worker -> Database
 */

const crypto = require('crypto');

// Generate or extract correlation trace ID
function getCorrelationId(req) {
  if (!req) return crypto.randomUUID();
  return (
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    req.correlationId ||
    `trc-${crypto.randomBytes(8).toString('hex')}`
  );
}

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    service: 'awaaz-ai-engine',
    version: '2.0.0',
    env: process.env.NODE_ENV || 'production',
    correlationId: meta.correlationId || 'system-core',
    tenantId: meta.tenantId || 'tenant_global',
    ...meta
  };

  return JSON.stringify(entry);
}

const logger = {
  info(msg, meta) {
    console.log(formatLog('INFO', msg, meta));
  },
  warn(msg, meta) {
    console.warn(formatLog('WARN', msg, meta));
  },
  error(msg, meta) {
    console.error(formatLog('ERROR', msg, meta));
  },
  debug(msg, meta) {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.log(formatLog('DEBUG', msg, meta));
    }
  },

  // Express request tracing middleware
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const correlationId = getCorrelationId(req);
      req.correlationId = correlationId;
      res.setHeader('X-Correlation-ID', correlationId);

      const tenantId = req.headers['x-tenant-id'] || 'tenant_nmc';
      req.tenantId = tenantId;

      res.on('finish', () => {
        const durationMs = Date.now() - startTime;
        const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
        logger[level.toLowerCase()](`${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs}ms)`, {
          correlationId,
          tenantId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
          userAgent: req.headers['user-agent']
        });
      });

      next();
    };
  }
};

module.exports = logger;
