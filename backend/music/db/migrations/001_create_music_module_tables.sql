-- ========================================
-- HardbanRecords Music Module - Specialized Tables
-- Migration: 001_create_music_module_tables.sql
-- Created: 2025-09-07
-- Description: Music module specific tables for advanced features
-- ========================================

-- ========== Advanced Analytics ==========

-- Detailed streaming analytics
CREATE TABLE streaming_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES distribution_platforms(id) ON DELETE CASCADE,
    
    -- Time period
    date DATE NOT NULL,
    hour_bucket INTEGER, -- 0-23 for hourly data
    
    -- Streaming metrics
    plays BIGINT DEFAULT 0,
    unique_listeners INTEGER DEFAULT 0,
    total_listen_time INTEGER DEFAULT 0, -- in seconds
    
    -- Listener behavior
    skip_rate DECIMAL(5,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    repeat_listeners INTEGER DEFAULT 0,
    playlist_adds INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    
    -- Geographic data
    country_code CHAR(2),
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- Demographic data
    age_group VARCHAR(20), -- 13-17, 18-24, 25-34, etc.
    gender VARCHAR(10),
    
    -- Device/platform info
    device_type VARCHAR(30), -- mobile, desktop, smart_speaker, etc.
    platform_version VARCHAR(50),
    
    -- Revenue
    revenue DECIMAL(10,4) DEFAULT 0.0000,
    royalty DECIMAL(10,4) DEFAULT 0.0000,
    
    -- Data source
    data_source VARCHAR(50) NOT NULL, -- spotify_api, apple_connect, etc.
    raw_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(track_id, platform_id, date, hour_bucket, country_code, age_group, gender, device_type)
);

-- Real-time analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- play, skip, download, share, etc.
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event details
    platform VARCHAR(50),
    country_code CHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(30),
    user_agent TEXT,
    
    -- Event metadata
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    
    -- Revenue if applicable
    revenue_amount DECIMAL(10,4) DEFAULT 0.0000,
    
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- ========== Advanced Music Features ==========

-- Music collaboration requests
CREATE TABLE collaboration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Request details
    collaboration_type VARCHAR(30) NOT NULL, -- feature, remix, production, etc.
    message TEXT,
    proposed_terms JSONB DEFAULT '{}',
    
    -- Related content
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Terms agreed upon
    final_terms JSONB DEFAULT '{}',
    contract_url VARCHAR(500),
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Music playlists (user-generated and editorial)
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Playlist details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    
    -- Playlist type
    playlist_type VARCHAR(20) DEFAULT 'user' CHECK (playlist_type IN ('user', 'editorial', 'algorithmic', 'collaborative')),
    is_public BOOLEAN DEFAULT TRUE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    total_tracks INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in seconds
    genres JSONB DEFAULT '[]',
    moods JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- Analytics
    total_followers INTEGER DEFAULT 0,
    total_plays BIGINT DEFAULT 0,
    
    -- Curation
    curator_notes TEXT,
    submission_guidelines TEXT,
    accepts_submissions BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlist tracks relationship
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    
    -- Position and metadata
    position INTEGER NOT NULL,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Notes
    curator_notes TEXT,
    
    UNIQUE(playlist_id, track_id)
);

-- Playlist followers
CREATE TABLE playlist_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(playlist_id, profile_id)
);

-- ========== Music Discovery & Recommendation ==========

-- Track similarity and recommendations
CREATE TABLE track_similarities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_a_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    track_b_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    
    -- Similarity metrics
    similarity_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    similarity_type VARCHAR(30) NOT NULL, -- acoustic, genre, mood, etc.
    
    -- Algorithm details
    algorithm_version VARCHAR(50),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    features_compared JSONB DEFAULT '{}',
    
    UNIQUE(track_a_id, track_b_id, similarity_type),
    CHECK (track_a_id != track_b_id)
);

-- User listening history for recommendations
CREATE TABLE listening_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Session details
    session_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50),
    device_type VARCHAR(30),
    
    -- Geographic
    country_code CHAR(2),
    city VARCHAR(100),
    
    -- Session metrics
    total_tracks_played INTEGER DEFAULT 0,
    total_listen_time INTEGER DEFAULT 0, -- in seconds
    unique_artists INTEGER DEFAULT 0,
    
    -- Session data
    tracks_played JSONB DEFAULT '[]', -- array of track play data
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- ========== Content Management ==========

