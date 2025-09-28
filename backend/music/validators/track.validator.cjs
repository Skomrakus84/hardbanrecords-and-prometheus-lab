/**
 * Track Validator
 * Specialized validation for track entities, audio files, and technical requirements
 * Handles validation for track creation, audio processing, and distribution compliance
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../../config/logger.cjs');

class TrackValidator extends MetadataValidator {
  constructor() {
    super();
  }

  // ========== Track-Specific Validation ==========

  /**
   * Validate complete track for creation
   */
  async validateForCreation(trackData, options = {}) {
    this.resetValidation();
    
    const { 
      validateAudioFile = true,
      validateMetadata = true,
      strict = false 
    } = options;

    try {
      // Basic track validation
      await this.validateTrackStructure(trackData);
      
      // Metadata validation
      if (validateMetadata) {
        await this.validateTrackMetadata(trackData, { strict });
      }
      
      // Audio file validation
      if (validateAudioFile) {
        await this.validateAudioFile(trackData);
      }
      
      // Technical validation
      await this.validateTechnicalRequirements(trackData);
      
      // Content validation
      await this.validateContentRequirements(trackData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Track creation validation error', { error: error.message });
      this.addError('validation_error', 'Track validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate track for audio processing
   */
  async validateForAudioProcessing(trackData, options = {}) {
    this.resetValidation();
    
    const { 
      validateFormat = true,
      validateQuality = true,
      targetFormat = null 
    } = options;

    try {
      // Audio format validation
      if (validateFormat) {
        await this.validateAudioFormat(trackData, targetFormat);
      }
      
      // Audio quality validation
      if (validateQuality) {
        await this.validateAudioQuality(trackData);
      }
      
      // Processing requirements
      await this.validateProcessingRequirements(trackData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Track audio processing validation error', { error: error.message });
      this.addError('validation_error', 'Audio processing validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate track for platform distribution
   */
  async validateForPlatformDistribution(trackData, platforms = [], options = {}) {
    this.resetValidation();
    
    const { 
      validateCompliance = true,
      validateQuality = true 
    } = options;

    try {
      // Platform compliance validation
      if (validateCompliance) {
        await this.validatePlatformCompliance(trackData, platforms);
      }
      
      // Quality requirements for platforms
      if (validateQuality) {
        await this.validatePlatformQualityRequirements(trackData, platforms);
      }
      
      // Content policy validation
      await this.validateContentPolicyCompliance(trackData, platforms);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Track platform distribution validation error', { error: error.message });
      this.addError('validation_error', 'Platform distribution validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  // ========== Structure Validation ==========

  /**
   * Validate track data structure
   */
  async validateTrackStructure(trackData) {
    // Required fields validation
    const requiredFields = ['title', 'duration_ms', 'track_number'];
    
    requiredFields.forEach(field => {
      if (trackData[field] === undefined || trackData[field] === null) {
        this.addError('missing_required_field', `${field} is required`, field);
      }
    });

    // Data type validation
    if (trackData.title && typeof trackData.title !== 'string') {
      this.addError('invalid_data_type', 'Title must be a string', 'title');
    }

    if (trackData.duration_ms && !Number.isInteger(trackData.duration_ms)) {
      this.addError('invalid_data_type', 'Duration must be an integer', 'duration_ms');
    }

    if (trackData.track_number && !Number.isInteger(trackData.track_number)) {
      this.addError('invalid_data_type', 'Track number must be an integer', 'track_number');
    }

    if (trackData.explicit_content && typeof trackData.explicit_content !== 'boolean') {
      this.addError('invalid_data_type', 'Explicit content must be boolean', 'explicit_content');
    }

    // Numeric field validation
    const numericFields = [
      'tempo_bpm', 'sample_rate', 'bit_depth', 'audio_channels', 
      'audio_bitrate', 'file_size_bytes', 'preview_start_time', 'preview_duration'
    ];

    numericFields.forEach(field => {
      if (trackData[field] !== undefined && !Number.isFinite(trackData[field])) {
        this.addError('invalid_numeric_value', `${field} must be a valid number`, field);
      }
    });

    // Array field validation
    const arrayFields = ['tags', 'mood_tags', 'genre_tags', 'instrument_tags'];
    arrayFields.forEach(field => {
      if (trackData[field] && !Array.isArray(trackData[field])) {
        this.addError('invalid_data_type', `${field} must be an array`, field);
      }
    });

    // Object field validation
    const objectFields = ['metadata', 'external_ids'];
    objectFields.forEach(field => {
      if (trackData[field] && typeof trackData[field] !== 'object') {
        this.addError('invalid_data_type', `${field} must be an object`, field);
      }
    });
  }

  // ========== Audio File Validation ==========

  /**
   * Validate audio file requirements
   */
  async validateAudioFile(trackData) {
    // Audio file presence
    if (!trackData.audio_file_url && !trackData.audio_file && !trackData.audio_file_path) {
      this.addError('missing_audio_file', 'Audio file is required', 'audio_file');
      return;
    }

    // File format validation
    await this.validateAudioFileFormat(trackData);
    
    // File size validation
    await this.validateAudioFileSize(trackData);
    
    // Audio specifications validation
    await this.validateAudioSpecifications(trackData);
  }

  /**
   * Validate audio file format
   */
  async validateAudioFileFormat(trackData) {
    const supportedFormats = ['wav', 'flac', 'aiff', 'm4a', 'mp3'];
    const losslessFormats = ['wav', 'flac', 'aiff'];
    const compressedFormats = ['mp3', 'm4a', 'aac'];

    if (!trackData.audio_file_format) {
      this.addWarning('missing_audio_format', 'Audio file format not specified', 'audio_file_format');
      return;
    }

    const format = trackData.audio_file_format.toLowerCase();

    if (!supportedFormats.includes(format)) {
      this.addError('unsupported_audio_format', 
        `Unsupported audio format: ${format}`, 
        'audio_file_format'
      );
      return;
    }

    // Format-specific validations
    if (compressedFormats.includes(format)) {
      this.addWarning('compressed_audio_format', 
        'Compressed audio formats may reduce quality', 
        'audio_file_format'
      );

      // Bitrate validation for compressed formats
      if (format === 'mp3' && trackData.audio_bitrate) {
        if (trackData.audio_bitrate < 128) {
          this.addError('mp3_bitrate_too_low', 
            'MP3 bitrate below 128 kbps is not acceptable', 
            'audio_bitrate'
          );
        } else if (trackData.audio_bitrate < 320) {
          this.addWarning('mp3_bitrate_suboptimal', 
            'MP3 bitrate below 320 kbps may affect quality', 
            'audio_bitrate'
          );
        }
      }
    }

    // Recommend lossless for mastering
    if (!losslessFormats.includes(format)) {
      this.addWarning('recommend_lossless', 
        'Lossless formats (WAV, FLAC) are recommended for best quality', 
        'audio_file_format'
      );
    }
  }

  /**
   * Validate audio file size
   */
  async validateAudioFileSize(trackData) {
    if (!trackData.file_size_bytes) {
      this.addWarning('missing_file_size', 'File size not specified', 'file_size_bytes');
      return;
    }

    const fileSizeMB = trackData.file_size_bytes / (1024 * 1024);
    const durationMinutes = (trackData.duration_ms || 0) / (1000 * 60);

    // Maximum file size limits
    const maxFileSizeMB = 500; // 500MB absolute limit
    if (fileSizeMB > maxFileSizeMB) {
      this.addError('file_too_large', 
        `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum (${maxFileSizeMB}MB)`, 
        'file_size_bytes'
      );
    }

    // Minimum file size for quality
    if (durationMinutes > 0) {
      const expectedMinSizeMB = durationMinutes * 5; // ~5MB per minute minimum
      if (fileSizeMB < expectedMinSizeMB) {
        this.addWarning('file_possibly_low_quality', 
          'File size seems low for duration, check audio quality', 
          'file_size_bytes'
        );
      }

      // Maximum reasonable size
      const expectedMaxSizeMB = durationMinutes * 50; // ~50MB per minute maximum
      if (fileSizeMB > expectedMaxSizeMB) {
        this.addWarning('file_unnecessarily_large', 
          'File size seems excessive for duration', 
          'file_size_bytes'
        );
      }
    }
  }

  /**
   * Validate audio specifications
   */
  async validateAudioSpecifications(trackData) {
    // Sample rate validation
    if (trackData.sample_rate) {
      const validSampleRates = [22050, 44100, 48000, 88200, 96000, 176400, 192000];
      
      if (!validSampleRates.includes(trackData.sample_rate)) {
        this.addWarning('unusual_sample_rate', 
          `Unusual sample rate: ${trackData.sample_rate}Hz`, 
          'sample_rate'
        );
      }

      if (trackData.sample_rate < 44100) {
        this.addWarning('low_sample_rate', 
          'Sample rate below CD quality (44.1kHz)', 
          'sample_rate'
        );
      }
    }

    // Bit depth validation
    if (trackData.bit_depth) {
      const validBitDepths = [16, 24, 32];
      
      if (!validBitDepths.includes(trackData.bit_depth)) {
        this.addWarning('unusual_bit_depth', 
          `Unusual bit depth: ${trackData.bit_depth}-bit`, 
          'bit_depth'
        );
      }

      if (trackData.bit_depth < 16) {
        this.addError('insufficient_bit_depth', 
          'Bit depth below 16-bit is not acceptable', 
          'bit_depth'
        );
      }
    }

    // Channel count validation
    if (trackData.audio_channels) {
      if (trackData.audio_channels < 1 || trackData.audio_channels > 8) {
        this.addError('invalid_channel_count', 
          'Audio channels must be between 1 and 8', 
          'audio_channels'
        );
      }

      if (trackData.audio_channels > 2) {
        this.addWarning('multichannel_audio', 
          'Multichannel audio may not be supported by all platforms', 
          'audio_channels'
        );
      }
    }
  }

  // ========== Technical Requirements Validation ==========

  /**
   * Validate technical requirements
   */
  async validateTechnicalRequirements(trackData) {
    // Duration validation
    await this.validateDuration(trackData);
    
    // Audio levels validation
    await this.validateAudioLevels(trackData);
    
    // Tempo and timing validation
    await this.validateTempoAndTiming(trackData);
    
    // Key and harmonic validation
    await this.validateKeyAndHarmonic(trackData);
  }

  /**
   * Validate track duration
   */
  async validateDuration(trackData) {
    if (!trackData.duration_ms) {
      this.addError('missing_duration', 'Track duration is required', 'duration_ms');
      return;
    }

    const durationSeconds = trackData.duration_ms / 1000;
    const durationMinutes = durationSeconds / 60;

    // Minimum duration requirements
    if (durationSeconds < 15) {
      this.addError('track_too_short', 
        'Track must be at least 15 seconds long', 
        'duration_ms'
      );
    } else if (durationSeconds < 30) {
      this.addWarning('track_very_short', 
        'Tracks under 30 seconds may not be accepted by some platforms', 
        'duration_ms'
      );
    }

    // Maximum duration warnings
    if (durationMinutes > 10) {
      this.addWarning('track_very_long', 
        'Tracks over 10 minutes may have limited radio play', 
        'duration_ms'
      );
    }

    if (durationMinutes > 20) {
      this.addWarning('track_extremely_long', 
        'Tracks over 20 minutes may affect streaming algorithm placement', 
        'duration_ms'
      );
    }

    // Commercial length recommendations
    if (durationSeconds > 180 && durationSeconds < 240) {
      // Sweet spot for radio
      this.addInfo('optimal_radio_length', 
        'Track length is optimal for radio play', 
        'duration_ms'
      );
    }
  }

  /**
   * Validate audio levels and dynamics
   */
  async validateAudioLevels(trackData) {
    // Peak amplitude validation
    if (trackData.peak_amplitude !== undefined) {
      if (trackData.peak_amplitude > 0) {
        this.addError('peak_clipping', 
          'Peak amplitude above 0dB indicates clipping', 
          'peak_amplitude'
        );
      } else if (trackData.peak_amplitude > -0.1) {
        this.addWarning('peak_near_clipping', 
          'Peak amplitude very close to 0dB, risk of clipping', 
          'peak_amplitude'
        );
      } else if (trackData.peak_amplitude < -6) {
        this.addWarning('peak_too_low', 
          'Peak amplitude very low, track may sound quiet', 
          'peak_amplitude'
        );
      }
    }

    // RMS amplitude validation
    if (trackData.rms_amplitude !== undefined) {
      if (trackData.rms_amplitude > -6) {
        this.addWarning('rms_too_high', 
          'RMS level very high, may indicate over-compression', 
          'rms_amplitude'
        );
      } else if (trackData.rms_amplitude < -20) {
        this.addWarning('rms_too_low', 
          'RMS level very low, track may sound weak', 
          'rms_amplitude'
        );
      }
    }

    // Loudness (LUFS) validation
    if (trackData.loudness_lufs !== undefined) {
      if (trackData.loudness_lufs > -14) {
        this.addWarning('loudness_too_high', 
          'Track louder than -14 LUFS may be reduced by streaming platforms', 
          'loudness_lufs'
        );
      } else if (trackData.loudness_lufs < -23) {
        this.addWarning('loudness_too_low', 
          'Track quieter than -23 LUFS may sound weak on streaming platforms', 
          'loudness_lufs'
        );
      }
    }

    // Dynamic range validation
    if (trackData.dynamic_range !== undefined) {
      if (trackData.dynamic_range < 4) {
        this.addWarning('low_dynamic_range', 
          'Very low dynamic range indicates heavy compression', 
          'dynamic_range'
        );
      } else if (trackData.dynamic_range > 20) {
        this.addWarning('high_dynamic_range', 
          'Very high dynamic range may not translate well to all playback systems', 
          'dynamic_range'
        );
      }
    }
  }

  /**
   * Validate tempo and timing information
   */
  async validateTempoAndTiming(trackData) {
    // Tempo validation
    if (trackData.tempo_bpm !== undefined) {
      if (trackData.tempo_bpm < 20 || trackData.tempo_bpm > 300) {
        this.addWarning('unusual_tempo', 
          `Unusual tempo: ${trackData.tempo_bpm} BPM`, 
          'tempo_bpm'
        );
      }

      // Genre-specific tempo recommendations
      if (trackData.genre) {
        this.validateTempoForGenre(trackData.genre, trackData.tempo_bpm);
      }
    }

    // Time signature validation
    if (trackData.time_signature) {
      const validTimeSignatures = [
        '2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8',
        '3/8', '5/8', '6/4', '7/4', '2/2', '3/2'
      ];

      if (!validTimeSignatures.includes(trackData.time_signature)) {
        this.addWarning('unusual_time_signature', 
          `Unusual time signature: ${trackData.time_signature}`, 
          'time_signature'
        );
      }
    }

    // Preview timing validation
    if (trackData.preview_start_time !== undefined) {
      const durationSeconds = (trackData.duration_ms || 0) / 1000;
      const previewStart = trackData.preview_start_time / 1000;

      if (previewStart < 0) {
        this.addError('negative_preview_start', 
          'Preview start time cannot be negative', 
          'preview_start_time'
        );
      } else if (previewStart >= durationSeconds) {
        this.addError('preview_start_beyond_end', 
          'Preview start time is beyond track duration', 
          'preview_start_time'
        );
      }

      // Optimal preview start recommendations
      if (durationSeconds > 60 && previewStart < 15) {
        this.addWarning('preview_start_too_early', 
          'Preview may start too early, consider starting after intro', 
          'preview_start_time'
        );
      }
    }

    if (trackData.preview_duration !== undefined) {
      if (trackData.preview_duration <= 0) {
        this.addError('invalid_preview_duration', 
          'Preview duration must be positive', 
          'preview_duration'
        );
      } else if (trackData.preview_duration < 15000) {
        this.addWarning('short_preview', 
          'Preview shorter than 15 seconds may not be effective', 
          'preview_duration'
        );
      } else if (trackData.preview_duration > 90000) {
        this.addWarning('long_preview', 
          'Preview longer than 90 seconds may violate platform policies', 
          'preview_duration'
        );
      }
    }
  }

  /**
   * Validate key and harmonic information
   */
  async validateKeyAndHarmonic(trackData) {
    // Key signature validation
    if (trackData.key_signature) {
      const validKeys = [
        // Major keys
        'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
        // Minor keys
        'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
      ];

      if (!validKeys.includes(trackData.key_signature)) {
        this.addWarning('unrecognized_key', 
          `Unrecognized key signature: ${trackData.key_signature}`, 
          'key_signature'
        );
      }
    }

    // Harmonic analysis validation
    if (trackData.spectral_centroid !== undefined) {
      if (trackData.spectral_centroid < 500 || trackData.spectral_centroid > 8000) {
        this.addWarning('unusual_spectral_centroid', 
          'Unusual spectral centroid value', 
          'spectral_centroid'
        );
      }
    }

    if (trackData.zero_crossing_rate !== undefined) {
      if (trackData.zero_crossing_rate < 0 || trackData.zero_crossing_rate > 1) {
        this.addWarning('invalid_zero_crossing_rate', 
          'Zero crossing rate should be between 0 and 1', 
          'zero_crossing_rate'
        );
      }
    }
  }

  // ========== Content Requirements Validation ==========

  /**
   * Validate content requirements
   */
  async validateContentRequirements(trackData) {
    // Lyrics validation
    await this.validateLyricsContent(trackData);
    
    // Content classification validation
    await this.validateContentClassification(trackData);
    
    // Credits validation
    await this.validateCreditsContent(trackData);
    
    // Metadata completeness validation
    await this.validateMetadataCompleteness(trackData);
  }

  /**
   * Validate lyrics content
   */
  async validateLyricsContent(trackData) {
    if (trackData.lyrics) {
      // Lyrics length validation
      if (trackData.lyrics.length > 10000) {
        this.addWarning('lyrics_very_long', 
          'Lyrics are exceptionally long', 
          'lyrics'
        );
      }

      // Explicit content detection
      const explicitPatterns = [
        /\bf[u*ck]+\b/gi, /\bs[h*it]+\b/gi, /\bb[i*tch]+\b/gi,
        /\ba[s*]+hole\b/gi, /\bd[a*mn]+\b/gi, /\bc[r*ap]+\b/gi
      ];

      const hasExplicitContent = explicitPatterns.some(pattern => 
        pattern.test(trackData.lyrics)
      );

      if (hasExplicitContent && !trackData.explicit_content) {
        this.addWarning('potential_explicit_content', 
          'Lyrics may contain explicit content but not marked as explicit', 
          'explicit_content'
        );
      }

      // Language consistency
      if (trackData.lyrics_language && trackData.language) {
        if (trackData.lyrics_language !== trackData.language) {
          this.addWarning('language_mismatch', 
            'Lyrics language differs from track language', 
            'language'
          );
        }
      }
    }

    // Instrumental track validation
    if (trackData.instrumental) {
      if (trackData.lyrics) {
        this.addError('instrumental_with_lyrics', 
          'Instrumental tracks should not have lyrics', 
          'instrumental'
        );
      }

      if (trackData.lyricist) {
        this.addWarning('instrumental_with_lyricist', 
          'Instrumental tracks typically do not have lyricists', 
          'lyricist'
        );
      }
    }
  }

  /**
   * Validate content classification
   */
  async validateContentClassification(trackData) {
    // Explicit content validation
    if (trackData.explicit_content === undefined) {
      this.addWarning('explicit_content_unspecified', 
        'Explicit content classification should be specified', 
        'explicit_content'
      );
    }

    // Genre validation
    if (trackData.genre) {
      const validGenres = [
        'Alternative', 'Blues', 'Classical', 'Country', 'Dance', 'Electronic',
        'Folk', 'Hip-Hop', 'Jazz', 'Latin', 'Metal', 'Pop', 'R&B', 'Reggae',
        'Rock', 'World', 'Soundtrack', 'Spoken Word', 'Comedy', 'Children'
      ];

      if (!validGenres.includes(trackData.genre)) {
        this.addWarning('unrecognized_genre', 
          `Unrecognized genre: ${trackData.genre}`, 
          'genre'
        );
      }
    }

    // Content type validation
    const contentTypes = ['acoustic_version', 'live_recording', 'remix', 'cover_version', 'karaoke_version'];
    const trueTypes = contentTypes.filter(type => trackData[type]);

    if (trueTypes.length > 1) {
      this.addWarning('multiple_content_types', 
        `Multiple content types specified: ${trueTypes.join(', ')}`, 
        'content_type'
      );
    }
  }

  /**
   * Validate credits content
   */
  async validateCreditsContent(trackData) {
    const creditFields = [
      'songwriter', 'composer', 'lyricist', 'producer', 'mixer',
      'mastering_engineer', 'recording_engineer', 'arranger'
    ];

    creditFields.forEach(field => {
      if (trackData[field]) {
        if (typeof trackData[field] !== 'string') {
          this.addError('invalid_credit_type', 
            `${field} must be a string`, 
            field
          );
        } else if (trackData[field].length > 200) {
          this.addWarning('credit_too_long', 
            `${field} exceeds 200 characters`, 
            field
          );
        }
      }
    });

    // Required credits validation
    if (!trackData.songwriter && !trackData.composer) {
      this.addWarning('missing_songwriting_credits', 
        'Songwriter or composer credits are recommended', 
        'credits'
      );
    }

    if (!trackData.producer) {
      this.addWarning('missing_producer_credit', 
        'Producer credit is recommended', 
        'producer'
      );
    }
  }

  /**
   * Validate metadata completeness
   */
  async validateMetadataCompleteness(trackData) {
    const recommendedFields = [
      'genre', 'mood', 'tempo_bpm', 'key_signature', 'isrc',
      'songwriter', 'producer', 'language'
    ];

    const missingFields = recommendedFields.filter(field => !trackData[field]);

    if (missingFields.length > 0) {
      this.addInfo('incomplete_metadata', 
        `Consider adding: ${missingFields.join(', ')}`, 
        'metadata'
      );
    }

    // ISRC validation
    if (!trackData.isrc) {
      this.addWarning('missing_isrc', 
        'ISRC code is required for distribution', 
        'isrc'
      );
    }
  }

  // ========== Platform-Specific Validation ==========

  /**
   * Validate platform compliance
   */
  async validatePlatformCompliance(trackData, platforms) {
    platforms.forEach(platform => {
      const platformName = platform.name || platform;
      
      switch (platformName.toLowerCase()) {
        case 'spotify':
          this.validateSpotifyCompliance(trackData);
          break;
        case 'apple_music':
          this.validateAppleMusicCompliance(trackData);
          break;
        case 'youtube_music':
          this.validateYouTubeCompliance(trackData);
          break;
        case 'tidal':
          this.validateTidalCompliance(trackData);
          break;
        case 'amazon_music':
          this.validateAmazonMusicCompliance(trackData);
          break;
      }
    });
  }

  /**
   * Validate Spotify compliance
   */
  validateSpotifyCompliance(trackData) {
    // Minimum duration
    if (trackData.duration_ms && trackData.duration_ms < 30000) {
      this.addError('spotify_duration_too_short', 
        'Spotify requires tracks to be at least 30 seconds', 
        'duration_ms'
      );
    }

    // Audio quality requirements
    if (trackData.sample_rate && trackData.sample_rate < 44100) {
      this.addWarning('spotify_sample_rate_low', 
        'Spotify recommends at least 44.1kHz sample rate', 
        'sample_rate'
      );
    }
  }

  /**
   * Validate Apple Music compliance
   */
  validateAppleMusicCompliance(trackData) {
    // High-quality audio preference
    if (trackData.audio_file_format === 'mp3') {
      this.addWarning('apple_prefers_lossless', 
        'Apple Music prefers lossless formats', 
        'audio_file_format'
      );
    }

    // Mastered for iTunes recommendations
    if (trackData.sample_rate && trackData.sample_rate >= 96000 && trackData.bit_depth >= 24) {
      this.addInfo('mastered_for_itunes_eligible', 
        'Track meets Mastered for iTunes standards', 
        'audio_quality'
      );
    }
  }

  /**
   * Validate YouTube compliance
   */
  validateYouTubeCompliance(trackData) {
    // Content ID requirements
    if (!trackData.songwriter && !trackData.composer) {
      this.addWarning('youtube_missing_songwriter', 
        'Songwriter/composer credits help with Content ID', 
        'credits'
      );
    }

    // Video content recommendations
    if (trackData.music_video_available) {
      this.addInfo('youtube_video_advantage', 
        'Music videos perform better on YouTube', 
        'music_video'
      );
    }
  }

  /**
   * Validate Tidal compliance
   */
  validateTidalCompliance(trackData) {
    // High-quality audio requirements
    if (trackData.audio_file_format === 'mp3') {
      this.addWarning('tidal_quality_concern', 
        'Tidal emphasizes high-quality audio (FLAC preferred)', 
        'audio_file_format'
      );
    }

    // Master quality validation
    if (trackData.sample_rate >= 96000 && trackData.bit_depth >= 24) {
      this.addInfo('tidal_master_quality', 
        'Track qualifies for Tidal Master quality', 
        'audio_quality'
      );
    }
  }

  /**
   * Validate Amazon Music compliance
   */
  validateAmazonMusicCompliance(trackData) {
    // Metadata requirements
    if (!trackData.genre) {
      this.addWarning('amazon_missing_genre', 
        'Genre is important for Amazon Music categorization', 
        'genre'
      );
    }

    // Audio quality
    if (trackData.sample_rate && trackData.sample_rate < 44100) {
      this.addWarning('amazon_sample_rate_low', 
        'Amazon Music recommends CD quality or higher', 
        'sample_rate'
      );
    }
  }

  // ========== Quality Requirements Validation ==========

  /**
   * Validate platform quality requirements
   */
  async validatePlatformQualityRequirements(trackData, platforms) {
    const hasHighQualityPlatforms = platforms.some(platform => 
      ['tidal', 'qobuz', 'deezer_hifi'].includes((platform.name || platform).toLowerCase())
    );

    if (hasHighQualityPlatforms) {
      this.validateHighQualityRequirements(trackData);
    }

    const hasStreamingPlatforms = platforms.some(platform => 
      ['spotify', 'apple_music', 'youtube_music'].includes((platform.name || platform).toLowerCase())
    );

    if (hasStreamingPlatforms) {
      this.validateStreamingQualityRequirements(trackData);
    }
  }

  /**
   * Validate high-quality platform requirements
   */
  validateHighQualityRequirements(trackData) {
    if (trackData.sample_rate && trackData.sample_rate < 96000) {
      this.addWarning('hq_sample_rate_low', 
        'High-quality platforms prefer 96kHz or higher sample rates', 
        'sample_rate'
      );
    }

    if (trackData.bit_depth && trackData.bit_depth < 24) {
      this.addWarning('hq_bit_depth_low', 
        'High-quality platforms prefer 24-bit or higher bit depth', 
        'bit_depth'
      );
    }

    if (trackData.audio_file_format && !['flac', 'wav', 'aiff'].includes(trackData.audio_file_format)) {
      this.addWarning('hq_format_suboptimal', 
        'High-quality platforms prefer lossless formats', 
        'audio_file_format'
      );
    }
  }

  /**
   * Validate streaming platform quality requirements
   */
  validateStreamingQualityRequirements(trackData) {
    // Loudness for streaming
    if (trackData.loudness_lufs && trackData.loudness_lufs > -14) {
      this.addWarning('streaming_loudness_high', 
        'Track may be reduced in level by streaming platform normalization', 
        'loudness_lufs'
      );
    }

    // Dynamic range for streaming
    if (trackData.dynamic_range && trackData.dynamic_range < 7) {
      this.addWarning('streaming_dynamic_range_low', 
        'Low dynamic range may not perform well on streaming platforms', 
        'dynamic_range'
      );
    }
  }

  // ========== Utility Methods ==========

  /**
   * Validate tempo for specific genre
   */
  validateTempoForGenre(genre, tempo) {
    const genreTempoRanges = {
      'Hip-Hop': [70, 140],
      'House': [120, 130],
      'Techno': [120, 150],
      'Drum & Bass': [160, 180],
      'Reggae': [60, 90],
      'Country': [120, 170],
      'Rock': [110, 150],
      'Pop': [100, 130],
      'Jazz': [60, 200],
      'Classical': [40, 200]
    };

    const range = genreTempoRanges[genre];
    if (range && (tempo < range[0] || tempo > range[1])) {
      this.addWarning('tempo_unusual_for_genre', 
        `Tempo ${tempo} BPM is unusual for ${genre} (typical range: ${range[0]}-${range[1]} BPM)`, 
        'tempo_bpm'
      );
    }
  }

  /**
   * Add info message (lower priority than warning)
   */
  addInfo(code, message, field) {
    this.warnings.push({
      code,
      message,
      field,
      severity: 'info'
    });
  }

  /**
   * Get validation summary with audio analysis
   */
  getAudioValidationSummary(trackData) {
    const result = this.buildValidationResult();
    
    // Add audio analysis summary
    result.audio_analysis = {
      format: trackData.audio_file_format || 'unknown',
      quality_level: this.assessAudioQuality(trackData),
      streaming_ready: this.assessStreamingReadiness(trackData),
      hd_ready: this.assessHDReadiness(trackData),
      estimated_file_size: this.estimateFileSize(trackData)
    };
    
    return result;
  }

  /**
   * Assess overall audio quality level
   */
  assessAudioQuality(trackData) {
    if (!trackData.sample_rate || !trackData.bit_depth) {
      return 'unknown';
    }

    if (trackData.sample_rate >= 96000 && trackData.bit_depth >= 24) {
      return 'hi-res';
    } else if (trackData.sample_rate >= 48000 && trackData.bit_depth >= 24) {
      return 'studio';
    } else if (trackData.sample_rate >= 44100 && trackData.bit_depth >= 16) {
      return 'cd';
    } else {
      return 'low';
    }
  }

  /**
   * Assess streaming platform readiness
   */
  assessStreamingReadiness(trackData) {
    const issues = [];
    
    if (trackData.duration_ms && trackData.duration_ms < 30000) {
      issues.push('too_short');
    }
    
    if (trackData.loudness_lufs && trackData.loudness_lufs > -14) {
      issues.push('too_loud');
    }
    
    if (!trackData.isrc) {
      issues.push('missing_isrc');
    }
    
    return {
      ready: issues.length === 0,
      issues
    };
  }

  /**
   * Assess HD/high-quality readiness
   */
  assessHDReadiness(trackData) {
    const requirements = [];
    
    if (!trackData.sample_rate || trackData.sample_rate < 96000) {
      requirements.push('96kHz+ sample rate');
    }
    
    if (!trackData.bit_depth || trackData.bit_depth < 24) {
      requirements.push('24-bit+ bit depth');
    }
    
    if (!['flac', 'wav', 'aiff'].includes(trackData.audio_file_format)) {
      requirements.push('lossless format');
    }
    
    return {
      ready: requirements.length === 0,
      missing_requirements: requirements
    };
  }

  /**
   * Estimate file size based on specifications
   */
  estimateFileSize(trackData) {
    if (!trackData.duration_ms || !trackData.sample_rate || !trackData.bit_depth || !trackData.audio_channels) {
      return null;
    }

    const durationSeconds = trackData.duration_ms / 1000;
    const bytesPerSecond = (trackData.sample_rate * trackData.bit_depth * trackData.audio_channels) / 8;
    const estimatedBytes = durationSeconds * bytesPerSecond;
    
    return {
      bytes: Math.round(estimatedBytes),
      mb: Math.round(estimatedBytes / (1024 * 1024) * 100) / 100
    };
  }
}

module.exports = TrackValidator;
