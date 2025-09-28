/**
 * Rights Mapper - Data Transformation Layer for Rights Management
 * Handles transformation between database models and API responses for rights and licensing
 * Provides comprehensive mapping with territorial and legal data formatting
 * Implements enterprise-grade data transformation patterns for rights workflows
 */

const logger = require('../config/logger.cjs');

class RightsMapper {
    
    // ========== Database to API Transformations ==========

    /**
     * Transform database rights to API response
     */
    static toApiResponse(dbRights, options = {}) {
        if (!dbRights) return null;

        try {
            const mapped = {
                id: dbRights.id,
                publication_id: dbRights.publication_id,
                right_type: dbRights.right_type,
                territory: dbRights.territory,
                language: dbRights.language,
                license_type: dbRights.license_type,
                exclusive: dbRights.exclusive,
                sublicensing_allowed: dbRights.sublicensing_allowed,
                start_date: dbRights.start_date,
                end_date: dbRights.end_date,
                status: dbRights.status,
                created_at: dbRights.created_at,
                updated_at: dbRights.updated_at
            };

            // Include financial data based on options
            if (options.includeFinancials) {
                mapped.financial_terms = this.mapFinancialTerms(dbRights);
            }

            // Include contract details
            if (options.includeContract && dbRights.contract_details) {
                mapped.contract_details = this.mapContractDetails(dbRights.contract_details);
            }

            // Include compliance data
            if (options.includeCompliance && dbRights.compliance_data) {
                mapped.compliance_data = this.mapComplianceData(dbRights.compliance_data);
            }

            // Include territorial information
            if (options.includeTerritorialInfo) {
                mapped.territorial_info = this.mapTerritorialInfo(dbRights.territory, dbRights.language);
            }

            // Include licensing workflow
            if (options.includeWorkflow && dbRights.workflow_data) {
                mapped.workflow_data = this.mapWorkflowData(dbRights.workflow_data);
            }

            // Include related data if present
            if (options.includePublication && dbRights.publication) {
                mapped.publication = this.mapPublicationSummary(dbRights.publication);
            }

            if (options.includeLicensee && dbRights.licensee) {
                mapped.licensee = this.mapLicensee(dbRights.licensee);
            }

            if (options.includeTransactions && dbRights.transactions) {
                mapped.transactions = Array.isArray(dbRights.transactions) 
                    ? dbRights.transactions.map(transaction => this.mapTransaction(transaction))
                    : [];
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping rights to API response', {
                error: error.message,
                rightsId: dbRights.id
            });
            return null;
        }
    }

    /**
     * Transform multiple rights to API response
     */
    static toApiResponseList(dbRightsList, options = {}) {
        if (!Array.isArray(dbRightsList)) return [];

        return dbRightsList
            .map(rights => this.toApiResponse(rights, options))
            .filter(mapped => mapped !== null);
    }

    /**
     * Transform rights to summary format
     */
    static toSummary(dbRights) {
        if (!dbRights) return null;

        return {
            id: dbRights.id,
            publication_id: dbRights.publication_id,
            right_type: dbRights.right_type,
            territory: dbRights.territory,
            language: dbRights.language,
            license_type: dbRights.license_type,
            exclusive: dbRights.exclusive,
            status: dbRights.status,
            start_date: dbRights.start_date,
            end_date: dbRights.end_date,
            created_at: dbRights.created_at
        };
    }

    /**
     * Transform rights for coverage analysis
     */
    static toCoverageAnalysis(dbRightsList, publicationId) {
        if (!Array.isArray(dbRightsList)) return null;

        const coverageMap = {};
        const rightsTypes = new Set();
        const territories = new Set();
        const languages = new Set();

        dbRightsList.forEach(rights => {
            rightsTypes.add(rights.right_type);
            territories.add(rights.territory);
            languages.add(rights.language);

            const key = `${rights.right_type}_${rights.territory}_${rights.language}`;
            if (!coverageMap[key]) {
                coverageMap[key] = [];
            }
            coverageMap[key].push(this.toSummary(rights));
        });

        return {
            publication_id: publicationId,
            coverage_summary: {
                rights_types: Array.from(rightsTypes),
                territories: Array.from(territories),
                languages: Array.from(languages),
                total_rights: dbRightsList.length
            },
            coverage_map: coverageMap,
            gaps_analysis: this.analyzeCoverageGaps(rightsTypes, territories, languages),
            conflicts_detected: this.detectConflicts(dbRightsList)
        };
    }

    /**
     * Transform rights for contract generation
     */
    static toContractFormat(dbRights) {
        if (!dbRights) return null;

        return {
            contract_id: `RGT-${dbRights.id}`,
            publication_title: dbRights.publication?.title || 'Unknown Publication',
            right_details: {
                type: dbRights.right_type,
                territory: this.formatTerritoryForContract(dbRights.territory),
                language: this.formatLanguageForContract(dbRights.language),
                exclusivity: dbRights.exclusive ? 'Exclusive' : 'Non-exclusive',
                sublicensing: dbRights.sublicensing_allowed ? 'Permitted' : 'Not permitted'
            },
            term: {
                start_date: dbRights.start_date,
                end_date: dbRights.end_date,
                duration: this.calculateDuration(dbRights.start_date, dbRights.end_date)
            },
            financial_terms: this.mapFinancialTerms(dbRights),
            generated_at: new Date().toISOString(),
            status: dbRights.status
        };
    }

    // ========== API to Database Transformations ==========

    /**
     * Transform API create request to database format
     */
    static fromApiCreateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {
                publication_id: apiData.publication_id,
                right_type: apiData.right_type,
                territory: apiData.territory,
                language: apiData.language,
                license_type: apiData.license_type,
                exclusive: apiData.exclusive || false,
                sublicensing_allowed: apiData.sublicensing_allowed || false,
                start_date: apiData.start_date,
                end_date: apiData.end_date || null,
                status: apiData.status || 'pending'
            };

            // Handle financial terms
            if (apiData.royalty_rate !== undefined) {
                mapped.royalty_rate = apiData.royalty_rate;
            }

            if (apiData.advance_amount !== undefined) {
                mapped.advance_amount = apiData.advance_amount;
            }

            if (apiData.minimum_guarantee !== undefined) {
                mapped.minimum_guarantee = apiData.minimum_guarantee;
            }

            if (apiData.currency) {
                mapped.currency = apiData.currency;
            }

            // Handle JSON fields
            if (apiData.contract_details) {
                mapped.contract_details = typeof apiData.contract_details === 'object' 
                    ? JSON.stringify(apiData.contract_details) 
                    : apiData.contract_details;
            }

            if (apiData.compliance_data) {
                mapped.compliance_data = typeof apiData.compliance_data === 'object' 
                    ? JSON.stringify(apiData.compliance_data) 
                    : apiData.compliance_data;
            }

            if (apiData.workflow_data) {
                mapped.workflow_data = typeof apiData.workflow_data === 'object' 
                    ? JSON.stringify(apiData.workflow_data) 
                    : apiData.workflow_data;
            }

            return mapped;

        } catch (error) {
            logger.error('Error mapping API create request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    /**
     * Transform API update request to database format
     */
    static fromApiUpdateRequest(apiData) {
        if (!apiData) return null;

        try {
            const mapped = {};

            // Only include fields that are actually being updated
            const updatableFields = [
                'right_type', 'territory', 'language', 'license_type',
                'exclusive', 'sublicensing_allowed', 'start_date', 'end_date',
                'status', 'royalty_rate', 'advance_amount', 'minimum_guarantee', 'currency'
            ];

            updatableFields.forEach(field => {
                if (apiData[field] !== undefined) {
                    mapped[field] = apiData[field];
                }
            });

            // Handle JSON fields for updates
            if (apiData.contract_details !== undefined) {
                mapped.contract_details = typeof apiData.contract_details === 'object' 
                    ? JSON.stringify(apiData.contract_details) 
                    : apiData.contract_details;
            }

            if (apiData.compliance_data !== undefined) {
                mapped.compliance_data = typeof apiData.compliance_data === 'object' 
                    ? JSON.stringify(apiData.compliance_data) 
                    : apiData.compliance_data;
            }

            if (apiData.workflow_data !== undefined) {
                mapped.workflow_data = typeof apiData.workflow_data === 'object' 
                    ? JSON.stringify(apiData.workflow_data) 
                    : apiData.workflow_data;
            }

            // Add updated timestamp
            mapped.updated_at = new Date().toISOString();

            return mapped;

        } catch (error) {
            logger.error('Error mapping API update request to database format', {
                error: error.message,
                apiData
            });
            return null;
        }
    }

    // ========== Specialized Mapping Methods ==========

    /**
     * Map financial terms
     */
    static mapFinancialTerms(dbRights) {
        if (!dbRights) return null;

        return {
            royalty_rate: dbRights.royalty_rate ? parseFloat(dbRights.royalty_rate) : null,
            advance_amount: dbRights.advance_amount ? parseFloat(dbRights.advance_amount) : null,
            minimum_guarantee: dbRights.minimum_guarantee ? parseFloat(dbRights.minimum_guarantee) : null,
            currency: dbRights.currency || 'USD',
            payment_terms: dbRights.payment_terms || 'Net 30',
            royalty_basis: dbRights.royalty_basis || 'net_receipts'
        };
    }

    /**
     * Map contract details
     */
    static mapContractDetails(contractDetails) {
        if (!contractDetails) return null;

        try {
            const details = typeof contractDetails === 'string' ? JSON.parse(contractDetails) : contractDetails;
            
            return {
                contract_number: details.contract_number,
                signing_date: details.signing_date,
                effective_date: details.effective_date,
                governing_law: details.governing_law || 'United States',
                jurisdiction: details.jurisdiction,
                arbitration_clause: details.arbitration_clause || false,
                renewal_terms: details.renewal_terms,
                termination_conditions: details.termination_conditions || [],
                force_majeure: details.force_majeure || false,
                warranty_clauses: details.warranty_clauses || []
            };

        } catch (error) {
            logger.error('Error mapping contract details', { error: error.message, contractDetails });
            return null;
        }
    }

    /**
     * Map compliance data
     */
    static mapComplianceData(complianceData) {
        if (!complianceData) return null;

        try {
            const data = typeof complianceData === 'string' ? JSON.parse(complianceData) : complianceData;
            
            return {
                legal_review_completed: data.legal_review_completed || false,
                compliance_checklist: data.compliance_checklist || [],
                regulatory_approvals: data.regulatory_approvals || [],
                tax_implications: data.tax_implications || {},
                export_restrictions: data.export_restrictions || [],
                content_restrictions: data.content_restrictions || [],
                territorial_limitations: data.territorial_limitations || [],
                last_compliance_check: data.last_compliance_check,
                compliance_status: data.compliance_status || 'pending'
            };

        } catch (error) {
            logger.error('Error mapping compliance data', { error: error.message, complianceData });
            return null;
        }
    }

    /**
     * Map territorial information
     */
    static mapTerritorialInfo(territory, language) {
        const territoryInfo = this.getTerritoryInfo(territory);
        const languageInfo = this.getLanguageInfo(language);

        return {
            territory: {
                code: territory,
                name: territoryInfo.name,
                region: territoryInfo.region,
                currency: territoryInfo.currency,
                legal_system: territoryInfo.legal_system
            },
            language: {
                code: language,
                name: languageInfo.name,
                native_name: languageInfo.native_name,
                direction: languageInfo.direction || 'ltr'
            },
            market_info: {
                market_size: territoryInfo.market_size,
                digital_adoption: territoryInfo.digital_adoption,
                key_distributors: territoryInfo.key_distributors || []
            }
        };
    }

    /**
     * Map workflow data
     */
    static mapWorkflowData(workflowData) {
        if (!workflowData) return null;

        try {
            const data = typeof workflowData === 'string' ? JSON.parse(workflowData) : workflowData;
            
            return {
                current_stage: data.current_stage || 'draft',
                workflow_steps: data.workflow_steps || [],
                approvals_required: data.approvals_required || [],
                approvals_received: data.approvals_received || [],
                pending_actions: data.pending_actions || [],
                workflow_history: data.workflow_history || [],
                estimated_completion: data.estimated_completion,
                assigned_to: data.assigned_to,
                priority: data.priority || 'medium'
            };

        } catch (error) {
            logger.error('Error mapping workflow data', { error: error.message, workflowData });
            return null;
        }
    }

    /**
     * Map publication summary
     */
    static mapPublicationSummary(publication) {
        if (!publication) return null;

        return {
            id: publication.id,
            title: publication.title,
            publication_type: publication.publication_type,
            language: publication.language,
            status: publication.status
        };
    }

    /**
     * Map licensee information
     */
    static mapLicensee(licensee) {
        if (!licensee) return null;

        return {
            id: licensee.id,
            name: licensee.name,
            type: licensee.type || 'publisher',
            contact_info: {
                email: licensee.email,
                phone: licensee.phone,
                address: licensee.address
            },
            business_info: {
                registration_number: licensee.registration_number,
                tax_id: licensee.tax_id,
                credit_rating: licensee.credit_rating
            }
        };
    }

    /**
     * Map transaction information
     */
    static mapTransaction(transaction) {
        if (!transaction) return null;

        return {
            id: transaction.id,
            type: transaction.type,
            amount: parseFloat(transaction.amount || 0),
            currency: transaction.currency,
            transaction_date: transaction.transaction_date,
            description: transaction.description,
            status: transaction.status || 'pending'
        };
    }

    // ========== Utility and Analysis Methods ==========

    /**
     * Analyze coverage gaps
     */
    static analyzeCoverageGaps(rightsTypes, territories, languages) {
        // This would typically involve complex business logic
        // For now, return a simple analysis structure
        logger.debug('Analyzing coverage gaps', { 
            rightsTypesCount: rightsTypes.size, 
            territoriesCount: territories.size, 
            languagesCount: languages.size 
        });
        
        return {
            missing_territories: [],
            missing_languages: [],
            missing_rights_types: [],
            recommendations: [],
            coverage_stats: {
                rights_types: rightsTypes.size,
                territories: territories.size,
                languages: languages.size
            }
        };
    }

    /**
     * Detect rights conflicts
     */
    static detectConflicts(rightsList) {
        const conflicts = [];
        
        // Simple conflict detection logic
        rightsList.forEach((rights1, index1) => {
            rightsList.forEach((rights2, index2) => {
                if (index1 < index2 && 
                    rights1.right_type === rights2.right_type &&
                    rights1.territory === rights2.territory &&
                    rights1.language === rights2.language &&
                    rights1.exclusive && rights2.exclusive) {
                    
                    conflicts.push({
                        type: 'exclusive_conflict',
                        rights_ids: [rights1.id, rights2.id],
                        description: 'Multiple exclusive rights for same scope'
                    });
                }
            });
        });

        return conflicts;
    }

    /**
     * Calculate duration between dates
     */
    static calculateDuration(startDate, endDate) {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = Math.floor(diffDays / 365);
        const diffMonths = Math.floor((diffDays % 365) / 30);

        return {
            days: diffDays,
            months: diffMonths + (diffYears * 12),
            years: diffYears,
            formatted: `${diffYears} years, ${diffMonths} months`
        };
    }

    /**
     * Format territory for contract
     */
    static formatTerritoryForContract(territory) {
        if (territory === 'WORLD') return 'Worldwide';
        
        const info = this.getTerritoryInfo(territory);
        return info.name || territory;
    }

    /**
     * Format language for contract
     */
    static formatLanguageForContract(language) {
        const info = this.getLanguageInfo(language);
        return info.name || language;
    }

    /**
     * Get territory information
     */
    static getTerritoryInfo(territoryCode) {
        // This would typically come from a comprehensive database
        const territories = {
            'US': { name: 'United States', region: 'North America', currency: 'USD', legal_system: 'Common Law', market_size: 'Large' },
            'GB': { name: 'United Kingdom', region: 'Europe', currency: 'GBP', legal_system: 'Common Law', market_size: 'Large' },
            'DE': { name: 'Germany', region: 'Europe', currency: 'EUR', legal_system: 'Civil Law', market_size: 'Large' },
            'FR': { name: 'France', region: 'Europe', currency: 'EUR', legal_system: 'Civil Law', market_size: 'Large' },
            'CA': { name: 'Canada', region: 'North America', currency: 'CAD', legal_system: 'Common Law', market_size: 'Medium' },
            'AU': { name: 'Australia', region: 'Oceania', currency: 'AUD', legal_system: 'Common Law', market_size: 'Medium' },
            'JP': { name: 'Japan', region: 'Asia', currency: 'JPY', legal_system: 'Civil Law', market_size: 'Large' },
            'PL': { name: 'Poland', region: 'Europe', currency: 'PLN', legal_system: 'Civil Law', market_size: 'Medium' }
        };

        return territories[territoryCode] || { 
            name: territoryCode, 
            region: 'Unknown', 
            currency: 'USD', 
            legal_system: 'Unknown',
            market_size: 'Unknown'
        };
    }

    /**
     * Get language information
     */
    static getLanguageInfo(languageCode) {
        // This would typically come from a comprehensive database
        const languages = {
            'en': { name: 'English', native_name: 'English' },
            'es': { name: 'Spanish', native_name: 'Español' },
            'fr': { name: 'French', native_name: 'Français' },
            'de': { name: 'German', native_name: 'Deutsch' },
            'it': { name: 'Italian', native_name: 'Italiano' },
            'pt': { name: 'Portuguese', native_name: 'Português' },
            'pl': { name: 'Polish', native_name: 'Polski' },
            'ja': { name: 'Japanese', native_name: '日本語' },
            'zh': { name: 'Chinese', native_name: '中文' }
        };

        return languages[languageCode] || { 
            name: languageCode, 
            native_name: languageCode 
        };
    }

    /**
     * Transform for export
     */
    static toExportFormat(dbRights, format = 'json') {
        if (!dbRights) return null;

        const baseData = this.toApiResponse(dbRights, {
            includeFinancials: true,
            includeContract: true,
            includeCompliance: true,
            includeTerritorialInfo: true
        });

        switch (format) {
            case 'contract':
                return this.toContractFormat(dbRights);
            case 'legal':
                return this.toLegalExport(baseData);
            case 'csv':
                return this.toCsvFormat(baseData);
            default:
                return baseData;
        }
    }

    /**
     * Transform to legal export format
     */
    static toLegalExport(rightsData) {
        return {
            rights_summary: {
                id: rightsData.id,
                publication: rightsData.publication_id,
                scope: `${rightsData.right_type} rights for ${rightsData.territory} in ${rightsData.language}`,
                exclusivity: rightsData.exclusive ? 'Exclusive' : 'Non-exclusive',
                term: `${rightsData.start_date} to ${rightsData.end_date || 'indefinite'}`
            },
            legal_details: rightsData.contract_details,
            compliance_status: rightsData.compliance_data,
            territorial_info: rightsData.territorial_info
        };
    }

    /**
     * Transform to CSV format
     */
    static toCsvFormat(rightsData) {
        return {
            id: rightsData.id,
            publication_id: rightsData.publication_id,
            right_type: rightsData.right_type,
            territory: rightsData.territory,
            language: rightsData.language,
            license_type: rightsData.license_type,
            exclusive: rightsData.exclusive ? 'Yes' : 'No',
            sublicensing_allowed: rightsData.sublicensing_allowed ? 'Yes' : 'No',
            start_date: rightsData.start_date,
            end_date: rightsData.end_date || '',
            status: rightsData.status,
            royalty_rate: rightsData.financial_terms?.royalty_rate || '',
            advance_amount: rightsData.financial_terms?.advance_amount || '',
            currency: rightsData.financial_terms?.currency || '',
            created_at: rightsData.created_at,
            updated_at: rightsData.updated_at
        };
    }

    /**
     * Validate mapped data
     */
    static validateMappedData(mappedData, requiredFields = []) {
        if (!mappedData) return false;

        for (const field of requiredFields) {
            if (mappedData[field] === undefined || mappedData[field] === null) {
                logger.warn('Missing required field in mapped rights data', { field, mappedData });
                return false;
            }
        }

        return true;
    }
}

module.exports = RightsMapper;
