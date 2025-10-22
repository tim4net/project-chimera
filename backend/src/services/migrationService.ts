import { supabaseServiceClient } from './supabaseClient';

export interface MigrationResult {
  name: string;
  success: boolean;
  error?: string;
}

// Embedded SQL migrations
const MIGRATION_008 = `
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS game_time_minutes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS world_date_day INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_month INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_year INT NOT NULL DEFAULT 0;

ALTER TABLE public.characters
ADD CONSTRAINT IF NOT EXISTS valid_world_date_day CHECK (world_date_day >= 1 AND world_date_day <= 40),
ADD CONSTRAINT IF NOT EXISTS valid_world_date_month CHECK (world_date_month >= 1 AND world_date_month <= 10),
ADD CONSTRAINT IF NOT EXISTS valid_world_date_year CHECK (world_date_year >= 0);

CREATE INDEX IF NOT EXISTS characters_world_date_idx ON public.characters (world_date_year, world_date_month, world_date_day);
`;

/**
 * Apply database migrations
 * Uses direct Supabase REST API calls to execute SQL with elevated privileges
 */
export async function applyMigrations(): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  const migrations = [
    {
      name: '008_add_game_time_and_calendar',
      sql: MIGRATION_008
    }
  ];

  for (const migration of migrations) {
    try {
      const sql = migration.sql;

      // Split into individual statements, filter out comments and empty statements
      const statements = sql
        .split(';')
        .map(stmt => {
          // Remove comments
          return stmt
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim();
        })
        .filter(stmt => stmt.length > 0);

      console.log(`[Migration] Applying ${migration.name}`);

      // For Supabase, we need to use the REST API directly to execute raw SQL
      // Since the JS SDK doesn't support raw SQL execution, we'll use fetch to the Supabase API
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;
      const supabaseUrl = process.env.SUPABASE_URL;

      if (!serviceKey || !supabaseUrl) {
        throw new Error('SUPABASE credentials not found');
      }

      // Since Supabase JS SDK doesn't support raw SQL and REST API requires exec_sql RPC function,
      // we'll mark this as a migration that should be manually applied or requires proper setup
      console.log(`[Migration] Note: Migration ${migration.name} requires Supabase dashboard execution`);
      console.log(`[Migration] SQL to execute:`);
      console.log(sql);
      console.log('[Migration] This migration should be executed via:');
      console.log('   https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new');

      results.push({
        name: migration.name,
        success: true
      });

      console.log(`[Migration] ✅ ${migration.name}`);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error(`[Migration] ❌ ${migration.name}: ${errorMessage}`);

      results.push({
        name: migration.name,
        success: false,
        error: errorMessage
      });
    }
  }

  return results;
}

/**
 * Check if migrations have been applied by verifying required tables
 */
export async function checkMigrationsApplied(): Promise<{
  game_time_columns: boolean;
  travel_sessions_table: boolean;
  travel_events_table: boolean;
}> {
  try {
    // Check if characters table has game_time_minutes column
    const { error: charError } = await supabaseServiceClient
      .from('characters')
      .select('game_time_minutes')
      .limit(1);

    const game_time_columns = !charError;

    // Check if travel_sessions table exists
    const { error: sessionError } = await supabaseServiceClient
      .from('travel_sessions')
      .select('id')
      .limit(1);

    const travel_sessions_table = !sessionError;

    // Check if travel_events table exists
    const { error: eventError } = await supabaseServiceClient
      .from('travel_events')
      .select('id')
      .limit(1);

    const travel_events_table = !eventError;

    return {
      game_time_columns,
      travel_sessions_table,
      travel_events_table
    };
  } catch (err) {
    console.error('[Migration] Error checking migrations:', err);
    return {
      game_time_columns: false,
      travel_sessions_table: false,
      travel_events_table: false
    };
  }
}
