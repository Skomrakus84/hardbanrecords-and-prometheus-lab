/**
 * Format Conversion Service
 * Automatic conversion between publication formats (EPUB, PDF, MOBI, etc.)
 */

const db = require('../../db.cjs');
const logger = require('../../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class FormatConversionService {
    /**
     * Convert publication to target format
     */
    static async convertPublication(publicationId, targetFormat, conversionOptions, userId) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Verify user owns the publication
            const pubCheck = await client.query(`
                SELECT p.*, pf.format, pf.file_url, pf.file_size
                FROM publications p
                LEFT JOIN publication_files pf ON p.id = pf.publication_id
                WHERE p.id = $1 AND p.user_id = $2
            `, [publicationId, userId]);

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found or access denied', 404);
            }

            const publication = pubCheck.rows[0];
            const sourceFiles = pubCheck.rows.filter(row => row.format);

            if (sourceFiles.length === 0) {
                throw new AppError('No source files found for conversion', 400);
            }

            // Check if target format already exists
            const existingFormat = sourceFiles.find(file => file.format === targetFormat);
            if (existingFormat && !conversionOptions.forceReconvert) {
                throw new AppError(`Publication already exists in ${targetFormat} format`, 409);
            }

            // Create conversion job record
            const conversionResult = await client.query(`
                INSERT INTO conversion_jobs (
                    publication_id, source_format, target_format,
                    conversion_options, status, created_by, created_at
                ) VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
                RETURNING *
            `, [
                publicationId,
                sourceFiles[0].format, // Use first available source format
                targetFormat,
                JSON.stringify(conversionOptions),
                userId
            ]);

            const job = conversionResult.rows[0];

            await client.query('COMMIT');

            // Start conversion process (async)
            this.processConversion(job.id, publication, sourceFiles[0], targetFormat, conversionOptions)
                .catch(error => {
                    logger.error(`Conversion failed for job ${job.id}:`, error);
                });

            logger.info(`Conversion job created: ${job.id} (${sourceFiles[0].format} -> ${targetFormat})`);

            return {
                jobId: job.id,
                publicationId,
                sourceFormat: sourceFiles[0].format,
                targetFormat,
                status: 'pending',
                createdAt: job.created_at
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating conversion job:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get conversion job status
     */
    static async getConversionStatus(jobId, userId) {
        try {
            const result = await db.query(`
                SELECT cj.*, p.title as publication_title
                FROM conversion_jobs cj
                JOIN publications p ON cj.publication_id = p.id
                WHERE cj.id = $1 AND p.user_id = $2
            `, [jobId, userId]);

            if (result.rows.length === 0) {
                throw new AppError('Conversion job not found', 404);
            }

            const job = result.rows[0];

            return {
                id: job.id,
                publicationId: job.publication_id,
                publicationTitle: job.publication_title,
                sourceFormat: job.source_format,
                targetFormat: job.target_format,
                status: job.status,
                progress: job.progress || 0,
                outputFileUrl: job.output_file_url,
                errorMessage: job.error_message,
                conversionOptions: JSON.parse(job.conversion_options || '{}'),
                createdAt: job.created_at,
                startedAt: job.started_at,
                completedAt: job.completed_at
            };

        } catch (error) {
            logger.error('Error getting conversion status:', error);
            throw error;
        }
    }

    /**
     * Get conversion history for user
     */
    static async getConversionHistory(userId, options = {}) {
        try {
            const { page = 1, limit = 20, status, targetFormat } = options;
            const offset = (page - 1) * limit;

            let query = `
                SELECT
                    cj.*,
                    p.title as publication_title,
                    p.cover_image_url
                FROM conversion_jobs cj
                JOIN publications p ON cj.publication_id = p.id
                WHERE p.user_id = $1
            `;

            const params = [userId];
            let paramCount = 1;

            if (status) {
                query += ` AND cj.status = $${++paramCount}`;
                params.push(status);
            }

            if (targetFormat) {
                query += ` AND cj.target_format = $${++paramCount}`;
                params.push(targetFormat);
            }

            query += ` ORDER BY cj.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
            params.push(limit, offset);

            const result = await db.query(query, params);

            // Get total count
            let countQuery = `
                SELECT COUNT(cj.id) as total
                FROM conversion_jobs cj
                JOIN publications p ON cj.publication_id = p.id
                WHERE p.user_id = $1
            `;

            const countParams = [userId];
            let countParamCount = 1;

            if (status) {
                countQuery += ` AND cj.status = $${++countParamCount}`;
                countParams.push(status);
            }

            if (targetFormat) {
                countQuery += ` AND cj.target_format = $${++countParamCount}`;
                countParams.push(targetFormat);
            }

            const countResult = await db.query(countQuery, countParams);

            return {
                jobs: result.rows.map(job => ({
                    id: job.id,
                    publicationId: job.publication_id,
                    publicationTitle: job.publication_title,
                    coverImageUrl: job.cover_image_url,
                    sourceFormat: job.source_format,
                    targetFormat: job.target_format,
                    status: job.status,
                    progress: job.progress || 0,
                    outputFileUrl: job.output_file_url,
                    createdAt: job.created_at,
                    completedAt: job.completed_at
                })),
                pagination: {
                    page,
                    limit,
                    total: parseInt(countResult.rows[0]?.total || 0),
                    pages: Math.ceil(countResult.rows[0]?.total / limit)
                }
            };

        } catch (error) {
            logger.error('Error getting conversion history:', error);
            throw error;
        }
    }

    /**
     * Get supported format conversions
     */
    static getSupportedFormats() {
        return {
            inputFormats: ['EPUB', 'PDF', 'DOCX', 'HTML', 'TXT', 'RTF'],
            outputFormats: ['EPUB', 'PDF', 'MOBI', 'AZW3', 'HTML', 'TXT'],
            conversionMatrix: {
                'EPUB': ['PDF', 'MOBI', 'AZW3', 'HTML', 'TXT'],
                'PDF': ['EPUB', 'HTML', 'TXT'],
                'DOCX': ['EPUB', 'PDF', 'MOBI', 'HTML', 'TXT'],
                'HTML': ['EPUB', 'PDF', 'MOBI', 'TXT'],
                'TXT': ['EPUB', 'PDF', 'HTML'],
                'RTF': ['EPUB', 'PDF', 'HTML', 'TXT']
            },
            formatInfo: {
                'EPUB': {
                    name: 'EPUB',
                    description: 'Standard e-book format',
                    mimeType: 'application/epub+zip',
                    extension: '.epub',
                    features: ['Reflowable text', 'Images', 'Interactive elements']
                },
                'PDF': {
                    name: 'PDF',
                    description: 'Portable Document Format',
                    mimeType: 'application/pdf',
                    extension: '.pdf',
                    features: ['Fixed layout', 'Images', 'Vector graphics']
                },
                'MOBI': {
                    name: 'MOBI',
                    description: 'Kindle format',
                    mimeType: 'application/x-mobipocket-ebook',
                    extension: '.mobi',
                    features: ['Kindle compatible', 'Reflowable text']
                },
                'AZW3': {
                    name: 'AZW3',
                    description: 'Kindle Format 8',
                    mimeType: 'application/vnd.amazon.ebook',
                    extension: '.azw3',
                    features: ['Advanced Kindle format', 'Enhanced typography']
                }
            }
        };
    }

    /**
     * Cancel conversion job
     */
    static async cancelConversion(jobId, userId) {
        try {
            const result = await db.query(`
                UPDATE conversion_jobs
                SET status = 'cancelled',
                    error_message = 'Cancelled by user',
                    completed_at = NOW()
                WHERE id = $1
                    AND created_by = $2
                    AND status IN ('pending', 'processing')
                RETURNING *
            `, [jobId, userId]);

            if (result.rows.length === 0) {
                throw new AppError('Conversion job not found or cannot be cancelled', 404);
            }

            logger.info(`Conversion job cancelled: ${jobId}`);

            return { success: true };

        } catch (error) {
            logger.error('Error cancelling conversion:', error);
            throw error;
        }
    }

    /**
     * Get conversion analytics
     */
    static async getConversionAnalytics(userId, period = '30d') {
        try {
            const periodInterval = this.parsePeriod(period);

            const result = await db.query(`
                SELECT
                    cj.target_format,
                    cj.status,
                    COUNT(*) as conversion_count,
                    AVG(EXTRACT(EPOCH FROM (cj.completed_at - cj.started_at))/60) as avg_duration_minutes
                FROM conversion_jobs cj
                JOIN publications p ON cj.publication_id = p.id
                WHERE p.user_id = $1
                    AND cj.created_at >= NOW() - INTERVAL '${periodInterval}'
                GROUP BY cj.target_format, cj.status
                ORDER BY cj.target_format, cj.status
            `, [userId]);

            // Group results by format and status
            const analytics = {
                period,
                totalConversions: 0,
                successfulConversions: 0,
                failedConversions: 0,
                formatBreakdown: {},
                statusBreakdown: {
                    completed: 0,
                    failed: 0,
                    pending: 0,
                    processing: 0,
                    cancelled: 0
                }
            };

            result.rows.forEach(row => {
                const count = parseInt(row.conversion_count);
                analytics.totalConversions += count;

                if (row.status === 'completed') {
                    analytics.successfulConversions += count;
                } else if (row.status === 'failed') {
                    analytics.failedConversions += count;
                }

                // Format breakdown
                if (!analytics.formatBreakdown[row.target_format]) {
                    analytics.formatBreakdown[row.target_format] = {
                        total: 0,
                        completed: 0,
                        avgDuration: 0
                    };
                }

                analytics.formatBreakdown[row.target_format].total += count;
                if (row.status === 'completed') {
                    analytics.formatBreakdown[row.target_format].completed += count;
                    analytics.formatBreakdown[row.target_format].avgDuration =
                        parseFloat(row.avg_duration_minutes || 0);
                }

                // Status breakdown
                if (analytics.statusBreakdown[row.status] !== undefined) {
                    analytics.statusBreakdown[row.status] += count;
                }
            });

            return analytics;

        } catch (error) {
            logger.error('Error getting conversion analytics:', error);
            throw error;
        }
    }

    // Private methods

    /**
     * Process conversion job
     */
    static async processConversion(jobId, publication, sourceFile, targetFormat, options) {
        try {
            // Update job status to processing
            await db.query(`
                UPDATE conversion_jobs
                SET status = 'processing', started_at = NOW(), progress = 10
                WHERE id = $1
            `, [jobId]);

            // Validate source file accessibility
            const isAccessible = await this.validateSourceFile(sourceFile.file_url);
            if (!isAccessible) {
                throw new Error('Source file is not accessible');
            }

            // Update progress
            await this.updateJobProgress(jobId, 25);

            // Perform actual conversion based on formats
            const convertedFile = await this.performConversion(
                sourceFile.file_url,
                sourceFile.format,
                targetFormat,
                options
            );

            // Update progress
            await this.updateJobProgress(jobId, 75);

            // Store converted file
            const outputUrl = await this.storeConvertedFile(
                publication.id,
                convertedFile,
                targetFormat
            );

            // Add file record to publication
            await db.query(`
                INSERT INTO publication_files (
                    publication_id, format, file_url, file_size,
                    created_at, conversion_job_id
                ) VALUES ($1, $2, $3, $4, NOW(), $5)
            `, [
                publication.id,
                targetFormat,
                outputUrl,
                convertedFile.size,
                jobId
            ]);

            // Complete job
            await db.query(`
                UPDATE conversion_jobs
                SET status = 'completed',
                    progress = 100,
                    output_file_url = $2,
                    completed_at = NOW()
                WHERE id = $1
            `, [jobId, outputUrl]);

            logger.info(`Conversion completed successfully: ${jobId}`);

        } catch (error) {
            logger.error(`Conversion failed for job ${jobId}:`, error);

            await db.query(`
                UPDATE conversion_jobs
                SET status = 'failed',
                    error_message = $2,
                    completed_at = NOW()
                WHERE id = $1
            `, [jobId, error.message]);
        }
    }

    /**
     * Update job progress
     */
    static async updateJobProgress(jobId, progress) {
        await db.query(
            'UPDATE conversion_jobs SET progress = $2 WHERE id = $1',
            [jobId, progress]
        );
    }

    /**
     * Validate source file accessibility
     */
    static async validateSourceFile(fileUrl) {
        // Mock implementation - would check if file exists and is readable
        return true;
    }

    /**
     * Perform actual format conversion
     */
    static async performConversion(sourceUrl, sourceFormat, targetFormat, options) {
        // Mock implementation - would integrate with conversion services like:
        // - Pandoc for document conversions
        // - Calibre for e-book conversions
        // - Custom APIs for specific formats

        // Simulate conversion time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return mock converted file info
        return {
            url: `converted_${Date.now()}.${targetFormat.toLowerCase()}`,
            size: Math.floor(Math.random() * 1000000) + 100000, // Random size
            format: targetFormat
        };
    }

    /**
     * Store converted file
     */
    static async storeConvertedFile(publicationId, convertedFile, targetFormat) {
        // Mock implementation - would upload to storage service
        const fileName = `pub_${publicationId}_${Date.now()}.${targetFormat.toLowerCase()}`;
        return `https://storage.hardbanrecords.com/conversions/${fileName}`;
    }

    /**
     * Parse period string
     */
    static parsePeriod(period) {
        const periodMap = {
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days',
            '1y': '1 year'
        };
        return periodMap[period] || '30 days';
    }
}

module.exports = FormatConversionService;
