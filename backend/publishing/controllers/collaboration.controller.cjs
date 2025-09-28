/**
 * Collaboration Controller - Advanced Collaboration Management REST API
 * Exposes comprehensive collaboration features through REST endpoints
 * Provides sophisticated real-time editing, conflict resolution, and workflow management
 * Integrates with Collaboration Service and real-time systems
 */

const CollaborationService = require('../services/collaboration.service.cjs');
const PublicationService = require('../services/publication.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const { validateRequest } = require('../../middleware/validate.cjs');

class CollaborationController {
    /**
     * Initialize collaboration workspace for publication
     * POST /api/publishing/collaborations/workspaces
     */
    static async initializeWorkspace(req, res, next) {
        try {
            const {
                publication_id,
                collaborators = [],
                workspace_settings = {},
                workflow_configuration = {},
                permission_templates = {},
                real_time_settings = {}
            } = req.body;

            const userId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Verify user has permission to initialize collaboration
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const workspaceData = {
                publication_id,
                collaborators,
                workspace_settings,
                workflow_configuration,
                permission_templates,
                real_time_settings,
                automated_workflows: true
            };

            const result = await CollaborationService.initializeCollaborationWorkspace(
                workspaceData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Collaboration workspace initialized successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get collaboration workspace details
     * GET /api/publishing/collaborations/workspaces/:workspaceId
     */
    static async getWorkspace(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const {
                include_analytics = false,
                include_activity = true,
                include_conflicts = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                include_analytics: include_analytics === 'true',
                include_activity: include_activity === 'true',
                include_conflicts: include_conflicts === 'true'
            };

            const workspace = await CollaborationService.getWorkspaceDetails(
                workspaceId,
                userId,
                options
            );

            if (!workspace) {
                throw new AppError('Workspace not found', 404);
            }

            res.json({
                success: true,
                data: workspace
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Manage collaborative editing session
     * POST /api/publishing/collaborations/sessions
     */
    static async manageSession(req, res, next) {
        try {
            const {
                publication_id,
                session_id = null,
                action = 'start',
                participants = [],
                editing_context = {},
                session_settings = {}
            } = req.body;

            const userId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Generate session ID if not provided for new sessions
            const finalSessionId = session_id || `session_${Date.now()}_${userId}`;

            const sessionData = {
                action,
                participants: [...participants, userId], // Always include current user
                editing_context,
                conflict_resolution: session_settings.conflict_resolution || 'automatic',
                session_settings,
                user_id: userId
            };

            const result = await CollaborationService.manageCollaborativeSession(
                publication_id,
                finalSessionId,
                sessionData
            );

            res.json({
                success: true,
                message: `Session ${action} executed successfully`,
                data: {
                    session_id: finalSessionId,
                    publication_id,
                    action,
                    result
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active collaboration sessions
     * GET /api/publishing/collaborations/sessions
     */
    static async getActiveSessions(req, res, next) {
        try {
            const {
                publication_id = null,
                include_participants = true,
                include_activity = false
            } = req.query;

            const userId = req.user.id;

            const options = {
                publication_id,
                user_id: userId,
                include_participants: include_participants === 'true',
                include_activity: include_activity === 'true'
            };

            const sessions = await CollaborationService.getActiveSessions(options);

            res.json({
                success: true,
                data: {
                    active_sessions: sessions.sessions,
                    total_sessions: sessions.total,
                    user_sessions: sessions.user_sessions
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Resolve collaboration conflicts
     * POST /api/publishing/collaborations/conflicts/resolve
     */
    static async resolveConflicts(req, res, next) {
        try {
            const {
                collaboration_id,
                conflicts = [],
                resolution_strategy = {},
                auto_apply = false
            } = req.body;

            const userId = req.user.id;

            if (!collaboration_id || conflicts.length === 0) {
                throw new AppError('Collaboration ID and conflicts array are required', 400);
            }

            const resolutionConfig = {
                resolution_type: resolution_strategy.type || 'collaborative',
                auto_resolve: auto_apply,
                notification_settings: resolution_strategy.notifications || {},
                preserve_history: resolution_strategy.preserve_history !== false,
                merge_strategy: resolution_strategy.merge_strategy || 'smart'
            };

            const result = await CollaborationService.resolveCollaborationConflicts(
                collaboration_id,
                conflicts,
                resolutionConfig,
                userId
            );

            res.json({
                success: true,
                message: 'Conflict resolution completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get collaboration conflicts
     * GET /api/publishing/collaborations/:collaborationId/conflicts
     */
    static async getConflicts(req, res, next) {
        try {
            const { collaborationId } = req.params;
            const {
                status = 'all',
                include_resolved = false,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = req.query;

            const userId = req.user.id;

            const options = {
                status,
                include_resolved: include_resolved === 'true',
                sort_by,
                sort_order,
                user_id: userId
            };

            const conflicts = await CollaborationService.getCollaborationConflicts(
                collaborationId,
                options
            );

            res.json({
                success: true,
                data: {
                    collaboration_id: collaborationId,
                    conflicts: conflicts.conflicts,
                    summary: conflicts.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate collaboration analytics
     * GET /api/publishing/collaborations/analytics
     */
    static async getAnalytics(req, res, next) {
        try {
            const {
                publication_id = null,
                time_range = '30_days',
                include_productivity = true,
                include_contribution = true,
                include_conflicts = true,
                include_predictions = false,
                granularity = 'daily'
            } = req.query;

            const userId = req.user.id;

            const analyticsOptions = {
                time_range,
                include_productivity,
                include_contribution,
                include_conflicts,
                include_predictions: include_predictions === 'true',
                granularity
            };

            const analytics = await CollaborationService.generateCollaborationAnalytics(
                publication_id,
                userId,
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
     * Optimize collaboration workflow
     * POST /api/publishing/collaborations/:collaborationId/optimize
     */
    static async optimizeWorkflow(req, res, next) {
        try {
            const { collaborationId } = req.params;
            const {
                optimization_goals = {},
                apply_recommendations = false
            } = req.body;

            const userId = req.user.id;

            const optimizationConfig = {
                primary_goal: optimization_goals.primary_goal || 'efficiency',
                constraints: optimization_goals.constraints || {},
                automation_level: optimization_goals.automation_level || 'medium',
                risk_tolerance: optimization_goals.risk_tolerance || 'low'
            };

            const result = await CollaborationService.optimizeCollaborationWorkflow(
                collaborationId,
                optimizationConfig
            );

            // Apply recommendations if requested
            if (apply_recommendations && result.recommended_strategies.length > 0) {
                const applicationResult = await CollaborationService.applyWorkflowOptimizations(
                    collaborationId,
                    result.recommended_strategies,
                    userId
                );
                result.application_result = applicationResult;
            }

            res.json({
                success: true,
                message: 'Workflow optimization analysis completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Invite collaborator to publication
     * POST /api/publishing/collaborations/invite
     */
    static async inviteCollaborator(req, res, next) {
        try {
            const {
                publication_id,
                collaborator_email,
                collaborator_id = null,
                role = 'collaborator',
                permissions = [],
                invitation_message = '',
                expiry_days = 7
            } = req.body;

            const userId = req.user.id;

            if (!publication_id || (!collaborator_email && !collaborator_id)) {
                throw new AppError('Publication ID and collaborator identifier are required', 400);
            }

            // Verify permission to invite collaborators
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const invitationData = {
                publication_id,
                collaborator_email,
                collaborator_id,
                role,
                permissions,
                invitation_message,
                expiry_days,
                invited_by: userId
            };

            const result = await CollaborationService.inviteCollaborator(invitationData);

            res.status(201).json({
                success: true,
                message: 'Collaborator invitation sent successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Accept collaboration invitation
     * POST /api/publishing/collaborations/invitations/:invitationId/accept
     */
    static async acceptInvitation(req, res, next) {
        try {
            const { invitationId } = req.params;
            const {
                collaboration_preferences = {},
                notification_settings = {}
            } = req.body;

            const userId = req.user.id;

            const acceptanceData = {
                collaboration_preferences,
                notification_settings,
                accepted_by: userId,
                accepted_at: new Date()
            };

            const result = await CollaborationService.acceptCollaborationInvitation(
                invitationId,
                acceptanceData
            );

            res.json({
                success: true,
                message: 'Collaboration invitation accepted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Decline collaboration invitation
     * POST /api/publishing/collaborations/invitations/:invitationId/decline
     */
    static async declineInvitation(req, res, next) {
        try {
            const { invitationId } = req.params;
            const {
                decline_reason = ''
            } = req.body;

            const userId = req.user.id;

            const declineData = {
                decline_reason,
                declined_by: userId,
                declined_at: new Date()
            };

            const result = await CollaborationService.declineCollaborationInvitation(
                invitationId,
                declineData
            );

            res.json({
                success: true,
                message: 'Collaboration invitation declined',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get collaboration invitations
     * GET /api/publishing/collaborations/invitations
     */
    static async getInvitations(req, res, next) {
        try {
            const {
                type = 'received', // 'sent', 'received', 'all'
                status = 'pending',
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const options = {
                type,
                status,
                user_id: userId,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 50)
            };

            const invitations = await CollaborationService.getCollaborationInvitations(options);

            res.json({
                success: true,
                data: {
                    invitations: invitations.invitations,
                    pagination: invitations.pagination,
                    summary: invitations.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update collaborator permissions
     * PUT /api/publishing/collaborations/:collaborationId/permissions
     */
    static async updatePermissions(req, res, next) {
        try {
            const { collaborationId } = req.params;
            const {
                collaborator_id,
                new_permissions = [],
                new_role = null,
                permission_reason = ''
            } = req.body;

            const userId = req.user.id;

            if (!collaborator_id) {
                throw new AppError('Collaborator ID is required', 400);
            }

            const updateData = {
                collaborator_id,
                new_permissions,
                new_role,
                permission_reason,
                updated_by: userId
            };

            const result = await CollaborationService.updateCollaboratorPermissions(
                collaborationId,
                updateData
            );

            res.json({
                success: true,
                message: 'Collaborator permissions updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove collaborator from publication
     * DELETE /api/publishing/collaborations/:collaborationId/collaborators/:collaboratorId
     */
    static async removeCollaborator(req, res, next) {
        try {
            const { collaborationId, collaboratorId } = req.params;
            const {
                removal_reason = '',
                preserve_contributions = true,
                notify_collaborator = true
            } = req.body;

            const userId = req.user.id;

            const removalData = {
                collaborator_id: collaboratorId,
                removal_reason,
                preserve_contributions,
                notify_collaborator,
                removed_by: userId
            };

            const result = await CollaborationService.removeCollaborator(
                collaborationId,
                removalData
            );

            res.json({
                success: true,
                message: 'Collaborator removed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get collaboration activity feed
     * GET /api/publishing/collaborations/:collaborationId/activity
     */
    static async getActivityFeed(req, res, next) {
        try {
            const { collaborationId } = req.params;
            const {
                page = 1,
                limit = 50,
                activity_types = 'all',
                date_from = null,
                date_to = null
            } = req.query;

            const userId = req.user.id;

            const options = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                activity_types: activity_types === 'all' ? [] : activity_types.split(','),
                date_from,
                date_to,
                user_id: userId
            };

            const activity = await CollaborationService.getCollaborationActivity(
                collaborationId,
                options
            );

            res.json({
                success: true,
                data: {
                    collaboration_id: collaborationId,
                    activity: activity.activity,
                    pagination: activity.pagination,
                    summary: activity.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export collaboration data
     * GET /api/publishing/collaborations/:collaborationId/export
     */
    static async exportCollaboration(req, res, next) {
        try {
            const { collaborationId } = req.params;
            const {
                export_format = 'json',
                include_activity = true,
                include_conflicts = false,
                include_analytics = false,
                date_range = null
            } = req.query;

            const userId = req.user.id;

            const exportOptions = {
                format: export_format,
                include_activity: include_activity === 'true',
                include_conflicts: include_conflicts === 'true',
                include_analytics: include_analytics === 'true',
                date_range,
                requested_by: userId
            };

            const exportResult = await CollaborationService.exportCollaborationData(
                collaborationId,
                exportOptions
            );

            // Set appropriate headers for file download
            res.setHeader('Content-Type', exportResult.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

            if (exportResult.is_binary) {
                res.send(exportResult.content);
            } else {
                res.json({
                    success: true,
                    data: {
                        collaboration_id: collaborationId,
                        export_format,
                        content: exportResult.content,
                        metadata: exportResult.metadata
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CollaborationController;
