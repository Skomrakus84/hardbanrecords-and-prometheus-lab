/**
 * Financials Routes - Financial Management & Revenue Analytics
 * Comprehensive financial operations for music business
 * Advanced revenue tracking, payouts, and financial reporting
 */

const express = require('express');
const router = express.Router();

// Import controllers
const FinancialsController = require('../controllers/financials.controller.cjs');
const PayoutsController = require('../controllers/payouts.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Financial Overview ==========

/**
 * @route   GET /api/music/financials/overview
 * @desc    Get comprehensive financial overview
 * @access  Private
 */
router.get('/overview', 
    requireAuth,
    FinancialsController.getFinancialOverview
);

/**
 * @route   GET /api/music/financials/dashboard
 * @desc    Get financial dashboard with key metrics
 * @access  Private
 */
router.get('/dashboard', 
    requireAuth,
    FinancialsController.getFinancialDashboard
);

/**
 * @route   GET /api/music/financials/balance
 * @desc    Get current account balance and pending earnings
 * @access  Private
 */
router.get('/balance', 
    requireAuth,
    FinancialsController.getAccountBalance
);

// ========== Revenue Management ==========

/**
 * @route   GET /api/music/financials/revenue
 * @desc    Get detailed revenue analytics
 * @access  Private
 */
router.get('/revenue', 
    requireAuth,
    validateRequest('getRevenue'),
    FinancialsController.getRevenue
);

/**
 * @route   GET /api/music/financials/revenue/streams
 * @desc    Get revenue from streaming platforms
 * @access  Private
 */
router.get('/revenue/streams', 
    requireAuth,
    FinancialsController.getStreamingRevenue
);

/**
 * @route   GET /api/music/financials/revenue/platforms
 * @desc    Get revenue breakdown by platform
 * @access  Private
 */
router.get('/revenue/platforms', 
    requireAuth,
    FinancialsController.getRevenueByPlatform
);

/**
 * @route   GET /api/music/financials/revenue/geography
 * @desc    Get revenue breakdown by geographic region
 * @access  Private
 */
router.get('/revenue/geography', 
    requireAuth,
    FinancialsController.getRevenueByGeography
);

/**
 * @route   GET /api/music/financials/revenue/trends
 * @desc    Get revenue trends and projections
 * @access  Private
 */
router.get('/revenue/trends', 
    requireAuth,
    FinancialsController.getRevenueTrends
);

/**
 * @route   GET /api/music/financials/revenue/releases/:releaseId
 * @desc    Get revenue for specific release
 * @access  Private
 */
router.get('/revenue/releases/:releaseId', 
    requireAuth,
    FinancialsController.getReleaseRevenue
);

/**
 * @route   GET /api/music/financials/revenue/tracks/:trackId
 * @desc    Get revenue for specific track
 * @access  Private
 */
router.get('/revenue/tracks/:trackId', 
    requireAuth,
    FinancialsController.getTrackRevenue
);

// ========== Royalty Management ==========

/**
 * @route   GET /api/music/financials/royalties
 * @desc    Get royalty statements and breakdowns
 * @access  Private
 */
router.get('/royalties', 
    requireAuth,
    FinancialsController.getRoyalties
);

/**
 * @route   GET /api/music/financials/royalties/statements
 * @desc    Get historical royalty statements
 * @access  Private
 */
router.get('/royalties/statements', 
    requireAuth,
    FinancialsController.getRoyaltyStatements
);

/**
 * @route   GET /api/music/financials/royalties/statements/:id
 * @desc    Get specific royalty statement
 * @access  Private
 */
router.get('/royalties/statements/:id', 
    requireAuth,
    FinancialsController.getRoyaltyStatement
);

/**
 * @route   POST /api/music/financials/royalties/statements/:id/dispute
 * @desc    Dispute royalty statement
 * @access  Private
 */
router.post('/royalties/statements/:id/dispute', 
    requireAuth,
    validateRequest('disputeRoyaltyStatement'),
    FinancialsController.disputeRoyaltyStatement
);

/**
 * @route   GET /api/music/financials/royalties/splits
 * @desc    Get royalty split configurations
 * @access  Private
 */
router.get('/royalties/splits', 
    requireAuth,
    FinancialsController.getRoyaltySplits
);

/**
 * @route   PUT /api/music/financials/royalties/splits/:releaseId
 * @desc    Update royalty splits for release
 * @access  Private
 */
router.put('/royalties/splits/:releaseId', 
    requireAuth,
    validateRequest('updateRoyaltySplits'),
    FinancialsController.updateRoyaltySplits
);

// ========== Payout Management ==========

/**
 * @route   GET /api/music/financials/payouts
 * @desc    Get payout history and status
 * @access  Private
 */
router.get('/payouts', 
    requireAuth,
    PayoutsController.getPayouts
);

/**
 * @route   POST /api/music/financials/payouts/request
 * @desc    Request payout of available earnings
 * @access  Private
 */
router.post('/payouts/request', 
    requireAuth,
    validateRequest('requestPayout'),
    PayoutsController.requestPayout
);

/**
 * @route   GET /api/music/financials/payouts/:id
 * @desc    Get specific payout details
 * @access  Private
 */
router.get('/payouts/:id', 
    requireAuth,
    PayoutsController.getPayout
);

/**
 * @route   POST /api/music/financials/payouts/:id/cancel
 * @desc    Cancel pending payout
 * @access  Private
 */
router.post('/payouts/:id/cancel', 
    requireAuth,
    PayoutsController.cancelPayout
);

/**
 * @route   GET /api/music/financials/payouts/methods
 * @desc    Get available payout methods
 * @access  Private
 */
router.get('/payouts/methods', 
    requireAuth,
    PayoutsController.getPayoutMethods
);

/**
 * @route   POST /api/music/financials/payouts/methods
 * @desc    Add new payout method
 * @access  Private
 */
router.post('/payouts/methods', 
    requireAuth,
    validateRequest('addPayoutMethod'),
    PayoutsController.addPayoutMethod
);

/**
 * @route   PUT /api/music/financials/payouts/methods/:id
 * @desc    Update payout method
 * @access  Private
 */
router.put('/payouts/methods/:id', 
    requireAuth,
    validateRequest('updatePayoutMethod'),
    PayoutsController.updatePayoutMethod
);

/**
 * @route   DELETE /api/music/financials/payouts/methods/:id
 * @desc    Delete payout method
 * @access  Private
 */
router.delete('/payouts/methods/:id', 
    requireAuth,
    PayoutsController.deletePayoutMethod
);

// ========== Financial Reports ==========

/**
 * @route   GET /api/music/financials/reports
 * @desc    Get available financial reports
 * @access  Private
 */
router.get('/reports', 
    requireAuth,
    FinancialsController.getFinancialReports
);

/**
 * @route   POST /api/music/financials/reports/generate
 * @desc    Generate custom financial report
 * @access  Private
 */
router.post('/reports/generate', 
    requireAuth,
    validateRequest('generateFinancialReport'),
    FinancialsController.generateFinancialReport
);

/**
 * @route   GET /api/music/financials/reports/:id
 * @desc    Get specific financial report
 * @access  Private
 */
router.get('/reports/:id', 
    requireAuth,
    FinancialsController.getFinancialReport
);

/**
 * @route   POST /api/music/financials/reports/:id/export
 * @desc    Export financial report
 * @access  Private
 */
router.post('/reports/:id/export', 
    requireAuth,
    validateRequest('exportFinancialReport'),
    FinancialsController.exportFinancialReport
);

/**
 * @route   GET /api/music/financials/reports/tax/1099
 * @desc    Get 1099 tax forms
 * @access  Private
 */
router.get('/reports/tax/1099', 
    requireAuth,
    FinancialsController.get1099Forms
);

// ========== Expense Management ==========

/**
 * @route   GET /api/music/financials/expenses
 * @desc    Get business expenses
 * @access  Private
 */
router.get('/expenses', 
    requireAuth,
    FinancialsController.getExpenses
);

/**
 * @route   POST /api/music/financials/expenses
 * @desc    Add business expense
 * @access  Private
 */
router.post('/expenses', 
    requireAuth,
    validateRequest('addExpense'),
    FinancialsController.addExpense
);

/**
 * @route   PUT /api/music/financials/expenses/:id
 * @desc    Update business expense
 * @access  Private
 */
router.put('/expenses/:id', 
    requireAuth,
    validateRequest('updateExpense'),
    FinancialsController.updateExpense
);

/**
 * @route   DELETE /api/music/financials/expenses/:id
 * @desc    Delete business expense
 * @access  Private
 */
router.delete('/expenses/:id', 
    requireAuth,
    FinancialsController.deleteExpense
);

/**
 * @route   GET /api/music/financials/expenses/categories
 * @desc    Get expense categories
 * @access  Private
 */
router.get('/expenses/categories', 
    requireAuth,
    FinancialsController.getExpenseCategories
);

// ========== Financial Goals & Budgeting ==========

/**
 * @route   GET /api/music/financials/goals
 * @desc    Get financial goals and targets
 * @access  Private
 */
router.get('/goals', 
    requireAuth,
    FinancialsController.getFinancialGoals
);

/**
 * @route   POST /api/music/financials/goals
 * @desc    Set new financial goal
 * @access  Private
 */
router.post('/goals', 
    requireAuth,
    validateRequest('setFinancialGoal'),
    FinancialsController.setFinancialGoal
);

/**
 * @route   PUT /api/music/financials/goals/:id
 * @desc    Update financial goal
 * @access  Private
 */
router.put('/goals/:id', 
    requireAuth,
    validateRequest('updateFinancialGoal'),
    FinancialsController.updateFinancialGoal
);

/**
 * @route   DELETE /api/music/financials/goals/:id
 * @desc    Delete financial goal
 * @access  Private
 */
router.delete('/goals/:id', 
    requireAuth,
    FinancialsController.deleteFinancialGoal
);

/**
 * @route   GET /api/music/financials/budget
 * @desc    Get budget planning and tracking
 * @access  Private
 */
router.get('/budget', 
    requireAuth,
    FinancialsController.getBudget
);

/**
 * @route   PUT /api/music/financials/budget
 * @desc    Update budget allocations
 * @access  Private
 */
router.put('/budget', 
    requireAuth,
    validateRequest('updateBudget'),
    FinancialsController.updateBudget
);

// ========== Currency & Exchange ==========

/**
 * @route   GET /api/music/financials/currencies
 * @desc    Get supported currencies and exchange rates
 * @access  Private
 */
router.get('/currencies', 
    requireAuth,
    FinancialsController.getSupportedCurrencies
);

/**
 * @route   GET /api/music/financials/exchange-rates
 * @desc    Get current exchange rates
 * @access  Private
 */
router.get('/exchange-rates', 
    requireAuth,
    FinancialsController.getExchangeRates
);

/**
 * @route   POST /api/music/financials/currency/convert
 * @desc    Convert currency amounts
 * @access  Private
 */
router.post('/currency/convert', 
    requireAuth,
    validateRequest('convertCurrency'),
    FinancialsController.convertCurrency
);

// ========== Admin Financial Management ==========

/**
 * @route   GET /api/music/financials/admin/platform-revenue
 * @desc    Get platform-wide revenue analytics
 * @access  Private (Admin only)
 */
router.get('/admin/platform-revenue', 
    requireAuth,
    requireRole(['admin']),
    FinancialsController.getPlatformRevenue
);

/**
 * @route   GET /api/music/financials/admin/payout-queue
 * @desc    Get pending payout queue
 * @access  Private (Admin only)
 */
router.get('/admin/payout-queue', 
    requireAuth,
    requireRole(['admin']),
    PayoutsController.getPayoutQueue
);

/**
 * @route   POST /api/music/financials/admin/process-payouts
 * @desc    Process pending payouts
 * @access  Private (Admin only)
 */
router.post('/admin/process-payouts', 
    requireAuth,
    requireRole(['admin']),
    PayoutsController.processPayouts
);

/**
 * @route   GET /api/music/financials/admin/financial-health
 * @desc    Get platform financial health metrics
 * @access  Private (Admin only)
 */
router.get('/admin/financial-health', 
    requireAuth,
    requireRole(['admin']),
    FinancialsController.getFinancialHealth
);

module.exports = router;
