// Integration Manager - Central hub for all platform integrations
// Manages music and publishing platform connections

class IntegrationManager {
  constructor() {
    this.musicPlatforms = new Map();
    this.publishingPlatforms = new Map();
    this.connectionStatus = new Map();
    this.apiLimits = new Map();
    this.lastSync = new Map();
    
    this.initializePlatforms();
  }

  initializePlatforms() {
    // Music Platforms
    this.registerMusicPlatforms();
    
    // Publishing Platforms  
    this.registerPublishingPlatforms();
  }

  registerMusicPlatforms() {
    const SoundCloudAdapter = require('./music/integrations/channels/soundcloud.adapter.cjs');
    const BandcampAdapter = require('./music/integrations/channels/bandcamp.adapter.cjs');
    const ReverbNationAdapter = require('./music/integrations/channels/reverbnation.adapter.cjs');
    const AudiomackAdapter = require('./music/integrations/channels/audiomack.adapter.cjs');
    const JamendoAdapter = require('./music/integrations/channels/jamendo.adapter.cjs');
    
    // Existing platforms
    const SpotifyAdapter = require('./music/integrations/channels/spotify.adapter.cjs');
    const AppleMusicAdapter = require('./music/integrations/channels/apple-music.cjs');
    const AmazonMusicAdapter = require('./music/integrations/channels/amazonMusic.adapter.cjs');
    const DeezerAdapter = require('./music/integrations/channels/deezer.adapter.cjs');
    const TidalAdapter = require('./music/integrations/channels/tidal.cjs');

    // Register all platforms
    const platforms = [
      // Free/Community Platforms
      { key: 'soundcloud', adapter: SoundCloudAdapter, tier: 'free', category: 'community' },
      { key: 'bandcamp', adapter: BandcampAdapter, tier: 'free', category: 'direct-sales' },
      { key: 'reverbnation', adapter: ReverbNationAdapter, tier: 'freemium', category: 'promotion' },
      { key: 'audiomack', adapter: AudiomackAdapter, tier: 'free', category: 'hip-hop' },
      { key: 'jamendo', adapter: JamendoAdapter, tier: 'free', category: 'licensing' },
      
      // Premium Platforms
      { key: 'spotify', adapter: SpotifyAdapter, tier: 'premium', category: 'streaming' },
      { key: 'apple-music', adapter: AppleMusicAdapter, tier: 'premium', category: 'streaming' },
      { key: 'amazon-music', adapter: AmazonMusicAdapter, tier: 'premium', category: 'streaming' },
      { key: 'deezer', adapter: DeezerAdapter, tier: 'premium', category: 'streaming' },
      { key: 'tidal', adapter: TidalAdapter, tier: 'premium', category: 'hi-fi' }
    ];

    platforms.forEach(platform => {
      this.musicPlatforms.set(platform.key, {
        adapter: platform.adapter,
        tier: platform.tier,
        category: platform.category,
        instance: null,
        connected: false,
        lastSync: null,
        apiLimits: {
          hourly: 1000,
          daily: 10000,
          monthly: 100000
        }
      });
    });
  }

  registerPublishingPlatforms() {
    const AmazonKDPAdapter = require('./publishing/integrations/stores/amazon-kdp.adapter.cjs');
    const AppleBooksAdapter = require('./publishing/integrations/stores/apple-books.adapter.cjs');
    const KoboAdapter = require('./publishing/integrations/stores/kobo.adapter.cjs');
    const Draft2DigitalAdapter = require('./publishing/integrations/stores/draft2digital.adapter.cjs');

    const platforms = [
      // Primary eBook Platforms
      { key: 'amazon-kdp', adapter: AmazonKDPAdapter, tier: 'free', category: 'ebook' },
      { key: 'apple-books', adapter: AppleBooksAdapter, tier: 'premium', category: 'ebook' },
      { key: 'kobo', adapter: KoboAdapter, tier: 'free', category: 'ebook' },
      { key: 'draft2digital', adapter: Draft2DigitalAdapter, tier: 'free', category: 'distribution' }
    ];

    platforms.forEach(platform => {
      this.publishingPlatforms.set(platform.key, {
        adapter: platform.adapter,
        tier: platform.tier,
        category: platform.category,
        instance: null,
        connected: false,
        lastSync: null,
        apiLimits: {
          hourly: 100,
          daily: 1000,
          monthly: 10000
        }
      });
    });
  }

