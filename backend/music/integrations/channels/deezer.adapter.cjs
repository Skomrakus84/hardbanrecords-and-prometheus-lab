/**
 * Deezer Integration Module
 * Advanced integration with Deezer API and Deezer for Creators
 * Handles track distribution, analytics, and playlist management
 */

const crypto = require('crypto');
const logger = require('../../../config/logger.cjs');

class DeezerIntegration {
  constructor() {
    this.apiEndpoint = process.env.DEEZER_API_ENDPOINT || 'https://api.deezer.com';
    this.creatorsEndpoint = process.env.DEEZER_CREATORS_API_ENDPOINT || 'https://creators.deezer.com/api';
    this.appId = process.env.DEEZER_APP_ID;
    this.appSecret = process.env.DEEZER_APP_SECRET;
    this.redirectUri = process.env.DEEZER_REDIRECT_URI;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Deezer API permissions
    this.permissions = [
      'basic_access',
      'email',
      'offline_access',
      'manage_library',
      'manage_community',
      'delete_library',
      'listening_history'
    ];
  }

  // ========== Authentication ==========

  /**
   * Get authorization URL for Deezer
   */
  getAuthorizationUrl(state = null) {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      perms: this.permissions.join(','),
      state: state || crypto.randomBytes(16).toString('hex')
    });

    return `https://connect.deezer.com/oauth/auth.php?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code) {
    try {
      const params = new URLSearchParams({
        app_id: this.appId,
        secret: this.appSecret,
        code: code,
        output: 'json'
      });

      const response = await fetch(`https://connect.deezer.com/oauth/access_token.php?${params}`);

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      if (tokenData.error) {
        throw new Error(`Deezer auth error: ${tokenData.error.message}`);
      }

      logger.info('Deezer token exchange successful', { 
        expires: tokenData.expires 
      });

      return {
        access_token: tokenData.access_token,
        expires: tokenData.expires
      };
    } catch (error) {
      logger.error('Deezer token exchange failed', { error: error.message, code });
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  // ========== Track Distribution ==========

  /**
   * Submit track to Deezer for Creators
   */
  async submitTrack(trackData, accessToken) {
    try {
      // Validate track data
      const validation = this.validateTrackData(trackData);
      if (!validation.isValid) {
        throw new Error(`Track validation failed: ${validation.errors.join(', ')}`);
      }

      const submissionData = {
        title: trackData.title,
        artist: trackData.artist_name,
        album: trackData.album_title,
        track_number: trackData.track_number,
        disc_number: trackData.disc_number || 1,
        duration: Math.floor(trackData.duration_ms / 1000), // Deezer uses seconds
        explicit: trackData.explicit_content || false,
        isrc: trackData.isrc,
        
        // Audio file
        audio_file_url: trackData.audio_file_url,
        audio_format: trackData.audio_file_format,
        
        // Metadata
        genre: this.mapGenreToDeezer(trackData.genre),
        language: trackData.language,
        
        // Release information
        release_date: trackData.release_date,
        label: trackData.label_name,
        copyright: trackData.copyright_notice,
        
        // Deezer-specific metadata
        territories: trackData.territories || ['FR'], // Deezer is French-based
        preview_start: Math.floor((trackData.preview_start_time || 30000) / 1000),
        preview_duration: Math.floor((trackData.preview_duration || 30000) / 1000)
      };

      const response = await fetch(`${this.creatorsEndpoint}/v1/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'HardbanRecords-Lab/1.0'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Track submission failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      logger.info('Track submitted to Deezer successfully', { 
        trackId: result.id,
        title: trackData.title 
      });

      return {
        deezer_track_id: result.id,
        submission_id: result.submission_id,
        status: result.status,
        submission_date: new Date().toISOString(),
        review_status: result.review_status,
        estimated_live_date: result.estimated_live_date
      };
    } catch (error) {
      logger.error('Deezer track submission failed', { 
        error: error.message,
        title: trackData.title 
      });
      throw error;
    }
  }

  /**
   * Upload audio file to Deezer
   */
  async uploadAudioFile(audioFile, accessToken) {
    try {
      // Get upload URL
      const uploadUrlResponse = await fetch(`${this.creatorsEndpoint}/v1/uploads/audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: audioFile.originalname,
          content_type: audioFile.mimetype,
          file_size: audioFile.size
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
      }

      const uploadData = await uploadUrlResponse.json();

      // Upload file
      const uploadResponse = await fetch(uploadData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': audioFile.mimetype
        },
        body: audioFile.buffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }

      logger.info('Audio file uploaded to Deezer successfully', { 
        fileId: uploadData.file_id 
      });

      return {
        file_id: uploadData.file_id,
        file_url: uploadData.file_url,
        upload_status: 'completed'
      };
    } catch (error) {
      logger.error('Deezer audio upload failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload artwork to Deezer
   */
  async uploadArtwork(artworkFile, accessToken) {
    try {
      // Get upload URL for artwork
      const uploadUrlResponse = await fetch(`${this.creatorsEndpoint}/v1/uploads/artwork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: artworkFile.originalname,
          content_type: artworkFile.mimetype,
          file_size: artworkFile.size
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get artwork upload URL: ${uploadUrlResponse.statusText}`);
      }

      const uploadData = await uploadUrlResponse.json();

      // Upload artwork
      const uploadResponse = await fetch(uploadData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': artworkFile.mimetype
        },
        body: artworkFile.buffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`Artwork upload failed: ${uploadResponse.statusText}`);
      }

      logger.info('Artwork uploaded to Deezer successfully', { 
        artworkId: uploadData.file_id 
      });

      return {
        artwork_id: uploadData.file_id,
        artwork_url: uploadData.file_url,
        upload_status: 'completed'
      };
    } catch (error) {
      logger.error('Deezer artwork upload failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get track status from Deezer
   */
  async getTrackStatus(deezerTrackId, accessToken) {
    try {
      const response = await fetch(`${this.creatorsEndpoint}/v1/tracks/${deezerTrackId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'HardbanRecords-Lab/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get track status: ${response.statusText}`);
      }

      const trackData = await response.json();
      
      return {
        id: trackData.id,
        status: trackData.status,
        review_status: trackData.review_status,
        live_date: trackData.live_date,
        territories: trackData.territories,
        rejection_reason: trackData.rejection_reason || null,
        last_updated: trackData.last_updated
      };
    } catch (error) {
      logger.error('Failed to get Deezer track status', { 
        error: error.message,
        deezerTrackId 
      });
      throw error;
    }
  }

  // ========== Analytics ==========

  /**
   * Get track analytics from Deezer for Creators
   */
  async getTrackAnalytics(deezerTrackId, accessToken, options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0],
        granularity = 'day',
        territories = ['FR']
      } = options;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        granularity: granularity,
        territories: territories.join(',')
      });

      const response = await fetch(`${this.creatorsEndpoint}/v1/analytics/tracks/${deezerTrackId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'HardbanRecords-Lab/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.statusText}`);
      }

      const analyticsData = await response.json();
      
      return {
        track_id: deezerTrackId,
        period: {
          start_date: startDate,
          end_date: endDate
        },
        metrics: {
          total_streams: analyticsData.total_streams || 0,
          unique_listeners: analyticsData.unique_listeners || 0,
          total_listening_time: analyticsData.total_listening_time || 0,
          average_completion_rate: analyticsData.average_completion_rate || 0,
          skip_rate: analyticsData.skip_rate || 0
        },
        territories: analyticsData.territories || {},
        time_series: analyticsData.time_series || [],
        last_updated: analyticsData.last_updated
      };
    } catch (error) {
      logger.error('Deezer analytics request failed', { 
        error: error.message,
        deezerTrackId 
      });
      throw error;
    }
  }

  /**
   * Get artist analytics
   */
  async getArtistAnalytics(artistId, accessToken, options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0]
      } = options;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`${this.creatorsEndpoint}/v1/analytics/artists/${artistId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'HardbanRecords-Lab/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Artist analytics request failed: ${response.statusText}`);
      }

      const analyticsData = await response.json();
      
      return {
        artist_id: artistId,
        period: {
          start_date: startDate,
          end_date: endDate
        },
        metrics: analyticsData.metrics,
        top_tracks: analyticsData.top_tracks || [],
        territories: analyticsData.territories || {},
        fan_demographics: analyticsData.fan_demographics || {},
        last_updated: analyticsData.last_updated
      };
    } catch (error) {
      logger.error('Deezer artist analytics request failed', { 
        error: error.message,
        artistId 
      });
      throw error;
    }
  }

  // ========== Search and Discovery ==========

  /**
   * Search Deezer catalog
   */
  async searchCatalog(query, options = {}) {
    try {
      const {
        types = ['track'],
        limit = 25,
        index = 0
      } = options;

      const results = {};

      for (const type of types) {
        const params = new URLSearchParams({
          q: query,
          limit: limit.toString(),
          index: index.toString()
        });

        const response = await fetch(`${this.apiEndpoint}/search/${type}?${params}`);

        if (!response.ok) {
          throw new Error(`Search request failed for ${type}: ${response.statusText}`);
        }

        const searchData = await response.json();
        results[type] = searchData;
      }
      
      return {
        query: query,
        results: results
      };
    } catch (error) {
      logger.error('Deezer catalog search failed', { 
        error: error.message,
        query 
      });
      throw error;
    }
  }

  /**
   * Get recommendations from Deezer
   */
  async getRecommendations(seedTrackId, options = {}) {
    try {
      const {
        limit = 20
      } = options;

      const response = await fetch(`${this.apiEndpoint}/track/${seedTrackId}/radio?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Recommendations request failed: ${response.statusText}`);
      }

      const recommendations = await response.json();
      
      return {
        seed_track_id: seedTrackId,
        recommendations: recommendations.data || [],
        total: recommendations.data?.length || 0
      };
    } catch (error) {
      logger.error('Deezer recommendations request failed', { 
        error: error.message,
        seedTrackId 
      });
      throw error;
    }
  }

  // ========== Playlist Management ==========

  /**
   * Create playlist on Deezer
   */
  async createPlaylist(playlistData, accessToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/user/me/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          title: playlistData.name,
          description: playlistData.description || '',
          public: playlistData.public ? 'true' : 'false'
        })
      });

      if (!response.ok) {
        throw new Error(`Playlist creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      logger.info('Deezer playlist created successfully', { 
        playlistId: result.id,
        name: playlistData.name 
      });

      return {
        playlist_id: result.id,
        name: playlistData.name,
        url: `https://www.deezer.com/playlist/${result.id}`,
        tracks_count: 0
      };
    } catch (error) {
      logger.error('Deezer playlist creation failed', { 
        error: error.message,
        name: playlistData.name 
      });
      throw error;
    }
  }

  /**
   * Add tracks to playlist
   */
  async addTracksToPlaylist(playlistId, trackIds, accessToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/playlist/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          songs: trackIds.join(',')
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
      }

      logger.info('Tracks added to Deezer playlist successfully', { 
        playlistId,
        tracksCount: trackIds.length 
      });

      return {
        playlist_id: playlistId,
        tracks_added: trackIds.length,
        status: 'success'
      };
    } catch (error) {
      logger.error('Failed to add tracks to Deezer playlist', { 
        error: error.message,
        playlistId 
      });
      throw error;
    }
  }

  // ========== User Profile ==========

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/user/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }

      const profileData = await response.json();
      
      return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        country: profileData.country,
        picture: profileData.picture,
        followers: profileData.nb_fan,
        playlists: profileData.nb_playlist
      };
    } catch (error) {
      logger.error('Failed to get Deezer user profile', { error: error.message });
      throw error;
    }
  }

  // ========== Utility Methods ==========

  /**
   * Validate track data for Deezer submission
   */
  validateTrackData(trackData) {
    const errors = [];

    // Required fields
    if (!trackData.title) errors.push('Title is required');
    if (!trackData.artist_name) errors.push('Artist name is required');
    if (!trackData.audio_file_url) errors.push('Audio file URL is required');
    if (!trackData.duration_ms) errors.push('Duration is required');

    // Audio format validation
    const supportedFormats = ['mp3', 'flac', 'wav', 'm4a'];
    if (trackData.audio_file_format && !supportedFormats.includes(trackData.audio_file_format.toLowerCase())) {
      errors.push(`Unsupported audio format: ${trackData.audio_file_format}`);
    }

    // Duration validation (minimum 30 seconds, maximum 15 minutes)
    if (trackData.duration_ms) {
      if (trackData.duration_ms < 30000) {
        errors.push('Track must be at least 30 seconds long');
      }
      if (trackData.duration_ms > 900000) {
        errors.push('Track must be no longer than 15 minutes');
      }
    }

    // ISRC validation
    if (trackData.isrc && !this.validateISRC(trackData.isrc)) {
      errors.push('Invalid ISRC format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate ISRC format
   */
  validateISRC(isrc) {
    const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;
    return isrcPattern.test(isrc);
  }

  /**
   * Map genre to Deezer genre system
   */
  mapGenreToDeezer(genre) {
    const genreMap = {
      'Pop': 'Pop',
      'Rock': 'Rock',
      'Hip Hop': 'Rap/Hip Hop',
      'Electronic': 'Electro',
      'Classical': 'Classical',
      'Jazz': 'Jazz',
      'Blues': 'Blues',
      'Country': 'Country',
      'Folk': 'Folk',
      'Reggae': 'Reggae',
      'World': 'World Music',
      'Alternative': 'Alternative'
    };

    return genreMap[genre] || 'Pop';
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

  clearCache() {
    this.cache.clear();
  }

  /**
   * Rate limiting helper
   */
  async rateLimitedRequest(requestFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (error.message.includes('rate limit') && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }
}

module.exports = DeezerIntegration;
