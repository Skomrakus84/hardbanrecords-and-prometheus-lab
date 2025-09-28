/**
 * Royalty Controller - Comprehensive Royalty Management
 * Handles royalty calculations, splits, and payout processing
 */

const RoyaltyService = require('../services/royalty.service.cjs');
const PayoutService = require('../services/payout.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../config/logger.cjs');

class RoyaltyController {
    /**
     * Get royalty statements for user
     * GET /api/music/royalties
     */
    static async getRoyaltyStatements(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                period = '30d',
                platform,
                status = 'all',
                currency = 'USD',
                page = 1,
                limit = 20
            } = req.query;

            const statements = await RoyaltyService.getRoyaltyStatements({
                userId,
                period,
                platform,
                status: status !== 'all' ? status : undefined,
                currency,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });

            res.json({
                success: true,
                data: statements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get detailed royalty statement
     * GET /api/music/royalties/:statementId
     */
    static async getRoyaltyStatement(req, res, next) {
        try {
            const { userId } = req.user;
            const { statementId } = req.params;

            const statement = await RoyaltyService.getRoyaltyStatementById(statementId, userId);

            if (!statement) {
                throw new AppError('Royalty statement not found', 404);
            }

            res.json({
                success: true,
                data: statement
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create royalty splits for release
     * POST /api/music/royalties/:releaseId/splits
     */
    static async createRoyaltySplits(req, res, next) {
        try {
            const { userId } = req.user;
            const { releaseId } = req.params;
            const { splits } = req.body;

            // Validate splits add up to 100%
            const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                throw new AppError('Split percentages must add up to 100%', 400);
            }

            const createdSplits = await RoyaltyService.createRoyaltySplits(releaseId, splits, userId);

            res.status(201).json({
                success: true,
                data: createdSplits,
                message: 'Royalty splits created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update royalty splits
     * PUT /api/music/royalties/:releaseId/splits
     */
    static async updateRoyaltySplits(req, res, next) {
        try {
            const { userId } = req.user;
            const { releaseId } = req.params;
            const { splits } = req.body;

            const updatedSplits = await RoyaltyService.updateRoyaltySplits(releaseId, splits, userId);

            res.json({
                success: true,
                data: updatedSplits,
                message: 'Royalty splits updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Calculate royalties for period
     * POST /api/music/royalties/calculate
     */
    static async calculateRoyalties(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                period_start,
                period_end,
                release_ids = [],
                currency = 'USD',
                include_previews = false
            } = req.body;

            const calculation = await RoyaltyService.calculateRoyalties({
                userId,
                periodStart: period_start,
                periodEnd: period_end,
                releaseIds: release_ids,
                currency,
                includePreviews: include_previews
            });

            res.json({
                success: true,
                data: calculation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get royalty earnings summary
     * GET /api/music/royalties/earnings
     */
    static async getEarningsSummary(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                period = '30d',
                currency = 'USD',
                breakdown = 'platform'
            } = req.query;

            const earnings = await RoyaltyService.getEarningsSummary({
                userId,
                period,
                currency,
                breakdown
            });

            res.json({
                success: true,
                data: earnings
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request payout
     * POST /api/music/royalties/payout
     */
    static async requestPayout(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                amount,
                currency = 'USD',
                payment_method,
                payment_details,
                include_statements = []
            } = req.body;

            // Validate minimum payout amount
            const minPayout = await PayoutService.getMinimumPayoutAmount(currency);
            if (amount < minPayout) {
                throw new AppError(`Minimum payout amount is ${minPayout} ${currency}`, 400);
            }

            const payout = await PayoutService.requestPayout({
                userId,
                amount,
                currency,
                paymentMethod: payment_method,
                paymentDetails: payment_details,
                includeStatements: include_statements
            });

            res.status(201).json({
                success: true,
                data: payout,
                message: 'Payout request submitted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout history
     * GET /api/music/payouts
     */
    static async getPayouts(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                status = 'all',
                currency,
                page = 1,
                limit = 20
            } = req.query;

            const payouts = await PayoutService.getPayouts({
                userId,
                status: status !== 'all' ? status : undefined,
                currency,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });

            res.json({
                success: true,
                data: payouts
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout details
     * GET /api/music/payouts/:payoutId
     */
    static async getPayout(req, res, next) {
        try {
            const { userId } = req.user;
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
            next(error);
        }
    }

    /**
     * Cancel payout request
     * DELETE /api/music/payouts/:payoutId
     */
    static async cancelPayout(req, res, next) {
        try {
            const { userId } = req.user;
            const { payoutId } = req.params;

            const cancelled = await PayoutService.cancelPayout(payoutId, userId);

            res.json({
                success: true,
                data: cancelled,
                message: 'Payout cancelled successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available balance for payout
     * GET /api/music/royalties/balance
     */
    static async getAvailableBalance(req, res, next) {
        try {
            const { userId } = req.user;
            const { currency = 'USD' } = req.query;

            const balance = await RoyaltyService.getAvailableBalance(userId, currency);

            res.json({
                success: true,
                data: balance
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export royalty data
     * POST /api/music/royalties/export
     */
    static async exportRoyaltyData(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                format = 'csv',
                period_start,
                period_end,
                include_splits = true,
                email_delivery = false
            } = req.body;

            const exportResult = await RoyaltyService.exportRoyaltyData({
                userId,
                format,
                periodStart: period_start,
                periodEnd: period_end,
                includeSplits: include_splits,
                emailDelivery: email_delivery
            });

            res.json({
                success: true,
                data: exportResult
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get royalty analytics
     * GET /api/music/royalties/analytics
     */
    static async getRoyaltyAnalytics(req, res, next) {
        try {
            const { userId } = req.user;
            const {
                period = '90d',
                currency = 'USD',
                include_forecasting = false
            } = req.query;

            const analytics = await RoyaltyService.getRoyaltyAnalytics({
                userId,
                period,
                currency,
                includeForecasting: include_forecasting === 'true'
            });

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate royalty splits
     * POST /api/music/royalties/validate-splits
     */
    static async validateRoyaltySplits(req, res, next) {
        try {
            const { splits } = req.body;

            const validation = RoyaltyService.validateRoyaltySplits(splits);

            res.json({
                success: true,
                data: validation
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RoyaltyController;
