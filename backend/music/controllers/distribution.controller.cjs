/**
 * Distribution Controller - Advanced Music Distribution REST API
 * Exposes comprehensive music distribution features through REST endpoints
 * Provides sophisticated multi-platform distribution, status tracking, and analytics
 * Integrates with Distribution Service and streaming platform APIs
 */

const DistributionService = require('../services/distribution.service.cjs');
const ReleaseService = require('../services/release.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class DistributionController {
    /**
     * Submit release for distribution
     * POST /api/music/distribution/submit
     */
    static async submitDistribution(req, res, next) {
        try {
            const {
                release_id,
                target_platforms = [],
                distribution_type = 'standard',
                release_date = null,
                pricing_strategy = {},
                metadata_overrides = {},
                territorial_restrictions = []
            } = req.body;

            const userId = req.user.id;

            if (!release_id) {
                throw new AppError('Release ID is required', 400);
            }

            if (target_platforms.length === 0) {
                throw new AppError('At least one target platform is required', 400);
            }

            // Verify user has distribution permissions
            const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to release', 403);
            }

            const distributionData = {
                release_id,
                target_platforms,
                distribution_type,
                release_date: release_date ? new Date(release_date) : null,
                pricing_strategy: {
                    model: pricing_strategy.model || 'streaming',
                    price_per_track: pricing_strategy.price_per_track || null,
                    price_per_album: pricing_strategy.price_per_album || null,
                    currency: pricing_strategy.currency || 'USD',
                    territories: pricing_strategy.territories || []
                },
                metadata_overrides,
                territorial_restrictions,
                submitted_by: userId
            };

            const result = await DistributionService.submitForDistribution(
                distributionData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Distribution submission completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get distribution status
     * GET /api/music/distribution/status/:releaseId
     */
    static async getDistributionStatus(req, res, next) {
        try {
            const { releaseId } = req.params;
            const {
                include_platforms = true,
                include_analytics = false,
                include_errors = true,
                detailed = false
            } = req.query;

            const userId = req.user.id;

            // Verify access to release
            const hasAccess = await ReleaseService.verifyUserAccess(releaseId, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to release', 403);
            }

            const options = {
                include_platforms: include_platforms === 'true',
                include_analytics: include_analytics === 'true',
                include_errors: include_errors === 'true',
                detailed: detailed === 'true'
            };

            const status = await DistributionService.getDistributionStatus(
                releaseId,
                options
            );

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update distribution settings
     * PUT /api/music/distribution/:distributionId
     */
    static async updateDistribution(req, res, next) {
        try {
            const { distributionId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                apply_immediately = false,
                notify_platforms = true,
                reason = ''
            } = req.query;

            const updateOptions = {
                apply_immediately: apply_immediately === 'true',
                notify_platforms: notify_platforms === 'true',
                reason,
                updated_by: userId
            };

            const result = await DistributionService.updateDistribution(
                distributionId,
                updateData,
                updateOptions
            );

            res.json({
                success: true,
                message: 'Distribution updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel distribution
     * DELETE /api/music/distribution/:distributionId
     */
    static async cancelDistribution(req, res, next) {
        try {
            const { distributionId } = req.params;
            const {
                cancellation_reason = '',
                immediate = false,
                notify_platforms = true,
                refund_processing = false
            } = req.body;

            const userId = req.user.id;

            const cancellationData = {
                cancellation_reason,
                immediate,
                notify_platforms,
                refund_processing,
                cancelled_by: userId
            };

            const result = await DistributionService.cancelDistribution(
                distributionId,
                cancellationData
            );

            res.json({
                success: true,
                message: 'Distribution cancelled successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get platform availability
     * GET /api/music/distribution/platforms
     */
    static async getPlatformAvailability(req, res, next) {
        try {
            const {
                territory = 'global',
                content_type = 'all',
                include_requirements = false,
                include_pricing = false
            } = req.query;

            const options = {
                territory,
                content_type,
                include_requirements: include_requirements === 'true',
                include_pricing: include_pricing === 'true'
            };

            const platforms = await DistributionService.getPlatformAvailability(options);

            res.json({
                success: true,
                data: platforms
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sync platform metadata
     * POST /api/music/distribution/sync-metadata
     */
    static async syncMetadata(req, res, next) {
        try {
            const {
                distribution_id,
                platforms = [],
                metadata_fields = 'all',
                force_update = false,
                preview_changes = false
            } = req.body;

            const userId = req.user.id;

            if (!distribution_id) {
                throw new AppError('Distribution ID is required', 400);
            }

            const syncData = {
                distribution_id,
                platforms,
                metadata_fields,
                force_update,
                preview_changes,
                synced_by: userId
            };

            const result = await DistributionService.syncPlatformMetadata(
                syncData,
                userId
            );

            res.json({
                success: true,
                message: 'Metadata sync completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get distribution analytics
     * GET /api/music/distribution/analytics
     */
    static async getAnalytics(req, res, next) {
        try {
            const {
                release_id = null,
                distribution_id = null,
                time_range = '30_days',
                metrics = 'all',
                group_by = 'platform',
                include_trends = false
            } = req.query;

            const userId = req.user.id;

            if (!release_id && !distribution_id) {
                throw new AppError('Either release_id or distribution_id is required', 400);
            }

            // Verify access
            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const analyticsOptions = {
                release_id,
                distribution_id,
                time_range,
                metrics: metrics === 'all' ? 
                    ['streams', 'downloads', 'revenue', 'territories', 'platforms'] : 
                    metrics.split(','),
                group_by,
                include_trends: include_trends === 'true',
                user_id: userId
            };

            const analytics = await DistributionService.getDistributionAnalytics(
                analyticsOptions
            );

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Batch distribution operations
     * POST /api/music/distribution/batch
     */
    static async batchOperations(req, res, next) {
        try {
            const {
                operation_type = 'submit',
                release_ids = [],
                common_settings = {},
                individual_settings = {},
                validation_mode = 'strict'
            } = req.body;

            const userId = req.user.id;

            if (release_ids.length === 0) {
                throw new AppError('Release IDs are required', 400);
            }

            const batchData = {
                operation_type,
                release_ids,
                common_settings,
                individual_settings,
                validation_mode,
                initiated_by: userId
            };

            const result = await DistributionService.batchDistributionOperations(
                batchData,
                userId
            );

            res.json({
                success: true,
                message: 'Batch distribution operations completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get delivery status
     * GET /api/music/distribution/delivery/:distributionId
     */
    static async getDeliveryStatus(req, res, next) {
        try {
            const { distributionId } = req.params;
            const {
                include_logs = false,
                include_errors = true,
                platform = 'all'
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_logs: include_logs === 'true',
                include_errors: include_errors === 'true',
                platform
            };

            const deliveryStatus = await DistributionService.getDeliveryStatus(
                distributionId,
                options,
                userId
            );

            res.json({
                success: true,
                data: deliveryStatus
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate release for distribution
     * POST /api/music/distribution/validate
     */
    static async validateRelease(req, res, next) {
        try {
            const {
                release_id,
                target_platforms = [],
                validation_level = 'standard',
                include_warnings = true,
                auto_fix = false
            } = req.body;

            const userId = req.user.id;

            if (!release_id) {
                throw new AppError('Release ID is required', 400);
            }

            // Verify access to release
            const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to release', 403);
            }

            const validationData = {
                release_id,
                target_platforms,
                validation_level,
                include_warnings,
                auto_fix,
                validated_by: userId
            };

            const validation = await DistributionService.validateReleaseForDistribution(
                validationData,
                userId
            );

            res.json({
                success: true,
                message: 'Release validation completed',
                data: validation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate distribution report
     * GET /api/music/distribution/reports
     */
    static async generateReport(req, res, next) {
        try {
            const {
                report_type = 'summary',
                date_from = null,
                date_to = null,
                release_ids = [],
                platforms = [],
                format = 'json',
                include_charts = false
            } = req.query;

            const userId = req.user.id;

            const reportOptions = {
                report_type,
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                release_ids: release_ids.length > 0 ? release_ids : [],
                platforms: platforms.length > 0 ? platforms : [],
                format,
                include_charts: include_charts === 'true',
                user_id: userId
            };

            const report = await DistributionService.generateDistributionReport(
                reportOptions
            );

            if (format === 'pdf' || format === 'excel') {
                res.setHeader('Content-Type', report.mime_type);
                res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
                res.send(report.content);
            } else {
                res.json({
                    success: true,
                    data: report
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handle platform webhook
     * POST /api/music/distribution/webhook/:platform
     */
    static async handleWebhook(req, res, next) {
        try {
            const { platform } = req.params;
            const webhookData = req.body;
            const signature = req.get('X-Signature') || req.get('X-Hub-Signature');

            const processingOptions = {
                platform,
                webhook_data: webhookData,
                signature,
                timestamp: new Date(),
                source_ip: req.ip
            };

            const result = await DistributionService.processWebhook(processingOptions);

            res.json({
                success: true,
                message: 'Webhook processed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Schedule distribution
     * POST /api/music/distribution/schedule
     */
    static async scheduleDistribution(req, res, next) {
        try {
            const {
                release_id,
                distribution_settings = {},
                scheduled_date,
                timezone = 'UTC',
                notification_settings = {}
            } = req.body;

            const userId = req.user.id;

            if (!release_id || !scheduled_date) {
                throw new AppError('Release ID and scheduled date are required', 400);
            }

            // Verify access to release
            const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to release', 403);
            }

            const scheduleData = {
                release_id,
                distribution_settings,
                scheduled_date: new Date(scheduled_date),
                timezone,
                notification_settings: {
                    notify_on_completion: notification_settings.notify_on_completion || true,
                    notify_on_errors: notification_settings.notify_on_errors || true,
                    notification_methods: notification_settings.notification_methods || ['email']
                },
                scheduled_by: userId
            };

            const result = await DistributionService.scheduleDistribution(
                scheduleData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Distribution scheduled successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get platform requirements
     * GET /api/music/distribution/requirements/:platform
     */
    static async getPlatformRequirements(req, res, next) {
        try {
            const { platform } = req.params;
            const {
                content_type = 'music',
                territory = 'global',
                detailed = true
            } = req.query;

            const options = {
                platform,
                content_type,
                territory,
                detailed: detailed === 'true'
            };

            const requirements = await DistributionService.getPlatformRequirements(options);

            res.json({
                success: true,
                data: requirements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retry failed distribution
     * POST /api/music/distribution/:distributionId/retry
     */
    static async retryDistribution(req, res, next) {
        try {
            const { distributionId } = req.params;
            const {
                retry_options = {},
                fix_issues = true,
                platforms = []
            } = req.body;

            const userId = req.user.id;

            const retryData = {
                distribution_id: distributionId,
                retry_options: {
                    max_attempts: retry_options.max_attempts || 3,
                    delay_between_attempts: retry_options.delay_between_attempts || 300000, // 5 minutes
                    escalate_on_failure: retry_options.escalate_on_failure || true
                },
                fix_issues,
                platforms,
                retried_by: userId
            };

            const result = await DistributionService.retryFailedDistribution(
                retryData,
                userId
            );

            res.json({
                success: true,
                message: 'Distribution retry initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DistributionController;
