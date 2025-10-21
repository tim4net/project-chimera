-- Migration: Create world_npcs table for persistent NPCs
-- Date: 2025-10-21
-- Purpose: Persist NPC state across all characters in a campaign

DO $$ BEGIN
  CREATE TYPE npc_state_enum AS ENUM ('alive', 'dead', 'missing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE npc_location_enum AS ENUM ('settlement', 'poi', 'landmark', 'wilderness');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS world_npcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_seed text NOT NULL,
  name text NOT NULL,
  race text NOT NULL,
  class text NOT NULL,
  role text NOT NULL,
  personality text NOT NULL,
  state npc_state_enum NOT NULL DEFAULT 'alive',
  home_location_type npc_location_enum NOT NULL,
  home_location_id uuid,
  current_location_type npc_location_enum NOT NULL,
  current_location_id uuid,
  current_position jsonb,
  quests_given_total integer NOT NULL DEFAULT 0,
  quests_completed_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_moved_at timestamptz,
  CONSTRAINT fk_home_location CHECK (
    (home_location_type = 'settlement' AND home_location_id IS NOT NULL) OR
    (home_location_type = 'poi' AND home_location_id IS NOT NULL) OR
    (home_location_type = 'landmark' AND home_location_id IS NOT NULL) OR
    (home_location_type = 'wilderness' AND home_location_id IS NULL)
  ),
  CONSTRAINT fk_current_location CHECK (
    (current_location_type = 'settlement' AND current_location_id IS NOT NULL) OR
    (current_location_type = 'poi' AND current_location_id IS NOT NULL) OR
    (current_location_type = 'landmark' AND current_location_id IS NOT NULL) OR
    (current_location_type = 'wilderness' AND current_location_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS world_npcs_campaign_idx ON world_npcs (campaign_seed);
CREATE INDEX IF NOT EXISTS world_npcs_current_location_idx ON world_npcs (current_location_type, current_location_id);
CREATE INDEX IF NOT EXISTS world_npcs_state_idx ON world_npcs (state);

CREATE OR REPLACE FUNCTION update_world_npcs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_world_npcs_updated_at
BEFORE UPDATE ON world_npcs
FOR EACH ROW
EXECUTE FUNCTION update_world_npcs_updated_at();

COMMENT ON TABLE world_npcs IS 'Globally persistent NPCs shared across all characters in a campaign.';
COMMENT ON COLUMN world_npcs.current_position IS 'JSON object containing current x/y position for roaming NPCs.';
