/**
 * Artist Routes - Complete Artist Management API
 */

const express = require('express');
const router = express.Router();
const ArtistController = require('../controllers/artist.controller.cjs');
const { auth } = require('../../middleware/auth.cjs');
const { authRole } = require('../../middleware/authRole.cjs');

// Validation middleware for artist creation
const validateArtistCreate = (req, res, next) => {
    const { name, stageName } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Artist name is required (minimum 2 characters)'
        });
    }

    if (stageName && stageName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Stage name must be at least 2 characters if provided'
        });
    }

    next();
};

// Public endpoints (no authentication required)

// Get popular artists
router.get('/popular', ArtistController.getPopularArtists);

// Search artists
router.get('/search', ArtistController.searchArtists);

// Get available genres
router.get('/genres', ArtistController.getGenres);

// Get all artists (public view)
router.get('/', ArtistController.getArtists);

// Get specific artist (public view)
router.get('/:artistId', ArtistController.getArtistById);

// Get artist analytics (public view)
router.get('/:artistId/analytics', ArtistController.getAnalytics);

// Protected endpoints (require authentication)
router.use(auth);

// Create new artist
router.post('/', validateArtistCreate, ArtistController.createArtist);

// Update artist (owner only)
router.put('/:artistId', ArtistController.updateArtist);

// Delete artist (owner only)
router.delete('/:artistId', ArtistController.deleteArtist);

// Collaborator management (owner only)
router.post('/:artistId/collaborators', ArtistController.addCollaborator);

// Admin endpoints (require admin role)
router.use('/admin', authRole(['admin', 'moderator']));

// Update artist statistics (admin only)
router.patch('/admin/:artistId/stats', ArtistController.updateStats);

module.exports = router;
