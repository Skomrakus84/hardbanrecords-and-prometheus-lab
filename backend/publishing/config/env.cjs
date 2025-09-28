const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Publishing Module Environment Configuration
 * Centralized configuration management for the Publishing Server
 */
const config = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PUBLISHING_PORT: parseInt(process.env.PUBLISHING_PORT || '3003', 10),
    API_VERSION: process.env.API_VERSION || 'v1',
    
    // Database Configuration
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Authentication
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    
    // Redis Configuration (for caching and rate limiting)
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: parseInt(process.env.REDIS_DB || '2', 10), // Different DB for publishing
    
    // File Storage Configuration
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'supabase', // supabase, aws, azure, gcp
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB in bytes
    ALLOWED_FILE_TYPES: {
        manuscripts: ['.docx', '.pdf', '.epub', '.txt', '.md'],
        covers: ['.jpg', '.jpeg', '.png', '.webp'],
        audio: ['.mp3', '.wav', '.m4a', '.aac'],
        documents: ['.pdf', '.docx', '.doc']
    },
    
    // Publishing Store Integrations
    AMAZON_KDP: {
        enabled: process.env.AMAZON_KDP_ENABLED === 'true',
        clientId: process.env.AMAZON_KDP_CLIENT_ID,
        clientSecret: process.env.AMAZON_KDP_CLIENT_SECRET,
        refreshToken: process.env.AMAZON_KDP_REFRESH_TOKEN,
        sandbox: process.env.AMAZON_KDP_SANDBOX === 'true',
        apiUrl: process.env.AMAZON_KDP_SANDBOX === 'true' 
            ? 'https://kdp-sandbox.amazon.com' 
            : 'https://kdp.amazon.com'
    },
    
    APPLE_BOOKS: {
        enabled: process.env.APPLE_BOOKS_ENABLED === 'true',
        teamId: process.env.APPLE_BOOKS_TEAM_ID,
        keyId: process.env.APPLE_BOOKS_KEY_ID,
        privateKey: process.env.APPLE_BOOKS_PRIVATE_KEY,
        sandbox: process.env.APPLE_BOOKS_SANDBOX === 'true',
        apiUrl: process.env.APPLE_BOOKS_SANDBOX === 'true'
            ? 'https://sandbox.itunes.apple.com'
            : 'https://buy.itunes.apple.com'
    },
    
    GOOGLE_PLAY_BOOKS: {
        enabled: process.env.GOOGLE_PLAY_BOOKS_ENABLED === 'true',
        clientId: process.env.GOOGLE_PLAY_BOOKS_CLIENT_ID,
        clientSecret: process.env.GOOGLE_PLAY_BOOKS_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_PLAY_BOOKS_REFRESH_TOKEN,
        apiUrl: 'https://www.googleapis.com/books/v1'
    },
    
    KOBO: {
        enabled: process.env.KOBO_ENABLED === 'true',
        apiKey: process.env.KOBO_API_KEY,
        secret: process.env.KOBO_SECRET,
        sandbox: process.env.KOBO_SANDBOX === 'true',
        apiUrl: process.env.KOBO_SANDBOX === 'true'
            ? 'https://storeapi-sandbox.kobo.com'
            : 'https://storeapi.kobo.com'
    },
    
    EMPIK: {
        enabled: process.env.EMPIK_ENABLED === 'true',
        apiKey: process.env.EMPIK_API_KEY,
        secret: process.env.EMPIK_SECRET,
        partnerId: process.env.EMPIK_PARTNER_ID,
        apiUrl: 'https://partner-api.empik.com'
    },
    
    DRAFT2DIGITAL: {
        enabled: process.env.DRAFT2DIGITAL_ENABLED === 'true',
        apiKey: process.env.DRAFT2DIGITAL_API_KEY,
        apiUrl: 'https://api.draft2digital.com'
    },
    
    // DRM Configuration
    DRM_PROVIDERS: {
        ADOBE_DRM: {
            enabled: process.env.ADOBE_DRM_ENABLED === 'true',
            vendorId: process.env.ADOBE_DRM_VENDOR_ID,
            sharedSecret: process.env.ADOBE_DRM_SHARED_SECRET,
            apiUrl: process.env.ADOBE_DRM_API_URL
        },
        WATERMARK_DRM: {
            enabled: process.env.WATERMARK_DRM_ENABLED === 'true',
            template: process.env.WATERMARK_TEMPLATE || 'Copyright © {author} - Licensed to {customer}'
        }
    },
    
    // Format Conversion Services
    CONVERSION_SERVICES: {
        CALIBRE: {
            enabled: process.env.CALIBRE_ENABLED === 'true',
            serverUrl: process.env.CALIBRE_SERVER_URL || 'http://localhost:8080'
        },
        PANDOC: {
            enabled: process.env.PANDOC_ENABLED === 'true',
            binary: process.env.PANDOC_BINARY || 'pandoc'
        }
    },
    
    // ISBN Configuration
    ISBN: {
        agency: process.env.ISBN_AGENCY || 'Polska Izba Książki',
        publisherPrefix: process.env.ISBN_PUBLISHER_PREFIX, // e.g., "978-83-XXXXX"
        registrantElement: process.env.ISBN_REGISTRANT_ELEMENT,
        autoAssign: process.env.ISBN_AUTO_ASSIGN === 'true'
    },
    
    // Email Configuration
    EMAIL: {
        provider: process.env.EMAIL_PROVIDER || 'smtp', // smtp, sendgrid, mailgun, ses
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        },
        from: process.env.EMAIL_FROM || 'noreply@hardbanrecords.com',
        templates: {
            welcomeAuthor: process.env.WELCOME_AUTHOR_TEMPLATE || 'welcome-author',
            publicationApproved: process.env.PUBLICATION_APPROVED_TEMPLATE || 'publication-approved',
            salesReport: process.env.SALES_REPORT_TEMPLATE || 'monthly-sales-report',
            royaltyPayment: process.env.ROYALTY_PAYMENT_TEMPLATE || 'royalty-payment'
        }
    },
    
    // Payment Processing
    PAYMENTS: {
        stripe: {
            enabled: process.env.STRIPE_ENABLED === 'true',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        },
        paypal: {
            enabled: process.env.PAYPAL_ENABLED === 'true',
            clientId: process.env.PAYPAL_CLIENT_ID,
            clientSecret: process.env.PAYPAL_CLIENT_SECRET,
            sandbox: process.env.PAYPAL_SANDBOX === 'true'
        },
        wise: {
            enabled: process.env.WISE_ENABLED === 'true',
            apiKey: process.env.WISE_API_KEY,
            sandbox: process.env.WISE_SANDBOX === 'true'
        }
    },
    
    // Analytics and Monitoring
    ANALYTICS: {
        googleAnalytics: process.env.GA_TRACKING_ID,
        mixpanel: process.env.MIXPANEL_TOKEN,
        amplitude: process.env.AMPLITUDE_API_KEY
    },
    
    // Rate Limiting Configuration
    RATE_LIMITS: {
        general: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
        },
        upload: {
            windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour
            max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20', 10)
        },
        auth: {
            windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
            max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10)
        }
    },
    
    // CORS Configuration
    CORS: {
        origins: process.env.CORS_ORIGINS 
            ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
            : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: process.env.CORS_CREDENTIALS === 'true',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
    },
    
    // Logging Configuration
    LOGGING: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json', // json, simple
        file: {
            enabled: process.env.LOG_FILE_ENABLED === 'true',
            path: process.env.LOG_FILE_PATH || './logs/publishing.log',
            maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
            maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5', 10)
        },
        database: {
            enabled: process.env.LOG_DATABASE_ENABLED === 'true',
            level: process.env.LOG_DATABASE_LEVEL || 'error'
        }
    },
    
    // Background Jobs Configuration
    JOBS: {
        redis: {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            db: parseInt(process.env.REDIS_JOBS_DB || '3', 10)
        },
        concurrency: parseInt(process.env.JOBS_CONCURRENCY || '5', 10),
        retries: parseInt(process.env.JOBS_RETRIES || '3', 10),
        backoff: {
            type: process.env.JOBS_BACKOFF_TYPE || 'exponential',
            delay: parseInt(process.env.JOBS_BACKOFF_DELAY || '2000', 10)
        }
    },
    
    // Security Configuration
    SECURITY: {
        enableCSP: process.env.ENABLE_CSP !== 'false',
        enableHSTS: process.env.ENABLE_HSTS !== 'false',
        trustProxy: process.env.TRUST_PROXY === 'true',
        sessionSecret: process.env.SESSION_SECRET,
        encryptionKey: process.env.ENCRYPTION_KEY // For encrypting sensitive data
    }
};

// Validation function to ensure required environment variables are set
function validateConfig() {
    const required = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'JWT_SECRET'
    ];
    
    const missing = required.filter(key => !config[key] && !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate port range
    if (config.PUBLISHING_PORT < 1 || config.PUBLISHING_PORT > 65535) {
        throw new Error('PUBLISHING_PORT must be between 1 and 65535');
    }
    
    // Validate file size limits
    if (config.MAX_FILE_SIZE > 104857600) { // 100MB
        console.warn('Warning: MAX_FILE_SIZE is larger than 100MB, this may cause memory issues');
    }
    
    return true;
}

// Validate configuration on module load
try {
    validateConfig();
} catch (error) {
    console.error('Configuration validation failed:', error.message);
    process.exit(1);
}

module.exports = config;
