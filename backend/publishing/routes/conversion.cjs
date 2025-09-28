/**
 * Format Conversion Routes
 * API endpoints for automatic format conversion
 */

const express = require('express');
const router = express.Router();

// Import controllers
const ConversionController = require('../controllers/conversion.controller.cjs');

// Import middleware
const auth = require('../../middleware/auth.cjs');
const validate = require('../../middleware/validate.cjs');
const { body, param, query } = require('express-validator');

// ========== Validation Rules ==========

const convertValidation = [
    param('publicationId').isUUID().withMessage('Valid publication ID required'),
    body('targetFormat').isIn(['PDF', 'EPUB', 'MOBI', 'AZW3']).withMessage('Valid target format required'),
    body('conversionOptions').optional().isObject().withMessage('Conversion options must be an object')
];

const jobIdValidation = [
    param('jobId').isUUID().withMessage('Valid job ID required')
];

const batchConvertValidation = [
    body('publicationIds').isArray({ min: 1, max: 10 }).withMessage('Publication IDs array required (max 10)'),
    body('publicationIds.*').isUUID().withMessage('All publication IDs must be valid UUIDs'),
    body('targetFormat').isIn(['PDF', 'EPUB', 'MOBI', 'AZW3']).withMessage('Valid target format required'),
    body('conversionOptions').optional().isObject().withMessage('Conversion options must be an object')
];

const historyValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
    query('targetFormat').optional().isIn(['PDF', 'EPUB', 'MOBI', 'AZW3']).withMessage('Invalid target format')
];

const analyticsValidation = [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
];

const previewValidation = [
    param('publicationId').isUUID().withMessage('Valid publication ID required'),
    body('targetFormat').isIn(['PDF', 'EPUB', 'MOBI', 'AZW3']).withMessage('Valid target format required'),
    body('conversionOptions').optional().isObject().withMessage('Conversion options must be an object')
];

// ========== Routes ==========

/**
 * @route   POST /api/publishing/conversion/convert/:publicationId
 * @desc    Start format conversion for a publication
 * @access  Private
 */
router.post('/convert/:publicationId',
    auth,
    convertValidation,
    validate,
    ConversionController.convertPublication
);

/**
 * @route   GET /api/publishing/conversion/job/:jobId
 * @desc    Get conversion job status and details
 * @access  Private
 */
router.get('/job/:jobId',
    auth,
    jobIdValidation,
    validate,
    ConversionController.getConversionStatus
);

/**
 * @route   GET /api/publishing/conversion/history
 * @desc    Get conversion history for user
 * @access  Private
 */
router.get('/history',
    auth,
    historyValidation,
    validate,
    ConversionController.getConversionHistory
);

/**
 * @route   GET /api/publishing/conversion/formats
 * @desc    Get supported conversion formats
 * @access  Private
 */
router.get('/formats',
    auth,
    ConversionController.getSupportedFormats
);

/**
 * @route   DELETE /api/publishing/conversion/job/:jobId
 * @desc    Cancel conversion job
 * @access  Private
 */
router.delete('/job/:jobId',
    auth,
    jobIdValidation,
    validate,
    ConversionController.cancelConversion
);

/**
 * @route   GET /api/publishing/conversion/analytics
 * @desc    Get conversion analytics
 * @access  Private
 */
router.get('/analytics',
    auth,
    analyticsValidation,
    validate,
    ConversionController.getConversionAnalytics
);

/**
 * @route   POST /api/publishing/conversion/batch
 * @desc    Batch convert multiple publications
 * @access  Private
 */
router.post('/batch',
    auth,
    batchConvertValidation,
    validate,
    ConversionController.batchConvert
);

/**
 * @route   GET /api/publishing/conversion/job/:jobId/quality
 * @desc    Get quality report for completed conversion
 * @access  Private
 */
router.get('/job/:jobId/quality',
    auth,
    jobIdValidation,
    validate,
    ConversionController.getQualityReport
);

/**
 * @route   GET /api/publishing/conversion/presets
 * @desc    Get conversion templates/presets
 * @access  Private
 */
router.get('/presets',
    auth,
    ConversionController.getConversionPresets
);

/**
 * @route   POST /api/publishing/conversion/preview/:publicationId
 * @desc    Preview conversion settings and estimates
 * @access  Private
 */
router.post('/preview/:publicationId',
    auth,
    previewValidation,
    validate,
    ConversionController.previewConversion
);

module.exports = router;
