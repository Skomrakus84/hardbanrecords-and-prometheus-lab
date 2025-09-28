const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./env.cjs');

// Ensure logs directory exists
const logsDir = path.dirname(config.LOGGING.file.path);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for publishing logs
const publishingFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, service = 'publishing', ...meta }) => {
        const logEntry = {
            timestamp,
            level,
            service,
            message,
            ...meta
        };
        
        // Add request context if available
        if (meta.requestId) {
            logEntry.requestId = meta.requestId;
        }
        
        // Add user context if available
        if (meta.userId) {
            logEntry.userId = meta.userId;
        }
        
        // Add publication context if available
        if (meta.publicationId) {
            logEntry.publicationId = meta.publicationId;
        }
        
        return JSON.stringify(logEntry);
    })
);

// Simple format for console output in development
const simpleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, service = 'publishing', ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = ` ${JSON.stringify(meta)}`;
        }
        return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
    })
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: config.LOGGING.level,
    format: config.NODE_ENV === 'development' ? simpleFormat : publishingFormat,
    defaultMeta: {
        service: 'publishing'
    },
    transports: []
});

// Add console transport
logger.add(new winston.transports.Console({
    format: config.NODE_ENV === 'development' ? simpleFormat : publishingFormat,
    silent: config.NODE_ENV === 'test'
}));

// Add file transport if enabled
if (config.LOGGING.file.enabled) {
    logger.add(new winston.transports.File({
        filename: config.LOGGING.file.path,
        maxsize: config.LOGGING.file.maxSize,
        maxFiles: config.LOGGING.file.maxFiles,
        format: publishingFormat
    }));
    
    // Separate error log
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'publishing-error.log'),
        level: 'error',
        maxsize: config.LOGGING.file.maxSize,
        maxFiles: config.LOGGING.file.maxFiles,
        format: publishingFormat
    }));
}

// Database logging transport (if enabled)
if (config.LOGGING.database.enabled) {
    const DatabaseTransport = require('./transports/database.cjs');
    logger.add(new DatabaseTransport({
        level: config.LOGGING.database.level,
        supabaseUrl: config.SUPABASE_URL,
        supabaseKey: config.SUPABASE_SERVICE_ROLE_KEY
    }));
}

