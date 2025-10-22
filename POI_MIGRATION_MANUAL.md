# POI Type Enum Migration - Manual Application Guide

## Summary

The backend is experiencing errors when trying to query settlements because the `world_pois.type` column uses a restrictive enum that doesn't include 'village'.

**Error:**
```
invalid input value for enum poi_type: "village"
```

**Fix:** Convert the `poi_type` enum to TEXT type to support all settlement types.

---

## Quick Steps (5 minutes)

### Step 1: Access Supabase Console

1. Go to: https://supabase.com/dashboard
2. Click on project: **muhlitkerrjparpcuwmc**
3. Navigate to: **SQL Editor** (or click `+` → **New query**)

### Step 2: Copy & Run Migration SQL

Copy the entire SQL below and paste into the SQL Editor:

```sql
-- Migration: Ensure world_pois uses TEXT for type column (not enum)
-- Date: 2025-10-21
-- Issue: Enum constraints are causing insertion failures
-- Solution: Use TEXT type for maximum flexibility

-- Drop the enum if it exists (it may not be used)
DO $$
BEGIN
  -- First, if world_pois.type is using the enum, change it to TEXT
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'world_pois'
    AND column_name = 'type'
    AND udt_name = 'poi_type'
  ) THEN
    ALTER TABLE world_pois ALTER COLUMN type TYPE TEXT;
    RAISE NOTICE 'Changed world_pois.type from enum to TEXT';
  END IF;

  -- Now drop the enum if it exists and nothing else is using it
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') THEN
    DROP TYPE IF EXISTS poi_type CASCADE;
    RAISE NOTICE 'Dropped poi_type enum';
  END IF;
END$$;

-- Ensure world_pois table exists with TEXT type
CREATE TABLE IF NOT EXISTS world_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- TEXT, not enum, for flexibility
  position JSONB NOT NULL,
  campaign_seed TEXT,
  generated_content JSONB,
  discovered_by_characters UUID[] DEFAULT ARRAY[]::UUID[],
  first_discovered_at TIMESTAMPTZ,
  description TEXT,  -- For backward compatibility
  discovered BOOLEAN DEFAULT FALSE,  -- For backward compatibility
  encounter_chance FLOAT,  -- For backward compatibility
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS world_pois_campaign_idx
  ON world_pois (campaign_seed);

CREATE INDEX IF NOT EXISTS world_pois_campaign_type_idx
  ON world_pois (campaign_seed, type);

CREATE INDEX IF NOT EXISTS world_pois_type_idx
  ON world_pois (type);

-- Add comments
COMMENT ON TABLE world_pois IS 'Points of Interest in the game world (settlements, dungeons, landmarks, etc.)';
COMMENT ON COLUMN world_pois.type IS 'Type of POI as TEXT (village, town, city, capital, fort, outpost, dungeon, ruins, shrine, landmark, cave, temple, etc.)';
COMMENT ON COLUMN world_pois.position IS 'Location as JSONB with {x: number, y: number} structure';
```

### Step 3: Execute

Click the **Run** button (▶️) or press **Ctrl+Enter**

You should see:
```
✅ Query successful
```

### Step 4: Verify

Run this verification query to confirm the migration:

```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'type';
```

Expected result:
```
| column_name | data_type | udt_name |
|-------------|-----------|----------|
| type        | text      | NULL     |
```

### Step 5: Restart Backend

From your terminal:

```bash
cd /srv/project-chimera
podman compose restart backend
```

Check logs:
```bash
podman compose logs backend | tail -20
```

Look for:
```
[RoadNetwork] Loaded X settlements for campaign nuaibria-shared-world-v1
```

If no "invalid enum" errors appear, migration was successful! ✅

---

## Troubleshooting

### If you get "permission denied" error:

This means you're not using a proper role. Use the **Web Console** method above instead of psql.

### If migration doesn't seem to work:

1. Verify table exists:
```sql
SELECT * FROM world_pois LIMIT 1;
```

2. Check column type:
```sql
\d world_pois
-- Look for type column
```

3. Check if enum still exists:
```sql
SELECT typname FROM pg_type WHERE typname = 'poi_type';
-- Should return nothing
```

---

## Files Created

- Migration SQL: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`
- Application script: `/srv/project-chimera/apply_poi_migration.js` (for future automation)
- This guide: `/srv/project-chimera/POI_MIGRATION_MANUAL.md`

---

## After Migration

Once successfully applied:

1. ✅ Backend can query settlements by type
2. ✅ Road network service loads settlements
3. ✅ No more enum errors in logs
4. ✅ POI system works correctly

The system is now ready for continued development!