  // Connection Management
  async connectMusicPlatform(platformKey, credentials) {
    try {
      const platformConfig = this.musicPlatforms.get(platformKey);
      if (!platformConfig) {
        throw new Error(`Music platform '${platformKey}' not found`);
      }

      const AdapterClass = platformConfig.adapter;
      const instance = new AdapterClass(...Object.values(credentials));
      
      // Test connection
      const testResult = await this.testPlatformConnection(instance);
      if (!testResult.success) {
        throw new Error(`Connection test failed: ${testResult.error}`);
      }

      platformConfig.instance = instance;
      platformConfig.connected = true;
      platformConfig.lastSync = new Date().toISOString();

      this.connectionStatus.set(`music-${platformKey}`, {
        connected: true,
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        credentials: this.encryptCredentials(credentials)
      });

      return {
        success: true,
        platform: platformKey,
        type: 'music',
        message: `Successfully connected to ${platformKey}`,
        features: instance.getIntegrationInfo()
      };
    } catch (error) {
      return {
        success: false,
        platform: platformKey,
        type: 'music',
        error: error.message
      };
    }
  }

  async connectPublishingPlatform(platformKey, credentials) {
    try {
      const platformConfig = this.publishingPlatforms.get(platformKey);
      if (!platformConfig) {
        throw new Error(`Publishing platform '${platformKey}' not found`);
      }

      const AdapterClass = platformConfig.adapter;
      const instance = new AdapterClass(...Object.values(credentials));

      // Test connection  
      const testResult = await this.testPlatformConnection(instance);
      if (!testResult.success) {
        throw new Error(`Connection test failed: ${testResult.error}`);
      }

      platformConfig.instance = instance;
      platformConfig.connected = true;
      platformConfig.lastSync = new Date().toISOString();

      this.connectionStatus.set(`publishing-${platformKey}`, {
        connected: true,
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        credentials: this.encryptCredentials(credentials)
      });

      return {
        success: true,
        platform: platformKey,
        type: 'publishing',
        message: `Successfully connected to ${platformKey}`,
        features: instance.getIntegrationInfo()
      };
    } catch (error) {
      return {
        success: false,
        platform: platformKey,
        type: 'publishing',
        error: error.message
      };
    }
  }

