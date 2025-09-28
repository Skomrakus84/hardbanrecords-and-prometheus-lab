/**
 * Metadata Validator
 * Comprehensive validation for music metadata across all entities
 * Handles validation for releases, tracks, artists, and distribution requirements
 */

const logger = require('../../config/logger.cjs');

class MetadataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // ========== Core Validation Methods ==========

  /**
   * Validate complete release metadata
   */
  validateReleaseMetadata(releaseData, options = {}) {
    this.resetValidation();
    
    const {
      validateForDistribution = false,
      targetChannels = [],
      strict = false
    } = options;

    try {
      // Basic release validation
      this.validateBasicReleaseInfo(releaseData);
      this.validateReleaseType(releaseData);
      this.validateReleaseDates(releaseData);
      this.validateReleaseIdentifiers(releaseData);
      this.validateGenreAndLanguage(releaseData);
      this.validateCopyrightInfo(releaseData);
      this.validateArtworkRequirements(releaseData);
      
      // Distribution-specific validation
      if (validateForDistribution) {
        this.validateDistributionRequirements(releaseData, targetChannels);
      }
      
      // Strict validation for premium features
      if (strict) {
        this.validatePremiumFeatures(releaseData);
      }

      return this.buildValidationResult();
    } catch (error) {
      logger.error('Release metadata validation error', { error: error.message });
      this.addError('validation_error', 'Validation process failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate track metadata
   */
  validateTrackMetadata(trackData, options = {}) {
    this.resetValidation();
    
    const {
      validateAudioFile = true,
      validateISRC = true,
      strict = false
    } = options;

    try {
      // Basic track validation
      this.validateBasicTrackInfo(trackData);
      this.validateTrackTiming(trackData);
      this.validateTrackCredits(trackData);
      this.validateLyrics(trackData);
      
      // Audio file validation
      if (validateAudioFile) {
        this.validateAudioFileRequirements(trackData);
      }
      
      // ISRC validation
      if (validateISRC) {
        this.validateISRCFormat(trackData.isrc);
      }
      
      // Technical metadata validation
      this.validateTechnicalMetadata(trackData);
      
      // Strict validation
      if (strict) {
        this.validateTrackQualityStandards(trackData);
      }

      return this.buildValidationResult();
    } catch (error) {
      logger.error('Track metadata validation error', { error: error.message });
      this.addError('validation_error', 'Validation process failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate artist metadata
   */
  validateArtistMetadata(artistData, options = {}) {
    this.resetValidation();
    
    const { validateSocialLinks = true, validateBio = false } = options;

    try {
      // Basic artist validation
      this.validateBasicArtistInfo(artistData);
      this.validateArtistIdentifiers(artistData);
      
      // Social media validation
      if (validateSocialLinks && artistData.social_links) {
        this.validateSocialMediaLinks(artistData.social_links);
      }
      
      // Biography validation
      if (validateBio && artistData.biography) {
        this.validateBiography(artistData.biography);
      }

      return this.buildValidationResult();
    } catch (error) {
      logger.error('Artist metadata validation error', { error: error.message });
      this.addError('validation_error', 'Validation process failed', 'general');
      return this.buildValidationResult();
    }
  }

  // ========== Release Validation Methods ==========

  /**
   * Validate basic release information
   */
  validateBasicReleaseInfo(releaseData) {
    // Title validation
    if (!releaseData.title || typeof releaseData.title !== 'string') {
      this.addError('missing_title', 'Release title is required', 'title');
    } else {
      if (releaseData.title.length < 1) {
        this.addError('title_too_short', 'Release title cannot be empty', 'title');
      } else if (releaseData.title.length > 200) {
        this.addError('title_too_long', 'Release title cannot exceed 200 characters', 'title');
      }
      
      // Check for problematic characters
      if (this.hasProblematicCharacters(releaseData.title)) {
        this.addWarning('title_special_chars', 'Title contains special characters that may cause issues', 'title');
      }
    }

    // Artist validation
    if (!releaseData.artist_id) {
      this.addError('missing_artist', 'Artist ID is required', 'artist');
    }

    // Status validation
    const validStatuses = ['draft', 'in_review', 'approved', 'scheduled', 'mastered', 'distributed', 'released', 'withdrawn'];
    if (releaseData.status && !validStatuses.includes(releaseData.status)) {
      this.addError('invalid_status', `Invalid release status: ${releaseData.status}`, 'status');
    }
  }

  /**
   * Validate release type and format
   */
  validateReleaseType(releaseData) {
    const validTypes = ['single', 'ep', 'album', 'compilation', 'soundtrack', 'remix', 'live'];
    const validFormats = ['digital', 'physical', 'vinyl', 'cd', 'cassette', 'hybrid'];

    if (!releaseData.type) {
      this.addError('missing_type', 'Release type is required', 'type');
    } else if (!validTypes.includes(releaseData.type)) {
      this.addError('invalid_type', `Invalid release type: ${releaseData.type}`, 'type');
    }

    if (releaseData.format && !validFormats.includes(releaseData.format)) {
      this.addError('invalid_format', `Invalid release format: ${releaseData.format}`, 'format');
    }

    // Type-specific validations
    if (releaseData.type === 'single' && releaseData.track_count > 3) {
      this.addWarning('single_too_many_tracks', 'Singles typically have 1-3 tracks', 'type');
    }

    if (releaseData.type === 'ep' && releaseData.track_count > 8) {
      this.addWarning('ep_too_many_tracks', 'EPs typically have 3-8 tracks', 'type');
    }
  }

  /**
   * Validate release dates
   */
  validateReleaseDates(releaseData) {
    const now = new Date();
    
    // Release date validation
    if (!releaseData.release_date) {
      this.addError('missing_release_date', 'Release date is required', 'release_date');
    } else {
      const releaseDate = new Date(releaseData.release_date);
      
      if (isNaN(releaseDate.getTime())) {
        this.addError('invalid_release_date', 'Invalid release date format', 'release_date');
      } else {
        // Check if release date is too far in the past
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        if (releaseDate < yearAgo) {
          this.addWarning('old_release_date', 'Release date is more than a year ago', 'release_date');
        }
        
        // Check if release date is too far in the future
        const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
        if (releaseDate > twoYearsFromNow) {
          this.addWarning('future_release_date', 'Release date is more than 2 years in the future', 'release_date');
        }
      }
    }

    // Original release date validation
    if (releaseData.original_release_date) {
      const originalDate = new Date(releaseData.original_release_date);
      const releaseDate = new Date(releaseData.release_date);
      
      if (isNaN(originalDate.getTime())) {
        this.addError('invalid_original_date', 'Invalid original release date format', 'original_release_date');
      } else if (originalDate > releaseDate) {
        this.addError('original_date_future', 'Original release date cannot be after release date', 'original_release_date');
      }
    }

    // Pre-order date validation
    if (releaseData.pre_order_date) {
      const preOrderDate = new Date(releaseData.pre_order_date);
      const releaseDate = new Date(releaseData.release_date);
      
      if (isNaN(preOrderDate.getTime())) {
        this.addError('invalid_preorder_date', 'Invalid pre-order date format', 'pre_order_date');
      } else if (preOrderDate >= releaseDate) {
        this.addError('preorder_date_invalid', 'Pre-order date must be before release date', 'pre_order_date');
      }
    }
  }

  /**
   * Validate release identifiers (UPC, catalog number)
   */
  validateReleaseIdentifiers(releaseData) {
    // UPC validation
    if (releaseData.upc) {
      if (!this.isValidUPC(releaseData.upc)) {
        this.addError('invalid_upc', 'Invalid UPC format', 'upc');
      }
    }

    // Catalog number validation
    if (releaseData.catalog_number) {
      if (releaseData.catalog_number.length > 50) {
        this.addError('catalog_too_long', 'Catalog number cannot exceed 50 characters', 'catalog_number');
      }
    }
  }

  /**
   * Validate genre and language information
   */
  validateGenreAndLanguage(releaseData) {
    // Genre validation
    const validGenres = [
      'Alternative', 'Blues', 'Classical', 'Country', 'Dance', 'Electronic', 
      'Folk', 'Hip-Hop', 'Jazz', 'Latin', 'Metal', 'Pop', 'R&B', 'Reggae', 
      'Rock', 'World', 'Soundtrack', 'Spoken Word', 'Comedy', 'Children'
    ];

    if (!releaseData.genre) {
      this.addWarning('missing_genre', 'Genre is recommended for better discoverability', 'genre');
    } else if (!validGenres.includes(releaseData.genre)) {
      this.addWarning('unknown_genre', `Unrecognized genre: ${releaseData.genre}`, 'genre');
    }

    // Language validation
    if (releaseData.language) {
      const validLanguages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'
      ];
      
      if (!validLanguages.includes(releaseData.language)) {
        this.addWarning('unknown_language', `Language code may not be recognized: ${releaseData.language}`, 'language');
      }
    }
  }

  /**
   * Validate copyright information
   */
  validateCopyrightInfo(releaseData) {
    // Copyright notice validation
    if (!releaseData.copyright_notice) {
      this.addWarning('missing_copyright', 'Copyright notice is recommended', 'copyright');
    } else {
      const currentYear = new Date().getFullYear();
      const copyrightYear = this.extractYear(releaseData.copyright_notice);
      
      if (copyrightYear && (copyrightYear < 1900 || copyrightYear > currentYear + 1)) {
        this.addWarning('unusual_copyright_year', 'Copyright year seems unusual', 'copyright');
      }
    }

    // Phonographic copyright validation
    if (!releaseData.phonographic_copyright) {
      this.addWarning('missing_phonographic', 'Phonographic copyright is recommended', 'phonographic_copyright');
    }
  }

  /**
   * Validate artwork requirements
   */
  validateArtworkRequirements(releaseData) {
    if (!releaseData.artwork_url && !releaseData.artwork_file) {
      this.addError('missing_artwork', 'Artwork is required for release', 'artwork');
    }

    // Additional artwork validation would go here
    // (dimensions, format, file size, etc.)
  }

  // ========== Track Validation Methods ==========

  /**
   * Validate basic track information
   */
  validateBasicTrackInfo(trackData) {
    // Title validation
    if (!trackData.title || typeof trackData.title !== 'string') {
      this.addError('missing_track_title', 'Track title is required', 'title');
    } else {
      if (trackData.title.length < 1) {
        this.addError('track_title_empty', 'Track title cannot be empty', 'title');
      } else if (trackData.title.length > 200) {
        this.addError('track_title_long', 'Track title cannot exceed 200 characters', 'title');
      }
    }

    // Track number validation
    if (trackData.track_number !== undefined) {
      if (!Number.isInteger(trackData.track_number) || trackData.track_number < 1) {
        this.addError('invalid_track_number', 'Track number must be a positive integer', 'track_number');
      } else if (trackData.track_number > 999) {
        this.addWarning('high_track_number', 'Unusually high track number', 'track_number');
      }
    }

    // Disc number validation
    if (trackData.disc_number !== undefined) {
      if (!Number.isInteger(trackData.disc_number) || trackData.disc_number < 1) {
        this.addError('invalid_disc_number', 'Disc number must be a positive integer', 'disc_number');
      }
    }
  }

  /**
   * Validate track timing and duration
   */
  validateTrackTiming(trackData) {
    // Duration validation
    if (trackData.duration_ms !== undefined) {
      if (!Number.isInteger(trackData.duration_ms) || trackData.duration_ms <= 0) {
        this.addError('invalid_duration', 'Duration must be a positive number', 'duration');
      } else {
        // Check for extremely short tracks
        if (trackData.duration_ms < 5000) { // Less than 5 seconds
          this.addWarning('very_short_track', 'Track is very short (less than 5 seconds)', 'duration');
        }
        
        // Check for extremely long tracks
        if (trackData.duration_ms > 1800000) { // More than 30 minutes
          this.addWarning('very_long_track', 'Track is very long (more than 30 minutes)', 'duration');
        }
      }
    }

    // Preview timing validation
    if (trackData.preview_start_time !== undefined) {
      if (trackData.preview_start_time < 0) {
        this.addError('negative_preview_start', 'Preview start time cannot be negative', 'preview');
      } else if (trackData.duration_ms && trackData.preview_start_time >= trackData.duration_ms) {
        this.addError('preview_start_too_late', 'Preview start time is beyond track duration', 'preview');
      }
    }

    if (trackData.preview_duration !== undefined) {
      if (trackData.preview_duration <= 0) {
        this.addError('invalid_preview_duration', 'Preview duration must be positive', 'preview');
      } else if (trackData.preview_duration > 90000) { // More than 90 seconds
        this.addWarning('long_preview', 'Preview is longer than 90 seconds', 'preview');
      }
    }
  }

  /**
   * Validate track credits and contributors
   */
  validateTrackCredits(trackData) {
    const creditFields = [
      'songwriter', 'composer', 'lyricist', 'producer', 'mixer', 
      'mastering_engineer', 'recording_engineer', 'arranger'
    ];

    creditFields.forEach(field => {
      if (trackData[field] && typeof trackData[field] === 'string') {
        if (trackData[field].length > 200) {
          this.addWarning(`${field}_too_long`, `${field} field exceeds 200 characters`, field);
        }
      }
    });

    // Publisher validation
    if (trackData.publisher && trackData.publisher.length > 100) {
      this.addWarning('publisher_too_long', 'Publisher name exceeds 100 characters', 'publisher');
    }
  }

  /**
   * Validate lyrics and language
   */
  validateLyrics(trackData) {
    if (trackData.lyrics) {
      // Check lyrics length
      if (trackData.lyrics.length > 10000) {
        this.addWarning('lyrics_very_long', 'Lyrics are very long', 'lyrics');
      }

      // Check for explicit content indicators
      const explicitIndicators = [
        'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'crap', 
        'piss', 'bastard', 'whore', 'slut'
      ];
      
      const lyricsLower = trackData.lyrics.toLowerCase();
      const hasExplicitContent = explicitIndicators.some(word => lyricsLower.includes(word));
      
      if (hasExplicitContent && !trackData.explicit_content) {
        this.addWarning('potential_explicit_content', 'Lyrics may contain explicit content', 'explicit');
      }
    }

    // Language consistency
    if (trackData.lyrics_language && trackData.language) {
      if (trackData.lyrics_language !== trackData.language) {
        this.addWarning('language_mismatch', 'Lyrics language differs from track language', 'language');
      }
    }

    // Instrumental track with lyrics
    if (trackData.instrumental && trackData.lyrics) {
      this.addError('instrumental_with_lyrics', 'Instrumental tracks cannot have lyrics', 'lyrics');
    }
  }

  /**
   * Validate audio file requirements
   */
  validateAudioFileRequirements(trackData) {
    if (!trackData.audio_file_url && !trackData.audio_file) {
      this.addError('missing_audio_file', 'Audio file is required', 'audio');
    }

    // Audio format validation
    const validFormats = ['wav', 'flac', 'mp3', 'aiff', 'm4a'];
    if (trackData.audio_file_format && !validFormats.includes(trackData.audio_file_format)) {
      this.addError('invalid_audio_format', `Unsupported audio format: ${trackData.audio_file_format}`, 'audio');
    }

    // Sample rate validation
    const validSampleRates = [44100, 48000, 88200, 96000, 176400, 192000];
    if (trackData.sample_rate && !validSampleRates.includes(trackData.sample_rate)) {
      this.addWarning('unusual_sample_rate', `Unusual sample rate: ${trackData.sample_rate}Hz`, 'audio');
    }

    // Bit depth validation
    const validBitDepths = [16, 24, 32];
    if (trackData.bit_depth && !validBitDepths.includes(trackData.bit_depth)) {
      this.addWarning('unusual_bit_depth', `Unusual bit depth: ${trackData.bit_depth}-bit`, 'audio');
    }

    // Audio quality validation
    if (trackData.audio_file_format === 'mp3' && trackData.audio_bitrate && trackData.audio_bitrate < 320) {
      this.addWarning('low_mp3_quality', 'MP3 bitrate below 320kbps may affect quality', 'audio');
    }
  }

  /**
   * Validate technical metadata
   */
  validateTechnicalMetadata(trackData) {
    // Tempo validation
    if (trackData.tempo_bpm !== undefined) {
      if (trackData.tempo_bpm < 20 || trackData.tempo_bpm > 300) {
        this.addWarning('unusual_tempo', `Unusual tempo: ${trackData.tempo_bpm} BPM`, 'tempo');
      }
    }

    // Key signature validation
    const validKeys = [
      'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
      'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
    ];
    
    if (trackData.key_signature && !validKeys.includes(trackData.key_signature)) {
      this.addWarning('invalid_key', `Unrecognized key signature: ${trackData.key_signature}`, 'key');
    }

    // Time signature validation
    const validTimeSignatures = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'];
    if (trackData.time_signature && !validTimeSignatures.includes(trackData.time_signature)) {
      this.addWarning('unusual_time_signature', `Unusual time signature: ${trackData.time_signature}`, 'time_signature');
    }
  }

  // ========== Artist Validation Methods ==========

  /**
   * Validate basic artist information
   */
  validateBasicArtistInfo(artistData) {
    // Name validation
    if (!artistData.name || typeof artistData.name !== 'string') {
      this.addError('missing_artist_name', 'Artist name is required', 'name');
    } else {
      if (artistData.name.length < 1) {
        this.addError('artist_name_empty', 'Artist name cannot be empty', 'name');
      } else if (artistData.name.length > 100) {
        this.addError('artist_name_long', 'Artist name cannot exceed 100 characters', 'name');
      }
    }

    // Type validation
    const validTypes = ['individual', 'group', 'band', 'orchestra', 'choir', 'various', 'unknown'];
    if (artistData.type && !validTypes.includes(artistData.type)) {
      this.addError('invalid_artist_type', `Invalid artist type: ${artistData.type}`, 'type');
    }

    // Country validation
    if (artistData.country && artistData.country.length !== 2) {
      this.addWarning('invalid_country_code', 'Country should be a 2-letter ISO code', 'country');
    }
  }

  /**
   * Validate artist identifiers
   */
  validateArtistIdentifiers(artistData) {
    // Spotify ID validation
    if (artistData.spotify_id && !artistData.spotify_id.match(/^[0-9A-Za-z]{22}$/)) {
      this.addWarning('invalid_spotify_id', 'Invalid Spotify artist ID format', 'spotify_id');
    }

    // Apple Music ID validation
    if (artistData.apple_music_id && !Number.isInteger(Number(artistData.apple_music_id))) {
      this.addWarning('invalid_apple_id', 'Invalid Apple Music artist ID format', 'apple_music_id');
    }
  }

  /**
   * Validate social media links
   */
  validateSocialMediaLinks(socialLinks) {
    const platforms = ['instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'spotify', 'apple_music'];
    
    platforms.forEach(platform => {
      if (socialLinks[platform]) {
        if (!this.isValidUrl(socialLinks[platform])) {
          this.addWarning(`invalid_${platform}_url`, `Invalid ${platform} URL format`, 'social_links');
        }
      }
    });
  }

  /**
   * Validate biography content
   */
  validateBiography(biography) {
    if (typeof biography !== 'string') {
      this.addError('invalid_biography_type', 'Biography must be a string', 'biography');
    } else {
      if (biography.length > 5000) {
        this.addWarning('biography_too_long', 'Biography exceeds 5000 characters', 'biography');
      }
      
      if (biography.length < 50) {
        this.addWarning('biography_too_short', 'Biography is quite short', 'biography');
      }
    }
  }

  // ========== Distribution Validation Methods ==========

  /**
   * Validate distribution requirements for specific channels
   */
  validateDistributionRequirements(releaseData, targetChannels) {
    targetChannels.forEach(channel => {
      switch (channel.toLowerCase()) {
        case 'spotify':
          this.validateSpotifyRequirements(releaseData);
          break;
        case 'apple':
        case 'apple_music':
          this.validateAppleMusicRequirements(releaseData);
          break;
        case 'youtube':
        case 'youtube_music':
          this.validateYouTubeRequirements(releaseData);
          break;
        case 'tidal':
          this.validateTidalRequirements(releaseData);
          break;
      }
    });
  }

  /**
   * Validate Spotify-specific requirements
   */
  validateSpotifyRequirements(releaseData) {
    // Spotify requires minimum 30 seconds for tracks
    if (releaseData.duration_ms && releaseData.duration_ms < 30000) {
      this.addError('spotify_track_too_short', 'Spotify requires tracks to be at least 30 seconds', 'duration');
    }

    // Explicit content marking
    if (!releaseData.hasOwnProperty('explicit_content')) {
      this.addWarning('spotify_explicit_missing', 'Explicit content marking is required for Spotify', 'explicit');
    }
  }

  /**
   * Validate Apple Music requirements
   */
  validateAppleMusicRequirements(releaseData) {
    // Apple Music audio quality requirements
    if (releaseData.audio_file_format === 'mp3') {
      this.addWarning('apple_mp3_quality', 'Apple Music prefers lossless formats over MP3', 'audio');
    }

    // Country restrictions
    if (releaseData.territory_restrictions && releaseData.territory_restrictions.includes('US')) {
      this.addWarning('apple_us_restriction', 'Territory restrictions may affect Apple Music availability', 'territory');
    }
  }

  /**
   * Validate YouTube requirements
   */
  validateYouTubeRequirements(releaseData) {
    // Content ID requirements
    if (!releaseData.copyright_notice) {
      this.addError('youtube_copyright_required', 'Copyright notice is required for YouTube Content ID', 'copyright');
    }

    // Video content for YouTube Music
    if (releaseData.video_file && !releaseData.video_file.endsWith('.mp4')) {
      this.addWarning('youtube_video_format', 'YouTube prefers MP4 format for video content', 'video');
    }
  }

  /**
   * Validate Tidal requirements
   */
  validateTidalRequirements(releaseData) {
    // High-quality audio requirements
    if (releaseData.audio_file_format === 'mp3') {
      this.addWarning('tidal_quality_preference', 'Tidal emphasizes high-quality audio (FLAC/ALAC preferred)', 'audio');
    }

    // Master quality requirements
    if (releaseData.sample_rate && releaseData.sample_rate < 44100) {
      this.addError('tidal_sample_rate', 'Tidal requires minimum 44.1kHz sample rate', 'audio');
    }
  }

  // ========== Premium Feature Validation ==========

  /**
   * Validate premium features and advanced options
   */
  validatePremiumFeatures(releaseData) {
    // Dolby Atmos validation
    if (releaseData.dolby_atmos_available) {
      if (!releaseData.dolby_atmos_file) {
        this.addError('missing_dolby_atmos', 'Dolby Atmos file is required when feature is enabled', 'dolby_atmos');
      }
    }

    // High-res audio validation
    if (releaseData.high_res_available) {
      if (!releaseData.sample_rate || releaseData.sample_rate < 96000) {
        this.addWarning('high_res_quality', 'High-res releases typically use 96kHz or higher sample rates', 'audio');
      }
    }

    // Sync licensing validation
    if (releaseData.sync_licensing_available) {
      if (!releaseData.instrumental_version) {
        this.addWarning('sync_instrumental', 'Instrumental versions are recommended for sync licensing', 'sync');
      }
    }
  }

  // ========== Utility Methods ==========

  /**
   * Check for problematic characters in text
   */
  hasProblematicCharacters(text) {
    const problematicChars = /[<>:"\/\\|?*\x00-\x1f]/;
    return problematicChars.test(text);
  }

  /**
   * Validate UPC format
   */
  isValidUPC(upc) {
    // Remove any non-digit characters
    const cleanUPC = upc.replace(/\D/g, '');
    
    // UPC should be 12 digits
    if (cleanUPC.length !== 12) {
      return false;
    }

    // Validate check digit
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(cleanUPC[i]);
      sum += (i % 2 === 0) ? digit * 3 : digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(cleanUPC[11]);
  }

  /**
   * Validate ISRC format
   */
  validateISRCFormat(isrc) {
    if (!isrc) return;

    const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
    if (!isrcPattern.test(isrc.replace(/[-\s]/g, ''))) {
      this.addError('invalid_isrc_format', 'ISRC format is invalid (should be CC-XXX-YY-NNNNN)', 'isrc');
    }
  }

  /**
   * Extract year from copyright notice
   */
  extractYear(copyrightNotice) {
    const yearMatch = copyrightNotice.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  /**
   * Validate URL format
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
   * Validate track quality standards
   */
  validateTrackQualityStandards(trackData) {
    // Audio level validation
    if (trackData.peak_amplitude && trackData.peak_amplitude > -0.1) {
      this.addWarning('audio_clipping_risk', 'Peak amplitude is very high, risk of clipping', 'audio');
    }

    // Loudness validation (LUFS)
    if (trackData.loudness_lufs) {
      if (trackData.loudness_lufs > -14) {
        this.addWarning('loudness_too_high', 'Track may be too loud for streaming platforms', 'loudness');
      } else if (trackData.loudness_lufs < -23) {
        this.addWarning('loudness_too_low', 'Track may be too quiet', 'loudness');
      }
    }

    // Dynamic range validation
    if (trackData.dynamic_range && trackData.dynamic_range < 7) {
      this.addWarning('low_dynamic_range', 'Low dynamic range may indicate over-compression', 'dynamics');
    }
  }

  // ========== Validation Result Methods ==========

  /**
   * Add validation error
   */
  addError(code, message, field) {
    this.errors.push({
      code,
      message,
      field,
      severity: 'error'
    });
  }

  /**
   * Add validation warning
   */
  addWarning(code, message, field) {
    this.warnings.push({
      code,
      message,
      field,
      severity: 'warning'
    });
  }

  /**
   * Reset validation state
   */
  resetValidation() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Build validation result object
   */
  buildValidationResult() {
    return {
      isValid: this.errors.length === 0,
      hasWarnings: this.warnings.length > 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        total_issues: this.errors.length + this.warnings.length,
        error_count: this.errors.length,
        warning_count: this.warnings.length
      }
    };
  }

  /**
   * Get validation summary for specific fields
   */
  getFieldSummary() {
    const fieldSummary = {};
    
    [...this.errors, ...this.warnings].forEach(issue => {
      if (!fieldSummary[issue.field]) {
        fieldSummary[issue.field] = {
          errors: 0,
          warnings: 0,
          issues: []
        };
      }
      
      fieldSummary[issue.field].issues.push(issue);
      if (issue.severity === 'error') {
        fieldSummary[issue.field].errors++;
      } else {
        fieldSummary[issue.field].warnings++;
      }
    });
    
    return fieldSummary;
  }
}

module.exports = MetadataValidator;
