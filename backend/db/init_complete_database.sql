-- ===================================================================
-- HARDBANRECORDS LAB - COMPLETE DATABASE INITIALIZATION SCRIPT
-- ===================================================================
-- Ten skrypt tworzy kompletną bazę danych z wszystkimi tabelami,
-- relacjami, indeksami i danymi testowymi potrzebnymi do uruchomienia
-- ===================================================================

-- Włączenie rozszerzeń PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ===================================================================
-- TABELE GŁÓWNE SYSTEMU
-- ===================================================================

-- Users - Użytkownicy systemu
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities - Feed aktywności systemu
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platforms - Platformy dystrybucji (music + publishing)
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('music', 'publishing', 'both')),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    api_config JSONB DEFAULT '{}',
    integration_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- MODUŁ MUZYCZNY
-- ===================================================================

-- Artists - Artyści
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    social_media JSONB DEFAULT '{}',
    contracts JSONB DEFAULT '[]',
    performance_metrics JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Releases - Wydania muzyczne
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    release_type VARCHAR(50) DEFAULT 'single' CHECK (release_type IN ('single', 'album', 'ep')),
    cover_url VARCHAR(500),
    audio_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    platforms JSONB DEFAULT '[]',
    streams BIGINT DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music Analytics - Analityka muzyczna
CREATE TABLE IF NOT EXISTS music_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    platform VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    streams INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    geographic_data JSONB DEFAULT '{}',
    demographic_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Royalties - Tantiemy
CREATE TABLE IF NOT EXISTS royalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_revenue DECIMAL(12,2) DEFAULT 0.00,
    net_revenue DECIMAL(12,2) DEFAULT 0.00,
    artist_share DECIMAL(5,2) DEFAULT 50.00,
    artist_payout DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- MODUŁ WYDAWNICZY
-- ===================================================================

-- Authors - Autorzy książek
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    contacts JSONB DEFAULT '{}',
    contracts JSONB DEFAULT '[]',
    performance_tracking JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books - Książki
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    isbn VARCHAR(17),
    cover_url VARCHAR(500),
    description TEXT,
    genre VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    page_count INTEGER,
    price DECIMAL(8,2),
    status VARCHAR(50) DEFAULT 'draft',
    stores JSONB DEFAULT '[]',
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    published_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book Chapters - Rozdziały książek
CREATE TABLE IF NOT EXISTS book_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publishing Analytics - Analityka publikacji
CREATE TABLE IF NOT EXISTS publishing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    store VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    geographic_sales JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABELE WSPÓLNE
-- ===================================================================

-- Revenue Analytics - Analityka przychodów
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    music_revenue DECIMAL(12,2) DEFAULT 0.00,
    publishing_revenue DECIMAL(12,2) DEFAULT 0.00,
    monthly_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- INDEKSY DLA WYDAJNOŚCI
-- ===================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- Artists indexes
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);

-- Releases indexes
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_title ON releases USING gin(title gin_trgm_ops);

-- Music Analytics indexes
CREATE INDEX IF NOT EXISTS idx_music_analytics_release_id ON music_analytics(release_id);
CREATE INDEX IF NOT EXISTS idx_music_analytics_date ON music_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_music_analytics_platform ON music_analytics(platform);

