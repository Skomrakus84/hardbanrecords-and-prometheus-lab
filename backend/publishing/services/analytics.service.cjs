/**
 * Publishing Analytics Service
 * Sales tracking, performance analytics, and reporting for publications
 */

const db = require('../../db.cjs');
const logger = require('../../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class PublishingAnalyticsService {
    /**
     * Get dashboard analytics for user
     */
    static async getDashboardAnalytics(userId, period = '30d') {
        try {
            const periodInterval = this.parsePeriod(period);

            const result = await db.query(`
                SELECT
                    -- Publication stats
                    COUNT(DISTINCT p.id) as total_publications,
                    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as published_publications,
                    COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '${periodInterval}' THEN p.id END) as period_publications,

                    -- Sales stats
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as total_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as total_revenue,
                    COALESCE(SUM(CASE WHEN ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                        THEN CAST(ss.sales_data->>'total_sales' AS INTEGER) ELSE 0 END), 0) as period_sales,
                    COALESCE(SUM(CASE WHEN ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                        THEN CAST(ss.sales_data->>'total_revenue' AS DECIMAL) ELSE 0 END), 0) as period_revenue,

                    -- Store distribution stats
                    COUNT(DISTINCT ss.store_id) as active_stores,
                    COUNT(DISTINCT CASE WHEN ss.status = 'live' THEN ss.id END) as live_publications,
                    COUNT(DISTINCT CASE WHEN ss.status = 'pending' THEN ss.id END) as pending_submissions

                FROM publications p
                LEFT JOIN store_submissions ss ON p.id = ss.publication_id
                WHERE p.user_id = $1
            `, [userId]);

            const data = result.rows[0];

            // Get top performing publications
            const topPublicationsResult = await db.query(`
                SELECT
                    p.id,
                    p.title,
                    p.cover_image_url,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as total_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as total_revenue
                FROM publications p
                LEFT JOIN store_submissions ss ON p.id = ss.publication_id
                WHERE p.user_id = $1 AND p.status = 'published'
                GROUP BY p.id, p.title, p.cover_image_url
                ORDER BY total_revenue DESC
                LIMIT 5
            `, [userId]);

            // Get recent sales activity
            const recentSalesResult = await db.query(`
                SELECT
                    DATE(ss.updated_at) as sale_date,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as daily_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as daily_revenue
                FROM store_submissions ss
                JOIN publications p ON ss.publication_id = p.id
                WHERE p.user_id = $1
                    AND ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                    AND ss.sales_data IS NOT NULL
                GROUP BY DATE(ss.updated_at)
                ORDER BY sale_date DESC
                LIMIT 30
            `, [userId]);

            return {
                period,
                overview: {
                    totalPublications: parseInt(data.total_publications || 0),
                    publishedPublications: parseInt(data.published_publications || 0),
                    periodPublications: parseInt(data.period_publications || 0),
                    totalSales: parseInt(data.total_sales || 0),
                    totalRevenue: parseFloat(data.total_revenue || 0),
                    periodSales: parseInt(data.period_sales || 0),
                    periodRevenue: parseFloat(data.period_revenue || 0),
                    activeStores: parseInt(data.active_stores || 0),
                    livePublications: parseInt(data.live_publications || 0),
                    pendingSubmissions: parseInt(data.pending_submissions || 0)
                },
                topPublications: topPublicationsResult.rows.map(pub => ({
                    id: pub.id,
                    title: pub.title,
                    coverImageUrl: pub.cover_image_url,
                    totalSales: parseInt(pub.total_sales || 0),
                    totalRevenue: parseFloat(pub.total_revenue || 0)
                })),
                salesTrend: recentSalesResult.rows.map(day => ({
                    date: day.sale_date,
                    sales: parseInt(day.daily_sales || 0),
                    revenue: parseFloat(day.daily_revenue || 0)
                }))
            };

        } catch (error) {
            logger.error('Error getting dashboard analytics:', error);
            throw error;
        }
    }

    /**
     * Get sales analytics for publications
     */
    static async getSalesAnalytics(userId, options = {}) {
        try {
            const {
                period = '30d',
                publicationId,
                storeId,
                groupBy = 'day'
            } = options;

            const periodInterval = this.parsePeriod(period);

            let query = `
                SELECT
                    DATE_TRUNC('${groupBy}', ss.updated_at) as period_date,
                    ps.display_name as store_name,
                    p.title as publication_title,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as revenue,
                    COALESCE(AVG(CAST(ss.sales_data->>'avg_rating' AS DECIMAL)), 0) as avg_rating
                FROM store_submissions ss
                JOIN publications p ON ss.publication_id = p.id
                JOIN publishing_stores ps ON ss.store_id = ps.id
                WHERE p.user_id = $1
                    AND ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                    AND ss.sales_data IS NOT NULL
            `;

            const params = [userId];
            let paramCount = 1;

            if (publicationId) {
                query += ` AND p.id = $${++paramCount}`;
                params.push(publicationId);
            }

            if (storeId) {
                query += ` AND ss.store_id = $${++paramCount}`;
                params.push(storeId);
            }

            query += ` GROUP BY DATE_TRUNC('${groupBy}', ss.updated_at), ps.display_name, p.title
                      ORDER BY period_date DESC, revenue DESC`;

            const result = await db.query(query, params);

            // Group results by period for easier frontend consumption
            const groupedResults = {};
            result.rows.forEach(row => {
                const periodKey = row.period_date.toISOString().split('T')[0];
                if (!groupedResults[periodKey]) {
                    groupedResults[periodKey] = {
                        date: periodKey,
                        totalSales: 0,
                        totalRevenue: 0,
                        stores: {},
                        publications: {}
                    };
                }

                groupedResults[periodKey].totalSales += parseInt(row.sales || 0);
                groupedResults[periodKey].totalRevenue += parseFloat(row.revenue || 0);

                // Store breakdown
                if (!groupedResults[periodKey].stores[row.store_name]) {
                    groupedResults[periodKey].stores[row.store_name] = {
                        sales: 0,
                        revenue: 0
                    };
                }
                groupedResults[periodKey].stores[row.store_name].sales += parseInt(row.sales || 0);
                groupedResults[periodKey].stores[row.store_name].revenue += parseFloat(row.revenue || 0);

                // Publication breakdown
                if (!groupedResults[periodKey].publications[row.publication_title]) {
                    groupedResults[periodKey].publications[row.publication_title] = {
                        sales: 0,
                        revenue: 0
                    };
                }
                groupedResults[periodKey].publications[row.publication_title].sales += parseInt(row.sales || 0);
                groupedResults[periodKey].publications[row.publication_title].revenue += parseFloat(row.revenue || 0);
            });

            return {
                period,
                groupBy,
                data: Object.values(groupedResults)
            };

        } catch (error) {
            logger.error('Error getting sales analytics:', error);
            throw error;
        }
    }

    /**
     * Get publication performance analytics
     */
    static async getPublicationAnalytics(publicationId, userId) {
        try {
            // Verify ownership
            const pubCheck = await db.query(
                'SELECT user_id, title, created_at FROM publications WHERE id = $1',
                [publicationId]
            );

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            if (pubCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to view this publication', 403);
            }

            const publication = pubCheck.rows[0];

            // Get store-wise performance
            const storePerformance = await db.query(`
                SELECT
                    ps.display_name as store_name,
                    ps.logo_url,
                    ss.status,
                    ss.store_url,
                    ss.submitted_at,
                    ss.live_at,
                    COALESCE(CAST(ss.sales_data->>'total_sales' AS INTEGER), 0) as total_sales,
                    COALESCE(CAST(ss.sales_data->>'total_revenue' AS DECIMAL), 0) as total_revenue,
                    COALESCE(CAST(ss.sales_data->>'avg_rating' AS DECIMAL), 0) as avg_rating,
                    COALESCE(CAST(ss.sales_data->>'total_reviews' AS INTEGER), 0) as total_reviews
                FROM store_submissions ss
                JOIN publishing_stores ps ON ss.store_id = ps.id
                WHERE ss.publication_id = $1
                ORDER BY total_revenue DESC
            `, [publicationId]);

            // Get sales trend over time
            const salesTrend = await db.query(`
                SELECT
                    DATE(ss.updated_at) as sale_date,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as daily_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as daily_revenue
                FROM store_submissions ss
                WHERE ss.publication_id = $1
                    AND ss.updated_at >= NOW() - INTERVAL '90 days'
                    AND ss.sales_data IS NOT NULL
                GROUP BY DATE(ss.updated_at)
                ORDER BY sale_date DESC
                LIMIT 90
            `, [publicationId]);

            // Calculate summary stats
            const totalSales = storePerformance.rows.reduce((sum, store) => sum + store.total_sales, 0);
            const totalRevenue = storePerformance.rows.reduce((sum, store) => sum + store.total_revenue, 0);
            const avgRating = storePerformance.rows.length > 0
                ? storePerformance.rows.reduce((sum, store) => sum + store.avg_rating, 0) / storePerformance.rows.length
                : 0;
            const totalReviews = storePerformance.rows.reduce((sum, store) => sum + store.total_reviews, 0);
            const liveStores = storePerformance.rows.filter(store => store.status === 'live').length;

            return {
                publication: {
                    id: publicationId,
                    title: publication.title,
                    createdAt: publication.created_at
                },
                summary: {
                    totalSales,
                    totalRevenue,
                    avgRating: parseFloat(avgRating.toFixed(2)),
                    totalReviews,
                    liveStores,
                    totalStores: storePerformance.rows.length
                },
                storePerformance: storePerformance.rows.map(store => ({
                    storeName: store.store_name,
                    logoUrl: store.logo_url,
                    status: store.status,
                    storeUrl: store.store_url,
                    submittedAt: store.submitted_at,
                    liveAt: store.live_at,
                    totalSales: store.total_sales,
                    totalRevenue: store.total_revenue,
                    avgRating: store.avg_rating,
                    totalReviews: store.total_reviews
                })),
                salesTrend: salesTrend.rows.map(day => ({
                    date: day.sale_date,
                    sales: day.daily_sales,
                    revenue: day.daily_revenue
                }))
            };

        } catch (error) {
            logger.error('Error getting publication analytics:', error);
            throw error;
        }
    }

    /**
     * Get geographic sales analytics
     */
    static async getGeographicAnalytics(userId, options = {}) {
        try {
            const { period = '30d', publicationId } = options;
            const periodInterval = this.parsePeriod(period);

            let query = `
                SELECT
                    ss.sales_data->>'country' as country,
                    ss.sales_data->>'country_name' as country_name,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_sales' AS INTEGER)), 0) as total_sales,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as total_revenue
                FROM store_submissions ss
                JOIN publications p ON ss.publication_id = p.id
                WHERE p.user_id = $1
                    AND ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                    AND ss.sales_data IS NOT NULL
                    AND ss.sales_data->>'country' IS NOT NULL
            `;

            const params = [userId];
            let paramCount = 1;

            if (publicationId) {
                query += ` AND p.id = $${++paramCount}`;
                params.push(publicationId);
            }

            query += ` GROUP BY ss.sales_data->>'country', ss.sales_data->>'country_name'
                      ORDER BY total_revenue DESC
                      LIMIT 50`;

            const result = await db.query(query, params);

            return {
                period,
                countries: result.rows.map(row => ({
                    countryCode: row.country,
                    countryName: row.country_name,
                    totalSales: parseInt(row.total_sales || 0),
                    totalRevenue: parseFloat(row.total_revenue || 0)
                }))
            };

        } catch (error) {
            logger.error('Error getting geographic analytics:', error);
            throw error;
        }
    }

    /**
     * Get revenue analytics with detailed breakdown
     */
    static async getRevenueAnalytics(userId, options = {}) {
        try {
            const { period = '30d', groupBy = 'month' } = options;
            const periodInterval = this.parsePeriod(period);

            const result = await db.query(`
                SELECT
                    DATE_TRUNC('${groupBy}', ss.updated_at) as period_date,
                    ps.display_name as store_name,
                    COALESCE(SUM(CAST(ss.sales_data->>'total_revenue' AS DECIMAL)), 0) as gross_revenue,
                    COALESCE(SUM(CAST(ss.sales_data->>'store_commission' AS DECIMAL)), 0) as store_commission,
                    COALESCE(SUM(CAST(ss.sales_data->>'platform_fee' AS DECIMAL)), 0) as platform_fee,
                    COALESCE(SUM(CAST(ss.sales_data->>'net_revenue' AS DECIMAL)), 0) as net_revenue,
                    COUNT(DISTINCT ss.publication_id) as publications_sold
                FROM store_submissions ss
                JOIN publications p ON ss.publication_id = p.id
                JOIN publishing_stores ps ON ss.store_id = ps.id
                WHERE p.user_id = $1
                    AND ss.updated_at >= NOW() - INTERVAL '${periodInterval}'
                    AND ss.sales_data IS NOT NULL
                GROUP BY DATE_TRUNC('${groupBy}', ss.updated_at), ps.display_name
                ORDER BY period_date DESC, gross_revenue DESC
            `, [userId]);

            // Group by period
            const groupedRevenue = {};
            result.rows.forEach(row => {
                const periodKey = row.period_date.toISOString().split('T')[0];
                if (!groupedRevenue[periodKey]) {
                    groupedRevenue[periodKey] = {
                        date: periodKey,
                        totalGrossRevenue: 0,
                        totalStoreCommission: 0,
                        totalPlatformFee: 0,
                        totalNetRevenue: 0,
                        stores: {}
                    };
                }

                const grossRevenue = parseFloat(row.gross_revenue || 0);
                const storeCommission = parseFloat(row.store_commission || 0);
                const platformFee = parseFloat(row.platform_fee || 0);
                const netRevenue = parseFloat(row.net_revenue || 0);

                groupedRevenue[periodKey].totalGrossRevenue += grossRevenue;
                groupedRevenue[periodKey].totalStoreCommission += storeCommission;
                groupedRevenue[periodKey].totalPlatformFee += platformFee;
                groupedRevenue[periodKey].totalNetRevenue += netRevenue;

                groupedRevenue[periodKey].stores[row.store_name] = {
                    grossRevenue,
                    storeCommission,
                    platformFee,
                    netRevenue,
                    publicationsSold: parseInt(row.publications_sold || 0)
                };
            });

            return {
                period,
                groupBy,
                revenueBreakdown: Object.values(groupedRevenue)
            };

        } catch (error) {
            logger.error('Error getting revenue analytics:', error);
            throw error;
        }
    }

    /**
     * Generate analytics report
     */
    static async generateReport(userId, reportType = 'comprehensive', options = {}) {
        try {
            const { period = '30d', format = 'json' } = options;

            let reportData = {};

            switch (reportType) {
                case 'comprehensive':
                    reportData = await this.getComprehensiveReport(userId, period);
                    break;
                case 'sales':
                    reportData = await this.getSalesAnalytics(userId, { period });
                    break;
                case 'revenue':
                    reportData = await this.getRevenueAnalytics(userId, { period });
                    break;
                case 'geographic':
                    reportData = await this.getGeographicAnalytics(userId, { period });
                    break;
                default:
                    throw new AppError('Invalid report type', 400);
            }

            // If CSV format requested, convert to CSV
            if (format === 'csv') {
                reportData.csvData = this.convertToCSV(reportData, reportType);
            }

            return {
                reportType,
                period,
                format,
                generatedAt: new Date().toISOString(),
                data: reportData
            };

        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    // Private helper methods

    /**
     * Get comprehensive report combining all analytics
     */
    static async getComprehensiveReport(userId, period) {
        const [dashboard, sales, revenue, geographic] = await Promise.all([
            this.getDashboardAnalytics(userId, period),
            this.getSalesAnalytics(userId, { period }),
            this.getRevenueAnalytics(userId, { period }),
            this.getGeographicAnalytics(userId, { period })
        ]);

        return {
            dashboard,
            sales,
            revenue,
            geographic
        };
    }

    /**
     * Convert data to CSV format
     */
    static convertToCSV(data, reportType) {
        // Basic CSV conversion - would be enhanced based on specific needs
        switch (reportType) {
            case 'sales':
                return this.convertSalesDataToCSV(data.data || []);
            case 'revenue':
                return this.convertRevenueDataToCSV(data.revenueBreakdown || []);
            default:
                return 'Report type not supported for CSV export';
        }
    }

    static convertSalesDataToCSV(salesData) {
        if (!salesData.length) return 'Date,Sales,Revenue\n';

        let csv = 'Date,Total Sales,Total Revenue\n';
        salesData.forEach(day => {
            csv += `${day.date},${day.totalSales},${day.totalRevenue}\n`;
        });
        return csv;
    }

    static convertRevenueDataToCSV(revenueData) {
        if (!revenueData.length) return 'Date,Gross Revenue,Store Commission,Platform Fee,Net Revenue\n';

        let csv = 'Date,Gross Revenue,Store Commission,Platform Fee,Net Revenue\n';
        revenueData.forEach(period => {
            csv += `${period.date},${period.totalGrossRevenue},${period.totalStoreCommission},${period.totalPlatformFee},${period.totalNetRevenue}\n`;
        });
        return csv;
    }

    /**
     * Parse period string to PostgreSQL interval
     */
    static parsePeriod(period) {
        const periodMap = {
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days',
            '1y': '1 year',
            '2y': '2 years'
        };
        return periodMap[period] || '30 days';
    }
}

module.exports = PublishingAnalyticsService;
