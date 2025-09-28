// Serwis dla utworów
// Plik: track.service.cjs

const { createClient } = require('@supabase/supabase-js');
const logger = require('../config/logger.cjs');
const { validateTrack, validateTrackUpdate, validateTrackContributor } = require('../validators/music.validators.cjs');
const { mapTrack, mapTrackContributor, transformTrackToDb } = require('../mappers/music.mappers.cjs');

class TrackService {
    constructor(supabaseClient = null) {
        this.supabase = supabaseClient || createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }

    // Pobierz wszystkie utwory
    async getAllTracks(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 20, search, releaseId, status } = { ...filters, ...pagination };
            const offset = (page - 1) * limit;

            let query = this.supabase
                .from('tracks')
                .select(`
                    *,
                    release:releases(*),
                    contributors:track_contributors(*, artist:artists(*))
                `)
                .range(offset, offset + limit - 1)
                .order('track_number', { ascending: true });

            // Filtry
            if (search) {
                query = query.ilike('title', `%${search}%`);
            }
            if (releaseId) {
                query = query.eq('release_id', releaseId);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                tracks: data?.map(mapTrack) || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            };
        } catch (error) {
            logger.error('Błąd pobierania utworów:', error);
            throw new Error(`Nie udało się pobrać utworów: ${error.message}`);
        }
    }

    // Pobierz utwór po ID
    async getTrackById(id) {
        try {
            const { data, error } = await this.supabase
                .from('tracks')
                .select(`
                    *,
                    release:releases(*),
                    contributors:track_contributors(*, artist:artists(*)),
                    royalty_splits(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Utwór nie został znaleziony');

            return mapTrack(data);
        } catch (error) {
            logger.error('Błąd pobierania utworu:', error);
            throw new Error(`Nie udało się pobrać utworu: ${error.message}`);
        }
    }

    // Utwórz nowy utwór
    async createTrack(trackData, userId) {
        try {
            const { error: validationError } = validateTrack(trackData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            // Sprawdź czy numer utworu nie jest zajęty w tym wydaniu
            const { data: existingTrack } = await this.supabase
                .from('tracks')
                .select('id')
                .eq('release_id', trackData.releaseId)
                .eq('track_number', trackData.trackNumber)
                .single();

            if (existingTrack) {
                throw new Error(`Numer utworu ${trackData.trackNumber} jest już zajęty w tym wydaniu`);
            }

            const dbData = transformTrackToDb(trackData);
            dbData.created_by = userId;

            const { data, error } = await this.supabase
                .from('tracks')
                .insert([dbData])
                .select(`
                    *,
                    release:releases(*)
                `)
                .single();

            if (error) throw error;

            logger.info('Utworzono nowy utwór:', { trackId: data.id, title: data.title });
            return mapTrack(data);
        } catch (error) {
            logger.error('Błąd tworzenia utworu:', error);
            throw new Error(`Nie udało się utworzyć utworu: ${error.message}`);
        }
    }

    // Aktualizuj utwór
    async updateTrack(id, updateData, userId) {
        try {
            const { error: validationError } = validateTrackUpdate(updateData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            // Sprawdź czy numer utworu nie jest zajęty (jeśli jest aktualizowany)
            if (updateData.trackNumber) {
                const currentTrack = await this.getTrackById(id);
                if (currentTrack.trackNumber !== updateData.trackNumber) {
                    const { data: existingTrack } = await this.supabase
                        .from('tracks')
                        .select('id')
                        .eq('release_id', currentTrack.releaseId)
                        .eq('track_number', updateData.trackNumber)
                        .neq('id', id)
                        .single();

                    if (existingTrack) {
                        throw new Error(`Numer utworu ${updateData.trackNumber} jest już zajęty w tym wydaniu`);
                    }
                }
            }

            const dbData = transformTrackToDb(updateData);
            dbData.updated_at = new Date().toISOString();
            dbData.updated_by = userId;

            const { data, error } = await this.supabase
                .from('tracks')
                .update(dbData)
                .eq('id', id)
                .select(`
                    *,
                    release:releases(*)
                `)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Utwór nie został znaleziony');

            logger.info('Zaktualizowano utwór:', { trackId: id });
            return mapTrack(data);
        } catch (error) {
            logger.error('Błąd aktualizacji utworu:', error);
            throw new Error(`Nie udało się zaktualizować utworu: ${error.message}`);
        }
    }

    // Usuń utwór
    async deleteTrack(id, userId) {
        try {
            // Sprawdź czy utwór ma statystyki sprzedaży/streamingu
            const { data: sales } = await this.supabase
                .from('royalty_statements')
                .select('id')
                .contains('track_ids', [id])
                .limit(1);

            if (sales && sales.length > 0) {
                throw new Error('Nie można usunąć utworu z istniejącymi statystykami sprzedaży');
            }

            const { error } = await this.supabase
                .from('tracks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            logger.info('Usunięto utwór:', { trackId: id, userId });
            return { success: true };
        } catch (error) {
            logger.error('Błąd usuwania utworu:', error);
            throw new Error(`Nie udało się usunąć utworu: ${error.message}`);
        }
    }

    // Pobierz utwory z wydania
    async getTracksByRelease(releaseId) {
        try {
            const { data, error } = await this.supabase
                .from('tracks')
                .select(`
                    *,
                    contributors:track_contributors(*, artist:artists(*))
                `)
                .eq('release_id', releaseId)
                .order('track_number', { ascending: true });

            if (error) throw error;

            return data?.map(mapTrack) || [];
        } catch (error) {
            logger.error('Błąd pobierania utworów z wydania:', error);
            throw new Error(`Nie udało się pobrać utworów: ${error.message}`);
        }
    }

    // Dodaj współtwórcę do utworu
    async addTrackContributor(trackId, contributorData, userId) {
        try {
            const { error: validationError } = validateTrackContributor(contributorData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            const { data, error } = await this.supabase
                .from('track_contributors')
                .insert([{
                    track_id: trackId,
                    artist_id: contributorData.artistId,
                    role: contributorData.role,
                    credit_name: contributorData.creditName,
                    percentage: contributorData.percentage,
                    created_by: userId
                }])
                .select(`
                    *,
                    artist:artists(*),
                    track:tracks(*)
                `)
                .single();

            if (error) throw error;

            logger.info('Dodano współtwórcę do utworu:', { trackId, contributorId: data.id });
            return mapTrackContributor(data);
        } catch (error) {
            logger.error('Błąd dodawania współtwórcy:', error);
            throw new Error(`Nie udało się dodać współtwórcy: ${error.message}`);
        }
    }

    // Usuń współtwórcę z utworu
    async removeTrackContributor(contributorId, userId) {
        try {
            const { error } = await this.supabase
                .from('track_contributors')
                .delete()
                .eq('id', contributorId);

            if (error) throw error;

            logger.info('Usunięto współtwórcę:', { contributorId, userId });
            return { success: true };
        } catch (error) {
            logger.error('Błąd usuwania współtwórcy:', error);
            throw new Error(`Nie udało się usunąć współtwórcy: ${error.message}`);
        }
    }

    // Pobierz statystyki utworu
    async getTrackStats(id) {
        try {
            const track = await this.getTrackById(id);
            
            // TODO: Implementacja pobrania statystyk z platform streamingowych
            const stats = {
                totalStreams: track.totalStreams || 0,
                totalRevenue: track.totalRevenue || 0,
                platforms: {},
                countries: {},
                monthlyData: []
            };

            return stats;
        } catch (error) {
            logger.error('Błąd pobierania statystyk utworu:', error);
            throw new Error(`Nie udało się pobrać statystyk: ${error.message}`);
        }
    }

    // Wyszukaj utwory
    async searchTracks(searchTerm, limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('tracks')
                .select(`
                    id, title, track_number, duration_ms,
                    release:releases(id, title, artist:artists(name))
                `)
                .ilike('title', `%${searchTerm}%`)
                .eq('status', 'published')
                .limit(limit);

            if (error) throw error;

            return data?.map(track => ({
                id: track.id,
                title: track.title,
                trackNumber: track.track_number,
                duration: track.duration_ms,
                release: track.release ? {
                    id: track.release.id,
                    title: track.release.title,
                    artist: track.release.artist?.name
                } : null
            })) || [];
        } catch (error) {
            logger.error('Błąd wyszukiwania utworów:', error);
            throw new Error(`Nie udało się wyszukać utworów: ${error.message}`);
        }
    }
}

module.exports = TrackService;
