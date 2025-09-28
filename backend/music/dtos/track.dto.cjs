/**
 * Track Data Transfer Objects
 * DTOs for track-related API operations and data transfer
 * Handles validation, transformation, and serialization of track data
 */

class TrackDTO {
    /**
     * Create track request DTO
     */
    static createTrackRequest(data) {
        return {
            title: data.title?.trim(),
            duration: data.duration ? parseInt(data.duration) : null,
            isrc: data.isrc?.trim().toUpperCase(),
            explicit: Boolean(data.explicit),
            genre_primary: data.genre_primary?.trim(),
            genre_secondary: data.genre_secondary?.trim(),
            mood: data.mood?.trim(),
            language: data.language?.trim() || 'en',
            tempo: data.tempo ? parseInt(data.tempo) : null,
            key_signature: data.key_signature?.trim(),
            release_id: data.release_id,
            track_number: data.track_number ? parseInt(data.track_number) : null,
            disc_number: data.disc_number ? parseInt(data.disc_number) : 1,
            preview_start: data.preview_start ? parseInt(data.preview_start) : null,
            preview_length: data.preview_length ? parseInt(data.preview_length) : 30,
            lyrics: data.lyrics?.trim(),
            instrumental: Boolean(data.instrumental),
            created_by: data.created_by
        };
    }

    /**
     * Update track request DTO
     */
    static updateTrackRequest(data) {
        const updateData = {};
        
        if (data.title !== undefined) updateData.title = data.title?.trim();
        if (data.duration !== undefined) updateData.duration = data.duration ? parseInt(data.duration) : null;
        if (data.isrc !== undefined) updateData.isrc = data.isrc?.trim().toUpperCase();
        if (data.explicit !== undefined) updateData.explicit = Boolean(data.explicit);
        if (data.genre_primary !== undefined) updateData.genre_primary = data.genre_primary?.trim();
        if (data.genre_secondary !== undefined) updateData.genre_secondary = data.genre_secondary?.trim();
        if (data.mood !== undefined) updateData.mood = data.mood?.trim();
        if (data.language !== undefined) updateData.language = data.language?.trim();
        if (data.tempo !== undefined) updateData.tempo = data.tempo ? parseInt(data.tempo) : null;
        if (data.key_signature !== undefined) updateData.key_signature = data.key_signature?.trim();
        if (data.track_number !== undefined) updateData.track_number = data.track_number ? parseInt(data.track_number) : null;
        if (data.disc_number !== undefined) updateData.disc_number = data.disc_number ? parseInt(data.disc_number) : 1;
        if (data.preview_start !== undefined) updateData.preview_start = data.preview_start ? parseInt(data.preview_start) : null;
        if (data.preview_length !== undefined) updateData.preview_length = data.preview_length ? parseInt(data.preview_length) : 30;
        if (data.lyrics !== undefined) updateData.lyrics = data.lyrics?.trim();
        if (data.instrumental !== undefined) updateData.instrumental = Boolean(data.instrumental);
        
        updateData.updated_by = data.updated_by;
        updateData.updated_at = new Date();
        
        return updateData;
    }

    /**
     * Track response DTO
     */
    static trackResponse(track) {
        if (!track) return null;

        return {
            id: track.id,
            title: track.title,
            duration: track.duration,
            duration_formatted: track.duration ? this.formatDuration(track.duration) : null,
            isrc: track.isrc,
            explicit: track.explicit,
            genre_primary: track.genre_primary,
            genre_secondary: track.genre_secondary,
            mood: track.mood,
            language: track.language,
            tempo: track.tempo,
            key_signature: track.key_signature,
            release_id: track.release_id,
            track_number: track.track_number,
            disc_number: track.disc_number,
            preview_start: track.preview_start,
            preview_length: track.preview_length,
            instrumental: track.instrumental,
            audio_quality: track.audio_quality,
            file_size: track.file_size,
            file_format: track.file_format,
            sample_rate: track.sample_rate,
            bit_depth: track.bit_depth,
            processing_status: track.processing_status,
            waveform_data: track.waveform_data,
            analysis_data: track.analysis_data,
            lyrics: track.lyrics,
            lyrics_synchronized: track.lyrics_synchronized,
            created_at: track.created_at,
            updated_at: track.updated_at,
            created_by: track.created_by,
            // Related data
            release: track.release ? {
                id: track.release.id,
                title: track.release.title,
                type: track.release.type
            } : null,
            contributors: track.contributors ? track.contributors.map(this.contributorResponse) : [],
            files: track.files ? track.files.map(this.fileResponse) : []
        };
    }

