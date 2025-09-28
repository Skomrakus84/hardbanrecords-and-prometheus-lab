/**
 * Spotify Integration Adapter for Music Distribution
 * Integracja z API Spotify
 */

const axios = require('axios');
const logger = require('../../config/logger.cjs');

class SpotifyAdapter {
  constructor(config = {}) {
    this.clientId = config.clientId || process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.SPOTIFY_CLIENT_SECRET;
    this.apiUrl = config.apiUrl || 'https://api.spotify.com/v1';
    this.authUrl = 'https://accounts.spotify.com/api/token';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with Spotify Web API
   */
  async authenticate() {
    try {
      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.authUrl, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      logger.musicDistribution.integration('Spotify authentication successful', {
        expiresIn: response.data.expires_in
      });

      return true;
    } catch (error) {
      logger.error('Spotify authentication failed:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Ensure valid access token
   */
  async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute before expiry
      await this.authenticate();
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    await this.ensureValidToken();

    try {
      const response = await axios({
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      return response.data;
    } catch (error) {
      logger.error('Spotify API request failed:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  /**
   * Search for artist on Spotify
   */
  async searchArtist(artistName, limit = 10) {
    try {
      const data = await this.makeRequest(`/search`, {
        method: 'GET',
        params: {
          q: artistName,
          type: 'artist',
          limit
        }
      });

      return data.artists?.items || [];
    } catch (error) {
      logger.error('Failed to search artist on Spotify:', error);
      return [];
    }
  }

  /**
   * Search for album on Spotify
   */
  async searchAlbum(albumName, artistName = null, limit = 10) {
    try {
      let query = `album:"${albumName}"`;
      if (artistName) {
        query += ` artist:"${artistName}"`;
      }

      const data = await this.makeRequest(`/search`, {
        method: 'GET',
        params: {
          q: query,
          type: 'album',
          limit
        }
      });

      return data.albums?.items || [];
    } catch (error) {
      logger.error('Failed to search album on Spotify:', error);
      return [];
    }
  }

  /**
   * Get album details by ID
   */
  async getAlbum(albumId) {
    try {
      const data = await this.makeRequest(`/albums/${albumId}`);
      return data;
    } catch (error) {
      logger.error('Failed to get album from Spotify:', error);
      return null;
    }
  }

  /**
   * Get artist details by ID
   */
  async getArtist(artistId) {
    try {
      const data = await this.makeRequest(`/artists/${artistId}`);
      return data;
    } catch (error) {
      logger.error('Failed to get artist from Spotify:', error);
      return null;
    }
  }

  /**
   * Get artist's albums
   */
  async getArtistAlbums(artistId, options = {}) {
    try {
      const data = await this.makeRequest(`/artists/${artistId}/albums`, {
        method: 'GET',
        params: {
          include_groups: options.includeGroups || 'album,single,compilation',
          market: options.market || 'US',
          limit: options.limit || 20,
          offset: options.offset || 0
        }
      });

      return data.items || [];
    } catch (error) {
      logger.error('Failed to get artist albums from Spotify:', error);
      return [];
    }
  }

  /**
   * Get track audio features
   */
  async getTrackAudioFeatures(trackId) {
    try {
      const data = await this.makeRequest(`/audio-features/${trackId}`);
      return data;
    } catch (error) {
      logger.error('Failed to get track audio features from Spotify:', error);
      return null;
    }
  }

  /**
   * Get multiple tracks
   */
  async getTracks(trackIds) {
    try {
      const data = await this.makeRequest(`/tracks`, {
        method: 'GET',
        params: {
          ids: trackIds.join(',')
        }
      });

      return data.tracks || [];
    } catch (error) {
      logger.error('Failed to get tracks from Spotify:', error);
      return [];
    }
  }

  /**
   * Check if content exists on Spotify by ISRC
   */
  async findByISRC(isrc) {
    try {
      const data = await this.makeRequest(`/search`, {
        method: 'GET',
        params: {
          q: `isrc:${isrc}`,
          type: 'track',
          limit: 1
        }
      });

      return data.tracks?.items?.[0] || null;
    } catch (error) {
      logger.error('Failed to find track by ISRC on Spotify:', error);
      return null;
    }
  }

  /**
   * Get recommendations based on seed data
   */
  async getRecommendations(seedData) {
    try {
      const data = await this.makeRequest(`/recommendations`, {
        method: 'GET',
        params: {
          ...seedData,
          limit: seedData.limit || 20
        }
      });

      return data.tracks || [];
    } catch (error) {
      logger.error('Failed to get recommendations from Spotify:', error);
      return [];
    }
  }

  /**
   * Get genre seeds available for recommendations
   */
  async getGenreSeeds() {
    try {
      const data = await this.makeRequest(`/recommendations/available-genre-seeds`);
      return data.genres || [];
    } catch (error) {
      logger.error('Failed to get genre seeds from Spotify:', error);
      return [];
    }
  }

  /**
   * Validate release data against Spotify requirements
   */
  validateReleaseData(releaseData) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!releaseData.title || releaseData.title.length < 1) {
      errors.push('Release title is required');
    }

    if (!releaseData.artist || !releaseData.artist.name) {
      errors.push('Artist name is required');
    }

    if (!releaseData.tracks || releaseData.tracks.length === 0) {
      errors.push('At least one track is required');
    }

    // Check artwork requirements
    if (!releaseData.artwork || !releaseData.artwork.coverImage) {
      errors.push('Cover artwork is required');
    } else {
      // Spotify requires minimum 640x640 pixels
      warnings.push('Ensure cover artwork is at least 640x640 pixels');
    }

    // Check track requirements
    if (releaseData.tracks) {
      releaseData.tracks.forEach((track, index) => {
        if (!track.title) {
          errors.push(`Track ${index + 1}: Title is required`);
        }

        if (!track.duration || track.duration < 1) {
          errors.push(`Track ${index + 1}: Valid duration is required`);
        }

        if (track.duration && track.duration < 30) {
          warnings.push(`Track ${index + 1}: Tracks shorter than 30 seconds may not be eligible for royalties`);
        }

        if (!track.audioFile) {
          errors.push(`Track ${index + 1}: Audio file is required`);
        }
      });
    }

    // Check release date
    if (releaseData.releaseDate) {
      const releaseDate = new Date(releaseData.releaseDate);
      const today = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(today.getFullYear() + 1);

      if (releaseDate > maxFutureDate) {
        warnings.push('Release date cannot be more than 1 year in the future');
      }
    }

    // Check explicit content
    if (releaseData.explicitContent === undefined) {
      warnings.push('Please specify if the release contains explicit content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Transform release data to Spotify format
   */
  transformReleaseForSpotify(releaseData) {
    return {
      name: releaseData.title,
      album_type: this.mapReleaseTypeToSpotify(releaseData.type),
      artists: [{
        name: releaseData.artist.name
      }],
      release_date: releaseData.releaseDate,
      release_date_precision: 'day',
      genres: releaseData.genres || [],
      label: releaseData.label?.name || '',
      explicit: releaseData.explicitContent || false,
      tracks: releaseData.tracks.map((track, index) => ({
        name: track.title,
        track_number: track.trackNumber || index + 1,
        disc_number: track.discNumber || 1,
        duration_ms: track.duration * 1000,
        explicit: track.explicitContent || false,
        isrc: track.isrc
      })),
      images: releaseData.artwork?.coverImage ? [{
        url: releaseData.artwork.coverImage,
        height: 640, // Minimum required
        width: 640
      }] : []
    };
  }

  /**
   * Map internal release type to Spotify album type
   */
  mapReleaseTypeToSpotify(releaseType) {
    const typeMap = {
      'single': 'single',
      'ep': 'album',
      'album': 'album',
      'compilation': 'compilation',
      'remix': 'single',
      'live': 'album'
    };

    return typeMap[releaseType] || 'album';
  }

  /**
   * Check distribution status (placeholder for future Spotify for Artists API)
   */
  async checkDistributionStatus(releaseId, spotifyId = null) {
    try {
      // This would integrate with Spotify for Artists API when available
      // For now, we can only check if content exists by searching
      
      if (spotifyId) {
        const album = await this.getAlbum(spotifyId);
        return {
          status: album ? 'live' : 'not_found',
          spotifyId: album?.id,
          externalUrl: album?.external_urls?.spotify,
          releaseDate: album?.release_date
        };
      }

      return {
        status: 'unknown',
        message: 'Cannot verify status without Spotify ID'
      };
    } catch (error) {
      logger.error('Failed to check distribution status on Spotify:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = SpotifyAdapter;