// Enhanced logging functions with publishing-specific context
const publishingLogger = {
    // Basic logging methods
    error: (message, meta = {}) => logger.error(message, { ...meta, category: 'error' }),
    warn: (message, meta = {}) => logger.warn(message, { ...meta, category: 'warning' }),
    info: (message, meta = {}) => logger.info(message, { ...meta, category: 'info' }),
    debug: (message, meta = {}) => logger.debug(message, { ...meta, category: 'debug' }),
    
    // Publishing-specific logging methods
    
    // Author operations
    author: {
        created: (authorId, authorName, meta = {}) => {
            logger.info('Author created', {
                ...meta,
                category: 'author',
                action: 'created',
                authorId,
                authorName
            });
        },
        updated: (authorId, authorName, changes, meta = {}) => {
            logger.info('Author updated', {
                ...meta,
                category: 'author',
                action: 'updated',
                authorId,
                authorName,
                changes
            });
        },
        deleted: (authorId, authorName, meta = {}) => {
            logger.warn('Author deleted', {
                ...meta,
                category: 'author',
                action: 'deleted',
                authorId,
                authorName
            });
        }
    },
    
    // Publication operations
    publication: {
        created: (publicationId, title, authorId, meta = {}) => {
            logger.info('Publication created', {
                ...meta,
                category: 'publication',
                action: 'created',
                publicationId,
                title,
                authorId
            });
        },
        updated: (publicationId, title, changes, meta = {}) => {
            logger.info('Publication updated', {
                ...meta,
                category: 'publication',
                action: 'updated',
                publicationId,
                title,
                changes
            });
        },
        statusChanged: (publicationId, title, oldStatus, newStatus, meta = {}) => {
            logger.info('Publication status changed', {
                ...meta,
                category: 'publication',
                action: 'status_changed',
                publicationId,
                title,
                oldStatus,
                newStatus
            });
        },
        published: (publicationId, title, stores, meta = {}) => {
            logger.info('Publication published', {
                ...meta,
                category: 'publication',
                action: 'published',
                publicationId,
                title,
                stores
            });
        },
        formatConverted: (publicationId, fromFormat, toFormat, status, meta = {}) => {
            logger.info('Publication format converted', {
                ...meta,
                category: 'publication',
                action: 'format_converted',
                publicationId,
                fromFormat,
                toFormat,
                status
            });
        }
    },
    
    // Distribution operations
    distribution: {
        submitted: (publicationId, store, meta = {}) => {
            logger.info('Publication submitted to store', {
                ...meta,
                category: 'distribution',
                action: 'submitted',
                publicationId,
                store
            });
        },
        approved: (publicationId, store, externalId, meta = {}) => {
            logger.info('Publication approved by store', {
                ...meta,
                category: 'distribution',
                action: 'approved',
                publicationId,
                store,
                externalId
            });
        },
        rejected: (publicationId, store, reason, meta = {}) => {
            logger.warn('Publication rejected by store', {
                ...meta,
                category: 'distribution',
                action: 'rejected',
                publicationId,
                store,
                reason
            });
        },
        live: (publicationId, store, externalId, meta = {}) => {
            logger.info('Publication went live on store', {
                ...meta,
                category: 'distribution',
                action: 'live',
                publicationId,
                store,
                externalId
            });
        }
    },
    
    // Sales operations
    sales: {
        reported: (publicationId, store, unitsSold, revenue, period, meta = {}) => {
            logger.info('Sales data reported', {
                ...meta,
                category: 'sales',
                action: 'reported',
                publicationId,
                store,
                unitsSold,
                revenue,
                period
            });
        },
        royaltyCalculated: (authorId, amount, period, meta = {}) => {
            logger.info('Royalty calculated', {
                ...meta,
                category: 'sales',
                action: 'royalty_calculated',
                authorId,
                amount,
                period
            });
        },
        paymentProcessed: (authorId, amount, method, transactionId, meta = {}) => {
            logger.info('Royalty payment processed', {
                ...meta,
                category: 'sales',
                action: 'payment_processed',
                authorId,
                amount,
                method,
                transactionId
            });
        }
    },
    
    // Collaboration operations
    collaboration: {
        invited: (publicationId, collaboratorEmail, role, meta = {}) => {
            logger.info('Collaborator invited', {
                ...meta,
                category: 'collaboration',
                action: 'invited',
                publicationId,
                collaboratorEmail,
                role
            });
        },
        accepted: (publicationId, collaboratorId, role, meta = {}) => {
            logger.info('Collaboration accepted', {
                ...meta,
                category: 'collaboration',
                action: 'accepted',
                publicationId,
                collaboratorId,
                role
            });
        },
        permissionChanged: (publicationId, collaboratorId, oldPermissions, newPermissions, meta = {}) => {
            logger.info('Collaboration permissions changed', {
                ...meta,
                category: 'collaboration',
                action: 'permission_changed',
                publicationId,
                collaboratorId,
                oldPermissions,
                newPermissions
            });
        }
    },
    
    // DRM operations
    drm: {
        applied: (publicationId, drmType, settings, meta = {}) => {
            logger.info('DRM applied to publication', {
                ...meta,
                category: 'drm',
                action: 'applied',
                publicationId,
                drmType,
                settings
            });
        },
        removed: (publicationId, drmType, meta = {}) => {
            logger.info('DRM removed from publication', {
                ...meta,
                category: 'drm',
                action: 'removed',
                publicationId,
                drmType
            });
        }
    },
    
    // API operations
    api: {
        request: (method, endpoint, userId, ip, userAgent, meta = {}) => {
            logger.info('API request', {
                ...meta,
                category: 'api',
                action: 'request',
                method,
                endpoint,
                userId,
                ip,
                userAgent
            });
        },
        response: (method, endpoint, statusCode, responseTime, meta = {}) => {
            logger.info('API response', {
                ...meta,
                category: 'api',
                action: 'response',
                method,
                endpoint,
                statusCode,
                responseTime
            });
        },
        error: (method, endpoint, error, meta = {}) => {
            logger.error('API error', {
                ...meta,
                category: 'api',
                action: 'error',
                method,
                endpoint,
                error: error.message,
                stack: error.stack
            });
        }
    },
    
    // Security operations
    security: {
        authenticationFailed: (email, ip, reason, meta = {}) => {
            logger.warn('Authentication failed', {
                ...meta,
                category: 'security',
                action: 'authentication_failed',
                email,
                ip,
                reason
            });
        },
        suspiciousActivity: (userId, activity, ip, meta = {}) => {
            logger.warn('Suspicious activity detected', {
                ...meta,
                category: 'security',
                action: 'suspicious_activity',
                userId,
                activity,
                ip
            });
        },
        rateLimitExceeded: (ip, endpoint, limit, meta = {}) => {
            logger.warn('Rate limit exceeded', {
                ...meta,
                category: 'security',
                action: 'rate_limit_exceeded',
                ip,
                endpoint,
                limit
            });
        }
    },
    
    // System operations
    system: {
        started: (port, environment, meta = {}) => {
            logger.info('Publishing server started', {
                ...meta,
                category: 'system',
                action: 'started',
                port,
                environment
            });
        },
        shutdown: (reason, meta = {}) => {
            logger.info('Publishing server shutdown', {
                ...meta,
                category: 'system',
                action: 'shutdown',
                reason
            });
        },
        healthCheck: (status, meta = {}) => {
            logger.debug('Health check', {
                ...meta,
                category: 'system',
                action: 'health_check',
                status
            });
        }
    }
};

// Middleware for adding request context to logs
publishingLogger.middleware = (req, res, next) => {
    req.log = {
        info: (message, meta = {}) => publishingLogger.info(message, { ...meta, requestId: req.requestId }),
        warn: (message, meta = {}) => publishingLogger.warn(message, { ...meta, requestId: req.requestId }),
        error: (message, meta = {}) => publishingLogger.error(message, { ...meta, requestId: req.requestId }),
        debug: (message, meta = {}) => publishingLogger.debug(message, { ...meta, requestId: req.requestId })
    };
    next();
};

module.exports = publishingLogger;
