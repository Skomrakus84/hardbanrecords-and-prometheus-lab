-- ========================================
-- HardbanRecords Database Migration Runner
-- Migration: run_all_migrations.sql
-- Created: 2025-09-07
-- Description: Execute all database migrations in proper order
-- ========================================

-- Instructions:
-- 1. Run this script against a PostgreSQL database
-- 2. Migrations will be executed in the correct order
-- 3. Check for errors after each migration

\echo 'Starting HardbanRecords Database Migration...'
\echo ''

-- ========== Core System Migrations ==========
\echo 'Running Core System Migrations...'

\echo 'Migration 001: Creating core tables (users, profiles, releases, tracks)'
\i 001_create_core_tables.sql

\echo 'Migration 002: Creating distribution system tables'
\i 002_create_distribution_tables.sql

\echo 'Migration 003: Creating financial system tables'
\i 003_create_financial_tables.sql

\echo ''
\echo 'Core system migrations completed.'
\echo ''

-- ========== Music Module Migrations ==========
\echo 'Running Music Module Migrations...'

\echo 'Music Migration 001: Creating music module specialized tables'
\i ../music/db/migrations/001_create_music_module_tables.sql

\echo ''
\echo 'Music module migrations completed.'
\echo ''

-- ========== Publishing Module Migrations ==========
\echo 'Running Publishing Module Migrations...'

\echo 'Publishing Migration 001: Creating publishing system tables'
\i ../publishing/db/migrations/001_create_publishing_tables.sql

\echo ''
\echo 'Publishing module migrations completed.'
\echo ''

-- ========== Post-Migration Setup ==========
\echo 'Running post-migration setup...'

-- Create admin user (optional - comment out in production)
-- INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified) 
-- VALUES ('admin@hardbanrecords.com', 'admin', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', 'active', true);

-- Insert sample data for development (comment out in production)
-- \i sample_data.sql

\echo ''
\echo '========================================='
\echo 'Migration Summary:'
\echo '- Core System: 3 migrations'
\echo '- Music Module: 1 migration'  
\echo '- Publishing Module: 1 migration'
\echo '- Total: 5 migrations'
\echo ''
\echo 'Database structure created successfully!'
\echo 'Ready for application deployment.'
\echo '========================================='
