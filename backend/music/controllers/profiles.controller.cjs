/**
 * Profiles Controller - Advanced Artist Profile Management REST API
 * Exposes comprehensive artist profile features through REST endpoints
 * Provides sophisticated profile management, social media integration, and branding tools
 * Integrates with profile sync services and external platforms
 */

const ProfilesService = require('../services/profiles.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const multer = require('multer');
const path = require('path');

// Configure multer for profile media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.PROFILE_MEDIA_DIR || './uploads/profiles');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`File type ${file.mimetype} not supported for profiles`, 400), false);
        }
    }
});

class ProfilesController {
    /**
     * Get artist profile
     * GET /api/music/profiles/:profileId
     */
    static async getProfile(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                include_social_links = true,
                include_analytics = false,
                include_releases = false,
                public_view = false
            } = req.query;

            const userId = req.user ? req.user.id : null;

            const options = {
                include_social_links: include_social_links === 'true',
                include_analytics: include_analytics === 'true',
                include_releases: include_releases === 'true',
                public_view: public_view === 'true',
                viewer_id: userId
            };

            const profile = await ProfilesService.getArtistProfile(
                profileId,
                options,
                userId
            );

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create artist profile
     * POST /api/music/profiles
     */
    static async createProfile(req, res, next) {
        try {
            const {
                artist_name,
                display_name = null,
                bio = '',
                genre = [],
                location = {},
                social_links = {},
                contact_info = {},
                branding = {}
            } = req.body;

            const userId = req.user.id;

            if (!artist_name) {
                throw new AppError('Artist name is required', 400);
            }

            const profileData = {
                artist_name,
                display_name: display_name || artist_name,
                bio,
                genre: Array.isArray(genre) ? genre : [genre],
                location: {
                    country: location.country || null,
                    city: location.city || null,
                    state: location.state || null,
                    timezone: location.timezone || null
                },
                social_links: {
                    website: social_links.website || null,
                    instagram: social_links.instagram || null,
                    twitter: social_links.twitter || null,
                    facebook: social_links.facebook || null,
                    youtube: social_links.youtube || null,
                    spotify: social_links.spotify || null,
                    apple_music: social_links.apple_music || null,
                    soundcloud: social_links.soundcloud || null
                },
                contact_info: {
                    email: contact_info.email || null,
                    phone: contact_info.phone || null,
                    management_email: contact_info.management_email || null,
                    booking_email: contact_info.booking_email || null
                },
                branding: {
                    primary_color: branding.primary_color || null,
                    secondary_color: branding.secondary_color || null,
                    font_preferences: branding.font_preferences || null
                },
                created_by: userId
            };

            const profile = await ProfilesService.createArtistProfile(
                profileData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Artist profile created successfully',
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update artist profile
     * PUT /api/music/profiles/:profileId
     */
    static async updateProfile(req, res, next) {
        try {
            const { profileId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                sync_to_platforms = false,
                update_reason = ''
            } = req.query;

            const updateOptions = {
                sync_to_platforms: sync_to_platforms === 'true',
                update_reason,
                updated_by: userId
            };

            const result = await ProfilesService.updateArtistProfile(
                profileId,
                updateData,
                updateOptions
            );

            res.json({
                success: true,
                message: 'Artist profile updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload profile media
     * POST /api/music/profiles/:profileId/media
     */
    static async uploadProfileMedia(req, res, next) {
        // Use multer middleware for media upload
        upload.fields([
            { name: 'profile_picture', maxCount: 1 },
            { name: 'banner_image', maxCount: 1 },
            { name: 'gallery_images', maxCount: 10 }
        ])(req, res, async (err) => {
            if (err) {
                return next(new AppError(err.message, 400));
            }

            try {
                const { profileId } = req.params;
                const {
                    media_type = 'profile_picture',
                    alt_text = '',
                    caption = '',
                    auto_resize = true
                } = req.body;

                const userId = req.user.id;

                if (!req.files || Object.keys(req.files).length === 0) {
                    throw new AppError('No media files uploaded', 400);
                }

                const mediaData = {
                    profile_id: profileId,
                    media_type,
                    files: req.files,
                    alt_text,
                    caption,
                    auto_resize: auto_resize === 'true',
                    uploaded_by: userId
                };

                const result = await ProfilesService.uploadProfileMedia(
                    mediaData,
                    userId
                );

                res.status(201).json({
                    success: true,
                    message: 'Profile media uploaded successfully',
                    data: result
                });
            } catch (error) {
                next(error);
            }
        });
    }

    /**
     * Delete profile media
     * DELETE /api/music/profiles/:profileId/media/:mediaId
     */
    static async deleteProfileMedia(req, res, next) {
        try {
            const { profileId, mediaId } = req.params;
            const userId = req.user.id;

            const result = await ProfilesService.deleteProfileMedia(
                profileId,
                mediaId,
                userId
            );

            res.json({
                success: true,
                message: 'Profile media deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get profile analytics
     * GET /api/music/profiles/:profileId/analytics
     */
    static async getProfileAnalytics(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                time_range = '30_days',
                metrics = 'all',
                include_social_growth = true,
                include_engagement = true
            } = req.query;

            const userId = req.user.id;

            const analyticsOptions = {
                profile_id: profileId,
                time_range,
                metrics: metrics === 'all' ? 
                    ['profile_views', 'follower_growth', 'engagement_rate', 'click_through_rate'] : 
                    metrics.split(','),
                include_social_growth: include_social_growth === 'true',
                include_engagement: include_engagement === 'true',
                user_id: userId
            };

            const analytics = await ProfilesService.getProfileAnalytics(
                analyticsOptions
            );

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sync profile to platforms
     * POST /api/music/profiles/:profileId/sync
     */
    static async syncToPlatforms(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                target_platforms = [],
                sync_type = 'full',
                force_update = false,
                preview_changes = false
            } = req.body;

            const userId = req.user.id;

            if (target_platforms.length === 0) {
                throw new AppError('At least one target platform is required', 400);
            }

            const syncData = {
                profile_id: profileId,
                target_platforms,
                sync_type,
                force_update,
                preview_changes,
                synced_by: userId
            };

            const result = await ProfilesService.syncProfileToPlatforms(
                syncData,
                userId
            );

            res.json({
                success: true,
                message: 'Profile sync completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get profile verification status
     * GET /api/music/profiles/:profileId/verification
     */
    static async getVerificationStatus(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                include_requirements = true,
                include_history = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_requirements: include_requirements === 'true',
                include_history: include_history === 'true'
            };

            const verification = await ProfilesService.getVerificationStatus(
                profileId,
                options,
                userId
            );

            res.json({
                success: true,
                data: verification
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit verification request
     * POST /api/music/profiles/:profileId/verification
     */
    static async submitVerificationRequest(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                verification_type = 'artist',
                supporting_documents = [],
                additional_info = {}
            } = req.body;

            const userId = req.user.id;

            const verificationData = {
                profile_id: profileId,
                verification_type,
                supporting_documents,
                additional_info,
                submitted_by: userId
            };

            const result = await ProfilesService.submitVerificationRequest(
                verificationData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Verification request submitted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search artist profiles
     * GET /api/music/profiles/search
     */
    static async searchProfiles(req, res, next) {
        try {
            const {
                query = '',
                filters = {},
                sort_by = 'relevance',
                sort_order = 'desc',
                page = 1,
                limit = 20,
                include_social_stats = false
            } = req.query;

            const searchOptions = {
                query,
                filters: {
                    genre: filters.genre || null,
                    location: filters.location || null,
                    verified_only: filters.verified_only === 'true',
                    has_releases: filters.has_releases === 'true'
                },
                sort_by,
                sort_order,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                include_social_stats: include_social_stats === 'true'
            };

            const results = await ProfilesService.searchArtistProfiles(
                searchOptions
            );

            res.json({
                success: true,
                data: {
                    profiles: results.profiles,
                    pagination: results.pagination,
                    facets: results.facets
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get profile followers
     * GET /api/music/profiles/:profileId/followers
     */
    static async getProfileFollowers(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                page = 1,
                limit = 20,
                include_mutual = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                include_mutual: include_mutual === 'true',
                viewer_id: userId
            };

            const followers = await ProfilesService.getProfileFollowers(
                profileId,
                options
            );

            res.json({
                success: true,
                data: {
                    followers: followers.followers,
                    pagination: followers.pagination,
                    stats: followers.stats
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Follow/Unfollow profile
     * POST /api/music/profiles/:profileId/follow
     */
    static async toggleFollow(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                action = 'follow'
            } = req.body;

            const userId = req.user.id;

            if (!['follow', 'unfollow'].includes(action)) {
                throw new AppError('Action must be either "follow" or "unfollow"', 400);
            }

            const result = await ProfilesService.toggleProfileFollow(
                profileId,
                action,
                userId
            );

            res.json({
                success: true,
                message: `Profile ${action}ed successfully`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get profile recommendations
     * GET /api/music/profiles/recommendations
     */
    static async getProfileRecommendations(req, res, next) {
        try {
            const {
                based_on = 'user_preferences',
                genre_preferences = [],
                limit = 10,
                exclude_followed = true
            } = req.query;

            const userId = req.user.id;

            const recommendationOptions = {
                based_on,
                genre_preferences: genre_preferences.length > 0 ? genre_preferences : [],
                limit: Math.min(parseInt(limit), 50),
                exclude_followed: exclude_followed === 'true',
                user_id: userId
            };

            const recommendations = await ProfilesService.getProfileRecommendations(
                recommendationOptions
            );

            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update profile visibility
     * PUT /api/music/profiles/:profileId/visibility
     */
    static async updateVisibility(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                visibility_level = 'public',
                search_indexing = true,
                show_in_recommendations = true,
                contact_visibility = 'verified_only'
            } = req.body;

            const userId = req.user.id;

            const visibilityData = {
                visibility_level,
                search_indexing,
                show_in_recommendations,
                contact_visibility,
                updated_by: userId
            };

            const result = await ProfilesService.updateProfileVisibility(
                profileId,
                visibilityData,
                userId
            );

            res.json({
                success: true,
                message: 'Profile visibility updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate profile QR code
     * GET /api/music/profiles/:profileId/qr-code
     */
    static async generateQRCode(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                size = 'medium',
                format = 'png',
                include_logo = false,
                color_scheme = 'default'
            } = req.query;

            const userId = req.user.id;

            const qrOptions = {
                profile_id: profileId,
                size,
                format,
                include_logo: include_logo === 'true',
                color_scheme,
                generated_by: userId
            };

            const qrCode = await ProfilesService.generateProfileQRCode(
                qrOptions
            );

            if (format === 'png' || format === 'svg') {
                res.setHeader('Content-Type', `image/${format}`);
                res.setHeader('Content-Disposition', `attachment; filename="profile-qr-${profileId}.${format}"`);
                res.send(qrCode.data);
            } else {
                res.json({
                    success: true,
                    data: qrCode
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get profile activity feed
     * GET /api/music/profiles/:profileId/activity
     */
    static async getProfileActivity(req, res, next) {
        try {
            const { profileId } = req.params;
            const {
                activity_types = [],
                date_from = null,
                date_to = null,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const activityOptions = {
                profile_id: profileId,
                activity_types: activity_types.length > 0 ? activity_types : 
                    ['release', 'social_post', 'collaboration', 'achievement'],
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                viewer_id: userId
            };

            const activity = await ProfilesService.getProfileActivity(
                activityOptions
            );

            res.json({
                success: true,
                data: {
                    activities: activity.activities,
                    pagination: activity.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk profile operations
     * POST /api/music/profiles/bulk
     */
    static async bulkProfileOperations(req, res, next) {
        try {
            const {
                operation_type = 'sync',
                profile_ids = [],
                operation_data = {},
                validation_mode = 'strict'
            } = req.body;

            const userId = req.user.id;

            if (profile_ids.length === 0) {
                throw new AppError('Profile IDs are required', 400);
            }

            const bulkData = {
                operation_type,
                profile_ids,
                operation_data,
                validation_mode,
                initiated_by: userId
            };

            const result = await ProfilesService.bulkProfileOperations(
                bulkData,
                userId
            );

            res.json({
                success: true,
                message: 'Bulk profile operations completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProfilesController;