-- Authors indexes
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_authors_status ON authors(status);

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_published_date ON books(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin(title gin_trgm_ops);

-- Publishing Analytics indexes
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_book_id ON publishing_analytics(book_id);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_date ON publishing_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_store ON publishing_analytics(store);

-- ===================================================================
-- FUNKCJE I TRIGGERY
-- ===================================================================

-- Funkcja aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_royalties_updated_at BEFORE UPDATE ON royalties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ===================================================================
-- DANE TESTOWE - PLATFORMY DYSTRYBUCJI
-- ===================================================================

INSERT INTO platforms (name, type, category, status) VALUES
-- Music platforms
('Spotify', 'music', 'Streaming', 'active'),
('Apple Music', 'music', 'Streaming', 'active'),
('YouTube Music', 'music', 'Streaming', 'active'),
('Amazon Music', 'music', 'Streaming', 'active'),
('Deezer', 'music', 'Streaming', 'active'),
('Tidal', 'music', 'Streaming', 'active'),
('SoundCloud', 'music', 'Streaming', 'active'),
('Bandcamp', 'music', 'Digital Store', 'active'),
('TikTok', 'music', 'Social Media', 'active'),
('Instagram', 'music', 'Social Media', 'active'),

-- Publishing platforms
('Amazon Kindle', 'publishing', 'Ebook Store', 'active'),
('Apple Books', 'publishing', 'Ebook Store', 'active'),
('Google Play Books', 'publishing', 'Ebook Store', 'active'),
('Kobo', 'publishing', 'Ebook Store', 'active'),
('Barnes & Noble', 'publishing', 'Ebook Store', 'active'),
('Smashwords', 'publishing', 'Distributor', 'active'),
('Draft2Digital', 'publishing', 'Distributor', 'active'),
('IngramSpark', 'publishing', 'Print-on-Demand', 'active'),
('Lulu', 'publishing', 'Print-on-Demand', 'active'),
('BookBaby', 'publishing', 'Distributor', 'active')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - UŻYTKOWNICY
-- ===================================================================

INSERT INTO users (email, password_hash, display_name, role, timezone) VALUES
('admin@hardbanrecords.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNew.fakehashforbcrypt', 'HardbanRecords Admin', 'admin', 'UTC'),
('manager@hardbanrecords.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNew.fakehashforbcrypt', 'Music Manager', 'manager', 'EST'),
('editor@hardbanrecords.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNew.fakehashforbcrypt', 'Content Editor', 'editor', 'PST')
ON CONFLICT (email) DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - ARTYŚCI
-- ===================================================================

INSERT INTO artists (name, bio, social_media, status) VALUES
('The Synthwave', 'Electronic music duo creating retro-futuristic soundscapes', '{"instagram": "@thesynthwave", "twitter": "@synthwave_duo", "spotify": "thesynthwave"}', 'active'),
('Beach House', 'Indie pop band with dreamy summer vibes', '{"instagram": "@beachhouse_official", "facebook": "BeachHouseMusic"}', 'active'),
('City Lights', 'Urban hip-hop artist from downtown scene', '{"tiktok": "@citylights_music", "youtube": "CityLightsOfficial"}', 'active'),
('Neon Beats', 'Electronic producer specializing in club anthems', '{"soundcloud": "neonbeats", "instagram": "@neonbeats_official"}', 'active'),
('Midnight Echoes', 'Ambient electronic project for late night sessions', '{"bandcamp": "midnightechoes", "spotify": "midnightechoes"}', 'active')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - RELEASES
-- ===================================================================

INSERT INTO releases (title, artist_id, release_type, status, streams, revenue, release_date, platforms, metadata) VALUES
('Midnight Dreams', (SELECT id FROM artists WHERE name = 'The Synthwave'), 'album', 'live', 1200000, 4200.00, '2024-01-15',
 '["Spotify", "Apple Music", "YouTube Music", "Amazon Music"]',
 '{"genre": "Synthwave", "duration": "42:30", "tracks": 12}'),

('Summer Vibes EP', (SELECT id FROM artists WHERE name = 'Beach House'), 'ep', 'processing', 850000, 2800.00, '2024-02-01',
 '["Spotify", "Apple Music", "Deezer", "Tidal"]',
 '{"genre": "Indie Pop", "duration": "18:45", "tracks": 5}'),

('Urban Nights', (SELECT id FROM artists WHERE name = 'City Lights'), 'album', 'live', 2100000, 7500.00, '2024-01-28',
 '["Spotify", "Apple Music", "YouTube Music", "TikTok"]',
 '{"genre": "Hip-Hop", "duration": "38:22", "tracks": 14}'),

('Club Anthem', (SELECT id FROM artists WHERE name = 'Neon Beats'), 'single', 'live', 650000, 1800.00, '2024-02-15',
 '["Spotify", "Apple Music", "SoundCloud", "Beatport"]',
 '{"genre": "Electronic Dance", "duration": "3:45", "tracks": 1}'),

('Nocturnal Waves', (SELECT id FROM artists WHERE name = 'Midnight Echoes'), 'album', 'live', 450000, 1200.00, '2024-01-10',
 '["Spotify", "Apple Music", "Bandcamp", "Ambient Online"]',
 '{"genre": "Ambient", "duration": "52:18", "tracks": 8}')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - AUTORZY
-- ===================================================================

INSERT INTO authors (name, bio, contacts, status) VALUES
('Alex Chen', 'Technology writer and futurist, specializing in AI and digital transformation', '{"email": "alex@example.com", "twitter": "@alexchen_writes"}', 'active'),
('Sarah Miller', 'Software engineering expert with 15 years of industry experience', '{"email": "sarah@example.com", "linkedin": "sarahmiller-dev"}', 'active'),
('Michael Rodriguez', 'Cybersecurity specialist and technical author', '{"email": "mike@example.com", "website": "mikerodriguez.tech"}', 'active'),
('Emma Watson', 'UX/UI designer and author of design thinking books', '{"email": "emma@example.com", "portfolio": "emmawatson.design"}', 'active'),
('David Kim', 'Blockchain developer and cryptocurrency researcher', '{"email": "david@example.com", "github": "davidkim-crypto"}', 'active')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - KSIĄŻKI
-- ===================================================================

INSERT INTO books (title, author_id, isbn, description, genre, price, status, sales, revenue, published_date, stores) VALUES
('Digital Future: AI Revolution', (SELECT id FROM authors WHERE name = 'Alex Chen'), '978-0-123456-78-9',
 'Comprehensive guide to artificial intelligence and its impact on society', 'Technology', 24.99, 'published', 1247, 3200.00, '2024-01-20',
 '["Amazon Kindle", "Apple Books", "Google Play Books"]'),

('The Art of Code: Clean Programming', (SELECT id FROM authors WHERE name = 'Sarah Miller'), '978-0-123456-79-6',
 'Best practices for writing maintainable and elegant code', 'Programming', 29.99, 'review', 892, 2100.00, '2024-02-01',
 '["Amazon Kindle", "Apple Books", "Kobo"]'),

('Cybersecurity Essentials', (SELECT id FROM authors WHERE name = 'Michael Rodriguez'), '978-0-123456-80-2',
 'Complete guide to modern cybersecurity practices', 'Technology', 34.99, 'published', 654, 1800.00, '2024-01-15',
 '["Amazon Kindle", "Google Play Books", "Barnes & Noble"]'),

('Design Thinking for Developers', (SELECT id FROM authors WHERE name = 'Emma Watson'), '978-0-123456-81-9',
 'Bridge the gap between design and development', 'Design', 27.99, 'draft', 0, 0.00, NULL,
 '[]'),

('Blockchain Fundamentals', (SELECT id FROM authors WHERE name = 'David Kim'), '978-0-123456-82-6',
 'Understanding blockchain technology and cryptocurrency', 'Technology', 32.99, 'published', 423, 1100.00, '2024-02-10',
 '["Amazon Kindle", "Apple Books", "Kobo", "Smashwords"]')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - ROZDZIAŁY KSIĄŻEK
-- ===================================================================

INSERT INTO book_chapters (book_id, chapter_number, title, word_count, status) VALUES
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 1, 'Introduction to AI', 2500, 'published'),
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 2, 'Machine Learning Basics', 3200, 'published'),
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 3, 'Neural Networks Explained', 2800, 'published'),

