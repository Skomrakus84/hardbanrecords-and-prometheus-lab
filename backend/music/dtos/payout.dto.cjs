/**
 * Payout Data Transfer Objects
 * DTOs for payout-related API operations and payment data transfer
 * Handles validation, transformation, and serialization of payout data
 */

class PayoutDTO {
    /**
     * Payout request creation DTO
     */
    static createPayoutRequest(data) {
        return {
            recipient_id: data.recipient_id,
            amount: data.amount ? parseFloat(data.amount) : 0,
            currency: data.currency?.trim().toUpperCase() || 'USD',
            payment_method_id: data.payment_method_id,
            payout_type: data.payout_type?.trim() || 'manual',
            description: data.description?.trim(),
            reference_id: data.reference_id?.trim(),
            scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : null,
            priority: data.priority?.trim() || 'normal',
            metadata: data.metadata || {},
            requested_by: data.requested_by
        };
    }

    /**
     * Payout response DTO
     */
    static payoutResponse(payout) {
        if (!payout) return null;

        return {
            id: payout.id,
            recipient: payout.recipient ? {
                id: payout.recipient.id,
                name: payout.recipient.name,
                email: payout.recipient.email,
                type: payout.recipient.type
            } : null,
            amount: {
                gross: payout.amount,
                fees: payout.processing_fee || 0,
                net: payout.amount - (payout.processing_fee || 0),
                gross_formatted: this.formatCurrency(payout.amount, payout.currency),
                fees_formatted: this.formatCurrency(payout.processing_fee || 0, payout.currency),
                net_formatted: this.formatCurrency(payout.amount - (payout.processing_fee || 0), payout.currency)
            },
            currency: payout.currency,
            payment_method: payout.payment_method ? {
                id: payout.payment_method.id,
                type: payout.payment_method.type,
                provider: payout.payment_method.provider,
                details: payout.payment_method.masked_details,
                verified: payout.payment_method.verified
            } : null,
            status: payout.status,
            payout_type: payout.payout_type,
            description: payout.description,
            reference_id: payout.reference_id,
            transaction_id: payout.transaction_id,
            scheduled_for: payout.scheduled_for,
            processed_at: payout.processed_at,
            priority: payout.priority,
            metadata: payout.metadata || {},
            error_message: payout.error_message,
            retry_count: payout.retry_count || 0,
            created_at: payout.created_at,
            updated_at: payout.updated_at,
            requested_by: payout.requested_by,
            processed_by: payout.processed_by,
            // Related data
            royalty_calculations: payout.royalty_calculations ? payout.royalty_calculations.map(this.royaltyCalculationSummary) : [],
            audit_log: payout.audit_log ? payout.audit_log.map(this.auditLogEntry) : []
        };
    }

    /**
     * Payout list response DTO
     */
    static payoutListResponse(payouts, pagination = null, summary = null) {
        return {
            payouts: payouts.map(payout => this.payoutResponse(payout)),
            pagination: pagination ? {
                current_page: pagination.page,
                per_page: pagination.limit,
                total: pagination.total,
                total_pages: Math.ceil(pagination.total / pagination.limit),
                has_next: pagination.page < Math.ceil(pagination.total / pagination.limit),
                has_prev: pagination.page > 1
            } : null,
            summary: summary ? {
                total_amount: summary.total_amount,
                total_amount_formatted: this.formatCurrency(summary.total_amount, summary.currency),
                by_status: summary.by_status || {},
                by_method: summary.by_method || {},
                by_currency: summary.by_currency || {}
            } : null
        };
    }

    /**
     * Payment method creation request DTO
     */
    static createPaymentMethodRequest(data) {
        return {
            user_id: data.user_id,
            type: data.type?.trim().toLowerCase(),
            provider: data.provider?.trim().toLowerCase(),
            details: this.sanitizePaymentDetails(data.details, data.type),
            is_default: Boolean(data.is_default),
            metadata: data.metadata || {},
            created_by: data.created_by
        };
    }

    /**
     * Payment method response DTO
     */
    static paymentMethodResponse(method) {
        if (!method) return null;

        return {
            id: method.id,
            type: method.type,
            provider: method.provider,
            details: method.masked_details || this.maskPaymentDetails(method.details, method.type),
            is_default: method.is_default,
            verified: method.verified,
            verification_status: method.verification_status,
            last_used_at: method.last_used_at,
            created_at: method.created_at,
            updated_at: method.updated_at,
            metadata: method.metadata || {}
        };
    }

