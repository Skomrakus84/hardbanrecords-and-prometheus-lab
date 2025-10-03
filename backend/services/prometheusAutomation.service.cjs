const logger = require('../utils/prometheus.logger.cjs');
const analyticsService = require('./prometheusAnalytics.service.cjs');

class AutomationService {
  constructor() {
    this.responses = new Map();
    this.rules = new Map();
    this.initializeDefaultResponses();
    this.initializeDefaultRules();
  }

  initializeDefaultResponses() {
    const defaultResponses = [
      {
        id: 'auto-scale',
        trigger: 'High CPU Usage',
        action: 'Scale up system resources',
        status: 'active',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'fallback-provider',
        trigger: 'Provider Failure',
        action: 'Switch to fallback provider',
        status: 'active',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'quota-reset',
        trigger: 'Quota Exceeded',
        action: 'Reset provider quota',
        status: 'active',
        successCount: 0,
        failureCount: 0
      }
    ];

    defaultResponses.forEach(response => {
      this.responses.set(response.id, response);
    });
  }

  initializeDefaultRules() {
    const defaultRules = [
      {
        id: 'high-cpu',
        name: 'High CPU Usage Detection',
        condition: 'CPU Usage > 80% for 5 minutes',
        action: 'Trigger auto-scale response',
        enabled: true
      },
      {
        id: 'error-spike',
        name: 'Error Rate Spike',
        condition: 'Error rate > 10% in last minute',
        action: 'Switch to fallback provider',
        enabled: true
      },
      {
        id: 'quota-limit',
        name: 'Quota Limit Approaching',
        condition: 'Provider quota usage > 90%',
        action: 'Trigger quota reset',
        enabled: true
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  async evaluateMetrics(metrics) {
    const triggers = [];

    // Evaluate each rule
    for (const [id, rule] of this.rules) {
      if (!rule.enabled) continue;

      try {
        const shouldTrigger = await this.evaluateRule(rule, metrics);
        if (shouldTrigger) {
          triggers.push(id);
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${id}:`, error);
      }
    }

    // Execute responses for triggered rules
    for (const triggerId of triggers) {
      await this.executeResponse(triggerId, metrics);
    }

    return triggers;
  }

  async evaluateRule(rule, metrics) {
    switch (rule.id) {
      case 'high-cpu':
        return metrics.cpu > 80;
      case 'error-spike':
        return metrics.errorRate > 0.1;
      case 'quota-limit':
        return metrics.quotaUsage > 90;
      default:
        return false;
    }
  }

  async executeResponse(responseId, metrics) {
    const response = this.responses.get(responseId);
    if (!response || response.status !== 'active') {
      return false;
    }

    try {
      await this.performAction(response.action, metrics);
      
      response.successCount++;
      response.lastTriggered = new Date().toISOString();
      this.responses.set(responseId, response);
      
      logger.info(`Successfully executed response ${responseId}`);
      return true;
    } catch (error) {
      response.failureCount++;
      this.responses.set(responseId, response);
      
      logger.error(`Failed to execute response ${responseId}:`, error);
      return false;
    }
  }

  async performAction(action, metrics) {
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info(`Performing action: ${action}`, { metrics });
    return true;
  }

  getResponses() {
    return Array.from(this.responses.values());
  }

  getRules() {
    return Array.from(this.rules.values());
  }

  updateRule(ruleId, updates) {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);
    
    logger.info(`Updated rule ${ruleId}`, { updates });
    return updatedRule;
  }
}

module.exports = new AutomationService();