/**
 * Payout Service - Comprehensive Payout Management
 * Handles payout requests, processing, and payment methods
 */

const db = require('../../db.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class PayoutService {
    /**
     * Request a payout
     */
    static async requestPayout(options) {
        const { userId, amount, currency, paymentMethod, paymentDetails, includeStatements } = options;

        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Check available balance
            const balance = await this.getAvailableBalance(userId, currency, client);
            if (balance.availableBalance < amount) {
                throw new AppError('Insufficient balance for payout', 400);
            }

            // Create payout request
            const payoutResult = await client.query(`
                INSERT INTO payouts (
                    user_id,
                    amount,
                    currency,
                    payment_method,
                    payment_details,
                    status,
                    requested_at
                ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
                RETURNING *
            `, [userId, amount, currency, paymentMethod, JSON.stringify(paymentDetails)]);

            const payout = payoutResult.rows[0];

            // Link royalty statements to payout if specified
            if (includeStatements && includeStatements.length > 0) {
                for (const statementId of includeStatements) {
                    await client.query(`
                        INSERT INTO payout_statements (payout_id, statement_id)
                        VALUES ($1, $2)
                    `, [payout.id, statementId]);
                }
            }

            await client.query('COMMIT');

            // Log payout request
            logger.info(`Payout requested: ${amount} ${currency} for user ${userId}`);

            return {
                id: payout.id,
                amount: parseFloat(payout.amount),
                currency: payout.currency,
                status: payout.status,
                paymentMethod: payout.payment_method,
                requestedAt: payout.requested_at
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error requesting payout:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get payouts for user
     */
    static async getPayouts(options) {
        const { userId, status, currency, pagination } = options;

        try {
            let query = `
                SELECT
                    p.*,
                    COUNT(ps.statement_id) as statements_count
                FROM payouts p
                LEFT JOIN payout_statements ps ON p.id = ps.payout_id
                WHERE p.user_id = $1
            `;

            const params = [userId];
            let paramCount = 1;

            if (status) {
                query += ` AND p.status = $${++paramCount}`;
                params.push(status);
            }

            if (currency) {
                query += ` AND p.currency = $${++paramCount}`;
                params.push(currency);
            }

            query += ` GROUP BY p.id ORDER BY p.requested_at DESC`;

            if (pagination) {
                const offset = (pagination.page - 1) * pagination.limit;
                query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
                params.push(pagination.limit, offset);
            }

            const result = await db.query(query, params);

            // Get total count
            let countQuery = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM payouts p
                WHERE p.user_id = $1
            `;

            const countParams = [userId];
            let countParamCount = 1;

            if (status) {
                countQuery += ` AND p.status = $${++countParamCount}`;
                countParams.push(status);
            }

            if (currency) {
                countQuery += ` AND p.currency = $${++countParamCount}`;
                countParams.push(currency);
            }

            const countResult = await db.query(countQuery, countParams);

            return {
                payouts: result.rows.map(row => ({
                    id: row.id,
                    amount: parseFloat(row.amount),
                    currency: row.currency,
                    status: row.status,
                    paymentMethod: row.payment_method,
                    statementsCount: parseInt(row.statements_count || 0),
                    requestedAt: row.requested_at,
                    processedAt: row.processed_at,
                    completedAt: row.completed_at
                })),
                pagination: pagination ? {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: parseInt(countResult.rows[0]?.total || 0),
                    pages: Math.ceil(countResult.rows[0]?.total / pagination.limit)
                } : null
            };

        } catch (error) {
            logger.error('Error getting payouts:', error);
            throw error;
        }
    }

    /**
     * Get payout by ID
     */
    static async getPayoutById(payoutId, userId) {
        try {
            const result = await db.query(`
                SELECT
                    p.*,
                    array_agg(
                        DISTINCT jsonb_build_object(
                            'id', rs.id,
                            'platform', rs.platform,
                            'period_start', rs.period_start,
                            'period_end', rs.period_end,
                            'net_revenue', rs.net_revenue
                        )
                    ) FILTER (WHERE rs.id IS NOT NULL) as statements
                FROM payouts p
                LEFT JOIN payout_statements ps ON p.id = ps.payout_id
                LEFT JOIN royalty_statements rs ON ps.statement_id = rs.id
                WHERE p.id = $1 AND p.user_id = $2
                GROUP BY p.id
            `, [payoutId, userId]);

            if (result.rows.length === 0) {
                return null;
            }

            const payout = result.rows[0];

            return {
                id: payout.id,
                amount: parseFloat(payout.amount),
                currency: payout.currency,
                status: payout.status,
                paymentMethod: payout.payment_method,
                paymentDetails: payout.payment_details,
                requestedAt: payout.requested_at,
                processedAt: payout.processed_at,
                completedAt: payout.completed_at,
                statements: payout.statements || []
            };

        } catch (error) {
            logger.error('Error getting payout by ID:', error);
            throw error;
        }
    }

    /**
     * Cancel payout
     */
    static async cancelPayout(payoutId, userId) {
        try {
            const result = await db.query(`
                UPDATE payouts
                SET status = 'cancelled',
                    cancelled_at = NOW(),
                    cancellation_reason = 'User requested cancellation'
                WHERE id = $1 AND user_id = $2 AND status = 'pending'
                RETURNING *
            `, [payoutId, userId]);

            if (result.rows.length === 0) {
                throw new AppError('Payout not found or cannot be cancelled', 404);
            }

            logger.info(`Payout cancelled: ${payoutId} by user ${userId}`);

            return {
                id: result.rows[0].id,
                status: result.rows[0].status,
                cancelledAt: result.rows[0].cancelled_at
            };

        } catch (error) {
            logger.error('Error cancelling payout:', error);
            throw error;
        }
    }

    /**
     * Process payout (admin function)
     */
    static async processPayout(payoutId, processorId, paymentReference) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE payouts
                SET status = 'processing',
                    processed_at = NOW(),
                    processed_by = $2,
                    payment_reference = $3
                WHERE id = $1 AND status = 'pending'
                RETURNING *
            `, [payoutId, processorId, paymentReference]);

            if (result.rows.length === 0) {
                throw new AppError('Payout not found or already processed', 404);
            }

            await client.query('COMMIT');

            logger.info(`Payout processing started: ${payoutId} by ${processorId}`);

            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error processing payout:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Complete payout (admin function)
     */
    static async completePayout(payoutId, processorId, transactionId) {
        try {
            const result = await db.query(`
                UPDATE payouts
                SET status = 'completed',
                    completed_at = NOW(),
                    transaction_id = $2
                WHERE id = $1 AND status = 'processing'
                RETURNING *
            `, [payoutId, transactionId]);

            if (result.rows.length === 0) {
                throw new AppError('Payout not found or not in processing status', 404);
            }

            logger.info(`Payout completed: ${payoutId} with transaction ${transactionId}`);

            return result.rows[0];

        } catch (error) {
            logger.error('Error completing payout:', error);
            throw error;
        }
    }

    /**
     * Get minimum payout amount for currency
     */
    static async getMinimumPayoutAmount(currency) {
        // Define minimum payout amounts
        const minimums = {
            'USD': 10.00,
            'EUR': 10.00,
            'GBP': 8.00,
            'CAD': 13.00,
            'AUD': 15.00,
            'PLN': 40.00
        };

        return minimums[currency] || 10.00;
    }

    /**
     * Get available balance (internal method)
     */
    static async getAvailableBalance(userId, currency, client = null) {
        const dbClient = client || db;

        try {
            // Get total earned revenue
            const earnedResult = await dbClient.query(`
                SELECT COALESCE(SUM(net_revenue), 0) as total_earned
                FROM revenue_reports rr
                JOIN releases r ON rr.release_id = r.id
                WHERE r.user_id = $1
                    AND rr.currency = $2
                    AND rr.status = 'finalized'
            `, [userId, currency]);

            // Get total paid out
            const paidResult = await dbClient.query(`
                SELECT COALESCE(SUM(amount), 0) as total_paid
                FROM payouts
                WHERE user_id = $1
                    AND currency = $2
                    AND status IN ('completed', 'processing')
            `, [userId, currency]);

            // Get pending payouts
            const pendingResult = await dbClient.query(`
                SELECT COALESCE(SUM(amount), 0) as total_pending
                FROM payouts
                WHERE user_id = $1
                    AND currency = $2
                    AND status = 'pending'
            `, [userId, currency]);

            const totalEarned = parseFloat(earnedResult.rows[0]?.total_earned || 0);
            const totalPaid = parseFloat(paidResult.rows[0]?.total_paid || 0);
            const totalPending = parseFloat(pendingResult.rows[0]?.total_pending || 0);

            return {
                currency,
                totalEarned,
                totalPaid,
                totalPending,
                availableBalance: totalEarned - totalPaid - totalPending
            };

        } catch (error) {
            logger.error('Error getting available balance:', error);
            throw error;
        }
    }

    /**
     * Get payout statistics
     */
    static async getPayoutStatistics(userId, period = '1y') {
        try {
            const periodInterval = this.parsePeriod(period);

            const result = await db.query(`
                SELECT
                    currency,
                    COUNT(*) as total_payouts,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_paid,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                    AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_payout,
                    MIN(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as min_payout,
                    MAX(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as max_payout
                FROM payouts
                WHERE user_id = $1
                    AND requested_at >= NOW() - INTERVAL '${periodInterval}'
                GROUP BY currency
            `, [userId]);

            return result.rows.map(row => ({
                currency: row.currency,
                totalPayouts: parseInt(row.total_payouts),
                totalPaid: parseFloat(row.total_paid || 0),
                totalPending: parseFloat(row.total_pending || 0),
                avgPayout: parseFloat(row.avg_payout || 0),
                minPayout: parseFloat(row.min_payout || 0),
                maxPayout: parseFloat(row.max_payout || 0)
            }));

        } catch (error) {
            logger.error('Error getting payout statistics:', error);
            throw error;
        }
    }

    /**
     * Get supported payment methods
     */
    static getSupportedPaymentMethods() {
        return [
            {
                id: 'bank_transfer',
                name: 'Bank Transfer',
                minimumAmount: 10.00,
                processingTime: '3-5 business days',
                fees: 'Free',
                requiredFields: ['bank_name', 'account_number', 'routing_number', 'account_holder_name']
            },
            {
                id: 'paypal',
                name: 'PayPal',
                minimumAmount: 5.00,
                processingTime: '1-2 business days',
                fees: '2% + $0.30',
                requiredFields: ['paypal_email']
            },
            {
                id: 'wise',
                name: 'Wise (formerly TransferWise)',
                minimumAmount: 1.00,
                processingTime: '1-3 business days',
                fees: 'Variable by currency',
                requiredFields: ['wise_email']
            },
            {
                id: 'crypto',
                name: 'Cryptocurrency',
                minimumAmount: 25.00,
                processingTime: '24 hours',
                fees: 'Network fees apply',
                requiredFields: ['wallet_address', 'currency_type']
            }
        ];
    }

    // Helper methods
    static parsePeriod(period) {
        const periodMap = {
            '30d': '30 days',
            '90d': '90 days',
            '1y': '1 year',
            '2y': '2 years'
        };
        return periodMap[period] || '1 year';
    }
}

module.exports = PayoutService;
