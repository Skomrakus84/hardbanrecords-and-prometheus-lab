// Audiomack Integration Adapter
// Hip-hop focused platform with strong mobile presence

class AudiomackAdapter {
  constructor(apiKey = null, userId = null) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.baseUrl = 'https://api.audiomack.com/v1';
    this.platform = 'Audiomack';
    this.tier = 'free';
    this.features = {
      upload: true,
      analytics: true,
      monetization: false, // Limited on free tier
      playlists: true,
      social_features: true,
      mobile_optimized: true,
      trending: true
    };
  }

  async uploadTrack(trackData, audioFile) {
    try {
      const uploadData = {
        title: trackData.title,
        description: trackData.description || '',
        genre: trackData.genre || 'Hip-Hop',
        tags: trackData.tags || [],
        is_explicit: trackData.explicit || false,
        audio_file: audioFile
      };

      const response = await this.makeRequest('POST', '/music/upload', uploadData);
      
      return {
        success: true,
        platform: this.platform,
        trackId: response.id,
        url: response.permalink,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async getAnalytics(trackId) {
    try {
      const response = await this.makeRequest('GET', `/music/${trackId}/stats`);
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          plays: response.play_count || 0,
          likes: response.favorite_count || 0,
          reposts: response.repost_count || 0,
          downloads: response.download_count || 0,
          shares: response.share_count || 0
        },
        data: response
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Audiomack API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Audiomack specific features
  async getTrendingTracks(genre = null, limit = 20) {
    try {
      const endpoint = `/trending${genre ? `?genre=${genre}` : ''}${limit ? `${genre ? '&' : '?'}limit=${limit}` : ''}`;
      const response = await this.makeRequest('GET', endpoint);

      return {
        success: true,
        platform: this.platform,
        trending: response.tracks || []
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async createPlaylist(playlistData) {
    try {
      const playlist = {
        title: playlistData.title,
        description: playlistData.description || '',
        is_public: playlistData.public !== false,
        track_ids: playlistData.trackIds || []
      };

      const response = await this.makeRequest('POST', '/playlists', playlist);

      return {
        success: true,
        platform: this.platform,
        playlistId: response.id,
        url: response.permalink
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async followUser(userId) {
    try {
      const response = await this.makeRequest('POST', `/users/${userId}/follow`);

      return {
        success: true,
        platform: this.platform,
        following: response.following
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  getIntegrationInfo() {
    return {
      platform: this.platform,
      tier: this.tier,
      features: this.features,
      requirements: {
        api_key: 'Required for uploads and API access',
        mobile_app: 'Strong mobile presence recommended'
      },
      benefits: [
        'Strong hip-hop and urban music community',
        'Mobile-first platform with high engagement',
        'Trending algorithms for discovery',
        'Social features for fan interaction',
        'Free hosting and streaming',
        'Playlist placement opportunities'
      ],
      target_audience: [
        'Hip-hop artists',
        'R&B musicians',
        'Urban music creators',
        'Emerging artists',
        'Mobile-focused listeners'
      ]
    };
  }
}

module.exports = AudiomackAdapter;