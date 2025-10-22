---
name: supabase-sql
description: Execute SQL queries and manage Supabase database using npx supabase CLI with credentials from .env
---

# Supabase SQL Management Skill

This skill enables direct SQL query execution against the Nuaibria Supabase Cloud database using the Supabase CLI (`npx supabase`) with automatic credential loading from `.env`.

## Prerequisites

- Node.js and npm installed
- Supabase CLI available via `npx supabase`
- Project credentials in `/srv/project-chimera/.env`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_KEY`
  - `SUPABASE_ACCESS_TOKEN`
  - `DATABASE_URL` (optional, for direct psql access)

## Connection Details

Your Supabase Cloud project:
- **Project ID**: muhlitkerrjparpcuwmc
- **Region**: (from SUPABASE_URL)
- **Database URL**: postgresql://postgres.muhlitkerrjparpcuwmc:...@db.muhlitkerrjparpcuwmc.supabase.co:5432/postgres

## Quick Start

### 1. View Database Status

```bash
cd /srv/project-chimera
npx supabase projects list
```

### 2. Execute a Simple Query

```bash
cd /srv/project-chimera

# Query using SQL
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

### 3. Execute Query from File

```bash
cd /srv/project-chimera

# Create query file
cat > /tmp/query.sql << 'EOF'
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
EOF

# Execute it
psql $DATABASE_URL -f /tmp/query.sql
```

## Query Templates

### 1. List All Tables and Schemas

```sql
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;
```

### 2. View Table Structure

```sql
-- Show all columns for a table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'characters'
ORDER BY ordinal_position;
```

### 3. View Row-Level Security (RLS) Policies

```sql
SELECT
  policyname,
  tablename,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4. View Indexes

```sql
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 5. View Functions and Triggers

```sql
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### 6. Count Rows in Each Table

```sql
SELECT
  tablename,
  to_char(pg_total_relation_size(schemaname||'.'||tablename), '999999999') as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 7. View Constraints

```sql
SELECT
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;
```

### 8. Check Database Size

```sql
SELECT
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
WHERE datname = 'postgres';
```

### 9. View Recent Migrations Applied

```sql
-- Query the migrations table if it exists
SELECT * FROM storage.migrations ORDER BY name DESC LIMIT 10;
```

### 10. Check Active Connections

```sql
SELECT
  usename,
  application_name,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE datname = 'postgres'
ORDER BY query_start DESC;
```

## Data Queries

### 11. Count Characters

```sql
SELECT COUNT(*) as total_characters FROM public.characters;
```

### 12. List All Characters with Details

```sql
SELECT
  id,
  name,
  user_id,
  race,
  class,
  level,
  experience,
  created_at
FROM public.characters
ORDER BY created_at DESC;
```

### 13. Get Character with Full Stats

```sql
SELECT
  id,
  name,
  race,
  class,
  level,
  experience,
  hp,
  max_hp,
  armor_class,
  stats,
  known_spells,
  known_abilities,
  inventory,
  skills,
  proficiencies
FROM public.characters
WHERE id = '<character-uuid>'
LIMIT 1;
```

### 14. Find Quests for a Character

```sql
SELECT
  q.id,
  q.title,
  q.description,
  q.status,
  q.created_at,
  q.updated_at
FROM public.quests q
WHERE q.assigned_to_id = '<character-uuid>'
ORDER BY q.created_at DESC;
```

### 15. Check Journal Entries

```sql
SELECT
  id,
  character_id,
  content,
  created_at,
  is_significant
FROM public.journal_entries
WHERE character_id = '<character-uuid>'
ORDER BY created_at DESC
LIMIT 20;
```

## Mutation Examples (Use with Caution)

### 16. Update Character Level

```sql
-- CAUTION: Always backup before modifying data
UPDATE public.characters
SET level = 2,
    experience = 1000
WHERE id = '<character-uuid>';
```

### 17. Delete a Character

```sql
-- CAUTION: This will cascade delete related records
DELETE FROM public.characters
WHERE id = '<character-uuid>';
```

### 18. Reset Character Stats

```sql
UPDATE public.characters
SET hp = max_hp,
    inventory = '[]'::jsonb
WHERE id = '<character-uuid>';
```

## Workflow: Setting Up and Running Queries

### Step 1: Load Environment Variables

```bash
cd /srv/project-chimera
source .env

# Verify credentials are loaded
echo "Database: $DATABASE_URL"
echo "Supabase URL: $SUPABASE_URL"
```

### Step 2: Test Connection

```bash
# Test psql connection
psql $DATABASE_URL -c "SELECT version();"
```

### Step 3: Execute a Query

**Option A: Direct query via psql**

```bash
psql $DATABASE_URL << 'EOF'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
EOF
```

**Option B: Query from file**

```bash
# Create your query
cat > /tmp/my_query.sql << 'EOF'
SELECT name, level, experience
FROM public.characters
ORDER BY level DESC;
EOF

# Execute it
psql $DATABASE_URL -f /tmp/my_query.sql
```

**Option C: Using Supabase CLI**

