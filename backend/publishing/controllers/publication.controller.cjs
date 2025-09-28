/**
 * Publication Controller - Advanced Publication Management REST API
 * Exposes comprehensive publication lifecycle management through REST endpoints
 * Provides sophisticated CRUD operations, workflow management, and analytics
 * Integrates with all Publishing Services for complete functionality
 */

const PublicationService = require('../services/publication.service.cjs');
const ChapterService = require('../services/chapter.service.cjs');
const RightsManagementService = require('../services/rightsManagement.service.cjs');
const CollaborationService = require('../services/collaboration.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const { validateRequest } = require('../../middleware/validate.cjs');

class PublicationController {
    /**
     * Create new publication with comprehensive setup
     * POST /api/publishing/publications
     */
    static async createPublication(req, res, next) {
        try {
            const {
                title,
                description,
                genre,
                target_audience,
                language = 'en',
                publication_type = 'book',
                metadata = {},
                initial_settings = {},
                collaboration_settings = {},
                rights_settings = {}
            } = req.body;

            const userId = req.user.id;

            // Validate required fields
            if (!title || !description || !genre) {
                throw new AppError('Title, description, and genre are required', 400);
            }

            // Create publication with comprehensive setup
            const publicationData = {
                title,
                description,
                genre,
                target_audience,
                language,
                publication_type,
                metadata,
                initial_settings,
                collaboration_settings,
                rights_settings
            };

            const result = await PublicationService.createPublicationWithSetup(
                publicationData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Publication created successfully',
                data: {
                    publication: result.publication,
                    setup_results: {
                        collaboration_workspace: result.collaboration_setup,
                        rights_configuration: result.rights_setup,
                        workflow_initialization: result.workflow_setup
                    },
                    next_steps: result.recommended_next_steps
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get publication with complete details and analytics
     * GET /api/publishing/publications/:id
     */
    static async getPublication(req, res, next) {
        try {
            const { id } = req.params;
            const {
                include_chapters = true,
                include_analytics = false,
                include_collaboration = false,
                include_rights = false,
                analytics_period = '30_days'
            } = req.query;

            const userId = req.user.id;

            // Get detailed publication information
            const publicationDetails = await PublicationService.getPublicationDetails(
                id,
                userId,
                {
                    include_chapters: include_chapters === 'true',
                    include_analytics: include_analytics === 'true',
                    include_collaboration: include_collaboration === 'true',
                    include_rights: include_rights === 'true',
                    analytics_period
                }
            );

            if (!publicationDetails.publication) {
                throw new AppError('Publication not found', 404);
            }

            res.json({
                success: true,
                data: publicationDetails
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update publication with workflow management
     * PUT /api/publishing/publications/:id
     */
    static async updatePublication(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                workflow_action = null,
                update_metadata = true,
                notify_collaborators = true
            } = req.query;

            let result;

            if (workflow_action) {
                // Handle workflow-specific updates
                result = await PublicationService.updatePublicationStatus(
                    id,
                    workflow_action,
                    updateData,
                    userId,
                    {
                        update_metadata: update_metadata === 'true',
                        notify_collaborators: notify_collaborators === 'true'
                    }
                );
            } else {
                // Handle general updates
                result = await PublicationService.updatePublication(
                    id,
                    updateData,
                    userId,
                    {
                        update_metadata: update_metadata === 'true',
                        notify_collaborators: notify_collaborators === 'true'
                    }
                );
            }

            res.json({
                success: true,
                message: 'Publication updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete publication with comprehensive cleanup
     * DELETE /api/publishing/publications/:id
     */
    static async deletePublication(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const {
                archive_content = true,
                cleanup_collaborations = true,
                revoke_rights = true,
                force_delete = false
            } = req.query;

            const deletionOptions = {
                archive_content: archive_content === 'true',
                cleanup_collaborations: cleanup_collaborations === 'true',
                revoke_rights: revoke_rights === 'true',
                force_delete: force_delete === 'true'
            };

            const result = await PublicationService.deletePublication(
                id,
                userId,
                deletionOptions
            );

            res.json({
                success: true,
                message: 'Publication deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List publications with advanced filtering and pagination
     * GET /api/publishing/publications
     */
    static async listPublications(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                status = null,
                genre = null,
                language = null,
                search = null,
                sort_by = 'updated_at',
                sort_order = 'desc',
                include_collaborations = false,
                date_from = null,
                date_to = null
            } = req.query;

            const userId = req.user.id;

            const filters = {
                status,
                genre,
                language,
                search,
                date_from,
                date_to,
                include_collaborations: include_collaborations === 'true'
            };

            const pagination = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100), // Max 100 items per page
                sort_by,
                sort_order
            };

            const result = await PublicationService.listUserPublications(
                userId,
                filters,
                pagination
            );

            res.json({
                success: true,
                data: {
                    publications: result.publications,
                    pagination: {
                        current_page: result.current_page,
                        total_pages: result.total_pages,
                        total_items: result.total_items,
                        items_per_page: result.items_per_page,
                        has_next: result.has_next,
                        has_previous: result.has_previous
                    },
                    summary: result.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Submit publication for review
     * POST /api/publishing/publications/:id/submit-review
     */
    static async submitForReview(req, res, next) {
        try {
            const { id } = req.params;
            const {
                review_type = 'standard',
                reviewer_preferences = {},
                submission_notes = '',
                expedited = false
            } = req.body;
            const userId = req.user.id;

            const submissionData = {
                review_type,
                reviewer_preferences,
                submission_notes,
                expedited
            };

            const result = await PublicationService.submitForReview(
                id,
                submissionData,
                userId
            );

            res.json({
                success: true,
                message: 'Publication submitted for review successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Publish publication to selected channels
     * POST /api/publishing/publications/:id/publish
     */
    static async publishPublication(req, res, next) {
        try {
            const { id } = req.params;
            const {
                channels = [],
                publication_schedule = {},
                pricing_strategy = {},
                marketing_config = {}
            } = req.body;
            const userId = req.user.id;

            const publishingData = {
                channels,
                publication_schedule,
                pricing_strategy,
                marketing_config
            };

            const result = await PublicationService.publishPublication(
                id,
                publishingData,
                userId
            );

            res.json({
                success: true,
                message: 'Publication publishing initiated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get publication analytics
     * GET /api/publishing/publications/:id/analytics
     */
    static async getPublicationAnalytics(req, res, next) {
        try {
            const { id } = req.params;
            const {
                time_range = '30_days',
                metrics = 'all',
                include_predictions = false,
                granularity = 'daily'
            } = req.query;

            const userId = req.user.id;

            // Verify user has access to publication
            const hasAccess = await PublicationService.verifyUserAccess(id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied', 403);
            }

            const analyticsOptions = {
                time_range,
                metrics: metrics === 'all' ? ['sales', 'engagement', 'reviews'] : metrics.split(','),
                include_predictions: include_predictions === 'true',
                granularity
            };

            const analytics = await PublicationService.getPublicationAnalytics(
                id,
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
     * Manage publication workflow
     * POST /api/publishing/publications/:id/workflow
     */
    static async manageWorkflow(req, res, next) {
        try {
            const { id } = req.params;
            const {
                action,
                workflow_data = {},
                transition_notes = ''
            } = req.body;
            const userId = req.user.id;

            if (!action) {
                throw new AppError('Workflow action is required', 400);
            }

            const result = await PublicationService.manageWorkflow(
                id,
                action,
                workflow_data,
                userId,
                transition_notes
            );

            res.json({
                success: true,
                message: `Workflow action '${action}' executed successfully`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get publication chapters with management options
     * GET /api/publishing/publications/:id/chapters
     */
    static async getPublicationChapters(req, res, next) {
        try {
            const { id } = req.params;
            const {
                include_content = false,
                include_analytics = false,
                sort_by = 'chapter_number',
                sort_order = 'asc'
            } = req.query;

            const userId = req.user.id;

            // Verify access to publication
            const hasAccess = await PublicationService.verifyUserAccess(id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied', 403);
            }

            const options = {
                include_content: include_content === 'true',
                include_analytics: include_analytics === 'true',
                sort_by,
                sort_order
            };

            const chapters = await ChapterService.getPublicationChapters(id, options);

            res.json({
                success: true,
                data: {
                    publication_id: id,
                    chapters: chapters.chapters,
                    summary: chapters.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reorganize publication chapter structure
     * POST /api/publishing/publications/:id/chapters/reorganize
     */
    static async reorganizeChapters(req, res, next) {
        try {
            const { id } = req.params;
            const {
                reorganization_plan,
                validation_mode = 'strict',
                preserve_history = true,
                auto_update_references = true
            } = req.body;
            const userId = req.user.id;

            if (!reorganization_plan || !reorganization_plan.chapters) {
                throw new AppError('Reorganization plan with chapters array is required', 400);
            }

            const reorganizationData = {
                chapters: reorganization_plan.chapters,
                validation_mode,
                preserve_history,
                auto_update_references
            };

            const result = await ChapterService.reorganizeChapterStructure(
                id,
                reorganizationData,
                userId
            );

            res.json({
                success: true,
                message: 'Chapter reorganization completed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Initialize collaboration workspace
     * POST /api/publishing/publications/:id/collaboration
     */
    static async initializeCollaboration(req, res, next) {
        try {
            const { id } = req.params;
            const {
                collaborators = [],
                workspace_settings = {},
                workflow_configuration = {},
                real_time_settings = {}
            } = req.body;
            const userId = req.user.id;

            const workspaceData = {
                publication_id: id,
                collaborators,
                workspace_settings,
                workflow_configuration,
                real_time_settings
            };

            const result = await CollaborationService.initializeCollaborationWorkspace(
                workspaceData,
                userId
            );

            res.json({
                success: true,
                message: 'Collaboration workspace initialized successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get publication rights information
     * GET /api/publishing/publications/:id/rights
     */
    static async getPublicationRights(req, res, next) {
        try {
            const { id } = req.params;
            const {
                include_territorial = true,
                include_licensing = true,
                include_conflicts = false
            } = req.query;

            const userId = req.user.id;

            // Verify access
            const hasAccess = await PublicationService.verifyUserAccess(id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied', 403);
            }

            const options = {
                include_territorial: include_territorial === 'true',
                include_licensing: include_licensing === 'true',
                include_conflicts: include_conflicts === 'true'
            };

            const rightsInfo = await RightsManagementService.getPublicationRights(
                id,
                options
            );

            res.json({
                success: true,
                data: rightsInfo
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Archive publication
     * POST /api/publishing/publications/:id/archive
     */
    static async archivePublication(req, res, next) {
        try {
            const { id } = req.params;
            const {
                archive_reason = '',
                preserve_collaborations = true,
                preserve_rights = true,
                create_backup = true
            } = req.body;
            const userId = req.user.id;

            const archiveOptions = {
                archive_reason,
                preserve_collaborations,
                preserve_rights,
                create_backup
            };

            const result = await PublicationService.archivePublication(
                id,
                userId,
                archiveOptions
            );

            res.json({
                success: true,
                message: 'Publication archived successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restore archived publication
     * POST /api/publishing/publications/:id/restore
     */
    static async restorePublication(req, res, next) {
        try {
            const { id } = req.params;
            const {
                restore_collaborations = true,
                restore_rights = true,
                restore_reason = ''
            } = req.body;
            const userId = req.user.id;

            const restoreOptions = {
                restore_collaborations,
                restore_rights,
                restore_reason
            };

            const result = await PublicationService.restorePublication(
                id,
                userId,
                restoreOptions
            );

            res.json({
                success: true,
                message: 'Publication restored successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Duplicate publication
     * POST /api/publishing/publications/:id/duplicate
     */
    static async duplicatePublication(req, res, next) {
        try {
            const { id } = req.params;
            const {
                new_title,
                duplicate_chapters = true,
                duplicate_collaborations = false,
                duplicate_rights = false,
                duplicate_settings = true
            } = req.body;
            const userId = req.user.id;

            if (!new_title) {
                throw new AppError('New title is required for duplication', 400);
            }

            const duplicationOptions = {
                new_title,
                duplicate_chapters,
                duplicate_collaborations,
                duplicate_rights,
                duplicate_settings
            };

            const result = await PublicationService.duplicatePublication(
                id,
                userId,
                duplicationOptions
            );

            res.status(201).json({
                success: true,
                message: 'Publication duplicated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PublicationController;
