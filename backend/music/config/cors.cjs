/**
 * CORS Configuration for Music Distribution Module
 * Konfiguracja CORS dla różnych domen i klientów
 */

const cors = require('cors');

// Development origins
const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002'
];

// Production origins
const productionOrigins = [
  'https://hardbanrecords.com',
  'https://www.hardbanrecords.com',
  'https://app.hardbanrecords.com',
  'https://music.hardbanrecords.com',
  'https://publishing.hardbanrecords.com',
  'https://hardbanrecords-lab.vercel.app',
  'https://hardbanrecords-lab-git-main.vercel.app'
];

// Staging origins
const stagingOrigins = [
  'https://staging.hardbanrecords.com',
  'https://staging-app.hardbanrecords.com',
  'https://dev.hardbanrecords.com'
];

// Get allowed origins based on environment
function getAllowedOrigins() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return productionOrigins;
    case 'staging':
      return [...stagingOrigins, ...developmentOrigins];
    case 'development':
    case 'test':
    default:
      return [...developmentOrigins, ...stagingOrigins, ...productionOrigins];
  }
}

// Dynamic origin validation
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost with any port in development
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow file:// protocol for mobile apps
    if (origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    const error = new Error(`CORS policy violation: Origin ${origin} is not allowed`);
    error.status = 403;
    callback(error);
  },
  
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD'
  ],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
    'X-API-Key',
    'X-Request-ID',
    'X-User-Agent',
    'If-None-Match',
    'If-Modified-Since'
  ],
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Request-ID',
    'ETag',
    'Last-Modified'
  ],
  
  credentials: true, // Allow cookies and authorization headers
  
  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
  
  // Success status for preflight requests
  optionsSuccessStatus: 200,
  
  // Whether to pass the CORS preflight response to the next handler
  preflightContinue: false
};

// Specific CORS configuration for different routes
const routeSpecificCors = {
  // Public endpoints (more permissive)
  public: cors({
    ...corsOptions,
    credentials: false,
    origin: '*'
  }),
  
  // API endpoints (standard configuration)
  api: cors(corsOptions),
  
  // Upload endpoints (more restrictive)
  upload: cors({
    ...corsOptions,
    methods: ['POST', 'PUT', 'OPTIONS'],
    maxAge: 3600 // 1 hour
  }),
  
  // Analytics endpoints (read-only)
  analytics: cors({
    ...corsOptions,
    methods: ['GET', 'OPTIONS'],
    maxAge: 300 // 5 minutes
  }),
  
  // Admin endpoints (very restrictive)
  admin: cors({
    ...corsOptions,
    origin: function (origin, callback) {
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? productionOrigins.filter(url => url.includes('app.hardbanrecords.com'))
        : getAllowedOrigins();
      
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      const error = new Error(`Admin CORS policy violation: Origin ${origin} is not allowed`);
      error.status = 403;
      callback(error);
    }
  })
};

// Middleware to log CORS requests in development
const corsLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`CORS Request: ${req.method} ${req.path} from ${req.get('Origin') || 'unknown origin'}`);
  }
  next();
};

// Helper function to check if origin is allowed
function isOriginAllowed(origin) {
  const allowedOrigins = getAllowedOrigins();
  return !origin || allowedOrigins.includes(origin) || 
    (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'));
}

module.exports = {
  default: corsOptions,
  public: routeSpecificCors.public,
  api: routeSpecificCors.api,
  upload: routeSpecificCors.upload,
  analytics: routeSpecificCors.analytics,
  admin: routeSpecificCors.admin,
  logger: corsLogger,
  isOriginAllowed,
  getAllowedOrigins
};
