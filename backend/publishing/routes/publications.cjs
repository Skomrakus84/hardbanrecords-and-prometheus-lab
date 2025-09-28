/**
 * Publications Routes - Publication Management API Endpoints
 * Provides comprehensive RESTful routes for publication lifecycle management
 * Implements advanced workflow, collaboration, and distribution features
 */

const express = require('express');
const router = express.Router();

// Import controllers
const PublicationController = require('../controllers/publication.controller.cjs');
const ChapterController = require('../controllers/chapter.controller.cjs');
const CollaborationController = require('../controllers/collaboration.controller.cjs');
const RightsManagementController = require('../controllers/rightsManagement.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');

// ========== Publication CRUD Operations ==========

/**
 * @route   GET /api/publishing/publications
 * @desc    List publications with advanced filtering and pagination
 * @access  Private
 */
router.get('/', 
    requireAuth,
    PublicationController.listPublications
);

/**
 * @route   POST /api/publishing/publications
 * @desc    Create new publication with comprehensive setup
 * @access  Private
 */
router.post('/', 
    requireAuth,
    validateRequest('createPublication'),
    PublicationController.createPublication
);

/**
 * @route   GET /api/publishing/publications/:id
 * @desc    Get publication with complete details and analytics
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    PublicationController.getPublication
);

/**
 * @route   PUT /api/publishing/publications/:id
 * @desc    Update publication with workflow management
 * @access  Private
 */
router.put('/:id', 
    requireAuth,
    validateRequest('updatePublication'),
    PublicationController.updatePublication
);

/**
 * @route   DELETE /api/publishing/publications/:id
 * @desc    Delete publication with comprehensive cleanup
 * @access  Private (Author or Admin)
 */
router.delete('/:id', 
    requireAuth,
    PublicationController.deletePublication
);

// ========== Publication Workflow Management ==========

/**
 * @route   POST /api/publishing/publications/:id/submit-review
 * @desc    Submit publication for review
 * @access  Private
 */
router.post('/:id/submit-review', 
    requireAuth,
    validateRequest('submitReview'),
    PublicationController.submitForReview
);

/**
 * @route   POST /api/publishing/publications/:id/publish
 * @desc    Publish publication to selected channels
 * @access  Private
 */
router.post('/:id/publish', 
    requireAuth,
    validateRequest('publishPublication'),
    PublicationController.publishPublication
);

/**
 * @route   POST /api/publishing/publications/:id/workflow
 * @desc    Manage publication workflow
 * @access  Private
 */
router.post('/:id/workflow', 
    requireAuth,
    validateRequest('manageWorkflow'),
    PublicationController.manageWorkflow
);

// ========== Publication Analytics ==========

/**
 * @route   GET /api/publishing/publications/:id/analytics
 * @desc    Get publication analytics and performance metrics
 * @access  Private
 */
router.get('/:id/analytics', 
    requireAuth,
    PublicationController.getPublicationAnalytics
);

/**
 * @route   GET /api/publishing/publications/:id/sales
 * @desc    Get publication sales data and reports
 * @access  Private
 */
router.get('/:id/sales', 
    requireAuth,
    PublicationController.getPublicationSales
);

// ========== Chapter Management ==========

/**
 * @route   GET /api/publishing/publications/:id/chapters
 * @desc    Get publication chapters with management options
 * @access  Private
 */
router.get('/:id/chapters', 
    requireAuth,
    ChapterController.getPublicationChapters
);

/**
 * @route   POST /api/publishing/publications/:id/chapters
 * @desc    Create new chapter for publication
 * @access  Private
 */
router.post('/:id/chapters', 
    requireAuth,
    validateRequest('createChapter'),
    ChapterController.createChapter
);

/**
 * @route   PUT /api/publishing/publications/:id/chapters/:chapterId
 * @desc    Update chapter content and metadata
 * @access  Private
 */
router.put('/:id/chapters/:chapterId', 
    requireAuth,
    validateRequest('updateChapter'),
    ChapterController.updateChapter
);

/**
 * @route   DELETE /api/publishing/publications/:id/chapters/:chapterId
 * @desc    Delete chapter from publication
 * @access  Private
 */
router.delete('/:id/chapters/:chapterId', 
    requireAuth,
    ChapterController.deleteChapter
);

/**
 * @route   POST /api/publishing/publications/:id/chapters/reorder
 * @desc    Reorder chapters in publication
 * @access  Private
 */
router.post('/:id/chapters/reorder', 
    requireAuth,
    validateRequest('reorderChapters'),
    ChapterController.reorderChapters
);

// ========== Collaboration Management ==========

/**
 * @route   GET /api/publishing/publications/:id/collaborations
 * @desc    Get publication collaboration settings and participants
 * @access  Private
 */
router.get('/:id/collaborations', 
    requireAuth,
    CollaborationController.getPublicationCollaborations
);

/**
 * @route   POST /api/publishing/publications/:id/collaborations
 * @desc    Setup collaboration workspace for publication
 * @access  Private
 */
router.post('/:id/collaborations', 
    requireAuth,
    validateRequest('setupCollaboration'),
    CollaborationController.setupCollaboration
);

/**
 * @route   POST /api/publishing/publications/:id/collaborations/invite
 * @desc    Invite collaborators to publication
 * @access  Private
 */
router.post('/:id/collaborations/invite', 
    requireAuth,
    validateRequest('inviteCollaborator'),
    CollaborationController.inviteCollaborator
);

/**
 * @route   PUT /api/publishing/publications/:id/collaborations/:collaboratorId
 * @desc    Update collaborator permissions
 * @access  Private
 */
router.put('/:id/collaborations/:collaboratorId', 
    requireAuth,
    validateRequest('updateCollaboratorPermissions'),
    CollaborationController.updateCollaboratorPermissions
);

// ========== Rights Management ==========

/**
 * @route   GET /api/publishing/publications/:id/rights
 * @desc    Get publication rights and licensing information
 * @access  Private
 */
router.get('/:id/rights', 
    requireAuth,
    RightsManagementController.getPublicationRights
);

/**
 * @route   POST /api/publishing/publications/:id/rights
 * @desc    Configure publication rights and licensing
 * @access  Private
 */
router.post('/:id/rights', 
    requireAuth,
    validateRequest('configureRights'),
    RightsManagementController.configureRights
);

/**
 * @route   PUT /api/publishing/publications/:id/rights/:rightsId
 * @desc    Update specific rights configuration
 * @access  Private
 */
router.put('/:id/rights/:rightsId', 
    requireAuth,
    validateRequest('updateRights'),
    RightsManagementController.updateRights
);

// ========== Version Control ==========

/**
 * @route   GET /api/publishing/publications/:id/versions
 * @desc    Get publication version history
 * @access  Private
 */
router.get('/:id/versions', 
    requireAuth,
    PublicationController.getVersionHistory
);

/**
 * @route   POST /api/publishing/publications/:id/versions
 * @desc    Create new publication version
 * @access  Private
 */
router.post('/:id/versions', 
    requireAuth,
    validateRequest('createVersion'),
    PublicationController.createVersion
);

/**
 * @route   POST /api/publishing/publications/:id/versions/:versionId/restore
 * @desc    Restore publication to specific version
 * @access  Private
 */
router.post('/:id/versions/:versionId/restore', 
    requireAuth,
    PublicationController.restoreVersion
);

module.exports = router;
