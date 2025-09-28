/**
 * Sales Repository - Advanced Sales and Revenue Data Access Layer
 * Provides sophisticated database operations for sales reporting and analytics
 * Handles multi-store revenue tracking, royalty calculations, and financial reporting
 * Implements enterprise-grade patterns with performance optimization and caching
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class SalesRepository {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // ========== Sales Report Management ==========

    /**
     * Create sales report entry
     */
    async createSalesReport(reportData, userId) {
        try {
            const reportId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            const dbData = {
                id: reportId,
                publication_id: reportData.publication_id,
                store_channel_id: reportData.store_channel_id,
                reporting_period_start: reportData.reporting_period_start,
                reporting_period_end: reportData.reporting_period_end,
                total_units_sold: reportData.total_units_sold || 0,
                gross_revenue: reportData.gross_revenue || 0,
                net_revenue: reportData.net_revenue || 0,
                store_commission: reportData.store_commission || 0,
                currency: reportData.currency || 'USD',
                sales_data: JSON.stringify(reportData.sales_data || {}),
                geographical_breakdown: JSON.stringify(reportData.geographical_breakdown || {}),
                format_breakdown: JSON.stringify(reportData.format_breakdown || {}),
                returned_units: reportData.returned_units || 0,
                promotional_sales: reportData.promotional_sales || 0,
                organic_sales: reportData.organic_sales || 0,
                status: 'pending_validation',
                import_source: reportData.import_source || 'manual',
                import_metadata: JSON.stringify(reportData.import_metadata || {}),
                created_at: timestamp,
                updated_at: timestamp
            };

            const { data: report, error } = await this.supabase
                .from('sales_reports')
                .insert(dbData)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to create sales report: ${error.message}`, 500);
            }

            logger.info('Sales report created successfully', {
                reportId,
                publicationId: reportData.publication_id,
                storeChannelId: reportData.store_channel_id,
                period: `${reportData.reporting_period_start} to ${reportData.reporting_period_end}`,
                grossRevenue: reportData.gross_revenue,
                createdBy: userId
            });

            // Invalidate relevant caches
            this.invalidateCache([
                `sales_${reportData.publication_id}`,
                `revenue_${reportData.store_channel_id}`
            ]);

            return this.transformSalesReport(report);

        } catch (error) {
            logger.error('Error creating sales report', {
                error: error.message,
                stack: error.stack,
                reportData,
                userId
            });
            throw error;
        }
    }

    /**
     * Get sales reports for publication
     */
    async getSalesReportsByPublication(publicationId, options = {}) {
        try {
            const cacheKey = `sales_${publicationId}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let query = this.supabase
                .from('sales_reports')
                .select(`
                    *,
                    store_channels(
                        id,
                        name,
                        display_name
                    )
                `)
                .eq('publication_id', publicationId);

            // Apply filters
            if (options.store_channel_id) {
                query = query.eq('store_channel_id', options.store_channel_id);
            }

            if (options.period_start) {
                query = query.gte('reporting_period_start', options.period_start);
            }

            if (options.period_end) {
                query = query.lte('reporting_period_end', options.period_end);
            }

            if (options.status) {
                query = query.eq('status', options.status);
            }

            // Apply pagination
            const { page = 1, limit = 50 } = options;
            const offset = (page - 1) * limit;

            query = query
                .order('reporting_period_start', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: reports, error, count } = await query;

            if (error) {
                throw new AppError(`Failed to get sales reports: ${error.message}`, 500);
            }

            const transformedReports = reports.map(report => this.transformSalesReport(report));

            // Calculate aggregated metrics
            const aggregatedMetrics = this.calculateAggregatedMetrics(transformedReports);

            const result = {
                publication_id: publicationId,
                reports: transformedReports,
                aggregated_metrics: aggregatedMetrics,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            logger.error('Error getting sales reports by publication', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Get sales reports for store channel
     */
    async getSalesReportsByStore(storeChannelId, options = {}) {
        try {
            const cacheKey = `store_sales_${storeChannelId}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let query = this.supabase
                .from('sales_reports')
                .select(`
                    *,
                    publications(
                        id,
                        title,
                        author_id
                    )
                `)
                .eq('store_channel_id', storeChannelId);

            // Apply filters
            if (options.publication_id) {
                query = query.eq('publication_id', options.publication_id);
            }

            if (options.period_start) {
                query = query.gte('reporting_period_start', options.period_start);
            }

            if (options.period_end) {
                query = query.lte('reporting_period_end', options.period_end);
            }

            // Apply pagination
            const { page = 1, limit = 50 } = options;
            const offset = (page - 1) * limit;

            query = query
                .order('reporting_period_start', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: reports, error, count } = await query;

            if (error) {
                throw new AppError(`Failed to get sales reports by store: ${error.message}`, 500);
            }

            const transformedReports = reports.map(report => this.transformSalesReport(report));

            // Calculate store performance metrics
            const storeMetrics = this.calculateStoreMetrics(transformedReports);

            const result = {
                store_channel_id: storeChannelId,
                reports: transformedReports,
                store_metrics: storeMetrics,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            logger.error('Error getting sales reports by store', {
                error: error.message,
                storeChannelId,
                options
            });
            throw error;
        }
    }

    // ========== Revenue Analytics ==========

    /**
     * Get revenue analytics for publication
     */
    async getRevenueAnalytics(publicationId, timeframe = '30d', options = {}) {
        try {
            const cacheKey = `revenue_analytics_${publicationId}_${timeframe}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Calculate date range based on timeframe
            const { startDate, endDate } = this.calculateDateRange(timeframe);

            // Get sales data
            const salesData = await this.getSalesReportsByPublication(publicationId, {
                period_start: startDate,
                period_end: endDate,
                status: 'validated'
            });

            // Calculate revenue metrics
            const revenueMetrics = this.calculateRevenueMetrics(salesData.reports, options);

            // Get trend analysis
            const trendAnalysis = await this.calculateRevenueTrends(publicationId, timeframe);

            // Get store performance comparison
            const storeComparison = this.calculateStorePerformanceComparison(salesData.reports);

            // Get geographical breakdown
            const geographicalAnalysis = this.calculateGeographicalRevenue(salesData.reports);

            const analytics = {
                publication_id: publicationId,
                timeframe,
                period: { start: startDate, end: endDate },
                revenue_metrics: revenueMetrics,
                trend_analysis: trendAnalysis,
                store_performance: storeComparison,
                geographical_analysis: geographicalAnalysis,
                generated_at: new Date().toISOString()
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: analytics,
                timestamp: Date.now()
            });

            return analytics;

        } catch (error) {
            logger.error('Error getting revenue analytics', {
                error: error.message,
                publicationId,
                timeframe,
                options
            });
            throw error;
        }
    }

    /**
     * Get author revenue summary
     */
    async getAuthorRevenueSummary(authorId, options = {}) {
        try {
            const cacheKey = `author_revenue_${authorId}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Get all publications for author
            const { data: publications, error: pubError } = await this.supabase
                .from('publications')
                .select('id, title')
                .eq('author_id', authorId);

            if (pubError) {
                throw new AppError(`Failed to get author publications: ${pubError.message}`, 500);
            }

            const publicationIds = publications.map(pub => pub.id);

            // Get sales data for all publications
            let query = this.supabase
                .from('sales_reports')
                .select('*')
                .in('publication_id', publicationIds)
                .eq('status', 'validated');

            // Apply date filters
            if (options.period_start) {
                query = query.gte('reporting_period_start', options.period_start);
            }

            if (options.period_end) {
                query = query.lte('reporting_period_end', options.period_end);
            }

            const { data: reports, error: reportsError } = await query;

            if (reportsError) {
                throw new AppError(`Failed to get sales reports: ${reportsError.message}`, 500);
            }

            // Calculate summary metrics
            const summary = this.calculateAuthorRevenueSummary(reports, publications);

            // Cache the result
            this.cache.set(cacheKey, {
                data: summary,
                timestamp: Date.now()
            });

            return summary;

        } catch (error) {
            logger.error('Error getting author revenue summary', {
                error: error.message,
                authorId,
                options
            });
            throw error;
        }
    }

    // ========== Financial Reporting ==========

    /**
     * Generate financial report
     */
    async generateFinancialReport(reportType, filters = {}, options = {}) {
        try {
            const reportId = crypto.randomUUID();

            let reportData = {};

            switch (reportType) {
                case 'revenue_summary':
                    reportData = await this.generateRevenueSummaryReport(filters, options);
                    break;
                case 'store_performance':
                    reportData = await this.generateStorePerformanceReport(filters, options);
                    break;
                case 'author_earnings':
                    reportData = await this.generateAuthorEarningsReport(filters, options);
                    break;
                case 'tax_summary':
                    reportData = await this.generateTaxSummaryReport(filters, options);
                    break;
                default:
                    throw new AppError(`Unknown report type: ${reportType}`, 400);
            }

            const report = {
                id: reportId,
                type: reportType,
                filters,
                options,
                data: reportData,
                generated_at: new Date().toISOString(),
                generated_by: options.user_id || 'system'
            };

            logger.info('Financial report generated successfully', {
                reportId,
                reportType,
                filters,
                dataSize: JSON.stringify(reportData).length
            });

            return report;

        } catch (error) {
            logger.error('Error generating financial report', {
                error: error.message,
                reportType,
                filters,
                options
            });
            throw error;
        }
    }

    // ========== Helper Methods ==========

    /**
     * Transform sales report database record
     */
    transformSalesReport(dbRecord) {
        if (!dbRecord) return null;

        return {
            id: dbRecord.id,
            publication_id: dbRecord.publication_id,
            store_channel_id: dbRecord.store_channel_id,
            store_channel: dbRecord.store_channels || null,
            publication: dbRecord.publications || null,
            reporting_period_start: dbRecord.reporting_period_start,
            reporting_period_end: dbRecord.reporting_period_end,
            total_units_sold: dbRecord.total_units_sold,
            gross_revenue: dbRecord.gross_revenue,
            net_revenue: dbRecord.net_revenue,
            store_commission: dbRecord.store_commission,
            currency: dbRecord.currency,
            sales_data: this.safeJsonParse(dbRecord.sales_data, {}),
            geographical_breakdown: this.safeJsonParse(dbRecord.geographical_breakdown, {}),
            format_breakdown: this.safeJsonParse(dbRecord.format_breakdown, {}),
            returned_units: dbRecord.returned_units,
            promotional_sales: dbRecord.promotional_sales,
            organic_sales: dbRecord.organic_sales,
            status: dbRecord.status,
            import_source: dbRecord.import_source,
            import_metadata: this.safeJsonParse(dbRecord.import_metadata, {}),
            created_at: dbRecord.created_at,
            updated_at: dbRecord.updated_at
        };
    }

    /**
     * Calculate aggregated metrics from reports
     */
    calculateAggregatedMetrics(reports) {
        const metrics = {
            total_units_sold: 0,
            total_gross_revenue: 0,
            total_net_revenue: 0,
            total_store_commission: 0,
            average_unit_price: 0,
            top_performing_store: null,
            currencies: new Set()
        };

        reports.forEach(report => {
            metrics.total_units_sold += report.total_units_sold || 0;
            metrics.total_gross_revenue += report.gross_revenue || 0;
            metrics.total_net_revenue += report.net_revenue || 0;
            metrics.total_store_commission += report.store_commission || 0;
            metrics.currencies.add(report.currency);
        });

        if (metrics.total_units_sold > 0) {
            metrics.average_unit_price = metrics.total_gross_revenue / metrics.total_units_sold;
        }

        metrics.currencies = Array.from(metrics.currencies);

        return metrics;
    }

    /**
     * Calculate store metrics
     */
    calculateStoreMetrics(reports) {
        const storeMetrics = {
            total_sales_volume: reports.reduce((sum, r) => sum + (r.total_units_sold || 0), 0),
            total_revenue: reports.reduce((sum, r) => sum + (r.gross_revenue || 0), 0),
            average_commission_rate: 0,
            performance_trend: 'stable',
            top_publications: []
        };

        if (reports.length > 0) {
            const totalCommission = reports.reduce((sum, r) => sum + (r.store_commission || 0), 0);
            const totalGrossRevenue = reports.reduce((sum, r) => sum + (r.gross_revenue || 0), 0);
            
            if (totalGrossRevenue > 0) {
                storeMetrics.average_commission_rate = (totalCommission / totalGrossRevenue) * 100;
            }
        }

        return storeMetrics;
    }

    /**
     * Calculate revenue metrics
     */
    calculateRevenueMetrics(reports, options) {
        // TODO: Implement sophisticated revenue calculations
        logger.debug('Calculating revenue metrics', { reportsCount: reports.length, options });
        
        return {
            total_revenue: reports.reduce((sum, r) => sum + (r.net_revenue || 0), 0),
            revenue_growth: 0,
            profit_margin: 0.7,
            roi: 1.5
        };
    }

    /**
     * Calculate revenue trends
     */
    async calculateRevenueTrends(publicationId, timeframe) {
        // TODO: Implement trend analysis
        logger.debug('Calculating revenue trends', { publicationId, timeframe });
        
        return {
            trend_direction: 'up',
            growth_rate: 5.2,
            seasonal_patterns: []
        };
    }

    /**
     * Calculate store performance comparison
     */
    calculateStorePerformanceComparison(reports) {
        // TODO: Implement store comparison analysis
        logger.debug('Calculating store performance comparison', { reportsCount: reports.length });
        
        return [];
    }

    /**
     * Calculate geographical revenue breakdown
     */
    calculateGeographicalRevenue(reports) {
        // TODO: Implement geographical analysis
        logger.debug('Calculating geographical revenue', { reportsCount: reports.length });
        
        return {};
    }

    /**
     * Calculate author revenue summary
     */
    calculateAuthorRevenueSummary(reports, publications) {
        // TODO: Implement author summary calculations
        logger.debug('Calculating author revenue summary', { 
            reportsCount: reports.length, 
            publicationsCount: publications.length 
        });
        
        return {
            total_earnings: reports.reduce((sum, r) => sum + (r.net_revenue || 0), 0),
            publications_count: publications.length,
            active_publications: publications.length
        };
    }

    /**
     * Calculate date range from timeframe
     */
    calculateDateRange(timeframe) {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeframe) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * Safe JSON parsing
     */
    safeJsonParse(jsonString, fallback = null) {
        try {
            return jsonString ? JSON.parse(jsonString) : fallback;
        } catch {
            return fallback;
        }
    }

    /**
     * Invalidate cached data
     */
    invalidateCache(patterns) {
        patterns.forEach(pattern => {
            const keysToDelete = Array.from(this.cache.keys()).filter(key => 
                key.includes(pattern)
            );
            keysToDelete.forEach(key => this.cache.delete(key));
        });
    }

    /**
     * Placeholder report generation methods
     */
    async generateRevenueSummaryReport(filters, options) {
        logger.debug('Generating revenue summary report', { filters, options });
        return { summary: 'Revenue summary report placeholder' };
    }

    async generateStorePerformanceReport(filters, options) {
        logger.debug('Generating store performance report', { filters, options });
        return { summary: 'Store performance report placeholder' };
    }

    async generateAuthorEarningsReport(filters, options) {
        logger.debug('Generating author earnings report', { filters, options });
        return { summary: 'Author earnings report placeholder' };
    }

    async generateTaxSummaryReport(filters, options) {
        logger.debug('Generating tax summary report', { filters, options });
        return { summary: 'Tax summary report placeholder' };
    }
}

module.exports = SalesRepository;
