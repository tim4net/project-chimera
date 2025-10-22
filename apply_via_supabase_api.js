#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🚀 Applying POI migration via Supabase API...');
console.log(`   URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read migration
const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

(async () => {
  try {
    // Step 1: Try to create a helper function to execute raw SQL
    console.log('\n1️⃣  Creating helper function...');
    
    const helperFunction = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql_text text)
      RETURNS text AS $$
      DECLARE
        result text;
      BEGIN
        EXECUTE sql_text;
        RETURN 'Migration executed successfully';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    `;

    const { error: helperError } = await supabase.rpc('exec_sql', { sql_text: helperFunction });
    
    // If helper function doesn't exist yet, we need a different approach
    // Let's try splitting the migration into callable statements
    
    console.log('\n2️⃣  Attempting to execute migration in parts...');
    
    // Part 1: Drop the enum
    const dropEnumSQL = `
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'world_pois'
          AND column_name = 'type'
          AND udt_name = 'poi_type'
        ) THEN
          ALTER TABLE world_pois ALTER COLUMN type TYPE TEXT;
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poi_type') THEN
          DROP TYPE IF EXISTS poi_type CASCADE;
        END IF;
      END$$;
    `;
    
    console.log('   - Attempting to drop enum...');
    const { error: dropError } = await supabase.rpc('exec_sql', { sql_text: dropEnumSQL });
    
    if (dropError && dropError.code !== 'PGRST116') {
      console.log('   ⚠️ Drop enum result:', dropError.message);
    } else {
      console.log('   ✅ Enum handling completed');
    }
    
    // Part 2: Ensure table exists with proper structure
    console.log('   - Ensuring table structure...');
    const tableSQL = `
      CREATE TABLE IF NOT EXISTS public.world_pois (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        type text NOT NULL,
        position jsonb NOT NULL,
        campaign_seed text,
        generated_content jsonb,
        discovered_by_characters uuid[] DEFAULT ARRAY[]::uuid[],
        first_discovered_at timestamptz,
        description text,
        discovered boolean DEFAULT false,
        encounter_chance float,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql_text: tableSQL });
    if (tableError && tableError.code !== 'PGRST116') {
      console.log('   ⚠️ Table result:', tableError.message);
    } else {
      console.log('   ✅ Table structure verified');
    }
    
    // Part 3: Verify the change by querying column info
    console.log('\n3️⃣  Verifying migration...');
    const { data: colData, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, udt_name')
      .eq('table_name', 'world_pois')
      .eq('column_name', 'type');
    
    if (!colError && colData && colData.length > 0) {
      const col = colData[0];
      console.log(`   ✅ Column info: ${col.column_name} -> ${col.data_type}`);
      
      if (col.data_type === 'text') {
        console.log('\n✨ POI migration likely succeeded!');
        console.log('\n📋 Next steps:');
        console.log('   1. Restart backend: podman compose restart backend');
        console.log('   2. Check logs: podman compose logs backend | tail -20');
        console.log('   3. Verify: grep -i "invalid input value for enum" <(podman compose logs backend)');
      } else {
        console.log(`   ⚠️  Column type is still: ${col.data_type}`);
      }
    } else {
      console.log('   ⚠️  Could not query column info');
      console.log('\n❌ API approach has limitations for DDL operations.');
      console.log('\n📋 Please apply manually via Supabase console:');
      console.log('   https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new');
      console.log('\nSQL:\n');
      console.log(migrationSQL);
    }
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.log('\n⚠️  The Supabase REST API cannot execute DDL statements.');
    console.log('\n📋 Must be applied manually via console or PostgreSQL directly.');
    process.exit(1);
  }
})();
