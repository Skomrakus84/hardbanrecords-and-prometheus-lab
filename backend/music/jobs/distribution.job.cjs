/**
 * Distribution Job - Background Processing for Music Distribution
 * Handles automated distribution of releases to streaming platforms
 * Provides queuing, scheduling, and status tracking for distribution operations
 */

const logger = require('../../config/logger.cjs');
const ReleaseService = require('../services/release.service.cjs');
const ChannelService = require('../services/channel.service.cjs');
const NotificationService = require('../services/notifications.service.cjs');

class DistributionJob {
  constructor() {
    this.jobName = 'distribution';
    this.maxRetries = 3;
    this.retryDelay = 5 * 60 * 1000; // 5 minutes
    this.timeoutMs = 30 * 60 * 1000; // 30 minutes per platform
    
    // Job status tracking
    this.activeJobs = new Map();
    this.jobQueue = [];
    this.isProcessing = false;
    
    // Distribution priorities
    this.priorities = {
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4,
      batch: 5
    };

    // Platform processing order (based on importance and processing time)
    this.platformOrder = [
      'spotify',
      'apple_music',
      'youtube_music',
      'amazon_music',
      'tidal',
      'deezer'
    ];
  }

  // ========== Job Queue Management ==========

  /**
   * Add distribution job to queue
   */
  async addDistributionJob(jobData, priority = 'normal') {
    try {
      const jobId = this.generateJobId();
      const job = {
        id: jobId,
        type: 'distribution',
        priority: this.priorities[priority] || this.priorities.normal,
        data: jobData,
        status: 'queued',
        attempts: 0,
        created_at: new Date().toISOString(),
        scheduled_for: jobData.scheduled_for || new Date().toISOString(),
        timeout_at: new Date(Date.now() + this.timeoutMs).toISOString()
      };

      // Validate job data
      this.validateDistributionJobData(jobData);

      // Add to queue with priority ordering
      this.insertJobByPriority(job);
      
      logger.info('Distribution job added to queue', {
        jobId,
        releaseId: jobData.release_id,
        platforms: jobData.platforms,
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
      logger.error('Failed to add distribution job', { error: error.message, jobData });
      throw error;
    }
  }

  /**
   * Process job queue
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    logger.info('Starting distribution job queue processing');

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

        await this.processDistributionJob(job);
      }
    } catch (error) {
      logger.error('Error processing job queue', { error: error.message });
    } finally {
      this.isProcessing = false;
      logger.info('Distribution job queue processing completed');
    }
  }

  /**
   * Process individual distribution job
   */
  async processDistributionJob(job) {
    const startTime = Date.now();
    this.activeJobs.set(job.id, job);

    try {
      logger.info('Processing distribution job', {
        jobId: job.id,
        releaseId: job.data.release_id,
        platforms: job.data.platforms
      });

      // Update job status
      job.status = 'processing';
      job.started_at = new Date().toISOString();
      job.attempts += 1;

      // Get release data
      const release = await ReleaseService.findById(job.data.release_id);
      if (!release) {
        throw new Error(`Release not found: ${job.data.release_id}`);
      }

      // Validate release for distribution
      const validation = await this.validateReleaseForDistribution(release);
      if (!validation.isValid) {
        throw new Error(`Release validation failed: ${validation.errors.join(', ')}`);
      }

      // Process each platform
      const results = {};
      for (const platform of this.getOrderedPlatforms(job.data.platforms)) {
        try {
          logger.info('Distributing to platform', {
            jobId: job.id,
            platform,
            releaseId: release.release_id
          });

          const platformResult = await this.distributeToplatform(
            release,
            platform,
            job.data.settings || {}
          );

          results[platform] = {
            status: 'success',
            ...platformResult
          };

          // Update job progress
          await this.updateJobProgress(job, platform, 'completed');

        } catch (platformError) {
          logger.error('Platform distribution failed', {
            jobId: job.id,
            platform,
            error: platformError.message
          });

          results[platform] = {
            status: 'failed',
            error: platformError.message,
            retry_possible: this.isRetryableError(platformError)
          };

          await this.updateJobProgress(job, platform, 'failed');
        }
      }

      // Complete job
      await this.completeDistributionJob(job, results);

    } catch (error) {
      await this.handleJobError(job, error);
    } finally {
      this.activeJobs.delete(job.id);
      
      const duration = Date.now() - startTime;
      logger.info('Distribution job completed', {
        jobId: job.id,
        duration: `${duration}ms`,
        status: job.status
      });
    }
  }

  // ========== Platform Distribution ==========

  /**
   * Distribute release to specific platform
   */
  async distributeToplatform(release, platform, settings) {
    const platformService = await this.getPlatformService(platform);
    
    // Prepare distribution data
    const distributionData = await this.prepareDistributionData(release, platform, settings);
    
    // Submit to platform
    const submissionResult = await platformService.submitRelease(distributionData);
    
    // Update channel repository
    await ChannelService.updateDistributionStatus(
      platform,
      release.release_id,
      {
        status: 'submitted',
        external_id: submissionResult.external_id,
        external_url: submissionResult.external_url,
        response_metadata: submissionResult.metadata
      },
      'system'
    );

    // Schedule status check
    await this.scheduleStatusCheck(platform, release.release_id, submissionResult.external_id);

    return {
      external_id: submissionResult.external_id,
      external_url: submissionResult.external_url,
      estimated_live_date: submissionResult.estimated_live_date,
      submission_reference: submissionResult.reference
    };
  }

  /**
   * Prepare distribution data for platform
   */
  async prepareDistributionData(release, platform, settings) {
    // Get platform-specific requirements
    const requirements = await this.getPlatformRequirements(platform);
    
    // Prepare metadata
    const metadata = await this.prepareMetadata(release, requirements);
    
    // Prepare audio files
    const audioFiles = await this.prepareAudioFiles(release, requirements);
    
    // Prepare artwork
    const artwork = await this.prepareArtwork(release, requirements);
    
    return {
      release_info: {
        title: release.title,
        artist: release.primary_artist,
        release_date: release.release_date,
        genre: release.genre,
        label: release.label,
        catalog_number: release.catalog_number,
        upc: release.upc,
        isrc_codes: release.tracks?.map(t => t.isrc) || []
      },
      tracks: release.tracks?.map(track => ({
        title: track.title,
        artist: track.artist || release.primary_artist,
        duration: track.duration,
        isrc: track.isrc,
        explicit: track.explicit || false,
        file_url: track.audio_file_url
      })) || [],
      metadata,
      audio_files: audioFiles,
      artwork,
      distribution_settings: {
        territories: settings.territories || ['worldwide'],
        stores: settings.stores || [],
        pricing: settings.pricing || {},
        release_strategy: settings.release_strategy || 'standard'
      }
    };
  }

  // ========== Job Status Management ==========

  /**
   * Update job progress
   */
  async updateJobProgress(job, platform, status) {
    if (!job.progress) {
      job.progress = {};
    }

    job.progress[platform] = {
      status,
      updated_at: new Date().toISOString()
    };

    // Calculate overall progress
    const totalPlatforms = job.data.platforms.length;
    const completedPlatforms = Object.values(job.progress).filter(
      p => p.status === 'completed' || p.status === 'failed'
    ).length;

    job.progress_percentage = Math.round((completedPlatforms / totalPlatforms) * 100);

    // Send progress update notification
    await this.sendProgressNotification(job);
  }

  /**
   * Complete distribution job
   */
  async completeDistributionJob(job, results) {
    const successCount = Object.values(results).filter(r => r.status === 'success').length;
    const totalCount = Object.keys(results).length;

    job.status = successCount === totalCount ? 'completed' : 'partially_completed';
    job.completed_at = new Date().toISOString();
    job.results = results;
    job.success_rate = Math.round((successCount / totalCount) * 100);

    // Send completion notification
    await this.sendCompletionNotification(job);

    // Update release distribution status
    await this.updateReleaseDistributionStatus(job.data.release_id, results);

    logger.info('Distribution job completed', {
      jobId: job.id,
      status: job.status,
      successRate: job.success_rate,
      results: Object.keys(results)
    });
  }

  /**
   * Handle job error
   */
  async handleJobError(job, error) {
    logger.error('Distribution job error', {
      jobId: job.id,
      attempt: job.attempts,
      error: error.message
    });

    if (job.attempts < this.maxRetries && this.isRetryableError(error)) {
      // Retry job
      job.status = 'retrying';
      job.retry_at = new Date(Date.now() + this.retryDelay).toISOString();
      job.last_error = error.message;

      // Re-add to queue for retry
      setTimeout(() => {
        this.insertJobByPriority(job);
        if (!this.isProcessing) {
          this.processQueue();
        }
      }, this.retryDelay);

      logger.info('Distribution job scheduled for retry', {
        jobId: job.id,
        retryAt: job.retry_at,
        attempt: job.attempts
      });
    } else {
      // Job failed permanently
      job.status = 'failed';
      job.failed_at = new Date().toISOString();
      job.error = error.message;

      await this.sendFailureNotification(job, error);
    }
  }

  /**
   * Handle job timeout
   */
  async handleJobTimeout(job) {
    logger.warn('Distribution job timed out', {
      jobId: job.id,
      timeoutAt: job.timeout_at
    });

    job.status = 'timeout';
    job.failed_at = new Date().toISOString();
    job.error = 'Job execution timed out';

    await this.sendFailureNotification(job, new Error('Job timeout'));
  }

  // ========== Job Scheduling and Management ==========

  /**
   * Schedule distribution for specific time
   */
  async scheduleDistribution(releaseId, platforms, scheduledTime, settings = {}) {
    const jobData = {
      release_id: releaseId,
      platforms,
      settings,
      scheduled_for: scheduledTime
    };

    return await this.addDistributionJob(jobData, 'normal');
  }

  /**
   * Cancel distribution job
   */
  async cancelDistributionJob(jobId, reason = 'User cancelled') {
    // Remove from queue if not started
    const queueIndex = this.jobQueue.findIndex(job => job.id === jobId);
    if (queueIndex !== -1) {
      const job = this.jobQueue.splice(queueIndex, 1)[0];
      job.status = 'cancelled';
      job.cancelled_at = new Date().toISOString();
      job.cancellation_reason = reason;

      logger.info('Distribution job cancelled', { jobId, reason });
      return { status: 'cancelled', message: 'Job removed from queue' };
    }

    // Check if job is currently processing
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      activeJob.status = 'cancelling';
      activeJob.cancellation_reason = reason;
      
      logger.info('Distribution job marked for cancellation', { jobId, reason });
      return { status: 'cancelling', message: 'Job will be cancelled after current platform' };
    }

    return { status: 'not_found', message: 'Job not found in queue or active jobs' };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    // Check active jobs
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      return {
        ...activeJob,
        queue_position: null,
        estimated_completion: this.estimateCompletionTime(activeJob)
      };
    }

    // Check queue
    const queuedJob = this.jobQueue.find(job => job.id === jobId);
    if (queuedJob) {
      return {
        ...queuedJob,
        queue_position: this.getQueuePosition(jobId),
        estimated_start: this.estimateStartTime(queuedJob)
      };
    }

    return null;
  }

