/**
 * Track Repository
 * Advanced data access layer for track entities with audio file management
 * Handles all database operations for track management, metadata, and content
 */

const { supabase } = require('../../db.cjs');
const logger = require('../../config/logger.cjs');

class TrackRepository {
  constructor() {
    this.tableName = 'tracks';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ========== Basic CRUD Operations ==========

  /**
   * Create new track with comprehensive metadata
   */
  async create(trackData) {
    try {
      const trackToCreate = {
        track_id: trackData.track_id,
        release_id: trackData.release_id,
        title: trackData.title,
        version: trackData.version || null,
        track_number: trackData.track_number,
        disc_number: trackData.disc_number || 1,
        duration_ms: trackData.duration_ms,
        explicit_content: trackData.explicit_content || false,
        isrc: trackData.isrc || null,
        genre: trackData.genre || 'Unknown',
        subgenre: trackData.subgenre || null,
        mood: trackData.mood || null,
        tempo_bpm: trackData.tempo_bpm || null,
        key_signature: trackData.key_signature || null,
        time_signature: trackData.time_signature || '4/4',
        language: trackData.language || 'en',
        lyrics: trackData.lyrics || null,
        lyrics_language: trackData.lyrics_language || trackData.language || 'en',
        instrumental: trackData.instrumental || false,
        karaoke_version: trackData.karaoke_version || false,
        acoustic_version: trackData.acoustic_version || false,
        live_recording: trackData.live_recording || false,
        remix: trackData.remix || false,
        cover_version: trackData.cover_version || false,
        medley: trackData.medley || false,
        recording_date: trackData.recording_date || null,
        recording_location: trackData.recording_location || null,
        recording_studio: trackData.recording_studio || null,
        recording_engineer: trackData.recording_engineer || null,
        producer: trackData.producer || null,
        mixer: trackData.mixer || null,
        mastering_engineer: trackData.mastering_engineer || null,
        songwriter: trackData.songwriter || null,
        composer: trackData.composer || null,
        lyricist: trackData.lyricist || null,
        arranger: trackData.arranger || null,
        publisher: trackData.publisher || null,
        copyright_owner: trackData.copyright_owner || null,
        phonographic_copyright: trackData.phonographic_copyright || null,
        sync_available: trackData.sync_available !== false,
        stems_available: trackData.stems_available || false,
        preview_start_time: trackData.preview_start_time || 0,
        preview_duration: trackData.preview_duration || 30,
        fade_in_duration: trackData.fade_in_duration || 0,
        fade_out_duration: trackData.fade_out_duration || 0,
        audio_file_url: trackData.audio_file_url || null,
        audio_file_format: trackData.audio_file_format || 'wav',
        audio_quality: trackData.audio_quality || 'lossless',
        sample_rate: trackData.sample_rate || 44100,
        bit_depth: trackData.bit_depth || 16,
        audio_channels: trackData.audio_channels || 2,
        audio_bitrate: trackData.audio_bitrate || null,
        file_size_bytes: trackData.file_size_bytes || null,
        audio_fingerprint: trackData.audio_fingerprint || null,
        waveform_data: trackData.waveform_data || null,
        loudness_lufs: trackData.loudness_lufs || null,
        dynamic_range: trackData.dynamic_range || null,
        peak_amplitude: trackData.peak_amplitude || null,
        rms_amplitude: trackData.rms_amplitude || null,
        spectral_centroid: trackData.spectral_centroid || null,
        zero_crossing_rate: trackData.zero_crossing_rate || null,
        status: trackData.status || 'draft',
        review_notes: trackData.review_notes || null,
        mastering_notes: trackData.mastering_notes || null,
        distribution_notes: trackData.distribution_notes || null,
        tags: trackData.tags || [],
        mood_tags: trackData.mood_tags || [],
        genre_tags: trackData.genre_tags || [],
        instrument_tags: trackData.instrument_tags || [],
        vocal_tags: trackData.vocal_tags || [],
        cultural_tags: trackData.cultural_tags || [],
        era_tags: trackData.era_tags || [],
        activity_tags: trackData.activity_tags || [],
        external_ids: trackData.external_ids || {},
        metadata_source: trackData.metadata_source || 'manual',
        metadata_confidence: trackData.metadata_confidence || 1.0,
        metadata: trackData.metadata || {},
        created_by: trackData.created_by,
        updated_by: trackData.created_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([trackToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create track', { error: error.message, trackData });
        throw new Error(`Track creation failed: ${error.message}`);
      }

      logger.info('Track created successfully', { 
        trackId: data.track_id,
        title: data.title,
        release: data.release_id 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Track creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Find track by ID with related data
   */
  async findById(trackId, options = {}) {
    try {
      const {
        includeRelease = false,
        includeContributors = false,
        includeAudioAnalysis = false,
        includeDistribution = false,
        includeRoyalties = false
      } = options;

      const cacheKey = `track_${trackId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('track_id', trackId)
        .single();

      const { data: track, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('Failed to find track by ID', { error: error.message, trackId });
        throw new Error(`Track lookup failed: ${error.message}`);
      }

      if (!track) return null;

      // Add related data if requested
      if (includeRelease) {
        track.release = await this.getTrackRelease(track.release_id);
      }

      if (includeContributors) {
        track.contributors = await this.getTrackContributors(trackId);
      }

      if (includeAudioAnalysis) {
        track.audio_analysis = await this.getTrackAudioAnalysis(trackId);
      }

      if (includeDistribution) {
        track.distribution = await this.getTrackDistribution(trackId);
      }

      if (includeRoyalties) {
        track.royalties = await this.getTrackRoyalties(trackId);
      }

      this.setCache(cacheKey, track);
      return track;
    } catch (error) {
      logger.error('Track lookup error', { error: error.message, trackId });
      throw error;
    }
  }

  /**
   * Find tracks with advanced filtering
   */
  async findMany(filters = {}, options = {}) {
    try {
      const {
        release_id,
        artist_id,
        genre,
        explicit_content,
        instrumental,
        duration_min,
        duration_max,
        status,
        bpm_min,
        bpm_max,
        key_signature,
        title_search,
        has_lyrics,
        is_cover,
        is_remix,
        sync_available
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'track_number',
        sortOrder = 'asc',
        includeCount = false
      } = options;

      const offset = (page - 1) * limit;

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (release_id) {
        query = query.eq('release_id', release_id);
      }

      if (artist_id) {
        // This would require joining with track_contributors
        query = query.in('track_id', 
          supabase.from('track_contributors')
            .select('track_id')
            .eq('artist_id', artist_id)
        );
      }

      if (genre) {
        query = query.eq('genre', genre);
      }

      if (explicit_content !== undefined) {
        query = query.eq('explicit_content', explicit_content);
      }

      if (instrumental !== undefined) {
        query = query.eq('instrumental', instrumental);
      }

      if (duration_min) {
        query = query.gte('duration_ms', duration_min * 1000);
      }

      if (duration_max) {
        query = query.lte('duration_ms', duration_max * 1000);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (bpm_min) {
        query = query.gte('tempo_bpm', bpm_min);
      }

      if (bpm_max) {
        query = query.lte('tempo_bpm', bpm_max);
      }

      if (key_signature) {
        query = query.eq('key_signature', key_signature);
      }

      if (title_search) {
        query = query.ilike('title', `%${title_search}%`);
      }

      if (has_lyrics !== undefined) {
        if (has_lyrics) {
          query = query.not('lyrics', 'is', null);
        } else {
          query = query.is('lyrics', null);
        }
      }

      if (is_cover !== undefined) {
        query = query.eq('cover_version', is_cover);
      }

      if (is_remix !== undefined) {
        query = query.eq('remix', is_remix);
      }

      if (sync_available !== undefined) {
        query = query.eq('sync_available', sync_available);
      }

      // Apply sorting
      const validSortFields = ['track_number', 'title', 'duration_ms', 'tempo_bpm', 'created_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'track_number';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to find tracks', { error: error.message, filters });
        throw new Error(`Tracks search failed: ${error.message}`);
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
      logger.error('Tracks search error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update track with validation
   */
  async update(trackId, updateData, currentVersion = null) {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: updateData.updated_by
      };

      // Remove fields that shouldn't be updated directly
      delete updatePayload.track_id;
      delete updatePayload.created_at;
      delete updatePayload.created_by;

      let query = supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('track_id', trackId);

      // Add optimistic locking if version provided
      if (currentVersion) {
        query = query.eq('updated_at', currentVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Track not found or version conflict');
        }
        logger.error('Failed to update track', { error: error.message, trackId });
        throw new Error(`Track update failed: ${error.message}`);
      }

      logger.info('Track updated successfully', { 
        trackId,
        updatedFields: Object.keys(updateData) 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Track update error', { error: error.message, trackId });
      throw error;
    }
  }

  /**
   * Delete track with cascade handling
   */
  async delete(trackId, deletedBy) {
    try {
      // Check for dependencies
      const dependencies = await this.checkDependencies(trackId);
      if (dependencies.hasActive) {
        throw new Error(`Cannot delete track: has active ${dependencies.types.join(', ')}`);
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
        .eq('track_id', trackId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to delete track', { error: error.message, trackId });
        throw new Error(`Track deletion failed: ${error.message}`);
      }

      logger.info('Track deleted successfully', { trackId, deletedBy });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Track deletion error', { error: error.message, trackId });
      throw error;
    }
  }

  // ========== Advanced Queries ==========

  /**
   * Get tracks by release with full metadata
   */
  async getTracksByRelease(releaseId, options = {}) {
    try {
      const { includeContributors = true, includeAnalysis = false } = options;

      let query = supabase
        .from(this.tableName)
        .select(includeContributors ? `
          *,
          track_contributors:track_contributors (
            role,
            artist_id,
            split_percentage,
            artists:artist_id (
              name,
              profile_image_url
            )
          )
        ` : '*')
        .eq('release_id', releaseId)
        .neq('status', 'deleted')
        .order('disc_number')
        .order('track_number');

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get tracks by release', { error: error.message, releaseId });
        throw new Error(`Release tracks lookup failed: ${error.message}`);
      }

      let tracks = data || [];

      // Add audio analysis if requested
      if (includeAnalysis) {
        tracks = await Promise.all(tracks.map(async (track) => ({
          ...track,
          audio_analysis: await this.getTrackAudioAnalysis(track.track_id)
        })));
      }

      return tracks;
    } catch (error) {
      logger.error('Release tracks error', { error: error.message, releaseId });
      throw error;
    }
  }

  /**
   * Search tracks with advanced capabilities
   */
  async searchTracks(searchTerm, options = {}) {
    try {
      const {
        limit = 20,
        includeContributors = true,
        includeInactive = false,
        genreFilter = null,
        explicitFilter = null,
        instrumentalFilter = null
      } = options;

      let tracks = [];

      // Primary search on titles
      let query = supabase
        .from(this.tableName)
        .select(includeContributors ? `
          *,
          releases:release_id (
            title,
            artist_id,
            release_date
          ),
          track_contributors:track_contributors (
            role,
            artist_id,
            artists:artist_id (
              name
            )
          )
        ` : `
          *,
          releases:release_id (
            title,
            artist_id,
            release_date
          )
        `)
        .ilike('title', `%${searchTerm}%`)
        .neq('status', includeInactive ? 'none' : 'deleted');

      // Apply additional filters
      if (genreFilter) {
        query = query.eq('genre', genreFilter);
      }

      if (explicitFilter !== null) {
        query = query.eq('explicit_content', explicitFilter);
      }

      if (instrumentalFilter !== null) {
        query = query.eq('instrumental', instrumentalFilter);
      }

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data: titleMatches, error } = await query;

      if (!error && titleMatches) {
        tracks = titleMatches;
      }

      // Add relevance scoring
      return tracks.map(track => ({
        ...track,
        relevance_score: this.calculateTrackRelevanceScore(track, searchTerm)
      })).sort((a, b) => b.relevance_score - a.relevance_score);

    } catch (error) {
      logger.error('Track search error', { error: error.message, searchTerm });
      throw error;
    }
  }

  /**
   * Get track statistics for analytics
   */
  async getTrackStatistics(timeframe = '30d') {
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

      const [totalTracks, recentTracks, genreCounts, explicitCounts] = await Promise.all([
        // Total tracks count
        supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .neq('status', 'deleted'),
        
        // Recent tracks
        supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .neq('status', 'deleted'),
        
        // Genre distribution
        supabase.rpc('get_track_genre_counts'),
        
        // Explicit content distribution
        supabase.rpc('get_track_explicit_counts')
      ]);

      return {
        total_tracks: totalTracks.count || 0,
        recent_tracks: recentTracks.count || 0,
        genre_distribution: genreCounts.data || [],
        explicit_distribution: explicitCounts.data || [],
        timeframe,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Track statistics error', { error: error.message });
      return {
        total_tracks: 0,
        recent_tracks: 0,
        genre_distribution: [],
        explicit_distribution: [],
        timeframe,
        generated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Get tracks needing audio analysis
   */
  async getTracksNeedingAnalysis(limit = 50) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          track_id,
          title,
          audio_file_url,
          created_at,
          releases:release_id (
            title,
            artist_id
          )
        `)
        .not('audio_file_url', 'is', null)
        .is('audio_fingerprint', null)
        .in('status', ['uploaded', 'processing', 'mastered'])
        .order('created_at')
        .limit(limit);

      if (error) {
        logger.error('Failed to get tracks needing analysis', { error: error.message });
        throw new Error(`Analysis queue lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Analysis queue error', { error: error.message });
      throw error;
    }
  }

  // ========== Related Data Methods ==========

  /**
   * Get track release information
   */
  async getTrackRelease(releaseId) {
    try {
      const { data, error } = await supabase
        .from('releases')
        .select(`
          release_id,
          title,
          type,
          release_date,
          artist_id,
          artists:artist_id (
            name,
            profile_image_url
          )
        `)
        .eq('release_id', releaseId)
        .single();

      if (error) {
        logger.error('Failed to get track release', { error: error.message, releaseId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Track release error', { error: error.message, releaseId });
      return null;
    }
  }

  /**
   * Get track contributors with roles and splits
   */
  async getTrackContributors(trackId) {
    try {
      const { data, error } = await supabase
        .from('track_contributors')
        .select(`
          role,
          split_percentage,
          contribution_type,
          artist_id,
          artists:artist_id (
            artist_id,
            name,
            profile_image_url,
            verification_status
          )
        `)
        .eq('track_id', trackId)
        .order('role');

      if (error) {
        logger.error('Failed to get track contributors', { error: error.message, trackId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Track contributors error', { error: error.message, trackId });
      return [];
    }
  }

  /**
   * Get audio analysis data for track
   */
  async getTrackAudioAnalysis(trackId) {
    try {
      // Mock analysis - would integrate with real audio analysis system
      const mockAnalysis = {
        tempo: Math.floor(Math.random() * 200) + 60,
        key: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][Math.floor(Math.random() * 12)],
        mode: Math.random() > 0.5 ? 'major' : 'minor',
        time_signature: '4/4',
        loudness: Math.random() * -60,
        energy: Math.random(),
        danceability: Math.random(),
        valence: Math.random(),
        acousticness: Math.random(),
        instrumentalness: Math.random(),
        liveness: Math.random(),
        speechiness: Math.random(),
        segments: [],
        beats: [],
        bars: [],
        sections: [],
        analyzed_at: new Date().toISOString()
      };

      return mockAnalysis;
    } catch (error) {
      logger.error('Track audio analysis error', { error: error.message, trackId });
      return null;
    }
  }

  /**
   * Get track distribution information
   */
  async getTrackDistribution(trackId) {
    try {
      const { data, error } = await supabase
        .from('track_distributions')
        .select(`
          *,
          distribution_channels:channel_id (
            name,
            type,
            active
          )
        `)
        .eq('track_id', trackId);

      if (error) {
        logger.error('Failed to get track distribution', { error: error.message, trackId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Track distribution error', { error: error.message, trackId });
      return [];
    }
  }

  /**
   * Get track royalty information
   */
  async getTrackRoyalties(trackId, timeframe = '30d') {
    try {
      // Mock royalties - would integrate with real royalty system
      const mockRoyalties = {
        total_earnings: Math.floor(Math.random() * 1000),
        streams: Math.floor(Math.random() * 100000),
        downloads: Math.floor(Math.random() * 1000),
        sync_earnings: Math.floor(Math.random() * 500),
        mechanical_earnings: Math.floor(Math.random() * 200),
        performance_earnings: Math.floor(Math.random() * 300),
        timeframe,
        last_updated: new Date().toISOString()
      };

      return mockRoyalties;
    } catch (error) {
      logger.error('Track royalties error', { error: error.message, trackId });
      return null;
    }
  }

  // ========== Helper Methods ==========

  /**
   * Check track dependencies before deletion
   */
  async checkDependencies(trackId) {
    try {
      const [distributions, royalties, playlists] = await Promise.all([
        supabase.from('track_distributions').select('id').eq('track_id', trackId),
        supabase.from('royalty_statements').select('id').eq('track_id', trackId),
        supabase.from('playlist_tracks').select('id').eq('track_id', trackId)
      ]);

      const hasDistributions = distributions.data && distributions.data.length > 0;
      const hasRoyalties = royalties.data && royalties.data.length > 0;
      const hasPlaylists = playlists.data && playlists.data.length > 0;

      const types = [];
      if (hasDistributions) types.push('distributions');
      if (hasRoyalties) types.push('royalties');
      if (hasPlaylists) types.push('playlists');

      return {
        hasActive: types.length > 0,
        types,
        counts: {
          distributions: distributions.data?.length || 0,
          royalties: royalties.data?.length || 0,
          playlists: playlists.data?.length || 0
        }
      };
    } catch (error) {
      logger.error('Track dependency check error', { error: error.message, trackId });
      return { hasActive: true, types: ['unknown'], counts: {} };
    }
  }

  /**
   * Calculate search relevance score for tracks
   */
  calculateTrackRelevanceScore(track, searchTerm) {
    let score = 0;
    const term = searchTerm.toLowerCase();
    const title = track.title?.toLowerCase() || '';
    const releaseName = track.releases?.title?.toLowerCase() || '';

    // Title matching
    if (title === term) score += 100;
    else if (title.startsWith(term)) score += 80;
    else if (title.includes(term)) score += 60;

    // Release name matching
    if (releaseName.includes(term)) score += 40;

    // Contributor matching
    const contributors = track.track_contributors || [];
    const hasContributorMatch = contributors.some(contrib => 
      contrib.artists?.name?.toLowerCase().includes(term)
    );
    if (hasContributorMatch) score += 50;

    // Genre matching
    if (track.genre?.toLowerCase().includes(term)) score += 20;

    // Lyrics matching
    if (track.lyrics?.toLowerCase().includes(term)) score += 30;

    // Recency bonus
    const createdDate = new Date(track.created_at);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 7) score += 10;
    else if (daysSinceCreation <= 30) score += 5;

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
  async batchCreate(tracksData) {
    try {
      const tracksToCreate = tracksData.map(track => ({
        ...track,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(tracksToCreate)
        .select();

      if (error) {
        logger.error('Batch track creation failed', { error: error.message });
        throw new Error(`Batch creation failed: ${error.message}`);
      }

      logger.info('Tracks batch created successfully', { count: data.length });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Batch track creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update track audio file information
   */
  async updateAudioFile(trackId, audioFileData, updatedBy) {
    try {
      const updatePayload = {
        audio_file_url: audioFileData.url,
        audio_file_format: audioFileData.format,
        audio_quality: audioFileData.quality,
        sample_rate: audioFileData.sample_rate,
        bit_depth: audioFileData.bit_depth,
        audio_channels: audioFileData.channels,
        audio_bitrate: audioFileData.bitrate,
        file_size_bytes: audioFileData.size,
        duration_ms: audioFileData.duration,
        status: 'uploaded',
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('track_id', trackId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update track audio file', { error: error.message, trackId });
        throw new Error(`Audio file update failed: ${error.message}`);
      }

      logger.info('Track audio file updated', { trackId, format: audioFileData.format });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Track audio file update error', { error: error.message, trackId });
      throw error;
    }
  }

  /**
   * Update track analysis results
   */
  async updateAudioAnalysis(trackId, analysisData, updatedBy) {
    try {
      const updatePayload = {
        tempo_bpm: analysisData.tempo,
        key_signature: analysisData.key,
        time_signature: analysisData.time_signature,
        loudness_lufs: analysisData.loudness,
        dynamic_range: analysisData.dynamic_range,
        peak_amplitude: analysisData.peak_amplitude,
        rms_amplitude: analysisData.rms_amplitude,
        spectral_centroid: analysisData.spectral_centroid,
        zero_crossing_rate: analysisData.zero_crossing_rate,
        audio_fingerprint: analysisData.fingerprint,
        waveform_data: analysisData.waveform,
        metadata: {
          ...this.metadata,
          audio_analysis: {
            energy: analysisData.energy,
            danceability: analysisData.danceability,
            valence: analysisData.valence,
            acousticness: analysisData.acousticness,
            instrumentalness: analysisData.instrumentalness,
            liveness: analysisData.liveness,
            speechiness: analysisData.speechiness,
            analyzed_at: new Date().toISOString()
          }
        },
        status: 'analyzed',
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('track_id', trackId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update track analysis', { error: error.message, trackId });
        throw new Error(`Analysis update failed: ${error.message}`);
      }

      logger.info('Track analysis updated', { trackId, tempo: analysisData.tempo });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Track analysis update error', { error: error.message, trackId });
      throw error;
    }
  }
}

module.exports = TrackRepository;
