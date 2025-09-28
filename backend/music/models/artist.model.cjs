/**
 * Artist Model for Music Distribution
 * Model artysty (dane identyfikacyjne, biografia, linki)
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../config/logger.cjs');

class ArtistModel {
  constructor(supabaseClient = null) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    } else {
      // Mock client dla rozwoju
      this.supabase = {
        from: () => ({
          select: () => ({ data: [], error: null, count: 0 }),
          insert: () => ({ data: [], error: null }),
          update: () => ({ data: [], error: null }),
          delete: () => ({ error: null }),
          rpc: () => ({ data: [], error: null })
        })
      };
      logger.warn('Using mock Supabase client for ArtistModel');
    }
    this.tableName = 'artists';
  }

  /**
   * Create a new artist
   */
  async create(artistData, userId = null) {
    try {
      const dataToInsert = {
        ...artistData,
        created_by: userId,
        updated_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        logger.error('Error creating artist:', { error, artistData });
        throw error;
      }

      logger.musicDistribution.userAction('Artist created', {
        artistId: data.id,
        artistName: data.name,
        createdBy: userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to create artist:', error);
      throw error;
    }
  }

  /**
   * Get artist by ID
   */
  async findById(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        logger.error('Error finding artist by ID:', { error, id });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find artist:', error);
      throw error;
    }
  }

  /**
   * Get all artists with optional filtering
   */
  async findAll(filters = {}, pagination = {}) {
    try {
      let query = this.supabase.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%, stage_name.ilike.%${filters.search}%`);
      }

      if (filters.genre) {
        query = query.contains('genres', [filters.genre]);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error finding artists:', { error, filters });
        throw error;
      }

      return {
        data,
        count,
        pagination: {
          offset: pagination.offset || 0,
          limit: pagination.limit || data.length,
          total: count
        }
      };
    } catch (error) {
      logger.error('Failed to find artists:', error);
      throw error;
    }
  }

  /**
   * Update artist
   */
  async update(id, updateData, userId = null) {
    try {
      const dataToUpdate = {
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
        version: this.supabase.rpc('increment_version', { table_name: this.tableName, record_id: id })
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating artist:', { error, id, updateData });
        throw error;
      }

      logger.musicDistribution.userAction('Artist updated', {
        artistId: id,
        updatedBy: userId,
        changes: Object.keys(updateData)
      });

      return data;
    } catch (error) {
      logger.error('Failed to update artist:', error);
      throw error;
    }
  }

  /**
   * Delete artist (soft delete by setting is_active = false)
   */
  async delete(id, userId = null) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          is_active: false,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error deleting artist:', { error, id });
        throw error;
      }

      logger.musicDistribution.userAction('Artist deleted', {
        artistId: id,
        deletedBy: userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to delete artist:', error);
      throw error;
    }
  }

  /**
   * Find artist by name or stage name
   */
  async findByName(name) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.${name}, stage_name.ilike.${name}`)
        .eq('is_active', true);

      if (error) {
        logger.error('Error finding artist by name:', { error, name });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find artist by name:', error);
      throw error;
    }
  }

  /**
   * Get artist statistics
   */
  async getStats(artistId) {
    try {
      // Get release count
      const { count: releaseCount } = await this.supabase
        .from('releases')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', artistId)
        .eq('status', 'live');

      // Get track count
      const { count: trackCount } = await this.supabase
        .from('tracks')
        .select('releases!inner(*)', { count: 'exact', head: true })
        .eq('releases.artist_id', artistId)
        .eq('releases.status', 'live');

      // Get latest release
      const { data: latestRelease } = await this.supabase
        .from('releases')
        .select('title, release_date')
        .eq('artist_id', artistId)
        .eq('status', 'live')
        .order('release_date', { ascending: false })
        .limit(1)
        .single();

      return {
        totalReleases: releaseCount || 0,
        totalTracks: trackCount || 0,
        latestRelease: latestRelease?.title || null,
        latestReleaseDate: latestRelease?.release_date || null
      };
    } catch (error) {
      logger.error('Failed to get artist stats:', error);
      return {
        totalReleases: 0,
        totalTracks: 0,
        latestRelease: null,
        latestReleaseDate: null
      };
    }
  }

  /**
   * Get artists with releases in date range
   */
  async findWithRecentReleases(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          releases!inner(
            id,
            title,
            release_date,
            status
          )
        `)
        .gte('releases.release_date', cutoffDate.toISOString())
        .eq('releases.status', 'live')
        .eq('is_active', true);

      if (error) {
        logger.error('Error finding artists with recent releases:', { error, days });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find artists with recent releases:', error);
      throw error;
    }
  }

  /**
   * Verify artist
   */
  async verify(id, userId = null) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          is_verified: true,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error verifying artist:', { error, id });
        throw error;
      }

      logger.musicDistribution.userAction('Artist verified', {
        artistId: id,
        verifiedBy: userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to verify artist:', error);
      throw error;
    }
  }

  /**
   * Get artists by genre
   */
  async findByGenre(genre, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('genres', [genre])
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        logger.error('Error finding artists by genre:', { error, genre });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find artists by genre:', error);
      throw error;
    }
  }

  /**
   * Search artists with full-text search
   */
  async search(searchTerm, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${searchTerm}%, stage_name.ilike.%${searchTerm}%, biography.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        logger.error('Error searching artists:', { error, searchTerm });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to search artists:', error);
      throw error;
    }
  }
}

module.exports = ArtistModel;
