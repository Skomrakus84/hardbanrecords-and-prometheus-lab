const logger = require('../utils/prometheus.logger.cjs');

class PrometheusAnalyticsService {
  constructor() {
    this.metrics = [];
    this.anomalyThresholds = {
      latency: 200, // ms
      errorRate: 0.1, // 10%
      requestSpike: 100 // requests per minute
    };
  }

  recordMetric(metric) {
    this.metrics.push({
      ...metric,
      timestamp: new Date().toISOString()
    });

    // Keep last 24 hours of metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp) > oneDayAgo
    );

    // Check for anomalies
    this.detectAnomalies(metric);
  }

  detectAnomalies(metric) {
    const anomalies = [];

    // Check latency
    if (metric.latency > this.anomalyThresholds.latency) {
      anomalies.push({
        type: 'latency',
        value: metric.latency,
        threshold: this.anomalyThresholds.latency,
        severity: 'high'
      });
    }

    // Check error rate
    if (metric.errorRate > this.anomalyThresholds.errorRate) {
      anomalies.push({
        type: 'error_rate',
        value: metric.errorRate,
        threshold: this.anomalyThresholds.errorRate,
        severity: 'high'
      });
    }

    // Check for request spikes
    if (metric.requestsPerMinute > this.anomalyThresholds.requestSpike) {
      anomalies.push({
        type: 'request_spike',
        value: metric.requestsPerMinute,
        threshold: this.anomalyThresholds.requestSpike,
        severity: 'medium'
      });
    }

    if (anomalies.length > 0) {
      this.handleAnomalies(anomalies);
    }
  }

  handleAnomalies(anomalies) {
    anomalies.forEach(anomaly => {
      logger.warn('Anomaly detected', { anomaly });
      // Here you could trigger alerts or take automated actions
    });
  }

  getAnalytics() {
    return {
      summary: this.calculateSummaryMetrics(),
      trends: this.calculateTrends(),
      anomalies: this.getRecentAnomalies(),
      predictions: this.generatePredictions()
    };
  }

  calculateSummaryMetrics() {
    if (this.metrics.length === 0) {
      return {
        averageLatency: 0,
        averageRequestsPerMinute: 0,
        averageSuccessRate: 100,
        totalRequests: 0
      };
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      latency: acc.latency + metric.latency,
      requests: acc.requests + metric.requestsPerMinute,
      successRate: acc.successRate + (1 - metric.errorRate) * 100
    }), { latency: 0, requests: 0, successRate: 0 });

    return {
      averageLatency: sum.latency / this.metrics.length,
      averageRequestsPerMinute: sum.requests / this.metrics.length,
      averageSuccessRate: sum.successRate / this.metrics.length,
      totalRequests: this.metrics.reduce((sum, m) => sum + m.requestsPerMinute, 0)
    };
  }

  calculateTrends() {
    if (this.metrics.length < 2) {
      return {
        latency: 'stable',
        requests: 'stable',
        successRate: 'stable'
      };
    }

    const recentMetrics = this.metrics.slice(-10);
    const trends = {};

    ['latency', 'requestsPerMinute', 'errorRate'].forEach(metric => {
      const values = recentMetrics.map(m => m[metric]);
      const trend = this.calculateTrend(values);
      trends[metric] = trend;
    });

    return trends;
  }

  calculateTrend(values) {
    const average = values.reduce((a, b) => a + b) / values.length;
    const recent = values[values.length - 1];
    const delta = (recent - average) / average;

    if (delta > 0.1) return 'increasing';
    if (delta < -0.1) return 'decreasing';
    return 'stable';
  }

  getRecentAnomalies() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.metrics
      .filter(m => new Date(m.timestamp) > oneHourAgo && m.anomalies)
      .flatMap(m => m.anomalies || []);
  }

  generatePredictions() {
    if (this.metrics.length < 24) {
      return {
        nextHourRequests: null,
        potentialIssues: []
      };
    }

    const recentMetrics = this.metrics.slice(-24);
    const avgRequestsPerHour = recentMetrics.reduce((sum, m) => 
      sum + m.requestsPerMinute, 0) / 24;

    const predictions = {
      nextHourRequests: Math.round(avgRequestsPerHour * 60),
      potentialIssues: []
    };

    // Predict potential issues
    const latencyTrend = this.calculateTrend(recentMetrics.map(m => m.latency));
    if (latencyTrend === 'increasing') {
      predictions.potentialIssues.push({
        type: 'latency',
        severity: 'warning',
        message: 'Latency is showing an upward trend'
      });
    }

    return predictions;
  }

  updateThresholds(newThresholds) {
    this.anomalyThresholds = {
      ...this.anomalyThresholds,
      ...newThresholds
    };
    logger.info('Updated anomaly thresholds', { newThresholds });
  }
}

module.exports = new PrometheusAnalyticsService();