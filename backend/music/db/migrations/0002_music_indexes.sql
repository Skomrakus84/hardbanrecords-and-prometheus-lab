-- Indeksy dla poprawy wydajności modułu muzycznego
-- Plik: 0002_music_indexes.sql

-- Indeksy dla tabeli artists
CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at);
CREATE INDEX IF NOT EXISTS idx_artists_name_gin ON artists USING GIN(to_tsvector('english', name));

-- Indeksy dla tabeli releases
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date);
CREATE INDEX IF NOT EXISTS idx_releases_upc ON releases(upc);
CREATE INDEX IF NOT EXISTS idx_releases_title_gin ON releases USING GIN(to_tsvector('english', title));

-- Indeksy dla tabeli tracks
CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_isrc ON tracks(isrc);
CREATE INDEX IF NOT EXISTS idx_tracks_track_number ON tracks(track_number);
CREATE INDEX IF NOT EXISTS idx_tracks_title_gin ON tracks USING GIN(to_tsvector('english', title));

-- Indeksy dla tabeli track_contributors
CREATE INDEX IF NOT EXISTS idx_track_contributors_track_id ON track_contributors(track_id);
CREATE INDEX IF NOT EXISTS idx_track_contributors_artist_id ON track_contributors(artist_id);
CREATE INDEX IF NOT EXISTS idx_track_contributors_role ON track_contributors(role);

-- Indeksy dla tabeli distribution_channels
CREATE INDEX IF NOT EXISTS idx_distribution_channels_platform ON distribution_channels(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_channels_status ON distribution_channels(status);

-- Indeksy dla tabeli royalty_statements
CREATE INDEX IF NOT EXISTS idx_royalty_statements_artist_id ON royalty_statements(artist_id);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_period ON royalty_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_status ON royalty_statements(status);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_platform ON royalty_statements(platform);

-- Indeksy dla tabeli royalty_splits
CREATE INDEX IF NOT EXISTS idx_royalty_splits_release_id ON royalty_splits(release_id);
CREATE INDEX IF NOT EXISTS idx_royalty_splits_track_id ON royalty_splits(track_id);
CREATE INDEX IF NOT EXISTS idx_royalty_splits_artist_id ON royalty_splits(artist_id);

-- Indeksy dla tabeli payout_methods
CREATE INDEX IF NOT EXISTS idx_payout_methods_artist_id ON payout_methods(artist_id);
CREATE INDEX IF NOT EXISTS idx_payout_methods_is_default ON payout_methods(is_default);

-- Indeksy dla tabeli expenses
CREATE INDEX IF NOT EXISTS idx_expenses_release_id ON expenses(release_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Indeksy dla tabeli recoupments
CREATE INDEX IF NOT EXISTS idx_recoupments_artist_id ON recoupments(artist_id);
CREATE INDEX IF NOT EXISTS idx_recoupments_release_id ON recoupments(release_id);
CREATE INDEX IF NOT EXISTS idx_recoupments_status ON recoupments(status);

-- Indeksy dla tabeli notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Indeksy dla tabeli audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Composite indeksy dla często używanych zapytań
CREATE INDEX IF NOT EXISTS idx_tracks_release_track_number ON tracks(release_id, track_number);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_artist_period ON royalty_statements(artist_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_releases_artist_status ON releases(artist_id, status);

-- Indeksy częściowe dla aktywnych rekordów
CREATE INDEX IF NOT EXISTS idx_artists_active ON artists(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_releases_published ON releases(id) WHERE status = 'published';

-- Dodatkowe constrainty
ALTER TABLE releases ADD CONSTRAINT check_release_date_valid 
  CHECK (release_date >= '1900-01-01' AND release_date <= CURRENT_DATE + INTERVAL '2 years');

ALTER TABLE tracks ADD CONSTRAINT check_track_number_positive 
  CHECK (track_number > 0);

ALTER TABLE royalty_statements ADD CONSTRAINT check_period_valid 
  CHECK (period_start <= period_end);

-- Komentarze
COMMENT ON INDEX idx_artists_name_gin IS 'Full-text search index for artist names';
COMMENT ON INDEX idx_releases_title_gin IS 'Full-text search index for release titles';
COMMENT ON INDEX idx_tracks_title_gin IS 'Full-text search index for track titles';
