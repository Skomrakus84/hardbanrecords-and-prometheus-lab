/**
 * Rights Management Controller
 * DRM system, territorial rights, and licensing management API
 */

const RightsManagementService = require('../services/rights.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../../config/logger.cjs');

class RightsManagementController {
    /**
     * Create rights configuration for publication
     */
    static async createRightsConfiguration(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;
            const rightsData = req.body;

            const rights = await RightsManagementService.createRightsConfiguration(
                publicationId,
                rightsData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Rights configuration created successfully',
                data: rights
            });

        } catch (error) {
            logger.error('Error creating rights configuration:', error);
            throw error;
        }
    }

    /**
     * Get rights configuration for publication
     */
    static async getRightsConfiguration(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;

            const rights = await RightsManagementService.getRightsConfiguration(
                publicationId,
                userId
            );

            if (!rights) {
                return res.status(404).json({
                    success: false,
                    message: 'No rights configuration found for this publication'
                });
            }

            res.json({
                success: true,
                data: rights
            });

        } catch (error) {
            logger.error('Error getting rights configuration:', error);
            throw error;
        }
    }

    /**
     * Update rights configuration
     */
    static async updateRightsConfiguration(req, res) {
        try {
            const userId = req.user.id;
            const { rightsId } = req.params;
            const updateData = req.body;

            const rights = await RightsManagementService.updateRightsConfiguration(
                rightsId,
                updateData,
                userId
            );

            res.json({
                success: true,
                message: 'Rights configuration updated successfully',
                data: rights
            });

        } catch (error) {
            logger.error('Error updating rights configuration:', error);
            throw error;
        }
    }

    /**
     * Check territorial access rights
     */
    static async checkTerritorialAccess(req, res) {
        try {
            const { publicationId, countryCode } = req.params;
            const { requestType = 'read' } = req.query;

            const accessResult = await RightsManagementService.checkTerritorialAccess(
                publicationId,
                countryCode,
                requestType
            );

            res.json({
                success: true,
                data: accessResult
            });

        } catch (error) {
            logger.error('Error checking territorial access:', error);
            throw error;
        }
    }

    /**
     * Apply DRM protection to publication file
     */
    static async applyDRMProtection(req, res) {
        try {
            const { publicationId } = req.params;
            const { fileUrl, protectionLevel = 'standard' } = req.body;

            if (!fileUrl) {
                throw new AppError('File URL is required', 400);
            }

            const drmResult = await RightsManagementService.applyDRMProtection(
                publicationId,
                fileUrl,
                protectionLevel
            );

            res.json({
                success: true,
                message: drmResult.protected ? 'DRM protection applied' : 'DRM not enabled',
                data: drmResult
            });

        } catch (error) {
            logger.error('Error applying DRM protection:', error);
            throw error;
        }
    }

    /**
     * Generate licensing agreement
     */
    static async generateLicensingAgreement(req, res) {
        try {
            const userId = req.user.id;
            const { rightsId } = req.params;
            const agreementData = req.body;

            const agreement = await RightsManagementService.generateLicensingAgreement(
                rightsId,
                agreementData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Licensing agreement created successfully',
                data: agreement
            });

        } catch (error) {
            logger.error('Error generating licensing agreement:', error);
            throw error;
        }
    }

    /**
     * Get rights violations and reports
     */
    static async getRightsViolations(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d', status = 'all' } = req.query;

            const violations = await RightsManagementService.getRightsViolations(userId, {
                period,
                status
            });

            res.json({
                success: true,
                data: violations
            });

        } catch (error) {
            logger.error('Error getting rights violations:', error);
            throw error;
        }
    }

    /**
     * Report rights violation
     */
    static async reportViolation(req, res) {
        try {
            const { publicationId } = req.params;
            const {
                violationType,
                description,
                reportedUrl,
                reporterInfo
            } = req.body;

            if (!violationType || !description) {
                throw new AppError('Violation type and description are required', 400);
            }

            // This would be implemented in the service
            const violation = {
                id: Date.now(),
                publicationId,
                violationType,
                description,
                reportedUrl,
                reporterInfo,
                status: 'reported',
                reportedAt: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Rights violation reported successfully',
                data: violation
            });

        } catch (error) {
            logger.error('Error reporting violation:', error);
            throw error;
        }
    }

    /**
     * Get DRM analytics
     */
    static async getDRMAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            // This would be implemented in the service
            const analytics = {
                period,
                totalProtectedFiles: 0,
                drmAccessAttempts: 0,
                unauthorizedAccessBlocked: 0,
                territorialBlocks: 0,
                mostAccessedRegions: [],
                protectionBreaches: []
            };

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting DRM analytics:', error);
            throw error;
        }
    }

    /**
     * Get licensing revenue
     */
    static async getLicensingRevenue(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            // This would be implemented in the service
            const revenue = {
                period,
                totalRevenue: 0,
                activeAgreements: 0,
                pendingAgreements: 0,
                revenueByType: {},
                revenueByTerritory: {}
            };

            res.json({
                success: true,
                data: revenue
            });

        } catch (error) {
            logger.error('Error getting licensing revenue:', error);
            throw error;
        }
    }

    /**
     * Validate rights compliance
     */
    static async validateCompliance(req, res) {
        try {
            const { publicationId } = req.params;
            const { targetMarkets = [] } = req.body;

            // This would be implemented in the service
            const compliance = {
                publicationId,
                overallCompliance: true,
                issues: [],
                warnings: [],
                recommendations: [],
                marketCompliance: targetMarkets.map(market => ({
                    market,
                    compliant: true,
                    issues: []
                }))
            };

            res.json({
                success: true,
                data: compliance
            });

        } catch (error) {
            logger.error('Error validating compliance:', error);
            throw error;
        }
    }
}

module.exports = RightsManagementController;
