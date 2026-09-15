const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./infrastructure/observability/logger');

// Initialize background queue workers
try {
  require('./workers/complaintProcessorWorker');
} catch (err) {
  logger.warn(`Worker pool initialization notice: ${err.message}`);
}

// Connect Database with in-memory resilient fallback
connectDB();

const PORT = process.env.PORT || env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Awaaz AI Production Gateway running on port ${PORT} [Ready for Traffic]`);
});

// Graceful Shutdown Handlers (Kubernetes / Docker / Cloud PaaS)
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Initiating graceful connection draining...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process safely.');
    process.exit(0);
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
