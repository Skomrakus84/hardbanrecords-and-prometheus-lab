const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { createClient } = require('@supabase/supabase-js');

// Import configurations
const config = require('./config/env.cjs');
const logger = require('./config/logger.cjs');
const corsConfig = require('./config/cors.cjs');
const rateLimiter = require('./config/rateLimiter.cjs');

// Import middleware
const authMiddleware = require('../middleware/auth.cjs');
const validateMiddleware = require('../middleware/validate.cjs');
const errorHandler = require('../middleware/errorHandler.cjs');

/**
 * Publishing Application Class
 * Manages the Publishing module's Express application configuration
 */
class PublishingApp {
    constructor() {
        this.app = express();
        this.supabase = null;
        this.isInitialized = false;
        
        this.initializeServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        
        this.isInitialized = true;
        logger.info('Publishing App initialized successfully');
    }

    /**
     * Initialize external services (Supabase, Redis, etc.)
     */
    initializeServices() {
        try {
            // Initialize Supabase client
            this.supabase = createClient(
                config.SUPABASE_URL,
                config.SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: false,
                        detectSessionInUrl: false
                    },
                    global: {
                        headers: {
                            'X-Client-Info': 'hardban-publishing-app',
                            'X-Client-Version': '1.0.0'
                        }
                    },
                    db: {
                        schema: 'public'
                    }
                }
            );

            // Attach Supabase to app locals for route access
            this.app.locals.supabase = this.supabase;
            this.app.locals.config = config;
            this.app.locals.logger = logger;

