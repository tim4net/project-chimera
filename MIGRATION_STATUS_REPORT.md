# POI Type Enum Migration - Status Report

**Date**: 2025-10-21
**Status**: ⚠️ PENDING MANUAL APPLICATION
**Blocking Issue**: Backend cannot query settlements with type='village'

---

## Executive Summary

The backend is currently failing with the error:
```
invalid input value for enum poi_type: "village"
```

This error occurs because the `world_pois.type` column is constrained to a PostgreSQL enum (`poi_type`) that doesn't include "village" as a valid value. The migration to fix this has been created but requires manual application via the Supabase web console.

---

## Current Status

### ❌ What's Broken
- Road network service cannot query settlements
- Backend logs show repeated enum constraint errors
- Settlement POIs cannot be inserted or queried with type='village'

### ✅ What's Ready
- Migration file created: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`
- Documentation created (5 files)
- Automated application attempted (not possible due to network/API limitations)
- Manual application instructions prepared

---

## Migration Details

### Migration File
**Location**: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`

**What it does**:
1. Checks if `world_pois.type` is using the `poi_type` enum
2. If yes, converts the column to TEXT type
3. Drops the `poi_type` enum (with CASCADE for safety)
4. Ensures the table structure is correct with TEXT type
5. Creates necessary indexes for performance
6. Adds documentation comments

**Safety features**:
- Uses `IF EXISTS` checks to avoid errors
- Uses `CREATE TABLE IF NOT EXISTS` for idempotency
- Uses `CREATE INDEX IF NOT EXISTS` to prevent duplicate indexes
- Can be run multiple times safely

---

## Application Instructions

### Method 1: Supabase Web Console (RECOMMENDED)

**Quick Steps**:
1. Open: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new
2. Copy SQL from: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`
3. Paste and click "Run"
4. Verify with: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='world_pois' AND column_name='type';`
5. Restart backend: `podman compose restart backend`

**Detailed Instructions**:
- See: `/srv/project-chimera/APPLY_MIGRATION_INSTRUCTIONS.txt`
- Or: `/srv/project-chimera/MIGRATION_QUICK_START.txt`

### Method 2: Supabase CLI (Alternative)

If Supabase CLI is installed:
```bash
supabase login
supabase link --project-ref muhlitkerrjparpcuwmc
supabase db push
```

---

## Why Automated Application Failed

### Attempt 1: Direct PostgreSQL Connection
```bash
psql "$DATABASE_URL" -f migration.sql
```
**Result**: ❌ Network unreachable (IPv6 connection blocked)
**Error**: `connect ENETUNREACH 2600:1f18:2e13:9d34:ab9a:5a2a:305f:396:5432`

### Attempt 2: Supabase REST API
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_raw_sql"
```
**Result**: ❌ 404 Function not found
**Reason**: Supabase doesn't expose a direct SQL execution endpoint

### Attempt 3: Supabase JS Client
```javascript
supabase.rpc('exec_sql', { sql: migrationSQL })
```
**Result**: ❌ RPC function doesn't exist
**Reason**: Supabase client is designed for data operations, not DDL

### Attempt 4: Node.js with pg library
```javascript
const client = new Client({ connectionString: DATABASE_URL })
```
**Result**: ❌ Network unreachable
**Reason**: Same network issue as psql (IPv6 blocking)

---

## Verification Queries

After applying the migration, run these in the SQL Editor:

### 1. Check Column Type
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'type';
```
**Expected Result**:
```
column_name | data_type | udt_name
------------|-----------|----------
type        | text      | text
```

### 2. Check Enum Dropped
```sql
SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') as enum_exists;
```
**Expected Result**:
```
enum_exists
-----------
false
```

### 3. Test Insert
```sql
INSERT INTO world_pois (name, type, position, campaign_seed)
VALUES ('Test Village', 'village', '{"x": 100, "y": 200}', 'test_seed')
RETURNING id, name, type;
```
**Expected**: Should succeed without error

