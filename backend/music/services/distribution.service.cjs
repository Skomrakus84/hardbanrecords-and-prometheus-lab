// Serwis do dystrybucji muzyki
// Plik: distribution.service.cjs

const { createClient } = require('@supabase/supabase-js');
const logger = require('../config/logger.cjs');
const { validateDistributionChannel } = require('../validators/music.validators.cjs');
const { mapDistributionChannel } = require('../mappers/music.mappers.cjs');

class DistributionService {
    constructor(supabaseClient = null) {
        this.supabase = supabaseClient || createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }

    // Pobierz wszystkie kanały dystrybucji
    async getDistributionChannels(filters = {}) {
        try {
            const { status, platform } = filters;

            let query = this.supabase
                .from('distribution_channels')
                .select('*')
                .order('platform', { ascending: true });

            if (status) {
                query = query.eq('status', status);
            }
            if (platform) {
                query = query.ilike('platform', `%${platform}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data?.map(mapDistributionChannel) || [];
        } catch (error) {
            logger.error('Błąd pobierania kanałów dystrybucji:', error);
            throw new Error(`Nie udało się pobrać kanałów: ${error.message}`);
        }
    }

    // Pobierz kanał dystrybucji po ID
    async getDistributionChannelById(id) {
        try {
            const { data, error } = await this.supabase
                .from('distribution_channels')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Kanał dystrybucji nie został znaleziony');

            return mapDistributionChannel(data);
        } catch (error) {
            logger.error('Błąd pobierania kanału dystrybucji:', error);
            throw new Error(`Nie udało się pobrać kanału: ${error.message}`);
        }
    }

    // Utwórz kanał dystrybucji
    async createDistributionChannel(channelData, userId) {
        try {
            const { error: validationError } = validateDistributionChannel(channelData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            const dbData = {
                platform: channelData.platform,
                platform_id: channelData.platformId,
                revenue_share: channelData.revenueShare || 70,
                minimum_payout: channelData.minimumPayout || 25,
                payment_frequency: channelData.paymentFrequency || 'monthly',
                territories: channelData.territories || [],
                content_requirements: channelData.contentRequirements || {},
                status: channelData.status || 'active',
                created_by: userId
            };

            const { data, error } = await this.supabase
                .from('distribution_channels')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            logger.info('Utworzono kanał dystrybucji:', { channelId: data.id, platform: data.platform });
            return mapDistributionChannel(data);
        } catch (error) {
            logger.error('Błąd tworzenia kanału dystrybucji:', error);
            throw new Error(`Nie udało się utworzyć kanału: ${error.message}`);
        }
    }

    // Aktualizuj kanał dystrybucji
    async updateDistributionChannel(id, updateData, userId) {
        try {
            const dbData = {
                ...updateData,
                updated_at: new Date().toISOString(),
                updated_by: userId
            };

            const { data, error } = await this.supabase
                .from('distribution_channels')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Kanał dystrybucji nie został znaleziony');

            logger.info('Zaktualizowano kanał dystrybucji:', { channelId: id });
            return mapDistributionChannel(data);
        } catch (error) {
            logger.error('Błąd aktualizacji kanału dystrybucji:', error);
            throw new Error(`Nie udało się zaktualizować kanału: ${error.message}`);
        }
    }

    // Usuń kanał dystrybucji
    async deleteDistributionChannel(id, userId) {
        try {
            const { error } = await this.supabase
                .from('distribution_channels')
                .delete()
                .eq('id', id);

            if (error) throw error;

            logger.info('Usunięto kanał dystrybucji:', { channelId: id, userId });
            return { success: true };
        } catch (error) {
            logger.error('Błąd usuwania kanału dystrybucji:', error);
            throw new Error(`Nie udało się usunąć kanału: ${error.message}`);
        }
    }

    // Dystrybuuj wydanie do kanału
    async distributeRelease(releaseId, channelId, userId) {
        try {
            // Sprawdź czy wydanie i kanał istnieją
            const [release, channel] = await Promise.all([
                this.supabase.from('releases').select('*').eq('id', releaseId).single(),
                this.supabase.from('distribution_channels').select('*').eq('id', channelId).single()
            ]);

            if (release.error) throw new Error('Wydanie nie zostało znalezione');
            if (channel.error) throw new Error('Kanał dystrybucji nie został znaleziony');

            // Sprawdź czy wydanie już nie jest dystrybuowane do tego kanału
            const { data: existing } = await this.supabase
                .from('release_distributions')
                .select('id')
                .eq('release_id', releaseId)
                .eq('channel_id', channelId)
                .single();

            if (existing) {
                throw new Error('Wydanie jest już dystrybuowane do tego kanału');
            }

            // Utwórz wpis dystrybucji
            const { data, error } = await this.supabase
                .from('release_distributions')
                .insert([{
                    release_id: releaseId,
                    channel_id: channelId,
                    status: 'pending',
                    submitted_at: new Date().toISOString(),
                    submitted_by: userId
                }])
                .select(`
                    *,
                    release:releases(*),
                    channel:distribution_channels(*)
                `)
                .single();

            if (error) throw error;

            logger.info('Rozpoczęto dystrybucję wydania:', { 
                releaseId, 
                channelId, 
                distributionId: data.id 
            });

            // TODO: Rozpocznij rzeczywisty proces dystrybucji
            await this.processDistribution(data.id);

            return {
                id: data.id,
                releaseId: data.release_id,
                channelId: data.channel_id,
                status: data.status,
                submittedAt: data.submitted_at
            };
        } catch (error) {
            logger.error('Błąd dystrybucji wydania:', error);
            throw new Error(`Nie udało się rozpocząć dystrybucji: ${error.message}`);
        }
    }

    // Pobierz status dystrybucji wydania
    async getReleaseDistributions(releaseId) {
        try {
            const { data, error } = await this.supabase
                .from('release_distributions')
                .select(`
                    *,
                    channel:distribution_channels(*)
                `)
                .eq('release_id', releaseId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;

            return data?.map(dist => ({
                id: dist.id,
                channelId: dist.channel_id,
                platform: dist.channel?.platform,
                status: dist.status,
                submittedAt: dist.submitted_at,
                liveDate: dist.live_date,
                lastSyncDate: dist.last_sync_date,
                errorMessage: dist.error_message
            })) || [];
        } catch (error) {
            logger.error('Błąd pobierania statusu dystrybucji:', error);
            throw new Error(`Nie udało się pobrać statusu: ${error.message}`);
        }
    }

    // Przetwarzaj dystrybucję (placeholder dla rzeczywistej integracji)
    async processDistribution(distributionId) {
        try {
            // Symulacja procesu dystrybucji
            setTimeout(async () => {
                try {
                    await this.supabase
                        .from('release_distributions')
                        .update({
                            status: 'processing',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', distributionId);

                    // Symulacja zakończenia procesu po 30 sekundach
                    setTimeout(async () => {
                        await this.supabase
                            .from('release_distributions')
                            .update({
                                status: 'live',
                                live_date: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', distributionId);

                        logger.info('Dystrybucja zakończona pomyślnie:', { distributionId });
                    }, 30000);

                } catch (error) {
                    logger.error('Błąd podczas przetwarzania dystrybucji:', error);
                    await this.supabase
                        .from('release_distributions')
                        .update({
                            status: 'failed',
                            error_message: error.message,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', distributionId);
                }
            }, 5000);

            return { success: true };
        } catch (error) {
            logger.error('Błąd rozpoczęcia przetwarzania dystrybucji:', error);
            throw new Error(`Nie udało się rozpocząć przetwarzania: ${error.message}`);
        }
    }

    // Pobierz statystyki dystrybucji
    async getDistributionStats() {
        try {
            const { data, error } = await this.supabase
                .from('release_distributions')
                .select('status, channel:distribution_channels(platform)');

            if (error) throw error;

            const stats = {
                totalDistributions: data?.length || 0,
                byStatus: {
                    pending: 0,
                    processing: 0,
                    live: 0,
                    failed: 0
                },
                byPlatform: {}
            };

            data?.forEach(dist => {
                stats.byStatus[dist.status] = (stats.byStatus[dist.status] || 0) + 1;
                
                const platform = dist.channel?.platform || 'unknown';
                stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
            });

            return stats;
        } catch (error) {
            logger.error('Błąd pobierania statystyk dystrybucji:', error);
            throw new Error(`Nie udało się pobrać statystyk: ${error.message}`);
        }
    }

    // Synchronizuj status z platformami zewnętrznymi
    async syncDistributionStatuses() {
        try {
            const { data: distributions } = await this.supabase
                .from('release_distributions')
                .select(`
                    *,
                    channel:distribution_channels(*),
                    release:releases(*)
                `)
                .in('status', ['processing', 'pending']);

            const results = [];

            for (const dist of distributions || []) {
                try {
                    // TODO: Implementacja rzeczywistej synchronizacji z API platform
                    const syncResult = await this.syncWithPlatform(dist);
                    results.push(syncResult);
                } catch (error) {
                    logger.warn(`Błąd synchronizacji dystrybucji ${dist.id}:`, error);
                }
            }

            logger.info('Synchronizacja dystrybucji zakończona:', { 
                synced: results.length 
            });

            return results;
        } catch (error) {
            logger.error('Błąd synchronizacji statusów dystrybucji:', error);
            throw new Error(`Nie udało się zsynchronizować statusów: ${error.message}`);
        }
    }

    // Synchronizacja z konkretną platformą (placeholder)
    async syncWithPlatform(distribution) {
        // TODO: Implementacja integracji z API platform (Spotify, Apple Music, etc.)
        return {
            distributionId: distribution.id,
            platform: distribution.channel.platform,
            previousStatus: distribution.status,
            newStatus: distribution.status,
            synced: true
        };
    }
}

module.exports = DistributionService;
