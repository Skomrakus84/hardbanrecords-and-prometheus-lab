/**
 * Chapter Controller - Advanced Chapter Management REST API
 * Exposes comprehensive chapter operations through REST endpoints
 * Provides sophisticated content management, analytics, and bulk operations
 * Integrates with Chapter Service and Content Processing systems
 */

const ChapterService = require('../services/chapter.service.cjs');
const ContentIngestionService = require('../services/contentIngestion.service.cjs');
const PublicationService = require('../services/publication.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const { validateRequest } = require('../../middleware/validate.cjs');

class ChapterController {
    /**
     * Create new chapter with advanced content processing
     * POST /api/publishing/chapters
     */
    static async createChapter(req, res, next) {
        try {
            const {
                publication_id,
                title,
                content,
                chapter_number,
                content_format = 'text',
                processing_options = {},
                metadata = {},
                workflow_settings = {}
            } = req.body;

            const userId = req.user.id;

            // Validate required fields
            if (!publication_id || !title || !content) {
                throw new AppError('Publication ID, title, and content are required', 400);
            }

            // Verify user has access to publication
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const chapterData = {
                publication_id,
                title,
                content,
                chapter_number,
                content_format,
                processing_options,
                metadata,
                workflow_settings
            };

            const result = await ChapterService.createChapterWithProcessing(
                chapterData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Chapter created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get chapter with complete details
     * GET /api/publishing/chapters/:id
     */
    static async getChapter(req, res, next) {
        try {
            const { id } = req.params;
            const {
                include_content = true,
                include_analytics = false,
                include_versions = false,
                include_collaborations = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_content: include_content === 'true',
                include_analytics: include_analytics === 'true',
                include_versions: include_versions === 'true',
                include_collaborations: include_collaborations === 'true'
            };

            const chapter = await ChapterService.getChapterDetails(id, userId, options);

            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            res.json({
                success: true,
                data: chapter
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update chapter content and metadata
     * PUT /api/publishing/chapters/:id
     */
    static async updateChapter(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                auto_process = true,
                create_version = true,
                notify_collaborators = false,
                version_description = ''
            } = req.query;

            const updateOptions = {
                auto_process: auto_process === 'true',
                create_version: create_version === 'true',
                notify_collaborators: notify_collaborators === 'true',
                version_description
            };

            const result = await ChapterService.updateChapter(
                id,
                updateData,
                userId,
                updateOptions
            );

            res.json({
                success: true,
                message: 'Chapter updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete chapter with cleanup options
     * DELETE /api/publishing/chapters/:id
     */
    static async deleteChapter(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const {
                archive_content = true,
                update_structure = true,
                force_delete = false
            } = req.query;

            const deleteOptions = {
                archive_content: archive_content === 'true',
                update_structure: update_structure === 'true',
                force_delete: force_delete === 'true'
            };

            const result = await ChapterService.deleteChapter(id, userId, deleteOptions);

            res.json({
                success: true,
                message: 'Chapter deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Analyze chapter content quality
     * POST /api/publishing/chapters/:id/analyze
     */
    static async analyzeChapter(req, res, next) {
        try {
            const { id } = req.params;
            const {
                analysis_type = 'comprehensive',
                include_readability = true,
                include_structure = true,
                include_language = true,
                include_sentiment = false,
                detailed_analysis = false
            } = req.body;

            const userId = req.user.id;

            // Get chapter content
            const chapter = await ChapterService.getChapterDetails(id, userId, { include_content: true });
            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            const analysisOptions = {
                include_readability,
                include_structure,
                include_language,
                include_sentiment,
                detailed_analysis
            };

            const analysis = await ContentIngestionService.analyzeContentQuality(
                chapter.content,
                chapter.content_format || 'text',
                analysisOptions
            );

            res.json({
                success: true,
                message: 'Chapter analysis completed',
                data: {
                    chapter_id: id,
                    analysis_type,
                    analysis
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get chapter analytics
     * GET /api/publishing/chapters/:id/analytics
     */
    static async getChapterAnalytics(req, res, next) {
        try {
            const { id } = req.params;
            const {
                time_range = '30_days',
                include_engagement = true,
                include_performance = true,
                include_comparative = false,
                granularity = 'daily'
            } = req.query;

            const userId = req.user.id;

            const analyticsOptions = {
                time_range,
                include_content_analysis: true,
                include_readability: true,
                include_structure_analysis: true,
                include_engagement_metrics: include_engagement === 'true',
                include_comparative_analysis: include_comparative === 'true',
                analysis_depth: 'standard'
            };

            const analytics = await ChapterService.generateChapterAnalytics(
                id,
                null,
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
     * Duplicate chapter
     * POST /api/publishing/chapters/:id/duplicate
     */
    static async duplicateChapter(req, res, next) {
        try {
            const { id } = req.params;
            const {
                new_title,
                target_publication_id = null,
                duplicate_metadata = true,
                auto_number = true
            } = req.body;

            const userId = req.user.id;

            if (!new_title) {
                throw new AppError('New title is required for duplication', 400);
            }

            const duplicationOptions = {
                new_title,
                target_publication_id,
                duplicate_metadata,
                auto_number
            };

            const result = await ChapterService.duplicateChapter(id, userId, duplicationOptions);

            res.status(201).json({
                success: true,
                message: 'Chapter duplicated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Move chapter between publications
     * POST /api/publishing/chapters/:id/move
     */
    static async moveChapter(req, res, next) {
        try {
            const { id } = req.params;
            const {
                target_publication_id,
                new_chapter_number = null,
                preserve_metadata = true,
                create_backup = true
            } = req.body;

            const userId = req.user.id;

            if (!target_publication_id) {
                throw new AppError('Target publication ID is required', 400);
            }

            // Verify access to both publications
            const sourceChapter = await ChapterService.getChapterDetails(id, userId);
            if (!sourceChapter) {
                throw new AppError('Chapter not found', 404);
            }

            const targetAccess = await PublicationService.verifyUserAccess(target_publication_id, userId);
            if (!targetAccess) {
                throw new AppError('Access denied to target publication', 403);
            }

            const moveOptions = {
                target_publication_id,
                new_chapter_number,
                preserve_metadata,
                create_backup
            };

            const result = await ChapterService.moveChapter(id, userId, moveOptions);

            res.json({
                success: true,
                message: 'Chapter moved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Process bulk chapter operations
     * POST /api/publishing/chapters/bulk
     */
    static async processBulkOperations(req, res, next) {
        try {
            const {
                publication_id,
                operations = [],
                validation_mode = 'strict',
                atomic_execution = true,
                progress_tracking = true
            } = req.body;

            const userId = req.user.id;

            if (!publication_id || operations.length === 0) {
                throw new AppError('Publication ID and operations array are required', 400);
            }

            // Verify access to publication
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const operationsData = {
                operations,
                validation_mode,
                atomic_execution,
                progress_tracking
            };

            const result = await ChapterService.processBulkChapterOperations(
                publication_id,
                operationsData,
                userId
            );

            res.json({
                success: true,
                message: 'Bulk operations completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get chapter versions history
     * GET /api/publishing/chapters/:id/versions
     */
    static async getChapterVersions(req, res, next) {
        try {
            const { id } = req.params;
            const {
                page = 1,
                limit = 20,
                include_content = false,
                sort_order = 'desc'
            } = req.query;

            const userId = req.user.id;

            // Verify access to chapter
            const chapter = await ChapterService.getChapterDetails(id, userId, { include_content: false });
            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 50),
                include_content: include_content === 'true',
                sort_order
            };

            const versions = await ChapterService.getChapterVersions(id, options);

            res.json({
                success: true,
                data: {
                    chapter_id: id,
                    versions: versions.versions,
                    pagination: versions.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restore chapter to specific version
     * POST /api/publishing/chapters/:id/restore
     */
    static async restoreChapterVersion(req, res, next) {
        try {
            const { id } = req.params;
            const {
                version_id,
                create_backup = true,
                restore_reason = ''
            } = req.body;

            const userId = req.user.id;

            if (!version_id) {
                throw new AppError('Version ID is required', 400);
            }

            const restoreOptions = {
                version_id,
                create_backup,
                restore_reason
            };

            const result = await ChapterService.restoreChapterVersion(id, userId, restoreOptions);

            res.json({
                success: true,
                message: 'Chapter restored to previous version successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export chapter in various formats
     * GET /api/publishing/chapters/:id/export
     */
    static async exportChapter(req, res, next) {
        try {
            const { id } = req.params;
            const {
                format = 'markdown',
                include_metadata = true,
                include_formatting = true,
                export_options = {}
            } = req.query;

            const userId = req.user.id;

            // Verify access to chapter
            const chapter = await ChapterService.getChapterDetails(id, userId, { include_content: true });
            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            const exportConfig = {
                format,
                include_metadata: include_metadata === 'true',
                include_formatting: include_formatting === 'true',
                export_options: typeof export_options === 'string' ? JSON.parse(export_options) : export_options
            };

            const exportResult = await ChapterService.exportChapter(id, exportConfig);

            // Set appropriate headers for file download
            res.setHeader('Content-Type', exportResult.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

            if (exportResult.is_binary) {
                res.send(exportResult.content);
            } else {
                res.json({
                    success: true,
                    data: {
                        chapter_id: id,
                        export_format: format,
                        content: exportResult.content,
                        metadata: exportResult.metadata
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Import content into chapter
     * POST /api/publishing/chapters/:id/import
     */
    static async importContent(req, res, next) {
        try {
            const { id } = req.params;
            const {
                content_source,
                import_format = 'text',
                merge_strategy = 'replace',
                processing_options = {}
            } = req.body;

            const userId = req.user.id;

            if (!content_source) {
                throw new AppError('Content source is required', 400);
            }

            // Verify access to chapter
            const chapter = await ChapterService.getChapterDetails(id, userId);
            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            const importData = {
                content_source,
                import_format,
                merge_strategy,
                processing_options
            };

            const result = await ChapterService.importContentToChapter(id, importData, userId);

            res.json({
                success: true,
                message: 'Content imported successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search chapters across publications
     * GET /api/publishing/chapters/search
     */
    static async searchChapters(req, res, next) {
        try {
            const {
                query,
                publication_id = null,
                search_in = 'all', // 'title', 'content', 'all'
                page = 1,
                limit = 20,
                sort_by = 'relevance'
            } = req.query;

            const userId = req.user.id;

            if (!query || query.trim().length < 2) {
                throw new AppError('Search query must be at least 2 characters long', 400);
            }

            const searchOptions = {
                query: query.trim(),
                publication_id,
                search_in,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                sort_by,
                user_id: userId // For access control
            };

            const searchResults = await ChapterService.searchChapters(searchOptions);

            res.json({
                success: true,
                data: {
                    query,
                    results: searchResults.chapters,
                    pagination: searchResults.pagination,
                    search_metadata: searchResults.metadata
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get chapter collaboration status
     * GET /api/publishing/chapters/:id/collaboration
     */
    static async getChapterCollaboration(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Verify access to chapter
            const chapter = await ChapterService.getChapterDetails(id, userId);
            if (!chapter) {
                throw new AppError('Chapter not found', 404);
            }

            const collaborationStatus = await ChapterService.getChapterCollaborationStatus(id);

            res.json({
                success: true,
                data: {
                    chapter_id: id,
                    collaboration_status: collaborationStatus
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChapterController;
