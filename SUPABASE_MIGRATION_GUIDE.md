# Supabase Migration Guide for Nuaibria

## Overview

This guide provides practical examples and workflows for managing database schema changes in the Nuaibria project using Supabase Cloud.

## Quick Start

### Creating Your First Migration

```bash
# 1. Generate timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# 2. Create migration file
touch /srv/project-chimera/supabase/migrations/${TIMESTAMP}_add_feature_name.sql

# 3. Edit the file with your SQL
# 4. Apply to production (see "Applying Migrations" section)
```

## Real-World Migration Examples

### Example 1: Adding the `known_spells` Column

**Problem:** Characters need to track which spells they know

**Migration:** `20251020140000_add_known_spells_to_characters.sql`

```sql
-- Add known_spells column to characters table
-- This stores an array of spell names the character has learned

ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS known_spells jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.characters.known_spells IS 'Array of spell names the character knows (e.g., ["Fireball", "Magic Missile"])';

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS characters_known_spells_gin_idx
  ON public.characters USING gin(known_spells);

-- Example query to use after migration:
-- SELECT name, known_spells FROM characters WHERE known_spells ? 'Fireball';
```

**Rollback:**

```sql
-- Rollback: 20251020140001_rollback_known_spells.sql
ALTER TABLE public.characters
DROP COLUMN IF EXISTS known_spells;

DROP INDEX IF EXISTS characters_known_spells_gin_idx;
```

### Example 2: Creating the `game_items` Table

**Problem:** Need to track character equipment and inventory

**Migration:** `20251020141000_create_game_items_table.sql`

```sql
-- Create game_items table for character inventory management
CREATE TABLE IF NOT EXISTS public.game_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,  -- 'weapon', 'armor', 'consumable', 'misc', etc.
  description text,
  properties jsonb DEFAULT '{}'::jsonb,  -- Stats, effects, special properties
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  equipped boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS game_items_character_id_idx
  ON public.game_items(character_id);

CREATE INDEX IF NOT EXISTS game_items_type_idx
  ON public.game_items(type);

CREATE INDEX IF NOT EXISTS game_items_equipped_idx
  ON public.game_items(character_id, equipped)
  WHERE equipped = true;

-- Enable Row Level Security
ALTER TABLE public.game_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items'
    AND policyname = 'Users can view own character items'
  ) THEN
    CREATE POLICY "Users can view own character items"
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

  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items'
    AND policyname = 'Users can add items to own characters'
  ) THEN
    CREATE POLICY "Users can add items to own characters"
      ON public.game_items
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items'
    AND policyname = 'Users can update own character items'
  ) THEN
    CREATE POLICY "Users can update own character items"
      ON public.game_items
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;

  -- DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'game_items'
    AND policyname = 'Users can delete own character items'
  ) THEN
    CREATE POLICY "Users can delete own character items"
      ON public.game_items
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = game_items.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_items TO authenticated;

-- Add comments
COMMENT ON TABLE public.game_items IS 'Stores character inventory items including weapons, armor, and consumables';
COMMENT ON COLUMN public.game_items.properties IS 'JSONB object storing item stats like damage, AC bonus, effects, etc.';
```

### Example 3: Adding Character Alignment Support

**Problem:** Need to track character alignment for gameplay mechanics

**Migration:** `20251020142000_add_alignment_to_characters.sql`

```sql
-- Add alignment column with validation
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS alignment text DEFAULT 'True Neutral';

-- Add constraint to ensure valid D&D alignments
ALTER TABLE public.characters
ADD CONSTRAINT characters_alignment_check
  CHECK (alignment IN (
    'Lawful Good',
    'Neutral Good',
    'Chaotic Good',
    'Lawful Neutral',
    'True Neutral',
    'Chaotic Neutral',
    'Lawful Evil',
    'Neutral Evil',
    'Chaotic Evil'
  ));

-- Create index for filtering by alignment
CREATE INDEX IF NOT EXISTS characters_alignment_idx
  ON public.characters(alignment);

-- Add comment
COMMENT ON COLUMN public.characters.alignment IS 'D&D 5e character alignment (e.g., "Lawful Good", "Chaotic Neutral")';
```

### Example 4: Adding Full-Text Search to Characters

**Problem:** Users need to search for characters by name efficiently

**Migration:** `20251020143000_add_character_search.sql`

```sql
-- Add tsvector column for full-text search
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(race, '') || ' ' || coalesce(class, ''))
  ) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS characters_search_vector_idx
  ON public.characters USING gin(search_vector);

-- Example usage:
-- SELECT * FROM characters WHERE search_vector @@ to_tsquery('english', 'elf & wizard');
```

### Example 5: Creating a Quest System

**Problem:** Need tables for quest management

**Migration:** `20251020144000_create_quest_system.sql`

