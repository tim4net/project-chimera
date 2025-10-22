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
