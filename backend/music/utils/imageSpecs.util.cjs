/**
 * Image Specifications Utilities
 * Requirements and validation for artwork and images
 * Provides platform-specific image format requirements and quality checks
 */

const logger = require('../../config/logger.cjs');

class ImageSpecsUtil {
  constructor() {
    // Standard image specifications for different platforms
    this.platformSpecs = {
      spotify: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 640, height: 640 },
        maxDimensions: { width: 3000, height: 3000 },
        preferredDimensions: { width: 1400, height: 1400 },
        aspectRatio: 1, // 1:1 square
        maxFileSize: 10 * 1024 * 1024, // 10MB
        minFileSize: 100 * 1024, // 100KB
        colorMode: 'RGB',
        quality: 85, // JPEG quality
        requiresSquare: true
      },

      apple_music: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 1400, height: 1400 },
        maxDimensions: { width: 3000, height: 3000 },
        preferredDimensions: { width: 3000, height: 3000 },
        aspectRatio: 1,
        maxFileSize: 10 * 1024 * 1024,
        minFileSize: 500 * 1024, // 500KB
        colorMode: 'RGB',
        quality: 90,
        requiresSquare: true,
        supportsTransparency: false
      },

      youtube_music: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 1280, height: 720 },
        maxDimensions: { width: 2560, height: 1440 },
        preferredDimensions: { width: 1920, height: 1080 },
        aspectRatio: 16/9, // 16:9 for video thumbnails
        maxFileSize: 2 * 1024 * 1024, // 2MB
        minFileSize: 100 * 1024,
        colorMode: 'RGB',
        quality: 80,
        requiresSquare: false,
        supportsCustomThumbnails: true
      },

      tidal: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 1280, height: 1280 },
        maxDimensions: { width: 3000, height: 3000 },
        preferredDimensions: { width: 1280, height: 1280 },
        aspectRatio: 1,
        maxFileSize: 10 * 1024 * 1024,
        minFileSize: 300 * 1024,
        colorMode: 'RGB',
        quality: 95, // High quality for Tidal
        requiresSquare: true
      },

      amazon_music: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 1400, height: 1400 },
        maxDimensions: { width: 3000, height: 3000 },
        preferredDimensions: { width: 1600, height: 1600 },
        aspectRatio: 1,
        maxFileSize: 10 * 1024 * 1024,
        minFileSize: 400 * 1024,
        colorMode: 'RGB',
        quality: 85,
        requiresSquare: true
      },

      deezer: {
        formats: ['jpeg', 'jpg', 'png'],
        minDimensions: { width: 600, height: 600 },
        maxDimensions: { width: 1800, height: 1800 },
        preferredDimensions: { width: 1000, height: 1000 },
        aspectRatio: 1,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        minFileSize: 200 * 1024,
        colorMode: 'RGB',
        quality: 80,
        requiresSquare: true
      }
    };

    // Image quality standards
    this.qualityStandards = {
      thumbnail: {
        dimensions: { width: 300, height: 300 },
        quality: 70,
        maxFileSize: 100 * 1024
      },
      standard: {
        dimensions: { width: 1000, height: 1000 },
        quality: 85,
        maxFileSize: 2 * 1024 * 1024
      },
      high: {
        dimensions: { width: 1600, height: 1600 },
        quality: 90,
        maxFileSize: 5 * 1024 * 1024
      },
      ultra: {
        dimensions: { width: 3000, height: 3000 },
        quality: 95,
        maxFileSize: 10 * 1024 * 1024
      }
    };

    // Supported image formats and their properties
    this.formatProperties = {
      jpeg: {
        extension: 'jpg',
        mimeType: 'image/jpeg',
        supportsTransparency: false,
        supportsAnimation: false,
        compressionType: 'lossy',
        typicalQuality: 85
      },
      jpg: {
        extension: 'jpg',
        mimeType: 'image/jpeg',
        supportsTransparency: false,
        supportsAnimation: false,
        compressionType: 'lossy',
        typicalQuality: 85
      },
      png: {
        extension: 'png',
        mimeType: 'image/png',
        supportsTransparency: true,
        supportsAnimation: false,
        compressionType: 'lossless',
        typicalQuality: 100
      },
      webp: {
        extension: 'webp',
        mimeType: 'image/webp',
        supportsTransparency: true,
        supportsAnimation: true,
        compressionType: 'both',
        typicalQuality: 85
      },
      gif: {
        extension: 'gif',
        mimeType: 'image/gif',
        supportsTransparency: true,
        supportsAnimation: true,
        compressionType: 'lossless',
        typicalQuality: 100
      }
    };
  }

  // ========== Platform Specifications ==========

  /**
   * Get image specifications for a specific platform
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

  // ========== Image Validation ==========

  /**
   * Validate image against platform requirements
   */
  validateImageForPlatform(imageData, platform) {
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
    if (!specs.formats.includes(imageData.format?.toLowerCase())) {
      errors.push(`Unsupported format '${imageData.format}' for ${platform}. Supported: ${specs.formats.join(', ')}`);
    }

    // Dimensions validation
    if (imageData.width && imageData.height) {
      if (imageData.width < specs.minDimensions.width || imageData.height < specs.minDimensions.height) {
        errors.push(`Dimensions ${imageData.width}x${imageData.height} below minimum ${specs.minDimensions.width}x${specs.minDimensions.height} for ${platform}`);
      }

      if (imageData.width > specs.maxDimensions.width || imageData.height > specs.maxDimensions.height) {
        warnings.push(`Dimensions ${imageData.width}x${imageData.height} exceed recommended maximum ${specs.maxDimensions.width}x${specs.maxDimensions.height} for ${platform}`);
      }

      // Aspect ratio validation
      const actualRatio = imageData.width / imageData.height;
      const expectedRatio = specs.aspectRatio;
      const tolerance = 0.05; // 5% tolerance

      if (Math.abs(actualRatio - expectedRatio) > tolerance) {
        if (specs.requiresSquare && expectedRatio === 1) {
          errors.push(`Image must be square (1:1 aspect ratio) for ${platform}. Current: ${Math.round(actualRatio * 100) / 100}:1`);
        } else {
          warnings.push(`Aspect ratio ${Math.round(actualRatio * 100) / 100}:1 doesn't match recommended ${expectedRatio}:1 for ${platform}`);
        }
      }
    }

    // File size validation
    if (imageData.fileSize) {
      if (imageData.fileSize > specs.maxFileSize) {
        errors.push(`File size ${this.formatFileSize(imageData.fileSize)} exceeds maximum ${this.formatFileSize(specs.maxFileSize)} for ${platform}`);
      }

      if (imageData.fileSize < specs.minFileSize) {
        warnings.push(`File size ${this.formatFileSize(imageData.fileSize)} below recommended minimum ${this.formatFileSize(specs.minFileSize)} for ${platform}`);
      }
    }

    // Color mode validation
    if (imageData.colorMode && imageData.colorMode !== specs.colorMode) {
      warnings.push(`Color mode '${imageData.colorMode}' should be '${specs.colorMode}' for ${platform}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations: this.generateImageRecommendations(imageData, specs)
    };
  }

  /**
   * Validate image against multiple platforms
   */
  validateImageForPlatforms(imageData, platforms) {
    const results = {};
    
    for (const platform of platforms) {
      results[platform] = this.validateImageForPlatform(imageData, platform);
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
   * Assess overall image quality
   */
  assessImageQuality(imageData) {
    let score = 0;
    let maxScore = 100;
    const issues = [];
    const recommendations = [];

    // Resolution scoring (40 points)
    const totalPixels = (imageData.width || 0) * (imageData.height || 0);
    if (totalPixels >= 9000000) { // 3000x3000
      score += 40;
    } else if (totalPixels >= 4000000) { // 2000x2000
      score += 35;
    } else if (totalPixels >= 2250000) { // 1500x1500
      score += 30;
    } else if (totalPixels >= 1000000) { // 1000x1000
      score += 20;
    } else if (totalPixels >= 250000) { // 500x500
      score += 10;
    } else {
      score += 5;
      issues.push('Low resolution');
    }

    // Format scoring (20 points)
    const format = imageData.format?.toLowerCase();
    if (format === 'png') {
      score += 20; // Lossless
    } else if (format === 'jpg' || format === 'jpeg') {
      score += 15; // Good compression
    } else if (format === 'webp') {
      score += 18; // Modern format
    } else {
      score += 5;
    }

    // Aspect ratio scoring (20 points)
    if (imageData.width && imageData.height) {
      const ratio = imageData.width / imageData.height;
      if (Math.abs(ratio - 1) < 0.01) { // Square
        score += 20;
      } else if (Math.abs(ratio - 16/9) < 0.1) { // 16:9
        score += 15;
      } else if (Math.abs(ratio - 4/3) < 0.1) { // 4:3
        score += 10;
      } else {
        score += 5;
        issues.push('Non-standard aspect ratio');
      }
    }

    // File size efficiency scoring (20 points)
    if (imageData.fileSize && imageData.width && imageData.height) {
      const pixelCount = imageData.width * imageData.height;
      const bytesPerPixel = imageData.fileSize / pixelCount;
      
      if (bytesPerPixel < 1) {
        score += 20; // Very efficient
      } else if (bytesPerPixel < 2) {
        score += 15;
      } else if (bytesPerPixel < 4) {
        score += 10;
      } else {
        score += 5;
        issues.push('Large file size for resolution');
      }
    }

    // Generate recommendations
    if (totalPixels < 1000000) {
      recommendations.push('Increase resolution to at least 1000x1000 pixels');
    }
    if (format !== 'jpg' && format !== 'png') {
      recommendations.push('Use JPEG or PNG format for better compatibility');
    }
    if (imageData.width && imageData.height && Math.abs(imageData.width / imageData.height - 1) > 0.1) {
      recommendations.push('Use square (1:1) aspect ratio for album artwork');
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

  // ========== Format Conversion Recommendations ==========

  /**
   * Get conversion recommendations for platform compatibility
   */
  getConversionRecommendations(imageData, targetPlatforms) {
    const recommendations = [];
    
    for (const platform of targetPlatforms) {
      const specs = this.getPlatformSpecs(platform);
      if (!specs) continue;

      const platformRec = {
        platform,
        recommendations: []
      };

      // Format conversion
      if (!specs.formats.includes(imageData.format?.toLowerCase())) {
        platformRec.recommendations.push({
          type: 'format',
          current: imageData.format,
          recommended: specs.formats[0],
          reason: `${imageData.format} not supported by ${platform}`
        });
      }

      // Dimensions adjustment
      if (imageData.width && imageData.height) {
        const needsResize = 
          imageData.width < specs.minDimensions.width ||
          imageData.height < specs.minDimensions.height ||
          imageData.width > specs.maxDimensions.width ||
          imageData.height > specs.maxDimensions.height;

        if (needsResize) {
          platformRec.recommendations.push({
            type: 'dimensions',
            current: `${imageData.width}x${imageData.height}`,
            recommended: `${specs.preferredDimensions.width}x${specs.preferredDimensions.height}`,
            reason: `Optimize dimensions for ${platform}`
          });
        }
      }

      // File size optimization
      if (imageData.fileSize && imageData.fileSize > specs.maxFileSize) {
        platformRec.recommendations.push({
          type: 'fileSize',
          current: this.formatFileSize(imageData.fileSize),
          recommended: this.formatFileSize(specs.maxFileSize),
          reason: `Reduce file size for ${platform}`
        });
      }

      if (platformRec.recommendations.length > 0) {
        recommendations.push(platformRec);
      }
    }

    return recommendations;
  }

  // ========== Image Generation Guidelines ==========

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
      format: 'jpeg',
      colorMode: 'RGB',
      aspectRatio: 1 // Square
    };
  }

  /**
   * Generate multiple sizes for responsive artwork
   */
  generateSizeVariants(baseWidth = 3000, baseHeight = 3000) {
    return {
      thumbnail: { width: 150, height: 150, suffix: '_thumb' },
      small: { width: 300, height: 300, suffix: '_small' },
      medium: { width: 600, height: 600, suffix: '_medium' },
      large: { width: 1200, height: 1200, suffix: '_large' },
      xlarge: { width: 1600, height: 1600, suffix: '_xlarge' },
      original: { width: baseWidth, height: baseHeight, suffix: '_original' }
    };
  }

  // ========== Utility Methods ==========

  /**
   * Generate image recommendations based on specs
   */
  generateImageRecommendations(imageData, specs) {
    const recommendations = [];

    if (imageData.width !== specs.preferredDimensions.width || 
        imageData.height !== specs.preferredDimensions.height) {
      recommendations.push(`Use ${specs.preferredDimensions.width}x${specs.preferredDimensions.height} dimensions for optimal quality`);
    }

    if (imageData.format?.toLowerCase() !== 'jpeg' && 
        imageData.format?.toLowerCase() !== 'jpg' && 
        specs.formats.includes('jpeg')) {
      recommendations.push('Use JPEG format for smaller file sizes');
    }

    if (imageData.fileSize && imageData.fileSize > specs.maxFileSize * 0.8) {
      recommendations.push('Consider compressing image to reduce file size');
    }

    return recommendations;
  }

  /**
   * Format file size to readable string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get format MIME type
   */
  getFormatMimeType(format) {
    const formatProps = this.formatProperties[format.toLowerCase()];
    return formatProps ? formatProps.mimeType : 'image/jpeg';
  }

  /**
   * Get format file extension
   */
  getFormatExtension(format) {
    const formatProps = this.formatProperties[format.toLowerCase()];
    return formatProps ? formatProps.extension : 'jpg';
  }

  /**
   * Check if format supports transparency
   */
  supportsTransparency(format) {
    const formatProps = this.formatProperties[format.toLowerCase()];
    return formatProps ? formatProps.supportsTransparency : false;
  }

  /**
   * Get recommended format for use case
   */
  getRecommendedFormat(useCase = 'album_artwork') {
    const recommendations = {
      album_artwork: 'jpeg', // Best compatibility and file size
      logo: 'png', // Supports transparency
      profile_picture: 'jpeg',
      banner: 'jpeg',
      thumbnail: 'jpeg',
      icon: 'png'
    };

    return recommendations[useCase] || 'jpeg';
  }

  /**
   * Estimate optimal JPEG quality
   */
  estimateOptimalQuality(imageData, targetFileSize = null) {
    if (!targetFileSize) {
      // Default quality based on dimensions
      const totalPixels = (imageData.width || 1000) * (imageData.height || 1000);
      if (totalPixels > 4000000) return 85; // High res
      if (totalPixels > 1000000) return 90; // Medium res
      return 95; // Low res
    }

    // Estimate quality needed for target file size
    // This is a rough estimation - actual results may vary
    const pixelCount = (imageData.width || 1000) * (imageData.height || 1000);
    const bytesPerPixel = targetFileSize / pixelCount;
    
    if (bytesPerPixel > 3) return 95;
    if (bytesPerPixel > 2) return 90;
    if (bytesPerPixel > 1) return 85;
    if (bytesPerPixel > 0.5) return 80;
    return 75;
  }

  /**
   * Log image specifications
   */
  logImageSpecs(imageData, context = '') {
    logger.info('Image specifications', {
      context,
      format: imageData.format,
      dimensions: `${imageData.width}x${imageData.height}`,
      aspectRatio: imageData.width && imageData.height ? 
        Math.round((imageData.width / imageData.height) * 100) / 100 : 'unknown',
      fileSize: imageData.fileSize ? this.formatFileSize(imageData.fileSize) : 'unknown',
      colorMode: imageData.colorMode || 'unknown'
    });
  }
}

module.exports = new ImageSpecsUtil();
