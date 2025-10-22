/**
 * Task: Queue content regeneration jobs
 */

import { supabaseServiceClient } from '../services/supabaseClient';

async function queueRegeneration() {
  console.log('📋 Queueing content regeneration jobs...\n');
  
  try {
    // Queue pool check (highest priority)
    console.log('Enqueuing: check_all_pools (priority 1)');
    const job1 = await supabaseServiceClient.rpc('enqueue_worker_job', {
      p_job_type: 'check_all_pools',
      p_parameters: null,
      p_priority: 1
    });
    if (job1.error) throw job1.error;
    console.log(`  ✓ Created job: ${job1.data}\n`);
    
    // Queue quest generation
    console.log('Enqueuing: generate_quests (priority 2)');
    const job2 = await supabaseServiceClient.rpc('enqueue_worker_job', {
      p_job_type: 'generate_quests',
      p_parameters: { count: 50, level_min: 1, level_max: 10 },
      p_priority: 2
    });
    if (job2.error) throw job2.error;
    console.log(`  ✓ Created job: ${job2.data}\n`);
    
    // Queue NPC generation
    console.log('Enqueuing: generate_npcs (priority 3)');
    const job3 = await supabaseServiceClient.rpc('enqueue_worker_job', {
      p_job_type: 'generate_npcs',
      p_parameters: { count: 100 },
      p_priority: 3
    });
    if (job3.error) throw job3.error;
    console.log(`  ✓ Created job: ${job3.data}\n`);
    
    // Queue combat encounters
    console.log('Enqueuing: generate_encounters (priority 4)');
    const job4 = await supabaseServiceClient.rpc('enqueue_worker_job', {
      p_job_type: 'generate_encounters',
      p_parameters: { count: 50, cr_min: 0.25, cr_max: 5 },
      p_priority: 4
    });
    if (job4.error) throw job4.error;
    console.log(`  ✓ Created job: ${job4.data}\n`);
    
    // Queue dungeon generation
    console.log('Enqueuing: generate_dungeons (priority 5)');
    const job5 = await supabaseServiceClient.rpc('enqueue_worker_job', {
      p_job_type: 'generate_dungeons',
      p_parameters: { count: 20 },
      p_priority: 5
    });
    if (job5.error) throw job5.error;
    console.log(`  ✓ Created job: ${job5.data}\n`);
    
    // Verify jobs were created
    const { count } = await supabaseServiceClient
      .from('worker_jobs')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Queued ${count} regeneration jobs!`);
    console.log('Worker will process these in order (priority 1 = highest)');
    console.log('\nExpected timeline:');
    console.log('  • check_all_pools: ~5s');
    console.log('  • generate_quests: ~30-60s (50 quests @ 0.6-1.2s each)');
    console.log('  • generate_npcs: ~60-120s (100 NPCs @ 0.6-1.2s each)');
    console.log('  • generate_encounters: ~30-60s');
    console.log('  • generate_dungeons: ~20-40s');
    console.log('\nTotal: ~3-5 minutes\n');
    
    process.exit(0);
    
  } catch (err: any) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

queueRegeneration();
