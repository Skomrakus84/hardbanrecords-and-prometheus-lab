-- Music Distribution Module - Initial Migration
-- Pierwsza migracja: tabele bazowe

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(100),
    biography TEXT,
    genres JSONB,
    country CHAR(2), -- ISO 3166-1 alpha-2
    profile_image TEXT, -- URL to profile image
    social_links JSONB, -- Social media links
    contact_info JSONB, -- Contact information
    distribution_settings JSONB, -- Default distribution settings
    payout_settings JSONB, -- Payout preferences
    labels JSONB, -- Associated labels
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1
);

-- Labels table
CREATE TABLE IF NOT EXISTS labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID, -- Reference to user who owns the label
    logo_image TEXT, -- URL to logo
    contact_info JSONB,
    distribution_settings JSONB,
    payout_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1
);

-- Releases table
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'ep', 'album', 'compilation', 'remix', 'live')),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    label_id UUID REFERENCES labels(id) ON DELETE SET NULL,
    release_date DATE NOT NULL,
    original_release_date DATE,
    upc CHAR(12), -- Universal Product Code
    catalog_number VARCHAR(50),
    description TEXT,
    genres JSONB NOT NULL,
    subgenres JSONB,
    moods JSONB,
    language CHAR(2), -- ISO 639-1
    explicit_content BOOLEAN DEFAULT false,
    artwork JSONB NOT NULL, -- Cover image and additional artwork
    distribution_settings JSONB NOT NULL,
    ugc_policy JSONB, -- User Generated Content policy
    rights_info JSONB, -- P-line, C-line, ISRC info
    tracks JSONB, -- Track listing with metadata
    collaborators JSONB, -- Collaborators and their splits
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'distributed', 'live', 'taken-down', 'rejected')),
    submission_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1
);

-- Tracks table (individual tracks)
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in seconds
    track_number INTEGER NOT NULL,
    disc_number INTEGER DEFAULT 1,
    audio_file TEXT NOT NULL, -- URL to audio file
    isrc CHAR(12), -- International Standard Recording Code
    explicit_content BOOLEAN DEFAULT false,
    contributors JSONB, -- Songwriters, producers, etc.
    lyrics TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(release_id, track_number, disc_number)
);

-- Track Contributors table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS track_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- songwriter, producer, performer, etc.
    contribution_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(track_id, artist_id, role)
);

-- ISRC registry table
CREATE TABLE IF NOT EXISTS isrc_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isrc_code CHAR(12) NOT NULL UNIQUE,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    registrant_code CHAR(3) NOT NULL,
    year_of_reference CHAR(2) NOT NULL,
    designation_code CHAR(5) NOT NULL,
    allocated_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'allocated' CHECK (status IN ('allocated', 'assigned', 'used', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UPC registry table
CREATE TABLE IF NOT EXISTS upc_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upc_code CHAR(12) NOT NULL UNIQUE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    allocated_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'allocated' CHECK (status IN ('allocated', 'assigned', 'used', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Distribution Channels table
CREATE TABLE IF NOT EXISTS distribution_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT,
    is_active BOOLEAN DEFAULT true,
    supported_territories JSONB, -- Array of ISO country codes
    supported_formats JSONB, -- Supported audio/artwork formats
    delivery_requirements JSONB, -- Technical requirements
    revenue_share DECIMAL(5,4), -- Platform's revenue share (0.0000 to 1.0000)
    payout_frequency VARCHAR(20), -- monthly, quarterly, etc.
    minimum_payout DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Release Distribution Status table
CREATE TABLE IF NOT EXISTS release_distribution_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES distribution_channels(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'submitted', 'processing', 'live', 'rejected', 'taken-down')),
    external_id VARCHAR(100), -- Platform's internal ID for the release
    submission_date TIMESTAMP WITH TIME ZONE,
    live_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    metadata JSONB, -- Platform-specific metadata
    UNIQUE(release_id, channel_id)
);

-- UGC Policy table
CREATE TABLE IF NOT EXISTS ugc_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- youtube, facebook, tiktok, etc.
    policy_type VARCHAR(20) NOT NULL CHECK (policy_type IN ('monetize', 'track', 'block')),
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB, -- Platform-specific settings
    external_policy_id VARCHAR(100), -- Platform's policy ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(release_id, platform)
);

-- Royalty Statements table
CREATE TABLE IF NOT EXISTS royalty_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES distribution_channels(id) ON DELETE CASCADE,
    statement_period_start DATE NOT NULL,
    statement_period_end DATE NOT NULL,
    currency CHAR(3) NOT NULL, -- ISO 4217
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_units INTEGER NOT NULL DEFAULT 0,
    file_url TEXT, -- URL to original statement file
    parsed_data JSONB, -- Parsed statement data
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, statement_period_start, statement_period_end)
);

