-- Digital Publishing Module - Initial Migration
-- Pierwsza migracja: tabele autorów i publikacji

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pen_name VARCHAR(100) NOT NULL,
    real_name VARCHAR(100),
    biography TEXT,
    profile_image TEXT, -- URL to profile image
    social_links JSONB, -- Social media links
    contact_info JSONB, -- Contact information
    tax_info JSONB, -- Tax information for royalties
    payout_settings JSONB, -- Payout preferences
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1
);

-- Publications table
CREATE TABLE IF NOT EXISTS publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    subtitle VARCHAR(300),
    series_name VARCHAR(200),
    series_number INTEGER,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    description TEXT,
    language CHAR(2) NOT NULL DEFAULT 'en', -- ISO 639-1
    isbn_13 CHAR(13), -- ISBN-13 without hyphens
    isbn_10 CHAR(10), -- ISBN-10 without hyphens
    asin VARCHAR(10), -- Amazon Standard Identification Number
    publication_date DATE,
    first_publication_date DATE,
    page_count INTEGER,
    word_count INTEGER,
    reading_age_min INTEGER,
    reading_age_max INTEGER,
    content_warning JSONB, -- Content warnings/triggers
    cover_image TEXT NOT NULL, -- URL to cover image
    back_cover_image TEXT, -- URL to back cover
    spine_image TEXT, -- URL to spine image for print
    marketing_images JSONB, -- Additional marketing images
    price_settings JSONB NOT NULL, -- Pricing for different formats and regions
    categories JSONB NOT NULL, -- BISAC categories
    keywords JSONB, -- Marketing keywords
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'suspended', 'archived')),
    publication_type VARCHAR(20) NOT NULL CHECK (publication_type IN ('ebook', 'paperback', 'hardcover', 'audiobook', 'bundle')),
    drm_settings JSONB, -- DRM protection settings
    preview_percentage DECIMAL(3,1) DEFAULT 10.0, -- Percentage available for preview
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    version INTEGER DEFAULT 1
);

-- Publication Formats table
CREATE TABLE IF NOT EXISTS publication_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    format_type VARCHAR(20) NOT NULL CHECK (format_type IN ('epub', 'pdf', 'mobi', 'azw3', 'docx', 'mp3', 'wav', 'm4a')),
    file_url TEXT NOT NULL, -- URL to the formatted file
    file_size BIGINT, -- File size in bytes
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    quality_settings JSONB, -- Format-specific quality settings
    conversion_status VARCHAR(20) DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'processing', 'completed', 'failed')),
    error_log TEXT, -- Conversion error details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, format_type)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    chapter_number INTEGER NOT NULL,
    content TEXT NOT NULL, -- Chapter content in markdown or HTML
    word_count INTEGER,
    reading_time_minutes INTEGER, -- Estimated reading time
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, chapter_number),
    UNIQUE(publication_id, sort_order)
);

-- ISBN Registry table
CREATE TABLE IF NOT EXISTS isbn_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn_13 CHAR(13) NOT NULL UNIQUE,
    isbn_10 CHAR(10) UNIQUE,
    publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
    publisher_prefix VARCHAR(7) NOT NULL, -- Publisher identifier
    title_identifier VARCHAR(6) NOT NULL, -- Title-specific identifier
    allocated_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'allocated' CHECK (status IN ('allocated', 'assigned', 'published', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BISAC Categories table
CREATE TABLE IF NOT EXISTS bisac_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE, -- BISAC category code
    name VARCHAR(300) NOT NULL,
    parent_code VARCHAR(10), -- Parent category code
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publication BISAC Categories junction table
CREATE TABLE IF NOT EXISTS publication_bisac_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    bisac_category_id UUID NOT NULL REFERENCES bisac_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Primary category for the publication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, bisac_category_id)
);

