/**
 * Date Utilities
 * Comprehensive date handling and formatting for music distribution
 * Handles release dates, streaming schedules, and timezone management
 */

const logger = require('../../config/logger.cjs');

class DateUtil {
  constructor() {
    // Common date formats used in music industry
    this.formats = {
      iso: 'YYYY-MM-DDTHH:mm:ss.sssZ',
      release: 'YYYY-MM-DD',
      display: 'MMM DD, YYYY',
      timestamp: 'YYYY-MM-DD HH:mm:ss',
      api: 'YYYY-MM-DDTHH:mm:ssZ',
      filename: 'YYYYMMDD_HHmmss',
      spotify: 'YYYY-MM-DD',
      apple: 'YYYY-MM-DDTHH:mm:ss+00:00'
    };

    // Release scheduling timezones
    this.releaseTimezones = {
      global: 'UTC',
      us_east: 'America/New_York',
      us_west: 'America/Los_Angeles', 
      uk: 'Europe/London',
      eu_central: 'Europe/Berlin',
      japan: 'Asia/Tokyo',
      australia: 'Australia/Sydney'
    };

    // Platform release timing preferences
    this.platformTimings = {
      spotify: {
        timezone: 'UTC',
        preferredTime: '00:00:00',
        advanceNotice: 14 // days
      },
      apple_music: {
        timezone: 'UTC', 
        preferredTime: '00:00:00',
        advanceNotice: 7
      },
      youtube_music: {
        timezone: 'UTC',
        preferredTime: '00:00:00',
        advanceNotice: 3
      },
      tidal: {
        timezone: 'UTC',
        preferredTime: '00:00:00',
        advanceNotice: 7
      },
      amazon_music: {
        timezone: 'UTC',
        preferredTime: '00:00:00', 
        advanceNotice: 7
      },
      deezer: {
        timezone: 'UTC',
        preferredTime: '00:00:00',
        advanceNotice: 5
      }
    };

    // Common music industry date milestones
    this.milestones = {
      submission_deadline: -14, // 14 days before release
      artwork_deadline: -10, // 10 days before release
      metadata_deadline: -7, // 7 days before release
      marketing_start: -30, // 30 days before release
      pre_order_start: -45, // 45 days before release
      announcement: -60 // 60 days before release
    };
  }

  // ========== Date Creation and Parsing ==========

  /**
   * Create standardized date object
   */
  createDate(input = null) {
    if (!input) {
      return new Date();
    }

    if (input instanceof Date) {
      return new Date(input);
    }

    if (typeof input === 'string') {
      // Handle various string formats
      const parsed = this.parseDate(input);
      return parsed || new Date(input);
    }

    if (typeof input === 'number') {
      return new Date(input);
    }

    throw new Error(`Invalid date input: ${input}`);
  }

  /**
   * Parse date string with multiple format support
   */
  parseDate(dateString) {
    if (!dateString) return null;

    // Try ISO format first
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return new Date(dateString);
    }

