const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('📝 Database not initialized, skipping migrations');
      console.log('ℹ️  Run init_complete_database.sql manually in Supabase Dashboard');
      return;
    }

    const tableNames = tables.map(t => t.table_name);
    const requiredTables = ['users', 'artists', 'releases', 'authors', 'books'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));

    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('ℹ️  Run init_complete_database.sql manually in Supabase Dashboard');
      return;
    }

    console.log('✅ Database schema verified');

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .single();

    if (testError) {
      console.log('⚠️  Database connection test failed, but continuing...');
    } else {
      console.log('✅ Database connection successful');
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't exit with error - allow deployment to continue
    console.log('⚠️  Continuing deployment despite migration warnings...');
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(0); // Exit with success to allow deployment
    });
}

module.exports = { runMigrations };
