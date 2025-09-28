/**
 * Rights Management Routes
 * DRM system, territorial rights, and licensing management API
 */

const express = require('express');
const router = express.Router();
const RightsManagementController = require('../controllers/rights.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// Public endpoints (for checking territorial access)

// Check territorial access rights
router.get('/publications/:publicationId/territorial/:countryCode', RightsManagementController.checkTerritorialAccess);

// Protected endpoints (require authentication)
router.use(auth);

// Publication rights configuration
router.post('/publications/:publicationId/configure', RightsManagementController.createRightsConfiguration);
router.get('/publications/:publicationId/configuration', RightsManagementController.getRightsConfiguration);
router.put('/rights/:rightsId/configuration', RightsManagementController.updateRightsConfiguration);

// DRM protection
router.post('/publications/:publicationId/drm/apply', RightsManagementController.applyDRMProtection);

// Licensing agreements
router.post('/rights/:rightsId/licensing/agreement', RightsManagementController.generateLicensingAgreement);

// Rights violations
router.get('/violations', RightsManagementController.getRightsViolations);
router.post('/publications/:publicationId/violations/report', RightsManagementController.reportViolation);

// Analytics and reporting
router.get('/analytics/drm', RightsManagementController.getDRMAnalytics);
router.get('/analytics/licensing-revenue', RightsManagementController.getLicensingRevenue);

// Compliance validation
router.post('/publications/:publicationId/validate-compliance', RightsManagementController.validateCompliance);

// Admin endpoints
router.use('/admin', authRole(['admin', 'rights', 'legal']));

// Admin can manage all rights configurations (would need additional implementation)

module.exports = router;
