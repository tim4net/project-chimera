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

// Add missing character columns required by character creation logic
const MIGRATION_013 = `
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS armor_class INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS temporary_hp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed INTEGER NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS hit_dice JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proficiency_bonus INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS skills JSONB,
ADD COLUMN IF NOT EXISTS spell_slots JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS background TEXT,
ADD COLUMN IF NOT EXISTS portrait_url TEXT;
`;

// Create asset request tracking tables for image and text generation
const MIGRATION_014 = `
CREATE TABLE IF NOT EXISTS public.asset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_hash TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'text')),
  context_type TEXT,
  prompt TEXT NOT NULL,
  context JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.asset_requests(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  context_type TEXT,
  image_url TEXT NOT NULL,
  dimensions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS asset_requests_status_idx ON public.asset_requests(status);
CREATE INDEX IF NOT EXISTS asset_requests_expires_at_idx ON public.asset_requests(expires_at);
CREATE INDEX IF NOT EXISTS asset_requests_created_at_idx ON public.asset_requests(created_at);
CREATE INDEX IF NOT EXISTS generated_images_expires_at_idx ON public.generated_images(expires_at);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON public.generated_images(created_at);

ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
`;

/**
 * Apply database migrations directly via Supabase REST API using exec_raw_sql RPC
 */
async function applyViaSupabaseRPC(sql: string, name: string): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not configured');
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_raw_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      // If function doesn't exist, that's OK - we'll skip
      if (error.includes('exec_raw_sql')) {
        console.log(`[Migration] RPC function not available, skipping ${name}`);
        return false;
      }
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return true;
  } catch (err: any) {
    console.log(`[Migration] RPC attempt failed for ${name}: ${err.message}`);
    return false;
  }
}

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
    },
    {
      name: '013_add_missing_character_columns',
      sql: MIGRATION_013
    },
    {
      name: '014_create_asset_tables',
      sql: MIGRATION_014
    }
  ];

  for (const migration of migrations) {
    try {
      const sql = migration.sql;

      console.log(`[Migration] Applying ${migration.name}`);

      // Try to apply via Supabase RPC if available
      const applied = await applyViaSupabaseRPC(sql, migration.name);

      if (applied) {
        results.push({
          name: migration.name,
          success: true
        });
        console.log(`[Migration] ✅ ${migration.name}`);
      } else {
        // RPC not available - log instructions for manual application
        console.log(`[Migration] ⚠️  RPC function not available for ${migration.name}`);
        console.log(`[Migration] Please apply this manually via Supabase dashboard:`);
        console.log('   https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new');
        console.log(`[Migration] SQL to execute:\n${sql}\n`);

        results.push({
          name: migration.name,
          success: false,
          error: 'RPC function exec_raw_sql not available - manual application required'
        });
      }
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
  armor_class_column: boolean;
  asset_tables: boolean;
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

    // Check if characters table has armor_class column
    const { error: acError } = await supabaseServiceClient
      .from('characters')
      .select('armor_class')
      .limit(1);

    const armor_class_column = !acError;

    // Check if asset_requests table exists
    const { error: assetError } = await supabaseServiceClient
      .from('asset_requests')
      .select('id')
      .limit(1);

    const asset_tables = !assetError;

    return {
      game_time_columns,
      travel_sessions_table,
      travel_events_table,
      armor_class_column,
      asset_tables
    };
  } catch (err) {
    console.error('[Migration] Error checking migrations:', err);
    return {
      game_time_columns: false,
      travel_sessions_table: false,
      travel_events_table: false,
      armor_class_column: false,
      asset_tables: false
    };
  }
}