  async testPlatformConnection(instance) {
    try {
      // Try to get integration info or perform a simple API call
      if (typeof instance.getIntegrationInfo === 'function') {
        const info = instance.getIntegrationInfo();
        if (info && info.platform) {
          return { success: true, info };
        }
      }
      
      // If no test method available, assume connection is valid
      return { success: true, message: 'Connection established' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Multi-platform Operations
  async distributeToAllMusicPlatforms(releaseData, audioFiles) {
    const results = [];
    const connectedPlatforms = Array.from(this.musicPlatforms.entries())
      .filter(([key, config]) => config.connected && config.instance);

    for (const [platformKey, config] of connectedPlatforms) {
      try {
        const result = await config.instance.uploadTrack(releaseData, audioFiles[0]);
        results.push({
          platform: platformKey,
          ...result
        });
      } catch (error) {
        results.push({
          platform: platformKey,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      distributed_to: results.filter(r => r.success).length,
      total_platforms: connectedPlatforms.length,
      results: results
    };
  }

  async publishToAllBookPlatforms(bookData, manuscript, coverImage) {
    const results = [];
    const connectedPlatforms = Array.from(this.publishingPlatforms.entries())
      .filter(([key, config]) => config.connected && config.instance);

    for (const [platformKey, config] of connectedPlatforms) {
      try {
        const result = await config.instance.publishBook(bookData, manuscript, coverImage);
        results.push({
          platform: platformKey,
          ...result
        });
      } catch (error) {
        results.push({
          platform: platformKey,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      published_to: results.filter(r => r.success).length,
      total_platforms: connectedPlatforms.length,
      results: results
    };
  }

  // Analytics Aggregation
  async getAggregatedMusicAnalytics(trackId, startDate, endDate) {
    const analytics = {};
    const connectedPlatforms = Array.from(this.musicPlatforms.entries())
      .filter(([key, config]) => config.connected && config.instance);

    for (const [platformKey, config] of connectedPlatforms) {
      try {
        if (typeof config.instance.getAnalytics === 'function') {
          const result = await config.instance.getAnalytics(trackId);
          if (result.success) {
            analytics[platformKey] = result.analytics;
          }
        }
      } catch (error) {
        console.error(`Analytics error for ${platformKey}:`, error.message);
      }
    }

    return this.aggregateAnalyticsData(analytics, 'music');
  }

  async getAggregatedBookAnalytics(bookId, startDate, endDate) {
    const analytics = {};
    const connectedPlatforms = Array.from(this.publishingPlatforms.entries())
      .filter(([key, config]) => config.connected && config.instance);

    for (const [platformKey, config] of connectedPlatforms) {
      try {
        if (typeof config.instance.getSalesAnalytics === 'function') {
          const result = await config.instance.getSalesAnalytics(bookId, startDate, endDate);
          if (result.success) {
            analytics[platformKey] = result.analytics;
          }
        }
      } catch (error) {
        console.error(`Analytics error for ${platformKey}:`, error.message);
      }
    }

    return this.aggregateAnalyticsData(analytics, 'publishing');
  }

  aggregateAnalyticsData(platformAnalytics, type) {
    if (type === 'music') {
      return {
        total_plays: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.plays || 0), 0),
        total_likes: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.likes || 0), 0),
        total_shares: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.shares || 0), 0),
        platform_breakdown: platformAnalytics,
        top_platform: this.getTopPerformingPlatform(platformAnalytics, 'plays'),
        last_updated: new Date().toISOString()
      };
    } else if (type === 'publishing') {
      return {
        total_sales: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.units_sold || 0), 0),
        total_revenue: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.revenue || 0), 0),
        total_pages_read: Object.values(platformAnalytics).reduce((sum, data) => sum + (data.pages_read || 0), 0),
        platform_breakdown: platformAnalytics,
        top_platform: this.getTopPerformingPlatform(platformAnalytics, 'revenue'),
        last_updated: new Date().toISOString()
      };
    }
  }

  getTopPerformingPlatform(analytics, metric) {
    let topPlatform = null;
    let topValue = 0;

    for (const [platform, data] of Object.entries(analytics)) {
      const value = data[metric] || 0;
      if (value > topValue) {
        topValue = value;
        topPlatform = platform;
      }
    }

    return { platform: topPlatform, value: topValue };
  }

  // Platform Information
  getAllPlatformInfo() {
    const musicInfo = Array.from(this.musicPlatforms.entries()).map(([key, config]) => ({
      key,
      type: 'music',
      tier: config.tier,
      category: config.category,
      connected: config.connected,
      lastSync: config.lastSync
    }));

    const publishingInfo = Array.from(this.publishingPlatforms.entries()).map(([key, config]) => ({
      key,
      type: 'publishing', 
      tier: config.tier,
      category: config.category,
      connected: config.connected,
      lastSync: config.lastSync
    }));

    return {
      music_platforms: musicInfo,
      publishing_platforms: publishingInfo,
      total_platforms: musicInfo.length + publishingInfo.length,
      connected_platforms: [...musicInfo, ...publishingInfo].filter(p => p.connected).length
    };
  }

  // Utility Methods
  encryptCredentials(credentials) {
    // In production, use proper encryption
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  decryptCredentials(encryptedCredentials) {
    // In production, use proper decryption
    return JSON.parse(Buffer.from(encryptedCredentials, 'base64').toString());
  }
}

module.exports = IntegrationManager;