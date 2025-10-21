/**
 * @file Background Worker - Containerized Content Generation Service
 *
 * Runs in its own container, continuously monitoring and generating content
 * using Local LLM (GTX 1080) for async tasks where latency doesn't matter.
 *
 * Architecture:
 * - Runs every N minutes (configurable via env: WORKER_INTERVAL_MINUTES)
 * - Monitors content pools (quests, NPCs, POIs)
 * - Generates only when pools are low (smart, not wasteful)
 * - Uses Local LLM (free, but slow 4-8s - acceptable for background)
 *
 * Health: Exposes /health endpoint on port 3002 for container monitoring
 */

import express from 'express';
import {
  generateQuestTemplatesBackground,
  generatePOIDescriptionsBackground,
  generateNPCPersonalitiesBackground,
  summarizeSessionBackground,
  generateCombatEncountersBackground,
  generateDungeonContentBackground,
} from '../services/backgroundTasks';
import { supabaseServiceClient } from '../services/supabaseClient';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WORKER_POLL_INTERVAL_MS = 60000; // Poll every 1 minute
const WORKER_PORT = parseInt(process.env.WORKER_PORT || '3002', 10);

// Content pool thresholds (generate when below these numbers)
const MIN_QUEST_POOL_SIZE = 20;
const MIN_NPC_POOL_SIZE = 30;
const MIN_POI_POOL_SIZE = 50;
const MIN_ENCOUNTER_POOL_SIZE = 30;
const MIN_DUNGEON_POOL_SIZE = 10;

// Batch sizes (how many to generate when pool is low)
const QUEST_BATCH_SIZE = 10;
const NPC_BATCH_SIZE = 15;
const POI_BATCH_SIZE = 25;
const ENCOUNTER_BATCH_SIZE = 15;
const DUNGEON_BATCH_SIZE = 5;

// ============================================================================
// HEALTH CHECK SERVER
// ============================================================================

const app = express();

let lastRunTime: Date | null = null;
let lastRunStatus: 'success' | 'error' | 'running' = 'success';
let lastRunError: string | null = null;

app.get('/health', (req, res) => {
  const status = lastRunStatus === 'error' ? 500 : 200;
  res.status(status).json({
    status: lastRunStatus,
    lastRunTime: lastRunTime?.toISOString(),
    lastRunError,
    workerInterval: `polls every ${WORKER_POLL_INTERVAL_MS / 1000}s`,
    uptime: process.uptime(),
  });
});

app.listen(WORKER_PORT, () => {
  console.log(`[BackgroundWorker] Health check server running on port ${WORKER_PORT}`);
  console.log(`[BackgroundWorker] Access at http://localhost:${WORKER_PORT}/health`);
});

// ============================================================================
// CONTENT POOL MONITORING
// ============================================================================

/**
 * Check how many unused quests are available
 */
