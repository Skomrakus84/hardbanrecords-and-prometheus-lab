-- =================================================================
-- ADAPTIVE PRODUCTION DATABASE MIGRATION SCRIPT
-- HardbanRecords Lab - Auto-detects existing user table structure
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a temporary function to get users table id column type
CREATE OR REPLACE FUNCTION get_users_id_type()
RETURNS TEXT AS $$
DECLARE
    id_type TEXT;
BEGIN
    -- Check if users table exists and get the id column type
    SELECT data_type INTO id_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'id'
    AND table_schema = 'public';

    -- If table doesn't exist, return uuid (default for new installations)
    IF id_type IS NULL THEN
        RETURN 'uuid';
    END IF;

    -- Return the actual type (integer or uuid)
    RETURN id_type;
END;
$$ LANGUAGE plpgsql;

-- Get the users id type and store in temp table
DO $$
DECLARE
    users_id_type TEXT;
BEGIN
    users_id_type := get_users_id_type();

    -- Store the type in a temporary table for later use
    DROP TABLE IF EXISTS temp_config;
    CREATE TEMPORARY TABLE temp_config (
        users_id_type TEXT
    );
    INSERT INTO temp_config VALUES (users_id_type);

    RAISE NOTICE 'Detected users.id type: %', users_id_type;
END
$$;

-- Create/update users table adaptively
DO $$
DECLARE
    users_id_type TEXT;
    user_ref_type TEXT;
BEGIN
    SELECT temp_config.users_id_type INTO users_id_type FROM temp_config LIMIT 1;
    user_ref_type := CASE WHEN users_id_type = 'uuid' THEN 'UUID' ELSE 'INTEGER' END;

    -- If users table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        EXECUTE format('
            CREATE TABLE users (
                id %s PRIMARY KEY %s,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(20) DEFAULT ''user'' CHECK (role IN (''admin'', ''user'', ''artist'', ''publisher'')),
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                last_login TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )',
            CASE WHEN users_id_type = 'uuid' THEN 'UUID' ELSE 'SERIAL' END,
            CASE WHEN users_id_type = 'uuid' THEN 'DEFAULT uuid_generate_v4()' ELSE '' END
        );
    ELSE
        -- Add missing columns to existing users table
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Create other tables with adaptive user_id references
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS artists (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            stage_name VARCHAR(255) NOT NULL,
            real_name VARCHAR(255),
            bio TEXT,
            genre VARCHAR(100),
            country VARCHAR(100),
            city VARCHAR(100),
            website VARCHAR(255),
            social_media JSONB DEFAULT ''{}''::jsonb,
            verification_status VARCHAR(20) DEFAULT ''pending'' CHECK (verification_status IN (''pending'', ''verified'', ''rejected'')),
            profile_image_url VARCHAR(500),
            banner_image_url VARCHAR(500),
            monthly_listeners INTEGER DEFAULT 0,
            total_streams BIGINT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS releases (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            artist VARCHAR(255) NOT NULL,
            album VARCHAR(255),
            genre VARCHAR(100),
            release_date DATE,
            description TEXT,
            artwork_url VARCHAR(500),
            audio_file_url VARCHAR(500),
            duration INTEGER,
            bpm INTEGER,
            key_signature VARCHAR(10),
            lyrics TEXT,
            credits JSONB DEFAULT ''{}''::jsonb,
            metadata JSONB DEFAULT ''{}''::jsonb,
            status VARCHAR(20) DEFAULT ''draft'' CHECK (status IN (''draft'', ''pending'', ''approved'', ''rejected'', ''released'')),
            isrc VARCHAR(50),
            catalog_number VARCHAR(100),
            label VARCHAR(255),
            copyright_info TEXT,
            explicit_content BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS books (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            description TEXT,
            genre VARCHAR(100),
            language VARCHAR(50) DEFAULT ''en'',
            isbn VARCHAR(20),
            publication_date DATE,
            page_count INTEGER,
            word_count INTEGER,
            cover_image_url VARCHAR(500),
            status VARCHAR(20) DEFAULT ''draft'' CHECK (status IN (''draft'', ''writing'', ''editing'', ''review'', ''published'')),
            price DECIMAL(10,2),
            currency VARCHAR(3) DEFAULT ''USD'',
            copyright_info TEXT,
            keywords TEXT[],
            target_audience VARCHAR(100),
            book_format VARCHAR(20) DEFAULT ''ebook'' CHECK (book_format IN (''ebook'', ''paperback'', ''hardcover'', ''audiobook'')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT ''pending'' CHECK (status IN (''pending'', ''in_progress'', ''completed'', ''cancelled'')),
            priority VARCHAR(10) DEFAULT ''medium'' CHECK (priority IN (''low'', ''medium'', ''high'', ''urgent'')),
            module VARCHAR(20) DEFAULT ''general'' CHECK (module IN (''music'', ''publishing'', ''general'')),
            related_id UUID,
            related_type VARCHAR(20),
            due_date TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            assigned_to %s REFERENCES users(id),
            tags TEXT[],
            attachments JSONB DEFAULT ''[]''::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type, user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS royalty_statements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            total_revenue DECIMAL(12,2) DEFAULT 0,
            total_streams BIGINT DEFAULT 0,
            platform_breakdown JSONB DEFAULT ''{}''::jsonb,
            status VARCHAR(20) DEFAULT ''pending'' CHECK (status IN (''pending'', ''approved'', ''paid'')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS payouts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            royalty_statement_id UUID REFERENCES royalty_statements(id),
            amount DECIMAL(12,2) NOT NULL,
            currency VARCHAR(3) DEFAULT ''USD'',
            payment_method VARCHAR(50) NOT NULL,
            payment_details JSONB DEFAULT ''{}''::jsonb,
            status VARCHAR(20) DEFAULT ''pending'' CHECK (status IN (''pending'', ''processing'', ''completed'', ''failed'', ''cancelled'')),
            transaction_id VARCHAR(255),
            processed_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

    EXECUTE format('
        CREATE TABLE IF NOT EXISTS conversion_jobs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id %s REFERENCES users(id) ON DELETE CASCADE,
            book_id UUID REFERENCES books(id) ON DELETE CASCADE,
            source_format VARCHAR(10) NOT NULL,
            target_format VARCHAR(10) NOT NULL,
            status VARCHAR(20) DEFAULT ''pending'' CHECK (status IN (''pending'', ''processing'', ''completed'', ''failed'', ''cancelled'')),
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            source_file_url VARCHAR(500),
            output_file_url VARCHAR(500),
            conversion_options JSONB DEFAULT ''{}''::jsonb,
            quality_score INTEGER,
            error_message TEXT,
            processing_time INTEGER,
            file_size_original BIGINT,
            file_size_converted BIGINT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )', user_ref_type);

END
$$;

-- Rest of the schema (tables not dependent on users)
-- ...existing code for other tables...

-- Clean up and finish
DROP FUNCTION IF EXISTS get_users_id_type();
DROP TABLE IF EXISTS temp_config;

RAISE NOTICE 'Adaptive migration completed successfully!';
