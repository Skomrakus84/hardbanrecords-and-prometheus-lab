/**
 * Notifications Routes - Notification Management & Communication API
 * Comprehensive notification system with multiple channels
 * Advanced notification preferences and real-time updates
 */

const express = require('express');
const router = express.Router();

// Import controllers
const NotificationsController = require('../controllers/notifications.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Notification Overview ==========

/**
 * @route   GET /api/music/notifications
 * @desc    Get user notifications with filtering
 * @access  Private
 */
router.get('/', 
    requireAuth,
    NotificationsController.getNotifications
);

/**
 * @route   GET /api/music/notifications/unread
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get('/unread', 
    requireAuth,
    NotificationsController.getUnreadCount
);

/**
 * @route   GET /api/music/notifications/summary
 * @desc    Get notifications summary dashboard
 * @access  Private
 */
router.get('/summary', 
    requireAuth,
    NotificationsController.getNotificationsSummary
);

// ========== Individual Notification Management ==========

/**
 * @route   GET /api/music/notifications/:id
 * @desc    Get specific notification details
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    NotificationsController.getNotification
);

/**
 * @route   PUT /api/music/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', 
    requireAuth,
    NotificationsController.markAsRead
);

/**
 * @route   PUT /api/music/notifications/:id/unread
 * @desc    Mark notification as unread
 * @access  Private
 */
router.put('/:id/unread', 
    requireAuth,
    NotificationsController.markAsUnread
);

/**
 * @route   DELETE /api/music/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', 
    requireAuth,
    NotificationsController.deleteNotification
);

/**
 * @route   POST /api/music/notifications/:id/archive
 * @desc    Archive notification
 * @access  Private
 */
router.post('/:id/archive', 
    requireAuth,
    NotificationsController.archiveNotification
);

// ========== Bulk Notification Operations ==========

/**
 * @route   PUT /api/music/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', 
    requireAuth,
    NotificationsController.markAllAsRead
);

/**
 * @route   DELETE /api/music/notifications/clear-all
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete('/clear-all', 
    requireAuth,
    NotificationsController.clearAllNotifications
);

/**
 * @route   POST /api/music/notifications/bulk-action
 * @desc    Perform bulk action on notifications
 * @access  Private
 */
router.post('/bulk-action', 
    requireAuth,
    validateRequest('bulkNotificationAction'),
    NotificationsController.bulkNotificationAction
);

/**
 * @route   POST /api/music/notifications/archive-read
 * @desc    Archive all read notifications
 * @access  Private
 */
router.post('/archive-read', 
    requireAuth,
    NotificationsController.archiveReadNotifications
);

// ========== Notification Categories ==========

/**
 * @route   GET /api/music/notifications/categories
 * @desc    Get notification categories
 * @access  Private
 */
router.get('/categories', 
    requireAuth,
    NotificationsController.getNotificationCategories
);

/**
 * @route   GET /api/music/notifications/category/:category
 * @desc    Get notifications by category
 * @access  Private
 */
router.get('/category/:category', 
    requireAuth,
    NotificationsController.getNotificationsByCategory
);

/**
 * @route   PUT /api/music/notifications/category/:category/read-all
 * @desc    Mark all notifications in category as read
 * @access  Private
 */
router.put('/category/:category/read-all', 
    requireAuth,
    NotificationsController.markCategoryAsRead
);

// ========== Notification Preferences ==========

/**
 * @route   GET /api/music/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', 
    requireAuth,
    NotificationsController.getNotificationPreferences
);

/**
 * @route   PUT /api/music/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', 
    requireAuth,
    validateRequest('updateNotificationPreferences'),
    NotificationsController.updateNotificationPreferences
);

/**
 * @route   GET /api/music/notifications/preferences/channels
 * @desc    Get available notification channels
 * @access  Private
 */
router.get('/preferences/channels', 
    requireAuth,
    NotificationsController.getNotificationChannels
);

/**
 * @route   PUT /api/music/notifications/preferences/channel/:channel
 * @desc    Update channel-specific preferences
 * @access  Private
 */
router.put('/preferences/channel/:channel', 
    requireAuth,
    validateRequest('updateChannelPreferences'),
    NotificationsController.updateChannelPreferences
);

/**
 * @route   POST /api/music/notifications/preferences/test
 * @desc    Test notification preferences
 * @access  Private
 */
router.post('/preferences/test', 
    requireAuth,
    validateRequest('testNotificationPreferences'),
    NotificationsController.testNotificationPreferences
);

// ========== Push Notifications ==========

/**
 * @route   POST /api/music/notifications/push/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/push/subscribe', 
    requireAuth,
    validateRequest('subscribePushNotifications'),
    NotificationsController.subscribePushNotifications
);

/**
 * @route   DELETE /api/music/notifications/push/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.delete('/push/unsubscribe', 
    requireAuth,
    NotificationsController.unsubscribePushNotifications
);

/**
 * @route   POST /api/music/notifications/push/test
 * @desc    Send test push notification
 * @access  Private
 */
router.post('/push/test', 
    requireAuth,
    NotificationsController.sendTestPushNotification
);

// ========== Email Notifications ==========

/**
 * @route   GET /api/music/notifications/email/preferences
 * @desc    Get email notification preferences
 * @access  Private
 */
router.get('/email/preferences', 
    requireAuth,
    NotificationsController.getEmailPreferences
);

/**
 * @route   PUT /api/music/notifications/email/preferences
 * @desc    Update email notification preferences
 * @access  Private
 */
router.put('/email/preferences', 
    requireAuth,
    validateRequest('updateEmailPreferences'),
    NotificationsController.updateEmailPreferences
);

/**
 * @route   POST /api/music/notifications/email/verify
 * @desc    Verify email for notifications
 * @access  Private
 */
router.post('/email/verify', 
    requireAuth,
    validateRequest('verifyNotificationEmail'),
    NotificationsController.verifyNotificationEmail
);

/**
 * @route   POST /api/music/notifications/email/unsubscribe
 * @desc    Unsubscribe from email notifications
 * @access  Private
 */
router.post('/email/unsubscribe', 
    requireAuth,
    NotificationsController.unsubscribeEmailNotifications
);

// ========== SMS Notifications ==========

/**
 * @route   GET /api/music/notifications/sms/preferences
 * @desc    Get SMS notification preferences
 * @access  Private
 */
router.get('/sms/preferences', 
    requireAuth,
    NotificationsController.getSMSPreferences
);

/**
 * @route   PUT /api/music/notifications/sms/preferences
 * @desc    Update SMS notification preferences
 * @access  Private
 */
router.put('/sms/preferences', 
    requireAuth,
    validateRequest('updateSMSPreferences'),
    NotificationsController.updateSMSPreferences
);

/**
 * @route   POST /api/music/notifications/sms/verify
 * @desc    Verify phone number for SMS notifications
 * @access  Private
 */
router.post('/sms/verify', 
    requireAuth,
    validateRequest('verifySMSNumber'),
    NotificationsController.verifySMSNumber
);

/**
 * @route   POST /api/music/notifications/sms/opt-out
 * @desc    Opt out of SMS notifications
 * @access  Private
 */
router.post('/sms/opt-out', 
    requireAuth,
    NotificationsController.optOutSMSNotifications
);

// ========== Real-time Notifications ==========

/**
 * @route   GET /api/music/notifications/realtime/status
 * @desc    Get real-time notification connection status
 * @access  Private
 */
router.get('/realtime/status', 
    requireAuth,
    NotificationsController.getRealtimeStatus
);

/**
 * @route   POST /api/music/notifications/realtime/connect
 * @desc    Connect to real-time notifications
 * @access  Private
 */
router.post('/realtime/connect', 
    requireAuth,
    NotificationsController.connectRealtime
);

/**
 * @route   POST /api/music/notifications/realtime/disconnect
 * @desc    Disconnect from real-time notifications
 * @access  Private
 */
router.post('/realtime/disconnect', 
    requireAuth,
    NotificationsController.disconnectRealtime
);

// ========== Notification Templates ==========

/**
 * @route   GET /api/music/notifications/templates
 * @desc    Get notification templates
 * @access  Private (Admin only)
 */
router.get('/templates', 
    requireAuth,
    requireRole(['admin']),
    NotificationsController.getNotificationTemplates
);

/**
 * @route   POST /api/music/notifications/templates
 * @desc    Create notification template
 * @access  Private (Admin only)
 */
router.post('/templates', 
    requireAuth,
    requireRole(['admin']),
    validateRequest('createNotificationTemplate'),
    NotificationsController.createNotificationTemplate
);

/**
 * @route   PUT /api/music/notifications/templates/:id
 * @desc    Update notification template
 * @access  Private (Admin only)
 */
router.put('/templates/:id', 
    requireAuth,
    requireRole(['admin']),
    validateRequest('updateNotificationTemplate'),
    NotificationsController.updateNotificationTemplate
);

/**
 * @route   DELETE /api/music/notifications/templates/:id
 * @desc    Delete notification template
 * @access  Private (Admin only)
 */
router.delete('/templates/:id', 
    requireAuth,
    requireRole(['admin']),
    NotificationsController.deleteNotificationTemplate
);

// ========== Notification Analytics ==========

/**
 * @route   GET /api/music/notifications/analytics
 * @desc    Get notification analytics
 * @access  Private
 */
router.get('/analytics', 
    requireAuth,
    NotificationsController.getNotificationAnalytics
);

/**
 * @route   GET /api/music/notifications/analytics/engagement
 * @desc    Get notification engagement metrics
 * @access  Private
 */
router.get('/analytics/engagement', 
    requireAuth,
    NotificationsController.getNotificationEngagement
);

/**
 * @route   GET /api/music/notifications/analytics/delivery
 * @desc    Get notification delivery statistics
 * @access  Private
 */
router.get('/analytics/delivery', 
    requireAuth,
    NotificationsController.getNotificationDeliveryStats
);

// ========== Admin Notification Management ==========

/**
 * @route   POST /api/music/notifications/admin/broadcast
 * @desc    Send broadcast notification to users
 * @access  Private (Admin only)
 */
router.post('/admin/broadcast', 
    requireAuth,
    requireRole(['admin']),
    validateRequest('broadcastNotification'),
    NotificationsController.broadcastNotification
);

/**
 * @route   GET /api/music/notifications/admin/system-notifications
 * @desc    Get system notifications management
 * @access  Private (Admin only)
 */
router.get('/admin/system-notifications', 
    requireAuth,
    requireRole(['admin']),
    NotificationsController.getSystemNotifications
);

/**
 * @route   POST /api/music/notifications/admin/system-notification
 * @desc    Create system-wide notification
 * @access  Private (Admin only)
 */
router.post('/admin/system-notification', 
    requireAuth,
    requireRole(['admin']),
    validateRequest('createSystemNotification'),
    NotificationsController.createSystemNotification
);

/**
 * @route   GET /api/music/notifications/admin/analytics
 * @desc    Get admin notification analytics
 * @access  Private (Admin only)
 */
router.get('/admin/analytics', 
    requireAuth,
    requireRole(['admin']),
    NotificationsController.getAdminNotificationAnalytics
);

module.exports = router;
