-- Atomic campaign bounds update function
-- Prevents race conditions when multiple tile discoveries happen concurrently

CREATE OR REPLACE FUNCTION update_campaign_bounds_atomic(
  p_campaign_seed text,
  p_new_tiles jsonb -- Array of {x, y} objects
)
RETURNS void AS $$
DECLARE
  v_min_x int;
  v_max_x int;
  v_min_y int;
  v_max_y int;
  v_tile_count int;
BEGIN
  -- Calculate min/max from new tiles
  SELECT
    MIN((tile->>'x')::int),
    MAX((tile->>'x')::int),
    MIN((tile->>'y')::int),
    MAX((tile->>'y')::int),
    COUNT(*)
  INTO v_min_x, v_max_x, v_min_y, v_max_y, v_tile_count
  FROM jsonb_array_elements(p_new_tiles) AS tile;

  -- Atomic upsert with proper min/max calculation
  INSERT INTO campaign_bounds (
    campaign_seed,
    min_x, max_x, min_y, max_y,
    total_tiles_discovered,
    last_updated
  ) VALUES (
    p_campaign_seed,
    v_min_x, v_max_x, v_min_y, v_max_y,
    v_tile_count,
    NOW()
  )
  ON CONFLICT (campaign_seed) DO UPDATE SET
    min_x = LEAST(campaign_bounds.min_x, EXCLUDED.min_x),
    max_x = GREATEST(campaign_bounds.max_x, EXCLUDED.max_x),
    min_y = LEAST(campaign_bounds.min_y, EXCLUDED.min_y),
    max_y = GREATEST(campaign_bounds.max_y, EXCLUDED.max_y),
    total_tiles_discovered = campaign_bounds.total_tiles_discovered + EXCLUDED.total_tiles_discovered,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_campaign_bounds_atomic IS 'Atomically updates campaign bounds using LEAST/GREATEST to handle concurrent updates';
