import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Supabase PostgreSQL connection details
  const connectionString = 'postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres';

  // Extract from environment or use direct approach
  const supabaseUrl = 'muhlitkerrjparpcuwmc.supabase.co';
  const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabasePassword) {
    console.error('❌ SUPABASE_DB_PASSWORD not set in environment');
    console.log('\nTo get the database password:');
    console.log('1. Go to https://app.supabase.com/project/muhlitkerrjparpcuwmc/settings/database');
    console.log('2. Copy the "Password" value');
    console.log('3. Set: export SUPABASE_DB_PASSWORD=<password>');
    process.exit(1);
  }

  const client = new Client({
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: 'postgres.muhlitkerrjparpcuwmc',
    password: supabasePassword,
    ssl: 'require' as any,
  });

  try {
    console.log('\n🔥 APPLYING MIGRATIONS DIRECTLY VIA POSTGRES\n');

    await client.connect();
    console.log('✅ Connected to database\n');

    // Migration 008
    console.log('📝 Migration 008: Game Time & Calendar');

    const migration008 = fs.readFileSync(
      path.join(__dirname, '../../../supabase/migrations/008_add_game_time_and_calendar.sql'),
      'utf-8'
    );

    const statements008 = migration008
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements008) {
      try {
        await client.query(stmt + ';');
        console.log(`  ✅ Executed statement (${stmt.substring(0, 40)}...)`);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`  ⏭️  Skipped (already exists)`);
        } else {
          console.error(`  ❌ Error: ${err.message}`);
        }
      }
    }

    // Verify
    try {
      const result = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name='characters' AND column_name='game_time_minutes') as exists;`
      );

      if (result.rows[0].exists) {
        console.log('  ✅ Verification: game_time_minutes column exists!\n');
      } else {
        console.log('  ❌ Verification failed: column still missing\n');
      }
    } catch (err) {
      console.log('  ❓ Could not verify\n');
    }

    // Migration 009
    console.log('📝 Migration 009: Travel Sessions');
    const migration009 = fs.readFileSync(
      path.join(__dirname, '../../../supabase/migrations/009_create_travel_sessions_table.sql'),
      'utf-8'
    );

    const statements009 = migration009
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements009) {
      try {
        await client.query(stmt + ';');
        console.log(`  ✅ Executed`);
      } catch (err: any) {
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`  ⏭️  Skipped (already exists)`);
        } else {
          console.log(`  ⚠️  Warning: ${err.message?.substring(0, 80)}`);
        }
      }
    }

    // Verify
    try {
      await client.query(`SELECT id FROM public.travel_sessions LIMIT 1;`);
      console.log('  ✅ Verification: travel_sessions table accessible!\n');
    } catch (err: any) {
      console.log(`  ❌ Verification failed: ${err.message?.substring(0, 80)}\n`);
    }

    // Migration 010
    console.log('📝 Migration 010: Travel Events');
    const migration010 = fs.readFileSync(
      path.join(__dirname, '../../../supabase/migrations/010_create_travel_events_table.sql'),
      'utf-8'
    );

    const statements010 = migration010
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements010) {
      try {
        await client.query(stmt + ';');
        console.log(`  ✅ Executed`);
      } catch (err: any) {
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`  ⏭️  Skipped (already exists)`);
        } else {
          console.log(`  ⚠️  Warning: ${err.message?.substring(0, 80)}`);
        }
      }
    }

    // Verify
    try {
      await client.query(`SELECT id FROM public.travel_events LIMIT 1;`);
      console.log('  ✅ Verification: travel_events table accessible!\n');
    } catch (err: any) {
      console.log(`  ❌ Verification failed: ${err.message?.substring(0, 80)}\n`);
    }

    console.log('✨ Migrations complete!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
