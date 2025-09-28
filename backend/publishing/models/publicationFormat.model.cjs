const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Publication Format Model
 * Manages different file formats for publications (EPUB, PDF, MOBI, etc.)
 */
class PublicationFormatModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'publication_formats';
    }

    /**
     * Create a new publication format
     * @param {Object} formatData - Format data
     * @returns {Promise<Object>} Created format
     */
    async create(formatData) {
        try {
            const {
                publication_id,
                format_type,
                file_url,
                file_size,
                file_hash,
                quality_settings,
                conversion_status = 'pending'
            } = formatData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    publication_id,
                    format_type,
                    file_url,
                    file_size,
                    file_hash,
                    quality_settings,
                    conversion_status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create publication format', {
                    error: error.message,
                    formatData: { publication_id, format_type, conversion_status }
                });
                throw error;
            }

            logger.publication.formatConverted(
                data.publication_id,
                'source',
                data.format_type,
                data.conversion_status,
                {
                    formatId: data.id,
                    fileSize: data.file_size
                }
            );

            return data;
        } catch (error) {
            logger.error('Publication format creation error', {
                error: error.message,
                stack: error.stack,
                formatData
            });
            throw error;
        }
    }

    /**
     * Get format by ID
     * @param {string} id - Format ID
     * @returns {Promise<Object|null>} Format data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type)
                `)
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch format by ID', {
                    error: error.message,
                    formatId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Format fetch error', {
                error: error.message,
                formatId: id
            });
            throw error;
        }
    }

    /**
     * Get formats by publication ID
     * @param {string} publicationId - Publication ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Formats list
     */
    async findByPublicationId(publicationId, options = {}) {
        try {
            const { 
                formatType, 
                conversionStatus, 
                includeErrorLogs = false 
            } = options;

            let selectFields = includeErrorLogs ? '*' : 'id, format_type, file_url, file_size, file_hash, quality_settings, conversion_status, created_at, updated_at';

            let query = this.supabase
                .from(this.tableName)
                .select(selectFields)
                .eq('publication_id', publicationId);

            if (formatType) {
                if (Array.isArray(formatType)) {
                    query = query.in('format_type', formatType);
                } else {
                    query = query.eq('format_type', formatType);
                }
            }

            if (conversionStatus) {
                if (Array.isArray(conversionStatus)) {
                    query = query.in('conversion_status', conversionStatus);
                } else {
                    query = query.eq('conversion_status', conversionStatus);
                }
            }

            query = query.order('created_at');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch formats by publication ID', {
                    error: error.message,
                    publicationId,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Formats fetch by publication error', {
                error: error.message,
                publicationId,
                options
            });
            throw error;
        }
    }

    /**
     * Update format
     * @param {string} id - Format ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated format
     */
    async update(id, updateData) {
        try {
            const oldFormat = await this.findById(id);
            if (!oldFormat) {
                throw new Error('Format not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update format', {
                    error: error.message,
                    formatId: id,
                    updateData
                });
                throw error;
            }

            // Log conversion status changes
            if (updateData.conversion_status && updateData.conversion_status !== oldFormat.conversion_status) {
                logger.publication.formatConverted(
                    data.publication_id,
                    'source',
                    data.format_type,
                    data.conversion_status,
                    {
                        formatId: data.id,
                        previousStatus: oldFormat.conversion_status
                    }
                );
            }

            return data;
        } catch (error) {
            logger.error('Format update error', {
                error: error.message,
                formatId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Update conversion status
     * @param {string} id - Format ID
     * @param {string} status - New conversion status
     * @param {string} errorMessage - Error message if failed
     * @returns {Promise<Object>} Updated format
     */
    async updateConversionStatus(id, status, errorMessage = null) {
        try {
            const updateData = {
                conversion_status: status
            };

            if (status === 'failed' && errorMessage) {
                updateData.error_log = errorMessage;
            } else if (status === 'completed') {
                updateData.error_log = null;
            }

            return await this.update(id, updateData);
        } catch (error) {
            logger.error('Conversion status update error', {
                error: error.message,
                formatId: id,
                status,
                errorMessage
            });
            throw error;
        }
    }

    /**
     * Delete format
     * @param {string} id - Format ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        try {
            const format = await this.findById(id);
            if (!format) {
                throw new Error('Format not found');
            }

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                logger.error('Failed to delete format', {
                    error: error.message,
                    formatId: id
                });
                throw error;
            }

            logger.info('Publication format deleted', {
                formatId: id,
                publicationId: format.publication_id,
                formatType: format.format_type
            });

            return true;
        } catch (error) {
            logger.error('Format deletion error', {
                error: error.message,
                formatId: id
            });
            throw error;
        }
    }

    /**
     * Get available formats for a publication
     * @param {string} publicationId - Publication ID
     * @returns {Promise<Object>} Available formats summary
     */
    async getAvailableFormats(publicationId) {
        try {
            const formats = await this.findByPublicationId(publicationId);

            const summary = {
                total: formats.length,
                completed: formats.filter(f => f.conversion_status === 'completed').length,
                pending: formats.filter(f => f.conversion_status === 'pending').length,
                processing: formats.filter(f => f.conversion_status === 'processing').length,
                failed: formats.filter(f => f.conversion_status === 'failed').length,
                formats: {}
            };

            // Group by format type
            formats.forEach(format => {
                if (!summary.formats[format.format_type]) {
                    summary.formats[format.format_type] = {
                        status: format.conversion_status,
                        file_size: format.file_size,
                        file_url: format.conversion_status === 'completed' ? format.file_url : null,
                        created_at: format.created_at,
                        updated_at: format.updated_at
                    };
                }
            });

            return summary;
        } catch (error) {
            logger.error('Available formats fetch error', {
                error: error.message,
                publicationId
            });
            throw error;
        }
    }

    /**
     * Check if format exists for publication
     * @param {string} publicationId - Publication ID
     * @param {string} formatType - Format type
     * @returns {Promise<Object|null>} Existing format or null
     */
    async findExistingFormat(publicationId, formatType) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('publication_id', publicationId)
                .eq('format_type', formatType)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to check existing format', {
                    error: error.message,
                    publicationId,
                    formatType
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Existing format check error', {
                error: error.message,
                publicationId,
                formatType
            });
            throw error;
        }
    }

    /**
     * Get formats by status
     * @param {string} status - Conversion status
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Formats list
     */
    async findByStatus(status, options = {}) {
        try {
            const { limit = 50, formatType } = options;

            let query = this.supabase
                .from(this.tableName)
                .select(`
                    *,
                    publications(title, publication_type, author_id)
                `)
                .eq('conversion_status', status);

            if (formatType) {
                query = query.eq('format_type', formatType);
            }

            query = query
                .order('created_at')
                .limit(limit);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch formats by status', {
                    error: error.message,
                    status,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Formats by status fetch error', {
                error: error.message,
                status,
                options
            });
            throw error;
        }
    }

    /**
     * Get conversion statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Conversion statistics
     */
    async getConversionStats(options = {}) {
        try {
            const { startDate, endDate, formatType } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('conversion_status, format_type, created_at');

            if (startDate) {
                query = query.gte('created_at', startDate);
            }

            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            if (formatType) {
                query = query.eq('format_type', formatType);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch conversion stats', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const stats = {
                total: data.length,
                byStatus: {},
                byFormat: {},
                successRate: 0
            };

            data.forEach(format => {
                // By status
                stats.byStatus[format.conversion_status] = 
                    (stats.byStatus[format.conversion_status] || 0) + 1;

                // By format type
                stats.byFormat[format.format_type] = 
                    (stats.byFormat[format.format_type] || 0) + 1;
            });

            // Calculate success rate
            const completed = stats.byStatus.completed || 0;
            const failed = stats.byStatus.failed || 0;
            const total = completed + failed;
            stats.successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return stats;
        } catch (error) {
            logger.error('Conversion stats error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Cleanup failed conversions
     * @param {number} daysOld - Delete failed conversions older than this many days
     * @returns {Promise<number>} Number of deleted records
     */
    async cleanupFailedConversions(daysOld = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const { data, error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('conversion_status', 'failed')
                .lt('created_at', cutoffDate.toISOString())
                .select('id');

            if (error) {
                logger.error('Failed to cleanup failed conversions', {
                    error: error.message,
                    daysOld,
                    cutoffDate
                });
                throw error;
            }

            const deletedCount = data.length;

            logger.info('Failed conversions cleaned up', {
                deletedCount,
                daysOld,
                cutoffDate
            });

            return deletedCount;
        } catch (error) {
            logger.error('Cleanup failed conversions error', {
                error: error.message,
                daysOld
            });
            throw error;
        }
    }
}

module.exports = PublicationFormatModel;
