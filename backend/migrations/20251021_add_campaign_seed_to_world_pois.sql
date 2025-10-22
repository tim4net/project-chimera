-- Migration: Ensure world_pois has campaign_seed and proper indexes
-- Date: 2025-10-21

ALTER TABLE world_pois
  ADD COLUMN IF NOT EXISTS campaign_seed TEXT;

-- Backfill: set a default campaign for existing rows if null.
-- NOTE: adjust the seed below if your project uses a different default.
UPDATE world_pois
SET campaign_seed = COALESCE(campaign_seed, 'nuaibria-shared-world-v1');

-- Index for common filters
CREATE INDEX IF NOT EXISTS world_pois_campaign_idx
  ON world_pois (campaign_seed);

-- Optional: speed up settlement queries by type within a campaign
CREATE INDEX IF NOT EXISTS world_pois_campaign_type_idx
  ON world_pois (campaign_seed, type);

