/**
 * Payouts Routes - Payout Management & Processing API
 * Advanced payout processing with multiple payment methods
 * Comprehensive payout scheduling and transaction management
 */

const express = require('express');
const router = express.Router();

// Import controllers
const PayoutsController = require('../controllers/payouts.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Payout Overview ==========

/**
 * @route   GET /api/music/payouts/overview
 * @desc    Get payout dashboard overview
 * @access  Private
 */
router.get('/overview', 
    requireAuth,
    PayoutsController.getPayoutOverview
);

/**
 * @route   GET /api/music/payouts/balance
 * @desc    Get available balance for payout
 * @access  Private
 */
router.get('/balance', 
    requireAuth,
    PayoutsController.getAvailableBalance
);

/**
 * @route   GET /api/music/payouts/schedule
 * @desc    Get payout schedule and next payout date
 * @access  Private
 */
router.get('/schedule', 
    requireAuth,
    PayoutsController.getPayoutSchedule
);

// ========== Payout Requests ==========

/**
 * @route   GET /api/music/payouts
 * @desc    Get payout history with filtering
 * @access  Private
 */
router.get('/', 
    requireAuth,
    PayoutsController.getPayouts
);

/**
 * @route   POST /api/music/payouts/request
 * @desc    Request immediate payout
 * @access  Private
 */
router.post('/request', 
    requireAuth,
    validateRequest('requestPayout'),
    PayoutsController.requestPayout
);

/**
 * @route   GET /api/music/payouts/:id
 * @desc    Get specific payout details
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    PayoutsController.getPayout
);

/**
 * @route   POST /api/music/payouts/:id/cancel
 * @desc    Cancel pending payout request
 * @access  Private
 */
router.post('/:id/cancel', 
    requireAuth,
    PayoutsController.cancelPayout
);

/**
 * @route   POST /api/music/payouts/:id/retry
 * @desc    Retry failed payout
 * @access  Private
 */
router.post('/:id/retry', 
    requireAuth,
    PayoutsController.retryPayout
);

// ========== Payment Methods ==========

/**
 * @route   GET /api/music/payouts/methods
 * @desc    Get user's payment methods
 * @access  Private
 */
router.get('/methods', 
    requireAuth,
    PayoutsController.getPaymentMethods
);

/**
 * @route   POST /api/music/payouts/methods
 * @desc    Add new payment method
 * @access  Private
 */
router.post('/methods', 
    requireAuth,
    validateRequest('addPaymentMethod'),
    PayoutsController.addPaymentMethod
);

/**
 * @route   GET /api/music/payouts/methods/:id
 * @desc    Get specific payment method details
 * @access  Private
 */
router.get('/methods/:id', 
    requireAuth,
    PayoutsController.getPaymentMethod
);

/**
 * @route   PUT /api/music/payouts/methods/:id
 * @desc    Update payment method
 * @access  Private
 */
router.put('/methods/:id', 
    requireAuth,
    validateRequest('updatePaymentMethod'),
    PayoutsController.updatePaymentMethod
);

/**
 * @route   DELETE /api/music/payouts/methods/:id
 * @desc    Delete payment method
 * @access  Private
 */
router.delete('/methods/:id', 
    requireAuth,
    PayoutsController.deletePaymentMethod
);

/**
 * @route   POST /api/music/payouts/methods/:id/verify
 * @desc    Verify payment method
 * @access  Private
 */
router.post('/methods/:id/verify', 
    requireAuth,
    validateRequest('verifyPaymentMethod'),
    PayoutsController.verifyPaymentMethod
);

/**
 * @route   POST /api/music/payouts/methods/:id/set-primary
 * @desc    Set payment method as primary
 * @access  Private
 */
router.post('/methods/:id/set-primary', 
    requireAuth,
    PayoutsController.setPrimaryPaymentMethod
);

// ========== Payout Settings ==========

/**
 * @route   GET /api/music/payouts/settings
 * @desc    Get payout preferences and settings
 * @access  Private
 */
router.get('/settings', 
    requireAuth,
    PayoutsController.getPayoutSettings
);

/**
 * @route   PUT /api/music/payouts/settings
 * @desc    Update payout preferences
 * @access  Private
 */
router.put('/settings', 
    requireAuth,
    validateRequest('updatePayoutSettings'),
    PayoutsController.updatePayoutSettings
);

/**
 * @route   GET /api/music/payouts/settings/thresholds
 * @desc    Get minimum payout thresholds
 * @access  Private
 */
router.get('/settings/thresholds', 
    requireAuth,
    PayoutsController.getPayoutThresholds
);

/**
 * @route   PUT /api/music/payouts/settings/auto-payout
 * @desc    Configure automatic payout settings
 * @access  Private
 */
router.put('/settings/auto-payout', 
    requireAuth,
    validateRequest('updateAutoPayoutSettings'),
    PayoutsController.updateAutoPayoutSettings
);

// ========== Payout Calculations ==========

/**
 * @route   GET /api/music/payouts/calculate
 * @desc    Calculate potential payout amount
 * @access  Private
 */
router.get('/calculate', 
    requireAuth,
    PayoutsController.calculatePayout
);

/**
 * @route   GET /api/music/payouts/fees
 * @desc    Get payout fees and charges
 * @access  Private
 */
router.get('/fees', 
    requireAuth,
    PayoutsController.getPayoutFees
);

/**
 * @route   POST /api/music/payouts/estimate
 * @desc    Get payout estimate with fees
 * @access  Private
 */
router.post('/estimate', 
    requireAuth,
    validateRequest('estimatePayout'),
    PayoutsController.estimatePayout
);

// ========== Payout History & Analytics ==========

/**
 * @route   GET /api/music/payouts/history
 * @desc    Get detailed payout history
 * @access  Private
 */
router.get('/history', 
    requireAuth,
    PayoutsController.getPayoutHistory
);

/**
 * @route   GET /api/music/payouts/analytics
 * @desc    Get payout analytics and trends
 * @access  Private
 */
router.get('/analytics', 
    requireAuth,
    PayoutsController.getPayoutAnalytics
);

/**
 * @route   GET /api/music/payouts/earnings/pending
 * @desc    Get pending earnings breakdown
 * @access  Private
 */
router.get('/earnings/pending', 
    requireAuth,
    PayoutsController.getPendingEarnings
);

/**
 * @route   GET /api/music/payouts/earnings/released
 * @desc    Get released earnings available for payout
 * @access  Private
 */
router.get('/earnings/released', 
    requireAuth,
    PayoutsController.getReleasedEarnings
);

// ========== Tax Documentation ==========

/**
 * @route   GET /api/music/payouts/tax/forms
 * @desc    Get tax forms for payouts
 * @access  Private
 */
router.get('/tax/forms', 
    requireAuth,
    PayoutsController.getTaxForms
);

/**
 * @route   POST /api/music/payouts/tax/w9
 * @desc    Submit W-9 tax form
 * @access  Private
 */
router.post('/tax/w9', 
    requireAuth,
    validateRequest('submitW9Form'),
    PayoutsController.submitW9Form
);

/**
 * @route   GET /api/music/payouts/tax/1099/:year
 * @desc    Get 1099 form for specific year
 * @access  Private
 */
router.get('/tax/1099/:year', 
    requireAuth,
    PayoutsController.get1099Form
);

/**
 * @route   GET /api/music/payouts/tax/summary/:year
 * @desc    Get annual tax summary
 * @access  Private
 */
router.get('/tax/summary/:year', 
    requireAuth,
    PayoutsController.getAnnualTaxSummary
);

// ========== International Payouts ==========

/**
 * @route   GET /api/music/payouts/international/rates
 * @desc    Get international payout exchange rates
 * @access  Private
 */
router.get('/international/rates', 
    requireAuth,
    PayoutsController.getInternationalRates
);

/**
 * @route   GET /api/music/payouts/international/fees
 * @desc    Get international payout fees
 * @access  Private
 */
router.get('/international/fees', 
    requireAuth,
    PayoutsController.getInternationalFees
);

/**
 * @route   POST /api/music/payouts/international/convert
 * @desc    Convert payout to local currency
 * @access  Private
 */
router.post('/international/convert', 
    requireAuth,
    validateRequest('convertInternationalPayout'),
    PayoutsController.convertInternationalPayout
);

// ========== Payout Disputes ==========

/**
 * @route   GET /api/music/payouts/disputes
 * @desc    Get payout disputes
 * @access  Private
 */
router.get('/disputes', 
    requireAuth,
    PayoutsController.getPayoutDisputes
);

/**
 * @route   POST /api/music/payouts/:id/dispute
 * @desc    Create payout dispute
 * @access  Private
 */
router.post('/:id/dispute', 
    requireAuth,
    validateRequest('createPayoutDispute'),
    PayoutsController.createPayoutDispute
);

/**
 * @route   GET /api/music/payouts/disputes/:id
 * @desc    Get specific payout dispute
 * @access  Private
 */
router.get('/disputes/:id', 
    requireAuth,
    PayoutsController.getPayoutDispute
);

/**
 * @route   POST /api/music/payouts/disputes/:id/resolve
 * @desc    Resolve payout dispute
 * @access  Private
 */
router.post('/disputes/:id/resolve', 
    requireAuth,
    validateRequest('resolvePayoutDispute'),
    PayoutsController.resolvePayoutDispute
);

// ========== Admin Payout Management ==========

/**
 * @route   GET /api/music/payouts/admin/queue
 * @desc    Get admin payout processing queue
 * @access  Private (Admin only)
 */
router.get('/admin/queue', 
    requireAuth,
    requireRole(['admin', 'finance']),
    PayoutsController.getAdminPayoutQueue
);

/**
 * @route   POST /api/music/payouts/admin/process-batch
 * @desc    Process batch of payouts
 * @access  Private (Admin only)
 */
router.post('/admin/process-batch', 
    requireAuth,
    requireRole(['admin', 'finance']),
    PayoutsController.processBatchPayouts
);

/**
 * @route   GET /api/music/payouts/admin/analytics
 * @desc    Get admin payout analytics
 * @access  Private (Admin only)
 */
router.get('/admin/analytics', 
    requireAuth,
    requireRole(['admin', 'finance']),
    PayoutsController.getAdminPayoutAnalytics
);

/**
 * @route   POST /api/music/payouts/admin/:id/approve
 * @desc    Manually approve payout
 * @access  Private (Admin only)
 */
router.post('/admin/:id/approve', 
    requireAuth,
    requireRole(['admin', 'finance']),
    PayoutsController.approvePayout
);

/**
 * @route   POST /api/music/payouts/admin/:id/reject
 * @desc    Reject payout request
 * @access  Private (Admin only)
 */
router.post('/admin/:id/reject', 
    requireAuth,
    requireRole(['admin', 'finance']),
    validateRequest('rejectPayout'),
    PayoutsController.rejectPayout
);

/**
 * @route   GET /api/music/payouts/admin/reports/compliance
 * @desc    Get payout compliance reports
 * @access  Private (Admin only)
 */
router.get('/admin/reports/compliance', 
    requireAuth,
    requireRole(['admin', 'finance']),
    PayoutsController.getComplianceReports
);

module.exports = router;
