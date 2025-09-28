/**
 * Financials Controller - Advanced Financial Management REST API
 * Exposes comprehensive financial reporting and management features through REST endpoints
 * Provides sophisticated revenue tracking, royalty calculations, and financial analytics
 * Integrates with financial services and payment processing systems
 */

const FinancialsService = require('../services/financials.service.cjs');
const ReleaseService = require('../services/release.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class FinancialsController {
    /**
     * Get revenue overview
     * GET /api/music/financials/revenue
     */
    static async getRevenueOverview(req, res, next) {
        try {
            const {
                time_range = '12_months',
                breakdown_by = 'month',
                currency = 'USD',
                include_projections = false,
                include_breakdown = true,
                filter_by_release = null
            } = req.query;

            const userId = req.user.id;

            if (filter_by_release) {
                const hasAccess = await ReleaseService.verifyUserAccess(filter_by_release, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const revenueOptions = {
                time_range,
                breakdown_by,
                currency,
                include_projections: include_projections === 'true',
                include_breakdown: include_breakdown === 'true',
                filter_by_release,
                user_id: userId
            };

            const revenue = await FinancialsService.getRevenueOverview(
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
     * Get royalty statements
     * GET /api/music/financials/royalties
     */
    static async getRoyaltyStatements(req, res, next) {
        try {
            const {
                period_start = null,
                period_end = null,
                statement_type = 'all',
                status = 'all',
                include_details = true,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const royaltyOptions = {
                period_start: period_start ? new Date(period_start) : null,
                period_end: period_end ? new Date(period_end) : null,
                statement_type,
                status,
                include_details: include_details === 'true',
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const statements = await FinancialsService.getRoyaltyStatements(
                royaltyOptions
            );

            res.json({
                success: true,
                data: {
                    statements: statements.statements,
                    pagination: statements.pagination,
                    summary: statements.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Calculate royalties
     * POST /api/music/financials/calculate-royalties
     */
    static async calculateRoyalties(req, res, next) {
        try {
            const {
                calculation_period = {},
                releases = [],
                calculation_type = 'standard',
                include_advances = true,
                include_deductions = true,
                currency = 'USD'
            } = req.body;

            const userId = req.user.id;

            if (!calculation_period.start || !calculation_period.end) {
                throw new AppError('Calculation period start and end dates are required', 400);
            }

            const calculationData = {
                calculation_period: {
                    start: new Date(calculation_period.start),
                    end: new Date(calculation_period.end)
                },
                releases,
                calculation_type,
                include_advances,
                include_deductions,
                currency,
                calculated_by: userId
            };

            const calculation = await FinancialsService.calculateRoyalties(
                calculationData,
                userId
            );

            res.json({
                success: true,
                message: 'Royalty calculation completed',
                data: calculation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payout history
     * GET /api/music/financials/payouts
     */
    static async getPayoutHistory(req, res, next) {
        try {
            const {
                date_from = null,
                date_to = null,
                status = 'all',
                payment_method = 'all',
                include_pending = true,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const payoutOptions = {
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                status,
                payment_method,
                include_pending: include_pending === 'true',
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const payouts = await FinancialsService.getPayoutHistory(
                payoutOptions
            );

            res.json({
                success: true,
                data: {
                    payouts: payouts.payouts,
                    pagination: payouts.pagination,
                    summary: payouts.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Request payout
     * POST /api/music/financials/request-payout
     */
    static async requestPayout(req, res, next) {
        try {
            const {
                amount,
                currency = 'USD',
                payment_method = 'bank_transfer',
                payment_details = {},
                notes = ''
            } = req.body;

            const userId = req.user.id;

            if (!amount || amount <= 0) {
                throw new AppError('Valid payout amount is required', 400);
            }

            const payoutRequest = {
                amount: parseFloat(amount),
                currency,
                payment_method,
                payment_details,
                notes,
                requested_by: userId
            };

            const result = await FinancialsService.requestPayout(
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
     * Get financial summary
     * GET /api/music/financials/summary
     */
    static async getFinancialSummary(req, res, next) {
        try {
            const {
                time_range = '30_days',
                include_comparisons = true,
                include_forecasts = false,
                currency = 'USD'
            } = req.query;

            const userId = req.user.id;

            const summaryOptions = {
                time_range,
                include_comparisons: include_comparisons === 'true',
                include_forecasts: include_forecasts === 'true',
                currency,
                user_id: userId
            };

            const summary = await FinancialsService.getFinancialSummary(
                summaryOptions
            );

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get expense tracking
     * GET /api/music/financials/expenses
     */
    static async getExpenses(req, res, next) {
        try {
            const {
                date_from = null,
                date_to = null,
                category = 'all',
                release_id = null,
                include_pending = true,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const expenseOptions = {
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                category,
                release_id,
                include_pending: include_pending === 'true',
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const expenses = await FinancialsService.getExpenses(
                expenseOptions
            );

            res.json({
                success: true,
                data: {
                    expenses: expenses.expenses,
                    pagination: expenses.pagination,
                    summary: expenses.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add expense
     * POST /api/music/financials/expenses
     */
    static async addExpense(req, res, next) {
        try {
            const {
                amount,
                currency = 'USD',
                category,
                description = '',
                expense_date = null,
                release_id = null,
                receipt_url = null,
                tax_deductible = false
            } = req.body;

            const userId = req.user.id;

            if (!amount || !category) {
                throw new AppError('Amount and category are required', 400);
            }

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const expenseData = {
                amount: parseFloat(amount),
                currency,
                category,
                description,
                expense_date: expense_date ? new Date(expense_date) : new Date(),
                release_id,
                receipt_url,
                tax_deductible,
                added_by: userId
            };

            const expense = await FinancialsService.addExpense(
                expenseData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Expense added successfully',
                data: expense
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get tax reporting data
     * GET /api/music/financials/tax-reporting
     */
    static async getTaxReporting(req, res, next) {
        try {
            const {
                tax_year = new Date().getFullYear(),
                jurisdiction = 'US',
                report_type = 'annual',
                include_supporting_docs = false,
                format = 'json'
            } = req.query;

            const userId = req.user.id;

            const taxOptions = {
                tax_year: parseInt(tax_year),
                jurisdiction,
                report_type,
                include_supporting_docs: include_supporting_docs === 'true',
                format,
                user_id: userId
            };

            const taxData = await FinancialsService.generateTaxReport(
                taxOptions
            );

            if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="tax-report-${tax_year}.pdf"`);
                res.send(taxData.content);
            } else {
                res.json({
                    success: true,
                    data: taxData
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get revenue by platform
     * GET /api/music/financials/revenue-by-platform
     */
    static async getRevenueByPlatform(req, res, next) {
        try {
            const {
                time_range = '12_months',
                currency = 'USD',
                include_growth = true,
                breakdown_by = 'month'
            } = req.query;

            const userId = req.user.id;

            const platformOptions = {
                time_range,
                currency,
                include_growth: include_growth === 'true',
                breakdown_by,
                user_id: userId
            };

            const platformRevenue = await FinancialsService.getRevenueByPlatform(
                platformOptions
            );

            res.json({
                success: true,
                data: platformRevenue
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate financial report
     * POST /api/music/financials/reports
     */
    static async generateFinancialReport(req, res, next) {
        try {
            const {
                report_type = 'revenue_summary',
                period_start,
                period_end,
                include_charts = true,
                format = 'pdf',
                detailed_breakdown = true,
                currency = 'USD'
            } = req.body;

            const userId = req.user.id;

            if (!period_start || !period_end) {
                throw new AppError('Report period start and end dates are required', 400);
            }

            const reportOptions = {
                report_type,
                period_start: new Date(period_start),
                period_end: new Date(period_end),
                include_charts,
                format,
                detailed_breakdown,
                currency,
                generated_by: userId
            };

            const report = await FinancialsService.generateFinancialReport(
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
     * Get recoupment status
     * GET /api/music/financials/recoupment
     */
    static async getRecoupmentStatus(req, res, next) {
        try {
            const {
                release_id = null,
                include_projections = false,
                breakdown_by_cost_type = true
            } = req.query;

            const userId = req.user.id;

            if (release_id) {
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }
            }

            const recoupmentOptions = {
                release_id,
                include_projections: include_projections === 'true',
                breakdown_by_cost_type: breakdown_by_cost_type === 'true',
                user_id: userId
            };

            const recoupment = await FinancialsService.getRecoupmentStatus(
                recoupmentOptions
            );

            res.json({
                success: true,
                data: recoupment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get balance sheet
     * GET /api/music/financials/balance
     */
    static async getBalanceSheet(req, res, next) {
        try {
            const {
                as_of_date = null,
                currency = 'USD',
                include_pending = true,
                include_projections = false
            } = req.query;

            const userId = req.user.id;

            const balanceOptions = {
                as_of_date: as_of_date ? new Date(as_of_date) : new Date(),
                currency,
                include_pending: include_pending === 'true',
                include_projections: include_projections === 'true',
                user_id: userId
            };

            const balance = await FinancialsService.getBalanceSheet(
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
     * Set up financial alerts
     * POST /api/music/financials/alerts
     */
    static async setupFinancialAlerts(req, res, next) {
        try {
            const {
                alert_type = 'threshold',
                metric = 'monthly_revenue',
                threshold_value,
                condition = 'below',
                notification_methods = ['email'],
                active = true
            } = req.body;

            const userId = req.user.id;

            if (!threshold_value) {
                throw new AppError('Threshold value is required', 400);
            }

            const alertData = {
                alert_type,
                metric,
                threshold_value: parseFloat(threshold_value),
                condition,
                notification_methods,
                active,
                created_by: userId
            };

            const alert = await FinancialsService.setupFinancialAlert(
                alertData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Financial alert created successfully',
                data: alert
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get currency exchange rates
     * GET /api/music/financials/exchange-rates
     */
    static async getExchangeRates(req, res, next) {
        try {
            const {
                base_currency = 'USD',
                target_currencies = [],
                historical = false,
                date = null
            } = req.query;

            const rateOptions = {
                base_currency,
                target_currencies: target_currencies.length > 0 ? target_currencies : ['EUR', 'GBP', 'JPY', 'CAD'],
                historical: historical === 'true',
                date: date ? new Date(date) : new Date()
            };

            const rates = await FinancialsService.getExchangeRates(rateOptions);

            res.json({
                success: true,
                data: rates
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk financial operations
     * POST /api/music/financials/bulk-operations
     */
    static async bulkFinancialOperations(req, res, next) {
        try {
            const {
                operation_type = 'calculate_royalties',
                entities = [],
                operation_data = {},
                validation_mode = 'strict'
            } = req.body;

            const userId = req.user.id;

            if (entities.length === 0) {
                throw new AppError('At least one entity is required', 400);
            }

            const bulkData = {
                operation_type,
                entities,
                operation_data,
                validation_mode,
                initiated_by: userId
            };

            const result = await FinancialsService.bulkFinancialOperations(
                bulkData,
                userId
            );

            res.json({
                success: true,
                message: 'Bulk financial operations completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FinancialsController;
