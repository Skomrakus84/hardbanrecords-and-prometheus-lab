/**
 * Notifications Controller - Advanced Music Notifications REST API
 * Exposes comprehensive notification management features through REST endpoints
 * Provides sophisticated notification delivery, preferences, and tracking capabilities
 * Integrates with notification services and external communication platforms
 */

const NotificationService = require('../services/notification.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class NotificationsController {
    /**
     * Get user notifications
     * GET /api/music/notifications
     */
    static async getNotifications(req, res, next) {
        try {
            const {
                status = 'all',
                category = 'all',
                priority = 'all',
                date_from = null,
                date_to = null,
                page = 1,
                limit = 20,
                mark_as_read = false
            } = req.query;

            const userId = req.user.id;

            const notificationOptions = {
                status,
                category,
                priority,
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                mark_as_read: mark_as_read === 'true',
                user_id: userId
            };

            const notifications = await NotificationService.getUserNotifications(
                notificationOptions
            );

            res.json({
                success: true,
                data: {
                    notifications: notifications.notifications,
                    pagination: notifications.pagination,
                    summary: notifications.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification details
     * GET /api/music/notifications/:notificationId
     */
    static async getNotificationDetails(req, res, next) {
        try {
            const { notificationId } = req.params;
            const {
                mark_as_read = true,
                include_actions = true
            } = req.query;

            const userId = req.user.id;

            const options = {
                mark_as_read: mark_as_read === 'true',
                include_actions: include_actions === 'true'
            };

            const notification = await NotificationService.getNotificationDetails(
                notificationId,
                options,
                userId
            );

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark notifications as read
     * PUT /api/music/notifications/mark-read
     */
    static async markAsRead(req, res, next) {
        try {
            const {
                notification_ids = [],
                mark_all = false,
                category = null
            } = req.body;

            const userId = req.user.id;

            if (!mark_all && notification_ids.length === 0) {
                throw new AppError('Notification IDs are required when not marking all', 400);
            }

            const markData = {
                notification_ids,
                mark_all,
                category,
                marked_by: userId
            };

            const result = await NotificationService.markNotificationsAsRead(
                markData,
                userId
            );

            res.json({
                success: true,
                message: 'Notifications marked as read',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete notifications
     * DELETE /api/music/notifications
     */
    static async deleteNotifications(req, res, next) {
        try {
            const {
                notification_ids = [],
                delete_all_read = false,
                category = null,
                older_than_days = null
            } = req.body;

            const userId = req.user.id;

            const deleteData = {
                notification_ids,
                delete_all_read,
                category,
                older_than_days: older_than_days ? parseInt(older_than_days) : null,
                deleted_by: userId
            };

            const result = await NotificationService.deleteNotifications(
                deleteData,
                userId
            );

            res.json({
                success: true,
                message: 'Notifications deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification preferences
     * GET /api/music/notifications/preferences
     */
    static async getNotificationPreferences(req, res, next) {
        try {
            const userId = req.user.id;

            const preferences = await NotificationService.getNotificationPreferences(
                userId
            );

            res.json({
                success: true,
                data: preferences
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update notification preferences
     * PUT /api/music/notifications/preferences
     */
    static async updateNotificationPreferences(req, res, next) {
        try {
            const {
                email_notifications = {},
                push_notifications = {},
                sms_notifications = {},
                in_app_notifications = {},
                frequency_settings = {}
            } = req.body;

            const userId = req.user.id;

            const preferences = {
                email_notifications: {
                    releases: email_notifications.releases !== false,
                    royalty_payments: email_notifications.royalty_payments !== false,
                    analytics_reports: email_notifications.analytics_reports || false,
                    platform_updates: email_notifications.platform_updates || false,
                    collaboration_invites: email_notifications.collaboration_invites !== false,
                    marketing_updates: email_notifications.marketing_updates || false
                },
                push_notifications: {
                    real_time_analytics: push_notifications.real_time_analytics || false,
                    urgent_issues: push_notifications.urgent_issues !== false,
                    payment_confirmations: push_notifications.payment_confirmations !== false,
                    milestone_achievements: push_notifications.milestone_achievements !== false
                },
                sms_notifications: {
                    security_alerts: sms_notifications.security_alerts !== false,
                    payment_issues: sms_notifications.payment_issues || false,
                    urgent_support: sms_notifications.urgent_support || false
                },
                in_app_notifications: {
                    all_categories: in_app_notifications.all_categories !== false,
                    show_previews: in_app_notifications.show_previews !== false,
                    sound_enabled: in_app_notifications.sound_enabled || false
                },
                frequency_settings: {
                    digest_frequency: frequency_settings.digest_frequency || 'weekly',
                    quiet_hours: frequency_settings.quiet_hours || { start: '22:00', end: '08:00' },
                    timezone: frequency_settings.timezone || 'UTC'
                },
                updated_by: userId
            };

            const result = await NotificationService.updateNotificationPreferences(
                preferences,
                userId
            );

            res.json({
                success: true,
                message: 'Notification preferences updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Send custom notification
     * POST /api/music/notifications/send
     */
    static async sendCustomNotification(req, res, next) {
        try {
            const {
                recipient_ids = [],
                notification_type = 'custom',
                title,
                message,
                priority = 'normal',
                channels = ['in_app'],
                action_buttons = [],
                scheduled_for = null,
                metadata = {}
            } = req.body;

            const userId = req.user.id;

            if (!title || !message) {
                throw new AppError('Title and message are required', 400);
            }

            if (recipient_ids.length === 0) {
                throw new AppError('At least one recipient is required', 400);
            }

            const notificationData = {
                recipient_ids,
                notification_type,
                title,
                message,
                priority,
                channels,
                action_buttons,
                scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
                metadata,
                sent_by: userId
            };

            const result = await NotificationService.sendCustomNotification(
                notificationData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Notification sent successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification templates
     * GET /api/music/notifications/templates
     */
    static async getNotificationTemplates(req, res, next) {
        try {
            const {
                category = 'all',
                template_type = 'all',
                include_custom = true
            } = req.query;

            const userId = req.user.id;

            const templateOptions = {
                category,
                template_type,
                include_custom: include_custom === 'true',
                user_id: userId
            };

            const templates = await NotificationService.getNotificationTemplates(
                templateOptions
            );

            res.json({
                success: true,
                data: templates
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create notification template
     * POST /api/music/notifications/templates
     */
    static async createNotificationTemplate(req, res, next) {
        try {
            const {
                name,
                category = 'custom',
                title_template,
                message_template,
                default_channels = ['in_app'],
                default_priority = 'normal',
                variables = [],
                conditions = {}
            } = req.body;

            const userId = req.user.id;

            if (!name || !title_template || !message_template) {
                throw new AppError('Name, title template, and message template are required', 400);
            }

            const templateData = {
                name,
                category,
                title_template,
                message_template,
                default_channels,
                default_priority,
                variables,
                conditions,
                created_by: userId
            };

            const template = await NotificationService.createNotificationTemplate(
                templateData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Notification template created successfully',
                data: template
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update notification template
     * PUT /api/music/notifications/templates/:templateId
     */
    static async updateNotificationTemplate(req, res, next) {
        try {
            const { templateId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const result = await NotificationService.updateNotificationTemplate(
                templateId,
                updateData,
                userId
            );

            res.json({
                success: true,
                message: 'Notification template updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete notification template
     * DELETE /api/music/notifications/templates/:templateId
     */
    static async deleteNotificationTemplate(req, res, next) {
        try {
            const { templateId } = req.params;
            const userId = req.user.id;

            const result = await NotificationService.deleteNotificationTemplate(
                templateId,
                userId
            );

            res.json({
                success: true,
                message: 'Notification template deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification statistics
     * GET /api/music/notifications/statistics
     */
    static async getNotificationStatistics(req, res, next) {
        try {
            const {
                time_range = '30_days',
                group_by = 'day',
                include_engagement = true,
                category = 'all'
            } = req.query;

            const userId = req.user.id;

            const statsOptions = {
                time_range,
                group_by,
                include_engagement: include_engagement === 'true',
                category,
                user_id: userId
            };

            const statistics = await NotificationService.getNotificationStatistics(
                statsOptions
            );

            res.json({
                success: true,
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Subscribe to push notifications
     * POST /api/music/notifications/push/subscribe
     */
    static async subscribeToPush(req, res, next) {
        try {
            const {
                subscription,
                device_info = {},
                notification_categories = []
            } = req.body;

            const userId = req.user.id;

            if (!subscription) {
                throw new AppError('Push subscription data is required', 400);
            }

            const subscriptionData = {
                subscription,
                device_info: {
                    device_type: device_info.device_type || 'unknown',
                    device_name: device_info.device_name || null,
                    browser: device_info.browser || null,
                    os: device_info.os || null
                },
                notification_categories,
                user_id: userId
            };

            const result = await NotificationService.subscribeToPushNotifications(
                subscriptionData
            );

            res.status(201).json({
                success: true,
                message: 'Push notification subscription created',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unsubscribe from push notifications
     * DELETE /api/music/notifications/push/unsubscribe
     */
    static async unsubscribeFromPush(req, res, next) {
        try {
            const {
                subscription_id = null,
                endpoint = null
            } = req.body;

            const userId = req.user.id;

            if (!subscription_id && !endpoint) {
                throw new AppError('Subscription ID or endpoint is required', 400);
            }

            const unsubscribeData = {
                subscription_id,
                endpoint,
                user_id: userId
            };

            const result = await NotificationService.unsubscribeFromPushNotifications(
                unsubscribeData
            );

            res.json({
                success: true,
                message: 'Push notification subscription removed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Test notification delivery
     * POST /api/music/notifications/test
     */
    static async testNotificationDelivery(req, res, next) {
        try {
            const {
                notification_type = 'test',
                channels = ['in_app'],
                test_data = {}
            } = req.body;

            const userId = req.user.id;

            const testData = {
                notification_type,
                channels,
                test_data,
                recipient_id: userId,
                initiated_by: userId
            };

            const result = await NotificationService.testNotificationDelivery(
                testData
            );

            res.json({
                success: true,
                message: 'Test notification sent',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification delivery logs
     * GET /api/music/notifications/delivery-logs
     */
    static async getDeliveryLogs(req, res, next) {
        try {
            const {
                notification_id = null,
                status = 'all',
                channel = 'all',
                date_from = null,
                date_to = null,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const logOptions = {
                notification_id,
                status,
                channel,
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const logs = await NotificationService.getNotificationDeliveryLogs(
                logOptions
            );

            res.json({
                success: true,
                data: {
                    logs: logs.logs,
                    pagination: logs.pagination,
                    summary: logs.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Schedule notification batch
     * POST /api/music/notifications/batch/schedule
     */
    static async scheduleNotificationBatch(req, res, next) {
        try {
            const {
                notifications = [],
                schedule_for,
                batch_name = '',
                priority = 'normal',
                delivery_options = {}
            } = req.body;

            const userId = req.user.id;

            if (notifications.length === 0) {
                throw new AppError('At least one notification is required', 400);
            }

            if (!schedule_for) {
                throw new AppError('Schedule time is required', 400);
            }

            const batchData = {
                notifications,
                schedule_for: new Date(schedule_for),
                batch_name,
                priority,
                delivery_options: {
                    retry_failed: delivery_options.retry_failed !== false,
                    throttle_rate: delivery_options.throttle_rate || 100,
                    respect_quiet_hours: delivery_options.respect_quiet_hours !== false
                },
                scheduled_by: userId
            };

            const batch = await NotificationService.scheduleNotificationBatch(
                batchData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Notification batch scheduled successfully',
                data: batch
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get notification insights
     * GET /api/music/notifications/insights
     */
    static async getNotificationInsights(req, res, next) {
        try {
            const {
                time_range = '30_days',
                insight_type = 'engagement',
                include_recommendations = true
            } = req.query;

            const userId = req.user.id;

            const insightOptions = {
                time_range,
                insight_type,
                include_recommendations: include_recommendations === 'true',
                user_id: userId
            };

            const insights = await NotificationService.getNotificationInsights(
                insightOptions
            );

            res.json({
                success: true,
                data: insights
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationsController;
