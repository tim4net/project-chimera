# POI Type Enum Migration - Application Summary

## Problem Statement
The backend is encountering a blocking error:
```
invalid input value for enum poi_type: "village"
```

This prevents the road network service from querying settlements with `type='village'`.

## Root Cause
The `world_pois` table has a `type` column constrained to a `poi_type` enum that doesn't include "village" as a valid value.

## Solution
Apply the migration file at:
```
/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql
```

This migration:
1. Converts `world_pois.type` from enum to TEXT type
2. Drops the restrictive `poi_type` enum
3. Creates necessary indexes for performance
4. Adds documentation comments

## Application Methods Attempted

### ❌ Method 1: Direct PostgreSQL Connection
**Status**: Failed - Network unreachable (IPv6 connection blocked)

**Command**:
```bash
psql "$DATABASE_URL" -f backend/migrations/20251021_ensure_world_pois_text_type.sql
```

**Error**: Connection to db.muhlitkerrjparpcuwmc.supabase.co failed

### ❌ Method 2: Supabase REST API
**Status**: Failed - No direct SQL execution endpoint available

**Attempted**: `POST /rest/v1/rpc/exec_raw_sql`

**Result**: 404 - Function not found (expected)

### ❌ Method 3: Node.js with @supabase/supabase-js
**Status**: Failed - Supabase JS client doesn't support DDL operations

**Issue**: The client library is designed for data operations, not schema migrations

### ✅ Method 4: Supabase Web Console (RECOMMENDED)
**Status**: Available - Requires manual execution

**URL**: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new

## Recommended Action Plan

### Step 1: Apply Migration via Web Console

1. Open the Supabase SQL Editor:
   - URL: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new

2. Copy the migration SQL:
   ```bash
   cat /srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql
   ```
   Or view the formatted version:
   ```bash
   cat /srv/project-chimera/APPLY_MIGRATION_INSTRUCTIONS.txt
   ```

3. Paste the SQL into the editor and click "Run"

4. Wait for success message (should see notices about enum conversion)

### Step 2: Verify Migration Success

Run these verification queries in the SQL Editor:

**Query 1: Check column type**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'type';
```
Expected result: `type | text`

**Query 2: Check enum was dropped**
```sql
SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') as enum_exists;
```
Expected result: `false`

**Query 3: Test insert (optional)**
```sql
INSERT INTO world_pois (name, type, position, campaign_seed)
VALUES ('Test Village', 'village', '{"x": 100, "y": 200}', 'test_seed')
RETURNING id, name, type;
```
Should succeed without error.

### Step 3: Restart Backend Service

```bash
podman compose restart backend
```

### Step 4: Monitor Backend Logs

```bash
podman compose logs -f backend
```

Look for:
- ✅ No more "invalid input value for enum poi_type" errors
- ✅ Successful settlement queries
- ✅ Road network service functioning correctly

## Files Created

1. **APPLY_MIGRATION_INSTRUCTIONS.txt** - Detailed step-by-step instructions with SQL
2. **apply_migration_manual.md** - Comprehensive migration guide
3. **apply_migration_curl.sh** - Automated attempt script (shows why manual is needed)
4. **create_exec_sql_function.sql** - Optional SQL function for future automated migrations
5. **MIGRATION_APPLICATION_SUMMARY.md** - This file

## Success Criteria

- [ ] Migration applied without errors
- [ ] `world_pois.type` column is TEXT type (verified via query)
- [ ] `poi_type` enum has been dropped
- [ ] Backend restarts successfully
- [ ] Backend logs show no enum-related errors
- [ ] Road network service can query settlements with type='village'

## Alternative: Enable Automated Migrations (Future)

To enable programmatic migration application in the future:

1. Apply `create_exec_sql_function.sql` in Supabase SQL Editor
2. This creates an `exec_raw_sql()` function accessible via REST API
3. Then migrations can be applied via curl/Node.js scripts

**Security Note**: The `exec_raw_sql()` function should be dropped after use or restricted to service role only.

## Troubleshooting

### Issue: "type poi_type does not exist"
- **Solution**: This is fine, it means the enum was already dropped. Continue with the rest of the migration.

### Issue: "cannot drop type poi_type because other objects depend on it"
- **Solution**: Check what's using it:
  ```sql
  SELECT * FROM pg_depend
  WHERE refobjid = (SELECT oid FROM pg_type WHERE typname = 'poi_type');
  ```

### Issue: Migration succeeds but backend still shows errors
- **Solution**: Restart the backend container: `podman compose restart backend`
- **Reason**: Cached schema information in the backend process

## Next Steps After Migration

1. Test the road network service thoroughly
2. Verify all settlement types can be inserted (village, town, city, etc.)
3. Monitor backend logs for any new errors
4. Consider adding integration tests for POI insertion
5. Document the TEXT-based type system in project.md

## Contact

If you encounter issues applying this migration:
- Check Supabase project status: https://status.supabase.com
- Review Supabase logs in the dashboard
- Verify service role key has correct permissions
- Check network connectivity to Supabase Cloud
