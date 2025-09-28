-- Migracja dla modułu publikowania
-- Plik: 0003_publishing_tables.sql

-- Tabela authors (autorzy książek)
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pen_name VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    bio TEXT,
    website VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    bank_account VARCHAR(100),
    date_of_birth DATE,
    nationality VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT false,
    profile_image_url VARCHAR(500),
    social_media JSONB DEFAULT '{}',
    preferred_genres TEXT[],
    writing_style TEXT,
    awards TEXT[],
    education TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela books (książki)
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    series_name VARCHAR(255),
    series_number INTEGER,
    description TEXT,
    isbn_13 VARCHAR(17) UNIQUE,
    isbn_10 VARCHAR(10) UNIQUE,
    asin VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    page_count INTEGER,
    word_count INTEGER,
    format VARCHAR(50) DEFAULT 'ebook' CHECK (format IN ('ebook', 'paperback', 'hardcover', 'audiobook')),
    genre VARCHAR(100),
    subgenres TEXT[],
    keywords TEXT[],
    target_audience VARCHAR(50),
    content_rating VARCHAR(20) DEFAULT 'general',
    cover_image_url VARCHAR(500),
    preview_url VARCHAR(500),
    file_url VARCHAR(500),
    file_size_mb DECIMAL(8,2),
    price_usd DECIMAL(10,2),
    list_price_usd DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    copyright_year INTEGER,
    license_type VARCHAR(50) DEFAULT 'all_rights_reserved',
    drm_protected BOOLEAN DEFAULT true,
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'pre_order', 'out_of_print', 'discontinued')),
    publication_date DATE,
    pre_order_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'unpublished', 'archived')),
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    editorial_notes TEXT,
    marketing_description TEXT,
    back_cover_text TEXT,
    author_bio_for_book TEXT,
    dedication TEXT,
    acknowledgments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Tabela book_categories (kategorie książek)
CREATE TABLE IF NOT EXISTS book_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES book_categories(id) ON DELETE CASCADE,
    description TEXT,
    amazon_category_id VARCHAR(100),
    apple_category_id VARCHAR(100),
    google_category_id VARCHAR(100),
    kobo_category_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela book_category_assignments (przypisania kategorii do książek)
CREATE TABLE IF NOT EXISTS book_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    category_id UUID REFERENCES book_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, category_id)
);

-- Tabela publishing_platforms (platformy publikowania)
CREATE TABLE IF NOT EXISTS publishing_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(500),
    api_endpoint VARCHAR(500),
    supported_formats TEXT[],
    commission_rate DECIMAL(5,4),
    payment_threshold DECIMAL(10,2),
    payment_frequency VARCHAR(50),
    geographic_availability TEXT[],
    content_guidelines TEXT,
    technical_requirements JSONB DEFAULT '{}',
    metadata_requirements JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    setup_instructions TEXT,
    support_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela book_publications (publikacje książek na platformach)
CREATE TABLE IF NOT EXISTS book_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES publishing_platforms(id) ON DELETE CASCADE,
    platform_book_id VARCHAR(255),
    publication_status VARCHAR(50) DEFAULT 'pending' CHECK (publication_status IN ('pending', 'submitted', 'processing', 'live', 'rejected', 'suspended', 'removed')),
    submission_date TIMESTAMP WITH TIME ZONE,
    live_date TIMESTAMP WITH TIME ZONE,
    last_sync_date TIMESTAMP WITH TIME ZONE,
    platform_url VARCHAR(500),
    platform_specific_metadata JSONB DEFAULT '{}',
    review_notes TEXT,
    error_messages TEXT,
    sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, platform_id)
);

-- Tabela book_sales (sprzedaż książek)
CREATE TABLE IF NOT EXISTS book_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES publishing_platforms(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    gross_revenue DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    net_revenue DECIMAL(10,2) NOT NULL,
    author_royalty DECIMAL(10,2) NOT NULL,
    royalty_rate DECIMAL(5,4) NOT NULL,
    country_code VARCHAR(2),
    region VARCHAR(100),
    sale_type VARCHAR(50) DEFAULT 'purchase' CHECK (sale_type IN ('purchase', 'borrow', 'subscription_read', 'free_download')),
    promotion_code VARCHAR(100),
    customer_type VARCHAR(50),
    refunded BOOLEAN DEFAULT false,
    refund_date DATE,
    refund_reason TEXT,
    transaction_id VARCHAR(255),
    platform_fee_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela author_royalty_statements (zestawienia tantiem dla autorów)
CREATE TABLE IF NOT EXISTS author_royalty_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales_count INTEGER DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_commissions DECIMAL(12,2) DEFAULT 0.00,
    net_revenue DECIMAL(12,2) DEFAULT 0.00,
    author_royalties DECIMAL(12,2) DEFAULT 0.00,
    previous_balance DECIMAL(12,2) DEFAULT 0.00,
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    withholding_tax DECIMAL(12,2) DEFAULT 0.00,
    payment_amount DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'paid', 'disputed')),
    statement_date DATE,
    payment_date DATE,
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    notes TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela book_reviews (recenzje książek)
CREATE TABLE IF NOT EXISTS book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES publishing_platforms(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255),
    reviewer_id VARCHAR(255),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    title VARCHAR(500),
    content TEXT,
    review_date DATE NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    review_url VARCHAR(500),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    language VARCHAR(10),
    is_featured BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela book_marketing_campaigns (kampanie marketingowe)
CREATE TABLE IF NOT EXISTS book_marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    target_audience TEXT,
    platforms TEXT[],
    metrics JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla modułu publikowania
CREATE INDEX IF NOT EXISTS idx_authors_user_id ON authors(user_id);
CREATE INDEX IF NOT EXISTS idx_authors_status ON authors(status);
CREATE INDEX IF NOT EXISTS idx_authors_pen_name ON authors(pen_name);

CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_isbn_13 ON books(isbn_13);
CREATE INDEX IF NOT EXISTS idx_books_publication_date ON books(publication_date);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);

CREATE INDEX IF NOT EXISTS idx_book_publications_book_id ON book_publications(book_id);
CREATE INDEX IF NOT EXISTS idx_book_publications_platform_id ON book_publications(platform_id);
CREATE INDEX IF NOT EXISTS idx_book_publications_status ON book_publications(publication_status);

CREATE INDEX IF NOT EXISTS idx_book_sales_book_id ON book_sales(book_id);
CREATE INDEX IF NOT EXISTS idx_book_sales_author_id ON book_sales(author_id);
CREATE INDEX IF NOT EXISTS idx_book_sales_platform_id ON book_sales(platform_id);
CREATE INDEX IF NOT EXISTS idx_book_sales_date ON book_sales(sale_date);

CREATE INDEX IF NOT EXISTS idx_author_royalty_statements_author_id ON author_royalty_statements(author_id);
CREATE INDEX IF NOT EXISTS idx_author_royalty_statements_period ON author_royalty_statements(period_start, period_end);

-- Komentarze
COMMENT ON TABLE authors IS 'Autorzy książek i ich dane kontaktowe';
COMMENT ON TABLE books IS 'Katalog książek z metadanymi';
COMMENT ON TABLE publishing_platforms IS 'Platformy do publikowania książek (Amazon KDP, Apple Books, etc.)';
COMMENT ON TABLE book_sales IS 'Historia sprzedaży książek z wszystkich platform';