            logger.info('Publishing App: External services initialized', {
                supabaseUrl: config.SUPABASE_URL,
                environment: config.NODE_ENV
            });

        } catch (error) {
            logger.error('Publishing App: Failed to initialize services', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Setup Express middleware stack
     */
    setupMiddleware() {
        // Trust proxy if configured
        if (config.SECURITY.trustProxy) {
            this.app.set('trust proxy', 1);
        }

        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: config.SECURITY.enableCSP ? {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:", config.SUPABASE_URL],
                    connectSrc: ["'self'", config.SUPABASE_URL],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    workerSrc: ["'self'"],
                    childSrc: ["'none'"],
                    formAction: ["'self'"],
                    upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null
                }
            } : false,
            crossOriginEmbedderPolicy: false,
            hsts: config.SECURITY.enableHSTS ? {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            } : false
        }));

        // CORS middleware with custom configuration
        this.app.use((req, res, next) => {
            corsConfig.middleware(req, res, next);
        });

        // Compression middleware
        this.app.use(compression({
            level: 6,
            threshold: 1024,
            filter: (req, res) => {
                // Don't compress if the request is a Server-Sent Event
                if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
                    return false;
                }
                return compression.filter(req, res);
            }
        }));

        // Request parsing middleware
        this.app.use(express.json({
            limit: '50mb',
            verify: (req, res, buf, encoding) => {
                // Store raw body for webhook signature verification
                if (req.path.includes('/webhook')) {
                    req.rawBody = buf;
                }
            }
        }));

        this.app.use(express.urlencoded({
            extended: true,
            limit: '50mb'
        }));

        // Request ID and timestamp middleware
        this.app.use((req, res, next) => {
            req.requestId = require('crypto').randomUUID();
            req.timestamp = new Date().toISOString();
            
            res.setHeader('X-Request-ID', req.requestId);
            res.setHeader('X-Timestamp', req.timestamp);
            
            next();
        });

        // Request logging middleware
        this.app.use((req, res, next) => {
            const startTime = Date.now();

            // Log request
            logger.api.request(
                req.method,
                req.originalUrl,
                req.user?.id,
                req.ip,
                req.get('User-Agent'),
                {
                    requestId: req.requestId,
                    body: req.method !== 'GET' ? req.body : undefined,
                    query: req.query,
                    params: req.params
                }
            );

            // Log response
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                
                logger.api.response(
                    req.method,
                    req.originalUrl,
                    res.statusCode,
                    responseTime,
                    {
                        requestId: req.requestId,
                        contentLength: res.get('Content-Length'),
                        userAgent: req.get('User-Agent')
                    }
                );
            });

            next();
        });

        // Rate limiting middleware
        this.app.use(rateLimiter.addRateLimitHeaders);

        // Attach logger to request object
        this.app.use(logger.middleware);

        logger.info('Publishing App: Middleware configured successfully');
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        // Health check route
        this.app.get('/health', (req, res) => {
            const healthCheck = {
                status: 'healthy',
                service: 'publishing-app',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.env.npm_package_version || '1.0.0',
                environment: config.NODE_ENV,
                features: {
                    supabase: !!this.supabase,
                    redis: !!rateLimiter.redisClient,
                    drmProviders: Object.keys(config.DRM_PROVIDERS).filter(
                        key => config.DRM_PROVIDERS[key].enabled
                    ),
                    storeChannels: Object.keys(config).filter(
                        key => key.includes('_') && config[key]?.enabled
                    )
                }
            };

            logger.system.healthCheck('healthy', {
                requestId: req.requestId,
                uptime: healthCheck.uptime,
                memory: healthCheck.memory
            });

            res.status(200).json(healthCheck);
        });

        // API documentation route
        this.app.get('/api/publishing', (req, res) => {
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
                    collaborations: {
                        base: '/api/publishing/collaborations',
                        methods: ['GET', 'POST', 'PUT', 'DELETE'],
                        description: 'Collaborative authoring and permissions'
                    },
                    distribution: {
                        base: '/api/publishing/distribution',
                        methods: ['GET', 'POST', 'PUT'],
                        description: 'Multi-store distribution management'
                    },
                    sales: {
                        base: '/api/publishing/sales',
                        methods: ['GET', 'POST'],
                        description: 'Sales reporting and royalty tracking'
                    },
                    formats: {
                        base: '/api/publishing/formats',
                        methods: ['GET', 'POST'],
                        description: 'Format conversion and management'
                    },
                    drm: {
                        base: '/api/publishing/drm',
                        methods: ['GET', 'POST', 'PUT'],
                        description: 'DRM policy management'
                    },
                    admin: {
                        base: '/api/publishing/admin',
                        methods: ['GET', 'POST', 'PUT', 'DELETE'],
                        description: 'Administrative operations'
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

        // Import and use route modules
        const authorsRoutes = require('./routes/authors.cjs');
        const publicationsRoutes = require('./routes/publications.cjs');
        const collaborationsRoutes = require('./routes/collaborations.cjs');
        const distributionRoutes = require('./routes/distribution.cjs');
        const salesRoutes = require('./routes/sales.cjs');
        const formatsRoutes = require('./routes/formats.cjs');
        const drmRoutes = require('./routes/drm.cjs');
        const adminRoutes = require('./routes/admin.cjs');
        const webhookRoutes = require('./routes/webhooks.cjs');

        // Apply authentication middleware to protected routes
        this.app.use('/api/publishing/authors', authMiddleware, authorsRoutes);
        this.app.use('/api/publishing/publications', authMiddleware, publicationsRoutes);
        this.app.use('/api/publishing/collaborations', authMiddleware, collaborationsRoutes);
        this.app.use('/api/publishing/distribution', authMiddleware, distributionRoutes);
        this.app.use('/api/publishing/sales', authMiddleware, salesRoutes);
        this.app.use('/api/publishing/formats', authMiddleware, formatsRoutes);
        this.app.use('/api/publishing/drm', authMiddleware, drmRoutes);
        this.app.use('/api/publishing/admin', authMiddleware, adminRoutes);
        
        // Webhook routes (no auth required, but with signature verification)
        this.app.use('/api/publishing/webhooks', webhookRoutes);

        // 404 handler for unmatched routes
        this.app.use('*', (req, res) => {
            logger.warn('Publishing App: Route not found', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId
            });

            res.status(404).json({
                error: 'Route Not Found',
                message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
                requestId: req.requestId,
                timestamp: req.timestamp,
                availableEndpoints: [
                    'GET /health',
                    'GET /api/publishing',
                    'GET /api/publishing/authors',
                    'POST /api/publishing/publications',
                    'GET /api/publishing/distribution'
                ]
            });
        });

        logger.info('Publishing App: Routes configured successfully');
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            // Log the error
            logger.api.error(req.method, req.originalUrl, error, {
                requestId: req.requestId,
                userId: req.user?.id,
                stack: error.stack
            });

            // Call the standard error handler
            errorHandler(error, req, res, next);
        });

        logger.info('Publishing App: Error handling configured successfully');
    }

    /**
     * Get the Express app instance
     */
    getApp() {
        return this.app;
    }

    /**
     * Get the Supabase client instance
     */
    getSupabase() {
        return this.supabase;
    }

    /**
     * Check if the app is properly initialized
     */
    isReady() {
        return this.isInitialized && this.supabase !== null;
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        logger.info('Publishing App: Starting graceful shutdown...');
        
        try {
            // Close Redis connections if they exist
            if (rateLimiter.redisClient) {
                await rateLimiter.redisClient.quit();
                logger.info('Publishing App: Redis connections closed');
            }

            logger.info('Publishing App: Graceful shutdown completed');
        } catch (error) {
            logger.error('Publishing App: Error during shutdown', {
                error: error.message,
                stack: error.stack
            });
        }
    }
}

module.exports = PublishingApp;
