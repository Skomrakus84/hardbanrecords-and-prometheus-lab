/**
 * Payout Validator
 * Specialized validation for payout processing, payment calculations, and financial distributions
 * Handles validation for payout creation, calculations, and payment processing compliance
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../../config/logger.cjs');

class PayoutValidator extends MetadataValidator {
  constructor() {
    super();
  }

  // ========== Payout-Specific Validation ==========

  /**
   * Validate complete payout for creation
   */
  async validateForCreation(payoutData, options = {}) {
    this.resetValidation();
    
    const { 
      validatePayees = true,
      validateCalculations = true,
      strict = false 
    } = options;

    try {
      // Basic payout validation
      await this.validatePayoutStructure(payoutData);
      
      // Payees validation
      if (validatePayees) {
        await this.validatePayees(payoutData, { strict });
      }
      
      // Calculation validation
      if (validateCalculations) {
        await this.validateCalculations(payoutData);
      }
      
      // Financial compliance validation
      await this.validateFinancialCompliance(payoutData);
      
      // Business rules validation
      await this.validateBusinessRules(payoutData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Payout creation validation error', { error: error.message });
      this.addError('validation_error', 'Payout validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate payout for processing
   */
  async validateForProcessing(payoutData, options = {}) {
    this.resetValidation();
    
    const { 
      validatePaymentMethods = true,
      validateThresholds = true 
    } = options;

    try {
      // Payment method validation
      if (validatePaymentMethods) {
        await this.validatePaymentMethods(payoutData);
      }
      
      // Threshold validation
      if (validateThresholds) {
        await this.validateThresholds(payoutData);
      }
      
      // Processing readiness validation
      await this.validateProcessingReadiness(payoutData);
      
      // Risk assessment validation
      await this.validateRiskAssessment(payoutData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Payout processing validation error', { error: error.message });
      this.addError('validation_error', 'Payout processing validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate payout for compliance
   */
  async validateForCompliance(payoutData, jurisdictions = [], options = {}) {
    this.resetValidation();
    
    const { 
      validateTaxCompliance = true,
      validateRegulatoryCompliance = true 
    } = options;

    try {
      // Tax compliance validation
      if (validateTaxCompliance) {
        await this.validateTaxCompliance(payoutData, jurisdictions);
      }
      
      // Regulatory compliance validation
      if (validateRegulatoryCompliance) {
        await this.validateRegulatoryCompliance(payoutData, jurisdictions);
      }
      
      // Anti-money laundering validation
      await this.validateAMLCompliance(payoutData);
      
      // Documentation compliance validation
      await this.validateDocumentationCompliance(payoutData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Payout compliance validation error', { error: error.message });
      this.addError('validation_error', 'Payout compliance validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  // ========== Structure Validation ==========

  /**
   * Validate payout data structure
   */
  async validatePayoutStructure(payoutData) {
    // Required fields validation
    const requiredFields = ['period_start', 'period_end', 'currency', 'payouts'];
    
    requiredFields.forEach(field => {
      if (payoutData[field] === undefined || payoutData[field] === null) {
        this.addError('missing_required_field', `${field} is required`, field);
      }
    });

    // Period validation
    if (payoutData.period_start && payoutData.period_end) {
      const startDate = new Date(payoutData.period_start);
      const endDate = new Date(payoutData.period_end);
      
      if (!this.isValidDate(payoutData.period_start)) {
        this.addError('invalid_period_start', 'Period start date is invalid', 'period_start');
      }
      
      if (!this.isValidDate(payoutData.period_end)) {
        this.addError('invalid_period_end', 'Period end date is invalid', 'period_end');
      }
      
      if (endDate <= startDate) {
        this.addError('invalid_period_range', 
          'Period end date must be after start date', 
          'period_range'
        );
      }

      // Period length validation
      const periodDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
      if (periodDays > 366) {
        this.addWarning('long_period', 
          'Payout period exceeds one year', 
          'period_range'
        );
      } else if (periodDays < 1) {
        this.addError('very_short_period', 
          'Payout period is less than one day', 
          'period_range'
        );
      }
    }

    // Currency validation
    if (payoutData.currency) {
      const validCurrencies = [
        'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
        'PLN', 'CZK', 'HUF', 'BGN', 'RON', 'HRK', 'RUB', 'CNY', 'INR', 'BRL'
      ];
      
      if (!validCurrencies.includes(payoutData.currency)) {
        this.addWarning('unrecognized_currency', 
          `Unrecognized currency: ${payoutData.currency}`, 
          'currency'
        );
      }
    }

    // Payouts array validation
    if (payoutData.payouts) {
      if (!Array.isArray(payoutData.payouts)) {
        this.addError('invalid_payouts_format', 'Payouts must be an array', 'payouts');
      } else if (payoutData.payouts.length === 0) {
        this.addError('empty_payouts', 'At least one payout is required', 'payouts');
      } else {
        // Validate individual payouts
        payoutData.payouts.forEach((payout, index) => {
          this.validateIndividualPayout(payout, index);
        });
      }
    }

    // Status validation
    if (payoutData.status) {
      const validStatuses = [
        'draft', 'calculated', 'approved', 'processing', 'sent', 
        'completed', 'failed', 'cancelled', 'disputed'
      ];
      
      if (!validStatuses.includes(payoutData.status)) {
        this.addError('invalid_status', `Invalid status: ${payoutData.status}`, 'status');
      }
    }

    // Total amounts validation
    const numericFields = [
      'total_gross_amount', 'total_deductions', 'total_net_amount', 
      'total_fees', 'total_taxes', 'exchange_rate'
    ];

    numericFields.forEach(field => {
      if (payoutData[field] !== undefined) {
        if (typeof payoutData[field] !== 'number' || !Number.isFinite(payoutData[field])) {
          this.addError('invalid_numeric_value', 
            `${field} must be a valid number`, 
            field
          );
        } else if (payoutData[field] < 0) {
          this.addError('negative_amount', 
            `${field} cannot be negative`, 
            field
          );
        }
      }
    });
  }

  /**
   * Validate individual payout entry
   */
  validateIndividualPayout(payout, index) {
    const prefix = `payouts[${index}]`;

    // Required fields for individual payout
    const requiredFields = ['payee_id', 'gross_amount', 'net_amount'];
    requiredFields.forEach(field => {
      if (payout[field] === undefined || payout[field] === null) {
        this.addError('missing_payout_field', 
          `${field} is required for payout ${index}`, 
          `${prefix}.${field}`
        );
      }
    });

    // Amount validation
    const amountFields = [
      'gross_amount', 'net_amount', 'deductions', 'fees', 'taxes', 
      'withholding_tax', 'platform_fee', 'processing_fee'
    ];

    amountFields.forEach(field => {
      if (payout[field] !== undefined) {
        if (typeof payout[field] !== 'number' || !Number.isFinite(payout[field])) {
          this.addError('invalid_amount_type', 
            `${field} must be a number for payout ${index}`, 
            `${prefix}.${field}`
          );
        } else if (payout[field] < 0) {
          this.addError('negative_payout_amount', 
            `${field} cannot be negative for payout ${index}`, 
            `${prefix}.${field}`
          );
        }
      }
    });

    // Gross vs net amount validation
    if (payout.gross_amount !== undefined && payout.net_amount !== undefined) {
      if (payout.net_amount > payout.gross_amount) {
        this.addError('net_exceeds_gross', 
          `Net amount exceeds gross amount for payout ${index}`, 
          `${prefix}.amounts`
        );
      }

      // Calculate expected net amount
      const expectedDeductions = (payout.deductions || 0) + (payout.fees || 0) + 
                               (payout.taxes || 0) + (payout.withholding_tax || 0);
      const expectedNet = payout.gross_amount - expectedDeductions;
      
      if (Math.abs(payout.net_amount - expectedNet) > 0.01) {
        this.addWarning('amount_calculation_mismatch', 
          `Net amount calculation may be incorrect for payout ${index}`, 
          `${prefix}.calculation`
        );
      }
    }

    // Payee ID validation
    if (payout.payee_id && typeof payout.payee_id !== 'string') {
      this.addError('invalid_payee_id', 
        `Payee ID must be a string for payout ${index}`, 
        `${prefix}.payee_id`
      );
    }

    // Currency validation
    if (payout.currency && typeof payout.currency !== 'string') {
      this.addError('invalid_payout_currency', 
        `Currency must be a string for payout ${index}`, 
        `${prefix}.currency`
      );
    }

    // Payment method validation
    if (payout.payment_method) {
      const validMethods = [
        'bank_transfer', 'wire_transfer', 'ach', 'paypal', 'stripe', 
        'check', 'crypto', 'digital_wallet'
      ];
      
      if (!validMethods.includes(payout.payment_method)) {
        this.addWarning('unrecognized_payment_method', 
          `Unrecognized payment method: ${payout.payment_method} for payout ${index}`, 
          `${prefix}.payment_method`
        );
      }
    }

    // Status validation
    if (payout.status) {
      const validPayoutStatuses = [
        'pending', 'approved', 'rejected', 'processing', 'sent', 
        'completed', 'failed', 'disputed', 'cancelled'
      ];
      
      if (!validPayoutStatuses.includes(payout.status)) {
        this.addError('invalid_payout_status', 
          `Invalid payout status: ${payout.status} for payout ${index}`, 
          `${prefix}.status`
        );
      }
    }

    // Minimum amount validation
    if (payout.net_amount !== undefined && payout.net_amount > 0 && payout.net_amount < 1) {
      this.addWarning('very_small_payout', 
        `Very small payout amount ($${payout.net_amount}) for payout ${index}`, 
        `${prefix}.net_amount`
      );
    }

    // Large amount validation
    if (payout.net_amount !== undefined && payout.net_amount > 100000) {
      this.addWarning('large_payout_amount', 
        `Large payout amount ($${payout.net_amount}) for payout ${index}`, 
        `${prefix}.net_amount`
      );
    }
  }

  // ========== Payees Validation ==========

  /**
   * Validate payees in payout
   */
  async validatePayees(payoutData, options = {}) {
    const { strict = false } = options;

    if (!payoutData.payouts || !Array.isArray(payoutData.payouts)) {
      return;
    }

    // Extract unique payee IDs
    const payeeIds = [...new Set(payoutData.payouts.map(payout => payout.payee_id))];

    // Check for missing payee information
    if (strict) {
      await this.validatePayeeExistence(payeeIds);
    }

    // Validate payee payment information
    await this.validatePayeePaymentInfo(payoutData.payouts);

    // Validate payee aggregation
    await this.validatePayeeAggregation(payoutData.payouts);
  }

  /**
   * Validate payee existence (placeholder for database check)
   */
  async validatePayeeExistence(payeeIds) {
    // In real implementation, this would check database
    payeeIds.forEach(id => {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        this.addError('invalid_payee_id_format', 
          'Payee ID must be a non-empty string', 
          'payee_id'
        );
      }
    });
  }

  /**
   * Validate payee payment information
   */
  async validatePayeePaymentInfo(payouts) {
    const payeePaymentMethods = {};

    payouts.forEach((payout, index) => {
      const payeeId = payout.payee_id;
      
      if (payeeId) {
        if (!payeePaymentMethods[payeeId]) {
          payeePaymentMethods[payeeId] = [];
        }
        
        if (payout.payment_method) {
          payeePaymentMethods[payeeId].push(payout.payment_method);
        }
      }
    });

    // Check for consistent payment methods per payee
    Object.keys(payeePaymentMethods).forEach(payeeId => {
      const methods = payeePaymentMethods[payeeId];
      const uniqueMethods = [...new Set(methods)];
      
      if (uniqueMethods.length > 1) {
        this.addWarning('inconsistent_payment_methods', 
          `Payee ${payeeId} has multiple payment methods: ${uniqueMethods.join(', ')}`, 
          'payment_methods'
        );
      }
    });
  }

  /**
   * Validate payee aggregation
   */
  async validatePayeeAggregation(payouts) {
    const payeeAggregation = {};

    // Aggregate amounts by payee
    payouts.forEach(payout => {
      const payeeId = payout.payee_id;
      
      if (payeeId) {
        if (!payeeAggregation[payeeId]) {
          payeeAggregation[payeeId] = {
            count: 0,
            totalGross: 0,
            totalNet: 0,
            currencies: new Set()
          };
        }
        
        payeeAggregation[payeeId].count++;
        payeeAggregation[payeeId].totalGross += payout.gross_amount || 0;
        payeeAggregation[payeeId].totalNet += payout.net_amount || 0;
        
        if (payout.currency) {
          payeeAggregation[payeeId].currencies.add(payout.currency);
        }
      }
    });

    // Validate aggregations
    Object.keys(payeeAggregation).forEach(payeeId => {
      const aggregation = payeeAggregation[payeeId];
      
      // Multiple currencies warning
      if (aggregation.currencies.size > 1) {
        this.addWarning('multiple_currencies_per_payee', 
          `Payee ${payeeId} has payouts in multiple currencies: ${[...aggregation.currencies].join(', ')}`, 
          'currencies'
        );
      }
      
      // High transaction count
      if (aggregation.count > 50) {
        this.addWarning('high_transaction_count', 
          `Payee ${payeeId} has ${aggregation.count} transactions`, 
          'transaction_count'
        );
      }
      
      // Very small total amounts
      if (aggregation.totalNet > 0 && aggregation.totalNet < 5) {
        this.addWarning('very_small_total_payout', 
          `Payee ${payeeId} has very small total payout ($${aggregation.totalNet.toFixed(2)})`, 
          'total_amount'
        );
      }
    });
  }

  // ========== Calculations Validation ==========

  /**
   * Validate payout calculations
   */
  async validateCalculations(payoutData) {
    // Total amount reconciliation
    await this.validateTotalReconciliation(payoutData);
    
    // Calculation precision
    await this.validateCalculationPrecision(payoutData);
    
    // Rate and percentage validation
    await this.validateRatesAndPercentages(payoutData);
    
    // Currency conversion validation
    await this.validateCurrencyConversion(payoutData);
  }

  /**
   * Validate total amount reconciliation
   */
  async validateTotalReconciliation(payoutData) {
    if (!payoutData.payouts || !Array.isArray(payoutData.payouts)) {
      return;
    }

    // Calculate totals from individual payouts
    let calculatedGross = 0;
    let calculatedNet = 0;
    let calculatedDeductions = 0;
    let calculatedFees = 0;
    let calculatedTaxes = 0;

    payoutData.payouts.forEach(payout => {
      calculatedGross += payout.gross_amount || 0;
      calculatedNet += payout.net_amount || 0;
      calculatedDeductions += payout.deductions || 0;
      calculatedFees += payout.fees || 0;
      calculatedTaxes += payout.taxes || 0;
    });

    // Compare with declared totals
    if (payoutData.total_gross_amount !== undefined) {
      const difference = Math.abs(payoutData.total_gross_amount - calculatedGross);
      if (difference > 0.01) {
        this.addError('gross_total_mismatch', 
          `Declared gross total (${payoutData.total_gross_amount}) doesn't match calculated total (${calculatedGross})`, 
          'total_gross_amount'
        );
      }
    }

    if (payoutData.total_net_amount !== undefined) {
      const difference = Math.abs(payoutData.total_net_amount - calculatedNet);
      if (difference > 0.01) {
        this.addError('net_total_mismatch', 
          `Declared net total (${payoutData.total_net_amount}) doesn't match calculated total (${calculatedNet})`, 
          'total_net_amount'
        );
      }
    }

    if (payoutData.total_deductions !== undefined) {
      const difference = Math.abs(payoutData.total_deductions - calculatedDeductions);
      if (difference > 0.01) {
        this.addWarning('deductions_total_mismatch', 
          `Declared deductions total doesn't match calculated total`, 
          'total_deductions'
        );
      }
    }

    // Validate gross vs net relationship
    if (payoutData.total_gross_amount !== undefined && payoutData.total_net_amount !== undefined) {
      if (payoutData.total_net_amount > payoutData.total_gross_amount) {
        this.addError('net_exceeds_gross_total', 
          'Total net amount exceeds total gross amount', 
          'totals'
        );
      }
    }
  }

  /**
   * Validate calculation precision
   */
  async validateCalculationPrecision(payoutData) {
    // Check for excessive decimal precision
    const checkPrecision = (value, fieldName, maxDecimals = 2) => {
      if (typeof value === 'number') {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > maxDecimals) {
          this.addWarning('excessive_precision', 
            `${fieldName} has excessive decimal precision (${decimalPlaces} places)`, 
            fieldName
          );
        }
      }
    };

    // Check total amounts
    if (payoutData.total_gross_amount !== undefined) {
      checkPrecision(payoutData.total_gross_amount, 'total_gross_amount');
    }
    
    if (payoutData.total_net_amount !== undefined) {
      checkPrecision(payoutData.total_net_amount, 'total_net_amount');
    }

    // Check individual payout amounts
    if (payoutData.payouts) {
      payoutData.payouts.forEach((payout, index) => {
        checkPrecision(payout.gross_amount, `payouts[${index}].gross_amount`);
        checkPrecision(payout.net_amount, `payouts[${index}].net_amount`);
      });
    }

    // Check exchange rates
    if (payoutData.exchange_rate !== undefined) {
      checkPrecision(payoutData.exchange_rate, 'exchange_rate', 6);
    }
  }

  /**
   * Validate rates and percentages
   */
  async validateRatesAndPercentages(payoutData) {
    // Fee rate validation
    if (payoutData.fee_rate !== undefined) {
      if (payoutData.fee_rate < 0 || payoutData.fee_rate > 1) {
        this.addError('invalid_fee_rate', 
          'Fee rate must be between 0 and 1', 
          'fee_rate'
        );
      }
      
      if (payoutData.fee_rate > 0.5) {
        this.addWarning('high_fee_rate', 
          'Fee rate exceeds 50%', 
          'fee_rate'
        );
      }
    }

    // Tax rate validation
    if (payoutData.tax_rate !== undefined) {
      if (payoutData.tax_rate < 0 || payoutData.tax_rate > 1) {
        this.addError('invalid_tax_rate', 
          'Tax rate must be between 0 and 1', 
          'tax_rate'
        );
      }
    }

    // Exchange rate validation
    if (payoutData.exchange_rate !== undefined) {
      if (payoutData.exchange_rate <= 0) {
        this.addError('invalid_exchange_rate', 
          'Exchange rate must be positive', 
          'exchange_rate'
        );
      }
      
      // Sanity check for exchange rates
      if (payoutData.exchange_rate > 1000 || payoutData.exchange_rate < 0.001) {
        this.addWarning('unusual_exchange_rate', 
          'Exchange rate seems unusual', 
          'exchange_rate'
        );
      }
    }

    // Withholding rate validation
    if (payoutData.withholding_rate !== undefined) {
      if (payoutData.withholding_rate < 0 || payoutData.withholding_rate > 1) {
        this.addError('invalid_withholding_rate', 
          'Withholding rate must be between 0 and 1', 
          'withholding_rate'
        );
      }
    }
  }

  /**
   * Validate currency conversion
   */
  async validateCurrencyConversion(payoutData) {
    if (!payoutData.payouts || !payoutData.currency) {
      return;
    }

    // Check for currency mismatches
    const baseCurrency = payoutData.currency;
    const differentCurrencies = payoutData.payouts.filter(payout => 
      payout.currency && payout.currency !== baseCurrency
    );

    if (differentCurrencies.length > 0) {
      if (!payoutData.exchange_rate && !payoutData.exchange_rates) {
        this.addError('missing_exchange_rate', 
          'Exchange rate required for currency conversion', 
          'exchange_rate'
        );
      }
      
      this.addInfo('currency_conversion_notice', 
        `${differentCurrencies.length} payouts require currency conversion`, 
        'currency_conversion'
      );
    }

    // Validate exchange rate application
    if (payoutData.exchange_rates) {
      Object.keys(payoutData.exchange_rates).forEach(currency => {
        const rate = payoutData.exchange_rates[currency];
        
        if (typeof rate !== 'number' || rate <= 0) {
          this.addError('invalid_currency_rate', 
            `Invalid exchange rate for ${currency}`, 
            `exchange_rates.${currency}`
          );
        }
      });
    }
  }

  // ========== Financial Compliance Validation ==========

  /**
   * Validate financial compliance requirements
   */
  async validateFinancialCompliance(payoutData) {
    // Minimum payout thresholds
    await this.validateMinimumThresholds(payoutData);
    
    // Maximum payout limits
    await this.validateMaximumLimits(payoutData);
    
    // Financial regulations
    await this.validateFinancialRegulations(payoutData);
    
    // Audit trail requirements
    await this.validateAuditTrail(payoutData);
  }

  /**
   * Validate minimum payout thresholds
   */
  async validateMinimumThresholds(payoutData) {
    const defaultMinimumPayout = 10; // $10 minimum

    if (payoutData.payouts) {
      payoutData.payouts.forEach((payout, index) => {
        if (payout.net_amount !== undefined && payout.net_amount > 0) {
          const minimumThreshold = payout.minimum_threshold || defaultMinimumPayout;
          
          if (payout.net_amount < minimumThreshold) {
            this.addWarning('below_minimum_threshold', 
              `Payout ${index} amount ($${payout.net_amount}) below minimum threshold ($${minimumThreshold})`, 
              `payouts[${index}].net_amount`
            );
          }
        }
      });
    }

    // Total minimum validation
    if (payoutData.total_net_amount !== undefined && payoutData.total_net_amount < 1) {
      this.addWarning('very_small_total_payout', 
        'Total payout amount is very small', 
        'total_net_amount'
      );
    }
  }

  /**
   * Validate maximum payout limits
   */
  async validateMaximumLimits(payoutData) {
    const dailyLimit = 50000; // $50,000 daily limit
    const individualLimit = 10000; // $10,000 individual limit

    // Individual payout limits
    if (payoutData.payouts) {
      payoutData.payouts.forEach((payout, index) => {
        if (payout.net_amount !== undefined && payout.net_amount > individualLimit) {
          this.addWarning('high_individual_payout', 
            `Payout ${index} amount ($${payout.net_amount}) exceeds individual limit ($${individualLimit})`, 
            `payouts[${index}].net_amount`
          );
        }
      });
    }

    // Total payout limits
    if (payoutData.total_net_amount !== undefined && payoutData.total_net_amount > dailyLimit) {
      this.addWarning('high_total_payout', 
        `Total payout amount ($${payoutData.total_net_amount}) exceeds daily limit ($${dailyLimit})`, 
        'total_net_amount'
      );
    }
  }

  /**
   * Validate financial regulations
   */
  async validateFinancialRegulations(payoutData) {
    // Large transaction reporting (CTR threshold)
    const ctrThreshold = 10000;
    
    if (payoutData.total_net_amount !== undefined && payoutData.total_net_amount >= ctrThreshold) {
      this.addInfo('ctr_reporting_required', 
        'Large transaction may require CTR reporting', 
        'regulatory_reporting'
      );
    }

    // Suspicious activity detection
    if (payoutData.payouts) {
      const roundAmounts = payoutData.payouts.filter(payout => 
        payout.net_amount && payout.net_amount % 1000 === 0 && payout.net_amount >= 5000
      );
      
      if (roundAmounts.length > 0) {
        this.addInfo('round_amount_notice', 
          'Large round amounts detected, may require additional scrutiny', 
          'suspicious_activity'
        );
      }
    }

    // Rapid succession payments
    if (payoutData.processing_date) {
      const processingDate = new Date(payoutData.processing_date);
      const hoursSinceLastPayout = this.calculateHoursSinceLastPayout(processingDate);
      
      if (hoursSinceLastPayout < 1) {
        this.addWarning('rapid_succession_payouts', 
          'Payouts in rapid succession may require additional verification', 
          'timing'
        );
      }
    }
  }

  /**
   * Validate audit trail requirements
   */
  async validateAuditTrail(payoutData) {
    // Required audit fields
    const auditFields = ['created_by', 'approved_by', 'calculation_method'];
    
    auditFields.forEach(field => {
      if (!payoutData[field]) {
        this.addWarning('missing_audit_field', 
          `Audit field ${field} is missing`, 
          field
        );
      }
    });

    // Calculation documentation
    if (!payoutData.calculation_notes && !payoutData.calculation_details) {
      this.addWarning('missing_calculation_documentation', 
        'Calculation documentation is recommended for audit purposes', 
        'calculation_documentation'
      );
    }

    // Approval workflow
    if (payoutData.status === 'approved' && !payoutData.approved_by) {
      this.addError('missing_approval_info', 
        'Approved payouts must have approver information', 
        'approved_by'
      );
    }

    if (payoutData.status === 'approved' && !payoutData.approval_date) {
      this.addWarning('missing_approval_date', 
        'Approval date is missing', 
        'approval_date'
      );
    }
  }

  // ========== Payment Methods Validation ==========

  /**
   * Validate payment methods
   */
  async validatePaymentMethods(payoutData) {
    if (!payoutData.payouts) return;

    // Group payouts by payment method
    const methodGroups = {};
    
    payoutData.payouts.forEach((payout, index) => {
      const method = payout.payment_method || 'unknown';
      
      if (!methodGroups[method]) {
        methodGroups[method] = [];
      }
      
      methodGroups[method].push({ payout, index });
    });

    // Validate each payment method group
    Object.keys(methodGroups).forEach(method => {
      this.validatePaymentMethodGroup(method, methodGroups[method]);
    });

    // Overall payment method distribution
    await this.validatePaymentMethodDistribution(methodGroups);
  }

  /**
   * Validate payment method group
   */
  validatePaymentMethodGroup(method, payoutGroup) {
    const totalAmount = payoutGroup.reduce((sum, item) => 
      sum + (item.payout.net_amount || 0), 0
    );

    switch (method) {
      case 'bank_transfer':
      case 'wire_transfer':
        this.validateBankTransferGroup(payoutGroup, totalAmount);
        break;
      case 'paypal':
        this.validatePayPalGroup(payoutGroup, totalAmount);
        break;
      case 'check':
        this.validateCheckGroup(payoutGroup, totalAmount);
        break;
      case 'crypto':
        this.validateCryptoGroup(payoutGroup, totalAmount);
        break;
    }
  }

  /**
   * Validate bank transfer group
   */
  validateBankTransferGroup(payoutGroup, totalAmount) {
    // Bank transfer limits and requirements
    payoutGroup.forEach(({ payout, index }) => {
      if (payout.net_amount && payout.net_amount < 1) {
        this.addWarning('bank_transfer_minimum', 
          `Bank transfer minimum amount not met for payout ${index}`, 
          `payouts[${index}].net_amount`
        );
      }
      
      // Required fields for bank transfers
      if (!payout.bank_account_info && !payout.payment_details) {
        this.addError('missing_bank_details', 
          `Bank account information required for payout ${index}`, 
          `payouts[${index}].bank_account_info`
        );
      }
    });

    if (totalAmount > 25000) {
      this.addInfo('high_value_bank_transfer', 
        'High value bank transfers may require additional verification', 
        'bank_transfer'
      );
    }
  }

  /**
   * Validate PayPal group
   */
  validatePayPalGroup(payoutGroup, totalAmount) {
    // PayPal limits and requirements
    const paypalDailyLimit = 10000;
    
    if (totalAmount > paypalDailyLimit) {
      this.addWarning('paypal_daily_limit', 
        'PayPal payouts may exceed daily limit', 
        'paypal_limit'
      );
    }

    payoutGroup.forEach(({ payout, index }) => {
      // PayPal email requirement
      if (!payout.paypal_email && !payout.payment_details) {
        this.addError('missing_paypal_email', 
          `PayPal email required for payout ${index}`, 
          `payouts[${index}].paypal_email`
        );
      }
      
      // PayPal minimum
      if (payout.net_amount && payout.net_amount < 1) {
        this.addWarning('paypal_minimum', 
          `PayPal minimum amount ($1) not met for payout ${index}`, 
          `payouts[${index}].net_amount`
        );
      }
    });
  }

  /**
   * Validate check group
   */
  validateCheckGroup(payoutGroup, totalAmount) {
    payoutGroup.forEach(({ payout, index }) => {
      // Check minimum amount
      if (payout.net_amount && payout.net_amount < 25) {
        this.addWarning('check_minimum', 
          `Check minimum amount ($25) not met for payout ${index}`, 
          `payouts[${index}].net_amount`
        );
      }
      
      // Mailing address requirement
      if (!payout.mailing_address && !payout.payment_details) {
        this.addError('missing_mailing_address', 
          `Mailing address required for check payout ${index}`, 
          `payouts[${index}].mailing_address`
        );
      }
    });

    this.addInfo('check_processing_time', 
      'Check payments typically take 7-14 business days', 
      'check_timing'
    );
  }

  /**
   * Validate crypto group
   */
  validateCryptoGroup(payoutGroup, totalAmount) {
    payoutGroup.forEach(({ payout, index }) => {
      // Crypto wallet address requirement
      if (!payout.wallet_address && !payout.payment_details) {
        this.addError('missing_wallet_address', 
          `Crypto wallet address required for payout ${index}`, 
          `payouts[${index}].wallet_address`
        );
      }
      
      // Crypto network specification
      if (!payout.crypto_network && !payout.blockchain_network) {
        this.addWarning('missing_crypto_network', 
          `Crypto network specification recommended for payout ${index}`, 
          `payouts[${index}].crypto_network`
        );
      }
    });

    this.addInfo('crypto_volatility_notice', 
      'Crypto payouts subject to exchange rate volatility', 
      'crypto_volatility'
    );
  }

  /**
   * Validate payment method distribution
   */
  async validatePaymentMethodDistribution(methodGroups) {
    const totalPayouts = Object.values(methodGroups).reduce((sum, group) => 
      sum + group.length, 0
    );

    Object.keys(methodGroups).forEach(method => {
      const count = methodGroups[method].length;
      const percentage = (count / totalPayouts) * 100;
      
      if (percentage > 80) {
        this.addInfo('dominant_payment_method', 
          `${method} represents ${percentage.toFixed(1)}% of payouts`, 
          'payment_method_distribution'
        );
      }
    });

    // Check for unusual methods
    const unusualMethods = ['crypto', 'check'];
    unusualMethods.forEach(method => {
      if (methodGroups[method] && methodGroups[method].length > 0) {
        this.addInfo('unusual_payment_method', 
          `${methodGroups[method].length} payouts using ${method}`, 
          'unusual_methods'
        );
      }
    });
  }

  // ========== Threshold Validation ==========

  /**
   * Validate payout thresholds
   */
  async validateThresholds(payoutData) {
    // Global threshold validation
    await this.validateGlobalThresholds(payoutData);
    
    // Per-payee threshold validation
    await this.validatePerPayeeThresholds(payoutData);
    
    // Method-specific threshold validation
    await this.validateMethodSpecificThresholds(payoutData);
  }

  /**
   * Validate global thresholds
   */
  async validateGlobalThresholds(payoutData) {
    const globalMinimum = payoutData.minimum_payout_amount || 10;
    const globalMaximum = payoutData.maximum_payout_amount || 50000;

    if (payoutData.total_net_amount !== undefined) {
      if (payoutData.total_net_amount < globalMinimum) {
        this.addError('below_global_minimum', 
          `Total payout below global minimum ($${globalMinimum})`, 
          'total_net_amount'
        );
      }
      
      if (payoutData.total_net_amount > globalMaximum) {
        this.addWarning('above_global_maximum', 
          `Total payout above global maximum ($${globalMaximum})`, 
          'total_net_amount'
        );
      }
    }
  }

  /**
   * Validate per-payee thresholds
   */
  async validatePerPayeeThresholds(payoutData) {
    if (!payoutData.payouts) return;

    const payeeAggregation = {};
    
    // Aggregate by payee
    payoutData.payouts.forEach(payout => {
      const payeeId = payout.payee_id;
      
      if (payeeId) {
        if (!payeeAggregation[payeeId]) {
          payeeAggregation[payeeId] = 0;
        }
        payeeAggregation[payeeId] += payout.net_amount || 0;
      }
    });

    // Check thresholds per payee
    Object.keys(payeeAggregation).forEach(payeeId => {
      const totalAmount = payeeAggregation[payeeId];
      const minimumPerPayee = 5;
      
      if (totalAmount > 0 && totalAmount < minimumPerPayee) {
        this.addWarning('below_payee_minimum', 
          `Payee ${payeeId} total ($${totalAmount}) below minimum ($${minimumPerPayee})`, 
          'payee_threshold'
        );
      }
    });
  }

  /**
   * Validate method-specific thresholds
   */
  async validateMethodSpecificThresholds(payoutData) {
    if (!payoutData.payouts) return;

    const methodThresholds = {
      'bank_transfer': { min: 1, max: 100000 },
      'wire_transfer': { min: 10, max: 500000 },
      'paypal': { min: 1, max: 10000 },
      'check': { min: 25, max: 25000 },
      'crypto': { min: 5, max: 50000 }
    };

    payoutData.payouts.forEach((payout, index) => {
      const method = payout.payment_method;
      const amount = payout.net_amount;
      
      if (method && amount && methodThresholds[method]) {
        const threshold = methodThresholds[method];
        
        if (amount < threshold.min) {
          this.addWarning('below_method_minimum', 
            `Payout ${index} amount ($${amount}) below ${method} minimum ($${threshold.min})`, 
            `payouts[${index}].net_amount`
          );
        }
        
        if (amount > threshold.max) {
          this.addWarning('above_method_maximum', 
            `Payout ${index} amount ($${amount}) above ${method} maximum ($${threshold.max})`, 
            `payouts[${index}].net_amount`
          );
        }
      }
    });
  }

  // ========== Processing Readiness Validation ==========

  /**
   * Validate processing readiness
   */
  async validateProcessingReadiness(payoutData) {
    // Status validation for processing
    const processingStatuses = ['calculated', 'approved'];
    
    if (!processingStatuses.includes(payoutData.status)) {
      this.addError('invalid_status_for_processing', 
        `Status ${payoutData.status} not valid for processing`, 
        'status'
      );
    }

    // Required approvals
    if (payoutData.requires_approval && !payoutData.approved_by) {
      this.addError('missing_required_approval', 
        'Payout requires approval before processing', 
        'approval'
      );
    }

    // Processing date validation
    if (payoutData.scheduled_processing_date) {
      const scheduledDate = new Date(payoutData.scheduled_processing_date);
      const now = new Date();
      
      if (scheduledDate < now) {
        this.addWarning('past_processing_date', 
          'Scheduled processing date is in the past', 
          'scheduled_processing_date'
        );
      }
    }

    // Weekend/holiday processing
    await this.validateProcessingTiming(payoutData);

    // Batch processing validation
    await this.validateBatchProcessing(payoutData);
  }

  /**
   * Validate processing timing
   */
  async validateProcessingTiming(payoutData) {
    if (payoutData.scheduled_processing_date) {
      const processingDate = new Date(payoutData.scheduled_processing_date);
      const dayOfWeek = processingDate.getDay();
      
      // Weekend processing warning
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.addWarning('weekend_processing', 
          'Processing scheduled for weekend may be delayed', 
          'scheduled_processing_date'
        );
      }
      
      // Same-day processing validation
      const today = new Date();
      const isToday = processingDate.toDateString() === today.toDateString();
      
      if (isToday && payoutData.total_net_amount && payoutData.total_net_amount > 10000) {
        this.addWarning('same_day_large_processing', 
          'Large same-day processing may require additional verification', 
          'processing_timing'
        );
      }
    }
  }

  /**
   * Validate batch processing
   */
  async validateBatchProcessing(payoutData) {
    if (!payoutData.payouts) return;

    const batchSize = payoutData.payouts.length;
    
    // Large batch warning
    if (batchSize > 1000) {
      this.addWarning('large_batch_size', 
        `Large batch size (${batchSize}) may affect processing time`, 
        'batch_size'
      );
    }
    
    // Mixed currency batch
    const currencies = [...new Set(payoutData.payouts.map(p => p.currency).filter(Boolean))];
    if (currencies.length > 1) {
      this.addInfo('mixed_currency_batch', 
        `Batch contains ${currencies.length} different currencies`, 
        'currency_mix'
      );
    }
    
    // Mixed payment method batch
    const methods = [...new Set(payoutData.payouts.map(p => p.payment_method).filter(Boolean))];
    if (methods.length > 3) {
      this.addInfo('mixed_method_batch', 
        `Batch contains ${methods.length} different payment methods`, 
        'method_mix'
      );
    }
  }

  // ========== Risk Assessment Validation ==========

  /**
   * Validate risk assessment
   */
  async validateRiskAssessment(payoutData) {
    // Calculate risk score
    const riskScore = this.calculateRiskScore(payoutData);
    
    // High-risk transaction validation
    if (riskScore > 75) {
      this.addWarning('high_risk_transaction', 
        'Transaction flagged as high risk', 
        'risk_assessment'
      );
    }
    
    // Velocity checks
    await this.validatePayoutVelocity(payoutData);
    
    // Pattern analysis
    await this.validatePayoutPatterns(payoutData);
  }

  /**
   * Calculate risk score
   */
  calculateRiskScore(payoutData) {
    let score = 0;
    
    // Large amount risk
    if (payoutData.total_net_amount && payoutData.total_net_amount > 25000) {
      score += 20;
    }
    
    // Many payees risk
    if (payoutData.payouts && payoutData.payouts.length > 100) {
      score += 15;
    }
    
    // International transfer risk
    const hasInternational = payoutData.payouts && payoutData.payouts.some(p => 
      p.payment_method === 'wire_transfer' || p.currency !== payoutData.currency
    );
    if (hasInternational) {
      score += 10;
    }
    
    // Rush processing risk
    if (payoutData.urgent || payoutData.rush_processing) {
      score += 15;
    }
    
    // Crypto payments risk
    const hasCrypto = payoutData.payouts && payoutData.payouts.some(p => 
      p.payment_method === 'crypto'
    );
    if (hasCrypto) {
      score += 25;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Validate payout velocity
   */
  async validatePayoutVelocity(payoutData) {
    // This would typically check against historical data
    // For now, just validate current batch characteristics
    
    if (payoutData.processing_frequency === 'daily' && 
        payoutData.total_net_amount && payoutData.total_net_amount > 100000) {
      this.addInfo('high_velocity_payout', 
        'High daily payout volume detected', 
        'velocity'
      );
    }
  }

  /**
   * Validate payout patterns
   */
  async validatePayoutPatterns(payoutData) {
    if (!payoutData.payouts) return;

    // Round amount pattern detection
    const roundAmounts = payoutData.payouts.filter(p => 
      p.net_amount && p.net_amount % 100 === 0 && p.net_amount >= 500
    );
    
    if (roundAmounts.length > payoutData.payouts.length * 0.8) {
      this.addInfo('round_amount_pattern', 
        'Unusual pattern of round amounts detected', 
        'patterns'
      );
    }
    
    // Equal amount pattern detection
    const amounts = payoutData.payouts.map(p => p.net_amount).filter(Boolean);
    const uniqueAmounts = [...new Set(amounts)];
    
    if (uniqueAmounts.length === 1 && amounts.length > 10) {
      this.addInfo('equal_amount_pattern', 
        'All payouts have identical amounts', 
        'patterns'
      );
    }
  }

  // ========== Compliance Validation ==========

  /**
   * Validate tax compliance
   */
  async validateTaxCompliance(payoutData, jurisdictions) {
    // US tax compliance
    if (jurisdictions.includes('US')) {
      await this.validateUSTaxCompliance(payoutData);
    }
    
    // EU tax compliance
    if (jurisdictions.some(j => ['DE', 'FR', 'GB', 'IT', 'ES'].includes(j))) {
      await this.validateEUTaxCompliance(payoutData);
    }
    
    // General tax validation
    await this.validateGeneralTaxCompliance(payoutData);
  }

  /**
   * Validate US tax compliance
   */
  async validateUSTaxCompliance(payoutData) {
    // 1099 reporting threshold
    const reportingThreshold = 600;
    
    if (payoutData.payouts) {
      const payeeAggregation = {};
      
      payoutData.payouts.forEach(payout => {
        const payeeId = payout.payee_id;
        if (payeeId) {
          payeeAggregation[payeeId] = (payeeAggregation[payeeId] || 0) + (payout.net_amount || 0);
        }
      });
      
      Object.keys(payeeAggregation).forEach(payeeId => {
        if (payeeAggregation[payeeId] >= reportingThreshold) {
          this.addInfo('1099_reporting_required', 
            `Payee ${payeeId} exceeds 1099 reporting threshold`, 
            'tax_reporting'
          );
        }
      });
    }
    
    // Backup withholding validation
    if (payoutData.backup_withholding_required) {
      const withholdingRate = 0.24; // 24% backup withholding rate
      
      payoutData.payouts.forEach((payout, index) => {
        if (payout.backup_withholding && payout.gross_amount) {
          const expectedWithholding = payout.gross_amount * withholdingRate;
          const actualWithholding = payout.backup_withholding;
          
          if (Math.abs(actualWithholding - expectedWithholding) > 0.01) {
            this.addWarning('incorrect_backup_withholding', 
              `Backup withholding calculation may be incorrect for payout ${index}`, 
              `payouts[${index}].backup_withholding`
            );
          }
        }
      });
    }
  }

  /**
   * Validate EU tax compliance
   */
  async validateEUTaxCompliance(payoutData) {
    // DAC reporting
    this.addInfo('dac_reporting_notice', 
      'EU payments may require DAC reporting', 
      'eu_tax_compliance'
    );
    
    // VAT considerations
    if (payoutData.includes_vat) {
      this.addInfo('vat_compliance_notice', 
        'VAT compliance requirements may apply', 
        'vat_compliance'
      );
    }
  }

  /**
   * Validate general tax compliance
   */
  async validateGeneralTaxCompliance(payoutData) {
    // Tax documentation
    if (payoutData.tax_documents_required && !payoutData.tax_documents_collected) {
      this.addWarning('missing_tax_documents', 
        'Required tax documents not collected', 
        'tax_documents'
      );
    }
    
    // Withholding tax validation
    if (payoutData.withholding_tax_rate && payoutData.payouts) {
      payoutData.payouts.forEach((payout, index) => {
        if (payout.withholding_tax && payout.gross_amount) {
          const expectedWithholding = payout.gross_amount * payoutData.withholding_tax_rate;
          const actualWithholding = payout.withholding_tax;
          
          if (Math.abs(actualWithholding - expectedWithholding) > 0.01) {
            this.addWarning('withholding_tax_mismatch', 
              `Withholding tax calculation may be incorrect for payout ${index}`, 
              `payouts[${index}].withholding_tax`
            );
          }
        }
      });
    }
  }

  /**
   * Validate regulatory compliance
   */
  async validateRegulatoryCompliance(payoutData, jurisdictions) {
    // Large transaction reporting
    const ctrThreshold = 10000;
    
    if (payoutData.total_net_amount && payoutData.total_net_amount >= ctrThreshold) {
      this.addInfo('large_transaction_reporting', 
        'Transaction may require regulatory reporting', 
        'regulatory_reporting'
      );
    }
    
    // Cross-border payment compliance
    const hasCrossBorder = payoutData.payouts && payoutData.payouts.some(p => 
      p.currency !== payoutData.currency || p.payment_method === 'wire_transfer'
    );
    
    if (hasCrossBorder) {
      this.addInfo('cross_border_compliance', 
        'Cross-border payments may have additional compliance requirements', 
        'cross_border'
      );
    }
  }

  /**
   * Validate AML compliance
   */
  async validateAMLCompliance(payoutData) {
    // High-risk indicators
    const riskIndicators = [];
    
    // Large cash equivalent
    if (payoutData.total_net_amount && payoutData.total_net_amount > 50000) {
      riskIndicators.push('large_amount');
    }
    
    // Unusual payment patterns
    if (payoutData.payouts && payoutData.payouts.length > 200) {
      riskIndicators.push('high_volume');
    }
    
    // Geographic risk
    const hasHighRiskCountries = payoutData.payouts && payoutData.payouts.some(p => 
      p.beneficiary_country && ['AF', 'IR', 'KP', 'SY'].includes(p.beneficiary_country)
    );
    
    if (hasHighRiskCountries) {
      riskIndicators.push('high_risk_geography');
    }
    
    if (riskIndicators.length > 0) {
      this.addInfo('aml_risk_indicators', 
        `AML risk indicators detected: ${riskIndicators.join(', ')}`, 
        'aml_compliance'
      );
    }
  }

  /**
   * Validate documentation compliance
   */
  async validateDocumentationCompliance(payoutData) {
    // Required documentation
    const requiredDocs = ['calculation_report', 'approval_record'];
    
    requiredDocs.forEach(doc => {
      if (!payoutData[doc] && !payoutData.supporting_documents?.includes(doc)) {
        this.addWarning('missing_required_document', 
          `Required document ${doc} is missing`, 
          'documentation'
        );
      }
    });
    
    // Retention requirements
    this.addInfo('document_retention_notice', 
      'Payout documentation must be retained per regulatory requirements', 
      'document_retention'
    );
  }

  // ========== Utility Methods ==========

  /**
   * Check if date is valid
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Calculate hours since last payout (placeholder)
   */
  calculateHoursSinceLastPayout(processingDate) {
    // This would typically check database for last payout
    // For now, return a reasonable default
    return 24;
  }

  /**
   * Add info message (lower priority than warning)
   */
  addInfo(code, message, field) {
    this.warnings.push({
      code,
      message,
      field,
      severity: 'info'
    });
  }

  /**
   * Get validation summary with payout analysis
   */
  getPayoutValidationSummary(payoutData) {
    const result = this.buildValidationResult();
    
    // Add payout analysis summary
    result.payout_analysis = {
      total_payouts: payoutData.payouts ? payoutData.payouts.length : 0,
      total_amount: payoutData.total_net_amount || 0,
      currency: payoutData.currency,
      risk_score: this.calculateRiskScore(payoutData),
      processing_readiness: this.assessProcessingReadiness(payoutData),
      compliance_score: this.calculateComplianceScore(payoutData)
    };
    
    return result;
  }

  /**
   * Assess processing readiness
   */
  assessProcessingReadiness(payoutData) {
    const issues = [];
    
    if (!['calculated', 'approved'].includes(payoutData.status)) {
      issues.push('invalid_status');
    }
    
    if (payoutData.requires_approval && !payoutData.approved_by) {
      issues.push('missing_approval');
    }
    
    if (!payoutData.payouts || payoutData.payouts.length === 0) {
      issues.push('no_payouts');
    }
    
    return {
      ready: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(payoutData) {
    let score = 100;
    
    // Documentation compliance
    if (!payoutData.calculation_report) score -= 10;
    if (!payoutData.approval_record) score -= 10;
    
    // Tax compliance
    if (payoutData.tax_documents_required && !payoutData.tax_documents_collected) {
      score -= 20;
    }
    
    // AML compliance
    const riskScore = this.calculateRiskScore(payoutData);
    if (riskScore > 50) score -= 15;
    
    // Audit trail
    if (!payoutData.created_by) score -= 5;
    if (!payoutData.approved_by && payoutData.status === 'approved') score -= 10;
    
    return Math.max(0, score);
  }
}

module.exports = PayoutValidator;
