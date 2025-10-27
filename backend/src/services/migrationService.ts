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
  request_type TEXT NOT NULL CHECK (request_type IN ('image', 'text')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.asset_requests(id) ON DELETE CASCADE,
  prompt_hash TEXT,
  prompt TEXT NOT NULL,
  context_type TEXT,
  image_url TEXT NOT NULL,
  style_version_id UUID,
  dimensions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS public.generated_text (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.asset_requests(id) ON DELETE CASCADE,
  context_key TEXT NOT NULL,
  text_type TEXT NOT NULL CHECK (text_type IN ('narration', 'description', 'dialogue', 'quest_text', 'flavor')),
  content TEXT NOT NULL,
  context JSONB,
  style_version_id UUID,
  llm_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS public.style_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name TEXT NOT NULL,
  description TEXT,
  style_config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS asset_requests_status_idx ON public.asset_requests(status);
CREATE INDEX IF NOT EXISTS asset_requests_expires_at_idx ON public.asset_requests(expires_at);
CREATE INDEX IF NOT EXISTS asset_requests_created_at_idx ON public.asset_requests(created_at);
CREATE INDEX IF NOT EXISTS asset_requests_request_hash_idx ON public.asset_requests(request_hash);
CREATE INDEX IF NOT EXISTS generated_images_expires_at_idx ON public.generated_images(expires_at);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON public.generated_images(created_at);
CREATE INDEX IF NOT EXISTS generated_images_prompt_hash_idx ON public.generated_images(prompt_hash);
CREATE INDEX IF NOT EXISTS generated_text_context_key_idx ON public.generated_text(context_key);
CREATE INDEX IF NOT EXISTS generated_text_expires_at_idx ON public.generated_text(expires_at);
CREATE INDEX IF NOT EXISTS style_versions_is_active_idx ON public.style_versions(is_active);

ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_versions ENABLE ROW LEVEL SECURITY;
`;

// Create quest system tables for character-based quest tracking
const MIGRATION_015 = `
CREATE TABLE IF NOT EXISTS public.quest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL CHECK (template_type IN ('fetch', 'clear', 'scout', 'deliver')),
  title_template TEXT NOT NULL,
  description_template TEXT NOT NULL,
  objective_type TEXT NOT NULL CHECK (objective_type IN ('collect_items', 'kill_enemies', 'reach_location')),
  target_quantity INT DEFAULT 1,
  xp_reward INT DEFAULT 100,
  gold_reward INT DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.quest_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective_type TEXT NOT NULL CHECK (objective_type IN ('collect_items', 'kill_enemies', 'reach_location')),
  objective_target TEXT,
  current_progress INT NOT NULL DEFAULT 0,
  target_quantity INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  xp_reward INT NOT NULL DEFAULT 100,
  gold_reward INT NOT NULL DEFAULT 50,
  item_rewards JSONB DEFAULT '[]'::jsonb,
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS character_quests_character_id_idx ON public.character_quests(character_id);
CREATE INDEX IF NOT EXISTS character_quests_status_idx ON public.character_quests(status);
CREATE INDEX IF NOT EXISTS character_quests_character_status_idx ON public.character_quests(character_id, status);
CREATE INDEX IF NOT EXISTS character_quests_expires_at_idx ON public.character_quests(expires_at);

ALTER TABLE public.quest_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quest_templates_read" ON public.quest_templates FOR SELECT USING (true);

CREATE POLICY "character_quests_read_own" ON public.character_quests FOR SELECT USING (
  character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
);

CREATE POLICY "character_quests_insert_own" ON public.character_quests FOR INSERT WITH CHECK (
  character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
);

CREATE POLICY "character_quests_update_own" ON public.character_quests FOR UPDATE
USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
`;

// Create character images table for race and class selection portraits
const MIGRATION_016 = `
CREATE TABLE IF NOT EXISTS public.character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('race', 'class')),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(type, name)
);

CREATE INDEX IF NOT EXISTS character_images_type_name_idx ON public.character_images(type, name);
CREATE INDEX IF NOT EXISTS character_images_created_at_idx ON public.character_images(created_at);

ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "character_images_read_all" ON public.character_images FOR SELECT USING (true);
`;

// Create party system tables for multiplayer (future feature)
const MIGRATION_017 = `
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disbanded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(party_id, character_id)
);

CREATE INDEX IF NOT EXISTS parties_leader_id_idx ON public.parties(leader_id);
CREATE INDEX IF NOT EXISTS party_members_party_id_idx ON public.party_members(party_id);
CREATE INDEX IF NOT EXISTS party_members_character_id_idx ON public.party_members(character_id);

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_read_own" ON public.parties FOR SELECT USING (
  leader_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  OR id IN (SELECT party_id FROM public.party_members WHERE character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
);

CREATE POLICY "parties_insert_own" ON public.parties FOR INSERT WITH CHECK (
  leader_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
);

CREATE POLICY "party_members_read_own" ON public.party_members FOR SELECT USING (
  character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  OR party_id IN (SELECT id FROM public.parties WHERE leader_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
);

CREATE POLICY "party_members_insert_own" ON public.party_members FOR INSERT WITH CHECK (
  character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid())
  OR party_id IN (SELECT id FROM public.parties WHERE leader_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()))
);
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
    },
    {
      name: '015_create_quest_tables',
      sql: MIGRATION_015
    },
    {
      name: '016_create_character_images_table',
      sql: MIGRATION_016
    },
    {
      name: '017_create_party_tables',
      sql: MIGRATION_017
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
  quest_tables: boolean;
  party_tables: boolean;
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

    // Check if character_quests table exists
    const { error: questError } = await supabaseServiceClient
      .from('character_quests')
      .select('id')
      .limit(1);

    const quest_tables = !questError;

    // Check if parties table exists
    const { error: partyError } = await supabaseServiceClient
      .from('parties')
      .select('id')
      .limit(1);

    const party_tables = !partyError;

    return {
      game_time_columns,
      travel_sessions_table,
      travel_events_table,
      armor_class_column,
      asset_tables,
      quest_tables,
      party_tables
    };
  } catch (err) {
    console.error('[Migration] Error checking migrations:', err);
    return {
      game_time_columns: false,
      travel_sessions_table: false,
      travel_events_table: false,
      armor_class_column: false,
      asset_tables: false,
      quest_tables: false,
      party_tables: false
    };
  }
}
