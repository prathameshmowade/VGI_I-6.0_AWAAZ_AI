const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Enterprise Infrastructure Imports
const logger = require('./infrastructure/observability/logger');
const { tenantMiddleware } = require('./middleware/tenantMiddleware');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create uploads directory:', err.message);
  }
}

// 1. Ingress & Tracing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger.middleware());
app.use(tenantMiddleware);

// 2. SRE Observability & Probes (Must be before auth/tenancy gates)
app.use('/', require('./routes/healthProbes')); // Exposes /healthz, /readyz, /metrics

// Legacy & Status Health Check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  service: 'Awaaz AI Enterprise API Gateway', 
  version: '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  tenantId: req.tenantId,
  correlationId: req.correlationId,
  timestamp: new Date().toISOString()
}));

// 3. Static file serving for uploaded proof images
app.use('/uploads', express.static(uploadsDir));

// 4. Core Municipal Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/officers', require('./routes/officers'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/sms', require('./routes/sms'));
app.use('/api/call', require('./routes/call'));
app.use('/api/telegram', require('./routes/telegram'));
app.use('/api/civic', require('./routes/civicResponsibility'));
app.use('/api/notifications', require('./routes/notifications'));

// 5. High-Throughput B2B Telemetry Gateway (Zomato / Swiggy / Zepto / Uber)
app.use('/api/v1/b2b', require('./routes/b2bGateway'));

// Twin City verification feed alias
app.get('/api/twin-city/verifications', require('./controllers/complaintController').getTwinCityVerifications);

// 6. Serve Frontend Production Build (SPA fallback)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    // Skip API routes that 404ed
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz') || req.path.startsWith('/readyz')) {
      return res.status(404).json({ error: 'Endpoint not found', path: req.path });
    }
    const indexHtml = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}

// 7. Global Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, correlationId: req.correlationId });
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    correlationId: req.correlationId
  });
});

module.exports = app;
