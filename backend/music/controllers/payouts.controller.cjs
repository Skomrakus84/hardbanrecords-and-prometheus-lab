/**
 * Payouts Controller - Advanced Payout Management REST API
 * Exposes comprehensive payout processing and management features through REST endpoints
 * Provides sophisticated payment processing, scheduling, and tracking capabilities
 * Integrates with payment gateways and financial service providers
 */

const PayoutService = require('../services/payout.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class PayoutsController {
    /**
     * Get available balance for payout
     * GET /api/music/payouts/balance
     */
    static async getAvailableBalance(req, res, next) {
        try {
            const {
                currency = 'USD',
                include_pending = false,
                include_breakdown = true
            } = req.query;

            const userId = req.user.id;

            const balanceOptions = {
                currency,
                include_pending: include_pending === 'true',
                include_breakdown: include_breakdown === 'true',
                user_id: userId
            };

            const balance = await PayoutService.getAvailableBalance(
                balanceOptions
            );

            res.json({
                success: true,
                data: balance
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request immediate payout
     * POST /api/music/payouts/request
     */
    static async requestPayout(req, res, next) {
        try {
            const {
                amount,
                currency = 'USD',
                payment_method_id,
                priority = 'standard',
                notes = '',
                split_payments = []
            } = req.body;

            const userId = req.user.id;

            if (!amount || amount <= 0) {
                throw new AppError('Valid payout amount is required', 400);
            }

            if (!payment_method_id) {
                throw new AppError('Payment method ID is required', 400);
            }

            const payoutRequest = {
                amount: parseFloat(amount),
                currency,
                payment_method_id,
                priority,
                notes,
                split_payments,
                requested_by: userId
            };

            const result = await PayoutService.requestPayout(
                payoutRequest,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Payout request submitted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Schedule recurring payout
     * POST /api/music/payouts/schedule
     */
    static async scheduleRecurringPayout(req, res, next) {
        try {
            const {
                frequency = 'monthly',
                minimum_amount = 100,
                currency = 'USD',
                payment_method_id,
                start_date = null,
                max_amount = null,
                auto_adjust = true
            } = req.body;

            const userId = req.user.id;

            if (!payment_method_id) {
                throw new AppError('Payment method ID is required', 400);
            }

            const scheduleData = {
                frequency,
                minimum_amount: parseFloat(minimum_amount),
                currency,
                payment_method_id,
                start_date: start_date ? new Date(start_date) : new Date(),
                max_amount: max_amount ? parseFloat(max_amount) : null,
                auto_adjust,
                scheduled_by: userId
            };

            const schedule = await PayoutService.scheduleRecurringPayout(
                scheduleData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Recurring payout scheduled successfully',
                data: schedule
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout history
     * GET /api/music/payouts/history
     */
    static async getPayoutHistory(req, res, next) {
        try {
            const {
                date_from = null,
                date_to = null,
                status = 'all',
                payment_method = 'all',
                currency = 'all',
                page = 1,
                limit = 20,
                include_details = true
            } = req.query;

            const userId = req.user.id;

            const historyOptions = {
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                status,
                payment_method,
                currency,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                include_details: include_details === 'true',
                user_id: userId
            };

            const history = await PayoutService.getPayoutHistory(
                historyOptions
            );

            res.json({
                success: true,
                data: {
                    payouts: history.payouts,
                    pagination: history.pagination,
                    summary: history.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout details
     * GET /api/music/payouts/:payoutId
     */
    static async getPayoutDetails(req, res, next) {
        try {
            const { payoutId } = req.params;
            const {
                include_transactions = true,
                include_fees = true,
                include_tracking = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_transactions: include_transactions === 'true',
                include_fees: include_fees === 'true',
                include_tracking: include_tracking === 'true'
            };

            const payout = await PayoutService.getPayoutDetails(
                payoutId,
                options,
                userId
            );

            res.json({
                success: true,
                data: payout
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel payout
     * DELETE /api/music/payouts/:payoutId
     */
    static async cancelPayout(req, res, next) {
        try {
            const { payoutId } = req.params;
            const {
                cancellation_reason = '',
                refund_fees = false
            } = req.body;

            const userId = req.user.id;

            const cancellationData = {
                cancellation_reason,
                refund_fees,
                cancelled_by: userId
            };

            const result = await PayoutService.cancelPayout(
                payoutId,
                cancellationData
            );

            res.json({
                success: true,
                message: 'Payout cancelled successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payment methods
     * GET /api/music/payouts/payment-methods
     */
    static async getPaymentMethods(req, res, next) {
        try {
            const {
                include_disabled = false,
                method_type = 'all'
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_disabled: include_disabled === 'true',
                method_type,
                user_id: userId
            };

            const methods = await PayoutService.getPaymentMethods(options);

            res.json({
                success: true,
                data: methods
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add payment method
     * POST /api/music/payouts/payment-methods
     */
    static async addPaymentMethod(req, res, next) {
        try {
            const {
                method_type = 'bank_transfer',
                display_name = '',
                payment_details = {},
                is_default = false,
                currency_preferences = []
            } = req.body;

            const userId = req.user.id;

            if (!payment_details || Object.keys(payment_details).length === 0) {
                throw new AppError('Payment details are required', 400);
            }

            const methodData = {
                method_type,
                display_name,
                payment_details,
                is_default,
                currency_preferences,
                added_by: userId
            };

            const method = await PayoutService.addPaymentMethod(
                methodData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Payment method added successfully',
                data: method
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update payment method
     * PUT /api/music/payouts/payment-methods/:methodId
     */
    static async updatePaymentMethod(req, res, next) {
        try {
            const { methodId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const result = await PayoutService.updatePaymentMethod(
                methodId,
                updateData,
                userId
            );

            res.json({
                success: true,
                message: 'Payment method updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete payment method
     * DELETE /api/music/payouts/payment-methods/:methodId
     */
    static async deletePaymentMethod(req, res, next) {
        try {
            const { methodId } = req.params;
            const userId = req.user.id;

            const result = await PayoutService.deletePaymentMethod(
                methodId,
                userId
            );

            res.json({
                success: true,
                message: 'Payment method deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify payment method
     * POST /api/music/payouts/payment-methods/:methodId/verify
     */
    static async verifyPaymentMethod(req, res, next) {
        try {
            const { methodId } = req.params;
            const {
                verification_data = {},
                verification_method = 'micro_deposits'
            } = req.body;

            const userId = req.user.id;

            const verificationOptions = {
                method_id: methodId,
                verification_data,
                verification_method,
                verified_by: userId
            };

            const result = await PayoutService.verifyPaymentMethod(
                verificationOptions
            );

            res.json({
                success: true,
                message: 'Payment method verification initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout fees
     * GET /api/music/payouts/fees
     */
    static async getPayoutFees(req, res, next) {
        try {
            const {
                amount,
                currency = 'USD',
                payment_method_id,
                priority = 'standard'
            } = req.query;

            if (!amount || !payment_method_id) {
                throw new AppError('Amount and payment method ID are required', 400);
            }

            const feeOptions = {
                amount: parseFloat(amount),
                currency,
                payment_method_id,
                priority
            };

            const fees = await PayoutService.calculatePayoutFees(feeOptions);

            res.json({
                success: true,
                data: fees
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout limits
     * GET /api/music/payouts/limits
     */
    static async getPayoutLimits(req, res, next) {
        try {
            const {
                currency = 'USD',
                payment_method_type = 'all'
            } = req.query;

            const userId = req.user.id;

            const limitOptions = {
                currency,
                payment_method_type,
                user_id: userId
            };

            const limits = await PayoutService.getPayoutLimits(limitOptions);

            res.json({
                success: true,
                data: limits
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout schedule
     * GET /api/music/payouts/schedule
     */
    static async getPayoutSchedule(req, res, next) {
        try {
            const {
                include_upcoming = true,
                include_history = false,
                next_months = 3
            } = req.query;

            const userId = req.user.id;

            const scheduleOptions = {
                include_upcoming: include_upcoming === 'true',
                include_history: include_history === 'true',
                next_months: parseInt(next_months),
                user_id: userId
            };

            const schedule = await PayoutService.getPayoutSchedule(
                scheduleOptions
            );

            res.json({
                success: true,
                data: schedule
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update payout schedule
     * PUT /api/music/payouts/schedule/:scheduleId
     */
    static async updatePayoutSchedule(req, res, next) {
        try {
            const { scheduleId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const result = await PayoutService.updatePayoutSchedule(
                scheduleId,
                updateData,
                userId
            );

            res.json({
                success: true,
                message: 'Payout schedule updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Pause payout schedule
     * POST /api/music/payouts/schedule/:scheduleId/pause
     */
    static async pausePayoutSchedule(req, res, next) {
        try {
            const { scheduleId } = req.params;
            const {
                pause_reason = '',
                resume_date = null
            } = req.body;

            const userId = req.user.id;

            const pauseData = {
                pause_reason,
                resume_date: resume_date ? new Date(resume_date) : null,
                paused_by: userId
            };

            const result = await PayoutService.pausePayoutSchedule(
                scheduleId,
                pauseData
            );

            res.json({
                success: true,
                message: 'Payout schedule paused successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Resume payout schedule
     * POST /api/music/payouts/schedule/:scheduleId/resume
     */
    static async resumePayoutSchedule(req, res, next) {
        try {
            const { scheduleId } = req.params;
            const userId = req.user.id;

            const result = await PayoutService.resumePayoutSchedule(
                scheduleId,
                userId
            );

            res.json({
                success: true,
                message: 'Payout schedule resumed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout analytics
     * GET /api/music/payouts/analytics
     */
    static async getPayoutAnalytics(req, res, next) {
        try {
            const {
                time_range = '12_months',
                group_by = 'month',
                include_projections = false,
                currency = 'USD'
            } = req.query;

            const userId = req.user.id;

            const analyticsOptions = {
                time_range,
                group_by,
                include_projections: include_projections === 'true',
                currency,
                user_id: userId
            };

            const analytics = await PayoutService.getPayoutAnalytics(
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
     * Simulate payout
     * POST /api/music/payouts/simulate
     */
    static async simulatePayout(req, res, next) {
        try {
            const {
                amount,
                currency = 'USD',
                payment_method_id,
                priority = 'standard',
                include_fees = true
            } = req.body;

            const userId = req.user.id;

            if (!amount || !payment_method_id) {
                throw new AppError('Amount and payment method ID are required', 400);
            }

            const simulationData = {
                amount: parseFloat(amount),
                currency,
                payment_method_id,
                priority,
                include_fees,
                user_id: userId
            };

            const simulation = await PayoutService.simulatePayout(
                simulationData
            );

            res.json({
                success: true,
                message: 'Payout simulation completed',
                data: simulation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retry failed payout
     * POST /api/music/payouts/:payoutId/retry
     */
    static async retryPayout(req, res, next) {
        try {
            const { payoutId } = req.params;
            const {
                retry_reason = '',
                use_different_method = false,
                new_payment_method_id = null
            } = req.body;

            const userId = req.user.id;

            const retryData = {
                retry_reason,
                use_different_method,
                new_payment_method_id,
                retried_by: userId
            };

            const result = await PayoutService.retryPayout(
                payoutId,
                retryData
            );

            res.json({
                success: true,
                message: 'Payout retry initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout tax information
     * GET /api/music/payouts/tax-info
     */
    static async getPayoutTaxInfo(req, res, next) {
        try {
            const {
                tax_year = new Date().getFullYear(),
                format = 'json',
                include_1099 = true
            } = req.query;

            const userId = req.user.id;

            const taxOptions = {
                tax_year: parseInt(tax_year),
                format,
                include_1099: include_1099 === 'true',
                user_id: userId
            };

            const taxInfo = await PayoutService.getPayoutTaxInfo(taxOptions);

            if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="payout-tax-info-${tax_year}.pdf"`);
                res.send(taxInfo.content);
            } else {
                res.json({
                    success: true,
                    data: taxInfo
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Set payout preferences
     * POST /api/music/payouts/preferences
     */
    static async setPayoutPreferences(req, res, next) {
        try {
            const {
                default_currency = 'USD',
                minimum_payout_amount = 100,
                auto_payout_enabled = false,
                payout_frequency = 'monthly',
                notification_preferences = {}
            } = req.body;

            const userId = req.user.id;

            const preferences = {
                default_currency,
                minimum_payout_amount: parseFloat(minimum_payout_amount),
                auto_payout_enabled,
                payout_frequency,
                notification_preferences: {
                    payout_completed: notification_preferences.payout_completed || true,
                    payout_failed: notification_preferences.payout_failed || true,
                    schedule_changed: notification_preferences.schedule_changed || true,
                    low_balance: notification_preferences.low_balance || false
                },
                updated_by: userId
            };

            const result = await PayoutService.setPayoutPreferences(
                preferences,
                userId
            );

            res.json({
                success: true,
                message: 'Payout preferences updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PayoutsController;
