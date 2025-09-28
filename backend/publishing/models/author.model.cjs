const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Author Model
 * Manages author data and profiles for digital publishing
 */
class AuthorModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'authors';
    }

    /**
     * Create a new author
     * @param {Object} authorData - Author data
     * @returns {Promise<Object>} Created author
     */
    async create(authorData) {
        try {
            const {
                pen_name,
                real_name,
                biography,
                profile_image,
                social_links,
                contact_info,
                tax_info,
                payout_settings,
                created_by
            } = authorData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    pen_name,
                    real_name,
                    biography,
                    profile_image,
                    social_links,
                    contact_info,
                    tax_info,
                    payout_settings,
                    created_by,
                    updated_by: created_by
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create author', {
                    error: error.message,
                    authorData: { pen_name, real_name }
                });
                throw error;
            }

            logger.author.created(data.id, data.pen_name, {
                real_name: data.real_name,
                created_by
            });

            return data;
        } catch (error) {
            logger.error('Author creation error', {
                error: error.message,
                stack: error.stack,
                authorData
            });
            throw error;
        }
    }

    /**
     * Get author by ID
     * @param {string} id - Author ID
     * @returns {Promise<Object|null>} Author data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found is acceptable
                logger.error('Failed to fetch author by ID', {
                    error: error.message,
                    authorId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Author fetch error', {
                error: error.message,
                authorId: id
            });
            throw error;
        }
    }

    /**
     * Get author by pen name
     * @param {string} penName - Author's pen name
     * @returns {Promise<Object|null>} Author data
     */
    async findByPenName(penName) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('pen_name', penName)
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch author by pen name', {
                    error: error.message,
                    penName
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Author fetch by pen name error', {
                error: error.message,
                penName
            });
            throw error;
        }
    }

    /**
     * Get all authors with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Authors list with pagination
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                isVerified,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact' })
                .eq('is_active', true);

            // Add search filter
            if (search) {
                query = query.or(`pen_name.ilike.%${search}%,real_name.ilike.%${search}%`);
            }

            // Add verification filter
            if (typeof isVerified === 'boolean') {
                query = query.eq('is_verified', isVerified);
            }

            // Add sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Add pagination
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch authors', {
                    error: error.message,
                    options
                });
                throw error;
            }

            return {
                authors: data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Authors fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Update author
     * @param {string} id - Author ID
     * @param {Object} updateData - Data to update
     * @param {string} updatedBy - User ID who is updating
     * @returns {Promise<Object>} Updated author
     */
    async update(id, updateData, updatedBy) {
        try {
            const oldAuthor = await this.findById(id);
            if (!oldAuthor) {
                throw new Error('Author not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    ...updateData,
                    updated_by: updatedBy,
                    version: oldAuthor.version + 1
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update author', {
                    error: error.message,
                    authorId: id,
                    updateData
                });
                throw error;
            }

            // Log the changes
            const changes = {};
            Object.keys(updateData).forEach(key => {
                if (oldAuthor[key] !== updateData[key]) {
                    changes[key] = {
                        from: oldAuthor[key],
                        to: updateData[key]
                    };
                }
            });

            logger.author.updated(data.id, data.pen_name, changes, {
                updated_by: updatedBy
            });

            return data;
        } catch (error) {
            logger.error('Author update error', {
                error: error.message,
                authorId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Soft delete author
     * @param {string} id - Author ID
     * @param {string} deletedBy - User ID who is deleting
     * @returns {Promise<boolean>} Success status
     */
    async delete(id, deletedBy) {
        try {
            const author = await this.findById(id);
            if (!author) {
                throw new Error('Author not found');
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .update({
                    is_active: false,
                    updated_by: deletedBy
                })
                .eq('id', id);

            if (error) {
                logger.error('Failed to delete author', {
                    error: error.message,
                    authorId: id
                });
                throw error;
            }

            logger.author.deleted(id, author.pen_name, {
                deleted_by: deletedBy
            });

            return true;
        } catch (error) {
            logger.error('Author deletion error', {
                error: error.message,
                authorId: id
            });
            throw error;
        }
    }

    /**
     * Verify author account
     * @param {string} id - Author ID
     * @param {string} verifiedBy - User ID who is verifying
     * @returns {Promise<Object>} Updated author
     */
    async verify(id, verifiedBy) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    is_verified: true,
                    updated_by: verifiedBy
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to verify author', {
                    error: error.message,
                    authorId: id
                });
                throw error;
            }

            logger.author.updated(id, data.pen_name, {
                is_verified: { from: false, to: true }
            }, {
                verified_by: verifiedBy
            });

            return data;
        } catch (error) {
            logger.error('Author verification error', {
                error: error.message,
                authorId: id
            });
            throw error;
        }
    }

    /**
     * Get author's publications
     * @param {string} authorId - Author ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Author's publications
     */
    async getPublications(authorId, options = {}) {
        try {
            const {
                status,
                publicationType,
                limit = 20,
                page = 1
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from('publications')
                .select(`
                    id,
                    title,
                    subtitle,
                    status,
                    publication_type,
                    publication_date,
                    cover_image,
                    created_at
                `)
                .eq('author_id', authorId);

            if (status) {
                query = query.eq('status', status);
            }

            if (publicationType) {
                query = query.eq('publication_type', publicationType);
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch author publications', {
                    error: error.message,
                    authorId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Author publications fetch error', {
                error: error.message,
                authorId,
                options
            });
            throw error;
        }
    }

    /**
     * Get author statistics
     * @param {string} authorId - Author ID
     * @returns {Promise<Object>} Author statistics
     */
    async getStatistics(authorId) {
        try {
            // Get publication counts by status
            const { data: publicationStats, error: pubError } = await this.supabase
                .from('publications')
                .select('status, publication_type')
                .eq('author_id', authorId);

            if (pubError) {
                throw pubError;
            }

            // Get sales data
            const { data: salesData, error: salesError } = await this.supabase
                .from('sales_reports')
                .select('units_sold, revenue_net')
                .in('publication_id', 
                    publicationStats.map(pub => pub.id)
                );

            if (salesError) {
                throw salesError;
            }

            // Calculate statistics
            const stats = {
                totalPublications: publicationStats.length,
                publicationsByStatus: {},
                publicationsByType: {},
                totalSales: {
                    units: 0,
                    revenue: 0
                }
            };

            // Count by status
            publicationStats.forEach(pub => {
                stats.publicationsByStatus[pub.status] = 
                    (stats.publicationsByStatus[pub.status] || 0) + 1;
                stats.publicationsByType[pub.publication_type] = 
                    (stats.publicationsByType[pub.publication_type] || 0) + 1;
            });

            // Sum sales
            salesData.forEach(sale => {
                stats.totalSales.units += sale.units_sold || 0;
                stats.totalSales.revenue += parseFloat(sale.revenue_net || 0);
            });

            return stats;
        } catch (error) {
            logger.error('Author statistics error', {
                error: error.message,
                authorId
            });
            throw error;
        }
    }

    /**
     * Update author payout settings
     * @param {string} authorId - Author ID
     * @param {Object} payoutSettings - Payout configuration
     * @returns {Promise<Object>} Updated author
     */
    async updatePayoutSettings(authorId, payoutSettings) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    payout_settings: payoutSettings
                })
                .eq('id', authorId)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update author payout settings', {
                    error: error.message,
                    authorId,
                    payoutSettings
                });
                throw error;
            }

            logger.author.updated(authorId, data.pen_name, {
                payout_settings: { to: payoutSettings }
            });

            return data;
        } catch (error) {
            logger.error('Author payout settings update error', {
                error: error.message,
                authorId,
                payoutSettings
            });
            throw error;
        }
    }
}

module.exports = AuthorModel;
