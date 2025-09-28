/**
 * Royalty Data Transfer Objects
 * DTOs for royalty-related API operations and financial data transfer
 * Handles validation, transformation, and serialization of royalty data
 */

class RoyaltyDTO {
    /**
     * Royalty statement creation request DTO
     */
    static createRoyaltyStatementRequest(data) {
        return {
            platform: data.platform?.trim(),
            report_period_start: new Date(data.report_period_start),
            report_period_end: new Date(data.report_period_end),
            currency: data.currency?.trim().toUpperCase() || 'USD',
            total_streams: data.total_streams ? parseInt(data.total_streams) : 0,
            total_revenue: data.total_revenue ? parseFloat(data.total_revenue) : 0,
            processing_fee: data.processing_fee ? parseFloat(data.processing_fee) : 0,
            exchange_rate: data.exchange_rate ? parseFloat(data.exchange_rate) : 1.0,
            raw_data: data.raw_data || {},
            source_file: data.source_file?.trim(),
            imported_by: data.imported_by,
            status: 'pending_validation'
        };
    }

    /**
     * Royalty statement response DTO
     */
    static royaltyStatementResponse(statement) {
        if (!statement) return null;

        return {
            id: statement.id,
            platform: statement.platform,
            report_period: {
                start: statement.report_period_start,
                end: statement.report_period_end,
                formatted: this.formatReportPeriod(statement.report_period_start, statement.report_period_end)
            },
            currency: statement.currency,
            totals: {
                streams: statement.total_streams,
                revenue: statement.total_revenue,
                revenue_formatted: this.formatCurrency(statement.total_revenue, statement.currency),
                processing_fee: statement.processing_fee,
                net_revenue: statement.total_revenue - (statement.processing_fee || 0),
                net_revenue_formatted: this.formatCurrency(statement.total_revenue - (statement.processing_fee || 0), statement.currency)
            },
            exchange_rate: statement.exchange_rate,
            status: statement.status,
            validation_errors: statement.validation_errors || [],
            source_file: statement.source_file,
            imported_at: statement.created_at,
            imported_by: statement.imported_by,
            processed_at: statement.processed_at,
            // Summary data
            tracks_count: statement.tracks_count || 0,
            releases_count: statement.releases_count || 0,
            territories_count: statement.territories_count || 0
        };
    }

    /**
     * Royalty calculation request DTO
     */
    static royaltyCalculationRequest(data) {
        return {
            statement_id: data.statement_id,
            track_id: data.track_id,
            release_id: data.release_id,
            territory: data.territory?.trim(),
            streams: data.streams ? parseInt(data.streams) : 0,
            downloads: data.downloads ? parseInt(data.downloads) : 0,
            revenue_gross: data.revenue_gross ? parseFloat(data.revenue_gross) : 0,
            revenue_net: data.revenue_net ? parseFloat(data.revenue_net) : 0,
            rate_per_stream: data.rate_per_stream ? parseFloat(data.rate_per_stream) : 0,
            rate_per_download: data.rate_per_download ? parseFloat(data.rate_per_download) : 0,
            usage_type: data.usage_type?.trim() || 'stream',
            calculated_by: data.calculated_by
        };
    }

    /**
     * Royalty calculation response DTO
     */
    static royaltyCalculationResponse(calculation) {
        return {
            id: calculation.id,
            statement_id: calculation.statement_id,
            track: calculation.track ? {
                id: calculation.track.id,
                title: calculation.track.title,
                isrc: calculation.track.isrc
            } : null,
            release: calculation.release ? {
                id: calculation.release.id,
                title: calculation.release.title,
                upc: calculation.release.upc
            } : null,
            territory: calculation.territory,
            usage: {
                streams: calculation.streams,
                downloads: calculation.downloads,
                total_usage: calculation.streams + calculation.downloads
            },
            revenue: {
                gross: calculation.revenue_gross,
                net: calculation.revenue_net,
                gross_formatted: this.formatCurrency(calculation.revenue_gross, calculation.currency),
                net_formatted: this.formatCurrency(calculation.revenue_net, calculation.currency)
            },
            rates: {
                per_stream: calculation.rate_per_stream,
                per_download: calculation.rate_per_download
            },
            splits: calculation.splits ? calculation.splits.map(this.splitResponse) : [],
            usage_type: calculation.usage_type,
            calculated_at: calculation.created_at,
            calculated_by: calculation.calculated_by
        };
    }

    /**
     * Royalty split response DTO
     */
    static splitResponse(split) {
        return {
            id: split.id,
            contributor_name: split.contributor_name,
            role: split.role,
            percentage: split.percentage,
            amount: split.amount,
            amount_formatted: this.formatCurrency(split.amount, split.currency),
            split_type: split.split_type,
            payout_status: split.payout_status,
            payment_method: split.payment_method ? {
                id: split.payment_method.id,
                type: split.payment_method.type,
                details: split.payment_method.masked_details
            } : null
        };
    }

