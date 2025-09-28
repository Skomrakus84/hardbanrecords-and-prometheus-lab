const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * DRM Policy Model
 * Manages Digital Rights Management policies and content protection
 */
class DRMPolicyModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'drm_policies';
    }

    /**
     * Create a new DRM policy
     * @param {Object} policyData - DRM policy data
     * @returns {Promise<Object>} Created policy
     */
    async create(policyData) {
        try {
            const {
                publication_id,
                policy_name,
                drm_type,
                protection_level,
                watermark_enabled = false,
                watermark_text = null,
                copy_protection = false,
                print_protection = false,
                lending_allowed = true,
                expiration_days = null,
                device_limit = null,
                geographical_restrictions = [],
                custom_restrictions = {},
                status = 'active'
            } = policyData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    policy_name,
                    drm_type,
                    protection_level,
                    watermark_enabled,
                    watermark_text,
                    copy_protection,
                    print_protection,
                    lending_allowed,
                    expiration_days,
                    device_limit,
                    geographical_restrictions,
                    custom_restrictions,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create DRM policy', {
                    error: error.message,
                    policyData: { publication_id, policy_name, drm_type }
                });
                throw error;
            }

            logger.info('DRM policy created successfully', {
                policyId: data.id,
                publicationId: data.publication_id,
                policyName: data.policy_name,
                drmType: data.drm_type
            });

            return data;
        } catch (error) {
            logger.error('DRM policy creation error', {
                error: error.message,
                stack: error.stack,
                policyData
            });
            throw error;
        }
    }

    /**
     * Get DRM policy by ID
     * @param {string} id - Policy ID
     * @returns {Promise<Object|null>} Policy data
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
                logger.error('Failed to fetch DRM policy by ID', {
                    error: error.message,
                    policyId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('DRM policy fetch error', {
                error: error.message,
                policyId: id
            });
            throw error;
        }
    }

    /**
     * Get DRM policy by publication ID
     * @param {string} publicationId - Publication ID
     * @returns {Promise<Object|null>} Active DRM policy
     */
    async findByPublicationId(publicationId) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch DRM policy by publication ID', {
                    error: error.message,
                    publicationId
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('DRM policy fetch by publication error', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Update DRM policy
     * @param {string} id - Policy ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated policy
     */
    async update(id, updateData) {
        try {
            const existingPolicy = await this.findById(id);
            if (!existingPolicy) {
                throw new Error('DRM policy not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update DRM policy', {
                    error: error.message,
                    policyId: id,
                    updateData
                });
                throw error;
            }

            logger.info('DRM policy updated successfully', {
                policyId: data.id,
                publicationId: data.publication_id,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('DRM policy update error', {
                error: error.message,
                policyId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Deactivate DRM policy
     * @param {string} id - Policy ID
     * @param {string} reason - Deactivation reason
     * @returns {Promise<Object>} Updated policy
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
            logger.error('DRM policy deactivation error', {
                error: error.message,
                policyId: id,
                reason
            });
            throw error;
        }
    }

    /**
     * Get all DRM policies with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated policies
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                drmType,
                protectionLevel,
                status = 'active',
                search
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `, { count: 'exact' });

            if (drmType) {
                if (Array.isArray(drmType)) {
                    query = query.in('drm_type', drmType);
                } else {
                    query = query.eq('drm_type', drmType);
                }
            }

            if (protectionLevel) {
                if (Array.isArray(protectionLevel)) {
                    query = query.in('protection_level', protectionLevel);
                } else {
                    query = query.eq('protection_level', protectionLevel);
                }
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (search) {
                query = query.or(`policy_name.ilike.%${search}%,drm_type.ilike.%${search}%`);
            }

            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch DRM policies', {
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
            logger.error('DRM policies fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get DRM policies by type
     * @param {string} drmType - DRM type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Policies list
     */
    async findByType(drmType, options = {}) {
        try {
            const { status = 'active', includeInactive = false } = options;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type)
                `)
                .eq('drm_type', drmType);

            if (!includeInactive) {
                query = query.eq('status', status);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch DRM policies by type', {
                    error: error.message,
                    drmType,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('DRM policies by type fetch error', {
                error: error.message,
                drmType,
                options
            });
            throw error;
        }
    }

    /**
     * Check DRM compatibility for publication
     * @param {string} publicationId - Publication ID
     * @param {string} requestedDrmType - Requested DRM type
     * @returns {Promise<Object>} Compatibility check result
     */
    async checkDRMCompatibility(publicationId, requestedDrmType) {
        try {
            // Get publication details
            const { data: publication, error: pubError } = await this.supabase
                .from('publications')
                .select('publication_type, formats')
                .eq('id', publicationId)
                .single();

            if (pubError) {
                throw pubError;
            }

            // Get current DRM policy
            const currentPolicy = await this.findByPublicationId(publicationId);

            const compatibility = {
                isCompatible: true,
                warnings: [],
                recommendations: [],
                currentPolicy: currentPolicy,
                conflicts: []
            };

            // Check format compatibility
            const formatCompatibility = this.checkFormatCompatibility(
                publication.publication_type,
                publication.formats,
                requestedDrmType
            );

            if (!formatCompatibility.compatible) {
                compatibility.isCompatible = false;
                compatibility.warnings.push(
                    `DRM type ${requestedDrmType} is not compatible with ${publication.publication_type}`
                );
            }

            // Check for policy conflicts
            if (currentPolicy && currentPolicy.drm_type !== requestedDrmType) {
                compatibility.conflicts.push({
                    type: 'drm_type_change',
                    current: currentPolicy.drm_type,
                    requested: requestedDrmType,
                    severity: 'warning'
                });
            }

            // Add recommendations
            compatibility.recommendations = this.getDRMRecommendations(
                publication.publication_type,
                requestedDrmType
            );

            return compatibility;
        } catch (error) {
            logger.error('DRM compatibility check error', {
                error: error.message,
                publicationId,
                requestedDrmType
            });
            throw error;
        }
    }

    /**
     * Generate DRM protection settings
     * @param {string} publicationId - Publication ID
     * @param {string} protectionLevel - Protection level (low, medium, high)
     * @returns {Promise<Object>} Generated protection settings
     */
    async generateProtectionSettings(publicationId, protectionLevel = 'medium') {
        try {
            const settings = {
                protection_level: protectionLevel,
                watermark_enabled: false,
                copy_protection: false,
                print_protection: false,
                lending_allowed: true,
                device_limit: null,
                expiration_days: null,
                geographical_restrictions: []
            };

            switch (protectionLevel) {
                case 'low':
                    settings.watermark_enabled = true;
                    settings.watermark_text = 'Protected Content';
                    settings.lending_allowed = true;
                    break;

                case 'medium':
                    settings.watermark_enabled = true;
                    settings.watermark_text = 'Protected Content - Unauthorized distribution prohibited';
                    settings.copy_protection = true;
                    settings.print_protection = true;
                    settings.device_limit = 6;
                    settings.lending_allowed = true;
                    break;

                case 'high':
                    settings.watermark_enabled = true;
                    settings.watermark_text = 'Protected Content - Unauthorized distribution prohibited';
                    settings.copy_protection = true;
                    settings.print_protection = true;
                    settings.device_limit = 3;
                    settings.lending_allowed = false;
                    settings.expiration_days = 365;
                    break;

                case 'enterprise':
                    settings.watermark_enabled = true;
                    settings.watermark_text = 'Confidential Enterprise Content';
                    settings.copy_protection = true;
                    settings.print_protection = true;
                    settings.device_limit = 1;
                    settings.lending_allowed = false;
                    settings.expiration_days = 30;
                    break;
            }

            return settings;
        } catch (error) {
            logger.error('DRM protection settings generation error', {
                error: error.message,
                publicationId,
                protectionLevel
            });
            throw error;
        }
    }

    /**
     * Get DRM statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} DRM statistics
     */
    async getStatistics(options = {}) {
        try {
            const { startDate, endDate, drmType } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('drm_type, protection_level, status, watermark_enabled, copy_protection, print_protection, created_at');

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            if (drmType) {
                query = query.eq('drm_type', drmType);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch DRM statistics', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const stats = {
                total: data.length,
                byType: {},
                byProtectionLevel: {},
                byStatus: {},
                features: {
                    watermarkEnabled: 0,
                    copyProtection: 0,
                    printProtection: 0
                },
                recentPolicies: 0
            };

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            data.forEach(policy => {
                // By type
                stats.byType[policy.drm_type] = (stats.byType[policy.drm_type] || 0) + 1;

                // By protection level
                stats.byProtectionLevel[policy.protection_level] = 
                    (stats.byProtectionLevel[policy.protection_level] || 0) + 1;

                // By status
                stats.byStatus[policy.status] = (stats.byStatus[policy.status] || 0) + 1;

                // Features
                if (policy.watermark_enabled) stats.features.watermarkEnabled++;
                if (policy.copy_protection) stats.features.copyProtection++;
                if (policy.print_protection) stats.features.printProtection++;

                // Recent policies
                if (new Date(policy.created_at) > thirtyDaysAgo) {
                    stats.recentPolicies++;
                }
            });

            return stats;
        } catch (error) {
            logger.error('DRM statistics error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Helper: Check format compatibility with DRM type
     * @param {string} publicationType - Publication type
     * @param {Array} formats - Available formats
     * @param {string} drmType - DRM type
     * @returns {Object} Compatibility result
     */
    checkFormatCompatibility(publicationType, formats, drmType) {
        const compatibility = {
            compatible: true,
            supportedFormats: [],
            unsupportedFormats: []
        };

        const drmFormatSupport = {
            'adobe_drm': ['epub', 'pdf'],
            'amazon_drm': ['azw', 'kfx', 'mobi'],
            'apple_drm': ['epub', 'ibooks'],
            'kobo_drm': ['epub', 'kepub'],
            'watermark': ['epub', 'pdf', 'mobi', 'azw', 'docx'],
            'none': ['epub', 'pdf', 'mobi', 'azw', 'docx', 'txt']
        };

        const supportedByDrm = drmFormatSupport[drmType] || [];

        formats.forEach(format => {
            if (supportedByDrm.includes(format.toLowerCase())) {
                compatibility.supportedFormats.push(format);
            } else {
                compatibility.unsupportedFormats.push(format);
                compatibility.compatible = false;
            }
        });

        return compatibility;
    }

    /**
     * Helper: Get DRM recommendations
     * @param {string} publicationType - Publication type
     * @param {string} drmType - DRM type
     * @returns {Array} Recommendations
     */
    getDRMRecommendations(publicationType, drmType) {
        const recommendations = [];

        if (publicationType === 'ebook') {
            if (drmType === 'none') {
                recommendations.push('Consider watermarking for basic protection');
            } else if (drmType === 'adobe_drm') {
                recommendations.push('Adobe DRM provides good cross-platform compatibility');
            }
        }

        if (publicationType === 'audiobook') {
            recommendations.push('Consider streaming-based DRM for audiobooks');
        }

        if (drmType === 'watermark') {
            recommendations.push('Watermarking allows better user experience while providing traceability');
        }

        return recommendations;
    }

    /**
     * Clone DRM policy to another publication
     * @param {string} sourcePolicyId - Source policy ID
     * @param {string} targetPublicationId - Target publication ID
     * @param {Object} overrides - Policy overrides
     * @returns {Promise<Object>} Cloned policy
     */
    async clonePolicy(sourcePolicyId, targetPublicationId, overrides = {}) {
        try {
            const sourcePolicy = await this.findById(sourcePolicyId);
            if (!sourcePolicy) {
                throw new Error('Source DRM policy not found');
            }

            const newPolicyData = {
                publication_id: targetPublicationId,
                policy_name: `${sourcePolicy.policy_name} (Copy)`,
                drm_type: sourcePolicy.drm_type,
                protection_level: sourcePolicy.protection_level,
                watermark_enabled: sourcePolicy.watermark_enabled,
                watermark_text: sourcePolicy.watermark_text,
                copy_protection: sourcePolicy.copy_protection,
                print_protection: sourcePolicy.print_protection,
                lending_allowed: sourcePolicy.lending_allowed,
                expiration_days: sourcePolicy.expiration_days,
                device_limit: sourcePolicy.device_limit,
                geographical_restrictions: sourcePolicy.geographical_restrictions,
                custom_restrictions: sourcePolicy.custom_restrictions,
                ...overrides
            };

            return await this.create(newPolicyData);
        } catch (error) {
            logger.error('DRM policy clone error', {
                error: error.message,
                sourcePolicyId,
                targetPublicationId
            });
            throw error;
        }
    }
}

module.exports = DRMPolicyModel;
