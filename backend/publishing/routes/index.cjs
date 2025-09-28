/**
 * Publishing Routes Index - Main Route Aggregator
 * Centralizes all Publishing module routes for clean organization
 * Provides comprehensive API routing structure
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authorsRoutes = require('./authors.cjs');
const publicationsRoutes = require('./publications.cjs');
const storeRoutes = require('./store.cjs');
const analyticsRoutes = require('./analytics.cjs');
const rightsRoutes = require('./rights.cjs');
const conversionRoutes = require('./conversion.cjs');

// Import middleware
const logger = require('../config/logger.cjs');

// ========== Route Registration ==========

/**
 * Authors management routes
 * All routes under /api/publishing/authors
 */
router.use('/authors', authorsRoutes);

/**
 * Publications management routes
 * All routes under /api/publishing/publications
 */
router.use('/publications', publicationsRoutes);

/**
 * Store integration routes
 * All routes under /api/publishing/stores
 */
router.use('/stores', storeRoutes);

/**
 * Publishing analytics routes
 * All routes under /api/publishing/analytics
 */
router.use('/analytics', analyticsRoutes);

/**
 * Rights management routes
 * All routes under /api/publishing/rights
 */
router.use('/rights', rightsRoutes);

/**
 * Format conversion routes
 * All routes under /api/publishing/conversion
 */
router.use('/conversion', conversionRoutes);

// ========== API Documentation Route ==========

/**
 * @route   GET /api/publishing
 * @desc    Get API documentation and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        name: 'HardbanRecords Publishing API',
        version: '1.0.0',
        description: 'Comprehensive Digital Publishing and Distribution Management System',
        documentation: '/api/publishing/docs',
        endpoints: {
            authors: {
                base: '/api/publishing/authors',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Author management and profiles'
            },
            publications: {
                base: '/api/publishing/publications',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Publication creation and management'
            },
            stores: {
                base: '/api/publishing/stores',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Publishing store integrations'
            },
            analytics: {
                base: '/api/publishing/analytics',
                methods: ['GET'],
                description: 'Publishing performance analytics'
            },
            rights: {
                base: '/api/publishing/rights',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'Rights and DRM management'
            },
            conversion: {
                base: '/api/publishing/conversion',
                methods: ['GET', 'POST', 'DELETE'],
                description: 'Format conversion services'
            }
        },
        features: [
            'Multi-format publishing (EPUB, PDF, Audiobook, Print)',
            'DRM and territorial rights management',
            'Multi-store distribution automation',
            'Real-time sales tracking and reporting',
            'Collaborative authoring with granular permissions',
            'Automated format conversion',
            'ISBN management and assignment',
            'BISAC categorization',
            'Royalty calculation and payment processing',
            'Version control for publications',
            'Advanced analytics and insights'
        ],
        integrations: {
            stores: [
                'Amazon Kindle Direct Publishing',
                'Apple Books',
                'Google Play Books',
                'Kobo',
                'Barnes & Noble Press',
                'Empik (Poland)',
                'Draft2Digital',
                'Smashwords'
            ],
            payments: ['Stripe', 'PayPal', 'Wise'],
            drm: ['Adobe DRM', 'Social DRM', 'Watermark DRM'],
            formats: ['EPUB', 'PDF', 'MOBI', 'AZW3', 'MP3', 'M4A']
        }
    });
});

// ========== Health Check Route ==========

/**
 * @route   GET /api/publishing/health
 * @desc    Health check endpoint for service monitoring
 * @access  Public
 */
router.get('/health', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'publishing-api',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        },
        environment: process.env.NODE_ENV || 'development'
    };

    logger.info('Health check performed', {
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
            'GET /api/publishing',
            'GET /api/publishing/health',
            'GET /api/publishing/authors',
            'GET /api/publishing/publications'
        ]
    });
});

module.exports = router;