((SELECT id FROM books WHERE title = 'The Art of Code: Clean Programming'), 1, 'Code Quality Principles', 2200, 'review'),
((SELECT id FROM books WHERE title = 'The Art of Code: Clean Programming'), 2, 'Refactoring Techniques', 2900, 'review'),
((SELECT id FROM books WHERE title = 'The Art of Code: Clean Programming'), 3, 'Testing Best Practices', 2600, 'review')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - AKTYWNOŚCI
-- ===================================================================

INSERT INTO activities (user_id, type, title, details, status, created_at) VALUES
((SELECT id FROM users WHERE email = 'admin@hardbanrecords.com'), 'release', 'New album "Midnight Dreams" released', 'by The Synthwave • Distributed to 350 platforms', 'success', NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE email = 'admin@hardbanrecords.com'), 'book', 'Book "Digital Future" published', 'by Alex Chen • Live on Amazon KDP, Apple Books', 'success', NOW() - INTERVAL '5 hours'),
((SELECT id FROM users WHERE email = 'manager@hardbanrecords.com'), 'analytics', 'Weekly analytics report generated', '1M+ streams, 247 book sales', 'success', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'admin@hardbanrecords.com'), 'artist', 'New artist "Neon Beats" signed', 'Electronic genre • Contract uploaded', 'success', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'manager@hardbanrecords.com'), 'distribution', 'Global distribution completed', 'Release "Summer Vibes" • All 400 platforms', 'success', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE email = 'admin@hardbanrecords.com'), 'royalty', 'Royalty payments processed', '$12,500 distributed to 15 artists', 'success', NOW() - INTERVAL '1 week')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - ANALITYKA MUZYCZNA
-- ===================================================================

