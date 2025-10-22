#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔄 Nuaibria Database Migrations\n');
console.log(`SUPABASE_URL: ${SUPABASE_URL ? '✓ SET' : '✗ NOT SET'}`);
console.log(`SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? '✓ SET' : '✗ NOT SET'}\n`);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const migrations = [
  {
    name: '013_add_missing_character_columns',
    path: '../../supabase/migrations/013_add_missing_character_columns.sql'
  },
  {
    name: '014_create_asset_tables',
    path: '../../supabase/migrations/014_create_asset_tables.sql'
  }
];

async function applyMigration(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return await response.json();
}

async function main() {
  for (const migration of migrations) {
    try {
      console.log(`📝 Applying ${migration.name}...`);

      const sqlPath = path.resolve(__dirname, migration.path);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      const result = await applyMigration(sql);
      console.log(`✅ ${migration.name} completed\n`);
    } catch (error) {
      console.error(`⚠️  ${migration.name} failed:`, error.message);
      console.log('  (This may be OK if migrations were already applied)\n');
    }
  }

  console.log('✨ Migration application completed!\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
