# Travel System Migration Deployment Guide

**Date:** 2025-10-22
**Status:** ✅ MIGRATIONS READY FOR DEPLOYMENT
**Environment:** Cannot deploy from current environment due to network restrictions

---

## Problem

The current development environment cannot reach the external Supabase Cloud database due to network restrictions. However, all migrations have been created and are ready to deploy.

---

## Solution: Apply Migrations Manually

### Option 1: Via Supabase Dashboard (RECOMMENDED - Easiest)

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/
   - Project: nuaibria
   - Organization: Your account

2. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Click "New Query"

3. **Copy and Paste Migration 008**
   - File: `/srv/project-chimera/database/migrations/008_add_game_time_and_calendar.sql`
   - Copy entire contents
   - Paste into SQL editor
   - Click "Run"
   - Verify: ✅ No errors

4. **Copy and Paste Migration 009**
   - File: `/srv/project-chimera/database/migrations/009_create_travel_sessions_table.sql`
   - Copy entire contents
   - Paste into SQL editor
   - Click "Run"
   - Verify: ✅ No errors

5. **Copy and Paste Migration 010**
   - File: `/srv/project-chimera/database/migrations/010_create_travel_events_table.sql`
   - Copy entire contents
   - Paste into SQL editor
   - Click "Run"
   - Verify: ✅ No errors

### Option 2: Via Supabase CLI (If Installed Locally)

From your local machine (where you have network access to Supabase):

```bash
# Navigate to project directory
cd /path/to/project-chimera

# Set up Supabase project link (if not already done)
supabase link

# Push migrations
supabase db push

# Verify status
supabase migration list
```

### Option 3: Via psql (If You Have Direct Access)

From a machine with network access to Supabase Cloud:

```bash
# Set environment variables
export PGPASSWORD="YFKAjQjbAhxTjgqvQl1552IhEPGmanzG"
export DB_HOST="db.muhlitkerrjparpcuwmc.supabase.co"
export DB_USER="postgres.muhlitkerrjparpcuwmc"
export DB_NAME="postgres"

# Apply migrations
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/008_add_game_time_and_calendar.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/009_create_travel_sessions_table.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/010_create_travel_events_table.sql

# Verify tables created
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('travel_sessions', 'travel_events')
ORDER BY table_name;
"
```

---

## Verification Checklist

After applying the migrations, verify they were successful:

### 1. Check Characters Table Has New Columns

**Query:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'characters'
  AND column_name IN ('game_time_minutes', 'world_date_day', 'world_date_month', 'world_date_year')
ORDER BY ordinal_position;
```

**Expected Output:**
```
column_name         | data_type
--------------------|----------
game_time_minutes   | bigint
world_date_day      | integer
world_date_month    | integer
world_date_year     | integer
```

### 2. Verify travel_sessions Table Exists

**Query:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'travel_sessions'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid, NOT NULL)
- character_id (uuid, NOT NULL)
- status (text, NOT NULL)
- miles_traveled (numeric, NOT NULL)
- miles_total (numeric, NOT NULL)
- destination_x (integer, NOT NULL)
- destination_y (integer, NOT NULL)
- travel_mode (text, NOT NULL)
- created_at (timestamptz, NOT NULL)
- updated_at (timestamptz, NOT NULL)
- completed_at (timestamptz, nullable)

### 3. Verify travel_events Table Exists

**Query:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'travel_events'
ORDER BY ordinal_position;
```

**Expected Columns:**
- id (uuid, NOT NULL)
- session_id (uuid, NOT NULL)
- type (text, NOT NULL)
- severity (text, NOT NULL)
- description (text, NOT NULL)
- choices (jsonb, nullable)
- requires_response (boolean, NOT NULL)
- resolved (boolean, NOT NULL)
- resolution (text, nullable)
- created_at (timestamptz, NOT NULL)

### 4. Check Indexes Were Created

**Query:**
```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('characters', 'travel_sessions', 'travel_events')
ORDER BY tablename, indexname;
```

**Expected Indexes:**
- characters: characters_world_date_idx
- travel_sessions: idx_travel_sessions_character_id, idx_travel_sessions_status, idx_travel_sessions_active
- travel_events: idx_travel_events_session_id, idx_travel_events_requires_response, idx_travel_events_severity

