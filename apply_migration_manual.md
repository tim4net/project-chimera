# Manual Migration Application Guide

## Problem
The backend is encountering this error:
```
invalid input value for enum poi_type: "village"
```

This is because the `world_pois` table has a `type` column constrained to a `poi_type` enum that doesn't include "village".

## Solution
Apply the migration file that converts the `type` column from enum to TEXT type.

## Migration File
**Location**: `/srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql`

**What it does**:
1. Converts `world_pois.type` from enum to TEXT type
2. Drops the restrictive `poi_type` enum
3. Creates necessary indexes
4. Adds column comments for documentation

## Application Methods

### Method 1: Supabase Web Console (RECOMMENDED)

1. **Open SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new

2. **Copy Migration SQL**:
   ```bash
   cat /srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql
   ```

3. **Paste and Run**:
   - Paste the entire SQL content into the SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Verify**:
   - Run this query in a new SQL Editor tab:
   ```sql
   SELECT column_name, data_type, udt_name
   FROM information_schema.columns
   WHERE table_name = 'world_pois'
   AND column_name = 'type';
   ```
   - Expected result: `type | text | text`

### Method 2: Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref muhlitkerrjparpcuwmc

# Run migration
supabase db push
```

### Method 3: Using curl with Supabase Management API

This method uses the Supabase Management API to execute SQL remotely.

**Note**: This requires a Supabase Management API token (different from the service role key).

1. Get Management API token from: https://app.supabase.com/account/tokens
2. Run the curl script (see apply_migration_curl.sh)

## Verification Steps

After applying the migration, verify:

1. **Schema Check**:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'world_pois' AND column_name = 'type';
   ```
   Should return: `type | text`

2. **Enum Check**:
   ```sql
   SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') as enum_exists;
   ```
   Should return: `false`

3. **Insert Test**:
   ```sql
   INSERT INTO world_pois (name, type, position, campaign_seed)
   VALUES ('Test Village', 'village', '{"x": 100, "y": 200}', 'test_seed')
   RETURNING id, name, type;
   ```
   Should succeed without error.

4. **Backend Test**:
   - Restart the backend container
   - Check logs for any poi_type enum errors
   - The road network service should now work correctly

## Troubleshooting

### Error: "type poi_type does not exist"
- The enum was already dropped, this is fine
- Continue with the rest of the migration

### Error: "column type already exists"
- The table structure already exists
- The migration uses `IF NOT EXISTS` so this should not happen

### Error: "cannot drop type poi_type because other objects depend on it"
- Other tables may be using the enum
- Check dependencies:
  ```sql
  SELECT * FROM pg_depend WHERE refobjid = (SELECT oid FROM pg_type WHERE typname = 'poi_type');
  ```

## Next Steps

After successful migration:
1. ✅ Restart backend container: `podman compose restart backend`
2. ✅ Test road network service functionality
3. ✅ Monitor backend logs for any remaining errors
4. ✅ Test village/settlement queries
