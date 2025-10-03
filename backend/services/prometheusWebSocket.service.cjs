const WebSocket = require('ws');
const logger = require('./prometheus.logger.cjs');

class PrometheusWebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.setupWebSocket();
    this.metricsInterval = null;
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      logger.info('New WebSocket client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          logger.error('Error handling WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('WebSocket client disconnected');
      });

      // Send initial system state
      this.sendSystemState(ws);
    });
  }

  handleMessage(ws, message) {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(ws, message.topics);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(ws, message.topics);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  handleSubscription(ws, topics) {
    ws.subscribedTopics = new Set(topics);
    logger.info(`Client subscribed to topics: ${topics.join(', ')}`);
  }

  handleUnsubscription(ws, topics) {
    topics.forEach(topic => ws.subscribedTopics?.delete(topic));
    logger.info(`Client unsubscribed from topics: ${topics.join(', ')}`);
  }

  broadcast(topic, data) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && 
          (!client.subscribedTopics || client.subscribedTopics.has(topic))) {
        client.send(JSON.stringify({ topic, data }));
      }
    });
  }

  sendSystemState(ws) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'system_state',
        data: {
          timestamp: new Date().toISOString(),
          status: 'active',
          connectedClients: this.clients.size
        }
      }));
    }
  }

  startMetricsStream() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(() => {
      const metrics = this.generateMetrics();
      this.broadcast('metrics', metrics);
    }, 5000); // Update every 5 seconds
  }

  stopMetricsStream() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  generateMetrics() {
    return {
      timestamp: new Date().toISOString(),
      system: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        activeConnections: this.clients.size
      },
      ai: {
        requestsPerSecond: Math.floor(Math.random() * 50),
        successRate: 85 + Math.random() * 15,
        averageLatency: 50 + Math.random() * 100
      }
    };
  }
}

module.exports = PrometheusWebSocketService;