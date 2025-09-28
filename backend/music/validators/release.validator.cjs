/**
 * Release Validator
 * Specialized validation for release entities and their distribution lifecycle
 * Handles validation for release creation, updates, and distribution workflows
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../../config/logger.cjs');

class ReleaseValidator extends MetadataValidator {
  constructor() {
    super();
  }

  // ========== Release-Specific Validation ==========

  /**
   * Validate complete release for creation
   */
  async validateForCreation(releaseData, options = {}) {
    this.resetValidation();
    
    const { 
      validateTracks = true,
      validateArtist = true,
      strict = false 
    } = options;

    try {
      // Basic release validation
      await this.validateReleaseStructure(releaseData);
      await this.validateReleaseMetadata(releaseData, { strict });
      
      // Artist validation
      if (validateArtist) {
        await this.validateReleaseArtist(releaseData);
      }
      
      // Track validation
      if (validateTracks && releaseData.tracks) {
        await this.validateReleaseTracks(releaseData.tracks);
      }
      
      // Business rules validation
      await this.validateBusinessRules(releaseData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Release creation validation error', { error: error.message });
      this.addError('validation_error', 'Release validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate release for distribution
   */
  async validateForDistribution(releaseData, targetChannels = [], options = {}) {
    this.resetValidation();
    
    const { 
      validateReadiness = true,
      validateContent = true,
      validateCompliance = true 
    } = options;

    try {
      // Distribution readiness validation
      if (validateReadiness) {
        await this.validateDistributionReadiness(releaseData);
      }
      
      // Content quality validation
      if (validateContent) {
        await this.validateContentQuality(releaseData);
      }
      
      // Platform compliance validation
      if (validateCompliance) {
        await this.validatePlatformCompliance(releaseData, targetChannels);
      }
      
      // Territory and rights validation
      await this.validateTerritoryRights(releaseData, targetChannels);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Release distribution validation error', { error: error.message });
      this.addError('validation_error', 'Distribution validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate release status transition
   */
  validateStatusTransition(currentStatus, newStatus, releaseData = {}) {
    this.resetValidation();
    
    const validTransitions = {
      'draft': ['in_review', 'cancelled'],
      'in_review': ['approved', 'rejected', 'draft'],
      'rejected': ['draft'],
      'approved': ['scheduled', 'cancelled'],
      'scheduled': ['mastered', 'cancelled', 'postponed'],
      'postponed': ['scheduled', 'cancelled'],
      'mastered': ['distributed', 'scheduled'],
      'distributed': ['released', 'withdrawn'],
      'released': ['withdrawn'],
      'withdrawn': ['released'],
      'cancelled': []
    };

    // Check if transition is valid
    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      this.addError('invalid_transition', 
        `Cannot transition from ${currentStatus} to ${newStatus}`, 
        'status'
      );
    }

    // Status-specific validations
    this.validateStatusRequirements(newStatus, releaseData);
    
    return this.buildValidationResult();
  }

  // ========== Structure Validation ==========

  /**
   * Validate release data structure
   */
  async validateReleaseStructure(releaseData) {
    // Required fields validation
    const requiredFields = ['title', 'artist_id', 'release_date', 'type'];
    
    requiredFields.forEach(field => {
      if (!releaseData[field]) {
        this.addError('missing_required_field', `${field} is required`, field);
      }
    });

    // Data type validation
    if (releaseData.title && typeof releaseData.title !== 'string') {
      this.addError('invalid_data_type', 'Title must be a string', 'title');
    }

    if (releaseData.release_date && !this.isValidDate(releaseData.release_date)) {
      this.addError('invalid_date_format', 'Invalid release date format', 'release_date');
    }

    if (releaseData.explicit_content && typeof releaseData.explicit_content !== 'boolean') {
      this.addError('invalid_data_type', 'Explicit content must be boolean', 'explicit_content');
    }

    // Array field validation
    const arrayFields = ['territories', 'marketing_tags', 'mood_tags', 'theme_tags'];
    arrayFields.forEach(field => {
      if (releaseData[field] && !Array.isArray(releaseData[field])) {
        this.addError('invalid_data_type', `${field} must be an array`, field);
      }
    });

    // Object field validation
    const objectFields = ['metadata', 'social_media_assets', 'digital_format_details'];
    objectFields.forEach(field => {
      if (releaseData[field] && typeof releaseData[field] !== 'object') {
        this.addError('invalid_data_type', `${field} must be an object`, field);
      }
    });
  }

  /**
   * Validate release artist relationship
   */
  async validateReleaseArtist(releaseData) {
    if (!releaseData.artist_id) {
      this.addError('missing_artist', 'Artist ID is required', 'artist');
      return;
    }

    // Additional artist validation would require database lookup
    // This is a placeholder for future implementation
    if (typeof releaseData.artist_id !== 'string') {
      this.addError('invalid_artist_id', 'Artist ID must be a string', 'artist_id');
    }
  }

  /**
   * Validate release tracks collection
   */
  async validateReleaseTracks(tracks) {
    if (!Array.isArray(tracks)) {
      this.addError('invalid_tracks_format', 'Tracks must be an array', 'tracks');
      return;
    }

    if (tracks.length === 0) {
      this.addError('no_tracks', 'Release must have at least one track', 'tracks');
      return;
    }

    // Validate individual tracks
    for (let i = 0; i < tracks.length; i++) {
      await this.validateTrackInRelease(tracks[i], i + 1);
    }

    // Validate track sequence
    this.validateTrackSequence(tracks);
  }

  /**
   * Validate individual track within release context
   */
  async validateTrackInRelease(track, expectedTrackNumber) {
    const prefix = `Track ${expectedTrackNumber}`;

    // Basic track validation
    if (!track.title) {
      this.addError('missing_track_title', `${prefix}: Title is required`, 'tracks');
    }

    if (!track.duration_ms) {
      this.addError('missing_track_duration', `${prefix}: Duration is required`, 'tracks');
    }

    // Track number validation
    if (track.track_number && track.track_number !== expectedTrackNumber) {
      this.addWarning('track_number_mismatch', 
        `${prefix}: Track number (${track.track_number}) doesn't match position (${expectedTrackNumber})`, 
        'tracks'
      );
    }

    // Audio file validation
    if (!track.audio_file_url && !track.audio_file) {
      this.addError('missing_audio_file', `${prefix}: Audio file is required`, 'tracks');
    }
  }

  /**
   * Validate track sequence and numbering
   */
  validateTrackSequence(tracks) {
    const trackNumbers = tracks.map(track => track.track_number).filter(Boolean);
    const discNumbers = tracks.map(track => track.disc_number || 1);

    // Check for duplicate track numbers
    const duplicateTrackNumbers = trackNumbers.filter((num, index) => 
      trackNumbers.indexOf(num) !== index
    );

    if (duplicateTrackNumbers.length > 0) {
      this.addError('duplicate_track_numbers', 
        `Duplicate track numbers found: ${duplicateTrackNumbers.join(', ')}`, 
        'tracks'
      );
    }

    // Check for missing track numbers in sequence
    const maxDisc = Math.max(...discNumbers);
    for (let disc = 1; disc <= maxDisc; disc++) {
      const discTracks = tracks
        .filter(track => (track.disc_number || 1) === disc)
        .map(track => track.track_number)
        .filter(Boolean)
        .sort((a, b) => a - b);

      for (let i = 1; i < discTracks.length; i++) {
        if (discTracks[i] - discTracks[i - 1] > 1) {
          this.addWarning('track_number_gap', 
            `Track number gap in disc ${disc}: ${discTracks[i - 1]} to ${discTracks[i]}`, 
            'tracks'
          );
        }
      }
    }
  }

  // ========== Business Rules Validation ==========

  /**
   * Validate business rules and constraints
   */
  async validateBusinessRules(releaseData) {
    // Release date constraints
    await this.validateReleaseDateConstraints(releaseData);
    
    // Type-specific constraints
    await this.validateTypeConstraints(releaseData);
    
    // Commercial constraints
    await this.validateCommercialConstraints(releaseData);
    
    // Territory constraints
    await this.validateTerritoryConstraints(releaseData);
  }

  /**
   * Validate release date business rules
   */
  async validateReleaseDateConstraints(releaseData) {
    const releaseDate = new Date(releaseData.release_date);
    const now = new Date();
    
    // Future release validation
    const maxFutureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    if (releaseDate > maxFutureDate) {
      this.addError('release_date_too_far', 
        'Release date cannot be more than 1 year in the future', 
        'release_date'
      );
    }

    // Pre-order validation
    if (releaseData.pre_order_date) {
      const preOrderDate = new Date(releaseData.pre_order_date);
      const minPreOrderGap = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks
      
      if (releaseDate.getTime() - preOrderDate.getTime() < minPreOrderGap) {
        this.addWarning('short_preorder_period', 
          'Pre-order period is less than 2 weeks', 
          'pre_order_date'
        );
      }
    }

    // Weekend release warning
    const dayOfWeek = releaseDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      this.addWarning('weekend_release', 
        'Weekend releases may receive less promotion attention', 
        'release_date'
      );
    }
  }

  /**
   * Validate type-specific constraints
   */
  async validateTypeConstraints(releaseData) {
    const trackCount = releaseData.track_count || (releaseData.tracks && releaseData.tracks.length) || 0;

    switch (releaseData.type) {
      case 'single':
        if (trackCount > 3) {
          this.addError('single_too_many_tracks', 
            'Singles cannot have more than 3 tracks', 
            'type'
          );
        }
        break;

      case 'ep':
        if (trackCount > 8) {
          this.addError('ep_too_many_tracks', 
            'EPs cannot have more than 8 tracks', 
            'type'
          );
        }
        if (trackCount < 3) {
          this.addWarning('ep_few_tracks', 
            'EPs typically have 3 or more tracks', 
            'type'
          );
        }
        break;

      case 'album':
        if (trackCount < 7) {
          this.addWarning('album_few_tracks', 
            'Albums typically have 7 or more tracks', 
            'type'
          );
        }
        break;

      case 'compilation':
        if (trackCount < 10) {
          this.addWarning('compilation_few_tracks', 
            'Compilations typically have 10 or more tracks', 
            'type'
          );
        }
        break;
    }
  }

  /**
   * Validate commercial constraints
   */
  async validateCommercialConstraints(releaseData) {
    // Price category validation
    const validPriceCategories = ['budget', 'standard', 'premium', 'deluxe'];
    if (releaseData.price_category && !validPriceCategories.includes(releaseData.price_category)) {
      this.addError('invalid_price_category', 
        'Invalid price category', 
        'price_category'
      );
    }

    // Limited edition validation
    if (releaseData.limited_edition && !releaseData.edition_size) {
      this.addWarning('limited_edition_no_size', 
        'Limited edition should specify edition size', 
        'edition_size'
      );
    }

    // Promotional release validation
    if (releaseData.promotional && releaseData.price_category !== 'budget') {
      this.addWarning('promotional_price_category', 
        'Promotional releases typically use budget price category', 
        'promotional'
      );
    }
  }

  /**
   * Validate territory constraints
   */
  async validateTerritoryConstraints(releaseData) {
    if (releaseData.territory_restrictions && Array.isArray(releaseData.territory_restrictions)) {
      const validTerritories = [
        'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 
        'SE', 'NO', 'DK', 'FI', 'AU', 'NZ', 'JP', 'KR', 'CN', 'IN', 'BR', 'MX'
      ];

      const invalidTerritories = releaseData.territory_restrictions.filter(
        territory => !validTerritories.includes(territory)
      );

      if (invalidTerritories.length > 0) {
        this.addWarning('invalid_territories', 
          `Unrecognized territory codes: ${invalidTerritories.join(', ')}`, 
          'territory_restrictions'
        );
      }

      // Warn about major market restrictions
      const majorMarkets = ['US', 'GB', 'DE', 'JP'];
      const restrictedMajorMarkets = releaseData.territory_restrictions.filter(
        territory => majorMarkets.includes(territory)
      );

      if (restrictedMajorMarkets.length > 0) {
        this.addWarning('major_market_restriction', 
          `Release restricted in major markets: ${restrictedMajorMarkets.join(', ')}`, 
          'territory_restrictions'
        );
      }
    }
  }

  // ========== Distribution Validation ==========

  /**
   * Validate distribution readiness
   */
  async validateDistributionReadiness(releaseData) {
    // Mastering requirements
    if (releaseData.status !== 'mastered' && releaseData.status !== 'distributed') {
      this.addError('not_mastered', 
        'Release must be mastered before distribution', 
        'status'
      );
    }

    // Required metadata for distribution
    const requiredForDistribution = [
      'upc', 'genre', 'copyright_notice', 'phonographic_copyright'
    ];

    requiredForDistribution.forEach(field => {
      if (!releaseData[field]) {
        this.addError('missing_distribution_metadata', 
          `${field} is required for distribution`, 
          field
        );
      }
    });

    // Artwork requirements
    if (!releaseData.artwork_url && !releaseData.artwork_file) {
      this.addError('missing_artwork', 
        'Artwork is required for distribution', 
        'artwork'
      );
    }

    // Track completeness
    if (releaseData.tracks) {
      const incompleteTracks = releaseData.tracks.filter(track => 
        !track.audio_file_url || !track.isrc
      );

      if (incompleteTracks.length > 0) {
        this.addError('incomplete_tracks', 
          `${incompleteTracks.length} tracks missing audio files or ISRC codes`, 
          'tracks'
        );
      }
    }
  }

  /**
   * Validate content quality for distribution
   */
  async validateContentQuality(releaseData) {
    if (releaseData.tracks) {
      releaseData.tracks.forEach((track, index) => {
        // Audio quality checks
        if (track.sample_rate && track.sample_rate < 44100) {
          this.addWarning('low_sample_rate', 
            `Track ${index + 1}: Sample rate below CD quality`, 
            'tracks'
          );
        }

        if (track.bit_depth && track.bit_depth < 16) {
          this.addWarning('low_bit_depth', 
            `Track ${index + 1}: Bit depth below CD quality`, 
            'tracks'
          );
        }

        // Duration checks
        if (track.duration_ms && track.duration_ms < 30000) {
          this.addWarning('short_track', 
            `Track ${index + 1}: Very short duration may affect streaming placement`, 
            'tracks'
          );
        }

        // Loudness checks
        if (track.loudness_lufs && track.loudness_lufs > -14) {
          this.addWarning('loudness_high', 
            `Track ${index + 1}: May be too loud for streaming platforms`, 
            'tracks'
          );
        }
      });
    }
  }

  /**
   * Validate platform compliance
   */
  async validatePlatformCompliance(releaseData, targetChannels) {
    targetChannels.forEach(channel => {
      const channelName = channel.name || channel;
      
      switch (channelName.toLowerCase()) {
        case 'spotify':
          this.validateSpotifyCompliance(releaseData);
          break;
        case 'apple_music':
          this.validateAppleMusicCompliance(releaseData);
          break;
        case 'youtube_music':
          this.validateYouTubeCompliance(releaseData);
          break;
        case 'tidal':
          this.validateTidalCompliance(releaseData);
          break;
        case 'amazon_music':
          this.validateAmazonMusicCompliance(releaseData);
          break;
      }
    });
  }

  /**
   * Validate Spotify compliance
   */
  validateSpotifyCompliance(releaseData) {
    // Minimum track duration
    if (releaseData.tracks) {
      const shortTracks = releaseData.tracks.filter(track => 
        track.duration_ms && track.duration_ms < 30000
      );
      
      if (shortTracks.length > 0) {
        this.addError('spotify_short_tracks', 
          'Spotify requires tracks to be at least 30 seconds', 
          'tracks'
        );
      }
    }

    // Content policy compliance
    if (releaseData.explicit_content === undefined) {
      this.addWarning('spotify_explicit_unmarked', 
        'Explicit content marking is required for Spotify', 
        'explicit_content'
      );
    }
  }

  /**
   * Validate Apple Music compliance
   */
  validateAppleMusicCompliance(releaseData) {
    // High-quality audio preference
    if (releaseData.tracks) {
      const mp3Tracks = releaseData.tracks.filter(track => 
        track.audio_file_format === 'mp3'
      );
      
      if (mp3Tracks.length > 0) {
        this.addWarning('apple_mp3_quality', 
          'Apple Music prefers lossless formats over MP3', 
          'tracks'
        );
      }
    }

    // Metadata requirements
    if (!releaseData.copyright_notice) {
      this.addError('apple_copyright_required', 
        'Copyright notice is required for Apple Music', 
        'copyright_notice'
      );
    }
  }

  /**
   * Validate YouTube compliance
   */
  validateYouTubeCompliance(releaseData) {
    // Content ID requirements
    if (!releaseData.copyright_notice) {
      this.addError('youtube_copyright_required', 
        'Copyright notice is required for YouTube Content ID', 
        'copyright_notice'
      );
    }

    // Music video requirements
    if (releaseData.music_video_url) {
      if (!releaseData.music_video_url.includes('youtube.com') && 
          !releaseData.music_video_url.includes('youtu.be')) {
        this.addWarning('youtube_video_external', 
          'Music video should be hosted on YouTube for optimal integration', 
          'music_video_url'
        );
      }
    }
  }

  /**
   * Validate Tidal compliance
   */
  validateTidalCompliance(releaseData) {
    // High-quality audio requirements
    if (releaseData.tracks) {
      const lowQualityTracks = releaseData.tracks.filter(track => 
        track.audio_file_format === 'mp3' || 
        (track.sample_rate && track.sample_rate < 44100)
      );
      
      if (lowQualityTracks.length > 0) {
        this.addWarning('tidal_quality_preference', 
          'Tidal emphasizes high-quality audio (FLAC preferred)', 
          'tracks'
        );
      }
    }

    // Master quality validation
    if (releaseData.master_quality_available) {
      if (!releaseData.tracks.every(track => 
        track.sample_rate >= 96000 && track.bit_depth >= 24
      )) {
        this.addError('tidal_master_quality', 
          'Master quality requires 96kHz/24-bit or higher', 
          'tracks'
        );
      }
    }
  }

  /**
   * Validate Amazon Music compliance
   */
  validateAmazonMusicCompliance(releaseData) {
    // UPC requirement
    if (!releaseData.upc) {
      this.addError('amazon_upc_required', 
        'UPC is required for Amazon Music', 
        'upc'
      );
    }

    // Genre requirement
    if (!releaseData.genre) {
      this.addError('amazon_genre_required', 
        'Genre is required for Amazon Music', 
        'genre'
      );
    }
  }

  /**
   * Validate territory rights for distribution
   */
  async validateTerritoryRights(releaseData, targetChannels) {
    if (!releaseData.territory_restrictions || releaseData.territory_restrictions.length === 0) {
      return; // No restrictions
    }

    targetChannels.forEach(channel => {
      const channelTerritories = channel.territories || ['global'];
      
      if (channelTerritories.includes('global')) {
        return; // Global channel, no territory issues
      }

      const conflictingTerritories = channelTerritories.filter(territory => 
        releaseData.territory_restrictions.includes(territory)
      );

      if (conflictingTerritories.length > 0) {
        this.addWarning('territory_conflict', 
          `Release restricted in territories served by ${channel.name}: ${conflictingTerritories.join(', ')}`, 
          'territory_restrictions'
        );
      }
    });
  }

  // ========== Status-Specific Validation ==========

  /**
   * Validate requirements for specific status
   */
  validateStatusRequirements(status, releaseData) {
    switch (status) {
      case 'in_review':
        this.validateInReviewRequirements(releaseData);
        break;
      case 'approved':
        this.validateApprovedRequirements(releaseData);
        break;
      case 'scheduled':
        this.validateScheduledRequirements(releaseData);
        break;
      case 'mastered':
        this.validateMasteredRequirements(releaseData);
        break;
      case 'distributed':
        this.validateDistributedRequirements(releaseData);
        break;
      case 'released':
        this.validateReleasedRequirements(releaseData);
        break;
    }
  }

  /**
   * Validate requirements for in_review status
   */
  validateInReviewRequirements(releaseData) {
    const requiredFields = ['title', 'artist_id', 'release_date', 'type', 'genre'];
    
    requiredFields.forEach(field => {
      if (!releaseData[field]) {
        this.addError('review_missing_field', 
          `${field} is required for review submission`, 
          field
        );
      }
    });

    if (releaseData.tracks && releaseData.tracks.length === 0) {
      this.addError('review_no_tracks', 
        'At least one track is required for review', 
        'tracks'
      );
    }
  }

  /**
   * Validate requirements for approved status
   */
  validateApprovedRequirements(releaseData) {
    if (!releaseData.artwork_url && !releaseData.artwork_file) {
      this.addError('approved_missing_artwork', 
        'Artwork is required for approved releases', 
        'artwork'
      );
    }

    if (!releaseData.upc) {
      this.addError('approved_missing_upc', 
        'UPC is required for approved releases', 
        'upc'
      );
    }
  }

  /**
   * Validate requirements for scheduled status
   */
  validateScheduledRequirements(releaseData) {
    const releaseDate = new Date(releaseData.release_date);
    const now = new Date();
    
    if (releaseDate <= now) {
      this.addError('scheduled_past_date', 
        'Release date must be in the future for scheduled releases', 
        'release_date'
      );
    }

    // Minimum lead time validation (e.g., 2 weeks)
    const minLeadTime = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
    if (releaseDate.getTime() - now.getTime() < minLeadTime) {
      this.addWarning('scheduled_short_lead', 
        'Less than 2 weeks lead time for scheduled release', 
        'release_date'
      );
    }
  }

  /**
   * Validate requirements for mastered status
   */
  validateMasteredRequirements(releaseData) {
    if (releaseData.tracks) {
      const unmasteredTracks = releaseData.tracks.filter(track => 
        !track.mastering_engineer || !track.audio_file_url
      );

      if (unmasteredTracks.length > 0) {
        this.addError('mastered_incomplete_tracks', 
          'All tracks must be mastered with final audio files', 
          'tracks'
        );
      }
    }
  }

  /**
   * Validate requirements for distributed status
   */
  validateDistributedRequirements(releaseData) {
    if (!releaseData.distribution_channels || releaseData.distribution_channels.length === 0) {
      this.addError('distributed_no_channels', 
        'At least one distribution channel is required', 
        'distribution_channels'
      );
    }
  }

  /**
   * Validate requirements for released status
   */
  validateReleasedRequirements(releaseData) {
    const releaseDate = new Date(releaseData.release_date);
    const now = new Date();
    
    if (releaseDate > now) {
      this.addWarning('released_future_date', 
        'Release marked as released but release date is in the future', 
        'release_date'
      );
    }
  }

  // ========== Utility Methods ==========

  /**
   * Check if date string is valid
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Get validation summary with recommendations
   */
  getValidationSummaryWithRecommendations() {
    const result = this.buildValidationResult();
    
    // Add recommendations based on warnings
    result.recommendations = [];
    
    this.warnings.forEach(warning => {
      switch (warning.code) {
        case 'weekend_release':
          result.recommendations.push({
            type: 'scheduling',
            message: 'Consider releasing on Friday for maximum impact',
            field: 'release_date'
          });
          break;
        case 'short_preorder_period':
          result.recommendations.push({
            type: 'marketing',
            message: 'Extend pre-order period to at least 2 weeks for better promotion',
            field: 'pre_order_date'
          });
          break;
        case 'single_few_tracks':
          result.recommendations.push({
            type: 'content',
            message: 'Consider adding B-sides or remixes to increase value',
            field: 'tracks'
          });
          break;
      }
    });
    
    return result;
  }
}

module.exports = ReleaseValidator;