-- Royalty Splits table
CREATE TABLE IF NOT EXISTS royalty_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    split_type VARCHAR(20) NOT NULL CHECK (split_type IN ('master', 'publishing', 'performance')),
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    effective_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payout Methods table
CREATE TABLE IF NOT EXISTS payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('stripe', 'paypal', 'wise', 'bank_transfer')),
    currency CHAR(3) NOT NULL,
    minimum_payout DECIMAL(10,2) DEFAULT 10.00,
    account_details JSONB NOT NULL, -- Encrypted account details
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
    expense_type VARCHAR(50) NOT NULL, -- mastering, promotion, artwork, etc.
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    description TEXT,
    receipt_url TEXT,
    date_incurred DATE NOT NULL,
    is_recoupable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Recoupment table
CREATE TABLE IF NOT EXISTS recoupment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    total_expenses DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_recouped DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    remaining_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    recoup_percentage DECIMAL(5,2) DEFAULT 50.00, -- Percentage of revenue used for recoupment
    is_recouped BOOLEAN DEFAULT false,
    currency CHAR(3) NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, release_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL, -- Artist/User ID
    type VARCHAR(50) NOT NULL, -- payout, release_approved, royalty_statement, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    is_email_sent BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_country ON artists(country);
CREATE INDEX IF NOT EXISTS idx_artists_active ON artists(is_active);
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_type ON releases(type);
CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_isrc ON tracks(isrc);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_channel ON royalty_statements(channel_id);
CREATE INDEX IF NOT EXISTS idx_royalty_statements_period ON royalty_statements(statement_period_start, statement_period_end);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Insert default distribution channels
INSERT INTO distribution_channels (name, display_name, supported_territories, supported_formats, revenue_share, payout_frequency) VALUES
('spotify', 'Spotify', '["worldwide"]', '["mp3", "flac", "wav"]', 0.7000, 'monthly'),
('apple-music', 'Apple Music', '["worldwide"]', '["aac", "alac", "wav"]', 0.7000, 'monthly'),
('youtube-music', 'YouTube Music', '["worldwide"]', '["mp3", "wav"]', 0.6800, 'monthly'),
('amazon-music', 'Amazon Music', '["worldwide"]', '["mp3", "flac"]', 0.7000, 'monthly'),
('deezer', 'Deezer', '["worldwide"]', '["mp3", "flac"]', 0.7000, 'monthly'),
('tidal', 'TIDAL', '["worldwide"]', '["flac", "wav"]', 0.7000, 'monthly'),
('pandora', 'Pandora', '["US", "AU", "NZ"]', '["mp3", "aac"]', 0.7000, 'monthly'),
('soundcloud', 'SoundCloud', '["worldwide"]', '["mp3", "wav"]', 0.5500, 'monthly')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON labels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_distribution_channels_updated_at BEFORE UPDATE ON distribution_channels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_royalty_statements_updated_at BEFORE UPDATE ON royalty_statements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_royalty_splits_updated_at BEFORE UPDATE ON royalty_splits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payout_methods_updated_at BEFORE UPDATE ON payout_methods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recoupment_updated_at BEFORE UPDATE ON recoupment FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
