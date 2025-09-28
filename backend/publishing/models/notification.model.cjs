/**
 * Notification Model - Advanced Notification Management System
 * Manages real-time notifications, alerts, and communication for publishing platform
 * Supports multiple channels: email, SMS, push, in-app, webhook
 * Provides notification templates, scheduling, delivery tracking, and analytics
 */

const { supabase } = require('../../../db.cjs');
const { AppError } = require('../../../middleware/errorHandler.cjs');
const { v4: uuidv4 } = require('uuid');

class NotificationModel {
    /**
     * Create new notification
     * @param {Object} notificationData - Notification information
     * @returns {Promise<Object>} Created notification
     */
    static async create(notificationData) {
        try {
            const {
                recipient_id,
                sender_id = null,
                type,
                title,
                message,
                channels = ['in_app'], // in_app, email, sms, push, webhook
                priority = 'normal', // low, normal, high, urgent
                category = 'general', // general, collaboration, publication, system, security
                action_url = null,
                action_data = {},
                template_id = null,
                template_variables = {},
                scheduled_for = null,
                expires_at = null,
                auto_delete = false,
                metadata = {},
                attachments = []
            } = notificationData;

            // Validation
            if (!recipient_id || !type || !title || !message) {
                throw new AppError('Recipient ID, type, title, and message are required', 400);
            }

            // Validate channels
            const validChannels = ['in_app', 'email', 'sms', 'push', 'webhook'];
            const invalidChannels = channels.filter(channel => !validChannels.includes(channel));
            if (invalidChannels.length > 0) {
                throw new AppError(`Invalid channels: ${invalidChannels.join(', ')}`, 400);
            }

            // Generate notification content
            const finalContent = template_id
                ? await this.renderTemplate(template_id, template_variables)
                : { title, message };

            const notification = {
                id: uuidv4(),
                recipient_id,
                sender_id,
                type,
                title: finalContent.title,
                message: finalContent.message,
                channels,
                priority,
                category,
                action_url,
                action_data,
                template_id,
                template_variables,
                status: scheduled_for ? 'scheduled' : 'pending',
                scheduled_for,
                expires_at,
                auto_delete,
                metadata: {
                    delivery_attempts: {},
                    delivery_status: {},
                    ...metadata
                },
                attachments,
                created_at: new Date(),
                updated_at: new Date(),
                sent_at: null,
                read_at: null,
                clicked_at: null,
                archived_at: null
            };

            const { data, error } = await supabase
                .from('notifications')
                .insert(notification)
                .select()
                .single();

            if (error) throw new AppError(`Failed to create notification: ${error.message}`, 500);

            // Send notification immediately if not scheduled
            if (!scheduled_for) {
                await this.processNotification(data.id);
            }

            // Log notification creation
            await this.logNotificationActivity(data.id, 'created', {
                recipient_id,
                sender_id,
                type,
                channels,
                priority
            });

            return data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create notification', 500);
        }
    }

