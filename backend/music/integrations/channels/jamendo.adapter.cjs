// Jamendo Integration Adapter
// Creative Commons and royalty-free music platform

class JamendoAdapter {
  constructor(clientId = null, clientSecret = null) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = 'https://api.jamendo.com/v3.0';
    this.platform = 'Jamendo';
    this.tier = 'free/pro';
    this.features = {
      upload: true,
      analytics: true,
      monetization: true, // Through licensing
      creative_commons: true,
      licensing: true,
      royalty_free: true,
      commercial_use: true
    };
  }

  async uploadTrack(trackData, audioFile) {
    try {
      const uploadData = {
        name: trackData.title,
        tags: trackData.tags || [],
        license_ccurl: trackData.license || 'https://creativecommons.org/licenses/by-sa/3.0/',
        description: trackData.description || '',
        genre: trackData.genre || '',
        audio_file: audioFile,
        image: trackData.coverArt || null
      };

      const response = await this.makeRequest('POST', '/tracks', uploadData);
      
      return {
        success: true,
        platform: this.platform,
        trackId: response.id,
        url: `https://www.jamendo.com/track/${response.id}`,
        license_url: response.license_ccurl,
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
      const response = await this.makeRequest('GET', `/tracks?id=${trackId}&include=stats`);
      const track = response.results[0];
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          listens: track.listens || 0,
          downloads: track.downloads || 0,
          favorites: track.favorites || 0,
          playlists: track.playlists_count || 0,
          licenses_sold: track.licenses_sold || 0
        },
        data: track
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
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Jamendo API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getAccessToken() {
    // OAuth 2.0 token generation for Jamendo
    const tokenResponse = await fetch('https://api.jamendo.com/v3.0/oauth/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  }

  // Jamendo specific features
  async setLicenseTerms(trackId, licenseData) {
    try {
      const license = {
        track_id: trackId,
        commercial_use: licenseData.commercialUse || true,
        attribution_required: licenseData.attribution !== false,
        derivative_works: licenseData.derivativeWorks || 'allowed',
        price: licenseData.price || 0
      };

      const response = await this.makeRequest('PUT', `/tracks/${trackId}/license`, license);

      return {
        success: true,
        platform: this.platform,
        license_id: response.license_id,
        license_url: response.license_url
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async searchLicensableMusic(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        format: 'json',
        limit: filters.limit || 50,
        search: query,
        ...(filters.genre && { fuzzytags: filters.genre }),
        ...(filters.duration && { durationbetween: filters.duration }),
        ...(filters.license && { ccmixtape: filters.license })
      });

      const response = await this.makeRequest('GET', `/tracks?${params}`);

      return {
        success: true,
        platform: this.platform,
        tracks: response.results || []
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async getLicenseRevenue(artistId, period = '30d') {
    try {
      const response = await this.makeRequest('GET', `/artists/${artistId}/revenue?period=${period}`);

      return {
        success: true,
        platform: this.platform,
        revenue: {
          total: response.total_revenue || 0,
          licenses_sold: response.licenses_sold || 0,
          average_price: response.average_license_price || 0,
          top_tracks: response.top_earning_tracks || []
        }
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
        client_id: 'Required for API access',
        client_secret: 'Required for authentication',
        license_knowledge: 'Understanding of Creative Commons licenses recommended'
      },
      benefits: [
        'Creative Commons licensing options',
        'Royalty-free music distribution',
        'Commercial licensing opportunities',
        'Professional music library inclusion',
        'Sync licensing for media projects',
        'Revenue through license sales'
      ],
      license_types: [
        'CC BY (Attribution)',
        'CC BY-SA (Attribution-ShareAlike)', 
        'CC BY-NC (Attribution-NonCommercial)',
        'CC BY-ND (Attribution-NoDerivatives)',
        'Custom commercial licenses'
      ],
      use_cases: [
        'Background music for videos',
        'Podcast intros/outros',
        'Commercial advertising',
        'Film and TV sync',
        'Game soundtracks'
      ]
    };
  }
}

module.exports = JamendoAdapter;