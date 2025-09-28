/**
 * Release Mapper
 * Data transformation layer for release entities between different representations
 * Handles mapping between database models, DTOs, API responses, and external formats
 */

const logger = require('../../config/logger.cjs');

class ReleaseMapper {
  constructor() {
    this.logger = logger;
  }

  // ========== Database to DTO Mapping ==========

  /**
   * Map database model to DTO
   */
  toDTO(dbModel, options = {}) {
    if (!dbModel) return null;

    const {
      includeTracks = true,
      includeArtists = true,
      includeAnalytics = false,
      includeDistribution = false,
      includeSplits = false
    } = options;

    try {
      const dto = {
        id: dbModel.id,
        title: dbModel.title,
        artist_id: dbModel.artist_id,
        release_type: dbModel.release_type,
        genre: dbModel.genre,
        subgenre: dbModel.subgenre,
        release_date: dbModel.release_date,
        status: dbModel.status,
        
        // Metadata
        metadata: this.mapMetadata(dbModel),
        
        // Identifiers
        upc: dbModel.upc,
        catalog_number: dbModel.catalog_number,
        
        // Commercial info
        label_name: dbModel.label_name,
        copyright_info: dbModel.copyright_info,
        phonographic_copyright: dbModel.phonographic_copyright,
        
        // Artwork
        artwork: this.mapArtwork(dbModel),
        
        // Dates
        original_release_date: dbModel.original_release_date,
        digital_release_date: dbModel.digital_release_date,
        physical_release_date: dbModel.physical_release_date,
        
        // Status and timestamps
        created_at: dbModel.created_at,
        updated_at: dbModel.updated_at
      };

      // Conditional includes
      if (includeTracks && dbModel.tracks) {
        dto.tracks = this.mapTracks(dbModel.tracks);
      }

      if (includeArtists && dbModel.artists) {
        dto.artists = this.mapArtists(dbModel.artists);
      }

      if (includeAnalytics && dbModel.analytics) {
        dto.analytics = this.mapAnalytics(dbModel.analytics);
      }

      if (includeDistribution && dbModel.distribution) {
        dto.distribution = this.mapDistribution(dbModel.distribution);
      }

      if (includeSplits && dbModel.splits) {
        dto.splits = this.mapSplits(dbModel.splits);
      }

      return dto;
    } catch (error) {
      this.logger.error('Error mapping release to DTO', { error: error.message, releaseId: dbModel.id });
      throw new Error('Failed to map release to DTO');
    }
  }

  /**
   * Map array of database models to DTOs
   */
  toDTOArray(dbModels, options = {}) {
    if (!Array.isArray(dbModels)) return [];
    
    return dbModels.map(model => this.toDTO(model, options)).filter(Boolean);
  }

  // ========== DTO to Database Mapping ==========

  /**
   * Map DTO to database model
   */
  toModel(dto, options = {}) {
    if (!dto) return null;

    const { 
      excludeId = false,
      includeTimestamps = true 
    } = options;

    try {
      const model = {
        title: dto.title,
        artist_id: dto.artist_id,
        release_type: dto.release_type,
        genre: dto.genre,
        subgenre: dto.subgenre,
        release_date: dto.release_date,
        status: dto.status || 'draft',
        
        // Identifiers
        upc: dto.upc,
        catalog_number: dto.catalog_number,
        
        // Commercial info
        label_name: dto.label_name,
        copyright_info: dto.copyright_info,
        phonographic_copyright: dto.phonographic_copyright,
        
        // Dates
        original_release_date: dto.original_release_date,
        digital_release_date: dto.digital_release_date,
        physical_release_date: dto.physical_release_date,
        
        // Metadata (flattened from nested structure)
        description: dto.metadata?.description,
        language: dto.metadata?.language,
        explicit_content: dto.metadata?.explicit_content,
        territories: dto.metadata?.territories,
        
        // Artwork (flattened)
        artwork_url: dto.artwork?.url,
        artwork_width: dto.artwork?.width,
        artwork_height: dto.artwork?.height,
        artwork_format: dto.artwork?.format
      };

      // Conditionally include ID
      if (!excludeId && dto.id) {
        model.id = dto.id;
      }

      // Conditionally include timestamps
      if (includeTimestamps) {
        if (dto.created_at) model.created_at = dto.created_at;
        if (dto.updated_at) model.updated_at = dto.updated_at;
      }

      return model;
    } catch (error) {
      this.logger.error('Error mapping DTO to release model', { error: error.message });
      throw new Error('Failed to map DTO to release model');
    }
  }

