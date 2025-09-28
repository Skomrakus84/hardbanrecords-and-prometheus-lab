-- ========================================
-- HardbanRecords Music Platform - Distribution System
-- Migration: 002_create_distribution_tables.sql
-- Created: 2025-09-07
-- Description: Distribution platforms, delivery tracking, and platform management
-- ========================================

-- ========== Distribution Platforms ==========

-- Supported distribution platforms
CREATE TABLE distribution_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    platform_type VARCHAR(30) NOT NULL CHECK (platform_type IN ('streaming', 'download', 'social', 'radio', 'sync')),
    logo_url VARCHAR(500),
    website_url VARCHAR(255),
    
    -- Platform specifications
    audio_formats JSONB NOT NULL DEFAULT '[]', -- supported audio formats
    image_requirements JSONB NOT NULL DEFAULT '{}', -- cover art specs
    metadata_requirements JSONB NOT NULL DEFAULT '{}', -- required fields
    content_guidelines JSONB NOT NULL DEFAULT '{}', -- content rules
    
    -- Delivery settings
    delivery_method VARCHAR(30) NOT NULL DEFAULT 'api', -- api, ftp, manual
    api_endpoint VARCHAR(255),
    api_version VARCHAR(20),
    ftp_settings JSONB DEFAULT '{}',
    
    -- Business terms
    revenue_share_percentage DECIMAL(5,2) DEFAULT 0.00,
    minimum_payout_amount DECIMAL(10,2) DEFAULT 0.00,
    payout_frequency VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly
    payout_delay_days INTEGER DEFAULT 30,
    
    -- Platform status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 0,
    
    -- Geographic availability
    available_territories JSONB DEFAULT '[]', -- ISO country codes
    restricted_territories JSONB DEFAULT '[]',
    
    -- Integration settings
    supports_realtime_analytics BOOLEAN DEFAULT FALSE,
    supports_pre_orders BOOLEAN DEFAULT FALSE,
    supports_exclusive_releases BOOLEAN DEFAULT FALSE,
    max_track_duration INTEGER, -- in seconds
    min_track_duration INTEGER, -- in seconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User connections to platforms (API keys, credentials)
CREATE TABLE user_platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES distribution_platforms(id) ON DELETE CASCADE,
    
    -- Connection details
    connection_status VARCHAR(20) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'pending')),
    api_credentials JSONB DEFAULT '{}', -- encrypted credentials
    connection_metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, platform_id)
);

-- ========== Release Distribution ==========

-- Distribution jobs for releases
CREATE TABLE release_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES distribution_platforms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Distribution configuration
    distribution_config JSONB NOT NULL DEFAULT '{}',
    platform_release_id VARCHAR(255), -- ID from platform
    platform_url VARCHAR(500), -- URL on platform
    
    -- Scheduling
    scheduled_release_date DATE,
    actual_release_date DATE,
    takedown_date DATE,
    
    -- Status tracking
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'queued', 'processing', 'delivered', 'live', 'failed', 
        'rejected', 'takedown_requested', 'taken_down', 'error'
    )),
    substatus VARCHAR(50), -- platform-specific status
    
    -- Delivery tracking
    submission_id VARCHAR(255), -- platform submission ID
    delivery_started_at TIMESTAMP WITH TIME ZONE,
    delivery_completed_at TIMESTAMP WITH TIME ZONE,
    went_live_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Platform response data
    platform_response JSONB DEFAULT '{}',
    quality_check_results JSONB DEFAULT '{}',
    
    -- Analytics
    total_streams BIGINT DEFAULT 0,
    total_downloads BIGINT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    last_analytics_sync TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(release_id, platform_id)
);

-- Distribution history and timeline
CREATE TABLE distribution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_distribution_id UUID NOT NULL REFERENCES release_distributions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- submitted, approved, rejected, live, etc.
    event_status VARCHAR(30),
    event_message TEXT,
    event_data JSONB DEFAULT '{}',
    platform_event_id VARCHAR(255),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Platform Analytics Integration ==========

-- Platform analytics data cache
CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_distribution_id UUID NOT NULL REFERENCES release_distributions(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    
    -- Time period
    date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
    
    -- Metrics
    streams BIGINT DEFAULT 0,
    downloads BIGINT DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    royalties DECIMAL(12,2) DEFAULT 0.00,
    
    -- Detailed metrics
    unique_listeners INTEGER DEFAULT 0,
    repeat_listeners INTEGER DEFAULT 0,
    skip_rate DECIMAL(5,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Geographic data
    top_countries JSONB DEFAULT '[]',
    top_cities JSONB DEFAULT '[]',
    
    -- Demographic data
    age_demographics JSONB DEFAULT '{}',
    gender_demographics JSONB DEFAULT '{}',
    
    -- Raw platform data
    raw_data JSONB DEFAULT '{}',
    
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(release_distribution_id, track_id, date, period_type)
);

-- ========== Distribution Templates ==========

-- Pre-configured distribution templates
CREATE TABLE distribution_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    selected_platforms JSONB NOT NULL DEFAULT '[]', -- array of platform IDs
    platform_configs JSONB NOT NULL DEFAULT '{}', -- platform-specific configs
    default_settings JSONB NOT NULL DEFAULT '{}',
    
    -- Template metadata
    is_default BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Quality Control ==========

-- Quality control checks for distribution
CREATE TABLE distribution_quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES distribution_platforms(id) ON DELETE CASCADE,
    
    -- Check configuration
    check_type VARCHAR(50) NOT NULL, -- audio_quality, metadata, artwork, etc.
    check_name VARCHAR(255) NOT NULL,
    check_description TEXT,
    
    -- Check results
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'passed', 'failed', 'warning')),
    score DECIMAL(5,2), -- 0-100 quality score
    
    -- Issues found
    issues_found JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    suggestions JSONB DEFAULT '[]',
    
    -- Check metadata
    checked_at TIMESTAMP WITH TIME ZONE,
    check_duration_ms INTEGER,
    checker_version VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Indexes ==========

