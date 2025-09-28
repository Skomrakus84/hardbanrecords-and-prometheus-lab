# Database Migrations - HardbanRecords Platform

This directory contains all database migrations for the HardbanRecords music and publishing platform.

## Migration Overview

### Core System Migrations (backend/db/migrations/)
1. **001_create_core_tables.sql** - Core platform infrastructure
   - Users and authentication system
   - Profile management (artists, labels, producers)
   - Music releases and tracks structure
   - Basic content management

2. **002_create_distribution_tables.sql** - Distribution system
   - Platform integrations (Spotify, Apple Music, etc.)
   - Distribution job tracking and status
   - Analytics data collection
   - Quality control system

3. **003_create_financial_tables.sql** - Financial management
   - Revenue tracking and royalty splits
   - Payout system with multiple payment methods
   - Financial reporting and tax documentation
   - Business expense management

### Music Module Migrations (backend/music/db/migrations/)
1. **001_create_music_module_tables.sql** - Advanced music features
   - Detailed streaming analytics
   - Collaboration system
   - Playlist management
   - Music discovery and recommendations
   - Notification system

### Publishing Module Migrations (backend/publishing/db/migrations/)
1. **001_create_publishing_tables.sql** - Digital publishing platform
   - Publications (books, magazines, articles)
   - Content rights management
   - Sales and subscription system
   - Publishing analytics

## Database Schema Features

### 🎵 **Music Platform Core**
- **User Management**: Complete authentication with roles and permissions
- **Artist Profiles**: Verification system, social features, analytics
- **Release Management**: Full workflow from creation to distribution
- **Track System**: Audio processing, metadata, credits, and splits

### 🌐 **Distribution System**
- **Platform Integration**: Support for 8+ streaming platforms
- **Delivery Tracking**: Real-time status monitoring across platforms
- **Quality Control**: Automated checks for audio, metadata, and artwork
- **Analytics Integration**: Platform-specific data collection

### 💰 **Financial Management**
- **Revenue Tracking**: Multi-platform, multi-currency support
- **Royalty Splits**: Configurable splits between collaborators
- **Payout System**: Bank transfers, PayPal, crypto, international support
- **Tax Compliance**: W-9, 1099 forms, international tax handling

### 📊 **Advanced Analytics**
- **Streaming Analytics**: Detailed listener behavior and demographics
- **Real-time Events**: Live tracking of plays, skips, downloads
- **Geographic Analysis**: Country/city-level performance data
- **Platform Comparison**: Cross-platform performance insights

### 🤝 **Collaboration Features**
- **Collaboration Requests**: Artist-to-artist collaboration system
- **Credit Management**: Detailed contributor tracking
- **Rights Management**: Comprehensive IP and licensing system
- **Playlist Curation**: User and editorial playlist support

### 📚 **Publishing Platform**
- **Multi-format Support**: eBooks, PDFs, articles, magazines
- **Content Management**: Chapter-based structure with rich metadata
- **Rights & Licensing**: Advanced IP management and licensing
- **Sales System**: One-time sales and subscription management

## Technical Specifications

### Database Engine
- **PostgreSQL 13+** (recommended)
- UUID primary keys for distributed systems
- JSONB for flexible metadata storage
- Full-text search capabilities
- Geographic data support (PostGIS ready)

### Key Features
- **Audit Trails**: Complete history tracking with timestamps
- **Soft Deletes**: Data preservation with status flags
- **Internationalization**: Multi-language and multi-currency support
- **Scalability**: Indexed for high-performance queries
- **Security**: Role-based access control throughout

### Data Relationships
- **Hierarchical Structure**: Users → Profiles → Releases → Tracks
- **Many-to-Many Relations**: Collaborations, splits, platform distributions
- **Flexible Metadata**: JSONB columns for extensible data
- **Reference Integrity**: Foreign key constraints with cascade rules

## Migration Execution

### Prerequisites
```bash
# PostgreSQL 13+ with extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Running Migrations
```bash
# Option 1: Run all migrations at once
psql -d hardbanrecords -f run_all_migrations.sql

# Option 2: Run individual migrations
psql -d hardbanrecords -f 001_create_core_tables.sql
psql -d hardbanrecords -f 002_create_distribution_tables.sql
psql -d hardbanrecords -f 003_create_financial_tables.sql
psql -d hardbanrecords -f ../music/db/migrations/001_create_music_module_tables.sql
psql -d hardbanrecords -f ../publishing/db/migrations/001_create_publishing_tables.sql
```

### Verification
```sql
-- Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f';
```

## Development Notes

### Environment Setup
- Development: Include sample data and admin user creation
- Staging: Full schema without sample data
- Production: Schema only with proper security settings

### Performance Considerations
- All tables include optimized indexes for common queries
- JSONB columns indexed for frequent access patterns
- Partitioning recommendations for analytics tables (high volume)
- Connection pooling recommended for concurrent access

### Security Features
- Password hashing with bcrypt
- API credential encryption in JSONB fields
- Audit logging for financial transactions
- Role-based access control throughout system

This migration set provides a complete, production-ready database schema for a professional music distribution and digital publishing platform.
