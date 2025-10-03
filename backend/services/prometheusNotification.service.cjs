const logger = require('../utils/prometheus.logger.cjs');

class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Set();
    this.severityLevels = {
      critical: 1,
      warning: 2,
      info: 3
    };
  }

  addNotification(notification) {
    const fullNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(fullNotification);
    this.notifications = this.notifications.slice(0, 100); // Keep last 100 notifications
    
    // Broadcast to all subscribers
    this.broadcast(fullNotification);

    // Log based on severity
    switch (notification.severity) {
      case 'critical':
        logger.error('Critical notification:', notification);
        break;
      case 'warning':
        logger.warn('Warning notification:', notification);
        break;
      default:
        logger.info('Info notification:', notification);
    }

    return fullNotification;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcast(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        logger.error('Error in notification subscriber:', error);
      }
    });
  }

  getNotifications(options = {}) {
    let filtered = [...this.notifications];

    if (options.severity) {
      const minSeverity = this.severityLevels[options.severity];
      filtered = filtered.filter(n => 
        this.severityLevels[n.severity] <= minSeverity
      );
    }

    if (options.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  clearNotifications() {
    this.notifications = [];
  }

  // Predefined notification templates
  notifySystemEvent(event) {
    return this.addNotification({
      title: 'System Event',
      message: event.message,
      severity: event.severity || 'info',
      category: 'system',
      metadata: event.metadata || {}
    });
  }

  notifyPerformanceIssue(issue) {
    return this.addNotification({
      title: 'Performance Alert',
      message: issue.message,
      severity: issue.severity || 'warning',
      category: 'performance',
      metadata: {
        metric: issue.metric,
        threshold: issue.threshold,
        currentValue: issue.value
      }
    });
  }

  notifyAIProviderIssue(provider, issue) {
    return this.addNotification({
      title: `AI Provider Alert: ${provider}`,
      message: issue.message,
      severity: issue.severity || 'warning',
      category: 'ai-provider',
      metadata: {
        provider,
        errorType: issue.type,
        errorDetails: issue.details
      }
    });
  }

  notifySecurityEvent(event) {
    return this.addNotification({
      title: 'Security Alert',
      message: event.message,
      severity: 'critical',
      category: 'security',
      metadata: {
        type: event.type,
        source: event.source,
        details: event.details
      }
    });
  }

  notifyAutomatedResponse(response) {
    return this.addNotification({
      title: 'Automated Response Triggered',
      message: `Response "${response.trigger}" was executed`,
      severity: response.success ? 'info' : 'warning',
      category: 'automation',
      metadata: {
        responseId: response.id,
        trigger: response.trigger,
        action: response.action,
        success: response.success,
        details: response.details
      }
    });
  }
}

module.exports = new NotificationService();