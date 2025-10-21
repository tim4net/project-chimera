-- Migration: Create world_landmarks table for procedural landmarks
-- Date: 2025-10-21
-- Purpose: Store deterministic landmarks generated per campaign seed

CREATE TABLE IF NOT EXISTS world_landmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_seed text NOT NULL,
  tile_x integer NOT NULL,
  tile_y integer NOT NULL,
  position jsonb NOT NULL,
  type text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  nearest_road_id uuid REFERENCES world_roads(id) ON DELETE SET NULL,
  nearest_road_name text,
  nearest_settlement_id uuid REFERENCES world_pois(id) ON DELETE SET NULL,
  nearest_settlement_name text,
  discovery_state jsonb NOT NULL DEFAULT jsonb_build_object(
    'discovered_by', jsonb_build_array(),
    'last_discovered_at', NULL
  ),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (campaign_seed, tile_x, tile_y)
);

CREATE INDEX IF NOT EXISTS world_landmarks_campaign_idx
  ON world_landmarks (campaign_seed);

CREATE INDEX IF NOT EXISTS world_landmarks_position_idx
  ON world_landmarks USING GIN ((position));

CREATE OR REPLACE FUNCTION update_world_landmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_world_landmarks_updated_at
BEFORE UPDATE ON world_landmarks
FOR EACH ROW
EXECUTE FUNCTION update_world_landmarks_updated_at();

COMMENT ON TABLE world_landmarks IS 'Procedurally generated landmarks tied to campaign seed and tile coordinates.';
COMMENT ON COLUMN world_landmarks.position IS 'JSON object with x/y coordinates for landmark position.';
COMMENT ON COLUMN world_landmarks.discovery_state IS 'Tracks discovery metadata (discovered_by character IDs, timestamps, custom notes).';
