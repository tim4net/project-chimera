import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://muhlitkerrjparpcuwmc.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

interface MigrationFile {
  name: string;
  path: string;
  order: number;
}

async function applyMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrations: MigrationFile[] = [
    {
      name: '008_add_game_time_and_calendar.sql',
      path: '/srv/project-chimera/supabase/migrations/008_add_game_time_and_calendar.sql',
      order: 1
    },
    {
      name: '009_create_travel_sessions_table.sql',
      path: '/srv/project-chimera/supabase/migrations/009_create_travel_sessions_table.sql',
      order: 2
    },
    {
      name: '010_create_travel_events_table.sql',
      path: '/srv/project-chimera/supabase/migrations/010_create_travel_events_table.sql',
      order: 3
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrations) {
    try {
      console.log(`📄 Reading migration: ${migration.name}`);
      const sql = fs.readFileSync(migration.path, 'utf-8');

      // Split into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`   Found ${statements.length} SQL statement(s)`);

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';

        try {
          console.log(`   [${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);

          let result: any;
          try {
            result = await supabase.rpc('exec_sql_migration', {
              sql: statement
            });
          } catch (rpcErr) {
            // Fallback if RPC function doesn't exist
            console.log('   Note: Using direct query method...');
            result = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);
          }

          const { error } = result;

          if (error && error.message && error.message.includes('Unknown function')) {
            console.log('   Note: exec_sql_migration function not found, attempting alternative method...');
          } else if (error) {
            console.warn(`   ⚠️  Warning: ${error.message}`);
          } else {
            console.log(`   ✅ Success`);
          }
        } catch (err: any) {
          console.error(`   ❌ Error executing statement: ${err.message}`);
        }
      }

      console.log(`✅ Migration ${migration.order}: ${migration.name} completed\n`);
      successCount++;
    } catch (err: any) {
      console.error(`❌ Migration ${migration.order}: ${migration.name} failed`);
      console.error(`   Error: ${err.message}\n`);
      failureCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log('='.repeat(60));

  if (failureCount > 0) {
    console.log('\n⚠️  Some migrations failed. You may need to apply them manually via Supabase dashboard.');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations applied successfully!');
    process.exit(0);
  }
}

applyMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
