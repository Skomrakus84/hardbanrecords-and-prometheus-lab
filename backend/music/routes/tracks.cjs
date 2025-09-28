/**
 * Tracks Routes - Individual Track Management API
 * Comprehensive track-level operations and analytics
 * Advanced audio processing and metadata management
 */

const express = require('express');
const router = express.Router();

// Import controllers
const TrackController = require('../controllers/track.controller.cjs');
const AnalyticsController = require('../controllers/analytics.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Track CRUD Operations ==========

/**
 * @route   GET /api/music/tracks
 * @desc    List tracks with advanced search and filtering
 * @access  Private
 */
router.get('/', 
    requireAuth,
    TrackController.listTracks
);

/**
 * @route   POST /api/music/tracks
 * @desc    Create new track with audio processing
 * @access  Private
 */
router.post('/', 
    requireAuth,
    validateRequest('createTrack'),
    TrackController.createTrack
);

/**
 * @route   GET /api/music/tracks/:id
 * @desc    Get track details with analytics
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    TrackController.getTrack
);

/**
 * @route   PUT /api/music/tracks/:id
 * @desc    Update track metadata and settings
 * @access  Private
 */
router.put('/:id', 
    requireAuth,
    validateRequest('updateTrack'),
    TrackController.updateTrack
);

/**
 * @route   DELETE /api/music/tracks/:id
 * @desc    Delete track with dependency checks
 * @access  Private
 */
router.delete('/:id', 
    requireAuth,
    TrackController.deleteTrack
);

// ========== Track Audio Management ==========

/**
 * @route   POST /api/music/tracks/:id/audio
 * @desc    Upload track audio file with processing
 * @access  Private
 */
router.post('/:id/audio', 
    requireAuth,
    validateRequest('uploadTrackAudio'),
    TrackController.uploadAudio
);

/**
 * @route   GET /api/music/tracks/:id/audio
 * @desc    Get track audio file information
 * @access  Private
 */
router.get('/:id/audio', 
    requireAuth,
    TrackController.getAudioInfo
);

/**
 * @route   POST /api/music/tracks/:id/audio/process
 * @desc    Trigger audio processing pipeline
 * @access  Private
 */
router.post('/:id/audio/process', 
    requireAuth,
    TrackController.processAudio
);

/**
 * @route   GET /api/music/tracks/:id/audio/waveform
 * @desc    Get track waveform data
 * @access  Private
 */
router.get('/:id/audio/waveform', 
    requireAuth,
    TrackController.getWaveform
);

/**
 * @route   POST /api/music/tracks/:id/audio/preview
 * @desc    Generate track preview clips
 * @access  Private
 */
router.post('/:id/audio/preview', 
    requireAuth,
    validateRequest('generatePreview'),
    TrackController.generatePreview
);

// ========== Track Metadata ==========

/**
 * @route   GET /api/music/tracks/:id/metadata
 * @desc    Get comprehensive track metadata
 * @access  Private
 */
router.get('/:id/metadata', 
    requireAuth,
    TrackController.getTrackMetadata
);

/**
 * @route   PUT /api/music/tracks/:id/metadata
 * @desc    Update track metadata
 * @access  Private
 */
router.put('/:id/metadata', 
    requireAuth,
    validateRequest('updateTrackMetadata'),
    TrackController.updateTrackMetadata
);

/**
 * @route   POST /api/music/tracks/:id/metadata/extract
 * @desc    Extract metadata from audio file
 * @access  Private
 */
router.post('/:id/metadata/extract', 
    requireAuth,
    TrackController.extractAudioMetadata
);

// ========== Track Analytics ==========

/**
 * @route   GET /api/music/tracks/:id/analytics
 * @desc    Get track performance analytics
 * @access  Private
 */
router.get('/:id/analytics', 
    requireAuth,
    AnalyticsController.getTrackAnalytics
);

/**
 * @route   GET /api/music/tracks/:id/streams
 * @desc    Get track streaming statistics
 * @access  Private
 */
router.get('/:id/streams', 
    requireAuth,
    AnalyticsController.getTrackStreams
);

/**
 * @route   GET /api/music/tracks/:id/demographics
 * @desc    Get track listener demographics
 * @access  Private
 */
router.get('/:id/demographics', 
    requireAuth,
    AnalyticsController.getTrackDemographics
);

/**
 * @route   GET /api/music/tracks/:id/platforms
 * @desc    Get track performance by platform
 * @access  Private
 */
router.get('/:id/platforms', 
    requireAuth,
    AnalyticsController.getTrackPlatformStats
);

// ========== Track Rights & Credits ==========

/**
 * @route   GET /api/music/tracks/:id/credits
 * @desc    Get track credits and contributors
 * @access  Private
 */
router.get('/:id/credits', 
    requireAuth,
    TrackController.getTrackCredits
);

/**
 * @route   POST /api/music/tracks/:id/credits
 * @desc    Add credit to track
 * @access  Private
 */
router.post('/:id/credits', 
    requireAuth,
    validateRequest('addTrackCredit'),
    TrackController.addTrackCredit
);

/**
 * @route   PUT /api/music/tracks/:id/credits/:creditId
 * @desc    Update track credit information
 * @access  Private
 */
router.put('/:id/credits/:creditId', 
    requireAuth,
    validateRequest('updateTrackCredit'),
    TrackController.updateTrackCredit
);

/**
 * @route   DELETE /api/music/tracks/:id/credits/:creditId
 * @desc    Remove credit from track
 * @access  Private
 */
router.delete('/:id/credits/:creditId', 
    requireAuth,
    TrackController.removeTrackCredit
);

/**
 * @route   GET /api/music/tracks/:id/splits
 * @desc    Get track royalty splits
 * @access  Private
 */
router.get('/:id/splits', 
    requireAuth,
    TrackController.getTrackSplits
);

/**
 * @route   PUT /api/music/tracks/:id/splits
 * @desc    Update track royalty splits
 * @access  Private
 */
router.put('/:id/splits', 
    requireAuth,
    validateRequest('updateTrackSplits'),
    TrackController.updateTrackSplits
);

// ========== Track Versions ==========

/**
 * @route   GET /api/music/tracks/:id/versions
 * @desc    Get track versions (remixes, edits, etc.)
 * @access  Private
 */
router.get('/:id/versions', 
    requireAuth,
    TrackController.getTrackVersions
);

/**
 * @route   POST /api/music/tracks/:id/versions
 * @desc    Create new track version
 * @access  Private
 */
router.post('/:id/versions', 
    requireAuth,
    validateRequest('createTrackVersion'),
    TrackController.createTrackVersion
);

/**
 * @route   PUT /api/music/tracks/:id/versions/:versionId
 * @desc    Update track version
 * @access  Private
 */
router.put('/:id/versions/:versionId', 
    requireAuth,
    validateRequest('updateTrackVersion'),
    TrackController.updateTrackVersion
);

/**
 * @route   DELETE /api/music/tracks/:id/versions/:versionId
 * @desc    Delete track version
 * @access  Private
 */
router.delete('/:id/versions/:versionId', 
    requireAuth,
    TrackController.deleteTrackVersion
);

// ========== Track Sync & Licensing ==========

/**
 * @route   GET /api/music/tracks/:id/licensing
 * @desc    Get track licensing information
 * @access  Private
 */
router.get('/:id/licensing', 
    requireAuth,
    TrackController.getTrackLicensing
);

/**
 * @route   POST /api/music/tracks/:id/licensing
 * @desc    Create track licensing agreement
 * @access  Private
 */
router.post('/:id/licensing', 
    requireAuth,
    validateRequest('createTrackLicense'),
    TrackController.createTrackLicense
);

/**
 * @route   GET /api/music/tracks/:id/sync-opportunities
 * @desc    Get sync placement opportunities
 * @access  Private
 */
router.get('/:id/sync-opportunities', 
    requireAuth,
    TrackController.getSyncOpportunities
);

// ========== Track Quality Control ==========

/**
 * @route   POST /api/music/tracks/:id/quality-check
 * @desc    Run quality control checks on track
 * @access  Private
 */
router.post('/:id/quality-check', 
    requireAuth,
    TrackController.runQualityCheck
);

/**
 * @route   GET /api/music/tracks/:id/quality-report
 * @desc    Get track quality control report
 * @access  Private
 */
router.get('/:id/quality-report', 
    requireAuth,
    TrackController.getQualityReport
);

/**
 * @route   POST /api/music/tracks/:id/loudness-analysis
 * @desc    Analyze track loudness standards
 * @access  Private
 */
router.post('/:id/loudness-analysis', 
    requireAuth,
    TrackController.analyzeLoudness
);

// ========== Track Collaboration ==========

/**
 * @route   POST /api/music/tracks/:id/collaborate
 * @desc    Invite collaborator to track
 * @access  Private
 */
router.post('/:id/collaborate', 
    requireAuth,
    validateRequest('inviteCollaborator'),
    TrackController.inviteCollaborator
);

/**
 * @route   GET /api/music/tracks/:id/collaborators
 * @desc    Get track collaborators
 * @access  Private
 */
router.get('/:id/collaborators', 
    requireAuth,
    TrackController.getTrackCollaborators
);

/**
 * @route   PUT /api/music/tracks/:id/collaborators/:collaboratorId/permissions
 * @desc    Update collaborator permissions
 * @access  Private
 */
router.put('/:id/collaborators/:collaboratorId/permissions', 
    requireAuth,
    validateRequest('updateCollaboratorPermissions'),
    TrackController.updateCollaboratorPermissions
);

module.exports = router;
