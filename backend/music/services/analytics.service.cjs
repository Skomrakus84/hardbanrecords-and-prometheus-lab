/**
 * Analytics Service - Advanced Analytics Engine
 * Core service for music streaming and revenue analytics
 */

const db = require('../../db.cjs');
const logger = require('../config/logger.cjs');

class AnalyticsService {
    /**
     * Get dashboard analytics overview
     */
    static async getDashboardAnalytics(options) {
        const { userId, period, currency, timezone } = options;

        try {
            // Main metrics
            const [totalStreams, totalRevenue, trackCount] = await Promise.all([
                this.getTotalStreams(userId, period),
                this.getTotalRevenue(userId, period, currency),
                this.getTrackCount(userId)
            ]);

            // Growth metrics
            const growthMetrics = await this.getGrowthMetrics(userId, period);

            // Top performers
            const topTracks = await this.getTopTracks(userId, period, 5);
            const topCountries = await this.getTopCountries(userId, period, 5);

            return {
                overview: {
                    totalStreams,
                    totalRevenue,
                    trackCount,
                    growth: growthMetrics
                },
                topPerformers: {
                    tracks: topTracks,
                    countries: topCountries
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error getting dashboard analytics:', error);
            throw error;
        }
    }

    /**
     * Get streaming analytics
     */
    static async getStreamingAnalytics(options) {
        const { userId, period, platforms, tracks, countries, breakdown } = options;

        try {
            let query = `
                SELECT
                    DATE_TRUNC('${breakdown}', stream_date) as period,
                    platform,
                    COUNT(*) as streams,
                    COUNT(DISTINCT listener_id) as unique_listeners,
                    SUM(duration_seconds) as total_duration
                FROM streaming_data sd
                JOIN releases r ON sd.release_id = r.id
                WHERE r.user_id = $1
                    AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
            `;

            const params = [userId];
            let paramCount = 1;

            if (platforms && platforms.length > 0) {
                query += ` AND sd.platform = ANY($${++paramCount})`;
                params.push(platforms);
            }

            if (countries && countries.length > 0) {
                query += ` AND sd.country = ANY($${++paramCount})`;
                params.push(countries);
            }

            query += ` GROUP BY period, platform ORDER BY period DESC`;

            const result = await db.query(query, params);

            return this.formatStreamingData(result.rows);
        } catch (error) {
            logger.error('Error getting streaming analytics:', error);
            throw error;
        }
    }

    /**
     * Get revenue analytics
     */
    static async getRevenueAnalytics(options) {
        const { userId, period, currency, breakdown, includeProjections } = options;

        try {
            let query = `
                SELECT
                    DATE_TRUNC('${breakdown}', report_date) as period,
                    platform,
                    SUM(gross_revenue) as gross_revenue,
                    SUM(net_revenue) as net_revenue,
                    SUM(platform_fee) as platform_fees,
                    SUM(streams) as streams,
                    AVG(revenue_per_stream) as avg_revenue_per_stream
                FROM revenue_reports rr
                JOIN releases r ON rr.release_id = r.id
                WHERE r.user_id = $1
                    AND rr.report_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
                    AND rr.currency = $2
                GROUP BY period, platform
                ORDER BY period DESC
            `;

            const result = await db.query(query, [userId, currency]);

            let data = {
                revenue: this.formatRevenueData(result.rows),
                summary: await this.getRevenueSummary(userId, period, currency)
            };

            if (includeProjections) {
                data.projections = await this.getRevenueProjections(userId, currency);
            }

            return data;
        } catch (error) {
            logger.error('Error getting revenue analytics:', error);
            throw error;
        }
    }

    /**
     * Get geographic analytics
     */
    static async getGeographicAnalytics(options) {
        const { userId, period, level, metric, limit } = options;

        try {
            let query = `
                SELECT
                    ${level} as location,
                    COUNT(*) as streams,
                    SUM(revenue) as revenue,
                    COUNT(DISTINCT listener_id) as unique_listeners,
                    AVG(completion_rate) as avg_completion_rate
                FROM streaming_data sd
                JOIN releases r ON sd.release_id = r.id
                LEFT JOIN revenue_data rd ON sd.id = rd.stream_id
                WHERE r.user_id = $1
                    AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
                GROUP BY location
                ORDER BY ${metric} DESC
                LIMIT $2
            `;

            const result = await db.query(query, [userId, limit]);

            return this.formatGeographicData(result.rows, level);
        } catch (error) {
            logger.error('Error getting geographic analytics:', error);
            throw error;
        }
    }

    /**
     * Get demographic analytics
     */
    static async getDemographicAnalytics(options) {
        const { userId, period, breakdown, platforms } = options;

        try {
            let query = `
                SELECT
                    ${breakdown} as demographic,
                    COUNT(*) as streams,
                    COUNT(DISTINCT listener_id) as unique_listeners,
                    AVG(engagement_score) as avg_engagement
                FROM streaming_data sd
                JOIN releases r ON sd.release_id = r.id
                JOIN listener_demographics ld ON sd.listener_id = ld.listener_id
                WHERE r.user_id = $1
                    AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
            `;

            const params = [userId];
            let paramCount = 1;

            if (platforms && platforms.length > 0) {
                query += ` AND sd.platform = ANY($${++paramCount})`;
                params.push(platforms);
            }

            query += ` GROUP BY demographic ORDER BY streams DESC`;

            const result = await db.query(query, params);

            return this.formatDemographicData(result.rows, breakdown);
        } catch (error) {
            logger.error('Error getting demographic analytics:', error);
            throw error;
        }
    }

    /**
     * Get platform performance comparison
     */
    static async getPlatformComparison(options) {
        const { userId, period, metrics, includeBenchmarks } = options;

        try {
            const platformData = await db.query(`
                SELECT
                    platform,
                    COUNT(*) as total_streams,
                    SUM(revenue) as total_revenue,
                    COUNT(DISTINCT release_id) as releases_count,
                    AVG(completion_rate) as avg_completion_rate,
                    SUM(revenue) / COUNT(*) as revenue_per_stream
                FROM streaming_data sd
                JOIN releases r ON sd.release_id = r.id
                LEFT JOIN revenue_data rd ON sd.id = rd.stream_id
                WHERE r.user_id = $1
                    AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
                GROUP BY platform
                ORDER BY total_streams DESC
            `, [userId]);

            let result = {
                platforms: this.formatPlatformData(platformData.rows, metrics)
            };

            if (includeBenchmarks) {
                result.benchmarks = await this.getPlatformBenchmarks();
            }

            return result;
        } catch (error) {
            logger.error('Error getting platform comparison:', error);
            throw error;
        }
    }

    /**
     * Get real-time analytics
     */
    static async getRealtimeAnalytics(options) {
        const { userId, metrics, interval } = options;

        try {
            // Get data from last 24 hours with specified interval
            const query = `
                SELECT
                    DATE_TRUNC('${this.parseInterval(interval)}', stream_timestamp) as time_bucket,
                    COUNT(*) as streams,
                    COUNT(DISTINCT listener_id) as listeners,
                    SUM(revenue) as revenue
                FROM realtime_streams rs
                JOIN releases r ON rs.release_id = r.id
                LEFT JOIN revenue_data rd ON rs.id = rd.stream_id
                WHERE r.user_id = $1
                    AND rs.stream_timestamp >= NOW() - INTERVAL '24 hours'
                GROUP BY time_bucket
                ORDER BY time_bucket DESC
            `;

            const result = await db.query(query, [userId]);

            return this.formatRealtimeData(result.rows, metrics);
        } catch (error) {
            logger.error('Error getting realtime analytics:', error);
            throw error;
        }
    }

    /**
     * Get predictive analytics
     */
    static async getPredictiveAnalytics(options) {
        const { userId, horizon, confidence, models } = options;

        try {
            // Get historical data for prediction models
            const historicalData = await this.getHistoricalData(userId, '90d');

            // Simple trend-based prediction (in production, use ML models)
            const predictions = await this.generatePredictions(
                historicalData,
                horizon,
                confidence
            );

            return {
                predictions,
                confidence_level: confidence,
                models_used: models,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error getting predictive analytics:', error);
            throw error;
        }
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

    static parseInterval(interval) {
        const intervalMap = {
            '15m': 'minute',
            '1h': 'hour',
            '1d': 'day'
        };
        return intervalMap[interval] || 'hour';
    }

    static formatStreamingData(rows) {
        return rows.map(row => ({
            period: row.period,
            platform: row.platform,
            streams: parseInt(row.streams),
            uniqueListeners: parseInt(row.unique_listeners),
            totalDuration: parseInt(row.total_duration),
            avgSessionLength: row.total_duration / row.streams
        }));
    }

    static formatRevenueData(rows) {
        return rows.map(row => ({
            period: row.period,
            platform: row.platform,
            grossRevenue: parseFloat(row.gross_revenue),
            netRevenue: parseFloat(row.net_revenue),
            platformFees: parseFloat(row.platform_fees),
            streams: parseInt(row.streams),
            avgRevenuePerStream: parseFloat(row.avg_revenue_per_stream)
        }));
    }

    static formatGeographicData(rows, level) {
        return rows.map(row => ({
            location: row.location,
            streams: parseInt(row.streams),
            revenue: parseFloat(row.revenue || 0),
            uniqueListeners: parseInt(row.unique_listeners),
            avgCompletionRate: parseFloat(row.avg_completion_rate || 0)
        }));
    }

    static formatDemographicData(rows, breakdown) {
        return rows.map(row => ({
            demographic: row.demographic,
            streams: parseInt(row.streams),
            uniqueListeners: parseInt(row.unique_listeners),
            avgEngagement: parseFloat(row.avg_engagement || 0)
        }));
    }

    static formatPlatformData(rows, metrics) {
        return rows.map(row => ({
            platform: row.platform,
            totalStreams: parseInt(row.total_streams),
            totalRevenue: parseFloat(row.total_revenue || 0),
            releasesCount: parseInt(row.releases_count),
            avgCompletionRate: parseFloat(row.avg_completion_rate || 0),
            revenuePerStream: parseFloat(row.revenue_per_stream || 0)
        }));
    }

    static formatRealtimeData(rows, metrics) {
        return rows.map(row => ({
            time: row.time_bucket,
            streams: parseInt(row.streams),
            listeners: parseInt(row.listeners),
            revenue: parseFloat(row.revenue || 0)
        }));
    }

    static async getTotalStreams(userId, period) {
        const result = await db.query(`
            SELECT COALESCE(SUM(streams), 0) as total
            FROM streaming_summary ss
            JOIN releases r ON ss.release_id = r.id
            WHERE r.user_id = $1
                AND ss.date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
        `, [userId]);

        return parseInt(result.rows[0]?.total || 0);
    }

    static async getTotalRevenue(userId, period, currency) {
        const result = await db.query(`
            SELECT COALESCE(SUM(net_revenue), 0) as total
            FROM revenue_reports rr
            JOIN releases r ON rr.release_id = r.id
            WHERE r.user_id = $1
                AND rr.currency = $2
                AND rr.report_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
        `, [userId, currency]);

        return parseFloat(result.rows[0]?.total || 0);
    }

    static async getTrackCount(userId) {
        const result = await db.query(`
            SELECT COUNT(*) as count
            FROM releases
            WHERE user_id = $1 AND status = 'active'
        `, [userId]);

        return parseInt(result.rows[0]?.count || 0);
    }

    static async getGrowthMetrics(userId, period) {
        // Simplified growth calculation
        const currentTotal = await this.getTotalStreams(userId, period);
        const previousTotal = await this.getTotalStreams(userId, period); // Would be previous period in real implementation

        return {
            streamsGrowth: currentTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0,
            period: period
        };
    }

    static async getTopTracks(userId, period, limit) {
        const result = await db.query(`
            SELECT
                r.title,
                r.artist,
                COALESCE(SUM(ss.streams), 0) as total_streams
            FROM releases r
            LEFT JOIN streaming_summary ss ON r.id = ss.release_id
                AND ss.date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
            WHERE r.user_id = $1
            GROUP BY r.id, r.title, r.artist
            ORDER BY total_streams DESC
            LIMIT $2
        `, [userId, limit]);

        return result.rows;
    }

    static async getTopCountries(userId, period, limit) {
        const result = await db.query(`
            SELECT
                country,
                COALESCE(SUM(streams), 0) as total_streams
            FROM streaming_data sd
            JOIN releases r ON sd.release_id = r.id
            WHERE r.user_id = $1
                AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
            GROUP BY country
            ORDER BY total_streams DESC
            LIMIT $2
        `, [userId, limit]);

        return result.rows;
    }

    static async getRevenueSummary(userId, period, currency) {
        const result = await db.query(`
            SELECT
                COALESCE(SUM(gross_revenue), 0) as gross_total,
                COALESCE(SUM(net_revenue), 0) as net_total,
                COALESCE(SUM(platform_fee), 0) as fees_total,
                COUNT(DISTINCT platform) as platforms_count
            FROM revenue_reports rr
            JOIN releases r ON rr.release_id = r.id
            WHERE r.user_id = $1
                AND rr.currency = $2
                AND rr.report_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
        `, [userId, currency]);

        return result.rows[0] || {};
    }

    static async generatePredictions(historicalData, horizon, confidence) {
        // Simple linear trend prediction (replace with ML models in production)
        const trend = this.calculateTrend(historicalData);
        const predictions = [];

        for (let i = 1; i <= parseInt(horizon.replace('d', '')); i++) {
            predictions.push({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                predicted_streams: Math.max(0, trend.baseValue + (trend.dailyGrowth * i)),
                confidence: confidence
            });
        }

        return predictions;
    }

    static calculateTrend(data) {
        if (!data || data.length < 2) {
            return { baseValue: 0, dailyGrowth: 0 };
        }

        const recentValue = data[data.length - 1]?.streams || 0;
        const oldValue = data[0]?.streams || 0;
        const days = data.length;

        return {
            baseValue: recentValue,
            dailyGrowth: (recentValue - oldValue) / days
        };
    }

    static async getHistoricalData(userId, period) {
        const result = await db.query(`
            SELECT
                DATE(stream_date) as date,
                COUNT(*) as streams
            FROM streaming_data sd
            JOIN releases r ON sd.release_id = r.id
            WHERE r.user_id = $1
                AND sd.stream_date >= NOW() - INTERVAL '${this.parsePeriod(period)}'
            GROUP BY DATE(stream_date)
            ORDER BY date
        `, [userId]);

        return result.rows;
    }

    static async getPlatformBenchmarks() {
        // Return industry benchmarks (would come from external data source)
        return {
            spotify: { avgRevenuePerStream: 0.004, marketShare: 31.1 },
            appleMusic: { avgRevenuePerStream: 0.006, marketShare: 15.8 },
            youtubeMusic: { avgRevenuePerStream: 0.001, marketShare: 8.2 },
            amazonMusic: { avgRevenuePerStream: 0.005, marketShare: 13.3 }
        };
    }
}

module.exports = AnalyticsService;
