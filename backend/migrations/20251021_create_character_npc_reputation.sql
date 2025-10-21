-- Migration: Create character_npc_reputation table
-- Date: 2025-10-21
-- Purpose: Track per-character reputation with globally persistent NPCs

CREATE TABLE IF NOT EXISTS character_npc_reputation (
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  npc_id uuid NOT NULL REFERENCES world_npcs(id) ON DELETE CASCADE,
  reputation_score integer NOT NULL DEFAULT 0 CHECK (reputation_score BETWEEN -100 AND 100),
  quests_given integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  last_interaction_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (character_id, npc_id)
);

CREATE OR REPLACE FUNCTION update_character_npc_reputation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_character_npc_reputation_updated_at
BEFORE UPDATE ON character_npc_reputation
FOR EACH ROW
EXECUTE FUNCTION update_character_npc_reputation_updated_at();

COMMENT ON TABLE character_npc_reputation IS 'Per-character reputation tracking for persistent NPCs (shared world consequences).';
