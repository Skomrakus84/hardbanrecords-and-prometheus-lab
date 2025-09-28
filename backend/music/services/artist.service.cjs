/**
 * Artist Service - Complete Artist Management System
 * Handles artist profiles, collaborations, and music career management
 */

const db = require('../../db.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class ArtistService {

    // Pobierz wszystkich artystów
    async getAllArtists(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 20, search, status, genre } = { ...filters, ...pagination };
            const offset = (page - 1) * limit;

            let query = this.supabase
                .from('artists')
                .select(`
                    *,
                    releases(count),
                    tracks(count)
                `)
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: false });

            // Filtry
            if (search) {
                query = query.or(`name.ilike.%${search}%,real_name.ilike.%${search}%`);
            }
            if (status) {
                query = query.eq('status', status);
            }
            if (genre) {
                query = query.contains('genres', [genre]);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                artists: data?.map(mapArtist) || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            };
        } catch (error) {
            logger.error('Błąd pobierania artystów:', error);
            throw new Error(`Nie udało się pobrać artystów: ${error.message}`);
        }
    }

    // Pobierz artystę po ID
    async getArtistById(id) {
        try {
            const { data, error } = await this.supabase
                .from('artists')
                .select(`
                    *,
                    releases(*),
                    royalty_statements(*),
                    payout_methods(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Artysta nie został znaleziony');

            return mapArtist(data);
        } catch (error) {
            logger.error('Błąd pobierania artysty:', error);
            throw new Error(`Nie udało się pobrać artysty: ${error.message}`);
        }
    }

    // Utwórz nowego artystę
    async createArtist(artistData, userId) {
        try {
            const { error: validationError } = validateArtist(artistData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            const dbData = transformArtistToDb(artistData);
            dbData.created_by = userId;

            const { data, error } = await this.supabase
                .from('artists')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;

            logger.info('Utworzono nowego artystę:', { artistId: data.id, name: data.name });
            return mapArtist(data);
        } catch (error) {
            logger.error('Błąd tworzenia artysty:', error);
            throw new Error(`Nie udało się utworzyć artysty: ${error.message}`);
        }
    }

    // Aktualizuj artystę
    async updateArtist(id, updateData, userId) {
        try {
            const { error: validationError } = validateArtistUpdate(updateData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            const dbData = transformArtistToDb(updateData);
            dbData.updated_at = new Date().toISOString();

            const { data, error } = await this.supabase
                .from('artists')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Artysta nie został znaleziony');

            logger.info('Zaktualizowano artystę:', { artistId: id });
            return mapArtist(data);
        } catch (error) {
            logger.error('Błąd aktualizacji artysty:', error);
            throw new Error(`Nie udało się zaktualizować artysty: ${error.message}`);
        }
    }

    // Usuń artystę
    async deleteArtist(id, userId) {
        try {
            // Sprawdź czy artysta ma wydania
            const { data: releases } = await this.supabase
                .from('releases')
                .select('id')
                .eq('artist_id', id)
                .limit(1);

            if (releases && releases.length > 0) {
                throw new Error('Nie można usunąć artysty z istniejącymi wydaniami');
            }

            const { error } = await this.supabase
                .from('artists')
                .delete()
                .eq('id', id);

            if (error) throw error;

            logger.info('Usunięto artystę:', { artistId: id });
            return { success: true };
        } catch (error) {
            logger.error('Błąd usuwania artysty:', error);
            throw new Error(`Nie udało się usunąć artysty: ${error.message}`);
        }
    }

    // Pobierz statystyki artysty
    async getArtistStats(id) {
        try {
            const [releases, tracks, royalties] = await Promise.all([
                this.supabase
                    .from('releases')
                    .select('id, status, total_streams, total_revenue')
                    .eq('artist_id', id),
                this.supabase
                    .from('tracks')
                    .select('id, total_streams, total_revenue')
                    .in('release_id',
                        this.supabase
                            .from('releases')
                            .select('id')
                            .eq('artist_id', id)
                    ),
                this.supabase
                    .from('royalty_statements')
                    .select('gross_revenue, net_revenue, status')
                    .eq('artist_id', id)
                    .eq('status', 'paid')
            ]);

            const stats = {
                totalReleases: releases.data?.length || 0,
                publishedReleases: releases.data?.filter(r => r.status === 'published').length || 0,
                totalTracks: tracks.data?.length || 0,
                totalStreams: tracks.data?.reduce((sum, t) => sum + (t.total_streams || 0), 0) || 0,
                totalRevenue: royalties.data?.reduce((sum, r) => sum + (r.net_revenue || 0), 0) || 0,
                unpaidRoyalties: royalties.data?.reduce((sum, r) => sum + (r.gross_revenue || 0), 0) || 0
            };

            return stats;
        } catch (error) {
            logger.error('Błąd pobierania statystyk artysty:', error);
            throw new Error(`Nie udało się pobrać statystyk: ${error.message}`);
        }
    }

    // Wyszukaj artystów
    async searchArtists(searchTerm, limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('artists')
                .select('id, name, image_url, status')
                .or(`name.ilike.%${searchTerm}%,real_name.ilike.%${searchTerm}%`)
                .eq('status', 'active')
                .limit(limit);

            if (error) throw error;

            return data?.map(artist => ({
                id: artist.id,
                name: artist.name,
                imageUrl: artist.image_url,
                status: artist.status
            })) || [];
        } catch (error) {
            logger.error('Błąd wyszukiwania artystów:', error);
            throw new Error(`Nie udało się wyszukać artystów: ${error.message}`);
        }
    }

    // Pobierz top artystów
    async getTopArtists(period = '30d', limit = 10) {
        try {
            const { data, error } = await this.supabase
                .rpc('get_top_artists', {
                    period_days: period === '7d' ? 7 : period === '30d' ? 30 : 365,
                    result_limit: limit
                });

            if (error) throw error;

            return data?.map(mapArtist) || [];
        } catch (error) {
            logger.error('Błąd pobierania top artystów:', error);
            throw new Error(`Nie udało się pobrać top artystów: ${error.message}`);
        }
    }
}

module.exports = ArtistService;
