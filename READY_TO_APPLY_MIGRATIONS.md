# ✅ Ready to Apply - Copy/Paste SQL

All migrations have been generated and verified by the backend. **Copy and paste each section below directly into Supabase SQL editor.**

---

## Step 1: Open Supabase Dashboard

Go to: https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new

---

## Step 2: Apply Migration 013

**Copy everything below and paste into a NEW SQL query window:**

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

**Click "Execute" ✅**

---

## Step 3: Apply Migration 014

**Copy everything below and paste into ANOTHER NEW SQL query window:**

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

**Click "Execute" ✅**

---

## Step 4: Restart Backend

After migrations are applied:

```bash
cd /srv/project-chimera
podman compose restart backend
```

Wait 5 seconds...

---

## Step 5: Test Character Creation

Refresh your browser at: http://localhost:5173/create-character

Try creating a new character. It should work without errors!

---

## What This Fixes

✅ `406 Not Acceptable` error on Supabase queries
✅ `500 Internal Server Error` on `/api/characters`
✅ `500 Internal Server Error` on `/api/assets/image`
✅ Missing `armor_class` column
✅ Missing `armor_class`, `temporary_hp`, `speed`, `hit_dice`, `proficiency_bonus`, `skills`, `spell_slots`, `background`, `portrait_url` columns
✅ Missing `asset_requests` table
✅ Missing `generated_images` table
✅ Character creation and portrait generation

---

## Verification

After restart, check status:

```bash
curl -s http://localhost:3001/api/admin/migrations/status | jq '.details | select(.armor_class_column == true and .asset_tables == true)'
```

Expected result:
```json
{
  "armor_class_column": true,
  "asset_tables": true,
  "game_time_columns": true,
  "travel_events_table": true,
  "travel_sessions_table": true
}
```

