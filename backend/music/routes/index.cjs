/**
 * Music Routes Index - Main Route Aggregator for Music Module
 * Centralizes all Music module routes for clean organization
 * Provides comprehensive API routing structure for music distribution
 */

const express = require('express');
const router = express.Router();

// Import route modules
const releasesRoutes = require('./releases.cjs');
const tracksRoutes = require('./tracks.cjs');
const profilesRoutes = require('./profiles.cjs');
const analyticsRoutes = require('./analytics.routes.cjs');
const distributionRoutes = require('./distribution.cjs');
const financialsRoutes = require('./financials.cjs');
const payoutsRoutes = require('./payouts.cjs');
const notificationsRoutes = require('./notifications.cjs');
const artistRoutes = require('./artist.routes.cjs');
const royaltyRoutes = require('./royalty.routes.cjs');
const payoutRoutes = require('./payout.routes.cjs');

// Import middleware
const logger = require('../config/logger.cjs');

// ========== Route Registration ==========

/**
 * Releases management routes
 * All routes under /api/music/releases
 */
router.use('/releases', releasesRoutes);

/**
 * Tracks management routes
 * All routes under /api/music/tracks
 */
router.use('/tracks', tracksRoutes);

/**
 * Artist profiles management routes
 * All routes under /api/music/profiles
 */
router.use('/profiles', profilesRoutes);

/**
 * Analytics and insights routes
 * All routes under /api/music/analytics
 */
router.use('/analytics', analyticsRoutes);

/**
 * Distribution management routes
 * All routes under /api/music/distribution
 */
router.use('/distribution', distributionRoutes);

/**
 * Financial reporting routes
 * All routes under /api/music/financials
 */
router.use('/financials', financialsRoutes);

/**
 * Payouts and royalties routes
 * All routes under /api/music/payouts
 */
router.use('/payouts', payoutsRoutes);

/**
 * Artist management routes
 * All routes under /api/music/artists
 */
router.use('/artists', artistRoutes);

/**
 * Royalty management routes
 * All routes under /api/music/royalties
 */
router.use('/royalties', royaltyRoutes);

/**
 * Payout system routes
 * All routes under /api/music/payouts-new
 */
router.use('/payouts-new', payoutRoutes);

/**
 * Notifications management routes
 * All routes under /api/music/notifications
 */
router.use('/notifications', notificationsRoutes);

// ========== API Documentation Route ==========

/**
 * @route   GET /api/music
 * @desc    Get API documentation and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        name: 'HardbanRecords Music API',
        version: '1.0.0',
        description: 'Comprehensive Music Distribution and Rights Management System',
        documentation: '/api/music/docs',
        endpoints: {
            releases: {
                base: '/api/music/releases',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Release lifecycle management and distribution'
            },
            tracks: {
                base: '/api/music/tracks',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Track management and metadata'
            },
            profiles: {
                base: '/api/music/profiles',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Artist and label profiles management'
            },
            analytics: {
                base: '/api/music/analytics',
                methods: ['GET', 'POST'],
                description: 'Performance analytics and insights'
            },
            distribution: {
                base: '/api/music/distribution',
                methods: ['GET', 'POST', 'PUT'],
                description: 'Multi-platform distribution management'
            },
            financials: {
                base: '/api/music/financials',
                methods: ['GET', 'POST'],
                description: 'Financial reporting and revenue tracking'
            },
            payouts: {
                base: '/api/music/payouts',
                methods: ['GET', 'POST', 'PUT'],
                description: 'Royalty payouts and earnings management'
            },
            notifications: {
                base: '/api/music/notifications',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'System notifications and alerts'
            }
        },
        features: [
            'Multi-platform music distribution',
            'Advanced royalty calculation and splits',
            'Real-time analytics and reporting',
            'Digital rights management (DRM)',
            'Automated metadata management',
            'Territory-based release management',
            'PRO/CMO integration for performance royalties',
            'UGC monitoring and content ID',
            'Financial reporting and tax documentation',
            'Artist and label collaboration tools'
        ],
        integrations: {
            platforms: [
                'Spotify',
                'Apple Music',
                'YouTube Music',
                'Amazon Music',
                'Deezer',
                'Tidal',
                'SoundCloud',
                'Bandcamp'
            ],
            payments: ['Stripe', 'PayPal', 'Wise', 'Tipalti'],
            pros_cmos: ['ASCAP', 'BMI', 'SESAC', 'PRS', 'GEMA', 'ZAIKS'],
            content_id: ['YouTube Content ID', 'Facebook Rights Manager'],
            formats: ['MP3', 'FLAC', 'WAV', 'AAC', 'OGG']
        }
    });
});

// ========== Health Check Route ==========

/**
 * @route   GET /api/music/health
 * @desc    Health check endpoint for service monitoring
 * @access  Public
 */
router.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'music-api',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        },
        environment: process.env.NODE_ENV || 'development'
    };

    logger.info('Music API health check performed', {
        requestId: req.requestId,
        uptime: healthCheck.uptime,
        memory: healthCheck.memory
    });

    res.status(200).json(healthCheck);
});

// ========== Error Handling for Routes ==========

/**
 * Catch-all route for undefined endpoints
 */
router.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
        availableEndpoints: [
            'GET /api/music',
            'GET /api/music/health',
            'GET /api/music/releases',
            'GET /api/music/tracks',
            'GET /api/music/profiles',
            'GET /api/music/analytics',
            'GET /api/music/distribution',
            'GET /api/music/financials',
            'GET /api/music/payouts',
            'GET /api/music/notifications'
        ]
    });
});

module.exports = router;
