/**
 * Track Controller - Advanced Track Management REST API
 * Exposes comprehensive track operations through REST endpoints
 * Provides sophisticated track processing, metadata management, and analytics
 * Integrates with Track Service and audio processing pipelines
 */

const TrackService = require('../services/track.service.cjs');
const ReleaseService = require('../services/release.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const multer = require('multer');
const path = require('path');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.AUDIO_UPLOAD_DIR || './uploads/audio');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB per file
        files: 20
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/mpeg',
            'audio/mp3',
            'audio/flac',
            'audio/x-flac',
            'audio/aac',
            'audio/m4a',
            'audio/ogg',
            'audio/vorbis'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`Audio format ${file.mimetype} not supported`, 400), false);
        }
    }
});

class TrackController {
    /**
     * Upload and create track
     * POST /api/music/tracks/upload
     */
    static async uploadTrack(req, res, next) {
        // Use multer middleware for audio file upload
        upload.fields([
            { name: 'audio_file', maxCount: 1 },
            { name: 'artwork', maxCount: 1 },
            { name: 'stems', maxCount: 10 }
        ])(req, res, async (err) => {
            if (err) {
                return next(new AppError(err.message, 400));
            }

            try {
                const {
                    release_id,
                    title,
                    track_number,
                    duration = null,
                    genre = '',
                    explicit_content = false,
                    isrc = null,
                    metadata = {},
                    processing_options = {}
                } = req.body;

                const userId = req.user.id;

                if (!release_id || !title) {
                    throw new AppError('Release ID and title are required', 400);
                }

                if (!req.files || !req.files.audio_file) {
                    throw new AppError('Audio file is required', 400);
                }

                // Verify user has upload permissions
                const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to release', 403);
                }

                const trackData = {
                    release_id,
                    title,
                    track_number: parseInt(track_number),
                    duration: duration ? parseInt(duration) : null,
                    genre,
                    explicit_content: explicit_content === 'true',
                    isrc,
                    metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
                    files: {
                        audio_file: req.files.audio_file[0],
                        artwork: req.files.artwork ? req.files.artwork[0] : null,
                        stems: req.files.stems || []
                    },
                    processing_options: {
                        auto_analyze: processing_options.auto_analyze || true,
                        generate_waveform: processing_options.generate_waveform || true,
                        extract_features: processing_options.extract_features || true,
                        quality_check: processing_options.quality_check || true,
                        normalize_audio: processing_options.normalize_audio || false
                    },
                    uploaded_by: userId
                };

                const result = await TrackService.createTrack(trackData, userId);

                res.status(201).json({
                    success: true,
                    message: 'Track uploaded and processing started',
                    data: result
                });
            } catch (error) {
                next(error);
            }
        });
    }

    /**
     * Get track details
     * GET /api/music/tracks/:trackId
     */
    static async getTrack(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                include_metadata = true,
                include_analytics = false,
                include_processing_status = false,
                include_files = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_metadata: include_metadata === 'true',
                include_analytics: include_analytics === 'true',
                include_processing_status: include_processing_status === 'true',
                include_files: include_files === 'true'
            };

            const track = await TrackService.getTrackById(trackId, options, userId);

            res.json({
                success: true,
                data: track
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update track information
     * PUT /api/music/tracks/:trackId
     */
    static async updateTrack(req, res, next) {
        try {
            const { trackId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                reprocess_audio = false,
                notify_platforms = false,
                update_reason = ''
            } = req.query;

            const updateOptions = {
                reprocess_audio: reprocess_audio === 'true',
                notify_platforms: notify_platforms === 'true',
                update_reason,
                updated_by: userId
            };

            const result = await TrackService.updateTrack(
                trackId,
                updateData,
                updateOptions
            );

            res.json({
                success: true,
                message: 'Track updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete track
     * DELETE /api/music/tracks/:trackId
     */
    static async deleteTrack(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                cleanup_files = true,
                notify_platforms = true,
                deletion_reason = ''
            } = req.body;

            const userId = req.user.id;

            const deletionData = {
                cleanup_files,
                notify_platforms,
                deletion_reason,
                deleted_by: userId
            };

            const result = await TrackService.deleteTrack(trackId, deletionData);

            res.json({
                success: true,
                message: 'Track deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Process track audio
     * POST /api/music/tracks/:trackId/process
     */
    static async processAudio(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                processing_type = 'full',
                output_formats = ['mp3', 'flac'],
                quality_settings = {},
                custom_options = {}
            } = req.body;

            const userId = req.user.id;

            const processingData = {
                track_id: trackId,
                processing_type,
                output_formats,
                quality_settings: {
                    bitrate: quality_settings.bitrate || 320,
                    sample_rate: quality_settings.sample_rate || 44100,
                    bit_depth: quality_settings.bit_depth || 16,
                    normalize: quality_settings.normalize || false
                },
                custom_options,
                processed_by: userId
            };

            const result = await TrackService.processTrackAudio(
                processingData,
                userId
            );

            res.json({
                success: true,
                message: 'Audio processing initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Analyze track
     * POST /api/music/tracks/:trackId/analyze
     */
    static async analyzeTrack(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                analysis_type = 'comprehensive',
                include_spectral = true,
                include_tempo = true,
                include_key = true,
                include_mood = false
            } = req.body;

            const userId = req.user.id;

            const analysisOptions = {
                track_id: trackId,
                analysis_type,
                features: {
                    spectral_analysis: include_spectral,
                    tempo_detection: include_tempo,
                    key_detection: include_key,
                    mood_analysis: include_mood,
                    loudness_analysis: true,
                    structure_analysis: true
                },
                analyzed_by: userId
            };

            const analysis = await TrackService.analyzeTrack(
                analysisOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Track analysis completed',
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate track waveform
     * POST /api/music/tracks/:trackId/waveform
     */
    static async generateWaveform(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                resolution = 'standard',
                format = 'json',
                width = 1200,
                height = 200,
                color_scheme = 'default'
            } = req.body;

            const userId = req.user.id;

            const waveformOptions = {
                track_id: trackId,
                resolution,
                format,
                dimensions: {
                    width: parseInt(width),
                    height: parseInt(height)
                },
                color_scheme,
                generated_by: userId
            };

            const waveform = await TrackService.generateWaveform(
                waveformOptions,
                userId
            );

            if (format === 'image') {
                res.setHeader('Content-Type', 'image/png');
                res.send(waveform.data);
            } else {
                res.json({
                    success: true,
                    data: waveform
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get track analytics
     * GET /api/music/tracks/:trackId/analytics
     */
    static async getTrackAnalytics(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                time_range = '30_days',
                metrics = 'all',
                group_by = 'day',
                include_comparisons = false
            } = req.query;

            const userId = req.user.id;

            const analyticsOptions = {
                track_id: trackId,
                time_range,
                metrics: metrics === 'all' ? 
                    ['streams', 'downloads', 'skips', 'completion_rate', 'revenue'] : 
                    metrics.split(','),
                group_by,
                include_comparisons: include_comparisons === 'true',
                user_id: userId
            };

            const analytics = await TrackService.getTrackAnalytics(
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
     * Search tracks
     * GET /api/music/tracks/search
     */
    static async searchTracks(req, res, next) {
        try {
            const {
                query = '',
                filters = {},
                sort_by = 'created_at',
                sort_order = 'desc',
                page = 1,
                limit = 20,
                include_metadata = true
            } = req.query;

            const userId = req.user.id;

            const searchOptions = {
                query,
                filters: {
                    genre: filters.genre || null,
                    duration_min: filters.duration_min ? parseInt(filters.duration_min) : null,
                    duration_max: filters.duration_max ? parseInt(filters.duration_max) : null,
                    explicit_content: filters.explicit_content ? filters.explicit_content === 'true' : null,
                    release_id: filters.release_id || null,
                    created_after: filters.created_after ? new Date(filters.created_after) : null,
                    created_before: filters.created_before ? new Date(filters.created_before) : null
                },
                sort_by,
                sort_order,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                include_metadata: include_metadata === 'true',
                user_id: userId
            };

            const results = await TrackService.searchTracks(searchOptions);

            res.json({
                success: true,
                data: {
                    tracks: results.tracks,
                    pagination: results.pagination,
                    facets: results.facets
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk track operations
     * POST /api/music/tracks/bulk
     */
    static async bulkOperations(req, res, next) {
        try {
            const {
                operation_type = 'update',
                track_ids = [],
                operation_data = {},
                validation_mode = 'strict',
                notify_platforms = false
            } = req.body;

            const userId = req.user.id;

            if (track_ids.length === 0) {
                throw new AppError('Track IDs are required', 400);
            }

            const bulkData = {
                operation_type,
                track_ids,
                operation_data,
                validation_mode,
                notify_platforms,
                initiated_by: userId
            };

            const result = await TrackService.bulkTrackOperations(
                bulkData,
                userId
            );

            res.json({
                success: true,
                message: 'Bulk track operations completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get track processing status
     * GET /api/music/tracks/:trackId/processing-status
     */
    static async getProcessingStatus(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                include_logs = false,
                include_errors = true
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_logs: include_logs === 'true',
                include_errors: include_errors === 'true'
            };

            const status = await TrackService.getProcessingStatus(
                trackId,
                options,
                userId
            );

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate track metadata
     * POST /api/music/tracks/:trackId/validate
     */
    static async validateMetadata(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                validation_rules = 'standard',
                target_platforms = [],
                include_suggestions = true,
                auto_fix = false
            } = req.body;

            const userId = req.user.id;

            const validationOptions = {
                track_id: trackId,
                validation_rules,
                target_platforms,
                include_suggestions,
                auto_fix,
                validated_by: userId
            };

            const validation = await TrackService.validateTrackMetadata(
                validationOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Metadata validation completed',
                data: validation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate track preview
     * POST /api/music/tracks/:trackId/preview
     */
    static async generatePreview(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                duration = 30,
                start_time = 'auto',
                fade_in = 2,
                fade_out = 2,
                format = 'mp3',
                bitrate = 128
            } = req.body;

            const userId = req.user.id;

            const previewOptions = {
                track_id: trackId,
                duration: parseInt(duration),
                start_time: start_time === 'auto' ? null : parseInt(start_time),
                fade_in: parseFloat(fade_in),
                fade_out: parseFloat(fade_out),
                format,
                bitrate: parseInt(bitrate),
                generated_by: userId
            };

            const preview = await TrackService.generateTrackPreview(
                previewOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Track preview generated',
                data: preview
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get track file download URL
     * GET /api/music/tracks/:trackId/download
     */
    static async getDownloadUrl(req, res, next) {
        try {
            const { trackId } = req.params;
            const {
                format = 'original',
                quality = 'high',
                expires_in = 3600
            } = req.query;

            const userId = req.user.id;

            const downloadOptions = {
                track_id: trackId,
                format,
                quality,
                expires_in: parseInt(expires_in),
                user_id: userId
            };

            const downloadInfo = await TrackService.generateDownloadUrl(
                downloadOptions
            );

            res.json({
                success: true,
                data: downloadInfo
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Compare tracks
     * POST /api/music/tracks/compare
     */
    static async compareTracks(req, res, next) {
        try {
            const {
                track_ids = [],
                comparison_metrics = ['audio_features', 'metadata', 'performance'],
                include_recommendations = false
            } = req.body;

            const userId = req.user.id;

            if (track_ids.length < 2) {
                throw new AppError('At least 2 tracks are required for comparison', 400);
            }

            const comparisonOptions = {
                track_ids,
                comparison_metrics,
                include_recommendations,
                compared_by: userId
            };

            const comparison = await TrackService.compareTracks(
                comparisonOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Track comparison completed',
                data: comparison
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reorder tracks in release
     * PUT /api/music/tracks/reorder
     */
    static async reorderTracks(req, res, next) {
        try {
            const {
                release_id,
                track_order = []
            } = req.body;

            const userId = req.user.id;

            if (!release_id || track_order.length === 0) {
                throw new AppError('Release ID and track order are required', 400);
            }

            // Verify user has reorder permissions
            const hasAccess = await ReleaseService.verifyUserAccess(release_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to release', 403);
            }

            const reorderData = {
                release_id,
                track_order,
                reordered_by: userId
            };

            const result = await TrackService.reorderTracks(reorderData);

            res.json({
                success: true,
                message: 'Track order updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TrackController;
