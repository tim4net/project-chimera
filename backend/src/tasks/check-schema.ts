import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://muhlitkerrjparpcuwmc.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aGxpdGtlcnJqcGFycGN1d21jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY5Njk3MiwiZXhwIjoyMDc2MjcyOTcyfQ.rXmbN4KHOdgvBmp7Pr8GvbqpbEpBYO4eGWZcteVcMxE'
);

async function check() {
  console.log('\n🔍 CHECKING ACTUAL DATABASE SCHEMA\n');

  // Create a test character to check what columns are returned
  console.log('Querying characters table structure...\n');

  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      const cols = Object.keys(data[0]);
      console.log('✅ Columns in characters table:');
      cols.forEach(col => {
        const isNew = col.includes('game_time') || col.includes('world_date');
        const marker = isNew ? '🆕' : '  ';
        console.log(`${marker} ${col}`);
      });

      if (cols.includes('game_time_minutes')) {
        console.log('\n✅ MIGRATIONS HAVE BEEN APPLIED SUCCESSFULLY!');
      } else {
        console.log('\n❌ Migrations NOT applied - game_time_minutes column missing');
      }
    } else {
      console.log('ℹ️  No characters in database, trying direct column check...\n');

      // Try querying a specific column that shouldn't exist if migration didn't apply
      const { error: colError } = await supabase
        .from('characters')
        .select('game_time_minutes')
        .limit(1);

      if (colError && colError.message?.includes('does not exist')) {
        console.log('❌ Column game_time_minutes does not exist - migrations NOT applied');
      } else if (colError) {
        console.log(`❌ Error: ${colError.message}`);
      } else {
        console.log('✅ Column exists!');
      }
    }

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

check();
