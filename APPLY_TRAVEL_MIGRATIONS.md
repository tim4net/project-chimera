# Travel System Migrations - Application Guide

## STATUS: Ready for Manual Application

Three database migration files have been created and are ready to be applied to Supabase.

## Quick Start (Recommended Method)

### Apply All Migrations at Once

1. **Go to Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new

2. **Copy the combined migration file:**
   ```bash
   cat /srv/project-chimera/TRAVEL_MIGRATIONS_COMBINED.sql
   ```

3. **Paste into SQL Editor and click "Run"**

That's it! All three migrations will be applied in order.

---

## Individual Migration Files

If you prefer to apply them one at a time:

### Migration 1: Add danger_level to world_pois
**File:** `/srv/project-chimera/backend/migrations/20251022_add_danger_level_to_biomes.sql`

**Purpose:** Adds danger rating (1-5) to locations for encounter generation

**What it does:**
- Adds `danger_level INT` column to `world_pois` table
- Sets default value to 1 (safe)
- Adds CHECK constraint (1-5 range)
- Creates indexes for efficient queries

### Migration 2: Create travel_sessions table
**File:** `/srv/project-chimera/backend/migrations/20251022_create_travel_sessions.sql`

**Purpose:** Tracks active and completed character travel sessions

**What it creates:**
- `travel_sessions` table with columns:
  - `id` (UUID)
  - `character_id` (FK to characters)
  - `destination_id` (FK to world_pois)
  - `start_location_id` (FK to world_pois)
  - `miles_total`, `miles_traveled`
  - `travel_mode` (smart/active/quiet)
  - `status` (in_progress/paused/completed/cancelled)
  - Timestamps and estimated arrival
- Indexes on character_id, status, destination_id
- Auto-updating `updated_at` trigger

### Migration 3: Create travel_events table
**File:** `/srv/project-chimera/backend/migrations/20251022_create_travel_events.sql`

**Purpose:** Logs events during travel (encounters, discoveries, hazards)

**What it creates:**
- `travel_events` table with columns:
  - `id` (UUID)
  - `travel_session_id` (FK to travel_sessions)
  - `event_type` (encounter/discovery/hazard/etc.)
  - `severity` (trivial/minor/moderate/dangerous/deadly)
  - `description` (narrative text)
  - `choices` (JSONB for player options)
  - `requires_response` (BOOLEAN)
  - `resolved_choice`, timestamps
- Indexes for efficient querying

---

## Verification Queries

After applying migrations, run these queries to verify:

### 1. Check danger_level column
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'danger_level';
```

**Expected result:** 1 row showing `danger_level | integer | 1 | YES`

### 2. Check travel_sessions table structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'travel_sessions'
ORDER BY ordinal_position;
```

**Expected result:** 11 rows (all columns listed above)

### 3. Check travel_events table structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'travel_events'
ORDER BY ordinal_position;
```

**Expected result:** 10 rows (all columns listed above)

### 4. Check foreign key constraints
```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('travel_sessions', 'travel_events')
  AND tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_type;
```

**Expected foreign keys:**
- `travel_sessions.character_id` → `characters.id`
- `travel_sessions.destination_id` → `world_pois.id`
- `travel_sessions.start_location_id` → `world_pois.id`
- `travel_events.travel_session_id` → `travel_sessions.id`

### 5. Check indexes
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('travel_sessions', 'travel_events', 'world_pois')
  AND (indexname LIKE '%travel%' OR indexname LIKE '%danger%')
ORDER BY tablename, indexname;
```

**Expected indexes:** At least 7 indexes including session_id, character_id, danger_level, etc.

---

## Post-Migration Steps

After successful migration:

1. **Verify all queries above return expected results**

2. **Restart backend service:**
   ```bash
   podman compose restart backend
   ```

3. **Test travel system integration:**
   - Try creating a travel session
   - Verify session is stored in database
   - Check that events are logged

4. **Monitor logs for any errors:**
   ```bash
   podman compose logs -f backend | grep -i "travel\|migration"
   ```

---

## Rollback (Emergency Only)

If you need to undo these migrations:

```sql
-- WARNING: This will delete all travel data!

DROP TABLE IF EXISTS travel_events CASCADE;
DROP TABLE IF EXISTS travel_sessions CASCADE;

ALTER TABLE world_pois DROP COLUMN IF EXISTS danger_level CASCADE;

-- Also drop indexes (they'll be dropped automatically with CASCADE)
```

---

## Troubleshooting

### Error: "relation world_pois does not exist"
The `world_pois` table hasn't been created yet. Check that earlier POI migrations have been applied.

### Error: "relation characters does not exist"
The base schema hasn't been applied. Run the initial schema migrations first.

### Error: "column danger_level already exists"
Migration 1 has already been applied. This is safe to ignore.

### Error: "relation travel_sessions already exists"
Migration 2 has already been applied. This is safe to ignore.

---

## Files Created

All migration files are located in: `/srv/project-chimera/backend/migrations/`

1. `20251022_add_danger_level_to_biomes.sql` (individual)
2. `20251022_create_travel_sessions.sql` (individual)
3. `20251022_create_travel_events.sql` (individual)
4. `/srv/project-chimera/TRAVEL_MIGRATIONS_COMBINED.sql` (all three combined)

Application scripts (optional):
- `/srv/project-chimera/apply_travel_migrations.js` (Node.js with pg pool)
- `/srv/project-chimera/apply_travel_migrations_rest.js` (Node.js with REST API)
- `/srv/project-chimera/backend/scripts/apply-migration.js` (existing script)

---

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify credentials in `.env` file
3. Ensure you have service_role permissions
4. Review detailed README: `TRAVEL_MIGRATIONS_README.md`
