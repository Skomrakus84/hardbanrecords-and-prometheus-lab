/**
 * Releases Routes - Release Management API Endpoints
 * Provides comprehensive RESTful routes for music release lifecycle
 * Implements advanced release management, distribution, and analytics
 */

const express = require('express');
const router = express.Router();

// Import controllers
const ReleaseController = require('../controllers/release.controller.cjs');
const DistributionController = require('../controllers/distribution.controller.cjs');
const AnalyticsController = require('../controllers/analytics.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Release CRUD Operations ==========

/**
 * @route   GET /api/music/releases
 * @desc    List releases with advanced filtering and pagination
 * @access  Private
 */
router.get('/', 
    requireAuth,
    ReleaseController.listReleases
);

/**
 * @route   POST /api/music/releases
 * @desc    Create new release with comprehensive setup
 * @access  Private
 */
router.post('/', 
    requireAuth,
    validateRequest('createRelease'),
    ReleaseController.createRelease
);

/**
 * @route   GET /api/music/releases/:id
 * @desc    Get release with complete details and analytics
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    ReleaseController.getRelease
);

/**
 * @route   PUT /api/music/releases/:id
 * @desc    Update release with workflow management
 * @access  Private
 */
router.put('/:id', 
    requireAuth,
    validateRequest('updateRelease'),
    ReleaseController.updateRelease
);

/**
 * @route   DELETE /api/music/releases/:id
 * @desc    Delete release with comprehensive cleanup
 * @access  Private (Artist or Admin)
 */
router.delete('/:id', 
    requireAuth,
    ReleaseController.deleteRelease
);

// ========== Release Workflow Management ==========

/**
 * @route   POST /api/music/releases/:id/submit
 * @desc    Submit release for distribution review
 * @access  Private
 */
router.post('/:id/submit', 
    requireAuth,
    validateRequest('submitRelease'),
    ReleaseController.submitForReview
);

/**
 * @route   POST /api/music/releases/:id/approve
 * @desc    Approve release for distribution
 * @access  Private (Admin only)
 */
router.post('/:id/approve', 
    requireAuth,
    requireRole(['admin', 'moderator']),
    ReleaseController.approveRelease
);

/**
 * @route   POST /api/music/releases/:id/distribute
 * @desc    Start distribution to selected platforms
 * @access  Private
 */
router.post('/:id/distribute', 
    requireAuth,
    validateRequest('distributeRelease'),
    DistributionController.startDistribution
);

/**
 * @route   POST /api/music/releases/:id/takedown
 * @desc    Takedown release from platforms
 * @access  Private
 */
router.post('/:id/takedown', 
    requireAuth,
    validateRequest('takedownRelease'),
    DistributionController.takedownRelease
);

// ========== Release Analytics ==========

/**
 * @route   GET /api/music/releases/:id/analytics
 * @desc    Get release analytics and performance metrics
 * @access  Private
 */
router.get('/:id/analytics', 
    requireAuth,
    AnalyticsController.getReleaseAnalytics
);

/**
 * @route   GET /api/music/releases/:id/streams
 * @desc    Get release streaming data across platforms
 * @access  Private
 */
router.get('/:id/streams', 
    requireAuth,
    AnalyticsController.getReleaseStreams
);

/**
 * @route   GET /api/music/releases/:id/revenue
 * @desc    Get release revenue and royalty data
 * @access  Private
 */
router.get('/:id/revenue', 
    requireAuth,
    AnalyticsController.getReleaseRevenue
);

// ========== Release Distribution Status ==========

/**
 * @route   GET /api/music/releases/:id/distribution-status
 * @desc    Get distribution status across all platforms
 * @access  Private
 */
router.get('/:id/distribution-status', 
    requireAuth,
    DistributionController.getDistributionStatus
);

/**
 * @route   GET /api/music/releases/:id/platforms
 * @desc    Get platform-specific release information
 * @access  Private
 */
router.get('/:id/platforms', 
    requireAuth,
    DistributionController.getPlatformInfo
);

// ========== Release Tracks Management ==========

/**
 * @route   GET /api/music/releases/:id/tracks
 * @desc    Get all tracks for a release
 * @access  Private
 */
router.get('/:id/tracks', 
    requireAuth,
    ReleaseController.getReleaseTracks
);

/**
 * @route   POST /api/music/releases/:id/tracks
 * @desc    Add track to release
 * @access  Private
 */
router.post('/:id/tracks', 
    requireAuth,
    validateRequest('addTrackToRelease'),
    ReleaseController.addTrackToRelease
);

/**
 * @route   PUT /api/music/releases/:id/tracks/:trackId
 * @desc    Update track position in release
 * @access  Private
 */
router.put('/:id/tracks/:trackId', 
    requireAuth,
    validateRequest('updateTrackInRelease'),
    ReleaseController.updateTrackInRelease
);

/**
 * @route   DELETE /api/music/releases/:id/tracks/:trackId
 * @desc    Remove track from release
 * @access  Private
 */
router.delete('/:id/tracks/:trackId', 
    requireAuth,
    ReleaseController.removeTrackFromRelease
);

/**
 * @route   POST /api/music/releases/:id/tracks/reorder
 * @desc    Reorder tracks in release
 * @access  Private
 */
router.post('/:id/tracks/reorder', 
    requireAuth,
    validateRequest('reorderTracks'),
    ReleaseController.reorderTracks
);

// ========== Release Metadata Management ==========

/**
 * @route   GET /api/music/releases/:id/metadata
 * @desc    Get release metadata for all platforms
 * @access  Private
 */
router.get('/:id/metadata', 
    requireAuth,
    ReleaseController.getReleaseMetadata
);

/**
 * @route   PUT /api/music/releases/:id/metadata
 * @desc    Update release metadata
 * @access  Private
 */
router.put('/:id/metadata', 
    requireAuth,
    validateRequest('updateReleaseMetadata'),
    ReleaseController.updateReleaseMetadata
);

// ========== Release Collaborators ==========

/**
 * @route   GET /api/music/releases/:id/collaborators
 * @desc    Get release collaborators and splits
 * @access  Private
 */
router.get('/:id/collaborators', 
    requireAuth,
    ReleaseController.getReleaseCollaborators
);

/**
 * @route   POST /api/music/releases/:id/collaborators
 * @desc    Add collaborator to release
 * @access  Private
 */
router.post('/:id/collaborators', 
    requireAuth,
    validateRequest('addCollaborator'),
    ReleaseController.addCollaborator
);

/**
 * @route   PUT /api/music/releases/:id/collaborators/:collaboratorId
 * @desc    Update collaborator split percentages
 * @access  Private
 */
router.put('/:id/collaborators/:collaboratorId', 
    requireAuth,
    validateRequest('updateCollaboratorSplit'),
    ReleaseController.updateCollaboratorSplit
);

/**
 * @route   DELETE /api/music/releases/:id/collaborators/:collaboratorId
 * @desc    Remove collaborator from release
 * @access  Private
 */
router.delete('/:id/collaborators/:collaboratorId', 
    requireAuth,
    ReleaseController.removeCollaborator
);

// ========== Release Version Control ==========

/**
 * @route   GET /api/music/releases/:id/versions
 * @desc    Get release version history
 * @access  Private
 */
router.get('/:id/versions', 
    requireAuth,
    ReleaseController.getReleaseVersions
);

/**
 * @route   POST /api/music/releases/:id/versions
 * @desc    Create new release version
 * @access  Private
 */
router.post('/:id/versions', 
    requireAuth,
    validateRequest('createReleaseVersion'),
    ReleaseController.createReleaseVersion
);

/**
 * @route   POST /api/music/releases/:id/versions/:versionId/restore
 * @desc    Restore release to specific version
 * @access  Private
 */
router.post('/:id/versions/:versionId/restore', 
    requireAuth,
    ReleaseController.restoreReleaseVersion
);

module.exports = router;
