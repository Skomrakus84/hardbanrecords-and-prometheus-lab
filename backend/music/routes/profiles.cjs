/**
 * Profiles Routes - Artist & Label Profile Management
 * Comprehensive profile operations with social features
 * Advanced reputation and engagement tracking
 */

const express = require('express');
const router = express.Router();

// Import controllers
const ProfilesController = require('../controllers/profiles.controller.cjs');
const AnalyticsController = require('../controllers/analytics.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Profile CRUD Operations ==========

/**
 * @route   GET /api/music/profiles
 * @desc    List profiles with discovery features
 * @access  Public/Private
 */
router.get('/', 
    ProfilesController.listProfiles
);

/**
 * @route   POST /api/music/profiles
 * @desc    Create new artist/label profile
 * @access  Private
 */
router.post('/', 
    requireAuth,
    validateRequest('createProfile'),
    ProfilesController.createProfile
);

/**
 * @route   GET /api/music/profiles/:id
 * @desc    Get profile with complete information
 * @access  Public
 */
router.get('/:id', 
    ProfilesController.getProfile
);

/**
 * @route   PUT /api/music/profiles/:id
 * @desc    Update profile information
 * @access  Private (Owner or Admin)
 */
router.put('/:id', 
    requireAuth,
    validateRequest('updateProfile'),
    ProfilesController.updateProfile
);

/**
 * @route   DELETE /api/music/profiles/:id
 * @desc    Delete profile with comprehensive cleanup
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', 
    requireAuth,
    requireRole(['admin']),
    ProfilesController.deleteProfile
);

// ========== Profile Media Management ==========

/**
 * @route   POST /api/music/profiles/:id/avatar
 * @desc    Upload profile avatar image
 * @access  Private (Owner)
 */
router.post('/:id/avatar', 
    requireAuth,
    validateRequest('uploadAvatar'),
    ProfilesController.uploadAvatar
);

/**
 * @route   POST /api/music/profiles/:id/banner
 * @desc    Upload profile banner image
 * @access  Private (Owner)
 */
router.post('/:id/banner', 
    requireAuth,
    validateRequest('uploadBanner'),
    ProfilesController.uploadBanner
);

/**
 * @route   GET /api/music/profiles/:id/gallery
 * @desc    Get profile media gallery
 * @access  Public
 */
router.get('/:id/gallery', 
    ProfilesController.getGallery
);

/**
 * @route   POST /api/music/profiles/:id/gallery
 * @desc    Add media to profile gallery
 * @access  Private (Owner)
 */
router.post('/:id/gallery', 
    requireAuth,
    validateRequest('addGalleryMedia'),
    ProfilesController.addGalleryMedia
);

/**
 * @route   DELETE /api/music/profiles/:id/gallery/:mediaId
 * @desc    Remove media from gallery
 * @access  Private (Owner)
 */
router.delete('/:id/gallery/:mediaId', 
    requireAuth,
    ProfilesController.removeGalleryMedia
);

// ========== Profile Social Features ==========

/**
 * @route   POST /api/music/profiles/:id/follow
 * @desc    Follow profile
 * @access  Private
 */
router.post('/:id/follow', 
    requireAuth,
    ProfilesController.followProfile
);

/**
 * @route   DELETE /api/music/profiles/:id/follow
 * @desc    Unfollow profile
 * @access  Private
 */
router.delete('/:id/follow', 
    requireAuth,
    ProfilesController.unfollowProfile
);

/**
 * @route   GET /api/music/profiles/:id/followers
 * @desc    Get profile followers
 * @access  Public
 */
router.get('/:id/followers', 
    ProfilesController.getFollowers
);

/**
 * @route   GET /api/music/profiles/:id/following
 * @desc    Get profiles that this profile follows
 * @access  Public
 */
router.get('/:id/following', 
    ProfilesController.getFollowing
);

/**
 * @route   GET /api/music/profiles/:id/mutual-connections
 * @desc    Get mutual connections with current user
 * @access  Private
 */
router.get('/:id/mutual-connections', 
    requireAuth,
    ProfilesController.getMutualConnections
);

// ========== Profile Content ==========

/**
 * @route   GET /api/music/profiles/:id/releases
 * @desc    Get profile releases with filtering
 * @access  Public
 */
router.get('/:id/releases', 
    ProfilesController.getProfileReleases
);

/**
 * @route   GET /api/music/profiles/:id/tracks
 * @desc    Get profile tracks collection
 * @access  Public
 */
router.get('/:id/tracks', 
    ProfilesController.getProfileTracks
);

/**
 * @route   GET /api/music/profiles/:id/playlists
 * @desc    Get profile curated playlists
 * @access  Public
 */
router.get('/:id/playlists', 
    ProfilesController.getProfilePlaylists
);

/**
 * @route   GET /api/music/profiles/:id/collaborations
 * @desc    Get profile collaborations
 * @access  Public
 */
router.get('/:id/collaborations', 
    ProfilesController.getCollaborations
);

// ========== Profile Analytics ==========

/**
 * @route   GET /api/music/profiles/:id/analytics
 * @desc    Get profile analytics dashboard
 * @access  Private (Owner or Admin)
 */
router.get('/:id/analytics', 
    requireAuth,
    AnalyticsController.getProfileAnalytics
);

/**
 * @route   GET /api/music/profiles/:id/engagement
 * @desc    Get profile engagement metrics
 * @access  Private (Owner or Admin)
 */
router.get('/:id/engagement', 
    requireAuth,
    AnalyticsController.getProfileEngagement
);

/**
 * @route   GET /api/music/profiles/:id/audience
 * @desc    Get profile audience demographics
 * @access  Private (Owner or Admin)
 */
router.get('/:id/audience', 
    requireAuth,
    AnalyticsController.getProfileAudience
);

/**
 * @route   GET /api/music/profiles/:id/growth
 * @desc    Get profile growth statistics
 * @access  Private (Owner or Admin)
 */
router.get('/:id/growth', 
    requireAuth,
    AnalyticsController.getProfileGrowth
);

// ========== Profile Verification ==========

/**
 * @route   POST /api/music/profiles/:id/verify
 * @desc    Submit profile for verification
 * @access  Private (Owner)
 */
router.post('/:id/verify', 
    requireAuth,
    validateRequest('submitVerification'),
    ProfilesController.submitForVerification
);

/**
 * @route   POST /api/music/profiles/:id/verify/approve
 * @desc    Approve profile verification
 * @access  Private (Admin only)
 */
router.post('/:id/verify/approve', 
    requireAuth,
    requireRole(['admin', 'moderator']),
    ProfilesController.approveVerification
);

/**
 * @route   GET /api/music/profiles/:id/verification-status
 * @desc    Get profile verification status
 * @access  Private (Owner or Admin)
 */
router.get('/:id/verification-status', 
    requireAuth,
    ProfilesController.getVerificationStatus
);

// ========== Profile Social Links ==========

/**
 * @route   GET /api/music/profiles/:id/social-links
 * @desc    Get profile social media links
 * @access  Public
 */
router.get('/:id/social-links', 
    ProfilesController.getSocialLinks
);

/**
 * @route   PUT /api/music/profiles/:id/social-links
 * @desc    Update profile social media links
 * @access  Private (Owner)
 */
router.put('/:id/social-links', 
    requireAuth,
    validateRequest('updateSocialLinks'),
    ProfilesController.updateSocialLinks
);

/**
 * @route   POST /api/music/profiles/:id/social-links/verify
 * @desc    Verify social media link ownership
 * @access  Private (Owner)
 */
router.post('/:id/social-links/verify', 
    requireAuth,
    validateRequest('verifySocialLink'),
    ProfilesController.verifySocialLink
);

// ========== Profile Recommendations ==========

/**
 * @route   GET /api/music/profiles/:id/similar
 * @desc    Get similar profiles recommendations
 * @access  Public
 */
router.get('/:id/similar', 
    ProfilesController.getSimilarProfiles
);

/**
 * @route   GET /api/music/profiles/:id/recommended-content
 * @desc    Get recommended content for profile
 * @access  Private (Owner)
 */
router.get('/:id/recommended-content', 
    requireAuth,
    ProfilesController.getRecommendedContent
);

// ========== Profile Events & News ==========

/**
 * @route   GET /api/music/profiles/:id/events
 * @desc    Get profile upcoming events
 * @access  Public
 */
router.get('/:id/events', 
    ProfilesController.getProfileEvents
);

/**
 * @route   POST /api/music/profiles/:id/events
 * @desc    Create profile event
 * @access  Private (Owner)
 */
router.post('/:id/events', 
    requireAuth,
    validateRequest('createProfileEvent'),
    ProfilesController.createProfileEvent
);

/**
 * @route   GET /api/music/profiles/:id/news
 * @desc    Get profile news and updates
 * @access  Public
 */
router.get('/:id/news', 
    ProfilesController.getProfileNews
);

/**
 * @route   POST /api/music/profiles/:id/news
 * @desc    Post profile news update
 * @access  Private (Owner)
 */
router.post('/:id/news', 
    requireAuth,
    validateRequest('createProfileNews'),
    ProfilesController.createProfileNews
);

// ========== Profile Collaboration Hub ==========

/**
 * @route   GET /api/music/profiles/:id/collaboration-requests
 * @desc    Get incoming collaboration requests
 * @access  Private (Owner)
 */
router.get('/:id/collaboration-requests', 
    requireAuth,
    ProfilesController.getCollaborationRequests
);

/**
 * @route   POST /api/music/profiles/:id/collaboration-requests
 * @desc    Send collaboration request
 * @access  Private
 */
router.post('/:id/collaboration-requests', 
    requireAuth,
    validateRequest('sendCollaborationRequest'),
    ProfilesController.sendCollaborationRequest
);

/**
 * @route   PUT /api/music/profiles/:id/collaboration-requests/:requestId
 * @desc    Respond to collaboration request
 * @access  Private (Owner)
 */
router.put('/:id/collaboration-requests/:requestId', 
    requireAuth,
    validateRequest('respondToCollaborationRequest'),
    ProfilesController.respondToCollaborationRequest
);

module.exports = router;
