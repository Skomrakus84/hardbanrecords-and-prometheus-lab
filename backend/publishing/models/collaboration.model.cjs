/**
 * Collaboration Model - Advanced Author Collaboration Management
 * Manages multi-author collaborations, permissions, contribution tracking, and workflow coordination
 * Supports various collaboration types: co-authoring, editing, reviewing, consulting
 * Provides comprehensive role management, activity tracking, and contribution analytics
 */

const { supabase } = require('../../../db.cjs');
const { AppError } = require('../../../middleware/errorHandler.cjs');
const { v4: uuidv4 } = require('uuid');

class CollaborationModel {
    /**
     * Create new collaboration
     * @param {Object} collaborationData - Collaboration information
     * @returns {Promise<Object>} Created collaboration
     */
    static async create(collaborationData) {
        try {
            const {
                publication_id,
                initiator_id,
                collaborator_id,
                collaboration_type = 'co-author', // co-author, editor, reviewer, consultant, translator
                role_description,
                permissions = [],
                contribution_percentage = 0,
                royalty_percentage = 0,
                status = 'pending', // pending, active, completed, cancelled, suspended
                start_date = new Date(),
                end_date = null,
                terms_agreed = false,
                contract_details = {},
                communication_preferences = {},
                workflow_settings = {}
            } = collaborationData;

            // Validation
            if (!publication_id || !initiator_id || !collaborator_id) {
                throw new AppError('Publication ID, initiator ID, and collaborator ID are required', 400);
            }

            if (initiator_id === collaborator_id) {
                throw new AppError('Initiator and collaborator cannot be the same person', 400);
            }

            // Check if collaboration already exists
            const existing = await this.findByPublicationAndCollaborator(publication_id, collaborator_id);
            if (existing && existing.status === 'active') {
                throw new AppError('Active collaboration already exists for this publication and collaborator', 409);
            }

            // Validate permissions based on collaboration type
            const validatedPermissions = this.validatePermissions(collaboration_type, permissions);

            // Set default workflow settings
            const defaultWorkflow = this.getDefaultWorkflowSettings(collaboration_type);
            const finalWorkflowSettings = { ...defaultWorkflow, ...workflow_settings };

            const collaboration = {
                id: uuidv4(),
                publication_id,
                initiator_id,
                collaborator_id,
                collaboration_type,
                role_description,
                permissions: validatedPermissions,
                contribution_percentage,
                royalty_percentage,
                status,
                start_date,
                end_date,
                terms_agreed,
                contract_details,
                communication_preferences: {
                    email_notifications: true,
                    task_updates: true,
                    deadline_reminders: true,
                    progress_reports: false,
                    ...communication_preferences
                },
                workflow_settings: finalWorkflowSettings,
                invitation_sent_at: status === 'pending' ? new Date() : null,
                accepted_at: null,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            };

            const { data, error } = await supabase
                .from('collaborations')
                .insert(collaboration)
                .select()
                .single();

            if (error) throw new AppError(`Failed to create collaboration: ${error.message}`, 500);

            // Log collaboration creation
            await this.logActivity(data.id, 'created', {
                initiator_id,
                collaborator_id,
                collaboration_type
            });

            // Send invitation notification
            if (status === 'pending') {
                await this.sendCollaborationInvitation(data);
            }

            return data;
        } catch (error) {
            console.error('Error creating collaboration:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create collaboration', 500);
        }
    }

