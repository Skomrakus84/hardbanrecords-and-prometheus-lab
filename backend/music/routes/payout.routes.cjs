/**
 * Payout Routes - Complete Payout Management API Endpoints
 */

const express = require('express');
const router = express.Router();
const PayoutController = require('../controllers/payout.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// Validation middleware for payout requests
const validatePayoutRequest = (req, res, next) => {
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid amount is required'
        });
    }

    if (!paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'Payment method is required'
        });
    }

    if (!paymentDetails || typeof paymentDetails !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Payment details are required'
        });
    }

    next();
};

// User endpoints (require authentication)
router.use(auth); // All payout routes require authentication

// Get user's payouts
router.get('/', PayoutController.getPayouts);

// Get user's balance
router.get('/balance', PayoutController.getBalance);

// Get payout statistics
router.get('/statistics', PayoutController.getPayoutStatistics);

// Get supported payment methods
router.get('/payment-methods', PayoutController.getPaymentMethods);

// Get minimum payout amount
router.get('/minimum-amount', PayoutController.getMinimumAmount);

// Request new payout
router.post('/', validatePayoutRequest, PayoutController.requestPayout);

// Get specific payout
router.get('/:payoutId', PayoutController.getPayoutById);

// Cancel payout
router.delete('/:payoutId', PayoutController.cancelPayout);

// Admin endpoints (require admin role)
router.use('/admin', authRole(['admin', 'finance'])); // Admin and finance roles only

// Get all pending payouts
router.get('/admin/pending', PayoutController.getPendingPayouts);

// Get payout analytics
router.get('/admin/analytics', PayoutController.getPayoutAnalytics);

// Process payout
router.patch('/admin/:payoutId/process', PayoutController.processPayout);

// Complete payout
router.patch('/admin/:payoutId/complete', PayoutController.completePayout);

module.exports = router;
