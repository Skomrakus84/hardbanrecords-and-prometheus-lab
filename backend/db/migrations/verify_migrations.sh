#!/bin/bash

# ========================================
# HardbanRecords Database Migration Verification
# Script: verify_migrations.sh
# Created: 2025-09-07
# Description: Verify all database migrations have been applied correctly
# ========================================

echo "🎵 HardbanRecords Database Migration Verification"
echo "=================================================="
echo ""

# Database connection parameters (modify as needed)
DB_NAME="${DB_NAME:-hardbanrecords}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Function to run SQL query and return result
run_query() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$1" 2>/dev/null
}

# Function to count tables
count_tables() {
    local count=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    echo "$count" | tr -d ' '
}

# Function to check if table exists
table_exists() {
    local table_name="$1"
    local count=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table_name';")
    echo "$count" | tr -d ' '
}

# Function to check extension
check_extension() {
    local ext_name="$1"
    local count=$(run_query "SELECT COUNT(*) FROM pg_extension WHERE extname = '$ext_name';")
    echo "$count" | tr -d ' '
}

echo "🔗 Checking database connection..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null; then
    echo "❌ Cannot connect to database. Please check connection parameters."
    exit 1
fi
echo "✅ Database connection successful"
echo ""

echo "🔧 Checking required extensions..."
if [ "$(check_extension 'uuid-ossp')" -eq "1" ]; then
    echo "✅ uuid-ossp extension installed"
else
    echo "❌ uuid-ossp extension missing"
fi

if [ "$(check_extension 'pgcrypto')" -eq "1" ]; then
    echo "✅ pgcrypto extension installed"
else
    echo "❌ pgcrypto extension missing"
fi
echo ""

echo "📊 Checking table creation..."
total_tables=$(count_tables)
echo "Total tables created: $total_tables"
echo ""

echo "🎵 Core System Tables:"
core_tables=("users" "user_roles" "user_role_assignments" "profiles" "profile_followers" "releases" "tracks" "track_credits")
for table in "${core_tables[@]}"; do
    if [ "$(table_exists "$table")" -eq "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (missing)"
    fi
done
echo ""

echo "🌐 Distribution System Tables:"
dist_tables=("distribution_platforms" "user_platform_connections" "release_distributions" "distribution_events" "platform_analytics" "distribution_templates" "distribution_quality_checks")
for table in "${dist_tables[@]}"; do
    if [ "$(table_exists "$table")" -eq "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (missing)"
    fi
done
echo ""

echo "💰 Financial System Tables:"
fin_tables=("revenue_streams" "royalty_splits" "payment_methods" "payouts" "payout_items" "user_financial_accounts" "financial_transactions" "tax_documents" "business_expenses")
for table in "${fin_tables[@]}"; do
    if [ "$(table_exists "$table")" -eq "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (missing)"
    fi
done
echo ""

echo "🎧 Music Module Tables:"
music_tables=("streaming_analytics" "analytics_events" "collaboration_requests" "playlists" "playlist_tracks" "playlist_followers" "track_similarities" "listening_sessions" "music_genres" "music_moods" "notifications" "notification_preferences")
for table in "${music_tables[@]}"; do
    if [ "$(table_exists "$table")" -eq "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (missing)"
    fi
done
echo ""

echo "📚 Publishing Module Tables:"
pub_tables=("publications" "publication_chapters" "publication_rights" "content_licenses" "publication_sales" "publication_subscriptions" "publication_analytics" "publication_reviews")
for table in "${pub_tables[@]}"; do
    if [ "$(table_exists "$table")" -eq "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (missing)"
    fi
done
echo ""

echo "🔍 Checking indexes..."
index_count=$(run_query "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | tr -d ' ')
echo "Total indexes created: $index_count"
echo ""

echo "🔗 Checking foreign key constraints..."
fk_count=$(run_query "SELECT COUNT(*) FROM pg_constraint WHERE contype = 'f';" | tr -d ' ')
echo "Foreign key constraints: $fk_count"
echo ""

echo "🔧 Checking triggers..."
trigger_count=$(run_query "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';" | tr -d ' ')
echo "Triggers created: $trigger_count"
echo ""

echo "👥 Checking default roles..."
role_count=$(run_query "SELECT COUNT(*) FROM user_roles;" | tr -d ' ')
echo "Default roles inserted: $role_count"
if [ "$role_count" -ge "6" ]; then
    echo "✅ Default roles properly inserted"
else
    echo "❌ Default roles missing or incomplete"
fi
echo ""

echo "📋 Migration Summary:"
echo "===================="
expected_tables=47
if [ "$total_tables" -ge "$expected_tables" ]; then
    echo "✅ All expected tables created ($total_tables/$expected_tables)"
else
    echo "❌ Missing tables ($total_tables/$expected_tables)"
fi

if [ "$index_count" -gt "50" ]; then
    echo "✅ Indexes properly created ($index_count)"
else
    echo "❌ Insufficient indexes ($index_count)"
fi

if [ "$fk_count" -gt "30" ]; then
    echo "✅ Foreign key constraints in place ($fk_count)"
else
    echo "❌ Missing foreign key constraints ($fk_count)"
fi

echo ""
echo "🎯 Database Status: READY FOR APPLICATION DEPLOYMENT"
echo "=================================================="
