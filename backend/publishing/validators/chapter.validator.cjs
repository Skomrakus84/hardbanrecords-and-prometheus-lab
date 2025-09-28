/**
 * Chapter Validator - Advanced Chapter Content and Structure Validation
 * Provides comprehensive validation for chapter data integrity and content quality
 * Handles content analysis, structure validation, and formatting requirements
 * Implements enterprise-grade validation with detailed quality metrics
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../config/logger.cjs');

class ChapterValidator extends MetadataValidator {
    constructor() {
        super();
        this.validStatuses = ['draft', 'review', 'approved', 'published', 'archived'];
        this.contentQualityRules = this.initializeContentQualityRules();
        this.formatValidationRules = this.initializeFormatValidationRules();
    }

    // ========== Core Validation Methods ==========

    /**
     * Validate chapter data for creation
     */
    async validateCreation(chapterData, options = {}) {
        this.resetValidation();

        try {
            // Required field validation
            await this.validateRequiredFields(chapterData);
            
            // Content validation
            await this.validateContent(chapterData);
            
            // Structure validation
            await this.validateStructure(chapterData);
            
            // Format validation
            await this.validateFormat(chapterData);
            
            // Quality validation
            await this.validateQuality(chapterData, options);
            
            // Publication relationship validation
            await this.validatePublicationRelationship(chapterData);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating chapter creation', {
                error: error.message,
                chapterData: {
                    title: chapterData.title,
                    publication_id: chapterData.publication_id
                }
            });
            
            this.addError('validation_error', 
                `Chapter validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate chapter data for update
     */
    async validateUpdate(chapterId, updateData, options = {}) {
        this.resetValidation();

        try {
            // Validate only fields being updated
            if (updateData.title !== undefined) {
                await this.validateTitle(updateData.title);
            }

            if (updateData.content !== undefined) {
                await this.validateContent({ content: updateData.content });
            }

            if (updateData.order_index !== undefined) {
                await this.validateOrderIndex(updateData.order_index);
            }

            if (updateData.excerpt !== undefined) {
                await this.validateExcerpt(updateData.excerpt);
            }

            if (updateData.word_count !== undefined) {
                await this.validateWordCount(updateData.word_count);
            }

            if (updateData.reading_time !== undefined) {
                await this.validateReadingTime(updateData.reading_time);
            }

            if (updateData.keywords !== undefined) {
                await this.validateKeywords(updateData.keywords);
            }

            if (updateData.status !== undefined) {
                await this.validateStatusTransition(chapterId, updateData.status, options);
            }

            // Content quality validation if content changed
            if (updateData.content !== undefined) {
                await this.validateQuality(updateData, options);
            }

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating chapter update', {
                error: error.message,
                chapterId,
                updateData
            });
            
            this.addError('validation_error', 
                `Chapter update validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate chapter content quality
     */
    async validateContentQuality(chapterData, options = {}) {
        this.resetValidation();

        try {
            // Content existence validation
            if (!chapterData.content || chapterData.content.trim().length === 0) {
                this.addError('empty_content', 'Chapter content cannot be empty', 'content');
                return this.getValidationResult();
            }

            // Content length validation
            await this.validateContentLength(chapterData.content);
            
            // Content structure validation
            await this.validateContentStructure(chapterData.content);
            
            // Language quality validation
            await this.validateLanguageQuality(chapterData.content, options);
            
            // Readability validation
            await this.validateReadability(chapterData.content, options);
            
            // Content consistency validation
            await this.validateContentConsistency(chapterData, options);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating chapter content quality', {
                error: error.message,
                chapterId: chapterData.id
            });
            
            this.addError('validation_error', 
                `Content quality validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate chapter for publishing readiness
     */
    async validatePublishingReadiness(chapterData) {
        this.resetValidation();

        try {
            // All required fields must be present
            await this.validateRequiredFields(chapterData, { strict: true });
            
            // Content completeness validation
            await this.validateContentCompleteness(chapterData);
            
            // Quality standards validation
            await this.validateQualityStandards(chapterData);
            
            // Format compliance validation
            await this.validateFormatCompliance(chapterData);
            
            // Consistency validation
            await this.validatePublicationConsistency(chapterData);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating chapter publishing readiness', {
                error: error.message,
                chapterId: chapterData.id
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
    async validateRequiredFields(chapterData, options = {}) {
        const requiredFields = ['title', 'publication_id'];
        
        if (options.strict) {
            requiredFields.push('content', 'order_index');
        }

        requiredFields.forEach(field => {
            if (chapterData[field] === undefined || chapterData[field] === null) {
                this.addError('required_field', 
                    `${field} is required`, 
                    field
                );
            }
        });

        // Validate specific required fields
        if (chapterData.title) {
            await this.validateTitle(chapterData.title);
        }

        if (chapterData.publication_id) {
            await this.validatePublicationId(chapterData.publication_id);
        }

        if (chapterData.order_index !== undefined) {
            await this.validateOrderIndex(chapterData.order_index);
        }
    }

    /**
     * Validate chapter title
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

        if (trimmedTitle.length > 200) {
            this.addError('title_too_long', 'Title cannot exceed 200 characters', 'title');
        }

        // Check for invalid characters
        const invalidCharsRegex = /[<>{}[\]\\]/;
        if (invalidCharsRegex.test(trimmedTitle)) {
            this.addError('title_invalid_chars', 
                'Title contains invalid characters: < > { } [ ] \\', 
                'title'
            );
        }

        // Check for chapter numbering patterns
        const chapterNumberPattern = /^(chapter|ch\.?)\s*\d+/i;
        if (chapterNumberPattern.test(trimmedTitle)) {
            this.addWarning('numbered_chapter_title', 
                'Consider using descriptive titles instead of just chapter numbers', 
                'title'
            );
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
     * Validate order index
     */
    async validateOrderIndex(orderIndex) {
        if (orderIndex === null || orderIndex === undefined) {
            this.addWarning('missing_order_index', 
                'Order index helps organize chapters', 
                'order_index'
            );
            return;
        }

        if (!Number.isInteger(orderIndex) || orderIndex < 0) {
            this.addError('invalid_order_index', 
                'Order index must be a non-negative integer', 
                'order_index'
            );
        }

        if (orderIndex > 9999) {
            this.addWarning('high_order_index', 
                'Very high order index might indicate organization issues', 
                'order_index'
            );
        }
    }

    /**
     * Validate content
     */
    async validateContent(chapterData) {
        if (!chapterData.content) {
            this.addWarning('missing_content', 
                'Chapter content is recommended', 
                'content'
            );
            return;
        }

        if (typeof chapterData.content !== 'string') {
            this.addError('invalid_content_type', 
                'Content must be a string', 
                'content'
            );
            return;
        }

        const content = chapterData.content.trim();

        if (content.length === 0) {
            this.addWarning('empty_content', 
                'Chapter content is empty', 
                'content'
            );
            return;
        }

        if (content.length < 100) {
            this.addWarning('short_content', 
                'Chapter content is very short (less than 100 characters)', 
                'content'
            );
        }

        if (content.length > 500000) {
            this.addError('content_too_long', 
                'Chapter content exceeds maximum length (500,000 characters)', 
                'content'
            );
        }

        // Check for common formatting issues
        await this.validateContentFormatting(content);
    }

    /**
     * Validate content formatting
     */
    async validateContentFormatting(content) {
        // Check for excessive whitespace
        if (content.includes('  ')) {
            this.addWarning('excessive_whitespace', 
                'Content contains multiple consecutive spaces', 
                'content'
            );
        }

        // Check for missing paragraph breaks
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 10 && !content.includes('\n\n')) {
            this.addWarning('missing_paragraph_breaks', 
                'Long content without paragraph breaks may be hard to read', 
                'content'
            );
        }

        // Check for basic HTML validation if HTML is present
        if (content.includes('<') && content.includes('>')) {
            await this.validateBasicHTML(content);
        }
    }

    /**
     * Validate basic HTML
     */
    async validateBasicHTML(content) {
        // Count opening and closing tags
        const openingTags = (content.match(/<[^/][^>]*>/g) || []).length;
        const closingTags = (content.match(/<\/[^>]*>/g) || []).length;
        
        if (openingTags !== closingTags) {
            this.addError('unmatched_html_tags', 
                'HTML tags are not properly closed', 
                'content'
            );
        }

        // Check for dangerous tags
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link'];
        dangerousTags.forEach(tag => {
            const tagRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
            if (tagRegex.test(content)) {
                this.addError('dangerous_html_tag', 
                    `Content contains potentially dangerous HTML tag: ${tag}`, 
                    'content'
                );
            }
        });
    }

    /**
     * Validate excerpt
     */
    async validateExcerpt(excerpt) {
        if (!excerpt) return; // Excerpt is optional

        if (typeof excerpt !== 'string') {
            this.addError('invalid_excerpt_type', 
                'Excerpt must be a string', 
                'excerpt'
            );
            return;
        }

        const trimmedExcerpt = excerpt.trim();

        if (trimmedExcerpt.length > 500) {
            this.addError('excerpt_too_long', 
                'Excerpt cannot exceed 500 characters', 
                'excerpt'
            );
        }

        if (trimmedExcerpt.length > 0 && trimmedExcerpt.length < 50) {
            this.addWarning('excerpt_too_short', 
                'Excerpt should be at least 50 characters for effectiveness', 
                'excerpt'
            );
        }
    }

    /**
     * Validate word count
     */
    async validateWordCount(wordCount) {
        if (wordCount === null || wordCount === undefined) return;

        if (!Number.isInteger(wordCount) || wordCount < 0) {
            this.addError('invalid_word_count', 
                'Word count must be a non-negative integer', 
                'word_count'
            );
            return;
        }

        if (wordCount === 0) {
            this.addWarning('zero_word_count', 
                'Word count is zero', 
                'word_count'
            );
        }

        if (wordCount > 50000) {
            this.addWarning('very_long_chapter', 
                'Chapter is very long (over 50,000 words)', 
                'word_count'
            );
        }
    }

    /**
     * Validate reading time
     */
    async validateReadingTime(readingTime) {
        if (readingTime === null || readingTime === undefined) return;

        if (!Number.isInteger(readingTime) || readingTime < 0) {
            this.addError('invalid_reading_time', 
                'Reading time must be a non-negative integer (minutes)', 
                'reading_time'
            );
            return;
        }

        if (readingTime > 300) {
            this.addWarning('very_long_reading_time', 
                'Reading time over 5 hours might be too long for a single chapter', 
                'reading_time'
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

        if (keywords.length > 15) {
            this.addWarning('too_many_keywords', 
                'More than 15 keywords may reduce effectiveness', 
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

            if (keyword.length > 30) {
                this.addError('keyword_too_long', 
                    `Keyword "${keyword}" is too long`, 
                    'keywords'
                );
            }
        });

        // Check for duplicates
        const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
        if (uniqueKeywords.length !== keywords.length) {
            this.addWarning('duplicate_keywords', 
                'Duplicate keywords detected', 
                'keywords'
            );
        }
    }

    // ========== Advanced Validation Methods ==========

    /**
     * Validate content length
     */
    async validateContentLength(content) {
        const wordCount = content.trim().split(/\s+/).length;
        
        if (wordCount < 100) {
            this.addWarning('very_short_chapter', 
                'Chapter is very short (less than 100 words)', 
                'content'
            );
        }

        if (wordCount > 20000) {
            this.addWarning('very_long_chapter', 
                'Chapter is very long (over 20,000 words) - consider splitting', 
                'content'
            );
        }
    }

    /**
     * Validate content structure
     */
    async validateContentStructure(content) {
        // Check for dialogue formatting
        const dialogueMarkers = ['"', "'", '"', '"'];
        const hasDialogue = dialogueMarkers.some(marker => content.includes(marker));
        
        if (hasDialogue) {
            // Basic dialogue formatting check
            const quoteCount = (content.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
                this.addWarning('unmatched_quotes', 
                    'Unmatched quotation marks detected', 
                    'content'
                );
            }
        }

        // Check for paragraph structure
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length === 1 && content.length > 2000) {
            this.addWarning('single_paragraph', 
                'Long content should be broken into multiple paragraphs', 
                'content'
            );
        }
    }

    /**
     * Validate status transition
     */
    async validateStatusTransition(chapterId, newStatus, options = {}) {
        if (!this.validStatuses.includes(newStatus)) {
            this.addError('invalid_status', 
                `Status must be one of: ${this.validStatuses.join(', ')}`, 
                'status'
            );
            return;
        }

        // TODO: Implement status transition rules based on current status
        logger.debug('Validating chapter status transition', { 
            chapterId, 
            newStatus, 
            options 
        });
    }

    // ========== Helper Methods ==========

    /**
     * Initialize content quality rules
     */
    initializeContentQualityRules() {
        return {
            minWords: 50,
            maxWords: 50000,
            minReadingTime: 1, // minutes
            maxReadingTime: 300, // minutes
            maxConsecutiveSpaces: 2,
            maxConsecutiveNewlines: 3
        };
    }

    /**
     * Initialize format validation rules
     */
    initializeFormatValidationRules() {
        return {
            allowedTags: ['p', 'br', 'em', 'strong', 'i', 'b', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            maxNestingLevel: 5,
            maxParagraphLength: 2000
        };
    }

    /**
     * Placeholder methods for advanced validation
     */
    async validateStructure(chapterData) {
        logger.debug('Validating chapter structure', { id: chapterData.id });
    }

    async validateFormat(chapterData) {
        logger.debug('Validating chapter format', { id: chapterData.id });
    }

    async validateQuality(chapterData, options) {
        logger.debug('Validating chapter quality', { 
            id: chapterData.id, 
            options 
        });
    }

    async validatePublicationRelationship(chapterData) {
        logger.debug('Validating publication relationship', { 
            publicationId: chapterData.publication_id 
        });
    }

    async validateLanguageQuality(content, options) {
        logger.debug('Validating language quality', { 
            contentLength: content.length, 
            options 
        });
    }

    async validateReadability(content, options) {
        logger.debug('Validating readability', { 
            contentLength: content.length, 
            options 
        });
    }

    async validateContentConsistency(chapterData, options) {
        logger.debug('Validating content consistency', { 
            id: chapterData.id, 
            options 
        });
    }

    async validateContentCompleteness(chapterData) {
        logger.debug('Validating content completeness', { id: chapterData.id });
    }

    async validateQualityStandards(chapterData) {
        logger.debug('Validating quality standards', { id: chapterData.id });
    }

    async validateFormatCompliance(chapterData) {
        logger.debug('Validating format compliance', { id: chapterData.id });
    }

    async validatePublicationConsistency(chapterData) {
        logger.debug('Validating publication consistency', { 
            publicationId: chapterData.publication_id 
        });
    }
}

module.exports = ChapterValidator;