```bash
# List projects
npx supabase projects list

# Get project details
npx supabase projects describe muhlitkerrjparpcuwmc

# View migrations applied
npx supabase migrations list --project-ref muhlitkerrjparpcuwmc
```

### Step 4: Export Results

```bash
# To CSV
psql $DATABASE_URL -c "COPY (
  SELECT name, level, experience FROM public.characters
) TO STDOUT CSV HEADER;" > characters.csv

# To JSON
psql $DATABASE_URL -c "SELECT json_agg(row_to_json(t)) FROM (
  SELECT name, level, experience FROM public.characters
) t;" > characters.json
```

### Step 5: Verify Changes

```bash
# Check row count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM public.characters;"

# Check specific record
psql $DATABASE_URL -c "SELECT * FROM public.characters WHERE name = 'Aragorn' LIMIT 1;"
```

## Important Security Notes

⚠️ **SECURITY WARNINGS:**

1. **Never commit credentials** - `.env` is in `.gitignore` for a reason
2. **SERVICE_KEY only for backend** - Use this for admin operations only
3. **ANON_KEY for frontend** - Limited permissions, safer to expose
4. **DATABASE_URL is sensitive** - Contains password, keep it secret
5. **No DDL in production** - Only use SELECT for reads, migrations for schema changes
6. **Backup before mutations** - Always snapshot data before DELETE/UPDATE
7. **RLS policies** - Verify they're enabled before releasing to production

## Troubleshooting

### Error: "FATAL: invalid frontend message type"

**Cause**: Wrong authentication method or missing credentials

**Solution**:
```bash
# Verify credentials
source .env
echo "DATABASE_URL is set: $([[ -n $DATABASE_URL ]] && echo 'YES' || echo 'NO')"

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Error: "permission denied for schema public"

**Cause**: Using wrong role or insufficient privileges

**Solution**:
- Use SERVICE_KEY for admin operations
- Check RLS policies if using ANON_KEY
- Verify user role: `psql $DATABASE_URL -c "SELECT current_user;"`

### Error: "table does not exist"

**Cause**: Table name is case-sensitive in PostgreSQL

**Solution**:
```bash
# List all tables
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Use exact table name (usually lowercase with underscores)
psql $DATABASE_URL -c "SELECT * FROM public.\"ExactTableName\";"
```

### Connection Timeout

**Solution**:
```bash
# Test network connectivity
telnet db.muhlitkerrjparpcuwmc.supabase.co 5432

# Check if firewall allows PostgreSQL
# Supabase Cloud should allow external connections by default
```

## Advanced: Direct Shell Access

If psql is not available, use direct Supabase API:

```bash
# Query using REST API
curl -X POST "https://muhlitkerrjparpcuwmc.supabase.co/rest/v1/characters" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"select": "*"}'

# Or use Node.js
node << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('characters')
    .select('*');

  if (error) console.error(error);
  else console.log(data);
})();
EOF
```

## Common Task Templates

### Task: Get Database Schema Snapshot

```bash
cd /srv/project-chimera
source .env

psql $DATABASE_URL > /tmp/schema_snapshot.sql << 'EOF'
-- Schema snapshot
\dt public.*
\di public.*
\dp public.*
EOF

echo "Snapshot saved to /tmp/schema_snapshot.sql"
```

### Task: Find Unused Columns

```sql
-- Find columns that might be unused (no index and large NULL percentage)
SELECT
  t.tablename,
  c.attname as column_name,
  pg_size_pretty(pg_column_size(c.*)) as size
FROM pg_class t
JOIN pg_attribute c ON t.oid = c.attrelid
WHERE t.relname NOT LIKE 'pg_%'
ORDER BY pg_column_size(c.*) DESC;
```

### Task: Monitor Query Performance

```sql
-- Show slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;
```

## Quick Reference

| Task | Command |
|------|---------|
| **Connect** | `psql $DATABASE_URL` |
| **List tables** | `\dt` (in psql) |
| **List columns** | `\d table_name` (in psql) |
| **Show schema** | `\s` (in psql) |
| **Exit** | `\q` (in psql) |
| **Execute file** | `psql $DATABASE_URL -f file.sql` |
| **Execute inline** | `psql $DATABASE_URL -c "SELECT 1;"` |
| **Backup database** | `pg_dump $DATABASE_URL > backup.sql` |
| **Restore database** | `psql $DATABASE_URL < backup.sql` |

## File Structure

```
/srv/project-chimera/
├── .env                           # Database credentials (SECRET!)
├── supabase/
│   ├── config.toml               # Supabase CLI config
│   ├── migrations/               # SQL migrations
│   └── seed.sql                  # Seed data (optional)
└── queries/                      # Optional: custom SQL queries
    ├── schema.sql
    ├── seed.sql
    └── reports.sql
```

## Integration with Other Skills

- **supabase-migration**: Use this skill for schema changes before querying
- **restart-containers**: Restart containers after applying migrations
- This skill: Run queries to verify changes

## Next Steps

1. Use this skill to explore your current schema
2. Run diagnostic queries to understand your data
3. Plan migrations using supabase-migration skill
4. Apply migrations and verify with this skill
5. Monitor performance over time

