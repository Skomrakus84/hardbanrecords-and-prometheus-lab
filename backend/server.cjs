const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const apiRoutes = require('./routes/api.cjs');
const musicRoutes = require('./routes/music.cjs');
const publishingRoutes = require('./routes/publishing.cjs');
const aiRoutes = require('./routes/ai.cjs');
const authRoutes = require('./routes/auth.cjs');
const groqRoutes = require('./routes/groq.cjs');
const adminRoutes = require('./routes/admin.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');
} else {
    console.warn('Supabase credentials not found, running in mock mode');
    // Dummy client for local development without Supabase
    supabase = {
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: [], error: null }),
            update: () => ({ data: [], error: null }),
            delete: () => ({ data: [], error: null })
        }),
        storage: {
            from: () => ({
                upload: () => ({ data: { path: "test/path" }, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: "http://localhost:3001/test.jpg" } })
            })
        }
    };
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// CORS configuration - ROZSZERZONA dla Storage
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://hardbanrecords-lab.vercel.app',
    'https://hardbanrecords-backend.onrender.com',
    'https://lniyanikhipfmrdubqvm.supabase.co',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'apikey',
    'x-client-info'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API endpoints - ROZSZERZONE
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching real dashboard stats from Supabase...');

    // Pobierz rzeczywiste dane z widoku dashboard_stats
    const { data: stats, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();

    if (error) {
      console.log('⚠️ Using fallback data, Supabase error:', error.message);
      // Fallback do mock data
      return res.json({
        active_artists: 5,
        total_releases: 4,
        published_books: 3,
        total_revenue: 25700.00,
        music_platforms: 10,
        publishing_platforms: 10
      });
    }

    console.log('✅ Real dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
});

// Endpoint dla recent activities
app.get('/api/activities/recent', async (req, res) => {
  try {
    const { data: activities, error } = await supabase
      .from('recent_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    res.json(activities || []);
  } catch (error) {
    console.error('❌ Activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Endpoint dla music releases
app.get('/api/music/releases', async (req, res) => {
  try {
    const { data: releases, error } = await supabase
      .from('releases')
      .select(`
        *,
        artists(name)
      `)
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ releases: releases || [], total: releases?.length || 0 });
  } catch (error) {
    console.error('❌ Releases error:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// Endpoint dla published books
app.get('/api/publishing/books', async (req, res) => {
  try {
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        *,
        authors(name)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ books: books || [], total: books?.length || 0 });
  } catch (error) {
    console.error('❌ Books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.use('/api', apiRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/publishing', publishingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groq', groqRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server only in development (not in Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HardbanRecords Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
