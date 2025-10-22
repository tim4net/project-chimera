#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://muhlitkerrjparpcuwmc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable not set');
  process.exit(1);
}

console.log('🚀 Applying POI type migration to Supabase...');
console.log(`   URL: ${SUPABASE_URL}`);

// Read migration file
const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Apply migration
(async () => {
  try {
    console.log('\n📝 Executing migration SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql function doesn't exist, try alternative approach
      if (error.message?.includes('function exec_sql')) {
        console.log('⚠️  exec_sql function not found, using direct approach...');

        // For now, just log the SQL that needs to be run
        console.log('\n❌ Cannot execute via RPC. Please run this SQL manually in Supabase console:\n');
        console.log(migrationSQL);
        process.exit(1);
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }

    console.log('\n✨ Done! POI type migration has been applied.');
    console.log('💡 Tip: Restart the backend container to apply changes:');
    console.log('   podman compose restart backend');

  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  }
})();
