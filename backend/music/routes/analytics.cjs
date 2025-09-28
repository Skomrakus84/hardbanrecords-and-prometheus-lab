/**
 * Analytics Routes - Advanced Analytics & Reporting API
 * Comprehensive data analytics for music business intelligence
 * Real-time metrics, advanced reporting, and predictive analytics
 */

const express = require('express');
const router = express.Router();

// Import controllers
const AnalyticsController = require('../controllers/analytics.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Dashboard Analytics ==========

/**
 * @route   GET /api/music/analytics/dashboard
 * @desc    Get comprehensive analytics dashboard
 * @access  Private
 */
router.get('/dashboard', 
    requireAuth,
    AnalyticsController.getDashboard
);

/**
 * @route   GET /api/music/analytics/overview
 * @desc    Get high-level analytics overview
 * @access  Private
 */
router.get('/overview', 
    requireAuth,
    AnalyticsController.getOverview
);

/**
 * @route   GET /api/music/analytics/kpis
 * @desc    Get key performance indicators
 * @access  Private
 */
router.get('/kpis', 
    requireAuth,
    AnalyticsController.getKPIs
);

// ========== Streaming Analytics ==========

/**
 * @route   GET /api/music/analytics/streams
 * @desc    Get detailed streaming analytics
 * @access  Private
 */
router.get('/streams', 
    requireAuth,
    validateRequest('getStreamingAnalytics'),
    AnalyticsController.getStreamingAnalytics
);

/**
 * @route   GET /api/music/analytics/streams/trends
 * @desc    Get streaming trends analysis
 * @access  Private
 */
router.get('/streams/trends', 
    requireAuth,
    AnalyticsController.getStreamingTrends
);

/**
 * @route   GET /api/music/analytics/streams/platforms
 * @desc    Get streaming analytics by platform
 * @access  Private
 */
router.get('/streams/platforms', 
    requireAuth,
    AnalyticsController.getStreamingByPlatform
);

/**
 * @route   GET /api/music/analytics/streams/geographic
 * @desc    Get geographic streaming distribution
 * @access  Private
 */
router.get('/streams/geographic', 
    requireAuth,
    AnalyticsController.getGeographicStreaming
);

/**
 * @route   GET /api/music/analytics/streams/realtime
 * @desc    Get real-time streaming data
 * @access  Private
 */
router.get('/streams/realtime', 
    requireAuth,
    AnalyticsController.getRealtimeStreaming
);

// ========== Revenue Analytics ==========

/**
 * @route   GET /api/music/analytics/revenue
 * @desc    Get comprehensive revenue analytics
 * @access  Private
 */
router.get('/revenue', 
    requireAuth,
    validateRequest('getRevenueAnalytics'),
    AnalyticsController.getRevenueAnalytics
);

/**
 * @route   GET /api/music/analytics/revenue/trends
 * @desc    Get revenue trends and forecasting
 * @access  Private
 */
router.get('/revenue/trends', 
    requireAuth,
    AnalyticsController.getRevenueTrends
);

/**
 * @route   GET /api/music/analytics/revenue/sources
 * @desc    Get revenue breakdown by source
 * @access  Private
 */
router.get('/revenue/sources', 
    requireAuth,
    AnalyticsController.getRevenueBySource
);

/**
 * @route   GET /api/music/analytics/revenue/projections
 * @desc    Get revenue projections and forecasts
 * @access  Private
 */
router.get('/revenue/projections', 
    requireAuth,
    AnalyticsController.getRevenueProjections
);

// ========== Audience Analytics ==========

/**
 * @route   GET /api/music/analytics/audience
 * @desc    Get comprehensive audience analytics
 * @access  Private
 */
router.get('/audience', 
    requireAuth,
    AnalyticsController.getAudienceAnalytics
);

/**
 * @route   GET /api/music/analytics/audience/demographics
 * @desc    Get detailed audience demographics
 * @access  Private
 */
router.get('/audience/demographics', 
    requireAuth,
    AnalyticsController.getAudienceDemographics
);

/**
 * @route   GET /api/music/analytics/audience/behavior
 * @desc    Get audience behavior patterns
 * @access  Private
 */
router.get('/audience/behavior', 
    requireAuth,
    AnalyticsController.getAudienceBehavior
);

/**
 * @route   GET /api/music/analytics/audience/engagement
 * @desc    Get audience engagement metrics
 * @access  Private
 */
router.get('/audience/engagement', 
    requireAuth,
    AnalyticsController.getAudienceEngagement
);

/**
 * @route   GET /api/music/analytics/audience/growth
 * @desc    Get audience growth analytics
 * @access  Private
 */
router.get('/audience/growth', 
    requireAuth,
    AnalyticsController.getAudienceGrowth
);

// ========== Platform Analytics ==========

/**
 * @route   GET /api/music/analytics/platforms
 * @desc    Get cross-platform analytics comparison
 * @access  Private
 */
router.get('/platforms', 
    requireAuth,
    AnalyticsController.getPlatformAnalytics
);

/**
 * @route   GET /api/music/analytics/platforms/:platform
 * @desc    Get specific platform analytics
 * @access  Private
 */
router.get('/platforms/:platform', 
    requireAuth,
    AnalyticsController.getSpecificPlatformAnalytics
);

/**
 * @route   GET /api/music/analytics/platforms/comparison
 * @desc    Get platform performance comparison
 * @access  Private
 */
router.get('/platforms/comparison', 
    requireAuth,
    validateRequest('comparePlatforms'),
    AnalyticsController.comparePlatforms
);

// ========== Content Performance ==========

/**
 * @route   GET /api/music/analytics/content/top-performing
 * @desc    Get top-performing content analytics
 * @access  Private
 */
router.get('/content/top-performing', 
    requireAuth,
    AnalyticsController.getTopPerformingContent
);

/**
 * @route   GET /api/music/analytics/content/trending
 * @desc    Get trending content analytics
 * @access  Private
 */
router.get('/content/trending', 
    requireAuth,
    AnalyticsController.getTrendingContent
);

/**
 * @route   GET /api/music/analytics/content/lifecycle
 * @desc    Get content lifecycle analytics
 * @access  Private
 */
router.get('/content/lifecycle', 
    requireAuth,
    AnalyticsController.getContentLifecycle
);

/**
 * @route   GET /api/music/analytics/content/recommendations
 * @desc    Get content strategy recommendations
 * @access  Private
 */
router.get('/content/recommendations', 
    requireAuth,
    AnalyticsController.getContentRecommendations
);

// ========== Market Intelligence ==========

/**
 * @route   GET /api/music/analytics/market/trends
 * @desc    Get market trends and insights
 * @access  Private
 */
router.get('/market/trends', 
    requireAuth,
    AnalyticsController.getMarketTrends
);

/**
 * @route   GET /api/music/analytics/market/competition
 * @desc    Get competitive analysis
 * @access  Private
 */
router.get('/market/competition', 
    requireAuth,
    AnalyticsController.getCompetitiveAnalysis
);

/**
 * @route   GET /api/music/analytics/market/opportunities
 * @desc    Get market opportunities analysis
 * @access  Private
 */
router.get('/market/opportunities', 
    requireAuth,
    AnalyticsController.getMarketOpportunities
);

// ========== Predictive Analytics ==========

/**
 * @route   GET /api/music/analytics/predictions/success
 * @desc    Get content success predictions
 * @access  Private
 */
router.get('/predictions/success', 
    requireAuth,
    validateRequest('getPredictions'),
    AnalyticsController.getSuccessPredictions
);

/**
 * @route   GET /api/music/analytics/predictions/trends
 * @desc    Get future trend predictions
 * @access  Private
 */
router.get('/predictions/trends', 
    requireAuth,
    AnalyticsController.getTrendPredictions
);

/**
 * @route   GET /api/music/analytics/predictions/revenue
 * @desc    Get revenue predictions
 * @access  Private
 */
router.get('/predictions/revenue', 
    requireAuth,
    AnalyticsController.getRevenuePredictions
);

// ========== Custom Reports ==========

/**
 * @route   GET /api/music/analytics/reports
 * @desc    Get saved custom reports
 * @access  Private
 */
router.get('/reports', 
    requireAuth,
    AnalyticsController.getCustomReports
);

/**
 * @route   POST /api/music/analytics/reports
 * @desc    Create custom analytics report
 * @access  Private
 */
router.post('/reports', 
    requireAuth,
    validateRequest('createCustomReport'),
    AnalyticsController.createCustomReport
);

/**
 * @route   GET /api/music/analytics/reports/:id
 * @desc    Get specific custom report
 * @access  Private
 */
router.get('/reports/:id', 
    requireAuth,
    AnalyticsController.getCustomReport
);

/**
 * @route   PUT /api/music/analytics/reports/:id
 * @desc    Update custom report
 * @access  Private
 */
router.put('/reports/:id', 
    requireAuth,
    validateRequest('updateCustomReport'),
    AnalyticsController.updateCustomReport
);

/**
 * @route   DELETE /api/music/analytics/reports/:id
 * @desc    Delete custom report
 * @access  Private
 */
router.delete('/reports/:id', 
    requireAuth,
    AnalyticsController.deleteCustomReport
);

/**
 * @route   POST /api/music/analytics/reports/:id/export
 * @desc    Export custom report
 * @access  Private
 */
router.post('/reports/:id/export', 
    requireAuth,
    validateRequest('exportReport'),
    AnalyticsController.exportCustomReport
);

// ========== Real-time Analytics ==========

/**
 * @route   GET /api/music/analytics/realtime/overview
 * @desc    Get real-time analytics overview
 * @access  Private
 */
router.get('/realtime/overview', 
    requireAuth,
    AnalyticsController.getRealtimeOverview
);

/**
 * @route   GET /api/music/analytics/realtime/events
 * @desc    Get real-time events stream
 * @access  Private
 */
router.get('/realtime/events', 
    requireAuth,
    AnalyticsController.getRealtimeEvents
);

/**
 * @route   GET /api/music/analytics/realtime/metrics
 * @desc    Get real-time metrics monitoring
 * @access  Private
 */
router.get('/realtime/metrics', 
    requireAuth,
    AnalyticsController.getRealtimeMetrics
);

// ========== Admin Analytics ==========

/**
 * @route   GET /api/music/analytics/admin/platform-overview
 * @desc    Get platform-wide analytics overview
 * @access  Private (Admin only)
 */
router.get('/admin/platform-overview', 
    requireAuth,
    requireRole(['admin']),
    AnalyticsController.getPlatformOverview
);

/**
 * @route   GET /api/music/analytics/admin/user-analytics
 * @desc    Get user behavior analytics
 * @access  Private (Admin only)
 */
router.get('/admin/user-analytics', 
    requireAuth,
    requireRole(['admin']),
    AnalyticsController.getUserAnalytics
);

/**
 * @route   GET /api/music/analytics/admin/system-performance
 * @desc    Get system performance metrics
 * @access  Private (Admin only)
 */
router.get('/admin/system-performance', 
    requireAuth,
    requireRole(['admin']),
    AnalyticsController.getSystemPerformance
);

module.exports = router;
