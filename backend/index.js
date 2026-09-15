const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const connectDB = require('./config/db');

// Enterprise Infrastructure Imports
const logger = require('./infrastructure/observability/logger');
const { tenantMiddleware } = require('./middleware/tenantMiddleware');
require('./workers/complaintProcessorWorker'); // Initialize background task workers

const app = express();

// 1. Ingress & Tracing Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(logger.middleware());
app.use(tenantMiddleware);

// 2. SRE Observability & Probes (Must be before auth/tenancy gates)
app.use('/', require('./routes/healthProbes')); // Exposes /healthz, /readyz, /metrics

// Legacy API Health Check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  service: 'Awaaz AI Enterprise API Gateway', 
  version: '2.0.0',
  tenantId: req.tenantId,
  correlationId: req.correlationId,
  timestamp: new Date().toISOString()
}));

// 3. Static file serving for uploaded proof images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// 5. High-Throughput B2B Telemetry Gateway (Zomato / Swiggy / Zepto / Uber)
app.use('/api/v1/b2b', require('./routes/b2bGateway'));

// Twin City verification feed alias
app.get('/api/twin-city/verifications', require('./controllers/complaintController').getTwinCityVerifications);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

connectDB();

const PORT = process.env.PORT || env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Awaaz AI Server running on port ${PORT} [Multi-Tenant & Event-Decoupled]`);
});
