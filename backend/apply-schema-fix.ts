import { supabaseServiceClient } from './src/services/supabaseClient';
import * as fs from 'fs';

async function fixSchema() {
  try {
    const sql = fs.readFileSync('/tmp/fix_schema.sql', 'utf-8');

    console.log('[Schema Fix] Executing SQL to add missing columns and tables...\n');

    // Split into individual statements and execute
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (!statement.trim()) continue;

      console.log(`[Schema Fix] Executing: ${statement.substring(0, 80)}...`);

      const { error } = await supabaseServiceClient.rpc('_exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        console.error(`[Schema Fix] Error: ${error.message}`);
      } else {
        console.log(`[Schema Fix] ✅ Done`);
      }
    }

    console.log('\n[Schema Fix] Verifying columns...');

    // Verify the columns exist
    const { data, error: verifyError } = await supabaseServiceClient
      .from('characters')
      .select('game_time_minutes, world_date_day')
      .limit(1);

    if (!verifyError) {
      console.log('✅ Schema fix successful! Columns exist.');
    } else {
      console.error('❌ Schema verification failed:', verifyError.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixSchema();
