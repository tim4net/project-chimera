#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_URL || !ACCESS_TOKEN) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

console.log('🚀 Applying POI migration with Supabase token...');

// Extract host from URL
const url = new URL(SUPABASE_URL);
const host = url.hostname;

// Try direct PostgreSQL connection using token as password
const pool = new Pool({
  host: host,
  port: 5432,
  user: 'postgres',
  password: ACCESS_TOKEN,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

(async () => {
  let client;
  try {
    console.log('\n📝 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected!');

    console.log('\n📝 Executing migration SQL...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!');

    // Verify
    console.log('\n🔍 Verifying column type...');
    const result = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'world_pois' AND column_name = 'type'
    `);

    if (result.rows.length > 0) {
      const col = result.rows[0];
      console.log(`✅ Column type: ${col.data_type}`);
      if (col.data_type === 'text') {
        console.log('\n✨ POI migration completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart backend: podman compose restart backend');
        console.log('   2. Verify logs: podman compose logs backend | tail -20');
      } else {
        console.log(`⚠️  Type is still: ${col.data_type}`);
      }
    } else {
      console.log('✅ Table is accessible');
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.log('\n⚠️  Token authentication failed');
      console.log('   Token may not have database access permissions');
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
