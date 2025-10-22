#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');

// Parse DATABASE_URL
const dbUrl = 'postgresql://postgres.muhlitkerrjparpcuwmc:YFKAjQjbAhxTjgqvQl1552IhEPGmanzG@db.muhlitkerrjparpcuwmc.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function executeMigrations() {
  const client = await pool.connect();

  try {
    console.log('\n🔄 Applying Database Migrations\n');

    // Migration 013: Add missing columns
    console.log('📝 Migration 013: Adding missing character columns...');
    await client.query(`
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
    `);
    console.log('✅ Migration 013 completed\n');

    // Migration 014: Create asset tables
    console.log('📝 Migration 014: Creating asset tables...');

    await client.query(`
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
    `);

    await client.query(`
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
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS asset_requests_status_idx ON public.asset_requests(status);
      CREATE INDEX IF NOT EXISTS asset_requests_expires_at_idx ON public.asset_requests(expires_at);
      CREATE INDEX IF NOT EXISTS asset_requests_created_at_idx ON public.asset_requests(created_at);
      CREATE INDEX IF NOT EXISTS generated_images_expires_at_idx ON public.generated_images(expires_at);
      CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON public.generated_images(created_at);
    `);

    // Enable RLS
    await client.query(`
      ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
    `);

    // Create RLS policies
    await client.query(`
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
      END$$;
    `);

    await client.query(`
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
    `);

    // Grant permissions
    await client.query(`
      GRANT USAGE ON SCHEMA public TO authenticated;
      GRANT SELECT, INSERT ON public.asset_requests TO authenticated;
      GRANT SELECT, INSERT ON public.generated_images TO authenticated;
      GRANT UPDATE ON public.asset_requests TO service_role;
    `);

    console.log('✅ Migration 014 completed\n');

    console.log('✨ All migrations applied successfully!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

executeMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
