const express = require('express');
const cors = require('cors');
const { errorHandler } = require('../middleware/errorHandler.cjs');

// Import routes
const textGenerationRoutes = require('./ai-factory/text/routes.cjs');
const imageGenerationRoutes = require('./ai-factory/image/routes.cjs');
const audioGenerationRoutes = require('./ai-factory/audio/routes.cjs');
const distributionRoutes = require('./distribution/routes.cjs');
const analyticsRoutes = require('./analytics/routes.cjs');
const arVrRoutes = require('./ar-vr/routes.cjs');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/text', textGenerationRoutes);
app.use('/api/v1/image', imageGenerationRoutes);
app.use('/api/v1/audio', audioGenerationRoutes);
app.use('/api/v1/distribution', distributionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ar-vr', arVrRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;