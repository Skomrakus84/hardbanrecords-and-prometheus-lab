/**
 * Distribution Routes - Real-time Distribution Status Tracking API
 */

const express = require('express');
const router = express.Router();
const DistributionController = require('../controllers/distribution.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// Public endpoints

// Get available distribution platforms
router.get('/platforms', DistributionController.getDistributionPlatforms);

// Protected endpoints (require authentication)
router.use(auth);

// Get distribution status for specific release
router.get('/release/:releaseId/status', DistributionController.getDistributionStatus);

// Distribute release to platforms
router.post('/release/:releaseId/distribute', DistributionController.distributeRelease);

// Get distribution analytics
router.get('/analytics', DistributionController.getDistributionAnalytics);

// Get distribution history
router.get('/history', DistributionController.getDistributionHistory);

// Retry failed distribution
router.post('/retry/:distributionId', DistributionController.retryDistribution);

// Cancel pending distribution
router.delete('/cancel/:distributionId', DistributionController.cancelDistribution);

// Admin endpoints
router.use('/admin', authRole(['admin', 'distribution']));

// Update distribution status (for webhooks/admin)
router.patch('/admin/status/:distributionId', DistributionController.updateDistributionStatus);

// Check pending distributions manually
router.post('/admin/check-pending', DistributionController.checkPendingDistributions);

module.exports = router;
