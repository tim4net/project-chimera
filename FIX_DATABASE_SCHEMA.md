# Quick Fix: Database Schema Errors

## The Problem

Your Nuaibria frontend is showing these errors:

- ❌ `406 Not Acceptable` on Supabase query
- ❌ `500 Internal Server Error` on `/api/characters` and `/api/assets/image`
- ❌ "Could not find the 'armor_class' column of 'characters'"
- ❌ "Could not find the table 'public.asset_requests'"

**Root Cause**: The Supabase database is missing required columns and tables.

## The Solution (5 minutes)

### Step 1: Open Supabase SQL Editor

Go to: https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new

### Step 2: Run Migration 013

Copy and paste this entire SQL block and click **Execute**:

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
```

✅ You should see "Success" message

### Step 3: Run Migration 014

Copy and paste this entire SQL block and click **Execute**:

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
```

✅ You should see "Success" message (some warnings about policies are OK)

### Step 4: Restart Backend

```bash
cd /srv/project-chimera
podman compose restart backend
```

Wait 5 seconds for the backend to start.

### Step 5: Test Character Creation

Refresh your browser and try creating a character. It should now work!

---

## What Was Fixed

| Issue | What Was Added |
|-------|---|
| `armor_class` missing | Added `armor_class` column to `characters` table |
| `temporary_hp` missing | Added `temporary_hp` column |
| `speed` missing | Added `speed` column |
| `hit_dice` missing | Added `hit_dice` JSONB column |
| `spell_slots` missing | Added `spell_slots` JSONB column |
| Other fields | Added `background`, `skills`, `proficiency_bonus`, `portrait_url` |
| Image caching broken | Created `asset_requests` table |
| Image generation failed | Created `generated_images` table |

---

## Verification (Optional)

To verify everything is working, run:

```bash
curl -s http://localhost:3001/api/admin/migrations/status | jq '.details | select(.armor_class_column == true and .asset_tables == true)' && echo "✅ All migrations applied!"
```

---

## Still Having Issues?

1. **Still getting 500 errors?** → Make sure backend restarted (check logs with `podman compose logs backend --tail 50`)
2. **Table already exists error?** → This is normal (IF NOT EXISTS handles it), migrations still passed
3. **Permissions error?** → Check that your Supabase project URL matches the one in your .env file

