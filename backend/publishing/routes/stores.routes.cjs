/**
 * Publishing Store Routes - Store Integration API
 */

const express = require('express');
const router = express.Router();
const PublishingStoreController = require('../controllers/store.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// Public endpoints

// Get available publishing stores
router.get('/', PublishingStoreController.getStores);

// Protected endpoints (require authentication)
router.use(auth);

// Submit publication to stores
router.post('/publications/:publicationId/submit', PublishingStoreController.submitToStores);

// Get submission status for publication
router.get('/publications/:publicationId/status', PublishingStoreController.getSubmissionStatus);

// Get store analytics
router.get('/analytics', PublishingStoreController.getStoreAnalytics);

// Get store performance metrics
router.get('/performance', PublishingStoreController.getStorePerformance);

// Get submission history
router.get('/submissions/history', PublishingStoreController.getSubmissionHistory);

// Retry failed submission
router.post('/submissions/:submissionId/retry', PublishingStoreController.retrySubmission);

// Cancel pending submission
router.delete('/submissions/:submissionId/cancel', PublishingStoreController.cancelSubmission);

// Admin endpoints
router.use('/admin', authRole(['admin', 'publishing']));

// Update submission status (webhooks/admin)
router.patch('/admin/submissions/:submissionId/status', PublishingStoreController.updateSubmissionStatus);

// Sync sales data from stores
router.post('/admin/sync-sales', PublishingStoreController.syncSalesData);

module.exports = router;