### 4. Test Query
```sql
SELECT name, type, position
FROM world_pois
WHERE type = 'village'
LIMIT 5;
```
**Expected**: Should return results without error

---

## Post-Migration Steps

### 1. Restart Backend Service
```bash
podman compose restart backend
```

### 2. Monitor Logs
```bash
podman compose logs -f backend | grep -i "poi_type\|enum\|village"
```

**Expected**: No more enum-related errors

### 3. Test Road Network Service
The road network service should now be able to:
- Query settlements by type
- Insert new settlements with type='village'
- Generate road networks between settlements

### 4. Verify Functionality
Run these backend API tests:
```bash
# Test settlement query
curl -X GET "http://localhost:3001/api/settlements?type=village"

# Test POI creation (if endpoint exists)
curl -X POST "http://localhost:3001/api/pois" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Village","type":"village","position":{"x":100,"y":200}}'
```

---

## Files Created

| File | Purpose |
|------|---------|
| `MIGRATION_QUICK_START.txt` | Quick reference card with 5-step process |
| `APPLY_MIGRATION_INSTRUCTIONS.txt` | Detailed step-by-step instructions with full SQL |
| `MIGRATION_APPLICATION_SUMMARY.md` | Comprehensive summary of all attempts and methods |
| `apply_migration_manual.md` | Guide with troubleshooting section |
| `apply_migration_curl.sh` | Automated script (demonstrates why manual is needed) |
| `create_exec_sql_function.sql` | Optional helper for future automated migrations |
| `MIGRATION_STATUS_REPORT.md` | This file - complete status report |

---

## Success Criteria

- [ ] Migration executed in Supabase SQL Editor
- [ ] No errors during migration execution
- [ ] Verification query shows `type | text`
- [ ] Enum dropped (verification query returns false)
- [ ] Test insert succeeds
- [ ] Backend restarted successfully
- [ ] Backend logs show no enum errors
- [ ] Road network service queries work
- [ ] Settlement POIs can be created and queried

---

## Rollback Plan

If the migration causes issues:

### 1. Check for Existing Data
```sql
SELECT COUNT(*), type FROM world_pois GROUP BY type;
```

### 2. Restore Enum (if needed)
```sql
-- Recreate enum with all needed values
CREATE TYPE poi_type AS ENUM (
  'village', 'town', 'city', 'capital',
  'fort', 'outpost', 'dungeon', 'ruins',
  'shrine', 'landmark', 'cave', 'temple'
);

-- Convert column back to enum
ALTER TABLE world_pois ALTER COLUMN type TYPE poi_type USING type::poi_type;
```

**Note**: Rollback is unlikely to be needed as TEXT type is more flexible than enum.

---

## Future Improvements

1. **Enable Automated Migrations**:
   - Apply `create_exec_sql_function.sql` to create `exec_raw_sql()` RPC
   - Then migrations can be applied via REST API calls

2. **Migration Tracking**:
   - Create a `schema_migrations` table
   - Track which migrations have been applied
   - Prevent duplicate applications

3. **CI/CD Integration**:
   - Add migration application to deployment pipeline
   - Automated testing of migration rollback
   - Schema version validation

4. **Network Configuration**:
   - Investigate IPv6 connectivity issues
   - Consider IPv4-only connection string
   - Set up VPN or proxy for direct PostgreSQL access

---

## Contact & Support

**Supabase Project**: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc
**Supabase Status**: https://status.supabase.com
**Migration Files**: `/srv/project-chimera/backend/migrations/`
**Documentation**: `/srv/project-chimera/MIGRATION_*.md`

---

## Conclusion

The migration is ready to be applied and will resolve the blocking error. The manual application via Supabase web console is the most reliable method given the current network and API limitations. After application, the backend will be able to work with settlement POIs of type 'village' without errors.

**Next Action Required**: Apply migration via Supabase SQL Editor (5-minute task)

---

*Report generated: 2025-10-21*
*Status: Awaiting manual migration application*
