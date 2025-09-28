-- =================================================================
-- DATABASE MIGRATION VERIFICATION SCRIPT
-- HardbanRecords Lab - Check schema before production deployment
-- =================================================================

-- First, let's check what we have in the current database
SELECT 'Current Database Analysis' as section;

-- Check if users table exists and its structure
SELECT
    'users table structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing tables
SELECT
    'existing tables' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if we have foreign key constraint issues
SELECT
    'foreign key constraints' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- Check user id data type specifically
SELECT
    'users.id data type' as check_type,
    data_type,
    udt_name,
    character_maximum_length,
    numeric_precision
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'id'
AND table_schema = 'public';
