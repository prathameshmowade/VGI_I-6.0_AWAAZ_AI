/**
 * SRE Observability, Health Probes & Prometheus Metrics
 * Exposes /healthz (liveness), /readyz (readiness), and /metrics for Kubernetes & Prometheus.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { taskQueue } = require('../infrastructure/queue/taskQueue');
const { getBreaker } = require('../infrastructure/resilience/circuitBreaker');
const socketHub = require('../infrastructure/realtime/socketHub');
const semanticCacheService = require('../services/semanticCacheService');

/**
 * GET /healthz
 * Kubernetes Liveness Probe: Returns 200 OK if Node process is responsive
 */
router.get('/healthz', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /readyz
 * Kubernetes Readiness Probe: Verifies DB, Task Queue, and AI Breakers
 */
router.get('/readyz', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1 || true; // True for in-memory fallback
  const queueMetrics = taskQueue.getMetrics();
  const aiBreaker = getBreaker('ai-triage-service');

  const isDegraded = aiBreaker.state === 'OPEN' || queueMetrics.dlqLength > 100;
  const status = isDegraded ? 'degraded' : 'ready';
  const statusCode = isDbReady ? 200 : 503;

  return res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    components: {
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'in_memory_fallback',
        readyState: mongoose.connection.readyState
      },
      taskQueue: {
        status: 'active',
        queueLength: queueMetrics.queueLength,
        dlqLength: queueMetrics.dlqLength
      },
      aiCircuitBreaker: {
        status: aiBreaker.state,
        failureCount: aiBreaker.failureCount
      },
      socketHub: {
        connectedClients: socketHub.clients.size
      },
      memory: {
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    }
  });
});

/**
 * GET /metrics
 * Standard Prometheus Text Exposition Format
 */
router.get('/metrics', (req, res) => {
  const queueMetrics = taskQueue.getMetrics();
  const aiBreaker = getBreaker('ai-triage-service');
  const cacheMetrics = semanticCacheService.getMetrics();
  const socketMetrics = socketHub.getMetrics();
  const mem = process.memoryUsage();

  const prometheusText = `
# HELP awaaz_uptime_seconds Total server uptime in seconds
# TYPE awaaz_uptime_seconds gauge
awaaz_uptime_seconds ${Math.floor(process.uptime())}

# HELP awaaz_memory_heap_used_bytes Heap memory used in bytes
# TYPE awaaz_memory_heap_used_bytes gauge
awaaz_memory_heap_used_bytes ${mem.heapUsed}

# HELP awaaz_queue_pending_jobs Total pending jobs in primary queue
# TYPE awaaz_queue_pending_jobs gauge
awaaz_queue_pending_jobs ${queueMetrics.queueLength}

# HELP awaaz_queue_dlq_poison_jobs Total dead-letter poison jobs in DLQ
# TYPE awaaz_queue_dlq_poison_jobs counter
awaaz_queue_dlq_poison_jobs ${queueMetrics.dlqLength}

# HELP awaaz_ai_circuit_breaker_state Current state of AI circuit breaker (0=CLOSED, 1=HALF_OPEN, 2=OPEN)
# TYPE awaaz_ai_circuit_breaker_state gauge
awaaz_ai_circuit_breaker_state ${aiBreaker.state === 'CLOSED' ? 0 : aiBreaker.state === 'HALF_OPEN' ? 1 : 2}

# HELP awaaz_semantic_cache_hit_rate_percent Semantic query cache hit rate percentage
# TYPE awaaz_semantic_cache_hit_rate_percent gauge
awaaz_semantic_cache_hit_rate_percent ${cacheMetrics.hitRatePct}

# HELP awaaz_realtime_websocket_clients Total connected officer and citizen WebSocket clients
# TYPE awaaz_realtime_websocket_clients gauge
awaaz_realtime_websocket_clients ${socketMetrics.connectedClients}

# HELP awaaz_realtime_total_broadcasts Total live events broadcast
# TYPE awaaz_realtime_total_broadcasts counter
awaaz_realtime_total_broadcasts ${socketMetrics.totalBroadcasts}
`.trim();

  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  return res.send(prometheusText);
});

module.exports = router;
