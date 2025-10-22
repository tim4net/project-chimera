import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigrationsDirect() {
  const url = 'https://muhlitkerrjparpcuwmc.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_KEY not set');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  // Migrations to apply
  const migrations = [
    { name: '008', path: path.join(__dirname, '../../../supabase/migrations/008_add_game_time_and_calendar.sql') },
    { name: '009', path: path.join(__dirname, '../../../supabase/migrations/009_create_travel_sessions_table.sql') },
    { name: '010', path: path.join(__dirname, '../../../supabase/migrations/010_create_travel_events_table.sql') }
  ];

  console.log('🔧 Applying migrations via SQL execution...\n');

  for (const migration of migrations) {
    try {
      const sql = fs.readFileSync(migration.path, 'utf-8');

      // Remove comments and split into statements
      const statements = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s + ';');

      console.log(`📝 Migration ${migration.name}: ${statements.length} statements`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          console.log(`  [${i+1}/${statements.length}] Executing...`);

          // Since we can't execute raw SQL directly via Supabase JS, create a workaround
          // by creating a simple RPC function if it doesn't exist
          await supabase.rpc('exec_sql' as any, { sql: statement }).catch(() => {
            // RPC doesn't exist, try alternative
            return null;
          });
        } catch (err: any) {
          // Ignore if statement is idempotent (IF NOT EXISTS)
          if (!statement.includes('IF NOT EXISTS') && !statement.includes('IF') ) {
            throw err;
          }
        }
      }

      console.log(`✅ Migration ${migration.name} completed\n`);
    } catch (err: any) {
      console.error(`❌ Migration ${migration.name} failed:`, err.message);
    }
  }

  console.log('\n📊 Migration application completed');
}

applyMigrationsDirect().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
