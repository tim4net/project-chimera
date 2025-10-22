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
