const config = require('./env.cjs');

/**
 * CORS Configuration for Publishing Module
 * Enhanced security with domain validation and publishing-specific origins
 */

// Publishing-specific allowed origins
const publishingOrigins = [
    'http://localhost:3000',  // Development frontend
    'http://localhost:3001',  // Alternative dev port
    'https://hardbanrecords.com',
    'https://www.hardbanrecords.com',
    'https://publishing.hardbanrecords.com',  // Publishing subdomain
    'https://authors.hardbanrecords.com',     // Authors portal
    'https://admin.hardbanrecords.com'        // Admin panel
];

// Merge with environment-specific origins
const allowedOrigins = [
    ...publishingOrigins,
    ...config.CORS.origins
];

// Dynamic origin validation function
const originValidator = (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
        return callback(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    // Allow localhost in development
    if (config.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
    }

    // Allow any subdomain of hardbanrecords.com in production
    if (config.NODE_ENV === 'production' && origin.endsWith('.hardbanrecords.com')) {
        return callback(null, true);
    }

    // Log rejected origin for security monitoring
    const logger = require('./logger.cjs');
    logger.security.suspiciousActivity(null, 'Rejected CORS origin', origin, {
        origin,
        allowedOrigins,
        environment: config.NODE_ENV
    });

    const error = new Error(`CORS policy violation: Origin ${origin} is not allowed`);
    error.statusCode = 403;
    callback(error, false);
};

// CORS configuration object
const corsConfig = {
    origin: originValidator,
    methods: config.CORS.methods,
    allowedHeaders: [
        ...config.CORS.allowedHeaders,
        'X-Publication-ID',        // Publishing-specific headers
        'X-Author-ID',
        'X-Store-Channel',
        'X-Format-Type',
        'X-DRM-Policy'
    ],
    exposedHeaders: [
        'X-Request-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Total-Count',           // For pagination
        'X-Publication-Status',    // Publishing-specific exposed headers
        'X-Conversion-Status',
        'X-Distribution-Status'
    ],
    credentials: config.CORS.credentials,
    maxAge: 86400, // 24 hours - cache preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 200,

    // Custom handling for specific routes
    middleware: (req, res, next) => {
        // Additional security headers for publishing routes
        if (req.path.startsWith('/api/publishing')) {
            // Content Security Policy for publishing API
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; " +
                "connect-src 'self' " + config.SUPABASE_URL + " " +
                "https://*.hardbanrecords.com; " +
                "img-src 'self' data: https:; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'"
            );

            // Prevent iframe embedding
            res.setHeader('X-Frame-Options', 'DENY');
            
            // Prevent MIME type sniffing
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            // Enable XSS protection
            res.setHeader('X-XSS-Protection', '1; mode=block');
            
            // Referrer policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        }

        // Specific handling for file upload routes
        if (req.path.includes('/upload')) {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            res.setHeader('Access-Control-Allow-Headers', 
                req.headers['access-control-request-headers'] || 
                'Content-Type, Authorization, X-Requested-With, X-File-Type, X-File-Size'
            );
        }

        // Handle store integration webhooks
        if (req.path.includes('/webhook')) {
            // Allow webhook calls from store partners
            const webhookOrigins = [
                'https://kdp.amazon.com',
                'https://partner.apple.com',
                'https://books.google.com',
                'https://www.kobo.com',
                'https://partner-api.empik.com'
            ];
            
            const webhookOrigin = req.get('Origin') || req.get('Referer');
            if (webhookOrigin && webhookOrigins.some(origin => webhookOrigin.startsWith(origin))) {
                res.setHeader('Access-Control-Allow-Origin', webhookOrigin);
            }
        }

        next();
    }
};

// Enhanced CORS configuration for different environments
const environmentConfigs = {
    development: {
        ...corsConfig,
        // More permissive in development
        origin: (origin, callback) => {
            // Allow all localhost origins in development
            if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
            return originValidator(origin, callback);
        },
        credentials: true,
        // Log all CORS requests in development
        middleware: (req, res, next) => {
            if (req.method === 'OPTIONS') {
                const logger = require('./logger.cjs');
                logger.debug('CORS preflight request', {
                    origin: req.get('Origin'),
                    method: req.get('Access-Control-Request-Method'),
                    headers: req.get('Access-Control-Request-Headers')
                });
            }
            corsConfig.middleware(req, res, next);
        }
    },

    production: {
        ...corsConfig,
        // Stricter in production
        origin: originValidator,
        credentials: true,
        // Additional security in production
        middleware: (req, res, next) => {
            // Strict Transport Security
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            // Expect-CT header
            res.setHeader('Expect-CT', 'max-age=86400, enforce');
            
            corsConfig.middleware(req, res, next);
        }
    },

    test: {
        ...corsConfig,
        // Permissive for testing
        origin: true,
        credentials: false,
        middleware: (req, res, next) => next()
    }
};

// Export configuration based on environment
module.exports = environmentConfigs[config.NODE_ENV] || corsConfig;
