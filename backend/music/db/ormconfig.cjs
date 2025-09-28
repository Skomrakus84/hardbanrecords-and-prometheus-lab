// Podstawowa konfiguracja bazy danych dla modułu muzycznego
const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test połączenia z bazą danych
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (err) {
    logger.error('Database connection test error:', err);
    return false;
  }
};

module.exports = {
  supabase,
  logger,
  testConnection,
  // Konfiguracja połączenia
  config: {
    database: {
      url: supabaseUrl,
      timeout: 30000,
      retries: 3
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    }
  }
};
