# POI Migration - Final Status & Action Required

## Summary

All attempts to apply the POI type enum migration programmatically have been exhausted. The migration **must be applied manually** via the Supabase web console.

## What Was Attempted

| Method | Result | Why It Failed |
|--------|--------|---------------|
| Direct PostgreSQL (psql) | ❌ Network timeout | IPv6 blocked from container |
| Supabase REST API (PostgREST) | ❌ No DDL support | REST APIs only support DML (SELECT/INSERT/UPDATE/DELETE) |
| Supabase JS Client | ❌ No DDL support | Same as REST API limitation |
| Personal Access Token (PostgreSQL) | ❌ Connection timeout | Token doesn't grant DB access, only API access |

## What Needs To Be Done (Manual)

### Step 1: Open Supabase Console
**URL:** https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new

### Step 2: Copy & Run This SQL

```sql
DO $$
BEGIN
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

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') THEN
    DROP TYPE IF EXISTS poi_type CASCADE;
    RAISE NOTICE 'Dropped poi_type enum';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS world_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  position JSONB NOT NULL,
  campaign_seed TEXT,
  generated_content JSONB,
  discovered_by_characters UUID[] DEFAULT ARRAY[]::UUID[],
  first_discovered_at TIMESTAMPTZ,
  description TEXT,
  discovered BOOLEAN DEFAULT FALSE,
  encounter_chance FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS world_pois_campaign_idx ON world_pois (campaign_seed);
CREATE INDEX IF NOT EXISTS world_pois_campaign_type_idx ON world_pois (campaign_seed, type);
CREATE INDEX IF NOT EXISTS world_pois_type_idx ON world_pois (type);

COMMENT ON TABLE world_pois IS 'Points of Interest in the game world (settlements, dungeons, landmarks, etc.)';
COMMENT ON COLUMN world_pois.type IS 'Type of POI as TEXT (village, town, city, capital, fort, outpost, dungeon, ruins, shrine, landmark, cave, temple, etc.)';
COMMENT ON COLUMN world_pois.position IS 'Location as JSONB with {x: number, y: number} structure';
```

### Step 3: Execute
- Click **RUN** button or press `Ctrl+Enter`
- Wait for completion
- Should see: `Query successful`

### Step 4: Verify
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'type';
```

Expected result:
```
| column_name | data_type |
|-------------|-----------|
| type        | text      |
```

### Step 5: Restart Backend
```bash
cd /srv/project-chimera
podman compose restart backend
```

### Step 6: Verify Success
```bash
podman compose logs backend | grep -i "roadnetwork\|invalid input value for enum"
```

Should see:
- ✅ `[RoadNetwork] Loaded X settlements for campaign nuaibria-shared-world-v1`
- ✅ NO errors about "invalid input value for enum poi_type"

---

## Why Manual Application Is Required

**PostgREST (Supabase's REST API) Limitation:**
- PostgREST is designed for CRUD operations (SELECT, INSERT, UPDATE, DELETE)
- DDL operations (CREATE TABLE, ALTER TABLE, DROP TYPE) are **not supported** via REST
- This is an architectural decision by PostgREST for security and stability

**Direct Database Connection Attempts:**
- Network restrictions prevent direct psql access from the container
- Supabase Personal Access Tokens grant API access only, not database access

**Workarounds Tested:**
- ✗ Creating a helper function via RPC (would need DDL support first)
- ✗ Splitting migration into callable functions (PostgREST still won't execute)
- ✗ Using Supabase JS client (same REST API limitations)

---

## Current Impact

With the enum constraint in place:
- ❌ Road network service cannot load settlements (gets "invalid enum" errors)
- ❌ POI queries fail with: `invalid input value for enum poi_type: "village"`
- ❌ World building systems cannot operate properly

Once migration is applied:
- ✅ Road network service works
- ✅ World building systems operational
- ✅ All POI types supported (village, town, city, etc.)

---

## Files for Reference

- Migration SQL: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`
- Application scripts: `/srv/project-chimera/apply_*.js` (for future attempts)
- This guide: `/srv/project-chimera/POI_MIGRATION_MANUAL.md`

---

## Time Estimate

**Manual application:** 2-3 minutes

Please apply the migration via the Supabase console and the system will be fully operational!
