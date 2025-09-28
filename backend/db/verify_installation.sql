-- ===================================================================
-- WERYFIKACJA KOMPLETNEJ INSTALACJI
-- ===================================================================

-- Test 1: Sprawdź strukturę bazy
SELECT 'TESTING DATABASE STRUCTURE...' as test;

SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Test 2: Sprawdź dane testowe
SELECT 'TESTING SAMPLE DATA...' as test;

SELECT 'Users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'Artists', COUNT(*) FROM artists
UNION ALL
SELECT 'Releases', COUNT(*) FROM releases
UNION ALL
SELECT 'Authors', COUNT(*) FROM authors
UNION ALL
SELECT 'Books', COUNT(*) FROM books
UNION ALL
SELECT 'Platforms', COUNT(*) FROM platforms;

-- Test 3: Sprawdź widoki dashboard
SELECT 'TESTING DASHBOARD VIEWS...' as test;
SELECT * FROM dashboard_stats;

-- Test 4: Sprawdź Storage bucket
SELECT 'TESTING STORAGE BUCKET...' as test;
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'hardbanrecords-files';

-- Test 5: Sprawdź polityki RLS
SELECT 'TESTING RLS POLICIES...' as test;
SELECT
    schemaname,
    tablename,
    COUNT(*) as active_policies
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
GROUP BY schemaname, tablename;

-- Finalny test
SELECT
    '🎉 INSTALLATION VERIFICATION COMPLETE!' as status,
    'Ready for frontend connection' as next_step,
    NOW() as timestamp;
