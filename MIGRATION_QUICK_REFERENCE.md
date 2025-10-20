# Supabase Migration Quick Reference

## Create Migration

```bash
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch supabase/migrations/${TIMESTAMP}_description.sql
```

## Essential SQL Patterns

### Add Column
```sql
ALTER TABLE public.table_name
ADD COLUMN IF NOT EXISTS column_name type DEFAULT value;
```

### Create Table with RLS
```sql
CREATE TABLE IF NOT EXISTS public.table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'table_name' AND policyname = 'Policy name'
  ) THEN
    CREATE POLICY "Policy name"
      ON public.table_name
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END$$;

GRANT ALL ON public.table_name TO authenticated;
```

### Create Index
```sql
CREATE INDEX IF NOT EXISTS idx_name
  ON public.table_name(column_name);
```

### Add Constraint
```sql
ALTER TABLE public.table_name
ADD CONSTRAINT constraint_name
  CHECK (condition);
```

## Apply Migration

```bash
# Using CLI
cd /srv/project-chimera && supabase db push

# Using Dashboard
# Copy SQL → Paste in SQL Editor → Run
```

## Verify Migration

```sql
-- Check column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'your_table';

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'your_table';
```

## Rollback

```bash
# Create new migration to undo
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch supabase/migrations/${TIMESTAMP}_rollback_feature.sql

# Write inverse SQL
ALTER TABLE public.table_name DROP COLUMN IF EXISTS column_name;
```

## Safety Checklist

- [ ] IF NOT EXISTS / IF EXISTS
- [ ] DO blocks for policies
- [ ] RLS enabled
- [ ] Indexes created
- [ ] Permissions granted
- [ ] Comments added
- [ ] Idempotent SQL
- [ ] Rollback documented

## Common Mistakes

❌ `CREATE TABLE table_name` → ✅ `CREATE TABLE IF NOT EXISTS public.table_name`
❌ `CREATE POLICY` → ✅ `DO $$ ... IF NOT EXISTS ... CREATE POLICY`
❌ `ALTER COLUMN DROP` → ✅ Document data migration first
❌ No indexes → ✅ `CREATE INDEX IF NOT EXISTS`
❌ No RLS → ✅ `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