-- Territorial Rights table
CREATE TABLE IF NOT EXISTS territorial_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    territory_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code
    rights_type VARCHAR(20) NOT NULL CHECK (rights_type IN ('exclusive', 'non_exclusive', 'prohibited')),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, territory_code)
);

-- Translation Licenses table
CREATE TABLE IF NOT EXISTS translation_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    licensee_name VARCHAR(200) NOT NULL,
    licensee_contact JSONB,
    target_language CHAR(2) NOT NULL, -- ISO 639-1
    territory_codes JSONB, -- Array of territory codes
    license_fee DECIMAL(10,2),
    royalty_percentage DECIMAL(5,2),
    currency CHAR(3), -- ISO 4217
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'terminated')),
    contract_url TEXT, -- URL to signed contract
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adaptation Licenses table
CREATE TABLE IF NOT EXISTS adaptation_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    licensee_name VARCHAR(200) NOT NULL,
    licensee_contact JSONB,
    adaptation_type VARCHAR(50) NOT NULL, -- film, tv, game, audiobook, etc.
    territory_codes JSONB, -- Array of territory codes
    license_fee DECIMAL(10,2),
    royalty_percentage DECIMAL(5,2),
    currency CHAR(3), -- ISO 4217
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'terminated')),
    contract_url TEXT, -- URL to signed contract
    deliverables JSONB, -- Required deliverables
    milestones JSONB, -- Project milestones
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DRM Policies table
CREATE TABLE IF NOT EXISTS drm_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    policy_name VARCHAR(100) NOT NULL,
    drm_type VARCHAR(20) NOT NULL CHECK (drm_type IN ('adobe_drm', 'watermark', 'social_drm', 'none')),
    settings JSONB NOT NULL, -- DRM-specific settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, policy_name)
);

-- Sales Reports table
CREATE TABLE IF NOT EXISTS sales_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_channel_id UUID NOT NULL, -- Reference to store channel
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    units_sold INTEGER NOT NULL DEFAULT 0,
    revenue_gross DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    revenue_net DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    royalty_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency CHAR(3) NOT NULL,
    territory_code CHAR(2), -- Territory where sale occurred
    format_type VARCHAR(20), -- Format sold
    raw_data JSONB, -- Original report data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_channel_id, publication_id, report_period_start, report_period_end)
);

-- Store Channels table
CREATE TABLE IF NOT EXISTS store_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT,
    is_active BOOLEAN DEFAULT true,
    supported_territories JSONB, -- Array of ISO country codes
    supported_formats JSONB, -- Supported publication formats
    pricing_requirements JSONB, -- Pricing rules and requirements
    content_requirements JSONB, -- Content guidelines and requirements
    royalty_percentage DECIMAL(5,2), -- Store's royalty percentage
    payment_schedule VARCHAR(20), -- monthly, quarterly, etc.
    minimum_payout DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publication Distribution Status table
CREATE TABLE IF NOT EXISTS publication_distribution_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    store_channel_id UUID NOT NULL REFERENCES store_channels(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'submitted', 'processing', 'live', 'rejected', 'removed')),
    external_id VARCHAR(100), -- Store's internal ID for the publication
    submission_date TIMESTAMP WITH TIME ZONE,
    live_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    metadata JSONB, -- Store-specific metadata
    UNIQUE(publication_id, store_channel_id)
);

-- Collaborations table
CREATE TABLE IF NOT EXISTS collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    collaborator_type VARCHAR(20) NOT NULL CHECK (collaborator_type IN ('co_author', 'editor', 'translator', 'illustrator', 'narrator')),
    collaborator_name VARCHAR(200) NOT NULL,
    collaborator_email VARCHAR(255),
    collaborator_id UUID, -- Reference to users table if they have an account
    role_description TEXT,
    revenue_share DECIMAL(5,2) DEFAULT 0.00, -- Percentage of revenue
    permissions JSONB, -- What they can do (read, edit, comment, etc.)
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'inactive', 'removed')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    UNIQUE(publication_id, collaborator_email, collaborator_type)
);

