#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Supabase PostgreSQL connection
const pool = new Pool({
  host: 'db.muhlitkerrjparpcuwmc.supabase.co',
  port: 5432,
  user: 'postgres.muhlitkerrjparpcuwmc',
  password: process.env.DB_PASSWORD || 'YFKAjQjbAhxTjgqvQl1552IhEPGmanzG',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// Migration files to apply in order
const migrations = [
  {
    name: 'Add danger_level to world_pois',
    file: 'backend/migrations/20251022_add_danger_level_to_biomes.sql',
    verifyQuery: `
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'world_pois' AND column_name = 'danger_level'
    `
  },
  {
    name: 'Create travel_sessions table',
    file: 'backend/migrations/20251022_create_travel_sessions.sql',
    verifyQuery: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'travel_sessions'
      ORDER BY ordinal_position
    `
  },
  {
    name: 'Create travel_events table',
    file: 'backend/migrations/20251022_create_travel_events.sql',
    verifyQuery: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'travel_events'
      ORDER BY ordinal_position
    `
  }
];

console.log('🚀 Applying travel system migrations to Supabase...\n');

(async () => {
  let client;
  let successCount = 0;
  let failureCount = 0;

  try {
    client = await pool.connect();
    console.log('✅ Connected to Supabase database\n');

    for (const migration of migrations) {
      console.log(`📝 Migration: ${migration.name}`);
      console.log(`   File: ${migration.file}`);

      try {
        // Read migration file
        const migrationPath = path.join(__dirname, migration.file);
        if (!fs.existsSync(migrationPath)) {
          console.error(`   ❌ Migration file not found: ${migrationPath}`);
          failureCount++;
          continue;
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        console.log('   ⏳ Executing...');
        await client.query(migrationSQL);
        console.log('   ✅ Migration executed successfully!');

        // Verify migration
        console.log('   🔍 Verifying...');
        const verifyResult = await client.query(migration.verifyQuery);

        if (verifyResult.rows.length > 0) {
          console.log(`   ✅ Verified: ${verifyResult.rows.length} columns/records found`);
          verifyResult.rows.forEach(row => {
            console.log(`      - ${row.column_name || row.table_name}: ${row.data_type || row.constraint_type || 'OK'}`);
          });
          successCount++;
        } else {
          console.log('   ⚠️  Warning: Verification query returned no results');
          successCount++;
        }

      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        failureCount++;
      }

      console.log(''); // Blank line between migrations
    }

    // Final verification: Check constraints
    console.log('🔍 Final Verification: Checking constraints and indexes...\n');

    // Check travel_sessions constraints
    const constraintsResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name IN ('travel_sessions', 'travel_events')
      ORDER BY tc.table_name, tc.constraint_type
    `);

    console.log('📋 Constraints:');
    constraintsResult.rows.forEach(row => {
      const fk = row.foreign_table_name
        ? ` → ${row.foreign_table_name}.${row.foreign_column_name}`
        : '';
      console.log(`   ${row.constraint_type}: ${row.constraint_name} (${row.column_name}${fk})`);
    });

    // Check indexes
    const indexesResult = await client.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('travel_sessions', 'travel_events', 'world_pois')
        AND indexname LIKE '%travel%' OR indexname LIKE '%danger%'
      ORDER BY tablename, indexname
    `);

    console.log('\n📋 Indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`   ${row.tablename}.${row.indexname}`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful migrations: ${successCount}`);
    console.log(`❌ Failed migrations: ${failureCount}`);
    console.log(`📈 Total migrations: ${migrations.length}`);

    if (failureCount === 0) {
      console.log('\n✨ All travel system migrations completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Review the migration results above');
      console.log('   2. Test travel system integration');
      console.log('   3. Restart backend if needed: podman compose restart backend');
    } else {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.');
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Cannot reach database directly. Try manual application:');
      console.log('\n📋 Run these SQL files in Supabase SQL Editor:\n');
      migrations.forEach(m => console.log(`   - ${m.file}`));
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();