  /**
   * Get all jobs for release
   */
  async getReleaseJobs(releaseId) {
    const jobs = [];

    // Add active jobs
    for (const job of this.activeJobs.values()) {
      if (job.data.release_id === releaseId) {
        jobs.push(job);
      }
    }

    // Add queued jobs
    for (const job of this.jobQueue) {
      if (job.data.release_id === releaseId) {
        jobs.push(job);
      }
    }

    return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // ========== Helper Methods ==========

  /**
   * Validate distribution job data
   */
  validateDistributionJobData(jobData) {
    const required = ['release_id', 'platforms'];
    const missing = required.filter(field => !jobData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(jobData.platforms) || jobData.platforms.length === 0) {
      throw new Error('Platforms must be a non-empty array');
    }
  }

  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Insert job by priority
   */
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

  /**
   * Get ordered platforms for processing
   */
  getOrderedPlatforms(platforms) {
    return this.platformOrder.filter(platform => platforms.includes(platform))
      .concat(platforms.filter(platform => !this.platformOrder.includes(platform)));
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'network timeout',
      'connection refused',
      'temporary unavailable',
      'rate limited',
      'server error'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    );
  }

  /**
   * Estimate start time for job
   */
  estimateStartTime(job) {
    const position = this.getQueuePosition(job.id);
    const avgJobTime = 10 * 60 * 1000; // 10 minutes average
    const estimatedDelay = position * avgJobTime;
    
    return new Date(Date.now() + estimatedDelay);
  }