-- Version History table
CREATE TABLE IF NOT EXISTS version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL, -- e.g., "1.0", "1.1", "2.0"
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('major', 'minor', 'patch', 'hotfix')),
    description TEXT NOT NULL,
    changes_summary JSONB, -- Detailed list of changes
    file_snapshot_url TEXT, -- URL to archived version of files
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publication_id, version_number)
);

-- Publishing Notifications table
CREATE TABLE IF NOT EXISTS publishing_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL, -- Author/User ID
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- approval, rejection, sales_report, royalty_payment, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    is_email_sent BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_authors_pen_name ON authors(pen_name);
CREATE INDEX IF NOT EXISTS idx_authors_active ON authors(is_active);
CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(publication_type);
CREATE INDEX IF NOT EXISTS idx_publications_publication_date ON publications(publication_date);
CREATE INDEX IF NOT EXISTS idx_publications_isbn_13 ON publications(isbn_13);
CREATE INDEX IF NOT EXISTS idx_chapters_publication_id ON chapters(publication_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(chapter_number);
CREATE INDEX IF NOT EXISTS idx_sales_reports_publication ON sales_reports(publication_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_period ON sales_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_publishing_notifications_recipient ON publishing_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_publishing_notifications_unread ON publishing_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_collaborations_publication ON collaborations(publication_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_email ON collaborations(collaborator_email);

-- Insert default store channels
INSERT INTO store_channels (name, display_name, supported_territories, supported_formats, royalty_percentage, payment_schedule) VALUES
('amazon_kdp', 'Amazon Kindle Direct Publishing', '["worldwide"]', '["epub", "pdf", "mobi"]', 70.00, 'monthly'),
('apple_books', 'Apple Books', '["worldwide"]', '["epub"]', 70.00, 'monthly'),
('google_play_books', 'Google Play Books', '["worldwide"]', '["epub", "pdf"]', 70.00, 'monthly'),
('kobo', 'Kobo', '["worldwide"]', '["epub"]', 70.00, 'monthly'),
('barnes_noble', 'Barnes & Noble Press', '["US", "CA", "GB"]', '["epub"]', 70.00, 'monthly'),
('empik', 'Empik', '["PL"]', '["epub", "pdf"]', 70.00, 'monthly'),
('draft2digital', 'Draft2Digital', '["worldwide"]', '["epub", "pdf"]', 60.00, 'monthly'),
('smashwords', 'Smashwords', '["worldwide"]', '["epub", "pdf", "mobi"]', 60.00, 'monthly')
ON CONFLICT (name) DO NOTHING;

-- Insert common BISAC categories
INSERT INTO bisac_categories (code, name, parent_code) VALUES
('FIC000000', 'FICTION / General', NULL),
('FIC019000', 'FICTION / Literary', 'FIC000000'),
('FIC027000', 'FICTION / Romance / General', 'FIC000000'),
('FIC031000', 'FICTION / Thrillers / General', 'FIC000000'),
('FIC022000', 'FICTION / Mystery & Detective / General', 'FIC000000'),
('NON000000', 'NON-FICTION / General', NULL),
('BIO000000', 'BIOGRAPHY & AUTOBIOGRAPHY / General', 'NON000000'),
('HIS000000', 'HISTORY / General', 'NON000000'),
('REL000000', 'RELIGION / General', 'NON000000'),
('SEL000000', 'SELF-HELP / General', 'NON000000')
ON CONFLICT (code) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_store_channels_updated_at BEFORE UPDATE ON store_channels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_territorial_rights_updated_at BEFORE UPDATE ON territorial_rights FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_translation_licenses_updated_at BEFORE UPDATE ON translation_licenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_adaptation_licenses_updated_at BEFORE UPDATE ON adaptation_licenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drm_policies_updated_at BEFORE UPDATE ON drm_policies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