async function getQuestPoolSize(): Promise<number> {
  try {
    const { count, error } = await supabaseServiceClient
      .from('quest_templates')
      .select('*', { count: 'exact', head: true })
      .eq('used', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[BackgroundWorker] Error checking quest pool:', error);
    return 0;
  }
}

/**
 * Check how many unused NPCs are available
 */
async function getNPCPoolSize(): Promise<number> {
  try {
    const { count, error } = await supabaseServiceClient
      .from('npc_personalities')
      .select('*', { count: 'exact', head: true })
      .eq('used', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[BackgroundWorker] Error checking NPC pool:', error);
    return 0;
  }
}

/**
 * Check how many POIs need descriptions per campaign
 */
async function getPOIPoolStatus(): Promise<{ campaign: string; needed: number }[]> {
  try {
    // Get active campaigns
    const { data: campaigns, error: campaignError } = await supabaseServiceClient
      .from('characters')
      .select('campaign_seed')
      .not('campaign_seed', 'is', null);

    if (campaignError) throw campaignError;

    const uniqueCampaigns = [...new Set(campaigns?.map(c => c.campaign_seed) || [])];
    const poiStatus: { campaign: string; needed: number }[] = [];

    for (const campaign of uniqueCampaigns) {
      const { count } = await supabaseServiceClient
        .from('world_pois')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_seed', campaign);

      const currentCount = count || 0;
      if (currentCount < MIN_POI_POOL_SIZE) {
        poiStatus.push({
          campaign: campaign as string,
          needed: MIN_POI_POOL_SIZE - currentCount,
        });
      }
    }

    return poiStatus;
  } catch (error) {
    console.error('[BackgroundWorker] Error checking POI pools:', error);
    return [];
  }
}

// ============================================================================
// SMART TASK EXECUTION
// ============================================================================

/**
 * Generate quests if pool is low
 */
async function maybeGenerateQuests(): Promise<void> {
  const poolSize = await getQuestPoolSize();
  console.log(`[BackgroundWorker] Quest pool size: ${poolSize}`);

  if (poolSize < MIN_QUEST_POOL_SIZE) {
    const needed = MIN_QUEST_POOL_SIZE - poolSize;
    const toGenerate = Math.min(needed, QUEST_BATCH_SIZE);

    console.log(`[BackgroundWorker] 🎯 Quest pool low! Generating ${toGenerate} quests...`);

    const quests = await generateQuestTemplatesBackground(toGenerate, [1, 10]);

    // Store in database with 'used' flag
    for (const quest of quests) {
      await supabaseServiceClient.from('quest_templates').insert({
        title: quest.title,
        description: quest.description,
        objectives: quest.objectives,
        xp_reward: quest.rewards.xp,
        gold_reward: quest.rewards.gold,
        used: false,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`[BackgroundWorker] ✅ Generated ${quests.length} quests`);
  } else {
    console.log(`[BackgroundWorker] ✓ Quest pool sufficient (${poolSize}/${MIN_QUEST_POOL_SIZE})`);
  }
}

/**
 * Generate NPCs if pool is low
 */
async function maybeGenerateNPCs(): Promise<void> {
  const poolSize = await getNPCPoolSize();
  console.log(`[BackgroundWorker] NPC pool size: ${poolSize}`);

  if (poolSize < MIN_NPC_POOL_SIZE) {
    const needed = MIN_NPC_POOL_SIZE - poolSize;
    const toGenerate = Math.min(needed, NPC_BATCH_SIZE);

    console.log(`[BackgroundWorker] 🎯 NPC pool low! Generating ${toGenerate} NPCs...`);

    const npcs = await generateNPCPersonalitiesBackground(toGenerate);

    // Store in database
    for (const npc of npcs) {
      await supabaseServiceClient.from('npc_personalities').insert({
        name: npc.name,
        race: npc.race,
        occupation: npc.occupation,
        personality: npc.personality,
        quirk: npc.quirk,
        secret: npc.secret,
        used: false,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`[BackgroundWorker] ✅ Generated ${npcs.length} NPCs`);
  } else {
    console.log(`[BackgroundWorker] ✓ NPC pool sufficient (${poolSize}/${MIN_NPC_POOL_SIZE})`);
  }
}

/**
 * Generate POIs for campaigns that need them
 */
async function maybeGeneratePOIs(): Promise<void> {
  const poiStatus = await getPOIPoolStatus();

  if (poiStatus.length === 0) {
    console.log(`[BackgroundWorker] ✓ All campaigns have sufficient POIs`);
    return;
  }

  for (const { campaign, needed } of poiStatus) {
    const toGenerate = Math.min(needed, POI_BATCH_SIZE);

    console.log(`[BackgroundWorker] 🎯 Campaign ${campaign} needs POIs! Generating ${toGenerate}...`);

    await generatePOIDescriptionsBackground(campaign, toGenerate);

    console.log(`[BackgroundWorker] ✅ Generated ${toGenerate} POIs for ${campaign}`);
  }
}

/**
 * Generate combat encounters if pool is low
 */
async function maybeGenerateEncounters(): Promise<void> {
  try {
    const { count } = await supabaseServiceClient
      .from('combat_encounters')
      .select('*', { count: 'exact', head: true })
      .eq('used', false);

    const poolSize = count || 0;
    console.log(`[BackgroundWorker] Encounter pool size: ${poolSize}`);

    if (poolSize < MIN_ENCOUNTER_POOL_SIZE) {
      const needed = MIN_ENCOUNTER_POOL_SIZE - poolSize;
      const toGenerate = Math.min(needed, ENCOUNTER_BATCH_SIZE);

      console.log(`[BackgroundWorker] 🎯 Encounter pool low! Generating ${toGenerate} encounters...`);

      const encounters = await generateCombatEncountersBackground(toGenerate, [1, 5]);

      // Store in database
      for (const encounter of encounters) {
        await supabaseServiceClient.from('combat_encounters').insert({
          name: encounter.name,
          description: encounter.description,
          challenge_rating: encounter.challenge_rating,
          enemies: encounter.enemies,
          loot_tier: encounter.loot_tier,
          location_type: encounter.location_type,
          used: false,
          created_at: new Date().toISOString(),
        });
      }

      console.log(`[BackgroundWorker] ✅ Generated ${encounters.length} combat encounters`);
    } else {
      console.log(`[BackgroundWorker] ✓ Encounter pool sufficient (${poolSize}/${MIN_ENCOUNTER_POOL_SIZE})`);
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error generating encounters:', error);
  }
}

/**
 * Generate dungeon content if pool is low
 */
async function maybeGenerateDungeons(): Promise<void> {
  try {
    const { count } = await supabaseServiceClient
      .from('dungeon_content')
      .select('*', { count: 'exact', head: true })
      .eq('used', false);

    const poolSize = count || 0;
    console.log(`[BackgroundWorker] Dungeon pool size: ${poolSize}`);

    if (poolSize < MIN_DUNGEON_POOL_SIZE) {
      const needed = MIN_DUNGEON_POOL_SIZE - poolSize;
      const toGenerate = Math.min(needed, DUNGEON_BATCH_SIZE);

      console.log(`[BackgroundWorker] 🎯 Dungeon pool low! Generating ${toGenerate} dungeons...`);

      const dungeons = await generateDungeonContentBackground(toGenerate);

      // Store in database
      for (const dungeon of dungeons) {
        await supabaseServiceClient.from('dungeon_content').insert({
          name: dungeon.name,
          description: dungeon.description,
          room_count: dungeon.rooms,
          used: false,
          created_at: new Date().toISOString(),
        });
      }

      console.log(`[BackgroundWorker] ✅ Generated ${dungeons.length} dungeons`);
    } else {
      console.log(`[BackgroundWorker] ✓ Dungeon pool sufficient (${poolSize}/${MIN_DUNGEON_POOL_SIZE})`);
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error generating dungeons:', error);
  }
}

/**
 * Summarize completed sessions for offline players
 */
async function maybeGenerateSessionSummaries(): Promise<void> {
  try {
    // Find characters with recent activity but no summary in last 4 hours
    const { data: recentChars, error } = await supabaseServiceClient
      .from('dm_conversations')
      .select('character_id')
      .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error || !recentChars) return;

    const uniqueChars = [...new Set(recentChars.map(c => c.character_id))];

    console.log(`[BackgroundWorker] Checking ${uniqueChars.length} characters for session summaries...`);

    for (const characterId of uniqueChars) {
      // Check if already has recent summary
      const { data: existingSummary } = await supabaseServiceClient
        .from('journal_entries')
        .select('id')
        .eq('character_id', characterId)
        .eq('entry_type', 'session_summary')
        .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
        .single();

      if (!existingSummary) {
        console.log(`[BackgroundWorker] 🎯 Generating session summary for ${characterId}...`);
        await summarizeSessionBackground(characterId, 30);
      }
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error generating session summaries:', error);
  }
}

// ============================================================================
// JOB QUEUE PROCESSOR
// ============================================================================

interface WorkerJob {
  id: string;
  job_type: string;
  parameters: any;
  priority: number;
}

/**
 * Fetch and lock next pending job atomically (prevents race conditions)
 * Uses database RPC function with FOR UPDATE SKIP LOCKED for atomic operation
 */
async function fetchNextJob(): Promise<WorkerJob | null> {
  try {
    // First, clean up any stuck jobs (running for > 30 minutes)
    await cleanupStuckJobs();

    // Atomically fetch and lock job using database function
    // This prevents multiple workers from grabbing the same job
    const { data, error } = await supabaseServiceClient.rpc('fetch_and_lock_job');

    if (error) {
      console.error('[BackgroundWorker] Error calling fetch_and_lock_job RPC:', error);
      return null;
    }

    // RPC returns an array, take first element (or null if empty)
    const job = (data && Array.isArray(data) && data.length > 0) ? data[0] : null;

    return job as WorkerJob | null;
  } catch (error) {
    console.error('[BackgroundWorker] Exception fetching job:', error);
    return null;
  }
}

/**
 * Clean up jobs that have been stuck in 'running' state for too long
 * This handles cases where worker crashed or job hung
 */
async function cleanupStuckJobs(): Promise<void> {
  const TIMEOUT_MINUTES = 30;
  const timeoutDate = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabaseServiceClient
      .from('worker_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: `Job timeout - exceeded ${TIMEOUT_MINUTES} minutes`,
      })
      .eq('status', 'running')
      .lt('started_at', timeoutDate)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      console.warn(`[BackgroundWorker] ⚠️  Cleaned up ${data.length} stuck job(s)`);
      data.forEach((job: any) => {
        console.warn(`[BackgroundWorker]   - ${job.job_type} (ID: ${job.id.substring(0, 8)}...)`);
      });
    }
  } catch (error) {
    console.error('[BackgroundWorker] Error cleaning up stuck jobs:', error);
  }
}

/**
 * Mark job as running
 */
async function markJobRunning(jobId: string): Promise<void> {
  await supabaseServiceClient
    .from('worker_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId);
}

/**
 * Mark job as completed with results
 */
async function markJobCompleted(jobId: string, result: any): Promise<void> {
  await supabaseServiceClient
    .from('worker_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      result,
    })
    .eq('id', jobId);
}

/**
 * Mark job as failed with error
 */
async function markJobFailed(jobId: string, error: string): Promise<void> {
  await supabaseServiceClient
    .from('worker_jobs')
    .update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: error,
    })
    .eq('id', jobId);
}

/**
 * Process a single job based on its type
 */
async function processJob(job: WorkerJob): Promise<any> {
  console.log(`[BackgroundWorker] 🔨 Processing job: ${job.job_type} (ID: ${job.id.substring(0, 8)}...)`);

  const params = job.parameters || {};

  switch (job.job_type) {
    case 'generate_quests':
      const count = params.count || QUEST_BATCH_SIZE;
      const levelRange = params.level_range || [1, 10];
      const quests = await generateQuestTemplatesBackground(count, levelRange);

      // Store in database
      for (const quest of quests) {
        await supabaseServiceClient.from('quest_templates').insert({
          title: quest.title,
          description: quest.description,
          objectives: quest.objectives,
          xp_reward: quest.rewards.xp,
          gold_reward: quest.rewards.gold,
          used: false,
        });
      }

      return { generated: quests.length };

    case 'generate_npcs':
      const npcCount = params.count || NPC_BATCH_SIZE;
      const npcs = await generateNPCPersonalitiesBackground(npcCount);

      for (const npc of npcs) {
        await supabaseServiceClient.from('npc_personalities').insert({
          name: npc.name,
          race: npc.race,
          occupation: npc.occupation,
          personality: npc.personality,
          quirk: npc.quirk,
          secret: npc.secret,
          used: false,
        });
      }

      return { generated: npcs.length };

    case 'generate_pois':
      const campaign = params.campaign_seed;
      const poiCount = params.count || POI_BATCH_SIZE;

      if (!campaign) throw new Error('campaign_seed required for POI generation');

      await generatePOIDescriptionsBackground(campaign, poiCount);
      return { generated: poiCount, campaign };

    case 'generate_encounters':
      const encounterCount = params.count || ENCOUNTER_BATCH_SIZE;
      const crRange = params.cr_range || [1, 5];
      const encounters = await generateCombatEncountersBackground(encounterCount, crRange);

      for (const encounter of encounters) {
        await supabaseServiceClient.from('combat_encounters').insert({
          name: encounter.name,
          description: encounter.description,
          challenge_rating: encounter.challenge_rating,
          enemies: encounter.enemies,
          loot_tier: encounter.loot_tier,
          location_type: encounter.location_type,
          used: false,
        });
      }

      return { generated: encounters.length };

    case 'generate_dungeons':
      const dungeonCount = params.count || DUNGEON_BATCH_SIZE;
      const dungeons = await generateDungeonContentBackground(dungeonCount);

      for (const dungeon of dungeons) {
        await supabaseServiceClient.from('dungeon_content').insert({
          name: dungeon.name,
          description: dungeon.description,
          room_count: dungeon.rooms,
          used: false,
        });
      }

      return { generated: dungeons.length };

    case 'summarize_session':
      const characterId = params.character_id;
      const messageCount = params.message_count || 20;

      if (!characterId) throw new Error('character_id required for session summary');

      await summarizeSessionBackground(characterId, messageCount);
      return { characterId };

    case 'check_all_pools':
      // Check all content pools and enqueue generation jobs if needed
      await maybeGenerateQuests();
      await maybeGenerateNPCs();
      await maybeGeneratePOIs();
      await maybeGenerateEncounters();
      await maybeGenerateDungeons();

      return { poolsChecked: 5 };

    default:
      throw new Error(`Unknown job type: ${job.job_type}`);
  }
}

/**
 * Main worker loop - polls for jobs every minute
 * SAFE: Only processes ONE job per cycle, preventing duplicate processing
 */
async function runWorkerCycle(): Promise<void> {
  lastRunTime = new Date();
  lastRunStatus = 'running';

  let currentJob: WorkerJob | null = null;

  try {
    // Atomically fetch and lock next job
    // Note: fetchNextJob() already marks the job as 'running' via RPC
    currentJob = await fetchNextJob();

    if (!currentJob) {
      // No jobs, wait quietly
      console.log(`[BackgroundWorker] ⏸️  No jobs in queue (checked at ${lastRunTime.toISOString()})`);
      lastRunStatus = 'success';
      return;
    }

    // Job is already marked as 'running' by the atomic fetch_and_lock_job RPC
    console.log('\n' + '='.repeat(80));
    console.log(`[BackgroundWorker] 🚀 Processing job: ${currentJob.job_type} (ID: ${currentJob.id.substring(0, 8)}...)`);
    console.log(`[BackgroundWorker]    Priority: ${currentJob.priority}, Status: running (locked)`);
    console.log('='.repeat(80));

    const startTime = Date.now();

    // Process the job (may take several minutes - that's OK!)
    const result = await processJob(currentJob);

    // Mark as completed
    await markJobCompleted(currentJob.id, result);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('='.repeat(80));
    console.log(`[BackgroundWorker] ✅ Job completed in ${duration}s`);
    console.log(`[BackgroundWorker]    Result: ${JSON.stringify(result).substring(0, 100)}`);
    console.log('='.repeat(80) + '\n');

    lastRunStatus = 'success';
    lastRunError = null;
  } catch (error) {
    lastRunStatus = 'error';
    lastRunError = error instanceof Error ? error.message : String(error);

    console.error('='.repeat(80));
    console.error('[BackgroundWorker] ❌ Error during job:', error);
    console.error('='.repeat(80) + '\n');

    // Mark job as failed if we have the job ID
    if (currentJob) {
      try {
        await markJobFailed(currentJob.id, lastRunError);
        console.error(`[BackgroundWorker] Job ${currentJob.id.substring(0, 8)}... marked as failed`);
      } catch (markError) {
        console.error('[BackgroundWorker] Failed to mark job as failed:', markError);
      }
    }
  }
}

/**
 * Start the background worker loop
 */
async function startWorker(): Promise<void> {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('║' + '  BACKGROUND WORKER STARTING (JOB QUEUE MODE)'.padEnd(78) + '║');
  console.log('║' + ' '.repeat(78) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('');
  console.log(`[BackgroundWorker] Using Local LLM at: ${process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1'}`);
  console.log(`[BackgroundWorker] Polling for jobs every ${WORKER_POLL_INTERVAL_MS / 1000}s`);
  console.log(`[BackgroundWorker] Health check: http://localhost:${WORKER_PORT}/health`);
  console.log('');
  console.log('[BackgroundWorker] 💡 To enqueue jobs, insert into worker_jobs table');
  console.log('[BackgroundWorker] 💡 Or call: SELECT enqueue_worker_job(\'check_all_pools\');');
  console.log('');

  // Schedule initial pool check
  try {
    await supabaseServiceClient.rpc('schedule_pool_check');
    console.log('[BackgroundWorker] ✓ Scheduled initial pool check job');
  } catch (error) {
    console.error('[BackgroundWorker] Failed to schedule initial job:', error);
  }

  console.log('');

  // Poll for jobs every minute
  setInterval(async () => {
    await runWorkerCycle();
  }, WORKER_POLL_INTERVAL_MS);

  // Also run immediately
  await runWorkerCycle();
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  console.log('\n[BackgroundWorker] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[BackgroundWorker] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// ============================================================================
// START
// ============================================================================

startWorker().catch(error => {
  console.error('[BackgroundWorker] Fatal error starting worker:', error);
  process.exit(1);
});
