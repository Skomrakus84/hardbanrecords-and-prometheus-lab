/**
 * Royalty Repository
 * Advanced data access layer for royalty calculations and distribution
 * Handles all database operations for royalty statements, earnings, and splits
 */

const { supabase } = require('../../db.cjs');
const logger = require('../../config/logger.cjs');

class RoyaltyRepository {
  constructor() {
    this.tableName = 'royalty_statements';
    this.splitsTableName = 'royalty_splits';
    this.earningsTableName = 'earnings';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ========== Royalty Statements CRUD ==========

  /**
   * Create new royalty statement with comprehensive data
   */
  async createStatement(statementData) {
    try {
      const statementToCreate = {
        statement_id: statementData.statement_id,
        artist_id: statementData.artist_id,
        release_id: statementData.release_id || null,
        track_id: statementData.track_id || null,
        period_start: statementData.period_start,
        period_end: statementData.period_end,
        statement_type: statementData.statement_type || 'monthly', // monthly, quarterly, yearly
        currency: statementData.currency || 'USD',
        total_gross_revenue: statementData.total_gross_revenue || 0,
        total_net_revenue: statementData.total_net_revenue || 0,
        total_deductions: statementData.total_deductions || 0,
        platform_fees: statementData.platform_fees || 0,
        distribution_fees: statementData.distribution_fees || 0,
        label_commission: statementData.label_commission || 0,
        advance_recoupment: statementData.advance_recoupment || 0,
        marketing_costs: statementData.marketing_costs || 0,
        other_deductions: statementData.other_deductions || 0,
        payable_amount: statementData.payable_amount || 0,
        streaming_revenue: statementData.streaming_revenue || 0,
        download_revenue: statementData.download_revenue || 0,
        sync_revenue: statementData.sync_revenue || 0,
        mechanical_revenue: statementData.mechanical_revenue || 0,
        performance_revenue: statementData.performance_revenue || 0,
        other_revenue: statementData.other_revenue || 0,
        total_streams: statementData.total_streams || 0,
        total_downloads: statementData.total_downloads || 0,
        unique_listeners: statementData.unique_listeners || 0,
        territories: statementData.territories || [],
        platforms: statementData.platforms || [],
        revenue_by_platform: statementData.revenue_by_platform || {},
        revenue_by_territory: statementData.revenue_by_territory || {},
        revenue_by_track: statementData.revenue_by_track || {},
        deduction_details: statementData.deduction_details || {},
        exchange_rates: statementData.exchange_rates || {},
        processing_status: statementData.processing_status || 'pending',
        approval_status: statementData.approval_status || 'pending',
        payment_status: statementData.payment_status || 'unpaid',
        generated_at: statementData.generated_at || new Date().toISOString(),
        approved_at: statementData.approved_at || null,
        paid_at: statementData.paid_at || null,
        notes: statementData.notes || null,
        metadata: statementData.metadata || {},
        created_by: statementData.created_by,
        updated_by: statementData.created_by
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([statementToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create royalty statement', { error: error.message, statementData });
        throw new Error(`Royalty statement creation failed: ${error.message}`);
      }

      logger.info('Royalty statement created successfully', { 
        statementId: data.statement_id,
        artist: data.artist_id,
        amount: data.payable_amount 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Royalty statement creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Find royalty statement by ID with related data
   */
  async findStatementById(statementId, options = {}) {
    try {
      const {
        includeArtist = false,
        includeRelease = false,
        includeTrack = false,
        includeSplits = false,
        includeEarnings = false
      } = options;

      const cacheKey = `statement_${statementId}_${JSON.stringify(options)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('statement_id', statementId)
        .single();

      const { data: statement, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') return null;
        logger.error('Failed to find royalty statement by ID', { error: error.message, statementId });
        throw new Error(`Royalty statement lookup failed: ${error.message}`);
      }

      if (!statement) return null;

      // Add related data if requested
      if (includeArtist) {
        statement.artist = await this.getStatementArtist(statement.artist_id);
      }

      if (includeRelease && statement.release_id) {
        statement.release = await this.getStatementRelease(statement.release_id);
      }

      if (includeTrack && statement.track_id) {
        statement.track = await this.getStatementTrack(statement.track_id);
      }

      if (includeSplits) {
        statement.splits = await this.getStatementSplits(statementId);
      }

      if (includeEarnings) {
        statement.earnings = await this.getStatementEarnings(statementId);
      }

      this.setCache(cacheKey, statement);
      return statement;
    } catch (error) {
      logger.error('Royalty statement lookup error', { error: error.message, statementId });
      throw error;
    }
  }

  /**
   * Find royalty statements with advanced filtering
   */
  async findStatements(filters = {}, options = {}) {
    try {
      const {
        artist_id,
        release_id,
        track_id,
        period_start_after,
        period_start_before,
        period_end_after,
        period_end_before,
        statement_type,
        processing_status,
        approval_status,
        payment_status,
        min_amount,
        max_amount,
        currency,
        platform
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'period_end',
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

      if (release_id) {
        query = query.eq('release_id', release_id);
      }

      if (track_id) {
        query = query.eq('track_id', track_id);
      }

      if (period_start_after) {
        query = query.gte('period_start', period_start_after);
      }

      if (period_start_before) {
        query = query.lte('period_start', period_start_before);
      }

      if (period_end_after) {
        query = query.gte('period_end', period_end_after);
      }

      if (period_end_before) {
        query = query.lte('period_end', period_end_before);
      }

      if (statement_type) {
        query = query.eq('statement_type', statement_type);
      }

      if (processing_status) {
        query = query.eq('processing_status', processing_status);
      }

      if (approval_status) {
        query = query.eq('approval_status', approval_status);
      }

      if (payment_status) {
        query = query.eq('payment_status', payment_status);
      }

      if (min_amount) {
        query = query.gte('payable_amount', min_amount);
      }

      if (max_amount) {
        query = query.lte('payable_amount', max_amount);
      }

      if (currency) {
        query = query.eq('currency', currency);
      }

      if (platform) {
        query = query.contains('platforms', [platform]);
      }

      // Apply sorting
      const validSortFields = ['period_end', 'payable_amount', 'generated_at', 'approved_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'period_end';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to find royalty statements', { error: error.message, filters });
        throw new Error(`Royalty statements search failed: ${error.message}`);
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
      logger.error('Royalty statements search error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update royalty statement
   */
  async updateStatement(statementId, updateData, currentVersion = null) {
    try {
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString(),
        updated_by: updateData.updated_by
      };

      // Remove fields that shouldn't be updated directly
      delete updatePayload.statement_id;
      delete updatePayload.created_at;
      delete updatePayload.created_by;

      let query = supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('statement_id', statementId);

      // Add optimistic locking if version provided
      if (currentVersion) {
        query = query.eq('updated_at', currentVersion);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Royalty statement not found or version conflict');
        }
        logger.error('Failed to update royalty statement', { error: error.message, statementId });
        throw new Error(`Royalty statement update failed: ${error.message}`);
      }

      logger.info('Royalty statement updated successfully', { 
        statementId,
        updatedFields: Object.keys(updateData) 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Royalty statement update error', { error: error.message, statementId });
      throw error;
    }
  }

  // ========== Royalty Splits Management ==========

  /**
   * Create royalty split for a statement
   */
  async createSplit(splitData) {
    try {
      const splitToCreate = {
        split_id: splitData.split_id,
        statement_id: splitData.statement_id,
        artist_id: splitData.artist_id,
        role: splitData.role || 'artist', // artist, songwriter, producer, etc.
        split_type: splitData.split_type || 'percentage', // percentage, fixed
        split_percentage: splitData.split_percentage || 0,
        split_amount: splitData.split_amount || 0,
        gross_amount: splitData.gross_amount || 0,
        net_amount: splitData.net_amount || 0,
        deductions: splitData.deductions || 0,
        currency: splitData.currency || 'USD',
        calculation_method: splitData.calculation_method || 'standard',
        is_recoupable: splitData.is_recoupable || false,
        advance_balance: splitData.advance_balance || 0,
        recoupment_amount: splitData.recoupment_amount || 0,
        final_amount: splitData.final_amount || 0,
        payment_status: splitData.payment_status || 'pending',
        payment_method: splitData.payment_method || null,
        payment_reference: splitData.payment_reference || null,
        paid_at: splitData.paid_at || null,
        notes: splitData.notes || null,
        metadata: splitData.metadata || {},
        created_by: splitData.created_by,
        updated_by: splitData.created_by
      };

      const { data, error } = await supabase
        .from(this.splitsTableName)
        .insert([splitToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create royalty split', { error: error.message, splitData });
        throw new Error(`Royalty split creation failed: ${error.message}`);
      }

      logger.info('Royalty split created successfully', { 
        splitId: data.split_id,
        statement: data.statement_id,
        amount: data.final_amount 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Royalty split creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get splits for a statement
   */
  async getStatementSplits(statementId) {
    try {
      const { data, error } = await supabase
        .from(this.splitsTableName)
        .select(`
          *,
          artists:artist_id (
            artist_id,
            name,
            profile_image_url
          )
        `)
        .eq('statement_id', statementId)
        .order('split_percentage', { ascending: false });

      if (error) {
        logger.error('Failed to get statement splits', { error: error.message, statementId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Statement splits error', { error: error.message, statementId });
      return [];
    }
  }

  /**
   * Update split payment status
   */
  async updateSplitPayment(splitId, paymentData, updatedBy) {
    try {
      const updatePayload = {
        payment_status: paymentData.status,
        payment_method: paymentData.method || null,
        payment_reference: paymentData.reference || null,
        paid_at: paymentData.paid_at || new Date().toISOString(),
        notes: paymentData.notes || null,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      };

      const { data, error } = await supabase
        .from(this.splitsTableName)
        .update(updatePayload)
        .eq('split_id', splitId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update split payment', { error: error.message, splitId });
        throw new Error(`Split payment update failed: ${error.message}`);
      }

      logger.info('Split payment updated', { 
        splitId,
        status: paymentData.status,
        amount: data.final_amount 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Split payment update error', { error: error.message, splitId });
      throw error;
    }
  }

  // ========== Earnings Management ==========

  /**
   * Create earnings record
   */
  async createEarnings(earningsData) {
    try {
      const earningsToCreate = {
        earnings_id: earningsData.earnings_id,
        artist_id: earningsData.artist_id,
        release_id: earningsData.release_id || null,
        track_id: earningsData.track_id || null,
        platform: earningsData.platform,
        territory: earningsData.territory || 'worldwide',
        period_start: earningsData.period_start,
        period_end: earningsData.period_end,
        revenue_type: earningsData.revenue_type, // streaming, download, sync, etc.
        gross_revenue: earningsData.gross_revenue || 0,
        net_revenue: earningsData.net_revenue || 0,
        currency: earningsData.currency || 'USD',
        exchange_rate: earningsData.exchange_rate || 1.0,
        streams: earningsData.streams || 0,
        downloads: earningsData.downloads || 0,
        units_sold: earningsData.units_sold || 0,
        price_per_unit: earningsData.price_per_unit || 0,
        platform_fee_rate: earningsData.platform_fee_rate || 0,
        platform_fee_amount: earningsData.platform_fee_amount || 0,
        distribution_fee_rate: earningsData.distribution_fee_rate || 0,
        distribution_fee_amount: earningsData.distribution_fee_amount || 0,
        tax_rate: earningsData.tax_rate || 0,
        tax_amount: earningsData.tax_amount || 0,
        other_deductions: earningsData.other_deductions || 0,
        reporting_currency: earningsData.reporting_currency || 'USD',
        reporting_exchange_rate: earningsData.reporting_exchange_rate || 1.0,
        reporting_gross_revenue: earningsData.reporting_gross_revenue || 0,
        reporting_net_revenue: earningsData.reporting_net_revenue || 0,
        processed_at: earningsData.processed_at || new Date().toISOString(),
        metadata: earningsData.metadata || {},
        created_by: earningsData.created_by,
        updated_by: earningsData.created_by
      };

      const { data, error } = await supabase
        .from(this.earningsTableName)
        .insert([earningsToCreate])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create earnings', { error: error.message, earningsData });
        throw new Error(`Earnings creation failed: ${error.message}`);
      }

      logger.info('Earnings created successfully', { 
        earningsId: data.earnings_id,
        platform: data.platform,
        revenue: data.net_revenue 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Earnings creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get earnings for a statement
   */
  async getStatementEarnings(statementId) {
    try {
      // Get the statement first to get the period and artist
      const statement = await this.findStatementById(statementId);
      if (!statement) return [];

      const { data, error } = await supabase
        .from(this.earningsTableName)
        .select('*')
        .eq('artist_id', statement.artist_id)
        .gte('period_start', statement.period_start)
        .lte('period_end', statement.period_end)
        .order('platform')
        .order('revenue_type');

      if (error) {
        logger.error('Failed to get statement earnings', { error: error.message, statementId });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Statement earnings error', { error: error.message, statementId });
      return [];
    }
  }

  // ========== Analytics and Reporting ==========

  /**
   * Get royalty analytics for dashboard
   */
  async getRoyaltyAnalytics(filters = {}) {
    try {
      const {
        artist_id,
        period_start,
        period_end,
        currency = 'USD'
      } = filters;

      const baseQuery = supabase
        .from(this.tableName)
        .select('*')
        .eq('currency', currency);

      if (artist_id) {
        baseQuery.eq('artist_id', artist_id);
      }

      if (period_start) {
        baseQuery.gte('period_start', period_start);
      }

      if (period_end) {
        baseQuery.lte('period_end', period_end);
      }

      const [totalRevenue, unpaidAmount, platformBreakdown, territoryBreakdown] = await Promise.all([
        // Total revenue
        baseQuery.clone().select('total_net_revenue'),
        
        // Unpaid amount
        baseQuery.clone().eq('payment_status', 'unpaid').select('payable_amount'),
        
        // Platform breakdown
        supabase.rpc('get_royalty_platform_breakdown', { 
          artist_filter: artist_id,
          start_date: period_start,
          end_date: period_end,
          target_currency: currency
        }),
        
        // Territory breakdown
        supabase.rpc('get_royalty_territory_breakdown', {
          artist_filter: artist_id,
          start_date: period_start,
          end_date: period_end,
          target_currency: currency
        })
      ]);

      const total = totalRevenue.data?.reduce((sum, item) => sum + (item.total_net_revenue || 0), 0) || 0;
      const unpaid = unpaidAmount.data?.reduce((sum, item) => sum + (item.payable_amount || 0), 0) || 0;

      return {
        total_revenue: total,
        unpaid_amount: unpaid,
        paid_amount: total - unpaid,
        platform_breakdown: platformBreakdown.data || [],
        territory_breakdown: territoryBreakdown.data || [],
        currency,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Royalty analytics error', { error: error.message });
      return {
        total_revenue: 0,
        unpaid_amount: 0,
        paid_amount: 0,
        platform_breakdown: [],
        territory_breakdown: [],
        currency,
        generated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Get pending payments summary
   */
  async getPendingPayments(filters = {}) {
    try {
      const { artist_id, currency = 'USD' } = filters;

      let query = supabase
        .from(this.tableName)
        .select(`
          statement_id,
          artist_id,
          period_start,
          period_end,
          payable_amount,
          generated_at,
          artists:artist_id (
            name,
            payment_details
          )
        `)
        .eq('payment_status', 'unpaid')
        .eq('approval_status', 'approved')
        .eq('currency', currency)
        .order('period_end');

      if (artist_id) {
        query = query.eq('artist_id', artist_id);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to get pending payments', { error: error.message });
        throw new Error(`Pending payments lookup failed: ${error.message}`);
      }

      const totalAmount = data?.reduce((sum, item) => sum + (item.payable_amount || 0), 0) || 0;

      return {
        statements: data || [],
        total_amount: totalAmount,
        count: data?.length || 0,
        currency
      };
    } catch (error) {
      logger.error('Pending payments error', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate royalty summary for period
   */
  async calculateRoyaltySummary(artistId, periodStart, periodEnd) {
    try {
      const [statements, earnings, splits] = await Promise.all([
        // Get statements for period
        this.findStatements({
          artist_id: artistId,
          period_start_after: periodStart,
          period_end_before: periodEnd
        }),
        
        // Get earnings for period
        supabase
          .from(this.earningsTableName)
          .select('*')
          .eq('artist_id', artistId)
          .gte('period_start', periodStart)
          .lte('period_end', periodEnd),
        
        // Get splits for period
        supabase
          .from(this.splitsTableName)
          .select(`
            *,
            royalty_statements:statement_id (
              period_start,
              period_end
            )
          `)
          .eq('artist_id', artistId)
      ]);

      const summary = {
        period: { start: periodStart, end: periodEnd },
        statements_count: statements.data?.length || 0,
        total_gross_revenue: 0,
        total_net_revenue: 0,
        total_deductions: 0,
        total_payable: 0,
        revenue_by_type: {},
        revenue_by_platform: {},
        revenue_by_territory: {},
        payment_status: {
          paid: 0,
          unpaid: 0,
          pending: 0
        }
      };

      // Process statements
      statements.data?.forEach(statement => {
        summary.total_gross_revenue += statement.total_gross_revenue || 0;
        summary.total_net_revenue += statement.total_net_revenue || 0;
        summary.total_deductions += statement.total_deductions || 0;
        summary.total_payable += statement.payable_amount || 0;

        // Count payment statuses
        if (statement.payment_status === 'paid') {
          summary.payment_status.paid += statement.payable_amount || 0;
        } else if (statement.payment_status === 'unpaid') {
          summary.payment_status.unpaid += statement.payable_amount || 0;
        } else {
          summary.payment_status.pending += statement.payable_amount || 0;
        }
      });

      // Process earnings by type and platform
      earnings.data?.forEach(earning => {
        const type = earning.revenue_type;
        const platform = earning.platform;
        const territory = earning.territory;

        summary.revenue_by_type[type] = (summary.revenue_by_type[type] || 0) + earning.net_revenue;
        summary.revenue_by_platform[platform] = (summary.revenue_by_platform[platform] || 0) + earning.net_revenue;
        summary.revenue_by_territory[territory] = (summary.revenue_by_territory[territory] || 0) + earning.net_revenue;
      });

      return summary;
    } catch (error) {
      logger.error('Royalty summary calculation error', { error: error.message, artistId });
      throw error;
    }
  }

  // ========== Related Data Methods ==========

  /**
   * Get statement artist information
   */
  async getStatementArtist(artistId) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('artist_id, name, profile_image_url, payment_details, tax_info')
        .eq('artist_id', artistId)
        .single();

      if (error) {
        logger.error('Failed to get statement artist', { error: error.message, artistId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Statement artist error', { error: error.message, artistId });
      return null;
    }
  }

  /**
   * Get statement release information
   */
  async getStatementRelease(releaseId) {
    try {
      const { data, error } = await supabase
        .from('releases')
        .select('release_id, title, type, release_date')
        .eq('release_id', releaseId)
        .single();

      if (error) {
        logger.error('Failed to get statement release', { error: error.message, releaseId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Statement release error', { error: error.message, releaseId });
      return null;
    }
  }

  /**
   * Get statement track information
   */
  async getStatementTrack(trackId) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('track_id, title, duration_ms, isrc')
        .eq('track_id', trackId)
        .single();

      if (error) {
        logger.error('Failed to get statement track', { error: error.message, trackId });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Statement track error', { error: error.message, trackId });
      return null;
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
   * Batch create earnings from external data
   */
  async batchCreateEarnings(earningsArray) {
    try {
      const earningsToCreate = earningsArray.map(earnings => ({
        ...earnings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from(this.earningsTableName)
        .insert(earningsToCreate)
        .select();

      if (error) {
        logger.error('Batch earnings creation failed', { error: error.message });
        throw new Error(`Batch earnings creation failed: ${error.message}`);
      }

      logger.info('Earnings batch created successfully', { count: data.length });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Batch earnings creation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Approve statement for payment
   */
  async approveStatement(statementId, approvedBy, notes = null) {
    try {
      const updatePayload = {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        approval_notes: notes,
        updated_at: new Date().toISOString(),
        updated_by: approvedBy
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('statement_id', statementId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to approve statement', { error: error.message, statementId });
        throw new Error(`Statement approval failed: ${error.message}`);
      }

      logger.info('Statement approved successfully', { 
        statementId,
        approvedBy,
        amount: data.payable_amount 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Statement approval error', { error: error.message, statementId });
      throw error;
    }
  }

  /**
   * Mark statement as paid
   */
  async markStatementPaid(statementId, paymentData, paidBy) {
    try {
      const updatePayload = {
        payment_status: 'paid',
        paid_at: paymentData.paid_at || new Date().toISOString(),
        payment_method: paymentData.method || null,
        payment_reference: paymentData.reference || null,
        payment_notes: paymentData.notes || null,
        updated_at: new Date().toISOString(),
        updated_by: paidBy
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatePayload)
        .eq('statement_id', statementId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to mark statement paid', { error: error.message, statementId });
        throw new Error(`Payment marking failed: ${error.message}`);
      }

      logger.info('Statement marked as paid', { 
        statementId,
        amount: data.payable_amount,
        method: paymentData.method 
      });

      this.invalidateCache();
      return data;
    } catch (error) {
      logger.error('Payment marking error', { error: error.message, statementId });
      throw error;
    }
  }
}

module.exports = RoyaltyRepository;