  // ========== API Response Mapping ==========

  /**
   * Map to API response format
   */
  toAPIResponse(data, options = {}) {
    if (!data) return null;

    const {
      includeMetadata = true,
      includeAnalytics = false,
      includeDistribution = false,
      format = 'full'
    } = options;

    try {
      if (format === 'summary') {
        return this.toSummaryResponse(data);
      }

      const response = {
        id: data.id,
        title: data.title,
        artist_id: data.artist_id,
        artist_name: data.artist_name,
        release_type: data.release_type,
        genre: data.genre,
        subgenre: data.subgenre,
        release_date: data.release_date,
        status: data.status,
        
        // Identifiers
        upc: data.upc,
        catalog_number: data.catalog_number,
        
        // Commercial
        label_name: data.label_name,
        
        // Artwork
        artwork: data.artwork,
        
        // Tracks summary
        track_count: data.tracks ? data.tracks.length : 0,
        total_duration: this.calculateTotalDuration(data.tracks),
        
        // Status info
        is_released: this.isReleased(data),
        release_status: this.getReleaseStatus(data),
        
        // Timestamps
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Conditional includes
      if (includeMetadata) {
        response.metadata = data.metadata;
      }

      if (includeAnalytics && data.analytics) {
        response.analytics = this.formatAnalyticsForAPI(data.analytics);
      }

      if (includeDistribution && data.distribution) {
        response.distribution = this.formatDistributionForAPI(data.distribution);
      }

      if (data.tracks) {
        response.tracks = data.tracks.map(track => this.formatTrackForAPI(track));
      }

      return response;
    } catch (error) {
      this.logger.error('Error mapping to API response', { error: error.message });
      throw new Error('Failed to map to API response');
    }
  }

  /**
   * Map to summary API response
   */
  toSummaryResponse(data) {
    return {
      id: data.id,
      title: data.title,
      artist_name: data.artist_name,
      release_type: data.release_type,
      genre: data.genre,
      release_date: data.release_date,
      status: data.status,
      track_count: data.tracks ? data.tracks.length : 0,
      artwork_url: data.artwork?.url,
      is_released: this.isReleased(data),
      updated_at: data.updated_at
    };
  }

  // ========== External Platform Mapping ==========

  /**
   * Map to Spotify format
   */
  toSpotifyFormat(data) {
    if (!data) return null;

    try {
      return {
        name: data.title,
        album_type: this.mapReleaseTypeToSpotify(data.release_type),
        artists: this.mapArtistsToSpotify(data.artists),
        release_date: this.formatDateForSpotify(data.release_date),
        release_date_precision: this.getDatePrecision(data.release_date),
        genres: this.mapGenresToSpotify(data.genre, data.subgenre),
        label: data.label_name,
        copyrights: this.mapCopyrightsToSpotify(data),
        external_ids: {
          upc: data.upc
        },
        images: this.mapArtworkToSpotify(data.artwork),
        tracks: {
          items: data.tracks ? data.tracks.map(track => this.mapTrackToSpotify(track)) : []
        }
      };
    } catch (error) {
      this.logger.error('Error mapping to Spotify format', { error: error.message });
      throw new Error('Failed to map to Spotify format');
    }
  }

  /**
   * Map to Apple Music format
   */
  toAppleMusicFormat(data) {
    if (!data) return null;

    try {
      return {
        type: 'albums',
        attributes: {
          name: data.title,
          artistName: data.artist_name,
          albumType: this.mapReleaseTypeToApple(data.release_type),
          genreNames: [data.genre, data.subgenre].filter(Boolean),
          releaseDate: this.formatDateForApple(data.release_date),
          recordLabel: data.label_name,
          copyright: data.copyright_info,
          isExplicit: data.metadata?.explicit_content || false,
          trackCount: data.tracks ? data.tracks.length : 0,
          artwork: this.mapArtworkToApple(data.artwork),
          editorialNotes: {
            standard: data.metadata?.description
          }
        },
        relationships: {
          tracks: {
            data: data.tracks ? data.tracks.map(track => ({
              id: track.id,
              type: 'songs'
            })) : []
          },
          artists: {
            data: data.artists ? data.artists.map(artist => ({
              id: artist.id,
              type: 'artists'
            })) : []
          }
        }
      };
    } catch (error) {
      this.logger.error('Error mapping to Apple Music format', { error: error.message });
      throw new Error('Failed to map to Apple Music format');
    }
  }

  /**
   * Map to YouTube Music format
   */
  toYouTubeMusicFormat(data) {
    if (!data) return null;

    try {
      return {
        title: data.title,
        type: this.mapReleaseTypeToYouTube(data.release_type),
        artists: this.mapArtistsToYouTube(data.artists),
        year: new Date(data.release_date).getFullYear(),
        thumbnails: this.mapArtworkToYouTube(data.artwork),
        description: data.metadata?.description,
        tracks: data.tracks ? data.tracks.map(track => this.mapTrackToYouTube(track)) : [],
        category: 'Music',
        tags: this.generateYouTubeTags(data),
        privacy: 'public',
        metadata: {
          genre: data.genre,
          subgenre: data.subgenre,
          label: data.label_name,
          upc: data.upc,
          explicit: data.metadata?.explicit_content
        }
      };
    } catch (error) {
      this.logger.error('Error mapping to YouTube Music format', { error: error.message });
      throw new Error('Failed to map to YouTube Music format');
    }
  }

  /**
   * Map to Tidal format
   */
  toTidalFormat(data) {
    if (!data) return null;

    try {
      return {
        title: data.title,
        artists: this.mapArtistsToTidal(data.artists),
        type: this.mapReleaseTypeToTidal(data.release_type),
        releaseDate: this.formatDateForTidal(data.release_date),
        numberOfTracks: data.tracks ? data.tracks.length : 0,
        duration: this.calculateTotalDuration(data.tracks),
        explicit: data.metadata?.explicit_content || false,
        upc: data.upc,
        cover: this.mapArtworkToTidal(data.artwork),
        copyright: data.copyright_info,
        genres: this.mapGenresToTidal(data.genre, data.subgenre),
        tracks: data.tracks ? data.tracks.map(track => this.mapTrackToTidal(track)) : [],
        audioQuality: this.determineAudioQuality(data.tracks),
        credits: this.mapCreditsToTidal(data)
      };
    } catch (error) {
      this.logger.error('Error mapping to Tidal format', { error: error.message });
      throw new Error('Failed to map to Tidal format');
    }
  }

  // ========== Search Index Mapping ==========

  /**
   * Map to search index format
   */
  toSearchIndex(data) {
    if (!data) return null;

    try {
      return {
        id: data.id,
        type: 'release',
        title: data.title,
        artist_name: data.artist_name,
        artist_id: data.artist_id,
        release_type: data.release_type,
        genre: data.genre,
        subgenre: data.subgenre,
        release_date: data.release_date,
        release_year: new Date(data.release_date).getFullYear(),
        status: data.status,
        is_released: this.isReleased(data),
        track_count: data.tracks ? data.tracks.length : 0,
        total_duration: this.calculateTotalDuration(data.tracks),
        label_name: data.label_name,
        upc: data.upc,
        explicit_content: data.metadata?.explicit_content,
        territories: data.metadata?.territories,
        
        // Searchable text fields
        searchable_text: this.buildSearchableText(data),
        keywords: this.extractKeywords(data),
        
        // Analytics for ranking
        popularity_score: data.analytics?.popularity_score || 0,
        stream_count: data.analytics?.total_streams || 0,
        
        // Indexing metadata
        indexed_at: new Date().toISOString(),
        boost_score: this.calculateBoostScore(data)
      };
    } catch (error) {
      this.logger.error('Error mapping to search index', { error: error.message });
      throw new Error('Failed to map to search index');
    }
  }

  // ========== Analytics Mapping ==========

  /**
   * Map to analytics format
   */
  toAnalyticsFormat(data) {
    if (!data) return null;

    try {
      return {
        release_id: data.id,
        title: data.title,
        artist_name: data.artist_name,
        release_date: data.release_date,
        genre: data.genre,
        
        // Performance metrics
        metrics: {
          streams: data.analytics?.total_streams || 0,
          downloads: data.analytics?.total_downloads || 0,
          revenue: data.analytics?.total_revenue || 0,
          playlist_additions: data.analytics?.playlist_additions || 0,
          likes: data.analytics?.likes || 0,
          shares: data.analytics?.shares || 0
        },
        
        // Distribution metrics
        distribution: {
          platforms: data.distribution?.platforms?.length || 0,
          territories: data.metadata?.territories?.length || 0,
          stores: data.distribution?.stores?.length || 0
        },
        
        // Engagement metrics
        engagement: {
          completion_rate: data.analytics?.completion_rate || 0,
          skip_rate: data.analytics?.skip_rate || 0,
          repeat_rate: data.analytics?.repeat_rate || 0,
          save_rate: data.analytics?.save_rate || 0
        },
        
        // Time-based metrics
        performance_by_period: this.mapPerformanceByPeriod(data.analytics),
        
        // Demographics
        demographics: this.mapDemographics(data.analytics),
        
        // Calculated insights
        insights: {
          trending_score: this.calculateTrendingScore(data),
          viral_coefficient: this.calculateViralCoefficient(data),
          market_penetration: this.calculateMarketPenetration(data)
        },
        
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error mapping to analytics format', { error: error.message });
      throw new Error('Failed to map to analytics format');
    }
  }

  // ========== Report Mapping ==========

  /**
   * Map to report format
   */
  toReportFormat(data, reportType = 'summary') {
    if (!data) return null;

    try {
      switch (reportType) {
        case 'financial':
          return this.toFinancialReport(data);
        case 'performance':
          return this.toPerformanceReport(data);
        case 'distribution':
          return this.toDistributionReport(data);
        case 'royalty':
          return this.toRoyaltyReport(data);
        default:
          return this.toSummaryReport(data);
      }
    } catch (error) {
      this.logger.error('Error mapping to report format', { error: error.message, reportType });
      throw new Error('Failed to map to report format');
    }
  }

  /**
   * Map to summary report
   */
  toSummaryReport(data) {
    return {
      release_info: {
        id: data.id,
        title: data.title,
        artist: data.artist_name,
        release_date: data.release_date,
        status: data.status,
        genre: data.genre
      },
      content_summary: {
        tracks: data.tracks ? data.tracks.length : 0,
        total_duration: this.formatDuration(this.calculateTotalDuration(data.tracks)),
        explicit_content: data.metadata?.explicit_content || false
      },
      distribution_summary: {
        platforms: data.distribution?.platforms?.length || 0,
        territories: data.metadata?.territories?.length || 0,
        release_status: this.getReleaseStatus(data)
      },
      performance_summary: {
        total_streams: data.analytics?.total_streams || 0,
        total_revenue: data.analytics?.total_revenue || 0,
        top_territory: data.analytics?.top_territory,
        top_platform: data.analytics?.top_platform
      }
    };
  }

  // ========== Helper Methods ==========

  /**
   * Map metadata section
   */
  mapMetadata(dbModel) {
    return {
      description: dbModel.description,
      language: dbModel.language,
      explicit_content: dbModel.explicit_content,
      territories: dbModel.territories ? JSON.parse(dbModel.territories) : [],
      tags: dbModel.tags ? JSON.parse(dbModel.tags) : [],
      mood: dbModel.mood,
      energy_level: dbModel.energy_level,
      danceability: dbModel.danceability,
      external_ids: dbModel.external_ids ? JSON.parse(dbModel.external_ids) : {}
    };
  }

  /**
   * Map artwork section
   */
  mapArtwork(dbModel) {
    if (!dbModel.artwork_url) return null;

    return {
      url: dbModel.artwork_url,
      width: dbModel.artwork_width,
      height: dbModel.artwork_height,
      format: dbModel.artwork_format,
      sizes: this.generateArtworkSizes(dbModel.artwork_url, dbModel.artwork_width, dbModel.artwork_height)
    };
  }

  /**
   * Map tracks for release
   */
  mapTracks(tracks) {
    if (!Array.isArray(tracks)) return [];

    return tracks.map(track => ({
      id: track.id,
      title: track.title,
      track_number: track.track_number,
      duration_ms: track.duration_ms,
      explicit_content: track.explicit_content,
      preview_url: track.preview_url,
      isrc: track.isrc
    }));
  }

  /**
   * Map artists for release
   */
  mapArtists(artists) {
    if (!Array.isArray(artists)) return [];

    return artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      role: artist.role || 'primary',
      verified: artist.verified || false
    }));
  }

  /**
   * Map analytics data
   */
  mapAnalytics(analytics) {
    if (!analytics) return null;

    return {
      total_streams: analytics.total_streams || 0,
      total_downloads: analytics.total_downloads || 0,
      total_revenue: analytics.total_revenue || 0,
      popularity_score: analytics.popularity_score || 0,
      trend_direction: analytics.trend_direction,
      top_territory: analytics.top_territory,
      top_platform: analytics.top_platform,
      last_updated: analytics.updated_at
    };
  }

  /**
   * Map distribution data
   */
  mapDistribution(distribution) {
    if (!distribution) return null;

    return {
      platforms: distribution.platforms || [],
      territories: distribution.territories || [],
      stores: distribution.stores || [],
      status: distribution.status,
      live_date: distribution.live_date,
      takedown_date: distribution.takedown_date
    };
  }

  /**
   * Map splits data
   */
  mapSplits(splits) {
    if (!Array.isArray(splits)) return [];

    return splits.map(split => ({
      id: split.id,
      participant_id: split.participant_id,
      participant_name: split.participant_name,
      percentage: split.percentage,
      role: split.role,
      type: split.type
    }));
  }

  /**
   * Calculate total duration of tracks
   */
  calculateTotalDuration(tracks) {
    if (!Array.isArray(tracks)) return 0;
    
    return tracks.reduce((total, track) => total + (track.duration_ms || 0), 0);
  }

  /**
   * Check if release is released
   */
  isReleased(data) {
    if (data.status !== 'released') return false;
    
    const releaseDate = new Date(data.release_date);
    const now = new Date();
    
    return releaseDate <= now;
  }

  /**
   * Get release status
   */
  getReleaseStatus(data) {
    if (!this.isReleased(data)) {
      return data.status;
    }
    
    return 'live';
  }

  /**
   * Map release type to Spotify format
   */
  mapReleaseTypeToSpotify(releaseType) {
    const mapping = {
      'single': 'single',
      'ep': 'single',
      'album': 'album',
      'compilation': 'compilation'
    };
    
    return mapping[releaseType] || 'album';
  }

  /**
   * Map release type to Apple format
   */
  mapReleaseTypeToApple(releaseType) {
    const mapping = {
      'single': 'Single',
      'ep': 'EP',
      'album': 'Album',
      'compilation': 'Compilation'
    };
    
    return mapping[releaseType] || 'Album';
  }

  /**
   * Format date for Spotify
   */
  formatDateForSpotify(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Format date for Apple
   */
  formatDateForApple(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Get date precision
   */
  getDatePrecision(date) {
    // Could be 'year', 'month', or 'day' based on data quality
    return 'day';
  }

  /**
   * Build searchable text
   */
  buildSearchableText(data) {
    const parts = [
      data.title,
      data.artist_name,
      data.genre,
      data.subgenre,
      data.label_name,
      data.metadata?.description
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Extract keywords
   */
  extractKeywords(data) {
    const keywords = [];
    
    if (data.genre) keywords.push(data.genre.toLowerCase());
    if (data.subgenre) keywords.push(data.subgenre.toLowerCase());
    if (data.release_type) keywords.push(data.release_type);
    if (data.metadata?.explicit_content) keywords.push('explicit');
    
    return keywords;
  }

  /**
   * Calculate boost score for search
   */
  calculateBoostScore(data) {
    let score = 1.0;
    
    // Boost recent releases
    const releaseDate = new Date(data.release_date);
    const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceRelease < 30) score += 0.5;
    else if (daysSinceRelease < 90) score += 0.3;
    
    // Boost popular releases
    if (data.analytics?.popularity_score > 0.8) score += 0.4;
    else if (data.analytics?.popularity_score > 0.6) score += 0.2;
    
    return score;
  }

  /**
   * Format duration to readable string
   */
  formatDuration(durationMs) {
    if (!durationMs) return '0:00';
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Generate artwork sizes
   */
  generateArtworkSizes(baseUrl, width, height) {
    if (!baseUrl) return [];
    
    const sizes = [
      { width: 300, height: 300, url: baseUrl.replace(/\.(jpg|png)$/i, '_300x300.$1') },
      { width: 640, height: 640, url: baseUrl.replace(/\.(jpg|png)$/i, '_640x640.$1') },
      { width: 1200, height: 1200, url: baseUrl.replace(/\.(jpg|png)$/i, '_1200x1200.$1') }
    ];
    
    return sizes;
  }

  /**
   * Calculate trending score
   */
  calculateTrendingScore(data) {
    // Simplified trending calculation
    if (!data.analytics) return 0;
    
    const recentStreams = data.analytics.recent_streams || 0;
    const totalStreams = data.analytics.total_streams || 1;
    
    return Math.min(recentStreams / totalStreams, 1);
  }

  /**
   * Calculate viral coefficient
   */
  calculateViralCoefficient(data) {
    if (!data.analytics) return 0;
    
    const shares = data.analytics.shares || 0;
    const streams = data.analytics.total_streams || 1;
    
    return shares / streams;
  }

  /**
   * Calculate market penetration
   */
  calculateMarketPenetration(data) {
    const territories = data.metadata?.territories?.length || 1;
    const maxTerritories = 195; // Approximate number of countries
    
    return territories / maxTerritories;
  }

  /**
   * Map performance by period
   */
  mapPerformanceByPeriod(analytics) {
    if (!analytics?.performance_by_period) return {};
    
    return analytics.performance_by_period;
  }

  /**
   * Map demographics
   */
  mapDemographics(analytics) {
    if (!analytics?.demographics) return {};
    
    return {
      age_groups: analytics.demographics.age_groups || {},
      gender: analytics.demographics.gender || {},
      locations: analytics.demographics.locations || {}
    };
  }

  /**
   * Format analytics for API
   */
  formatAnalyticsForAPI(analytics) {
    return {
      streams: analytics.total_streams || 0,
      revenue: analytics.total_revenue || 0,
      popularity: analytics.popularity_score || 0,
      trend: analytics.trend_direction || 'stable'
    };
  }

  /**
   * Format distribution for API
   */
  formatDistributionForAPI(distribution) {
    return {
      status: distribution.status,
      platforms: distribution.platforms?.length || 0,
      territories: distribution.territories?.length || 0,
      live_date: distribution.live_date
    };
  }

  /**
   * Format track for API
   */
  formatTrackForAPI(track) {
    return {
      id: track.id,
      title: track.title,
      track_number: track.track_number,
      duration: this.formatDuration(track.duration_ms),
      explicit: track.explicit_content || false
    };
  }

  // ========== Platform-Specific Helper Methods ==========

  /**
   * Map artists to Spotify format
   */
  mapArtistsToSpotify(artists) {
    if (!Array.isArray(artists)) return [];
    
    return artists.map(artist => ({
      name: artist.name,
      external_urls: {},
      uri: `spotify:artist:${artist.id}`
    }));
  }

  /**
   * Map copyrights to Spotify format
   */
  mapCopyrightsToSpotify(data) {
    const copyrights = [];
    
    if (data.copyright_info) {
      copyrights.push({
        text: data.copyright_info,
        type: 'C'
      });
    }
    
    if (data.phonographic_copyright) {
      copyrights.push({
        text: data.phonographic_copyright,
        type: 'P'
      });
    }
    
    return copyrights;
  }

  /**
   * Map artwork to Spotify format
   */
  mapArtworkToSpotify(artwork) {
    if (!artwork) return [];
    
    return [
      {
        height: artwork.height || 640,
        width: artwork.width || 640,
        url: artwork.url
      }
    ];
  }

  /**
   * Additional platform-specific mapping methods would go here...
   */
  
  /**
   * Batch transform operations
   */
  batchTransform(items, transformFn, options = {}) {
    if (!Array.isArray(items)) return [];
    
    const { batchSize = 100, parallel = false } = options;
    
    if (parallel && items.length > batchSize) {
      // Process in parallel batches
      const batches = [];
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }
      
      return Promise.all(
        batches.map(batch => 
          Promise.all(batch.map(item => transformFn(item)))
        )
      ).then(results => results.flat());
    }
    
    return items.map(transformFn);
  }
}

module.exports = ReleaseMapper;
