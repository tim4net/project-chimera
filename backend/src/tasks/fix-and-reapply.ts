import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://muhlitkerrjparpcuwmc.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aGxpdGtlcnJqcGFycGN1d21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5Njk3MiwiZXhwIjoyMDc2MjcyOTcyfQ.rXmbN4KHOdgvBmp7Pr8GvbqpbEpBYO4eGWZcteVcMxE'
);

async function main() {
  console.log('\n🔧 FIXING MIGRATION STATE\n');

  // Step 1: Delete the failed migration records
  console.log('Step 1: Clearing failed migration records from schema_migrations...');

  const versionsToDelete = ['008', '009', '010'];

  for (const version of versionsToDelete) {
    const { error } = await supabase
      .from('supabase_migrations.schema_migrations')
      .delete()
      .eq('version', version);

    if (error) {
      if (error.message?.includes('does not exist')) {
        console.log(`  ⏭️  supabase_migrations table not accessible (expected)`);
      } else {
        console.log(`  ⚠️  Could not delete ${version}: ${error.message}`);
      }
    } else {
      console.log(`  ✅ Cleared version ${version}`);
    }
  }

  console.log('\nℹ️  Migration state cleared. The migrations will need to be manually');
  console.log('   applied via the Supabase SQL Editor at:');
  console.log('   https://app.supabase.com/project/muhlitkerrjparpcuwmc/sql/new\n');

  console.log('📋 SQL to paste (in order):\n');

  console.log('--- FIRST: Paste this (Migration 008) ---');
  console.log(`ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS game_time_minutes BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS world_date_day INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_month INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS world_date_year INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS characters_world_date_idx
ON public.characters (world_date_year, world_date_month, world_date_day);\n`);

  console.log('--- SECOND: Paste Migration 009 from: ---');
  console.log('   /srv/project-chimera/supabase/migrations/009_create_travel_sessions_table.sql\n');

  console.log('--- THIRD: Paste Migration 010 from: ---');
  console.log('   /srv/project-chimera/supabase/migrations/010_create_travel_events_table.sql\n');

  console.log('After pasting each migration, click "Run" in Supabase.\n');
}

main().catch(console.error);
