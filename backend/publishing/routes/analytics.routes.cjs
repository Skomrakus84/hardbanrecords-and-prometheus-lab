/**
 * Publishing Analytics Routes
 * Sales tracking, performance analytics, and reporting API
 */

const express = require('express');
const router = express.Router();
const PublishingAnalyticsController = require('../controllers/analytics.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// All analytics routes require authentication
router.use(auth);

// Dashboard analytics
router.get('/dashboard', PublishingAnalyticsController.getDashboard);

// Sales analytics
router.get('/sales', PublishingAnalyticsController.getSalesAnalytics);

// Revenue analytics
router.get('/revenue', PublishingAnalyticsController.getRevenueAnalytics);

// Geographic analytics
router.get('/geographic', PublishingAnalyticsController.getGeographicAnalytics);

// Publication-specific analytics
router.get('/publications/:publicationId', PublishingAnalyticsController.getPublicationAnalytics);

// Real-time sales data
router.get('/real-time', PublishingAnalyticsController.getRealTimeSales);

// Analytics comparison between periods
router.get('/comparison', PublishingAnalyticsController.getComparison);

// Top performing content
router.get('/top-performing', PublishingAnalyticsController.getTopPerforming);

// Generate and download reports
router.get('/reports/generate', PublishingAnalyticsController.generateReport);

// Admin endpoints
router.use('/admin', authRole(['admin', 'analytics']));

// Admin can view any user's analytics (would need additional implementation)

module.exports = router;
