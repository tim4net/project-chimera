import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_KEY}@db.muhlitkerrjparpcuwmc.supabase.co:5432/postgres?sslmode=require`;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function clearContent() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing all game content...\n');
    
    // Travel system
    console.log('Deleting travel events and sessions...');
    await client.query('DELETE FROM public.travel_events');
    await client.query('DELETE FROM public.travel_sessions');
    
    // Character data
    console.log('Deleting character data...');
    await client.query('DELETE FROM public.dm_conversations');
    await client.query('DELETE FROM public.journal_entries');
    await client.query('DELETE FROM public.items');
    await client.query('DELETE FROM public.characters');
    
    // Content pools
    console.log('Deleting content pools...');
    await client.query('DELETE FROM public.quest_templates');
    await client.query('DELETE FROM public.npc_personalities');
    await client.query('DELETE FROM public.combat_encounters');
    await client.query('DELETE FROM public.dungeon_content');
    
    // World data
    console.log('Deleting world data...');
    await client.query('DELETE FROM public.world_roads');
    await client.query('DELETE FROM public.character_locations');
    await client.query('DELETE FROM public.maps');
    
    // Worker state
    console.log('Resetting worker jobs...');
    await client.query('DELETE FROM public.worker_jobs');
    await client.query('DELETE FROM public.worker_metrics');
    
    // Verify
    console.log('\n📊 Verification:');
    const result = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM public.characters) as characters_count,
        (SELECT COUNT(*) FROM public.npc_personalities) as npcs_count,
        (SELECT COUNT(*) FROM public.quest_templates) as quests_count,
        (SELECT COUNT(*) FROM public.maps) as maps_count,
        (SELECT COUNT(*) FROM public.worker_jobs) as jobs_count
    `);
    
    const counts = result.rows[0];
    console.log(`Characters: ${counts.characters_count} ✓`);
    console.log(`NPCs: ${counts.npcs_count} ✓`);
    console.log(`Quests: ${counts.quests_count} ✓`);
    console.log(`Maps: ${counts.maps_count} ✓`);
    console.log(`Jobs: ${counts.jobs_count} ✓`);
    
    console.log('\n✅ All content cleared! System ready for regeneration.');
    
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

clearContent().catch(err => {
  console.error(err);
  process.exit(1);
});
