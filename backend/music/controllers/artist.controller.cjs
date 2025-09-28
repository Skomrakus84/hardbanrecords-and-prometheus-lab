/**
 * Artist Controller - Complete Artist Management API
 * Handles artist profiles, collaborations, and statistics
 */

const ArtistService = require('../services/artist.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../config/logger.cjs');

class ArtistController {
    /**
     * Create new artist
     */
    static async createArtist(req, res) {
        try {
            const userId = req.user.id;
            const artistData = {
                ...req.body,
                userId
            };

            const artist = await ArtistService.createArtist(artistData);

            res.status(201).json({
                success: true,
                message: 'Artist created successfully',
                data: artist
            });

        } catch (error) {
            logger.error('Error creating artist:', error);
            throw error;
        }
    }

    /**
     * Get artists with filtering and pagination
     */
    static async getArtists(req, res) {
        try {
            const {
                genre,
                country,
                status,
                search,
                sortBy,
                sortOrder,
                page = 1,
                limit = 20,
                myArtists
            } = req.query;

            const options = {
                genre,
                country,
                status,
                search,
                sortBy,
                sortOrder,
                pagination: {
                    page: parseInt(page),
                    limit: Math.min(parseInt(limit), 100)
                }
            };

            // If user wants only their artists
            if (myArtists === 'true') {
                options.userId = req.user.id;
            }

            const result = await ArtistService.getArtists(options);

            res.json({
                success: true,
                data: result.artists,
                pagination: result.pagination
            });

        } catch (error) {
            logger.error('Error getting artists:', error);
            throw error;
        }
    }

    /**
     * Get artist by ID
     */
    static async getArtistById(req, res) {
        try {
            const { artistId } = req.params;
            const { includeStats = 'true' } = req.query;

            const artist = await ArtistService.getArtistById(
                artistId,
                includeStats === 'true'
            );

            if (!artist) {
                throw new AppError('Artist not found', 404);
            }

            res.json({
                success: true,
                data: artist
            });

        } catch (error) {
            logger.error('Error getting artist by ID:', error);
            throw error;
        }
    }

    /**
     * Update artist
     */
    static async updateArtist(req, res) {
        try {
            const userId = req.user.id;
            const { artistId } = req.params;
            const updateData = req.body;

            const artist = await ArtistService.updateArtist(artistId, userId, updateData);

            res.json({
                success: true,
                message: 'Artist updated successfully',
                data: artist
            });

        } catch (error) {
            logger.error('Error updating artist:', error);
            throw error;
        }
    }

    /**
     * Delete artist
     */
    static async deleteArtist(req, res) {
        try {
            const userId = req.user.id;
            const { artistId } = req.params;

            await ArtistService.deleteArtist(artistId, userId);

            res.json({
                success: true,
                message: 'Artist deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting artist:', error);
            throw error;
        }
    }

    /**
     * Add collaborator to artist
     */
    static async addCollaborator(req, res) {
        try {
            const userId = req.user.id;
            const { artistId } = req.params;
            const collaboratorData = req.body;

            const collaboration = await ArtistService.addCollaborator(
                artistId,
                collaboratorData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Collaborator added successfully',
                data: collaboration
            });

        } catch (error) {
            logger.error('Error adding collaborator:', error);
            throw error;
        }
    }

    /**
     * Update artist statistics
     */
    static async updateStats(req, res) {
        try {
            const { artistId } = req.params;
            const statsData = req.body;

            await ArtistService.updateArtistStats(artistId, statsData);

            res.json({
                success: true,
                message: 'Artist statistics updated successfully'
            });

        } catch (error) {
            logger.error('Error updating artist stats:', error);
            throw error;
        }
    }

    /**
     * Get artist analytics
     */
    static async getAnalytics(req, res) {
        try {
            const { artistId } = req.params;
            const { period = '30d' } = req.query;

            const analytics = await ArtistService.getArtistAnalytics(artistId, period);

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting artist analytics:', error);
            throw error;
        }
    }

    /**
     * Search artists
     */
    static async searchArtists(req, res) {
        try {
            const { query, limit = 10 } = req.query;

            if (!query || query.length < 2) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const result = await ArtistService.getArtists({
                search: query,
                pagination: {
                    page: 1,
                    limit: Math.min(parseInt(limit), 50)
                }
            });

            res.json({
                success: true,
                data: result.artists
            });

        } catch (error) {
            logger.error('Error searching artists:', error);
            throw error;
        }
    }

    /**
     * Get popular artists
     */
    static async getPopularArtists(req, res) {
        try {
            const { limit = 20 } = req.query;

            const result = await ArtistService.getArtists({
                sortBy: 'monthly_listeners',
                sortOrder: 'desc',
                status: 'active',
                pagination: {
                    page: 1,
                    limit: Math.min(parseInt(limit), 100)
                }
            });

            res.json({
                success: true,
                data: result.artists
            });

        } catch (error) {
            logger.error('Error getting popular artists:', error);
            throw error;
        }
    }

    /**
     * Get artist genres
     */
    static async getGenres(req, res) {
        try {
            // This could be enhanced to get genres from database
            const genres = [
                'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Country', 'Jazz',
                'Classical', 'Electronic', 'Folk', 'Reggae', 'Blues',
                'Funk', 'Disco', 'House', 'Techno', 'Dubstep',
                'Ambient', 'Indie', 'Alternative', 'Punk', 'Metal',
                'Gospel', 'Soul', 'World', 'Latin', 'Ska'
            ];

            res.json({
                success: true,
                data: genres.sort()
            });

        } catch (error) {
            logger.error('Error getting genres:', error);
            throw error;
        }
    }
}

module.exports = ArtistController;