    /**
     * Recurring payout schedule request DTO
     */
    static createRecurringScheduleRequest(data) {
        return {
            name: data.name?.trim(),
            recipient_id: data.recipient_id,
            payment_method_id: data.payment_method_id,
            frequency: data.frequency?.trim() || 'monthly',
            amount_type: data.amount_type?.trim() || 'available_balance',
            fixed_amount: data.fixed_amount ? parseFloat(data.fixed_amount) : null,
            minimum_amount: data.minimum_amount ? parseFloat(data.minimum_amount) : 0,
            currency: data.currency?.trim().toUpperCase() || 'USD',
            start_date: new Date(data.start_date),
            end_date: data.end_date ? new Date(data.end_date) : null,
            day_of_month: data.day_of_month ? parseInt(data.day_of_month) : 1,
            active: Boolean(data.active !== false),
            metadata: data.metadata || {},
            created_by: data.created_by
        };
    }

    /**
     * Recurring payout schedule response DTO
     */
    static recurringScheduleResponse(schedule) {
        return {
            id: schedule.id,
            name: schedule.name,
            recipient: schedule.recipient ? {
                id: schedule.recipient.id,
                name: schedule.recipient.name,
                email: schedule.recipient.email
            } : null,
            payment_method: schedule.payment_method ? {
                id: schedule.payment_method.id,
                type: schedule.payment_method.type,
                provider: schedule.payment_method.provider
            } : null,
            frequency: schedule.frequency,
            amount_configuration: {
                type: schedule.amount_type,
                fixed_amount: schedule.fixed_amount,
                minimum_amount: schedule.minimum_amount,
                fixed_amount_formatted: schedule.fixed_amount ? this.formatCurrency(schedule.fixed_amount, schedule.currency) : null,
                minimum_amount_formatted: this.formatCurrency(schedule.minimum_amount, schedule.currency)
            },
            currency: schedule.currency,
            schedule: {
                start_date: schedule.start_date,
                end_date: schedule.end_date,
                next_run: schedule.next_run,
                day_of_month: schedule.day_of_month
            },
            status: {
                active: schedule.active,
                last_run: schedule.last_run,
                total_runs: schedule.total_runs,
                successful_runs: schedule.successful_runs,
                failed_runs: schedule.failed_runs
            },
            metadata: schedule.metadata || {},
            created_at: schedule.created_at,
            updated_at: schedule.updated_at,
            created_by: schedule.created_by
        };
    }

    /**
     * Payout analytics request DTO
     */
    static analyticsRequest(data) {
        return {
            period_start: new Date(data.period_start),
            period_end: new Date(data.period_end),
            group_by: data.group_by || 'month',
            recipients: Array.isArray(data.recipients) ? data.recipients : [],
            payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
            currencies: Array.isArray(data.currencies) ? data.currencies : [],
            statuses: Array.isArray(data.statuses) ? data.statuses : [],
            include_fees: Boolean(data.include_fees !== false),
            requested_by: data.requested_by
        };
    }

    /**
     * Payout analytics response DTO
     */
    static analyticsResponse(analytics) {
        return {
            period: analytics.period,
            filters: analytics.filters,
            summary: {
                total_payouts: analytics.total_payouts,
                total_amount: analytics.total_amount,
                total_fees: analytics.total_fees,
                success_rate: analytics.success_rate,
                average_amount: analytics.average_amount,
                total_amount_formatted: this.formatCurrency(analytics.total_amount, analytics.currency),
                total_fees_formatted: this.formatCurrency(analytics.total_fees, analytics.currency),
                average_amount_formatted: this.formatCurrency(analytics.average_amount, analytics.currency)
            },
            series: analytics.series ? analytics.series.map(point => ({
                date: point.date,
                count: point.count,
                amount: point.amount,
                fees: point.fees,
                success_rate: point.success_rate
            })) : [],
            breakdowns: {
                by_status: analytics.by_status || [],
                by_method: analytics.by_method || [],
                by_recipient: analytics.by_recipient || [],
                by_currency: analytics.by_currency || []
            },
            trends: {
                amount_change: analytics.amount_change_percentage,
                volume_change: analytics.volume_change_percentage,
                efficiency_change: analytics.efficiency_change_percentage
            },
            generated_at: analytics.generated_at
        };
    }

