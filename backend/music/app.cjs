/**
 * Music Distribution Module - Application Configuration
 * Konfiguracja aplikacji, middleware, rejestracja routerów
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

// Import middleware
const authMiddleware = require('../../middleware/auth.cjs');
const { errorHandler } = require('../../middleware/errorHandler.cjs');
const { validateMiddleware } = require('../../middleware/validate.cjs');

// Import configurations
const corsConfig = require('./config/cors.cjs');
const rateLimiterConfig = require('./config/rateLimiter.cjs');
const logger = require('./config/logger.cjs');
const envConfig = require('./config/env.cjs');

// Import routes
const musicRoutes = require('./routes/music.routes.cjs');
const analyticsRoutes = require('./routes/analytics.routes.cjs');
const royaltiesRoutes = require('./routes/royalties.routes.cjs');
const distributionRoutes = require('./routes/distribution.routes.cjs');

class MusicApp {
  constructor() {
    this.app = express();
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());
    
    // CORS configuration
    this.app.use(cors(corsConfig));
    
    // Rate limiting
    this.app.use('/api/', rateLimit(rateLimiterConfig.api));
    this.app.use('/api/music/upload', rateLimit(rateLimiterConfig.upload));
    
    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });

    // Make Supabase client available in requests
    this.app.use((req, res, next) => {
      req.supabase = this.supabase;
      next();
    });
  }

  initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'music-distribution',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/music', require('../routes/music.cjs'));
    this.app.use('/api/music/analytics', authMiddleware, require('../routes/music/analytics.cjs'));
    this.app.use('/api/music/financials', authMiddleware, require('../routes/music/financials.cjs'));
    this.app.use('/api/music/payouts', authMiddleware, require('../routes/music/payouts.cjs'));
    this.app.use('/api/music/profiles', authMiddleware, require('../routes/music/profiles.cjs'));
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        error: 'Route not found',
        service: 'music-distribution',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }

  getSupabase() {
    return this.supabase;
  }
}

module.exports = MusicApp;
