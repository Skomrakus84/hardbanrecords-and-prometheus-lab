-- ========================================
-- HardbanRecords Music Platform - Core Database Schema
-- Migration: 001_create_core_tables.sql
-- Created: 2025-09-07
-- Description: Core database structure for music distribution platform
-- ========================================

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== Core Users & Authentication ==========

-- Users table - main user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    country_code CHAR(2),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language CHAR(2) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User role assignments
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id)
);

-- ========== Profile System ==========

-- Artist/Label profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('artist', 'label', 'producer', 'songwriter')),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    website VARCHAR(255),
    location VARCHAR(255),
    genres JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verification_submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    total_releases INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profile followers
CREATE TABLE profile_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ========== Music Content Structure ==========

-- Music releases (albums, EPs, singles)
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    release_type VARCHAR(20) NOT NULL CHECK (release_type IN ('album', 'ep', 'single', 'compilation', 'live', 'remix')),
    cover_art_url VARCHAR(500),
    cover_art_colors JSONB DEFAULT '{}',
    release_date DATE,
    original_release_date DATE,
    upc VARCHAR(20) UNIQUE,
    catalog_number VARCHAR(50),
    label VARCHAR(255),
    copyright_notice TEXT,
    phonographic_copyright TEXT,
    language CHAR(2) DEFAULT 'en',
    genre VARCHAR(100),
    subgenres JSONB DEFAULT '[]',
    moods JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    explicit_content BOOLEAN DEFAULT FALSE,
    instrumental BOOLEAN DEFAULT FALSE,
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'distributed', 'takedown')),
    workflow_stage VARCHAR(30) DEFAULT 'creation',
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    distributed_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    total_tracks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    total_streams BIGINT DEFAULT 0,
    total_downloads BIGINT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    distribution_metadata JSONB DEFAULT '{}',
    platform_specific_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual tracks
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    version VARCHAR(100), -- remix, radio edit, etc.
    track_number INTEGER,
    disc_number INTEGER DEFAULT 1,
    isrc VARCHAR(20) UNIQUE,
    
    -- Audio properties
    duration INTEGER, -- in seconds
    tempo INTEGER, -- BPM
    key_signature VARCHAR(10),
    time_signature VARCHAR(10),
    audio_file_url VARCHAR(500),
    audio_file_size BIGINT,
    audio_format VARCHAR(20),
    audio_quality VARCHAR(20),
    waveform_data JSONB,
    preview_url VARCHAR(500),
    preview_start_time INTEGER DEFAULT 30,
    preview_duration INTEGER DEFAULT 30,
    
    -- Content classification
    genre VARCHAR(100),
    subgenres JSONB DEFAULT '[]',
    moods JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    language CHAR(2) DEFAULT 'en',
    explicit_content BOOLEAN DEFAULT FALSE,
    instrumental BOOLEAN DEFAULT FALSE,
    
    -- Rights and licensing
    copyright_notice TEXT,
    phonographic_copyright TEXT,
    sync_licensing_available BOOLEAN DEFAULT TRUE,
    licensing_terms JSONB DEFAULT '{}',
    
    -- Analytics
    total_streams BIGINT DEFAULT 0,
    total_downloads BIGINT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    last_played_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processing', 'error')),
    processing_status VARCHAR(30),
    quality_check_passed BOOLEAN,
    quality_check_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    lyrics TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track credits (producers, writers, performers, etc.)
CREATE TABLE track_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL, -- for non-platform users
    role VARCHAR(100) NOT NULL, -- producer, songwriter, performer, etc.
    role_category VARCHAR(50), -- creative, technical, business
    contribution_percentage DECIMAL(5,2),
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Indexes for Performance ==========

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Profile indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_type ON profiles(type);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX idx_profiles_is_public ON profiles(is_public);
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Release indexes
CREATE INDEX idx_releases_profile_id ON releases(profile_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_releases_release_date ON releases(release_date);
CREATE INDEX idx_releases_release_type ON releases(release_type);
CREATE INDEX idx_releases_genre ON releases(genre);
CREATE INDEX idx_releases_created_at ON releases(created_at);
CREATE INDEX idx_releases_upc ON releases(upc);

-- Track indexes
CREATE INDEX idx_tracks_release_id ON tracks(release_id);
CREATE INDEX idx_tracks_profile_id ON tracks(profile_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);
CREATE INDEX idx_tracks_created_at ON tracks(created_at);

-- Credit indexes
CREATE INDEX idx_track_credits_track_id ON track_credits(track_id);
CREATE INDEX idx_track_credits_profile_id ON track_credits(profile_id);
CREATE INDEX idx_track_credits_role ON track_credits(role);

-- Follower indexes
CREATE INDEX idx_profile_followers_follower_id ON profile_followers(follower_id);
CREATE INDEX idx_profile_followers_following_id ON profile_followers(following_id);

-- ========== Insert Default Data ==========

-- Insert default user roles
INSERT INTO user_roles (name, description, permissions) VALUES
('admin', 'Platform Administrator', '{"all": true, "admin": true, "moderation": true, "finance": true}'),
('moderator', 'Content Moderator', '{"moderation": true, "content_review": true}'),
('finance', 'Finance Manager', '{"finance": true, "payouts": true, "reports": true}'),
('artist', 'Artist User', '{"content_creation": true, "analytics": true}'),
('label', 'Label Manager', '{"content_creation": true, "analytics": true, "artist_management": true}'),
('user', 'Basic User', '{"basic_access": true}');

-- ========== Triggers for Updated Timestamps ==========

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
