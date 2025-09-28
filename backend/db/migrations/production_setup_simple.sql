-- =================================================================
-- SIMPLIFIED PRODUCTION DATABASE MIGRATION
-- HardbanRecords Lab - Safe migration for existing database
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to existing users table (if they don't exist)
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

-- Create artists table (using INTEGER for user_id to match existing users table)
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    bio TEXT,
    genre VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    website VARCHAR(255),
    social_media JSONB DEFAULT '{}'::jsonb,
    verification_status VARCHAR(20) DEFAULT 'pending',
    profile_image_url VARCHAR(500),
    banner_image_url VARCHAR(500),
    monthly_listeners INTEGER DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create releases table
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    credits JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft',
    isrc VARCHAR(50),
    catalog_number VARCHAR(100),
    label VARCHAR(255),
    copyright_info TEXT,
    explicit_content BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create books table (using existing structure but ensuring compatibility)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'books') THEN
        CREATE TABLE books (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            description TEXT,
            genre VARCHAR(100),
            language VARCHAR(50) DEFAULT 'en',
            isbn VARCHAR(20),
            publication_date DATE,
            page_count INTEGER,
            word_count INTEGER,
            cover_image_url VARCHAR(500),
            status VARCHAR(20) DEFAULT 'draft',
            price DECIMAL(10,2),
            currency VARCHAR(3) DEFAULT 'USD',
            copyright_info TEXT,
            keywords TEXT[],
            target_audience VARCHAR(100),
            book_format VARCHAR(20) DEFAULT 'ebook',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to existing books table
        ALTER TABLE books
            ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'en',
            ADD COLUMN IF NOT EXISTS isbn VARCHAR(20),
            ADD COLUMN IF NOT EXISTS publication_date DATE,
            ADD COLUMN IF NOT EXISTS page_count INTEGER,
            ADD COLUMN IF NOT EXISTS word_count INTEGER,
            ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
            ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
            ADD COLUMN IF NOT EXISTS copyright_info TEXT,
            ADD COLUMN IF NOT EXISTS keywords TEXT[],
            ADD COLUMN IF NOT EXISTS target_audience VARCHAR(100),
            ADD COLUMN IF NOT EXISTS book_format VARCHAR(20) DEFAULT 'ebook';
    END IF;
END
$$;

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, chapter_number)
);

-- Create essential tables for production
CREATE TABLE IF NOT EXISTS splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    collaborator_name VARCHAR(255) NOT NULL,
    collaborator_email VARCHAR(255),
    role VARCHAR(100),
    percentage DECIMAL(5,2) NOT NULL,
    split_type VARCHAR(20) DEFAULT 'master',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    payment_details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    streams INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    listeners INTEGER DEFAULT 0,
    countries JSONB DEFAULT '{}'::jsonb,
    age_demographics JSONB DEFAULT '{}'::jsonb,
    source_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(release_id, platform, date)
);

CREATE TABLE IF NOT EXISTS publishing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    store VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    page_reads INTEGER DEFAULT 0,
    countries JSONB DEFAULT '{}'::jsonb,
    source_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, store, date)
);

-- Create distribution channels
CREATE TABLE IF NOT EXISTS distribution_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    api_endpoint VARCHAR(500),
    api_key_required BOOLEAN DEFAULT true,
    supported_formats TEXT[],
    revenue_share DECIMAL(5,2) DEFAULT 0,
    payout_schedule VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);

-- Insert default distribution channels
INSERT INTO distribution_channels (name, type, supported_formats, is_active) VALUES
('Spotify', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true),
('Apple Music', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true),
('YouTube Music', 'music', ARRAY['MP3', 'WAV'], true),
('Amazon Music', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true)
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Database migration completed successfully!' as result;
