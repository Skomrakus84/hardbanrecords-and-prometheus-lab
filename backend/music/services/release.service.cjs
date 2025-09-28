/**
 * Release Service for Music Distribution
 * Obsługa wydań muzycznych
 */

const ReleaseModel = require('../models/release.model.cjs');
const ArtistModel = require('../models/artist.model.cjs');
const { validateCreateRelease, validateUpdateRelease, transformReleaseForResponse, transformReleaseForDatabase } = require('../dtos/release.dto.cjs');
const logger = require('../config/logger.cjs');
const distributionService = require('./distribution.service.cjs');
const metadataValidatorService = require('./metadataValidator.service.cjs');

class ReleaseService {
  constructor(supabaseClient = null) {
    this.releaseModel = new ReleaseModel(supabaseClient);
    this.artistModel = new ArtistModel(supabaseClient);
  }

  /**
   * Create a new release
   */
  async createRelease(releaseData, userId) {
    try {
      // Validate input data
      const { error: validationError, value: validatedData } = validateCreateRelease(releaseData);
      if (validationError) {
        logger.error('Release validation failed:', { error: validationError.details });
        throw new Error(`Validation failed: ${validationError.details.map(d => d.message).join(', ')}`);
      }

      // Check if artist exists
      const artist = await this.artistModel.findById(validatedData.artistId);
      if (!artist) {
        throw new Error('Artist not found');
      }

      // Validate metadata
      const metadataValidation = await metadataValidatorService.validateReleaseMetadata(validatedData);
      if (!metadataValidation.isValid) {
        throw new Error(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`);
      }

      // Check UPC uniqueness if provided
      if (validatedData.upc) {
        const isUPCAvailable = await this.releaseModel.isUPCAvailable(validatedData.upc);
        if (!isUPCAvailable) {
          throw new Error('UPC code is already in use');
        }
      }

      // Transform data for database
      const dbData = transformReleaseForDatabase(validatedData);

      // Create release
      const release = await this.releaseModel.create(dbData, userId);

      // Log the creation
      logger.musicDistribution.userAction('Release created successfully', {
        releaseId: release.id,
        releaseTitle: release.title,
        artistId: release.artist_id,
        createdBy: userId
      });

      // Transform for response
      return transformReleaseForResponse(release);
    } catch (error) {
      logger.error('Failed to create release:', error);
      throw error;
    }
  }

  /**
   * Get release by ID
   */
  async getReleaseById(releaseId, includeAnalytics = false) {
    try {
      const release = await this.releaseModel.findById(releaseId, true);
      if (!release) {
        throw new Error('Release not found');
      }

      const responseData = transformReleaseForResponse(release);

      // Include analytics if requested
      if (includeAnalytics) {
        responseData.analytics = await this.releaseModel.getAnalyticsSummary(releaseId);
        responseData.distributionStatus = await this.releaseModel.getDistributionStatus(releaseId);
      }

      return responseData;
    } catch (error) {
      logger.error('Failed to get release:', { error, releaseId });
      throw error;
    }
  }

  /**
   * Get all releases with filtering and pagination
   */
  async getReleases(filters = {}, pagination = {}) {
    try {
      const result = await this.releaseModel.findAll(filters, pagination);
      
      return {
        releases: result.data.map(release => transformReleaseForResponse(release)),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error('Failed to get releases:', error);
      throw error;
    }
  }

  /**
   * Update release
   */
  async updateRelease(releaseId, updateData, userId) {
    try {
      // Check if release exists
      const existingRelease = await this.releaseModel.findById(releaseId);
      if (!existingRelease) {
        throw new Error('Release not found');
      }

      // Validate update data
      const { error: validationError, value: validatedData } = validateUpdateRelease(updateData);
      if (validationError) {
        logger.error('Release update validation failed:', { error: validationError.details });
        throw new Error(`Validation failed: ${validationError.details.map(d => d.message).join(', ')}`);
      }

      // Check UPC uniqueness if being updated
      if (validatedData.upc && validatedData.upc !== existingRelease.upc) {
        const isUPCAvailable = await this.releaseModel.isUPCAvailable(validatedData.upc, releaseId);
        if (!isUPCAvailable) {
          throw new Error('UPC code is already in use');
        }
      }

      // Validate metadata if critical fields are being updated
      const criticalFields = ['title', 'genres', 'tracks', 'artwork'];
      const hasCriticalUpdates = criticalFields.some(field => validatedData.hasOwnProperty(field));
      
      if (hasCriticalUpdates) {
        const fullData = { ...existingRelease, ...validatedData };
        const metadataValidation = await metadataValidatorService.validateReleaseMetadata(fullData);
        if (!metadataValidation.isValid) {
          throw new Error(`Metadata validation failed: ${metadataValidation.errors.join(', ')}`);
        }
      }

      // Transform data for database
      const dbData = transformReleaseForDatabase(validatedData);

      // Update release
      const updatedRelease = await this.releaseModel.update(releaseId, dbData, userId);

      // If release is live and critical data changed, trigger re-distribution
      if (existingRelease.status === 'live' && hasCriticalUpdates) {
        await distributionService.scheduleReDistribution(releaseId, userId);
      }

      logger.musicDistribution.userAction('Release updated successfully', {
        releaseId,
        updatedBy: userId,
        changes: Object.keys(validatedData)
      });

      return transformReleaseForResponse(updatedRelease);
    } catch (error) {
      logger.error('Failed to update release:', error);
      throw error;
    }
  }

  /**
   * Delete release
   */
  async deleteRelease(releaseId, userId) {
    try {
      const release = await this.releaseModel.findById(releaseId);
      if (!release) {
        throw new Error('Release not found');
      }

      // Check if release can be deleted
      if (release.status === 'live') {
        throw new Error('Cannot delete a live release. Please take it down first.');
      }

      await this.releaseModel.delete(releaseId, userId);

      logger.musicDistribution.userAction('Release deleted successfully', {
        releaseId,
        deletedBy: userId
      });

      return { success: true, message: 'Release deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete release:', error);
      throw error;
    }
  }

  /**
   * Submit release for distribution
   */
  async submitForDistribution(releaseId, userId) {
    try {
      const release = await this.releaseModel.findById(releaseId);
      if (!release) {
        throw new Error('Release not found');
      }

      if (release.status !== 'draft') {
        throw new Error('Only draft releases can be submitted for distribution');
      }

      // Validate release data is complete
      const validation = await metadataValidatorService.validateForDistribution(release);
      if (!validation.isValid) {
        throw new Error(`Release not ready for distribution: ${validation.errors.join(', ')}`);
      }

      // Update status to pending
      await this.releaseModel.updateStatus(releaseId, 'pending', userId);

      // Schedule distribution
      await distributionService.scheduleDistribution(releaseId, userId);

      logger.musicDistribution.distribution('Release submitted for distribution', {
        releaseId,
        submittedBy: userId
      });

      return { success: true, message: 'Release submitted for distribution' };
    } catch (error) {
      logger.error('Failed to submit release for distribution:', error);
      throw error;
    }
  }

  /**
   * Approve release
   */
  async approveRelease(releaseId, userId) {
    try {
      const release = await this.releaseModel.findById(releaseId);
      if (!release) {
        throw new Error('Release not found');
      }

      if (release.status !== 'pending') {
        throw new Error('Only pending releases can be approved');
      }

      await this.releaseModel.updateStatus(releaseId, 'approved', userId);

      // Trigger distribution process
      await distributionService.distributeRelease(releaseId, userId);

      logger.musicDistribution.distribution('Release approved and distribution started', {
        releaseId,
        approvedBy: userId
      });

      return { success: true, message: 'Release approved and distribution started' };
    } catch (error) {
      logger.error('Failed to approve release:', error);
      throw error;
    }
  }

  /**
   * Reject release
   */
  async rejectRelease(releaseId, rejectionReason, userId) {
    try {
      const release = await this.releaseModel.findById(releaseId);
      if (!release) {
        throw new Error('Release not found');
      }

      if (release.status !== 'pending') {
        throw new Error('Only pending releases can be rejected');
      }

      await this.releaseModel.updateStatus(releaseId, 'rejected', userId, rejectionReason);

      logger.musicDistribution.distribution('Release rejected', {
        releaseId,
        rejectedBy: userId,
        reason: rejectionReason
      });

      return { success: true, message: 'Release rejected' };
    } catch (error) {
      logger.error('Failed to reject release:', error);
      throw error;
    }
  }

  /**
   * Take down release
   */
  async takeDownRelease(releaseId, userId) {
    try {
      const release = await this.releaseModel.findById(releaseId);
      if (!release) {
        throw new Error('Release not found');
      }

      if (release.status !== 'live') {
        throw new Error('Only live releases can be taken down');
      }

      // Initiate takedown process
      await distributionService.takeDownRelease(releaseId, userId);
      await this.releaseModel.updateStatus(releaseId, 'taken-down', userId);

      logger.musicDistribution.distribution('Release takedown initiated', {
        releaseId,
        initiatedBy: userId
      });

      return { success: true, message: 'Release takedown initiated' };
    } catch (error) {
      logger.error('Failed to take down release:', error);
      throw error;
    }
  }

  /**
   * Get recent releases
   */
  async getRecentReleases(days = 30, limit = 50) {
    try {
      const releases = await this.releaseModel.findRecent(days, limit);
      return releases.map(release => transformReleaseForResponse(release));
    } catch (error) {
      logger.error('Failed to get recent releases:', error);
      throw error;
    }
  }

  /**
   * Get upcoming releases
   */
  async getUpcomingReleases(days = 30, limit = 50) {
    try {
      const releases = await this.releaseModel.findUpcoming(days, limit);
      return releases.map(release => transformReleaseForResponse(release));
    } catch (error) {
      logger.error('Failed to get upcoming releases:', error);
      throw error;
    }
  }

  /**
   * Search releases
   */
  async searchReleases(searchTerm, limit = 50) {
    try {
      const releases = await this.releaseModel.search(searchTerm, limit);
      return releases.map(release => transformReleaseForResponse(release));
    } catch (error) {
      logger.error('Failed to search releases:', error);
      throw error;
    }
  }

  /**
   * Get releases by artist
   */
  async getReleasesByArtist(artistId, filters = {}, pagination = {}) {
    try {
      const artistFilters = { ...filters, artistId };
      const result = await this.releaseModel.findAll(artistFilters, pagination);
      
      return {
        releases: result.data.map(release => transformReleaseForResponse(release)),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error('Failed to get releases by artist:', error);
      throw error;
    }
  }

  /**
   * Get release distribution status
   */
  async getDistributionStatus(releaseId) {
    try {
      const status = await this.releaseModel.getDistributionStatus(releaseId);
      return status;
    } catch (error) {
      logger.error('Failed to get distribution status:', error);
      throw error;
    }
  }

  /**
   * Clone release (for creating new versions)
   */
  async cloneRelease(releaseId, newReleaseData, userId) {
    try {
      const originalRelease = await this.releaseModel.findById(releaseId);
      if (!originalRelease) {
        throw new Error('Original release not found');
      }

      // Create new release data based on original
      const cloneData = {
        ...transformReleaseForResponse(originalRelease),
        ...newReleaseData,
        status: 'draft',
        submissionNotes: undefined,
        rejectionReason: undefined,
        metadata: undefined
      };

      // Remove ID to create new record
      delete cloneData.id;

      return await this.createRelease(cloneData, userId);
    } catch (error) {
      logger.error('Failed to clone release:', error);
      throw error;
    }
  }
}

module.exports = ReleaseService;
