/**
 * Release Model for Music Distribution
 * Model wydania (album, EP, singiel)
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../config/logger.cjs');

class ReleaseModel {
  constructor(supabaseClient = null) {
    // Użyj przekazanego klienta lub utwórz nowego tylko jeśli mamy dane
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    } else {
      // Dla rozwoju - używaj mock client
      this.supabase = {
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: [], error: null }),
          update: () => ({ data: [], error: null }),
          delete: () => ({ data: [], error: null })
        })
      };
      logger.warn('Using mock Supabase client - configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    this.tableName = 'releases';
  }

  /**
   * Create a new release
   */
  async create(releaseData, userId = null) {
    try {
      const dataToInsert = {
        ...releaseData,
        created_by: userId,
        updated_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select(`
          *,
          artists(id, name, stage_name),
          labels(id, name)
        `)
        .single();

      if (error) {
        logger.error('Error creating release:', { error, releaseData });
        throw error;
      }

      logger.musicDistribution.userAction('Release created', {
        releaseId: data.id,
        releaseTitle: data.title,
        artistId: data.artist_id,
        createdBy: userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to create release:', error);
      throw error;
    }
  }

  /**
   * Get release by ID
   */
  async findById(id, includeRelations = true) {
    try {
      let selectFields = '*';
      
      if (includeRelations) {
        selectFields = `
          *,
          artists(id, name, stage_name, profile_image),
          labels(id, name, logo_image),
          tracks(id, title, duration, track_number, disc_number, audio_file, isrc, explicit_content)
        `;
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(selectFields)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        logger.error('Error finding release by ID:', { error, id });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find release:', error);
      throw error;
    }
  }

  /**
   * Get all releases with optional filtering
   */
  async findAll(filters = {}, pagination = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          artists(id, name, stage_name, profile_image),
          labels(id, name, logo_image)
        `, { count: 'exact' });

      // Apply filters
      if (filters.artistId) {
        query = query.eq('artist_id', filters.artistId);
      }

      if (filters.labelId) {
        query = query.eq('label_id', filters.labelId);
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters.type) {
        if (Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        } else {
          query = query.eq('type', filters.type);
        }
      }

      if (filters.genre) {
        query = query.contains('genres', [filters.genre]);
      }

      if (filters.releaseDateFrom) {
        query = query.gte('release_date', filters.releaseDateFrom);
      }

      if (filters.releaseDateTo) {
        query = query.lte('release_date', filters.releaseDateTo);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
      }

      if (filters.explicitContent !== undefined) {
        query = query.eq('explicit_content', filters.explicitContent);
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
        logger.error('Error finding releases:', { error, filters });
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
      logger.error('Failed to find releases:', error);
      throw error;
    }
  }

  /**
   * Update release
   */
  async update(id, updateData, userId = null) {
    try {
      const dataToUpdate = {
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          artists(id, name, stage_name),
          labels(id, name)
        `)
        .single();

      if (error) {
        logger.error('Error updating release:', { error, id, updateData });
        throw error;
      }

      logger.musicDistribution.userAction('Release updated', {
        releaseId: id,
        updatedBy: userId,
        changes: Object.keys(updateData)
      });

      return data;
    } catch (error) {
      logger.error('Failed to update release:', error);
      throw error;
    }
  }

  /**
   * Delete release
   */
  async delete(id, userId = null) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error deleting release:', { error, id });
        throw error;
      }

      logger.musicDistribution.userAction('Release deleted', {
        releaseId: id,
        deletedBy: userId
      });

      return data;
    } catch (error) {
      logger.error('Failed to delete release:', error);
      throw error;
    }
  }

  /**
   * Update release status
   */
  async updateStatus(id, status, userId = null, rejectionReason = null) {
    try {
      const updateData = {
        status,
        updated_by: userId,
        updated_at: new Date().toISOString()
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      } else if (status !== 'rejected') {
        updateData.rejection_reason = null;
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating release status:', { error, id, status });
        throw error;
      }

      logger.musicDistribution.userAction('Release status updated', {
        releaseId: id,
        newStatus: status,
        updatedBy: userId,
        rejectionReason
      });

      return data;
    } catch (error) {
      logger.error('Failed to update release status:', error);
      throw error;
    }
  }

  /**
   * Get releases by status
   */
  async findByStatus(status, limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          artists(id, name, stage_name),
          labels(id, name)
        `)
        .eq('status', status)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error finding releases by status:', { error, status });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find releases by status:', error);
      throw error;
    }
  }

  /**
   * Get recent releases
   */
  async findRecent(days = 30, limit = 50) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          artists(id, name, stage_name, profile_image),
          labels(id, name, logo_image)
        `)
        .gte('release_date', cutoffDate.toISOString())
        .eq('status', 'live')
        .order('release_date', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error finding recent releases:', { error, days });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find recent releases:', error);
      throw error;
    }
  }

  /**
   * Get upcoming releases
   */
  async findUpcoming(days = 30, limit = 50) {
    try {
      const currentDate = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          artists(id, name, stage_name, profile_image),
          labels(id, name, logo_image)
        `)
        .gte('release_date', currentDate.toISOString())
        .lte('release_date', futureDate.toISOString())
        .in('status', ['approved', 'distributed'])
        .order('release_date', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Error finding upcoming releases:', { error, days });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find upcoming releases:', error);
      throw error;
    }
  }

  /**
   * Search releases
   */
  async search(searchTerm, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          artists(id, name, stage_name),
          labels(id, name)
        `)
        .or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
        .order('release_date', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error searching releases:', { error, searchTerm });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to search releases:', error);
      throw error;
    }
  }

  /**
   * Get releases by UPC
   */
  async findByUPC(upc) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('upc', upc);

      if (error) {
        logger.error('Error finding release by UPC:', { error, upc });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find release by UPC:', error);
      throw error;
    }
  }

  /**
   * Get release analytics summary
   */
  async getAnalyticsSummary(releaseId) {
    try {
      // This would typically integrate with analytics services
      // For now, return placeholder data structure
      return {
        totalStreams: 0,
        totalRevenue: 0,
        streamsByPlatform: {},
        topTerritories: [],
        recentActivity: []
      };
    } catch (error) {
      logger.error('Failed to get release analytics:', error);
      return {
        totalStreams: 0,
        totalRevenue: 0,
        streamsByPlatform: {},
        topTerritories: [],
        recentActivity: []
      };
    }
  }

  /**
   * Get distribution status for release
   */
  async getDistributionStatus(releaseId) {
    try {
      const { data, error } = await this.supabase
        .from('release_distribution_status')
        .select(`
          *,
          distribution_channels(name, display_name)
        `)
        .eq('release_id', releaseId);

      if (error) {
        logger.error('Error getting distribution status:', { error, releaseId });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to get distribution status:', error);
      return [];
    }
  }

  /**
   * Check if UPC is available
   */
  async isUPCAvailable(upc, excludeReleaseId = null) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id')
        .eq('upc', upc);

      if (excludeReleaseId) {
        query = query.neq('id', excludeReleaseId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error checking UPC availability:', { error, upc });
        throw error;
      }

      return data.length === 0;
    } catch (error) {
      logger.error('Failed to check UPC availability:', error);
      return false;
    }
  }
}

module.exports = ReleaseModel;
