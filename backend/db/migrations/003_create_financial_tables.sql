-- ========================================
-- HardbanRecords Music Platform - Financial System
-- Migration: 003_create_financial_tables.sql
-- Created: 2025-09-07
-- Description: Revenue tracking, royalties, payouts, and financial management
-- ========================================

-- ========== Revenue & Royalty System ==========

-- Revenue streams from different sources
CREATE TABLE revenue_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES distribution_platforms(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Revenue details
    revenue_type VARCHAR(30) NOT NULL CHECK (revenue_type IN ('streaming', 'download', 'sync', 'physical', 'merchandise', 'performance', 'mechanical')),
    source_platform VARCHAR(100),
    territory_code CHAR(2),
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Amounts
    gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    platform_fee DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    our_fee DECIMAL(12,2) DEFAULT 0.00,
    artist_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Period tracking
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    reporting_date DATE NOT NULL,
    
    -- Metrics
    streams BIGINT DEFAULT 0,
    downloads BIGINT DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    
    -- Exchange rate tracking
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    usd_gross_amount DECIMAL(12,2), -- converted to USD
    usd_artist_amount DECIMAL(12,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'disputed', 'paid', 'error')),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    raw_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Royalty splits between collaborators
CREATE TABLE royalty_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Split configuration
    split_type VARCHAR(30) NOT NULL CHECK (split_type IN ('master', 'publishing', 'performance', 'sync', 'mechanical')),
    split_percentage DECIMAL(5,2) NOT NULL CHECK (split_percentage >= 0 AND split_percentage <= 100),
    
    -- Split details
    role VARCHAR(100), -- artist, producer, songwriter, etc.
    is_primary BOOLEAN DEFAULT FALSE,
    minimum_amount DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Terms
    start_date DATE,
    end_date DATE,
    territory_restrictions JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Payout System ==========

-- User payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment method details
    method_type VARCHAR(30) NOT NULL CHECK (method_type IN ('bank_transfer', 'paypal', 'stripe', 'wise', 'crypto', 'check')),
    method_name VARCHAR(100),
    
    -- Account details (encrypted)
    account_details JSONB NOT NULL DEFAULT '{}',
    routing_info JSONB DEFAULT '{}',
    
    -- Verification
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'failed')),
    verification_data JSONB DEFAULT '{}',
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Limits and fees
    minimum_payout DECIMAL(10,2) DEFAULT 0.00,
    maximum_payout DECIMAL(10,2),
    fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    fixed_fee DECIMAL(8,2) DEFAULT 0.00,
    
    -- Geographic restrictions
    supported_countries JSONB DEFAULT '[]',
    currency_code CHAR(3) DEFAULT 'USD',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payout requests and processing
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
    
    -- Payout details
    payout_type VARCHAR(20) DEFAULT 'manual' CHECK (payout_type IN ('manual', 'automatic', 'scheduled')),
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    fee_amount DECIMAL(8,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    
    -- Processing
    status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'pending', 'processing', 'completed', 'failed', 'cancelled')),
    scheduled_date DATE,
    processed_date DATE,
    
    -- Transaction tracking
    transaction_id VARCHAR(255),
    external_transaction_id VARCHAR(255),
    processor_response JSONB DEFAULT '{}',
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Period covered
    period_start DATE,
    period_end DATE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Revenue items included in each payout
CREATE TABLE payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    revenue_stream_id UUID NOT NULL REFERENCES revenue_streams(id) ON DELETE CASCADE,
    
    -- Item details
    amount DECIMAL(12,2) NOT NULL,
    split_percentage DECIMAL(5,2),
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Financial Reporting ==========

-- User financial accounts/balances
CREATE TABLE user_financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balance tracking
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    pending_balance DECIMAL(12,2) DEFAULT 0.00,
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    total_paid_out DECIMAL(12,2) DEFAULT 0.00,
    
    -- Currency
    currency_code CHAR(3) DEFAULT 'USD',
    
    -- Payout settings
    minimum_payout_threshold DECIMAL(10,2) DEFAULT 50.00,
    auto_payout_enabled BOOLEAN DEFAULT FALSE,
    auto_payout_frequency VARCHAR(20) DEFAULT 'monthly',
    auto_payout_day INTEGER DEFAULT 1, -- day of month
    
    -- Last operations
    last_payout_date DATE,
    last_earning_date DATE,
    last_balance_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, currency_code)
);

