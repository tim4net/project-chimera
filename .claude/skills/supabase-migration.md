---
name: supabase-migration
description: Create, apply, and manage Supabase database migrations following best practices
---

# Supabase Database Migration Skill

This skill helps create and manage database schema migrations for the Nuaibria project using Supabase Cloud.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase` or check installation)
- Project linked to Supabase Cloud (`supabase link`)
- Access to project's `.env` file with Supabase credentials

## Migration Workflow

### 1. Understanding the Current State

Before creating a migration, understand the existing schema:

```bash
# Check existing migrations
ls -lh /srv/project-chimera/supabase/migrations/

# View the most recent migration
cat /srv/project-chimera/supabase/migrations/$(ls -t /srv/project-chimera/supabase/migrations/ | head -1)
```

### 2. Creating a New Migration

#### Option A: Manual Migration (Preferred for Nuaibria)

Create a migration file manually with a descriptive name:

```bash
# Generate timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Create migration file
touch /srv/project-chimera/supabase/migrations/${TIMESTAMP}_<descriptive_name>.sql

# Example: adding a column
touch /srv/project-chimera/supabase/migrations/${TIMESTAMP}_add_known_spells_to_characters.sql
```

#### Option B: Using Supabase CLI (if installed)

```bash
cd /srv/project-chimera
supabase migration new <descriptive_name>
```

### 3. Writing the Migration SQL

Open the newly created migration file and write SQL following these patterns:

#### Pattern 1: Adding a Column

```sql
-- Add column with default value
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS known_spells jsonb DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.characters.known_spells IS 'Array of spell names the character knows';
```

#### Pattern 2: Creating a New Table

```sql
-- Create table with all constraints
CREATE TABLE IF NOT EXISTS public.game_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  properties jsonb DEFAULT '{}'::jsonb,
  quantity int NOT NULL DEFAULT 1,
  equipped boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS game_items_character_id_idx ON public.game_items(character_id);
CREATE INDEX IF NOT EXISTS game_items_equipped_idx ON public.game_items(equipped) WHERE equipped = true;

-- Enable RLS
ALTER TABLE public.game_items ENABLE ROW LEVEL SECURITY;

-- Create policies (using DO block to avoid duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items' AND policyname = 'Users can view own items'
  ) THEN
    CREATE POLICY "Users can view own items"
      ON public.game_items
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items' AND policyname = 'Users can manage own items'
  ) THEN
    CREATE POLICY "Users can manage own items"
      ON public.game_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_items TO authenticated;
```

#### Pattern 3: Modifying an Existing Column

```sql
-- Change column type (safe)
ALTER TABLE public.characters
ALTER COLUMN position_x TYPE bigint;

-- Add constraint
ALTER TABLE public.characters
ADD CONSTRAINT characters_level_positive CHECK (level > 0);

-- Make column NOT NULL (only if data exists and is valid)
UPDATE public.characters SET backstory = '' WHERE backstory IS NULL;
ALTER TABLE public.characters
ALTER COLUMN backstory SET NOT NULL;
```

#### Pattern 4: Creating an Index

```sql
-- Create index
CREATE INDEX IF NOT EXISTS characters_name_idx ON public.characters(name);

-- Create partial index (for better performance)
CREATE INDEX IF NOT EXISTS characters_active_idx
  ON public.characters(user_id, level)
  WHERE level > 1;
```

### 4. Migration Safety Checklist

Before applying, ensure your migration:

- [ ] Uses `IF NOT EXISTS` for CREATE statements
- [ ] Uses `IF EXISTS` for DROP statements
- [ ] Uses `DO $$` blocks for policies to avoid duplicates
- [ ] Includes appropriate indexes
- [ ] Enables RLS for sensitive tables
- [ ] Creates appropriate policies for user access
- [ ] Grants permissions to `authenticated` role
- [ ] Has comments explaining complex logic
- [ ] Handles existing data gracefully (no data loss)
- [ ] Is idempotent (can be run multiple times safely)

### 5. Testing the Migration Locally (if Supabase CLI available)

```bash
# Start local Supabase (if not running)
cd /srv/project-chimera
supabase start

# Apply migrations locally
supabase db reset

# Test the migration works
# Run your application and test the new schema
```

### 6. Applying Migration to Cloud Production

#### Method A: Using Supabase CLI (Preferred)

```bash
cd /srv/project-chimera

# Ensure you're logged in
supabase login

# Link to your cloud project (if not already linked)
supabase link --project-ref muhlitkerrjparpcuwmc

# Push migrations to production
supabase db push