    /**
     * Find collaboration by ID
     * @param {string} id - Collaboration ID
     * @returns {Promise<Object|null>} Collaboration data
     */
    static async findById(id) {
        try {
            const { data, error } = await supabase
                .from('collaborations')
                .select(`
                    *,
                    publications:publication_id (
                        title, author_id, status, publication_type
                    ),
                    initiator:initiator_id (
                        id, email, full_name, profile
                    ),
                    collaborator:collaborator_id (
                        id, email, full_name, profile
                    )
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to fetch collaboration: ${error.message}`, 500);
            }

            return data;
        } catch (error) {
            console.error('Error finding collaboration:', error);
            throw error instanceof AppError ? error : new AppError('Failed to find collaboration', 500);
        }
    }

    /**
     * Find collaboration by publication and collaborator
     * @param {string} publicationId - Publication ID
     * @param {string} collaboratorId - Collaborator ID
     * @returns {Promise<Object|null>} Collaboration data
     */
    static async findByPublicationAndCollaborator(publicationId, collaboratorId) {
        try {
            const { data, error } = await supabase
                .from('collaborations')
                .select('*')
                .eq('publication_id', publicationId)
                .eq('collaborator_id', collaboratorId)
                .in('status', ['pending', 'active'])
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to find collaboration: ${error.message}`, 500);
            }

            return data;
        } catch (error) {
            console.error('Error finding collaboration:', error);
            return null;
        }
    }

    /**
     * Get all collaborations for a publication
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of collaborations
     */
    static async getByPublication(publicationId, options = {}) {
        try {
            const {
                status = null,
                collaboration_type = null,
                include_completed = false,
                limit = 50,
                offset = 0
            } = options;

            let query = supabase
                .from('collaborations')
                .select(`
                    *,
                    publications:publication_id (
                        title, author_id, status, publication_type
                    ),
                    initiator:initiator_id (
                        id, email, full_name, profile
                    ),
                    collaborator:collaborator_id (
                        id, email, full_name, profile
                    )
                `)
                .eq('publication_id', publicationId);

            if (status) {
                query = query.eq('status', status);
            }

            if (collaboration_type) {
                query = query.eq('collaboration_type', collaboration_type);
            }

            if (!include_completed) {
                query = query.neq('status', 'completed');
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                throw new AppError(`Failed to fetch collaborations: ${error.message}`, 500);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting collaborations by publication:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get collaborations', 500);
        }
    }

    /**
     * Get collaborations for a user
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of collaborations
     */
    static async getByUser(userId, options = {}) {
        try {
            const {
                role = 'both', // initiator, collaborator, both
                status = null,
                limit = 50,
                offset = 0
            } = options;

            let query = supabase
                .from('collaborations')
                .select(`
                    *,
                    publications:publication_id (
                        title, author_id, status, publication_type
                    ),
                    initiator:initiator_id (
                        id, email, full_name, profile
                    ),
                    collaborator:collaborator_id (
                        id, email, full_name, profile
                    )
                `);

            if (role === 'initiator') {
                query = query.eq('initiator_id', userId);
            } else if (role === 'collaborator') {
                query = query.eq('collaborator_id', userId);
            } else {
                query = query.or(`initiator_id.eq.${userId},collaborator_id.eq.${userId}`);
            }

            if (status) {
                query = query.eq('status', status);
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                throw new AppError(`Failed to fetch user collaborations: ${error.message}`, 500);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting user collaborations:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get user collaborations', 500);
        }
    }

    /**
     * Accept collaboration invitation
     * @param {string} id - Collaboration ID
     * @param {string} collaboratorId - Collaborator ID
     * @param {Object} acceptanceData - Acceptance details
     * @returns {Promise<Object>} Updated collaboration
     */
    static async acceptInvitation(id, collaboratorId, acceptanceData = {}) {
        try {
            const collaboration = await this.findById(id);
            if (!collaboration) {
                throw new AppError('Collaboration not found', 404);
            }

            if (collaboration.collaborator_id !== collaboratorId) {
                throw new AppError('Unauthorized to accept this collaboration', 403);
            }

            if (collaboration.status !== 'pending') {
                throw new AppError('Collaboration invitation is not pending', 400);
            }

            const {
                terms_agreed = true,
                contract_modifications = {},
                communication_preferences = {}
            } = acceptanceData;

            const updates = {
                status: 'active',
                terms_agreed,
                accepted_at: new Date(),
                updated_at: new Date()
            };

            // Merge contract modifications if provided
            if (Object.keys(contract_modifications).length > 0) {
                updates.contract_details = {
                    ...collaboration.contract_details,
                    ...contract_modifications,
                    modifications_by_collaborator: contract_modifications
                };
            }

            // Update communication preferences
            if (Object.keys(communication_preferences).length > 0) {
                updates.communication_preferences = {
                    ...collaboration.communication_preferences,
                    ...communication_preferences
                };
            }

            const { data, error } = await supabase
                .from('collaborations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to accept collaboration: ${error.message}`, 500);
            }

            // Log acceptance
            await this.logActivity(id, 'accepted', {
                collaborator_id: collaboratorId,
                terms_agreed,
                modifications_count: Object.keys(contract_modifications).length
            });

            // Notify initiator
            await this.sendAcceptanceNotification(data);

            return data;
        } catch (error) {
            console.error('Error accepting collaboration:', error);
            throw error instanceof AppError ? error : new AppError('Failed to accept collaboration', 500);
        }
    }

    /**
     * Update collaboration
     * @param {string} id - Collaboration ID
     * @param {Object} updates - Update data
     * @param {string} updatedBy - User making the update
     * @returns {Promise<Object>} Updated collaboration
     */
    static async update(id, updates, updatedBy) {
        try {
            const collaboration = await this.findById(id);
            if (!collaboration) {
                throw new AppError('Collaboration not found', 404);
            }

            // Check permission to update
            if (collaboration.initiator_id !== updatedBy && collaboration.collaborator_id !== updatedBy) {
                throw new AppError('Unauthorized to update this collaboration', 403);
            }

            // Validate updates
            const allowedFields = [
                'role_description', 'permissions', 'contribution_percentage',
                'royalty_percentage', 'status', 'end_date', 'contract_details',
                'communication_preferences', 'workflow_settings'
            ];

            const validUpdates = Object.keys(updates)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = updates[key];
                    return obj;
                }, {});

            validUpdates.updated_at = new Date();

            // Handle status changes
            if (validUpdates.status && validUpdates.status !== collaboration.status) {
                if (validUpdates.status === 'completed') {
                    validUpdates.completed_at = new Date();
                }
            }

            const { data, error } = await supabase
                .from('collaborations')
                .update(validUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to update collaboration: ${error.message}`, 500);
            }

            // Log update
            await this.logActivity(id, 'updated', {
                updated_by: updatedBy,
                fields_updated: Object.keys(validUpdates),
                status_change: validUpdates.status !== collaboration.status ? {
                    from: collaboration.status,
                    to: validUpdates.status
                } : null
            });

            return data;
        } catch (error) {
            console.error('Error updating collaboration:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update collaboration', 500);
        }
    }

    /**
     * Cancel collaboration
     * @param {string} id - Collaboration ID
     * @param {string} cancelledBy - User cancelling
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Updated collaboration
     */
    static async cancel(id, cancelledBy, reason = '') {
        try {
            const collaboration = await this.findById(id);
            if (!collaboration) {
                throw new AppError('Collaboration not found', 404);
            }

            if (collaboration.initiator_id !== cancelledBy && collaboration.collaborator_id !== cancelledBy) {
                throw new AppError('Unauthorized to cancel this collaboration', 403);
            }

            if (collaboration.status === 'completed' || collaboration.status === 'cancelled') {
                throw new AppError('Cannot cancel completed or already cancelled collaboration', 400);
            }

            const { data, error } = await supabase
                .from('collaborations')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date(),
                    cancellation_reason: reason,
                    cancelled_by: cancelledBy,
                    updated_at: new Date()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new AppError(`Failed to cancel collaboration: ${error.message}`, 500);
            }

            // Log cancellation
            await this.logActivity(id, 'cancelled', {
                cancelled_by: cancelledBy,
                reason
            });

            // Notify other party
            await this.sendCancellationNotification(data, cancelledBy);

            return data;
        } catch (error) {
            console.error('Error cancelling collaboration:', error);
            throw error instanceof AppError ? error : new AppError('Failed to cancel collaboration', 500);
        }
    }

    /**
     * Get collaboration analytics
     * @param {string} userId - User ID (optional)
     * @param {Object} options - Analytics options
     * @returns {Promise<Object>} Analytics data
     */
    static async getAnalytics(userId = null, options = {}) {
        try {
            const {
                publication_id = null,
                time_range = '6_months',
                group_by = 'month'
            } = options;

            let query = supabase.from('collaborations');

            // Base filters
            if (userId) {
                query = query.or(`initiator_id.eq.${userId},collaborator_id.eq.${userId}`);
            }

            if (publication_id) {
                query = query.eq('publication_id', publication_id);
            }

            // Time range filter
            const timeFilter = this.getTimeRangeFilter(time_range);
            if (timeFilter) {
                query = query.gte('created_at', timeFilter);
            }

            const { data: collaborations, error } = await query.select('*');

            if (error) {
                throw new AppError(`Failed to fetch collaboration analytics: ${error.message}`, 500);
            }

            // Calculate analytics
            const analytics = {
                total_collaborations: collaborations.length,
                by_status: this.groupBy(collaborations, 'status'),
                by_type: this.groupBy(collaborations, 'collaboration_type'),
                by_time_period: this.groupByTimePeriod(collaborations, group_by),
                average_duration: this.calculateAverageDuration(collaborations),
                completion_rate: this.calculateCompletionRate(collaborations),
                most_active_collaborators: await this.getMostActiveCollaborators(userId),
                contribution_distribution: this.analyzeContributionDistribution(collaborations),
                royalty_distribution: this.analyzeRoyaltyDistribution(collaborations)
            };

            return analytics;
        } catch (error) {
            console.error('Error getting collaboration analytics:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get collaboration analytics', 500);
        }
    }

    /**
     * Get collaboration activity feed
     * @param {string} collaborationId - Collaboration ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Activity feed
     */
    static async getActivityFeed(collaborationId, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;

            const { data, error } = await supabase
                .from('collaboration_activities')
                .select(`
                    *,
                    users:user_id (
                        id, email, full_name, profile
                    )
                `)
                .eq('collaboration_id', collaborationId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new AppError(`Failed to fetch activity feed: ${error.message}`, 500);
            }

            return data || [];
        } catch (error) {
            console.error('Error getting activity feed:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get activity feed', 500);
        }
    }

    // Helper Methods

    /**
     * Validate permissions based on collaboration type
     */
    static validatePermissions(collaborationType, permissions) {
        const permissionRules = {
            'co-author': [
                'edit_content', 'review_content', 'suggest_changes', 'access_drafts',
                'manage_chapters', 'comment', 'track_changes'
            ],
            'editor': [
                'edit_content', 'review_content', 'suggest_changes', 'track_changes',
                'comment', 'approve_changes', 'access_drafts'
            ],
            'reviewer': [
                'review_content', 'comment', 'suggest_changes', 'access_drafts'
            ],
            'consultant': [
                'review_content', 'comment', 'suggest_changes'
            ],
            'translator': [
                'edit_content', 'access_drafts', 'manage_translations', 'comment'
            ]
        };

        const validPermissions = permissionRules[collaborationType] || [];
        return permissions.filter(permission => validPermissions.includes(permission));
    }

    /**
     * Get default workflow settings for collaboration type
     */
    static getDefaultWorkflowSettings(collaborationType) {
        const workflowDefaults = {
            'co-author': {
                approval_required: false,
                simultaneous_editing: true,
                version_control: true,
                auto_merge: false,
                notification_frequency: 'immediate'
            },
            'editor': {
                approval_required: true,
                simultaneous_editing: false,
                version_control: true,
                auto_merge: false,
                notification_frequency: 'daily'
            },
            'reviewer': {
                approval_required: false,
                simultaneous_editing: false,
                version_control: true,
                auto_merge: false,
                notification_frequency: 'weekly'
            },
            'consultant': {
                approval_required: false,
                simultaneous_editing: false,
                version_control: false,
                auto_merge: false,
                notification_frequency: 'weekly'
            }
        };

        return workflowDefaults[collaborationType] || workflowDefaults['reviewer'];
    }

    /**
     * Log collaboration activity
     */
    static async logActivity(collaborationId, activityType, metadata = {}) {
        try {
            await supabase
                .from('collaboration_activities')
                .insert({
                    id: uuidv4(),
                    collaboration_id: collaborationId,
                    activity_type: activityType,
                    metadata,
                    created_at: new Date()
                });
        } catch (error) {
            console.error('Error logging collaboration activity:', error);
        }
    }

    /**
     * Send collaboration invitation
     */
    static async sendCollaborationInvitation(collaboration) {
        // Implementation would integrate with notification system
        console.log(`Sending collaboration invitation for ${collaboration.id}`);
    }

    /**
     * Send acceptance notification
     */
    static async sendAcceptanceNotification(collaboration) {
        // Implementation would integrate with notification system
        console.log(`Sending acceptance notification for ${collaboration.id}`);
    }

    /**
     * Send cancellation notification
     */
    static async sendCancellationNotification(collaboration, cancelledBy) {
        // Implementation would integrate with notification system
        console.log(`Sending cancellation notification for ${collaboration.id} by ${cancelledBy}`);
    }

    /**
     * Helper methods for analytics
     */
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    static groupByTimePeriod(collaborations, groupBy) {
        // Implementation for time-based grouping
        // Group collaborations by specified time period (day, week, month, quarter, year)
        const grouped = {};
        collaborations.forEach(collaboration => {
            const date = new Date(collaboration.created_at);
            let key;
            
            switch (groupBy) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week': {
                    const week = this.getWeekNumber(date);
                    key = `${date.getFullYear()}-W${week}`;
                    break;
                }
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'quarter': {
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    key = `${date.getFullYear()}-Q${quarter}`;
                    break;
                }
                case 'year':
                    key = date.getFullYear().toString();
                    break;
                default:
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            
            grouped[key] = (grouped[key] || 0) + 1;
        });
        
        return grouped;
    }

    static calculateAverageDuration(collaborations) {
        const completed = collaborations.filter(c => c.completed_at && c.start_date);
        if (completed.length === 0) return 0;

        const totalDuration = completed.reduce((sum, c) => {
            const duration = new Date(c.completed_at) - new Date(c.start_date);
            return sum + duration;
        }, 0);

        return totalDuration / completed.length / (1000 * 60 * 60 * 24); // Days
    }

    static calculateCompletionRate(collaborations) {
        if (collaborations.length === 0) return 0;
        const completed = collaborations.filter(c => c.status === 'completed').length;
        return (completed / collaborations.length) * 100;
    }

    static async getMostActiveCollaborators(userId) {
        // Implementation for finding most active collaborators
        try {
            const { data, error } = await supabase
                .from('collaborations')
                .select('collaborator_id, count(*)')
                .or(`initiator_id.eq.${userId},collaborator_id.eq.${userId}`)
                .group('collaborator_id')
                .order('count', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching active collaborators:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getMostActiveCollaborators:', error);
            return [];
        }
    }

    static analyzeContributionDistribution(collaborations) {
        // Implementation for contribution analysis
        const distribution = {
            total_collaborations: collaborations.length,
            by_percentage_range: {
                '0-25%': 0,
                '26-50%': 0,
                '51-75%': 0,
                '76-100%': 0
            },
            average_contribution: 0,
            median_contribution: 0
        };

        if (collaborations.length === 0) return distribution;

        const contributions = collaborations
            .map(c => c.contribution_percentage || 0)
            .filter(c => c > 0);

        contributions.forEach(percentage => {
            if (percentage <= 25) {
                distribution.by_percentage_range['0-25%']++;
            } else if (percentage <= 50) {
                distribution.by_percentage_range['26-50%']++;
            } else if (percentage <= 75) {
                distribution.by_percentage_range['51-75%']++;
            } else {
                distribution.by_percentage_range['76-100%']++;
            }
        });

        if (contributions.length > 0) {
            distribution.average_contribution = contributions.reduce((a, b) => a + b, 0) / contributions.length;
            const sorted = contributions.sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            distribution.median_contribution = sorted.length % 2 !== 0 
                ? sorted[mid] 
                : (sorted[mid - 1] + sorted[mid]) / 2;
        }

        return distribution;
    }

    static analyzeRoyaltyDistribution(collaborations) {
        // Implementation for royalty analysis
        const distribution = {
            total_collaborations: collaborations.length,
            by_percentage_range: {
                '0-10%': 0,
                '11-25%': 0,
                '26-50%': 0,
                '51-100%': 0
            },
            average_royalty: 0,
            total_royalty_percentage: 0
        };

        if (collaborations.length === 0) return distribution;

        const royalties = collaborations
            .map(c => c.royalty_percentage || 0)
            .filter(r => r > 0);

        royalties.forEach(percentage => {
            if (percentage <= 10) {
                distribution.by_percentage_range['0-10%']++;
            } else if (percentage <= 25) {
                distribution.by_percentage_range['11-25%']++;
            } else if (percentage <= 50) {
                distribution.by_percentage_range['26-50%']++;
            } else {
                distribution.by_percentage_range['51-100%']++;
            }
        });

        if (royalties.length > 0) {
            distribution.average_royalty = royalties.reduce((a, b) => a + b, 0) / royalties.length;
            distribution.total_royalty_percentage = royalties.reduce((a, b) => a + b, 0);
        }

        return distribution;
    }

    static getTimeRangeFilter(timeRange) {
        const now = new Date();
        const ranges = {
            '1_month': new Date(now.setMonth(now.getMonth() - 1)),
            '3_months': new Date(now.setMonth(now.getMonth() - 3)),
            '6_months': new Date(now.setMonth(now.getMonth() - 6)),
            '1_year': new Date(now.setFullYear(now.getFullYear() - 1))
        };
        return ranges[timeRange];
    }

    static getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
}

module.exports = CollaborationModel;
