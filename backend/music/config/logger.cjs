/**
 * Logger Configuration for Music Distribution Module
 * Logger do zapisu zdarzeń i błędów systemowych
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'music-distribution.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for errors only
  new winston.transports.File({
    filename: path.join(logsDir, 'music-distribution-errors.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for HTTP requests
  new winston.transports.File({
    filename: path.join(logsDir, 'music-distribution-http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3
  })
];

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
  ),
  transports,
  exitOnError: false
});

// Custom logging methods for specific use cases
logger.musicDistribution = {
  // Track distribution events
  distribution: (message, data = {}) => {
    logger.info(`[DISTRIBUTION] ${message}`, {
      ...data,
      category: 'distribution',
      timestamp: new Date().toISOString()
    });
  },
  
  // Track royalty calculations
  royalty: (message, data = {}) => {
    logger.info(`[ROYALTY] ${message}`, {
      ...data,
      category: 'royalty',
      timestamp: new Date().toISOString()
    });
  },
  
  // Track payout events
  payout: (message, data = {}) => {
    logger.info(`[PAYOUT] ${message}`, {
      ...data,
      category: 'payout',
      timestamp: new Date().toISOString()
    });
  },
  
  // Track API integrations
  integration: (message, data = {}) => {
    logger.info(`[INTEGRATION] ${message}`, {
      ...data,
      category: 'integration',
      timestamp: new Date().toISOString()
    });
  },
  
  // Track user actions
  userAction: (message, data = {}) => {
    logger.info(`[USER_ACTION] ${message}`, {
      ...data,
      category: 'user_action',
      timestamp: new Date().toISOString()
    });
  },
  
  // Track system performance
  performance: (message, data = {}) => {
    logger.debug(`[PERFORMANCE] ${message}`, {
      ...data,
      category: 'performance',
      timestamp: new Date().toISOString()
    });
  }
};

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'music-distribution-exceptions.log'),
    format: fileFormat
  })
);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason: reason.stack || reason
  });
});

// Log startup information
logger.info('Music Distribution Logger initialized', {
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
  logsDir
});

module.exports = logger;
