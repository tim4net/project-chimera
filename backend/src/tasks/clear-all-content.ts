/**
 * Task: Clear all game content for regeneration
 * Usage: npx ts-node src/tasks/clear-all-content.ts
 */

import { supabaseServiceClient } from '../services/supabaseClient';

async function clearAllContent() {
  console.log('🗑️  Clearing all game content...\n');
  
  try {
    // Travel system
    console.log('Deleting travel events...');
    const { error: eventError } = await supabaseServiceClient
      .from('travel_events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (eventError) throw eventError;
    
    console.log('Deleting travel sessions...');
    const { error: sessionError } = await supabaseServiceClient
      .from('travel_sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (sessionError) throw sessionError;
    
    // Character data
    console.log('Deleting conversations...');
    const { error: convError } = await supabaseServiceClient
      .from('dm_conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (convError) throw convError;
    
    console.log('Deleting journal entries...');
    const { error: journalError } = await supabaseServiceClient
      .from('journal_entries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (journalError) throw journalError;
    
    console.log('Deleting items...');
    const { error: itemError } = await supabaseServiceClient
      .from('items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemError) throw itemError;
    
    console.log('Deleting characters...');
    const { error: charError } = await supabaseServiceClient
      .from('characters')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (charError) throw charError;
    
    // Content pools
    console.log('Deleting quest templates...');
    const { error: questError } = await supabaseServiceClient
      .from('quest_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (questError) throw questError;
    
    console.log('Deleting NPC personalities...');
    const { error: npcError } = await supabaseServiceClient
      .from('npc_personalities')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (npcError) throw npcError;
    
    console.log('Deleting combat encounters...');
    const { error: combatError } = await supabaseServiceClient
      .from('combat_encounters')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (combatError) throw combatError;
    
    console.log('Deleting dungeon content...');
    const { error: dungeonError } = await supabaseServiceClient
      .from('dungeon_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (dungeonError) throw dungeonError;
    
    // World data
    console.log('Deleting world roads...');
    const { error: roadError } = await supabaseServiceClient
      .from('world_roads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (roadError) throw roadError;
    
    console.log('Deleting character locations...');
    const { error: locError } = await supabaseServiceClient
      .from('character_locations')
      .delete()
      .neq('character_id', '00000000-0000-0000-0000-000000000000');
    if (locError) throw locError;
    
    console.log('Deleting maps...');
    const { error: mapError } = await supabaseServiceClient
      .from('maps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (mapError) throw mapError;
    
    // Worker state
    console.log('Resetting worker jobs...');
    const { error: jobError } = await supabaseServiceClient
      .from('worker_jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (jobError) throw jobError;
    
    console.log('Resetting worker metrics...');
    const { error: metricError } = await supabaseServiceClient
      .from('worker_metrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (metricError) throw metricError;
    
    // Verify
    console.log('\n📊 Verification:');
    const { count: charCount } = await supabaseServiceClient
      .from('characters')
      .select('*', { count: 'exact', head: true });
    console.log(`Characters: ${charCount} ✓`);
    
    const { count: npcCount } = await supabaseServiceClient
      .from('npc_personalities')
      .select('*', { count: 'exact', head: true });
    console.log(`NPCs: ${npcCount} ✓`);
    
    const { count: questCount } = await supabaseServiceClient
      .from('quest_templates')
      .select('*', { count: 'exact', head: true });
    console.log(`Quests: ${questCount} ✓`);
    
    const { count: mapCount } = await supabaseServiceClient
      .from('maps')
      .select('*', { count: 'exact', head: true });
    console.log(`Maps: ${mapCount} ✓`);
    
    const { count: jobCount } = await supabaseServiceClient
      .from('worker_jobs')
      .select('*', { count: 'exact', head: true });
    console.log(`Jobs: ${jobCount} ✓`);
    
    console.log('\n✅ All content cleared! System ready for regeneration.');
    process.exit(0);
    
  } catch (err: any) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

clearAllContent();
