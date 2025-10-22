# Database Migration Instructions

## Problem
The Nuaibria backend requires database schema updates to support character creation and image generation features. The Supabase database is missing critical columns and tables.

## Missing Components

###1. Missing Character Columns (Migration 013)
- `armor_class`
- `temporary_hp`
- `speed`
- `hit_dice`
- `proficiency_bonus`
- `skills`
- `spell_slots`
- `background`
- `portrait_url`

### 2. Missing Asset Tables (Migration 014)
- `asset_requests` - Tracks image/text generation requests
- `generated_images` - Caches generated image metadata

## Solution

### Option 1: Manual Application via Supabase Dashboard (Recommended for now)

1. Go to Supabase Dashboard: https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new

2. Create a new SQL query and copy/paste MIGRATION 013 below, then click "Execute"

3. Create another SQL query and copy/paste MIGRATION 014 below, then click "Execute"

4. Restart the backend: `podman compose restart backend`

---

## MIGRATION 013: Add Missing Character Columns

```sql
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS armor_class INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS temporary_hp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS speed INTEGER NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS hit_dice JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proficiency_bonus INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS skills JSONB,
ADD COLUMN IF NOT EXISTS spell_slots JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS background TEXT,
ADD COLUMN IF NOT EXISTS portrait_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.characters.armor_class IS 'Base armor class (AC) of the character';
COMMENT ON COLUMN public.characters.temporary_hp IS 'Temporary hit points that expire at the end of a rest';
COMMENT ON COLUMN public.characters.speed IS 'Movement speed in feet per round';
COMMENT ON COLUMN public.characters.hit_dice IS 'JSON object tracking hit dice by type (e.g., {"8": 1, "10": 2})';
COMMENT ON COLUMN public.characters.proficiency_bonus IS 'Proficiency bonus based on character level';
COMMENT ON COLUMN public.characters.skills IS 'JSON object tracking skill proficiencies and bonuses';
COMMENT ON COLUMN public.characters.spell_slots IS 'JSON object tracking available spell slots by level';
COMMENT ON COLUMN public.characters.background IS 'Character background selection (e.g., Soldier, Folk Hero)';
COMMENT ON COLUMN public.characters.portrait_url IS 'URL to the character portrait image';
```

---

## MIGRATION 014: Create Asset Tables

```sql
CREATE TABLE IF NOT EXISTS public.asset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_hash TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'text')),
  context_type TEXT,
  prompt TEXT NOT NULL,
  context JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.asset_requests(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  context_type TEXT,
  image_url TEXT NOT NULL,
  dimensions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS asset_requests_status_idx ON public.asset_requests(status);
CREATE INDEX IF NOT EXISTS asset_requests_expires_at_idx ON public.asset_requests(expires_at);
CREATE INDEX IF NOT EXISTS asset_requests_created_at_idx ON public.asset_requests(created_at);
CREATE INDEX IF NOT EXISTS generated_images_expires_at_idx ON public.generated_images(expires_at);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON public.generated_images(created_at);

ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for asset_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asset_requests' AND policyname = 'Allow authenticated to read'
  ) THEN
    CREATE POLICY "Allow authenticated to read"
      ON public.asset_requests
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asset_requests' AND policyname = 'Allow authenticated to insert'
  ) THEN
    CREATE POLICY "Allow authenticated to insert"
      ON public.asset_requests
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'asset_requests' AND policyname = 'Allow service role to update'
  ) THEN
    CREATE POLICY "Allow service role to update"
      ON public.asset_requests
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

-- Row Level Security Policies for generated_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_images' AND policyname = 'Allow authenticated to read'
  ) THEN
    CREATE POLICY "Allow authenticated to read"
      ON public.generated_images
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'generated_images' AND policyname = 'Allow authenticated to insert'
  ) THEN
    CREATE POLICY "Allow authenticated to insert"
      ON public.generated_images
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.asset_requests TO authenticated;
GRANT SELECT, INSERT ON public.generated_images TO authenticated;
GRANT UPDATE ON public.asset_requests TO service_role;
```

---

## Expected Errors Before Migration

- ❌ `406 Not Acceptable` - Supabase REST query failing
- ❌ `500 Internal Server Error` - `/api/characters` POST endpoint failing
- ❌ `500 Internal Server Error` - `/api/assets/image` POST endpoint failing
- ❌ Error message: "Could not find the 'armor_class' column of 'characters' in the schema cache"
- ❌ Error message: "Could not find the table 'public.asset_requests' in the schema cache"

## Expected Results After Migration

- ✅ Character creation works
- ✅ Character portraits are generated
- ✅ No more database schema errors
- ✅ Asset caching functionality enabled

## Verification

After applying migrations, run:

```bash
curl -X GET http://localhost:3001/api/admin/migrations/status 2>&1 | jq .
```

Expected output:
```json
{
  "applied": true,
  "details": {
    "game_time_columns": true,
    "travel_sessions_table": true,
    "travel_events_table": true,
    "armor_class_column": true,
    "asset_tables": true
  }
}
```

---

## Need Help?

If migrations fail:
1. Check the error message in Supabase SQL editor
2. Most errors are safe to ignore if they're about "already exists"
3. Restart the backend after migrations complete
4. Try creating a character again