### 5. Verify Row Level Security (RLS) Policies

**Query:**
```sql
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('travel_sessions', 'travel_events')
ORDER BY tablename, policyname;
```

**Expected Policies per Table:**
- Select own [table]
- Insert own [table]
- Update own [table]
- Delete own [table]

---

## Quick Verification Script

Run this after deploying migrations to verify everything is in place:

```sql
-- Check tables exist
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'travel_sessions') as travel_sessions_exists,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'travel_events') as travel_events_exists;

-- Check characters columns
SELECT COUNT(*) as game_time_columns FROM information_schema.columns
WHERE table_name = 'characters'
AND column_name IN ('game_time_minutes', 'world_date_day', 'world_date_month', 'world_date_year');

-- Check indexes
SELECT COUNT(*) as total_indexes FROM pg_indexes
WHERE tablename IN ('travel_sessions', 'travel_events');

-- Check RLS policies
SELECT COUNT(*) as total_policies FROM pg_policies
WHERE tablename IN ('travel_sessions', 'travel_events');
```

**Expected Output:**
```
travel_sessions_exists | travel_events_exists
-----|-----
true | true

game_time_columns
4

total_indexes
6

total_policies
8
```

---

## Migration Files Reference

All migration files are located in `/srv/project-chimera/database/migrations/`:

### Migration 008: Add Game-Time and Calendar
**File:** `008_add_game_time_and_calendar.sql`
**Size:** 956 bytes
**Changes:**
- Add 4 columns to characters table
- Add 3 check constraints
- Create 1 index

### Migration 009: Create Travel Sessions Table
**File:** `009_create_travel_sessions_table.sql`
**Size:** 3,719 bytes
**Changes:**
- Create travel_sessions table with 10 columns
- Create 3 indexes
- Create auto-update trigger
- Enable RLS and create 4 policies
- Grant permissions to authenticated role

### Migration 010: Create Travel Events Table
**File:** `010_create_travel_events_table.sql`
**Size:** 3,689 bytes
**Changes:**
- Create travel_events table with 10 columns
- Create 3 indexes
- Enable RLS and create 4 policies
- Grant permissions to authenticated role

---

## After Migrations Are Applied

### 1. Restart Backend Services
```bash
podman compose restart backend worker
```

### 2. Run Manual Test
1. Open web frontend: http://localhost:8080
2. Create a new character
3. Have character travel to a distant location
4. Monitor backend logs: `podman compose logs -f backend | grep TravelWorker`
5. Wait and observe:
   - Position updates every 60 seconds
   - game_time_minutes increases by 10
   - New tiles are discovered
   - Character eventually arrives at destination

### 3. Verify in Database
Query to check progress:
```sql
SELECT
  c.name,
  c.position_x, c.position_y,
  c.game_time_minutes,
  c.world_date_day,
  ts.miles_traveled, ts.miles_total,
  ts.status
FROM characters c
LEFT JOIN travel_sessions ts ON c.id = ts.character_id
WHERE ts.status = 'active'
ORDER BY c.created_at DESC;
```

---

## Troubleshooting

### Issue: "Relation already exists"
**Cause:** Migration already applied
**Solution:** Check that the migration wasn't already applied by querying `information_schema`

### Issue: "Foreign key violation"
**Cause:** travel_sessions references characters that don't exist
**Solution:** This is normal - only matters when creating actual sessions

### Issue: "Permission denied for schema public"
**Cause:** User doesn't have proper permissions
**Solution:** Use the service role credentials or admin account

### Issue: RLS policies not created
**Cause:** auth.uid() context might not be available
**Solution:** Policies are created conditionally - check pg_policies table

---

## Next Steps

1. **Deploy migrations** using one of the methods above
2. **Verify** using the verification checklist
3. **Test** by having a character travel
4. **Monitor** backend logs for TravelWorker processing
5. **Report** any issues encountered

---

**Status:** ✅ MIGRATIONS READY
**Next Action:** Deploy to Supabase Cloud
**Expected Result:** Travel system fully operational with background progression

