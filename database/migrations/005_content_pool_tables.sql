/**
 * Migration: Content Pool Tables
 *
 * Creates tables for pre-generated content pools used by background worker.
 * These allow the Local LLM to generate content proactively, reducing real-time
 * API costs by having content ready when players need it.
 */

-- ============================================================================
-- Quest Templates Pool
-- ============================================================================

CREATE TABLE IF NOT EXISTS quest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives JSONB NOT NULL, -- Array of {type, target, count}
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  level_min INTEGER DEFAULT 1,
  level_max INTEGER DEFAULT 5,
  used BOOLEAN DEFAULT FALSE, -- Mark as used when assigned to character
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  assigned_to_character UUID REFERENCES characters(id) ON DELETE SET NULL
);

CREATE INDEX idx_quest_templates_unused ON quest_templates(used) WHERE used = FALSE;
CREATE INDEX idx_quest_templates_level ON quest_templates(level_min, level_max);

COMMENT ON TABLE quest_templates IS 'Pre-generated quest templates for quick assignment';
COMMENT ON COLUMN quest_templates.used IS 'FALSE = available in pool, TRUE = already assigned';
COMMENT ON COLUMN quest_templates.objectives IS 'Quest objectives as JSON: [{type: "kill_enemies", target: "goblins", count: 5}]';

-- ============================================================================
-- NPC Personalities Pool
-- ============================================================================

CREATE TABLE IF NOT EXISTS npc_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  occupation TEXT NOT NULL,
  personality TEXT NOT NULL, -- Brief personality description
  quirk TEXT NOT NULL, -- Memorable trait
  secret TEXT NOT NULL, -- Background detail
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  spawned_in_campaign TEXT, -- campaign_seed where NPC was spawned
  position JSONB -- {x, y} where NPC was placed
);

CREATE INDEX idx_npc_personalities_unused ON npc_personalities(used) WHERE used = FALSE;
CREATE INDEX idx_npc_personalities_campaign ON npc_personalities(spawned_in_campaign);

COMMENT ON TABLE npc_personalities IS 'Pre-generated NPC personalities for dynamic encounters';
COMMENT ON COLUMN npc_personalities.used IS 'FALSE = available in pool, TRUE = spawned in world';
COMMENT ON COLUMN npc_personalities.secret IS 'Hidden detail for DM to reveal during interactions';

-- ============================================================================
-- Combat Encounters Pool
-- ============================================================================

CREATE TABLE IF NOT EXISTS combat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_rating REAL NOT NULL,
  enemies JSONB NOT NULL, -- Array of enemy stat blocks
  loot_tier TEXT CHECK (loot_tier IN ('minimal', 'standard', 'rich')),
  location_type TEXT NOT NULL, -- forest, cave, dungeon, etc
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  spawned_at_location JSONB -- {x, y, campaign_seed}
);

CREATE INDEX idx_combat_encounters_unused ON combat_encounters(used) WHERE used = FALSE;
CREATE INDEX idx_combat_encounters_cr ON combat_encounters(challenge_rating);
CREATE INDEX idx_combat_encounters_location ON combat_encounters(location_type);

COMMENT ON TABLE combat_encounters IS 'Pre-generated combat encounters with full stat blocks';
COMMENT ON COLUMN combat_encounters.enemies IS 'Enemy stat blocks as JSON: [{name, type, hp, ac, attack_bonus, damage_dice, special_abilities}]';
COMMENT ON COLUMN combat_encounters.challenge_rating IS 'D&D 5e Challenge Rating (0.125 to 10+)';

-- ============================================================================
-- Dungeon Content Pool
-- ============================================================================

CREATE TABLE IF NOT EXISTS dungeon_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  room_count INTEGER NOT NULL,
  rooms JSONB, -- Array of room descriptions and encounters
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'deadly')),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  spawned_at_location JSONB -- {x, y, campaign_seed}
);

CREATE INDEX idx_dungeon_content_unused ON dungeon_content(used) WHERE used = FALSE;
CREATE INDEX idx_dungeon_content_difficulty ON dungeon_content(difficulty);

COMMENT ON TABLE dungeon_content IS 'Pre-generated mini-dungeons with rooms and encounters';
COMMENT ON COLUMN dungeon_content.rooms IS 'Room details as JSON: [{room_number, description, encounter, loot}]';

-- ============================================================================
-- Worker Job Queue
-- ============================================================================

CREATE TYPE job_type AS ENUM (
  'generate_quests',
  'generate_npcs',
  'generate_pois',
  'generate_encounters',
  'generate_dungeons',
  'summarize_session',
  'check_all_pools' -- Special job type to check all content pools
);

CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS worker_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type job_type NOT NULL,
  parameters JSONB, -- Job-specific parameters (campaign_seed, count, etc)
  priority INTEGER DEFAULT 5, -- Lower = higher priority (1-10)
  status job_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB -- Job output/results
);

CREATE INDEX idx_worker_jobs_pending ON worker_jobs(status, priority, created_at)
  WHERE status = 'pending';
CREATE INDEX idx_worker_jobs_status ON worker_jobs(status);
CREATE INDEX idx_worker_jobs_type ON worker_jobs(job_type);