    /**
     * Find notification by ID
     * @param {string} id - Notification ID
     * @returns {Promise<Object|null>} Notification data
     */
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    recipient:recipient_id (
                        id, email, full_name, profile
                    ),
                    sender:sender_id (
                        id, email, full_name, profile
                    ),
                    templates:template_id (
                        id, name, subject, content_html, content_text
                    )
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to fetch notification: ${error.message}`, 500);
            }

            return data;
        } catch (error) {
            console.error('Error finding notification:', error);
            throw error instanceof AppError ? error : new AppError('Failed to find notification', 500);
        }
    }

    /**
     * Get notifications for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of notifications
     */
    static async getByUser(userId, options = {}) {
        try {
            const {
                status = null,
                category = null,
                priority = null,
                type = null,
                unread_only = false,
                include_archived = false,
                limit = 50,
                offset = 0,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = options;

            let query = supabase
                .from('notifications')
                .select(`
                    id, type, title, message, channels, priority, category,
                    action_url, action_data, status, scheduled_for, expires_at,
                    created_at, sent_at, read_at, clicked_at, archived_at,
                    sender:sender_id (
                        id, full_name, profile
                    )
                `)
                .eq('recipient_id', userId);

            if (status) {
                query = query.eq('status', status);
            }

            if (category) {
                query = query.eq('category', category);
            }

            if (priority) {
                query = query.eq('priority', priority);
            }

            if (type) {
                query = query.eq('type', type);
            }

            if (unread_only) {
                query = query.is('read_at', null);
            }

            if (!include_archived) {
                query = query.is('archived_at', null);
            }

            // Filter out expired notifications
            query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

            query = query
                .order(sort_by, { ascending: sort_order === 'asc' })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                throw new AppError(`Failed to fetch user notifications: ${error.message}`, 500);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting user notifications:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get user notifications', 500);
        }
    }

    /**
     * Mark notification as read
     * @param {string} id - Notification ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated notification
     */
    static async markAsRead(id, userId) {
        try {
            const notification = await this.findById(id);
            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            if (notification.recipient_id !== userId) {
                throw new AppError('Unauthorized to mark this notification as read', 403);
            }

            if (notification.read_at) {
                return notification; // Already read
            }

            const { data, error } = await supabase
                .from('notifications')
                .update({
                    read_at: new Date(),
                    updated_at: new Date()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to mark notification as read: ${error.message}`, 500);
            }

            // Log read action
            await this.logNotificationActivity(id, 'read', {
                user_id: userId,
                read_at: new Date()
            });

            return data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error instanceof AppError ? error : new AppError('Failed to mark notification as read', 500);
        }
    }

    /**
     * Mark multiple notifications as read
     * @param {Array} ids - Notification IDs
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Updated notifications
     */
    static async markMultipleAsRead(ids, userId) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new AppError('Invalid notification IDs', 400);
            }

            const { data, error } = await supabase
                .from('notifications')
                .update({
                    read_at: new Date(),
                    updated_at: new Date()
                })
                .eq('recipient_id', userId)
                .in('id', ids)
                .is('read_at', null)
                .select();

            if (error) {
                throw new AppError(`Failed to mark notifications as read: ${error.message}`, 500);
            }

            // Log bulk read action
            await this.logNotificationActivity(null, 'bulk_read', {
                user_id: userId,
                notification_ids: ids,
                count: data?.length || 0
            });

            return data || [];
        } catch (error) {
            console.error('Error marking multiple notifications as read:', error);
            throw error instanceof AppError ? error : new AppError('Failed to mark notifications as read', 500);
        }
    }

    /**
     * Track notification click
     * @param {string} id - Notification ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated notification
     */
    static async trackClick(id, userId) {
        try {
            const notification = await this.findById(id);
            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            if (notification.recipient_id !== userId) {
                throw new AppError('Unauthorized to track this notification', 403);
            }

            const updates = {
                clicked_at: new Date(),
                updated_at: new Date()
            };

            // Auto-mark as read if not already read
            if (!notification.read_at) {
                updates.read_at = new Date();
            }

            const { data, error } = await supabase
                .from('notifications')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to track notification click: ${error.message}`, 500);
            }

            // Log click action
            await this.logNotificationActivity(id, 'clicked', {
                user_id: userId,
                clicked_at: new Date(),
                action_url: notification.action_url
            });

            return data;
        } catch (error) {
            console.error('Error tracking notification click:', error);
            throw error instanceof AppError ? error : new AppError('Failed to track notification click', 500);
        }
    }

    /**
     * Archive notification
     * @param {string} id - Notification ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated notification
     */
    static async archive(id, userId) {
        try {
            const notification = await this.findById(id);
            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            if (notification.recipient_id !== userId) {
                throw new AppError('Unauthorized to archive this notification', 403);
            }

            const { data, error } = await supabase
                .from('notifications')
                .update({
                    archived_at: new Date(),
                    updated_at: new Date()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to archive notification: ${error.message}`, 500);
            }

            // Log archive action
            await this.logNotificationActivity(id, 'archived', {
                user_id: userId,
                archived_at: new Date()
            });

            return data;
        } catch (error) {
            console.error('Error archiving notification:', error);
            throw error instanceof AppError ? error : new AppError('Failed to archive notification', 500);
        }
    }

    /**
     * Delete notification
     * @param {string} id - Notification ID
     * @param {string} userId - User ID (recipient or sender)
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id, userId) {
        try {
            const notification = await this.findById(id);
            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            // Only recipient or sender can delete
            if (notification.recipient_id !== userId && notification.sender_id !== userId) {
                throw new AppError('Unauthorized to delete this notification', 403);
            }

            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) {
                throw new AppError(`Failed to delete notification: ${error.message}`, 500);
            }

            // Log deletion
            await this.logNotificationActivity(id, 'deleted', {
                deleted_by: userId,
                notification_type: notification.type
            });

            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete notification', 500);
        }
    }

    /**
     * Get user notification statistics
     * @param {string} userId - User ID
     * @param {Object} options - Options
     * @returns {Promise<Object>} Notification statistics
     */
    static async getUserStats(userId, options = {}) {
        try {
            const { time_range = '30_days' } = options;

            // Get time filter
            const timeFilter = this.getTimeRangeFilter(time_range);

            let query = supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', userId);

            if (timeFilter) {
                query = query.gte('created_at', timeFilter.toISOString());
            }

            const { data: notifications, error } = await query;

            if (error) {
                throw new AppError(`Failed to fetch notification stats: ${error.message}`, 500);
            }

            const stats = {
                total: notifications.length,
                unread: notifications.filter(n => !n.read_at).length,
                read: notifications.filter(n => n.read_at).length,
                archived: notifications.filter(n => n.archived_at).length,
                clicked: notifications.filter(n => n.clicked_at).length,
                by_priority: this.groupBy(notifications, 'priority'),
                by_category: this.groupBy(notifications, 'category'),
                by_type: this.groupBy(notifications, 'type'),
                by_status: this.groupBy(notifications, 'status'),
                engagement_rate: notifications.length > 0 
                    ? (notifications.filter(n => n.clicked_at).length / notifications.length * 100).toFixed(2)
                    : 0,
                read_rate: notifications.length > 0
                    ? (notifications.filter(n => n.read_at).length / notifications.length * 100).toFixed(2)
                    : 0,
                recent_activity: this.getRecentActivity(notifications, 7) // Last 7 days
            };

            return stats;
        } catch (error) {
            console.error('Error getting user notification stats:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get notification stats', 500);
        }
    }

    /**
     * Send bulk notifications
     * @param {Array} recipients - Array of recipient IDs
     * @param {Object} notificationData - Notification template data
     * @param {Object} options - Bulk send options
     * @returns {Promise<Object>} Bulk send result
     */
    static async sendBulk(recipients, notificationData, options = {}) {
        try {
            const {
                batch_size = 100,
                delay_between_batches = 1000, // ms
                personalize = false
            } = options;

            if (!Array.isArray(recipients) || recipients.length === 0) {
                throw new AppError('Recipients array is required and cannot be empty', 400);
            }

            const bulkId = uuidv4();
            const results = {
                bulk_id: bulkId,
                total_recipients: recipients.length,
                successful: 0,
                failed: 0,
                notifications: [],
                errors: []
            };

            // Process in batches
            for (let i = 0; i < recipients.length; i += batch_size) {
                const batch = recipients.slice(i, i + batch_size);
                
                const batchPromises = batch.map(async (recipientId) => {
                    try {
                        let personalizedData = { ...notificationData };
                        
                        if (personalize) {
                            personalizedData = await this.personalizeNotification(recipientId, notificationData);
                        }

                        const notification = await this.create({
                            ...personalizedData,
                            recipient_id: recipientId,
                            metadata: {
                                ...personalizedData.metadata,
                                bulk_id: bulkId,
                                batch_number: Math.floor(i / batch_size) + 1
                            }
                        });

                        results.notifications.push(notification);
                        results.successful++;

                        return notification;
                    } catch (error) {
                        results.failed++;
                        results.errors.push({
                            recipient_id: recipientId,
                            error: error.message
                        });
                        console.error(`Failed to send notification to ${recipientId}:`, error);
                        return null;
                    }
                });

                await Promise.all(batchPromises);

                // Delay between batches
                if (i + batch_size < recipients.length && delay_between_batches > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay_between_batches));
                }
            }

            // Log bulk send
            await this.logNotificationActivity(null, 'bulk_send', {
                bulk_id: bulkId,
                total_recipients: recipients.length,
                successful: results.successful,
                failed: results.failed,
                notification_type: notificationData.type
            });

            return results;
        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            throw error instanceof AppError ? error : new AppError('Failed to send bulk notifications', 500);
        }
    }

    /**
     * Process scheduled notifications
     * @returns {Promise<Object>} Processing result
     */
    static async processScheduledNotifications() {
        try {
            const now = new Date();

            // Get notifications scheduled for now or earlier
            const { data: scheduledNotifications, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('status', 'scheduled')
                .lte('scheduled_for', now.toISOString())
                .order('scheduled_for', { ascending: true });

            if (error) {
                throw new AppError(`Failed to fetch scheduled notifications: ${error.message}`, 500);
            }

            const results = {
                total_processed: 0,
                successful: 0,
                failed: 0,
                errors: []
            };

            for (const notification of scheduledNotifications) {
                try {
                    await this.processNotification(notification.id);
                    results.successful++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        notification_id: notification.id,
                        error: error.message
                    });
                    console.error(`Failed to process notification ${notification.id}:`, error);
                }
                results.total_processed++;
            }

            return results;
        } catch (error) {
            console.error('Error processing scheduled notifications:', error);
            throw error instanceof AppError ? error : new AppError('Failed to process scheduled notifications', 500);
        }
    }

    /**
     * Clean up expired notifications
     * @returns {Promise<Object>} Cleanup result
     */
    static async cleanupExpiredNotifications() {
        try {
            const now = new Date();

            // Delete expired notifications marked for auto-delete
            const { data: deletedNotifications, error: deleteError } = await supabase
                .from('notifications')
                .delete()
                .eq('auto_delete', true)
                .lt('expires_at', now.toISOString())
                .select('id, type, recipient_id');

            if (deleteError) {
                throw new AppError(`Failed to delete expired notifications: ${deleteError.message}`, 500);
            }

            // Archive expired notifications not marked for auto-delete
            const { data: archivedNotifications, error: archiveError } = await supabase
                .from('notifications')
                .update({
                    archived_at: now,
                    updated_at: now
                })
                .eq('auto_delete', false)
                .lt('expires_at', now.toISOString())
                .is('archived_at', null)
                .select('id, type, recipient_id');

            if (archiveError) {
                throw new AppError(`Failed to archive expired notifications: ${archiveError.message}`, 500);
            }

            const result = {
                deleted_count: deletedNotifications?.length || 0,
                archived_count: archivedNotifications?.length || 0,
                total_cleaned: (deletedNotifications?.length || 0) + (archivedNotifications?.length || 0)
            };

            // Log cleanup
            await this.logNotificationActivity(null, 'cleanup', {
                deleted_count: result.deleted_count,
                archived_count: result.archived_count,
                cleanup_date: now
            });

            return result;
        } catch (error) {
            console.error('Error cleaning up expired notifications:', error);
            throw error instanceof AppError ? error : new AppError('Failed to cleanup expired notifications', 500);
        }
    }

    // Helper Methods

    /**
     * Process individual notification (send through channels)
     */
    static async processNotification(notificationId) {
        try {
            const notification = await this.findById(notificationId);
            if (!notification) {
                throw new AppError('Notification not found', 404);
            }

            const deliveryResults = {};

            // Process each channel
            for (const channel of notification.channels) {
                try {
                    const result = await this.sendToChannel(notification, channel);
                    deliveryResults[channel] = {
                        status: 'success',
                        sent_at: new Date(),
                        delivery_id: result.delivery_id,
                        response: result.response
                    };
                } catch (error) {
                    deliveryResults[channel] = {
                        status: 'failed',
                        error: error.message,
                        attempted_at: new Date()
                    };
                }
            }

            // Update notification status
            const allSuccessful = Object.values(deliveryResults).every(r => r.status === 'success');
            const anySuccessful = Object.values(deliveryResults).some(r => r.status === 'success');

            const status = allSuccessful ? 'sent' : (anySuccessful ? 'partially_sent' : 'failed');

            await supabase
                .from('notifications')
                .update({
                    status,
                    sent_at: anySuccessful ? new Date() : null,
                    metadata: {
                        ...notification.metadata,
                        delivery_status: deliveryResults
                    },
                    updated_at: new Date()
                })
                .eq('id', notificationId);

            // Log processing result
            await this.logNotificationActivity(notificationId, 'processed', {
                delivery_results: deliveryResults,
                final_status: status
            });

            return deliveryResults;
        } catch (error) {
            console.error('Error processing notification:', error);
            throw error;
        }
    }

    /**
     * Send notification to specific channel
     */
    static async sendToChannel(notification, channel) {
        // Implementation would integrate with various notification services
        // This is a placeholder that simulates sending
        console.log(`Sending notification ${notification.id} via ${channel}`);
        
        switch (channel) {
            case 'email':
                return await this.sendEmail(notification);
            case 'sms':
                return await this.sendSMS(notification);
            case 'push':
                return await this.sendPushNotification(notification);
            case 'webhook':
                return await this.sendWebhook(notification);
            case 'in_app':
                return { delivery_id: uuidv4(), response: 'In-app notification stored' };
            default:
                throw new Error(`Unsupported notification channel: ${channel}`);
        }
    }

    /**
     * Send email notification
     */
    static async sendEmail(notification) {
        // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
        console.log(`Sending email to ${notification.recipient.email}`);
        return { delivery_id: uuidv4(), response: 'Email sent successfully' };
    }

    /**
     * Send SMS notification
     */
    static async sendSMS(notification) {
        // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
        console.log(`Sending SMS to recipient ${notification.recipient_id}`);
        return { delivery_id: uuidv4(), response: 'SMS sent successfully' };
    }

    /**
     * Send push notification
     */
    static async sendPushNotification(notification) {
        // Implementation would integrate with push service (FCM, APNS, etc.)
        console.log(`Sending push notification to ${notification.recipient_id}`);
        return { delivery_id: uuidv4(), response: 'Push notification sent successfully' };
    }

    /**
     * Send webhook notification
     */
    static async sendWebhook(notification) {
        // Implementation would send HTTP request to webhook URL
        console.log(`Sending webhook for notification ${notification.id}`);
        return { delivery_id: uuidv4(), response: 'Webhook sent successfully' };
    }

    /**
     * Render notification template
     */
    static async renderTemplate(templateId, variables) {
        // Implementation would fetch template and render with variables
        console.log(`Rendering template ${templateId} with ${Object.keys(variables).length} variables`);
        return {
            title: 'Rendered Title',
            message: 'Rendered Message'
        };
    }

    /**
     * Personalize notification for specific user
     */
    static async personalizeNotification(recipientId, notificationData) {
        // Implementation would fetch user data and personalize content
        console.log(`Personalizing notification for user ${recipientId}`);
        return notificationData;
    }

    /**
     * Helper methods for statistics
     */
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'unknown';
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    static getRecentActivity(notifications, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return notifications
            .filter(n => new Date(n.created_at) >= cutoff)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
    }

    static getTimeRangeFilter(timeRange) {
        const now = new Date();
        const ranges = {
            '7_days': new Date(now.setDate(now.getDate() - 7)),
            '30_days': new Date(now.setDate(now.getDate() - 30)),
            '90_days': new Date(now.setDate(now.getDate() - 90)),
            '1_year': new Date(now.setFullYear(now.getFullYear() - 1))
        };
        return ranges[timeRange];
    }

    /**
     * Log notification activity
     */
    static async logNotificationActivity(notificationId, activityType, metadata = {}) {
        try {
            await supabase
                .from('notification_activities')
                .insert({
                    id: uuidv4(),
                    notification_id: notificationId,
                    activity_type: activityType,
                    metadata,
                    created_at: new Date()
                });
        } catch (error) {
            console.error('Error logging notification activity:', error);
        }
    }
}

module.exports = NotificationModel;
