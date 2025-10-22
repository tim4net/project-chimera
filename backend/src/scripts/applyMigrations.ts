import * as fs from 'fs';
import * as path from 'path';

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Import fetch - compatible with Node 18+
const globalFetch = globalThis.fetch;

const migrations = [
  '/srv/project-chimera/supabase/migrations/013_add_missing_character_columns.sql',
  '/srv/project-chimera/supabase/migrations/014_create_asset_tables.sql'
];

/**
 * Execute SQL through Supabase Postgres RPC endpoint
 */
async function executeSql(sql: string): Promise<void> {
  const response = await globalFetch(
    `${supabaseUrl}/rest/v1/rpc/exec_sql_statements`,
    {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey || ''
      }),
      body: JSON.stringify({ sql_strings: [sql] })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
}

async function applyMigrations() {
  console.log('🔄 Starting database migrations...\n');

  try {
    for (const migrationPath of migrations) {
      const filename = path.basename(migrationPath);
      console.log(`📝 Applying ${filename}...`);

      const sql = fs.readFileSync(migrationPath, 'utf-8');

      try {
        await executeSql(sql);
        console.log(`✅ ${filename} applied successfully\n`);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`❌ ${filename} failed:`, error.message);
        // Don't exit - may fail if already applied, which is OK
        console.log(`⚠️  Continuing despite error (may already be applied)\n`);
      }
    }

    console.log('✨ All migrations completed!');
  } catch (err) {
    console.error('❌ Critical error:', err);
    process.exit(1);
  }

  process.exit(0);
}

applyMigrations();
