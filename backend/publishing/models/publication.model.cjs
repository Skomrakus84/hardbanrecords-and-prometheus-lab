const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Publication Model
 * Manages publications (books, ebooks, audiobooks) for digital publishing
 */
class PublicationModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'publications';
    }

    /**
     * Create a new publication
     * @param {Object} publicationData - Publication data
     * @returns {Promise<Object>} Created publication
     */
    async create(publicationData) {
        try {
            const {
                title,
                subtitle,
                series_name,
                series_number,
                author_id,
                description,
                language,
                isbn_13,
                isbn_10,
                asin,
                publication_date,
                first_publication_date,
                page_count,
                word_count,
                reading_age_min,
                reading_age_max,
                content_warning,
                cover_image,
                back_cover_image,
                spine_image,
                marketing_images,
                price_settings,
                categories,
                keywords,
                publication_type,
                drm_settings,
                preview_percentage,
                created_by
            } = publicationData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    title,
                    subtitle,
                    series_name,
                    series_number,
                    author_id,
                    description,
                    language,
                    isbn_13,
                    isbn_10,
                    asin,
                    publication_date,
                    first_publication_date,
                    page_count,
                    word_count,
                    reading_age_min,
                    reading_age_max,
                    content_warning,
                    cover_image,
                    back_cover_image,
                    spine_image,
                    marketing_images,
                    price_settings,
                    categories,
                    keywords,
                    publication_type,
                    drm_settings,
                    preview_percentage,
                    status: 'draft',
                    created_by,
                    updated_by: created_by
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create publication', {
                    error: error.message,
                    publicationData: { title, author_id, publication_type }
                });
                throw error;
            }

            logger.publication.created(data.id, data.title, data.author_id, {
                publication_type: data.publication_type,
                created_by
            });

            return data;
        } catch (error) {
            logger.error('Publication creation error', {
                error: error.message,
                stack: error.stack,
                publicationData
            });
            throw error;
        }
    }

    /**
     * Get publication by ID with related data
     * @param {string} id - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Publication data
     */
    async findById(id, options = {}) {
        try {
            const { includeChapters = false, includeFormats = false, includeAuthor = false } = options;

            let selectFields = '*';
            
            if (includeAuthor) {
                selectFields += ', authors(pen_name, real_name, profile_image)';
            }

            const { data: publication, error } = await this.supabase
                .from(this.tableName)
                .select(selectFields)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch publication by ID', {
                    error: error.message,
                    publicationId: id
                });
                throw error;
            }

            if (!publication) {
                return null;
            }

            // Fetch chapters if requested
            if (includeChapters) {
                const { data: chapters, error: chaptersError } = await this.supabase
                    .from('chapters')
                    .select('*')
                    .eq('publication_id', id)
                    .order('sort_order');

                if (chaptersError) {
                    logger.error('Failed to fetch publication chapters', {
                        error: chaptersError.message,
                        publicationId: id
                    });
                } else {
                    publication.chapters = chapters;
                }
            }

            // Fetch formats if requested
            if (includeFormats) {
                const { data: formats, error: formatsError } = await this.supabase
                    .from('publication_formats')
                    .select('*')
                    .eq('publication_id', id);

                if (formatsError) {
                    logger.error('Failed to fetch publication formats', {
                        error: formatsError.message,
                        publicationId: id
                    });
                } else {
                    publication.formats = formats;
                }
            }

            return publication;
        } catch (error) {
            logger.error('Publication fetch error', {
                error: error.message,
                publicationId: id,
                options
            });
            throw error;
        }
    }

    /**
     * Get publications with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Publications list with pagination
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                authorId,
                status,
                publicationType,
                language,
                category,
                sortBy = 'created_at',
                sortOrder = 'desc',
                includeAuthor = false
            } = options;

            const offset = (page - 1) * limit;

            let selectFields = '*';
            if (includeAuthor) {
                selectFields += ', authors(pen_name, real_name, profile_image)';
            }

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields, { count: 'exact' });

            // Add filters
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            if (authorId) {
                query = query.eq('author_id', authorId);
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (publicationType) {
                if (Array.isArray(publicationType)) {
                    query = query.in('publication_type', publicationType);
                } else {
                    query = query.eq('publication_type', publicationType);
                }
            }

            if (language) {
                query = query.eq('language', language);
            }

            if (category) {
                query = query.contains('categories', [category]);
            }

            // Add sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Add pagination
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch publications', {
                    error: error.message,
                    options
                });
                throw error;
            }

            return {
                publications: data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Publications fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Update publication
     * @param {string} id - Publication ID
     * @param {Object} updateData - Data to update
     * @param {string} updatedBy - User ID who is updating
     * @returns {Promise<Object>} Updated publication
     */
    async update(id, updateData, updatedBy) {
        try {
            const oldPublication = await this.findById(id);
            if (!oldPublication) {
                throw new Error('Publication not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    ...updateData,
                    updated_by: updatedBy,
                    version: oldPublication.version + 1
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update publication', {
                    error: error.message,
                    publicationId: id,
                    updateData
                });
                throw error;
            }

            // Log the changes
            const changes = {};
            Object.keys(updateData).forEach(key => {
                if (JSON.stringify(oldPublication[key]) !== JSON.stringify(updateData[key])) {
                    changes[key] = {
                        from: oldPublication[key],
                        to: updateData[key]
                    };
                }
            });

            logger.publication.updated(data.id, data.title, changes, {
                updated_by: updatedBy
            });

            return data;
        } catch (error) {
            logger.error('Publication update error', {
                error: error.message,
                publicationId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Update publication status
     * @param {string} id - Publication ID
     * @param {string} newStatus - New status
     * @param {string} updatedBy - User ID who is updating
     * @param {string} reason - Reason for status change
     * @returns {Promise<Object>} Updated publication
     */
    async updateStatus(id, newStatus, updatedBy, reason = null) {
        try {
            const publication = await this.findById(id);
            if (!publication) {
                throw new Error('Publication not found');
            }

            const oldStatus = publication.status;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    status: newStatus,
                    updated_by: updatedBy
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update publication status', {
                    error: error.message,
                    publicationId: id,
                    newStatus,
                    oldStatus
                });
                throw error;
            }

            logger.publication.statusChanged(
                data.id, 
                data.title, 
                oldStatus, 
                newStatus, 
                {
                    updated_by: updatedBy,
                    reason
                }
            );

            return data;
        } catch (error) {
            logger.error('Publication status update error', {
                error: error.message,
                publicationId: id,
                newStatus
            });
            throw error;
        }
    }

    /**
     * Delete publication (soft delete)
     * @param {string} id - Publication ID
     * @param {string} deletedBy - User ID who is deleting
     * @returns {Promise<boolean>} Success status
     */
    async delete(id, deletedBy) {
        try {
            const publication = await this.findById(id);
            if (!publication) {
                throw new Error('Publication not found');
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .update({
                    status: 'archived',
                    updated_by: deletedBy
                })
                .eq('id', id);

            if (error) {
                logger.error('Failed to delete publication', {
                    error: error.message,
                    publicationId: id
                });
                throw error;
            }

            logger.publication.statusChanged(
                id, 
                publication.title, 
                publication.status, 
                'archived', 
                {
                    updated_by: deletedBy,
                    reason: 'Publication deleted'
                }
            );

            return true;
        } catch (error) {
            logger.error('Publication deletion error', {
                error: error.message,
                publicationId: id
            });
            throw error;
        }
    }

    /**
     * Get publication sales statistics
     * @param {string} id - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Sales statistics
     */
    async getSalesStatistics(id, options = {}) {
        try {
            const { startDate, endDate, storeChannel } = options;

            let query = this.supabase
                .from('sales_reports')
                .select('*')
                .eq('publication_id', id);

            if (startDate) {
                query = query.gte('report_period_start', startDate);
            }

            if (endDate) {
                query = query.lte('report_period_end', endDate);
            }

            if (storeChannel) {
                query = query.eq('store_channel_id', storeChannel);
            }

            const { data: sales, error } = await query;

            if (error) {
                logger.error('Failed to fetch publication sales', {
                    error: error.message,
                    publicationId: id,
                    options
                });
                throw error;
            }

            // Calculate statistics
            const stats = {
                totalUnits: 0,
                totalRevenue: 0,
                totalRoyalty: 0,
                byChannel: {},
                byTerritory: {},
                byFormat: {},
                periodStats: []
            };

            sales.forEach(sale => {
                stats.totalUnits += sale.units_sold || 0;
                stats.totalRevenue += parseFloat(sale.revenue_gross || 0);
                stats.totalRoyalty += parseFloat(sale.royalty_amount || 0);

                // By channel
                const channelId = sale.store_channel_id;
                if (!stats.byChannel[channelId]) {
                    stats.byChannel[channelId] = {
                        units: 0,
                        revenue: 0,
                        royalty: 0
                    };
                }
                stats.byChannel[channelId].units += sale.units_sold || 0;
                stats.byChannel[channelId].revenue += parseFloat(sale.revenue_gross || 0);
                stats.byChannel[channelId].royalty += parseFloat(sale.royalty_amount || 0);

                // By territory
                const territory = sale.territory_code || 'unknown';
                if (!stats.byTerritory[territory]) {
                    stats.byTerritory[territory] = {
                        units: 0,
                        revenue: 0
                    };
                }
                stats.byTerritory[territory].units += sale.units_sold || 0;
                stats.byTerritory[territory].revenue += parseFloat(sale.revenue_gross || 0);

                // By format
                const format = sale.format_type || 'unknown';
                if (!stats.byFormat[format]) {
                    stats.byFormat[format] = {
                        units: 0,
                        revenue: 0
                    };
                }
                stats.byFormat[format].units += sale.units_sold || 0;
                stats.byFormat[format].revenue += parseFloat(sale.revenue_gross || 0);
            });

            return stats;
        } catch (error) {
            logger.error('Publication sales statistics error', {
                error: error.message,
                publicationId: id,
                options
            });
            throw error;
        }
    }

    /**
     * Get publications by series
     * @param {string} seriesName - Series name
     * @param {string} authorId - Author ID
     * @returns {Promise<Array>} Publications in series
     */
    async findBySeries(seriesName, authorId) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('series_name', seriesName)
                .eq('author_id', authorId)
                .order('series_number');

            if (error) {
                logger.error('Failed to fetch publications by series', {
                    error: error.message,
                    seriesName,
                    authorId
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Publications by series fetch error', {
                error: error.message,
                seriesName,
                authorId
            });
            throw error;
        }
    }

    /**
     * Search publications
     * @param {string} searchTerm - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Search results
     */
    async search(searchTerm, filters = {}) {
        try {
            const { language, category, publicationType, minPrice, maxPrice } = filters;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    authors(pen_name, real_name, profile_image)
                `)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,keywords.cs.["${searchTerm}"]`)
                .eq('status', 'published');

            if (language) {
                query = query.eq('language', language);
            }

            if (category) {
                query = query.contains('categories', [category]);
            }

            if (publicationType) {
                query = query.eq('publication_type', publicationType);
            }

            // Price filtering would need to be done based on price_settings JSON
            // This is a simplified version
            if (minPrice || maxPrice) {
                // Add price filtering logic here
            }

            query = query.order('title');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to search publications', {
                    error: error.message,
                    searchTerm,
                    filters
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Publication search error', {
                error: error.message,
                searchTerm,
                filters
            });
            throw error;
        }
    }
}

module.exports = PublicationModel;
