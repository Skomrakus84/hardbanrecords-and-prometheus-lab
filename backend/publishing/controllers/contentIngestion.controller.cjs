/**
 * Content Ingestion Controller - Advanced Content Import & Processing REST API
 * Exposes comprehensive content ingestion features through REST endpoints
 * Provides sophisticated file processing, format conversion, and content analysis
 * Integrates with Content Ingestion Service and processing pipelines
 */

const ContentIngestionService = require('../services/contentIngestion.service.cjs');
const PublicationService = require('../services/publication.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads/content');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
        files: 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/html',
            'application/epub+zip',
            'image/jpeg',
            'image/png',
            'image/svg+xml'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`File type ${file.mimetype} not supported`, 400), false);
        }
    }
});

class ContentIngestionController {
    /**
     * Upload and ingest content files
     * POST /api/publishing/content/upload
     */
    static async uploadContent(req, res, next) {
        // Use multer middleware for file upload
        upload.array('files', 10)(req, res, async (err) => {
            if (err) {
                return next(new AppError(err.message, 400));
            }

            try {
                const {
                    publication_id,
                    processing_options = {},
                    metadata_extraction = true,
                    auto_conversion = false,
                    quality_check = true,
                    chapter_detection = true
                } = req.body;

                const userId = req.user.id;

                if (!publication_id) {
                    throw new AppError('Publication ID is required', 400);
                }

                if (!req.files || req.files.length === 0) {
                    throw new AppError('No files uploaded', 400);
                }

                // Verify user has upload permissions
                const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to publication', 403);
                }

                const uploadData = {
                    publication_id,
                    files: req.files.map(file => ({
                        original_name: file.originalname,
                        file_path: file.path,
                        mime_type: file.mimetype,
                        size: file.size,
                        encoding: file.encoding
                    })),
                    processing_options: {
                        extract_text: processing_options.extract_text || true,
                        extract_images: processing_options.extract_images || true,
                        detect_language: processing_options.detect_language || true,
                        analyze_structure: processing_options.analyze_structure || true,
                        generate_toc: processing_options.generate_toc || false
                    },
                    metadata_extraction,
                    auto_conversion,
                    quality_check,
                    chapter_detection,
                    uploaded_by: userId
                };

                const result = await ContentIngestionService.ingestContent(
                    uploadData,
                    userId
                );

                res.status(201).json({
                    success: true,
                    message: 'Content uploaded and ingestion started',
                    data: result
                });
            } catch (error) {
                next(error);
            }
        });
    }

    /**
     * Import content from URL
     * POST /api/publishing/content/import-url
     */
    static async importFromURL(req, res, next) {
        try {
            const {
                publication_id,
                source_url,
                content_type = 'auto-detect',
                processing_options = {},
                authentication = null,
                follow_redirects = true
            } = req.body;

            const userId = req.user.id;

            if (!publication_id || !source_url) {
                throw new AppError('Publication ID and source URL are required', 400);
            }

            // Verify user has import permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const importData = {
                publication_id,
                source_url,
                content_type,
                processing_options: {
                    extract_text: processing_options.extract_text || true,
                    extract_images: processing_options.extract_images || true,
                    preserve_formatting: processing_options.preserve_formatting || true,
                    download_resources: processing_options.download_resources || false
                },
                authentication,
                follow_redirects,
                imported_by: userId
            };

            const result = await ContentIngestionService.importContentFromURL(
                importData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'URL import initiated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get ingestion job status
     * GET /api/publishing/content/jobs/:jobId
     */
    static async getJobStatus(req, res, next) {
        try {
            const { jobId } = req.params;
            const {
                include_logs = false,
                include_preview = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_logs: include_logs === 'true',
                include_preview: include_preview === 'true'
            };

            const jobStatus = await ContentIngestionService.getIngestionJobStatus(
                jobId,
                options,
                userId
            );

            res.json({
                success: true,
                data: jobStatus
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Process content with specific format
     * POST /api/publishing/content/process
     */
    static async processContent(req, res, next) {
        try {
            const {
                content_id,
                target_format = 'html',
                processing_pipeline = 'standard',
                custom_options = {},
                quality_settings = {}
            } = req.body;

            const userId = req.user.id;

            if (!content_id) {
                throw new AppError('Content ID is required', 400);
            }

            const processingData = {
                content_id,
                target_format,
                processing_pipeline,
                custom_options: {
                    preserve_structure: custom_options.preserve_structure || true,
                    optimize_images: custom_options.optimize_images || true,
                    clean_markup: custom_options.clean_markup || true,
                    validate_output: custom_options.validate_output || true
                },
                quality_settings: {
                    image_quality: quality_settings.image_quality || 80,
                    compression_level: quality_settings.compression_level || 'medium',
                    output_quality: quality_settings.output_quality || 'high'
                },
                processed_by: userId
            };

            const result = await ContentIngestionService.processContentFormat(
                processingData,
                userId
            );

            res.json({
                success: true,
                message: 'Content processing initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Extract metadata from content
     * POST /api/publishing/content/extract-metadata
     */
    static async extractMetadata(req, res, next) {
        try {
            const {
                content_id,
                extraction_scope = 'comprehensive',
                include_analytics = false,
                language_detection = true
            } = req.body;

            const userId = req.user.id;

            if (!content_id) {
                throw new AppError('Content ID is required', 400);
            }

            const extractionOptions = {
                content_id,
                extraction_scope,
                include_analytics,
                language_detection,
                extracted_by: userId
            };

            const metadata = await ContentIngestionService.extractContentMetadata(
                extractionOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Metadata extraction completed',
                data: metadata
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate content quality
     * POST /api/publishing/content/validate
     */
    static async validateContent(req, res, next) {
        try {
            const {
                content_id,
                validation_rules = 'standard',
                check_accessibility = true,
                check_formatting = true,
                check_completeness = true
            } = req.body;

            const userId = req.user.id;

            if (!content_id) {
                throw new AppError('Content ID is required', 400);
            }

            const validationOptions = {
                content_id,
                validation_rules,
                checks: {
                    accessibility: check_accessibility,
                    formatting: check_formatting,
                    completeness: check_completeness,
                    consistency: true,
                    readability: true
                },
                validated_by: userId
            };

            const validation = await ContentIngestionService.validateContentQuality(
                validationOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Content validation completed',
                data: validation
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Convert content between formats
     * POST /api/publishing/content/convert
     */
    static async convertFormat(req, res, next) {
        try {
            const {
                content_id,
                source_format,
                target_format,
                conversion_options = {},
                preserve_formatting = true,
                optimize_output = true
            } = req.body;

            const userId = req.user.id;

            if (!content_id || !source_format || !target_format) {
                throw new AppError('Content ID, source format, and target format are required', 400);
            }

            const conversionData = {
                content_id,
                source_format,
                target_format,
                conversion_options: {
                    quality_level: conversion_options.quality_level || 'high',
                    compression: conversion_options.compression || 'optimal',
                    compatibility_mode: conversion_options.compatibility_mode || 'modern',
                    custom_css: conversion_options.custom_css || null
                },
                preserve_formatting,
                optimize_output,
                converted_by: userId
            };

            const result = await ContentIngestionService.convertContentFormat(
                conversionData,
                userId
            );

            res.json({
                success: true,
                message: 'Format conversion initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk import from archive
     * POST /api/publishing/content/bulk-import
     */
    static async bulkImport(req, res, next) {
        // Handle archive file upload
        upload.single('archive')(req, res, async (err) => {
            if (err) {
                return next(new AppError(err.message, 400));
            }

            try {
                const {
                    publication_id,
                    import_strategy = 'preserve_structure',
                    naming_convention = 'original',
                    conflict_resolution = 'rename',
                    processing_options = {}
                } = req.body;

                const userId = req.user.id;

                if (!publication_id) {
                    throw new AppError('Publication ID is required', 400);
                }

                if (!req.file) {
                    throw new AppError('Archive file is required', 400);
                }

                // Verify user has bulk import permissions
                const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to publication', 403);
                }

                const bulkImportData = {
                    publication_id,
                    archive_path: req.file.path,
                    archive_type: path.extname(req.file.originalname).toLowerCase(),
                    import_strategy,
                    naming_convention,
                    conflict_resolution,
                    processing_options: {
                        auto_detect_chapters: processing_options.auto_detect_chapters || true,
                        extract_all_metadata: processing_options.extract_all_metadata || true,
                        validate_content: processing_options.validate_content || true,
                        optimize_files: processing_options.optimize_files || false
                    },
                    imported_by: userId
                };

                const result = await ContentIngestionService.bulkImportContent(
                    bulkImportData,
                    userId
                );

                res.status(201).json({
                    success: true,
                    message: 'Bulk import initiated successfully',
                    data: result
                });
            } catch (error) {
                next(error);
            }
        });
    }

    /**
     * Get import history
     * GET /api/publishing/content/import-history
     */
    static async getImportHistory(req, res, next) {
        try {
            const {
                publication_id = null,
                status = 'all',
                import_type = 'all',
                date_from = null,
                date_to = null,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const options = {
                publication_id,
                status,
                import_type,
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const history = await ContentIngestionService.getImportHistory(options);

            res.json({
                success: true,
                data: {
                    imports: history.imports,
                    pagination: history.pagination,
                    summary: history.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retry failed import
     * POST /api/publishing/content/retry/:jobId
     */
    static async retryImport(req, res, next) {
        try {
            const { jobId } = req.params;
            const {
                retry_options = {},
                fix_issues = true,
                skip_failed_files = false
            } = req.body;

            const userId = req.user.id;

            const retryData = {
                job_id: jobId,
                retry_options: {
                    max_attempts: retry_options.max_attempts || 3,
                    delay_between_attempts: retry_options.delay_between_attempts || 5000,
                    escalate_on_failure: retry_options.escalate_on_failure || true
                },
                fix_issues,
                skip_failed_files,
                retried_by: userId
            };

            const result = await ContentIngestionService.retryFailedImport(
                retryData,
                userId
            );

            res.json({
                success: true,
                message: 'Import retry initiated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel import job
     * DELETE /api/publishing/content/jobs/:jobId
     */
    static async cancelImport(req, res, next) {
        try {
            const { jobId } = req.params;
            const {
                cleanup_partial = true,
                reason = 'User requested cancellation'
            } = req.body;

            const userId = req.user.id;

            const cancellationData = {
                job_id: jobId,
                cleanup_partial,
                reason,
                cancelled_by: userId
            };

            const result = await ContentIngestionService.cancelImportJob(
                cancellationData
            );

            res.json({
                success: true,
                message: 'Import job cancelled successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get supported formats
     * GET /api/publishing/content/supported-formats
     */
    static async getSupportedFormats(req, res, next) {
        try {
            const {
                category = 'all',
                include_converters = true,
                include_processors = true
            } = req.query;

            const options = {
                category,
                include_converters: include_converters === 'true',
                include_processors: include_processors === 'true'
            };

            const formats = await ContentIngestionService.getSupportedFormats(options);

            res.json({
                success: true,
                data: formats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Preview imported content
     * GET /api/publishing/content/:contentId/preview
     */
    static async previewContent(req, res, next) {
        try {
            const { contentId } = req.params;
            const {
                format = 'html',
                include_metadata = false,
                page_limit = 5
            } = req.query;

            const userId = req.user.id;

            const previewOptions = {
                content_id: contentId,
                format,
                include_metadata: include_metadata === 'true',
                page_limit: parseInt(page_limit),
                user_id: userId
            };

            const preview = await ContentIngestionService.generateContentPreview(
                previewOptions
            );

            if (preview.content_type && preview.content_type !== 'application/json') {
                res.setHeader('Content-Type', preview.content_type);
                res.send(preview.content);
            } else {
                res.json({
                    success: true,
                    data: preview
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Analyze content structure
     * POST /api/publishing/content/analyze-structure
     */
    static async analyzeStructure(req, res, next) {
        try {
            const {
                content_id,
                analysis_depth = 'standard',
                detect_patterns = true,
                suggest_improvements = false
            } = req.body;

            const userId = req.user.id;

            if (!content_id) {
                throw new AppError('Content ID is required', 400);
            }

            const analysisOptions = {
                content_id,
                analysis_depth,
                detect_patterns,
                suggest_improvements,
                analyzed_by: userId
            };

            const analysis = await ContentIngestionService.analyzeContentStructure(
                analysisOptions,
                userId
            );

            res.json({
                success: true,
                message: 'Content structure analysis completed',
                data: analysis
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get processing statistics
     * GET /api/publishing/content/statistics
     */
    static async getProcessingStatistics(req, res, next) {
        try {
            const {
                time_range = '30_days',
                group_by = 'day',
                include_performance = true
            } = req.query;

            const userId = req.user.id;

            const options = {
                time_range,
                group_by,
                include_performance: include_performance === 'true',
                user_id: userId
            };

            const statistics = await ContentIngestionService.getProcessingStatistics(
                options
            );

            res.json({
                success: true,
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ContentIngestionController;