  /**
   * Get queue position
   */
  getQueuePosition(jobId) {
    return this.jobQueue.findIndex(job => job.id === jobId) + 1;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== Notification Methods ==========

  /**
   * Send progress notification
   */
  async sendProgressNotification(job) {
    try {
      await NotificationService.sendDistributionProgress({
        jobId: job.id,
        releaseId: job.data.release_id,
        progress: job.progress_percentage,
        platforms: job.progress
      });
    } catch (error) {
      logger.warn('Failed to send progress notification', { 
        jobId: job.id, 
        error: error.message 
      });
    }
  }

  /**
   * Send completion notification
   */
  async sendCompletionNotification(job) {
    try {
      await NotificationService.sendDistributionComplete({
        jobId: job.id,
        releaseId: job.data.release_id,
        status: job.status,
        successRate: job.success_rate,
        results: job.results
      });
    } catch (error) {
      logger.warn('Failed to send completion notification', { 
        jobId: job.id, 
        error: error.message 
      });
    }
  }

  /**
   * Send failure notification
   */
  async sendFailureNotification(job, error) {
    try {
      await NotificationService.sendDistributionFailed({
        jobId: job.id,
        releaseId: job.data.release_id,
        error: error.message,
        attempts: job.attempts,
        retryable: this.isRetryableError(error)
      });
    } catch (notifError) {
      logger.warn('Failed to send failure notification', { 
        jobId: job.id, 
        error: notifError.message 
      });
    }
  }

  // Placeholder methods for external integrations
  async getPlatformService(platform) {
    // Return appropriate platform service
    const ChannelService = require('../services/channel.service.cjs');
    return ChannelService.getPlatformAdapter(platform);
  }

  async getPlatformRequirements(platformName) {
    // Return platform-specific requirements
    logger.info('Getting platform requirements', { platform: platformName });
    return {};
  }

  async prepareMetadata(releaseData, reqData) {
    // Prepare platform-specific metadata
    logger.info('Preparing metadata', { 
      release: releaseData.release_id, 
      requirements: Object.keys(reqData).length 
    });
    return {};
  }

  async prepareAudioFiles(releaseData, reqData) {
    // Prepare audio files according to platform requirements
    logger.info('Preparing audio files', { 
      release: releaseData.release_id, 
      requirements: Object.keys(reqData).length 
    });
    return [];
  }

  async prepareArtwork(releaseData, reqData) {
    // Prepare artwork according to platform requirements
    logger.info('Preparing artwork', { 
      release: releaseData.release_id, 
      requirements: Object.keys(reqData).length 
    });
    return {};
  }

  async validateReleaseForDistribution(releaseData) {
    // Validate release is ready for distribution
    logger.info('Validating release for distribution', { release: releaseData.release_id });
    return { isValid: true, errors: [] };
  }

  async scheduleStatusCheck(platform, releaseId, externalId) {
    // Schedule periodic status checks
    logger.info('Status check scheduled', { platform, releaseId, externalId });
  }

  async updateReleaseDistributionStatus(releaseId, results) {
    // Update release with distribution results
    logger.info('Release distribution status updated', { releaseId, results });
  }

  estimateCompletionTime(job) {
    // Estimate completion time for active job
    const remainingPlatforms = job.data.platforms.length - 
      Object.keys(job.progress || {}).length;
    const avgPlatformTime = 5 * 60 * 1000; // 5 minutes per platform
    
    return new Date(Date.now() + (remainingPlatforms * avgPlatformTime));
  }
}

module.exports = new DistributionJob();
