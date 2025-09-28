/**
 * Royalty Service - Core Royalty Calculation and Management
 * Advanced royalty processing, split calculations, and financial operations
 */

const db = require('../../db.cjs');
const logger = require('../config/logger.cjs');
const { AppError } = require('../../middleware/errorHandler.cjs');

class RoyaltyService {

    // Pobierz zestawienia tantiem
    async getRoyaltyStatements(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 20, artistId, platform, status, periodStart, periodEnd } = { ...filters, ...pagination };
            const offset = (page - 1) * limit;

            let query = this.supabase
                .from('royalty_statements')
                .select(`
                    *,
                    artist:artists(*)
                `)
                .range(offset, offset + limit - 1)
                .order('period_start', { ascending: false });

            // Filtry
            if (artistId) {
                query = query.eq('artist_id', artistId);
            }
            if (platform) {
                query = query.eq('platform', platform);
            }
            if (status) {
                query = query.eq('status', status);
            }
            if (periodStart) {
                query = query.gte('period_start', periodStart);
            }
            if (periodEnd) {
                query = query.lte('period_end', periodEnd);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                statements: data?.map(mapRoyaltyStatement) || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            };
        } catch (error) {
            logger.error('Błąd pobierania zestawień tantiem:', error);
            throw new Error(`Nie udało się pobrać zestawień: ${error.message}`);
        }
    }

    // Pobierz zestawienie tantiem po ID
    async getRoyaltyStatementById(id) {
        try {
            const { data, error } = await this.supabase
                .from('royalty_statements')
                .select(`
                    *,
                    artist:artists(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Zestawienie tantiem nie zostało znalezione');

            return mapRoyaltyStatement(data);
        } catch (error) {
            logger.error('Błąd pobierania zestawienia tantiem:', error);
            throw new Error(`Nie udało się pobrać zestawienia: ${error.message}`);
        }
    }

    // Utwórz zestawienie tantiem
    async createRoyaltyStatement(statementData, userId) {
        try {
            const { error: validationError } = validateRoyaltyStatement(statementData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            // Sprawdź czy nie istnieje już zestawienie dla tego artysty i okresu
            const { data: existing } = await this.supabase
                .from('royalty_statements')
                .select('id')
                .eq('artist_id', statementData.artistId)
                .eq('platform', statementData.platform)
                .eq('period_start', statementData.periodStart)
                .eq('period_end', statementData.periodEnd)
                .single();

            if (existing) {
                throw new Error('Zestawienie dla tego artysty i okresu już istnieje');
            }

            const dbData = {
                artist_id: statementData.artistId,
                period_start: statementData.periodStart,
                period_end: statementData.periodEnd,
                platform: statementData.platform,
                total_streams: statementData.totalStreams || 0,
                total_sales: statementData.totalSales || 0,
                gross_revenue: statementData.grossRevenue || 0,
                platform_commission: statementData.platformCommission || 0,
                net_revenue: statementData.netRevenue || 0,
                currency: statementData.currency || 'USD',
                status: statementData.status || 'draft',
                statement_date: statementData.statementDate || new Date().toISOString(),
                created_by: userId
            };

            const { data, error } = await this.supabase
                .from('royalty_statements')
                .insert([dbData])
                .select(`
                    *,
                    artist:artists(*)
                `)
                .single();

            if (error) throw error;

            logger.info('Utworzono zestawienie tantiem:', { statementId: data.id });
            return mapRoyaltyStatement(data);
        } catch (error) {
            logger.error('Błąd tworzenia zestawienia tantiem:', error);
            throw new Error(`Nie udało się utworzyć zestawienia: ${error.message}`);
        }
    }

    // Aktualizuj zestawienie tantiem
    async updateRoyaltyStatement(id, updateData, userId) {
        try {
            const dbData = {
                ...updateData,
                updated_at: new Date().toISOString(),
                updated_by: userId
            };

            const { data, error } = await this.supabase
                .from('royalty_statements')
                .update(dbData)
                .eq('id', id)
                .select(`
                    *,
                    artist:artists(*)
                `)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Zestawienie tantiem nie zostało znalezione');

            logger.info('Zaktualizowano zestawienie tantiem:', { statementId: id });
            return mapRoyaltyStatement(data);
        } catch (error) {
            logger.error('Błąd aktualizacji zestawienia tantiem:', error);
            throw new Error(`Nie udało się zaktualizować zestawienia: ${error.message}`);
        }
    }

    // Oznacz zestawienie jako zapłacone
    async markStatementAsPaid(id, paymentData, userId) {
        try {
            const updateData = {
                status: 'paid',
                payment_date: paymentData.paymentDate || new Date().toISOString(),
                payment_method: paymentData.paymentMethod,
                payment_reference: paymentData.paymentReference,
                notes: paymentData.notes,
                updated_by: userId,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('royalty_statements')
                .update(updateData)
                .eq('id', id)
                .select(`
                    *,
                    artist:artists(*)
                `)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Zestawienie tantiem nie zostało znalezione');

            logger.info('Oznaczono zestawienie jako zapłacone:', { statementId: id });
            return mapRoyaltyStatement(data);
        } catch (error) {
            logger.error('Błąd oznaczania zestawienia jako zapłacone:', error);
            throw new Error(`Nie udało się oznaczyć zestawienia: ${error.message}`);
        }
    }

    // Pobierz podziały tantiem
    async getRoyaltySplits(filters = {}) {
        try {
            const { releaseId, trackId, artistId } = filters;

            let query = this.supabase
                .from('royalty_splits')
                .select(`
                    *,
                    artist:artists(*),
                    release:releases(*),
                    track:tracks(*)
                `);

            if (releaseId) {
                query = query.eq('release_id', releaseId);
            }
            if (trackId) {
                query = query.eq('track_id', trackId);
            }
            if (artistId) {
                query = query.eq('artist_id', artistId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return data?.map(mapRoyaltySplit) || [];
        } catch (error) {
            logger.error('Błąd pobierania podziałów tantiem:', error);
            throw new Error(`Nie udało się pobrać podziałów: ${error.message}`);
        }
    }

    // Utwórz podział tantiem
    async createRoyaltySplit(splitData, userId) {
        try {
            const { error: validationError } = validateRoyaltySplit(splitData);
            if (validationError) {
                throw new Error(`Walidacja nieudana: ${validationError.details.map(d => d.message).join(', ')}`);
            }

            // Sprawdź czy suma procentów dla tego wydania/utworu nie przekracza 100%
            const existingSplitsQuery = this.supabase
                .from('royalty_splits')
                .select('percentage')
                .eq('split_type', splitData.splitType);

            if (splitData.releaseId) {
                existingSplitsQuery.eq('release_id', splitData.releaseId);
            }
            if (splitData.trackId) {
                existingSplitsQuery.eq('track_id', splitData.trackId);
            }

            const { data: existingSplits } = await existingSplitsQuery;
            const totalPercentage = (existingSplits || []).reduce((sum, split) => sum + split.percentage, 0);

            if (totalPercentage + splitData.percentage > 100) {
                throw new Error(`Suma procentów przekroczy 100%. Dostępne: ${100 - totalPercentage}%`);
            }

            const dbData = {
                release_id: splitData.releaseId || null,
                track_id: splitData.trackId || null,
                artist_id: splitData.artistId,
                split_type: splitData.splitType,
                percentage: splitData.percentage,
                role: splitData.role,
                created_by: userId
            };

            const { data, error } = await this.supabase
                .from('royalty_splits')
                .insert([dbData])
                .select(`
                    *,
                    artist:artists(*),
                    release:releases(*),
                    track:tracks(*)
                `)
                .single();

            if (error) throw error;

            logger.info('Utworzono podział tantiem:', { splitId: data.id });
            return mapRoyaltySplit(data);
        } catch (error) {
            logger.error('Błąd tworzenia podziału tantiem:', error);
            throw new Error(`Nie udało się utworzyć podziału: ${error.message}`);
        }
    }

    // Usuń podział tantiem
    async deleteRoyaltySplit(id, userId) {
        try {
            const { error } = await this.supabase
                .from('royalty_splits')
                .delete()
                .eq('id', id);

            if (error) throw error;

            logger.info('Usunięto podział tantiem:', { splitId: id, userId });
            return { success: true };
        } catch (error) {
            logger.error('Błąd usuwania podziału tantiem:', error);
            throw new Error(`Nie udało się usunąć podziału: ${error.message}`);
        }
    }

    // Wygeneruj zestawienie dla wszystkich artystów
    async generateStatementsForPeriod(periodStart, periodEnd, platform, userId) {
        try {
            // Pobierz wszystkich aktywnych artystów
            const { data: artists } = await this.supabase
                .from('artists')
                .select('id')
                .eq('status', 'active');

            const statements = [];

            for (const artist of artists || []) {
                try {
                    // TODO: Implementacja logiki obliczania tantiem z danych sprzedaży
                    const statementData = {
                        artistId: artist.id,
                        periodStart,
                        periodEnd,
                        platform,
                        totalStreams: 0,
                        totalSales: 0,
                        grossRevenue: 0,
                        platformCommission: 0,
                        netRevenue: 0,
                        status: 'generated'
                    };

                    const statement = await this.createRoyaltyStatement(statementData, userId);
                    statements.push(statement);
                } catch (error) {
                    logger.warn(`Błąd generowania zestawienia dla artysty ${artist.id}:`, error);
                }
            }

            logger.info('Wygenerowano zestawienia tantiem:', {
                period: `${periodStart} - ${periodEnd}`,
                platform,
                count: statements.length
            });

            return statements;
        } catch (error) {
            logger.error('Błąd generowania zestawień tantiem:', error);
            throw new Error(`Nie udało się wygenerować zestawień: ${error.message}`);
        }
    }

    // Pobierz statystyki tantiem
    async getRoyaltyStats(artistId = null, period = '30d') {
        try {
            let query = this.supabase
                .from('royalty_statements')
                .select('gross_revenue, net_revenue, status, platform');

            if (artistId) {
                query = query.eq('artist_id', artistId);
            }

            // Filtr okresu
            const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 365;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);
            query = query.gte('period_start', startDate.toISOString());

            const { data, error } = await query;
            if (error) throw error;

            const stats = {
                totalStatements: data?.length || 0,
                totalGrossRevenue: data?.reduce((sum, s) => sum + (s.gross_revenue || 0), 0) || 0,
                totalNetRevenue: data?.reduce((sum, s) => sum + (s.net_revenue || 0), 0) || 0,
                paidStatements: data?.filter(s => s.status === 'paid').length || 0,
                pendingStatements: data?.filter(s => s.status === 'generated').length || 0,
                platformBreakdown: {}
            };

            // Breakdown po platformach
            data?.forEach(statement => {
                if (!stats.platformBreakdown[statement.platform]) {
                    stats.platformBreakdown[statement.platform] = {
                        revenue: 0,
                        statements: 0
                    };
                }
                stats.platformBreakdown[statement.platform].revenue += statement.net_revenue || 0;
                stats.platformBreakdown[statement.platform].statements += 1;
            });

            return stats;
        } catch (error) {
            logger.error('Błąd pobierania statystyk tantiem:', error);
            throw new Error(`Nie udało się pobrać statystyk: ${error.message}`);
        }
    }
}

module.exports = RoyaltyService;
