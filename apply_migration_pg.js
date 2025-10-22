#!/usr/bin/env node
/**
 * Migration Application Script - PostgreSQL Direct Connection
 * Applies the POI type enum migration to Supabase database
 */

const fs = require('fs');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: '/srv/project-chimera/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: Missing DATABASE_URL in .env file');
  process.exit(1);
}

// Read migration file
const migrationPath = '/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql';
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('=== POI Type Enum Migration ===');
console.log('Migration file:', migrationPath);
console.log('Database:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('');

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');

    console.log('\nApplying migration...');
    const result = await client.query(migrationSQL);
    console.log('✓ Migration applied successfully');

    if (result.length > 0) {
      console.log('\nMigration output:');
      result.forEach((r, i) => {
        console.log(`  Result ${i + 1}:`, r.command || r);
      });
    }

    // Verify the schema change
    console.log('\nVerifying schema change...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'world_pois'
      AND column_name = 'type'
    `);

    if (verifyResult.rows.length > 0) {
      const column = verifyResult.rows[0];
      console.log('Column info:', column);

      if (column.data_type === 'text') {
        console.log('\n✓ SUCCESS: world_pois.type is now TEXT type');
      } else {
        console.log('\n⚠ WARNING: Column type is:', column.data_type);
      }
    } else {
      console.log('\n⚠ WARNING: Could not find world_pois.type column');
    }

    // Check if poi_type enum still exists
    console.log('\nChecking for poi_type enum...');
    const enumCheck = await client.query(`
      SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') as exists
    `);

    if (enumCheck.rows[0].exists) {
      console.log('⚠ poi_type enum still exists (may be in use elsewhere)');
    } else {
      console.log('✓ poi_type enum has been dropped');
    }

    console.log('\n=== Migration Complete ===');
    console.log('The backend should now accept type="village" without errors.');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

runMigration();
