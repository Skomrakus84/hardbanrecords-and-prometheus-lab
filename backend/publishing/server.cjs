const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');

// Import configurations
const config = require('./config/env.cjs');
const logger = require('./config/logger.cjs');
const rateLimiter = require('./config/rateLimiter.cjs');
const corsConfig = require('./config/cors.cjs');

// Import middleware
const authMiddleware = require('../middleware/auth.cjs');
const errorHandler = require('../middleware/errorHandler.cjs');

// Import routes
const authorsRoutes = require('./routes/authors.cjs');
const publicationsRoutes = require('./routes/publications.cjs');
const collaborationsRoutes = require('./routes/collaborations.cjs');
const salesRoutes = require('./routes/sales.cjs');
const distributionRoutes = require('./routes/distribution.cjs');
const adminRoutes = require('./routes/admin.cjs');

class PublishingServer {
    constructor() {
        this.app = express();
        this.supabase = null;
        this.server = null;
        
        this.initializeSupabase();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    initializeSupabase() {
        try {
            this.supabase = createClient(
                config.SUPABASE_URL,
                config.SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: false
                    },
                    global: {
                        headers: {
                            'X-Client-Info': 'hardban-publishing-server'
                        }
                    }
                }
            );

            // Attach Supabase client to app for use in routes
            this.app.locals.supabase = this.supabase;
            
            logger.info('Publishing Server: Supabase client initialized successfully');
        } catch (error) {
            logger.error('Publishing Server: Failed to initialize Supabase', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", config.SUPABASE_URL]
                }
            },
            crossOriginEmbedderPolicy: false
        }));

        // CORS
        this.app.use(cors(corsConfig));

        // Compression
        this.app.use(compression());

        // Rate limiting
        this.app.use('/api/publishing', rateLimiter.publishingApi);
        this.app.use('/api/publishing/upload', rateLimiter.fileUpload);
        this.app.use('/api/publishing/auth', rateLimiter.authentication);

        // Body parsing
        this.app.use(express.json({ 
            limit: '50mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: '50mb' 
        }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.info('Publishing API Request', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            });
            next();
        });

        // Add request ID for tracking
        this.app.use((req, res, next) => {
            req.requestId = require('crypto').randomUUID();
            res.setHeader('X-Request-ID', req.requestId);
            next();
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                service: 'publishing-server',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0',
                environment: config.NODE_ENV
            });
        });

        // Publishing API routes
        this.app.use('/api/publishing/authors', authMiddleware, authorsRoutes);
        this.app.use('/api/publishing/publications', authMiddleware, publicationsRoutes);
        this.app.use('/api/publishing/collaborations', authMiddleware, collaborationsRoutes);
        this.app.use('/api/publishing/sales', authMiddleware, salesRoutes);
        this.app.use('/api/publishing/distribution', authMiddleware, distributionRoutes);
        this.app.use('/api/publishing/admin', authMiddleware, adminRoutes);

        // API documentation route
        this.app.get('/api/publishing/docs', (req, res) => {
            res.json({
                name: 'HardbanRecords Publishing API',
                version: '1.0.0',
                description: 'Digital Publishing and Distribution Management System',
                endpoints: {
                    authors: '/api/publishing/authors',
                    publications: '/api/publishing/publications',
                    collaborations: '/api/publishing/collaborations',
                    sales: '/api/publishing/sales',
                    distribution: '/api/publishing/distribution',
                    admin: '/api/publishing/admin'
                },
                features: [
                    'Multi-format publishing (EPUB, PDF, Audiobook)',
                    'DRM and territorial rights management',
                    'Multi-store distribution',
                    'Royalty tracking and reporting',
                    'Collaborative authoring',
                    'Version control for publications',
                    'ISBN management',
                    'BISAC categorization'
                ]
            });
        });

        // 404 handler for unmatched routes
        this.app.use('*', (req, res) => {
            logger.warn('Publishing Server: Route not found', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            });
            res.status(404).json({
                error: 'Route not found',
                message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
                availableEndpoints: [
                    'GET /health',
                    'GET /api/publishing/docs',
                    'POST /api/publishing/authors',
                    'GET /api/publishing/publications',
                    'POST /api/publishing/publications'
                ]
            });
        });
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use(errorHandler);

        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            logger.info('Publishing Server: SIGTERM received, shutting down gracefully');
            this.shutdown();
        });

        process.on('SIGINT', () => {
            logger.info('Publishing Server: SIGINT received, shutting down gracefully');
            this.shutdown();
        });

        process.on('uncaughtException', (error) => {
            logger.error('Publishing Server: Uncaught Exception', {
                error: error.message,
                stack: error.stack
            });
            this.shutdown(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Publishing Server: Unhandled Promise Rejection', {
                reason: reason,
                promise: promise
            });
        });
    }

    async start(port = config.PUBLISHING_PORT || 3003) {
        try {
            // Test database connection
            const { data, error } = await this.supabase
                .from('authors')
                .select('count')
                .limit(1);

            if (error && !error.message.includes('relation "authors" does not exist')) {
                throw new Error(`Database connection failed: ${error.message}`);
            }

            this.server = this.app.listen(port, () => {
                logger.info('Publishing Server started successfully', {
                    port: port,
                    environment: config.NODE_ENV,
                    timestamp: new Date().toISOString(),
                    processId: process.pid
                });
            });

            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    logger.error(`Publishing Server: Port ${port} is already in use`);
                    process.exit(1);
                } else {
                    logger.error('Publishing Server: Server error', {
                        error: error.message,
                        stack: error.stack
                    });
                }
            });

        } catch (error) {
            logger.error('Publishing Server: Failed to start', {
                error: error.message,
                stack: error.stack,
                port: port
            });
            process.exit(1);
        }
    }

    async shutdown(exitCode = 0) {
        logger.info('Publishing Server: Starting graceful shutdown...');

        if (this.server) {
            this.server.close(() => {
                logger.info('Publishing Server: HTTP server closed');
                process.exit(exitCode);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Publishing Server: Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(exitCode);
        }
    }

    getApp() {
        return this.app;
    }

    getSupabase() {
        return this.supabase;
    }
}

// Start server if this file is run directly
if (require.main === module) {
    const publishingServer = new PublishingServer();
    publishingServer.start();
}

module.exports = PublishingServer;
