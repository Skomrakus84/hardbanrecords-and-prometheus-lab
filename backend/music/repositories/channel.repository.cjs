/**
 * Channel Repository
 * Advanced data access layer for distribution channel entities
 * Handles all database operations for channel management, configuration, and monitoring
 */

const { supabase } = require('../../db.cjs');
const logger = require('../../config/logger.cjs');

class ChannelRepository {
  constructor() {
    this.tableName = 'distribution_channels';
    this.releasesTableName = 'channel_releases';
    this.analyticsTableName = 'channel_analytics';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ========== Channel CRUD Operations ==========

  /**
   * Create new distribution channel
   */
  async create(channelData) {
    try {
      const channelToCreate = {
        channel_id: channelData.channel_id,
        name: channelData.name,
        type: channelData.type, // streaming, download, physical, sync
        category: channelData.category || 'digital', // digital, physical, sync, broadcast
        platform: channelData.platform || channelData.name.toLowerCase(),
        region: channelData.region || 'global',
        territories: channelData.territories || [],
        supported_formats: channelData.supported_formats || ['digital'],
        api_endpoint: channelData.api_endpoint || null,
        api_version: channelData.api_version || null,
        authentication_type: channelData.authentication_type || 'oauth2',
        requires_approval: channelData.requires_approval || false,
        auto_distribute: channelData.auto_distribute || false,
        supports_preorder: channelData.supports_preorder || false,
        supports_takedown: channelData.supports_takedown || false,
        supports_analytics: channelData.supports_analytics || false,
        supports_playlist_pitching: channelData.supports_playlist_pitching || false,
        min_release_date_days: channelData.min_release_date_days || 0,
        max_release_date_days: channelData.max_release_date_days || 365,
        content_guidelines: channelData.content_guidelines || {},
        technical_requirements: channelData.technical_requirements || {},
        metadata_requirements: channelData.metadata_requirements || {},
        artwork_requirements: channelData.artwork_requirements || {},
        audio_requirements: channelData.audio_requirements || {},
        revenue_model: channelData.revenue_model || 'revenue_share',
        commission_rate: channelData.commission_rate || 0,
        minimum_payout: channelData.minimum_payout || 0,
        payout_frequency: channelData.payout_frequency || 'monthly',
        reporting_frequency: channelData.reporting_frequency || 'monthly',
        reporting_delay_days: channelData.reporting_delay_days || 30,
        currency: channelData.currency || 'USD',
        status: channelData.status || 'active',
        priority: channelData.priority || 1,
        sort_order: channelData.sort_order || 0,
        is_premium: channelData.is_premium || false,
        is_beta: channelData.is_beta || false,
        launch_date: channelData.launch_date || null,
        sunset_date: channelData.sunset_date || null,
        contact_info: channelData.contact_info || {},
        documentation_url: channelData.documentation_url || null,
        support_url: channelData.support_url || null,
        terms_url: channelData.terms_url || null,
        logo_url: channelData.logo_url || null,
        brand_colors: channelData.brand_colors || {},
        integration_notes: channelData.integration_notes || null,
        known_issues: channelData.known_issues || [],
        feature_flags: channelData.feature_flags || {},
        rate_limits: channelData.rate_limits || {},
        webhook_support: channelData.webhook_support || false,
        webhook_events: channelData.webhook_events || [],
        config: channelData.config || {},
        metadata: channelData.metadata || {},
        created_by: channelData.created_by,
        updated_by: channelData.created_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([channelToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create channel', { error: error.message, channelData });
        throw new Error(`Channel creation failed: ${error.message}`);
      }

      logger.info('Channel created successfully', { 
        channelId: data.channel_id,
        name: data.name,
        type: data.type 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Channel creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Find channel by ID with configuration
   */
  async findById(channelId, options = {}) {
    try {
      const {
        includeAnalytics = false,
        includeReleases = false,
        includeConfig = true,
        includeStats = false
      } = options;

      const cacheKey = `channel_${channelId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('channel_id', channelId)
        .single();

      const { data: channel, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('Failed to find channel by ID', { error: error.message, channelId });
        throw new Error(`Channel lookup failed: ${error.message}`);
      }

      if (!channel) return null;

      // Add related data if requested
      if (includeAnalytics) {
        channel.analytics = await this.getChannelAnalytics(channelId);
      }

      if (includeReleases) {
        channel.releases = await this.getChannelReleases(channelId);
      }

      if (includeStats) {
        channel.stats = await this.getChannelStats(channelId);
      }

      this.setCache(cacheKey, channel);
      return channel;
    } catch (error) {
      logger.error('Channel lookup error', { error: error.message, channelId });
      throw error;
    }
  }

  /**
   * Find channels with filtering and sorting
   */
  async findMany(filters = {}, options = {}) {
    try {
      const {
        type,
        category,
        region,
        status,
        platform,
        territory,
        supports_analytics,
        supports_preorder,
        auto_distribute,
        is_premium,
        is_beta,
        min_priority,
        max_priority
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'sort_order',
        sortOrder = 'asc',
        includeCount = false
      } = options;

      const offset = (page - 1) * limit;

      let query = supabase
        .from(this.tableName)
        .select('*');

      // Apply filters
      if (type) {
        query = query.eq('type', type);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (region) {
        query = query.eq('region', region);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (platform) {
        query = query.eq('platform', platform);
      }

      if (territory) {
        query = query.contains('territories', [territory]);
      }

      if (supports_analytics !== undefined) {
        query = query.eq('supports_analytics', supports_analytics);
      }

      if (supports_preorder !== undefined) {
        query = query.eq('supports_preorder', supports_preorder);
      }

      if (auto_distribute !== undefined) {
        query = query.eq('auto_distribute', auto_distribute);
      }

      if (is_premium !== undefined) {
        query = query.eq('is_premium', is_premium);
      }

      if (is_beta !== undefined) {
        query = query.eq('is_beta', is_beta);
      }

      if (min_priority) {
        query = query.gte('priority', min_priority);
      }

      if (max_priority) {
        query = query.lte('priority', max_priority);
      }

      // Apply sorting
      const validSortFields = ['sort_order', 'name', 'priority', 'created_at', 'type'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'sort_order';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to find channels', { error: error.message, filters });
        throw new Error(`Channels search failed: ${error.message}`);
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
      logger.error('Channels search error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update channel configuration
   */
  async update(channelId, updateData, currentVersion = null) {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: updateData.updated_by
      };

      // Remove fields that shouldn't be updated directly
      delete updatePayload.channel_id;
      delete updatePayload.created_at;
      delete updatePayload.created_by;

      let query = supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('channel_id', channelId);

      // Add optimistic locking if version provided
      if (currentVersion) {
        query = query.eq('updated_at', currentVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Channel not found or version conflict');
        }
        logger.error('Failed to update channel', { error: error.message, channelId });
        throw new Error(`Channel update failed: ${error.message}`);
      }

      logger.info('Channel updated successfully', { 
        channelId,
        updatedFields: Object.keys(updateData) 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Channel update error', { error: error.message, channelId });
      throw error;
    }
  }

  /**
   * Deactivate channel (soft delete)
   */
  async deactivate(channelId, deactivatedBy, reason = null) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'inactive',
          deactivated_at: new Date().toISOString(),
          deactivated_by: deactivatedBy,
          deactivation_reason: reason,
          updated_at: new Date().toISOString(),
          updated_by: deactivatedBy
        })
        .eq('channel_id', channelId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to deactivate channel', { error: error.message, channelId });
        throw new Error(`Channel deactivation failed: ${error.message}`);
      }

      logger.info('Channel deactivated successfully', { channelId, deactivatedBy });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Channel deactivation error', { error: error.message, channelId });
      throw error;
    }
  }

  // ========== Channel Release Management ==========

  /**
   * Add release to channel
   */
  async addRelease(channelReleaseData) {
    try {
      const releaseToAdd = {
        channel_id: channelReleaseData.channel_id,
        release_id: channelReleaseData.release_id,
        distribution_status: channelReleaseData.distribution_status || 'pending',
        submitted_at: channelReleaseData.submitted_at || new Date().toISOString(),
        distributed_at: channelReleaseData.distributed_at || null,
        takedown_at: channelReleaseData.takedown_at || null,
        live_date: channelReleaseData.live_date || null,
        external_id: channelReleaseData.external_id || null,
        external_url: channelReleaseData.external_url || null,
        submission_metadata: channelReleaseData.submission_metadata || {},
        response_metadata: channelReleaseData.response_metadata || {},
        error_details: channelReleaseData.error_details || null,
        retry_count: channelReleaseData.retry_count || 0,
        last_retry_at: channelReleaseData.last_retry_at || null,
        next_retry_at: channelReleaseData.next_retry_at || null,
        webhook_received: channelReleaseData.webhook_received || false,
        created_by: channelReleaseData.created_by,
        updated_by: channelReleaseData.created_by
      };

      const { data, error } = await supabase
        .from(this.releasesTableName)
        .insert([releaseToAdd])
        .select()
        .single();

      if (error) {
        logger.error('Failed to add release to channel', { error: error.message, channelReleaseData });
        throw new Error(`Channel release creation failed: ${error.message}`);
      }

      logger.info('Release added to channel successfully', { 
        channelId: data.channel_id,
        releaseId: data.release_id,
        status: data.distribution_status 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Channel release creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update release distribution status
   */
  async updateReleaseStatus(channelId, releaseId, statusData, updatedBy) {
    try {
      const updatePayload = {
        distribution_status: statusData.status,
        external_id: statusData.external_id || null,
        external_url: statusData.external_url || null,
        response_metadata: statusData.response_metadata || {},
        error_details: statusData.error_details || null,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      // Set status-specific timestamps
      if (statusData.status === 'distributed') {
        updatePayload.distributed_at = statusData.distributed_at || new Date().toISOString();
      } else if (statusData.status === 'live') {
        updatePayload.live_date = statusData.live_date || new Date().toISOString();
      } else if (statusData.status === 'taken_down') {
        updatePayload.takedown_at = statusData.takedown_at || new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(this.releasesTableName)
        .update(updatePayload)
        .eq('channel_id', channelId)
        .eq('release_id', releaseId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update release status', { error: error.message, channelId, releaseId });
        throw new Error(`Release status update failed: ${error.message}`);
      }

      logger.info('Release status updated', { 
        channelId,
        releaseId,
        status: statusData.status 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Release status update error', { error: error.message, channelId, releaseId });
      throw error;
    }
  }

  /**
   * Get releases for a channel
   */
  async getChannelReleases(channelId, options = {}) {
    try {
      const { 
        status = null, 
        limit = 50, 
        includeReleaseInfo = true 
      } = options;

      let query = supabase
        .from(this.releasesTableName)
        .select(includeReleaseInfo ? `
          *,
          releases:release_id (
            title,
            type,
            release_date,
            artist_id,
            artists:artist_id (
              name
            )
          )
        ` : '*')
        .eq('channel_id', channelId)
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('distribution_status', status);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get channel releases', { error: error.message, channelId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Channel releases error', { error: error.message, channelId });
      return [];
    }
  }

  // ========== Channel Analytics ==========

  /**
   * Get channel analytics
   */
  async getChannelAnalytics(channelId, timeframe = '30d') {
    try {
      // Mock analytics - would integrate with real analytics system
      const mockAnalytics = {
        total_releases: Math.floor(Math.random() * 1000),
        active_releases: Math.floor(Math.random() * 800),
        total_revenue: Math.floor(Math.random() * 50000),
        total_streams: Math.floor(Math.random() * 1000000),
        success_rate: 0.85 + Math.random() * 0.1,
        average_processing_time: Math.floor(Math.random() * 48) + 24, // hours
        error_rate: Math.random() * 0.05,
        uptime_percentage: 99.5 + Math.random() * 0.5,
        api_response_time: Math.floor(Math.random() * 500) + 100, // ms
        webhook_delivery_rate: 0.95 + Math.random() * 0.05,
        timeframe,
        last_updated: new Date().toISOString()
      };

      return mockAnalytics;
    } catch (error) {
      logger.error('Channel analytics error', { error: error.message, channelId });
      return null;
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId) {
    try {
      const [releases, distributions, revenue] = await Promise.all([
        // Release counts by status
        supabase
          .from(this.releasesTableName)
          .select('distribution_status', { count: 'exact' })
          .eq('channel_id', channelId),
        
        // Distribution performance
        supabase.rpc('get_channel_distribution_stats', { target_channel_id: channelId }),
        
        // Revenue statistics
        supabase.rpc('get_channel_revenue_stats', { target_channel_id: channelId })
      ]);

      const statusCounts = {};
      releases.data?.forEach(release => {
        const status = release.distribution_status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return {
        release_counts: statusCounts,
        total_releases: releases.count || 0,
        distribution_performance: distributions.data || {},
        revenue_stats: revenue.data || {},
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Channel stats error', { error: error.message, channelId });
      return {
        release_counts: {},
        total_releases: 0,
        distribution_performance: {},
        revenue_stats: {},
        generated_at: new Date().toISOString()
      };
    }
  }

  // ========== Advanced Queries ==========

  /**
   * Get active channels for distribution
   */
  async getActiveChannels(filters = {}) {
    try {
      const { type = null, territory = null, autoDistributeOnly = false } = filters;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('sort_order');

      if (type) {
        query = query.eq('type', type);
      }

      if (territory) {
        query = query.contains('territories', [territory]);
      }

      if (autoDistributeOnly) {
        query = query.eq('auto_distribute', true);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get active channels', { error: error.message });
        throw new Error(`Active channels lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Active channels error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get channels needing attention (errors, issues)
   */
  async getChannelsNeedingAttention() {
    try {
      const [errorChannels, staleChannels, offlineChannels] = await Promise.all([
        // Channels with recent errors
        supabase
          .from(this.releasesTableName)
          .select('channel_id, COUNT(*) as error_count')
          .eq('distribution_status', 'failed')
          .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .group('channel_id')
          .having('COUNT(*)', 'gt', 5),
        
        // Channels with stale releases
        supabase
          .from(this.releasesTableName)
          .select('channel_id, COUNT(*) as stale_count')
          .eq('distribution_status', 'pending')
          .lt('submitted_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
          .group('channel_id'),
        
        // Channels marked as having issues
        supabase
          .from(this.tableName)
          .select('*')
          .not('known_issues', 'eq', '[]')
          .eq('status', 'active')
      ]);

      return {
        channels_with_errors: errorChannels.data || [],
        channels_with_stale_releases: staleChannels.data || [],
        channels_with_known_issues: offlineChannels.data || [],
        total_issues: (errorChannels.data?.length || 0) + 
                     (staleChannels.data?.length || 0) + 
                     (offlineChannels.data?.length || 0)
      };
    } catch (error) {
      logger.error('Channels attention check error', { error: error.message });
      return {
        channels_with_errors: [],
        channels_with_stale_releases: [],
        channels_with_known_issues: [],
        total_issues: 0
      };
    }
  }

  /**
   * Search channels by name or platform
   */
  async searchChannels(searchTerm, options = {}) {
    try {
      const { limit = 20, activeOnly = false } = options;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,platform.ilike.%${searchTerm}%`)
        .order('priority', { ascending: false })
        .limit(limit);

      if (activeOnly) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Channel search error', { error: error.message, searchTerm });
        throw new Error(`Channel search failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Channel search error', { error: error.message, searchTerm });
      throw error;
    }
  }

  // ========== Helper Methods ==========

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
   * Validate channel configuration
   */
  validateChannelConfig(channelData) {
    const errors = [];

    // Required fields
    if (!channelData.name) errors.push('Channel name is required');
    if (!channelData.type) errors.push('Channel type is required');
    if (!channelData.platform) errors.push('Platform identifier is required');

    // API configuration validation
    if (channelData.api_endpoint && !this.isValidUrl(channelData.api_endpoint)) {
      errors.push('Invalid API endpoint URL');
    }

    // Commission rate validation
    if (channelData.commission_rate && (channelData.commission_rate < 0 || channelData.commission_rate > 1)) {
      errors.push('Commission rate must be between 0 and 1');
    }

    // Priority validation
    if (channelData.priority && (channelData.priority < 1 || channelData.priority > 10)) {
      errors.push('Priority must be between 1 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if URL is valid
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Update channel health status
   */
  async updateChannelHealth(channelId, healthData, updatedBy) {
    try {
      const updatePayload = {
        last_health_check: new Date().toISOString(),
        health_status: healthData.status, // healthy, degraded, down
        health_score: healthData.score || 100,
        response_time: healthData.response_time || null,
        error_rate: healthData.error_rate || 0,
        uptime_percentage: healthData.uptime || 100,
        last_error: healthData.last_error || null,
        metadata: {
          ...this.metadata,
          health_check: {
            checked_at: new Date().toISOString(),
            details: healthData.details || {}
          }
        },
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('channel_id', channelId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update channel health', { error: error.message, channelId });
        throw new Error(`Channel health update failed: ${error.message}`);
      }

      logger.info('Channel health updated', { 
        channelId,
        status: healthData.status,
        score: healthData.score 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Channel health update error', { error: error.message, channelId });
      throw error;
    }
  }

  /**
   * Batch update channel configurations
   */
  async batchUpdateConfigs(updates) {
    try {
      const updatePromises = updates.map(({ channelId, config, updatedBy }) => 
        this.update(channelId, { config, updated_by: updatedBy })
      );

      const results = await Promise.allSettled(updatePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Batch channel config update completed', { 
        total: updates.length,
        successful,
        failed 
      });

      this.invalidateCache();
      
      return {
        total: updates.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          channelId: updates[index].channelId,
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      };
    } catch (error) {
      logger.error('Batch channel config update error', { error: error.message });
      throw error;
    }
  }
}

module.exports = ChannelRepository;
