const winston = require('winston');
const { format } = winston;

// Create a custom format for console output
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Write to all logs with level 'info' and below to 'prometheus-combined.log'
    new winston.transports.File({ 
      filename: 'logs/prometheus-combined.log',
      level: 'info'
    }),
    // Write all logs error (and below) to 'prometheus-error.log'
    new winston.transports.File({ 
      filename: 'logs/prometheus-error.log', 
      level: 'error' 
    }),
    // Console output for development
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// If we're not in production, log to the console with custom format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

module.exports = logger;