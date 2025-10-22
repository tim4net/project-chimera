#!/usr/bin/env node
/**
 * Migration Application Script - Supabase JS Client
 * Applies the POI type enum migration to Supabase database
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '/srv/project-chimera/.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Read migration file
const migrationPath = '/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql';
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('=== POI Type Enum Migration ===');
console.log('Migration file:', migrationPath);
console.log('Target database:', SUPABASE_URL);
console.log('');

async function runMigration() {
  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Applying migration...');

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // If exec_sql RPC doesn't exist, try direct SQL execution
      console.log('exec_sql RPC not found, trying alternative method...');

      // Split migration into separate statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        console.log(`\nStatement ${i + 1}/${statements.length}:`);
        console.log(stmt.substring(0, 100) + '...');

        // For DDL operations, we need to use raw SQL via Postgres connection
        // Since Supabase JS doesn't support DDL directly, we'll need psql or pg library
        console.log('⚠ Supabase JS client cannot execute DDL statements directly');
      }

      throw new Error('Cannot execute migration with Supabase JS client. Need to use psql or pg library.');
    }

    console.log('✓ Migration applied successfully');
    console.log('Result:', data);

    // Verify the schema change
    await verifySchema(supabase);

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error('\nThis migration requires direct PostgreSQL access.');
    console.error('Please use one of these methods:');
    console.error('1. Install pg library: cd /srv/project-chimera && npm install pg');
    console.error('2. Use psql command: psql <DATABASE_URL> -f backend/migrations/20251021_ensure_world_pois_text_type.sql');
    console.error('3. Use Supabase web console SQL editor');
    process.exit(1);
  }
}

async function verifySchema(supabase) {
  console.log('\nVerifying schema change...');

  const { data, error } = await supabase
    .from('world_pois')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error querying world_pois:', error.message);
  } else {
    console.log('✓ world_pois table is accessible');
  }
}

runMigration();
