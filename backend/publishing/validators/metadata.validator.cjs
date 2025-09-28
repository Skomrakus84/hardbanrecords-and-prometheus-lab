/**
 * Metadata Validator - Base Validation Class
 * Provides common validation functionality and result management
 * Serves as the foundation for all domain-specific validators
 * Implements enterprise-grade validation patterns with detailed error reporting
 */

const logger = require('../config/logger.cjs');

class MetadataValidator {
    constructor() {
        this.resetValidation();
    }

    // ========== Validation State Management ==========

    /**
     * Reset validation state
     */
    resetValidation() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.isValid = true;
    }

    /**
     * Add validation error
     */
    addError(code, message, field = null) {
        this.errors.push({
            code,
            message,
            field,
            severity: 'error',
            timestamp: new Date().toISOString()
        });
        this.isValid = false;
        
        logger.debug('Validation error added', { code, message, field });
    }

    /**
     * Add validation warning
     */
    addWarning(code, message, field = null) {
        this.warnings.push({
            code,
            message,
            field,
            severity: 'warning',
            timestamp: new Date().toISOString()
        });
        
        logger.debug('Validation warning added', { code, message, field });
    }

    /**
     * Add validation info
     */
    addInfo(code, message, field = null) {
        this.info.push({
            code,
            message,
            field,
            severity: 'info',
            timestamp: new Date().toISOString()
        });
        
        logger.debug('Validation info added', { code, message, field });
    }

    /**
     * Get validation result
     */
    getValidationResult() {
        return {
            isValid: this.isValid,
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            infoCount: this.info.length,
            summary: this.getValidationSummary()
        };
    }

    /**
     * Get validation summary
     */
    getValidationSummary() {
        if (this.isValid && this.warnings.length === 0) {
            return 'Validation passed without issues';
        } else if (this.isValid && this.warnings.length > 0) {
            return `Validation passed with ${this.warnings.length} warning(s)`;
        } else {
            return `Validation failed with ${this.errors.length} error(s) and ${this.warnings.length} warning(s)`;
        }
    }

    // ========== Common Validation Utilities ==========

    /**
     * Validate string length
     */
    validateStringLength(value, minLength, maxLength, field) {
        if (typeof value !== 'string') {
            this.addError('invalid_type', `${field} must be a string`, field);
            return false;
        }

        const trimmed = value.trim();

        if (minLength !== null && trimmed.length < minLength) {
            this.addError('too_short', 
                `${field} must be at least ${minLength} characters`, 
                field
            );
            return false;
        }

        if (maxLength !== null && trimmed.length > maxLength) {
            this.addError('too_long', 
                `${field} cannot exceed ${maxLength} characters`, 
                field
            );
            return false;
        }

        return true;
    }

    /**
     * Validate numeric range
     */
    validateNumericRange(value, min, max, field) {
        if (typeof value !== 'number') {
            this.addError('invalid_type', `${field} must be a number`, field);
            return false;
        }

        if (isNaN(value)) {
            this.addError('invalid_number', `${field} must be a valid number`, field);
            return false;
        }

        if (min !== null && value < min) {
            this.addError('below_minimum', 
                `${field} must be at least ${min}`, 
                field
            );
            return false;
        }

        if (max !== null && value > max) {
            this.addError('above_maximum', 
                `${field} cannot exceed ${max}`, 
                field
            );
            return false;
        }

        return true;
    }

    /**
     * Validate date format and range
     */
    validateDate(value, field, allowFuture = true, allowPast = true) {
        if (!value) return true; // Allow null/undefined for optional dates

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            this.addError('invalid_date', `${field} must be a valid date`, field);
            return false;
        }

        const now = new Date();

        if (!allowFuture && date > now) {
            this.addError('future_date_not_allowed', 
                `${field} cannot be in the future`, 
                field
            );
            return false;
        }

        if (!allowPast && date < now) {
            this.addError('past_date_not_allowed', 
                `${field} cannot be in the past`, 
                field
            );
            return false;
        }

        return true;
    }

    /**
     * Validate email format
     */
    validateEmail(email, field) {
        if (!email) return true; // Allow empty for optional fields

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.addError('invalid_email', `${field} must be a valid email address`, field);
            return false;
        }

        return true;
    }

    /**
     * Validate URL format
     */
    validateUrl(url, field, allowedProtocols = ['http', 'https']) {
        if (!url) return true; // Allow empty for optional fields

        try {
            const urlObj = new URL(url);
            if (!allowedProtocols.includes(urlObj.protocol.slice(0, -1))) {
                this.addError('invalid_protocol', 
                    `${field} must use one of these protocols: ${allowedProtocols.join(', ')}`, 
                    field
                );
                return false;
            }
        } catch (error) {
            this.addError('invalid_url', `${field} must be a valid URL`, field);
            return false;
        }

        return true;
    }

    /**
     * Validate array
     */
    validateArray(value, field, minLength = null, maxLength = null, itemValidator = null) {
        if (!Array.isArray(value)) {
            this.addError('invalid_type', `${field} must be an array`, field);
            return false;
        }

        if (minLength !== null && value.length < minLength) {
            this.addError('array_too_short', 
                `${field} must have at least ${minLength} items`, 
                field
            );
            return false;
        }

        if (maxLength !== null && value.length > maxLength) {
            this.addError('array_too_long', 
                `${field} cannot have more than ${maxLength} items`, 
                field
            );
            return false;
        }

        // Validate array items if validator provided
        if (itemValidator && typeof itemValidator === 'function') {
            value.forEach((item, index) => {
                try {
                    itemValidator(item, `${field}[${index}]`);
                } catch (error) {
                    this.addError('invalid_array_item', 
                        `${field}[${index}]: ${error.message}`, 
                        field
                    );
                }
            });
        }

        return true;
    }

    /**
     * Validate enum value
     */
    validateEnum(value, validValues, field, caseSensitive = true) {
        if (!value) return true; // Allow empty for optional fields

        const compareValue = caseSensitive ? value : value.toLowerCase();
        const compareValidValues = caseSensitive ? validValues : validValues.map(v => v.toLowerCase());

        if (!compareValidValues.includes(compareValue)) {
            this.addError('invalid_enum_value', 
                `${field} must be one of: ${validValues.join(', ')}`, 
                field
            );
            return false;
        }

        return true;
    }

    /**
     * Validate UUID format
     */
    validateUuid(value, field) {
        if (!value) return true; // Allow empty for optional fields

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            this.addError('invalid_uuid', `${field} must be a valid UUID`, field);
            return false;
        }

        return true;
    }

    /**
     * Validate JSON structure
     */
    validateJson(value, field, schema = null) {
        if (!value) return true; // Allow empty for optional fields

        let parsed;
        try {
            parsed = typeof value === 'string' ? JSON.parse(value) : value;
        } catch (error) {
            this.addError('invalid_json', `${field} must be valid JSON`, field);
            return false;
        }

        // Basic schema validation if provided
        if (schema && typeof schema === 'object') {
            const isValid = this.validateObjectSchema(parsed, schema, field);
            return isValid;
        }

        return true;
    }

    /**
     * Validate object against simple schema
     */
    validateObjectSchema(obj, schema, field) {
        if (typeof obj !== 'object' || obj === null) {
            this.addError('invalid_object', `${field} must be an object`, field);
            return false;
        }

        // Check required fields
        if (schema.required && Array.isArray(schema.required)) {
            schema.required.forEach(requiredField => {
                if (!(requiredField in obj)) {
                    this.addError('missing_required_field', 
                        `${field}.${requiredField} is required`, 
                        field
                    );
                }
            });
        }

        // Check field types
        if (schema.properties && typeof schema.properties === 'object') {
            Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                if (propName in obj) {
                    const propValue = obj[propName];
                    const propField = `${field}.${propName}`;

                    if (propSchema.type) {
                        const actualType = Array.isArray(propValue) ? 'array' : typeof propValue;
                        if (actualType !== propSchema.type) {
                            this.addError('invalid_property_type', 
                                `${propField} must be of type ${propSchema.type}`, 
                                field
                            );
                        }
                    }

                    if (propSchema.enum) {
                        this.validateEnum(propValue, propSchema.enum, propField);
                    }
                }
            });
        }

        return this.errors.length === 0;
    }

    // ========== Validation Result Formatting ==========

    /**
     * Format validation errors for API response
     */
    formatErrorsForApi() {
        return {
            valid: this.isValid,
            errors: this.errors.map(error => ({
                field: error.field,
                code: error.code,
                message: error.message
            })),
            warnings: this.warnings.map(warning => ({
                field: warning.field,
                code: warning.code,
                message: warning.message
            }))
        };
    }

    /**
     * Format validation errors for logging
     */
    formatErrorsForLogging() {
        return {
            isValid: this.isValid,
            summary: this.getValidationSummary(),
            details: {
                errors: this.errors,
                warnings: this.warnings,
                info: this.info
            },
            counts: {
                errors: this.errors.length,
                warnings: this.warnings.length,
                info: this.info.length
            }
        };
    }

    // ========== Static Utility Methods ==========

    /**
     * Check if a value is empty (null, undefined, empty string, empty array)
     */
    static isEmpty(value) {
        return value === null || 
               value === undefined || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    /**
     * Sanitize string for validation
     */
    static sanitizeString(value) {
        if (typeof value !== 'string') return value;
        return value.trim().replace(/\s+/g, ' ');
    }

    /**
     * Deep clone validation result to prevent mutations
     */
    static cloneValidationResult(result) {
        return JSON.parse(JSON.stringify(result));
    }
}

module.exports = MetadataValidator;
