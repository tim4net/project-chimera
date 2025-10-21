-- Migration: Add spatial proximity function for finding nearby POIs
-- Date: 2025-10-21
-- Purpose: Fix POI queries to only return locations within a specific radius

CREATE OR REPLACE FUNCTION find_nearby_pois(
  p_campaign_seed text,
  p_x float,
  p_y float,
  p_radius float,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  name text,
  type text,
  poi_position jsonb,
  distance float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.name,
    w.type,
    w.position as poi_position,
    sqrt(
      power((w.position->>'x')::float - p_x, 2) +
      power((w.position->>'y')::float - p_y, 2)
    ) as distance
  FROM world_pois w
  WHERE w.campaign_seed = p_campaign_seed
    AND sqrt(
      power((w.position->>'x')::float - p_x, 2) +
      power((w.position->>'y')::float - p_y, 2)
    ) <= p_radius
  ORDER BY distance
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION find_nearby_pois IS 'Returns POIs within a specified radius of a given position, ordered by distance';
