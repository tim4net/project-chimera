#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Supabase PostgreSQL connection
const pool = new Pool({
  host: 'muhlitkerrjparpcuwmc.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'nuaibria-db-pass',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

console.log('🚀 Applying POI type migration to Supabase...');

// Read migration file
const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to Supabase database');

    console.log('\n📝 Executing migration...');
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
      console.log(`✅ world_pois.type is now: ${col.data_type}`);
      if (col.data_type === 'text') {
        console.log('✨ POI type migration completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Restart backend: podman compose restart backend');
        console.log('   2. Check logs for road network service to confirm no enum errors');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  Cannot reach database directly. Try manual application:');
      console.log('\n📋 SQL to run in Supabase console:\n');
      console.log(migrationSQL);
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
