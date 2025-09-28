/**
 * Release Controller for Music Distribution
 * API operacji na wydaniach
 */

const ReleaseService = require('../services/release.service.cjs');
const logger = require('../config/logger.cjs');

class ReleaseController {
  constructor() {
    this.releaseService = new ReleaseService();
  }

  /**
   * Create a new release
   * POST /api/music/releases
   */
  async createRelease(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const release = await this.releaseService.createRelease(req.body, userId);
      
      logger.musicDistribution.userAction('Release created via API', {
        releaseId: release.id,
        userId,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        data: release,
        message: 'Release created successfully'
      });
    } catch (error) {
      logger.error('Create release API error:', error);
      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get release by ID
   * GET /api/music/releases/:id
   */
  async getReleaseById(req, res) {
    try {
      const { id } = req.params;
      const includeAnalytics = req.query.includeAnalytics === 'true';
      
      const release = await this.releaseService.getReleaseById(id, includeAnalytics);
      
      res.status(200).json({
        success: true,
        data: release
      });
    } catch (error) {
      logger.error('Get release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get all releases with filtering
   * GET /api/music/releases
   */
  async getReleases(req, res) {
    try {
      const filters = {
        artistId: req.query.artistId,
        labelId: req.query.labelId,
        status: req.query.status ? req.query.status.split(',') : undefined,
        type: req.query.type ? req.query.type.split(',') : undefined,
        genre: req.query.genre,
        releaseDateFrom: req.query.releaseDateFrom,
        releaseDateTo: req.query.releaseDateTo,
        search: req.query.search,
        explicitContent: req.query.explicitContent === 'true' ? true : 
                        req.query.explicitContent === 'false' ? false : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const pagination = {
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const result = await this.releaseService.getReleases(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.releases,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Get releases API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Update release
   * PUT /api/music/releases/:id
   */
  async updateRelease(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const release = await this.releaseService.updateRelease(id, req.body, userId);
      
      logger.musicDistribution.userAction('Release updated via API', {
        releaseId: id,
        userId,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        data: release,
        message: 'Release updated successfully'
      });
    } catch (error) {
      logger.error('Update release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Delete release
   * DELETE /api/music/releases/:id
   */
  async deleteRelease(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const result = await this.releaseService.deleteRelease(id, userId);
      
      logger.musicDistribution.userAction('Release deleted via API', {
        releaseId: id,
        userId,
        ip: req.ip
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Delete release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Submit release for distribution
   * POST /api/music/releases/:id/submit
   */
  async submitForDistribution(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const result = await this.releaseService.submitForDistribution(id, userId);
      
      logger.musicDistribution.distribution('Release submitted for distribution via API', {
        releaseId: id,
        userId,
        ip: req.ip
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Submit release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Approve release (admin only)
   * POST /api/music/releases/:id/approve
   */
  async approveRelease(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      // Check if user has admin privileges
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('music_admin')) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          service: 'music-distribution'
        });
      }

      const result = await this.releaseService.approveRelease(id, userId);
      
      logger.musicDistribution.distribution('Release approved via API', {
        releaseId: id,
        approvedBy: userId,
        ip: req.ip
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Approve release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Reject release (admin only)
   * POST /api/music/releases/:id/reject
   */
  async rejectRelease(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      // Check if user has admin privileges
      if (!req.user?.roles?.includes('admin') && !req.user?.roles?.includes('music_admin')) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          service: 'music-distribution'
        });
      }

      if (!rejectionReason) {
        return res.status(400).json({
          error: 'Rejection reason is required',
          service: 'music-distribution'
        });
      }

      const result = await this.releaseService.rejectRelease(id, rejectionReason, userId);
      
      logger.musicDistribution.distribution('Release rejected via API', {
        releaseId: id,
        rejectedBy: userId,
        reason: rejectionReason,
        ip: req.ip
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Reject release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Take down release
   * POST /api/music/releases/:id/takedown
   */
  async takeDownRelease(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const result = await this.releaseService.takeDownRelease(id, userId);
      
      logger.musicDistribution.distribution('Release takedown initiated via API', {
        releaseId: id,
        initiatedBy: userId,
        ip: req.ip
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Takedown release API error:', error);
      
      if (error.message === 'Release not found') {
        return res.status(404).json({
          error: 'Release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get recent releases
   * GET /api/music/releases/recent
   */
  async getRecentReleases(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 30;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      
      const releases = await this.releaseService.getRecentReleases(days, limit);
      
      res.status(200).json({
        success: true,
        data: releases
      });
    } catch (error) {
      logger.error('Get recent releases API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get upcoming releases
   * GET /api/music/releases/upcoming
   */
  async getUpcomingReleases(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 30;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      
      const releases = await this.releaseService.getUpcomingReleases(days, limit);
      
      res.status(200).json({
        success: true,
        data: releases
      });
    } catch (error) {
      logger.error('Get upcoming releases API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Search releases
   * GET /api/music/releases/search
   */
  async searchReleases(req, res) {
    try {
      const { q: searchTerm } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      
      if (!searchTerm) {
        return res.status(400).json({
          error: 'Search term is required',
          service: 'music-distribution'
        });
      }
      
      const releases = await this.releaseService.searchReleases(searchTerm, limit);
      
      res.status(200).json({
        success: true,
        data: releases
      });
    } catch (error) {
      logger.error('Search releases API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get distribution status
   * GET /api/music/releases/:id/distribution-status
   */
  async getDistributionStatus(req, res) {
    try {
      const { id } = req.params;
      
      const status = await this.releaseService.getDistributionStatus(id);
      
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Get distribution status API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }

  /**
   * Clone release
   * POST /api/music/releases/:id/clone
   */
  async cloneRelease(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          service: 'music-distribution'
        });
      }

      const newRelease = await this.releaseService.cloneRelease(id, req.body, userId);
      
      logger.musicDistribution.userAction('Release cloned via API', {
        originalReleaseId: id,
        newReleaseId: newRelease.id,
        userId,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        data: newRelease,
        message: 'Release cloned successfully'
      });
    } catch (error) {
      logger.error('Clone release API error:', error);
      
      if (error.message === 'Original release not found') {
        return res.status(404).json({
          error: 'Original release not found',
          service: 'music-distribution'
        });
      }

      res.status(400).json({
        error: error.message,
        service: 'music-distribution'
      });
    }
  }

  /**
   * Get releases by artist
   * GET /api/music/artists/:artistId/releases
   */
  async getReleasesByArtist(req, res) {
    try {
      const { artistId } = req.params;
      
      const filters = {
        status: req.query.status ? req.query.status.split(',') : undefined,
        type: req.query.type ? req.query.type.split(',') : undefined,
        genre: req.query.genre,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const pagination = {
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const result = await this.releaseService.getReleasesByArtist(artistId, filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.releases,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Get releases by artist API error:', error);
      res.status(500).json({
        error: 'Internal server error',
        service: 'music-distribution'
      });
    }
  }
}

module.exports = ReleaseController;
