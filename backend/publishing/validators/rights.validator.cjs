/**
 * Rights Validator - Advanced Rights and Licensing Validation
 * Provides comprehensive validation for rights management and licensing
 * Handles territorial rights, licensing agreements, and compliance validation
 * Implements enterprise-grade validation for publishing rights workflows
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../config/logger.cjs');

class RightsValidator extends MetadataValidator {
    constructor() {
        super();
        this.validRightTypes = this.initializeValidRightTypes();
        this.validTerritories = this.initializeValidTerritories();
        this.validLanguages = this.initializeValidLanguages();
        this.validLicenseTypes = this.initializeValidLicenseTypes();
        this.validStatuses = ['pending', 'active', 'expired', 'revoked', 'suspended'];
    }

    // ========== Core Validation Methods ==========

    /**
     * Validate rights data for creation
     */
    async validateCreation(rightsData, options = {}) {
        this.resetValidation();

        try {
            // Required field validation
            await this.validateRequiredFields(rightsData);
            
            // Rights type validation
            await this.validateRightType(rightsData.right_type);
            
            // Territory validation
            await this.validateTerritory(rightsData.territory);
            
            // Language validation
            await this.validateLanguage(rightsData.language);
            
            // License validation
            await this.validateLicense(rightsData);
            
            // Date validation
            await this.validateDates(rightsData);
            
            // Financial terms validation
            await this.validateFinancialTerms(rightsData);
            
            // Conflict validation
            await this.validateConflicts(rightsData, options);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating rights creation', {
                error: error.message,
                rightsData: {
                    publication_id: rightsData.publication_id,
                    right_type: rightsData.right_type,
                    territory: rightsData.territory
                }
            });
            
            this.addError('validation_error', 
                `Rights validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate rights data for update
     */
    async validateUpdate(rightsId, updateData, options = {}) {
        this.resetValidation();

        try {
            // Validate only fields being updated
            if (updateData.right_type !== undefined) {
                await this.validateRightType(updateData.right_type);
            }

            if (updateData.territory !== undefined) {
                await this.validateTerritory(updateData.territory);
            }

            if (updateData.language !== undefined) {
                await this.validateLanguage(updateData.language);
            }

            if (updateData.license_type !== undefined) {
                await this.validateLicenseType(updateData.license_type);
            }

            if (updateData.start_date !== undefined || updateData.end_date !== undefined) {
                await this.validateDates({
                    start_date: updateData.start_date,
                    end_date: updateData.end_date
                });
            }

            if (updateData.exclusive !== undefined) {
                await this.validateExclusivity(updateData.exclusive);
            }

            if (updateData.royalty_rate !== undefined) {
                await this.validateRoyaltyRate(updateData.royalty_rate);
            }

            if (updateData.advance_amount !== undefined) {
                await this.validateAdvanceAmount(updateData.advance_amount);
            }

            if (updateData.status !== undefined) {
                await this.validateStatusTransition(rightsId, updateData.status, options);
            }

            // Conflict validation for critical updates
            if (updateData.territory || updateData.language || updateData.right_type) {
                await this.validateConflicts({ ...updateData, id: rightsId }, options);
            }

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating rights update', {
                error: error.message,
                rightsId,
                updateData
            });
            
            this.addError('validation_error', 
                `Rights update validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate territorial rights coverage
     */
    async validateTerritorialCoverage(publicationId, rightsData) {
        this.resetValidation();

        try {
            // Check for gaps in territorial coverage
            await this.validateCoverageGaps(publicationId, rightsData);
            
            // Check for overlapping rights
            await this.validateTerritorialOverlaps(publicationId, rightsData);
            
            // Validate market priorities
            await this.validateMarketPriorities(rightsData);
            
            // Check compliance with international laws
            await this.validateInternationalCompliance(rightsData);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating territorial coverage', {
                error: error.message,
                publicationId
            });
            
            this.addError('validation_error', 
                `Territorial coverage validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate licensing compliance
     */
    async validateLicensingCompliance(rightsData, options = {}) {
        this.resetValidation();

        try {
            // License type compliance
            await this.validateLicenseCompliance(rightsData);
            
            // Regulatory compliance
            await this.validateRegulatoryCompliance(rightsData);
            
            // Contract terms validation
            await this.validateContractTerms(rightsData);
            
            // Financial compliance
            await this.validateFinancialCompliance(rightsData);

            logger.debug('Licensing compliance validation completed', { 
                rightsId: rightsData.id, 
                options 
            });

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating licensing compliance', {
                error: error.message,
                rightsId: rightsData.id
            });
            
            this.addError('validation_error', 
                `Licensing compliance validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    // ========== Field-Specific Validation ==========

    /**
     * Validate required fields
     */
    async validateRequiredFields(rightsData) {
        const requiredFields = [
            'publication_id', 'right_type', 'territory', 
            'language', 'license_type', 'start_date'
        ];

        requiredFields.forEach(field => {
            if (rightsData[field] === undefined || rightsData[field] === null) {
                this.addError('required_field', 
                    `${field} is required`, 
                    field
                );
            }
        });

        // Additional validations for required fields
        if (rightsData.publication_id) {
            await this.validatePublicationId(rightsData.publication_id);
        }
    }

    /**
     * Validate publication ID
     */
    async validatePublicationId(publicationId) {
        if (!publicationId) {
            this.addError('missing_publication_id', 'Publication ID is required', 'publication_id');
            return;
        }

        // UUID format validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(publicationId)) {
            this.addError('invalid_publication_id_format', 
                'Publication ID must be a valid UUID', 
                'publication_id'
            );
        }
    }

    /**
     * Validate right type
     */
    async validateRightType(rightType) {
        if (!rightType) {
            this.addError('missing_right_type', 'Right type is required', 'right_type');
            return;
        }

        if (!this.validRightTypes.includes(rightType)) {
            this.addError('invalid_right_type', 
                `Right type must be one of: ${this.validRightTypes.join(', ')}`, 
                'right_type'
            );
        }

        // Specific validations for different right types
        if (rightType === 'translation' || rightType === 'adaptation') {
            this.addInfo('translation_adaptation_note', 
                'Translation and adaptation rights require additional documentation', 
                'right_type'
            );
        }
    }

    /**
     * Validate territory
     */
    async validateTerritory(territory) {
        if (!territory) {
            this.addError('missing_territory', 'Territory is required', 'territory');
            return;
        }

        if (typeof territory !== 'string') {
            this.addError('invalid_territory_format', 
                'Territory must be a string', 
                'territory'
            );
            return;
        }

        // Validate territory code format
        if (territory === 'WORLD') {
            // World rights are valid
            return;
        }

        if (!/^[A-Z]{2}$/.test(territory)) {
            this.addError('invalid_territory_code', 
                'Territory must be a 2-letter ISO country code or "WORLD"', 
                'territory'
            );
            return;
        }

        if (!this.validTerritories.includes(territory)) {
            this.addError('unsupported_territory', 
                `Territory "${territory}" is not in the supported list`, 
                'territory'
            );
        }
    }

    /**
     * Validate language
     */
    async validateLanguage(language) {
        if (!language) {
            this.addError('missing_language', 'Language is required', 'language');
            return;
        }

        if (typeof language !== 'string') {
            this.addError('invalid_language_format', 
                'Language must be a string', 
                'language'
            );
            return;
        }

        if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
            this.addError('invalid_language_code', 
                'Language must be a valid ISO 639-1 code (e.g., "en", "en-US")', 
                'language'
            );
            return;
        }

        const baseLanguage = language.split('-')[0];
        if (!this.validLanguages.includes(baseLanguage)) {
            this.addError('unsupported_language', 
                `Language "${baseLanguage}" is not supported`, 
                'language'
            );
        }
    }

    /**
     * Validate license type
     */
    async validateLicenseType(licenseType) {
        if (!licenseType) {
            this.addError('missing_license_type', 'License type is required', 'license_type');
            return;
        }

        if (!this.validLicenseTypes.includes(licenseType)) {
            this.addError('invalid_license_type', 
                `License type must be one of: ${this.validLicenseTypes.join(', ')}`, 
                'license_type'
            );
        }
    }

    /**
     * Validate license data
     */
    async validateLicense(rightsData) {
        if (rightsData.license_type) {
            await this.validateLicenseType(rightsData.license_type);
        }

        if (rightsData.exclusive !== undefined) {
            await this.validateExclusivity(rightsData.exclusive);
        }

        if (rightsData.sublicensing_allowed !== undefined) {
            await this.validateSublicensing(rightsData.sublicensing_allowed);
        }
    }

    /**
     * Validate exclusivity
     */
    async validateExclusivity(exclusive) {
        if (typeof exclusive !== 'boolean') {
            this.addError('invalid_exclusivity_type', 
                'Exclusivity must be a boolean value', 
                'exclusive'
            );
        }
    }

    /**
     * Validate sublicensing
     */
    async validateSublicensing(sublicensingAllowed) {
        if (typeof sublicensingAllowed !== 'boolean') {
            this.addError('invalid_sublicensing_type', 
                'Sublicensing allowed must be a boolean value', 
                'sublicensing_allowed'
            );
        }
    }

    /**
     * Validate dates
     */
    async validateDates(rightsData) {
        const { start_date, end_date } = rightsData;

        // Validate start date
        if (start_date) {
            if (!this.isValidDate(start_date)) {
                this.addError('invalid_start_date', 
                    'Start date must be a valid date', 
                    'start_date'
                );
            } else {
                const startDate = new Date(start_date);
                const now = new Date();
                
                if (startDate < now.setHours(0, 0, 0, 0)) {
                    this.addWarning('past_start_date', 
                        'Start date is in the past', 
                        'start_date'
                    );
                }
            }
        }

        // Validate end date
        if (end_date) {
            if (!this.isValidDate(end_date)) {
                this.addError('invalid_end_date', 
                    'End date must be a valid date', 
                    'end_date'
                );
            }
        }

        // Validate date relationship
        if (start_date && end_date && this.isValidDate(start_date) && this.isValidDate(end_date)) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            if (endDate <= startDate) {
                this.addError('invalid_date_range', 
                    'End date must be after start date', 
                    'end_date'
                );
            }

            // Check for extremely long terms
            const yearsDiff = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
            if (yearsDiff > 99) {
                this.addWarning('very_long_term', 
                    'License term is extremely long (over 99 years)', 
                    'end_date'
                );
            }
        }
    }

    /**
     * Validate financial terms
     */
    async validateFinancialTerms(rightsData) {
        // Validate royalty rate
        if (rightsData.royalty_rate !== undefined) {
            await this.validateRoyaltyRate(rightsData.royalty_rate);
        }

        // Validate advance amount
        if (rightsData.advance_amount !== undefined) {
            await this.validateAdvanceAmount(rightsData.advance_amount);
        }

        // Validate minimum guarantee
        if (rightsData.minimum_guarantee !== undefined) {
            await this.validateMinimumGuarantee(rightsData.minimum_guarantee);
        }

        // Validate currency
        if (rightsData.currency !== undefined) {
            await this.validateCurrency(rightsData.currency);
        }
    }

    /**
     * Validate royalty rate
     */
    async validateRoyaltyRate(royaltyRate) {
        if (royaltyRate === null) return; // Allow null for no royalty

        if (typeof royaltyRate !== 'number') {
            this.addError('invalid_royalty_rate_type', 
                'Royalty rate must be a number', 
                'royalty_rate'
            );
            return;
        }

        if (royaltyRate < 0) {
            this.addError('negative_royalty_rate', 
                'Royalty rate cannot be negative', 
                'royalty_rate'
            );
        }

        if (royaltyRate > 1) {
            this.addError('invalid_royalty_rate_range', 
                'Royalty rate must be between 0 and 1 (0% to 100%)', 
                'royalty_rate'
            );
        }

        if (royaltyRate > 0.5) {
            this.addWarning('high_royalty_rate', 
                'Royalty rate above 50% is unusually high', 
                'royalty_rate'
            );
        }
    }

    /**
     * Validate advance amount
     */
    async validateAdvanceAmount(advanceAmount) {
        if (advanceAmount === null) return; // Allow null for no advance

        if (typeof advanceAmount !== 'number') {
            this.addError('invalid_advance_amount_type', 
                'Advance amount must be a number', 
                'advance_amount'
            );
            return;
        }

        if (advanceAmount < 0) {
            this.addError('negative_advance_amount', 
                'Advance amount cannot be negative', 
                'advance_amount'
            );
        }

        if (advanceAmount > 10000000) {
            this.addWarning('very_high_advance', 
                'Advance amount is very high (over $10M equivalent)', 
                'advance_amount'
            );
        }
    }

    /**
     * Validate minimum guarantee
     */
    async validateMinimumGuarantee(minimumGuarantee) {
        if (minimumGuarantee === null) return;

        if (typeof minimumGuarantee !== 'number') {
            this.addError('invalid_minimum_guarantee_type', 
                'Minimum guarantee must be a number', 
                'minimum_guarantee'
            );
            return;
        }

        if (minimumGuarantee < 0) {
            this.addError('negative_minimum_guarantee', 
                'Minimum guarantee cannot be negative', 
                'minimum_guarantee'
            );
        }
    }

    /**
     * Validate currency
     */
    async validateCurrency(currency) {
        if (!currency) return;

        const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'PLN', 'SEK', 'NOK', 'DKK'];
        
        if (!validCurrencies.includes(currency.toUpperCase())) {
            this.addError('invalid_currency', 
                `Currency must be one of: ${validCurrencies.join(', ')}`, 
                'currency'
            );
        }
    }

    /**
     * Validate status transition
     */
    async validateStatusTransition(rightsId, newStatus, options = {}) {
        if (!this.validStatuses.includes(newStatus)) {
            this.addError('invalid_status', 
                `Status must be one of: ${this.validStatuses.join(', ')}`, 
                'status'
            );
            return;
        }

        // TODO: Implement status transition rules based on current status
        logger.debug('Validating rights status transition', { 
            rightsId, 
            newStatus, 
            options 
        });
    }

    // ========== Advanced Validation Methods ==========

    /**
     * Validate conflicts with existing rights
     */
    async validateConflicts(rightsData, options = {}) {
        // This would typically check against a database of existing rights
        logger.debug('Validating rights conflicts', { 
            publicationId: rightsData.publication_id,
            rightType: rightsData.right_type,
            territory: rightsData.territory,
            language: rightsData.language,
            options 
        });

        // Placeholder validation - would implement actual conflict detection
        if (rightsData.exclusive && rightsData.territory === 'WORLD') {
            this.addWarning('world_exclusive_rights', 
                'World exclusive rights may conflict with existing territorial rights', 
                'territory'
            );
        }
    }

    // ========== Helper Methods ==========

    /**
     * Check if a date is valid
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Initialize valid right types
     */
    initializeValidRightTypes() {
        return [
            'print', 'ebook', 'audiobook', 'translation', 'adaptation',
            'film', 'television', 'stage', 'merchandising', 'digital'
        ];
    }

    /**
     * Initialize valid territories (ISO 3166-1 alpha-2 codes)
     */
    initializeValidTerritories() {
        return [
            'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO',
            'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI',
            'AU', 'NZ', 'JP', 'KR', 'CN', 'IN', 'BR', 'MX', 'AR', 'CL'
        ];
    }

    /**
     * Initialize valid languages (ISO 639-1 codes)
     */
    initializeValidLanguages() {
        return [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'zh', 'ja',
            'ko', 'nl', 'sv', 'no', 'da', 'fi', 'cs', 'sk', 'hu', 'ro',
            'bg', 'hr', 'sl', 'ar', 'hi', 'th', 'vi', 'id', 'ms', 'tl'
        ];
    }

    /**
     * Initialize valid license types
     */
    initializeValidLicenseTypes() {
        return [
            'exclusive', 'non-exclusive', 'sole', 'first-refusal', 'option',
            'co-exclusive', 'limited-exclusive', 'territorial-exclusive'
        ];
    }

    /**
     * Placeholder methods for advanced validation
     */
    async validateCoverageGaps(publicationId, rightsData) {
        logger.debug('Validating coverage gaps', { 
            publicationId, 
            rightsCount: rightsData ? rightsData.length || 1 : 0 
        });
    }

    async validateTerritorialOverlaps(publicationId, rightsData) {
        logger.debug('Validating territorial overlaps', { 
            publicationId, 
            rightsData: rightsData ? { territory: rightsData.territory } : null 
        });
    }

    async validateMarketPriorities(rightsData) {
        logger.debug('Validating market priorities', { 
            territory: rightsData.territory 
        });
    }

    async validateInternationalCompliance(rightsData) {
        logger.debug('Validating international compliance', { 
            territory: rightsData.territory 
        });
    }

    async validateLicenseCompliance(rightsData) {
        logger.debug('Validating license compliance', { 
            licenseType: rightsData.license_type 
        });
    }

    async validateRegulatoryCompliance(rightsData) {
        logger.debug('Validating regulatory compliance', { 
            territory: rightsData.territory 
        });
    }

    async validateContractTerms(rightsData) {
        logger.debug('Validating contract terms', { id: rightsData.id });
    }

    async validateFinancialCompliance(rightsData) {
        logger.debug('Validating financial compliance', { 
            currency: rightsData.currency 
        });
    }
}

module.exports = RightsValidator;