INSERT INTO music_analytics (release_id, platform, date, streams, revenue) VALUES
((SELECT id FROM releases WHERE title = 'Midnight Dreams'), 'Spotify', '2024-02-01', 450000, 1800.00),
((SELECT id FROM releases WHERE title = 'Midnight Dreams'), 'Apple Music', '2024-02-01', 280000, 1200.00),
((SELECT id FROM releases WHERE title = 'Midnight Dreams'), 'YouTube Music', '2024-02-01', 320000, 800.00),
((SELECT id FROM releases WHERE title = 'Urban Nights'), 'Spotify', '2024-02-01', 680000, 2400.00),
((SELECT id FROM releases WHERE title = 'Urban Nights'), 'Apple Music', '2024-02-01', 420000, 1800.00),
((SELECT id FROM releases WHERE title = 'Urban Nights'), 'TikTok', '2024-02-01', 950000, 1200.00)
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - ANALITYKA PUBLIKACJI
-- ===================================================================

INSERT INTO publishing_analytics (book_id, store, date, sales, revenue) VALUES
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 'Amazon Kindle', '2024-02-01', 450, 1200.00),
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 'Apple Books', '2024-02-01', 280, 800.00),
((SELECT id FROM books WHERE title = 'Digital Future: AI Revolution'), 'Google Play Books', '2024-02-01', 180, 600.00),
((SELECT id FROM books WHERE title = 'Cybersecurity Essentials'), 'Amazon Kindle', '2024-02-01', 220, 800.00),
((SELECT id FROM books WHERE title = 'Cybersecurity Essentials'), 'Barnes & Noble', '2024-02-01', 150, 500.00)
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - REVENUE ANALYTICS
-- ===================================================================

INSERT INTO revenue_analytics (date, total_revenue, music_revenue, publishing_revenue, monthly_data) VALUES
('2024-01-01', 85000.00, 55000.00, 30000.00, '{"growth": 18, "music_platforms": 12, "book_stores": 8}'),
('2024-02-01', 125000.00, 85000.00, 40000.00, '{"growth": 23, "music_platforms": 15, "book_stores": 12}')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- DANE TESTOWE - ROYALTIES
-- ===================================================================

