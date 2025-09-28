const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Licensing Model
 * Manages licensing agreements and permissions for publications
 */
class LicensingModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'licensing';
    }

    /**
     * Create a new licensing agreement
     * @param {Object} licenseData - License data
     * @returns {Promise<Object>} Created license
     */
    async create(licenseData) {
        try {
            const {
                publication_id,
                license_type,
                licensee_name,
                licensee_contact,
                license_terms,
                start_date,
                end_date = null,
                royalty_rate = 0,
                advance_payment = 0,
                minimum_guarantee = 0,
                status = 'draft'
            } = licenseData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    license_type,
                    licensee_name,
                    licensee_contact,
                    license_terms,
                    start_date,
                    end_date,
                    royalty_rate,
                    advance_payment,
                    minimum_guarantee,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create licensing agreement', {
                    error: error.message,
                    licenseData: { publication_id, license_type, licensee_name }
                });
                throw error;
            }

            logger.info('Licensing agreement created successfully', {
                licenseId: data.id,
                publicationId: data.publication_id,
                licenseType: data.license_type,
                licenseeName: data.licensee_name
            });

            return data;
        } catch (error) {
            logger.error('Licensing agreement creation error', {
                error: error.message,
                stack: error.stack,
                licenseData
            });
            throw error;
        }
    }

    /**
     * Get license by ID
     * @param {string} id - License ID
     * @returns {Promise<Object|null>} License data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id),
                    licensing_payments(amount, payment_date, payment_type)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch licensing agreement by ID', {
                    error: error.message,
                    licenseId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Licensing agreement fetch error', {
                error: error.message,
                licenseId: id
            });
            throw error;
        }
    }

    /**
     * Get licenses by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Licenses list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const { 
                licenseType, 
                status, 
                includeExpired = false,
                includePayments = false 
            } = options;

            let selectFields = includePayments ? `
                *,
                licensing_payments(amount, payment_date, payment_type)
            ` : '*';

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields)
                .eq('publication_id', publicationId);

            if (licenseType) {
                if (Array.isArray(licenseType)) {
                    query = query.in('license_type', licenseType);
                } else {
                    query = query.eq('license_type', licenseType);
                }
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (!includeExpired) {
                const now = new Date().toISOString();
                query = query.or(`end_date.is.null,end_date.gte.${now}`);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch licenses by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Licenses fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update license
     * @param {string} id - License ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated license
     */
    async update(id, updateData) {
        try {
            const existingLicense = await this.findById(id);
            if (!existingLicense) {
                throw new Error('Licensing agreement not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update licensing agreement', {
                    error: error.message,
                    licenseId: id,
                    updateData
                });
                throw error;
            }

            // Log status changes
            if (updateData.status && updateData.status !== existingLicense.status) {
                logger.info('Licensing agreement status changed', {
                    licenseId: data.id,
                    publicationId: data.publication_id,
                    oldStatus: existingLicense.status,
                    newStatus: data.status
                });
            }

            return data;
        } catch (error) {
            logger.error('Licensing agreement update error', {
                error: error.message,
                licenseId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Activate license agreement
     * @param {string} id - License ID
     * @returns {Promise<Object>} Updated license
     */
    async activate(id) {
        try {
            const license = await this.findById(id);
            if (!license) {
                throw new Error('Licensing agreement not found');
            }

            if (license.status !== 'draft' && license.status !== 'pending') {
                throw new Error('Can only activate draft or pending licenses');
            }

            return await this.update(id, { 
                status: 'active',
                activated_at: new Date().toISOString()
            });
        } catch (error) {
            logger.error('License activation error', {
                error: error.message,
                licenseId: id
            });
            throw error;
        }
    }

    /**
     * Terminate license agreement
     * @param {string} id - License ID
     * @param {string} reason - Termination reason
     * @returns {Promise<Object>} Updated license
     */
    async terminate(id, reason = null) {
        try {
            const updateData = {
                status: 'terminated',
                terminated_at: new Date().toISOString()
            };

            if (reason) {
                updateData.termination_reason = reason;
            }

            return await this.update(id, updateData);
        } catch (error) {
            logger.error('License termination error', {
                error: error.message,
                licenseId: id,
                reason
            });
            throw error;
        }
    }

    /**
     * Get all licenses with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated licenses
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                licenseType,
                status,
                licensee,
                startDate,
                endDate,
                search
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `, { count: 'exact' });

            if (licenseType) {
                if (Array.isArray(licenseType)) {
                    query = query.in('license_type', licenseType);
                } else {
                    query = query.eq('license_type', licenseType);
                }
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (licensee) {
                query = query.ilike('licensee_name', `%${licensee}%`);
            }

            if (search) {
                query = query.or(`licensee_name.ilike.%${search}%,license_type.ilike.%${search}%`);
            }

            if (startDate) {
                query = query.gte('start_date', startDate);
            }

            if (endDate) {
                query = query.lte('start_date', endDate);
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch licensing agreements', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const totalPages = Math.ceil(count / limit);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            logger.error('Licensing agreements fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get expiring licenses
     * @param {number} daysAhead - Days to look ahead
     * @returns {Promise<Array>} Expiring licenses
     */
    async getExpiringLicenses(daysAhead = 30) {
        try {
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + daysAhead);

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `)
                .eq('status', 'active')
                .not('end_date', 'is', null)
                .gte('end_date', now.toISOString())
                .lte('end_date', futureDate.toISOString())
                .order('end_date');

            if (error) {
                logger.error('Failed to fetch expiring licenses', {
                    error: error.message,
                    daysAhead
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Expiring licenses fetch error', {
                error: error.message,
                daysAhead
            });
            throw error;
        }
    }

    /**
     * Calculate license revenue
     * @param {string} id - License ID
     * @param {Object} options - Calculation options
     * @returns {Promise<Object>} Revenue calculation
     */
    async calculateRevenue(id, options = {}) {
        try {
            const { startDate, endDate } = options;

            const license = await this.findById(id);
            if (!license) {
                throw new Error('License not found');
            }

            // Get payments for this license
            let paymentsQuery = this.supabase
                .from('licensing_payments')
                .select('*')
                .eq('license_id', id);

            if (startDate) {
                paymentsQuery = paymentsQuery.gte('payment_date', startDate);
            }

            if (endDate) {
                paymentsQuery = paymentsQuery.lte('payment_date', endDate);
            }

            const { data: payments, error } = await paymentsQuery;

            if (error) {
                logger.error('Failed to fetch license payments', {
                    error: error.message,
                    licenseId: id
                });
                throw error;
            }

            const revenue = {
                totalReceived: 0,
                advancePayment: license.advance_payment || 0,
                minimumGuarantee: license.minimum_guarantee || 0,
                royaltyRate: license.royalty_rate || 0,
                payments: payments || [],
                paymentsByType: {}
            };

            payments.forEach(payment => {
                revenue.totalReceived += payment.amount || 0;
                
                if (!revenue.paymentsByType[payment.payment_type]) {
                    revenue.paymentsByType[payment.payment_type] = 0;
                }
                revenue.paymentsByType[payment.payment_type] += payment.amount || 0;
            });

            // Calculate outstanding minimum guarantee
            revenue.outstandingMinimumGuarantee = Math.max(
                0, 
                revenue.minimumGuarantee - revenue.totalReceived
            );

            return revenue;
        } catch (error) {
            logger.error('License revenue calculation error', {
                error: error.message,
                licenseId: id,
                options
            });
            throw error;
        }
    }

    /**
     * Get license statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} License statistics
     */
    async getStatistics(options = {}) {
        try {
            const { startDate, endDate, licenseType } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('status, license_type, royalty_rate, advance_payment, minimum_guarantee, created_at');

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            if (licenseType) {
                query = query.eq('license_type', licenseType);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch license statistics', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const stats = {
                total: data.length,
                byStatus: {},
                byLicenseType: {},
                totalAdvancePayments: 0,
                totalMinimumGuarantees: 0,
                averageRoyaltyRate: 0,
                recentLicenses: 0
            };

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            let totalRoyaltyRate = 0;
            let royaltyCount = 0;

            data.forEach(license => {
                // By status
                stats.byStatus[license.status] = (stats.byStatus[license.status] || 0) + 1;

                // By license type
                stats.byLicenseType[license.license_type] = 
                    (stats.byLicenseType[license.license_type] || 0) + 1;

                // Financial aggregations
                stats.totalAdvancePayments += license.advance_payment || 0;
                stats.totalMinimumGuarantees += license.minimum_guarantee || 0;

                if (license.royalty_rate) {
                    totalRoyaltyRate += license.royalty_rate;
                    royaltyCount++;
                }

                // Recent licenses
                if (new Date(license.created_at) > thirtyDaysAgo) {
                    stats.recentLicenses++;
                }
            });

            stats.averageRoyaltyRate = royaltyCount > 0 ? 
                Math.round((totalRoyaltyRate / royaltyCount) * 100) / 100 : 0;

            return stats;
        } catch (error) {
            logger.error('License statistics error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Generate license report
     * @param {string} publicationId - Publication ID
     * @returns {Promise<Object>} License report
     */
    async generateLicenseReport(publicationId) {
        try {
            const licenses = await this.findByPublicationId(publicationId, { 
                includeExpired: true,
                includePayments: true 
            });

            const report = {
                publicationId,
                totalLicenses: licenses.length,
                activeLicenses: licenses.filter(l => l.status === 'active').length,
                totalRevenue: 0,
                totalAdvances: 0,
                totalMinimumGuarantees: 0,
                licensesByType: {},
                revenueByLicense: {},
                upcomingExpirations: []
            };

            for (const license of licenses) {
                // Count by type
                report.licensesByType[license.license_type] = 
                    (report.licensesByType[license.license_type] || 0) + 1;

                // Calculate revenue for this license
                const revenue = await this.calculateRevenue(license.id);
                report.revenueByLicense[license.id] = revenue;
                report.totalRevenue += revenue.totalReceived;
                report.totalAdvances += revenue.advancePayment;
                report.totalMinimumGuarantees += revenue.minimumGuarantee;

                // Check for upcoming expirations (next 90 days)
                if (license.end_date && license.status === 'active') {
                    const expirationDate = new Date(license.end_date);
                    const ninetyDaysFromNow = new Date();
                    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

                    if (expirationDate <= ninetyDaysFromNow) {
                        report.upcomingExpirations.push({
                            licenseId: license.id,
                            licenseeNa: license.licensee_name,
                            licenseType: license.license_type,
                            expirationDate: license.end_date,
                            daysUntilExpiration: Math.ceil(
                                (expirationDate - new Date()) / (1000 * 60 * 60 * 24)
                            )
                        });
                    }
                }
            }

            // Sort upcoming expirations by date
            report.upcomingExpirations.sort((a, b) => 
                new Date(a.expirationDate) - new Date(b.expirationDate)
            );

            return report;
        } catch (error) {
            logger.error('License report generation error', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Validate license terms
     * @param {Object} licenseData - License data to validate
     * @returns {Object} Validation result
     */
    validateLicenseTerms(licenseData) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!licenseData.publication_id) {
            errors.push('Publication ID is required');
        }

        if (!licenseData.license_type) {
            errors.push('License type is required');
        }

        if (!licenseData.licensee_name) {
            errors.push('Licensee name is required');
        }

        if (!licenseData.start_date) {
            errors.push('Start date is required');
        }

        // Date validation
        if (licenseData.start_date && licenseData.end_date) {
            const startDate = new Date(licenseData.start_date);
            const endDate = new Date(licenseData.end_date);

            if (endDate <= startDate) {
                errors.push('End date must be after start date');
            }
        }

        // Financial validation
        if (licenseData.royalty_rate && (licenseData.royalty_rate < 0 || licenseData.royalty_rate > 100)) {
            errors.push('Royalty rate must be between 0 and 100 percent');
        }

        if (licenseData.advance_payment && licenseData.advance_payment < 0) {
            errors.push('Advance payment cannot be negative');
        }

        if (licenseData.minimum_guarantee && licenseData.minimum_guarantee < 0) {
            errors.push('Minimum guarantee cannot be negative');
        }

        // Business logic warnings
        if (licenseData.royalty_rate && licenseData.royalty_rate > 50) {
            warnings.push('Royalty rate above 50% is unusually high');
        }

        if (licenseData.advance_payment && licenseData.minimum_guarantee &&
            licenseData.advance_payment > licenseData.minimum_guarantee) {
            warnings.push('Advance payment exceeds minimum guarantee');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

module.exports = LicensingModel;