    /**
     * Track list response DTO
     */
    static trackListResponse(tracks, pagination = null) {
        return {
            tracks: tracks.map(track => this.trackResponse(track)),
            pagination: pagination ? {
                current_page: pagination.page,
                per_page: pagination.limit,
                total: pagination.total,
                total_pages: Math.ceil(pagination.total / pagination.limit),
                has_next: pagination.page < Math.ceil(pagination.total / pagination.limit),
                has_prev: pagination.page > 1
            } : null
        };
    }

    /**
     * Track contributor response DTO
     */
    static contributorResponse(contributor) {
        return {
            id: contributor.id,
            name: contributor.name,
            role: contributor.role,
            split_percentage: contributor.split_percentage,
            primary: contributor.primary,
            pro_affiliation: contributor.pro_affiliation,
            ipi_number: contributor.ipi_number
        };
    }

    /**
     * Track file response DTO
     */
    static fileResponse(file) {
        return {
            id: file.id,
            filename: file.filename,
            format: file.format,
            quality: file.quality,
            file_size: file.file_size,
            file_size_formatted: this.formatFileSize(file.file_size),
            sample_rate: file.sample_rate,
            bit_depth: file.bit_depth,
            duration: file.duration,
            created_at: file.created_at,
            download_url: file.download_url
        };
    }

    /**
     * Audio upload request DTO
     */
    static audioUploadRequest(data, file) {
        return {
            track_id: data.track_id,
            file: {
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                buffer: file.buffer
            },
            quality: data.quality || 'high',
            format: data.format || 'wav',
            replace_existing: Boolean(data.replace_existing),
            process_immediately: Boolean(data.process_immediately),
            uploaded_by: data.uploaded_by
        };
    }

    /**
     * Bulk operation request DTO
     */
    static bulkOperationRequest(data) {
        return {
            operation: data.operation,
            track_ids: Array.isArray(data.track_ids) ? data.track_ids : [],
            data: data.data || {},
            options: {
                validate_before_update: Boolean(data.options?.validate_before_update !== false),
                stop_on_error: Boolean(data.options?.stop_on_error !== false),
                send_notifications: Boolean(data.options?.send_notifications !== false),
                update_modified_date: Boolean(data.options?.update_modified_date !== false)
            },
            performed_by: data.performed_by
        };
    }

    /**
     * Track analytics response DTO
     */
    static analyticsResponse(analytics) {
        return {
            track_id: analytics.track_id,
            total_streams: analytics.total_streams,
            total_downloads: analytics.total_downloads,
            revenue: {
                total: analytics.total_revenue,
                streams: analytics.streaming_revenue,
                downloads: analytics.download_revenue,
                sync: analytics.sync_revenue
            },
            platforms: analytics.platforms ? analytics.platforms.map(platform => ({
                name: platform.name,
                streams: platform.streams,
                revenue: platform.revenue,
                last_updated: platform.last_updated
            })) : [],
            territories: analytics.territories || [],
            demographics: analytics.demographics || {},
            trends: analytics.trends || {},
            period: {
                start_date: analytics.start_date,
                end_date: analytics.end_date
            }
        };
    }

    /**
     * Track search response DTO
     */
    static searchResponse(results, query, filters) {
        return {
            query: query,
            filters: filters,
            results: {
                tracks: results.tracks?.map(track => this.trackResponse(track)) || [],
                total: results.total || 0,
                facets: results.facets || {}
            },
            suggestions: results.suggestions || [],
            execution_time: results.execution_time
        };
    }

    /**
     * Format duration in seconds to MM:SS
     */
    static formatDuration(seconds) {
        if (!seconds || seconds <= 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format file size in bytes to human readable
     */
    static formatFileSize(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }

    /**
     * Validate track data
     */
    static validateTrackData(data) {
        const errors = [];

        if (!data.title || data.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (data.title && data.title.length > 255) {
            errors.push('Title must be less than 255 characters');
        }

        if (data.duration && (data.duration < 0 || data.duration > 86400)) {
            errors.push('Duration must be between 0 and 86400 seconds (24 hours)');
        }

        if (data.isrc && !/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(data.isrc)) {
            errors.push('ISRC must be in format: CC-XXX-YY-NNNNN');
        }

        if (data.track_number && (data.track_number < 1 || data.track_number > 999)) {
            errors.push('Track number must be between 1 and 999');
        }

        if (data.disc_number && (data.disc_number < 1 || data.disc_number > 99)) {
            errors.push('Disc number must be between 1 and 99');
        }

        if (data.tempo && (data.tempo < 20 || data.tempo > 300)) {
            errors.push('Tempo must be between 20 and 300 BPM');
        }

        if (data.preview_start && data.duration && data.preview_start >= data.duration) {
            errors.push('Preview start time cannot be greater than track duration');
        }

        if (data.preview_length && (data.preview_length < 10 || data.preview_length > 90)) {
            errors.push('Preview length must be between 10 and 90 seconds');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = TrackDTO;
