-- ===================================================================
-- WERYFIKACJA KONFIGURACJI SUPABASE STORAGE
-- ===================================================================

-- 1. Sprawdź czy bucket istnieje
SELECT
    id,
    name,
    public,
    created_at,
    updated_at
FROM storage.buckets
WHERE id = 'hardbanrecords-files';

-- 2. Sprawdź aktywne polityki RLS dla storage.objects
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%hardbanrecords%'
ORDER BY policyname;

-- 3. Sprawdź strukturę tabeli buckets (dla debugowania)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'storage'
  AND table_name = 'buckets'
ORDER BY ordinal_position;

-- 4. Test upload permission (tylko informacyjnie)
SELECT
    'Storage bucket configured ✅' as status,
    'Run CORS setup via Dashboard' as next_step
WHERE EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'hardbanrecords-files' AND public = true
);

-- 5. Sprawdź czy są już jakieś pliki w bucket
SELECT
    name,
    bucket_id,
    owner,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'hardbanrecords-files'
LIMIT 5;

-- ===================================================================
-- WYNIK WERYFIKACJI
-- ===================================================================

SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'hardbanrecords-files')
        THEN '✅ Bucket exists'
        ELSE '❌ Bucket missing'
    END as bucket_status,

    CASE
        WHEN COUNT(*) >= 4
        THEN '✅ RLS Policies configured'
        ELSE '❌ Missing policies: ' || (4 - COUNT(*))::text
    END as policies_status

FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND qual LIKE '%hardbanrecords-files%';
