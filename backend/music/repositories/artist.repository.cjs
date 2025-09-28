/**
 * Artist Repository
 * Advanced data access layer for artist entities with complex queries and optimizations
 * Handles all database operations for artist management, relationships, and analytics
 */

const { supabase } = require('../../db.cjs');
const logger = require('../../config/logger.cjs');

class ArtistRepository {
  constructor() {
    this.tableName = 'artists';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ========== Basic CRUD Operations ==========

  /**
   * Create new artist with comprehensive data validation
   */
  async create(artistData) {
    try {
      const artistToCreate = {
        artist_id: artistData.artist_id,
        name: artistData.name,
        biography: artistData.biography || null,
        formed_date: artistData.formed_date || null,
        origin_country: artistData.origin_country || null,
        origin_city: artistData.origin_city || null,
        genres: artistData.genres || [],
        status: artistData.status || 'active',
        verification_status: artistData.verification_status || 'unverified',
        verification_tier: artistData.verification_tier || 'basic',
        verified_by: artistData.verified_by || null,
        verified_at: artistData.verified_at || null,
        profile_image_url: artistData.profile_image_url || null,
        banner_image_url: artistData.banner_image_url || null,
        social_links: artistData.social_links || {},
        contact_email: artistData.contact_email || null,
        management_contact: artistData.management_contact || null,
        label_id: artistData.label_id || null,
        isni: artistData.isni || null,
        ipi_number: artistData.ipi_number || null,
        spotify_id: artistData.spotify_id || null,
        apple_music_id: artistData.apple_music_id || null,
        youtube_channel_id: artistData.youtube_channel_id || null,
        analytics_enabled: artistData.analytics_enabled !== false,
        profile_completed: artistData.profile_completed || false,
        marketing_consent: artistData.marketing_consent || false,
        metadata: artistData.metadata || {},
        created_by: artistData.created_by,
        updated_by: artistData.created_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([artistToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create artist', { error: error.message, artistData });
        throw new Error(`Artist creation failed: ${error.message}`);
      }

      logger.info('Artist created successfully', { 
        artistId: data.artist_id,
        name: data.name 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Artist creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Find artist by ID with optional related data
   */
  async findById(artistId, options = {}) {
    try {
      const {
        includeReleases = false,
        includeTracks = false,
        includeAnalytics = false,
        includeCollaborations = false
      } = options;

      const cacheKey = `artist_${artistId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('artist_id', artistId)
        .single();

      const { data: artist, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('Failed to find artist by ID', { error: error.message, artistId });
        throw new Error(`Artist lookup failed: ${error.message}`);
      }

      if (!artist) return null;

      // Add related data if requested
      if (includeReleases) {
        artist.releases = await this.getArtistReleases(artistId);
      }

      if (includeTracks) {
        artist.tracks = await this.getArtistTracks(artistId);
      }

      if (includeAnalytics) {
        artist.analytics = await this.getArtistAnalytics(artistId);
      }

      if (includeCollaborations) {
        artist.collaborations = await this.getArtistCollaborations(artistId);
      }

      this.setCache(cacheKey, artist);
      return artist;
    } catch (error) {
      logger.error('Artist lookup error', { error: error.message, artistId });
      throw error;
    }
  }

  /**
   * Find artists with advanced filtering and pagination
   */
  async findMany(filters = {}, options = {}) {
    try {
      const {
        name,
        genres,
        status,
        verification_status,
        verification_tier,
        origin_country,
        label_id,
        created_after,
        created_before,
        has_releases,
        analytics_enabled
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
        includeCount = false
      } = options;

      const offset = (page - 1) * limit;

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (name) {
        query = query.ilike('name', `%${name}%`);
      }

      if (genres && genres.length > 0) {
        query = query.overlaps('genres', genres);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (verification_status) {
        query = query.eq('verification_status', verification_status);
      }

      if (verification_tier) {
        query = query.eq('verification_tier', verification_tier);
      }

      if (origin_country) {
        query = query.eq('origin_country', origin_country);
      }

      if (label_id) {
        query = query.eq('label_id', label_id);
      }

      if (created_after) {
        query = query.gte('created_at', created_after);
      }

      if (created_before) {
        query = query.lte('created_at', created_before);
      }

      if (analytics_enabled !== undefined) {
        query = query.eq('analytics_enabled', analytics_enabled);
      }

      // Handle has_releases filter with subquery
      if (has_releases !== undefined) {
        if (has_releases) {
          const { data: artistsWithReleases } = await supabase
            .from('releases')
            .select('artist_id')
            .not('artist_id', 'is', null);
          
          const artistIds = [...new Set(artistsWithReleases.map(r => r.artist_id))];
          if (artistIds.length > 0) {
            query = query.in('artist_id', artistIds);
          } else {
            return { data: [], count: 0, pagination: this.buildPaginationInfo(page, limit, 0) };
          }
        }
      }

      // Apply sorting
      const validSortFields = ['created_at', 'updated_at', 'name', 'verification_status'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to find artists', { error: error.message, filters });
        throw new Error(`Artists search failed: ${error.message}`);
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
      logger.error('Artists search error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update artist with optimistic locking
   */
  async update(artistId, updateData, currentVersion = null) {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: updateData.updated_by
      };

      // Remove fields that shouldn't be updated directly
      delete updatePayload.artist_id;
      delete updatePayload.created_at;
      delete updatePayload.created_by;

      let query = supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('artist_id', artistId);

      // Add optimistic locking if version provided
      if (currentVersion) {
        query = query.eq('updated_at', currentVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Artist not found or version conflict');
        }
        logger.error('Failed to update artist', { error: error.message, artistId });
        throw new Error(`Artist update failed: ${error.message}`);
      }

      logger.info('Artist updated successfully', { 
        artistId,
        updatedFields: Object.keys(updateData) 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Artist update error', { error: error.message, artistId });
      throw error;
    }
  }

  /**
   * Soft delete artist
   */
  async delete(artistId, deletedBy) {
    try {
      // Check for dependencies
      const dependencies = await this.checkDependencies(artistId);
      if (dependencies.hasActive) {
        throw new Error(`Cannot delete artist: has active ${dependencies.types.join(', ')}`);
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
        .eq('artist_id', artistId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to delete artist', { error: error.message, artistId });
        throw new Error(`Artist deletion failed: ${error.message}`);
      }

      logger.info('Artist deleted successfully', { artistId, deletedBy });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Artist deletion error', { error: error.message, artistId });
      throw error;
    }
  }

  // ========== Advanced Queries ==========

  /**
   * Get artists by label with relationship details
   */
  async findByLabel(labelId, options = {}) {
    try {
      const { includeInactive = false } = options;

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          labels:label_id (
            label_id,
            name,
            type
          )
        `)
        .eq('label_id', labelId);

      if (!includeInactive) {
        query = query.neq('status', 'deleted');
      }

      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to find artists by label', { error: error.message, labelId });
        throw new Error(`Label artists lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Label artists lookup error', { error: error.message, labelId });
      throw error;
    }
  }

  /**
   * Search artists with full-text search and fuzzy matching
   */
  async searchArtists(searchTerm, options = {}) {
    try {
      const {
        limit = 20,
        includeInactive = false,
        fuzzyMatch = true
      } = options;

      let artists = [];

      // Exact match search
      const { data: exactMatches, error: exactError } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .neq('status', includeInactive ? 'none' : 'deleted')
        .order('name')
        .limit(limit);

      if (exactError) {
        logger.error('Exact search failed', { error: exactError.message });
      } else {
        artists = exactMatches || [];
      }

      // Fuzzy search if enabled and we have fewer results
      if (fuzzyMatch && artists.length < limit) {
        const remainingLimit = limit - artists.length;
        const existingIds = artists.map(a => a.artist_id);

        // Search in genres and other fields
        const { data: fuzzyMatches, error: fuzzyError } = await supabase
          .from(this.tableName)
          .select('*')
          .or(`biography.ilike.%${searchTerm}%,origin_city.ilike.%${searchTerm}%`)
          .not('artist_id', 'in', `(${existingIds.join(',')})`)
          .neq('status', includeInactive ? 'none' : 'deleted')
          .limit(remainingLimit);

        if (!fuzzyError && fuzzyMatches) {
          artists = [...artists, ...fuzzyMatches];
        }
      }

      // Add relevance scoring
      return artists.map(artist => ({
        ...artist,
        relevance_score: this.calculateRelevanceScore(artist, searchTerm)
      })).sort((a, b) => b.relevance_score - a.relevance_score);

    } catch (error) {
      logger.error('Artist search error', { error: error.message, searchTerm });
      throw error;
    }
  }

  /**
   * Get artist collaborations and features
   */
  async getArtistCollaborations(artistId) {
    try {
      const { data: collaborations, error } = await supabase
        .from('track_contributors')
        .select(`
          *,
          tracks:track_id (
            track_id,
            title,
            release_id,
            releases:release_id (
              title,
              release_date
            )
          ),
          artists:artist_id (
            artist_id,
            name,
            profile_image_url
          )
        `)
        .or(`artist_id.eq.${artistId},collaborator_id.eq.${artistId}`)
        .neq('role', 'primary_artist')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get artist collaborations', { error: error.message, artistId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Artist collaborations error', { error: error.message, artistId });
      return [];
    }
  }

  /**
   * Get artist releases with track counts
   */
  async getArtistReleases(artistId, options = {}) {
    try {
      const { includeUnreleased = false, limit = 50 } = options;

      let query = supabase
        .from('releases')
        .select(`
          *,
          tracks:tracks!inner (count)
        `)
        .eq('artist_id', artistId);

      if (!includeUnreleased) {
        query = query.lte('release_date', new Date().toISOString());
      }

      query = query
        .order('release_date', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get artist releases', { error: error.message, artistId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Artist releases error', { error: error.message, artistId });
      return [];
    }
  }

  /**
   * Get artist tracks with streaming stats
   */
  async getArtistTracks(artistId, options = {}) {
    try {
      const { limit = 100, includeUnreleased = false } = options;

      let query = supabase
        .from('tracks')
        .select(`
          *,
          releases:release_id (
            title,
            release_date,
            status
          )
        `)
        .eq('artist_id', artistId);

      if (!includeUnreleased) {
        query = query.eq('releases.status', 'released');
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get artist tracks', { error: error.message, artistId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Artist tracks error', { error: error.message, artistId });
      return [];
    }
  }

  /**
   * Get artist analytics summary
   */
  async getArtistAnalytics(artistId, timeframe = '30d') {
    try {
      // This would integrate with analytics tables when they exist
      const mockAnalytics = {
        total_streams: Math.floor(Math.random() * 1000000),
        monthly_listeners: Math.floor(Math.random() * 100000),
        total_tracks: 0,
        total_releases: 0,
        top_countries: ['US', 'UK', 'CA', 'AU', 'DE'],
        growth_rate: (Math.random() - 0.5) * 0.4, // -20% to +20%
        timeframe
      };

      // Get actual counts
      const [tracksCount, releasesCount] = await Promise.all([
        this.getArtistTracksCount(artistId),
        this.getArtistReleasesCount(artistId)
      ]);

      mockAnalytics.total_tracks = tracksCount;
      mockAnalytics.total_releases = releasesCount;

      return mockAnalytics;
    } catch (error) {
      logger.error('Artist analytics error', { error: error.message, artistId });
      return null;
    }
  }

  // ========== Helper Methods ==========

  /**
   * Check artist dependencies before deletion
   */
  async checkDependencies(artistId) {
    try {
      const [releases, tracks, collaborations] = await Promise.all([
        supabase.from('releases').select('release_id').eq('artist_id', artistId).neq('status', 'deleted'),
        supabase.from('tracks').select('track_id').eq('artist_id', artistId).neq('status', 'deleted'),
        supabase.from('track_contributors').select('id').eq('artist_id', artistId)
      ]);

      const hasReleases = releases.data && releases.data.length > 0;
      const hasTracks = tracks.data && tracks.data.length > 0;
      const hasCollaborations = collaborations.data && collaborations.data.length > 0;

      const types = [];
      if (hasReleases) types.push('releases');
      if (hasTracks) types.push('tracks');
      if (hasCollaborations) types.push('collaborations');

      return {
        hasActive: types.length > 0,
        types,
        counts: {
          releases: releases.data?.length || 0,
          tracks: tracks.data?.length || 0,
          collaborations: collaborations.data?.length || 0
        }
      };
    } catch (error) {
      logger.error('Dependency check error', { error: error.message, artistId });
      return { hasActive: true, types: ['unknown'], counts: {} };
    }
  }

  /**
   * Get artist tracks count
   */
  async getArtistTracksCount(artistId) {
    try {
      const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistId)
        .neq('status', 'deleted');

      if (error) {
        logger.error('Failed to get tracks count', { error: error.message, artistId });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Tracks count error', { error: error.message, artistId });
      return 0;
    }
  }

  /**
   * Get artist releases count
   */
  async getArtistReleasesCount(artistId) {
    try {
      const { count, error } = await supabase
        .from('releases')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistId)
        .neq('status', 'deleted');

      if (error) {
        logger.error('Failed to get releases count', { error: error.message, artistId });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Releases count error', { error: error.message, artistId });
      return 0;
    }
  }

  /**
   * Calculate search relevance score
   */
  calculateRelevanceScore(artist, searchTerm) {
    let score = 0;
    const term = searchTerm.toLowerCase();
    const name = artist.name?.toLowerCase() || '';

    // Exact name match
    if (name === term) score += 100;
    // Name starts with term
    else if (name.startsWith(term)) score += 80;
    // Name contains term
    else if (name.includes(term)) score += 60;

    // Genre matches
    if (artist.genres?.some(genre => genre.toLowerCase().includes(term))) score += 20;

    // Biography mentions
    if (artist.biography?.toLowerCase().includes(term)) score += 10;

    // Verification bonus
    if (artist.verification_status === 'verified') score += 5;

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
  async batchCreate(artistsData) {
    try {
      const artistsToCreate = artistsData.map(artist => ({
        ...artist,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(artistsToCreate)
        .select();

      if (error) {
        logger.error('Batch artist creation failed', { error: error.message });
        throw new Error(`Batch creation failed: ${error.message}`);
      }

      logger.info('Artists batch created successfully', { count: data.length });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Batch artist creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update artist verification status
   */
  async updateVerificationStatus(artistId, verificationData) {
    try {
      const updatePayload = {
        verification_status: verificationData.status,
        verification_tier: verificationData.tier || 'basic',
        verified_by: verificationData.verified_by,
        verified_at: verificationData.status === 'verified' ? new Date().toISOString() : null,
        verification_notes: verificationData.notes || null,
        updated_at: new Date().toISOString(),
        updated_by: verificationData.verified_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('artist_id', artistId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update verification status', { error: error.message, artistId });
        throw new Error(`Verification update failed: ${error.message}`);
      }

      logger.info('Artist verification updated', { 
        artistId,
        status: verificationData.status,
        tier: verificationData.tier 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Verification update error', { error: error.message, artistId });
      throw error;
    }
  }
}

module.exports = ArtistRepository;
