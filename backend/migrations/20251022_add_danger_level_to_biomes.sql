-- Migration: Add danger_level column to world_pois (locations/biomes)
-- Date: 2025-10-22
-- Purpose: Enable travel system to assess area danger for encounter generation

-- Add danger_level column to world_pois if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'world_pois'
    AND column_name = 'danger_level'
  ) THEN
    ALTER TABLE world_pois
      ADD COLUMN danger_level INT DEFAULT 1 CHECK (danger_level >= 1 AND danger_level <= 5);
    RAISE NOTICE 'Added danger_level column to world_pois';
  ELSE
    RAISE NOTICE 'danger_level column already exists in world_pois';
  END IF;
END$$;

-- Update existing rows to have a default danger level of 1 (safe)
UPDATE world_pois
SET danger_level = 1
WHERE danger_level IS NULL;

-- Add index for efficient danger level queries
CREATE INDEX IF NOT EXISTS idx_world_pois_danger_level
  ON world_pois (danger_level);

-- Add index for combined campaign + danger queries
CREATE INDEX IF NOT EXISTS idx_world_pois_campaign_danger
  ON world_pois (campaign_seed, danger_level);

-- Add comment for documentation
COMMENT ON COLUMN world_pois.danger_level IS 'Danger rating of the location (1=safe, 2=low, 3=moderate, 4=dangerous, 5=deadly). Used by travel system for encounter generation.';
