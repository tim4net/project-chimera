#!/usr/bin/env node
/**
 * Apply travel system migrations directly via PostgreSQL
 * This uses direct Postgres connection instead of Supabase RPC
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL must be set in .env');
  process.exit(1);
}

async function applyMigration(pool, migrationPath) {
  const fileName = path.basename(migrationPath);
  console.log(`\n📄 Applying: ${fileName}`);

  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    await pool.query(sql);
    console.log(`✓ Success: ${fileName}`);
    return true;
  } catch (err) {
    console.error(`✗ Error in ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔗 Connecting to PostgreSQL...');
    const conn = await pool.connect();
    conn.release();
    console.log('✓ Connected');

    const migrations = [
      '/srv/project-chimera/supabase/migrations/008_add_game_time_and_calendar.sql',
      '/srv/project-chimera/supabase/migrations/009_create_travel_sessions_table.sql',
      '/srv/project-chimera/supabase/migrations/010_create_travel_events_table.sql'
    ];

    let failedCount = 0;

    for (const migration of migrations) {
      const success = await applyMigration(pool, migration);
      if (!success) failedCount++;
    }

    if (failedCount === 0) {
      console.log('\n✅ All migrations applied successfully!');
    } else {
      console.log(`\n⚠️  ${failedCount} migration(s) failed`);
      process.exit(1);
    }
  } catch (err) {
    console.error('\n✗ Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
