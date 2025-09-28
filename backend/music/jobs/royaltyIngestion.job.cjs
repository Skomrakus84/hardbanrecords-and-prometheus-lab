/**
 * Royalty Ingestion Job - Background Processing for Royalty Data Import
 * Handles automated import and processing of royalty reports from streaming platforms
 * Provides parsing, validation, and integration of earnings data
 */

const logger = require('../../config/logger.cjs');
const RoyaltyService = require('../services/royalty.service.cjs');
const ReleaseService = require('../services/release.service.cjs');
const TrackService = require('../services/track.service.cjs');
const NotificationService = require('../services/notifications.service.cjs');
const CurrencyUtil = require('../utils/currency.util.cjs');
const DateUtil = require('../utils/date.util.cjs');

class RoyaltyIngestionJob {
  constructor() {
    this.jobName = 'royalty_ingestion';
    this.maxRetries = 3;
    this.retryDelay = 10 * 60 * 1000; // 10 minutes
    this.timeoutMs = 60 * 60 * 1000; // 60 minutes
    
    // Job tracking
    this.activeJobs = new Map();
    this.jobQueue = [];
    this.isProcessing = false;
    
    // Processing priorities
    this.priorities = {
      urgent: 1,    // Manual upload, errors
      high: 2,      // Monthly reports
      normal: 3,    // Regular imports
      low: 4,       // Historical data
      batch: 5      // Bulk processing
    };

    // Platform-specific processors
    this.platformProcessors = {
      spotify: this.processSpotifyReport.bind(this),
      apple_music: this.processAppleMusicReport.bind(this),
      youtube_music: this.processYouTubeMusicReport.bind(this),
      amazon_music: this.processAmazonMusicReport.bind(this),
      tidal: this.processTidalReport.bind(this),
      deezer: this.processDeezerReport.bind(this)
    };

    // Expected report formats
    this.reportFormats = {
      csv: ['text/csv', '.csv'],
      excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx', '.xls'],
      json: ['application/json', '.json'],
      xml: ['application/xml', 'text/xml', '.xml']
    };
  }

  // ========== Job Queue Management ==========

