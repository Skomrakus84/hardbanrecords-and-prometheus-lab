/**
 * Analytics Controller - Advanced Music Analytics REST API
 * Exposes comprehensive analytics and reporting features through REST endpoints
 * Provides sophisticated streaming data, revenue analytics, and performance insights
 * Integrates with analytics services and external data sources
 */

const AnalyticsService = require('../services/analytics.service.cjs');
const ReleaseService = require('../services/release.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class AnalyticsController {
    /**
     * Get streaming analytics
     * GET /api/music/analytics/streaming
     */
    static async getStreamingAnalytics(req, res, next) {
        try {
            const {
                release_id = null,
                track_id = null,
                artist_id = null,
                time_range = '30_days',
                group_by = 'day',
                platforms = [],
                territories = [],
                include_demographics = false,
                include_trends = true
            } = req.query;

            const userId = req.user.id;

            // Verify access if specific release/track is requested
            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const analyticsOptions = {
                release_id,
                track_id,
                artist_id,
                time_range,
                group_by,
                platforms: platforms.length > 0 ? platforms : [],
                territories: territories.length > 0 ? territories : [],
                include_demographics: include_demographics === 'true',
                include_trends: include_trends === 'true',
                user_id: userId
            };

            const analytics = await AnalyticsService.getStreamingAnalytics(
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
     * Get revenue analytics
     * GET /api/music/analytics/revenue
     */
    static async getRevenueAnalytics(req, res, next) {
        try {
            const {
                time_range = '12_months',
                breakdown_by = 'month',
                revenue_types = [],
                platforms = [],
                territories = [],
                include_projections = false,
                currency = 'USD'
            } = req.query;

            const userId = req.user.id;

            const revenueOptions = {
                time_range,
                breakdown_by,
                revenue_types: revenue_types.length > 0 ? revenue_types : ['streaming', 'downloads', 'sync'],
                platforms: platforms.length > 0 ? platforms : [],
                territories: territories.length > 0 ? territories : [],
                include_projections: include_projections === 'true',
                currency,
                user_id: userId
            };

            const revenue = await AnalyticsService.getRevenueAnalytics(
                revenueOptions
            );

            res.json({
                success: true,
                data: revenue
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get audience analytics
     * GET /api/music/analytics/audience
     */
    static async getAudienceAnalytics(req, res, next) {
        try {
            const {
                release_id = null,
                time_range = '90_days',
                demographic_breakdown = true,
                geographic_breakdown = true,
                behavioral_analysis = false,
                include_growth_metrics = true
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const audienceOptions = {
                release_id,
                time_range,
                demographic_breakdown: demographic_breakdown === 'true',
                geographic_breakdown: geographic_breakdown === 'true',
                behavioral_analysis: behavioral_analysis === 'true',
                include_growth_metrics: include_growth_metrics === 'true',
                user_id: userId
            };

            const audience = await AnalyticsService.getAudienceAnalytics(
                audienceOptions
            );

            res.json({
                success: true,
                data: audience
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get performance comparison
     * POST /api/music/analytics/compare
     */
    static async comparePerformance(req, res, next) {
        try {
            const {
                entities = [],
                comparison_type = 'releases',
                metrics = ['streams', 'revenue', 'engagement'],
                time_range = '30_days',
                benchmark_against = 'portfolio_average'
            } = req.body;

            const userId = req.user.id;

            if (entities.length === 0) {
                throw new AppError('At least one entity is required for comparison', 400);
            }

            const comparisonOptions = {
                entities,
                comparison_type,
                metrics,
                time_range,
                benchmark_against,
                user_id: userId
            };

            const comparison = await AnalyticsService.comparePerformance(
                comparisonOptions
            );

            res.json({
                success: true,
                message: 'Performance comparison completed',
                data: comparison
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get trending content
     * GET /api/music/analytics/trending
     */
    static async getTrendingContent(req, res, next) {
        try {
            const {
                content_type = 'releases',
                time_window = '7_days',
                territory = 'global',
                genre = null,
                limit = 20,
                include_growth_rate = true
            } = req.query;

            const userId = req.user.id;

            const trendingOptions = {
                content_type,
                time_window,
                territory,
                genre,
                limit: Math.min(parseInt(limit), 100),
                include_growth_rate: include_growth_rate === 'true',
                user_id: userId
            };

            const trending = await AnalyticsService.getTrendingContent(
                trendingOptions
            );

            res.json({
                success: true,
                data: trending
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate analytics report
     * POST /api/music/analytics/reports
     */
    static async generateReport(req, res, next) {
        try {
            const {
                report_type = 'comprehensive',
                entities = [],
                time_range = '30_days',
                metrics = [],
                format = 'json',
                include_charts = true,
                custom_filters = {}
            } = req.body;

            const userId = req.user.id;

            const reportOptions = {
                report_type,
                entities,
                time_range,
                metrics: metrics.length > 0 ? metrics : [
                    'streams', 'revenue', 'audience', 'geographic', 'platform_performance'
                ],
                format,
                include_charts: include_charts && format !== 'csv',
                custom_filters,
                generated_by: userId
            };

            const report = await AnalyticsService.generateAnalyticsReport(
                reportOptions
            );

            if (format === 'pdf' || format === 'excel') {
                res.setHeader('Content-Type', report.mime_type);
                res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
                res.send(report.content);
            } else if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
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
     * Get real-time analytics
     * GET /api/music/analytics/realtime
     */
    static async getRealtimeAnalytics(req, res, next) {
        try {
            const {
                metrics = ['current_listeners', 'streams_last_hour', 'top_tracks'],
                release_id = null,
                include_alerts = true
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const realtimeOptions = {
                metrics: metrics,
                release_id,
                include_alerts: include_alerts === 'true',
                user_id: userId
            };

            const realtime = await AnalyticsService.getRealtimeAnalytics(
                realtimeOptions
            );

            res.json({
                success: true,
                data: realtime
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get platform-specific analytics
     * GET /api/music/analytics/platforms/:platform
     */
    static async getPlatformAnalytics(req, res, next) {
        try {
            const { platform } = req.params;
            const {
                time_range = '30_days',
                metrics = 'all',
                breakdown_by = 'day',
                include_platform_insights = true
            } = req.query;

            const userId = req.user.id;

            const platformOptions = {
                platform,
                time_range,
                metrics: metrics === 'all' ? 
                    ['streams', 'saves', 'shares', 'playlist_adds', 'skip_rate'] : 
                    metrics.split(','),
                breakdown_by,
                include_platform_insights: include_platform_insights === 'true',
                user_id: userId
            };

            const analytics = await AnalyticsService.getPlatformSpecificAnalytics(
                platformOptions
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
     * Get predictive analytics
     * POST /api/music/analytics/predictions
     */
    static async getPredictiveAnalytics(req, res, next) {
        try {
            const {
                prediction_type = 'performance',
                entity_id,
                entity_type = 'release',
                time_horizon = '30_days',
                confidence_level = 0.8,
                include_scenarios = false
            } = req.body;

            const userId = req.user.id;

            if (!entity_id) {
                throw new AppError('Entity ID is required', 400);
            }

            const predictionOptions = {
                prediction_type,
                entity_id,
                entity_type,
                time_horizon,
                confidence_level: parseFloat(confidence_level),
                include_scenarios,
                user_id: userId
            };

            const predictions = await AnalyticsService.getPredictiveAnalytics(
                predictionOptions
            );

            res.json({
                success: true,
                message: 'Predictive analytics generated',
                data: predictions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get engagement metrics
     * GET /api/music/analytics/engagement
     */
    static async getEngagementMetrics(req, res, next) {
        try {
            const {
                content_id = null,
                content_type = 'release',
                time_range = '30_days',
                include_detailed_events = false,
                breakdown_by = 'day'
            } = req.query;

            const userId = req.user.id;

            const engagementOptions = {
                content_id,
                content_type,
                time_range,
                include_detailed_events: include_detailed_events === 'true',
                breakdown_by,
                user_id: userId
            };

            const engagement = await AnalyticsService.getEngagementMetrics(
                engagementOptions
            );

            res.json({
                success: true,
                data: engagement
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get geographic analytics
     * GET /api/music/analytics/geographic
     */
    static async getGeographicAnalytics(req, res, next) {
        try {
            const {
                time_range = '30_days',
                granularity = 'country',
                release_id = null,
                include_growth_rates = true,
                top_markets_limit = 20
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const geoOptions = {
                time_range,
                granularity,
                release_id,
                include_growth_rates: include_growth_rates === 'true',
                top_markets_limit: parseInt(top_markets_limit),
                user_id: userId
            };

            const geographic = await AnalyticsService.getGeographicAnalytics(
                geoOptions
            );

            res.json({
                success: true,
                data: geographic
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get playlist analytics
     * GET /api/music/analytics/playlists
     */
    static async getPlaylistAnalytics(req, res, next) {
        try {
            const {
                track_id = null,
                release_id = null,
                time_range = '30_days',
                include_playlist_details = true,
                platform = 'all'
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const playlistOptions = {
                track_id,
                release_id,
                time_range,
                include_playlist_details: include_playlist_details === 'true',
                platform,
                user_id: userId
            };

            const playlists = await AnalyticsService.getPlaylistAnalytics(
                playlistOptions
            );

            res.json({
                success: true,
                data: playlists
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Set up analytics alerts
     * POST /api/music/analytics/alerts
     */
    static async setupAlerts(req, res, next) {
        try {
            const {
                alert_type = 'threshold',
                entity_id,
                entity_type = 'release',
                metric = 'streams',
                threshold_value,
                condition = 'greater_than',
                notification_methods = ['email'],
                active = true
            } = req.body;

            const userId = req.user.id;

            if (!entity_id || !threshold_value) {
                throw new AppError('Entity ID and threshold value are required', 400);
            }

            const alertData = {
                alert_type,
                entity_id,
                entity_type,
                metric,
                threshold_value: parseFloat(threshold_value),
                condition,
                notification_methods,
                active,
                created_by: userId
            };

            const alert = await AnalyticsService.setupAnalyticsAlert(
                alertData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Analytics alert created successfully',
                data: alert
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get analytics dashboard data
     * GET /api/music/analytics/dashboard
     */
    static async getDashboardData(req, res, next) {
        try {
            const {
                time_range = '30_days',
                widgets = 'default',
                include_alerts = true,
                refresh_cache = false
            } = req.query;

            const userId = req.user.id;

            const dashboardOptions = {
                time_range,
                widgets: widgets === 'default' ? [
                    'overview_stats',
                    'recent_releases',
                    'top_tracks',
                    'revenue_trend',
                    'audience_growth',
                    'platform_breakdown'
                ] : widgets.split(','),
                include_alerts: include_alerts === 'true',
                refresh_cache: refresh_cache === 'true',
                user_id: userId
            };

            const dashboard = await AnalyticsService.getDashboardData(
                dashboardOptions
            );

            res.json({
                success: true,
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export analytics data
     * POST /api/music/analytics/export
     */
    static async exportData(req, res, next) {
        try {
            const {
                export_type = 'streaming_data',
                entities = [],
                time_range = '30_days',
                format = 'csv',
                include_metadata = true,
                compression = false
            } = req.body;

            const userId = req.user.id;

            const exportOptions = {
                export_type,
                entities,
                time_range,
                format,
                include_metadata,
                compression,
                exported_by: userId
            };

            const exportData = await AnalyticsService.exportAnalyticsData(
                exportOptions
            );

            res.setHeader('Content-Type', exportData.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
            
            if (compression) {
                res.setHeader('Content-Encoding', 'gzip');
            }
            
            res.send(exportData.content);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get analytics insights
     * GET /api/music/analytics/insights
     */
    static async getInsights(req, res, next) {
        try {
            const {
                insight_type = 'performance',
                entity_id = null,
                time_range = '30_days',
                include_recommendations = true,
                confidence_threshold = 0.7
            } = req.query;

            const userId = req.user.id;

            const insightOptions = {
                insight_type,
                entity_id,
                time_range,
                include_recommendations: include_recommendations === 'true',
                confidence_threshold: parseFloat(confidence_threshold),
                user_id: userId
            };

            const insights = await AnalyticsService.generateInsights(
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

module.exports = AnalyticsController;