# Verify the migration was applied
supabase db diff
```

#### Method B: Using Supabase Dashboard (Manual)

1. Go to https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc
2. Navigate to SQL Editor
3. Copy the migration SQL from your file
4. Paste and execute the SQL
5. Verify the changes in the Table Editor

#### Method C: Using Backend MCP Tool (If Available)

```typescript
// Use the mcp__supabase__apply_migration tool
await applyMigration({
  name: 'add_known_spells_to_characters',
  query: `
    ALTER TABLE public.characters
    ADD COLUMN IF NOT EXISTS known_spells jsonb DEFAULT '[]'::jsonb;
  `
});
```

### 7. Verification After Migration

```bash
# Check table structure
# Using psql or Supabase dashboard

# Check columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'characters';

# Check policies exist
SELECT policyname, tablename
FROM pg_policies
WHERE schemaname = 'public';

# Check indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 8. Rollback Strategy

If a migration causes issues:

#### Option A: Create a Rollback Migration

```bash
# Create new migration to undo changes
TIMESTAMP=$(date +%Y%m%d%H%M%S)
touch /srv/project-chimera/supabase/migrations/${TIMESTAMP}_rollback_<original_name>.sql
```

Write rollback SQL:
```sql
-- Rollback: Remove column
ALTER TABLE public.characters
DROP COLUMN IF EXISTS known_spells;
```

#### Option B: Restore from Backup

1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Select a backup from before the migration
4. Restore the backup

### 9. Common Migration Patterns

#### Adding a JSONB Column for Flexible Data

```sql
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS characters_metadata_gin_idx
  ON public.characters USING gin(metadata);
```

#### Adding a Timestamp Column

```sql
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS last_played_at timestamptz DEFAULT now();

-- Create index for sorting
CREATE INDEX IF NOT EXISTS characters_last_played_idx
  ON public.characters(last_played_at DESC);
```

#### Adding an Enum-like Column

```sql
-- Add column with check constraint
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS character_status text DEFAULT 'active';

ALTER TABLE public.characters
ADD CONSTRAINT characters_status_check
  CHECK (character_status IN ('active', 'inactive', 'deleted'));

-- Create index
CREATE INDEX IF NOT EXISTS characters_status_idx
  ON public.characters(character_status);
```

#### Creating a Many-to-Many Relationship

```sql
-- Create junction table
CREATE TABLE IF NOT EXISTS public.character_quests (
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  accepted_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (character_id, quest_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS character_quests_character_idx ON public.character_quests(character_id);
CREATE INDEX IF NOT EXISTS character_quests_quest_idx ON public.character_quests(quest_id);
CREATE INDEX IF NOT EXISTS character_quests_status_idx ON public.character_quests(status);

-- Enable RLS and create policies...
```

## Best Practices Summary

1. **Always use idempotent SQL** (`IF NOT EXISTS`, `IF EXISTS`)
2. **Test locally first** (if possible)
3. **Create migrations incrementally** (small, focused changes)
4. **Use meaningful names** for migrations (describe what they do)
5. **Include rollback strategy** (document how to undo)
6. **Never edit existing migrations** (create new ones instead)
7. **Always enable RLS** for user data tables
8. **Create appropriate indexes** for performance
9. **Use DO blocks** for policy creation to avoid duplicates
10. **Add comments** for complex logic or business rules

## Troubleshooting

### Error: "relation already exists"

**Cause:** Migration was partially applied or run multiple times

**Solution:** Use `IF NOT EXISTS` in CREATE statements

### Error: "policy already exists"

**Cause:** Policy creation was run multiple times

**Solution:** Wrap policy creation in DO block with existence check

### Error: "column does not exist"

**Cause:** Migration order is wrong or previous migration wasn't applied

**Solution:** Check migration timestamps and ensure they run in order

### Error: "permission denied"

**Cause:** Missing GRANT statements

**Solution:** Add `GRANT` statements for the `authenticated` role

## File Structure Reference

```
/srv/project-chimera/
├── supabase/
│   ├── config.toml                    # Supabase configuration
│   ├── migrations/                    # Migration files directory
│   │   ├── 00000000000000_initial_schema.sql
│   │   ├── 20251019095500_add_gold_to_characters.sql
│   │   └── <timestamp>_<description>.sql
│   └── seed.sql                       # Seed data (optional)
├── .env                               # Environment variables
└── SUPABASE_CLOUD_CREDENTIALS.md     # Connection details
```

## Quick Reference Commands

```bash
# Create migration file
TIMESTAMP=$(date +%Y%m%d%H%M%S) && touch supabase/migrations/${TIMESTAMP}_description.sql

# Apply to production (CLI)
cd /srv/project-chimera && supabase db push

# View migration history
ls -lth supabase/migrations/

# Check Supabase status
supabase status

# View logs
supabase logs db
```
