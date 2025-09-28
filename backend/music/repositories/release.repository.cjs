/**
 * Release Repository
 * Advanced data access layer for release entities with complex relationships
 * Handles all database operations for release management, distribution, and analytics
 */

const { supabase } = require('../../db.cjs');
const logger = require('../../config/logger.cjs');

class ReleaseRepository {
  constructor() {
    this.tableName = 'releases';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ========== Basic CRUD Operations ==========

  /**
   * Create new release with validation and relationship setup
   */
  async create(releaseData) {
    try {
      const releaseToCreate = {
        release_id: releaseData.release_id,
        title: releaseData.title,
        type: releaseData.type || 'single',
        artist_id: releaseData.artist_id,
        label_id: releaseData.label_id || null,
        release_date: releaseData.release_date,
        original_release_date: releaseData.original_release_date || releaseData.release_date,
        status: releaseData.status || 'draft',
        upc: releaseData.upc || null,
        catalog_number: releaseData.catalog_number || null,
        format: releaseData.format || 'digital',
        genre: releaseData.genre || 'Unknown',
        subgenre: releaseData.subgenre || null,
        language: releaseData.language || 'en',
        explicit_content: releaseData.explicit_content || false,
        compilation: releaseData.compilation || false,
        soundtrack: releaseData.soundtrack || false,
        live_recording: releaseData.live_recording || false,
        remaster: releaseData.remaster || false,
        deluxe_edition: releaseData.deluxe_edition || false,
        description: releaseData.description || null,
        liner_notes: releaseData.liner_notes || null,
        recording_location: releaseData.recording_location || null,
        recording_date_start: releaseData.recording_date_start || null,
        recording_date_end: releaseData.recording_date_end || null,
        producer: releaseData.producer || null,
        executive_producer: releaseData.executive_producer || null,
        mastered_by: releaseData.mastered_by || null,
        mixed_by: releaseData.mixed_by || null,
        artwork_credits: releaseData.artwork_credits || null,
        copyright_notice: releaseData.copyright_notice || null,
        phonographic_copyright: releaseData.phonographic_copyright || null,
        territory_restrictions: releaseData.territory_restrictions || [],
        price_category: releaseData.price_category || 'standard',
        pre_order_date: releaseData.pre_order_date || null,
        promotional: releaseData.promotional || false,
        limited_edition: releaseData.limited_edition || false,
        edition_size: releaseData.edition_size || null,
        physical_format_details: releaseData.physical_format_details || {},
        digital_format_details: releaseData.digital_format_details || {},
        distribution_strategy: releaseData.distribution_strategy || 'standard',
        marketing_tags: releaseData.marketing_tags || [],
        mood_tags: releaseData.mood_tags || [],
        theme_tags: releaseData.theme_tags || [],
        social_media_assets: releaseData.social_media_assets || {},
        press_kit_url: releaseData.press_kit_url || null,
        streaming_preview_enabled: releaseData.streaming_preview_enabled !== false,
        download_enabled: releaseData.download_enabled !== false,
        sync_licensing_available: releaseData.sync_licensing_available !== false,
        metadata: releaseData.metadata || {},
        created_by: releaseData.created_by,
        updated_by: releaseData.created_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([releaseToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create release', { error: error.message, releaseData });
        throw new Error(`Release creation failed: ${error.message}`);
      }

      logger.info('Release created successfully', { 
        releaseId: data.release_id,
        title: data.title,
        artist: data.artist_id 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Release creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Find release by ID with related data
   */
  async findById(releaseId, options = {}) {
    try {
      const {
        includeTracks = false,
        includeArtist = false,
        includeLabel = false,
        includeDistribution = false,
        includeAnalytics = false
      } = options;

      const cacheKey = `release_${releaseId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('release_id', releaseId)
        .single();

      const { data: release, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('Failed to find release by ID', { error: error.message, releaseId });
        throw new Error(`Release lookup failed: ${error.message}`);
      }

      if (!release) return null;

      // Add related data if requested
      if (includeArtist) {
        release.artist = await this.getReleaseArtist(release.artist_id);
      }

      if (includeLabel && release.label_id) {
        release.label = await this.getReleaseLabel(release.label_id);
      }

      if (includeTracks) {
        release.tracks = await this.getReleaseTracks(releaseId);
      }

      if (includeDistribution) {
        release.distribution = await this.getReleaseDistribution(releaseId);
      }

      if (includeAnalytics) {
        release.analytics = await this.getReleaseAnalytics(releaseId);
      }

      this.setCache(cacheKey, release);
      return release;
    } catch (error) {
      logger.error('Release lookup error', { error: error.message, releaseId });
      throw error;
    }
  }

  /**
   * Find releases with advanced filtering
   */
  async findMany(filters = {}, options = {}) {
    try {
      const {
        artist_id,
        label_id,
        type,
        status,
        genre,
        release_date_after,
        release_date_before,
        format,
        explicit_content,
        compilation,
        promotional,
        territory,
        title_search
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'release_date',
        sortOrder = 'desc',
        includeCount = false
      } = options;

      const offset = (page - 1) * limit;

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (artist_id) {
        query = query.eq('artist_id', artist_id);
      }

      if (label_id) {
        query = query.eq('label_id', label_id);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (genre) {
        query = query.eq('genre', genre);
      }

      if (release_date_after) {
        query = query.gte('release_date', release_date_after);
      }

      if (release_date_before) {
        query = query.lte('release_date', release_date_before);
      }

      if (format) {
        query = query.eq('format', format);
      }

      if (explicit_content !== undefined) {
        query = query.eq('explicit_content', explicit_content);
      }

      if (compilation !== undefined) {
        query = query.eq('compilation', compilation);
      }

      if (promotional !== undefined) {
        query = query.eq('promotional', promotional);
      }

      if (territory) {
        query = query.not('territory_restrictions', 'cs', `{${territory}}`);
      }

      if (title_search) {
        query = query.ilike('title', `%${title_search}%`);
      }

      // Apply sorting
      const validSortFields = ['release_date', 'created_at', 'updated_at', 'title', 'type'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'release_date';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to find releases', { error: error.message, filters });
        throw new Error(`Releases search failed: ${error.message}`);
      }

      const result = {
        data: data || [],
        pagination: this.buildPaginationInfo(page, limit, count)
      };

      if (includeCount) {
        result.count = count;
      }

      return result;
    } catch (error) {
      logger.error('Releases search error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update release with validation
   */
  async update(releaseId, updateData, currentVersion = null) {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: updateData.updated_by
      };

      // Remove fields that shouldn't be updated directly
      delete updatePayload.release_id;
      delete updatePayload.created_at;
      delete updatePayload.created_by;

      let query = supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('release_id', releaseId);

      // Add optimistic locking if version provided
      if (currentVersion) {
        query = query.eq('updated_at', currentVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Release not found or version conflict');
        }
        logger.error('Failed to update release', { error: error.message, releaseId });
        throw new Error(`Release update failed: ${error.message}`);
      }

      logger.info('Release updated successfully', { 
        releaseId,
        updatedFields: Object.keys(updateData) 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Release update error', { error: error.message, releaseId });
      throw error;
    }
  }

  /**
   * Delete release with cascade handling
   */
  async delete(releaseId, deletedBy) {
    try {
      // Check for dependencies
      const dependencies = await this.checkDependencies(releaseId);
      if (dependencies.hasActive) {
        throw new Error(`Cannot delete release: has active ${dependencies.types.join(', ')}`);
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy,
          updated_at: new Date().toISOString(),
          updated_by: deletedBy
        })
        .eq('release_id', releaseId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to delete release', { error: error.message, releaseId });
        throw new Error(`Release deletion failed: ${error.message}`);
      }

      logger.info('Release deleted successfully', { releaseId, deletedBy });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Release deletion error', { error: error.message, releaseId });
      throw error;
    }
  }

  // ========== Advanced Queries ==========

  /**
   * Get upcoming releases for promotion planning
   */
  async getUpcomingReleases(daysAhead = 30, options = {}) {
    try {
      const { includeArtist = true, limit = 50 } = options;
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + daysAhead);

      let query = supabase
        .from(this.tableName)
        .select(includeArtist ? `
          *,
          artists:artist_id (
            artist_id,
            name,
            profile_image_url,
            verification_status
          )
        ` : '*')
        .gte('release_date', startDate.toISOString())
        .lte('release_date', endDate.toISOString())
        .in('status', ['scheduled', 'pre_order', 'mastered'])
        .order('release_date')
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get upcoming releases', { error: error.message });
        throw new Error(`Upcoming releases lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Upcoming releases error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get releases by status with distribution information
   */
  async getReleasesByStatus(status, options = {}) {
    try {
      const { includeDistribution = false, limit = 100 } = options;

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          artists:artist_id (
            artist_id,
            name,
            verification_status
          )
          ${includeDistribution ? ',distribution_channels:distribution_channels!inner(*)' : ''}
        `)
        .eq('status', status)
        .order('updated_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get releases by status', { error: error.message, status });
        throw new Error(`Status releases lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Status releases error', { error: error.message, status });
      throw error;
    }
  }

  /**
   * Search releases with full-text capabilities
   */
  async searchReleases(searchTerm, options = {}) {
    try {
      const {
        limit = 20,
        includeArtist = true,
        includeInactive = false,
        fuzzyMatch = true
      } = options;

      let releases = [];

      // Primary search on titles
      const { data: titleMatches, error: titleError } = await supabase
        .from(this.tableName)
        .select(includeArtist ? `
          *,
          artists:artist_id (
            artist_id,
            name,
            profile_image_url
          )
        ` : '*')
        .ilike('title', `%${searchTerm}%`)
        .neq('status', includeInactive ? 'none' : 'deleted')
        .order('release_date', { ascending: false })
        .limit(limit);

      if (!titleError && titleMatches) {
        releases = titleMatches;
      }

      // Search by artist name if we have fewer results
      if (releases.length < limit && includeArtist) {
        const remainingLimit = limit - releases.length;
        const existingIds = releases.map(r => r.release_id);

        const { data: artistMatches, error: artistError } = await supabase
          .from(this.tableName)
          .select(`
            *,
            artists:artist_id!inner (
              artist_id,
              name,
              profile_image_url
            )
          `)
          .ilike('artists.name', `%${searchTerm}%`)
          .not('release_id', 'in', `(${existingIds.join(',')})`)
          .neq('status', includeInactive ? 'none' : 'deleted')
          .limit(remainingLimit);

        if (!artistError && artistMatches) {
          releases = [...releases, ...artistMatches];
        }
      }

      // Add relevance scoring
      return releases.map(release => ({
        ...release,
        relevance_score: this.calculateReleaseRelevanceScore(release, searchTerm)
      })).sort((a, b) => b.relevance_score - a.relevance_score);

    } catch (error) {
      logger.error('Release search error', { error: error.message, searchTerm });
      throw error;
    }
  }

  /**
   * Get release statistics for dashboard
   */
  async getReleaseStatistics(timeframe = '30d') {
    try {
      const startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const [totalReleases, recentReleases, statusCounts, typeCounts] = await Promise.all([
        // Total releases count
        supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .neq('status', 'deleted'),
        
        // Recent releases
        supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .neq('status', 'deleted'),
        
        // Status distribution
        supabase.rpc('get_release_status_counts'),
        
        // Type distribution
        supabase.rpc('get_release_type_counts')
      ]);

      return {
        total_releases: totalReleases.count || 0,
        recent_releases: recentReleases.count || 0,
        status_distribution: statusCounts.data || [],
        type_distribution: typeCounts.data || [],
        timeframe,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Release statistics error', { error: error.message });
      return {
        total_releases: 0,
        recent_releases: 0,
        status_distribution: [],
        type_distribution: [],
        timeframe,
        generated_at: new Date().toISOString()
      };
    }
  }

  // ========== Related Data Methods ==========

  /**
   * Get release artist information
   */
  async getReleaseArtist(artistId) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('artist_id, name, profile_image_url, verification_status, social_links')
        .eq('artist_id', artistId)
        .single();

      if (error) {
        logger.error('Failed to get release artist', { error: error.message, artistId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Release artist error', { error: error.message, artistId });
      return null;
    }
  }

  /**
   * Get release label information
   */
  async getReleaseLabel(labelId) {
    try {
      const { data, error } = await supabase
        .from('labels')
        .select('label_id, name, type, logo_url, website_url')
        .eq('label_id', labelId)
        .single();

      if (error) {
        logger.error('Failed to get release label', { error: error.message, labelId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Release label error', { error: error.message, labelId });
      return null;
    }
  }

  /**
   * Get tracks for a release
   */
  async getReleaseTracks(releaseId) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          track_contributors:track_contributors (
            role,
            artist_id,
            artists:artist_id (
              name
            )
          )
        `)
        .eq('release_id', releaseId)
        .order('track_number');

      if (error) {
        logger.error('Failed to get release tracks', { error: error.message, releaseId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Release tracks error', { error: error.message, releaseId });
      return [];
    }
  }

  /**
   * Get distribution channels for release
   */
  async getReleaseDistribution(releaseId) {
    try {
      const { data, error } = await supabase
        .from('distribution_channels')
        .select(`
          *,
          channel_releases:channel_releases (
            status,
            distributed_at,
            takedown_at,
            external_id,
            external_url
          )
        `)
        .eq('channel_releases.release_id', releaseId);

      if (error) {
        logger.error('Failed to get release distribution', { error: error.message, releaseId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Release distribution error', { error: error.message, releaseId });
      return [];
    }
  }

  /**
   * Get analytics for release
   */
  async getReleaseAnalytics(releaseId, timeframe = '30d') {
    try {
      // Mock analytics - would integrate with real analytics tables
      const mockAnalytics = {
        total_streams: Math.floor(Math.random() * 100000),
        total_downloads: Math.floor(Math.random() * 10000),
        unique_listeners: Math.floor(Math.random() * 50000),
        revenue_generated: Math.floor(Math.random() * 5000),
        top_territories: ['US', 'UK', 'CA', 'AU', 'DE'],
        platform_breakdown: {
          spotify: Math.floor(Math.random() * 40000),
          apple_music: Math.floor(Math.random() * 30000),
          youtube_music: Math.floor(Math.random() * 20000),
          other: Math.floor(Math.random() * 10000)
        },
        timeframe,
        last_updated: new Date().toISOString()
      };

      return mockAnalytics;
    } catch (error) {
      logger.error('Release analytics error', { error: error.message, releaseId });
      return null;
    }
  }

  // ========== Helper Methods ==========

  /**
   * Check release dependencies before deletion
   */
  async checkDependencies(releaseId) {
    try {
      const [tracks, distributions, royalties] = await Promise.all([
        supabase.from('tracks').select('track_id').eq('release_id', releaseId).neq('status', 'deleted'),
        supabase.from('channel_releases').select('id').eq('release_id', releaseId),
        supabase.from('royalty_statements').select('id').eq('release_id', releaseId)
      ]);

      const hasTracks = tracks.data && tracks.data.length > 0;
      const hasDistributions = distributions.data && distributions.data.length > 0;
      const hasRoyalties = royalties.data && royalties.data.length > 0;

      const types = [];
      if (hasTracks) types.push('tracks');
      if (hasDistributions) types.push('distributions');
      if (hasRoyalties) types.push('royalties');

      return {
        hasActive: types.length > 0,
        types,
        counts: {
          tracks: tracks.data?.length || 0,
          distributions: distributions.data?.length || 0,
          royalties: royalties.data?.length || 0
        }
      };
    } catch (error) {
      logger.error('Dependency check error', { error: error.message, releaseId });
      return { hasActive: true, types: ['unknown'], counts: {} };
    }
  }

  /**
   * Calculate search relevance score for releases
   */
  calculateReleaseRelevanceScore(release, searchTerm) {
    let score = 0;
    const term = searchTerm.toLowerCase();
    const title = release.title?.toLowerCase() || '';
    const artistName = release.artists?.name?.toLowerCase() || '';

    // Title matching
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 80;
    else if (title.includes(term)) score += 60;

    // Artist name matching
    if (artistName === term) score += 90;
    else if (artistName.startsWith(term)) score += 70;
    else if (artistName.includes(term)) score += 50;

    // Genre/subgenre matches
    if (release.genre?.toLowerCase().includes(term)) score += 20;
    if (release.subgenre?.toLowerCase().includes(term)) score += 15;

    // Description mentions
    if (release.description?.toLowerCase().includes(term)) score += 10;

    // Recent releases bonus
    const releaseDate = new Date(release.release_date);
    const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRelease <= 30) score += 5;

    return score;
  }

  /**
   * Build pagination information
   */
  buildPaginationInfo(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      current_page: page,
      per_page: limit,
      total_count: totalCount,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
      next_page: page < totalPages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null
    };
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidateCache() {
    this.cache.clear();
  }

  /**
   * Batch operations for bulk processing
   */
  async batchCreate(releasesData) {
    try {
      const releasesToCreate = releasesData.map(release => ({
        ...release,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(releasesToCreate)
        .select();

      if (error) {
        logger.error('Batch release creation failed', { error: error.message });
        throw new Error(`Batch creation failed: ${error.message}`);
      }

      logger.info('Releases batch created successfully', { count: data.length });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Batch release creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update release status with validation
   */
  async updateStatus(releaseId, newStatus, updatedBy, notes = null) {
    try {
      // Validate status transition
      const currentRelease = await this.findById(releaseId);
      if (!currentRelease) {
        throw new Error('Release not found');
      }

      const validTransitions = this.getValidStatusTransitions(currentRelease.status);
      if (!validTransitions.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${currentRelease.status} to ${newStatus}`);
      }

      const updatePayload = {
        status: newStatus,
        status_updated_at: new Date().toISOString(),
        status_updated_by: updatedBy,
        status_notes: notes,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      // Add specific fields for certain status changes
      if (newStatus === 'released') {
        updatePayload.released_at = new Date().toISOString();
      } else if (newStatus === 'withdrawn') {
        updatePayload.withdrawn_at = new Date().toISOString();
        updatePayload.withdrawal_reason = notes;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('release_id', releaseId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update release status', { error: error.message, releaseId });
        throw new Error(`Status update failed: ${error.message}`);
      }

      logger.info('Release status updated', { 
        releaseId,
        fromStatus: currentRelease.status,
        toStatus: newStatus,
        updatedBy 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Release status update error', { error: error.message, releaseId });
      throw error;
    }
  }

  /**
   * Get valid status transitions
   */
  getValidStatusTransitions(currentStatus) {
    const transitions = {
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

    return transitions[currentStatus] || [];
  }
}

module.exports = ReleaseRepository;