-- Music genres and tags taxonomy
CREATE TABLE music_genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES music_genres(id) ON DELETE CASCADE,
    
    -- Display
    description TEXT,
    color_hex CHAR(7), -- #RRGGBB
    icon_name VARCHAR(50),
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    popularity_score INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Music moods taxonomy
CREATE TABLE music_moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    
    -- Display
    description TEXT,
    color_hex CHAR(7),
    icon_name VARCHAR(50),
    
    -- Classification
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    valence INTEGER CHECK (valence >= 1 AND valence <= 10), -- positive/negative
    arousal INTEGER CHECK (arousal >= 1 AND arousal <= 10), -- calm/exciting
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    popularity_score INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Notification System ==========

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL, -- release_approved, payout_processed, etc.
    category VARCHAR(30) NOT NULL, -- music, financial, social, system
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    related_release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    related_track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    delivery_channels JSONB DEFAULT '[]', -- push, email, sms
    delivered_at JSONB DEFAULT '{}', -- channel -> timestamp
    
    -- Actions
    action_url VARCHAR(500),
    action_data JSONB DEFAULT '{}',
    
    -- Priority
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification types
    notification_type VARCHAR(50) NOT NULL,
    
    -- Channel preferences
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Timing preferences
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50),
    
    -- Frequency
    frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, hourly, daily, weekly
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, notification_type)
);

-- ========== Indexes ==========

-- Analytics indexes
CREATE INDEX idx_streaming_analytics_track_id ON streaming_analytics(track_id);
CREATE INDEX idx_streaming_analytics_platform_id ON streaming_analytics(platform_id);
CREATE INDEX idx_streaming_analytics_date ON streaming_analytics(date);
CREATE INDEX idx_streaming_analytics_country ON streaming_analytics(country_code);

CREATE INDEX idx_analytics_events_track_id ON analytics_events(track_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_occurred_at ON analytics_events(occurred_at);
CREATE INDEX idx_analytics_events_processed ON analytics_events(processed);

-- Collaboration indexes
CREATE INDEX idx_collaboration_requests_from_profile ON collaboration_requests(from_profile_id);
CREATE INDEX idx_collaboration_requests_to_profile ON collaboration_requests(to_profile_id);
CREATE INDEX idx_collaboration_requests_status ON collaboration_requests(status);
CREATE INDEX idx_collaboration_requests_type ON collaboration_requests(collaboration_type);

-- Playlist indexes
CREATE INDEX idx_playlists_profile_id ON playlists(profile_id);
CREATE INDEX idx_playlists_type ON playlists(playlist_type);
CREATE INDEX idx_playlists_public ON playlists(is_public);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX idx_playlist_followers_playlist_id ON playlist_followers(playlist_id);
CREATE INDEX idx_playlist_followers_profile_id ON playlist_followers(profile_id);

-- Similarity indexes
CREATE INDEX idx_track_similarities_track_a ON track_similarities(track_a_id);
CREATE INDEX idx_track_similarities_track_b ON track_similarities(track_b_id);
CREATE INDEX idx_track_similarities_type ON track_similarities(similarity_type);
CREATE INDEX idx_track_similarities_score ON track_similarities(similarity_score);

-- Listening session indexes
CREATE INDEX idx_listening_sessions_user_id ON listening_sessions(user_id);
CREATE INDEX idx_listening_sessions_profile_id ON listening_sessions(profile_id);
CREATE INDEX idx_listening_sessions_started_at ON listening_sessions(started_at);

-- Genre and mood indexes
CREATE INDEX idx_music_genres_parent_id ON music_genres(parent_id);
CREATE INDEX idx_music_genres_slug ON music_genres(slug);
CREATE INDEX idx_music_genres_active ON music_genres(is_active);
CREATE INDEX idx_music_moods_slug ON music_moods(slug);
CREATE INDEX idx_music_moods_active ON music_moods(is_active);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ========== Triggers ==========

CREATE TRIGGER update_collaboration_requests_updated_at BEFORE UPDATE ON collaboration_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_music_genres_updated_at BEFORE UPDATE ON music_genres FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_music_moods_updated_at BEFORE UPDATE ON music_moods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
