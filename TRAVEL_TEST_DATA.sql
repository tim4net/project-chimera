-- ============================================================================
-- Travel System Test Data Script
-- ============================================================================
-- Purpose: Create test locations with various danger levels for E2E testing
-- Usage: psql <connection-string> -f TRAVEL_TEST_DATA.sql
-- ============================================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: Create Test Locations with Danger Levels
-- ============================================================================

-- Clear existing test locations (optional - comment out if you want to keep existing data)
-- DELETE FROM world_pois WHERE name LIKE 'TEST:%';

-- Safe Zone (Danger Level 1)
INSERT INTO world_pois (
  id,
  name,
  poi_type,
  x,
  y,
  description,
  danger_level,
  discovered,
  campaign_seed
) VALUES (
  gen_random_uuid(),
  'TEST: Peaceful Meadow',
  'landmark',
  5,
  5,
  'A tranquil meadow filled with wildflowers and grazing deer. The air is fresh and calm.',
  1,
  true,
  'test-seed-001'
),
(
  gen_random_uuid(),
  'TEST: Friendly Village',
  'town',
  8,
  3,
  'A small village where travelers are welcomed with open arms. Smoke rises from chimneys.',
  1,
  true,
  'test-seed-001'
);

-- Low Danger Zone (Danger Level 2)
INSERT INTO world_pois (
  id,
  name,
  poi_type,
  x,
  y,
  description,
  danger_level,
  discovered,
  campaign_seed
) VALUES (
  gen_random_uuid(),
  'TEST: Old Forest Path',
  'landmark',
  12,
  8,
  'An ancient forest trail marked by weathered stones. The trees whisper softly in the breeze.',
  2,
  true,
  'test-seed-001'
),
(
  gen_random_uuid(),
  'TEST: Abandoned Watchtower',
  'ruin',
  15,
  10,
  'A crumbling stone tower overlooking the countryside. Rumors say bandits once used it as a hideout.',
  2,
  true,
  'test-seed-001'
);

-- Moderate Danger Zone (Danger Level 3)
INSERT INTO world_pois (
  id,
  name,
  poi_type,
  x,
  y,
  description,
  danger_level,
  discovered,
  campaign_seed
) VALUES (
  gen_random_uuid(),
  'TEST: Goblin-Infested Hills',
  'landmark',
  20,
  15,
  'Rocky hills known to be the territory of goblin tribes. Travelers are advised to stay alert.',
  3,
  true,
  'test-seed-001'
),
(
  gen_random_uuid(),
  'TEST: Misty Marshlands',
  'dungeon',
  18,
  20,
  'A fog-covered swamp where visibility is low and dangers lurk beneath the murky water.',
  3,
  true,
  'test-seed-001'
);

-- High Danger Zone (Danger Level 4)
INSERT INTO world_pois (
  id,
  name,
  poi_type,
  x,
  y,
  description,
  danger_level,
  discovered,
  campaign_seed
) VALUES (
  gen_random_uuid(),
  'TEST: Bandit Stronghold',
  'dungeon',
  25,
  25,
  'A fortified camp controlled by a notorious bandit gang. Few who enter leave alive.',
  4,
  true,
  'test-seed-001'
),
(
  gen_random_uuid(),
  'TEST: Lightning Peak',
  'landmark',
  30,
  22,
  'A jagged mountain peak where thunderstorms rage constantly. Lightning scarring covers the rocks.',
  4,
  true,
  'test-seed-001'
);

-- Extreme Danger Zone (Danger Level 5)
INSERT INTO world_pois (
  id,
  name,
  poi_type,
  x,
  y,
  description,
  danger_level,
  discovered,
  campaign_seed
) VALUES (
  gen_random_uuid(),
  'TEST: Dragon''s Lair',
  'dungeon',
  35,
  30,
  'A massive cavern carved into a volcanic mountain. The air shimmers with heat and the smell of sulfur.',
  5,
  true,
  'test-seed-001'
),
(
  gen_random_uuid(),
  'TEST: Cursed Ruins of Maldrath',
  'ruin',
  40,
  35,
  'Ancient ruins radiating dark energy. Legends speak of a necromancer who still haunts these halls.',
  5,
  true,
  'test-seed-001'
);

-- ============================================================================
-- PART 2: Update Existing Locations with Danger Levels (if needed)
-- ============================================================================

-- Add danger_level column if it doesn't exist
-- Note: This assumes world_pois might not have danger_level yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'world_pois'
    AND column_name = 'danger_level'
  ) THEN
    ALTER TABLE world_pois ADD COLUMN danger_level INTEGER DEFAULT 1 CHECK (danger_level BETWEEN 1 AND 5);
  END IF;
END $$;

-- Update existing POIs without danger_level to have default values based on type
UPDATE world_pois
SET danger_level = CASE
  WHEN poi_type = 'town' THEN 1
  WHEN poi_type = 'landmark' THEN 2
  WHEN poi_type = 'ruin' THEN 3
  WHEN poi_type = 'dungeon' THEN 4
  ELSE 2
END
WHERE danger_level IS NULL OR danger_level = 0;

-- ============================================================================
-- PART 3: Create Test Character (if not exists)
-- ============================================================================

-- Note: Replace '<your-auth-user-id>' with actual auth.users.id from Supabase Auth

-- Check if test character exists
DO $$
DECLARE
  test_user_id UUID;
  char_count INTEGER;
