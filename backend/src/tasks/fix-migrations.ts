import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  'https://muhlitkerrjparpcuwmc.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function executeSql(sql: string, description: string): Promise<boolean> {
  try {
    // Try using the _exec_sql function
    const { error } = await supabase.rpc('_exec_sql' as any, { sql });

    if (error) {
      if (error.message?.includes('Unknown function')) {
        console.log(`  ⚠️  ${description} - RPC not available, trying alternative...`);
        return false;
      }
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log(`  ⏭️  ${description} - Already exists (safe)`);
        return true;
      }
      console.error(`  ❌ ${description}: ${error.message}`);
      return false;
    }

    console.log(`  ✅ ${description}`);
    return true;
  } catch (err: any) {
    console.error(`  ❌ ${description}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔥 DIRECT MIGRATION APPLICATION\n');

  // Migration 008: Add game time and calendar
  console.log('📝 Migration 008: Game Time & Calendar');

  const sql008Statements = [
    `ALTER TABLE public.characters
     ADD COLUMN IF NOT EXISTS game_time_minutes BIGINT NOT NULL DEFAULT 0,
     ADD COLUMN IF NOT EXISTS world_date_day INT NOT NULL DEFAULT 1,
     ADD COLUMN IF NOT EXISTS world_date_month INT NOT NULL DEFAULT 1,
     ADD COLUMN IF NOT EXISTS world_date_year INT NOT NULL DEFAULT 0;`,

    `ALTER TABLE public.characters
     ADD CONSTRAINT IF NOT EXISTS valid_world_date_day CHECK (world_date_day >= 1 AND world_date_day <= 40);`,

    `ALTER TABLE public.characters
     ADD CONSTRAINT IF NOT EXISTS valid_world_date_month CHECK (world_date_month >= 1 AND world_date_month <= 10);`,

    `ALTER TABLE public.characters
     ADD CONSTRAINT IF NOT EXISTS valid_world_date_year CHECK (world_date_year >= 0);`,

    `CREATE INDEX IF NOT EXISTS characters_world_date_idx ON public.characters (world_date_year, world_date_month, world_date_day);`
  ];

  for (const stmt of sql008Statements) {
    await executeSql(stmt, 'Execute statement');
  }

  // Check if columns exist
  console.log('\n🔍 Verifying game_time columns...');
  try {
    const { error } = await supabase
      .from('characters')
      .select('game_time_minutes')
      .limit(1);

    if (error) {
      console.log(`  ❌ Column verification failed: ${error.message}`);
      console.log('  This likely means the migration did not apply properly.');
    } else {
      console.log('  ✅ game_time_minutes column exists and is accessible!');
    }
  } catch (err) {
    console.log('  Error during verification');
  }

  console.log('\n✨ Migration attempt complete');
}

main().catch(console.error);