    /**
     * Royalty summary response DTO
     */
    static royaltySummaryResponse(summary, period) {
        return {
            period: {
                start: period.start,
                end: period.end,
                type: period.type
            },
            totals: {
                statements: summary.statements_count,
                revenue: {
                    gross: summary.total_revenue_gross,
                    net: summary.total_revenue_net,
                    gross_formatted: this.formatCurrency(summary.total_revenue_gross, summary.currency),
                    net_formatted: this.formatCurrency(summary.total_revenue_net, summary.currency)
                },
                usage: {
                    streams: summary.total_streams,
                    downloads: summary.total_downloads,
                    total: summary.total_streams + summary.total_downloads
                },
                territories: summary.territories_count,
                tracks: summary.tracks_count
            },
            by_platform: summary.by_platform || [],
            by_territory: summary.by_territory || [],
            by_track: summary.by_track || [],
            trends: {
                revenue_change: summary.revenue_change_percentage,
                streams_change: summary.streams_change_percentage,
                growth_direction: summary.revenue_change_percentage >= 0 ? 'up' : 'down'
            },
            pending_payouts: {
                count: summary.pending_payouts_count,
                total_amount: summary.pending_payouts_amount,
                total_amount_formatted: this.formatCurrency(summary.pending_payouts_amount, summary.currency)
            }
        };
    }

    /**
     * Royalty analytics request DTO
     */
    static analyticsRequest(data) {
        return {
            period_start: new Date(data.period_start),
            period_end: new Date(data.period_end),
            group_by: data.group_by || 'month',
            platforms: Array.isArray(data.platforms) ? data.platforms : [],
            territories: Array.isArray(data.territories) ? data.territories : [],
            tracks: Array.isArray(data.tracks) ? data.tracks : [],
            releases: Array.isArray(data.releases) ? data.releases : [],
            currency: data.currency?.toUpperCase() || 'USD',
            include_projections: Boolean(data.include_projections),
            requested_by: data.requested_by
        };
    }

    /**
     * Royalty analytics response DTO
     */
    static analyticsResponse(analytics) {
        return {
            period: analytics.period,
            filters: analytics.filters,
            summary: {
                total_revenue: analytics.total_revenue,
                total_streams: analytics.total_streams,
                average_rate: analytics.average_rate,
                growth_rate: analytics.growth_rate
            },
            series: analytics.series ? analytics.series.map(point => ({
                date: point.date,
                revenue: point.revenue,
                streams: point.streams,
                rate: point.rate
            })) : [],
            breakdowns: {
                by_platform: analytics.by_platform || [],
                by_territory: analytics.by_territory || [],
                by_track: analytics.by_track || [],
                by_release: analytics.by_release || []
            },
            projections: analytics.projections ? {
                next_month: analytics.projections.next_month,
                next_quarter: analytics.projections.next_quarter,
                confidence: analytics.projections.confidence
            } : null,
            insights: analytics.insights || [],
            generated_at: analytics.generated_at
        };
    }

    /**
     * Bulk import request DTO
     */
    static bulkImportRequest(data, files) {
        return {
            platform: data.platform?.trim(),
            report_period_start: new Date(data.report_period_start),
            report_period_end: new Date(data.report_period_end),
            files: files.map(file => ({
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer
            })),
            options: {
                validate_before_import: Boolean(data.options?.validate_before_import !== false),
                auto_calculate_splits: Boolean(data.options?.auto_calculate_splits !== false),
                skip_duplicates: Boolean(data.options?.skip_duplicates !== false),
                send_notifications: Boolean(data.options?.send_notifications !== false)
            },
            imported_by: data.imported_by
        };
    }

    /**
     * Export request DTO
     */
    static exportRequest(data) {
        return {
            format: data.format || 'csv',
            period_start: new Date(data.period_start),
            period_end: new Date(data.period_end),
            filters: {
                platforms: Array.isArray(data.platforms) ? data.platforms : [],
                territories: Array.isArray(data.territories) ? data.territories : [],
                tracks: Array.isArray(data.tracks) ? data.tracks : [],
                releases: Array.isArray(data.releases) ? data.releases : []
            },
            options: {
                include_raw_data: Boolean(data.include_raw_data),
                include_calculations: Boolean(data.include_calculations !== false),
                include_splits: Boolean(data.include_splits !== false),
                currency: data.currency?.toUpperCase() || 'USD'
            },
            requested_by: data.requested_by
        };
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
     * Format report period
     */
    static formatReportPeriod(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startFormatted = start.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const endFormatted = end.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `${startFormatted} - ${endFormatted}`;
    }

    /**
     * Validate royalty data
     */
    static validateRoyaltyData(data) {
        const errors = [];

        if (!data.platform || data.platform.trim().length === 0) {
            errors.push('Platform is required');
        }

        if (!data.report_period_start) {
            errors.push('Report period start date is required');
        }

        if (!data.report_period_end) {
            errors.push('Report period end date is required');
        }

        if (data.report_period_start && data.report_period_end) {
            const start = new Date(data.report_period_start);
            const end = new Date(data.report_period_end);
            
            if (start >= end) {
                errors.push('Report period start date must be before end date');
            }
        }

        if (data.total_revenue && data.total_revenue < 0) {
            errors.push('Total revenue cannot be negative');
        }

        if (data.total_streams && data.total_streams < 0) {
            errors.push('Total streams cannot be negative');
        }

        if (data.processing_fee && data.processing_fee < 0) {
            errors.push('Processing fee cannot be negative');
        }

        if (data.exchange_rate && data.exchange_rate <= 0) {
            errors.push('Exchange rate must be greater than 0');
        }

        if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
            errors.push('Currency must be a valid 3-letter ISO code');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = RoyaltyDTO;
