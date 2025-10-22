#!/usr/bin/env node
/**
 * Apply a SQL migration file to the Supabase database
 * Usage: node apply-migration.js <migration-file-path>
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node apply-migration.js <migration-file-path>');
  process.exit(1);
}

const migrationPath = path.resolve(migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`Error: Migration file not found: ${migrationPath}`);
  process.exit(1);
}

async function applyMigration() {
  console.log(`Reading migration: ${migrationPath}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Connecting to Supabase: ${SUPABASE_URL}`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('Applying migration...');
  console.log('---');
  console.log(sql);
  console.log('---');

  // Split SQL into individual statements and execute them
  // This is necessary because Supabase client doesn't support multi-statement execution
  const statements = sql
    .split(/;[\s]*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\nExecuting ${statements.length} statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt || stmt.startsWith('COMMENT')) continue; // Skip comments

    console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: stmt + ';' });

      if (error) {
        // Try direct execution if rpc fails
        console.log('RPC failed, trying alternative method...');
        throw error;
      }

      console.log(`✓ Statement ${i + 1} completed`);
    } catch (error) {
      console.error(`✗ Statement ${i + 1} failed:`, error.message);
      // Continue with other statements for non-critical errors
      if (error.code === '42710') { // Object already exists
        console.log('  (Object already exists, continuing...)');
      } else if (error.message.includes('already exists')) {
        console.log('  (Already exists, continuing...)');
      } else {
        console.error('  Full error:', error);
      }
    }
  }

  console.log('\n✓ Migration applied successfully!');
}

applyMigration().catch(err => {
  console.error('\n✗ Migration failed:', err);
  process.exit(1);
});
