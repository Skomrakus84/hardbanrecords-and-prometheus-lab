/**
 * Amazon Music Integration Module
 * Advanced integration with Amazon Music API and Amazon Music for Artists
 * Handles track distribution, analytics, and playlist management
 */

const crypto = require('crypto');
const path = require('path');
const logger = require('../../../config/logger.cjs');

class AmazonMusicIntegration {
  constructor() {
    this.apiEndpoint = process.env.AMAZON_MUSIC_API_ENDPOINT || 'https://api.music.amazon.com';
    this.clientId = process.env.AMAZON_MUSIC_CLIENT_ID;
    this.clientSecret = process.env.AMAZON_MUSIC_CLIENT_SECRET;
    this.redirectUri = process.env.AMAZON_MUSIC_REDIRECT_URI;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Amazon Music API scopes
    this.scopes = [
      'music:read',
      'music:write',
      'music:analytics',
      'profile:read'
    ];
  }

  // ========== Authentication ==========

  /**
   * Get authorization URL for Amazon Music
   */
  getAuthorizationUrl(state = null) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: state || crypto.randomBytes(16).toString('hex')
    });

    return `${this.apiEndpoint}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, state = null) {
    try {
      const response = await fetch(`${this.apiEndpoint}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      logger.info('Amazon Music token exchange successful', { 
        scope: tokenData.scope,
        expiresIn: tokenData.expires_in 
      });

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope
      };
    } catch (error) {
      logger.error('Amazon Music token exchange failed', { error: error.message, code });
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      logger.info('Amazon Music token refresh successful');

      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || refreshToken,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      };
    } catch (error) {
      logger.error('Amazon Music token refresh failed', { error: error.message });
      throw new Error('Failed to refresh Amazon Music token');
    }
  }

  // ========== Track Distribution ==========

  /**
   * Submit track to Amazon Music
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
        duration_ms: trackData.duration_ms,
        explicit: trackData.explicit_content || false,
        isrc: trackData.isrc,
        
        // Audio file
        audio_file_url: trackData.audio_file_url,
        audio_format: trackData.audio_file_format,
        audio_quality: this.mapAudioQuality(trackData),
        
        // Metadata
        genre: trackData.genre,
        subgenre: trackData.subgenre,
        language: trackData.language,
        instrumental: trackData.instrumental || false,
        
        // Release information
        release_date: trackData.release_date,
        label: trackData.label_name,
        copyright: trackData.copyright_notice,
        
        // Amazon-specific metadata
        availability_territories: trackData.territories || ['US'],
        preview_start_time: trackData.preview_start_time || 30000,
        preview_duration: trackData.preview_duration || 30000
      };

      const response = await fetch(`${this.apiEndpoint}/v1/content/tracks`, {
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
        throw new Error(`Track submission failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      logger.info('Track submitted to Amazon Music successfully', { 
        trackId: result.id,
        title: trackData.title 
      });

      return {
        amazon_track_id: result.id,
        submission_id: result.submission_id,
        status: result.status,
        submission_date: new Date().toISOString(),
        estimated_review_time: result.estimated_review_time,
        review_notes: result.review_notes || null
      };
    } catch (error) {
      logger.error('Amazon Music track submission failed', { 
        error: error.message,
        title: trackData.title 
      });
      throw error;
    }
  }

  /**
   * Upload audio file to Amazon Music
   */
  async uploadAudioFile(audioFile, accessToken) {
    try {
      // Get upload URL
      const uploadUrlResponse = await fetch(`${this.apiEndpoint}/v1/content/upload-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_type: 'audio',
          file_extension: path.extname(audioFile.originalname).toLowerCase(),
          file_size: audioFile.size
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
      }

      const uploadData = await uploadUrlResponse.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadData.upload_url, {
        method: 'PUT',
        headers: uploadData.headers || {},
        body: audioFile.buffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
      }

      logger.info('Audio file uploaded to Amazon Music successfully', { 
        fileId: uploadData.file_id 
      });

      return {
        file_id: uploadData.file_id,
        file_url: uploadData.file_url,
        upload_status: 'completed'
      };
    } catch (error) {
      logger.error('Amazon Music audio upload failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Upload artwork to Amazon Music
   */
  async uploadArtwork(artworkFile, accessToken) {
    try {
      // Get upload URL for artwork
      const uploadUrlResponse = await fetch(`${this.apiEndpoint}/v1/content/upload-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_type: 'image',
          file_extension: path.extname(artworkFile.originalname).toLowerCase(),
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
        headers: uploadData.headers || {},
        body: artworkFile.buffer
      });

      if (!uploadResponse.ok) {
        throw new Error(`Artwork upload failed: ${uploadResponse.statusText}`);
      }

      logger.info('Artwork uploaded to Amazon Music successfully', { 
        artworkId: uploadData.file_id 
      });

      return {
        artwork_id: uploadData.file_id,
        artwork_url: uploadData.file_url,
        upload_status: 'completed'
      };
    } catch (error) {
      logger.error('Amazon Music artwork upload failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get track status from Amazon Music
   */
  async getTrackStatus(amazonTrackId, accessToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/v1/content/tracks/${amazonTrackId}`, {
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
        availability_date: trackData.availability_date,
        territories: trackData.territories,
        rejection_reason: trackData.rejection_reason || null,
        last_updated: trackData.last_updated
      };
    } catch (error) {
      logger.error('Failed to get Amazon Music track status', { 
        error: error.message,
        amazonTrackId 
      });
      throw error;
    }
  }

  // ========== Analytics ==========

  /**
   * Get track analytics from Amazon Music for Artists
   */
  async getTrackAnalytics(amazonTrackId, accessToken, options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate = new Date().toISOString().split('T')[0],
        metrics = ['streams', 'listeners', 'revenue'],
        territories = ['US']
      } = options;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(','),
        territories: territories.join(',')
      });

      const response = await fetch(`${this.apiEndpoint}/v1/analytics/tracks/${amazonTrackId}?${params}`, {
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
        track_id: amazonTrackId,
        period: {
          start_date: startDate,
          end_date: endDate
        },
        metrics: {
          total_streams: analyticsData.total_streams || 0,
          unique_listeners: analyticsData.unique_listeners || 0,
          total_revenue: analyticsData.total_revenue || 0,
          average_completion_rate: analyticsData.average_completion_rate || 0
        },
        territories: analyticsData.territories || {},
        daily_data: analyticsData.daily_data || [],
        last_updated: analyticsData.last_updated
      };
    } catch (error) {
      logger.error('Amazon Music analytics request failed', { 
        error: error.message,
        amazonTrackId 
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
        endDate = new Date().toISOString().split('T')[0],
        metrics = ['streams', 'listeners', 'followers']
      } = options;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(',')
      });

      const response = await fetch(`${this.apiEndpoint}/v1/analytics/artists/${artistId}?${params}`, {
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
        demographics: analyticsData.demographics || {},
        last_updated: analyticsData.last_updated
      };
    } catch (error) {
      logger.error('Amazon Music artist analytics request failed', { 
        error: error.message,
        artistId 
      });
      throw error;
    }
  }

  // ========== Search and Discovery ==========

  /**
   * Search Amazon Music catalog
   */
  async searchCatalog(query, accessToken, options = {}) {
    try {
      const {
        types = ['tracks'],
        limit = 20,
        offset = 0,
        market = 'US'
      } = options;

      const params = new URLSearchParams({
        q: query,
        type: types.join(','),
        limit: limit.toString(),
        offset: offset.toString(),
        market: market
      });

      const response = await fetch(`${this.apiEndpoint}/v1/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'HardbanRecords-Lab/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const searchResults = await response.json();
      
      return {
        query: query,
        total_results: searchResults.total,
        tracks: searchResults.tracks || { items: [], total: 0 },
        albums: searchResults.albums || { items: [], total: 0 },
        artists: searchResults.artists || { items: [], total: 0 },
        playlists: searchResults.playlists || { items: [], total: 0 }
      };
    } catch (error) {
      logger.error('Amazon Music catalog search failed', { 
        error: error.message,
        query 
      });
      throw error;
    }
  }

  /**
   * Get music recommendations
   */
  async getRecommendations(seedTrackId, accessToken, options = {}) {
    try {
      const {
        limit = 20,
        market = 'US'
      } = options;

      const params = new URLSearchParams({
        seed_tracks: seedTrackId,
        limit: limit.toString(),
        market: market
      });

      const response = await fetch(`${this.apiEndpoint}/v1/recommendations?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'HardbanRecords-Lab/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Recommendations request failed: ${response.statusText}`);
      }

      const recommendations = await response.json();
      
      return {
        seed_track_id: seedTrackId,
        recommendations: recommendations.tracks || [],
        total: recommendations.tracks?.length || 0
      };
    } catch (error) {
      logger.error('Amazon Music recommendations request failed', { 
        error: error.message,
        seedTrackId 
      });
      throw error;
    }
  }

  // ========== Playlist Management ==========

  /**
   * Create playlist on Amazon Music
   */
  async createPlaylist(playlistData, accessToken) {
    try {
      const response = await fetch(`${this.apiEndpoint}/v1/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'HardbanRecords-Lab/1.0'
        },
        body: JSON.stringify({
          name: playlistData.name,
          description: playlistData.description || '',
          public: playlistData.public || false,
          collaborative: playlistData.collaborative || false
        })
      });

      if (!response.ok) {
        throw new Error(`Playlist creation failed: ${response.statusText}`);
      }

      const playlist = await response.json();
      
      logger.info('Amazon Music playlist created successfully', { 
        playlistId: playlist.id,
        name: playlistData.name 
      });

      return {
        playlist_id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls?.amazon,
        tracks_count: 0
      };
    } catch (error) {
      logger.error('Amazon Music playlist creation failed', { 
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
      const response = await fetch(`${this.apiEndpoint}/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'HardbanRecords-Lab/1.0'
        },
        body: JSON.stringify({
          uris: trackIds.map(id => `amazon:track:${id}`)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
      }

      logger.info('Tracks added to Amazon Music playlist successfully', { 
        playlistId,
        tracksCount: trackIds.length 
      });

      return {
        playlist_id: playlistId,
        tracks_added: trackIds.length,
        status: 'success'
      };
    } catch (error) {
      logger.error('Failed to add tracks to Amazon Music playlist', { 
        error: error.message,
        playlistId 
      });
      throw error;
    }
  }

  // ========== Utility Methods ==========

  /**
   * Validate track data for Amazon Music submission
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

    // Duration validation (minimum 30 seconds)
    if (trackData.duration_ms && trackData.duration_ms < 30000) {
      errors.push('Track must be at least 30 seconds long');
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
   * Map audio quality based on technical specs
   */
  mapAudioQuality(trackData) {
    if (!trackData.sample_rate || !trackData.bit_depth) {
      return 'standard';
    }

    if (trackData.sample_rate >= 96000 && trackData.bit_depth >= 24) {
      return 'ultra_hd';
    } else if (trackData.sample_rate >= 48000 && trackData.bit_depth >= 24) {
      return 'hd';
    } else if (trackData.sample_rate >= 44100 && trackData.bit_depth >= 16) {
      return 'standard';
    } else {
      return 'basic';
    }
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

module.exports = AmazonMusicIntegration;
