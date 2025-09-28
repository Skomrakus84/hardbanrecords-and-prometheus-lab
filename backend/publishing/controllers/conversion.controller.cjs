/**
 * Format Conversion Controller
 * Automatic format conversion API for publications
 */

const FormatConversionService = require('../services/conversion.service.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');
const logger = require('../../config/logger.cjs');

class FormatConversionController {
    /**
     * Convert publication to target format
     */
    static async convertPublication(req, res) {
        try {
            const userId = req.user.id;
            const { publicationId } = req.params;
            const { targetFormat, conversionOptions = {} } = req.body;

            if (!targetFormat) {
                throw new AppError('Target format is required', 400);
            }

            const job = await FormatConversionService.convertPublication(
                publicationId,
                targetFormat,
                conversionOptions,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Conversion job created successfully',
                data: job
            });

        } catch (error) {
            logger.error('Error starting conversion:', error);
            throw error;
        }
    }

    /**
     * Get conversion job status
     */
    static async getConversionStatus(req, res) {
        try {
            const userId = req.user.id;
            const { jobId } = req.params;

            const status = await FormatConversionService.getConversionStatus(
                jobId,
                userId
            );

            res.json({
                success: true,
                data: status
            });

        } catch (error) {
            logger.error('Error getting conversion status:', error);
            throw error;
        }
    }

    /**
     * Get conversion history
     */
    static async getConversionHistory(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 20,
                status,
                targetFormat
            } = req.query;

            const history = await FormatConversionService.getConversionHistory(userId, {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100),
                status,
                targetFormat
            });

            res.json({
                success: true,
                data: history.jobs,
                pagination: history.pagination
            });

        } catch (error) {
            logger.error('Error getting conversion history:', error);
            throw error;
        }
    }

    /**
     * Get supported formats
     */
    static async getSupportedFormats(req, res) {
        try {
            const formats = FormatConversionService.getSupportedFormats();

            res.json({
                success: true,
                data: formats
            });

        } catch (error) {
            logger.error('Error getting supported formats:', error);
            throw error;
        }
    }

    /**
     * Cancel conversion job
     */
    static async cancelConversion(req, res) {
        try {
            const userId = req.user.id;
            const { jobId } = req.params;

            await FormatConversionService.cancelConversion(jobId, userId);

            res.json({
                success: true,
                message: 'Conversion job cancelled successfully'
            });

        } catch (error) {
            logger.error('Error cancelling conversion:', error);
            throw error;
        }
    }

    /**
     * Get conversion analytics
     */
    static async getConversionAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            const analytics = await FormatConversionService.getConversionAnalytics(
                userId,
                period
            );

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            logger.error('Error getting conversion analytics:', error);
            throw error;
        }
    }

    /**
     * Batch convert multiple publications
     */
    static async batchConvert(req, res) {
        try {
            const userId = req.user.id;
            const { publicationIds, targetFormat, conversionOptions = {} } = req.body;

            if (!publicationIds || !Array.isArray(publicationIds) || publicationIds.length === 0) {
                throw new AppError('Publication IDs array is required', 400);
            }

            if (!targetFormat) {
                throw new AppError('Target format is required', 400);
            }

            const jobs = [];
            const errors = [];

            for (const publicationId of publicationIds) {
                try {
                    const job = await FormatConversionService.convertPublication(
                        publicationId,
                        targetFormat,
                        conversionOptions,
                        userId
                    );
                    jobs.push(job);
                } catch (error) {
                    errors.push({
                        publicationId,
                        error: error.message
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: `Batch conversion initiated for ${jobs.length} publications`,
                data: {
                    jobs,
                    errors
                }
            });

        } catch (error) {
            logger.error('Error starting batch conversion:', error);
            throw error;
        }
    }

    /**
     * Get conversion quality report
     */
    static async getQualityReport(req, res) {
        try {
            const { jobId } = req.params;
            const userId = req.user.id;

            // Get job details first
            const job = await FormatConversionService.getConversionStatus(jobId, userId);

            if (job.status !== 'completed') {
                throw new AppError('Quality report only available for completed conversions', 400);
            }

            // Mock quality report - would analyze converted file
            const qualityReport = {
                jobId,
                overallScore: 85,
                metrics: {
                    textFidelity: 90,
                    imageQuality: 80,
                    layoutPreservation: 85,
                    metadataIntegrity: 95
                },
                issues: [
                    {
                        type: 'warning',
                        message: 'Some image compression occurred during conversion',
                        impact: 'minor'
                    }
                ],
                recommendations: [
                    'Consider using higher quality source images for better conversion results'
                ]
            };

            res.json({
                success: true,
                data: qualityReport
            });

        } catch (error) {
            logger.error('Error getting quality report:', error);
            throw error;
        }
    }

    /**
     * Get conversion templates/presets
     */
    static async getConversionPresets(req, res) {
        try {
            const presets = {
                'kindle-optimized': {
                    name: 'Kindle Optimized',
                    description: 'Best settings for Kindle devices',
                    targetFormat: 'MOBI',
                    options: {
                        imageCompression: 'medium',
                        fontOptimization: true,
                        marginAdjustment: 'kindle'
                    }
                },
                'print-ready-pdf': {
                    name: 'Print Ready PDF',
                    description: 'High quality PDF for printing',
                    targetFormat: 'PDF',
                    options: {
                        dpi: 300,
                        colorProfile: 'CMYK',
                        bleedMargins: true
                    }
                },
                'web-optimized-epub': {
                    name: 'Web Optimized EPUB',
                    description: 'Lightweight EPUB for web distribution',
                    targetFormat: 'EPUB',
                    options: {
                        imageCompression: 'high',
                        cssOptimization: true,
                        responsiveLayout: true
                    }
                }
            };

            res.json({
                success: true,
                data: presets
            });

        } catch (error) {
            logger.error('Error getting conversion presets:', error);
            throw error;
        }
    }

    /**
     * Preview conversion settings
     */
    static async previewConversion(req, res) {
        try {
            const { publicationId } = req.params;
            const { targetFormat, conversionOptions = {} } = req.body;

            // Mock preview - would analyze what the conversion would produce
            const preview = {
                publicationId,
                targetFormat,
                estimatedTime: '2-5 minutes',
                estimatedFileSize: '2.3 MB',
                qualityPrediction: 88,
                potentialIssues: [
                    'Some complex tables may require manual adjustment'
                ],
                supportedFeatures: [
                    'Text formatting',
                    'Images',
                    'Table of contents',
                    'Hyperlinks'
                ],
                unsupportedFeatures: [
                    'Embedded videos',
                    'Interactive elements'
                ]
            };

            res.json({
                success: true,
                data: preview
            });

        } catch (error) {
            logger.error('Error previewing conversion:', error);
            throw error;
        }
    }
}

module.exports = FormatConversionController;
