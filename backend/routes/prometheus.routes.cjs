const express = require('express');
const PrometheusController = require('../controllers/prometheus.controller.cjs');

const router = express.Router();
const prometheusController = new PrometheusController();

// Metrics and stats routes
router.get('/metrics', prometheusController.getMetrics);
router.get('/stats', prometheusController.getStats);
router.get('/health', prometheusController.getProvidersHealth);

// Provider management
router.post('/providers/:provider/toggle', prometheusController.toggleProvider);
router.post('/providers/:provider/reset-quota', prometheusController.resetProviderQuota);

// System control
router.post('/system/reset', prometheusController.resetSystem);
router.post('/system/optimize', prometheusController.optimizeSystem);

module.exports = router;