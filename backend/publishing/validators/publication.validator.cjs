/**
 * Publication Validator - Advanced Publication Data Validation
 * Provides comprehensive validation for publication data integrity
 * Handles complex business rules, format requirements, and compliance checking
 * Implements enterprise-grade validation patterns with detailed error reporting
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../config/logger.cjs');

class PublicationValidator extends MetadataValidator {
    constructor() {
        super();
        this.validGenres = this.loadValidGenres();
        this.validLanguages = this.loadValidLanguages();
        this.validPublicationTypes = ['ebook', 'paperback', 'hardcover', 'audiobook', 'bundle'];
        this.validTargetAudiences = ['children', 'young_adult', 'adult', 'all_ages'];
        this.validStatuses = ['draft', 'review', 'approved', 'published', 'suspended', 'archived'];
    }

    // ========== Core Validation Methods ==========

    /**
     * Validate publication data for creation
     */
    async validateCreation(publicationData, options = {}) {
        this.resetValidation();

        try {
            // Required field validation
            await this.validateRequiredFields(publicationData);
            
            // Format and type validation
            await this.validateFormats(publicationData);
            
            // Content validation
            await this.validateContent(publicationData);
            
            // Business rules validation
            await this.validateBusinessRules(publicationData, options);
            
            // Metadata compliance validation
            await this.validateMetadataCompliance(publicationData);
            
            // Pricing validation
            await this.validatePricing(publicationData);
            
            // Territory validation
            await this.validateTerritories(publicationData);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating publication creation', {
                error: error.message,
                publicationData: {
                    title: publicationData.title,
                    type: publicationData.publication_type
                }
            });
            
            this.addError('validation_error', 
                `Validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate publication data for update
     */
    async validateUpdate(publicationId, updateData, options = {}) {
        this.resetValidation();

        try {
            // Validate only fields being updated
            if (updateData.title !== undefined) {
                await this.validateTitle(updateData.title);
            }

            if (updateData.description !== undefined) {
                await this.validateDescription(updateData.description);
            }

            if (updateData.publication_type !== undefined) {
                await this.validatePublicationType(updateData.publication_type);
            }

            if (updateData.genre !== undefined) {
                await this.validateGenre(updateData.genre);
            }

            if (updateData.language !== undefined) {
                await this.validateLanguage(updateData.language);
            }

            if (updateData.target_audience !== undefined) {
                await this.validateTargetAudience(updateData.target_audience);
            }

            if (updateData.isbn_13 !== undefined) {
                await this.validateISBN13(updateData.isbn_13);
            }

            if (updateData.isbn_10 !== undefined) {
                await this.validateISBN10(updateData.isbn_10);
            }

            if (updateData.pricing !== undefined) {
                await this.validatePricing({ pricing: updateData.pricing });
            }

            if (updateData.territories !== undefined) {
                await this.validateTerritories({ territories: updateData.territories });
            }

            if (updateData.keywords !== undefined) {
                await this.validateKeywords(updateData.keywords);
            }

            if (updateData.bisac_categories !== undefined) {
                await this.validateBISACCategories(updateData.bisac_categories);
            }

            // Status transition validation
            if (updateData.status !== undefined) {
                await this.validateStatusTransition(publicationId, updateData.status, options);
            }

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating publication update', {
                error: error.message,
                publicationId,
                updateData
            });
            
            this.addError('validation_error', 
                `Update validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate publication readiness for publishing
     */
    async validatePublishingReadiness(publicationData) {
        this.resetValidation();

        try {
            // All required fields must be present
            await this.validateRequiredFields(publicationData, { strict: true });
            
            // Content completeness validation
            await this.validateContentCompleteness(publicationData);
            
            // Format requirements validation
            await this.validateFormatRequirements(publicationData);
            
            // Rights and licensing validation
            await this.validateRightsCompliance(publicationData);
            
            // Quality standards validation
            await this.validateQualityStandards(publicationData);
            
            // Distribution readiness validation
            await this.validateDistributionReadiness(publicationData);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating publishing readiness', {
                error: error.message,
                publicationId: publicationData.id
            });
            
            this.addError('validation_error', 
                `Publishing readiness validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    // ========== Field-Specific Validation ==========

    /**
     * Validate required fields
     */
    async validateRequiredFields(publicationData, options = {}) {
        const requiredFields = ['title', 'publication_type', 'language'];
        
        if (options.strict) {
            requiredFields.push('description', 'genre', 'target_audience');
        }

        requiredFields.forEach(field => {
            if (!publicationData[field] || (typeof publicationData[field] === 'string' && publicationData[field].trim() === '')) {
                this.addError('required_field', 
                    `${field} is required`, 
                    field
                );
            }
        });

        // Validate title
        if (publicationData.title) {
            await this.validateTitle(publicationData.title);
        }

        // Validate publication type
        if (publicationData.publication_type) {
            await this.validatePublicationType(publicationData.publication_type);
        }

        // Validate language
        if (publicationData.language) {
            await this.validateLanguage(publicationData.language);
        }
    }

    /**
     * Validate title
     */
    async validateTitle(title) {
        if (!title || typeof title !== 'string') {
            this.addError('invalid_title', 'Title must be a non-empty string', 'title');
            return;
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < 1) {
            this.addError('title_too_short', 'Title cannot be empty', 'title');
        }

        if (trimmedTitle.length > 300) {
            this.addError('title_too_long', 'Title cannot exceed 300 characters', 'title');
        }

        // Check for invalid characters
        const invalidCharsRegex = /[<>{}[\]\\]/;
        if (invalidCharsRegex.test(trimmedTitle)) {
            this.addError('title_invalid_chars', 
                'Title contains invalid characters: < > { } [ ] \\', 
                'title'
            );
        }

        // Check for suspicious patterns
        if (trimmedTitle.toLowerCase().includes('test') || trimmedTitle.toLowerCase().includes('temp')) {
            this.addWarning('suspicious_title', 
                'Title appears to be a test or temporary title', 
                'title'
            );
        }
    }

    /**
     * Validate description
     */
    async validateDescription(description) {
        if (!description || typeof description !== 'string') {
            this.addError('invalid_description', 'Description must be a string', 'description');
            return;
        }

        const trimmedDescription = description.trim();

        if (trimmedDescription.length < 50) {
            this.addWarning('description_too_short', 
                'Description should be at least 50 characters for better discoverability', 
                'description'
            );
        }

        if (trimmedDescription.length > 4000) {
            this.addError('description_too_long', 
                'Description cannot exceed 4000 characters', 
                'description'
            );
        }

        // Check for HTML tags (basic validation)
        const htmlTagRegex = /<[^>]*>/;
        if (htmlTagRegex.test(trimmedDescription)) {
            this.addWarning('description_contains_html', 
                'Description contains HTML tags which may not display correctly', 
                'description'
            );
        }
    }

    /**
     * Validate publication type
     */
    async validatePublicationType(publicationType) {
        if (!publicationType) {
            this.addError('missing_publication_type', 'Publication type is required', 'publication_type');
            return;
        }

        if (!this.validPublicationTypes.includes(publicationType)) {
            this.addError('invalid_publication_type', 
                `Publication type must be one of: ${this.validPublicationTypes.join(', ')}`, 
                'publication_type'
            );
        }
    }

    /**
     * Validate genre
     */
    async validateGenre(genre) {
        if (!genre) {
            this.addWarning('missing_genre', 'Genre helps with discoverability', 'genre');
            return;
        }

        if (!this.validGenres.includes(genre.toLowerCase())) {
            this.addWarning('unrecognized_genre', 
                `Genre "${genre}" is not in the standard list`, 
                'genre'
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

        if (!this.validLanguages.includes(language.toLowerCase())) {
            this.addError('invalid_language', 
                `Language "${language}" is not supported`, 
                'language'
            );
        }
    }

    /**
     * Validate target audience
     */
    async validateTargetAudience(targetAudience) {
        if (!targetAudience) {
            this.addWarning('missing_target_audience', 
                'Target audience helps with appropriate content filtering', 
                'target_audience'
            );
            return;
        }

        if (!this.validTargetAudiences.includes(targetAudience)) {
            this.addError('invalid_target_audience', 
                `Target audience must be one of: ${this.validTargetAudiences.join(', ')}`, 
                'target_audience'
            );
        }
    }

    /**
     * Validate ISBN-13
     */
    async validateISBN13(isbn13) {
        if (!isbn13) return; // ISBN is optional

        // Remove hyphens and spaces
        const cleanISBN = isbn13.replace(/[-\s]/g, '');

        if (cleanISBN.length !== 13) {
            this.addError('invalid_isbn13_length', 
                'ISBN-13 must be exactly 13 digits', 
                'isbn_13'
            );
            return;
        }

        if (!/^\d{13}$/.test(cleanISBN)) {
            this.addError('invalid_isbn13_format', 
                'ISBN-13 must contain only digits', 
                'isbn_13'
            );
            return;
        }

        // Validate ISBN-13 check digit
        if (!this.validateISBN13CheckDigit(cleanISBN)) {
            this.addError('invalid_isbn13_checksum', 
                'ISBN-13 check digit is invalid', 
                'isbn_13'
            );
        }

        // Check prefix (should start with 978 or 979)
        if (!cleanISBN.startsWith('978') && !cleanISBN.startsWith('979')) {
            this.addError('invalid_isbn13_prefix', 
                'ISBN-13 must start with 978 or 979', 
                'isbn_13'
            );
        }
    }

    /**
     * Validate ISBN-10
     */
    async validateISBN10(isbn10) {
        if (!isbn10) return; // ISBN is optional

        // Remove hyphens and spaces
        const cleanISBN = isbn10.replace(/[-\s]/g, '');

        if (cleanISBN.length !== 10) {
            this.addError('invalid_isbn10_length', 
                'ISBN-10 must be exactly 10 characters', 
                'isbn_10'
            );
            return;
        }

        if (!/^\d{9}[\dX]$/.test(cleanISBN)) {
            this.addError('invalid_isbn10_format', 
                'ISBN-10 must be 9 digits followed by a digit or X', 
                'isbn_10'
            );
            return;
        }

        // Validate ISBN-10 check digit
        if (!this.validateISBN10CheckDigit(cleanISBN)) {
            this.addError('invalid_isbn10_checksum', 
                'ISBN-10 check digit is invalid', 
                'isbn_10'
            );
        }
    }

    /**
     * Validate pricing
     */
    async validatePricing(publicationData) {
        if (!publicationData.pricing) {
            this.addWarning('missing_pricing', 
                'Pricing information is recommended for distribution', 
                'pricing'
            );
            return;
        }

        const pricing = publicationData.pricing;

        // Validate pricing structure
        Object.entries(pricing).forEach(([currency, priceData]) => {
            if (!this.isValidCurrencyCode(currency)) {
                this.addError('invalid_currency', 
                    `Invalid currency code: ${currency}`, 
                    'pricing'
                );
                return;
            }

            if (typeof priceData !== 'object' || priceData === null) {
                this.addError('invalid_price_data', 
                    `Price data for ${currency} must be an object`, 
                    'pricing'
                );
                return;
            }

            // Validate price values
            if (priceData.retail_price !== undefined) {
                if (typeof priceData.retail_price !== 'number' || priceData.retail_price < 0) {
                    this.addError('invalid_retail_price', 
                        `Retail price for ${currency} must be a non-negative number`, 
                        'pricing'
                    );
                }

                if (priceData.retail_price < 0.99 && currency === 'USD') {
                    this.addWarning('low_price_warning', 
                        'Prices below $0.99 may not be supported by all stores', 
                        'pricing'
                    );
                }
            }

            if (priceData.wholesale_price !== undefined) {
                if (typeof priceData.wholesale_price !== 'number' || priceData.wholesale_price < 0) {
                    this.addError('invalid_wholesale_price', 
                        `Wholesale price for ${currency} must be a non-negative number`, 
                        'pricing'
                    );
                }

                // Wholesale should be less than retail
                if (priceData.retail_price && priceData.wholesale_price >= priceData.retail_price) {
                    this.addWarning('wholesale_retail_mismatch', 
                        `Wholesale price should be lower than retail price for ${currency}`, 
                        'pricing'
                    );
                }
            }
        });
    }

    /**
     * Validate territories
     */
    async validateTerritories(publicationData) {
        if (!publicationData.territories) {
            this.addWarning('missing_territories', 
                'Territory specification helps with distribution planning', 
                'territories'
            );
            return;
        }

        if (!Array.isArray(publicationData.territories)) {
            this.addError('invalid_territories_format', 
                'Territories must be an array', 
                'territories'
            );
            return;
        }

        publicationData.territories.forEach((territory, index) => {
            if (typeof territory !== 'string') {
                this.addError('invalid_territory_format', 
                    `Territory at index ${index} must be a string`, 
                    'territories'
                );
                return;
            }

            if (!/^[A-Z]{2}$/.test(territory)) {
                this.addError('invalid_territory_code', 
                    `Territory "${territory}" must be a 2-letter ISO country code`, 
                    'territories'
                );
            }
        });

        // Check for duplicates
        const uniqueTerritories = [...new Set(publicationData.territories)];
        if (uniqueTerritories.length !== publicationData.territories.length) {
            this.addWarning('duplicate_territories', 
                'Duplicate territories detected', 
                'territories'
            );
        }
    }

    /**
     * Validate keywords
     */
    async validateKeywords(keywords) {
        if (!keywords) return;

        if (!Array.isArray(keywords)) {
            this.addError('invalid_keywords_format', 
                'Keywords must be an array', 
                'keywords'
            );
            return;
        }

        if (keywords.length > 20) {
            this.addWarning('too_many_keywords', 
                'More than 20 keywords may reduce effectiveness', 
                'keywords'
            );
        }

        keywords.forEach((keyword, index) => {
            if (typeof keyword !== 'string') {
                this.addError('invalid_keyword_format', 
                    `Keyword at index ${index} must be a string`, 
                    'keywords'
                );
                return;
            }

            if (keyword.length < 2) {
                this.addError('keyword_too_short', 
                    `Keyword "${keyword}" is too short`, 
                    'keywords'
                );
            }

            if (keyword.length > 50) {
                this.addError('keyword_too_long', 
                    `Keyword "${keyword}" is too long`, 
                    'keywords'
                );
            }
        });
    }

    /**
     * Validate BISAC categories
     */
    async validateBISACCategories(bisacCategories) {
        if (!bisacCategories) return;

        if (!Array.isArray(bisacCategories)) {
            this.addError('invalid_bisac_format', 
                'BISAC categories must be an array', 
                'bisac_categories'
            );
            return;
        }

        if (bisacCategories.length > 3) {
            this.addWarning('too_many_bisac_categories', 
                'Most stores accept a maximum of 3 BISAC categories', 
                'bisac_categories'
            );
        }

        bisacCategories.forEach((category, index) => {
            if (typeof category !== 'string') {
                this.addError('invalid_bisac_format', 
                    `BISAC category at index ${index} must be a string`, 
                    'bisac_categories'
                );
                return;
            }

            // Basic BISAC format validation (3 letters + 6 digits)
            if (!/^[A-Z]{3}\d{6}$/.test(category)) {
                this.addError('invalid_bisac_code', 
                    `BISAC category "${category}" must be in format AAA000000`, 
                    'bisac_categories'
                );
            }
        });
    }

    // ========== Advanced Validation Methods ==========

    /**
     * Validate content completeness
     */
    async validateContentCompleteness(publicationData) {
        // Check for chapters if it's a book
        if (['ebook', 'paperback', 'hardcover'].includes(publicationData.publication_type)) {
            if (!publicationData.chapters || publicationData.chapters.length === 0) {
                this.addError('missing_chapters', 
                    'Publication must have at least one chapter', 
                    'chapters'
                );
            }
        }

        // Check word count
        if (publicationData.word_count !== undefined) {
            if (publicationData.word_count < 1000 && publicationData.publication_type === 'ebook') {
                this.addWarning('low_word_count', 
                    'Word count below 1000 may not meet store requirements', 
                    'word_count'
                );
            }
        }
    }

    /**
     * Validate status transition
     */
    async validateStatusTransition(publicationId, newStatus, options = {}) {
        if (!this.validStatuses.includes(newStatus)) {
            this.addError('invalid_status', 
                `Status must be one of: ${this.validStatuses.join(', ')}`, 
                'status'
            );
            return;
        }

        // TODO: Implement status transition rules based on current status
        logger.debug('Validating status transition', { publicationId, newStatus, options });
    }

    // ========== Helper Methods ==========

    /**
     * Validate ISBN-13 check digit
     */
    validateISBN13CheckDigit(isbn) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(isbn[i]);
            sum += (i % 2 === 0) ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(isbn[12]);
    }

    /**
     * Validate ISBN-10 check digit
     */
    validateISBN10CheckDigit(isbn) {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(isbn[i]) * (10 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 11;
        const lastChar = isbn[9];
        return (checkDigit === 10 && lastChar === 'X') || (checkDigit === parseInt(lastChar));
    }

    /**
     * Validate currency code
     */
    isValidCurrencyCode(code) {
        const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'PLN', 'SEK', 'NOK', 'DKK'];
        return validCurrencies.includes(code.toUpperCase());
    }

    /**
     * Load valid genres
     */
    loadValidGenres() {
        return [
            'fiction', 'non-fiction', 'mystery', 'thriller', 'romance', 'science-fiction',
            'fantasy', 'historical-fiction', 'contemporary-fiction', 'literary-fiction',
            'young-adult', 'children', 'memoir', 'biography', 'self-help', 'business',
            'health', 'cooking', 'travel', 'religion', 'philosophy', 'politics',
            'science', 'technology', 'education', 'reference', 'poetry', 'drama'
        ];
    }

    /**
     * Load valid languages
     */
    loadValidLanguages() {
        return [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'zh', 'ja', 'ko',
            'nl', 'sv', 'no', 'da', 'fi', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr'
        ];
    }

    /**
     * Placeholder methods for advanced validation
     */
    async validateFormats(publicationData) {
        logger.debug('Validating publication formats', { type: publicationData.publication_type });
    }

    async validateContent(publicationData) {
        logger.debug('Validating publication content', { title: publicationData.title });
    }

    async validateBusinessRules(publicationData, options) {
        logger.debug('Validating business rules', { 
            type: publicationData.publication_type, 
            options 
        });
    }

    async validateMetadataCompliance(publicationData) {
        logger.debug('Validating metadata compliance', { title: publicationData.title });
    }

    async validateFormatRequirements(publicationData) {
        logger.debug('Validating format requirements', { type: publicationData.publication_type });
    }

    async validateRightsCompliance(publicationData) {
        logger.debug('Validating rights compliance', { id: publicationData.id });
    }

    async validateQualityStandards(publicationData) {
        logger.debug('Validating quality standards', { id: publicationData.id });
    }

    async validateDistributionReadiness(publicationData) {
        logger.debug('Validating distribution readiness', { id: publicationData.id });
    }
}

module.exports = PublicationValidator;