    /**
     * Bulk payout request DTO
     */
    static bulkPayoutRequest(data) {
        return {
            payouts: data.payouts.map(payout => ({
                recipient_id: payout.recipient_id,
                amount: parseFloat(payout.amount),
                currency: payout.currency?.toUpperCase() || 'USD',
                payment_method_id: payout.payment_method_id,
                description: payout.description?.trim(),
                reference_id: payout.reference_id?.trim(),
                metadata: payout.metadata || {}
            })),
            options: {
                process_immediately: Boolean(data.options?.process_immediately),
                stop_on_error: Boolean(data.options?.stop_on_error !== false),
                send_notifications: Boolean(data.options?.send_notifications !== false),
                validate_before_processing: Boolean(data.options?.validate_before_processing !== false)
            },
            scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : null,
            requested_by: data.requested_by
        };
    }

    /**
     * Royalty calculation summary for payout
     */
    static royaltyCalculationSummary(calculation) {
        return {
            id: calculation.id,
            statement_id: calculation.statement_id,
            track_title: calculation.track?.title,
            territory: calculation.territory,
            amount: calculation.amount,
            amount_formatted: this.formatCurrency(calculation.amount, calculation.currency),
            period: calculation.period
        };
    }

    /**
     * Audit log entry for payout
     */
    static auditLogEntry(entry) {
        return {
            id: entry.id,
            action: entry.action,
            previous_status: entry.previous_status,
            new_status: entry.new_status,
            details: entry.details,
            performed_by: entry.performed_by,
            performed_at: entry.created_at
        };
    }

    /**
     * Sanitize payment details based on type
     */
    static sanitizePaymentDetails(details, type) {
        const sanitized = { ...details };

        switch (type) {
            case 'bank_account':
                return {
                    account_number: sanitized.account_number,
                    routing_number: sanitized.routing_number,
                    account_holder_name: sanitized.account_holder_name,
                    bank_name: sanitized.bank_name,
                    account_type: sanitized.account_type
                };
            case 'paypal':
                return {
                    email: sanitized.email
                };
            case 'stripe':
                return {
                    account_id: sanitized.account_id
                };
            case 'wise':
                return {
                    email: sanitized.email,
                    profile_id: sanitized.profile_id
                };
            default:
                return sanitized;
        }
    }

    /**
     * Mask sensitive payment details
     */
    static maskPaymentDetails(details, type) {
        if (!details) return {};

        const masked = { ...details };

        switch (type) {
            case 'bank_account':
                if (masked.account_number) {
                    masked.account_number = '****' + masked.account_number.slice(-4);
                }
                break;
            case 'paypal':
            case 'wise':
                if (masked.email) {
                    const [local, domain] = masked.email.split('@');
                    masked.email = local.charAt(0) + '***@' + domain;
                }
                break;
        }

        return masked;
    }

    /**
     * Format currency amount
     */
    static formatCurrency(amount, currency = 'USD') {
        if (!amount && amount !== 0) return null;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Validate payout data
     */
    static validatePayoutData(data) {
        const errors = [];

        if (!data.recipient_id) {
            errors.push('Recipient ID is required');
        }

        if (!data.amount || data.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }

        if (data.amount && data.amount > 1000000) {
            errors.push('Amount cannot exceed $1,000,000');
        }

        if (!data.payment_method_id) {
            errors.push('Payment method ID is required');
        }

        if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
            errors.push('Currency must be a valid 3-letter ISO code');
        }

        if (data.scheduled_for) {
            const scheduledDate = new Date(data.scheduled_for);
            const now = new Date();
            
            if (scheduledDate <= now) {
                errors.push('Scheduled date must be in the future');
            }
        }

        if (data.priority && !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
            errors.push('Priority must be one of: low, normal, high, urgent');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate payment method data
     */
    static validatePaymentMethodData(data) {
        const errors = [];

        if (!data.type) {
            errors.push('Payment method type is required');
        }

        if (!data.provider) {
            errors.push('Payment provider is required');
        }

        if (!data.details || Object.keys(data.details).length === 0) {
            errors.push('Payment details are required');
        }

        // Type-specific validation
        switch (data.type) {
            case 'bank_account':
                if (!data.details.account_number) {
                    errors.push('Account number is required for bank accounts');
                }
                if (!data.details.routing_number) {
                    errors.push('Routing number is required for bank accounts');
                }
                if (!data.details.account_holder_name) {
                    errors.push('Account holder name is required for bank accounts');
                }
                break;
            case 'paypal':
            case 'wise':
                if (!data.details.email) {
                    errors.push('Email is required for this payment method');
                }
                if (data.details.email && !/\S+@\S+\.\S+/.test(data.details.email)) {
                    errors.push('Valid email address is required');
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = PayoutDTO;
