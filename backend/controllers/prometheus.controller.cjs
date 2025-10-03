const analyticsService = require('../services/prometheusAnalytics.service.cjs');
const aiProviderService = require('../services/aiProvider.service.cjs');
const logger = require('../utils/prometheus.logger.cjs');

class PrometheusController {
  constructor() {
    this.providers = new Map();
    this.metrics = [];
    this.initializeProviders();
    this.lastMetricTimestamp = Date.now();
  }

  initializeProviders() {
    // Initialize default AI providers
    this.providers.set('HuggingFace', {
      name: 'HuggingFace',
      status: 'active',
      healthScore: 1.0,
      lastCheck: new Date().toISOString(),
      limits: {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
        remaining: 10000
      },
      capabilities: ['text-generation', 'classification', 'summarization']
    });

    this.providers.set('OpenAI', {
      name: 'OpenAI',
      status: 'active',
      healthScore: 0.95,
      lastCheck: new Date().toISOString(),
      limits: {
        requestsPerMinute: 3,
        requestsPerDay: 200,
        remaining: 200
      },
      capabilities: ['chat', 'embeddings', 'image-generation']
    });

    this.providers.set('Replicate', {
      name: 'Replicate',
      status: 'active',
      healthScore: 0.98,
      lastCheck: new Date().toISOString(),
      limits: {
        requestsPerMinute: 10,
        requestsPerDay: 1000,
        remaining: 1000
      },
      capabilities: ['model-deployment', 'inference']
    });
  }

  getMetrics = async (req, res) => {
    try {
      const currentMetrics = {
        timestamp: new Date().toISOString(),
        requestsPerMinute: aiProviderService.getProviderStats().totalRequests,
        successRate: analyticsService.calculateSummaryMetrics().averageSuccessRate,
        latency: analyticsService.calculateSummaryMetrics().averageLatency,
        trends: analyticsService.calculateTrends()
      };

      // Record metrics for analytics
      analyticsService.recordMetric(currentMetrics);
      
      // Log metrics collection
      logger.info('Metrics collected', { metrics: currentMetrics });

      res.json(currentMetrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', { error });
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  getStats = async (req, res) => {
    try {
      const analytics = analyticsService.getAnalytics();
      const providerStats = aiProviderService.getProviderStats();

      const stats = {
        current: {
          dailyUsage: providerStats.totalRequests,
          successRate: analytics.summary.averageSuccessRate,
          averageLatency: analytics.summary.averageLatency
        },
        trends: analytics.trends,
        predictions: analytics.predictions,
        anomalies: analytics.anomalies
      };

      logger.info('Stats retrieved', { stats });
      res.json(stats);
    } catch (error) {
      logger.error('Failed to fetch statistics', { error });
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  getProvidersHealth = async (req, res) => {
    try {
      // Convert providers Map to array and update lastCheck
      const providersArray = Array.from(this.providers.values()).map(provider => ({
        ...provider,
        lastCheck: new Date().toISOString()
      }));

      res.json(providersArray);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch providers health' });
    }
  }

  toggleProvider = async (req, res) => {
    try {
      const { provider } = req.params;
      const providerData = this.providers.get(provider);

      if (!providerData) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      providerData.status = providerData.status === 'active' ? 'down' : 'active';
      this.providers.set(provider, providerData);

      res.json(providerData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle provider' });
    }
  }

  resetProviderQuota = async (req, res) => {
    try {
      const { provider } = req.params;
      const providerData = this.providers.get(provider);

      if (!providerData) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      providerData.limits.remaining = providerData.limits.requestsPerDay;
      this.providers.set(provider, providerData);

      res.json(providerData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset provider quota' });
    }
  }

  resetSystem = async (req, res) => {
    try {
      this.metrics = [];
      this.initializeProviders();
      res.json({ message: 'System reset successful' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset system' });
    }
  }

  optimizeSystem = async (req, res) => {
    try {
      // Simulate system optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update health scores
      for (const [name, provider] of this.providers) {
        provider.healthScore = Math.min(1, provider.healthScore + 0.1);
        this.providers.set(name, provider);
      }

      res.json({ message: 'System optimization completed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize system' });
    }
  }
}

module.exports = PrometheusController;