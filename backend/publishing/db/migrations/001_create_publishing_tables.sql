-- ========================================
-- HardbanRecords Publishing Module - Core Tables
-- Migration: 001_create_publishing_tables.sql
-- Created: 2025-09-07
-- Description: Digital publishing platform for books, magazines, and digital content
-- ========================================

-- ========== Publishing Content Structure ==========

-- Publications (books, magazines, journals, etc.)
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Publication details
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    
    -- Publication type and format
    publication_type VARCHAR(30) NOT NULL CHECK (publication_type IN ('book', 'ebook', 'magazine', 'journal', 'article', 'blog', 'newsletter', 'report')),
    content_format VARCHAR(20) NOT NULL CHECK (content_format IN ('text', 'pdf', 'epub', 'mobi', 'html', 'markdown', 'audio', 'video')),
    
    -- Content metadata
    language CHAR(2) DEFAULT 'en',
    genres JSONB DEFAULT '[]',
    topics JSONB DEFAULT '[]',
    keywords JSONB DEFAULT '[]',
    
    -- Publication info
    isbn VARCHAR(17), -- ISBN-13
    issn VARCHAR(9), -- for periodicals
    doi VARCHAR(255), -- Digital Object Identifier
    
    -- Cover and media
    cover_image_url VARCHAR(500),
    cover_image_alt TEXT,
    preview_images JSONB DEFAULT '[]',
    
    -- Publishing details
    publisher_name VARCHAR(255),
    publication_date DATE,
    edition INTEGER DEFAULT 1,
    version VARCHAR(50) DEFAULT '1.0',
    
    -- Content specifications
    page_count INTEGER,
    word_count INTEGER,
    reading_time_minutes INTEGER,
    content_rating VARCHAR(20) DEFAULT 'general', -- general, teen, mature, adult
    
    -- Pricing and availability
    price DECIMAL(8,2),
    currency_code CHAR(3) DEFAULT 'USD',
    is_free BOOLEAN DEFAULT FALSE,
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived', 'withdrawn')),
    workflow_stage VARCHAR(30) DEFAULT 'writing',
    
    -- Rights and licensing
    copyright_year INTEGER,
    copyright_holder VARCHAR(255),
    license_type VARCHAR(50) DEFAULT 'all_rights_reserved',
    creative_commons_license VARCHAR(50),
    
    -- Analytics
    total_views BIGINT DEFAULT 0,
    total_downloads BIGINT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    
    -- Content storage
    content_url VARCHAR(500),
    content_size_bytes BIGINT,
    content_hash VARCHAR(128),
    
    -- SEO and discovery
    slug VARCHAR(255) UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Publication chapters/sections
CREATE TABLE publication_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    
    -- Chapter details
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    chapter_number INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Content
    content TEXT, -- main content
    content_format VARCHAR(20) DEFAULT 'markdown',
    content_url VARCHAR(500), -- for external content
    excerpt TEXT,
    
    -- Metadata
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
    is_free BOOLEAN DEFAULT FALSE,
    
    -- SEO
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Analytics
    view_count BIGINT DEFAULT 0,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Content Rights Management ==========

-- Publication rights and permissions
CREATE TABLE publication_rights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    
    -- Rights type
    rights_type VARCHAR(30) NOT NULL CHECK (rights_type IN ('copyright', 'trademark', 'creative_commons', 'public_domain', 'custom')),
    
    -- Rights details
    rights_holder VARCHAR(255) NOT NULL,
    rights_territory JSONB DEFAULT '[]', -- country codes
    rights_language JSONB DEFAULT '[]', -- language codes
    
    -- Terms
    exclusive BOOLEAN DEFAULT TRUE,
    transferable BOOLEAN DEFAULT FALSE,
    sublicensable BOOLEAN DEFAULT FALSE,
    
    -- Time period
    start_date DATE,
    end_date DATE,
    duration_years INTEGER,
    
    -- Usage permissions
    commercial_use BOOLEAN DEFAULT FALSE,
    modification_allowed BOOLEAN DEFAULT FALSE,
    distribution_allowed BOOLEAN DEFAULT TRUE,
    attribution_required BOOLEAN DEFAULT TRUE,
    
    -- License terms
    license_text TEXT,
    license_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'disputed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content licensing agreements
CREATE TABLE content_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    licensee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- License details
    license_type VARCHAR(30) NOT NULL,
    license_scope VARCHAR(50), -- full, excerpt, translation, adaptation
    
    -- Terms
    territory JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    formats JSONB DEFAULT '[]',
    distribution_channels JSONB DEFAULT '[]',
    
    -- Financial terms
    fee_type VARCHAR(20) CHECK (fee_type IN ('one_time', 'royalty', 'subscription', 'free')),
    fee_amount DECIMAL(10,2),
    royalty_percentage DECIMAL(5,2),
    minimum_guarantee DECIMAL(10,2),
    
    -- Time period
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'expired', 'terminated')),
    
    -- Contract
    contract_url VARCHAR(500),
    signed_by_licensor BOOLEAN DEFAULT FALSE,
    signed_by_licensee BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Publishing Sales & Distribution ==========

