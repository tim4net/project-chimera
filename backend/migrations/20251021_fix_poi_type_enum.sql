-- Migration: Fix poi_type enum to include all settlement types
-- Date: 2025-10-21
-- Issue: Code uses 'village' but enum doesn't accept it
-- Solution: Ensure poi_type enum includes all SettlementType values

-- First, check if the enum exists and create it if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') THEN
    -- Create enum with all settlement types
    CREATE TYPE poi_type AS ENUM (
      'village',
      'town',
      'city',
      'capital',
      'fort',
      'outpost',
      'dungeon',
      'ruins',
      'shrine',
      'landmark',
      'cave',
      'temple'
    );
    RAISE NOTICE 'Created poi_type enum with all settlement types';
  END IF;
END$$;

-- Now add any missing values to existing enum
-- This handles the case where enum exists but is missing 'village' or others
DO $$
DECLARE
  enum_val TEXT;
  missing_values TEXT[] := ARRAY['village', 'town', 'city', 'capital', 'fort', 'outpost', 'dungeon', 'ruins', 'shrine', 'landmark', 'cave', 'temple'];
BEGIN
  FOREACH enum_val IN ARRAY missing_values
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'poi_type'::regtype
      AND enumlabel = enum_val
    ) THEN
      EXECUTE format('ALTER TYPE poi_type ADD VALUE IF NOT EXISTS %L', enum_val);
      RAISE NOTICE 'Added % to poi_type enum', enum_val;
    END IF;
  END LOOP;
END$$;

-- Ensure world_pois table exists with correct structure
CREATE TABLE IF NOT EXISTS world_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type poi_type NOT NULL,
  position JSONB NOT NULL,
  campaign_seed TEXT,
  generated_content JSONB,
  discovered_by_characters UUID[],
  first_discovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS world_pois_campaign_idx
  ON world_pois (campaign_seed);

CREATE INDEX IF NOT EXISTS world_pois_campaign_type_idx
  ON world_pois (campaign_seed, type);

-- Add comment
COMMENT ON TABLE world_pois IS 'Points of Interest in the game world (settlements, dungeons, landmarks, etc.)';
COMMENT ON COLUMN world_pois.type IS 'Type of POI - must be one of the poi_type enum values including village, town, city, capital, fort, outpost, dungeon, ruins, shrine, landmark, cave, temple';
