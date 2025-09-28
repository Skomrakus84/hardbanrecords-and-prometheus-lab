// ReverbNation Integration Adapter
// Platform for emerging artists with promotional tools

class ReverbNationAdapter {
  constructor(apiKey = null, artistId = null) {
    this.apiKey = apiKey;
    this.artistId = artistId;
    this.baseUrl = 'https://api.reverbnation.com';
    this.platform = 'ReverbNation';
    this.tier = 'freemium';
    this.features = {
      upload: true,
      analytics: true,
      monetization: true,
      promotion: true,
      gig_finder: true,
      press_kit: true,
      fan_reach: true,
      submissions: true
    };
  }

  async uploadTrack(trackData, audioFile) {
    try {
      const uploadData = {
        title: trackData.title,
        description: trackData.description || '',
        genre: trackData.genre || '',
        tags: trackData.tags || [],
        is_featured: trackData.featured || false,
        audio_file: audioFile
      };

      const response = await this.makeRequest('POST', '/songs', uploadData);
      
      return {
        success: true,
        platform: this.platform,
        trackId: response.song_id,
        url: `https://www.reverbnation.com/${this.artistId}/song/${response.song_id}`,
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

  async getAnalytics(trackId = null) {
    try {
      const endpoint = trackId ? `/songs/${trackId}/stats` : '/artist/stats';
      const response = await this.makeRequest('GET', endpoint);
      
      return {
        success: true,
        platform: this.platform,
        analytics: {
          plays: response.plays || 0,
          fans: response.fans || 0,
          song_downloads: response.downloads || 0,
          profile_views: response.profile_views || 0,
          press_kit_views: response.press_kit_views || 0
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
      throw new Error(`ReverbNation API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // ReverbNation specific features
  async submitToOpportunities(submissionData) {
    try {
      const submission = {
        opportunity_id: submissionData.opportunityId,
        song_ids: submissionData.songIds || [],
        message: submissionData.message || '',
        contact_info: submissionData.contactInfo || {}
      };

      const response = await this.makeRequest('POST', '/submissions', submission);

      return {
        success: true,
        platform: this.platform,
        submission_id: response.id,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async findGigs(location, radius = 50) {
    try {
      const response = await this.makeRequest('GET', `/gigs/search?location=${encodeURIComponent(location)}&radius=${radius}`);

      return {
        success: true,
        platform: this.platform,
        gigs: response.gigs || []
      };
    } catch (error) {
      return {
        success: false,
        platform: this.platform,
        error: error.message
      };
    }
  }

  async updatePressKit(pressKitData) {
    try {
      const pressKit = {
        bio: pressKitData.bio || '',
        press_photos: pressKitData.photos || [],
        press_releases: pressKitData.releases || [],
        contact_info: pressKitData.contact || {},
        social_links: pressKitData.socialLinks || {}
      };

      const response = await this.makeRequest('PUT', '/press-kit', pressKit);

      return {
        success: true,
        platform: this.platform,
        press_kit_url: `https://www.reverbnation.com/${this.artistId}/press-kit`
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
        api_key: 'Required for API access',
        artist_profile: 'Complete ReverbNation artist profile'
      },
      benefits: [
        'Gig finder and booking opportunities',
        'Industry submission opportunities',
        'Professional press kit builder',
        'Fan engagement tools',
        'Music promotion features',
        'Industry networking'
      ],
      pricing: {
        free: 'Basic features, limited uploads',
        pro: '$19.95/month - Unlimited uploads, advanced features',
        premium: '$39.95/month - Priority support, enhanced promotion'
      }
    };
  }
}

module.exports = ReverbNationAdapter;