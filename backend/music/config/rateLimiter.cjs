/**
 * Rate Limiter Configuration for Music Distribution Module
 * Limity requestów API (antyspam, ochrona)
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Redis client for distributed rate limiting (optional)
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

// Custom key generator
const generateKey = (req) => {
  // Use user ID if authenticated, otherwise IP
  const userId = req.user?.id;
  const ip = req.ip || req.connection.remoteAddress;
  
  return userId ? `user:${userId}` : `ip:${ip}`;
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
  const isAuthenticated = !!req.user;
  
  res.status(429).json({
    error: 'Too many requests',
    message: isAuthenticated 
      ? 'Rate limit exceeded for your account. Please try again later.'
      : 'Rate limit exceeded for your IP address. Please try again later.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    service: 'music-distribution'
  });
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Higher limits for authenticated users
    return req.user ? 1000 : 100;
  },
  keyGenerator: generateKey,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }) : undefined,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many API requests',
    service: 'music-distribution'
  }
});

// Upload rate limiter (more restrictive)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Different limits based on user tier
    if (req.user?.tier === 'premium') return 100;
    if (req.user?.tier === 'pro') return 50;
    return req.user ? 20 : 5;
  },
  keyGenerator: generateKey,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }) : undefined,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

// Distribution rate limiter (very restrictive)
const distributionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    // Daily distribution limits
    if (req.user?.tier === 'premium') return 50;
    if (req.user?.tier === 'pro') return 20;
    return req.user ? 10 : 1;
  },
  keyGenerator: generateKey,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }) : undefined,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false
});

// Analytics rate limiter
const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req) => {
    return req.user ? 200 : 20;
  },
  keyGenerator: generateKey,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }) : undefined,
  handler: rateLimitHandler
});

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: (req) => {
    return req.user ? 100 : 10;
  },
  delayMs: 500, // Start with 500ms delay
  maxDelayMs: 20000, // Max 20 second delay
  keyGenerator: generateKey
});

// Authentication rate limiter (for login attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login attempts from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      service: 'music-distribution'
    });
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset attempts',
      message: 'Too many password reset attempts from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
      service: 'music-distribution'
    });
  }
});

// Royalty calculation rate limiter
const royaltyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: (req) => {
    // Royalty calculations are resource-intensive
    if (req.user?.tier === 'premium') return 20;
    if (req.user?.tier === 'pro') return 10;
    return req.user ? 5 : 1;
  },
  keyGenerator: generateKey,
  handler: rateLimitHandler
});

module.exports = {
  api: apiLimiter,
  upload: uploadLimiter,
  distribution: distributionLimiter,
  analytics: analyticsLimiter,
  speed: speedLimiter,
  auth: authLimiter,
  passwordReset: passwordResetLimiter,
  royalty: royaltyLimiter,
  
  // Helper function to create custom rate limiter
  createCustomLimiter: (options) => {
    return rateLimit({
      store: redisClient ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args)
      }) : undefined,
      keyGenerator: generateKey,
      handler: rateLimitHandler,
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    });
  },
  
  // Get current rate limit status
  getStatus: async (req) => {
    const key = generateKey(req);
    
    if (redisClient) {
      try {
        const count = await redisClient.get(`rl:${key}`);
        return {
          key,
          current: parseInt(count) || 0,
          remaining: Math.max(0, 100 - (parseInt(count) || 0))
        };
      } catch (error) {
        console.error('Error getting rate limit status:', error);
        return null;
      }
    }
    
    return null;
  }
};
