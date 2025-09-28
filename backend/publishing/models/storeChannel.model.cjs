const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env.cjs');
const logger = require('../config/logger.cjs');

/**
 * Store Channel Model
 * Manages distribution channels and their configurations
 */
class StoreChannelModel {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        this.tableName = 'store_channels';
    }

    /**
     * Create a new store channel
     * @param {Object} channelData - Channel data
     * @returns {Promise<Object>} Created channel
     */
    async create(channelData) {
        try {
            const {
                channel_name,
                channel_type,
                api_endpoint,
                supported_formats = [],
                supported_countries = [],
                commission_rate,
                minimum_price,
                maximum_price,
                currency = 'USD',
                processing_time_days = 7,
                metadata_requirements = {},
                technical_requirements = {},
                drm_support = [],
                status = 'active'
            } = channelData;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert({
                    channel_name,
                    channel_type,
                    api_endpoint,
                    supported_formats,
                    supported_countries,
                    commission_rate,
                    minimum_price,
                    maximum_price,
                    currency,
                    processing_time_days,
                    metadata_requirements,
                    technical_requirements,
                    drm_support,
                    status
                })
                .select()
                .single();

            if (error) {
                logger.error('Failed to create store channel', {
                    error: error.message,
                    channelData: { channel_name, channel_type, commission_rate }
                });
                throw error;
            }

            logger.info('Store channel created successfully', {
                channelId: data.id,
                channelName: data.channel_name,
                channelType: data.channel_type,
                commissionRate: data.commission_rate
            });

            return data;
        } catch (error) {
            logger.error('Store channel creation error', {
                error: error.message,
                stack: error.stack,
                channelData
            });
            throw error;
        }
    }

    /**
     * Get channel by ID
     * @param {string} id - Channel ID
     * @returns {Promise<Object|null>} Channel data
     */
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch store channel by ID', {
                    error: error.message,
                    channelId: id
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Store channel fetch error', {
                error: error.message,
                channelId: id
            });
            throw error;
        }
    }

    /**
     * Get channel by name
     * @param {string} channelName - Channel name
     * @returns {Promise<Object|null>} Channel data
     */
    async findByName(channelName) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('channel_name', channelName)
                .single();

            if (error && error.code !== 'PGRST116') {
                logger.error('Failed to fetch store channel by name', {
                    error: error.message,
                    channelName
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Store channel fetch by name error', {
                error: error.message,
                channelName
            });
            throw error;
        }
    }

    /**
     * Get all channels with filtering and pagination
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated channels
     */
    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                channelType,
                status = 'active',
                supportedFormat,
                country,
                search
            } = options;

            const offset = (page - 1) * limit;

            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact' });

            if (channelType) {
                if (Array.isArray(channelType)) {
                    query = query.in('channel_type', channelType);
                } else {
                    query = query.eq('channel_type', channelType);
                }
            }

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (supportedFormat) {
                query = query.contains('supported_formats', [supportedFormat]);
            }

            if (country) {
                query = query.contains('supported_countries', [country]);
            }

            if (search) {
                query = query.or(`channel_name.ilike.%${search}%,channel_type.ilike.%${search}%`);
            }

            query = query
                .order('channel_name')
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                logger.error('Failed to fetch store channels', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const totalPages = Math.ceil(count / limit);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            logger.error('Store channels fetch error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Update channel
     * @param {string} id - Channel ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated channel
     */
    async update(id, updateData) {
        try {
            const existingChannel = await this.findById(id);
            if (!existingChannel) {
                throw new Error('Store channel not found');
            }

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                logger.error('Failed to update store channel', {
                    error: error.message,
                    channelId: id,
                    updateData
                });
                throw error;
            }

            logger.info('Store channel updated successfully', {
                channelId: data.id,
                channelName: data.channel_name,
                changes: Object.keys(updateData)
            });

            return data;
        } catch (error) {
            logger.error('Store channel update error', {
                error: error.message,
                channelId: id,
                updateData
            });
            throw error;
        }
    }

    /**
     * Deactivate channel
     * @param {string} id - Channel ID
     * @param {string} reason - Deactivation reason
     * @returns {Promise<Object>} Updated channel
     */
    async deactivate(id, reason = null) {
        try {
            const updateData = {
                status: 'inactive',
                deactivated_at: new Date().toISOString()
            };

            if (reason) {
                updateData.deactivation_reason = reason;
            }

            return await this.update(id, updateData);
        } catch (error) {
            logger.error('Store channel deactivation error', {
                error: error.message,
                channelId: id,
                reason
            });
            throw error;
        }
    }

    /**
     * Get channels by type
     * @param {string} channelType - Channel type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Channels list
     */
    async findByType(channelType, options = {}) {
        try {
            const { status = 'active', includeInactive = false } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('channel_type', channelType);

            if (!includeInactive) {
                query = query.eq('status', status);
            }

            query = query.order('channel_name');

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch channels by type', {
                    error: error.message,
                    channelType,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Channels by type fetch error', {
                error: error.message,
                channelType,
                options
            });
            throw error;
        }
    }

    /**
     * Get compatible channels for publication
     * @param {Object} publicationData - Publication data
     * @returns {Promise<Array>} Compatible channels
     */
    async getCompatibleChannels(publicationData) {
        try {
            const {
                publication_type,
                formats = [],
                target_countries = [],
                drm_type = null,
                price = null
            } = publicationData;

            // Get all active channels
            const { data: allChannels, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('status', 'active');

            if (error) {
                logger.error('Failed to fetch channels for compatibility check', {
                    error: error.message,
                    publicationData
                });
                throw error;
            }

            const compatibleChannels = [];

            for (const channel of allChannels) {
                const compatibility = this.checkChannelCompatibility(
                    channel,
                    publicationData
                );

                if (compatibility.isCompatible) {
                    compatibleChannels.push({
                        ...channel,
                        compatibility_score: compatibility.score,
                        compatibility_notes: compatibility.notes
                    });
                }
            }

            // Sort by compatibility score
            compatibleChannels.sort((a, b) => b.compatibility_score - a.compatibility_score);

            return compatibleChannels;
        } catch (error) {
            logger.error('Compatible channels fetch error', {
                error: error.message,
                publicationData
            });
            throw error;
        }
    }

    /**
     * Get channel statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Channel statistics
     */
    async getStatistics(options = {}) {
        try {
            const { channelType, status } = options;

            let query = this.supabase
                .from(this.tableName)
                .select('channel_type, status, commission_rate, supported_formats, supported_countries');

            if (channelType) {
                query = query.eq('channel_type', channelType);
            }

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch channel statistics', {
                    error: error.message,
                    options
                });
                throw error;
            }

            const stats = {
                total: data.length,
                byType: {},
                byStatus: {},
                avgCommissionRate: 0,
                supportedFormats: new Set(),
                supportedCountries: new Set()
            };

            let totalCommission = 0;
            let commissionCount = 0;

            data.forEach(channel => {
                // By type
                stats.byType[channel.channel_type] = 
                    (stats.byType[channel.channel_type] || 0) + 1;

                // By status
                stats.byStatus[channel.status] = 
                    (stats.byStatus[channel.status] || 0) + 1;

                // Commission rate
                if (channel.commission_rate) {
                    totalCommission += channel.commission_rate;
                    commissionCount++;
                }

                // Supported formats
                if (channel.supported_formats) {
                    channel.supported_formats.forEach(format => 
                        stats.supportedFormats.add(format)
                    );
                }

                // Supported countries
                if (channel.supported_countries) {
                    channel.supported_countries.forEach(country => 
                        stats.supportedCountries.add(country)
                    );
                }
            });

            stats.avgCommissionRate = commissionCount > 0 ? 
                Math.round((totalCommission / commissionCount) * 100) / 100 : 0;

            stats.supportedFormats = Array.from(stats.supportedFormats);
            stats.supportedCountries = Array.from(stats.supportedCountries);

            return stats;
        } catch (error) {
            logger.error('Channel statistics error', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get channels by format support
     * @param {string} format - Format type
     * @returns {Promise<Array>} Supporting channels
     */
    async findByFormatSupport(format) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .contains('supported_formats', [format])
                .eq('status', 'active')
                .order('channel_name');

            if (error) {
                logger.error('Failed to fetch channels by format support', {
                    error: error.message,
                    format
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Channels by format support fetch error', {
                error: error.message,
                format
            });
            throw error;
        }
    }

    /**
     * Get channels by country support
     * @param {string} country - Country code
     * @returns {Promise<Array>} Supporting channels
     */
    async findByCountrySupport(country) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .contains('supported_countries', [country])
                .eq('status', 'active')
                .order('commission_rate');

            if (error) {
                logger.error('Failed to fetch channels by country support', {
                    error: error.message,
                    country
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Channels by country support fetch error', {
                error: error.message,
                country
            });
            throw error;
        }
    }

    /**
     * Bulk update channel configurations
     * @param {Array} updates - Array of update objects
     * @returns {Promise<Object>} Update results
     */
    async bulkUpdate(updates) {
        try {
            const results = {
                updated: 0,
                errors: []
            };

            for (const update of updates) {
                try {
                    const { id, ...updateData } = update;
                    await this.update(id, updateData);
                    results.updated++;
                } catch (error) {
                    results.errors.push({
                        id: update.id,
                        error: error.message
                    });
                }
            }

            logger.info('Channels bulk update completed', {
                total: updates.length,
                updated: results.updated,
                errors: results.errors.length
            });

            return results;
        } catch (error) {
            logger.error('Channels bulk update error', {
                error: error.message,
                updatesCount: updates.length
            });
            throw error;
        }
    }

    /**
     * Helper: Check channel compatibility with publication
     * @param {Object} channel - Channel data
     * @param {Object} publicationData - Publication data
     * @returns {Object} Compatibility result
     */
    checkChannelCompatibility(channel, publicationData) {
        const compatibility = {
            isCompatible: true,
            score: 100,
            notes: []
        };

        const {
            formats = [],
            target_countries = [],
            drm_type = null,
            price = null
        } = publicationData;

        // Check format compatibility
        const supportedFormats = formats.filter(format =>
            channel.supported_formats.includes(format)
        );

        if (supportedFormats.length === 0) {
            compatibility.isCompatible = false;
            compatibility.score -= 50;
            compatibility.notes.push('No supported formats');
        } else if (supportedFormats.length < formats.length) {
            compatibility.score -= 20;
            compatibility.notes.push('Partial format support');
        }

        // Check country compatibility
        if (target_countries.length > 0) {
            const supportedCountries = target_countries.filter(country =>
                channel.supported_countries.includes(country)
            );

            if (supportedCountries.length === 0) {
                compatibility.isCompatible = false;
                compatibility.score -= 30;
                compatibility.notes.push('No supported countries');
            } else if (supportedCountries.length < target_countries.length) {
                compatibility.score -= 15;
                compatibility.notes.push('Partial country support');
            }
        }

        // Check DRM compatibility
        if (drm_type && !channel.drm_support.includes(drm_type)) {
            compatibility.score -= 10;
            compatibility.notes.push('DRM not supported');
        }

        // Check price compatibility
        if (price) {
            if (channel.minimum_price && price < channel.minimum_price) {
                compatibility.isCompatible = false;
                compatibility.score -= 25;
                compatibility.notes.push(`Price below minimum (${channel.minimum_price})`);
            }

            if (channel.maximum_price && price > channel.maximum_price) {
                compatibility.isCompatible = false;
                compatibility.score -= 25;
                compatibility.notes.push(`Price above maximum (${channel.maximum_price})`);
            }
        }

        // Bonus for low commission
        if (channel.commission_rate < 15) {
            compatibility.score += 5;
            compatibility.notes.push('Low commission rate');
        }

        // Bonus for fast processing
        if (channel.processing_time_days <= 3) {
            compatibility.score += 5;
            compatibility.notes.push('Fast processing');
        }

        compatibility.score = Math.max(0, Math.min(100, compatibility.score));

        return compatibility;
    }

    /**
     * Get recommended channels for publication type
     * @param {string} publicationType - Publication type
     * @param {Object} options - Options
     * @returns {Promise<Array>} Recommended channels
     */
    async getRecommendedChannels(publicationType, options = {}) {
        try {
            const { limit = 10, country = null } = options;

            const recommendations = {
                'ebook': [
                    'amazon_kdp',
                    'apple_books',
                    'google_play_books',
                    'kobo',
                    'barnes_noble'
                ],
                'audiobook': [
                    'audible',
                    'libro_fm',
                    'google_play_books',
                    'apple_books',
                    'storytel'
                ],
                'print': [
                    'amazon_kdp_print',
                    'ingram_spark',
                    'barnes_noble_press',
                    'lulu',
                    'blurb'
                ]
            };

            const recommendedNames = recommendations[publicationType] || [];

            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .in('channel_name', recommendedNames)
                .eq('status', 'active');

            if (country) {
                query = query.contains('supported_countries', [country]);
            }

            query = query
                .order('commission_rate')
                .limit(limit);

            const { data, error } = await query;

            if (error) {
                logger.error('Failed to fetch recommended channels', {
                    error: error.message,
                    publicationType,
                    options
                });
                throw error;
            }

            return data;
        } catch (error) {
            logger.error('Recommended channels fetch error', {
                error: error.message,
                publicationType,
                options
            });
            throw error;
        }
    }
}

module.exports = StoreChannelModel;
