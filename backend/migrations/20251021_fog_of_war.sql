-- Fog of War System for Strategic World Map
-- Tracks which tiles have been discovered by players

-- Main fog of war table (per campaign)
CREATE TABLE IF NOT EXISTS world_fog (
  campaign_seed TEXT NOT NULL,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_by_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  visibility_state TEXT NOT NULL DEFAULT 'explored', -- 'explored' or 'visible'
  PRIMARY KEY (campaign_seed, tile_x, tile_y)
);

CREATE INDEX idx_fog_campaign ON world_fog(campaign_seed);
CREATE INDEX idx_fog_campaign_coords ON world_fog(campaign_seed, tile_x, tile_y);
CREATE INDEX idx_fog_discovered_at ON world_fog(campaign_seed, discovered_at DESC);

-- Track campaign exploration bounds (for efficient queries)
CREATE TABLE IF NOT EXISTS campaign_bounds (
  campaign_seed TEXT PRIMARY KEY,
  min_x INTEGER NOT NULL DEFAULT 0,
  max_x INTEGER NOT NULL DEFAULT 0,
  min_y INTEGER NOT NULL DEFAULT 0,
  max_y INTEGER NOT NULL DEFAULT 0,
  total_tiles_discovered INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE world_fog IS 'Tracks fog of war state for each tile in each campaign';
COMMENT ON TABLE campaign_bounds IS 'Stores bounding box of discovered areas for efficient rendering';
COMMENT ON COLUMN world_fog.visibility_state IS 'explored=seen before, visible=currently nearby';
