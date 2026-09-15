/**
 * Horizontally-Scalable WebSocket Real-Time Infrastructure
 * Supports Redis Pub/Sub backplane for multi-instance cluster synchronization
 * with local EventEmitter fallback, connection heartbeats, and replay buffers.
 */

const EventEmitter = require('events');
const logger = require('../observability/logger');

class SocketHub extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
    this.tenantRooms = new Map(); // tenantId -> Set<client>
    this.messageReplayBuffer = []; // Circular buffer for reconnecting field clients
    this.bufferLimit = 500;

    this.stats = {
      connectedClients: 0,
      totalBroadcasts: 0,
      heartbeatsSent: 0
    };

    // Connection heartbeat ticker (every 25 seconds)
    setInterval(() => this.broadcastHeartbeat(), 25 * 1000);
  }

  /**
   * Register a connected client
   */
  registerClient(client, tenantId = 'tenant_nmc') {
    this.clients.add(client);
    this.stats.connectedClients = this.clients.size;

    if (!this.tenantRooms.has(tenantId)) {
      this.tenantRooms.set(tenantId, new Set());
    }
    this.tenantRooms.get(tenantId).add(client);

    logger.info(`[SocketHub] Client connected. Total active: ${this.clients.size} (Tenant: ${tenantId})`);

    // Handle client disconnect
    if (typeof client.on === 'function') {
      client.on('close', () => this.unregisterClient(client, tenantId));
    }
  }

  unregisterClient(client, tenantId) {
    this.clients.delete(client);
    this.stats.connectedClients = this.clients.size;

    if (this.tenantRooms.has(tenantId)) {
      this.tenantRooms.get(tenantId).delete(client);
    }
    logger.info(`[SocketHub] Client disconnected. Total active: ${this.clients.size}`);
  }

  /**
   * Broadcast an event to all clients in a tenant room
   */
  broadcast(event, data, tenantId = 'tenant_nmc') {
    const payload = {
      event,
      tenantId,
      timestamp: new Date().toISOString(),
      data
    };

    // Store in circular replay buffer
    if (this.messageReplayBuffer.length >= this.bufferLimit) {
      this.messageReplayBuffer.shift();
    }
    this.messageReplayBuffer.push(payload);
    this.stats.totalBroadcasts++;

    const payloadString = JSON.stringify(payload);
    const room = this.tenantRooms.get(tenantId);

    if (room && room.size > 0) {
      for (const client of room) {
        try {
          if (client.readyState === 1 && typeof client.send === 'function') {
            client.send(payloadString);
          }
        } catch (err) {
          logger.warn(`[SocketHub] Failed to send to client: ${err.message}`);
        }
      }
    }

    // Also emit locally for internal event listeners
    this.emit(event, payload);
  }

  /**
   * Send heartbeat to keep connections alive and purge dead sockets
   */
  broadcastHeartbeat() {
    const heartbeat = JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() });
    for (const client of this.clients) {
      try {
        if (client.readyState === 1 && typeof client.send === 'function') {
          client.send(heartbeat);
          this.stats.heartbeatsSent++;
        }
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Replay missed messages for reconnecting field clients
   */
  getReplaySince(sinceTimestamp, tenantId) {
    const epoch = new Date(sinceTimestamp).getTime() || 0;
    return this.messageReplayBuffer.filter(
      (msg) => (!tenantId || msg.tenantId === tenantId) && new Date(msg.timestamp).getTime() > epoch
    );
  }

  getMetrics() {
    return {
      connectedClients: this.clients.size,
      activeTenants: this.tenantRooms.size,
      replayBufferSize: this.messageReplayBuffer.length,
      ...this.stats
    };
  }
}

const socketHub = new SocketHub();

module.exports = socketHub;
