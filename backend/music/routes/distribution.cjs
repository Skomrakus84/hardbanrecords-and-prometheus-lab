/**
 * Distribution Routes - Music Distribution Management API
 * Advanced distribution to streaming platforms and digital stores
 * Comprehensive platform management and delivery tracking
 */

const express = require('express');
const router = express.Router();

// Import controllers
const DistributionController = require('../controllers/distribution.controller.cjs');
const AnalyticsController = require('../controllers/analytics.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Distribution Overview ==========

/**
 * @route   GET /api/music/distribution/overview
 * @desc    Get distribution dashboard overview
 * @access  Private
 */
router.get('/overview', 
    requireAuth,
    DistributionController.getDistributionOverview
);

/**
 * @route   GET /api/music/distribution/status
 * @desc    Get current distribution status summary
 * @access  Private
 */
router.get('/status', 
    requireAuth,
    DistributionController.getDistributionStatus
);

// ========== Platform Management ==========

/**
 * @route   GET /api/music/distribution/platforms
 * @desc    Get available distribution platforms
 * @access  Private
 */
router.get('/platforms', 
    requireAuth,
    DistributionController.getAvailablePlatforms
);

/**
 * @route   GET /api/music/distribution/platforms/:platform
 * @desc    Get specific platform information and requirements
 * @access  Private
 */
router.get('/platforms/:platform', 
    requireAuth,
    DistributionController.getPlatformInfo
);

/**
 * @route   GET /api/music/distribution/platforms/:platform/requirements
 * @desc    Get platform-specific requirements and guidelines
 * @access  Private
 */
router.get('/platforms/:platform/requirements', 
    requireAuth,
    DistributionController.getPlatformRequirements
);

/**
 * @route   POST /api/music/distribution/platforms/:platform/connect
 * @desc    Connect to distribution platform
 * @access  Private
 */
router.post('/platforms/:platform/connect', 
    requireAuth,
    validateRequest('connectPlatform'),
    DistributionController.connectPlatform
);

/**
 * @route   DELETE /api/music/distribution/platforms/:platform/disconnect
 * @desc    Disconnect from distribution platform
 * @access  Private
 */
router.delete('/platforms/:platform/disconnect', 
    requireAuth,
    DistributionController.disconnectPlatform
);

// ========== Release Distribution ==========

/**
 * @route   POST /api/music/distribution/releases/:releaseId/distribute
 * @desc    Start distribution process for release
 * @access  Private
 */
router.post('/releases/:releaseId/distribute', 
    requireAuth,
    validateRequest('distributeRelease'),
    DistributionController.distributeRelease
);

/**
 * @route   GET /api/music/distribution/releases/:releaseId/status
 * @desc    Get release distribution status across platforms
 * @access  Private
 */
router.get('/releases/:releaseId/status', 
    requireAuth,
    DistributionController.getReleaseDistributionStatus
);

/**
 * @route   PUT /api/music/distribution/releases/:releaseId/update
 * @desc    Update distributed release across platforms
 * @access  Private
 */
router.put('/releases/:releaseId/update', 
    requireAuth,
    validateRequest('updateDistributedRelease'),
    DistributionController.updateDistributedRelease
);

/**
 * @route   POST /api/music/distribution/releases/:releaseId/takedown
 * @desc    Takedown release from all or specific platforms
 * @access  Private
 */
router.post('/releases/:releaseId/takedown', 
    requireAuth,
    validateRequest('takedownRelease'),
    DistributionController.takedownRelease
);

/**
 * @route   GET /api/music/distribution/releases/:releaseId/timeline
 * @desc    Get release distribution timeline and history
 * @access  Private
 */
router.get('/releases/:releaseId/timeline', 
    requireAuth,
    DistributionController.getDistributionTimeline
);

// ========== Platform-Specific Distribution ==========

/**
 * @route   POST /api/music/distribution/releases/:releaseId/platforms/:platform
 * @desc    Distribute release to specific platform
 * @access  Private
 */
router.post('/releases/:releaseId/platforms/:platform', 
    requireAuth,
    validateRequest('distributeToPlatform'),
    DistributionController.distributeToPlatform
);

/**
 * @route   GET /api/music/distribution/releases/:releaseId/platforms/:platform/status
 * @desc    Get release status on specific platform
 * @access  Private
 */
router.get('/releases/:releaseId/platforms/:platform/status', 
    requireAuth,
    DistributionController.getPlatformReleaseStatus
);

/**
 * @route   PUT /api/music/distribution/releases/:releaseId/platforms/:platform
 * @desc    Update release on specific platform
 * @access  Private
 */
router.put('/releases/:releaseId/platforms/:platform', 
    requireAuth,
    validateRequest('updatePlatformRelease'),
    DistributionController.updatePlatformRelease
);

/**
 * @route   DELETE /api/music/distribution/releases/:releaseId/platforms/:platform
 * @desc    Remove release from specific platform
 * @access  Private
 */
router.delete('/releases/:releaseId/platforms/:platform', 
    requireAuth,
    DistributionController.removeFromPlatform
);

// ========== Distribution Analytics ==========

/**
 * @route   GET /api/music/distribution/analytics/overview
 * @desc    Get distribution analytics overview
 * @access  Private
 */
router.get('/analytics/overview', 
    requireAuth,
    AnalyticsController.getDistributionAnalytics
);

/**
 * @route   GET /api/music/distribution/analytics/platforms
 * @desc    Get platform performance analytics
 * @access  Private
 */
router.get('/analytics/platforms', 
    requireAuth,
    AnalyticsController.getPlatformPerformance
);

/**
 * @route   GET /api/music/distribution/analytics/success-rates
 * @desc    Get distribution success rates by platform
 * @access  Private
 */
router.get('/analytics/success-rates', 
    requireAuth,
    AnalyticsController.getDistributionSuccessRates
);

/**
 * @route   GET /api/music/distribution/analytics/timeline
 * @desc    Get distribution timeline analytics
 * @access  Private
 */
router.get('/analytics/timeline', 
    requireAuth,
    AnalyticsController.getDistributionTimelineAnalytics
);

// ========== Quality Control ==========

/**
 * @route   POST /api/music/distribution/releases/:releaseId/quality-check
 * @desc    Run quality control checks before distribution
 * @access  Private
 */
router.post('/releases/:releaseId/quality-check', 
    requireAuth,
    DistributionController.runQualityCheck
);

/**
 * @route   GET /api/music/distribution/releases/:releaseId/quality-report
 * @desc    Get quality control report
 * @access  Private
 */
router.get('/releases/:releaseId/quality-report', 
    requireAuth,
    DistributionController.getQualityReport
);

/**
 * @route   POST /api/music/distribution/releases/:releaseId/fix-issues
 * @desc    Automatically fix common distribution issues
 * @access  Private
 */
router.post('/releases/:releaseId/fix-issues', 
    requireAuth,
    DistributionController.fixDistributionIssues
);

// ========== Bulk Operations ==========

/**
 * @route   POST /api/music/distribution/bulk/distribute
 * @desc    Bulk distribute multiple releases
 * @access  Private
 */
router.post('/bulk/distribute', 
    requireAuth,
    validateRequest('bulkDistribute'),
    DistributionController.bulkDistribute
);

/**
 * @route   POST /api/music/distribution/bulk/update
 * @desc    Bulk update multiple releases
 * @access  Private
 */
router.post('/bulk/update', 
    requireAuth,
    validateRequest('bulkUpdate'),
    DistributionController.bulkUpdate
);

/**
 * @route   POST /api/music/distribution/bulk/takedown
 * @desc    Bulk takedown multiple releases
 * @access  Private
 */
router.post('/bulk/takedown', 
    requireAuth,
    validateRequest('bulkTakedown'),
    DistributionController.bulkTakedown
);

/**
 * @route   GET /api/music/distribution/bulk/status/:jobId
 * @desc    Get bulk operation status
 * @access  Private
 */
router.get('/bulk/status/:jobId', 
    requireAuth,
    DistributionController.getBulkOperationStatus
);

// ========== Distribution Templates ==========

/**
 * @route   GET /api/music/distribution/templates
 * @desc    Get distribution templates
 * @access  Private
 */
router.get('/templates', 
    requireAuth,
    DistributionController.getDistributionTemplates
);

/**
 * @route   POST /api/music/distribution/templates
 * @desc    Create distribution template
 * @access  Private
 */
router.post('/templates', 
    requireAuth,
    validateRequest('createDistributionTemplate'),
    DistributionController.createDistributionTemplate
);

/**
 * @route   GET /api/music/distribution/templates/:id
 * @desc    Get specific distribution template
 * @access  Private
 */
router.get('/templates/:id', 
    requireAuth,
    DistributionController.getDistributionTemplate
);

/**
 * @route   PUT /api/music/distribution/templates/:id
 * @desc    Update distribution template
 * @access  Private
 */
router.put('/templates/:id', 
    requireAuth,
    validateRequest('updateDistributionTemplate'),
    DistributionController.updateDistributionTemplate
);

/**
 * @route   DELETE /api/music/distribution/templates/:id
 * @desc    Delete distribution template
 * @access  Private
 */
router.delete('/templates/:id', 
    requireAuth,
    DistributionController.deleteDistributionTemplate
);

/**
 * @route   POST /api/music/distribution/templates/:id/apply
 * @desc    Apply distribution template to release
 * @access  Private
 */
router.post('/templates/:id/apply', 
    requireAuth,
    validateRequest('applyDistributionTemplate'),
    DistributionController.applyDistributionTemplate
);

// ========== Error Handling & Monitoring ==========

/**
 * @route   GET /api/music/distribution/errors
 * @desc    Get distribution errors and issues
 * @access  Private
 */
router.get('/errors', 
    requireAuth,
    DistributionController.getDistributionErrors
);

/**
 * @route   GET /api/music/distribution/errors/:errorId
 * @desc    Get specific distribution error details
 * @access  Private
 */
router.get('/errors/:errorId', 
    requireAuth,
    DistributionController.getDistributionError
);

/**
 * @route   POST /api/music/distribution/errors/:errorId/resolve
 * @desc    Mark distribution error as resolved
 * @access  Private
 */
router.post('/errors/:errorId/resolve', 
    requireAuth,
    DistributionController.resolveDistributionError
);

/**
 * @route   POST /api/music/distribution/errors/:errorId/retry
 * @desc    Retry failed distribution operation
 * @access  Private
 */
router.post('/errors/:errorId/retry', 
    requireAuth,
    DistributionController.retryDistributionOperation
);

// ========== Admin Distribution Management ==========

/**
 * @route   GET /api/music/distribution/admin/platform-health
 * @desc    Get platform health monitoring
 * @access  Private (Admin only)
 */
router.get('/admin/platform-health', 
    requireAuth,
    requireRole(['admin']),
    DistributionController.getPlatformHealth
);

/**
 * @route   GET /api/music/distribution/admin/system-status
 * @desc    Get distribution system status
 * @access  Private (Admin only)
 */
router.get('/admin/system-status', 
    requireAuth,
    requireRole(['admin']),
    DistributionController.getSystemStatus
);

/**
 * @route   POST /api/music/distribution/admin/platform/:platform/maintenance
 * @desc    Put platform in maintenance mode
 * @access  Private (Admin only)
 */
router.post('/admin/platform/:platform/maintenance', 
    requireAuth,
    requireRole(['admin']),
    DistributionController.setPlatformMaintenance
);

module.exports = router;
