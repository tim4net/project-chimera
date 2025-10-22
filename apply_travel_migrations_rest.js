#!/usr/bin/env node
/**
 * Apply travel system migrations using Supabase Management API
 * This script uses the REST API to execute SQL directly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://muhlitkerrjparpcuwmc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Error: Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

console.log(`📦 Project: ${projectRef}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

// Migration files to apply in order
const migrations = [
  {
    name: 'Add danger_level to world_pois',
    file: 'backend/migrations/20251022_add_danger_level_to_biomes.sql'
  },
  {
    name: 'Create travel_sessions table',
    file: 'backend/migrations/20251022_create_travel_sessions.sql'
  },
  {
    name: 'Create travel_events table',
    file: 'backend/migrations/20251022_create_travel_events.sql'
  }
];

/**
 * Execute SQL via Supabase REST API
 */
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_raw_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Apply a migration file
 */
async function applyMigration(migration) {
  console.log(`📝 Migration: ${migration.name}`);
  console.log(`   File: ${migration.file}`);

  const migrationPath = path.join(__dirname, migration.file);

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('   ⏳ Executing...');

  try {
    await executeSQL(sql);
    console.log('   ✅ Migration executed successfully!\n');
    return true;
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}\n`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Applying travel system migrations to Supabase...\n');

  let successCount = 0;
  let failureCount = 0;

  // Note about manual application
  console.log('⚠️  Note: Direct SQL execution via REST API may not be available.');
  console.log('   If migrations fail, use the Supabase SQL Editor (recommended).\n');

  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Total: ${migrations.length}`);
  console.log('='.repeat(60));

  if (failureCount > 0) {
    console.log('\n❌ Some migrations failed.');
    console.log('\n💡 MANUAL APPLICATION REQUIRED:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef);
    console.log('   2. Navigate to: SQL Editor');
    console.log('   3. Copy and paste each migration file:');
    migrations.forEach((m, i) => {
      console.log(`      ${i + 1}. ${m.file}`);
    });
    console.log('   4. Click "Run" for each migration\n');
    console.log('   See TRAVEL_MIGRATIONS_README.md for detailed instructions.');
    process.exit(1);
  } else {
    console.log('\n✨ All migrations completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify migrations (see TRAVEL_MIGRATIONS_README.md)');
    console.log('   2. Restart backend: podman compose restart backend');
    console.log('   3. Test travel system integration');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  console.log('\n💡 Please apply migrations manually using Supabase SQL Editor.');
  console.log('   See TRAVEL_MIGRATIONS_README.md for instructions.');
  process.exit(1);
});
