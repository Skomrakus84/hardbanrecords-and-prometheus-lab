const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Sales Report Model
 * Manages sales data and analytics from distribution channels
 */
class SalesReportModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'sales_reports';
    }

    /**
     * Create a new sales report entry
     * @param {Object} salesData - Sales report data
     * @returns {Promise<Object>} Created sales report
     */
    async create(salesData) {
        try {
            const {
                publication_id,
                store_channel,
                report_period_start,
                report_period_end,
                units_sold,
                gross_revenue,
                store_commission,
                net_revenue,
                currency = 'USD',
                country,
                format_type,
                price_per_unit,
                returns = 0,
                promotional_sales = 0,
                raw_data = {},
                status = 'processed'
            } = salesData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    store_channel,
                    report_period_start,
                    report_period_end,
                    units_sold,
                    gross_revenue,
                    store_commission,
                    net_revenue,
                    currency,
                    country,
                    format_type,
                    price_per_unit,
                    returns,
                    promotional_sales,
                    raw_data,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create sales report', {
                    error: error.message,
                    salesData: { 
                        publication_id, 
                        store_channel, 
                        report_period_start,
                        units_sold 
                    }
                });
                throw error;
            }

            logger.info('Sales report created successfully', {
                reportId: data.id,
                publicationId: data.publication_id,
                storeChannel: data.store_channel,
                unitsSold: data.units_sold,
                grossRevenue: data.gross_revenue
            });

            return data;
        } catch (error) {
            logger.error('Sales report creation error', {
                error: error.message,
                stack: error.stack,
                salesData
            });
            throw error;
        }
    }

    /**
     * Get sales report by ID
     * @param {string} id - Report ID
     * @returns {Promise<Object|null>} Sales report data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch sales report by ID', {
                    error: error.message,
                    reportId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Sales report fetch error', {
                error: error.message,
                reportId: id
            });
            throw error;
        }
    }

    /**
     * Get sales reports by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Sales reports list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const {
                storeChannel,
                startDate,
                endDate,
                country,
                formatType,
                limit = 100
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId);

            if (storeChannel) {
                if (Array.isArray(storeChannel)) {
                    query = query.in('store_channel', storeChannel);
                } else {
                    query = query.eq('store_channel', storeChannel);
                }
            }

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (country) {
                if (Array.isArray(country)) {
                    query = query.in('country', country);
                } else {
                    query = query.eq('country', country);
                }
            }

            if (formatType) {
                query = query.eq('format_type', formatType);
            }

            query = query
                .order('report_period_start', { ascending: false })
                .limit(limit);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch sales reports by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Sales reports fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update sales report
     * @param {string} id - Report ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated sales report
     */
    async update(id, updateData) {
        try {
            const existingReport = await this.findById(id);
            if (!existingReport) {
                throw new Error('Sales report not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update sales report', {
                    error: error.message,
                    reportId: id,
                    updateData
                });
                throw error;
            }

            logger.info('Sales report updated successfully', {
                reportId: data.id,
                publicationId: data.publication_id,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('Sales report update error', {
                error: error.message,
                reportId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Get aggregated sales data
     * @param {Object} options - Aggregation options
     * @returns {Promise<Object>} Aggregated sales data
     */
    async getAggregatedSales(options = {}) {
        try {
            const {
                publicationId,
                authorId,
                storeChannel,
                startDate,
                endDate,
                groupBy = 'month',
                currency = 'USD'
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(author_id, title)
                `);

            if (publicationId) {
                query = query.eq('publication_id', publicationId);
            }

            if (authorId) {
                query = query.eq('publications.author_id', authorId);
            }

            if (storeChannel) {
                if (Array.isArray(storeChannel)) {
                    query = query.in('store_channel', storeChannel);
                } else {
                    query = query.eq('store_channel', storeChannel);
                }
            }

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (currency !== 'all') {
                query = query.eq('currency', currency);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch aggregated sales data', {
                    error: error.message,
                    options
                });
                throw error;
            }

            // Aggregate the data
            const aggregated = this.aggregateSalesData(data, groupBy);

            return aggregated;
        } catch (error) {
            logger.error('Aggregated sales fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get sales by store channel
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Sales by channel
     */
    async getSalesByChannel(options = {}) {
        try {
            const { 
                publicationId, 
                startDate, 
                endDate,
                currency = 'USD' 
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('store_channel, units_sold, gross_revenue, net_revenue');

            if (publicationId) {
                query = query.eq('publication_id', publicationId);
            }

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (currency !== 'all') {
                query = query.eq('currency', currency);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch sales by channel', {
                    error: error.message,
                    options
                });
                throw error;
            }

            // Group by channel
            const channelSales = {};
            data.forEach(report => {
                const channel = report.store_channel;
                if (!channelSales[channel]) {
                    channelSales[channel] = {
                        store_channel: channel,
                        total_units: 0,
                        total_gross_revenue: 0,
                        total_net_revenue: 0,
                        report_count: 0
                    };
                }

                channelSales[channel].total_units += report.units_sold || 0;
                channelSales[channel].total_gross_revenue += report.gross_revenue || 0;
                channelSales[channel].total_net_revenue += report.net_revenue || 0;
                channelSales[channel].report_count++;
            });

            return Object.values(channelSales).sort(
                (a, b) => b.total_net_revenue - a.total_net_revenue
            );
        } catch (error) {
            logger.error('Sales by channel fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get geographical sales distribution
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Sales by country
     */
    async getSalesByCountry(options = {}) {
        try {
            const { 
                publicationId, 
                startDate, 
                endDate,
                currency = 'USD',
                limit = 50
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('country, units_sold, gross_revenue, net_revenue');

            if (publicationId) {
                query = query.eq('publication_id', publicationId);
            }

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (currency !== 'all') {
                query = query.eq('currency', currency);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch sales by country', {
                    error: error.message,
                    options
                });
                throw error;
            }

            // Group by country
            const countrySales = {};
            data.forEach(report => {
                const country = report.country || 'Unknown';
                if (!countrySales[country]) {
                    countrySales[country] = {
                        country: country,
                        total_units: 0,
                        total_gross_revenue: 0,
                        total_net_revenue: 0,
                        report_count: 0
                    };
                }

                countrySales[country].total_units += report.units_sold || 0;
                countrySales[country].total_gross_revenue += report.gross_revenue || 0;
                countrySales[country].total_net_revenue += report.net_revenue || 0;
                countrySales[country].report_count++;
            });

            return Object.values(countrySales)
                .sort((a, b) => b.total_net_revenue - a.total_net_revenue)
                .slice(0, limit);
        } catch (error) {
            logger.error('Sales by country fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get sales trends over time
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Sales trends
     */
    async getSalesTrends(options = {}) {
        try {
            const {
                publicationId,
                period = 'month', // day, week, month, quarter, year
                periods = 12,
                currency = 'USD'
            } = options;

            const endDate = new Date();
            const startDate = new Date();

            // Calculate start date based on period
            switch (period) {
                case 'day':
                    startDate.setDate(endDate.getDate() - periods);
                    break;
                case 'week':
                    startDate.setDate(endDate.getDate() - (periods * 7));
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - periods);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - (periods * 3));
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - periods);
                    break;
            }

            let query = this.supabase
                .from(this.tableName)
                .select('report_period_start, units_sold, gross_revenue, net_revenue')
                .gte('report_period_start', startDate.toISOString())
                .lte('report_period_start', endDate.toISOString());

            if (publicationId) {
                query = query.eq('publication_id', publicationId);
            }

            if (currency !== 'all') {
                query = query.eq('currency', currency);
            }

            query = query.order('report_period_start');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch sales trends', {
                    error: error.message,
                    options
                });
                throw error;
            }

            // Group by time period
            const trends = this.groupSalesByPeriod(data, period);

            return trends;
        } catch (error) {
            logger.error('Sales trends fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get top performing publications
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Top publications
     */
    async getTopPublications(options = {}) {
        try {
            const {
                authorId,
                startDate,
                endDate,
                metric = 'net_revenue', // units_sold, gross_revenue, net_revenue
                limit = 10,
                currency = 'USD'
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    publication_id,
                    units_sold,
                    gross_revenue,
                    net_revenue,
                    publications(title, publication_type, author_id)
                `);

            if (authorId) {
                query = query.eq('publications.author_id', authorId);
            }

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (currency !== 'all') {
                query = query.eq('currency', currency);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch top publications', {
                    error: error.message,
                    options
                });
                throw error;
            }

            // Group by publication and sum metrics
            const publicationSales = {};
            data.forEach(report => {
                const pubId = report.publication_id;
                if (!publicationSales[pubId]) {
                    publicationSales[pubId] = {
                        publication_id: pubId,
                        publication: report.publications,
                        total_units: 0,
                        total_gross_revenue: 0,
                        total_net_revenue: 0
                    };
                }

                publicationSales[pubId].total_units += report.units_sold || 0;
                publicationSales[pubId].total_gross_revenue += report.gross_revenue || 0;
                publicationSales[pubId].total_net_revenue += report.net_revenue || 0;
            });

            // Sort by selected metric
            const sortField = `total_${metric.replace('_revenue', '_revenue').replace('units_sold', 'units')}`;
            
            return Object.values(publicationSales)
                .sort((a, b) => b[sortField] - a[sortField])
                .slice(0, limit);
        } catch (error) {
            logger.error('Top publications fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Bulk import sales reports
     * @param {Array} reportsData - Array of sales report objects
     * @returns {Promise<Object>} Import results
     */
    async bulkImport(reportsData) {
        try {
            const results = {
                imported: 0,
                updated: 0,
                errors: []
            };

            for (const reportData of reportsData) {
                try {
                    // Check if report already exists
                    const existing = await this.findExistingReport(
                        reportData.publication_id,
                        reportData.store_channel,
                        reportData.report_period_start,
                        reportData.report_period_end,
                        reportData.country
                    );

                    if (existing) {
                        // Update existing report
                        await this.update(existing.id, reportData);
                        results.updated++;
                    } else {
                        // Create new report
                        await this.create(reportData);
                        results.imported++;
                    }
                } catch (error) {
                    results.errors.push({
                        data: reportData,
                        error: error.message
                    });
                }
            }

            logger.info('Sales reports bulk import completed', {
                total: reportsData.length,
                imported: results.imported,
                updated: results.updated,
                errors: results.errors.length
            });

            return results;
        } catch (error) {
            logger.error('Sales reports bulk import error', {
                error: error.message,
                reportsCount: reportsData.length
            });
            throw error;
        }
    }

    /**
     * Helper: Aggregate sales data by time period
     * @param {Array} data - Sales data
     * @param {string} groupBy - Grouping period
     * @returns {Object} Aggregated data
     */
    aggregateSalesData(data, groupBy) {
        const aggregated = {
            totalUnits: 0,
            totalGrossRevenue: 0,
            totalNetRevenue: 0,
            periods: {},
            channels: {},
            countries: {}
        };

        data.forEach(report => {
            // Total aggregation
            aggregated.totalUnits += report.units_sold || 0;
            aggregated.totalGrossRevenue += report.gross_revenue || 0;
            aggregated.totalNetRevenue += report.net_revenue || 0;

            // Period aggregation
            const periodKey = this.getPeriodKey(report.report_period_start, groupBy);
            if (!aggregated.periods[periodKey]) {
                aggregated.periods[periodKey] = {
                    period: periodKey,
                    units: 0,
                    grossRevenue: 0,
                    netRevenue: 0
                };
            }
            aggregated.periods[periodKey].units += report.units_sold || 0;
            aggregated.periods[periodKey].grossRevenue += report.gross_revenue || 0;
            aggregated.periods[periodKey].netRevenue += report.net_revenue || 0;

            // Channel aggregation
            const channel = report.store_channel;
            if (!aggregated.channels[channel]) {
                aggregated.channels[channel] = {
                    channel: channel,
                    units: 0,
                    grossRevenue: 0,
                    netRevenue: 0
                };
            }
            aggregated.channels[channel].units += report.units_sold || 0;
            aggregated.channels[channel].grossRevenue += report.gross_revenue || 0;
            aggregated.channels[channel].netRevenue += report.net_revenue || 0;

            // Country aggregation
            const country = report.country || 'Unknown';
            if (!aggregated.countries[country]) {
                aggregated.countries[country] = {
                    country: country,
                    units: 0,
                    grossRevenue: 0,
                    netRevenue: 0
                };
            }
            aggregated.countries[country].units += report.units_sold || 0;
            aggregated.countries[country].grossRevenue += report.gross_revenue || 0;
            aggregated.countries[country].netRevenue += report.net_revenue || 0;
        });

        return aggregated;
    }

    /**
     * Helper: Group sales by time period
     * @param {Array} data - Sales data
     * @param {string} period - Time period
     * @returns {Array} Grouped sales
     */
    groupSalesByPeriod(data, period) {
        const grouped = {};

        data.forEach(report => {
            const periodKey = this.getPeriodKey(report.report_period_start, period);
            
            if (!grouped[periodKey]) {
                grouped[periodKey] = {
                    period: periodKey,
                    units: 0,
                    grossRevenue: 0,
                    netRevenue: 0,
                    reportCount: 0
                };
            }

            grouped[periodKey].units += report.units_sold || 0;
            grouped[periodKey].grossRevenue += report.gross_revenue || 0;
            grouped[periodKey].netRevenue += report.net_revenue || 0;
            grouped[periodKey].reportCount++;
        });

        return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    }

    /**
     * Helper: Get period key for grouping
     * @param {string} dateString - Date string
     * @param {string} period - Period type
     * @returns {string} Period key
     */
    getPeriodKey(dateString, period) {
        const date = new Date(dateString);
        
        switch (period) {
            case 'day':
                return date.toISOString().split('T')[0];
            case 'week': {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                return startOfWeek.toISOString().split('T')[0];
            }
            case 'month':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            case 'quarter': {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `${date.getFullYear()}-Q${quarter}`;
            }
            case 'year':
                return String(date.getFullYear());
            default:
                return dateString;
        }
    }

    /**
     * Helper: Find existing report
     * @param {string} publicationId - Publication ID
     * @param {string} storeChannel - Store channel
     * @param {string} periodStart - Period start
     * @param {string} periodEnd - Period end
     * @param {string} country - Country
     * @returns {Promise<Object|null>} Existing report
     */
    async findExistingReport(publicationId, storeChannel, periodStart, periodEnd, country) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('id')
                .eq('publication_id', publicationId)
                .eq('store_channel', storeChannel)
                .eq('report_period_start', periodStart)
                .eq('report_period_end', periodEnd)
                .eq('country', country || null)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data;
        } catch (error) {
            // Return null if not found
            return null;
        }
    }
}

module.exports = SalesReportModel;
