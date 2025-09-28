/**
 * Publishing Analytics Controller
 * Sales tracking, performance analytics, and reporting API
 */

const PublishingAnalyticsService = require('../services/analytics.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../../config/logger.cjs');

class PublishingAnalyticsController {
    /**
     * Get dashboard analytics
     */
    static async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            const analytics = await PublishingAnalyticsService.getDashboardAnalytics(
                userId,
                period
            );

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting dashboard analytics:', error);
            throw error;
        }
    }

    /**
     * Get sales analytics
     */
    static async getSalesAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const {
                period = '30d',
                publicationId,
                storeId,
                groupBy = 'day'
            } = req.query;

            const analytics = await PublishingAnalyticsService.getSalesAnalytics(userId, {
                period,
                publicationId,
                storeId,
                groupBy
            });

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting sales analytics:', error);
            throw error;
        }
    }

    /**
     * Get publication-specific analytics
     */
    static async getPublicationAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;

            const analytics = await PublishingAnalyticsService.getPublicationAnalytics(
                publicationId,
                userId
            );

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting publication analytics:', error);
            throw error;
        }
    }

    /**
     * Get geographic analytics
     */
    static async getGeographicAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d', publicationId } = req.query;

            const analytics = await PublishingAnalyticsService.getGeographicAnalytics(userId, {
                period,
                publicationId
            });

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting geographic analytics:', error);
            throw error;
        }
    }

    /**
     * Get revenue analytics
     */
    static async getRevenueAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d', groupBy = 'month' } = req.query;

            const analytics = await PublishingAnalyticsService.getRevenueAnalytics(userId, {
                period,
                groupBy
            });

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting revenue analytics:', error);
            throw error;
        }
    }

    /**
     * Generate and download analytics report
     */
    static async generateReport(req, res) {
        try {
            const userId = req.user.id;
            const {
                type = 'comprehensive',
                period = '30d',
                format = 'json'
            } = req.query;

            const report = await PublishingAnalyticsService.generateReport(userId, type, {
                period,
                format
            });

            // Set appropriate headers for download
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${type}-${period}.csv"`);
                return res.send(report.data.csvData);
            }

            // JSON response
            res.json({
                success: true,
                data: report
            });

        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    /**
     * Get real-time sales data
     */
    static async getRealTimeSales(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.query;

            // Get last 24 hours of sales data
            const analytics = await PublishingAnalyticsService.getSalesAnalytics(userId, {
                period: '1d',
                publicationId,
                groupBy: 'hour'
            });

            // Calculate real-time metrics
            const realTimeData = {
                last24Hours: analytics.data,
                currentHourSales: 0,
                currentHourRevenue: 0,
                trending: 'stable' // would calculate trend
            };

            // Get current hour data if available
            const currentHour = new Date().getHours();
            const currentHourData = analytics.data.find(item => {
                const itemHour = new Date(item.date).getHours();
                return itemHour === currentHour;
            });

            if (currentHourData) {
                realTimeData.currentHourSales = currentHourData.totalSales;
                realTimeData.currentHourRevenue = currentHourData.totalRevenue;
            }

            res.json({
                success: true,
                data: realTimeData
            });

        } catch (error) {
            logger.error('Error getting real-time sales:', error);
            throw error;
        }
    }

    /**
     * Get analytics comparison between periods
     */
    static async getComparison(req, res) {
        try {
            const userId = req.user.id;
            const {
                currentPeriod = '30d',
                comparisonPeriod = '30d',
                publicationId
            } = req.query;

            // Get analytics for both periods
            const [current, previous] = await Promise.all([
                PublishingAnalyticsService.getDashboardAnalytics(userId, currentPeriod),
                PublishingAnalyticsService.getDashboardAnalytics(userId, comparisonPeriod)
            ]);

            // Calculate percentage changes
            const comparison = {
                current: current.overview,
                previous: previous.overview,
                changes: {
                    salesChange: this.calculatePercentageChange(
                        current.overview.periodSales,
                        previous.overview.periodSales
                    ),
                    revenueChange: this.calculatePercentageChange(
                        current.overview.periodRevenue,
                        previous.overview.periodRevenue
                    ),
                    publicationsChange: this.calculatePercentageChange(
                        current.overview.periodPublications,
                        previous.overview.periodPublications
                    )
                }
            };

            res.json({
                success: true,
                data: comparison
            });

        } catch (error) {
            logger.error('Error getting analytics comparison:', error);
            throw error;
        }
    }

    /**
     * Get top performing content
     */
    static async getTopPerforming(req, res) {
        try {
            const userId = req.user.id;
            const {
                period = '30d',
                metric = 'revenue',
                limit = 10
            } = req.query;

            // This would be implemented as a separate service method
            const topContent = {
                publications: [],
                stores: [],
                categories: []
            };

            res.json({
                success: true,
                data: topContent
            });

        } catch (error) {
            logger.error('Error getting top performing content:', error);
            throw error;
        }
    }

    // Helper methods
    static calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(2);
    }
}

module.exports = PublishingAnalyticsController;
