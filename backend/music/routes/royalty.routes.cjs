/**
 * Royalty Routes - Complete Royalty Management API
 */

const express = require('express');
const router = express.Router();
const RoyaltyController = require('../controllers/royalty.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// All royalty routes require authentication
router.use(auth);

// Get user's royalty statements
router.get('/statements', RoyaltyController.getRoyaltyStatements);

// Get specific royalty statement
router.get('/statements/:statementId', RoyaltyController.getRoyaltyStatementById);

// Export royalty statement
router.get('/statements/:statementId/export', RoyaltyController.exportRoyaltyStatement);

// Get royalty balance
router.get('/balance', RoyaltyController.getRoyaltyBalance);

// Get royalty analytics
router.get('/analytics', RoyaltyController.getRoyaltyAnalytics);

// Split management
router.get('/splits', RoyaltyController.getRoyaltySplits);
router.post('/splits', RoyaltyController.createRoyaltySplit);
router.put('/splits/:splitId', RoyaltyController.updateRoyaltySplit);
router.delete('/splits/:splitId', RoyaltyController.deleteRoyaltySplit);

// Admin endpoints
router.use('/admin', authRole(['admin', 'finance']));

// Generate royalty statements (admin)
router.post('/admin/statements/generate', RoyaltyController.generateRoyaltyStatements);

// Process royalty calculations (admin)
router.post('/admin/calculate', RoyaltyController.calculateRoyalties);

module.exports = router;
