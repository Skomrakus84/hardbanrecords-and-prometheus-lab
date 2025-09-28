const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const config = require('./env.cjs');
const logger = require('./logger.cjs');

// Initialize Redis client for rate limiting
let redisClient;
try {
    redisClient = new Redis({
        host: config.REDIS_URL.includes('://') ? 
            new URL(config.REDIS_URL).hostname : 
            config.REDIS_URL.split(':')[0],
        port: config.REDIS_URL.includes('://') ? 
            new URL(config.REDIS_URL).port : 
            parseInt(config.REDIS_URL.split(':')[1] || '6379'),
        password: config.REDIS_PASSWORD,
        db: config.REDIS_DB,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
    });

    redisClient.on('error', (error) => {
        logger.error('Redis connection error for rate limiting', {
            error: error.message,
            stack: error.stack
        });
    });

    redisClient.on('connect', () => {
        logger.info('Redis connected for rate limiting');
    });
} catch (error) {
    logger.warn('Failed to initialize Redis for rate limiting, falling back to memory store', {
        error: error.message
    });
    redisClient = null;
}

// Custom key generator for more granular rate limiting
const customKeyGenerator = (req, suffix = '') => {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent')?.substring(0, 50) || 'unknown';
    
    return `publishing:${userId}:${ip}:${userAgent}${suffix ? `:${suffix}` : ''}`;
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
    const retryAfter = Math.ceil(req.rateLimit.resetTime / 1000);
    
    logger.security.rateLimitExceeded(
        req.ip,
        req.originalUrl,
        req.rateLimit.limit,
        {
            userId: req.user?.id,
            userAgent: req.get('User-Agent'),
            remaining: req.rateLimit.remaining,
            resetTime: req.rateLimit.resetTime
        }
    );

    res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: retryAfter,
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
    });
};

// Standard rate limiting configuration
const createRateLimiter = (options) => {
    const config = {
        windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
        max: options.max || 100,
        message: options.message || {
            error: 'Too many requests',
            message: 'Rate limit exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: options.keyGenerator || ((req) => customKeyGenerator(req, options.suffix)),
        handler: options.handler || rateLimitHandler,
        skip: (req) => {
            // Skip rate limiting for health checks
            if (req.path === '/health') return true;
            
            // Skip for admins in development
            if (config.NODE_ENV === 'development' && req.user?.role === 'admin') {
                return true;
            }
            
            return false;
        },
        ...options
    };

    // Use Redis store if available
    if (redisClient && options.useRedis !== false) {
        config.store = new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
            prefix: 'rl:publishing:'
        });
    }

    return rateLimit(config);
};

// Publishing API general rate limiter
const publishingApi = createRateLimiter({
    windowMs: config.RATE_LIMITS.general.windowMs,
    max: config.RATE_LIMITS.general.max,
    suffix: 'api',
    message: {
        error: 'Too many API requests',
        message: 'You have exceeded the API rate limit. Please wait before making more requests.',
        type: 'RATE_LIMIT_API'
    }
});

// File upload rate limiter (more restrictive)
const fileUpload = createRateLimiter({
    windowMs: config.RATE_LIMITS.upload.windowMs,
    max: config.RATE_LIMITS.upload.max,
    suffix: 'upload',
    message: {
        error: 'Too many upload requests',
        message: 'You have exceeded the file upload rate limit. Please wait before uploading more files.',
        type: 'RATE_LIMIT_UPLOAD'
    },
    keyGenerator: (req) => {
        // More restrictive key for uploads (user + file type)
        const fileType = req.headers['x-file-type'] || 'unknown';
        return customKeyGenerator(req, `upload:${fileType}`);
    }
});

// Authentication rate limiter (very restrictive)
const authentication = createRateLimiter({
    windowMs: config.RATE_LIMITS.auth.windowMs,
    max: config.RATE_LIMITS.auth.max,
    suffix: 'auth',
    message: {
        error: 'Too many authentication attempts',
        message: 'Too many login attempts. Please wait before trying again.',
        type: 'RATE_LIMIT_AUTH'
    },
    keyGenerator: (req) => {
        // Use IP for auth attempts
        return `publishing:auth:${req.ip}`;
    }
});

