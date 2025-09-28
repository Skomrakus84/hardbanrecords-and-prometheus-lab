/**
 * Publication Mapper - Data Transformation Layer
 * Handles transformation between database models and API responses
 * Provides comprehensive mapping with proper data formatting and structure
 * Implements enterprise-grade data transformation patterns
 */

const logger = require('../config/logger.cjs');

class PublicationMapper {
    
    // ========== Database to API Transformations ==========

    /**
     * Transform database publication to API response
     */
    static toApiResponse(dbPublication, options = {}) {
        if (!dbPublication) return null;

        try {
            const mapped = {
                id: dbPublication.id,
                title: dbPublication.title,
                description: dbPublication.description,
                publication_type: dbPublication.publication_type,
                genre: dbPublication.genre,
                language: dbPublication.language,
                target_audience: dbPublication.target_audience,
                isbn_13: dbPublication.isbn_13,
                isbn_10: dbPublication.isbn_10,
                publisher: dbPublication.publisher,
                publication_date: dbPublication.publication_date,
                word_count: dbPublication.word_count,
                page_count: dbPublication.page_count,
                status: dbPublication.status,
                created_at: dbPublication.created_at,
                updated_at: dbPublication.updated_at
            };

            // Include optional fields based on options
            if (options.includePricing && dbPublication.pricing) {
                mapped.pricing = this.mapPricing(dbPublication.pricing);
            }

            if (options.includeTerritories && dbPublication.territories) {
                mapped.territories = Array.isArray(dbPublication.territories) 
                    ? dbPublication.territories 
                    : JSON.parse(dbPublication.territories || '[]');
            }

            if (options.includeKeywords && dbPublication.keywords) {
                mapped.keywords = Array.isArray(dbPublication.keywords) 
                    ? dbPublication.keywords 
                    : JSON.parse(dbPublication.keywords || '[]');
            }

            if (options.includeBisacCategories && dbPublication.bisac_categories) {
                mapped.bisac_categories = Array.isArray(dbPublication.bisac_categories) 
                    ? dbPublication.bisac_categories 
                    : JSON.parse(dbPublication.bisac_categories || '[]');
            }

            if (options.includeMetadata && dbPublication.metadata) {
                mapped.metadata = typeof dbPublication.metadata === 'object' 
                    ? dbPublication.metadata 
                    : JSON.parse(dbPublication.metadata || '{}');
            }

            if (options.includeCollaboration && dbPublication.collaboration_settings) {
                mapped.collaboration_settings = typeof dbPublication.collaboration_settings === 'object' 
                    ? dbPublication.collaboration_settings 
                    : JSON.parse(dbPublication.collaboration_settings || '{}');
            }

            // Include related data if present
            if (options.includeAuthors && dbPublication.authors) {
                mapped.authors = Array.isArray(dbPublication.authors) 
                    ? dbPublication.authors.map(author => this.mapAuthor(author))
                    : [];
            }

            if (options.includeChapters && dbPublication.chapters) {
                mapped.chapters = Array.isArray(dbPublication.chapters) 
                    ? dbPublication.chapters.map(chapter => this.mapChapterSummary(chapter))
                    : [];
            }

            if (options.includeRights && dbPublication.rights) {
                mapped.rights = Array.isArray(dbPublication.rights) 
                    ? dbPublication.rights.map(right => this.mapRightSummary(right))
                    : [];
            }

            if (options.includeSales && dbPublication.sales_summary) {
                mapped.sales_summary = this.mapSalesSummary(dbPublication.sales_summary);
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping publication to API response', {
                error: error.message,
                publicationId: dbPublication.id
            });
            return null;
        }
    }

    /**
     * Transform multiple publications to API response
     */
    static toApiResponseList(dbPublications, options = {}) {
        if (!Array.isArray(dbPublications)) return [];

        return dbPublications
            .map(publication => this.toApiResponse(publication, options))
            .filter(mapped => mapped !== null);
    }

    /**
     * Transform publication to summary format
     */
    static toSummary(dbPublication) {
        if (!dbPublication) return null;

        return {
            id: dbPublication.id,
            title: dbPublication.title,
            publication_type: dbPublication.publication_type,
            genre: dbPublication.genre,
            language: dbPublication.language,
            status: dbPublication.status,
            publication_date: dbPublication.publication_date,
            word_count: dbPublication.word_count,
            created_at: dbPublication.created_at,
            updated_at: dbPublication.updated_at
        };
    }

    /**
     * Transform publication for search results
     */
    static toSearchResult(dbPublication, relevanceScore = null) {
        if (!dbPublication) return null;

        const result = {
            id: dbPublication.id,
            title: dbPublication.title,
            description: dbPublication.description,
            publication_type: dbPublication.publication_type,
            genre: dbPublication.genre,
            language: dbPublication.language,
            status: dbPublication.status,
            publication_date: dbPublication.publication_date
        };

        if (relevanceScore !== null) {
            result.relevance_score = relevanceScore;
        }

        return result;
    }

    // ========== API to Database Transformations ==========

    /**
     * Transform API create request to database format
     */
    static fromApiCreateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {
                title: apiData.title,
                description: apiData.description || null,
                publication_type: apiData.publication_type,
                genre: apiData.genre || null,
                language: apiData.language,
                target_audience: apiData.target_audience || null,
                isbn_13: apiData.isbn_13 || null,
                isbn_10: apiData.isbn_10 || null,
                publisher: apiData.publisher || null,
                publication_date: apiData.publication_date || null,
                word_count: apiData.word_count || null,
                page_count: apiData.page_count || null,
                status: apiData.status || 'draft'
            };

            // Handle JSON fields
            if (apiData.pricing) {
                mapped.pricing = typeof apiData.pricing === 'object' 
                    ? JSON.stringify(apiData.pricing) 
                    : apiData.pricing;
            }

            if (apiData.territories) {
                mapped.territories = Array.isArray(apiData.territories) 
                    ? JSON.stringify(apiData.territories) 
                    : apiData.territories;
            }

            if (apiData.keywords) {
                mapped.keywords = Array.isArray(apiData.keywords) 
                    ? JSON.stringify(apiData.keywords) 
                    : apiData.keywords;
            }

            if (apiData.bisac_categories) {
                mapped.bisac_categories = Array.isArray(apiData.bisac_categories) 
                    ? JSON.stringify(apiData.bisac_categories) 
                    : apiData.bisac_categories;
            }

            if (apiData.metadata) {
                mapped.metadata = typeof apiData.metadata === 'object' 
                    ? JSON.stringify(apiData.metadata) 
                    : apiData.metadata;
            }

            if (apiData.collaboration_settings) {
                mapped.collaboration_settings = typeof apiData.collaboration_settings === 'object' 
                    ? JSON.stringify(apiData.collaboration_settings) 
                    : apiData.collaboration_settings;
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping API create request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    /**
     * Transform API update request to database format
     */
    static fromApiUpdateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {};

            // Only include fields that are actually being updated
            const updatableFields = [
                'title', 'description', 'publication_type', 'genre', 'language',
                'target_audience', 'isbn_13', 'isbn_10', 'publisher', 
                'publication_date', 'word_count', 'page_count', 'status'
            ];

            updatableFields.forEach(field => {
                if (apiData[field] !== undefined) {
                    mapped[field] = apiData[field];
                }
            });

            // Handle JSON fields for updates
            if (apiData.pricing !== undefined) {
                mapped.pricing = typeof apiData.pricing === 'object' 
                    ? JSON.stringify(apiData.pricing) 
                    : apiData.pricing;
            }

            if (apiData.territories !== undefined) {
                mapped.territories = Array.isArray(apiData.territories) 
                    ? JSON.stringify(apiData.territories) 
                    : apiData.territories;
            }

            if (apiData.keywords !== undefined) {
                mapped.keywords = Array.isArray(apiData.keywords) 
                    ? JSON.stringify(apiData.keywords) 
                    : apiData.keywords;
            }

            if (apiData.bisac_categories !== undefined) {
                mapped.bisac_categories = Array.isArray(apiData.bisac_categories) 
                    ? JSON.stringify(apiData.bisac_categories) 
                    : apiData.bisac_categories;
            }

            if (apiData.metadata !== undefined) {
                mapped.metadata = typeof apiData.metadata === 'object' 
                    ? JSON.stringify(apiData.metadata) 
                    : apiData.metadata;
            }

            if (apiData.collaboration_settings !== undefined) {
                mapped.collaboration_settings = typeof apiData.collaboration_settings === 'object' 
                    ? JSON.stringify(apiData.collaboration_settings) 
                    : apiData.collaboration_settings;
            }

            // Add updated timestamp
            mapped.updated_at = new Date().toISOString();

            return mapped;

        } catch (error) {
            logger.error('Error mapping API update request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    // ========== Specialized Mapping Methods ==========

    /**
     * Map pricing data
     */
    static mapPricing(pricing) {
        if (!pricing) return null;

        try {
            const pricingData = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
            
            // Ensure all price values are properly formatted
            const mappedPricing = {};
            Object.entries(pricingData).forEach(([currency, priceData]) => {
                mappedPricing[currency] = {
                    retail_price: parseFloat(priceData.retail_price || 0),
                    wholesale_price: parseFloat(priceData.wholesale_price || 0),
                    currency: currency.toUpperCase()
                };
            });

            return mappedPricing;

        } catch (error) {
            logger.error('Error mapping pricing data', { error: error.message, pricing });
            return null;
        }
    }

    /**
     * Map author data
     */
    static mapAuthor(author) {
        if (!author) return null;

        return {
            id: author.id,
            first_name: author.first_name,
            last_name: author.last_name,
            display_name: author.display_name,
            role: author.role || 'author',
            bio: author.bio,
            email: author.email
        };
    }

    /**
     * Map chapter summary
     */
    static mapChapterSummary(chapter) {
        if (!chapter) return null;

        return {
            id: chapter.id,
            title: chapter.title,
            order_index: chapter.order_index,
            word_count: chapter.word_count,
            reading_time: chapter.reading_time,
            status: chapter.status,
            created_at: chapter.created_at,
            updated_at: chapter.updated_at
        };
    }

    /**
     * Map rights summary
     */
    static mapRightSummary(right) {
        if (!right) return null;

        return {
            id: right.id,
            right_type: right.right_type,
            territory: right.territory,
            language: right.language,
            license_type: right.license_type,
            exclusive: right.exclusive,
            status: right.status,
            start_date: right.start_date,
            end_date: right.end_date
        };
    }

    /**
     * Map sales summary
     */
    static mapSalesSummary(salesSummary) {
        if (!salesSummary) return null;

        try {
            const summary = typeof salesSummary === 'string' ? JSON.parse(salesSummary) : salesSummary;
            
            return {
                total_units_sold: parseInt(summary.total_units_sold || 0),
                total_gross_revenue: parseFloat(summary.total_gross_revenue || 0),
                total_net_revenue: parseFloat(summary.total_net_revenue || 0),
                total_royalties: parseFloat(summary.total_royalties || 0),
                currency: summary.currency || 'USD',
                last_sale_date: summary.last_sale_date,
                top_stores: summary.top_stores || [],
                sales_trend: summary.sales_trend || 'stable'
            };

        } catch (error) {
            logger.error('Error mapping sales summary', { error: error.message, salesSummary });
            return null;
        }
    }

    // ========== Analytics and Reporting Transformations ==========

    /**
     * Transform for analytics dashboard
     */
    static toAnalyticsDashboard(dbPublication, analyticsData = {}) {
        if (!dbPublication) return null;

        return {
            id: dbPublication.id,
            title: dbPublication.title,
            publication_type: dbPublication.publication_type,
            status: dbPublication.status,
            publication_date: dbPublication.publication_date,
            word_count: dbPublication.word_count,
            metrics: {
                total_sales: analyticsData.total_sales || 0,
                total_revenue: analyticsData.total_revenue || 0,
                average_rating: analyticsData.average_rating || 0,
                review_count: analyticsData.review_count || 0,
                download_count: analyticsData.download_count || 0
            },
            performance: {
                sales_velocity: analyticsData.sales_velocity || 0,
                revenue_trend: analyticsData.revenue_trend || 'stable',
                market_rank: analyticsData.market_rank || null,
                bestseller_status: analyticsData.bestseller_status || false
            }
        };
    }

    /**
     * Transform for export
     */
    static toExportFormat(dbPublication, format = 'json') {
        if (!dbPublication) return null;

        const baseData = this.toApiResponse(dbPublication, {
            includePricing: true,
            includeTerritories: true,
            includeKeywords: true,
            includeBisacCategories: true,
            includeMetadata: true
        });

        switch (format) {
            case 'csv':
                return this.toCsvFormat(baseData);
            case 'xml':
                return this.toXmlFormat(baseData);
            default:
                return baseData;
        }
    }

    /**
     * Transform to CSV format
     */
    static toCsvFormat(publicationData) {
        if (!publicationData) return null;

        return {
            id: publicationData.id,
            title: publicationData.title,
            description: publicationData.description?.replace(/,/g, ';') || '',
            publication_type: publicationData.publication_type,
            genre: publicationData.genre,
            language: publicationData.language,
            target_audience: publicationData.target_audience,
            isbn_13: publicationData.isbn_13,
            isbn_10: publicationData.isbn_10,
            publisher: publicationData.publisher,
            publication_date: publicationData.publication_date,
            word_count: publicationData.word_count,
            page_count: publicationData.page_count,
            status: publicationData.status,
            keywords: publicationData.keywords ? publicationData.keywords.join(';') : '',
            territories: publicationData.territories ? publicationData.territories.join(';') : '',
            created_at: publicationData.created_at,
            updated_at: publicationData.updated_at
        };
    }

    /**
     * Transform to XML format
     */
    static toXmlFormat(publicationData) {
        if (!publicationData) return null;

        // Basic XML structure - would typically use a proper XML library
        return {
            publication: {
                '@id': publicationData.id,
                title: publicationData.title,
                description: publicationData.description,
                publication_type: publicationData.publication_type,
                genre: publicationData.genre,
                language: publicationData.language,
                target_audience: publicationData.target_audience,
                isbn: {
                    isbn_13: publicationData.isbn_13,
                    isbn_10: publicationData.isbn_10
                },
                publisher: publicationData.publisher,
                publication_date: publicationData.publication_date,
                metrics: {
                    word_count: publicationData.word_count,
                    page_count: publicationData.page_count
                },
                status: publicationData.status,
                keywords: publicationData.keywords || [],
                territories: publicationData.territories || [],
                timestamps: {
                    created_at: publicationData.created_at,
                    updated_at: publicationData.updated_at
                }
            }
        };
    }

    // ========== Validation and Utility Methods ==========

    /**
     * Validate mapped data
     */
    static validateMappedData(mappedData, requiredFields = []) {
        if (!mappedData) return false;

        for (const field of requiredFields) {
            if (mappedData[field] === undefined || mappedData[field] === null) {
                logger.warn('Missing required field in mapped data', { field, mappedData });
                return false;
            }
        }

        return true;
    }

    /**
     * Deep clean mapped data (remove null/undefined values)
     */
    static cleanMappedData(data) {
        if (!data || typeof data !== 'object') return data;

        const cleaned = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    const cleanedNested = this.cleanMappedData(value);
                    if (Object.keys(cleanedNested).length > 0) {
                        cleaned[key] = cleanedNested;
                    }
                } else {
                    cleaned[key] = value;
                }
            }
        });

        return cleaned;
    }
}

module.exports = PublicationMapper;
