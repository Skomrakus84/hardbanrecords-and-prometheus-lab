const logger = require('../utils/prometheus.logger.cjs');

class AIProviderService {
  constructor() {
    this.providerQuotas = new Map();
    this.initializeQuotas();
  }

  initializeQuotas() {
    const providers = ['HuggingFace', 'OpenAI', 'Replicate'];
    providers.forEach(provider => {
      this.providerQuotas.set(provider, {
        requests: 0,
        lastReset: new Date(),
        errors: 0
      });
    });
  }

  async executeWithFallback(task, providers = ['HuggingFace', 'OpenAI', 'Replicate']) {
    for (const provider of providers) {
      try {
        const quota = this.providerQuotas.get(provider);
        if (quota.requests >= this.getProviderLimit(provider)) {
          logger.warn(`${provider} quota exceeded`);
          continue;
        }

        const result = await this.executeTask(provider, task);
        this.updateQuota(provider, true);
        return result;

      } catch (error) {
        logger.error(`${provider} execution failed: ${error.message}`);
        this.updateQuota(provider, false);
        continue;
      }
    }
    throw new Error('All providers failed to execute task');
  }

  async executeTask(provider, task) {
    // Simulate API call to provider
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Random success/failure for demo
    if (Math.random() > 0.9) {
      throw new Error('Provider API error');
    }

    return {
      success: true,
      provider,
      result: `Task executed by ${provider}`,
      timestamp: new Date().toISOString()
    };
  }

  updateQuota(provider, success) {
    const quota = this.providerQuotas.get(provider);
    quota.requests++;
    if (!success) {
      quota.errors++;
    }
    this.providerQuotas.set(provider, quota);

    // Log quota update
    logger.info(`Updated quota for ${provider}`, {
      provider,
      requests: quota.requests,
      errors: quota.errors
    });
  }

  getProviderLimit(provider) {
    const limits = {
      'HuggingFace': 10000,
      'OpenAI': 200,
      'Replicate': 1000
    };
    return limits[provider] || 100;
  }

  resetQuotas() {
    this.initializeQuotas();
    logger.info('All provider quotas reset');
  }

  getProviderStats() {
    const stats = {};
    for (const [provider, quota] of this.providerQuotas) {
      stats[provider] = {
        requests: quota.requests,
        errors: quota.errors,
        successRate: quota.requests > 0 ? 
          ((quota.requests - quota.errors) / quota.requests) * 100 : 
          100
      };
    }
    return stats;
  }
}

module.exports = new AIProviderService();