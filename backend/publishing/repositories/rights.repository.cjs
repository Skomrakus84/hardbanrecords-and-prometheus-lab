/**
 * Rights Repository - Advanced Rights and Licensing Data Access Layer
 * Provides sophisticated database operations for territorial rights and licensing
 * Handles complex rights management, compliance tracking, and legal workflows
 * Implements enterprise-grade patterns with territory validation and conflict resolution
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class RightsRepository {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        this.validTerritories = this.loadValidTerritories();
    }

    // ========== Territorial Rights Management ==========

    /**
     * Create territorial rights configuration
     */
    async createTerritorialRights(publicationId, rightsData, userId) {
        try {
            const rightsId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Validate territory code
            if (!this.isValidTerritoryCode(rightsData.territory_code)) {
                throw new AppError(`Invalid territory code: ${rightsData.territory_code}`, 400);
            }

            // Check for existing rights in territory
            const existingRights = await this.findTerritorialRights(publicationId, rightsData.territory_code);
            if (existingRights) {
                throw new AppError(`Rights already exist for territory: ${rightsData.territory_code}`, 409);
            }

            const dbData = {
                id: rightsId,
                publication_id: publicationId,
                territory_code: rightsData.territory_code.toUpperCase(),
                rights_type: rightsData.rights_type,
                start_date: rightsData.start_date || null,
                end_date: rightsData.end_date || null,
                notes: rightsData.notes || '',
                created_at: timestamp,
                updated_at: timestamp
            };

            const { data: rights, error } = await this.supabase
                .from('territorial_rights')
                .insert(dbData)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to create territorial rights: ${error.message}`, 500);
            }

            logger.info('Territorial rights created successfully', {
                rightsId,
                publicationId,
                territoryCode: rightsData.territory_code,
                rightsType: rightsData.rights_type,
                createdBy: userId
            });

            // Invalidate caches
            this.invalidateCache([`rights_${publicationId}`]);

            return this.transformTerritorialRights(rights);

        } catch (error) {
            logger.error('Error creating territorial rights', {
                error: error.message,
                stack: error.stack,
                publicationId,
                rightsData,
                userId
            });
            throw error;
        }
    }

    /**
     * Find territorial rights for publication and territory
     */
    async findTerritorialRights(publicationId, territoryCode) {
        try {
            const { data: rights, error } = await this.supabase
                .from('territorial_rights')
                .select('*')
                .eq('publication_id', publicationId)
                .eq('territory_code', territoryCode.toUpperCase())
                .single();

            if (error && error.code !== 'PGRST116') {
                throw new AppError(`Failed to find territorial rights: ${error.message}`, 500);
            }

            return rights ? this.transformTerritorialRights(rights) : null;

        } catch (error) {
            logger.error('Error finding territorial rights', {
                error: error.message,
                publicationId,
                territoryCode
            });
            throw error;
        }
    }

    /**
     * Get all territorial rights for publication
     */
    async getTerritorialRightsByPublication(publicationId, options = {}) {
        try {
            const cacheKey = `rights_${publicationId}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let query = this.supabase
                .from('territorial_rights')
                .select('*')
                .eq('publication_id', publicationId);

            if (options.rights_type) {
                query = query.eq('rights_type', options.rights_type);
            }

            if (options.active_only) {
                const today = new Date().toISOString().split('T')[0];
                query = query
                    .or(`start_date.is.null,start_date.lte.${today}`)
                    .or(`end_date.is.null,end_date.gte.${today}`);
            }

            query = query.order('territory_code', { ascending: true });

            const { data: rights, error } = await query;

            if (error) {
                throw new AppError(`Failed to get territorial rights: ${error.message}`, 500);
            }

            const transformedRights = rights.map(right => this.transformTerritorialRights(right));

            // Analyze coverage
            const coverage = this.analyzeTerritorialCoverage(transformedRights);

            const result = {
                publication_id: publicationId,
                rights: transformedRights,
                coverage_analysis: coverage,
                total_territories: transformedRights.length
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            logger.error('Error getting territorial rights by publication', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update territorial rights
     */
    async updateTerritorialRights(rightsId, updateData, userId) {
        try {
            const timestamp = new Date().toISOString();

            // Validate territory code if being updated
            if (updateData.territory_code && !this.isValidTerritoryCode(updateData.territory_code)) {
                throw new AppError(`Invalid territory code: ${updateData.territory_code}`, 400);
            }

            const dbData = {
                ...updateData,
                updated_at: timestamp
            };

            if (updateData.territory_code) {
                dbData.territory_code = updateData.territory_code.toUpperCase();
            }

            const { data: rights, error } = await this.supabase
                .from('territorial_rights')
                .update(dbData)
                .eq('id', rightsId)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to update territorial rights: ${error.message}`, 500);
            }

            logger.info('Territorial rights updated successfully', {
                rightsId,
                updatedBy: userId,
                updatedFields: Object.keys(updateData)
            });

            // Invalidate caches
            this.invalidateCache([`rights_${rights.publication_id}`]);

            return this.transformTerritorialRights(rights);

        } catch (error) {
            logger.error('Error updating territorial rights', {
                error: error.message,
                rightsId,
                updateData
            });
            throw error;
        }
    }

    // ========== Translation Licenses Management ==========

    /**
     * Create translation license
     */
    async createTranslationLicense(publicationId, licenseData, userId) {
        try {
            const licenseId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            // Validate language code
            if (!this.isValidLanguageCode(licenseData.target_language)) {
                throw new AppError(`Invalid language code: ${licenseData.target_language}`, 400);
            }

            const dbData = {
                id: licenseId,
                publication_id: publicationId,
                licensee_name: licenseData.licensee_name,
                licensee_contact: JSON.stringify(licenseData.licensee_contact || {}),
                target_language: licenseData.target_language.toLowerCase(),
                territory_codes: JSON.stringify(licenseData.territory_codes || []),
                license_fee: licenseData.license_fee || null,
                royalty_percentage: licenseData.royalty_percentage || null,
                advance_payment: licenseData.advance_payment || null,
                contract_start_date: licenseData.contract_start_date || null,
                contract_end_date: licenseData.contract_end_date || null,
                exclusive: licenseData.exclusive || false,
                status: 'pending',
                contract_url: licenseData.contract_url || null,
                deliverables: JSON.stringify(licenseData.deliverables || []),
                milestones: JSON.stringify(licenseData.milestones || []),
                notes: licenseData.notes || '',
                created_at: timestamp,
                updated_at: timestamp
            };

            const { data: license, error } = await this.supabase
                .from('translation_licenses')
                .insert(dbData)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to create translation license: ${error.message}`, 500);
            }

            logger.info('Translation license created successfully', {
                licenseId,
                publicationId,
                licensee: licenseData.licensee_name,
                targetLanguage: licenseData.target_language,
                createdBy: userId
            });

            // Invalidate caches
            this.invalidateCache([`licenses_${publicationId}`]);

            return this.transformTranslationLicense(license);

        } catch (error) {
            logger.error('Error creating translation license', {
                error: error.message,
                publicationId,
                licenseData,
                userId
            });
            throw error;
        }
    }

    /**
     * Get translation licenses for publication
     */
    async getTranslationLicensesByPublication(publicationId, options = {}) {
        try {
            const cacheKey = `licenses_${publicationId}_${JSON.stringify(options)}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            let query = this.supabase
                .from('translation_licenses')
                .select('*')
                .eq('publication_id', publicationId);

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.target_language) {
                query = query.eq('target_language', options.target_language);
            }

            if (options.exclusive !== undefined) {
                query = query.eq('exclusive', options.exclusive);
            }

            query = query.order('created_at', { ascending: false });

            const { data: licenses, error } = await query;

            if (error) {
                throw new AppError(`Failed to get translation licenses: ${error.message}`, 500);
            }

            const transformedLicenses = licenses.map(license => this.transformTranslationLicense(license));

            const result = {
                publication_id: publicationId,
                licenses: transformedLicenses,
                total_licenses: transformedLicenses.length,
                active_licenses: transformedLicenses.filter(l => l.status === 'active').length,
                languages_covered: [...new Set(transformedLicenses.map(l => l.target_language))]
            };

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            logger.error('Error getting translation licenses by publication', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    // ========== Adaptation Licenses Management ==========

    /**
     * Create adaptation license
     */
    async createAdaptationLicense(publicationId, licenseData, userId) {
        try {
            const licenseId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            const dbData = {
                id: licenseId,
                publication_id: publicationId,
                licensee_name: licenseData.licensee_name,
                licensee_contact: JSON.stringify(licenseData.licensee_contact || {}),
                adaptation_type: licenseData.adaptation_type,
                territory_codes: JSON.stringify(licenseData.territory_codes || []),
                license_fee: licenseData.license_fee || null,
                royalty_percentage: licenseData.royalty_percentage || null,
                advance_payment: licenseData.advance_payment || null,
                contract_start_date: licenseData.contract_start_date || null,
                contract_end_date: licenseData.contract_end_date || null,
                exclusive: licenseData.exclusive || false,
                status: 'pending',
                contract_url: licenseData.contract_url || null,
                deliverables: JSON.stringify(licenseData.deliverables || []),
                milestones: JSON.stringify(licenseData.milestones || []),
                notes: licenseData.notes || '',
                created_at: timestamp,
                updated_at: timestamp
            };

            const { data: license, error } = await this.supabase
                .from('adaptation_licenses')
                .insert(dbData)
                .select('*')
                .single();

            if (error) {
                throw new AppError(`Failed to create adaptation license: ${error.message}`, 500);
            }

            logger.info('Adaptation license created successfully', {
                licenseId,
                publicationId,
                licensee: licenseData.licensee_name,
                adaptationType: licenseData.adaptation_type,
                createdBy: userId
            });

            // Invalidate caches
            this.invalidateCache([`adaptation_licenses_${publicationId}`]);

            return this.transformAdaptationLicense(license);

        } catch (error) {
            logger.error('Error creating adaptation license', {
                error: error.message,
                publicationId,
                licenseData,
                userId
            });
            throw error;
        }
    }

    // ========== Rights Validation and Analysis ==========

    /**
     * Validate rights configuration for publication
     */
    async validateRightsConfiguration(publicationId) {
        try {
            const [
                territorialRights,
                translationLicenses,
                adaptationLicenses
            ] = await Promise.all([
                this.getTerritorialRightsByPublication(publicationId),
                this.getTranslationLicensesByPublication(publicationId),
                this.getAdaptationLicensesByPublication(publicationId)
            ]);

            const validation = {
                publication_id: publicationId,
                is_valid: true,
                errors: [],
                warnings: [],
                coverage_analysis: {},
                recommendations: []
            };

            // Validate territorial coverage
            const territorialValidation = this.validateTerritorialCoverage(territorialRights.rights);
            validation.coverage_analysis.territorial = territorialValidation;
            
            if (!territorialValidation.is_complete) {
                validation.warnings.push('Incomplete territorial coverage detected');
            }

            // Check for conflicts
            const conflicts = this.detectRightsConflicts(
                territorialRights.rights,
                translationLicenses.licenses,
                adaptationLicenses.licenses
            );

            if (conflicts.length > 0) {
                validation.errors.push(...conflicts);
                validation.is_valid = false;
            }

            // Generate recommendations
            validation.recommendations = this.generateRightsRecommendations(
                territorialRights.rights,
                translationLicenses.licenses,
                adaptationLicenses.licenses
            );

            return validation;

        } catch (error) {
            logger.error('Error validating rights configuration', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Check for rights conflicts
     */
    detectRightsConflicts(territorialRights, translationLicenses, adaptationLicenses) {
        const conflicts = [];

        // Check for overlapping exclusive translation licenses
        const exclusiveTranslations = translationLicenses.filter(l => l.exclusive);
        
        exclusiveTranslations.forEach(license => {
            const overlapping = translationLicenses.filter(other => 
                other.id !== license.id &&
                other.target_language === license.target_language &&
                this.datesOverlap(license, other)
            );

            if (overlapping.length > 0) {
                conflicts.push(`Conflicting exclusive translation licenses for ${license.target_language}`);
            }
        });

        // Check territorial rights conflicts
        const exclusiveRights = territorialRights.filter(r => r.rights_type === 'exclusive');
        
        exclusiveRights.forEach(right => {
            const overlapping = territorialRights.filter(other =>
                other.id !== right.id &&
                other.territory_code === right.territory_code &&
                this.datesOverlap(right, other)
            );

            if (overlapping.length > 0) {
                conflicts.push(`Conflicting territorial rights for ${right.territory_code}`);
            }
        });

        // Check adaptation license conflicts
        const exclusiveAdaptations = adaptationLicenses.filter(l => l.exclusive);
        
        exclusiveAdaptations.forEach(license => {
            const overlapping = adaptationLicenses.filter(other =>
                other.id !== license.id &&
                other.adaptation_type === license.adaptation_type &&
                this.datesOverlap(license, other)
            );

            if (overlapping.length > 0) {
                conflicts.push(`Conflicting exclusive adaptation licenses for ${license.adaptation_type}`);
            }
        });

        return conflicts;
    }

    /**
     * Analyze territorial coverage
     */
    analyzeTerritorialCoverage(rights) {
        const coverage = {
            total_territories: rights.length,
            exclusive_territories: rights.filter(r => r.rights_type === 'exclusive').length,
            non_exclusive_territories: rights.filter(r => r.rights_type === 'non_exclusive').length,
            prohibited_territories: rights.filter(r => r.rights_type === 'prohibited').length,
            major_markets_covered: this.checkMajorMarketsCoverage(rights),
            coverage_percentage: this.calculateCoveragePercentage(rights)
        };

        return coverage;
    }

    // ========== Helper Methods ==========

    /**
     * Transform territorial rights database record
     */
    transformTerritorialRights(dbRecord) {
        if (!dbRecord) return null;

        return {
            id: dbRecord.id,
            publication_id: dbRecord.publication_id,
            territory_code: dbRecord.territory_code,
            rights_type: dbRecord.rights_type,
            start_date: dbRecord.start_date,
            end_date: dbRecord.end_date,
            notes: dbRecord.notes,
            created_at: dbRecord.created_at,
            updated_at: dbRecord.updated_at
        };
    }

    /**
     * Transform translation license database record
     */
    transformTranslationLicense(dbRecord) {
        if (!dbRecord) return null;

        return {
            id: dbRecord.id,
            publication_id: dbRecord.publication_id,
            licensee_name: dbRecord.licensee_name,
            licensee_contact: this.safeJsonParse(dbRecord.licensee_contact, {}),
            target_language: dbRecord.target_language,
            territory_codes: this.safeJsonParse(dbRecord.territory_codes, []),
            license_fee: dbRecord.license_fee,
            royalty_percentage: dbRecord.royalty_percentage,
            advance_payment: dbRecord.advance_payment,
            contract_start_date: dbRecord.contract_start_date,
            contract_end_date: dbRecord.contract_end_date,
            exclusive: dbRecord.exclusive,
            status: dbRecord.status,
            contract_url: dbRecord.contract_url,
            deliverables: this.safeJsonParse(dbRecord.deliverables, []),
            milestones: this.safeJsonParse(dbRecord.milestones, []),
            notes: dbRecord.notes,
            created_at: dbRecord.created_at,
            updated_at: dbRecord.updated_at
        };
    }

    /**
     * Transform adaptation license database record
     */
    transformAdaptationLicense(dbRecord) {
        if (!dbRecord) return null;

        return {
            id: dbRecord.id,
            publication_id: dbRecord.publication_id,
            licensee_name: dbRecord.licensee_name,
            licensee_contact: this.safeJsonParse(dbRecord.licensee_contact, {}),
            adaptation_type: dbRecord.adaptation_type,
            territory_codes: this.safeJsonParse(dbRecord.territory_codes, []),
            license_fee: dbRecord.license_fee,
            royalty_percentage: dbRecord.royalty_percentage,
            advance_payment: dbRecord.advance_payment,
            contract_start_date: dbRecord.contract_start_date,
            contract_end_date: dbRecord.contract_end_date,
            exclusive: dbRecord.exclusive,
            status: dbRecord.status,
            contract_url: dbRecord.contract_url,
            deliverables: this.safeJsonParse(dbRecord.deliverables, []),
            milestones: this.safeJsonParse(dbRecord.milestones, []),
            notes: dbRecord.notes,
            created_at: dbRecord.created_at,
            updated_at: dbRecord.updated_at
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
     * Validate territory code (ISO 3166-1 alpha-2)
     */
    isValidTerritoryCode(code) {
        return /^[A-Z]{2}$/.test(code) && this.validTerritories.includes(code);
    }

    /**
     * Validate language code (ISO 639-1)
     */
    isValidLanguageCode(code) {
        const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'zh', 'ja', 'ko'];
        return validLanguages.includes(code.toLowerCase());
    }

    /**
     * Check if date ranges overlap
     */
    datesOverlap(license1, license2) {
        const start1 = license1.contract_start_date ? new Date(license1.contract_start_date) : new Date('1900-01-01');
        const end1 = license1.contract_end_date ? new Date(license1.contract_end_date) : new Date('2100-12-31');
        const start2 = license2.contract_start_date ? new Date(license2.contract_start_date) : new Date('1900-01-01');
        const end2 = license2.contract_end_date ? new Date(license2.contract_end_date) : new Date('2100-12-31');

        return start1 <= end2 && start2 <= end1;
    }

    /**
     * Load valid territory codes
     */
    loadValidTerritories() {
        // ISO 3166-1 alpha-2 codes (subset)
        return [
            'US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT',
            'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO',
            'BG', 'HR', 'SI', 'EE', 'LV', 'LT', 'IE', 'PT', 'GR', 'CY',
            'MT', 'LU', 'IS', 'LI', 'MC', 'SM', 'VA', 'AD', 'AU', 'NZ',
            'JP', 'KR', 'CN', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE'
        ];
    }

    /**
     * Check major markets coverage
     */
    checkMajorMarketsCoverage(rights) {
        const majorMarkets = ['US', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA'];
        const coveredMarkets = rights
            .filter(r => r.rights_type !== 'prohibited')
            .map(r => r.territory_code);

        return majorMarkets.filter(market => coveredMarkets.includes(market));
    }

    /**
     * Calculate coverage percentage
     */
    calculateCoveragePercentage(rights) {
        const totalValidTerritories = this.validTerritories.length;
        const coveredTerritories = rights.filter(r => r.rights_type !== 'prohibited').length;
        
        return Math.round((coveredTerritories / totalValidTerritories) * 100);
    }

    /**
     * Validate territorial coverage
     */
    validateTerritorialCoverage(rights) {
        const majorMarkets = this.checkMajorMarketsCoverage(rights);
        const coveragePercentage = this.calculateCoveragePercentage(rights);

        return {
            is_complete: coveragePercentage >= 80,
            coverage_percentage: coveragePercentage,
            major_markets_covered: majorMarkets,
            missing_major_markets: ['US', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA'].filter(
                market => !majorMarkets.includes(market)
            )
        };
    }

    /**
     * Generate rights recommendations
     */
    generateRightsRecommendations(territorialRights, translationLicenses, adaptationLicenses) {
        const recommendations = [];

        // Territory recommendations
        const majorMarketsCovered = this.checkMajorMarketsCoverage(territorialRights);
        if (majorMarketsCovered.length < 5) {
            recommendations.push('Consider securing rights in major markets: US, UK, Germany, France, Japan');
        }

        // Translation recommendations
        const translationLanguages = translationLicenses.map(l => l.target_language);
        if (!translationLanguages.includes('es')) {
            recommendations.push('Consider Spanish translation to access Latin American markets');
        }

        // Adaptation recommendations
        if (adaptationLicenses.length === 0) {
            recommendations.push('Consider exploring adaptation opportunities (film, audio, etc.)');
        }

        return recommendations;
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
     * Placeholder method for adaptation licenses
     */
    async getAdaptationLicensesByPublication(publicationId, options = {}) {
        // TODO: Implement adaptation licenses retrieval
        logger.debug('Getting adaptation licenses by publication', { publicationId, options });
        
        return {
            publication_id: publicationId,
            licenses: [],
            total_licenses: 0
        };
    }
}

module.exports = RightsRepository;
