#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

console.log('🚀 Applying POI type migration to Supabase...');
console.log(`   URL: ${SUPABASE_URL}`);

// Read migration file
const migrationPath = path.join(__dirname, 'backend/migrations/20251021_ensure_world_pois_text_type.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Create Supabase client with admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

(async () => {
  try {
    console.log('\n📝 Testing Supabase connection...');
    
    // Try a simple query first to verify connection
    const { data: testData, error: testError } = await supabase
      .from('world_pois')
      .select('count')
      .limit(1);

    if (testError && testError.code !== 'PGRST100') {
      console.log('⚠️  Test query result:', testError.message);
    } else {
      console.log('✅ Supabase connection verified');
    }

    // Now try the migration via RPC if available, otherwise direct via REST
    console.log('\n📝 Attempting to apply migration...');

    // Try using exec_sql RPC function if it exists
    const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (rpcError && rpcError.code === 'PGRST116') {
      console.log('⚠️  exec_sql function not found, trying alternative...');
      console.log('\n❌ Direct DDL execution not available via REST API');
      console.log('📋 Please apply this SQL manually via Supabase web console:');
      console.log('   https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new');
      console.log('\nSQL to run:\n');
      console.log(migrationSQL);
      process.exit(1);
    } else if (rpcError) {
      throw rpcError;
    }

    console.log('✅ Migration executed!');

    // Verify
    console.log('\n🔍 Verifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('world_pois')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Verification query result:', verifyError.message);
    } else {
      console.log('✅ world_pois table is accessible');
      console.log('✨ Migration likely succeeded!');
      console.log('\n💡 Next steps:');
      console.log('   1. Restart backend: podman compose restart backend');
      console.log('   2. Check logs: podman compose logs backend | tail -20');
      console.log('   3. Verify no "invalid input value for enum poi_type" errors');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