-- Financial transactions log
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('revenue', 'payout', 'fee', 'refund', 'adjustment', 'bonus')),
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Related records
    revenue_stream_id UUID REFERENCES revenue_streams(id),
    payout_id UUID REFERENCES payouts(id),
    related_transaction_id UUID REFERENCES financial_transactions(id),
    
    -- Description
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    
    -- Balance tracking
    balance_before DECIMAL(12,2),
    balance_after DECIMAL(12,2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax documentation
CREATE TABLE tax_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Document details
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('w9', '1099', 'w8ben', 'other')),
    tax_year INTEGER NOT NULL,
    
    -- Document data
    document_data JSONB NOT NULL DEFAULT '{}',
    document_url VARCHAR(500), -- PDF storage
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processed', 'sent')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Tax information
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    tax_withheld DECIMAL(12,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Business Expenses ==========

-- User business expenses
CREATE TABLE business_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Expense details
    category VARCHAR(50) NOT NULL, -- studio_time, marketing, equipment, etc.
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'USD',
    
    -- Documentation
    receipt_url VARCHAR(500),
    receipt_data JSONB DEFAULT '{}',
    
    -- Tax information
    is_tax_deductible BOOLEAN DEFAULT TRUE,
    tax_category VARCHAR(50),
    
    -- Date tracking
    expense_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'disputed')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Indexes ==========

-- Revenue streams indexes
CREATE INDEX idx_revenue_streams_release_id ON revenue_streams(release_id);
CREATE INDEX idx_revenue_streams_track_id ON revenue_streams(track_id);
CREATE INDEX idx_revenue_streams_platform_id ON revenue_streams(platform_id);
CREATE INDEX idx_revenue_streams_profile_id ON revenue_streams(profile_id);
CREATE INDEX idx_revenue_streams_revenue_type ON revenue_streams(revenue_type);
CREATE INDEX idx_revenue_streams_period ON revenue_streams(period_start, period_end);
CREATE INDEX idx_revenue_streams_reporting_date ON revenue_streams(reporting_date);
CREATE INDEX idx_revenue_streams_status ON revenue_streams(status);

-- Royalty splits indexes
CREATE INDEX idx_royalty_splits_release_id ON royalty_splits(release_id);
CREATE INDEX idx_royalty_splits_track_id ON royalty_splits(track_id);
CREATE INDEX idx_royalty_splits_profile_id ON royalty_splits(profile_id);
CREATE INDEX idx_royalty_splits_type ON royalty_splits(split_type);
CREATE INDEX idx_royalty_splits_status ON royalty_splits(status);

-- Payment methods indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(method_type);
CREATE INDEX idx_payment_methods_verification_status ON payment_methods(verification_status);
CREATE INDEX idx_payment_methods_primary ON payment_methods(is_primary);

-- Payouts indexes
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_payment_method_id ON payouts(payment_method_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled_date ON payouts(scheduled_date);
CREATE INDEX idx_payouts_processed_date ON payouts(processed_date);

-- Payout items indexes
CREATE INDEX idx_payout_items_payout_id ON payout_items(payout_id);
CREATE INDEX idx_payout_items_revenue_stream_id ON payout_items(revenue_stream_id);

-- Financial accounts indexes
CREATE INDEX idx_user_financial_accounts_user_id ON user_financial_accounts(user_id);
CREATE INDEX idx_user_financial_accounts_currency ON user_financial_accounts(currency_code);

-- Financial transactions indexes
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_revenue_stream_id ON financial_transactions(revenue_stream_id);
CREATE INDEX idx_financial_transactions_payout_id ON financial_transactions(payout_id);
CREATE INDEX idx_financial_transactions_created_at ON financial_transactions(created_at);

-- Tax documents indexes
CREATE INDEX idx_tax_documents_user_id ON tax_documents(user_id);
CREATE INDEX idx_tax_documents_type ON tax_documents(document_type);
CREATE INDEX idx_tax_documents_tax_year ON tax_documents(tax_year);
CREATE INDEX idx_tax_documents_status ON tax_documents(status);

-- Business expenses indexes
CREATE INDEX idx_business_expenses_user_id ON business_expenses(user_id);
CREATE INDEX idx_business_expenses_category ON business_expenses(category);
CREATE INDEX idx_business_expenses_expense_date ON business_expenses(expense_date);
CREATE INDEX idx_business_expenses_status ON business_expenses(status);

-- ========== Triggers ==========

CREATE TRIGGER update_revenue_streams_updated_at BEFORE UPDATE ON revenue_streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_royalty_splits_updated_at BEFORE UPDATE ON royalty_splits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_financial_accounts_updated_at BEFORE UPDATE ON user_financial_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_documents_updated_at BEFORE UPDATE ON tax_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_expenses_updated_at BEFORE UPDATE ON business_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
