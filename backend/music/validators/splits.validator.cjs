/**
 * Splits Validator
 * Specialized validation for royalty splits, revenue sharing, and financial arrangements
 * Handles validation for split creation, calculations, and payment distributions
 */

const MetadataValidator = require('./metadata.validator.cjs');
const logger = require('../../config/logger.cjs');

class SplitsValidator extends MetadataValidator {
  constructor() {
    super();
  }

  // ========== Split-Specific Validation ==========

  /**
   * Validate complete split configuration
   */
  async validateForCreation(splitData, options = {}) {
    this.resetValidation();
    
    const { 
      validateTotalPercentage = true,
      validateParticipants = true,
      strict = false 
    } = options;

    try {
      // Basic split validation
      await this.validateSplitStructure(splitData);
      
      // Participants validation
      if (validateParticipants) {
        await this.validateParticipants(splitData, { strict });
      }
      
      // Percentage validation
      if (validateTotalPercentage) {
        await this.validatePercentages(splitData);
      }
      
      // Legal and compliance validation
      await this.validateLegalCompliance(splitData);
      
      // Business rules validation
      await this.validateBusinessRules(splitData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Split creation validation error', { error: error.message });
      this.addError('validation_error', 'Split validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate split for calculation
   */
  async validateForCalculation(splitData, options = {}) {
    this.resetValidation();
    
    const { 
      validateActiveStatus = true,
      validateCalculationRules = true 
    } = options;

    try {
      // Active status validation
      if (validateActiveStatus) {
        await this.validateActiveStatus(splitData);
      }
      
      // Calculation rules validation
      if (validateCalculationRules) {
        await this.validateCalculationRules(splitData);
      }
      
      // Threshold validation
      await this.validateThresholds(splitData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Split calculation validation error', { error: error.message });
      this.addError('validation_error', 'Split calculation validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  /**
   * Validate split for payment distribution
   */
  async validateForPaymentDistribution(splitData, paymentData, options = {}) {
    this.resetValidation();
    
    const { 
      validatePaymentInfo = true,
      validateMinimumPayouts = true 
    } = options;

    try {
      // Payment information validation
      if (validatePaymentInfo) {
        await this.validatePaymentInformation(splitData, paymentData);
      }
      
      // Minimum payout validation
      if (validateMinimumPayouts) {
        await this.validateMinimumPayouts(splitData, paymentData);
      }
      
      // Tax and legal validation
      await this.validateTaxCompliance(splitData, paymentData);
      
      return this.buildValidationResult();
    } catch (error) {
      logger.error('Split payment distribution validation error', { error: error.message });
      this.addError('validation_error', 'Payment distribution validation failed', 'general');
      return this.buildValidationResult();
    }
  }

  // ========== Structure Validation ==========

  /**
   * Validate split data structure
   */
  async validateSplitStructure(splitData) {
    // Required fields validation
    const requiredFields = ['release_id', 'split_type', 'splits'];
    
    requiredFields.forEach(field => {
      if (splitData[field] === undefined || splitData[field] === null) {
        this.addError('missing_required_field', `${field} is required`, field);
      }
    });

    // Split type validation
    if (splitData.split_type) {
      const validSplitTypes = [
        'master_recording', 'publishing', 'performance', 'mechanical',
        'sync', 'neighboring_rights', 'digital_performance', 'broadcast'
      ];
      
      if (!validSplitTypes.includes(splitData.split_type)) {
        this.addError('invalid_split_type', 
          `Invalid split type: ${splitData.split_type}`, 
          'split_type'
        );
      }
    }

    // Splits array validation
    if (splitData.splits) {
      if (!Array.isArray(splitData.splits)) {
        this.addError('invalid_splits_format', 'Splits must be an array', 'splits');
      } else if (splitData.splits.length === 0) {
        this.addError('empty_splits', 'At least one split is required', 'splits');
      } else {
        // Validate individual splits
        splitData.splits.forEach((split, index) => {
          this.validateIndividualSplit(split, index);
        });
      }
    }

    // Territory validation
    if (splitData.territories && !Array.isArray(splitData.territories)) {
      this.addError('invalid_territories_format', 'Territories must be an array', 'territories');
    }

    // Date validation
    const dateFields = ['effective_date', 'expiry_date', 'created_date'];
    dateFields.forEach(field => {
      if (splitData[field] && !this.isValidDate(splitData[field])) {
        this.addError('invalid_date_format', `${field} must be a valid date`, field);
      }
    });

    // Status validation
    if (splitData.status) {
      const validStatuses = ['draft', 'pending', 'active', 'suspended', 'terminated'];
      if (!validStatuses.includes(splitData.status)) {
        this.addError('invalid_status', `Invalid status: ${splitData.status}`, 'status');
      }
    }
  }

  /**
   * Validate individual split entry
   */
  validateIndividualSplit(split, index) {
    const prefix = `splits[${index}]`;

    // Required fields for individual split
    const requiredFields = ['participant_id', 'percentage'];
    requiredFields.forEach(field => {
      if (split[field] === undefined || split[field] === null) {
        this.addError('missing_split_field', 
          `${field} is required for split ${index}`, 
          `${prefix}.${field}`
        );
      }
    });

    // Percentage validation
    if (split.percentage !== undefined) {
      if (typeof split.percentage !== 'number') {
        this.addError('invalid_percentage_type', 
          `Percentage must be a number for split ${index}`, 
          `${prefix}.percentage`
        );
      } else if (split.percentage < 0 || split.percentage > 100) {
        this.addError('percentage_out_of_range', 
          `Percentage must be between 0 and 100 for split ${index}`, 
          `${prefix}.percentage`
        );
      } else if (split.percentage === 0) {
        this.addWarning('zero_percentage', 
          `Split ${index} has 0% allocation`, 
          `${prefix}.percentage`
        );
      }
    }

    // Participant ID validation
    if (split.participant_id && typeof split.participant_id !== 'string') {
      this.addError('invalid_participant_id', 
        `Participant ID must be a string for split ${index}`, 
        `${prefix}.participant_id`
      );
    }

    // Role validation
    if (split.role) {
      const validRoles = [
        'artist', 'songwriter', 'composer', 'producer', 'mixer', 'engineer',
        'publisher', 'label', 'distributor', 'manager', 'featured_artist', 'session_musician'
      ];
      
      if (!validRoles.includes(split.role)) {
        this.addWarning('unrecognized_role', 
          `Unrecognized role: ${split.role} for split ${index}`, 
          `${prefix}.role`
        );
      }
    }

    // Priority validation
    if (split.priority !== undefined) {
      if (!Number.isInteger(split.priority) || split.priority < 1) {
        this.addError('invalid_priority', 
          `Priority must be a positive integer for split ${index}`, 
          `${prefix}.priority`
        );
      }
    }

    // Minimum amount validation
    if (split.minimum_amount !== undefined) {
      if (typeof split.minimum_amount !== 'number' || split.minimum_amount < 0) {
        this.addError('invalid_minimum_amount', 
          `Minimum amount must be a non-negative number for split ${index}`, 
          `${prefix}.minimum_amount`
        );
      }
    }

    // Maximum amount validation
    if (split.maximum_amount !== undefined) {
      if (typeof split.maximum_amount !== 'number' || split.maximum_amount < 0) {
        this.addError('invalid_maximum_amount', 
          `Maximum amount must be a non-negative number for split ${index}`, 
          `${prefix}.maximum_amount`
        );
      }

      // Check min/max relationship
      if (split.minimum_amount !== undefined && split.maximum_amount < split.minimum_amount) {
        this.addError('max_less_than_min', 
          `Maximum amount cannot be less than minimum amount for split ${index}`, 
          `${prefix}.maximum_amount`
        );
      }
    }
  }

  // ========== Participants Validation ==========

  /**
   * Validate participants in split
   */
  async validateParticipants(splitData, options = {}) {
    const { strict = false } = options;

    if (!splitData.splits || !Array.isArray(splitData.splits)) {
      return;
    }

    // Check for duplicate participants
    const participantIds = splitData.splits.map(split => split.participant_id);
    const duplicates = participantIds.filter((id, index) => 
      participantIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      this.addError('duplicate_participants', 
        `Duplicate participant IDs: ${duplicates.join(', ')}`, 
        'participants'
      );
    }

    // Validate participant existence (if strict mode)
    if (strict) {
      await this.validateParticipantExistence(participantIds);
    }

    // Role distribution validation
    await this.validateRoleDistribution(splitData.splits);

    // Cross-validation with split type
    await this.validateParticipantsForSplitType(splitData.splits, splitData.split_type);
  }

  /**
   * Validate participant existence (placeholder for database check)
   */
  async validateParticipantExistence(participantIds) {
    // In real implementation, this would check database
    // For now, just validate format
    participantIds.forEach(id => {
      if (!id || typeof id !== 'string') {
        this.addError('invalid_participant_id_format', 
          'Participant ID must be a non-empty string', 
          'participant_id'
        );
      }
    });
  }

  /**
   * Validate role distribution among participants
   */
  async validateRoleDistribution(splits) {
    const roles = splits.map(split => split.role).filter(Boolean);
    const roleCounts = {};
    
    roles.forEach(role => {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Check for roles that should typically be unique
    const uniqueRoles = ['label', 'distributor', 'publisher'];
    uniqueRoles.forEach(role => {
      if (roleCounts[role] > 1) {
        this.addWarning('multiple_unique_roles', 
          `Multiple participants with ${role} role (${roleCounts[role]})`, 
          'roles'
        );
      }
    });

    // Check for essential roles
    const essentialRoles = ['artist', 'songwriter'];
    const hasEssentialRole = essentialRoles.some(role => roleCounts[role] > 0);
    
    if (!hasEssentialRole) {
      this.addWarning('missing_essential_roles', 
        'No essential roles (artist, songwriter) found in splits', 
        'roles'
      );
    }
  }

  /**
   * Validate participants for specific split type
   */
  async validateParticipantsForSplitType(splits, splitType) {
    const roles = splits.map(split => split.role).filter(Boolean);

    switch (splitType) {
      case 'master_recording':
        if (!roles.includes('artist')) {
          this.addWarning('master_missing_artist', 
            'Master recording splits typically include artist role', 
            'split_type'
          );
        }
        break;

      case 'publishing':
        if (!roles.includes('songwriter') && !roles.includes('composer')) {
          this.addWarning('publishing_missing_writer', 
            'Publishing splits typically include songwriter or composer role', 
            'split_type'
          );
        }
        break;

      case 'performance':
        if (!roles.includes('artist') && !roles.includes('performer')) {
          this.addWarning('performance_missing_performer', 
            'Performance splits typically include artist or performer role', 
            'split_type'
          );
        }
        break;
    }
  }

  // ========== Percentage Validation ==========

  /**
   * Validate percentage allocations
   */
  async validatePercentages(splitData) {
    if (!splitData.splits || !Array.isArray(splitData.splits)) {
      return;
    }

    const percentages = splitData.splits
      .map(split => split.percentage)
      .filter(p => typeof p === 'number');

    if (percentages.length === 0) {
      this.addError('no_valid_percentages', 'No valid percentages found in splits', 'percentages');
      return;
    }

    // Calculate total percentage
    const totalPercentage = percentages.reduce((sum, percentage) => sum + percentage, 0);

    // Total percentage validation
    if (Math.abs(totalPercentage - 100) > 0.01) { // Allow for floating point precision
      if (totalPercentage > 100) {
        this.addError('percentage_exceeds_100', 
          `Total percentage (${totalPercentage.toFixed(2)}%) exceeds 100%`, 
          'percentages'
        );
      } else {
        this.addError('percentage_under_100', 
          `Total percentage (${totalPercentage.toFixed(2)}%) is less than 100%`, 
          'percentages'
        );
      }
    }

    // Individual percentage validation
    percentages.forEach((percentage, index) => {
      if (percentage > 50) {
        this.addWarning('high_individual_percentage', 
          `Split ${index} has high percentage allocation (${percentage}%)`, 
          `splits[${index}].percentage`
        );
      }

      // Precision validation
      const decimalPlaces = (percentage.toString().split('.')[1] || '').length;
      if (decimalPlaces > 4) {
        this.addWarning('excessive_precision', 
          `Split ${index} has excessive decimal precision (${decimalPlaces} places)`, 
          `splits[${index}].percentage`
        );
      }
    });

    // Distribution fairness check
    await this.validateDistributionFairness(percentages);
  }

  /**
   * Validate distribution fairness
   */
  async validateDistributionFairness(percentages) {
    if (percentages.length < 2) {
      return;
    }

    const maxPercentage = Math.max(...percentages);
    const minPercentage = Math.min(...percentages);
    const ratio = maxPercentage / minPercentage;

    // Check for extremely unequal distribution
    if (ratio > 20) {
      this.addWarning('highly_unequal_distribution', 
        `Very unequal distribution: highest (${maxPercentage}%) vs lowest (${minPercentage}%)`, 
        'distribution'
      );
    }

    // Check for majority control
    if (maxPercentage > 50) {
      this.addInfo('majority_control', 
        'One participant has majority control of splits', 
        'distribution'
      );
    }

    // Check for even distribution
    const averagePercentage = 100 / percentages.length;
    const isEvenlyDistributed = percentages.every(p => 
      Math.abs(p - averagePercentage) < 5
    );

    if (isEvenlyDistributed) {
      this.addInfo('even_distribution', 
        'Splits are evenly distributed among participants', 
        'distribution'
      );
    }
  }

  // ========== Legal Compliance Validation ==========

  /**
   * Validate legal compliance requirements
   */
  async validateLegalCompliance(splitData) {
    // Territory compliance
    await this.validateTerritoryCompliance(splitData);
    
    // Rights validation
    await this.validateRightsCompliance(splitData);
    
    // Documentation requirements
    await this.validateDocumentationRequirements(splitData);
    
    // Regulatory compliance
    await this.validateRegulatoryCompliance(splitData);
  }

  /**
   * Validate territory compliance
   */
  async validateTerritoryCompliance(splitData) {
    if (!splitData.territories || splitData.territories.length === 0) {
      this.addWarning('no_territories_specified', 
        'No territories specified for split', 
        'territories'
      );
      return;
    }

    // Territory format validation
    const validTerritoryFormats = /^[A-Z]{2}$/; // ISO 3166-1 alpha-2
    splitData.territories.forEach((territory, index) => {
      if (!validTerritoryFormats.test(territory)) {
        this.addError('invalid_territory_format', 
          `Territory ${territory} is not in ISO 3166-1 alpha-2 format`, 
          `territories[${index}]`
        );
      }
    });

    // Worldwide coverage check
    if (splitData.territories.includes('WW') && splitData.territories.length > 1) {
      this.addWarning('worldwide_with_specific', 
        'Worldwide territory specified along with specific territories', 
        'territories'
      );
    }

    // Common territories validation
    const commonTerritories = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP'];
    const hasCommonTerritories = commonTerritories.some(territory => 
      splitData.territories.includes(territory)
    );

    if (!hasCommonTerritories && !splitData.territories.includes('WW')) {
      this.addWarning('no_major_territories', 
        'No major music markets specified in territories', 
        'territories'
      );
    }
  }

  /**
   * Validate rights compliance
   */
  async validateRightsCompliance(splitData) {
    const splitType = splitData.split_type;
    
    // Rights validation by split type
    switch (splitType) {
      case 'master_recording':
        await this.validateMasterRights(splitData);
        break;
      case 'publishing':
        await this.validatePublishingRights(splitData);
        break;
      case 'performance':
        await this.validatePerformanceRights(splitData);
        break;
      case 'mechanical':
        await this.validateMechanicalRights(splitData);
        break;
      case 'sync':
        await this.validateSyncRights(splitData);
        break;
    }

    // Exclusive vs non-exclusive
    if (splitData.exclusive === undefined) {
      this.addWarning('exclusivity_not_specified', 
        'Rights exclusivity not specified', 
        'exclusive'
      );
    }

    // Rights period validation
    if (splitData.rights_period) {
      await this.validateRightsPeriod(splitData.rights_period);
    }
  }

  /**
   * Validate master recording rights
   */
  async validateMasterRights(splitData) {
    // Check for label involvement
    const hasLabel = splitData.splits.some(split => split.role === 'label');
    if (!hasLabel) {
      this.addWarning('master_no_label', 
        'Master recording splits typically involve a record label', 
        'master_rights'
      );
    }

    // Check for artist involvement
    const hasArtist = splitData.splits.some(split => split.role === 'artist');
    if (!hasArtist) {
      this.addWarning('master_no_artist', 
        'Master recording splits typically involve the recording artist', 
        'master_rights'
      );
    }
  }

  /**
   * Validate publishing rights
   */
  async validatePublishingRights(splitData) {
    // Check for songwriter/composer
    const hasWriter = splitData.splits.some(split => 
      ['songwriter', 'composer'].includes(split.role)
    );
    
    if (!hasWriter) {
      this.addError('publishing_no_writer', 
        'Publishing splits must include songwriter or composer', 
        'publishing_rights'
      );
    }

    // Check for publisher
    const hasPublisher = splitData.splits.some(split => split.role === 'publisher');
    if (!hasPublisher) {
      this.addWarning('publishing_no_publisher', 
        'Publishing splits typically involve a publisher', 
        'publishing_rights'
      );
    }
  }

  /**
   * Validate performance rights
   */
  async validatePerformanceRights(splitData) {
    // Check for performer
    const hasPerformer = splitData.splits.some(split => 
      ['artist', 'performer', 'featured_artist'].includes(split.role)
    );
    
    if (!hasPerformer) {
      this.addError('performance_no_performer', 
        'Performance splits must include a performer', 
        'performance_rights'
      );
    }

    // PRO collection notice
    this.addInfo('pro_collection_notice', 
      'Performance royalties are typically collected by PROs (ASCAP, BMI, etc.)', 
      'performance_rights'
    );
  }

  /**
   * Validate mechanical rights
   */
  async validateMechanicalRights(splitData) {
    // Check for songwriter/composer
    const hasWriter = splitData.splits.some(split => 
      ['songwriter', 'composer'].includes(split.role)
    );
    
    if (!hasWriter) {
      this.addError('mechanical_no_writer', 
        'Mechanical splits must include songwriter or composer', 
        'mechanical_rights'
      );
    }

    // Mechanical rate notice
    this.addInfo('mechanical_rate_notice', 
      'Mechanical royalties are subject to statutory rates in many territories', 
      'mechanical_rights'
    );
  }

  /**
   * Validate sync rights
   */
  async validateSyncRights(splitData) {
    // Check for both master and publishing rights holders
    const hasMasterRights = splitData.splits.some(split => 
      ['artist', 'label'].includes(split.role)
    );
    
    const hasPublishingRights = splitData.splits.some(split => 
      ['songwriter', 'composer', 'publisher'].includes(split.role)
    );

    if (!hasMasterRights) {
      this.addWarning('sync_no_master_rights', 
        'Sync deals typically require master rights holders', 
        'sync_rights'
      );
    }

    if (!hasPublishingRights) {
      this.addWarning('sync_no_publishing_rights', 
        'Sync deals typically require publishing rights holders', 
        'sync_rights'
      );
    }
  }

  /**
   * Validate rights period
   */
  async validateRightsPeriod(rightsPeriod) {
    if (rightsPeriod.start_date && !this.isValidDate(rightsPeriod.start_date)) {
      this.addError('invalid_rights_start_date', 
        'Rights start date is invalid', 
        'rights_period.start_date'
      );
    }

    if (rightsPeriod.end_date && !this.isValidDate(rightsPeriod.end_date)) {
      this.addError('invalid_rights_end_date', 
        'Rights end date is invalid', 
        'rights_period.end_date'
      );
    }

    if (rightsPeriod.start_date && rightsPeriod.end_date) {
      const start = new Date(rightsPeriod.start_date);
      const end = new Date(rightsPeriod.end_date);
      
      if (end <= start) {
        this.addError('rights_end_before_start', 
          'Rights end date must be after start date', 
          'rights_period'
        );
      }

      // Check for very long periods
      const yearsDifference = (end - start) / (1000 * 60 * 60 * 24 * 365);
      if (yearsDifference > 95) { // Standard copyright term
        this.addWarning('very_long_rights_period', 
          'Rights period exceeds typical copyright term', 
          'rights_period'
        );
      }
    }
  }

  /**
   * Validate documentation requirements
   */
  async validateDocumentationRequirements(splitData) {
    // Agreement documentation
    if (!splitData.agreement_type) {
      this.addWarning('no_agreement_type', 
        'Agreement type not specified', 
        'agreement_type'
      );
    }

    if (!splitData.agreement_date) {
      this.addWarning('no_agreement_date', 
        'Agreement date not specified', 
        'agreement_date'
      );
    }

    // Supporting documentation
    if (splitData.supporting_documents && !Array.isArray(splitData.supporting_documents)) {
      this.addError('invalid_documents_format', 
        'Supporting documents must be an array', 
        'supporting_documents'
      );
    }

    // Signature requirements
    if (splitData.requires_signatures && !splitData.signatures) {
      this.addWarning('missing_signatures', 
        'Split requires signatures but none provided', 
        'signatures'
      );
    }
  }

  /**
   * Validate regulatory compliance
   */
  async validateRegulatoryCompliance(splitData) {
    // Tax implications
    if (splitData.territories) {
      const hasUSTerritory = splitData.territories.includes('US') || 
                            splitData.territories.includes('WW');
      
      if (hasUSTerritory) {
        this.addInfo('us_tax_implications', 
          'US territory splits may have tax withholding requirements', 
          'tax_compliance'
        );
      }
    }

    // Anti-corruption compliance
    if (splitData.splits.some(split => split.percentage > 50)) {
      this.addInfo('majority_control_notice', 
        'Majority control may trigger additional regulatory requirements', 
        'regulatory_compliance'
      );
    }

    // Data protection compliance
    this.addInfo('data_protection_notice', 
      'Participant data handling must comply with applicable privacy laws', 
      'data_protection'
    );
  }

  // ========== Business Rules Validation ==========

  /**
   * Validate business rules
   */
  async validateBusinessRules(splitData) {
    // Minimum percentage rules
    await this.validateMinimumPercentageRules(splitData);
    
    // Priority rules
    await this.validatePriorityRules(splitData);
    
    // Exclusivity rules
    await this.validateExclusivityRules(splitData);
    
    // Timing rules
    await this.validateTimingRules(splitData);
  }

  /**
   * Validate minimum percentage rules
   */
  async validateMinimumPercentageRules(splitData) {
    if (!splitData.splits) return;

    splitData.splits.forEach((split, index) => {
      // Very small percentages warning
      if (split.percentage < 1) {
        this.addWarning('very_small_percentage', 
          `Split ${index} has very small percentage (${split.percentage}%)`, 
          `splits[${index}].percentage`
        );
      }

      // Role-specific minimum percentages
      if (split.role === 'artist' && split.percentage < 10) {
        this.addWarning('low_artist_percentage', 
          `Artist split ${index} has low percentage (${split.percentage}%)`, 
          `splits[${index}].percentage`
        );
      }

      if (split.role === 'songwriter' && split.percentage < 5) {
        this.addWarning('low_songwriter_percentage', 
          `Songwriter split ${index} has low percentage (${split.percentage}%)`, 
          `splits[${index}].percentage`
        );
      }
    });
  }

  /**
   * Validate priority rules
   */
  async validatePriorityRules(splitData) {
    if (!splitData.splits) return;

    const priorities = splitData.splits
      .map(split => split.priority)
      .filter(p => p !== undefined);

    if (priorities.length > 0) {
      // Check for duplicate priorities
      const duplicatePriorities = priorities.filter((priority, index) => 
        priorities.indexOf(priority) !== index
      );

      if (duplicatePriorities.length > 0) {
        this.addWarning('duplicate_priorities', 
          `Duplicate priority values: ${duplicatePriorities.join(', ')}`, 
          'priorities'
        );
      }

      // Check for gaps in priority sequence
      const sortedPriorities = [...new Set(priorities)].sort((a, b) => a - b);
      for (let i = 1; i < sortedPriorities.length; i++) {
        if (sortedPriorities[i] - sortedPriorities[i-1] > 1) {
          this.addWarning('priority_gaps', 
            'Gaps found in priority sequence', 
            'priorities'
          );
          break;
        }
      }
    }
  }

  /**
   * Validate exclusivity rules
   */
  async validateExclusivityRules(splitData) {
    if (splitData.exclusive === true) {
      // Exclusive splits should have clear ownership
      if (splitData.splits.length > 3) {
        this.addWarning('many_participants_exclusive', 
          'Exclusive splits with many participants may create complications', 
          'exclusive'
        );
      }

      // Territory implications for exclusive splits
      if (splitData.territories && splitData.territories.length > 1 && 
          !splitData.territories.includes('WW')) {
        this.addWarning('exclusive_multiple_territories', 
          'Exclusive splits across multiple territories may conflict', 
          'exclusive'
        );
      }
    }
  }

  /**
   * Validate timing rules
   */
  async validateTimingRules(splitData) {
    const now = new Date();

    // Effective date validation
    if (splitData.effective_date) {
      const effectiveDate = new Date(splitData.effective_date);
      
      if (effectiveDate > now) {
        this.addInfo('future_effective_date', 
          'Split has future effective date', 
          'effective_date'
        );
      }

      // Very old effective dates
      const yearsDifference = (now - effectiveDate) / (1000 * 60 * 60 * 24 * 365);
      if (yearsDifference > 10) {
        this.addWarning('very_old_effective_date', 
          'Split has very old effective date', 
          'effective_date'
        );
      }
    }

    // Expiry date validation
    if (splitData.expiry_date) {
      const expiryDate = new Date(splitData.expiry_date);
      
      if (expiryDate < now) {
        this.addError('expired_split', 
          'Split has expired', 
          'expiry_date'
        );
      }

      // Very long terms
      if (splitData.effective_date) {
        const effectiveDate = new Date(splitData.effective_date);
        const termYears = (expiryDate - effectiveDate) / (1000 * 60 * 60 * 24 * 365);
        
        if (termYears > 95) {
          this.addWarning('very_long_term', 
            'Split term exceeds typical copyright period', 
            'term'
          );
        }
      }
    }
  }

  // ========== Calculation and Payment Validation ==========

  /**
   * Validate active status for calculations
   */
  async validateActiveStatus(splitData) {
    if (splitData.status !== 'active') {
      this.addError('split_not_active', 
        `Split status is ${splitData.status}, not active`, 
        'status'
      );
    }

    // Effective date check
    if (splitData.effective_date) {
      const effectiveDate = new Date(splitData.effective_date);
      const now = new Date();
      
      if (effectiveDate > now) {
        this.addError('split_not_yet_effective', 
          'Split effective date is in the future', 
          'effective_date'
        );
      }
    }

    // Expiry date check
    if (splitData.expiry_date) {
      const expiryDate = new Date(splitData.expiry_date);
      const now = new Date();
      
      if (expiryDate < now) {
        this.addError('split_expired', 
          'Split has expired', 
          'expiry_date'
        );
      }
    }
  }

  /**
   * Validate calculation rules
   */
  async validateCalculationRules(splitData) {
    // Percentage precision for calculations
    if (splitData.splits) {
      splitData.splits.forEach((split, index) => {
        if (split.percentage && split.percentage % 0.01 !== 0) {
          this.addWarning('high_precision_percentage', 
            `Split ${index} has high precision percentage that may cause rounding issues`, 
            `splits[${index}].percentage`
          );
        }
      });
    }

    // Calculation method validation
    if (splitData.calculation_method) {
      const validMethods = ['gross', 'net', 'after_costs', 'after_recoupment'];
      if (!validMethods.includes(splitData.calculation_method)) {
        this.addError('invalid_calculation_method', 
          `Invalid calculation method: ${splitData.calculation_method}`, 
          'calculation_method'
        );
      }
    }

    // Rounding rules validation
    if (splitData.rounding_rule) {
      const validRules = ['round', 'floor', 'ceil', 'banker'];
      if (!validRules.includes(splitData.rounding_rule)) {
        this.addError('invalid_rounding_rule', 
          `Invalid rounding rule: ${splitData.rounding_rule}`, 
          'rounding_rule'
        );
      }
    }
  }

  /**
   * Validate thresholds
   */
  async validateThresholds(splitData) {
    if (splitData.splits) {
      splitData.splits.forEach((split, index) => {
        // Minimum amount thresholds
        if (split.minimum_amount !== undefined) {
          if (split.minimum_amount > 1000) {
            this.addWarning('high_minimum_amount', 
              `Split ${index} has high minimum amount ($${split.minimum_amount})`, 
              `splits[${index}].minimum_amount`
            );
          }
        }

        // Maximum amount validation
        if (split.maximum_amount !== undefined && split.maximum_amount < 1) {
          this.addWarning('very_low_maximum_amount', 
            `Split ${index} has very low maximum amount ($${split.maximum_amount})`, 
            `splits[${index}].maximum_amount`
          );
        }
      });
    }

    // Global threshold validation
    if (splitData.minimum_total_amount !== undefined) {
      if (splitData.minimum_total_amount > 10000) {
        this.addWarning('high_minimum_total', 
          'High minimum total amount may delay payments', 
          'minimum_total_amount'
        );
      }
    }
  }

  /**
   * Validate payment information
   */
  async validatePaymentInformation(splitData, paymentData) {
    if (!paymentData) {
      this.addError('missing_payment_data', 'Payment data is required', 'payment_data');
      return;
    }

    // Payment method validation
    if (paymentData.payment_methods) {
      paymentData.payment_methods.forEach((method, index) => {
        this.validatePaymentMethod(method, index);
      });
    }

    // Bank account validation
    if (paymentData.bank_accounts) {
      paymentData.bank_accounts.forEach((account, index) => {
        this.validateBankAccount(account, index);
      });
    }

    // Tax information validation
    if (paymentData.tax_information) {
      this.validateTaxInformation(paymentData.tax_information);
    }
  }

  /**
   * Validate individual payment method
   */
  validatePaymentMethod(method, index) {
    const validMethods = ['bank_transfer', 'paypal', 'check', 'wire', 'ach', 'crypto'];
    
    if (!validMethods.includes(method.type)) {
      this.addError('invalid_payment_method', 
        `Invalid payment method: ${method.type}`, 
        `payment_methods[${index}].type`
      );
    }

    if (!method.details) {
      this.addError('missing_payment_details', 
        `Payment method ${index} missing details`, 
        `payment_methods[${index}].details`
      );
    }
  }

  /**
   * Validate bank account information
   */
  validateBankAccount(account, index) {
    if (!account.account_number) {
      this.addError('missing_account_number', 
        `Bank account ${index} missing account number`, 
        `bank_accounts[${index}].account_number`
      );
    }

    if (!account.routing_number && !account.swift_code) {
      this.addError('missing_routing_info', 
        `Bank account ${index} missing routing/SWIFT information`, 
        `bank_accounts[${index}].routing`
      );
    }

    if (!account.beneficiary_name) {
      this.addError('missing_beneficiary_name', 
        `Bank account ${index} missing beneficiary name`, 
        `bank_accounts[${index}].beneficiary_name`
      );
    }
  }

  /**
   * Validate tax information
   */
  validateTaxInformation(taxInfo) {
    if (!taxInfo.tax_id && !taxInfo.ssn) {
      this.addWarning('missing_tax_id', 
        'Tax ID or SSN not provided', 
        'tax_information.tax_id'
      );
    }

    if (!taxInfo.tax_country) {
      this.addWarning('missing_tax_country', 
        'Tax country not specified', 
        'tax_information.tax_country'
      );
    }

    if (taxInfo.tax_treaty_benefits && !taxInfo.tax_treaty_country) {
      this.addError('missing_treaty_country', 
        'Tax treaty country not specified for treaty benefits', 
        'tax_information.tax_treaty_country'
      );
    }
  }

  /**
   * Validate minimum payouts
   */
  async validateMinimumPayouts(splitData, paymentData) {
    if (!splitData.splits) return;

    splitData.splits.forEach((split, index) => {
      if (split.minimum_amount !== undefined) {
        // Check if minimum amount is reasonable
        if (split.minimum_amount > 100) {
          this.addWarning('high_minimum_payout', 
            `Split ${index} has high minimum payout ($${split.minimum_amount})`, 
            `splits[${index}].minimum_amount`
          );
        }

        // Check payment frequency implications
        if (paymentData.payment_frequency === 'monthly' && split.minimum_amount > 25) {
          this.addWarning('minimum_vs_frequency', 
            `Split ${index} minimum amount may not be reached with monthly payments`, 
            `splits[${index}].minimum_amount`
          );
        }
      }
    });
  }

  /**
   * Validate tax compliance for payments
   */
  async validateTaxCompliance(splitData, paymentData) {
    // US tax withholding
    const hasUSTerritory = splitData.territories && 
      (splitData.territories.includes('US') || splitData.territories.includes('WW'));

    if (hasUSTerritory && paymentData) {
      this.addInfo('us_tax_withholding', 
        'US payments may be subject to tax withholding', 
        'tax_compliance'
      );

      // W-8/W-9 form requirements
      if (!paymentData.tax_forms || !paymentData.tax_forms.includes('W9') && 
          !paymentData.tax_forms.includes('W8')) {
        this.addWarning('missing_tax_forms', 
          'W-8 or W-9 tax forms may be required for US payments', 
          'tax_forms'
        );
      }
    }

    // International payments
    const hasInternationalParticipants = splitData.splits && 
      splitData.splits.some(split => split.tax_country && split.tax_country !== 'US');

    if (hasInternationalParticipants) {
      this.addInfo('international_tax_implications', 
        'International participants may have additional tax requirements', 
        'international_tax'
      );
    }
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
   * Get validation summary with split analysis
   */
  getSplitValidationSummary(splitData) {
    const result = this.buildValidationResult();
    
    // Add split analysis summary
    result.split_analysis = {
      total_participants: splitData.splits ? splitData.splits.length : 0,
      total_percentage: this.calculateTotalPercentage(splitData),
      majority_control: this.hasMajorityControl(splitData),
      distribution_fairness: this.assessDistributionFairness(splitData),
      legal_compliance_score: this.calculateLegalComplianceScore(splitData)
    };
    
    return result;
  }

  /**
   * Calculate total percentage
   */
  calculateTotalPercentage(splitData) {
    if (!splitData.splits) return 0;
    
    return splitData.splits
      .map(split => split.percentage || 0)
      .reduce((sum, percentage) => sum + percentage, 0);
  }

  /**
   * Check if any participant has majority control
   */
  hasMajorityControl(splitData) {
    if (!splitData.splits) return false;
    
    return splitData.splits.some(split => (split.percentage || 0) > 50);
  }

  /**
   * Assess distribution fairness
   */
  assessDistributionFairness(splitData) {
    if (!splitData.splits || splitData.splits.length < 2) {
      return 'not_applicable';
    }

    const percentages = splitData.splits.map(split => split.percentage || 0);
    const maxPercentage = Math.max(...percentages);
    const minPercentage = Math.min(...percentages);
    const ratio = maxPercentage / minPercentage;

    if (ratio <= 2) return 'very_fair';
    if (ratio <= 5) return 'fair';
    if (ratio <= 10) return 'moderate';
    if (ratio <= 20) return 'unequal';
    return 'very_unequal';
  }

  /**
   * Calculate legal compliance score
   */
  calculateLegalComplianceScore(splitData) {
    let score = 100;
    
    // Territory compliance
    if (!splitData.territories || splitData.territories.length === 0) {
      score -= 20;
    }
    
    // Agreement documentation
    if (!splitData.agreement_type) score -= 15;
    if (!splitData.agreement_date) score -= 10;
    
    // Rights specification
    if (splitData.exclusive === undefined) score -= 10;
    
    // Participant roles
    if (!splitData.splits || !splitData.splits.some(split => split.role)) {
      score -= 15;
    }
    
    // Effective dates
    if (!splitData.effective_date) score -= 10;
    
    return Math.max(0, score);
  }
}

module.exports = SplitsValidator;
