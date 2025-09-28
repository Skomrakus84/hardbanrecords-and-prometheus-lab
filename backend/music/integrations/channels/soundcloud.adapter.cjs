// SoundCloud Integration Adapter
// Free platform - Community focused

class SoundCloudAdapter {
  constructor(apiKey = null, clientId = null) {
    this.apiKey = apiKey;
    this.clientId = clientId;
    this.baseUrl = 'https://api.soundcloud.com';
    this.platform = 'SoundCloud';
    this.tier = 'free';
    this.features = {
      upload: true,
      analytics: true,
      monetization: false, // Free tier
      playlist_creation: true,
      social_features: true,
      comments: true,
      likes: true,
      reposts: true
    };
  }

  async uploadTrack(trackData, audioFile) {
    try {
      if (!this.apiKey) {
        throw new Error('SoundCloud API key required for uploads');
      }

      const uploadData = {
        'track[title]': trackData.title,
        'track[description]': trackData.description || '',
        'track[genre]': trackData.genre || '',
        'track[tag_list]': trackData.tags ? trackData.tags.join(' ') : '',
        'track[sharing]': 'public',
        'track[downloadable]': trackData.downloadable || false,
        'track[asset_data]': audioFile
      };

      const response = await this.makeRequest('POST', '/tracks', uploadData);
      
      return {
        success: true,
        platform: this.platform,
        trackId: response.id,
        url: response.permalink_url,
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

  async getTrackAnalytics(trackId) {
    try {
      const response = await this.makeRequest('GET', `/tracks/${trackId}`);
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          plays: response.playback_count || 0,
          likes: response.likes_count || 0,
          reposts: response.reposts_count || 0,
          comments: response.comment_count || 0,
          downloads: response.download_count || 0
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
        'Authorization': `OAuth ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`SoundCloud API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Platform specific features
  async createPlaylist(playlistData) {
    try {
      const response = await this.makeRequest('POST', '/playlists', {
        'playlist[title]': playlistData.title,
        'playlist[description]': playlistData.description || '',
        'playlist[sharing]': 'public'
      });

      return {
        success: true,
        platform: this.platform,
        playlistId: response.id,
        url: response.permalink_url
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
        api_key: 'Required for uploads',
        client_id: 'Required for public API access'
      },
      benefits: [
        'Large community reach',
        'Social features (comments, reposts)',
        'Free hosting',
        'Playlist inclusion opportunities',
        'Direct fan engagement'
      ]
    };
  }
}

module.exports = SoundCloudAdapter;