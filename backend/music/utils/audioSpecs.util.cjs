/**
 * Audio Specifications Utilities
 * Technical requirements and validation for audio files
 * Provides platform-specific audio format requirements and quality checks
 */

const logger = require('../../config/logger.cjs');

class AudioSpecsUtil {
  constructor() {
    // Standard audio specifications for different platforms
    this.platformSpecs = {
      spotify: {
        formats: ['mp3', 'flac', 'wav', 'ogg'],
        minBitrate: 96, // kbps
        maxBitrate: 320,
        preferredBitrate: 320,
        sampleRates: [44100, 48000, 96000],
        preferredSampleRate: 44100,
        bitDepths: [16, 24],
        preferredBitDepth: 16,
        channels: [1, 2], // mono, stereo
        preferredChannels: 2,
        maxDuration: 11 * 60 * 1000, // 11 minutes in ms
        minDuration: 0.5 * 1000, // 0.5 seconds in ms
        loudnessTarget: -14, // LUFS
        loudnessTolerance: 2,
        peakLimit: -1 // dBFS
      },
      
      apple_music: {
        formats: ['aac', 'm4a', 'alac', 'wav'],
        minBitrate: 64,
        maxBitrate: 256,
        preferredBitrate: 256,
        sampleRates: [44100, 48000, 96000, 192000],
        preferredSampleRate: 44100,
        bitDepths: [16, 24],
        preferredBitDepth: 24,
        channels: [1, 2],
        preferredChannels: 2,
        maxDuration: 10 * 60 * 1000, // 10 minutes
        minDuration: 0.5 * 1000,
        loudnessTarget: -16, // LUFS
        loudnessTolerance: 2,
        peakLimit: -1
      },
      
      youtube_music: {
        formats: ['mp3', 'aac', 'wav', 'flac'],
        minBitrate: 128,
        maxBitrate: 320,
        preferredBitrate: 320,
        sampleRates: [44100, 48000],
        preferredSampleRate: 48000,
        bitDepths: [16, 24],
        preferredBitDepth: 16,
        channels: [1, 2],
        preferredChannels: 2,
        maxDuration: 12 * 60 * 1000, // 12 minutes
        minDuration: 1 * 1000, // 1 second
        loudnessTarget: -14,
        loudnessTolerance: 3,
        peakLimit: -0.1
      },
      
      tidal: {
        formats: ['flac', 'wav', 'mqa', 'aac'],
        minBitrate: 320, // For lossy formats
        maxBitrate: 1411, // CD quality
        preferredBitrate: 1411,
        sampleRates: [44100, 48000, 96000, 192000, 352800, 384000],
        preferredSampleRate: 44100,
        bitDepths: [16, 24, 32],
        preferredBitDepth: 24,
        channels: [1, 2],
        preferredChannels: 2,
        maxDuration: 15 * 60 * 1000, // 15 minutes
        minDuration: 0.5 * 1000,
        loudnessTarget: -18, // LUFS for high quality
        loudnessTolerance: 2,
        peakLimit: -0.3,
        supportsHiRes: true,
        supportsMQA: true
      },
      
      amazon_music: {
        formats: ['mp3', 'flac', 'wav'],
        minBitrate: 128,
        maxBitrate: 320,
        preferredBitrate: 320,
        sampleRates: [44100, 48000, 96000],
        preferredSampleRate: 44100,
        bitDepths: [16, 24],
        preferredBitDepth: 16,
        channels: [1, 2],
        preferredChannels: 2,
        maxDuration: 10 * 60 * 1000,
        minDuration: 0.5 * 1000,
        loudnessTarget: -14,
        loudnessTolerance: 2,
        peakLimit: -1
      },
      
      deezer: {
        formats: ['mp3', 'flac', 'wav'],
        minBitrate: 128,
        maxBitrate: 320,
        preferredBitrate: 320,
        sampleRates: [44100, 48000],
        preferredSampleRate: 44100,
        bitDepths: [16, 24],
        preferredBitDepth: 16,
        channels: [1, 2],
        preferredChannels: 2,
        maxDuration: 15 * 60 * 1000,
        minDuration: 30 * 1000, // 30 seconds minimum
        loudnessTarget: -14,
        loudnessTolerance: 2,
        peakLimit: -1
      }
    };

    // Universal audio quality standards
    this.qualityStandards = {
      low: {
        sampleRate: 22050,
        bitDepth: 16,
        bitrate: 128,
        channels: 2
      },
      standard: {
        sampleRate: 44100,
        bitDepth: 16,
        bitrate: 320,
        channels: 2
      },
      high: {
        sampleRate: 48000,
        bitDepth: 24,
        bitrate: 1411, // Lossless equivalent
        channels: 2
      },
      ultra: {
        sampleRate: 96000,
        bitDepth: 24,
        bitrate: 4608, // High-res equivalent
        channels: 2
      }
    };
  }

