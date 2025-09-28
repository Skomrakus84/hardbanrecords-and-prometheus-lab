/**
 * Payout Controller - Complete Payout Management API
 * Handles payout requests, processing, and payment methods
 */

const PayoutService = require('../services/payout.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../config/logger.cjs');

class PayoutController {
    /**
     * Request a new payout
     */
    static async requestPayout(req, res) {
        try {
            const userId = req.user.id;
            const {
                amount,
                currency,
                paymentMethod,
                paymentDetails,
                includeStatements
            } = req.body;

            // Validate amount
            if (!amount || amount <= 0) {
                throw new AppError('Invalid amount', 400);
            }

            // Check minimum payout amount
            const minimumAmount = await PayoutService.getMinimumPayoutAmount(currency);
            if (amount < minimumAmount) {
                throw new AppError(`Minimum payout amount for ${currency} is ${minimumAmount}`, 400);
            }

            const payout = await PayoutService.requestPayout({
                userId,
                amount,
                currency: currency || 'USD',
                paymentMethod,
                paymentDetails,
                includeStatements
            });

            res.status(201).json({
                success: true,
                message: 'Payout request created successfully',
                data: payout
            });

        } catch (error) {
            logger.error('Error requesting payout:', error);
            throw error;
        }
    }

    /**
     * Get user's payouts
     */
    static async getPayouts(req, res) {
        try {
            const userId = req.user.id;
            const {
                status,
                currency,
                page = 1,
                limit = 20
            } = req.query;

            const options = {
                userId,
                status,
                currency,
                pagination: {
                    page: parseInt(page),
                    limit: Math.min(parseInt(limit), 100) // Max 100 per page
                }
            };

            const result = await PayoutService.getPayouts(options);

            res.json({
                success: true,
                data: result.payouts,
                pagination: result.pagination
            });

        } catch (error) {
            logger.error('Error getting payouts:', error);
            throw error;
        }
    }

    /**
     * Get specific payout by ID
     */
    static async getPayoutById(req, res) {
        try {
            const userId = req.user.id;
            const { payoutId } = req.params;

            const payout = await PayoutService.getPayoutById(payoutId, userId);

            if (!payout) {
                throw new AppError('Payout not found', 404);
            }

            res.json({
                success: true,
                data: payout
            });

        } catch (error) {
            logger.error('Error getting payout by ID:', error);
            throw error;
        }
    }

    /**
     * Cancel payout
     */
    static async cancelPayout(req, res) {
        try {
            const userId = req.user.id;
            const { payoutId } = req.params;

            const cancelledPayout = await PayoutService.cancelPayout(payoutId, userId);

            res.json({
                success: true,
                message: 'Payout cancelled successfully',
                data: cancelledPayout
            });

        } catch (error) {
            logger.error('Error cancelling payout:', error);
            throw error;
        }
    }

    /**
     * Get user's balance information
     */
    static async getBalance(req, res) {
        try {
            const userId = req.user.id;
            const { currency = 'USD' } = req.query;

            const balance = await PayoutService.getAvailableBalance(userId, currency);

            res.json({
                success: true,
                data: balance
            });

        } catch (error) {
            logger.error('Error getting balance:', error);
            throw error;
        }
    }

    /**
     * Get payout statistics
     */
    static async getPayoutStatistics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '1y' } = req.query;

            const stats = await PayoutService.getPayoutStatistics(userId, period);

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            logger.error('Error getting payout statistics:', error);
            throw error;
        }
    }

    /**
     * Get supported payment methods
     */
    static async getPaymentMethods(req, res) {
        try {
            const paymentMethods = PayoutService.getSupportedPaymentMethods();

            res.json({
                success: true,
                data: paymentMethods
            });

        } catch (error) {
            logger.error('Error getting payment methods:', error);
            throw error;
        }
    }

    /**
     * Get minimum payout amount for currency
     */
    static async getMinimumAmount(req, res) {
        try {
            const { currency = 'USD' } = req.query;
            const minimumAmount = await PayoutService.getMinimumPayoutAmount(currency);

            res.json({
                success: true,
                data: {
                    currency,
                    minimumAmount
                }
            });

        } catch (error) {
            logger.error('Error getting minimum amount:', error);
            throw error;
        }
    }

    // Admin endpoints
    /**
     * Get all pending payouts (admin only)
     */
    static async getPendingPayouts(req, res) {
        try {
            const {
                currency,
                page = 1,
                limit = 50
            } = req.query;

            // Get all pending payouts for admin review
            const result = await PayoutService.getPayouts({
                userId: null, // Admin can see all
                status: 'pending',
                currency,
                pagination: {
                    page: parseInt(page),
                    limit: Math.min(parseInt(limit), 100)
                }
            });

            res.json({
                success: true,
                data: result.payouts,
                pagination: result.pagination
            });

        } catch (error) {
            logger.error('Error getting pending payouts:', error);
            throw error;
        }
    }

    /**
     * Process payout (admin only)
     */
    static async processPayout(req, res) {
        try {
            const adminId = req.user.id;
            const { payoutId } = req.params;
            const { paymentReference } = req.body;

            const processedPayout = await PayoutService.processPayout(
                payoutId,
                adminId,
                paymentReference
            );

            res.json({
                success: true,
                message: 'Payout processing started',
                data: processedPayout
            });

        } catch (error) {
            logger.error('Error processing payout:', error);
            throw error;
        }
    }

    /**
     * Complete payout (admin only)
     */
    static async completePayout(req, res) {
        try {
            const adminId = req.user.id;
            const { payoutId } = req.params;
            const { transactionId } = req.body;

            if (!transactionId) {
                throw new AppError('Transaction ID is required', 400);
            }

            const completedPayout = await PayoutService.completePayout(
                payoutId,
                adminId,
                transactionId
            );

            res.json({
                success: true,
                message: 'Payout completed successfully',
                data: completedPayout
            });

        } catch (error) {
            logger.error('Error completing payout:', error);
            throw error;
        }
    }

    /**
     * Get payout analytics for admin
     */
    static async getPayoutAnalytics(req, res) {
        try {
            const { period = '30d' } = req.query;

            // This would be a more complex query for admin analytics
            // For now, returning basic structure
            const analytics = {
                period,
                totalPayouts: 0,
                totalAmount: 0,
                averageAmount: 0,
                payoutsByStatus: {
                    pending: 0,
                    processing: 0,
                    completed: 0,
                    cancelled: 0
                },
                payoutsByCurrency: {},
                payoutsByMethod: {}
            };

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting payout analytics:', error);
            throw error;
        }
    }
}

module.exports = PayoutController;
