-- ===================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Zaktualizowane dla projektu: lniyanikhipfmrdubqvm
-- ===================================================================

-- Włącz RLS dla wszystkich tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLITYKI DOSTĘPU
-- ===================================================================

-- Users - pełny dostęp dla service_role
CREATE POLICY "Users full access for service role" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Activities - pełny dostęp dla service_role
CREATE POLICY "Activities full access for service role" ON activities
    FOR ALL USING (auth.role() = 'service_role');

-- Platforms - odczyt dla wszystkich, zapis dla service_role
CREATE POLICY "Platforms read access" ON platforms
    FOR SELECT USING (true);
CREATE POLICY "Platforms write access for service role" ON platforms
    FOR ALL USING (auth.role() = 'service_role');

-- Artists - pełny dostęp dla service_role
CREATE POLICY "Artists full access for service role" ON artists
    FOR ALL USING (auth.role() = 'service_role');

-- Releases - pełny dostęp dla service_role
CREATE POLICY "Releases full access for service role" ON releases
    FOR ALL USING (auth.role() = 'service_role');

-- Music Analytics - pełny dostęp dla service_role
CREATE POLICY "Music analytics full access for service role" ON music_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Royalties - pełny dostęp dla service_role
CREATE POLICY "Royalties full access for service role" ON royalties
    FOR ALL USING (auth.role() = 'service_role');

-- Authors - pełny dostęp dla service_role
CREATE POLICY "Authors full access for service role" ON authors
    FOR ALL USING (auth.role() = 'service_role');

-- Books - pełny dostęp dla service_role
CREATE POLICY "Books full access for service role" ON books
    FOR ALL USING (auth.role() = 'service_role');

-- Book Chapters - pełny dostęp dla service_role
CREATE POLICY "Book chapters full access for service role" ON book_chapters
    FOR ALL USING (auth.role() = 'service_role');

-- Publishing Analytics - pełny dostęp dla service_role
CREATE POLICY "Publishing analytics full access for service role" ON publishing_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Revenue Analytics - pełny dostęp dla service_role
CREATE POLICY "Revenue analytics full access for service role" ON revenue_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- ===================================================================
-- STORAGE POLICIES - POPRAWIONE
-- ===================================================================

-- Policy dla bucket 'hardbanrecords-files' (bez CORS)
INSERT INTO storage.buckets (id, name, public) VALUES ('hardbanrecords-files', 'hardbanrecords-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Upload access - poprawione
CREATE POLICY "Upload access for service role" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'hardbanrecords-files' AND
        auth.role() = 'service_role'
    );

-- Read access - publiczny dostęp do plików
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'hardbanrecords-files');

-- Update access - zaktualizowane
CREATE POLICY "Update access for authenticated users" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'hardbanrecords-files' AND
        (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)
    );

-- Delete access - zaktualizowane
CREATE POLICY "Delete access for authenticated users" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'hardbanrecords-files' AND
        (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)
    );

-- ===================================================================
-- INSTRUKCJE KONFIGURACJI CORS (POPRAWIONE)
-- ===================================================================

-- UWAGA: Konfiguracja CORS dla Storage
-- 1. Przejdź do Supabase Dashboard > Storage > Settings
-- 2. W sekcji "CORS configuration" dodaj:
--    Allowed origins: http://localhost:5173, https://your-production-domain.com
--    Allowed methods: GET, POST, PUT, DELETE, OPTIONS
--    Allowed headers: authorization, x-client-info, apikey, content-type

-- ===================================================================
-- WERYFIKACJA KONFIGURACJI
-- ===================================================================

-- Sprawdź czy bucket został utworzony
SELECT * FROM storage.buckets WHERE id = 'hardbanrecords-files';

-- Sprawdź aktywne polityki
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ===================================================================
-- WERYFIKACJA RLS SETUP
-- ===================================================================

SELECT 'RLS POLICIES CONFIGURED ✅' as status;

-- Sprawdź ile polityk zostało utworzonych
SELECT
    schemaname,
    tablename,
    COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
GROUP BY schemaname, tablename
ORDER BY schemaname, tablename;

-- ===================================================================
-- FINALIZACJA KONFIGURACJI
-- ===================================================================

SELECT 'SUPABASE POLICIES INSTALLATION COMPLETE! 🎉' as message;
-- ===================================================================

SELECT 'RLS POLICIES CONFIGURED ✅' as status;

-- Sprawdź ile polityk zostało utworzonych
SELECT
    schemaname,
    tablename,
    COUNT(*) as policies_count
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
GROUP BY schemaname, tablename
ORDER BY schemaname, tablename;
