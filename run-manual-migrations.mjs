/**
 * @fileoverview Manually runs specified SQL migration files against a Supabase database.
 * This script is intended for one-off use to fix schema inconsistencies when the
 * Supabase CLI's migration state is out of sync with the actual database schema.
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// These files will be executed in the order they appear in this array.
const MIGRATION_FILES_TO_RUN = [
  '008_add_game_time_and_calendar.sql',
  '009_create_travel_sessions_table.sql',
  '010_create_travel_events_table.sql',
];

/**
 * Main function to connect to the database and run migrations.
 */
async function runManualMigrations() {
  const supabaseUrl = 'https://muhlitkerrjparpcuwmc.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const migrationsPath = path.join(__dirname, 'supabase', 'migrations');

  if (!serviceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is not set.');
    process.exit(1);
  }

  const projectRefMatch = supabaseUrl.match(/https?:\/\/(\w+)\.supabase\./);
  if (!projectRefMatch) {
    console.error('❌ Error: Invalid SUPABASE_URL format.');
    process.exit(1);
  }

  const projectRef = projectRefMatch[1];

  console.log('\n🔥 DIRECT POSTGRESQL MIGRATION EXECUTION\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`📁 Migrations path: ${migrationsPath}\n`);

  // Use connection string format
  const connectionString = `postgresql://postgres:${serviceKey}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;

  // Create a new PostgreSQL pool
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  let client;
  try {
    // Connect to the database
    client = await pool.connect();
    console.log(`✅ Successfully connected to ${dbHost}\n`);

    // Execute each migration file
    for (const fileName of MIGRATION_FILES_TO_RUN) {
      console.log(`▶️  Executing: ${fileName}...`);
      const filePath = path.join(migrationsPath, fileName);

      try {
        const sql = await fs.readFile(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ ${fileName} applied successfully\n`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`❌ File not found: ${filePath}`);
        } else {
          console.error(`❌ Error: ${err.message}\n`);
        }
        throw new Error(`Migration failed: ${fileName}`);
      }
    }

    console.log('🎉 All migrations executed successfully!\n');

    // Verify the columns exist
    console.log('🔍 Verifying schema changes...\n');
    try {
      const result = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='characters'
        AND column_name IN ('game_time_minutes', 'world_date_day', 'world_date_month', 'world_date_year')
        ORDER BY column_name;
      `);

      if (result.rows.length === 4) {
        console.log('✅ All game_time columns verified:\n');
        result.rows.forEach(row => {
          console.log(`   ✅ ${row.column_name}`);
        });
      } else {
        console.log(`⚠️  Only ${result.rows.length}/4 columns verified`);
        result.rows.forEach(row => {
          console.log(`   ✅ ${row.column_name}`);
        });
      }
    } catch (err) {
      console.log(`⚠️  Could not verify columns: ${err.message}`);
    }

    console.log('\n✨ Migration process complete!\n');

  } catch (err) {
    console.error('🛑 Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
    console.log('🔌 Database connection closed.');
  }
}

runManualMigrations();