    // Try release date format (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(`${dateString}T00:00:00.000Z`);
    }

    // Try timestamp format
    if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return new Date(`${dateString.replace(' ', 'T')}.000Z`);
    }

    // Try other common formats
    const commonFormats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
    ];

    for (const format of commonFormats) {
      const match = dateString.match(format);
      if (match) {
        const [, part1, part2, part3] = match;
        // Assume YYYY/MM/DD for 4-digit first part, otherwise MM/DD/YYYY
        if (part3.length === 4) {
          return new Date(`${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}T00:00:00.000Z`);
        } else {
          return new Date(`${part3}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}T00:00:00.000Z`);
        }
      }
    }

    return null;
  }

  // ========== Date Formatting ==========

  /**
   * Format date for specific platform
   */
  formatForPlatform(date, platform) {
    const d = this.createDate(date);
    const timing = this.platformTimings[platform.toLowerCase().replace(/[^a-z_]/g, '_')];
    
    if (timing) {
      // Use platform-specific timezone and format
      return this.formatDate(d, this.formats.api);
    }

    // Default format
    return this.formatDate(d, this.formats.release);
  }

  /**
   * Format date using specified format
   */
  formatDate(date, format = 'release') {
    const d = this.createDate(date);
    const formatStr = this.formats[format] || format;

    // Simple format replacement (basic implementation)
    let result = formatStr;
    
    result = result.replace('YYYY', d.getUTCFullYear().toString());
    result = result.replace('MM', (d.getUTCMonth() + 1).toString().padStart(2, '0'));
    result = result.replace('DD', d.getUTCDate().toString().padStart(2, '0'));
    result = result.replace('HH', d.getUTCHours().toString().padStart(2, '0'));
    result = result.replace('mm', d.getUTCMinutes().toString().padStart(2, '0'));
    result = result.replace('ss', d.getUTCSeconds().toString().padStart(2, '0'));
    result = result.replace('sss', d.getUTCMilliseconds().toString().padStart(3, '0'));

    // Handle month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    result = result.replace('MMM', monthNames[d.getUTCMonth()]);

    return result;
  }

  /**
   * Format for display purposes
   */
  formatForDisplay(date, includeTime = false) {
    const d = this.createDate(date);
    
    if (includeTime) {
      return this.formatDate(d, this.formats.timestamp);
    }
    
    return this.formatDate(d, this.formats.display);
  }

  /**
   * Format for filename use
   */
  formatForFilename(date = null) {
    const d = this.createDate(date);
    return this.formatDate(d, this.formats.filename);
  }

  // ========== Release Date Management ==========

  /**
   * Calculate optimal release date
   */
  calculateReleaseDate(preferredDate = null, advanceNoticeDays = 14) {
    let releaseDate;

    if (preferredDate) {
      releaseDate = this.createDate(preferredDate);
    } else {
      // Default to next Friday (common release day)
      releaseDate = this.getNextFriday();
    }

    // Ensure minimum advance notice
    const minDate = this.addDays(new Date(), advanceNoticeDays);
    if (releaseDate < minDate) {
      releaseDate = this.getNextFriday(minDate);
    }

    return releaseDate;
  }

  /**
   * Get next Friday (common music release day)
   */
  getNextFriday(fromDate = new Date()) {
    const date = this.createDate(fromDate);
    const dayOfWeek = date.getUTCDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // 5 = Friday
    
    return this.addDays(date, daysUntilFriday);
  }

  /**
   * Check if date is a Friday
   */
  isFriday(date) {
    const d = this.createDate(date);
    return d.getUTCDay() === 5; // 5 = Friday
  }

  /**
   * Get release timeline with all important dates
   */
  getReleaseTimeline(releaseDate) {
    const timeline = {};
    const release = this.createDate(releaseDate);

    // Calculate milestone dates
    for (const [milestone, daysBefore] of Object.entries(this.milestones)) {
      timeline[milestone] = this.addDays(release, daysBefore);
    }

    timeline.release_date = release;

    // Add platform-specific submission deadlines
    for (const [platform, timing] of Object.entries(this.platformTimings)) {
      timeline[`${platform}_deadline`] = this.addDays(release, -timing.advanceNotice);
    }

    return timeline;
  }

  /**
   * Validate release date against platform requirements
   */
  validateReleaseDate(releaseDate, platforms = []) {
    const release = this.createDate(releaseDate);
    const now = new Date();
    const errors = [];
    const warnings = [];

    // Basic validation
    if (release <= now) {
      errors.push('Release date must be in the future');
    }

    // Platform-specific validation
    for (const platform of platforms) {
      const timing = this.platformTimings[platform.toLowerCase().replace(/[^a-z_]/g, '_')];
      if (timing) {
        const deadline = this.addDays(now, timing.advanceNotice);
        if (release < deadline) {
          errors.push(`Release date too soon for ${platform}. Requires ${timing.advanceNotice} days advance notice`);
        }
      }
    }

    // Friday release recommendation
    if (!this.isFriday(release)) {
      warnings.push('Consider releasing on Friday for maximum impact');
    }

    // End of month warning (lower streaming due to budget resets)
    const dayOfMonth = release.getUTCDate();
    if (dayOfMonth > 28) {
      warnings.push('End of month releases may have lower initial streaming due to user budget resets');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ========== Date Calculations ==========

  /**
   * Add days to date
   */
  addDays(date, days) {
    const result = this.createDate(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  /**
   * Add hours to date
   */
  addHours(date, hours) {
    const result = this.createDate(date);
    result.setUTCHours(result.getUTCHours() + hours);
    return result;
  }

  /**
   * Add minutes to date
   */
  addMinutes(date, minutes) {
    const result = this.createDate(date);
    result.setUTCMinutes(result.getUTCMinutes() + minutes);
    return result;
  }

  /**
   * Get difference between dates in days
   */
  getDaysDifference(date1, date2) {
    const d1 = this.createDate(date1);
    const d2 = this.createDate(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference between dates in hours
   */
  getHoursDifference(date1, date2) {
    const d1 = this.createDate(date1);
    const d2 = this.createDate(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Check if date is in the past
   */
  isPast(date) {
    const d = this.createDate(date);
    return d < new Date();
  }

  /**
   * Check if date is in the future
   */
  isFuture(date) {
    const d = this.createDate(date);
    return d > new Date();
  }

  /**
   * Check if date is today
   */
  isToday(date) {
    const d = this.createDate(date);
    const today = new Date();
    
    return d.getUTCFullYear() === today.getUTCFullYear() &&
           d.getUTCMonth() === today.getUTCMonth() &&
           d.getUTCDate() === today.getUTCDate();
  }

  // ========== Timezone Utilities ==========

  /**
   * Convert date to specific timezone
   */
  toTimezone(date, timezone = 'UTC') {
    const d = this.createDate(date);
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(d);
    } catch (error) {
      logger.warn('Invalid timezone, using UTC', { timezone, error: error.message });
      return d;
    }
  }

  /**
   * Get timezone offset
   */
  getTimezoneOffset(timezone = 'UTC') {
    try {
      const now = new Date();
      const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      return (utc - tz) / (1000 * 60); // Return offset in minutes
    } catch (error) {
      logger.warn('Error calculating timezone offset', { timezone, error: error.message });
      return 0;
    }
  }

  // ========== Release Scheduling ==========

  /**
   * Schedule release across timezones
   */
  scheduleGlobalRelease(releaseDate, strategy = 'midnight_local') {
    const schedule = {};
    const baseDate = this.createDate(releaseDate);

    switch (strategy) {
      case 'midnight_local':
        // Release at midnight in each timezone
        for (const [region, timezone] of Object.entries(this.releaseTimezones)) {
          schedule[region] = {
            timezone,
            localTime: '00:00:00',
            utcTime: this.calculateUTCForMidnight(baseDate, timezone)
          };
        }
        break;

      case 'simultaneous': {
        // Same UTC time everywhere
        const utcTime = this.formatDate(baseDate, this.formats.api);
        for (const [region, timezone] of Object.entries(this.releaseTimezones)) {
          schedule[region] = {
            timezone,
            utcTime,
            localTime: this.toTimezone(baseDate, timezone)
          };
        }
        break;
      }

      case 'business_hours': {
        // Release during business hours in each timezone
        for (const [region, timezone] of Object.entries(this.releaseTimezones)) {
          const businessHourRelease = this.setTime(baseDate, 9, 0, 0); // 9 AM
          schedule[region] = {
            timezone,
            localTime: '09:00:00',
            utcTime: this.calculateUTCTime(businessHourRelease, timezone)
          };
        }
        break;
      }
    }

    return schedule;
  }

  /**
   * Calculate UTC time for midnight in specific timezone
   */
  calculateUTCForMidnight(date, timezone) {
    // This is a simplified calculation
    // In production, use a proper timezone library like moment-timezone
    const offset = this.getTimezoneOffset(timezone);
    const utcDate = this.addMinutes(date, offset);
    return this.formatDate(utcDate, this.formats.api);
  }

  /**
   * Set specific time on date
   */
  setTime(date, hours, minutes = 0, seconds = 0) {
    const result = this.createDate(date);
    result.setUTCHours(hours, minutes, seconds, 0);
    return result;
  }

  /**
   * Calculate UTC time for specific timezone
   */
  calculateUTCTime(date, timezone) {
    const offset = this.getTimezoneOffset(timezone);
    const utcDate = this.addMinutes(date, offset);
    return this.formatDate(utcDate, this.formats.api);
  }

  // ========== Utility Methods ==========

  /**
   * Get current timestamp for logs
   */
  getTimestamp() {
    return this.formatDate(new Date(), this.formats.timestamp);
  }

  /**
   * Get ISO string
   */
  toISOString(date = null) {
    const d = this.createDate(date);
    return d.toISOString();
  }

  /**
   * Get Unix timestamp
   */
  toUnixTimestamp(date = null) {
    const d = this.createDate(date);
    return Math.floor(d.getTime() / 1000);
  }

  /**
   * From Unix timestamp
   */
  fromUnixTimestamp(timestamp) {
    return new Date(timestamp * 1000);
  }

  /**
   * Get age of date in human readable format
   */
  getAge(date) {
    const d = this.createDate(date);
    const now = new Date();
    const diffMs = now - d;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Validate date string
   */
  isValidDate(dateString) {
    const parsed = this.parseDate(dateString);
    return parsed && !isNaN(parsed.getTime());
  }

  /**
   * Get date range (start and end of day)
   */
  getDateRange(date) {
    const d = this.createDate(date);
    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Log date operation
   */
  logDateOperation(operation, details = {}) {
    logger.info('Date operation', {
      operation,
      timestamp: this.getTimestamp(),
      ...details
    });
  }
}

module.exports = new DateUtil();