COMMENT ON TABLE worker_jobs IS 'Job queue for background worker - polled every minute';
COMMENT ON COLUMN worker_jobs.priority IS '1=highest, 10=lowest priority';
COMMENT ON COLUMN worker_jobs.parameters IS 'Job-specific config: {count: 10, campaign_seed: "abc", character_id: "123"}';

/**
 * Function to enqueue a job
 */
CREATE OR REPLACE FUNCTION enqueue_worker_job(
  p_job_type job_type,
  p_parameters JSONB DEFAULT NULL,
  p_priority INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO worker_jobs (job_type, parameters, priority)
  VALUES (p_job_type, p_parameters, p_priority)
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

COMMENT ON FUNCTION enqueue_worker_job IS 'Enqueue a background job for the worker';

/**
 * Atomically fetch and lock next pending job (prevents race conditions)
 * This replaces separate SELECT + UPDATE operations with a single transaction
 */
CREATE OR REPLACE FUNCTION fetch_and_lock_job()
RETURNS TABLE (
  id UUID,
  job_type TEXT,
  parameters JSONB,
  priority INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  job_id_to_process UUID;
BEGIN
  -- Find next pending job with row-level lock (SKIP LOCKED prevents race conditions)
  SELECT worker_jobs.id INTO job_id_to_process
  FROM worker_jobs
  WHERE worker_jobs.status = 'pending'::job_status
  ORDER BY priority ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF job_id_to_process IS NOT NULL THEN
    -- Update job status to 'running' and return it
    RETURN QUERY
    UPDATE worker_jobs
    SET
      status = 'running'::job_status,
      started_at = NOW()
    WHERE worker_jobs.id = job_id_to_process
    RETURNING
      worker_jobs.id,
      worker_jobs.job_type::TEXT,
      worker_jobs.parameters,
      worker_jobs.priority,
      worker_jobs.status::TEXT,
      worker_jobs.created_at,
      worker_jobs.started_at,
      worker_jobs.completed_at,
      worker_jobs.error_message,
      worker_jobs.result;
  END IF;
END;
$$;

COMMENT ON FUNCTION fetch_and_lock_job IS 'Atomically fetches next pending job and marks it as running (race-condition safe)';

/**
 * Schedule recurring pool check job (call this from API or cron)
 */
CREATE OR REPLACE FUNCTION schedule_pool_check()
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only schedule if no pending check_all_pools job exists
  IF NOT EXISTS (
    SELECT 1 FROM worker_jobs
    WHERE job_type = 'check_all_pools'
    AND status = 'pending'
  ) THEN
    RETURN enqueue_worker_job('check_all_pools', NULL, 1);
  END IF;

  RETURN NULL;
END;
$$;

-- ============================================================================
-- Background Worker Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS worker_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds REAL,
  jobs_processed INTEGER DEFAULT 0,
  jobs_failed INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('success', 'partial', 'error'))
);

CREATE INDEX idx_worker_metrics_timestamp ON worker_metrics(run_timestamp DESC);

COMMENT ON TABLE worker_metrics IS 'Tracks background worker cycles for monitoring';

-- ============================================================================
-- Helper Functions
-- ============================================================================

/**
 * Get an unused quest from the pool and mark it as used
 */
CREATE OR REPLACE FUNCTION claim_quest_from_pool(
  character_id UUID,
  min_level INTEGER DEFAULT 1,
  max_level INTEGER DEFAULT 10
)
RETURNS TABLE(
  quest_id UUID,
  title TEXT,
  description TEXT,
  objectives JSONB,
  xp_reward INTEGER,
  gold_reward INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    UPDATE quest_templates
    SET
      used = TRUE,
      used_at = NOW(),
      assigned_to_character = character_id
    WHERE id = (
      SELECT id FROM quest_templates
      WHERE used = FALSE
        AND level_min <= max_level
        AND level_max >= min_level
      ORDER BY RANDOM()
      LIMIT 1
    )
    RETURNING id, title, description, objectives, xp_reward, gold_reward
  )
  SELECT * FROM claimed;
END;
$$;

COMMENT ON FUNCTION claim_quest_from_pool IS 'Atomically claims an unused quest from the pool';

/**
 * Get an unused NPC from the pool and mark it as used
 */
CREATE OR REPLACE FUNCTION claim_npc_from_pool(
  campaign_seed TEXT,
  spawn_position JSONB
)
RETURNS TABLE(
  npc_id UUID,
  name TEXT,
  race TEXT,
  occupation TEXT,
  personality TEXT,
  quirk TEXT,
  secret TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    UPDATE npc_personalities
    SET
      used = TRUE,
      used_at = NOW(),
      spawned_in_campaign = campaign_seed,
      position = spawn_position
    WHERE id = (
      SELECT id FROM npc_personalities
      WHERE used = FALSE
      ORDER BY RANDOM()
      LIMIT 1
    )
    RETURNING id, name, race, occupation, personality, quirk, secret
  )
  SELECT * FROM claimed;
END;
$$;

COMMENT ON FUNCTION claim_npc_from_pool IS 'Atomically claims an unused NPC from the pool';

-- ============================================================================
-- Seed Initial Content (Optional - run once)
-- ============================================================================

-- Note: This will be populated by the background worker on first run
-- No seed data needed here
