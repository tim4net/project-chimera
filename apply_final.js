#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

console.log('🚀 Final attempt: Apply POI migration with extended timeout...');

// Try pgbouncer endpoint (port 6543) which has better connection pooling
const pool = new Pool({
  host: 'muhlitkerrjparpcuwmc.supabase.co',
  port: 6543,  // Supabase pgbouncer pool port
  user: 'postgres',
  password: SUPABASE_SERVICE_KEY,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 1,
});

const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

(async () => {
  let client;
  try {
    console.log('\n📝 Connecting to Supabase (port 6543 - pgbouncer)...');
    client = await pool.connect();
    console.log('✅ Connected!');

    console.log('\n📝 Executing migration SQL...');
    const result = await client.query(migrationSQL);
    console.log('✅ Migration executed!');

    // Verify
    console.log('\n🔍 Verifying changes...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'world_pois' AND column_name = 'type'
    `);

    if (verifyResult.rows.length > 0) {
      const col = verifyResult.rows[0];
      console.log(`✅ Column verified: ${col.column_name} -> ${col.data_type}`);
      
      if (col.data_type === 'text') {
        console.log('\n✨✨✨ SUCCESS! POI migration is complete! ✨✨✨');
        console.log('\n📋 Next steps:');
        console.log('   1. Restart backend: podman compose restart backend');
        console.log('   2. Verify logs: podman compose logs backend | tail -30');
        console.log('   3. Look for: [RoadNetwork] Loaded X settlements');
        process.exit(0);
      }
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.message.includes('timeout')) {
      console.log('\n⚠️  Connection timeout. Trying alternative port...');
      process.exit(1);
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
