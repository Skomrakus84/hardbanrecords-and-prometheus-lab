const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * BISAC Category Model
 * Manages BISAC (Book Industry Standards and Communications) subject categories
 */
class BISACCategoryModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'bisac_categories';
    }

    /**
     * Create a new BISAC category
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(categoryData) {
        try {
            const {
                code,
                heading,
                parent_code = null,
                description = null,
                is_active = true
            } = categoryData;

            // Validate BISAC code format
            this.validateBISACCode(code);

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    code,
                    heading,
                    parent_code,
                    description,
                    is_active
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create BISAC category', {
                    error: error.message,
                    categoryData: { code, heading, parent_code }
                });
                throw error;
            }

            logger.info('BISAC category created successfully', {
                categoryId: data.id,
                code: data.code,
                heading: data.heading
            });

            return data;
        } catch (error) {
            logger.error('BISAC category creation error', {
                error: error.message,
                stack: error.stack,
                categoryData
            });
            throw error;
        }
    }

    /**
     * Get category by ID
     * @param {string} id - Category ID
     * @returns {Promise<Object|null>} Category data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    parent:parent_code(code, heading),
                    children:bisac_categories!parent_code(code, heading, is_active)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch BISAC category by ID', {
                    error: error.message,
                    categoryId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('BISAC category fetch error', {
                error: error.message,
                categoryId: id
            });
            throw error;
        }
    }

    /**
     * Get category by BISAC code
     * @param {string} code - BISAC code
     * @returns {Promise<Object|null>} Category data
     */
    async findByCode(code) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    parent:parent_code(code, heading),
                    children:bisac_categories!parent_code(code, heading, is_active)
                `)
                .eq('code', code)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch BISAC category by code', {
                    error: error.message,
                    code
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('BISAC category fetch by code error', {
                error: error.message,
                code
            });
            throw error;
        }
    }

    /**
     * Get all categories with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated categories
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 100,
                search,
                parentCode,
                isActive = true,
                includeChildren = false
            } = options;

            const offset = (page - 1) * limit;

            let selectFields = includeChildren ? `
                *,
                parent:parent_code(code, heading),
                children:bisac_categories!parent_code(code, heading, is_active)
            ` : `
                *,
                parent:parent_code(code, heading)
            `;

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields, { count: 'exact' });

            if (isActive !== null) {
                query = query.eq('is_active', isActive);
            }

            if (parentCode) {
                if (parentCode === 'null') {
                    query = query.is('parent_code', null);
                } else {
                    query = query.eq('parent_code', parentCode);
                }
            }

            if (search) {
                query = query.or(`code.ilike.%${search}%,heading.ilike.%${search}%,description.ilike.%${search}%`);
            }

            query = query
                .order('code')
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch BISAC categories', {
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
            logger.error('BISAC categories fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get top-level categories (no parent)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Top-level categories
     */
    async getTopLevelCategories(options = {}) {
        try {
            const { includeChildren = false, isActive = true } = options;

            let selectFields = includeChildren ? `
                *,
                children:bisac_categories!parent_code(code, heading, is_active)
            ` : '*';

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields)
                .is('parent_code', null);

            if (isActive !== null) {
                query = query.eq('is_active', isActive);
            }

            query = query.order('code');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch top-level BISAC categories', {
                    error: error.message,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Top-level BISAC categories fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get category hierarchy (tree structure)
     * @param {string} rootCode - Root category code (optional)
     * @returns {Promise<Array>} Category tree
     */
    async getCategoryTree(rootCode = null) {
        try {
            let rootCategories;

            if (rootCode) {
                const rootCategory = await this.findByCode(rootCode);
                if (!rootCategory) {
                    throw new Error('Root category not found');
                }
                rootCategories = [rootCategory];
            } else {
                rootCategories = await this.getTopLevelCategories({ includeChildren: false });
            }

            // Build the tree recursively
            const buildTree = async (categories) => {
                const tree = [];
                
                for (const category of categories) {
                    const categoryWithChildren = {
                        ...category,
                        children: []
                    };

                    // Get children
                    const { data: children } = await this.supabase
                        .from(this.tableName)
                        .select('*')
                        .eq('parent_code', category.code)
                        .eq('is_active', true)
                        .order('code');

                    if (children && children.length > 0) {
                        categoryWithChildren.children = await buildTree(children);
                    }

                    tree.push(categoryWithChildren);
                }

                return tree;
            };

            return await buildTree(rootCategories);
        } catch (error) {
            logger.error('Category tree fetch error', {
                error: error.message,
                rootCode
            });
            throw error;
        }
    }

    /**
     * Update category
     * @param {string} id - Category ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated category
     */
    async update(id, updateData) {
        try {
            const existingCategory = await this.findById(id);
            if (!existingCategory) {
                throw new Error('BISAC category not found');
            }

            // Validate BISAC code if being updated
            if (updateData.code) {
                this.validateBISACCode(updateData.code);
                
                // Check if new code conflicts with existing
                const existingWithCode = await this.findByCode(updateData.code);
                if (existingWithCode && existingWithCode.id !== id) {
                    throw new Error('BISAC code already exists');
                }
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update BISAC category', {
                    error: error.message,
                    categoryId: id,
                    updateData
                });
                throw error;
            }

            logger.info('BISAC category updated successfully', {
                categoryId: data.id,
                code: data.code,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('BISAC category update error', {
                error: error.message,
                categoryId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Deactivate category
     * @param {string} id - Category ID
     * @returns {Promise<Object>} Updated category
     */
    async deactivate(id) {
        try {
            // Check if category has active children
            const { data: children } = await this.supabase
                .from(this.tableName)
                .select('id, code, heading')
                .eq('parent_code', (await this.findById(id))?.code)
                .eq('is_active', true);

            if (children && children.length > 0) {
                throw new Error('Cannot deactivate category with active subcategories');
            }

            return await this.update(id, { is_active: false });
        } catch (error) {
            logger.error('BISAC category deactivation error', {
                error: error.message,
                categoryId: id
            });
            throw error;
        }
    }

    /**
     * Search categories by text
     * @param {string} searchTerm - Search term
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Matching categories
     */
    async search(searchTerm, options = {}) {
        try {
            const { limit = 50, isActive = true, includeDescription = true } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('*');

            if (isActive !== null) {
                query = query.eq('is_active', isActive);
            }

            if (includeDescription) {
                query = query.or(`code.ilike.%${searchTerm}%,heading.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            } else {
                query = query.or(`code.ilike.%${searchTerm}%,heading.ilike.%${searchTerm}%`);
            }

            query = query
                .order('code')
                .limit(limit);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to search BISAC categories', {
                    error: error.message,
                    searchTerm,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('BISAC categories search error', {
                error: error.message,
                searchTerm,
                options
            });
            throw error;
        }
    }

    /**
     * Get categories by subject area
     * @param {string} subjectPrefix - Subject prefix (e.g., 'FIC' for Fiction)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Categories in subject area
     */
    async getBySubjectArea(subjectPrefix, options = {}) {
        try {
            const { includeChildren = false, isActive = true } = options;

            let selectFields = includeChildren ? `
                *,
                children:bisac_categories!parent_code(code, heading, is_active)
            ` : '*';

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields)
                .like('code', `${subjectPrefix}%`);

            if (isActive !== null) {
                query = query.eq('is_active', isActive);
            }

            query = query.order('code');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch categories by subject area', {
                    error: error.message,
                    subjectPrefix,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Categories by subject area fetch error', {
                error: error.message,
                subjectPrefix,
                options
            });
            throw error;
        }
    }

    /**
     * Bulk import BISAC categories
     * @param {Array} categories - Array of category objects
     * @returns {Promise<Object>} Import results
     */
    async bulkImport(categories) {
        try {
            const results = {
                created: 0,
                updated: 0,
                errors: []
            };

            for (const categoryData of categories) {
                try {
                    // Validate required fields
                    if (!categoryData.code || !categoryData.heading) {
                        results.errors.push({
                            data: categoryData,
                            error: 'Missing required fields: code and heading'
                        });
                        continue;
                    }

                    // Check if category exists
                    const existing = await this.findByCode(categoryData.code);

                    if (existing) {
                        // Update existing
                        await this.update(existing.id, {
                            heading: categoryData.heading,
                            parent_code: categoryData.parent_code,
                            description: categoryData.description,
                            is_active: categoryData.is_active ?? true
                        });
                        results.updated++;
                    } else {
                        // Create new
                        await this.create(categoryData);
                        results.created++;
                    }
                } catch (error) {
                    results.errors.push({
                        data: categoryData,
                        error: error.message
                    });
                }
            }

            logger.info('BISAC categories bulk import completed', {
                total: categories.length,
                created: results.created,
                updated: results.updated,
                errors: results.errors.length
            });

            return results;
        } catch (error) {
            logger.error('BISAC categories bulk import error', {
                error: error.message,
                categoriesCount: categories.length
            });
            throw error;
        }
    }

    /**
     * Get category statistics
     * @returns {Promise<Object>} Category statistics
     */
    async getStatistics() {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('is_active, parent_code');

            if (error) {
                logger.error('Failed to fetch category statistics', {
                    error: error.message
                });
                throw error;
            }

            const stats = {
                total: data.length,
                active: data.filter(cat => cat.is_active).length,
                inactive: data.filter(cat => !cat.is_active).length,
                topLevel: data.filter(cat => !cat.parent_code).length,
                subcategories: data.filter(cat => cat.parent_code).length
            };

            return stats;
        } catch (error) {
            logger.error('Category statistics error', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Validate BISAC code format
     * @param {string} code - BISAC code to validate
     * @throws {Error} If code format is invalid
     */
    validateBISACCode(code) {
        if (!code || typeof code !== 'string') {
            throw new Error('BISAC code is required and must be a string');
        }

        // BISAC codes are typically 3-9 characters, uppercase letters and numbers
        if (!/^[A-Z0-9]{3,9}$/.test(code)) {
            throw new Error('Invalid BISAC code format. Must be 3-9 uppercase letters and numbers.');
        }
    }

    /**
     * Get popular categories based on usage
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Popular categories
     */
    async getPopularCategories(options = {}) {
        try {
            const { limit = 20 } = options;

            // This would require joining with publication_categories table
            // For now, return most commonly used top-level categories
            const popularCodes = [
                'FIC000000', // Fiction / General
                'NON000000', // Non-Fiction / General
                'BIO000000', // Biography & Autobiography / General
                'REF000000', // Reference / General
                'REL000000', // Religion / General
                'HIS000000', // History / General
                'BUS000000', // Business & Economics / General
                'CKB000000', // Cooking / General
                'HEA000000', // Health & Fitness / General
                'FAM000000'  // Family & Relationships / General
            ];

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .in('code', popularCodes)
                .eq('is_active', true);

            query = query
                .order('code')
                .limit(limit);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch popular categories', {
                    error: error.message,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Popular categories fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }
}

module.exports = BISACCategoryModel;