INSERT INTO royalties (release_id, artist_id, period_start, period_end, gross_revenue, net_revenue, artist_share, artist_payout, status) VALUES
((SELECT id FROM releases WHERE title = 'Midnight Dreams'), (SELECT id FROM artists WHERE name = 'The Synthwave'), '2024-01-01', '2024-01-31', 4200.00, 3780.00, 60.00, 2268.00, 'paid'),
((SELECT id FROM releases WHERE title = 'Urban Nights'), (SELECT id FROM artists WHERE name = 'City Lights'), '2024-01-01', '2024-01-31', 7500.00, 6750.00, 55.00, 3712.50, 'paid'),
((SELECT id FROM releases WHERE title = 'Summer Vibes EP'), (SELECT id FROM artists WHERE name = 'Beach House'), '2024-02-01', '2024-02-29', 2800.00, 2520.00, 50.00, 1260.00, 'pending')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- WIDOKI DLA DASHBOARD'U
-- ===================================================================

-- Widok statystyk głównych
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM artists WHERE status = 'active') as active_artists,
    (SELECT COUNT(*) FROM releases WHERE status = 'live') as total_releases,
    (SELECT COUNT(*) FROM books WHERE status = 'published') as published_books,
    (SELECT COALESCE(SUM(revenue), 0) FROM releases) + (SELECT COALESCE(SUM(revenue), 0) FROM books) as total_revenue,
    (SELECT COUNT(*) FROM platforms WHERE status = 'active' AND type = 'music') as music_platforms,
    (SELECT COUNT(*) FROM platforms WHERE status = 'active' AND type = 'publishing') as publishing_platforms;

-- Widok ostatnich aktywności
CREATE OR REPLACE VIEW recent_activities AS
SELECT
    a.*,
    u.display_name as user_name
FROM activities a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC
LIMIT 10;

-- ===================================================================
-- PODSUMOWANIE
-- ===================================================================

-- Wyświetl podsumowanie utworzonych danych
SELECT 'DATABASE INITIALIZATION COMPLETE ✅' as status;
SELECT 'Total Users: ' || COUNT(*) as summary FROM users
UNION ALL
SELECT 'Total Artists: ' || COUNT(*) FROM artists
UNION ALL
SELECT 'Total Releases: ' || COUNT(*) FROM releases
UNION ALL
SELECT 'Total Authors: ' || COUNT(*) FROM authors
UNION ALL
SELECT 'Total Books: ' || COUNT(*) FROM books
UNION ALL
SELECT 'Total Platforms: ' || COUNT(*) FROM platforms
UNION ALL
SELECT 'Total Activities: ' || COUNT(*) FROM activities;

-- Sprawdź czy wszystko działa
SELECT
    'SUCCESS: Database ready for HardbanRecords Lab! 🎵📚' as message,
    NOW() as timestamp;

-- ===================================================================
-- NASTĘPNE KROKI
-- ===================================================================

-- WAŻNE: Po uruchomieniu tego skryptu:
-- 1. Uruchom supabase_policies.sql (polityki RLS)
-- 2. Skonfiguruj CORS w Dashboard > Storage > Settings
-- 3. Przetestuj połączenie z frontendem
-- 4. Sprawdź upload plików do bucket 'hardbanrecords-files'

SELECT 'READY FOR NEXT STEP: Run supabase_policies.sql' as next_action;

-- ===================================================================
-- INSTRUKCJE POST-INSTALACJI
-- ===================================================================

/*
INSTRUKCJE DLA ADMINISTRATORA:

1. **Uruchomienie skryptu:**
   Wklej cały ten skrypt do edytora SQL w Supabase Dashboard
   lub uruchom przez psql: psql -f init_complete_database.sql

2. **Weryfikacja instalacji:**
   SELECT * FROM dashboard_stats;

3. **Logowanie testowe:**
   Email: admin@hardbanrecords.com
   Hasło: admin123 (zmień w pierwszym logowaniu)

4. **Konfiguracja Supabase Storage:**
   - Utwórz bucket: 'hardbanrecords-files'
   - Ustaw polityki RLS dla upload plików
   - Skonfiguruj CORS dla frontend

5. **Zmienne środowiskowe:**
   Upewnij się że .env zawiera poprawne klucze Supabase

6. **Testy integracji:**
   - Sprawdź czy API endpoints działają
   - Przetestuj upload plików audio/okładek
   - Zweryfikuj generowanie raportów

GOTOWE DO UŻYCIA! 🚀
*/