```sql
-- Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  quest_type text NOT NULL CHECK (quest_type IN ('main', 'side', 'radiant')),
  difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 20),
  xp_reward int NOT NULL DEFAULT 0,
  gold_reward int NOT NULL DEFAULT 0,
  requirements jsonb DEFAULT '{}'::jsonb,  -- Level, previous quests, etc.
  objectives jsonb NOT NULL,  -- Array of objectives
  created_at timestamptz DEFAULT now()
);

-- Create character_quests junction table
CREATE TABLE IF NOT EXISTS public.character_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  progress jsonb DEFAULT '{}'::jsonb,  -- Objective completion tracking
  accepted_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(character_id, quest_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS quests_type_idx ON public.quests(quest_type);
CREATE INDEX IF NOT EXISTS quests_difficulty_idx ON public.quests(difficulty);
CREATE INDEX IF NOT EXISTS character_quests_character_idx ON public.character_quests(character_id);
CREATE INDEX IF NOT EXISTS character_quests_status_idx ON public.character_quests(character_id, status);

-- Enable RLS
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_quests ENABLE ROW LEVEL SECURITY;

-- Quests are public (anyone can view)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'quests'
    AND policyname = 'Anyone can view quests'
  ) THEN
    CREATE POLICY "Anyone can view quests"
      ON public.quests
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END$$;

-- Character quests follow character ownership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'character_quests'
    AND policyname = 'Users manage own character quests'
  ) THEN
    CREATE POLICY "Users manage own character quests"
      ON public.character_quests
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.characters
          WHERE characters.id = character_quests.character_id
          AND characters.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Grant permissions
GRANT SELECT ON public.quests TO authenticated;
GRANT ALL ON public.character_quests TO authenticated;
```

## Applying Migrations

### Method 1: Supabase CLI (Recommended)

```bash
cd /srv/project-chimera

# Push all new migrations to production
supabase db push

# Verify changes
supabase db diff
```

### Method 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new
2. Copy your migration SQL
3. Paste into the SQL editor
4. Click "Run" or press Ctrl+Enter
5. Verify in the Table Editor

### Method 3: Backend MCP Tool

```typescript
import { applyMigration } from './mcp/supabase';

await applyMigration({
  name: 'add_known_spells_to_characters',
  query: `... SQL here ...`
});
```

## Migration Checklist

Before applying a migration, verify:

- [ ] SQL is idempotent (uses IF NOT EXISTS / IF EXISTS)
- [ ] RLS policies use DO blocks to prevent duplicates
- [ ] Appropriate indexes are created
- [ ] RLS is enabled for sensitive tables
- [ ] Policies grant correct permissions
- [ ] Foreign keys have ON DELETE CASCADE (if appropriate)
- [ ] Check constraints are reasonable
- [ ] Comments document complex logic
- [ ] Tested locally (if possible)
- [ ] Rollback migration prepared (documented)

## Common Issues & Solutions

### Issue: "column already exists"

**Cause:** Migration run multiple times

**Solution:** Always use `IF NOT EXISTS`:
```sql
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS new_column text;
```

### Issue: "policy already exists"

**Cause:** Policy creation run multiple times

**Solution:** Wrap in DO block:
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'my_policy'
  ) THEN
    CREATE POLICY "my_policy" ...;
  END IF;
END$$;
```

### Issue: Foreign key constraint fails

**Cause:** Referenced table doesn't exist or migration order is wrong

**Solution:**
1. Check migration filenames (timestamps determine order)
2. Ensure referenced tables are created first
3. Use `REFERENCES` with correct table names

### Issue: Permission denied for users

**Cause:** Missing GRANT statements

**Solution:**
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated;
```

## Best Practices

1. **Small, Focused Migrations** - One concept per migration
2. **Descriptive Names** - Use clear, action-oriented names
3. **Always Idempotent** - Migrations should be safe to run multiple times
4. **Test Locally First** - Use `supabase db reset` locally
5. **Include Rollback** - Document how to undo the migration
6. **Never Edit Existing Migrations** - Create new ones instead
7. **Use Transactions** - Supabase wraps migrations in transactions automatically
8. **Document Complex Logic** - Add comments explaining why, not just what
9. **Create Appropriate Indexes** - But don't over-index
10. **Enable RLS** - Security first for user data

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_action_description.sql`

Good examples:
- `20251020140000_add_known_spells_to_characters.sql`
- `20251020141000_create_game_items_table.sql`
- `20251020142000_add_character_alignment_support.sql`
- `20251020143000_add_full_text_search_to_characters.sql`

Bad examples:
- `migration1.sql` (not descriptive)
- `update_characters.sql` (missing timestamp)
- `fix.sql` (too vague)

## Testing Migrations

### Local Testing (if Supabase CLI available)

```bash
# Start local Supabase
supabase start

# Apply all migrations
supabase db reset

# Test your app
npm run dev

# Check logs
supabase logs db
```

### Production Testing

1. **Use a staging environment** (if available)
2. **Test with real data scenarios**
3. **Monitor performance** after migration
4. **Have rollback ready**

## Monitoring After Migration

```sql
-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'your_table'
);

-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'your_table';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'your_table';

-- Check RLS policies
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'your_table';
```

## Resources

- [Supabase Database Migrations Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Project skill: `.claude/skills/supabase-migration.md`