  /**
   * Add royalty ingestion job to queue
   */
  async addRoyaltyIngestionJob(jobData, priority = 'normal') {
    try {
      const jobId = this.generateJobId();
      const job = {
        id: jobId,
        type: 'royalty_ingestion',
        priority: this.priorities[priority] || this.priorities.normal,
        data: jobData,
        status: 'queued',
        attempts: 0,
        created_at: new Date().toISOString(),
        scheduled_for: jobData.scheduled_for || new Date().toISOString(),
        timeout_at: new Date(Date.now() + this.timeoutMs).toISOString()
      };

      // Validate job data
      this.validateIngestionJobData(jobData);

      // Add to queue with priority ordering
      this.insertJobByPriority(job);
      
      logger.info('Royalty ingestion job added to queue', {
        jobId,
        platform: jobData.platform,
        reportType: jobData.report_type,
        priority
      });

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }

      return {
        jobId,
        status: 'queued',
        estimatedStartTime: this.estimateStartTime(job),
        queuePosition: this.getQueuePosition(jobId)
      };
    } catch (error) {
      logger.error('Failed to add royalty ingestion job', { error: error.message, jobData });
      throw error;
    }
  }

  /**
   * Process job queue
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    logger.info('Starting royalty ingestion job queue processing');

    try {
      while (this.jobQueue.length > 0) {
        // Get next job (highest priority first)
        const job = this.jobQueue.shift();
        
        // Check if job is scheduled for future
        if (new Date(job.scheduled_for) > new Date()) {
          // Re-add to queue and wait
          this.insertJobByPriority(job);
          await this.sleep(60000); // Check again in 1 minute
          continue;
        }

        // Check for timeout
        if (new Date() > new Date(job.timeout_at)) {
          await this.handleJobTimeout(job);
          continue;
        }

        await this.processRoyaltyIngestionJob(job);
      }
    } catch (error) {
      logger.error('Error processing royalty ingestion queue', { error: error.message });
    } finally {
      this.isProcessing = false;
      logger.info('Royalty ingestion job queue processing completed');
    }
  }

  /**
   * Process individual royalty ingestion job
   */
  async processRoyaltyIngestionJob(job) {
    const startTime = Date.now();
    this.activeJobs.set(job.id, job);

    try {
      logger.info('Processing royalty ingestion job', {
        jobId: job.id,
        platform: job.data.platform,
        reportType: job.data.report_type
      });

      // Update job status
      job.status = 'processing';
      job.started_at = new Date().toISOString();
      job.attempts += 1;

      // Download and validate report file
      const reportData = await this.downloadAndValidateReport(job.data);
      
      // Parse report based on platform and format
      const parsedData = await this.parseReport(reportData, job.data);
      
      // Validate parsed data
      const validation = await this.validateParsedData(parsedData, job.data);
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      // Process earnings data
      const ingestionResult = await this.processEarningsData(parsedData, job.data);

      // Generate royalty statements
      const statements = await this.generateRoyaltyStatements(ingestionResult, job.data);

      // Complete job
      await this.completeIngestionJob(job, {
        parsed_records: parsedData.length,
        processed_earnings: ingestionResult.earnings_count,
        generated_statements: statements.length,
        total_revenue: ingestionResult.total_revenue,
        processing_summary: ingestionResult.summary
      });

    } catch (error) {
      await this.handleJobError(job, error);
    } finally {
      this.activeJobs.delete(job.id);
      
      const duration = Date.now() - startTime;
      logger.info('Royalty ingestion job completed', {
        jobId: job.id,
        duration: `${duration}ms`,
        status: job.status
      });
    }
  }

  // ========== Report Processing ==========

  /**
   * Download and validate report file
   */
  async downloadAndValidateReport(jobData) {
    logger.info('Downloading report file', { 
      source: jobData.source_type,
      fileUrl: jobData.file_url 
    });

    let reportData;

    if (jobData.source_type === 'file_upload') {
      // Process uploaded file
      reportData = await this.processUploadedFile(jobData.file_path);
    } else if (jobData.source_type === 'api_fetch') {
      // Fetch from platform API
      reportData = await this.fetchFromPlatformAPI(jobData);
    } else if (jobData.source_type === 'url_download') {
      // Download from URL
      reportData = await this.downloadFromURL(jobData.file_url);
    } else {
      throw new Error(`Unsupported source type: ${jobData.source_type}`);
    }

    // Validate file format
    await this.validateReportFormat(reportData, jobData.expected_format);

    return reportData;
  }

  /**
   * Parse report based on platform and format
   */
  async parseReport(reportData, jobData) {
    const platform = jobData.platform.toLowerCase();
    const processor = this.platformProcessors[platform];

    if (!processor) {
      throw new Error(`No processor available for platform: ${platform}`);
    }

    logger.info('Parsing report', { 
      platform,
      format: jobData.expected_format,
      size: reportData.length 
    });

    return await processor(reportData, jobData);
  }

  /**
   * Process Spotify royalty report
   */
  async processSpotifyReport(reportData, jobData) {
    const records = [];
    
    // Parse CSV format (Spotify's standard format)
    const lines = reportData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      // Map Spotify fields to standardized format
      const standardRecord = {
        platform: 'spotify',
        track_title: record['Track Name'] || record['Song'],
        artist_name: record['Artist Name'] || record['Artist'],
        album_name: record['Album Name'] || record['Album'],
        isrc: record['ISRC'],
        upc: record['UPC'],
        territory: record['Territory'] || record['Country'],
        streams: parseInt(record['Quantity'] || record['Streams']) || 0,
        revenue: parseFloat(record['Royalty'] || record['Revenue']) || 0,
        currency: record['Currency'] || 'USD',
        period_start: record['Sales Date'] || record['Period Start'],
        period_end: record['Sales Date'] || record['Period End'],
        report_date: jobData.report_date,
        product_type: record['Product Type'] || 'stream'
      };
      
      records.push(standardRecord);
    }
    
    return records;
  }

  /**
   * Process Apple Music royalty report
   */
  async processAppleMusicReport(reportData, jobData) {
    const records = [];
    
    // Apple Music typically provides tab-separated files
    const lines = reportData.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split('\t');
      if (values.length !== headers.length) continue;
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      // Map Apple Music fields
      const standardRecord = {
        platform: 'apple_music',
        track_title: record['Song/Album'] || record['Title'],
        artist_name: record['Artist/Show'] || record['Artist'],
        album_name: record['Album/Season'] || record['Album'],
        isrc: record['ISRC'],
        upc: record['UPC'],
        territory: record['Country Code'] || record['Territory'],
        streams: parseInt(record['Units'] || record['Plays']) || 0,
        revenue: parseFloat(record['Artist Royalties'] || record['Royalty']) || 0,
        currency: record['Currency'] || 'USD',
        period_start: record['Begin Date'] || jobData.period_start,
        period_end: record['End Date'] || jobData.period_end,
        report_date: jobData.report_date,
        product_type: record['Product Type Identity'] || 'stream'
      };
      
      records.push(standardRecord);
    }
    
    return records;
  }

  /**
   * Process YouTube Music royalty report
   */
  async processYouTubeMusicReport(reportData, jobData) {
    const records = [];
    
    try {
      // YouTube provides JSON or CSV format
      let data;
      if (jobData.expected_format === 'json') {
        data = JSON.parse(reportData);
      } else {
        // Parse CSV
        const lines = reportData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = this.parseCSVLine(line);
          const record = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });
          data.push(record);
        }
      }
      
      // Process records
      for (const record of data) {
        const standardRecord = {
          platform: 'youtube_music',
          track_title: record['Video Title'] || record['Content Title'],
          artist_name: record['Channel'] || record['Artist'],
          album_name: record['Album'] || '',
          isrc: record['ISRC'] || record['Asset ID'],
          territory: record['Country'] || record['Territory'],
          streams: parseInt(record['Views'] || record['Plays']) || 0,
          revenue: parseFloat(record['Your estimated revenue (USD)'] || record['Revenue']) || 0,
          currency: 'USD', // YouTube typically reports in USD
          period_start: record['Date'] || jobData.period_start,
          period_end: record['Date'] || jobData.period_end,
          report_date: jobData.report_date,
          product_type: 'stream',
          watch_time: record['Watch time (hours)'] || null,
          cpm: record['CPM'] || null
        };
        
        records.push(standardRecord);
      }
    } catch (error) {
      logger.error('Error parsing YouTube Music report', { error: error.message });
      throw new Error(`YouTube Music report parsing failed: ${error.message}`);
    }
    
    return records;
  }

  /**
   * Process Amazon Music royalty report
   */
  async processAmazonMusicReport(reportData, jobData) {
    const records = [];
    
    // Amazon provides CSV format
    const lines = reportData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      const standardRecord = {
        platform: 'amazon_music',
        track_title: record['Track Title'] || record['Song'],
        artist_name: record['Artist Name'] || record['Artist'],
        album_name: record['Album Title'] || record['Album'],
        isrc: record['ISRC'],
        upc: record['UPC'],
        territory: record['Territory'] || record['Country'],
        streams: parseInt(record['Streams'] || record['Quantity']) || 0,
        revenue: parseFloat(record['Net Revenue'] || record['Royalty']) || 0,
        currency: record['Currency'] || 'USD',
        period_start: record['Period Start'] || jobData.period_start,
        period_end: record['Period End'] || jobData.period_end,
        report_date: jobData.report_date,
        product_type: record['Product Type'] || 'stream'
      };
      
      records.push(standardRecord);
    }
    
    return records;
  }

  /**
   * Process Tidal royalty report
   */
  async processTidalReport(reportData, jobData) {
    const records = [];
    
    const lines = reportData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      const standardRecord = {
        platform: 'tidal',
        track_title: record['Track'],
        artist_name: record['Artist'],
        album_name: record['Album'],
        isrc: record['ISRC'],
        territory: record['Country'],
        streams: parseInt(record['Quantity']) || 0,
        revenue: parseFloat(record['Net Revenue']) || 0,
        currency: record['Currency'] || 'USD',
        period_start: record['Period Start'] || jobData.period_start,
        period_end: record['Period End'] || jobData.period_end,
        report_date: jobData.report_date,
        product_type: 'stream',
        tier: record['Subscription Tier'] || 'standard'
      };
      
      records.push(standardRecord);
    }
    
    return records;
  }

  /**
   * Process Deezer royalty report
   */
  async processDeezerReport(reportData, jobData) {
    const records = [];
    
    const lines = reportData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      const standardRecord = {
        platform: 'deezer',
        track_title: record['Title'] || record['Track'],
        artist_name: record['Artist'],
        album_name: record['Album'],
        isrc: record['ISRC'],
        territory: record['Territory'],
        streams: parseInt(record['Streams']) || 0,
        revenue: parseFloat(record['Revenue']) || 0,
        currency: record['Currency'] || 'EUR',
        period_start: record['Period Start'] || jobData.period_start,
        period_end: record['Period End'] || jobData.period_end,
        report_date: jobData.report_date,
        product_type: 'stream'
      };
      
      records.push(standardRecord);
    }
    
    return records;
  }

  // ========== Data Processing ==========

  /**
   * Validate parsed data
   */
  async validateParsedData(parsedData, jobData) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      errors.push('No valid records found in report');
      return { isValid: false, errors, warnings };
    }

    let validRecords = 0;
    let invalidRecords = 0;

    for (const record of parsedData) {
      // Check required fields
      const requiredFields = ['platform', 'track_title', 'artist_name'];
      const missingFields = requiredFields.filter(field => !record[field]);
      
      if (missingFields.length > 0) {
        invalidRecords++;
        continue;
      }

      // Validate numeric fields
      if (isNaN(record.streams) || record.streams < 0) {
        invalidRecords++;
        continue;
      }

      if (isNaN(record.revenue) || record.revenue < 0) {
        invalidRecords++;
        continue;
      }

      validRecords++;
    }

    if (validRecords === 0) {
      errors.push('No valid records found after validation');
    }

    if (invalidRecords > 0) {
      warnings.push(`${invalidRecords} invalid records will be skipped`);
    }

    logger.info('Data validation completed', {
      total: parsedData.length,
      valid: validRecords,
      invalid: invalidRecords,
      platform: jobData.platform
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRecords,
      invalidRecords
    };
  }

  /**
   * Process earnings data
   */
  async processEarningsData(parsedData, jobData) {
    const results = {
      earnings_count: 0,
      total_revenue: 0,
      currency_totals: {},
      territory_totals: {},
      track_totals: {},
      summary: {
        platform: jobData.platform,
        period_start: jobData.period_start,
        period_end: jobData.period_end,
        processing_date: new Date().toISOString()
      }
    };

    for (const record of parsedData) {
      try {
        // Skip invalid records
        if (!record.track_title || !record.artist_name) continue;

        // Find or create track mapping
        const trackMapping = await this.findTrackMapping(record);
        if (!trackMapping) {
          logger.warn('Track mapping not found', {
            title: record.track_title,
            artist: record.artist_name,
            isrc: record.isrc
          });
          continue;
        }

        // Convert revenue to USD for totals
        const usdRevenue = CurrencyUtil.convert(
          record.revenue,
          record.currency || 'USD',
          'USD'
        );

        // Create earnings record
        const earningsData = {
          track_id: trackMapping.track_id,
          release_id: trackMapping.release_id,
          platform: record.platform,
          territory: record.territory || 'unknown',
          revenue_type: record.product_type || 'stream',
          streams: record.streams || 0,
          revenue: record.revenue || 0,
          currency: record.currency || 'USD',
          period_start: DateUtil.createDate(record.period_start || jobData.period_start),
          period_end: DateUtil.createDate(record.period_end || jobData.period_end),
          report_date: DateUtil.createDate(jobData.report_date),
          raw_data: record
        };

        // Save earnings record
        await RoyaltyService.createEarnings(earningsData);

        // Update totals
        results.earnings_count++;
        results.total_revenue += usdRevenue;

        // Currency totals
        const currency = record.currency || 'USD';
        if (!results.currency_totals[currency]) {
          results.currency_totals[currency] = 0;
        }
        results.currency_totals[currency] += record.revenue;

        // Territory totals
        const territory = record.territory || 'unknown';
        if (!results.territory_totals[territory]) {
          results.territory_totals[territory] = { streams: 0, revenue: 0 };
        }
        results.territory_totals[territory].streams += record.streams || 0;
        results.territory_totals[territory].revenue += usdRevenue;

        // Track totals
        const trackKey = `${trackMapping.track_id}`;
        if (!results.track_totals[trackKey]) {
          results.track_totals[trackKey] = { streams: 0, revenue: 0 };
        }
        results.track_totals[trackKey].streams += record.streams || 0;
        results.track_totals[trackKey].revenue += usdRevenue;

      } catch (error) {
        logger.error('Error processing earnings record', {
          record: record.track_title,
          error: error.message
        });
      }
    }

    logger.info('Earnings processing completed', {
      processed: results.earnings_count,
      totalRevenue: results.total_revenue,
      currencies: Object.keys(results.currency_totals),
      territories: Object.keys(results.territory_totals).length
    });

    return results;
  }

  /**
   * Generate royalty statements
   */
  async generateRoyaltyStatements(ingestionResult, jobData) {
    const statements = [];

    // Group earnings by artist and create statements
    const artistGroups = await this.groupEarningsByArtist(ingestionResult, jobData);

    for (const [artistId, artistData] of Object.entries(artistGroups)) {
      try {
        const statementData = {
          artist_id: artistId,
          period_start: jobData.period_start,
          period_end: jobData.period_end,
          currency: 'USD',
          total_streams: artistData.total_streams,
          total_gross_revenue: artistData.total_revenue,
          total_deductions: 0, // Calculate based on agreements
          total_net_revenue: artistData.total_revenue,
          payable_amount: artistData.total_revenue, // After splits
          platforms: [jobData.platform],
          territories: Object.keys(artistData.territories),
          revenue_by_platform: { [jobData.platform]: artistData.total_revenue },
          revenue_by_territory: artistData.territories,
          processing_status: 'completed',
          generated_at: new Date().toISOString()
        };

        const statement = await RoyaltyService.createStatement(statementData);
        statements.push(statement);

        logger.info('Royalty statement generated', {
          statementId: statement.statement_id,
          artistId,
          revenue: artistData.total_revenue
        });

      } catch (error) {
        logger.error('Failed to generate royalty statement', {
          artistId,
          error: error.message
        });
      }
    }

    return statements;
  }

  // ========== Helper Methods ==========

  /**
   * Parse CSV line handling quotes and commas
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '')); // Remove surrounding quotes
  }

  /**
   * Find track mapping by metadata
   */
  async findTrackMapping(recordData) {
    try {
      // Try to find by ISRC first (most reliable)
      if (recordData.isrc) {
        const track = await TrackService.findByISRC(recordData.isrc);
        if (track) {
          return {
            track_id: track.track_id,
            release_id: track.release_id
          };
        }
      }

      // Fallback to title/artist matching
      const tracks = await TrackService.searchTracks({
        title: recordData.track_title,
        artist: recordData.artist_name
      });

      if (tracks && tracks.length > 0) {
        return {
          track_id: tracks[0].track_id,
          release_id: tracks[0].release_id
        };
      }

      return null;
    } catch (error) {
      logger.error('Error finding track mapping', { error: error.message });
      return null;
    }
  }

  /**
   * Group earnings by artist
   */
  async groupEarningsByArtist(ingestionResult, reportData) {
    // This would typically query the database for release/artist mappings
    // For now, return a simplified structure
    const groups = {};
    
    logger.info('Grouping earnings by artist', { 
      platform: reportData.platform,
      tracks: Object.keys(ingestionResult.track_totals).length 
    });
    
    for (const [trackId, trackData] of Object.entries(ingestionResult.track_totals)) {
      try {
        const track = await TrackService.findById(trackId);
        if (!track) continue;

        const release = await ReleaseService.findById(track.release_id);
        if (!release) continue;

        const artistId = release.artist_id;
        
        if (!groups[artistId]) {
          groups[artistId] = {
            total_streams: 0,
            total_revenue: 0,
            territories: {}
          };
        }

        groups[artistId].total_streams += trackData.streams;
        groups[artistId].total_revenue += trackData.revenue;

        // Add territory data (simplified)
        for (const [territory, territoryData] of Object.entries(ingestionResult.territory_totals)) {
          if (!groups[artistId].territories[territory]) {
            groups[artistId].territories[territory] = 0;
          }
          groups[artistId].territories[territory] += territoryData.revenue / Object.keys(ingestionResult.track_totals).length;
        }

      } catch (error) {
        logger.error('Error grouping earnings by artist', { trackId, error: error.message });
      }
    }

    return groups;
  }

  // Job management methods (similar to DistributionJob)
  validateIngestionJobData(jobData) {
    const required = ['platform', 'source_type'];
    const missing = required.filter(field => !jobData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  generateJobId() {
    return `royalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  insertJobByPriority(job) {
    let inserted = false;
    for (let i = 0; i < this.jobQueue.length; i++) {
      if (job.priority < this.jobQueue[i].priority) {
        this.jobQueue.splice(i, 0, job);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      this.jobQueue.push(job);
    }
  }

  estimateStartTime(job) {
    const position = this.getQueuePosition(job.id);
    const avgJobTime = 20 * 60 * 1000; // 20 minutes average
    const estimatedDelay = position * avgJobTime;
    
    return new Date(Date.now() + estimatedDelay);
  }

  getQueuePosition(jobId) {
    return this.jobQueue.findIndex(job => job.id === jobId) + 1;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async completeIngestionJob(job, results) {
    job.status = 'completed';
    job.completed_at = new Date().toISOString();
    job.results = results;

    await this.sendCompletionNotification(job);

    logger.info('Royalty ingestion job completed', {
      jobId: job.id,
      platform: job.data.platform,
      results
    });
  }

  async handleJobError(job, error) {
    logger.error('Royalty ingestion job error', {
      jobId: job.id,
      attempt: job.attempts,
      error: error.message
    });

    if (job.attempts < this.maxRetries) {
      job.status = 'retrying';
      job.retry_at = new Date(Date.now() + this.retryDelay).toISOString();
      
      setTimeout(() => {
        this.insertJobByPriority(job);
        if (!this.isProcessing) {
          this.processQueue();
        }
      }, this.retryDelay);
    } else {
      job.status = 'failed';
      job.failed_at = new Date().toISOString();
      job.error = error.message;

      await this.sendFailureNotification(job, error);
    }
  }

  async handleJobTimeout(job) {
    job.status = 'timeout';
    job.failed_at = new Date().toISOString();
    job.error = 'Job execution timed out';

    await this.sendFailureNotification(job, new Error('Job timeout'));
  }

  // Placeholder methods for file processing
  async processUploadedFile(filePath) {
    logger.info('Processing uploaded file', { filePath });
    return 'file_content'; // Read file content
  }

  async fetchFromPlatformAPI(jobData) {
    logger.info('Fetching from platform API', { platform: jobData.platform });
    return 'api_data'; // Fetch from API
  }

  async downloadFromURL(fileUrl) {
    logger.info('Downloading from URL', { fileUrl });
    return 'downloaded_content'; // Download file
  }

  async validateReportFormat(reportData, expectedFormat) {
    logger.info('Validating report format', { format: expectedFormat, size: reportData.length });
    return true; // Format validation logic
  }

  async sendCompletionNotification(job) {
    try {
      await NotificationService.sendRoyaltyIngestionComplete({
        jobId: job.id,
        platform: job.data.platform,
        results: job.results
      });
    } catch (error) {
      logger.warn('Failed to send completion notification', { error: error.message });
    }
  }

  async sendFailureNotification(job, error) {
    try {
      await NotificationService.sendRoyaltyIngestionFailed({
        jobId: job.id,
        platform: job.data.platform,
        error: error.message
      });
    } catch (notifError) {
      logger.warn('Failed to send failure notification', { error: notifError.message });
    }
  }
}

module.exports = new RoyaltyIngestionJob();
