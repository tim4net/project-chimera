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
-- Migration: Create travel_sessions table
-- Date: 2025-10-22
-- Purpose: Track active and historical character travel sessions for the idle travel system

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create travel_sessions table
CREATE TABLE IF NOT EXISTS travel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES world_pois(id),
  start_location_id UUID NOT NULL REFERENCES world_pois(id),
  miles_total INT NOT NULL CHECK (miles_total > 0),
  miles_traveled INT DEFAULT 0 CHECK (miles_traveled >= 0),
  travel_mode VARCHAR(20) DEFAULT 'smart' CHECK (travel_mode IN ('smart', 'active', 'quiet')),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  estimated_arrival TIMESTAMP,
  CONSTRAINT miles_traveled_lte_total CHECK (miles_traveled <= miles_total)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_travel_sessions_character_id
  ON travel_sessions(character_id);

CREATE INDEX IF NOT EXISTS idx_travel_sessions_status
  ON travel_sessions(status);

CREATE INDEX IF NOT EXISTS idx_travel_sessions_character_status
  ON travel_sessions(character_id, status);

CREATE INDEX IF NOT EXISTS idx_travel_sessions_destination
  ON travel_sessions(destination_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_travel_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_travel_sessions_updated_at ON travel_sessions;
CREATE TRIGGER trg_travel_sessions_updated_at
  BEFORE UPDATE ON travel_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_sessions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE travel_sessions IS 'Tracks character travel sessions for the idle travel system';
COMMENT ON COLUMN travel_sessions.character_id IS 'Character who is traveling';
COMMENT ON COLUMN travel_sessions.destination_id IS 'Target POI/location';
COMMENT ON COLUMN travel_sessions.start_location_id IS 'Starting POI/location';
COMMENT ON COLUMN travel_sessions.miles_total IS 'Total distance to travel in miles';
COMMENT ON COLUMN travel_sessions.miles_traveled IS 'Current progress in miles';
COMMENT ON COLUMN travel_sessions.travel_mode IS 'Travel mode: smart (balanced), active (more encounters), quiet (stealth/avoid)';
COMMENT ON COLUMN travel_sessions.status IS 'Current status: in_progress, paused, completed, cancelled';
COMMENT ON COLUMN travel_sessions.estimated_arrival IS 'Estimated arrival time based on speed and distance';
-- Migration: Create travel_events table
-- Date: 2025-10-22
-- Purpose: Track events that occur during character travel (encounters, discoveries, hazards)

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create travel_events table
CREATE TABLE IF NOT EXISTS travel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_session_id UUID NOT NULL REFERENCES travel_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('trivial', 'minor', 'moderate', 'dangerous', 'deadly')),
  description TEXT NOT NULL,
  choices JSONB,
  requires_response BOOLEAN DEFAULT FALSE,
  resolved_choice VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_travel_events_session_id
  ON travel_events(travel_session_id);

CREATE INDEX IF NOT EXISTS idx_travel_events_requires_response
  ON travel_events(requires_response) WHERE requires_response = TRUE;

CREATE INDEX IF NOT EXISTS idx_travel_events_session_created
  ON travel_events(travel_session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_travel_events_event_type
  ON travel_events(event_type);

CREATE INDEX IF NOT EXISTS idx_travel_events_severity
  ON travel_events(severity);

-- Add comments for documentation
COMMENT ON TABLE travel_events IS 'Events that occur during character travel (encounters, discoveries, hazards, etc.)';
COMMENT ON COLUMN travel_events.travel_session_id IS 'The travel session this event belongs to';
COMMENT ON COLUMN travel_events.event_type IS 'Type of event: encounter, discovery, hazard, rest, narrative, etc.';
COMMENT ON COLUMN travel_events.severity IS 'Event severity: trivial, minor, moderate, dangerous, deadly';
COMMENT ON COLUMN travel_events.description IS 'Narrative description of the event';
COMMENT ON COLUMN travel_events.choices IS 'Available player choices as JSONB array of objects with id, text, and outcome fields';
COMMENT ON COLUMN travel_events.requires_response IS 'Whether the event requires player input before travel can continue';
COMMENT ON COLUMN travel_events.resolved_choice IS 'The choice the player selected to resolve the event';
COMMENT ON COLUMN travel_events.resolved_at IS 'When the player resolved this event';
