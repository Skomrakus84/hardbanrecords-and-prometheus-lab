/**
 * Rights Management Controller - Advanced Rights & Licensing REST API
 * Exposes comprehensive rights management features through REST endpoints
 * Provides sophisticated territorial rights, licensing, and compliance management
 * Integrates with Rights Management Service and legal frameworks
 */

const RightsManagementService = require('../services/rightsManagement.service.cjs');
const PublicationService = require('../services/publication.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const { validateRequest } = require('../../middleware/validate.cjs');

class RightsManagementController {
    /**
     * Grant territorial rights for publication
     * POST /api/publishing/rights/territorial
     */
    static async grantTerritorialRights(req, res, next) {
        try {
            const {
                publication_id,
                grantee_id,
                territories = [],
                rights_type = 'distribution',
                duration_months = 12,
                terms_conditions = {},
                exclusive = false,
                royalty_percentage = 0
            } = req.body;

            const userId = req.user.id;

            if (!publication_id || !grantee_id || territories.length === 0) {
                throw new AppError('Publication ID, grantee ID, and territories are required', 400);
            }

            // Verify user has rights management permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const rightsData = {
                publication_id,
                grantee_id,
                territories,
                rights_type,
                duration_months,
                terms_conditions,
                exclusive,
                royalty_percentage,
                granted_by: userId
            };

            const result = await RightsManagementService.grantTerritorialRights(
                rightsData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Territorial rights granted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create licensing agreement
     * POST /api/publishing/rights/licensing
     */
    static async createLicensingAgreement(req, res, next) {
        try {
            const {
                publication_id,
                licensee_id,
                license_type = 'standard',
                license_terms = {},
                financial_terms = {},
                territorial_scope = [],
                duration_config = {},
                special_conditions = []
            } = req.body;

            const userId = req.user.id;

            if (!publication_id || !licensee_id) {
                throw new AppError('Publication ID and licensee ID are required', 400);
            }

            // Verify user has licensing permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const licensingData = {
                publication_id,
                licensee_id,
                license_type,
                license_terms,
                financial_terms,
                territorial_scope,
                duration_config,
                special_conditions,
                created_by: userId
            };

            const result = await RightsManagementService.createLicensingAgreement(
                licensingData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Licensing agreement created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get publication rights overview
     * GET /api/publishing/rights/publications/:publicationId
     */
    static async getPublicationRights(req, res, next) {
        try {
            const { publicationId } = req.params;
            const {
                include_territorial = true,
                include_licensing = true,
                include_conflicts = false,
                include_analytics = false,
                active_only = true
            } = req.query;

            const userId = req.user.id;

            // Verify access to publication
            const hasAccess = await PublicationService.verifyUserAccess(publicationId, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const options = {
                include_territorial: include_territorial === 'true',
                include_licensing: include_licensing === 'true',
                include_conflicts: include_conflicts === 'true',
                include_analytics: include_analytics === 'true',
                active_only: active_only === 'true'
            };

            const rightsInfo = await RightsManagementService.getPublicationRights(
                publicationId,
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
     * Update rights agreement
     * PUT /api/publishing/rights/:rightsId
     */
    static async updateRightsAgreement(req, res, next) {
        try {
            const { rightsId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                amendment_reason = '',
                notify_parties = true,
                effective_date = null
            } = req.query;

            const updateOptions = {
                amendment_reason,
                notify_parties: notify_parties === 'true',
                effective_date: effective_date ? new Date(effective_date) : new Date(),
                updated_by: userId
            };

            const result = await RightsManagementService.updateRightsAgreement(
                rightsId,
                updateData,
                updateOptions
            );

            res.json({
                success: true,
                message: 'Rights agreement updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Revoke rights agreement
     * DELETE /api/publishing/rights/:rightsId
     */
    static async revokeRights(req, res, next) {
        try {
            const { rightsId } = req.params;
            const {
                revocation_reason = '',
                immediate = false,
                notice_period_days = 30,
                notify_parties = true
            } = req.body;

            const userId = req.user.id;

            const revocationData = {
                revocation_reason,
                immediate,
                notice_period_days,
                notify_parties,
                revoked_by: userId
            };

            const result = await RightsManagementService.revokeRights(
                rightsId,
                revocationData
            );

            res.json({
                success: true,
                message: 'Rights revoked successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Resolve rights conflicts
     * POST /api/publishing/rights/conflicts/resolve
     */
    static async resolveConflicts(req, res, next) {
        try {
            const {
                conflict_ids = [],
                resolution_strategy = {},
                mediator_id = null,
                resolution_notes = ''
            } = req.body;

            const userId = req.user.id;

            if (conflict_ids.length === 0) {
                throw new AppError('Conflict IDs are required', 400);
            }

            const resolutionData = {
                conflict_ids,
                resolution_strategy: {
                    method: resolution_strategy.method || 'negotiation',
                    priority_basis: resolution_strategy.priority_basis || 'chronological',
                    compensation_model: resolution_strategy.compensation_model || 'proportional',
                    auto_resolve_simple: resolution_strategy.auto_resolve_simple || false
                },
                mediator_id,
                resolution_notes,
                resolver_id: userId
            };

            const result = await RightsManagementService.resolveRightsConflicts(
                resolutionData,
                userId
            );

            res.json({
                success: true,
                message: 'Rights conflicts resolution completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get rights conflicts
     * GET /api/publishing/rights/conflicts
     */
    static async getConflicts(req, res, next) {
        try {
            const {
                publication_id = null,
                status = 'active',
                severity = 'all',
                page = 1,
                limit = 20,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = req.query;

            const userId = req.user.id;

            const options = {
                publication_id,
                status,
                severity,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                sort_by,
                sort_order,
                user_id: userId
            };

            const conflicts = await RightsManagementService.getRightsConflicts(options);

            res.json({
                success: true,
                data: {
                    conflicts: conflicts.conflicts,
                    pagination: conflicts.pagination,
                    summary: conflicts.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Audit rights compliance
     * POST /api/publishing/rights/audit
     */
    static async auditCompliance(req, res, next) {
        try {
            const {
                scope = 'user_publications',
                publication_ids = [],
                compliance_frameworks = ['standard'],
                audit_depth = 'standard',
                include_recommendations = true
            } = req.body;

            const userId = req.user.id;

            const auditData = {
                scope,
                publication_ids,
                compliance_frameworks,
                audit_depth,
                include_recommendations,
                auditor_id: userId
            };

            const result = await RightsManagementService.auditRightsCompliance(
                auditData,
                userId
            );

            res.json({
                success: true,
                message: 'Rights compliance audit completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Optimize rights distribution
     * POST /api/publishing/rights/optimize
     */
    static async optimizeDistribution(req, res, next) {
        try {
            const {
                publication_id,
                optimization_goals = {},
                market_constraints = {},
                apply_recommendations = false
            } = req.body;

            const userId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Verify access to publication
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const optimizationData = {
                publication_id,
                optimization_goals: {
                    primary_objective: optimization_goals.primary_objective || 'revenue_maximization',
                    market_coverage: optimization_goals.market_coverage || 'broad',
                    risk_tolerance: optimization_goals.risk_tolerance || 'moderate',
                    time_horizon: optimization_goals.time_horizon || '12_months'
                },
                market_constraints,
                apply_recommendations,
                optimizer_id: userId
            };

            const result = await RightsManagementService.optimizeRightsDistribution(
                optimizationData,
                userId
            );

            res.json({
                success: true,
                message: 'Rights distribution optimization completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get rights analytics
     * GET /api/publishing/rights/analytics
     */
    static async getRightsAnalytics(req, res, next) {
        try {
            const {
                publication_id = null,
                time_range = '12_months',
                metrics = 'all',
                include_forecasting = false,
                granularity = 'monthly'
            } = req.query;

            const userId = req.user.id;

            // If publication_id is provided, verify access
            if (publication_id) {
                const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
                if (!hasAccess) {
                    throw new AppError('Access denied to publication', 403);
                }
            }

            const analyticsOptions = {
                publication_id,
                time_range,
                metrics: metrics === 'all' ? ['revenue', 'coverage', 'conflicts', 'compliance'] : metrics.split(','),
                include_forecasting: include_forecasting === 'true',
                granularity,
                user_id: userId
            };

            const analytics = await RightsManagementService.generateRightsAnalytics(
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
     * Transfer rights ownership
     * POST /api/publishing/rights/:rightsId/transfer
     */
    static async transferRights(req, res, next) {
        try {
            const { rightsId } = req.params;
            const {
                new_owner_id,
                transfer_terms = {},
                transfer_reason = '',
                effective_date = null,
                notify_parties = true
            } = req.body;

            const userId = req.user.id;

            if (!new_owner_id) {
                throw new AppError('New owner ID is required', 400);
            }

            const transferData = {
                new_owner_id,
                transfer_terms,
                transfer_reason,
                effective_date: effective_date ? new Date(effective_date) : new Date(),
                notify_parties,
                transferred_by: userId
            };

            const result = await RightsManagementService.transferRights(
                rightsId,
                transferData
            );

            res.json({
                success: true,
                message: 'Rights transfer completed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get licensing opportunities
     * GET /api/publishing/rights/opportunities
     */
    static async getLicensingOpportunities(req, res, next) {
        try {
            const {
                publication_id = null,
                market_regions = [],
                opportunity_type = 'all',
                min_revenue_potential = 0,
                sort_by = 'potential_revenue',
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const options = {
                publication_id,
                market_regions: market_regions.length > 0 ? market_regions : [],
                opportunity_type,
                min_revenue_potential: parseFloat(min_revenue_potential),
                sort_by,
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const opportunities = await RightsManagementService.identifyLicensingOpportunities(
                options
            );

            res.json({
                success: true,
                data: {
                    opportunities: opportunities.opportunities,
                    market_analysis: opportunities.market_analysis,
                    recommendations: opportunities.recommendations
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate rights contract
     * POST /api/publishing/rights/:rightsId/contract
     */
    static async generateContract(req, res, next) {
        try {
            const { rightsId } = req.params;
            const {
                contract_template = 'standard',
                custom_clauses = [],
                include_schedules = true,
                format = 'pdf'
            } = req.body;

            const userId = req.user.id;

            const contractOptions = {
                template: contract_template,
                custom_clauses,
                include_schedules,
                format,
                generated_by: userId
            };

            const contract = await RightsManagementService.generateRightsContract(
                rightsId,
                contractOptions
            );

            // Set appropriate headers for contract download
            res.setHeader('Content-Type', contract.mime_type);
            res.setHeader('Content-Disposition', `attachment; filename="${contract.filename}"`);

            if (contract.is_binary) {
                res.send(contract.content);
            } else {
                res.json({
                    success: true,
                    data: {
                        rights_id: rightsId,
                        contract_format: format,
                        content: contract.content,
                        metadata: contract.metadata
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk update rights
     * POST /api/publishing/rights/bulk-update
     */
    static async bulkUpdateRights(req, res, next) {
        try {
            const {
                rights_ids = [],
                update_data = {},
                update_reason = '',
                validation_mode = 'strict',
                notify_parties = false
            } = req.body;

            const userId = req.user.id;

            if (rights_ids.length === 0) {
                throw new AppError('Rights IDs are required', 400);
            }

            const bulkUpdateData = {
                rights_ids,
                update_data,
                update_reason,
                validation_mode,
                notify_parties,
                updated_by: userId
            };

            const result = await RightsManagementService.bulkUpdateRights(
                bulkUpdateData
            );

            res.json({
                success: true,
                message: 'Bulk rights update completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get rights expiration alerts
     * GET /api/publishing/rights/expiration-alerts
     */
    static async getExpirationAlerts(req, res, next) {
        try {
            const {
                days_ahead = 30,
                include_renewals = true,
                priority = 'all',
                publication_id = null
            } = req.query;

            const userId = req.user.id;

            const options = {
                days_ahead: parseInt(days_ahead),
                include_renewals: include_renewals === 'true',
                priority,
                publication_id,
                user_id: userId
            };

            const alerts = await RightsManagementService.getRightsExpirationAlerts(
                options
            );

            res.json({
                success: true,
                data: {
                    expiration_alerts: alerts.alerts,
                    summary: alerts.summary,
                    recommendations: alerts.recommendations
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RightsManagementController;