-- Sales transactions
CREATE TABLE publication_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Sale details
    sale_type VARCHAR(20) NOT NULL CHECK (sale_type IN ('purchase', 'subscription', 'rental', 'free_download')),
    quantity INTEGER DEFAULT 1,
    
    -- Pricing
    unit_price DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    discount_amount DECIMAL(8,2) DEFAULT 0.00,
    tax_amount DECIMAL(8,2) DEFAULT 0.00,
    
    -- Payment
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    
    -- Delivery
    delivery_format VARCHAR(20),
    download_url VARCHAR(500),
    download_expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    
    -- Geographic info
    buyer_country CHAR(2),
    buyer_region VARCHAR(100),
    ip_address INET,
    
    -- Referral tracking
    referrer_url VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
    
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription management
CREATE TABLE publication_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Subscription details
    subscription_type VARCHAR(30) NOT NULL CHECK (subscription_type IN ('publication', 'author', 'genre', 'premium')),
    tier VARCHAR(20) DEFAULT 'basic', -- basic, premium, pro
    
    -- Billing
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'lifetime')),
    amount DECIMAL(8,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    
    -- Dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Billing history
    last_payment_at TIMESTAMP WITH TIME ZONE,
    next_payment_due TIMESTAMP WITH TIME ZONE,
    failed_payment_count INTEGER DEFAULT 0,
    
    -- Usage tracking
    download_limit INTEGER,
    downloads_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Content Analytics ==========

-- Publication analytics
CREATE TABLE publication_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    
    -- Time period
    date DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    
    -- View metrics
    page_views BIGINT DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_time_on_page INTEGER DEFAULT 0, -- seconds
    
    -- Engagement
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Sales
    sales_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    
    -- Geographic data
    top_countries JSONB DEFAULT '[]',
    top_cities JSONB DEFAULT '[]',
    
    -- Traffic sources
    organic_search INTEGER DEFAULT 0,
    direct_traffic INTEGER DEFAULT 0,
    social_media INTEGER DEFAULT 0,
    referral_traffic INTEGER DEFAULT 0,
    
    -- Device/platform
    desktop_views INTEGER DEFAULT 0,
    mobile_views INTEGER DEFAULT 0,
    tablet_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Reviews & Ratings ==========

-- Publication reviews
CREATE TABLE publication_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Review metadata
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'flagged', 'removed')),
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Indexes ==========

-- Publications indexes
CREATE INDEX idx_publications_author_id ON publications(author_id);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_published_at ON publications(published_at);
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_featured ON publications(featured);

-- Chapters indexes
CREATE INDEX idx_publication_chapters_publication_id ON publication_chapters(publication_id);
CREATE INDEX idx_publication_chapters_sort_order ON publication_chapters(sort_order);
CREATE INDEX idx_publication_chapters_status ON publication_chapters(status);

-- Rights indexes
CREATE INDEX idx_publication_rights_publication_id ON publication_rights(publication_id);
CREATE INDEX idx_publication_rights_type ON publication_rights(rights_type);
CREATE INDEX idx_publication_rights_status ON publication_rights(status);

-- License indexes
CREATE INDEX idx_content_licenses_publication_id ON content_licenses(publication_id);
CREATE INDEX idx_content_licenses_licensee_id ON content_licenses(licensee_id);
CREATE INDEX idx_content_licenses_status ON content_licenses(status);

-- Sales indexes
CREATE INDEX idx_publication_sales_publication_id ON publication_sales(publication_id);
CREATE INDEX idx_publication_sales_buyer_id ON publication_sales(buyer_id);
CREATE INDEX idx_publication_sales_purchased_at ON publication_sales(purchased_at);
CREATE INDEX idx_publication_sales_status ON publication_sales(status);

-- Subscription indexes
CREATE INDEX idx_publication_subscriptions_subscriber_id ON publication_subscriptions(subscriber_id);
CREATE INDEX idx_publication_subscriptions_publication_id ON publication_subscriptions(publication_id);
CREATE INDEX idx_publication_subscriptions_author_id ON publication_subscriptions(author_id);
CREATE INDEX idx_publication_subscriptions_status ON publication_subscriptions(status);

-- Analytics indexes
CREATE INDEX idx_publication_analytics_publication_id ON publication_analytics(publication_id);
CREATE INDEX idx_publication_analytics_date ON publication_analytics(date);
CREATE INDEX idx_publication_analytics_period_type ON publication_analytics(period_type);

-- Review indexes
CREATE INDEX idx_publication_reviews_publication_id ON publication_reviews(publication_id);
CREATE INDEX idx_publication_reviews_reviewer_id ON publication_reviews(reviewer_id);
CREATE INDEX idx_publication_reviews_rating ON publication_reviews(rating);
CREATE INDEX idx_publication_reviews_status ON publication_reviews(status);

-- ========== Triggers ==========

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_chapters_updated_at BEFORE UPDATE ON publication_chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_rights_updated_at BEFORE UPDATE ON publication_rights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_licenses_updated_at BEFORE UPDATE ON content_licenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_subscriptions_updated_at BEFORE UPDATE ON publication_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publication_reviews_updated_at BEFORE UPDATE ON publication_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
