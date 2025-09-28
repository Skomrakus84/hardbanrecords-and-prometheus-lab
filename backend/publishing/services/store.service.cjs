/**
 * Publishing Store Integration Service
 * Handles integration with all major publishing platforms and stores
 */

const db = require('../../db.cjs');
const logger = require('../../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class PublishingStoreService {
    /**
     * Get available publishing stores
     */
    static async getPublishingStores() {
        try {
            const result = await db.query(`
                SELECT
                    id, name, display_name, description, logo_url,
                    website_url, is_active, supported_formats,
                    commission_rate, min_price, max_price,
                    processing_time_days, content_requirements,
                    geographic_availability
                FROM publishing_stores
                WHERE is_active = true
                ORDER BY display_name
            `);

            return result.rows.map(store => ({
                id: store.id,
                name: store.name,
                displayName: store.display_name,
                description: store.description,
                logoUrl: store.logo_url,
                websiteUrl: store.website_url,
                isActive: store.is_active,
                supportedFormats: JSON.parse(store.supported_formats || '[]'),
                commissionRate: parseFloat(store.commission_rate || 0),
                minPrice: parseFloat(store.min_price || 0),
                maxPrice: parseFloat(store.max_price || 999.99),
                processingTimeDays: parseInt(store.processing_time_days || 7),
                contentRequirements: JSON.parse(store.content_requirements || '{}'),
                geographicAvailability: JSON.parse(store.geographic_availability || '[]')
            }));

        } catch (error) {
            logger.error('Error getting publishing stores:', error);
            throw error;
        }
    }

    /**
     * Submit publication to stores
     */
    static async submitToStores(publicationId, storeIds, submissionData, userId) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Verify user owns the publication
            const pubCheck = await client.query(
                'SELECT user_id, status, title FROM publications WHERE id = $1',
                [publicationId]
            );

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            if (pubCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to submit this publication', 403);
            }

            if (pubCheck.rows[0].status !== 'approved') {
                throw new AppError('Publication must be approved before store submission', 400);
            }

            // Get store information
            const storesResult = await client.query(`
                SELECT id, name, display_name, api_config, supported_formats
                FROM publishing_stores
                WHERE id = ANY($1) AND is_active = true
            `, [storeIds]);

            if (storesResult.rows.length === 0) {
                throw new AppError('No valid stores selected', 400);
            }

            const submissions = [];

            for (const store of storesResult.rows) {
                // Check if already submitted to this store
                const existingSubmission = await client.query(
                    'SELECT id, status FROM store_submissions WHERE publication_id = $1 AND store_id = $2',
                    [publicationId, store.id]
                );

                if (existingSubmission.rows.length > 0 &&
                    ['submitted', 'approved', 'live'].includes(existingSubmission.rows[0].status)) {
                    continue; // Skip if already submitted
                }

                // Validate format compatibility
                const pubFormats = await client.query(
                    'SELECT format FROM publication_files WHERE publication_id = $1',
                    [publicationId]
                );

                const availableFormats = pubFormats.rows.map(f => f.format);
                const storeFormats = JSON.parse(store.supported_formats || '[]');

                if (!storeFormats.some(format => availableFormats.includes(format))) {
                    continue; // Skip if no compatible format
                }

                // Create submission record
                let submissionRecord;
                if (existingSubmission.rows.length > 0) {
                    // Update existing
                    const updateResult = await client.query(`
                        UPDATE store_submissions
                        SET
                            status = 'pending',
                            submission_data = $3,
                            submitted_at = NOW(),
                            error_message = NULL
                        WHERE id = $1
                        RETURNING *
                    `, [
                        existingSubmission.rows[0].id,
                        JSON.stringify(submissionData)
                    ]);
                    submissionRecord = updateResult.rows[0];
                } else {
                    // Create new
                    const insertResult = await client.query(`
                        INSERT INTO store_submissions (
                            publication_id, store_id, status, submission_data,
                            submitted_at, created_by
                        ) VALUES ($1, $2, 'pending', $3, NOW(), $4)
                        RETURNING *
                    `, [
                        publicationId,
                        store.id,
                        JSON.stringify(submissionData),
                        userId
                    ]);
                    submissionRecord = insertResult.rows[0];
                }

                // Submit to store API (async)
                this.submitToStoreAPI(submissionRecord.id, store, publicationId, submissionData)
                    .catch(error => {
                        logger.error(`Store submission failed for ${store.name}:`, error);
                    });

                submissions.push({
                    storeId: store.id,
                    storeName: store.display_name,
                    status: 'pending',
                    submittedAt: submissionRecord.submitted_at
                });
            }

            await client.query('COMMIT');

            logger.info(`Publication ${publicationId} submitted to ${submissions.length} stores`);

            return submissions;

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error submitting to stores:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get submission status for publication
     */
    static async getSubmissionStatus(publicationId, userId) {
        try {
            // Verify ownership
            const pubCheck = await db.query(
                'SELECT user_id FROM publications WHERE id = $1',
                [publicationId]
            );

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            if (pubCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to view this publication', 403);
            }

            const result = await db.query(`
                SELECT
                    ss.*,
                    ps.name as store_name,
                    ps.display_name,
                    ps.logo_url,
                    ps.website_url
                FROM store_submissions ss
                JOIN publishing_stores ps ON ss.store_id = ps.id
                WHERE ss.publication_id = $1
                ORDER BY ps.display_name
            `, [publicationId]);

            return result.rows.map(row => ({
                id: row.id,
                storeId: row.store_id,
                storeName: row.store_name,
                displayName: row.display_name,
                logoUrl: row.logo_url,
                websiteUrl: row.website_url,
                status: row.status,
                submittedAt: row.submitted_at,
                approvedAt: row.approved_at,
                liveAt: row.live_at,
                storeUrl: row.store_url,
                storeProductId: row.store_product_id,
                errorMessage: row.error_message,
                submissionData: JSON.parse(row.submission_data || '{}')
            }));

        } catch (error) {
            logger.error('Error getting submission status:', error);
            throw error;
        }
    }

    /**
     * Update submission status
     */
    static async updateSubmissionStatus(submissionId, statusData) {
        try {
            const {
                status,
                storeUrl,
                storeProductId,
                errorMessage,
                salesData
            } = statusData;

            const result = await db.query(`
                UPDATE store_submissions
                SET
                    status = $2,
                    store_url = COALESCE($3, store_url),
                    store_product_id = COALESCE($4, store_product_id),
                    error_message = $5,
                    sales_data = COALESCE($6, sales_data),
                    approved_at = CASE
                        WHEN $2 = 'approved' AND approved_at IS NULL THEN NOW()
                        ELSE approved_at
                    END,
                    live_at = CASE
                        WHEN $2 = 'live' AND live_at IS NULL THEN NOW()
                        ELSE live_at
                    END,
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `, [
                submissionId,
                status,
                storeUrl,
                storeProductId,
                errorMessage,
                salesData ? JSON.stringify(salesData) : null
            ]);

            if (result.rows.length === 0) {
                throw new AppError('Submission not found', 404);
            }

            logger.info(`Submission status updated: ${submissionId} -> ${status}`);

            return result.rows[0];

        } catch (error) {
            logger.error('Error updating submission status:', error);
            throw error;
        }
    }

    /**
     * Get store integration analytics
     */
    static async getStoreAnalytics(userId, options = {}) {
        try {
            const { period = '30d', storeId } = options;
            const periodInterval = this.parsePeriod(period);

            let query = `
                SELECT
                    ps.display_name as store_name,
                    COUNT(ss.id) as total_submissions,
                    COUNT(CASE WHEN ss.status = 'live' THEN 1 END) as live_publications,
                    COUNT(CASE WHEN ss.status = 'approved' THEN 1 END) as approved_publications,
                    COUNT(CASE WHEN ss.status = 'pending' THEN 1 END) as pending_publications,
                    COUNT(CASE WHEN ss.status = 'rejected' THEN 1 END) as rejected_publications,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS DECIMAL)), 0) as total_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as total_revenue,
                    AVG(EXTRACT(EPOCH FROM (ss.approved_at - ss.submitted_at))/86400) as avg_approval_days
                FROM store_submissions ss
                JOIN publishing_stores ps ON ss.store_id = ps.id
                JOIN publications p ON ss.publication_id = p.id
                WHERE p.user_id = $1
                    AND ss.submitted_at >= NOW() - INTERVAL '${periodInterval}'
            `;

            const params = [userId];
            let paramCount = 1;

            if (storeId) {
                query += ` AND ss.store_id = $${++paramCount}`;
                params.push(storeId);
            }

            query += ` GROUP BY ps.id, ps.display_name ORDER BY total_submissions DESC`;

            const result = await db.query(query, params);

            // Get overall stats
            const overallQuery = `
                SELECT
                    COUNT(DISTINCT ss.publication_id) as total_publications_submitted,
                    COUNT(ss.id) as total_submissions,
                    COUNT(CASE WHEN ss.status = 'live' THEN 1 END) as total_live,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as total_revenue
                FROM store_submissions ss
                JOIN publications p ON ss.publication_id = p.id
                WHERE p.user_id = $1
                    AND ss.submitted_at >= NOW() - INTERVAL '${periodInterval}'
            `;

            const overallResult = await db.query(overallQuery, [userId]);

            return {
                period,
                overall: {
                    totalPublicationsSubmitted: parseInt(overallResult.rows[0]?.total_publications_submitted || 0),
                    totalSubmissions: parseInt(overallResult.rows[0]?.total_submissions || 0),
                    totalLive: parseInt(overallResult.rows[0]?.total_live || 0),
                    totalRevenue: parseFloat(overallResult.rows[0]?.total_revenue || 0)
                },
                stores: result.rows.map(row => ({
                    storeName: row.store_name,
                    totalSubmissions: parseInt(row.total_submissions),
                    livePublications: parseInt(row.live_publications),
                    approvedPublications: parseInt(row.approved_publications),
                    pendingPublications: parseInt(row.pending_publications),
                    rejectedPublications: parseInt(row.rejected_publications),
                    totalSales: parseInt(row.total_sales || 0),
                    totalRevenue: parseFloat(row.total_revenue || 0),
                    avgApprovalDays: parseFloat(row.avg_approval_days || 0)
                }))
            };

        } catch (error) {
            logger.error('Error getting store analytics:', error);
            throw error;
        }
    }

    /**
     * Sync sales data from stores
     */
    static async syncSalesData() {
        try {
            const result = await db.query(`
                SELECT ss.id, ss.store_id, ss.store_product_id,
                       ps.name as store_name, ps.api_config
                FROM store_submissions ss
                JOIN publishing_stores ps ON ss.store_id = ps.id
                WHERE ss.status = 'live'
                    AND ss.store_product_id IS NOT NULL
                    AND ps.is_active = true
                    AND (ss.last_sales_sync IS NULL OR ss.last_sales_sync < NOW() - INTERVAL '1 day')
                LIMIT 100
            `);

            logger.info(`Syncing sales data for ${result.rows.length} submissions`);

            for (const submission of result.rows) {
                try {
                    await this.syncSubmissionSalesData(submission);
                } catch (error) {
                    logger.error(`Error syncing sales for submission ${submission.id}:`, error);
                }
            }

            return { synced: result.rows.length };

        } catch (error) {
            logger.error('Error syncing sales data:', error);
            throw error;
        }
    }

    // Private methods

    /**
     * Submit to store API
     */
    static async submitToStoreAPI(submissionId, store, publicationId, submissionData) {
        try {
            // Get publication data
            const pubResult = await db.query(`
                SELECT p.*, u.username, u.email,
                       array_agg(
                           jsonb_build_object(
                               'format', pf.format,
                               'file_url', pf.file_url,
                               'file_size', pf.file_size
                           )
                       ) as files
                FROM publications p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN publication_files pf ON p.id = pf.publication_id
                WHERE p.id = $1
                GROUP BY p.id, u.username, u.email
            `, [publicationId]);

            if (pubResult.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            const publication = pubResult.rows[0];

            // Update status to processing
            await db.query(
                'UPDATE store_submissions SET status = $1 WHERE id = $2',
                ['processing', submissionId]
            );

            // Store-specific submission logic
            let submissionResult;

            switch (store.name) {
                case 'amazon_kdp':
                    submissionResult = await this.submitToAmazonKDP(publication, submissionData, store.api_config);
                    break;
                case 'apple_books':
                    submissionResult = await this.submitToAppleBooks(publication, submissionData, store.api_config);
                    break;
                case 'google_play_books':
                    submissionResult = await this.submitToGooglePlayBooks(publication, submissionData, store.api_config);
                    break;
                case 'barnes_noble':
                    submissionResult = await this.submitToBarnesNoble(publication, submissionData, store.api_config);
                    break;
                case 'kobo':
                    submissionResult = await this.submitToKobo(publication, submissionData, store.api_config);
                    break;
                default:
                    throw new Error(`Store ${store.name} not supported`);
            }

            // Update status based on submission result
            if (submissionResult.success) {
                await this.updateSubmissionStatus(submissionId, {
                    status: 'submitted',
                    storeProductId: submissionResult.productId
                });
            } else {
                await this.updateSubmissionStatus(submissionId, {
                    status: 'error',
                    errorMessage: submissionResult.error
                });
            }

        } catch (error) {
            logger.error(`Store API submission error for submission ${submissionId}:`, error);

            await this.updateSubmissionStatus(submissionId, {
                status: 'error',
                errorMessage: error.message
            });
        }
    }

    /**
     * Sync sales data for submission
     */
    static async syncSubmissionSalesData(submission) {
        try {
            let salesData;

            switch (submission.store_name) {
                case 'amazon_kdp':
                    salesData = await this.getAmazonKDPSalesData(submission);
                    break;
                case 'apple_books':
                    salesData = await this.getAppleBooksSalesData(submission);
                    break;
                case 'google_play_books':
                    salesData = await this.getGooglePlayBooksSalesData(submission);
                    break;
                default:
                    return; // Skip unsupported stores
            }

            if (salesData) {
                await db.query(`
                    UPDATE store_submissions
                    SET sales_data = $2, last_sales_sync = NOW()
                    WHERE id = $1
                `, [submission.id, JSON.stringify(salesData)]);

                logger.info(`Sales data synced for submission ${submission.id}`);
            }

        } catch (error) {
            logger.error(`Sales sync error for submission ${submission.id}:`, error);
        }
    }

    // Store-specific methods (mock implementations)
    static async submitToAmazonKDP(publication, submissionData, apiConfig) {
        // Mock implementation - would integrate with Amazon KDP API
        return {
            success: true,
            productId: `amz_${Date.now()}`
        };
    }

    static async submitToAppleBooks(publication, submissionData, apiConfig) {
        // Mock implementation
        return {
            success: true,
            productId: `apple_${Date.now()}`
        };
    }

    static async submitToGooglePlayBooks(publication, submissionData, apiConfig) {
        // Mock implementation
        return {
            success: true,
            productId: `google_${Date.now()}`
        };
    }

    static async submitToBarnesNoble(publication, submissionData, apiConfig) {
        // Mock implementation
        return {
            success: true,
            productId: `bn_${Date.now()}`
        };
    }

    static async submitToKobo(publication, submissionData, apiConfig) {
        // Mock implementation
        return {
            success: true,
            productId: `kobo_${Date.now()}`
        };
    }

    static async getAmazonKDPSalesData(submission) {
        // Mock implementation
        return {
            totalSales: Math.floor(Math.random() * 100),
            totalRevenue: Math.random() * 1000,
            lastSyncDate: new Date().toISOString()
        };
    }

    static async getAppleBooksSalesData(submission) {
        // Mock implementation
        return {
            totalSales: Math.floor(Math.random() * 50),
            totalRevenue: Math.random() * 500,
            lastSyncDate: new Date().toISOString()
        };
    }

    static async getGooglePlayBooksSalesData(submission) {
        // Mock implementation
        return {
            totalSales: Math.floor(Math.random() * 75),
            totalRevenue: Math.random() * 750,
            lastSyncDate: new Date().toISOString()
        };
    }

    // Helper methods
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

module.exports = PublishingStoreService;
