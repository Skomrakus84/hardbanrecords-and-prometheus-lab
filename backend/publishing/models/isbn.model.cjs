const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * ISBN Model
 * Manages ISBN (International Standard Book Number) for publications
 */
class ISBNModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'isbns';
    }

    /**
     * Create a new ISBN record
     * @param {Object} isbnData - ISBN data
     * @returns {Promise<Object>} Created ISBN
     */
    async create(isbnData) {
        try {
            const {
                publication_id,
                isbn_13,
                isbn_10,
                format_type,
                assigned_date = new Date().toISOString(),
                status = 'active'
            } = isbnData;

            // Validate ISBN format
            this.validateISBN(isbn_13, isbn_10);

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    isbn_13,
                    isbn_10,
                    format_type,
                    assigned_date,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create ISBN', {
                    error: error.message,
                    isbnData: { publication_id, isbn_13, isbn_10, format_type }
                });
                throw error;
            }

            logger.info('ISBN created successfully', {
                isbnId: data.id,
                publicationId: data.publication_id,
                isbn13: data.isbn_13,
                formatType: data.format_type
            });

            return data;
        } catch (error) {
            logger.error('ISBN creation error', {
                error: error.message,
                stack: error.stack,
                isbnData
            });
            throw error;
        }
    }

    /**
     * Get ISBN by ID
     * @param {string} id - ISBN ID
     * @returns {Promise<Object|null>} ISBN data
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
                logger.error('Failed to fetch ISBN by ID', {
                    error: error.message,
                    isbnId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('ISBN fetch error', {
                error: error.message,
                isbnId: id
            });
            throw error;
        }
    }

    /**
     * Get ISBN by ISBN-13 number
     * @param {string} isbn13 - ISBN-13 number
     * @returns {Promise<Object|null>} ISBN data
     */
    async findByISBN13(isbn13) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `)
                .eq('isbn_13', isbn13)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch ISBN by ISBN-13', {
                    error: error.message,
                    isbn13
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('ISBN fetch by ISBN-13 error', {
                error: error.message,
                isbn13
            });
            throw error;
        }
    }

    /**
     * Get ISBNs by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} ISBNs list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const { formatType, status = 'active' } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId);

            if (formatType) {
                if (Array.isArray(formatType)) {
                    query = query.in('format_type', formatType);
                } else {
                    query = query.eq('format_type', formatType);
                }
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            query = query.order('assigned_date', { ascending: false });

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch ISBNs by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('ISBNs fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update ISBN
     * @param {string} id - ISBN ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated ISBN
     */
    async update(id, updateData) {
        try {
            const existingISBN = await this.findById(id);
            if (!existingISBN) {
                throw new Error('ISBN not found');
            }

            // Validate ISBN if being updated
            if (updateData.isbn_13 || updateData.isbn_10) {
                this.validateISBN(
                    updateData.isbn_13 || existingISBN.isbn_13,
                    updateData.isbn_10 || existingISBN.isbn_10
                );
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update ISBN', {
                    error: error.message,
                    isbnId: id,
                    updateData
                });
                throw error;
            }

            logger.info('ISBN updated successfully', {
                isbnId: data.id,
                publicationId: data.publication_id,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('ISBN update error', {
                error: error.message,
                isbnId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Deactivate ISBN
     * @param {string} id - ISBN ID
     * @param {string} reason - Deactivation reason
     * @returns {Promise<Object>} Updated ISBN
     */
    async deactivate(id, reason = null) {
        try {
            const updateData = {
                status: 'inactive',
                deactivated_at: new Date().toISOString()
            };

            if (reason) {
                updateData.deactivation_reason = reason;
            }

            return await this.update(id, updateData);
        } catch (error) {
            logger.error('ISBN deactivation error', {
                error: error.message,
                isbnId: id,
                reason
            });
            throw error;
        }
    }

    /**
     * Get all ISBNs with filtering
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated ISBNs
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                status,
                formatType,
                search,
                startDate,
                endDate
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `, { count: 'exact' });

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (formatType) {
                if (Array.isArray(formatType)) {
                    query = query.in('format_type', formatType);
                } else {
                    query = query.eq('format_type', formatType);
                }
            }

            if (search) {
                query = query.or(`isbn_13.ilike.%${search}%,isbn_10.ilike.%${search}%`);
            }

            if (startDate) {
                query = query.gte('assigned_date', startDate);
            }

            if (endDate) {
                query = query.lte('assigned_date', endDate);
            }

            query = query
                .order('assigned_date', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch ISBNs', {
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
            logger.error('ISBNs fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Check ISBN availability
     * @param {string} isbn13 - ISBN-13 to check
     * @param {string} isbn10 - ISBN-10 to check (optional)
     * @returns {Promise<Object>} Availability status
     */
    async checkAvailability(isbn13, isbn10 = null) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('id, publication_id, status');

            if (isbn10) {
                query = query.or(`isbn_13.eq.${isbn13},isbn_10.eq.${isbn10}`);
            } else {
                query = query.eq('isbn_13', isbn13);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to check ISBN availability', {
                    error: error.message,
                    isbn13,
                    isbn10
                });
                throw error;
            }

            const activeISBN = data.find(isbn => isbn.status === 'active');

            return {
                available: !activeISBN,
                existing: data.length > 0,
                activeConflict: !!activeISBN,
                conflictDetails: activeISBN ? {
                    id: activeISBN.id,
                    publicationId: activeISBN.publication_id,
                    status: activeISBN.status
                } : null
            };
        } catch (error) {
            logger.error('ISBN availability check error', {
                error: error.message,
                isbn13,
                isbn10
            });
            throw error;
        }
    }

    /**
     * Generate ISBN statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} ISBN statistics
     */
    async getStatistics(options = {}) {
        try {
            const { startDate, endDate, formatType } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('status, format_type, assigned_date');

            if (startDate) {
                query = query.gte('assigned_date', startDate);
            }

            if (endDate) {
                query = query.lte('assigned_date', endDate);
            }

            if (formatType) {
                query = query.eq('format_type', formatType);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch ISBN statistics', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const stats = {
                total: data.length,
                byStatus: {},
                byFormat: {},
                recentAssignments: 0
            };

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            data.forEach(isbn => {
                // By status
                stats.byStatus[isbn.status] = (stats.byStatus[isbn.status] || 0) + 1;

                // By format
                stats.byFormat[isbn.format_type] = (stats.byFormat[isbn.format_type] || 0) + 1;

                // Recent assignments
                if (new Date(isbn.assigned_date) > thirtyDaysAgo) {
                    stats.recentAssignments++;
                }
            });

            return stats;
        } catch (error) {
            logger.error('ISBN statistics error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Validate ISBN format
     * @param {string} isbn13 - ISBN-13 number
     * @param {string} isbn10 - ISBN-10 number (optional)
     * @throws {Error} If ISBN format is invalid
     */
    validateISBN(isbn13, isbn10 = null) {
        // Validate ISBN-13
        if (!isbn13 || !/^\d{13}$/.test(isbn13.replace(/-/g, ''))) {
            throw new Error('Invalid ISBN-13 format. Must be 13 digits.');
        }

        // Validate ISBN-10 if provided
        if (isbn10 && !/^[\dX]{10}$/.test(isbn10.replace(/-/g, ''))) {
            throw new Error('Invalid ISBN-10 format. Must be 10 digits or end with X.');
        }

        // Calculate ISBN-13 check digit
        const isbn13Clean = isbn13.replace(/-/g, '');
        let checksum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(isbn13Clean[i]);
            checksum += i % 2 === 0 ? digit : digit * 3;
        }
        const calculatedCheckDigit = (10 - (checksum % 10)) % 10;
        const providedCheckDigit = parseInt(isbn13Clean[12]);

        if (calculatedCheckDigit !== providedCheckDigit) {
            throw new Error('Invalid ISBN-13 check digit');
        }

        // Calculate ISBN-10 check digit if provided
        if (isbn10) {
            const isbn10Clean = isbn10.replace(/-/g, '');
            let checksum10 = 0;
            for (let i = 0; i < 9; i++) {
                checksum10 += parseInt(isbn10Clean[i]) * (10 - i);
            }
            const calculatedCheck10 = (11 - (checksum10 % 11)) % 11;
            const providedCheck10 = isbn10Clean[9] === 'X' ? 10 : parseInt(isbn10Clean[9]);

            if (calculatedCheck10 !== providedCheck10) {
                throw new Error('Invalid ISBN-10 check digit');
            }
        }
    }

    /**
     * Convert ISBN-10 to ISBN-13
     * @param {string} isbn10 - ISBN-10 number
     * @returns {string} ISBN-13 number
     */
    convertISBN10ToISBN13(isbn10) {
        const isbn10Clean = isbn10.replace(/-/g, '').substring(0, 9);
        const isbn13Base = '978' + isbn10Clean;
        
        let checksum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(isbn13Base[i]);
            checksum += i % 2 === 0 ? digit : digit * 3;
        }
        const checkDigit = (10 - (checksum % 10)) % 10;
        
        return isbn13Base + checkDigit;
    }

    /**
     * Format ISBN with hyphens
     * @param {string} isbn - ISBN number
     * @param {string} type - ISBN type ('13' or '10')
     * @returns {string} Formatted ISBN
     */
    formatISBN(isbn, type = '13') {
        const clean = isbn.replace(/-/g, '');
        
        if (type === '13' && clean.length === 13) {
            return `${clean.substring(0, 3)}-${clean.substring(3, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 12)}-${clean.substring(12)}`;
        } else if (type === '10' && clean.length === 10) {
            return `${clean.substring(0, 1)}-${clean.substring(1, 3)}-${clean.substring(3, 9)}-${clean.substring(9)}`;
        }
        
        return isbn; // Return as-is if can't format
    }
}

module.exports = ISBNModel;
