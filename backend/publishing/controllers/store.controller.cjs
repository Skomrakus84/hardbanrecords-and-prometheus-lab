/**
 * Publishing Store Controller - Store Integration Management API
 * Handles submission and monitoring of publications across all stores
 */

const PublishingStoreService = require('../services/store.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../../config/logger.cjs');

class PublishingStoreController {
    /**
     * Get available publishing stores
     */
    static async getStores(req, res) {
        try {
            const stores = await PublishingStoreService.getPublishingStores();

            res.json({
                success: true,
                data: stores
            });

        } catch (error) {
            logger.error('Error getting publishing stores:', error);
            throw error;
        }
    }

    /**
     * Submit publication to selected stores
     */
    static async submitToStores(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;
            const { storeIds, submissionData } = req.body;

            if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
                throw new AppError('Store IDs are required', 400);
            }

            if (!submissionData) {
                throw new AppError('Submission data is required', 400);
            }

            const result = await PublishingStoreService.submitToStores(
                publicationId,
                storeIds,
                submissionData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Publication submitted to stores',
                data: result
            });

        } catch (error) {
            logger.error('Error submitting to stores:', error);
            throw error;
        }
    }

    /**
     * Get submission status for publication
     */
    static async getSubmissionStatus(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;

            const status = await PublishingStoreService.getSubmissionStatus(
                publicationId,
                userId
            );

            res.json({
                success: true,
                data: status
            });

        } catch (error) {
            logger.error('Error getting submission status:', error);
            throw error;
        }
    }

    /**
     * Get store integration analytics
     */
    static async getStoreAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d', storeId } = req.query;

            const analytics = await PublishingStoreService.getStoreAnalytics(userId, {
                period,
                storeId
            });

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting store analytics:', error);
            throw error;
        }
    }

    /**
     * Update submission status (webhook/admin)
     */
    static async updateSubmissionStatus(req, res) {
        try {
            const { submissionId } = req.params;
            const statusData = req.body;

            const updatedSubmission = await PublishingStoreService.updateSubmissionStatus(
                submissionId,
                statusData
            );

            res.json({
                success: true,
                message: 'Submission status updated',
                data: updatedSubmission
            });

        } catch (error) {
            logger.error('Error updating submission status:', error);
            throw error;
        }
    }

    /**
     * Sync sales data from all stores (admin)
     */
    static async syncSalesData(req, res) {
        try {
            const result = await PublishingStoreService.syncSalesData();

            res.json({
                success: true,
                message: 'Sales data sync initiated',
                data: result
            });

        } catch (error) {
            logger.error('Error syncing sales data:', error);
            throw error;
        }
    }

    /**
     * Get submission history for user
     */
    static async getSubmissionHistory(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 20,
                status,
                storeId
            } = req.query;

            // This would be implemented as a separate service method
            const history = {
                submissions: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            };

            res.json({
                success: true,
                data: history.submissions,
                pagination: history.pagination
            });

        } catch (error) {
            logger.error('Error getting submission history:', error);
            throw error;
        }
    }

    /**
     * Retry failed submission
     */
    static async retrySubmission(req, res) {
        try {
            const { submissionId } = req.params;

            // Reset status to retry submission
            const result = await PublishingStoreService.updateSubmissionStatus(submissionId, {
                status: 'pending',
                errorMessage: null
            });

            res.json({
                success: true,
                message: 'Submission retry initiated',
                data: result
            });

        } catch (error) {
            logger.error('Error retrying submission:', error);
            throw error;
        }
    }

    /**
     * Cancel pending submission
     */
    static async cancelSubmission(req, res) {
        try {
            const { submissionId } = req.params;

            const result = await PublishingStoreService.updateSubmissionStatus(submissionId, {
                status: 'cancelled'
            });

            res.json({
                success: true,
                message: 'Submission cancelled',
                data: result
            });

        } catch (error) {
            logger.error('Error cancelling submission:', error);
            throw error;
        }
    }

    /**
     * Get store performance metrics
     */
    static async getStorePerformance(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            // Get analytics data
            const analytics = await PublishingStoreService.getStoreAnalytics(userId, {
                period
            });

            // Calculate performance metrics
            const performance = analytics.stores.map(store => ({
                storeName: store.storeName,
                approvalRate: store.totalSubmissions > 0
                    ? (store.approvedPublications / store.totalSubmissions * 100).toFixed(2)
                    : 0,
                averageRevenue: store.livePublications > 0
                    ? (store.totalRevenue / store.livePublications).toFixed(2)
                    : 0,
                processingTime: store.avgApprovalDays,
                successRate: store.totalSubmissions > 0
                    ? (store.livePublications / store.totalSubmissions * 100).toFixed(2)
                    : 0
            }));

            res.json({
                success: true,
                data: {
                    period,
                    storePerformance: performance,
                    overall: analytics.overall
                }
            });

        } catch (error) {
            logger.error('Error getting store performance:', error);
            throw error;
        }
    }
}

module.exports = PublishingStoreController;
