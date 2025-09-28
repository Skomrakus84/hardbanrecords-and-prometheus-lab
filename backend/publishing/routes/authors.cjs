/**
 * Authors Routes - Author Management API Endpoints
 * Provides RESTful routes for author management, profiles, and collaboration
 * Implements comprehensive author lifecycle operations
 */

const express = require('express');
const router = express.Router();

// Import controllers
const AuthorController = require('../controllers/author.controller.cjs');

// Import middleware
const { validateRequest } = require('../../middleware/validate.cjs');
const { requireAuth } = require('../../middleware/auth.cjs');
const { requireRole } = require('../../middleware/authRole.cjs');

// ========== Author CRUD Operations ==========

/**
 * @route   GET /api/publishing/authors
 * @desc    List authors with filtering and pagination
 * @access  Private
 */
router.get('/', 
    requireAuth,
    AuthorController.listAuthors
);

/**
 * @route   POST /api/publishing/authors
 * @desc    Create new author profile
 * @access  Private
 */
router.post('/', 
    requireAuth,
    validateRequest('createAuthor'),
    AuthorController.createAuthor
);

/**
 * @route   GET /api/publishing/authors/:id
 * @desc    Get author details
 * @access  Private
 */
router.get('/:id', 
    requireAuth,
    AuthorController.getAuthor
);

/**
 * @route   PUT /api/publishing/authors/:id
 * @desc    Update author profile
 * @access  Private (Author or Admin)
 */
router.put('/:id', 
    requireAuth,
    validateRequest('updateAuthor'),
    AuthorController.updateAuthor
);

/**
 * @route   DELETE /api/publishing/authors/:id
 * @desc    Delete author profile
 * @access  Private (Admin only)
 */
router.delete('/:id', 
    requireAuth,
    requireRole(['admin']),
    AuthorController.deleteAuthor
);

// ========== Author Publications ==========

/**
 * @route   GET /api/publishing/authors/:id/publications
 * @desc    Get author's publications
 * @access  Private
 */
router.get('/:id/publications', 
    requireAuth,
    AuthorController.getAuthorPublications
);

/**
 * @route   GET /api/publishing/authors/:id/analytics
 * @desc    Get author analytics and performance
 * @access  Private (Author or Admin)
 */
router.get('/:id/analytics', 
    requireAuth,
    AuthorController.getAuthorAnalytics
);

// ========== Author Collaboration ==========

/**
 * @route   GET /api/publishing/authors/:id/collaborations
 * @desc    Get author's collaboration projects
 * @access  Private
 */
router.get('/:id/collaborations', 
    requireAuth,
    AuthorController.getAuthorCollaborations
);

/**
 * @route   POST /api/publishing/authors/:id/invite
 * @desc    Invite author to collaboration
 * @access  Private
 */
router.post('/:id/invite', 
    requireAuth,
    validateRequest('inviteAuthor'),
    AuthorController.inviteToCollaboration
);

module.exports = router;
