const logger = require('../utils/prometheus.logger.cjs');

class PredictionService {
  constructor() {
    this.historicalData = [];
    this.models = new Map();
    this.predictions = new Map();
    this.anomalyThresholds = new Map();
    this.initializeModels();
  }

  initializeModels() {
    // Initialize different prediction models
    this.models.set('performance', {
      name: 'Performance Predictor',
      features: ['cpu', 'memory', 'latency', 'requestRate'],
      horizon: 3600000, // 1 hour ahead
      confidence: 0.95
    });

    this.models.set('errors', {
      name: 'Error Rate Predictor',
      features: ['errorRate', 'successRate', 'latency'],
      horizon: 1800000, // 30 minutes ahead
      confidence: 0.90
    });

    this.models.set('usage', {
      name: 'Resource Usage Predictor',
      features: ['cpu', 'memory', 'diskIO', 'networkIO'],
      horizon: 7200000, // 2 hours ahead
      confidence: 0.85
    });
  }

  addDataPoint(metrics) {
    this.historicalData.push({
      timestamp: new Date().getTime(),
      ...metrics
    });

    // Keep last 24 hours of data
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.historicalData = this.historicalData.filter(
      point => point.timestamp > dayAgo
    );

    // Update predictions when new data arrives
    this.updatePredictions();
  }

  updatePredictions() {
    for (const [modelName, model] of this.models) {
      try {
        const prediction = this.generatePrediction(model);
        this.predictions.set(modelName, prediction);
      } catch (error) {
        logger.error(`Error updating predictions for ${modelName}:`, error);
      }
    }
  }

  generatePrediction(model) {
    if (this.historicalData.length < 10) {
      return null; // Not enough data
    }

    const features = model.features;
    const recentData = this.historicalData.slice(-10);

    // Calculate trends
    const trends = {};
    features.forEach(feature => {
      const values = recentData.map(d => d[feature]);
      trends[feature] = this.calculateTrend(values);
    });

    // Simple exponential smoothing prediction
    const predictions = {};
    features.forEach(feature => {
      const values = recentData.map(d => d[feature]);
      predictions[feature] = this.exponentialSmoothing(values, 0.3);
    });

    // Calculate confidence intervals
    const intervals = {};
    features.forEach(feature => {
      intervals[feature] = this.calculateConfidenceInterval(
        recentData.map(d => d[feature]),
        model.confidence
      );
    });

    return {
      timestamp: new Date().getTime(),
      model: model.name,
      horizon: model.horizon,
      predictions,
      trends,
      intervals,
      confidence: model.confidence
    };
  }

  exponentialSmoothing(values, alpha) {
    let result = values[0];
    for (let i = 1; i < values.length; i++) {
      result = alpha * values[i] + (1 - alpha) * result;
    }
    return result;
  }

  calculateTrend(values) {
    const n = values.length;
    if (n < 2) return 'stable';

    // Simple linear regression
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const averageValue = sumY / n;
    const relativeSlope = slope / averageValue;

    if (relativeSlope > 0.1) return 'increasing';
    if (relativeSlope < -0.1) return 'decreasing';
    return 'stable';
  }

  calculateConfidenceInterval(values, confidence) {
    const n = values.length;
    if (n < 2) return null;

    // Calculate mean and standard deviation
    const mean = values.reduce((a, b) => a + b) / n;
    const stdDev = Math.sqrt(
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1)
    );

    // Z-score for 95% confidence interval is approximately 1.96
    const zScore = 1.96;
    const margin = (zScore * stdDev) / Math.sqrt(n);

    return {
      lower: mean - margin,
      upper: mean + margin,
      mean
    };
  }

  detectAnomalies(metrics) {
    const anomalies = [];

    for (const [modelName, prediction] of this.predictions) {
      if (!prediction) continue;

      const features = this.models.get(modelName).features;
      features.forEach(feature => {
        if (!metrics[feature]) return;

        const { lower, upper } = prediction.intervals[feature];
        if (metrics[feature] < lower || metrics[feature] > upper) {
          anomalies.push({
            model: modelName,
            feature,
            value: metrics[feature],
            expected: prediction.predictions[feature],
            bounds: { lower, upper },
            severity: this.calculateAnomalySeverity(
              metrics[feature],
              prediction.predictions[feature],
              { lower, upper }
            )
          });
        }
      });
    }

    return anomalies;
  }

  calculateAnomalySeverity(actual, expected, bounds) {
    const deviation = Math.abs(actual - expected);
    const range = bounds.upper - bounds.lower;
    const relativeDev = deviation / range;

    if (relativeDev > 3) return 'critical';
    if (relativeDev > 2) return 'warning';
    return 'info';
  }

  getPredictions() {
    return Object.fromEntries(this.predictions);
  }

  getAnomalyThresholds() {
    return Object.fromEntries(this.anomalyThresholds);
  }

  updateAnomalyThresholds(thresholds) {
    Object.entries(thresholds).forEach(([key, value]) => {
      this.anomalyThresholds.set(key, value);
    });
  }
}

module.exports = new PredictionService();