# Travel System Database Migrations

This document describes the travel system database migrations and how to apply them.

## Migration Files Created

Three migration files have been created in `/srv/project-chimera/backend/migrations/`:

### 1. `20251022_add_danger_level_to_biomes.sql`
Adds a `danger_level` column to the `world_pois` table to enable the travel system to assess area danger for encounter generation.

**Changes:**
- Adds `danger_level INT` column (values 1-5, default 1)
- Adds constraint: `danger_level >= 1 AND danger_level <= 5`
- Updates existing rows to have default danger level of 1
- Creates indexes for efficient queries

### 2. `20251022_create_travel_sessions.sql`
Creates the `travel_sessions` table to track active and historical character travel sessions.

**Schema:**
- `id` (UUID, primary key)
- `character_id` (UUID, foreign key to characters)
- `destination_id` (UUID, foreign key to world_pois)
- `start_location_id` (UUID, foreign key to world_pois)
- `miles_total` (INT, total distance)
- `miles_traveled` (INT, current progress)
- `travel_mode` (VARCHAR: 'smart', 'active', 'quiet')
- `status` (VARCHAR: 'in_progress', 'paused', 'completed', 'cancelled')
- `created_at`, `updated_at`, `estimated_arrival` (timestamps)

### 3. `20251022_create_travel_events.sql`
Creates the `travel_events` table to track events during character travel.

**Schema:**
- `id` (UUID, primary key)
- `travel_session_id` (UUID, foreign key to travel_sessions)
- `event_type` (VARCHAR, e.g., 'encounter', 'discovery', 'hazard')
- `severity` (VARCHAR: 'trivial', 'minor', 'moderate', 'dangerous', 'deadly')
- `description` (TEXT, narrative description)
- `choices` (JSONB, available player choices)
- `requires_response` (BOOLEAN, whether player input is needed)
- `resolved_choice` (VARCHAR, player's selected choice)
- `created_at`, `resolved_at` (timestamps)

## How to Apply Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc
2. Navigate to the SQL Editor
3. Copy and paste each migration file in order:
   - First: `backend/migrations/20251022_add_danger_level_to_biomes.sql`
   - Second: `backend/migrations/20251022_create_travel_sessions.sql`
   - Third: `backend/migrations/20251022_create_travel_events.sql`
4. Click "Run" for each migration

### Option 2: Supabase CLI

```bash
cd /srv/project-chimera
supabase db push backend/migrations/20251022_add_danger_level_to_biomes.sql
supabase db push backend/migrations/20251022_create_travel_sessions.sql
supabase db push backend/migrations/20251022_create_travel_events.sql
```

### Option 3: Using the Backend Script

```bash
cd /srv/project-chimera
node backend/scripts/apply-migration.js backend/migrations/20251022_add_danger_level_to_biomes.sql
node backend/scripts/apply-migration.js backend/migrations/20251022_create_travel_sessions.sql
node backend/scripts/apply-migration.js backend/migrations/20251022_create_travel_events.sql
```

Note: This requires the `exec_sql` or `exec_raw_sql` function to be created in your database first.

## Verification

After applying the migrations, verify the changes:

```sql
-- Check danger_level column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'danger_level';

-- Check travel_sessions table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'travel_sessions'
ORDER BY ordinal_position;

-- Check travel_events table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'travel_events'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('travel_sessions', 'travel_events');
```

## Next Steps

After successful migration:

1. Restart the backend service: `podman compose restart backend`
2. Test travel system integration
3. Verify that travel endpoints can create and query travel sessions
4. Check that events are properly tracked during travel

## Rollback (if needed)

To rollback these migrations:

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS travel_events CASCADE;
DROP TABLE IF EXISTS travel_sessions CASCADE;

-- Remove danger_level column
ALTER TABLE world_pois DROP COLUMN IF EXISTS danger_level;
```
