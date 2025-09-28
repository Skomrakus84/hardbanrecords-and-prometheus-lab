/**
 * DRM Protection Controller - Advanced Digital Rights Management REST API
 * Exposes comprehensive DRM features through REST endpoints
 * Provides sophisticated content protection, access control, and security management
 * Integrates with DRM Protection Service and security frameworks
 */

const DRMProtectionService = require('../services/drmProtection.service.cjs');
const PublicationService = require('../services/publication.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const { validateRequest } = require('../../middleware/validate.cjs');

class DRMProtectionController {
    /**
     * Apply DRM protection to publication
     * POST /api/publishing/drm/protect
     */
    static async applyProtection(req, res, next) {
        try {
            const {
                publication_id,
                protection_level = 'standard',
                encryption_method = 'aes256',
                access_control = {},
                watermarking = {},
                usage_policies = {},
                expiration_settings = {}
            } = req.body;

            const userId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Verify user has DRM permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const protectionData = {
                publication_id,
                protection_level,
                encryption_method,
                access_control: {
                    require_authentication: access_control.require_authentication || true,
                    allowed_devices: access_control.allowed_devices || 5,
                    concurrent_sessions: access_control.concurrent_sessions || 3,
                    geographical_restrictions: access_control.geographical_restrictions || [],
                    time_based_access: access_control.time_based_access || null
                },
                watermarking: {
                    enabled: watermarking.enabled || false,
                    type: watermarking.type || 'visible',
                    content: watermarking.content || userId,
                    position: watermarking.position || 'bottom-right',
                    opacity: watermarking.opacity || 0.3
                },
                usage_policies: {
                    printing_allowed: usage_policies.printing_allowed || false,
                    copying_allowed: usage_policies.copying_allowed || false,
                    screenshot_allowed: usage_policies.screenshot_allowed || false,
                    offline_access: usage_policies.offline_access || true,
                    sharing_allowed: usage_policies.sharing_allowed || false
                },
                expiration_settings: {
                    expires_at: expiration_settings.expires_at || null,
                    max_access_count: expiration_settings.max_access_count || null,
                    auto_revoke: expiration_settings.auto_revoke || false
                },
                protected_by: userId
            };

            const result = await DRMProtectionService.applyDRMProtection(
                protectionData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'DRM protection applied successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate secure access token
     * POST /api/publishing/drm/access-token
     */
    static async generateAccessToken(req, res, next) {
        try {
            const {
                publication_id,
                user_id = null,
                access_level = 'read',
                valid_for_hours = 24,
                device_binding = false,
                ip_restrictions = [],
                custom_permissions = {}
            } = req.body;

            const requesterId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Verify requester has token generation permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, requesterId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const tokenData = {
                publication_id,
                user_id: user_id || requesterId,
                access_level,
                valid_for_hours,
                device_binding,
                ip_restrictions,
                custom_permissions,
                issued_by: requesterId
            };

            const accessToken = await DRMProtectionService.generateSecureAccessToken(
                tokenData,
                requesterId
            );

            res.json({
                success: true,
                message: 'Access token generated successfully',
                data: {
                    access_token: accessToken.token,
                    expires_at: accessToken.expires_at,
                    permissions: accessToken.permissions,
                    restrictions: accessToken.restrictions
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate access token and permissions
     * POST /api/publishing/drm/validate-token
     */
    static async validateToken(req, res, next) {
        try {
            const {
                access_token,
                publication_id,
                requested_action = 'read',
                device_info = {},
                client_ip = null
            } = req.body;

            if (!access_token || !publication_id) {
                throw new AppError('Access token and publication ID are required', 400);
            }

            const validationData = {
                access_token,
                publication_id,
                requested_action,
                device_info: {
                    device_id: device_info.device_id || null,
                    device_type: device_info.device_type || 'unknown',
                    user_agent: device_info.user_agent || req.get('User-Agent'),
                    screen_resolution: device_info.screen_resolution || null
                },
                client_ip: client_ip || req.ip
            };

            const validation = await DRMProtectionService.validateAccessToken(
                validationData
            );

            res.json({
                success: true,
                data: {
                    valid: validation.valid,
                    permissions: validation.permissions,
                    restrictions: validation.restrictions,
                    expires_at: validation.expires_at,
                    session_id: validation.session_id
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get DRM protection status
     * GET /api/publishing/drm/status/:publicationId
     */
    static async getProtectionStatus(req, res, next) {
        try {
            const { publicationId } = req.params;
            const {
                include_analytics = false,
                include_violations = false,
                include_sessions = false
            } = req.query;

            const userId = req.user.id;

            // Verify access to publication
            const hasAccess = await PublicationService.verifyUserAccess(publicationId, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const options = {
                include_analytics: include_analytics === 'true',
                include_violations: include_violations === 'true',
                include_sessions: include_sessions === 'true'
            };

            const status = await DRMProtectionService.getProtectionStatus(
                publicationId,
                options
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
     * Update DRM configuration
     * PUT /api/publishing/drm/config/:protectionId
     */
    static async updateConfiguration(req, res, next) {
        try {
            const { protectionId } = req.params;
            const updateData = req.body;
            const userId = req.user.id;

            const {
                apply_immediately = false,
                notify_users = false,
                reason = ''
            } = req.query;

            const updateOptions = {
                apply_immediately: apply_immediately === 'true',
                notify_users: notify_users === 'true',
                reason,
                updated_by: userId
            };

            const result = await DRMProtectionService.updateDRMConfiguration(
                protectionId,
                updateData,
                updateOptions
            );

            res.json({
                success: true,
                message: 'DRM configuration updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Revoke DRM protection
     * DELETE /api/publishing/drm/protection/:protectionId
     */
    static async revokeProtection(req, res, next) {
        try {
            const { protectionId } = req.params;
            const {
                revocation_reason = '',
                immediate = false,
                cleanup_tokens = true,
                notify_users = true
            } = req.body;

            const userId = req.user.id;

            const revocationData = {
                revocation_reason,
                immediate,
                cleanup_tokens,
                notify_users,
                revoked_by: userId
            };

            const result = await DRMProtectionService.revokeDRMProtection(
                protectionId,
                revocationData
            );

            res.json({
                success: true,
                message: 'DRM protection revoked successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Track content usage and violations
     * POST /api/publishing/drm/track-usage
     */
    static async trackUsage(req, res, next) {
        try {
            const {
                access_token,
                publication_id,
                action_type = 'view',
                session_data = {},
                device_fingerprint = null,
                geolocation = null
            } = req.body;

            if (!access_token || !publication_id) {
                throw new AppError('Access token and publication ID are required', 400);
            }

            const usageData = {
                access_token,
                publication_id,
                action_type,
                session_data: {
                    duration: session_data.duration || 0,
                    pages_viewed: session_data.pages_viewed || [],
                    interactions: session_data.interactions || [],
                    quality_settings: session_data.quality_settings || 'standard'
                },
                device_fingerprint,
                geolocation,
                timestamp: new Date(),
                client_ip: req.ip,
                user_agent: req.get('User-Agent')
            };

            const result = await DRMProtectionService.trackContentUsage(
                usageData
            );

            res.json({
                success: true,
                message: 'Usage tracked successfully',
                data: {
                    tracking_id: result.tracking_id,
                    compliance_status: result.compliance_status,
                    warnings: result.warnings
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get DRM violations and security events
     * GET /api/publishing/drm/violations
     */
    static async getViolations(req, res, next) {
        try {
            const {
                publication_id = null,
                severity = 'all',
                status = 'all',
                date_from = null,
                date_to = null,
                page = 1,
                limit = 20
            } = req.query;

            const userId = req.user.id;

            const options = {
                publication_id,
                severity,
                status,
                date_from: date_from ? new Date(date_from) : null,
                date_to: date_to ? new Date(date_to) : null,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                user_id: userId
            };

            const violations = await DRMProtectionService.getDRMViolations(options);

            res.json({
                success: true,
                data: {
                    violations: violations.violations,
                    pagination: violations.pagination,
                    summary: violations.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Generate DRM analytics report
     * GET /api/publishing/drm/analytics
     */
    static async getAnalytics(req, res, next) {
        try {
            const {
                publication_id = null,
                time_range = '30_days',
                metrics = 'all',
                include_trends = false,
                format = 'json'
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
                metrics: metrics === 'all' ? 
                    ['access_patterns', 'violations', 'device_usage', 'geographic_distribution'] : 
                    metrics.split(','),
                include_trends: include_trends === 'true',
                format,
                user_id: userId
            };

            const analytics = await DRMProtectionService.generateDRMAnalytics(
                analyticsOptions
            );

            if (format === 'pdf' || format === 'excel') {
                res.setHeader('Content-Type', analytics.mime_type);
                res.setHeader('Content-Disposition', `attachment; filename="${analytics.filename}"`);
                res.send(analytics.content);
            } else {
                res.json({
                    success: true,
                    data: analytics
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Manage DRM keys and certificates
     * POST /api/publishing/drm/keys/rotate
     */
    static async rotateKeys(req, res, next) {
        try {
            const {
                protection_id = null,
                rotation_scope = 'single',
                force_rotation = false,
                notify_affected = true
            } = req.body;

            const userId = req.user.id;

            const rotationData = {
                protection_id,
                rotation_scope,
                force_rotation,
                notify_affected,
                initiated_by: userId
            };

            const result = await DRMProtectionService.rotateDRMKeys(
                rotationData
            );

            res.json({
                success: true,
                message: 'DRM keys rotation completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Configure watermarking
     * POST /api/publishing/drm/:protectionId/watermark
     */
    static async configureWatermark(req, res, next) {
        try {
            const { protectionId } = req.params;
            const {
                watermark_type = 'text',
                watermark_content = '',
                positioning = {},
                styling = {},
                dynamic_content = false
            } = req.body;

            const userId = req.user.id;

            const watermarkConfig = {
                type: watermark_type,
                content: watermark_content,
                positioning: {
                    position: positioning.position || 'bottom-right',
                    offset_x: positioning.offset_x || 10,
                    offset_y: positioning.offset_y || 10,
                    rotation: positioning.rotation || 0
                },
                styling: {
                    opacity: styling.opacity || 0.3,
                    color: styling.color || '#000000',
                    font_family: styling.font_family || 'Arial',
                    font_size: styling.font_size || 12
                },
                dynamic_content,
                configured_by: userId
            };

            const result = await DRMProtectionService.configureWatermarking(
                protectionId,
                watermarkConfig
            );

            res.json({
                success: true,
                message: 'Watermarking configured successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Secure content delivery
     * POST /api/publishing/drm/secure-delivery
     */
    static async secureDelivery(req, res, next) {
        try {
            const {
                access_token,
                publication_id,
                delivery_format = 'stream',
                quality_level = 'standard',
                chunk_size = null
            } = req.body;

            if (!access_token || !publication_id) {
                throw new AppError('Access token and publication ID are required', 400);
            }

            const deliveryOptions = {
                access_token,
                publication_id,
                delivery_format,
                quality_level,
                chunk_size,
                client_ip: req.ip,
                user_agent: req.get('User-Agent')
            };

            const delivery = await DRMProtectionService.secureContentDelivery(
                deliveryOptions
            );

            if (delivery.redirect_url) {
                res.redirect(delivery.redirect_url);
            } else {
                res.setHeader('Content-Type', delivery.content_type);
                res.setHeader('Content-Length', delivery.content_length);
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.send(delivery.content);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Audit DRM compliance
     * POST /api/publishing/drm/audit
     */
    static async auditCompliance(req, res, next) {
        try {
            const {
                scope = 'user_publications',
                publication_ids = [],
                compliance_standards = ['standard'],
                include_recommendations = true,
                detailed_analysis = false
            } = req.body;

            const userId = req.user.id;

            const auditData = {
                scope,
                publication_ids,
                compliance_standards,
                include_recommendations,
                detailed_analysis,
                auditor_id: userId
            };

            const audit = await DRMProtectionService.auditDRMCompliance(
                auditData,
                userId
            );

            res.json({
                success: true,
                message: 'DRM compliance audit completed',
                data: audit
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Emergency revoke all access
     * POST /api/publishing/drm/emergency-revoke
     */
    static async emergencyRevoke(req, res, next) {
        try {
            const {
                publication_id,
                revocation_reason = 'Emergency security measure',
                notify_users = true,
                blacklist_tokens = true
            } = req.body;

            const userId = req.user.id;

            if (!publication_id) {
                throw new AppError('Publication ID is required', 400);
            }

            // Verify user has emergency revoke permissions
            const hasAccess = await PublicationService.verifyUserAccess(publication_id, userId);
            if (!hasAccess) {
                throw new AppError('Access denied to publication', 403);
            }

            const emergencyData = {
                publication_id,
                revocation_reason,
                notify_users,
                blacklist_tokens,
                initiated_by: userId,
                timestamp: new Date()
            };

            const result = await DRMProtectionService.emergencyRevokeAccess(
                emergencyData
            );

            res.json({
                success: true,
                message: 'Emergency revocation completed',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active sessions
     * GET /api/publishing/drm/sessions
     */
    static async getActiveSessions(req, res, next) {
        try {
            const {
                publication_id = null,
                user_id = null,
                include_device_info = false,
                include_location = false,
                page = 1,
                limit = 20
            } = req.query;

            const requesterId = req.user.id;

            const options = {
                publication_id,
                user_id,
                include_device_info: include_device_info === 'true',
                include_location: include_location === 'true',
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                requester_id: requesterId
            };

            const sessions = await DRMProtectionService.getActiveSessions(options);

            res.json({
                success: true,
                data: {
                    sessions: sessions.sessions,
                    pagination: sessions.pagination,
                    summary: sessions.summary
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Terminate specific session
     * DELETE /api/publishing/drm/sessions/:sessionId
     */
    static async terminateSession(req, res, next) {
        try {
            const { sessionId } = req.params;
            const {
                reason = 'Session terminated by administrator',
                notify_user = true,
                blacklist_device = false
            } = req.body;

            const userId = req.user.id;

            const terminationData = {
                session_id: sessionId,
                reason,
                notify_user,
                blacklist_device,
                terminated_by: userId
            };

            const result = await DRMProtectionService.terminateSession(
                terminationData
            );

            res.json({
                success: true,
                message: 'Session terminated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DRMProtectionController;