-- Distribution platform indexes
CREATE INDEX idx_distribution_platforms_name ON distribution_platforms(name);
CREATE INDEX idx_distribution_platforms_type ON distribution_platforms(platform_type);
CREATE INDEX idx_distribution_platforms_active ON distribution_platforms(is_active);
CREATE INDEX idx_distribution_platforms_priority ON distribution_platforms(priority_order);

-- User platform connection indexes
CREATE INDEX idx_user_platform_connections_user_id ON user_platform_connections(user_id);
CREATE INDEX idx_user_platform_connections_platform_id ON user_platform_connections(platform_id);
CREATE INDEX idx_user_platform_connections_status ON user_platform_connections(connection_status);

-- Release distribution indexes
CREATE INDEX idx_release_distributions_release_id ON release_distributions(release_id);
CREATE INDEX idx_release_distributions_platform_id ON release_distributions(platform_id);
CREATE INDEX idx_release_distributions_user_id ON release_distributions(user_id);
CREATE INDEX idx_release_distributions_status ON release_distributions(status);
CREATE INDEX idx_release_distributions_scheduled_date ON release_distributions(scheduled_release_date);
CREATE INDEX idx_release_distributions_actual_date ON release_distributions(actual_release_date);

-- Distribution events indexes
CREATE INDEX idx_distribution_events_distribution_id ON distribution_events(release_distribution_id);
CREATE INDEX idx_distribution_events_type ON distribution_events(event_type);
CREATE INDEX idx_distribution_events_occurred_at ON distribution_events(occurred_at);

-- Platform analytics indexes
CREATE INDEX idx_platform_analytics_distribution_id ON platform_analytics(release_distribution_id);
CREATE INDEX idx_platform_analytics_track_id ON platform_analytics(track_id);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX idx_platform_analytics_period_type ON platform_analytics(period_type);

-- Distribution templates indexes
CREATE INDEX idx_distribution_templates_user_id ON distribution_templates(user_id);
CREATE INDEX idx_distribution_templates_default ON distribution_templates(is_default);

-- Quality checks indexes
CREATE INDEX idx_distribution_quality_checks_release_id ON distribution_quality_checks(release_id);
CREATE INDEX idx_distribution_quality_checks_platform_id ON distribution_quality_checks(platform_id);
CREATE INDEX idx_distribution_quality_checks_type ON distribution_quality_checks(check_type);
CREATE INDEX idx_distribution_quality_checks_status ON distribution_quality_checks(status);

-- ========== Triggers ==========

CREATE TRIGGER update_distribution_platforms_updated_at BEFORE UPDATE ON distribution_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_platform_connections_updated_at BEFORE UPDATE ON user_platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_release_distributions_updated_at BEFORE UPDATE ON release_distributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_distribution_templates_updated_at BEFORE UPDATE ON distribution_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== Insert Default Platforms ==========

INSERT INTO distribution_platforms (name, display_name, platform_type, logo_url, website_url, audio_formats, image_requirements) VALUES
('spotify', 'Spotify', 'streaming', 'https://cdn.hardbanrecords.com/logos/spotify.png', 'https://spotify.com', 
 '["mp3", "flac", "wav"]', '{"min_size": "640x640", "max_size": "3000x3000", "format": "jpg"}'),
('apple_music', 'Apple Music', 'streaming', 'https://cdn.hardbanrecords.com/logos/apple-music.png', 'https://music.apple.com',
 '["mp3", "flac", "wav", "aiff"]', '{"min_size": "1400x1400", "max_size": "3000x3000", "format": "jpg"}'),
('amazon_music', 'Amazon Music', 'streaming', 'https://cdn.hardbanrecords.com/logos/amazon-music.png', 'https://music.amazon.com',
 '["mp3", "flac", "wav"]', '{"min_size": "640x640", "max_size": "3000x3000", "format": "jpg"}'),
('youtube_music', 'YouTube Music', 'streaming', 'https://cdn.hardbanrecords.com/logos/youtube-music.png', 'https://music.youtube.com',
 '["mp3", "flac", "wav"]', '{"min_size": "1280x720", "max_size": "1920x1080", "format": "jpg"}'),
('deezer', 'Deezer', 'streaming', 'https://cdn.hardbanrecords.com/logos/deezer.png', 'https://deezer.com',
 '["mp3", "flac", "wav"]', '{"min_size": "640x640", "max_size": "3000x3000", "format": "jpg"}'),
('tidal', 'TIDAL', 'streaming', 'https://cdn.hardbanrecords.com/logos/tidal.png', 'https://tidal.com',
 '["flac", "wav", "mp3"]', '{"min_size": "640x640", "max_size": "3000x3000", "format": "jpg"}'),
('bandcamp', 'Bandcamp', 'download', 'https://cdn.hardbanrecords.com/logos/bandcamp.png', 'https://bandcamp.com',
 '["flac", "wav", "mp3", "aiff"]', '{"min_size": "700x700", "max_size": "1400x1400", "format": "jpg"}'),
('soundcloud', 'SoundCloud', 'social', 'https://cdn.hardbanrecords.com/logos/soundcloud.png', 'https://soundcloud.com',
 '["mp3", "wav", "flac"]', '{"min_size": "800x800", "max_size": "2000x2000", "format": "jpg"}')
