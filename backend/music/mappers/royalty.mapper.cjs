/**
 * Royalty Mapper
 * Data transformation layer for royalty and financial entities
 * Handles mapping between database models, DTOs, financial reports, and payout formats
 */

const logger = require('../../config/logger.cjs');

class RoyaltyMapper {
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
      includeTransactions = false,
      includeSplits = true,
      includeTaxInfo = false,
      includeAnalytics = false
    } = options;

    try {
      const dto = {
        id: dbModel.id,
        track_id: dbModel.track_id,
        release_id: dbModel.release_id,
        artist_id: dbModel.artist_id,
        
        // Financial details
        total_amount: dbModel.total_amount,
        currency: dbModel.currency,
        exchange_rate: dbModel.exchange_rate,
        base_currency_amount: dbModel.base_currency_amount,
        
        // Royalty breakdown
        mechanical_royalty: dbModel.mechanical_royalty,
        performance_royalty: dbModel.performance_royalty,
        synchronization_royalty: dbModel.synchronization_royalty,
        master_recording_royalty: dbModel.master_recording_royalty,
        
        // Revenue sources
        streaming_revenue: dbModel.streaming_revenue,
        download_revenue: dbModel.download_revenue,
        physical_revenue: dbModel.physical_revenue,
        sync_revenue: dbModel.sync_revenue,
        broadcast_revenue: dbModel.broadcast_revenue,
        
        // Platform breakdown
        spotify_revenue: dbModel.spotify_revenue,
        apple_music_revenue: dbModel.apple_music_revenue,
        youtube_revenue: dbModel.youtube_revenue,
        amazon_music_revenue: dbModel.amazon_music_revenue,
        tidal_revenue: dbModel.tidal_revenue,
        other_platforms_revenue: dbModel.other_platforms_revenue,
        
        // Territory breakdown
        domestic_revenue: dbModel.domestic_revenue,
        international_revenue: dbModel.international_revenue,
        territory_breakdown: dbModel.territory_breakdown ? JSON.parse(dbModel.territory_breakdown) : {},
        
        // Usage metrics
        total_streams: dbModel.total_streams,
        total_downloads: dbModel.total_downloads,
        total_sales: dbModel.total_sales,
        unique_listeners: dbModel.unique_listeners,
        
        // Rates and calculations
        average_per_stream_rate: dbModel.average_per_stream_rate,
        average_per_download_rate: dbModel.average_per_download_rate,
        effective_royalty_rate: dbModel.effective_royalty_rate,
        
        // Deductions
        platform_commission: dbModel.platform_commission,
        distributor_commission: dbModel.distributor_commission,
        admin_fees: dbModel.admin_fees,
        processing_fees: dbModel.processing_fees,
        tax_withholding: dbModel.tax_withholding,
        total_deductions: dbModel.total_deductions,
        net_amount: dbModel.net_amount,
        
        // Payout information
        payout_status: dbModel.payout_status,
        payout_date: dbModel.payout_date,
        payment_method: dbModel.payment_method,
        payment_reference: dbModel.payment_reference,
        
        // Period information
        reporting_period_start: dbModel.reporting_period_start,
        reporting_period_end: dbModel.reporting_period_end,
        accrual_date: dbModel.accrual_date,
        settlement_date: dbModel.settlement_date,
        
        // Rights and ownership
        ownership_percentage: dbModel.ownership_percentage,
        publishing_share: dbModel.publishing_share,
        master_share: dbModel.master_share,
        
        // Status and metadata
        status: dbModel.status,
        reconciliation_status: dbModel.reconciliation_status,
        audit_status: dbModel.audit_status,
        
        // Timestamps
        created_at: dbModel.created_at,
        updated_at: dbModel.updated_at
      };

      // Conditional includes
      if (includeTransactions && dbModel.transactions) {
        dto.transactions = this.mapTransactions(dbModel.transactions);
      }

      if (includeSplits && dbModel.splits) {
        dto.splits = this.mapSplits(dbModel.splits);
      }

      if (includeTaxInfo && dbModel.tax_info) {
        dto.tax_info = this.mapTaxInfo(dbModel.tax_info);
      }

      if (includeAnalytics && dbModel.analytics) {
        dto.analytics = this.mapAnalytics(dbModel.analytics);
      }

      return dto;
    } catch (error) {
      this.logger.error('Error mapping royalty to DTO', { error: error.message, royaltyId: dbModel.id });
      throw new Error('Failed to map royalty to DTO');
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
        track_id: dto.track_id,
        release_id: dto.release_id,
        artist_id: dto.artist_id,
        
        // Financial details
        total_amount: dto.total_amount,
        currency: dto.currency || 'USD',
        exchange_rate: dto.exchange_rate || 1.0,
        base_currency_amount: dto.base_currency_amount,
        
        // Royalty breakdown
        mechanical_royalty: dto.mechanical_royalty || 0,
        performance_royalty: dto.performance_royalty || 0,
        synchronization_royalty: dto.synchronization_royalty || 0,
        master_recording_royalty: dto.master_recording_royalty || 0,
        
        // Revenue sources
        streaming_revenue: dto.streaming_revenue || 0,
        download_revenue: dto.download_revenue || 0,
        physical_revenue: dto.physical_revenue || 0,
        sync_revenue: dto.sync_revenue || 0,
        broadcast_revenue: dto.broadcast_revenue || 0,
        
        // Platform breakdown
        spotify_revenue: dto.spotify_revenue || 0,
        apple_music_revenue: dto.apple_music_revenue || 0,
        youtube_revenue: dto.youtube_revenue || 0,
        amazon_music_revenue: dto.amazon_music_revenue || 0,
        tidal_revenue: dto.tidal_revenue || 0,
        other_platforms_revenue: dto.other_platforms_revenue || 0,
        
        // Territory breakdown
        domestic_revenue: dto.domestic_revenue || 0,
        international_revenue: dto.international_revenue || 0,
        territory_breakdown: dto.territory_breakdown ? JSON.stringify(dto.territory_breakdown) : null,
        
        // Usage metrics
        total_streams: dto.total_streams || 0,
        total_downloads: dto.total_downloads || 0,
        total_sales: dto.total_sales || 0,
        unique_listeners: dto.unique_listeners || 0,
        
        // Rates and calculations
        average_per_stream_rate: dto.average_per_stream_rate || 0,
        average_per_download_rate: dto.average_per_download_rate || 0,
        effective_royalty_rate: dto.effective_royalty_rate || 0,
        
        // Deductions
        platform_commission: dto.platform_commission || 0,
        distributor_commission: dto.distributor_commission || 0,
        admin_fees: dto.admin_fees || 0,
        processing_fees: dto.processing_fees || 0,
        tax_withholding: dto.tax_withholding || 0,
        total_deductions: dto.total_deductions || 0,
        net_amount: dto.net_amount || 0,
        
        // Payout information
        payout_status: dto.payout_status || 'pending',
        payout_date: dto.payout_date,
        payment_method: dto.payment_method,
        payment_reference: dto.payment_reference,
        
        // Period information
        reporting_period_start: dto.reporting_period_start,
        reporting_period_end: dto.reporting_period_end,
        accrual_date: dto.accrual_date,
        settlement_date: dto.settlement_date,
        
        // Rights and ownership
        ownership_percentage: dto.ownership_percentage || 100,
        publishing_share: dto.publishing_share || 0,
        master_share: dto.master_share || 0,
        
        // Status and metadata
        status: dto.status || 'pending',
        reconciliation_status: dto.reconciliation_status || 'unreconciled',
        audit_status: dto.audit_status || 'not_audited'
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
      this.logger.error('Error mapping DTO to royalty model', { error: error.message });
      throw new Error('Failed to map DTO to royalty model');
    }
  }

  // ========== API Response Mapping ==========

  /**
   * Map to API response format
   */
  toAPIResponse(data, options = {}) {
    if (!data) return null;

    const {
      includeBreakdown = true,
      includeSplits = false,
      includeTransactions = false,
      format = 'full'
    } = options;

    try {
      if (format === 'summary') {
        return this.toSummaryResponse(data);
      }

      const response = {
        id: data.id,
        track_id: data.track_id,
        release_id: data.release_id,
        artist_id: data.artist_id,
        
        // Financial summary
        total_amount: this.formatCurrency(data.total_amount, data.currency),
        net_amount: this.formatCurrency(data.net_amount, data.currency),
        currency: data.currency,
        
        // Key metrics
        total_streams: data.total_streams,
        average_per_stream_rate: this.formatCurrency(data.average_per_stream_rate, data.currency),
        effective_royalty_rate: this.formatPercentage(data.effective_royalty_rate),
        
        // Payout info
        payout_status: data.payout_status,
        payout_date: data.payout_date,
        
        // Period
        reporting_period: {
          start: data.reporting_period_start,
          end: data.reporting_period_end
        },
        
        // Status
        status: data.status,
        reconciliation_status: data.reconciliation_status,
        
        // Timestamps
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Conditional includes
      if (includeBreakdown) {
        response.breakdown = this.formatBreakdownForAPI(data);
      }

      if (includeSplits && data.splits) {
        response.splits = this.formatSplitsForAPI(data.splits);
      }

      if (includeTransactions && data.transactions) {
        response.transactions = this.formatTransactionsForAPI(data.transactions);
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
      total_amount: this.formatCurrency(data.total_amount, data.currency),
      net_amount: this.formatCurrency(data.net_amount, data.currency),
      currency: data.currency,
      payout_status: data.payout_status,
      period: `${data.reporting_period_start} - ${data.reporting_period_end}`,
      status: data.status
    };
  }

  // ========== Financial Report Mapping ==========

  /**
   * Map to financial report format
   */
  toFinancialReport(data, reportType = 'standard', options = {}) {
    if (!data) return null;

    const {
      includeTaxDetails = false,
      includeProjections = false,
      consolidateByPeriod = true
    } = options;

    try {
      const report = {
        report_metadata: {
          type: reportType,
          generated_at: new Date().toISOString(),
          currency: data.currency || 'USD',
          period: {
            start: data.reporting_period_start,
            end: data.reporting_period_end
          }
        },
        
        summary: {
          total_revenue: data.total_amount,
          net_revenue: data.net_amount,
          total_deductions: data.total_deductions,
          streams: data.total_streams,
          downloads: data.total_downloads,
          unique_listeners: data.unique_listeners
        },
        
        revenue_breakdown: {
          by_source: {
            streaming: data.streaming_revenue,
            downloads: data.download_revenue,
            physical: data.physical_revenue,
            synchronization: data.sync_revenue,
            broadcast: data.broadcast_revenue
          },
          by_platform: {
            spotify: data.spotify_revenue,
            apple_music: data.apple_music_revenue,
            youtube: data.youtube_revenue,
            amazon_music: data.amazon_music_revenue,
            tidal: data.tidal_revenue,
            others: data.other_platforms_revenue
          },
          by_territory: {
            domestic: data.domestic_revenue,
            international: data.international_revenue,
            detailed: data.territory_breakdown || {}
          }
        },
        
        royalty_breakdown: {
          mechanical: data.mechanical_royalty,
          performance: data.performance_royalty,
          synchronization: data.synchronization_royalty,
          master_recording: data.master_recording_royalty
        },
        
        deductions: {
          platform_commission: data.platform_commission,
          distributor_commission: data.distributor_commission,
          admin_fees: data.admin_fees,
          processing_fees: data.processing_fees,
          tax_withholding: data.tax_withholding
        },
        
        rates_and_metrics: {
          average_per_stream: data.average_per_stream_rate,
          average_per_download: data.average_per_download_rate,
          effective_royalty_rate: data.effective_royalty_rate,
          commission_rate: this.calculateCommissionRate(data),
          net_margin: this.calculateNetMargin(data)
        }
      };

      // Report type specific additions
      switch (reportType) {
        case 'detailed':
          report.detailed_analysis = this.generateDetailedAnalysis(data);
          break;
        case 'tax':
          report.tax_summary = this.generateTaxSummary(data);
          break;
        case 'performance':
          report.performance_metrics = this.generatePerformanceMetrics(data);
          break;
        case 'comparison':
          report.comparison_data = this.generateComparisonData(data, options);
          break;
      }

      // Conditional includes
      if (includeTaxDetails) {
        report.tax_details = this.formatTaxDetails(data);
      }

      if (includeProjections) {
        report.projections = this.generateProjections(data);
      }

      return report;
    } catch (error) {
      this.logger.error('Error mapping to financial report', { error: error.message, reportType });
      throw new Error('Failed to map to financial report');
    }
  }

  /**
   * Map to payout format
   */
  toPayoutFormat(data, options = {}) {
    if (!data) return null;

    const {
      includeAuditTrail = false,
      includeBankingDetails = false,
      splitByRecipient = true
    } = options;

    try {
      const payout = {
        payout_id: data.payment_reference || data.id,
        
        // Financial details
        gross_amount: data.total_amount,
        net_amount: data.net_amount,
        currency: data.currency,
        exchange_rate: data.exchange_rate || 1.0,
        
        // Deductions summary
        total_deductions: data.total_deductions,
        deduction_breakdown: {
          platform_fees: data.platform_commission,
          distributor_fees: data.distributor_commission,
          admin_fees: data.admin_fees,
          processing_fees: data.processing_fees,
          tax_withholding: data.tax_withholding
        },
        
        // Payout details
        payment_method: data.payment_method,
        payout_date: data.payout_date,
        settlement_date: data.settlement_date,
        status: data.payout_status,
        
        // Period information
        earnings_period: {
          start: data.reporting_period_start,
          end: data.reporting_period_end
        },
        
        // Performance summary
        streams: data.total_streams,
        downloads: data.total_downloads,
        revenue_sources: this.summarizeRevenueSources(data),
        
        // Ownership and splits
        ownership_percentage: data.ownership_percentage,
        publishing_share: data.publishing_share,
        master_share: data.master_share
      };

      // Conditional includes
      if (includeAuditTrail) {
        payout.audit_trail = this.generateAuditTrail(data);
      }

      if (includeBankingDetails) {
        payout.banking_details = this.formatBankingDetails(data);
      }

      if (splitByRecipient && data.splits) {
        payout.recipient_splits = this.formatRecipientSplits(data.splits);
      }

      return payout;
    } catch (error) {
      this.logger.error('Error mapping to payout format', { error: error.message });
      throw new Error('Failed to map to payout format');
    }
  }

  // ========== Tax and Compliance Mapping ==========

  /**
   * Map to tax report format
   */
  toTaxReport(data, taxYear, options = {}) {
    if (!data) return null;

    const {
      includeForeignTax = true,
      includeWithholding = true,
      consolidateByQuarter = false
    } = options;

    try {
      const taxReport = {
        tax_year: taxYear,
        taxpayer_info: {
          entity_id: data.artist_id,
          entity_type: 'individual', // or 'business'
          tax_jurisdiction: this.determineTaxJurisdiction(data)
        },
        
        income_summary: {
          total_gross_income: data.total_amount,
          total_net_income: data.net_amount,
          
          // Income by category
          royalty_income: {
            mechanical: data.mechanical_royalty,
            performance: data.performance_royalty,
            synchronization: data.synchronization_royalty,
            master_recording: data.master_recording_royalty
          },
          
          // Income by source
          domestic_income: data.domestic_revenue,
          foreign_income: data.international_revenue
        },
        
        deductions: {
          business_expenses: {
            platform_fees: data.platform_commission,
            distribution_fees: data.distributor_commission,
            admin_fees: data.admin_fees,
            processing_fees: data.processing_fees
          },
          total_deductible: this.calculateDeductibleExpenses(data)
        },
        
        tax_obligations: {
          withholding_tax: data.tax_withholding,
          estimated_tax_due: this.calculateEstimatedTax(data),
          foreign_tax_credits: this.calculateForeignTaxCredits(data)
        },
        
        // Form-specific data
        form_1099_data: this.generate1099Data(data),
        
        // International reporting
        foreign_income_breakdown: this.generateForeignIncomeBreakdown(data),
        
        // Supporting documentation
        period_covered: {
          start: data.reporting_period_start,
          end: data.reporting_period_end
        },
        
        // Compliance status
        compliance_status: {
          w9_on_file: true, // This would come from user profile
          tax_treaty_applicable: this.checkTaxTreaty(data),
          backup_withholding: false
        }
      };

      return taxReport;
    } catch (error) {
      this.logger.error('Error mapping to tax report', { error: error.message, taxYear });
      throw new Error('Failed to map to tax report');
    }
  }

  /**
   * Map to accounting format (QuickBooks, Xero, etc.)
   */
  toAccountingFormat(data, format = 'quickbooks', options = {}) {
    if (!data) return null;

    try {
      switch (format.toLowerCase()) {
        case 'quickbooks':
          return this.toQuickBooksFormat(data, options);
        case 'xero':
          return this.toXeroFormat(data, options);
        case 'freshbooks':
          return this.toFreshBooksFormat(data, options);
        case 'wave':
          return this.toWaveFormat(data, options);
        default:
          return this.toGenericAccountingFormat(data, options);
      }
    } catch (error) {
      this.logger.error('Error mapping to accounting format', { error: error.message, format });
      throw new Error('Failed to map to accounting format');
    }
  }

  // ========== Platform-Specific Reporting ==========

  /**
   * Map to Spotify for Artists format
   */
  toSpotifyReportFormat(data) {
    if (!data) return null;

    try {
      return {
        track_name: data.track_title,
        artist_name: data.artist_name,
        album_name: data.album_title,
        
        // Performance metrics
        streams: data.total_streams,
        stream_share: this.calculateStreamShare(data),
        listeners: data.unique_listeners,
        
        // Financial data
        net_revenue: data.spotify_revenue || 0,
        revenue_share: this.calculateRevenueShare(data, 'spotify'),
        
        // Geographic breakdown
        top_countries: this.extractTopCountries(data.territory_breakdown, 'spotify'),
        
        // Time period
        period_start: data.reporting_period_start,
        period_end: data.reporting_period_end,
        
        // Additional metrics
        completion_rate: data.analytics?.completion_rate || 0,
        skip_rate: data.analytics?.skip_rate || 0,
        playlist_reach: data.analytics?.playlist_additions || 0
      };
    } catch (error) {
      this.logger.error('Error mapping to Spotify report format', { error: error.message });
      throw new Error('Failed to map to Spotify report format');
    }
  }

  /**
   * Map to Apple Music for Artists format
   */
  toAppleMusicReportFormat(data) {
    if (!data) return null;

    try {
      return {
        song_title: data.track_title,
        artist_name: data.artist_name,
        album_title: data.album_title,
        
        // Performance data
        plays: data.total_streams,
        unique_listeners: data.unique_listeners,
        
        // Revenue data
        earnings: data.apple_music_revenue || 0,
        
        // Geographic data
        country_breakdown: this.extractCountryBreakdown(data.territory_breakdown, 'apple'),
        
        // Engagement metrics
        completion_percentage: data.analytics?.completion_rate || 0,
        shazams: data.analytics?.shazams || 0,
        
        // Period
        report_date_range: {
          from: data.reporting_period_start,
          to: data.reporting_period_end
        }
      };
    } catch (error) {
      this.logger.error('Error mapping to Apple Music report format', { error: error.message });
      throw new Error('Failed to map to Apple Music report format');
    }
  }

  /**
   * Map to YouTube Analytics format
   */
  toYouTubeAnalyticsFormat(data) {
    if (!data) return null;

    try {
      return {
        video_title: data.track_title,
        channel_name: data.artist_name,
        
        // View metrics
        views: data.total_streams,
        unique_viewers: data.unique_listeners,
        watch_time_hours: this.calculateWatchTimeHours(data),
        average_view_duration: this.calculateAverageViewDuration(data),
        
        // Revenue metrics
        estimated_revenue: data.youtube_revenue || 0,
        rpm: this.calculateRPM(data), // Revenue per mille
        cpm: this.calculateCPM(data), // Cost per mille
        
        // Engagement metrics
        likes: data.analytics?.likes || 0,
        comments: data.analytics?.comments || 0,
        shares: data.analytics?.shares || 0,
        subscriber_gain: data.analytics?.subscriber_gain || 0,
        
        // Traffic sources
        traffic_sources: this.analyzeTrafficSources(data),
        
        // Geographic data
        top_geographies: this.extractTopGeographies(data.territory_breakdown, 'youtube'),
        
        // Demographics
        age_groups: data.analytics?.age_groups || {},
        gender_breakdown: data.analytics?.gender_breakdown || {},
        
        // Time period
        date_range: {
          start_date: data.reporting_period_start,
          end_date: data.reporting_period_end
        }
      };
    } catch (error) {
      this.logger.error('Error mapping to YouTube Analytics format', { error: error.message });
      throw new Error('Failed to map to YouTube Analytics format');
    }
  }

  // ========== Helper Methods ==========

  /**
   * Map transaction details
   */
  mapTransactions(transactions) {
    if (!Array.isArray(transactions)) return [];

    return transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      platform: transaction.platform,
      date: transaction.date,
      reference: transaction.reference,
      status: transaction.status,
      fees: transaction.fees || 0
    }));
  }

  /**
   * Map split details
   */
  mapSplits(splits) {
    if (!Array.isArray(splits)) return [];

    return splits.map(split => ({
      id: split.id,
      recipient_id: split.recipient_id,
      recipient_name: split.recipient_name,
      role: split.role,
      percentage: split.percentage,
      amount: split.amount,
      currency: split.currency,
      payment_method: split.payment_method,
      status: split.status
    }));
  }

  /**
   * Map tax information
   */
  mapTaxInfo(taxInfo) {
    if (!taxInfo) return null;

    return {
      tax_id: taxInfo.tax_id,
      tax_jurisdiction: taxInfo.tax_jurisdiction,
      withholding_rate: taxInfo.withholding_rate,
      treaty_rate: taxInfo.treaty_rate,
      exemption_status: taxInfo.exemption_status,
      backup_withholding: taxInfo.backup_withholding
    };
  }

  /**
   * Map analytics data
   */
  mapAnalytics(analytics) {
    if (!analytics) return null;

    return {
      performance_score: analytics.performance_score,
      trend_direction: analytics.trend_direction,
      growth_rate: analytics.growth_rate,
      market_share: analytics.market_share,
      competitive_position: analytics.competitive_position,
      forecast: analytics.forecast
    };
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return null;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage
   */
  formatPercentage(value) {
    if (value === null || value === undefined) return null;
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Format breakdown for API
   */
  formatBreakdownForAPI(data) {
    return {
      revenue_sources: {
        streaming: this.formatCurrency(data.streaming_revenue, data.currency),
        downloads: this.formatCurrency(data.download_revenue, data.currency),
        physical: this.formatCurrency(data.physical_revenue, data.currency),
        sync: this.formatCurrency(data.sync_revenue, data.currency),
        broadcast: this.formatCurrency(data.broadcast_revenue, data.currency)
      },
      platforms: {
        spotify: this.formatCurrency(data.spotify_revenue, data.currency),
        apple_music: this.formatCurrency(data.apple_music_revenue, data.currency),
        youtube: this.formatCurrency(data.youtube_revenue, data.currency),
        amazon_music: this.formatCurrency(data.amazon_music_revenue, data.currency),
        tidal: this.formatCurrency(data.tidal_revenue, data.currency),
        others: this.formatCurrency(data.other_platforms_revenue, data.currency)
      },
      territories: {
        domestic: this.formatCurrency(data.domestic_revenue, data.currency),
        international: this.formatCurrency(data.international_revenue, data.currency)
      },
      deductions: {
        platform_commission: this.formatCurrency(data.platform_commission, data.currency),
        distributor_commission: this.formatCurrency(data.distributor_commission, data.currency),
        admin_fees: this.formatCurrency(data.admin_fees, data.currency),
        processing_fees: this.formatCurrency(data.processing_fees, data.currency),
        tax_withholding: this.formatCurrency(data.tax_withholding, data.currency)
      }
    };
  }

  /**
   * Format splits for API
   */
  formatSplitsForAPI(splits) {
    return splits.map(split => ({
      recipient: split.recipient_name,
      role: split.role,
      percentage: this.formatPercentage(split.percentage / 100),
      amount: this.formatCurrency(split.amount, split.currency),
      status: split.status
    }));
  }

  /**
   * Format transactions for API
   */
  formatTransactionsForAPI(transactions) {
    return transactions.map(transaction => ({
      id: transaction.id,
      platform: transaction.platform,
      type: transaction.type,
      amount: this.formatCurrency(transaction.amount, transaction.currency),
      date: transaction.date,
      status: transaction.status
    }));
  }

  /**
   * Calculate commission rate
   */
  calculateCommissionRate(data) {
    if (!data.total_amount || data.total_amount === 0) return 0;
    
    const totalCommissions = (data.platform_commission || 0) + (data.distributor_commission || 0);
    return totalCommissions / data.total_amount;
  }

  /**
   * Calculate net margin
   */
  calculateNetMargin(data) {
    if (!data.total_amount || data.total_amount === 0) return 0;
    
    return (data.net_amount || 0) / data.total_amount;
  }

  /**
   * Summarize revenue sources
   */
  summarizeRevenueSources(data) {
    const sources = [];
    
    if (data.streaming_revenue > 0) sources.push({ type: 'streaming', amount: data.streaming_revenue });
    if (data.download_revenue > 0) sources.push({ type: 'downloads', amount: data.download_revenue });
    if (data.physical_revenue > 0) sources.push({ type: 'physical', amount: data.physical_revenue });
    if (data.sync_revenue > 0) sources.push({ type: 'sync', amount: data.sync_revenue });
    if (data.broadcast_revenue > 0) sources.push({ type: 'broadcast', amount: data.broadcast_revenue });
    
    return sources.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Generate audit trail
   */
  generateAuditTrail(data) {
    return [
      {
        action: 'royalty_calculated',
        timestamp: data.created_at,
        amount: data.total_amount,
        currency: data.currency
      },
      {
        action: 'deductions_applied',
        timestamp: data.created_at,
        amount: data.total_deductions,
        currency: data.currency
      },
      {
        action: 'payout_initiated',
        timestamp: data.payout_date,
        amount: data.net_amount,
        currency: data.currency,
        method: data.payment_method
      }
    ];
  }

  /**
   * Format banking details (placeholder - real implementation would encrypt/mask)
   */
  formatBankingDetails(data) {
    return {
      method: data.payment_method,
      reference: data.payment_reference,
      // Real implementation would include properly secured banking details
      masked_account: 'XXXX-XXXX-1234'
    };
  }

  /**
   * Format recipient splits
   */
  formatRecipientSplits(splits) {
    return splits.map(split => ({
      recipient_id: split.recipient_id,
      name: split.recipient_name,
      role: split.role,
      percentage: split.percentage,
      gross_amount: split.amount,
      deductions: this.calculateSplitDeductions(split),
      net_amount: this.calculateSplitNetAmount(split),
      payment_method: split.payment_method
    }));
  }

  /**
   * Calculate split deductions
   */
  calculateSplitDeductions(split) {
    // Placeholder calculation
    const processingFee = split.amount * 0.029; // Example processing fee
    return {
      processing_fee: processingFee,
      total: processingFee
    };
  }

  /**
   * Calculate split net amount
   */
  calculateSplitNetAmount(split) {
    const deductions = this.calculateSplitDeductions(split);
    return split.amount - deductions.total;
  }

  // ========== QuickBooks Format ==========

  /**
   * Map to QuickBooks format
   */
  toQuickBooksFormat(data, options = {}) {
    return {
      TxnType: 'Invoice',
      CustomerRef: {
        value: data.artist_id,
        name: data.artist_name
      },
      Line: [
        {
          Amount: data.total_amount,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: 'ROYALTY',
              name: 'Music Royalties'
            },
            Qty: 1,
            UnitPrice: data.total_amount
          }
        }
      ],
      TxnDate: data.reporting_period_end,
      DueDate: data.payout_date,
      DocNumber: data.payment_reference,
      CurrencyRef: {
        value: data.currency,
        name: data.currency
      },
      ExchangeRate: data.exchange_rate || 1.0
    };
  }

  /**
   * Map to Xero format
   */
  toXeroFormat(data, options = {}) {
    return {
      Type: 'ACCREC',
      Contact: {
        ContactID: data.artist_id,
        Name: data.artist_name
      },
      Date: data.reporting_period_end,
      DueDate: data.payout_date,
      InvoiceNumber: data.payment_reference,
      Reference: `Royalties ${data.reporting_period_start} - ${data.reporting_period_end}`,
      CurrencyCode: data.currency,
      CurrencyRate: data.exchange_rate || 1.0,
      LineItems: [
        {
          Description: 'Music Royalties',
          Quantity: 1.0,
          UnitAmount: data.total_amount,
          AccountCode: '4000', // Revenue account
          TaxType: 'NONE'
        }
      ],
      Status: data.payout_status === 'paid' ? 'PAID' : 'AUTHORISED'
    };
  }

  /**
   * Map to FreshBooks format
   */
  toFreshBooksFormat(data, options = {}) {
    return {
      invoice: {
        customerid: data.artist_id,
        create_date: data.reporting_period_end,
        currency_code: data.currency,
        lines: [
          {
            name: 'Music Royalties',
            description: `Royalties for period ${data.reporting_period_start} - ${data.reporting_period_end}`,
            unit_cost: {
              amount: data.total_amount.toString(),
              code: data.currency
            },
            qty: 1,
            type: 0
          }
        ],
        terms: 'Net 30',
        notes: 'Payment for music streaming and download royalties'
      }
    };
  }

  /**
   * Map to Wave format
   */
  toWaveFormat(data, options = {}) {
    return {
      customer_id: data.artist_id,
      invoice_date: data.reporting_period_end,
      due_date: data.payout_date,
      invoice_number: data.payment_reference,
      currency: data.currency,
      items: [
        {
          product_id: null,
          description: 'Music Royalties',
          quantity: 1,
          price: data.total_amount,
          sales_tax: {
            rate: 0,
            amount: 0
          }
        }
      ],
      footer: `Royalties for period: ${data.reporting_period_start} to ${data.reporting_period_end}`,
      memo: 'Music streaming and download royalties'
    };
  }

  /**
   * Map to generic accounting format
   */
  toGenericAccountingFormat(data, options = {}) {
    return {
      transaction_type: 'revenue',
      date: data.reporting_period_end,
      customer_id: data.artist_id,
      customer_name: data.artist_name,
      amount: data.total_amount,
      currency: data.currency,
      description: 'Music Royalties',
      reference: data.payment_reference,
      account_category: 'Revenue',
      account_subcategory: 'Royalties',
      period: {
        start: data.reporting_period_start,
        end: data.reporting_period_end
      },
      payment_terms: 'Net 30',
      status: data.payout_status
    };
  }

  // Additional helper methods for advanced calculations and reporting would go here...
  
  /**
   * Placeholder methods for complex calculations
   */
  generateDetailedAnalysis() { return {}; }
  generateTaxSummary() { return {}; }
  generatePerformanceMetrics() { return {}; }
  generateComparisonData() { return {}; }
  formatTaxDetails() { return {}; }
  generateProjections() { return {}; }
  determineTaxJurisdiction() { return 'US'; }
  calculateDeductibleExpenses() { return 0; }
  calculateEstimatedTax() { return 0; }
  calculateForeignTaxCredits() { return 0; }
  generate1099Data() { return {}; }
  generateForeignIncomeBreakdown() { return {}; }
  checkTaxTreaty() { return false; }
  calculateStreamShare() { return 0; }
  calculateRevenueShare() { return 0; }
  extractTopCountries() { return []; }
  extractCountryBreakdown() { return {}; }
  calculateWatchTimeHours() { return 0; }
  calculateAverageViewDuration() { return 0; }
  calculateRPM() { return 0; }
  calculateCPM() { return 0; }
  analyzeTrafficSources() { return {}; }
  extractTopGeographies() { return []; }
}

module.exports = RoyaltyMapper;
