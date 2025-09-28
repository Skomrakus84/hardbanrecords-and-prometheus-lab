const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Territorial Rights Model
 * Manages territorial distribution rights for publications
 */
class TerritorialRightsModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'territorial_rights';
    }

    /**
     * Create new territorial rights
     * @param {Object} rightsData - Rights data
     * @returns {Promise<Object>} Created rights
     */
    async create(rightsData) {
        try {
            const {
                publication_id,
                territory_type,
                countries = [],
                regions = [],
                rights_type,
                exclusive = false,
                start_date,
                end_date = null,
                status = 'active'
            } = rightsData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    territory_type,
                    countries,
                    regions,
                    rights_type,
                    exclusive,
                    start_date,
                    end_date,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create territorial rights', {
                    error: error.message,
                    rightsData: { publication_id, territory_type, rights_type }
                });
                throw error;
            }

            logger.info('Territorial rights created successfully', {
                rightsId: data.id,
                publicationId: data.publication_id,
                territoryType: data.territory_type,
                rightsType: data.rights_type
            });

            return data;
        } catch (error) {
            logger.error('Territorial rights creation error', {
                error: error.message,
                stack: error.stack,
                rightsData
            });
            throw error;
        }
    }

    /**
     * Get rights by ID
     * @param {string} id - Rights ID
     * @returns {Promise<Object|null>} Rights data
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
                logger.error('Failed to fetch territorial rights by ID', {
                    error: error.message,
                    rightsId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Territorial rights fetch error', {
                error: error.message,
                rightsId: id
            });
            throw error;
        }
    }

    /**
     * Get rights by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Rights list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const { 
                rightsType, 
                territoryType, 
                status = 'active',
                includeExpired = false 
            } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId);

            if (rightsType) {
                if (Array.isArray(rightsType)) {
                    query = query.in('rights_type', rightsType);
                } else {
                    query = query.eq('rights_type', rightsType);
                }
            }

            if (territoryType) {
                query = query.eq('territory_type', territoryType);
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
                logger.error('Failed to fetch rights by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Rights fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update rights
     * @param {string} id - Rights ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated rights
     */
    async update(id, updateData) {
        try {
            const existingRights = await this.findById(id);
            if (!existingRights) {
                throw new Error('Territorial rights not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update territorial rights', {
                    error: error.message,
                    rightsId: id,
                    updateData
                });
                throw error;
            }

            logger.info('Territorial rights updated successfully', {
                rightsId: data.id,
                publicationId: data.publication_id,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('Territorial rights update error', {
                error: error.message,
                rightsId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Expire rights
     * @param {string} id - Rights ID
     * @param {string} reason - Expiration reason
     * @returns {Promise<Object>} Updated rights
     */
    async expire(id, reason = null) {
        try {
            const updateData = {
                status: 'expired',
                end_date: new Date().toISOString()
            };

            if (reason) {
                updateData.notes = reason;
            }

            return await this.update(id, updateData);
        } catch (error) {
            logger.error('Territorial rights expiration error', {
                error: error.message,
                rightsId: id,
                reason
            });
            throw error;
        }
    }

    /**
     * Check territorial rights for specific location
     * @param {string} publicationId - Publication ID
     * @param {string} country - Country code
     * @param {string} rightsType - Rights type to check
     * @returns {Promise<Object>} Rights check result
     */
    async checkTerritorialRights(publicationId, country, rightsType = 'distribution') {
        try {
            const now = new Date().toISOString();

            // Get all active rights for the publication
            const { data: rights, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId)
                .eq('rights_type', rightsType)
                .eq('status', 'active')
                .lte('start_date', now)
                .or(`end_date.is.null,end_date.gte.${now}`);

            if (error) {
                logger.error('Failed to check territorial rights', {
                    error: error.message,
                    publicationId,
                    country,
                    rightsType
                });
                throw error;
            }

            const result = {
                hasRights: false,
                exclusive: false,
                applicableRights: [],
                restrictions: []
            };

            for (const right of rights) {
                let hasRightInTerritory = false;

                switch (right.territory_type) {
                    case 'worldwide':
                        hasRightInTerritory = true;
                        break;
                    case 'countries':
                        hasRightInTerritory = right.countries.includes(country);
                        break;
                    case 'regions':
                        // You would need a mapping of countries to regions
                        hasRightInTerritory = this.isCountryInRegions(country, right.regions);
                        break;
                    case 'exclude_countries':
                        hasRightInTerritory = !right.countries.includes(country);
                        break;
                    case 'exclude_regions':
                        hasRightInTerritory = !this.isCountryInRegions(country, right.regions);
                        break;
                }

                if (hasRightInTerritory) {
                    result.hasRights = true;
                    result.applicableRights.push(right);
                    
                    if (right.exclusive) {
                        result.exclusive = true;
                    }
                }
            }

            return result;
        } catch (error) {
            logger.error('Territorial rights check error', {
                error: error.message,
                publicationId,
                country,
                rightsType
            });
            throw error;
        }
    }

    /**
     * Get all rights with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated rights
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                rightsType,
                territoryType,
                status,
                exclusive,
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

            if (rightsType) {
                if (Array.isArray(rightsType)) {
                    query = query.in('rights_type', rightsType);
                } else {
                    query = query.eq('rights_type', rightsType);
                }
            }

            if (territoryType) {
                query = query.eq('territory_type', territoryType);
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (exclusive !== undefined) {
                query = query.eq('exclusive', exclusive);
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
                logger.error('Failed to fetch territorial rights', {
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
            logger.error('Territorial rights fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get expiring rights
     * @param {number} daysAhead - Days to look ahead
     * @returns {Promise<Array>} Expiring rights
     */
    async getExpiringRights(daysAhead = 30) {
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
                logger.error('Failed to fetch expiring rights', {
                    error: error.message,
                    daysAhead
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Expiring rights fetch error', {
                error: error.message,
                daysAhead
            });
            throw error;
        }
    }

    /**
     * Get rights conflicts
     * @param {string} publicationId - Publication ID
     * @param {string} rightsType - Rights type
     * @returns {Promise<Array>} Conflicting rights
     */
    async findConflicts(publicationId, rightsType = 'distribution') {
        try {
            const rights = await this.findByPublicationId(publicationId, { rightsType });
            const conflicts = [];

            for (let i = 0; i < rights.length; i++) {
                for (let j = i + 1; j < rights.length; j++) {
                    const right1 = rights[i];
                    const right2 = rights[j];

                    // Check for overlapping territories and time periods
                    if (this.hasTerritoricalOverlap(right1, right2) && 
                        this.hasTimeOverlap(right1, right2)) {
                        conflicts.push({
                            right1: right1,
                            right2: right2,
                            conflictType: this.getConflictType(right1, right2)
                        });
                    }
                }
            }

            return conflicts;
        } catch (error) {
            logger.error('Rights conflicts check error', {
                error: error.message,
                publicationId,
                rightsType
            });
            throw error;
        }
    }

    /**
     * Generate rights summary for publication
     * @param {string} publicationId - Publication ID
     * @returns {Promise<Object>} Rights summary
     */
    async getRightsSummary(publicationId) {
        try {
            const rights = await this.findByPublicationId(publicationId, { includeExpired: true });

            const summary = {
                total: rights.length,
                active: rights.filter(r => r.status === 'active').length,
                expired: rights.filter(r => r.status === 'expired').length,
                byRightsType: {},
                byTerritoryType: {},
                hasExclusiveRights: false,
                hasWorldwideRights: false,
                coveragePercentage: 0
            };

            rights.forEach(right => {
                // By rights type
                summary.byRightsType[right.rights_type] = 
                    (summary.byRightsType[right.rights_type] || 0) + 1;

                // By territory type
                summary.byTerritoryType[right.territory_type] = 
                    (summary.byTerritoryType[right.territory_type] || 0) + 1;

                // Check for exclusive and worldwide rights
                if (right.exclusive && right.status === 'active') {
                    summary.hasExclusiveRights = true;
                }

                if (right.territory_type === 'worldwide' && right.status === 'active') {
                    summary.hasWorldwideRights = true;
                }
            });

            // Calculate rough coverage percentage (simplified)
            if (summary.hasWorldwideRights) {
                summary.coveragePercentage = 100;
            } else {
                // This would require more sophisticated calculation based on actual territories
                const countryRights = rights.filter(r => 
                    r.territory_type === 'countries' && r.status === 'active'
                );
                const totalCountries = countryRights.reduce((acc, right) => 
                    acc + right.countries.length, 0
                );
                summary.coveragePercentage = Math.min(totalCountries * 0.5, 100); // Rough estimate
            }

            return summary;
        } catch (error) {
            logger.error('Rights summary error', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Helper: Check if country is in specified regions
     * @param {string} country - Country code
     * @param {Array} regions - Region codes
     * @returns {boolean} Whether country is in regions
     */
    isCountryInRegions(country, regions) {
        // This would need a proper country-to-region mapping
        // For now, using simplified mapping
        const regionMappings = {
            'EU': ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'GR', 'PL', 'CZ', 'HU', 'SK', 'SI', 'EE', 'LV', 'LT', 'FI', 'SE', 'DK', 'IE', 'CY', 'MT', 'LU', 'BG', 'RO', 'HR'],
            'NA': ['US', 'CA', 'MX'],
            'ASIA': ['JP', 'KR', 'CN', 'IN', 'TH', 'VN', 'PH', 'MY', 'SG', 'ID'],
            'OCEANIA': ['AU', 'NZ'],
            'SA': ['BR', 'AR', 'CL', 'CO', 'PE', 'VE'],
            'AFRICA': ['ZA', 'NG', 'EG', 'KE', 'MA', 'TN', 'GH'],
            'MIDDLE_EAST': ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IL']
        };

        return regions.some(region => 
            regionMappings[region] && regionMappings[region].includes(country)
        );
    }

    /**
     * Helper: Check for territorial overlap between rights
     * @param {Object} right1 - First rights object
     * @param {Object} right2 - Second rights object
     * @returns {boolean} Whether territories overlap
     */
    hasTerritoricalOverlap(right1, right2) {
        if (right1.territory_type === 'worldwide' || right2.territory_type === 'worldwide') {
            return true;
        }

        if (right1.territory_type === 'countries' && right2.territory_type === 'countries') {
            return right1.countries.some(country => right2.countries.includes(country));
        }

        // More complex logic would be needed for region overlaps
        return false;
    }

    /**
     * Helper: Check for time overlap between rights
     * @param {Object} right1 - First rights object
     * @param {Object} right2 - Second rights object
     * @returns {boolean} Whether time periods overlap
     */
    hasTimeOverlap(right1, right2) {
        const start1 = new Date(right1.start_date);
        const end1 = right1.end_date ? new Date(right1.end_date) : null;
        const start2 = new Date(right2.start_date);
        const end2 = right2.end_date ? new Date(right2.end_date) : null;

        // If either has no end date, they overlap if start dates allow it
        if (!end1 || !end2) {
            return start1 <= (end2 || new Date('2099-12-31')) && 
                   start2 <= (end1 || new Date('2099-12-31'));
        }

        return start1 <= end2 && start2 <= end1;
    }

    /**
     * Helper: Get conflict type between rights
     * @param {Object} right1 - First rights object
     * @param {Object} right2 - Second rights object
     * @returns {string} Conflict type
     */
    getConflictType(right1, right2) {
        if (right1.exclusive || right2.exclusive) {
            return 'exclusive_conflict';
        }
        return 'non_exclusive_overlap';
    }
}

module.exports = TerritorialRightsModel;
