/**
 * Rights Management Service
 * DRM system, territorial rights, and licensing management
 */

const db = require('../../db.cjs');
const logger = require('../../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class RightsManagementService {
    /**
     * Create publication rights configuration
     */
    static async createRightsConfiguration(publicationId, rightsData, userId) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Verify user owns the publication
            const pubCheck = await client.query(
                'SELECT user_id FROM publications WHERE id = $1',
                [publicationId]
            );

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            if (pubCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to manage rights for this publication', 403);
            }

            const {
                drmEnabled,
                territorialRights,
                licensingTerms,
                copyrightInfo,
                distributionRights,
                printRights,
                audioRights,
                translationRights,
                expirationDate
            } = rightsData;

            // Create main rights record
            const rightsResult = await client.query(`
                INSERT INTO publication_rights (
                    publication_id, drm_enabled, territorial_rights,
                    licensing_terms, copyright_info, distribution_rights,
                    print_rights, audio_rights, translation_rights,
                    expiration_date, created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                RETURNING *
            `, [
                publicationId,
                drmEnabled || false,
                JSON.stringify(territorialRights || {}),
                JSON.stringify(licensingTerms || {}),
                JSON.stringify(copyrightInfo || {}),
                JSON.stringify(distributionRights || {}),
                JSON.stringify(printRights || {}),
                JSON.stringify(audioRights || {}),
                JSON.stringify(translationRights || {}),
                expirationDate,
                userId
            ]);

            const rights = rightsResult.rows[0];

            // Create territorial restrictions if specified
            if (territorialRights && territorialRights.restrictedCountries) {
                for (const country of territorialRights.restrictedCountries) {
                    await client.query(`
                        INSERT INTO territorial_restrictions (
                            rights_id, country_code, restriction_type,
                            restriction_reason, created_at
                        ) VALUES ($1, $2, $3, $4, NOW())
                    `, [
                        rights.id,
                        country.code,
                        country.type || 'blocked',
                        country.reason || 'Rights not available'
                    ]);
                }
            }

            // Create licensing agreements if specified
            if (licensingTerms && licensingTerms.agreements) {
                for (const agreement of licensingTerms.agreements) {
                    await client.query(`
                        INSERT INTO licensing_agreements (
                            rights_id, licensee_name, license_type,
                            start_date, end_date, terms, royalty_rate,
                            created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    `, [
                        rights.id,
                        agreement.licenseeName,
                        agreement.licenseType,
                        agreement.startDate,
                        agreement.endDate,
                        JSON.stringify(agreement.terms || {}),
                        agreement.royaltyRate || 0
                    ]);
                }
            }

            await client.query('COMMIT');

            logger.info(`Rights configuration created for publication ${publicationId}`);

            return this.formatRightsData(rights);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error creating rights configuration:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get rights configuration for publication
     */
    static async getRightsConfiguration(publicationId, userId) {
        try {
            // Verify ownership
            const pubCheck = await db.query(
                'SELECT user_id, title FROM publications WHERE id = $1',
                [publicationId]
            );

            if (pubCheck.rows.length === 0) {
                throw new AppError('Publication not found', 404);
            }

            if (pubCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to view rights for this publication', 403);
            }

            // Get rights configuration
            const rightsResult = await db.query(`
                SELECT pr.*,
                       array_agg(
                           DISTINCT jsonb_build_object(
                               'id', tr.id,
                               'countryCode', tr.country_code,
                               'restrictionType', tr.restriction_type,
                               'restrictionReason', tr.restriction_reason
                           )
                       ) FILTER (WHERE tr.id IS NOT NULL) as territorial_restrictions,
                       array_agg(
                           DISTINCT jsonb_build_object(
                               'id', la.id,
                               'licenseeName', la.licensee_name,
                               'licenseType', la.license_type,
                               'startDate', la.start_date,
                               'endDate', la.end_date,
                               'terms', la.terms,
                               'royaltyRate', la.royalty_rate
                           )
                       ) FILTER (WHERE la.id IS NOT NULL) as licensing_agreements
                FROM publication_rights pr
                LEFT JOIN territorial_restrictions tr ON pr.id = tr.rights_id
                LEFT JOIN licensing_agreements la ON pr.id = la.rights_id
                WHERE pr.publication_id = $1
                GROUP BY pr.id
            `, [publicationId]);

            if (rightsResult.rows.length === 0) {
                return null; // No rights configuration exists
            }

            const rights = rightsResult.rows[0];
            return this.formatRightsData(rights);

        } catch (error) {
            logger.error('Error getting rights configuration:', error);
            throw error;
        }
    }

    /**
     * Update rights configuration
     */
    static async updateRightsConfiguration(rightsId, updateData, userId) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // Verify ownership
            const rightsCheck = await client.query(`
                SELECT pr.*, p.user_id
                FROM publication_rights pr
                JOIN publications p ON pr.publication_id = p.id
                WHERE pr.id = $1
            `, [rightsId]);

            if (rightsCheck.rows.length === 0) {
                throw new AppError('Rights configuration not found', 404);
            }

            if (rightsCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to update this rights configuration', 403);
            }

            const {
                drmEnabled,
                territorialRights,
                licensingTerms,
                copyrightInfo,
                distributionRights,
                printRights,
                audioRights,
                translationRights,
                expirationDate
            } = updateData;

            // Update main rights record
            const result = await client.query(`
                UPDATE publication_rights
                SET
                    drm_enabled = COALESCE($2, drm_enabled),
                    territorial_rights = COALESCE($3, territorial_rights),
                    licensing_terms = COALESCE($4, licensing_terms),
                    copyright_info = COALESCE($5, copyright_info),
                    distribution_rights = COALESCE($6, distribution_rights),
                    print_rights = COALESCE($7, print_rights),
                    audio_rights = COALESCE($8, audio_rights),
                    translation_rights = COALESCE($9, translation_rights),
                    expiration_date = COALESCE($10, expiration_date),
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
            `, [
                rightsId,
                drmEnabled,
                territorialRights ? JSON.stringify(territorialRights) : null,
                licensingTerms ? JSON.stringify(licensingTerms) : null,
                copyrightInfo ? JSON.stringify(copyrightInfo) : null,
                distributionRights ? JSON.stringify(distributionRights) : null,
                printRights ? JSON.stringify(printRights) : null,
                audioRights ? JSON.stringify(audioRights) : null,
                translationRights ? JSON.stringify(translationRights) : null,
                expirationDate
            ]);

            await client.query('COMMIT');

            logger.info(`Rights configuration updated: ${rightsId}`);

            return this.formatRightsData(result.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error updating rights configuration:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Check territorial access rights
     */
    static async checkTerritorialAccess(publicationId, countryCode, requestType = 'read') {
        try {
            const result = await db.query(`
                SELECT
                    pr.territorial_rights,
                    tr.restriction_type,
                    tr.restriction_reason
                FROM publication_rights pr
                LEFT JOIN territorial_restrictions tr ON pr.id = tr.rights_id
                    AND tr.country_code = $2
                WHERE pr.publication_id = $1
            `, [publicationId, countryCode]);

            if (result.rows.length === 0) {
                return { allowed: true }; // No restrictions = allowed
            }

            const rights = result.rows[0];
            const territorialRights = JSON.parse(rights.territorial_rights || '{}');

            // Check if country is specifically restricted
            if (rights.restriction_type) {
                return {
                    allowed: false,
                    reason: rights.restriction_reason || 'Access restricted in this territory',
                    restrictionType: rights.restriction_type
                };
            }

            // Check global territorial policy
            if (territorialRights.globalPolicy) {
                const policy = territorialRights.globalPolicy;

                if (policy.type === 'whitelist' && !policy.allowedCountries?.includes(countryCode)) {
                    return {
                        allowed: false,
                        reason: 'Territory not in allowed list'
                    };
                }

                if (policy.type === 'blacklist' && policy.blockedCountries?.includes(countryCode)) {
                    return {
                        allowed: false,
                        reason: 'Territory blocked'
                    };
                }
            }

            return { allowed: true };

        } catch (error) {
            logger.error('Error checking territorial access:', error);
            throw error;
        }
    }

    /**
     * Apply DRM protection to file
     */
    static async applyDRMProtection(publicationId, fileUrl, protectionLevel = 'standard') {
        try {
            // Get DRM configuration
            const drmResult = await db.query(`
                SELECT drm_enabled, distribution_rights
                FROM publication_rights
                WHERE publication_id = $1
            `, [publicationId]);

            if (drmResult.rows.length === 0 || !drmResult.rows[0].drm_enabled) {
                return {
                    protected: false,
                    originalUrl: fileUrl
                };
            }

            const distributionRights = JSON.parse(drmResult.rows[0].distribution_rights || '{}');

            // Apply DRM based on protection level
            const drmConfig = {
                level: protectionLevel,
                allowCopy: distributionRights.allowCopy || false,
                allowPrint: distributionRights.allowPrint || false,
                allowScreenshot: distributionRights.allowScreenshot || false,
                watermark: distributionRights.watermark || false,
                expirationDays: distributionRights.expirationDays || null
            };

            // Generate protected URL (this would integrate with actual DRM service)
            const protectedUrl = await this.generateDRMProtectedUrl(fileUrl, drmConfig);

            // Log DRM application
            await db.query(`
                INSERT INTO drm_applications (
                    publication_id, original_url, protected_url,
                    protection_level, drm_config, created_at
                ) VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
                publicationId,
                fileUrl,
                protectedUrl,
                protectionLevel,
                JSON.stringify(drmConfig)
            ]);

            logger.info(`DRM protection applied to publication ${publicationId}`);

            return {
                protected: true,
                protectedUrl,
                originalUrl: fileUrl,
                protectionLevel,
                config: drmConfig
            };

        } catch (error) {
            logger.error('Error applying DRM protection:', error);
            throw error;
        }
    }

    /**
     * Generate licensing agreement
     */
    static async generateLicensingAgreement(rightsId, agreementData, userId) {
        try {
            // Verify rights ownership
            const rightsCheck = await db.query(`
                SELECT pr.*, p.user_id
                FROM publication_rights pr
                JOIN publications p ON pr.publication_id = p.id
                WHERE pr.id = $1
            `, [rightsId]);

            if (rightsCheck.rows.length === 0) {
                throw new AppError('Rights configuration not found', 404);
            }

            if (rightsCheck.rows[0].user_id !== userId) {
                throw new AppError('Not authorized to create licensing agreements', 403);
            }

            const {
                licenseeName,
                licenseeEmail,
                licenseType,
                startDate,
                endDate,
                royaltyRate,
                terms,
                territorialScope
            } = agreementData;

            const result = await db.query(`
                INSERT INTO licensing_agreements (
                    rights_id, licensee_name, licensee_email, license_type,
                    start_date, end_date, royalty_rate, terms,
                    territorial_scope, status, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', NOW())
                RETURNING *
            `, [
                rightsId,
                licenseeName,
                licenseeEmail,
                licenseType,
                startDate,
                endDate,
                royaltyRate || 0,
                JSON.stringify(terms || {}),
                JSON.stringify(territorialScope || {})
            ]);

            logger.info(`Licensing agreement created for rights ${rightsId}`);

            return {
                id: result.rows[0].id,
                licenseeName: result.rows[0].licensee_name,
                licenseeEmail: result.rows[0].licensee_email,
                licenseType: result.rows[0].license_type,
                startDate: result.rows[0].start_date,
                endDate: result.rows[0].end_date,
                royaltyRate: parseFloat(result.rows[0].royalty_rate),
                terms: JSON.parse(result.rows[0].terms || '{}'),
                territorialScope: JSON.parse(result.rows[0].territorial_scope || '{}'),
                status: result.rows[0].status,
                createdAt: result.rows[0].created_at
            };

        } catch (error) {
            logger.error('Error generating licensing agreement:', error);
            throw error;
        }
    }

    /**
     * Get rights violations and reports
     */
    static async getRightsViolations(userId, options = {}) {
        try {
            const { period = '30d', status = 'all' } = options;
            const periodInterval = this.parsePeriod(period);

            let query = `
                SELECT
                    rv.*,
                    p.title as publication_title,
                    pr.id as rights_id
                FROM rights_violations rv
                JOIN publications p ON rv.publication_id = p.id
                LEFT JOIN publication_rights pr ON p.id = pr.publication_id
                WHERE p.user_id = $1
                    AND rv.reported_at >= NOW() - INTERVAL '${periodInterval}'
            `;

            const params = [userId];
            let paramCount = 1;

            if (status !== 'all') {
                query += ` AND rv.status = $${++paramCount}`;
                params.push(status);
            }

            query += ` ORDER BY rv.reported_at DESC`;

            const result = await db.query(query, params);

            return result.rows.map(violation => ({
                id: violation.id,
                publicationId: violation.publication_id,
                publicationTitle: violation.publication_title,
                rightsId: violation.rights_id,
                violationType: violation.violation_type,
                description: violation.description,
                reportedUrl: violation.reported_url,
                reporterInfo: JSON.parse(violation.reporter_info || '{}'),
                status: violation.status,
                reportedAt: violation.reported_at,
                resolvedAt: violation.resolved_at,
                resolutionNotes: violation.resolution_notes
            }));

        } catch (error) {
            logger.error('Error getting rights violations:', error);
            throw error;
        }
    }

    // Private helper methods

    /**
     * Generate DRM protected URL
     */
    static async generateDRMProtectedUrl(originalUrl, drmConfig) {
        // Mock implementation - would integrate with actual DRM service
        const timestamp = Date.now();
        const hash = Buffer.from(`${originalUrl}-${timestamp}`).toString('base64');
        return `${originalUrl}?drm=${hash}&expires=${timestamp + (24 * 60 * 60 * 1000)}`;
    }

    /**
     * Format rights data for API response
     */
    static formatRightsData(rights) {
        return {
            id: rights.id,
            publicationId: rights.publication_id,
            drmEnabled: rights.drm_enabled,
            territorialRights: JSON.parse(rights.territorial_rights || '{}'),
            licensingTerms: JSON.parse(rights.licensing_terms || '{}'),
            copyrightInfo: JSON.parse(rights.copyright_info || '{}'),
            distributionRights: JSON.parse(rights.distribution_rights || '{}'),
            printRights: JSON.parse(rights.print_rights || '{}'),
            audioRights: JSON.parse(rights.audio_rights || '{}'),
            translationRights: JSON.parse(rights.translation_rights || '{}'),
            expirationDate: rights.expiration_date,
            territorialRestrictions: rights.territorial_restrictions || [],
            licensingAgreements: rights.licensing_agreements || [],
            createdAt: rights.created_at,
            updatedAt: rights.updated_at
        };
    }

    /**
     * Parse period string
     */
    static parsePeriod(period) {
        const periodMap = {
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days',
            '1y': '1 year'
        };
        return periodMap[period] || '30 days';
    }
}

module.exports = RightsManagementService;
