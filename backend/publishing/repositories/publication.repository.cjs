/**
 * Publication Repository - Advanced Data Access Layer
 * Provides sophisticated database operations for publications
 * Handles complex queries, relationships, analytics, and optimizations
 * Implements enterprise-grade patterns with caching, pagination, and filtering
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class PublicationRepository {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'publications';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // ========== Core CRUD Operations ==========

    /**
     * Create new publication with comprehensive setup
     */
    async create(publicationData, authorId, options = {}) {
        try {
            const publicationId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Prepare publication data
            const dbData = {
                id: publicationId,
                title: publicationData.title,
                subtitle: publicationData.subtitle || null,
                series_name: publicationData.series_name || null,
                series_number: publicationData.series_number || null,
                author_id: authorId,
                description: publicationData.description || '',
                language: publicationData.language || 'en',
                genre: publicationData.genre || 'fiction',
                target_audience: publicationData.target_audience || 'adult',
                isbn_13: publicationData.isbn_13 || null,
                isbn_10: publicationData.isbn_10 || null,
                publication_date: publicationData.publication_date || null,
                word_count: publicationData.word_count || 0,
                page_count: publicationData.page_count || 0,
                pricing: JSON.stringify(publicationData.pricing || {}),
                territories: JSON.stringify(publicationData.territories || []),
                keywords: JSON.stringify(publicationData.keywords || []),
                bisac_categories: JSON.stringify(publicationData.bisac_categories || []),
                status: 'draft',
                publication_type: publicationData.publication_type || 'ebook',
                drm_settings: JSON.stringify(publicationData.drm_settings || {}),
                preview_percentage: publicationData.preview_percentage || 10.0,
                created_at: timestamp,
                updated_at: timestamp,
                created_by: authorId,
                updated_by: authorId,
                version: 1
            };

            // Insert publication
            const { data: publication, error } = await this.supabase
                .from(this.tableName)
                .insert(dbData)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to create publication: ${error.message}`, 500);
            }

            // Create default publication format entries
            if (options.create_default_formats) {
                await this.createDefaultFormats(publicationId);
            }

            // Initialize collaboration workspace
            if (options.initialize_collaboration) {
                await this.initializeCollaborationWorkspace(publicationId, authorId);
            }

            // Setup territorial rights
            if (options.setup_rights && publicationData.territories) {
                await this.setupTerritorialRights(publicationId, publicationData.territories);
            }

            logger.info('Publication created successfully', {
                publicationId,
                title: publicationData.title,
                authorId,
                options
            });

            // Clear relevant caches
            this.invalidateCache(['publications_by_author', authorId]);

            return this.transformFromDatabase(publication);

        } catch (error) {
            logger.error('Error creating publication', {
                error: error.message,
                stack: error.stack,
                publicationData: {
                    title: publicationData.title,
                    authorId
                }
            });
            throw error;
        }
    }

    /**
     * Find publication by ID with comprehensive details
     */
    async findById(id, options = {}) {
        try {
            const cacheKey = `publication_${id}_${JSON.stringify(options)}`;
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            const { data: publication, error } = await query;

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Publication not found
                }
                throw new AppError(`Failed to find publication: ${error.message}`, 500);
            }

            let result = this.transformFromDatabase(publication);

            // Load additional data based on options
            if (options.include_author) {
                result.author = await this.getAuthorDetails(publication.author_id);
            }

            if (options.include_chapters) {
                result.chapters = await this.getPublicationChapters(id);
            }

            if (options.include_formats) {
                result.formats = await this.getPublicationFormats(id);
            }

            if (options.include_rights) {
                result.rights = await this.getTerritorialRights(id);
            }

            if (options.include_collaborations) {
                result.collaborations = await this.getCollaborations(id);
            }

            if (options.include_distribution) {
                result.distribution = await this.getDistributionStatus(id);
            }

            if (options.include_analytics) {
                result.analytics = await this.getPublicationAnalytics(id);
            }

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            logger.error('Error finding publication by ID', {
                error: error.message,
                stack: error.stack,
                publicationId: id,
                options
            });
            throw error;
        }
    }

    /**
     * Update publication with version control
     */
    async update(id, updateData, userId, options = {}) {
        try {
            const existing = await this.findById(id);
            if (!existing) {
                throw new AppError('Publication not found', 404);
            }

            // Version control
            const newVersion = existing.version + 1;
            const timestamp = new Date().toISOString();

            // Prepare update data
            const dbData = {
                ...updateData,
                updated_at: timestamp,
                updated_by: userId,
                version: newVersion
            };

            // Handle JSON fields
            if (updateData.pricing) {
                dbData.pricing = JSON.stringify(updateData.pricing);
            }
            if (updateData.territories) {
                dbData.territories = JSON.stringify(updateData.territories);
            }
            if (updateData.keywords) {
                dbData.keywords = JSON.stringify(updateData.keywords);
            }
            if (updateData.bisac_categories) {
                dbData.bisac_categories = JSON.stringify(updateData.bisac_categories);
            }
            if (updateData.drm_settings) {
                dbData.drm_settings = JSON.stringify(updateData.drm_settings);
            }

            // Create version snapshot before update
            if (options.create_version_snapshot) {
                await this.createVersionSnapshot(id, existing, userId);
            }

            const { data: publication, error } = await this.supabase
                .from(this.tableName)
                .update(dbData)
                .eq('id', id)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to update publication: ${error.message}`, 500);
            }

            // Handle territorial rights updates
            if (updateData.territories && options.update_rights) {
                await this.updateTerritorialRights(id, updateData.territories);
            }

            // Trigger workflow notifications
            if (options.notify_collaborators) {
                await this.notifyCollaborators(id, 'publication_updated', {
                    updated_fields: Object.keys(updateData),
                    updated_by: userId
                });
            }

            logger.info('Publication updated successfully', {
                publicationId: id,
                version: newVersion,
                updatedBy: userId,
                updatedFields: Object.keys(updateData)
            });

            // Invalidate caches
            this.invalidateCache([`publication_${id}`, 'publications_by_author']);

            return this.transformFromDatabase(publication);

        } catch (error) {
            logger.error('Error updating publication', {
                error: error.message,
                stack: error.stack,
                publicationId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Delete publication with comprehensive cleanup
     */
    async delete(id, userId, options = {}) {
        try {
            const publication = await this.findById(id);
            if (!publication) {
                throw new AppError('Publication not found', 404);
            }

            // Check permissions
            if (publication.author_id !== userId && !options.force_delete) {
                throw new AppError('Insufficient permissions to delete publication', 403);
            }

            // Soft delete by default
            if (options.soft_delete !== false) {
                const { error } = await this.supabase
                    .from(this.tableName)
                    .update({
                        status: 'archived',
                        updated_at: new Date().toISOString(),
                        updated_by: userId
                    })
                    .eq('id', id);

                if (error) {
                    throw new AppError(`Failed to archive publication: ${error.message}`, 500);
                }

                logger.info('Publication archived', { publicationId: id, userId });
            } else {
                // Hard delete - cleanup related data first
                await this.cleanupRelatedData(id, options);

                const { error } = await this.supabase
                    .from(this.tableName)
                    .delete()
                    .eq('id', id);

                if (error) {
                    throw new AppError(`Failed to delete publication: ${error.message}`, 500);
                }

                logger.info('Publication permanently deleted', { publicationId: id, userId });
            }

            // Invalidate caches
            this.invalidateCache([`publication_${id}`, 'publications_by_author']);

            return { success: true, deleted: options.soft_delete === false };

        } catch (error) {
            logger.error('Error deleting publication', {
                error: error.message,
                stack: error.stack,
                publicationId: id,
                options
            });
            throw error;
        }
    }

    // ========== Search and Filtering ==========

    /**
     * List publications with advanced filtering and pagination
     */
    async list(filters = {}, pagination = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                sort_by = 'updated_at',
                sort_order = 'desc'
            } = pagination;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact' });

            // Apply filters
            if (filters.author_id) {
                query = query.eq('author_id', filters.author_id);
            }

            if (filters.status && Array.isArray(filters.status)) {
                query = query.in('status', filters.status);
            } else if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.publication_type) {
                query = query.eq('publication_type', filters.publication_type);
            }

            if (filters.genre) {
                query = query.eq('genre', filters.genre);
            }

            if (filters.language) {
                query = query.eq('language', filters.language);
            }

            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            if (filters.created_after) {
                query = query.gte('created_at', filters.created_after);
            }

            if (filters.created_before) {
                query = query.lte('created_at', filters.created_before);
            }

            // Apply sorting and pagination
            query = query
                .order(sort_by, { ascending: sort_order === 'asc' })
                .range(offset, offset + limit - 1);

            const { data: publications, error, count } = await query;

            if (error) {
                throw new AppError(`Failed to list publications: ${error.message}`, 500);
            }

            const transformedPublications = publications.map(pub => this.transformFromDatabase(pub));

            // Load additional data if requested
            if (options.include_author) {
                for (const publication of transformedPublications) {
                    publication.author = await this.getAuthorDetails(publication.author_id);
                }
            }

            if (options.include_analytics) {
                for (const publication of transformedPublications) {
                    publication.analytics = await this.getPublicationAnalytics(publication.id);
                }
            }

            return {
                publications: transformedPublications,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit),
                    has_more: offset + limit < count
                },
                filters,
                sort: { sort_by, sort_order }
            };

        } catch (error) {
            logger.error('Error listing publications', {
                error: error.message,
                stack: error.stack,
                filters,
                pagination
            });
            throw error;
        }
    }

    /**
     * Search publications with advanced text search
     */
    async search(searchQuery, filters = {}, pagination = {}) {
        try {
            // Use PostgreSQL full-text search
            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact' })
                .textSearch('search_vector', searchQuery, {
                    type: 'websearch',
                    config: 'english'
                });

            // Apply additional filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });

            const { page = 1, limit = 20 } = pagination;
            const offset = (page - 1) * limit;

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data: publications, error, count } = await query;

            if (error) {
                throw new AppError(`Search failed: ${error.message}`, 500);
            }

            return {
                publications: publications.map(pub => this.transformFromDatabase(pub)),
                search_query: searchQuery,
                total_results: count,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            logger.error('Error searching publications', {
                error: error.message,
                searchQuery,
                filters
            });
            throw error;
        }
    }

    // ========== Analytics and Reporting ==========

    /**
     * Get publication analytics
     */
    async getPublicationAnalytics(publicationId, timeframe = '30d') {
        try {
            // Get basic metrics
            const [
                distributionMetrics,
                salesMetrics,
                engagementMetrics,
                revenueMetrics
            ] = await Promise.all([
                this.getDistributionMetrics(publicationId, timeframe),
                this.getSalesMetrics(publicationId, timeframe),
                this.getEngagementMetrics(publicationId, timeframe),
                this.getRevenueMetrics(publicationId, timeframe)
            ]);

            return {
                publication_id: publicationId,
                timeframe,
                distribution: distributionMetrics,
                sales: salesMetrics,
                engagement: engagementMetrics,
                revenue: revenueMetrics,
                generated_at: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error getting publication analytics', {
                error: error.message,
                publicationId,
                timeframe
            });
            return {
                publication_id: publicationId,
                error: 'Analytics temporarily unavailable'
            };
        }
    }

    /**
     * Get author's publication summary
     */
    async getAuthorSummary(authorId) {
        try {
            const { data: publications, error } = await this.supabase
                .from(this.tableName)
                .select('status, publication_type, genre, created_at')
                .eq('author_id', authorId);

            if (error) {
                throw new AppError(`Failed to get author summary: ${error.message}`, 500);
            }

            const summary = {
                total_publications: publications.length,
                by_status: {},
                by_type: {},
                by_genre: {},
                publishing_timeline: []
            };

            // Aggregate by status
            publications.forEach(pub => {
                summary.by_status[pub.status] = (summary.by_status[pub.status] || 0) + 1;
                summary.by_type[pub.publication_type] = (summary.by_type[pub.publication_type] || 0) + 1;
                summary.by_genre[pub.genre] = (summary.by_genre[pub.genre] || 0) + 1;
            });

            // Timeline data
            const timelineData = publications.reduce((acc, pub) => {
                const year = new Date(pub.created_at).getFullYear();
                acc[year] = (acc[year] || 0) + 1;
                return acc;
            }, {});

            summary.publishing_timeline = Object.entries(timelineData)
                .map(([year, count]) => ({ year: parseInt(year), publications: count }))
                .sort((a, b) => a.year - b.year);

            return summary;

        } catch (error) {
            logger.error('Error getting author summary', {
                error: error.message,
                authorId
            });
            throw error;
        }
    }

    // ========== Helper Methods ==========

    /**
     * Transform database record to domain model
     */
    transformFromDatabase(dbRecord) {
        if (!dbRecord) return null;

        try {
            return {
                id: dbRecord.id,
                title: dbRecord.title,
                subtitle: dbRecord.subtitle,
                series_name: dbRecord.series_name,
                series_number: dbRecord.series_number,
                author_id: dbRecord.author_id,
                description: dbRecord.description,
                language: dbRecord.language,
                genre: dbRecord.genre,
                target_audience: dbRecord.target_audience,
                isbn_13: dbRecord.isbn_13,
                isbn_10: dbRecord.isbn_10,
                publication_date: dbRecord.publication_date,
                word_count: dbRecord.word_count,
                page_count: dbRecord.page_count,
                pricing: this.safeJsonParse(dbRecord.pricing, {}),
                territories: this.safeJsonParse(dbRecord.territories, []),
                keywords: this.safeJsonParse(dbRecord.keywords, []),
                bisac_categories: this.safeJsonParse(dbRecord.bisac_categories, []),
                status: dbRecord.status,
                publication_type: dbRecord.publication_type,
                drm_settings: this.safeJsonParse(dbRecord.drm_settings, {}),
                preview_percentage: dbRecord.preview_percentage,
                created_at: dbRecord.created_at,
                updated_at: dbRecord.updated_at,
                created_by: dbRecord.created_by,
                updated_by: dbRecord.updated_by,
                version: dbRecord.version
            };
        } catch (error) {
            logger.error('Error transforming database record', {
                error: error.message,
                recordId: dbRecord?.id
            });
            return dbRecord;
        }
    }

    /**
     * Safe JSON parsing with fallback
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
     * Create default publication formats
     */
    async createDefaultFormats(publicationId) {
        const defaultFormats = ['epub', 'pdf'];
        
        for (const format of defaultFormats) {
            await this.supabase
                .from('publication_formats')
                .insert({
                    publication_id: publicationId,
                    format_type: format,
                    file_url: '',
                    conversion_status: 'pending'
                });
        }
    }

    /**
     * Get publication chapters
     */
    async getPublicationChapters(publicationId) {
        const { data: chapters, error } = await this.supabase
            .from('chapters')
            .select('*')
            .eq('publication_id', publicationId)
            .order('sort_order');

        if (error) {
            logger.error('Error getting chapters', { error: error.message, publicationId });
            return [];
        }

        return chapters;
    }

    /**
     * Get publication formats
     */
    async getPublicationFormats(publicationId) {
        const { data: formats, error } = await this.supabase
            .from('publication_formats')
            .select('*')
            .eq('publication_id', publicationId);

        if (error) {
            logger.error('Error getting formats', { error: error.message, publicationId });
            return [];
        }

        return formats;
    }

    /**
     * Get territorial rights
     */
    async getTerritorialRights(publicationId) {
        const { data: rights, error } = await this.supabase
            .from('territorial_rights')
            .select('*')
            .eq('publication_id', publicationId);

        if (error) {
            logger.error('Error getting territorial rights', { error: error.message, publicationId });
            return [];
        }

        return rights;
    }

    /**
     * Get author details
     */
    async getAuthorDetails(authorId) {
        const { data: author, error } = await this.supabase
            .from('authors')
            .select('id, pen_name, real_name, biography, profile_image')
            .eq('id', authorId)
            .single();

        if (error) {
            logger.error('Error getting author details', { error: error.message, authorId });
            return null;
        }

        return author;
    }

    /**
     * Get collaborations
     */
    async getCollaborations(publicationId) {
        const { data: collaborations, error } = await this.supabase
            .from('collaborations')
            .select('*')
            .eq('publication_id', publicationId);

        if (error) {
            logger.error('Error getting collaborations', { error: error.message, publicationId });
            return [];
        }

        return collaborations;
    }

    /**
     * Get distribution status
     */
    async getDistributionStatus(publicationId) {
        const { data: distribution, error } = await this.supabase
            .from('publication_distribution_status')
            .select('*')
            .eq('publication_id', publicationId);

        if (error) {
            logger.error('Error getting distribution status', { error: error.message, publicationId });
            return [];
        }

        return distribution;
    }

    /**
     * Placeholder analytics methods
     */
    async getDistributionMetrics(publicationId, timeframe) {
        // TODO: Implement actual distribution metrics
        logger.debug('Getting distribution metrics', { publicationId, timeframe });
        
        return {
            stores_live: 0,
            stores_pending: 0,
            total_stores: 0,
            coverage_percentage: 0
        };
    }

    async getSalesMetrics(publicationId, timeframe) {
        // TODO: Implement actual sales metrics
        logger.debug('Getting sales metrics', { publicationId, timeframe });
        
        return {
            total_sales: 0,
            sales_trend: 'stable',
            bestseller_rank: null
        };
    }

    async getEngagementMetrics(publicationId, timeframe) {
        // TODO: Implement actual engagement metrics
        logger.debug('Getting engagement metrics', { publicationId, timeframe });
        
        return {
            downloads: 0,
            reviews: 0,
            average_rating: 0
        };
    }

    async getRevenueMetrics(publicationId, timeframe) {
        // TODO: Implement actual revenue metrics
        logger.debug('Getting revenue metrics', { publicationId, timeframe });
        
        return {
            total_revenue: 0,
            revenue_trend: 'stable',
            top_earning_store: null
        };
    }
}

module.exports = PublicationRepository;
