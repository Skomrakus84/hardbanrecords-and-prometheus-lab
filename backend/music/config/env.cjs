/**
 * Environment Configuration for Music Distribution Module
 * Zmienne środowiskowe (API keys, baza, ustawienia)
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from multiple sources
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const config = {
  // Server configuration
  port: process.env.MUSIC_PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    bucketName: process.env.SUPABASE_BUCKET_NAME || 'hardbanrecords-files'
  },
  
  // Music Distribution APIs
  distributionChannels: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      apiUrl: 'https://api.spotify.com/v1'
    },
    appleMusic: {
      keyId: process.env.APPLE_MUSIC_KEY_ID,
      teamId: process.env.APPLE_MUSIC_TEAM_ID,
      privateKey: process.env.APPLE_MUSIC_PRIVATE_KEY,
      apiUrl: 'https://api.music.apple.com/v1'
    },
    youtubeMusic: {
      apiKey: process.env.YOUTUBE_API_KEY,
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      apiUrl: 'https://www.googleapis.com/youtube/v3'
    },
    tidal: {
      clientId: process.env.TIDAL_CLIENT_ID,
      clientSecret: process.env.TIDAL_CLIENT_SECRET,
      apiUrl: 'https://api.tidal.com/v1'
    },
    amazonMusic: {
      accessKeyId: process.env.AMAZON_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY,
      apiUrl: 'https://music.amazon.com/api'
    },
    deezer: {
      appId: process.env.DEEZER_APP_ID,
      secret: process.env.DEEZER_SECRET,
      apiUrl: 'https://api.deezer.com'
    }
  },
  
  // UGC and Content Protection
  ugcPlatforms: {
    youtubeContentId: {
      channelId: process.env.YOUTUBE_CONTENT_ID_CHANNEL,
      apiKey: process.env.YOUTUBE_CONTENT_ID_API_KEY
    },
    facebookRightsManager: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN
    },
    tiktokSoundLibrary: {
      appKey: process.env.TIKTOK_APP_KEY,
      appSecret: process.env.TIKTOK_APP_SECRET
    }
  },
  
  // Payment Processors
  payments: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox' // sandbox or live
    },
    wise: {
      apiKey: process.env.WISE_API_KEY,
      profileId: process.env.WISE_PROFILE_ID,
      apiUrl: process.env.WISE_API_URL || 'https://api.sandbox.transferwise.tech'
    }
  },
  
  // PRO/CMO Registration
  rightsSocieties: {
    ascap: {
      username: process.env.ASCAP_USERNAME,
      password: process.env.ASCAP_PASSWORD
    },
    bmi: {
      username: process.env.BMI_USERNAME,
      password: process.env.BMI_PASSWORD
    },
    sesac: {
      username: process.env.SESAC_USERNAME,
      password: process.env.SESAC_PASSWORD
    }
  },
  
  // External Services
  services: {
    toolost: {
      apiKey: process.env.TOOLOST_API_KEY,
      apiUrl: process.env.TOOLOST_API_URL || 'https://api.toolost.com/v1'
    },
    musicBrainz: {
      apiUrl: 'https://musicbrainz.org/ws/2',
      userAgent: 'HardbanRecords-Lab/1.0.0'
    }
  },
  
  // File Processing
  files: {
    maxAudioSize: process.env.MAX_AUDIO_SIZE || '100MB',
    maxImageSize: process.env.MAX_IMAGE_SIZE || '10MB',
    allowedAudioFormats: ['wav', 'flac', 'mp3', 'aiff'],
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    tempDir: process.env.TEMP_DIR || '/tmp/music-uploads'
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  
  // Rate Limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    maxUploads: parseInt(process.env.RATE_LIMIT_MAX_UPLOADS) || 10
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'music-distribution.log'
  }
};

// Validation
function validateConfig() {
  const required = [
    'database.supabaseUrl',
    'database.supabaseServiceRoleKey',
    'security.jwtSecret'
  ];
  
  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
    return !value;
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate configuration in production
if (config.nodeEnv === 'production') {
  validateConfig();
}

module.exports = config;
