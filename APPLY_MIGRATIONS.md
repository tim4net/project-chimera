# How to Apply Pending Migrations

## Issue #1: POI Type Enum Mismatch (CRITICAL)

**Problem:** The backend code uses `'village'` as a POI type, but the database schema may have a restrictive enum or incorrect type definition.

**Solution:** Two migration approaches available:

### Option A: Use TEXT type (Recommended - Most Flexible)
```bash
# Apply the TEXT-based migration
cat backend/migrations/20251021_ensure_world_pois_text_type.sql | \
  PGPASSWORD=nuaibria-db-pass psql \
  -h muhlitkerrjparpcuwmc.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432
```

This migration:
- Converts `world_pois.type` from enum to TEXT if needed
- Drops the restrictive `poi_type` enum
- Creates the table with TEXT type if it doesn't exist
- Adds all necessary indexes

### Option B: Use Enum with All Values
```bash
# Apply the enum-based migration
cat backend/migrations/20251021_fix_poi_type_enum.sql | \
  PGPASSWORD=nuaibria-db-pass psql \
  -h muhlitkerrjparpcuwmc.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432
```

This migration:
- Creates or updates `poi_type` enum to include all settlement types
- Adds: village, town, city, capital, fort, outpost, dungeon, ruins, shrine, landmark, cave, temple

**Recommendation:** Use Option A (TEXT type) for maximum flexibility since the codebase frequently adds new POI types.

## Testing After Migration

```bash
# Verify the table structure
PGPASSWORD=nuaibria-db-pass psql \
  -h muhlitkerrjparpcuwmc.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -c "\d world_pois"

# Test inserting a village POI
PGPASSWORD=nuaibria-db-pass psql \
  -h muhlitkerrjparpcuwmc.supabase.co \
  -U postgres \
  -d postgres \
  -p 5432 \
  -c "INSERT INTO world_pois (name, type, position, campaign_seed) VALUES ('Test Village', 'village', '{\"x\": 0, \"y\": 0}'::jsonb, 'test-campaign') RETURNING id;"
```

## Alternative: Use Supabase Dashboard

1. Go to https://muhlitkerrjparpcuwmc.supabase.co
2. Navigate to SQL Editor
3. Paste the contents of `backend/migrations/20251021_ensure_world_pois_text_type.sql`
4. Click "Run"

## Files Created

- `/srv/project-chimera/backend/migrations/20251021_fix_poi_type_enum.sql` - Enum approach
- `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql` - TEXT approach (recommended)
