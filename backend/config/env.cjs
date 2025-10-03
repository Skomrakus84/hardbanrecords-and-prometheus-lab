const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Override with backend-specific .env if exists
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  // Service Ports
  ports: {
    gateway: process.env.PORT || 3001,
    music: process.env.MUSIC_SERVICE_PORT || 3002,
    publishing: process.env.PUBLISHING_SERVICE_PORT || 3003,
    prometheus: process.env.PROMETHEUS_SERVICE_PORT || 3004,
    mastering: process.env.MASTERING_SERVICE_PORT || 3005
  },

  // Service URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
    gateway: process.env.BACKEND_URL || 'http://localhost:3001',
    music: process.env.MUSIC_SERVICE_URL || 'http://localhost:3002',
    publishing: process.env.PUBLISHING_SERVICE_URL || 'http://localhost:3003',
    prometheus: process.env.PROMETHEUS_URL || 'http://localhost:3004'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hardban_records',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    bucketName: process.env.SUPABASE_BUCKET_NAME || 'hardban-storage'
  },

  // AI Services
  ai: {
    groq: {
      apiKey: process.env.GROQ_API_KEY
    },
    prometheus: {
      modelPath: process.env.PROMETHEUS_MODEL_PATH,
      configPath: process.env.PROMETHEUS_CONFIG_PATH
    }
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'development-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOGS_DIR || '../logs'
  },

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development'
};