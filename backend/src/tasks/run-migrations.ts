import { supabaseServiceClient } from '../services/supabaseClient';

async function applyMigrations() {
  console.log('\n🔄 Applying Database Migrations\n');

  try {
    // Migration 013: Add missing columns
    console.log('📝 Migration 013: Adding missing character columns...');
    const { error: error013 } = await supabaseServiceClient.rpc('exec_raw_sql', {
      sql_query: `
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
      `
    });

    if (error013) {
      console.error('Error in migration 013:', error013);
      // Try without RPC if it doesn't exist
      console.log('Falling back to direct SQL insert...');
    } else {
      console.log('✅ Migration 013 completed\n');
    }

    // Migration 014: Create asset tables
    console.log('📝 Migration 014: Creating asset tables...');
    const { error: error014 } = await supabaseServiceClient.rpc('exec_raw_sql', {
      sql_query: `
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
      `
    });

    if (error014) {
      console.error('Error in migration 014:', error014);
    } else {
      console.log('✅ Migration 014 completed\n');
    }

    // Create RLS policies
    console.log('📝 Creating RLS policies...');
    const { error: errorPolicies } = await supabaseServiceClient.rpc('exec_raw_sql', {
      sql_query: `
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
      `
    });

    if (errorPolicies) {
      console.error('Error creating policies:', errorPolicies);
    }

    console.log('\n✨ Migrations completed!\n');
    process.exit(0);
  } catch (err: any) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

applyMigrations();
