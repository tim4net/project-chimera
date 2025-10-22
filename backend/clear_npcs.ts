import { supabaseServiceClient } from './src/services/supabaseClient';

async function clearNPCs() {
  console.log('Clearing all NPCs...');
  
  // Delete from world_npcs
  const { count: npcCount, error: npcError } = await supabaseServiceClient
    .from('world_npcs')
    .delete()
    .neq('id', ''); // Delete all records
  
  if (npcError) {
    console.error('Error deleting world_npcs:', npcError);
  } else {
    console.log(`Deleted ${npcCount} NPCs from world_npcs`);
  }

  // Delete from character_npc_reputation
  const { count: repCount, error: repError } = await supabaseServiceClient
    .from('character_npc_reputation')
    .delete()
    .neq('id', '');
  
  if (repError) {
    console.error('Error deleting character_npc_reputation:', repError);
  } else {
    console.log(`Deleted ${repCount} reputation records`);
  }

  console.log('Data wipe complete!');
  process.exit(0);
}

clearNPCs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
