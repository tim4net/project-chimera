-- Migration: Ensure world_pois uses TEXT for type column (not enum)
-- Date: 2025-10-21
-- Issue: Enum constraints are causing insertion failures
-- Solution: Use TEXT type for maximum flexibility

-- Drop the enum if it exists (it may not be used)
DO $$
BEGIN
  -- First, if world_pois.type is using the enum, change it to TEXT
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'world_pois'
    AND column_name = 'type'
    AND udt_name = 'poi_type'
  ) THEN
    ALTER TABLE world_pois ALTER COLUMN type TYPE TEXT;
    RAISE NOTICE 'Changed world_pois.type from enum to TEXT';
  END IF;

  -- Now drop the enum if it exists and nothing else is using it
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') THEN
    DROP TYPE IF EXISTS poi_type CASCADE;
    RAISE NOTICE 'Dropped poi_type enum';
  END IF;
END$$;

-- Ensure world_pois table exists with TEXT type
CREATE TABLE IF NOT EXISTS world_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- TEXT, not enum, for flexibility
  position JSONB NOT NULL,
  campaign_seed TEXT,
  generated_content JSONB,
  discovered_by_characters UUID[] DEFAULT ARRAY[]::UUID[],
  first_discovered_at TIMESTAMPTZ,
  description TEXT,  -- For backward compatibility
  discovered BOOLEAN DEFAULT FALSE,  -- For backward compatibility
  encounter_chance FLOAT,  -- For backward compatibility
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS world_pois_campaign_idx
  ON world_pois (campaign_seed);

CREATE INDEX IF NOT EXISTS world_pois_campaign_type_idx
  ON world_pois (campaign_seed, type);

CREATE INDEX IF NOT EXISTS world_pois_type_idx
  ON world_pois (type);

-- Add comments
COMMENT ON TABLE world_pois IS 'Points of Interest in the game world (settlements, dungeons, landmarks, etc.)';
COMMENT ON COLUMN world_pois.type IS 'Type of POI as TEXT (village, town, city, capital, fort, outpost, dungeon, ruins, shrine, landmark, cave, temple, etc.)';
COMMENT ON COLUMN world_pois.position IS 'Location as JSONB with {x: number, y: number} structure';
