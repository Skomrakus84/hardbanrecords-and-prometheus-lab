-- Production Database Setup Script
-- Run this script to prepare database for production deployment

-- =================================================================
-- PRODUCTION DATABASE MIGRATION SCRIPT
-- HardbanRecords Lab - Complete Schema Setup
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if users table exists and get its structure
DO $$
BEGIN
    -- If users table doesn't exist, create with UUID
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'artist', 'publisher')),
            is_active BOOLEAN DEFAULT true,
            email_verified BOOLEAN DEFAULT false,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Create artists table (compatible with existing users table)
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
    social_media JSONB DEFAULT '{}',
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
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
    duration INTEGER, -- in seconds
    bpm INTEGER,
    key_signature VARCHAR(10),
    lyrics TEXT,
    credits JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'released')),
    isrc VARCHAR(50),
    catalog_number VARCHAR(100),
    label VARCHAR(255),
    copyright_info TEXT,
    explicit_content BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create splits table for royalty management
CREATE TABLE IF NOT EXISTS splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    collaborator_name VARCHAR(255) NOT NULL,
    collaborator_email VARCHAR(255),
    role VARCHAR(100), -- artist, producer, songwriter, publisher
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    split_type VARCHAR(20) DEFAULT 'master' CHECK (split_type IN ('master', 'publishing', 'performance')),
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    payment_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
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
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'writing', 'editing', 'review', 'published')),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    copyright_info TEXT,
    keywords TEXT[],
    target_audience VARCHAR(100),
    book_format VARCHAR(20) DEFAULT 'ebook' CHECK (book_format IN ('ebook', 'paperback', 'hardcover', 'audiobook')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'writing', 'editing', 'complete')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, chapter_number)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    module VARCHAR(20) DEFAULT 'general' CHECK (module IN ('music', 'publishing', 'general')),
    related_id UUID, -- Can reference releases, books, etc.
    related_type VARCHAR(20), -- release, book, chapter
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to INTEGER REFERENCES users(id),
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS music_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    streams INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    listeners INTEGER DEFAULT 0,
    countries JSONB DEFAULT '{}',
    age_demographics JSONB DEFAULT '{}',
    source_data JSONB DEFAULT '{}',
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
    countries JSONB DEFAULT '{}',
    source_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, store, date)
);

-- Create royalty tables
CREATE TABLE IF NOT EXISTS royalty_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    platform_breakdown JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    royalty_statement_id UUID REFERENCES royalty_statements(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create distribution tables
CREATE TABLE IF NOT EXISTS distribution_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('music', 'publishing')),
    api_endpoint VARCHAR(500),
    api_key_required BOOLEAN DEFAULT true,
    supported_formats TEXT[],
    revenue_share DECIMAL(5,2) DEFAULT 0,
    payout_schedule VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS distribution_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES distribution_channels(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'processing', 'live', 'rejected', 'removed')),
    external_id VARCHAR(255),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    live_date TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(release_id, channel_id)
);

-- Create publishing store tables
CREATE TABLE IF NOT EXISTS publishing_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint VARCHAR(500),
    supported_formats TEXT[],
    revenue_share DECIMAL(5,2) DEFAULT 0,
    payout_schedule VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    store_id UUID REFERENCES publishing_stores(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'processing', 'live', 'rejected', 'removed')),
    external_id VARCHAR(255),
    store_url VARCHAR(500),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    live_date TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_data JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, store_id)
);

-- Create rights management tables
CREATE TABLE IF NOT EXISTS publication_rights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    territory VARCHAR(100) NOT NULL,
    rights_type VARCHAR(50) NOT NULL CHECK (rights_type IN ('exclusive', 'non_exclusive', 'limited')),
    start_date DATE NOT NULL,
    end_date DATE,
    licensee_name VARCHAR(255),
    licensee_contact JSONB DEFAULT '{}',
    terms_conditions TEXT,
    royalty_rate DECIMAL(5,2),
    advance_payment DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    drm_enabled BOOLEAN DEFAULT false,
    copy_protection BOOLEAN DEFAULT true,
    print_protection BOOLEAN DEFAULT true,
    access_restrictions JSONB DEFAULT '{}',
    allowed_devices INTEGER DEFAULT 5,
    loan_enabled BOOLEAN DEFAULT false,
    loan_duration_days INTEGER DEFAULT 14,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create format conversion tables
CREATE TABLE IF NOT EXISTS conversion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    source_format VARCHAR(10) NOT NULL,
    target_format VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    source_file_url VARCHAR(500),
    output_file_url VARCHAR(500),
    conversion_options JSONB DEFAULT '{}',
    quality_score INTEGER,
    error_message TEXT,
    processing_time INTEGER, -- in seconds
    file_size_original BIGINT,
    file_size_converted BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_genre ON releases(genre);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_module ON tasks(module);
CREATE INDEX IF NOT EXISTS idx_music_analytics_release_date ON music_analytics(release_id, date);
CREATE INDEX IF NOT EXISTS idx_publishing_analytics_book_date ON publishing_analytics(book_id, date);
CREATE INDEX IF NOT EXISTS idx_splits_release_id ON splits(release_id);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_user_id ON royalty_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_releases_release_id ON distribution_releases(release_id);
CREATE INDEX IF NOT EXISTS idx_store_publications_book_id ON store_publications(book_id);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_user_id ON conversion_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_book_id ON conversion_jobs(book_id);

-- Insert default distribution channels
INSERT INTO distribution_channels (name, type, supported_formats, is_active) VALUES
('Spotify', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true),
('Apple Music', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true),
('YouTube Music', 'music', ARRAY['MP3', 'WAV'], true),
('Amazon Music', 'music', ARRAY['MP3', 'WAV', 'FLAC'], true),
('Deezer', 'music', ARRAY['MP3', 'FLAC'], true),
('Tidal', 'music', ARRAY['FLAC', 'WAV'], true),
('SoundCloud', 'music', ARRAY['MP3', 'WAV'], true),
('Bandcamp', 'music', ARRAY['MP3', 'FLAC', 'WAV'], true)
ON CONFLICT (name) DO NOTHING;

-- Insert default publishing stores
INSERT INTO publishing_stores (name, supported_formats, is_active) VALUES
('Amazon Kindle', ARRAY['EPUB', 'MOBI', 'PDF'], true),
('Apple Books', ARRAY['EPUB', 'PDF'], true),
('Google Play Books', ARRAY['EPUB', 'PDF'], true),
('Barnes & Noble', ARRAY['EPUB', 'PDF'], true),
('Kobo', ARRAY['EPUB', 'PDF'], true),
('Draft2Digital', ARRAY['EPUB', 'MOBI', 'PDF'], true),
('Smashwords', ARRAY['EPUB', 'MOBI', 'PDF'], true),
('Lulu', ARRAY['PDF', 'EPUB'], true)
ON CONFLICT (name) DO NOTHING;

-- Create admin user (change password in production!)
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin@hardbanrecords.com', '$2b$10$placeholder_hash', 'Admin', 'User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'artists', 'releases', 'splits', 'books', 'chapters', 'tasks', 'royalty_statements', 'payouts', 'distribution_releases', 'store_publications', 'publication_rights', 'drm_settings', 'conversion_jobs')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END
$$;
