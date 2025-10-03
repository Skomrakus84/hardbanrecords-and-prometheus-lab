const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lniyanikhipfmrdubqvm:Kskomra1984*@aws-0-eu-north-1.pooler.supabase.co:6543/postgres'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    await client.query('SELECT NOW()');
    console.log('✅ Test query executed successfully!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();