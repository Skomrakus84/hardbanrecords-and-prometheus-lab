/**
 * Music Distribution Module - Main Server Entry Point
 * Punkt wejściowy backendu, uruchamia serwer Express/Node
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MUSIC_PORT || 3002;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'HardbanRecords Music Distribution',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes
const musicRoutes = require('../routes/music.cjs');
const analyticsRoutes = require('../routes/music/analytics.cjs');
const financialsRoutes = require('../routes/music/financials.cjs');
const payoutsRoutes = require('../routes/music/payouts.cjs');
const profilesRoutes = require('../routes/music/profiles.cjs');

// Register routes
app.use('/api/music', musicRoutes);
app.use('/api/music/analytics', analyticsRoutes);
app.use('/api/music/financials', financialsRoutes);
app.use('/api/music/payouts', payoutsRoutes);
app.use('/api/music/profiles', profilesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Music Distribution Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    service: 'music-distribution'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    service: 'music-distribution',
    path: req.originalUrl
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎵 Music Distribution Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
