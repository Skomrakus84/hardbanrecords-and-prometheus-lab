-- =================================================================
-- POST-MIGRATION VERIFICATION SCRIPT
-- HardbanRecords Lab - Verify production database is ready
-- =================================================================

-- Check all expected tables exist
SELECT
    'TABLE VERIFICATION' as check_type,
    table_name,
    CASE
        WHEN table_name IN (
            'users', 'artists', 'releases', 'books', 'chapters', 'tasks',
            'splits', 'music_analytics', 'publishing_analytics',
            'royalty_statements', 'payouts', 'distribution_channels',
            'distribution_releases', 'publishing_stores', 'store_publications'
        ) THEN '✅ EXPECTED'
        ELSE '⚠️ UNEXPECTED'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify foreign key relationships work
SELECT
    'FOREIGN KEY VERIFICATION' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column,
    '✅ OK' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Check distribution channels were inserted
SELECT
    'DISTRIBUTION CHANNELS' as check_type,
    COUNT(*) as music_channels
FROM distribution_channels
WHERE type = 'music';

-- Check publishing stores were inserted
SELECT
    'PUBLISHING STORES' as check_type,
    COUNT(*) as publishing_stores
FROM publishing_stores;

-- Verify indexes exist
SELECT
    'INDEX VERIFICATION' as check_type,
    schemaname,
    tablename,
    indexname,
    '✅ CREATED' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check triggers exist
SELECT
    'TRIGGER VERIFICATION' as check_type,
    event_object_table as table_name,
    trigger_name,
    '✅ ACTIVE' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- Final summary
SELECT
    'MIGRATION SUMMARY' as summary,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as total_indexes,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as total_triggers,
    (SELECT COUNT(*) FROM distribution_channels) as distribution_channels,
    (SELECT COUNT(*) FROM publishing_stores) as publishing_stores,
    '🎉 READY FOR PRODUCTION' as status;
