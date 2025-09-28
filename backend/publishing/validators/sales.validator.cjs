/**
 * Sales Validator - Advanced Sales and Revenue Data Validation
 * Provides comprehensive validation for sales transactions and financial data
 * Handles multi-store sales, revenue calculations, and financial reporting validation
 * Implements enterprise-grade validation for publishing sales workflows
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../config/logger.cjs');

class SalesValidator extends MetadataValidator {
    constructor() {
        super();
        this.validStores = this.initializeValidStores();
        this.validCurrencies = this.initializeValidCurrencies();
        this.validSaleTypes = ['sale', 'return', 'adjustment', 'refund'];
        this.validUnits = ['units', 'pages_read', 'minutes_listened'];
        this.validStatuses = ['pending', 'confirmed', 'disputed', 'cancelled'];
    }

    // ========== Core Validation Methods ==========

    /**
     * Validate sales data for creation
     */
    async validateCreation(salesData, options = {}) {
        this.resetValidation();

        try {
            // Required field validation
            await this.validateRequiredFields(salesData);
            
            // Store validation
            await this.validateStore(salesData.store);
            
            // Financial data validation
            await this.validateFinancialData(salesData);
            
            // Quantity validation
            await this.validateQuantityData(salesData);
            
            // Date validation
            await this.validateSalesDate(salesData.sale_date);
            
            // Currency validation
            await this.validateCurrency(salesData.currency);
            
            // Business rules validation
            await this.validateBusinessRules(salesData, options);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating sales creation', {
                error: error.message,
                salesData: {
                    publication_id: salesData.publication_id,
                    store: salesData.store,
                    sale_date: salesData.sale_date
                }
            });
            
            this.addError('validation_error', 
                `Sales validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate sales data for update
     */
    async validateUpdate(salesId, updateData, options = {}) {
        this.resetValidation();

        try {
            // Validate only fields being updated
            if (updateData.store !== undefined) {
                await this.validateStore(updateData.store);
            }

            if (updateData.sale_date !== undefined) {
                await this.validateSalesDate(updateData.sale_date);
            }

            if (updateData.quantity !== undefined) {
                await this.validateQuantity(updateData.quantity);
            }

            if (updateData.unit_price !== undefined) {
                await this.validateUnitPrice(updateData.unit_price);
            }

            if (updateData.gross_revenue !== undefined) {
                await this.validateGrossRevenue(updateData.gross_revenue);
            }

            if (updateData.net_revenue !== undefined) {
                await this.validateNetRevenue(updateData.net_revenue);
            }

            if (updateData.royalty_amount !== undefined) {
                await this.validateRoyaltyAmount(updateData.royalty_amount);
            }

            if (updateData.currency !== undefined) {
                await this.validateCurrency(updateData.currency);
            }

            if (updateData.sale_type !== undefined) {
                await this.validateSaleType(updateData.sale_type);
            }

            if (updateData.status !== undefined) {
                await this.validateStatusTransition(salesId, updateData.status, options);
            }

            // Cross-field validation for financial data
            if (updateData.gross_revenue !== undefined || updateData.net_revenue !== undefined) {
                await this.validateRevenueConsistency(updateData);
            }

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating sales update', {
                error: error.message,
                salesId,
                updateData
            });
            
            this.addError('validation_error', 
                `Sales update validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate sales report data
     */
    async validateReportData(reportData, options = {}) {
        this.resetValidation();

        try {
            // Date range validation
            await this.validateDateRange(reportData.start_date, reportData.end_date);
            
            // Store filtering validation
            if (reportData.stores) {
                await this.validateStoreList(reportData.stores);
            }
            
            // Currency validation
            if (reportData.currency) {
                await this.validateCurrency(reportData.currency);
            }
            
            // Aggregation validation
            await this.validateAggregationParameters(reportData, options);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating sales report data', {
                error: error.message,
                reportData
            });
            
            this.addError('validation_error', 
                `Sales report validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    /**
     * Validate batch sales import
     */
    async validateBatchImport(salesDataArray, options = {}) {
        this.resetValidation();

        try {
            if (!Array.isArray(salesDataArray)) {
                this.addError('invalid_batch_format', 
                    'Batch sales data must be an array', 
                    'batch'
                );
                return this.getValidationResult();
            }

            if (salesDataArray.length === 0) {
                this.addError('empty_batch', 
                    'Batch sales data cannot be empty', 
                    'batch'
                );
                return this.getValidationResult();
            }

            if (salesDataArray.length > 10000) {
                this.addError('batch_too_large', 
                    'Batch size cannot exceed 10,000 records', 
                    'batch'
                );
                return this.getValidationResult();
            }

            // Validate each sales record
            for (let i = 0; i < salesDataArray.length; i++) {
                const salesData = salesDataArray[i];
                const recordValidation = await this.validateCreation(salesData, options);
                
                if (!recordValidation.isValid) {
                    this.addError('batch_record_invalid', 
                        `Record at index ${i} is invalid: ${recordValidation.errors.map(e => e.message).join(', ')}`, 
                        'batch'
                    );
                }
            }

            // Validate batch consistency
            await this.validateBatchConsistency(salesDataArray);

            return this.getValidationResult();

        } catch (error) {
            logger.error('Error validating batch sales import', {
                error: error.message,
                batchSize: salesDataArray.length
            });
            
            this.addError('validation_error', 
                `Batch import validation failed: ${error.message}`, 
                'general'
            );
            
            return this.getValidationResult();
        }
    }

    // ========== Field-Specific Validation ==========

    /**
     * Validate required fields
     */
    async validateRequiredFields(salesData) {
        const requiredFields = [
            'publication_id', 'store', 'sale_date', 
            'quantity', 'unit_price', 'currency'
        ];

        requiredFields.forEach(field => {
            if (salesData[field] === undefined || salesData[field] === null) {
                this.addError('required_field', 
                    `${field} is required`, 
                    field
                );
            }
        });

        // Additional validations for required fields
        if (salesData.publication_id) {
            await this.validatePublicationId(salesData.publication_id);
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
     * Validate store
     */
    async validateStore(store) {
        if (!store) {
            this.addError('missing_store', 'Store is required', 'store');
            return;
        }

        if (typeof store !== 'string') {
            this.addError('invalid_store_format', 
                'Store must be a string', 
                'store'
            );
            return;
        }

        if (!this.validStores.includes(store.toLowerCase())) {
            this.addError('invalid_store', 
                `Store must be one of: ${this.validStores.join(', ')}`, 
                'store'
            );
        }
    }

    /**
     * Validate store list
     */
    async validateStoreList(stores) {
        if (!Array.isArray(stores)) {
            this.addError('invalid_stores_format', 
                'Stores must be an array', 
                'stores'
            );
            return;
        }

        for (let i = 0; i < stores.length; i++) {
            await this.validateStore(stores[i]);
        }

        // Check for duplicates
        const uniqueStores = [...new Set(stores.map(s => s.toLowerCase()))];
        if (uniqueStores.length !== stores.length) {
            this.addWarning('duplicate_stores', 
                'Duplicate stores detected', 
                'stores'
            );
        }
    }

    /**
     * Validate sales date
     */
    async validateSalesDate(saleDate) {
        if (!saleDate) {
            this.addError('missing_sale_date', 'Sale date is required', 'sale_date');
            return;
        }

        if (!this.isValidDate(saleDate)) {
            this.addError('invalid_sale_date', 
                'Sale date must be a valid date', 
                'sale_date'
            );
            return;
        }

        const date = new Date(saleDate);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        if (date > now) {
            this.addError('future_sale_date', 
                'Sale date cannot be in the future', 
                'sale_date'
            );
        }

        if (date < new Date('2000-01-01')) {
            this.addError('very_old_sale_date', 
                'Sale date seems unreasonably old', 
                'sale_date'
            );
        }

        if (date < thirtyDaysAgo) {
            this.addWarning('old_sale_date', 
                'Sale date is more than 30 days old', 
                'sale_date'
            );
        }
    }

    /**
     * Validate date range
     */
    async validateDateRange(startDate, endDate) {
        if (startDate && !this.isValidDate(startDate)) {
            this.addError('invalid_start_date', 
                'Start date must be a valid date', 
                'start_date'
            );
        }

        if (endDate && !this.isValidDate(endDate)) {
            this.addError('invalid_end_date', 
                'End date must be a valid date', 
                'end_date'
            );
        }

        if (startDate && endDate && this.isValidDate(startDate) && this.isValidDate(endDate)) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end <= start) {
                this.addError('invalid_date_range', 
                    'End date must be after start date', 
                    'end_date'
                );
            }

            // Check for very large date ranges
            const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
            if (daysDiff > 365 * 2) {
                this.addWarning('large_date_range', 
                    'Date range spans more than 2 years', 
                    'date_range'
                );
            }
        }
    }

    /**
     * Validate financial data
     */
    async validateFinancialData(salesData) {
        // Validate individual financial fields
        if (salesData.unit_price !== undefined) {
            await this.validateUnitPrice(salesData.unit_price);
        }

        if (salesData.gross_revenue !== undefined) {
            await this.validateGrossRevenue(salesData.gross_revenue);
        }

        if (salesData.net_revenue !== undefined) {
            await this.validateNetRevenue(salesData.net_revenue);
        }

        if (salesData.royalty_amount !== undefined) {
            await this.validateRoyaltyAmount(salesData.royalty_amount);
        }

        // Cross-field validation
        await this.validateRevenueConsistency(salesData);
    }

    /**
     * Validate unit price
     */
    async validateUnitPrice(unitPrice) {
        if (unitPrice === null || unitPrice === undefined) {
            this.addError('missing_unit_price', 'Unit price is required', 'unit_price');
            return;
        }

        if (typeof unitPrice !== 'number') {
            this.addError('invalid_unit_price_type', 
                'Unit price must be a number', 
                'unit_price'
            );
            return;
        }

        if (unitPrice < 0) {
            this.addError('negative_unit_price', 
                'Unit price cannot be negative', 
                'unit_price'
            );
        }

        if (unitPrice > 10000) {
            this.addWarning('very_high_unit_price', 
                'Unit price is unusually high (over $10,000)', 
                'unit_price'
            );
        }

        if (unitPrice > 0 && unitPrice < 0.01) {
            this.addWarning('very_low_unit_price', 
                'Unit price is very low (less than $0.01)', 
                'unit_price'
            );
        }
    }

    /**
     * Validate gross revenue
     */
    async validateGrossRevenue(grossRevenue) {
        if (grossRevenue === null || grossRevenue === undefined) return;

        if (typeof grossRevenue !== 'number') {
            this.addError('invalid_gross_revenue_type', 
                'Gross revenue must be a number', 
                'gross_revenue'
            );
            return;
        }

        if (grossRevenue < 0) {
            this.addError('negative_gross_revenue', 
                'Gross revenue cannot be negative', 
                'gross_revenue'
            );
        }
    }

    /**
     * Validate net revenue
     */
    async validateNetRevenue(netRevenue) {
        if (netRevenue === null || netRevenue === undefined) return;

        if (typeof netRevenue !== 'number') {
            this.addError('invalid_net_revenue_type', 
                'Net revenue must be a number', 
                'net_revenue'
            );
            return;
        }

        if (netRevenue < 0) {
            this.addError('negative_net_revenue', 
                'Net revenue cannot be negative', 
                'net_revenue'
            );
        }
    }

    /**
     * Validate royalty amount
     */
    async validateRoyaltyAmount(royaltyAmount) {
        if (royaltyAmount === null || royaltyAmount === undefined) return;

        if (typeof royaltyAmount !== 'number') {
            this.addError('invalid_royalty_amount_type', 
                'Royalty amount must be a number', 
                'royalty_amount'
            );
            return;
        }

        if (royaltyAmount < 0) {
            this.addError('negative_royalty_amount', 
                'Royalty amount cannot be negative', 
                'royalty_amount'
            );
        }
    }

    /**
     * Validate revenue consistency
     */
    async validateRevenueConsistency(salesData) {
        const { gross_revenue, net_revenue, royalty_amount } = salesData;

        if (gross_revenue !== undefined && net_revenue !== undefined) {
            if (net_revenue > gross_revenue) {
                this.addError('net_greater_than_gross', 
                    'Net revenue cannot be greater than gross revenue', 
                    'net_revenue'
                );
            }
        }

        if (net_revenue !== undefined && royalty_amount !== undefined) {
            if (royalty_amount > net_revenue) {
                this.addError('royalty_greater_than_net', 
                    'Royalty amount cannot be greater than net revenue', 
                    'royalty_amount'
                );
            }
        }
    }

    /**
     * Validate quantity data
     */
    async validateQuantityData(salesData) {
        if (salesData.quantity !== undefined) {
            await this.validateQuantity(salesData.quantity);
        }

        if (salesData.unit !== undefined) {
            await this.validateUnit(salesData.unit);
        }
    }

    /**
     * Validate quantity
     */
    async validateQuantity(quantity) {
        if (quantity === null || quantity === undefined) {
            this.addError('missing_quantity', 'Quantity is required', 'quantity');
            return;
        }

        if (typeof quantity !== 'number') {
            this.addError('invalid_quantity_type', 
                'Quantity must be a number', 
                'quantity'
            );
            return;
        }

        if (quantity < 0) {
            this.addError('negative_quantity', 
                'Quantity cannot be negative', 
                'quantity'
            );
        }

        if (!Number.isInteger(quantity) && quantity > 0) {
            this.addWarning('fractional_quantity', 
                'Fractional quantities may indicate special pricing models', 
                'quantity'
            );
        }

        if (quantity > 1000000) {
            this.addWarning('very_high_quantity', 
                'Quantity is unusually high (over 1 million)', 
                'quantity'
            );
        }
    }

    /**
     * Validate unit
     */
    async validateUnit(unit) {
        if (!unit) return; // Unit is optional

        if (!this.validUnits.includes(unit)) {
            this.addError('invalid_unit', 
                `Unit must be one of: ${this.validUnits.join(', ')}`, 
                'unit'
            );
        }
    }

    /**
     * Validate currency
     */
    async validateCurrency(currency) {
        if (!currency) {
            this.addError('missing_currency', 'Currency is required', 'currency');
            return;
        }

        if (!this.validCurrencies.includes(currency.toUpperCase())) {
            this.addError('invalid_currency', 
                `Currency must be one of: ${this.validCurrencies.join(', ')}`, 
                'currency'
            );
        }
    }

    /**
     * Validate sale type
     */
    async validateSaleType(saleType) {
        if (!saleType) return; // Sale type is optional, defaults to 'sale'

        if (!this.validSaleTypes.includes(saleType)) {
            this.addError('invalid_sale_type', 
                `Sale type must be one of: ${this.validSaleTypes.join(', ')}`, 
                'sale_type'
            );
        }
    }

    /**
     * Validate status transition
     */
    async validateStatusTransition(salesId, newStatus, options = {}) {
        if (!this.validStatuses.includes(newStatus)) {
            this.addError('invalid_status', 
                `Status must be one of: ${this.validStatuses.join(', ')}`, 
                'status'
            );
            return;
        }

        // TODO: Implement status transition rules based on current status
        logger.debug('Validating sales status transition', { 
            salesId, 
            newStatus, 
            options 
        });
    }

    // ========== Advanced Validation Methods ==========

    /**
     * Validate business rules
     */
    async validateBusinessRules(salesData, options = {}) {
        // Minimum sale amount validation
        if (salesData.unit_price && salesData.quantity) {
            const totalAmount = salesData.unit_price * salesData.quantity;
            if (totalAmount < 0.01) {
                this.addWarning('very_small_sale', 
                    'Sale amount is very small (less than $0.01)', 
                    'amount'
                );
            }
        }

        logger.debug('Validating sales business rules', { 
            publicationId: salesData.publication_id,
            store: salesData.store,
            options 
        });
    }

    /**
     * Validate aggregation parameters
     */
    async validateAggregationParameters(reportData, options = {}) {
        if (reportData.group_by && Array.isArray(reportData.group_by)) {
            const validGroupBy = ['store', 'date', 'publication', 'currency'];
            reportData.group_by.forEach(field => {
                if (!validGroupBy.includes(field)) {
                    this.addError('invalid_group_by', 
                        `Group by field "${field}" is not valid`, 
                        'group_by'
                    );
                }
            });
        }

        logger.debug('Validating aggregation parameters', { 
            reportData, 
            options 
        });
    }

    /**
     * Validate batch consistency
     */
    async validateBatchConsistency(salesDataArray) {
        // Check for duplicate sales (same publication, store, date)
        const salesKeys = new Set();
        const duplicates = [];

        salesDataArray.forEach((sales, index) => {
            const key = `${sales.publication_id}-${sales.store}-${sales.sale_date}`;
            if (salesKeys.has(key)) {
                duplicates.push(index);
            } else {
                salesKeys.add(key);
            }
        });

        if (duplicates.length > 0) {
            this.addWarning('duplicate_sales_in_batch', 
                `Potential duplicate sales at indices: ${duplicates.join(', ')}`, 
                'batch'
            );
        }

        // Check for consistent currencies within batch
        const currencies = [...new Set(salesDataArray.map(s => s.currency))];
        if (currencies.length > 1) {
            this.addInfo('multiple_currencies_in_batch', 
                `Batch contains multiple currencies: ${currencies.join(', ')}`, 
                'batch'
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
     * Initialize valid stores
     */
    initializeValidStores() {
        return [
            'amazon', 'apple', 'google', 'kobo', 'barnes-noble',
            'smashwords', 'draft2digital', 'kindle-unlimited',
            'audible', 'spotify', 'libro-fm', 'chirp-books'
        ];
    }

    /**
     * Initialize valid currencies
     */
    initializeValidCurrencies() {
        return [
            'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'PLN', 
            'SEK', 'NOK', 'DKK', 'CHF', 'SGD', 'HKD'
        ];
    }
}

module.exports = SalesValidator;