// Publication operations rate limiter
const publicationOps = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 publication operations per hour
    suffix: 'pub-ops',
    message: {
        error: 'Too many publication operations',
        message: 'You have exceeded the publication operations limit. Please wait before performing more operations.',
        type: 'RATE_LIMIT_PUBLICATION'
    }
});

// Store submission rate limiter
const storeSubmission = createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 submissions per day per user
    suffix: 'store-submit',
    message: {
        error: 'Too many store submissions',
        message: 'You have exceeded the daily store submission limit. Please wait 24 hours.',
        type: 'RATE_LIMIT_STORE_SUBMISSION'
    }
});

// Format conversion rate limiter
const formatConversion = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 conversions per hour
    suffix: 'conversion',
    message: {
        error: 'Too many format conversion requests',
        message: 'You have exceeded the format conversion limit. Please wait before converting more files.',
        type: 'RATE_LIMIT_CONVERSION'
    }
});

// Collaboration operations rate limiter
const collaboration = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 collaboration operations per hour
    suffix: 'collab',
    message: {
        error: 'Too many collaboration requests',
        message: 'You have exceeded the collaboration operations limit.',
        type: 'RATE_LIMIT_COLLABORATION'
    }
});

// Sales report access rate limiter
const salesReports = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 report requests per hour
    suffix: 'sales-reports',
    message: {
        error: 'Too many sales report requests',
        message: 'You have exceeded the sales report access limit.',
        type: 'RATE_LIMIT_SALES_REPORTS'
    }
});

// Admin operations rate limiter
const adminOps = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // Higher limit for admin operations
    suffix: 'admin',
    message: {
        error: 'Too many admin operations',
        message: 'Admin operation rate limit exceeded.',
        type: 'RATE_LIMIT_ADMIN'
    },
    keyGenerator: (req) => {
        // Admin rate limiting by user ID only
        return `publishing:admin:${req.user?.id || req.ip}`;
    }
});

// Webhook rate limiter (for external store callbacks)
const webhook = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 webhook calls per minute
    suffix: 'webhook',
    useRedis: false, // Use memory store for webhooks (faster)
    keyGenerator: (req) => {
        // Rate limit webhooks by source IP and store
        const store = req.headers['x-store-channel'] || 'unknown';
        return `publishing:webhook:${req.ip}:${store}`;
    },
    message: {
        error: 'Webhook rate limit exceeded',
        message: 'Too many webhook requests from this source.',
        type: 'RATE_LIMIT_WEBHOOK'
    }
});

// Dynamic rate limiter based on user subscription tier
const dynamicRateLimit = (req, res, next) => {
    const userTier = req.user?.subscriptionTier || 'free';
    
    const tierLimits = {
        free: { windowMs: 60 * 60 * 1000, max: 50 },      // 50/hour
        basic: { windowMs: 60 * 60 * 1000, max: 200 },    // 200/hour
        premium: { windowMs: 60 * 60 * 1000, max: 500 },  // 500/hour
        enterprise: { windowMs: 60 * 60 * 1000, max: 2000 } // 2000/hour
    };

    const limits = tierLimits[userTier] || tierLimits.free;
    
    const dynamicLimiter = createRateLimiter({
        ...limits,
        suffix: `tier-${userTier}`,
        message: {
            error: 'Tier-based rate limit exceeded',
            message: `You have exceeded the rate limit for your ${userTier} subscription tier.`,
            type: 'RATE_LIMIT_TIER',
            tier: userTier,
            upgradeAvailable: userTier !== 'enterprise'
        }
    });

    dynamicLimiter(req, res, next);
};

// Middleware to add rate limit headers
const addRateLimitHeaders = (req, res, next) => {
    res.on('finish', () => {
        if (req.rateLimit) {
            res.setHeader('X-RateLimit-Limit', req.rateLimit.limit);
            res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
            res.setHeader('X-RateLimit-Reset', new Date(req.rateLimit.resetTime).toISOString());
        }
    });
    next();
};

module.exports = {
    // Standard rate limiters
    publishingApi,
    fileUpload,
    authentication,
    publicationOps,
    storeSubmission,
    formatConversion,
    collaboration,
    salesReports,
    adminOps,
    webhook,
    
    // Dynamic rate limiting
    dynamicRateLimit,
    
    // Utilities
    addRateLimitHeaders,
    createRateLimiter,
    customKeyGenerator,
    
    // Redis client for other uses
    redisClient
};