BEGIN
  -- Try to find an authenticated user (use first available user for testing)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Check if test character already exists
    SELECT COUNT(*) INTO char_count FROM characters WHERE name = 'Test Adventurer';

    IF char_count = 0 THEN
      -- Create test character
      INSERT INTO characters (
        id,
        user_id,
        name,
        race,
        class,
        level,
        hp_current,
        hp_max,
        xp,
        position_x,
        position_y,
        campaign_seed,
        ability_scores
      ) VALUES (
        gen_random_uuid(),
        test_user_id,
        'Test Adventurer',
        'Human',
        'Fighter',
        3,
        30,
        30,
        900,
        0,
        0,
        'test-seed-001',
        '{
          "strength": 16,
          "dexterity": 12,
          "constitution": 14,
          "intelligence": 10,
          "wisdom": 11,
          "charisma": 13
        }'::jsonb
      );

      RAISE NOTICE 'Test character "Test Adventurer" created successfully';
    ELSE
      RAISE NOTICE 'Test character "Test Adventurer" already exists';
    END IF;
  ELSE
    RAISE NOTICE 'No authenticated users found. Please create a user first via Supabase Auth.';
  END IF;
END $$;

-- ============================================================================
-- PART 4: Create Travel Tables (if they don't exist)
-- ============================================================================

-- Create travel_sessions table
CREATE TABLE IF NOT EXISTS travel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES world_pois(id) ON DELETE SET NULL,
  destination_x INTEGER NOT NULL,
  destination_y INTEGER NOT NULL,
  miles_total NUMERIC(10, 2) NOT NULL CHECK (miles_total > 0),
  miles_traveled NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (miles_traveled >= 0),
  travel_mode TEXT NOT NULL DEFAULT 'normal' CHECK (travel_mode IN ('cautious', 'normal', 'hasty')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for travel_sessions
CREATE INDEX IF NOT EXISTS travel_sessions_character_id_idx ON travel_sessions(character_id);
CREATE INDEX IF NOT EXISTS travel_sessions_status_idx ON travel_sessions(status);
CREATE INDEX IF NOT EXISTS travel_sessions_created_at_idx ON travel_sessions(created_at DESC);

-- Create travel_events table
CREATE TABLE IF NOT EXISTS travel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('trivial', 'minor', 'moderate', 'dangerous', 'deadly')),
  description TEXT NOT NULL,
  choices JSONB,
  requires_response BOOLEAN NOT NULL DEFAULT false,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for travel_events
CREATE INDEX IF NOT EXISTS travel_events_session_id_idx ON travel_events(session_id);
CREATE INDEX IF NOT EXISTS travel_events_severity_idx ON travel_events(severity);
CREATE INDEX IF NOT EXISTS travel_events_resolved_idx ON travel_events(resolved);
CREATE INDEX IF NOT EXISTS travel_events_created_at_idx ON travel_events(created_at DESC);

-- ============================================================================
-- PART 5: Verification Queries
-- ============================================================================

-- Query 1: Verify test locations were created
SELECT
  name,
  poi_type,
  x,
  y,
  danger_level,
  CASE
    WHEN danger_level = 1 THEN 'Safe'
    WHEN danger_level = 2 THEN 'Low Danger'
    WHEN danger_level = 3 THEN 'Moderate Danger'
    WHEN danger_level = 4 THEN 'High Danger'
    WHEN danger_level = 5 THEN 'Extreme Danger'
    ELSE 'Unknown'
  END AS danger_description
FROM world_pois
WHERE name LIKE 'TEST:%'
ORDER BY danger_level ASC, name ASC;

-- Query 2: Verify test character exists
SELECT
  id,
  name,
  race,
  class,
  level,
  hp_current,
  hp_max,
  position_x,
  position_y,
  campaign_seed
FROM characters
WHERE name = 'Test Adventurer';

-- Query 3: Verify travel tables exist
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('travel_sessions', 'travel_events')
ORDER BY table_name;

-- Query 4: Show all locations by danger level
SELECT
  danger_level,
  COUNT(*) AS location_count,
  STRING_AGG(name, ', ') AS locations
FROM world_pois
WHERE name LIKE 'TEST:%'
GROUP BY danger_level
ORDER BY danger_level ASC;

-- ============================================================================
-- PART 6: Test Data Summary
-- ============================================================================

-- Display summary of test data created
DO $$
DECLARE
  poi_count INTEGER;
  char_count INTEGER;
  safe_count INTEGER;
  danger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO poi_count FROM world_pois WHERE name LIKE 'TEST:%';
  SELECT COUNT(*) INTO char_count FROM characters WHERE name = 'Test Adventurer';
  SELECT COUNT(*) INTO safe_count FROM world_pois WHERE name LIKE 'TEST:%' AND danger_level IN (1, 2);
  SELECT COUNT(*) INTO danger_count FROM world_pois WHERE name LIKE 'TEST:%' AND danger_level IN (4, 5);

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Travel Test Data Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test Locations Created: %', poi_count;
  RAISE NOTICE 'Test Characters Created: %', char_count;
  RAISE NOTICE 'Safe/Low Danger Locations: %', safe_count;
  RAISE NOTICE 'High/Extreme Danger Locations: %', danger_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test data setup complete!';
  RAISE NOTICE 'Use TRAVEL_E2E_TEST_GUIDE.md for testing instructions.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- CLEANUP (Optional - Uncomment to remove test data)
-- ============================================================================

-- To remove all test data, uncomment and run the following:

-- DELETE FROM travel_events WHERE session_id IN (
--   SELECT id FROM travel_sessions WHERE character_id IN (
--     SELECT id FROM characters WHERE name = 'Test Adventurer'
--   )
-- );

-- DELETE FROM travel_sessions WHERE character_id IN (
--   SELECT id FROM characters WHERE name = 'Test Adventurer'
-- );

-- DELETE FROM characters WHERE name = 'Test Adventurer';

-- DELETE FROM world_pois WHERE name LIKE 'TEST:%';

-- RAISE NOTICE 'Test data cleanup complete!';