  // ========== Platform Specifications ==========

  /**
   * Get audio specifications for a specific platform
   */
  getPlatformSpecs(platform) {
    const normalizedPlatform = platform.toLowerCase().replace(/[^a-z_]/g, '_');
    return this.platformSpecs[normalizedPlatform] || null;
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms() {
    return Object.keys(this.platformSpecs);
  }

  /**
   * Check if platform supports specific format
   */
  isPlatformFormatSupported(platform, format) {
    const specs = this.getPlatformSpecs(platform);
    if (!specs) return false;
    
    return specs.formats.includes(format.toLowerCase());
  }

  // ========== Audio Validation ==========

  /**
   * Validate audio file against platform requirements
   */
  validateAudioForPlatform(audioData, platform) {
    const specs = this.getPlatformSpecs(platform);
    if (!specs) {
      return {
        isValid: false,
        errors: [`Unsupported platform: ${platform}`],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Format validation
    if (!specs.formats.includes(audioData.format?.toLowerCase())) {
      errors.push(`Unsupported format '${audioData.format}' for ${platform}. Supported: ${specs.formats.join(', ')}`);
    }

    // Sample rate validation
    if (audioData.sampleRate && !specs.sampleRates.includes(audioData.sampleRate)) {
      errors.push(`Unsupported sample rate ${audioData.sampleRate}Hz for ${platform}. Supported: ${specs.sampleRates.join(', ')}Hz`);
    }

    // Bit depth validation
    if (audioData.bitDepth && !specs.bitDepths.includes(audioData.bitDepth)) {
      errors.push(`Unsupported bit depth ${audioData.bitDepth}-bit for ${platform}. Supported: ${specs.bitDepths.join(', ')}-bit`);
    }

    // Bitrate validation (for lossy formats)
    if (audioData.bitrate) {
      if (audioData.bitrate < specs.minBitrate) {
        errors.push(`Bitrate ${audioData.bitrate}kbps below minimum ${specs.minBitrate}kbps for ${platform}`);
      }
      if (audioData.bitrate > specs.maxBitrate) {
        warnings.push(`Bitrate ${audioData.bitrate}kbps above recommended maximum ${specs.maxBitrate}kbps for ${platform}`);
      }
      if (audioData.bitrate !== specs.preferredBitrate) {
        warnings.push(`Recommended bitrate for ${platform} is ${specs.preferredBitrate}kbps`);
      }
    }

    // Duration validation
    if (audioData.duration) {
      if (audioData.duration < specs.minDuration) {
        errors.push(`Duration ${this.formatDuration(audioData.duration)} below minimum ${this.formatDuration(specs.minDuration)} for ${platform}`);
      }
      if (audioData.duration > specs.maxDuration) {
        errors.push(`Duration ${this.formatDuration(audioData.duration)} exceeds maximum ${this.formatDuration(specs.maxDuration)} for ${platform}`);
      }
    }

    // Loudness validation
    if (audioData.loudness) {
      const targetMin = specs.loudnessTarget - specs.loudnessTolerance;
      const targetMax = specs.loudnessTarget + specs.loudnessTolerance;
      
      if (audioData.loudness < targetMin || audioData.loudness > targetMax) {
        warnings.push(`Loudness ${audioData.loudness}LUFS outside target range ${targetMin} to ${targetMax}LUFS for ${platform}`);
      }
    }

    // Peak level validation
    if (audioData.peakLevel && audioData.peakLevel > specs.peakLimit) {
      warnings.push(`Peak level ${audioData.peakLevel}dBFS above limit ${specs.peakLimit}dBFS for ${platform}`);
    }

    // Channels validation
    if (audioData.channels && !specs.channels.includes(audioData.channels)) {
      errors.push(`Unsupported channel count ${audioData.channels} for ${platform}. Supported: ${specs.channels.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations: this.generateRecommendations(audioData, specs)
    };
  }

  /**
   * Validate audio against multiple platforms
   */
  validateAudioForPlatforms(audioData, platforms) {
    const results = {};
    
    for (const platform of platforms) {
      results[platform] = this.validateAudioForPlatform(audioData, platform);
    }

    // Generate overall compatibility summary
    const compatiblePlatforms = platforms.filter(p => results[p].isValid);
    const incompatiblePlatforms = platforms.filter(p => !results[p].isValid);

    return {
      platforms: results,
      summary: {
        compatible: compatiblePlatforms,
        incompatible: incompatiblePlatforms,
        compatibilityScore: (compatiblePlatforms.length / platforms.length) * 100
      }
    };
  }

  // ========== Quality Assessment ==========

  /**
   * Assess overall audio quality
   */
  assessAudioQuality(audioData) {
    let score = 0;
    let maxScore = 100;
    const issues = [];
    const recommendations = [];

    // Sample rate scoring (25 points)
    if (audioData.sampleRate >= 96000) {
      score += 25;
    } else if (audioData.sampleRate >= 48000) {
      score += 20;
    } else if (audioData.sampleRate >= 44100) {
      score += 15;
    } else if (audioData.sampleRate >= 22050) {
      score += 5;
    } else {
      issues.push('Very low sample rate');
    }

    // Bit depth scoring (25 points)
    if (audioData.bitDepth >= 24) {
      score += 25;
    } else if (audioData.bitDepth >= 16) {
      score += 15;
    } else {
      score += 5;
      issues.push('Low bit depth');
    }

    // Bitrate/format scoring (25 points)
    const isLossless = ['flac', 'wav', 'alac'].includes(audioData.format?.toLowerCase());
    if (isLossless) {
      score += 25;
    } else if (audioData.bitrate >= 320) {
      score += 20;
    } else if (audioData.bitrate >= 256) {
      score += 15;
    } else if (audioData.bitrate >= 192) {
      score += 10;
    } else {
      score += 5;
      issues.push('Low bitrate');
    }

    // Dynamic range scoring (25 points)
    if (audioData.dynamicRange >= 15) {
      score += 25;
    } else if (audioData.dynamicRange >= 10) {
      score += 20;
    } else if (audioData.dynamicRange >= 5) {
      score += 10;
    } else {
      score += 5;
      issues.push('Limited dynamic range (over-compressed)');
    }

    // Generate recommendations
    if (audioData.sampleRate < 44100) {
      recommendations.push('Consider using at least 44.1kHz sample rate');
    }
    if (audioData.bitDepth < 16) {
      recommendations.push('Use at least 16-bit depth');
    }
    if (!isLossless && audioData.bitrate < 320) {
      recommendations.push('For best quality, use 320kbps MP3 or lossless format');
    }
    if (audioData.dynamicRange < 10) {
      recommendations.push('Preserve more dynamic range in mastering');
    }

    let qualityLevel;
    if (score >= 85) qualityLevel = 'excellent';
    else if (score >= 70) qualityLevel = 'good';
    else if (score >= 50) qualityLevel = 'fair';
    else qualityLevel = 'poor';

    return {
      score,
      maxScore,
      qualityLevel,
      issues,
      recommendations
    };
  }

  /**
   * Get optimal settings for target quality level
   */
  getOptimalSettings(targetQuality = 'standard') {
    const settings = this.qualityStandards[targetQuality];
    if (!settings) {
      throw new Error(`Unknown quality level: ${targetQuality}`);
    }

    return {
      ...settings,
      format: targetQuality === 'low' ? 'mp3' : 
              targetQuality === 'standard' ? 'mp3' :
              'flac'
    };
  }

  // ========== Format Conversion Recommendations ==========

  /**
   * Get conversion recommendations for platform compatibility
   */
  getConversionRecommendations(audioData, targetPlatforms) {
    const recommendations = [];
    
    for (const platform of targetPlatforms) {
      const specs = this.getPlatformSpecs(platform);
      if (!specs) continue;

      const platformRec = {
        platform,
        recommendations: []
      };

      // Format conversion
      if (!specs.formats.includes(audioData.format?.toLowerCase())) {
        platformRec.recommendations.push({
          type: 'format',
          current: audioData.format,
          recommended: specs.formats[0], // First format is usually preferred
          reason: `${audioData.format} not supported by ${platform}`
        });
      }

      // Sample rate conversion
      if (audioData.sampleRate && !specs.sampleRates.includes(audioData.sampleRate)) {
        platformRec.recommendations.push({
          type: 'sampleRate',
          current: audioData.sampleRate,
          recommended: specs.preferredSampleRate,
          reason: `${audioData.sampleRate}Hz not supported by ${platform}`
        });
      }

      // Bit depth conversion
      if (audioData.bitDepth && !specs.bitDepths.includes(audioData.bitDepth)) {
        platformRec.recommendations.push({
          type: 'bitDepth',
          current: audioData.bitDepth,
          recommended: specs.preferredBitDepth,
          reason: `${audioData.bitDepth}-bit not supported by ${platform}`
        });
      }

      // Loudness normalization
      if (audioData.loudness) {
        const targetMin = specs.loudnessTarget - specs.loudnessTolerance;
        const targetMax = specs.loudnessTarget + specs.loudnessTolerance;
        
        if (audioData.loudness < targetMin || audioData.loudness > targetMax) {
          platformRec.recommendations.push({
            type: 'loudness',
            current: audioData.loudness,
            recommended: specs.loudnessTarget,
            reason: `Optimize loudness for ${platform} standards`
          });
        }
      }

      if (platformRec.recommendations.length > 0) {
        recommendations.push(platformRec);
      }
    }

    return recommendations;
  }

  // ========== Utility Methods ==========

  /**
   * Generate recommendations based on specs
   */
  generateRecommendations(audioData, specs) {
    const recommendations = [];

    if (audioData.sampleRate !== specs.preferredSampleRate) {
      recommendations.push(`Use ${specs.preferredSampleRate}Hz sample rate for optimal compatibility`);
    }

    if (audioData.bitDepth !== specs.preferredBitDepth) {
      recommendations.push(`Use ${specs.preferredBitDepth}-bit depth for optimal quality`);
    }

    if (audioData.bitrate && audioData.bitrate !== specs.preferredBitrate) {
      recommendations.push(`Use ${specs.preferredBitrate}kbps bitrate for optimal quality`);
    }

    if (audioData.channels !== specs.preferredChannels) {
      recommendations.push(`Use ${specs.preferredChannels === 1 ? 'mono' : 'stereo'} for optimal compatibility`);
    }

    return recommendations;
  }

  /**
   * Format duration from milliseconds to readable string
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate file size estimation
   */
  estimateFileSize(duration, sampleRate, bitDepth, channels, format = 'wav') {
    // For uncompressed formats
    if (['wav', 'aiff'].includes(format.toLowerCase())) {
      const bitsPerSecond = sampleRate * bitDepth * channels;
      const bytesPerSecond = bitsPerSecond / 8;
      return Math.ceil((duration / 1000) * bytesPerSecond);
    }

    // For compressed formats (rough estimation)
    const compressionRatios = {
      mp3: 11, // ~11:1 compression at 320kbps
      aac: 12, // ~12:1 compression
      ogg: 10, // ~10:1 compression
      flac: 2   // ~2:1 lossless compression
    };

    const uncompressedSize = this.estimateFileSize(duration, sampleRate, bitDepth, channels, 'wav');
    const ratio = compressionRatios[format.toLowerCase()] || 10;
    
    return Math.ceil(uncompressedSize / ratio);
  }

  /**
   * Get format MIME type
   */
  getFormatMimeType(format) {
    const mimeTypes = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      alac: 'audio/mp4',
      aiff: 'audio/aiff'
    };

    return mimeTypes[format.toLowerCase()] || 'audio/mpeg';
  }

  /**
   * Check if format is lossless
   */
  isLosslessFormat(format) {
    const losslessFormats = ['wav', 'flac', 'alac', 'aiff', 'dsd'];
    return losslessFormats.includes(format.toLowerCase());
  }

  /**
   * Get recommended master format for distribution
   */
  getRecommendedMasterFormat() {
    return {
      format: 'wav',
      sampleRate: 48000,
      bitDepth: 24,
      channels: 2,
      loudnessTarget: -16, // LUFS
      peakLimit: -0.3, // dBFS
      reasoning: 'High-quality master suitable for all platform conversions'
    };
  }

  /**
   * Log audio specifications
   */
  logAudioSpecs(audioData, context = '') {
    logger.info('Audio specifications', {
      context,
      format: audioData.format,
      sampleRate: audioData.sampleRate,
      bitDepth: audioData.bitDepth,
      channels: audioData.channels,
      bitrate: audioData.bitrate,
      duration: this.formatDuration(audioData.duration || 0),
      fileSize: audioData.fileSize ? `${Math.round(audioData.fileSize / 1024 / 1024 * 100) / 100}MB` : 'unknown'
    });
  }
}

module.exports = new AudioSpecsUtil();
