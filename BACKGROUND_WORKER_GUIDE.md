# Background Worker Guide

## Overview

The Background Worker is a containerized service that uses your Local LLM (GTX 1080) to generate game content asynchronously. It polls a job queue every **1 minute** and processes tasks where latency doesn't matter, saving you money on Gemini API calls.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  REAL-TIME (Player Chat)                        │
│  → Gemini Flash (fast, <2s response)            │
│  Cost: $2-5/month for 10-50 players             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  BACKGROUND (Pre-Generation)                    │
│  → Local LLM on GTX 1080 (slow but free)        │
│  → Job Queue System (polls every minute)        │
│  Cost: $0                                       │
└─────────────────────────────────────────────────┘
```

## What It Generates

The worker maintains content pools, generating new content when pools run low:

| Content Type | Min Pool Size | Batch Size | Use Case |
|--------------|---------------|------------|----------|
| **Quests** | 20 | 10 | Player asks for work |
| **NPCs** | 30 | 15 | Random encounters |
| **POIs** | 50/campaign | 25 | World exploration |
| **Combat Encounters** | 30 | 15 | Travel/exploration fights |
| **Dungeons** | 10 | 5 | Mini-adventure content |

## Job Queue System

### How It Works

1. **Poll**: Worker checks `worker_jobs` table every 60 seconds
2. **Cleanup**: Resets any jobs stuck in 'running' for > 30 minutes
3. **Fetch**: Grabs highest priority **pending** job (never 'running')
4. **Lock**: Immediately marks job as 'running' to prevent duplicate processing
5. **Process**: Executes job using Local LLM (may take 5-10 minutes - that's OK!)
6. **Store**: Saves generated content to database
7. **Complete**: Marks job as 'completed' or 'failed'
8. **Repeat**: Checks for next job

**Important:** Jobs are NEVER processed twice. Even if a job takes 10 minutes, subsequent poll cycles will skip it because it's marked as 'running'.

### Job Types

```sql
-- Check all content pools (recommended hourly)
SELECT enqueue_worker_job('check_all_pools', NULL, 1);

-- Generate specific content
SELECT enqueue_worker_job('generate_quests', '{"count": 20, "level_range": [1, 10]}', 5);
SELECT enqueue_worker_job('generate_npcs', '{"count": 15}', 5);
SELECT enqueue_worker_job('generate_encounters', '{"count": 10, "cr_range": [1, 5]}', 5);
SELECT enqueue_worker_job('generate_dungeons', '{"count": 5}', 5);
SELECT enqueue_worker_job('generate_pois', '{"campaign_seed": "abc123", "count": 25}', 5);
SELECT enqueue_worker_job('summarize_session', '{"character_id": "uuid", "message_count": 30}', 5);
```

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration to Supabase
psql $DATABASE_URL < database/migrations/005_content_pool_tables.sql

# Or via Supabase Dashboard:
# - Go to SQL Editor
# - Copy/paste migration content
# - Run
```

This creates:
- `worker_jobs` table (job queue)
- `quest_templates` table (quest pool)
- `npc_personalities` table (NPC pool)
- `combat_encounters` table (encounter pool)
- `dungeon_content` table (dungeon pool)
- Helper functions (`enqueue_worker_job`, `schedule_pool_check`)

### 2. Start the Worker Container

```bash
# Using docker-compose
podman-compose up -d worker

# Check logs
podman-compose logs -f worker

# Check health
curl http://localhost:3002/health
```

### 3. Schedule Recurring Pool Checks

**Option A: From Application Code** (Recommended)
```typescript
// In your backend startup or cron endpoint
import { supabaseServiceClient } from './services/supabaseClient';

// Schedule hourly pool check
setInterval(async () => {
  await supabaseServiceClient.rpc('schedule_pool_check');
}, 60 * 60 * 1000); // Every hour
```

**Option B: PostgreSQL Cron Extension** (Production)
```sql
-- Install pg_cron extension (if available)
SELECT cron.schedule(
  'hourly-pool-check',
  '0 * * * *', -- Every hour
  $$SELECT schedule_pool_check()$$
);
```

**Option C: System Cron**
```bash
# Add to crontab
0 * * * * psql $DATABASE_URL -c "SELECT schedule_pool_check();"
```

## Monitoring

### Health Check

```bash
curl http://localhost:3002/health

# Response:
{
  "status": "success",
  "lastRunTime": "2025-01-20T10:30:00Z",
  "lastRunError": null,
  "workerInterval": "polls every 60s",
  "uptime": 3600
}
```

### View Job Queue

```sql
-- Pending jobs
SELECT id, job_type, priority, created_at
FROM worker_jobs
WHERE status = 'pending'
ORDER BY priority, created_at;

-- Recent completed jobs
SELECT job_type, status, started_at, completed_at, result
FROM worker_jobs
WHERE status IN ('completed', 'failed')
ORDER BY completed_at DESC
LIMIT 10;
```

### Check Content Pools

```sql
-- Quest pool
SELECT COUNT(*) as available FROM quest_templates WHERE used = FALSE;

-- NPC pool
SELECT COUNT(*) as available FROM npc_personalities WHERE used = FALSE;

-- Encounter pool
SELECT COUNT(*) as available FROM combat_encounters WHERE used = FALSE;

-- Dungeon pool
SELECT COUNT(*) as available FROM dungeon_content WHERE used = FALSE;
```

## Using Pre-Generated Content

### Claiming a Quest

```sql
-- Atomically claim a quest for a character
SELECT * FROM claim_quest_from_pool('character-uuid', 1, 5);

-- Returns:
{
  "quest_id": "uuid",
  "title": "The Goblin Menace",
  "description": "Goblins are raiding the village...",
  "objectives": [{"type": "kill_enemies", "target": "goblins", "count": 5}],
  "xp_reward": 100,
  "gold_reward": 50
}
```

### Claiming an NPC

```sql
-- Atomically claim an NPC for a location
SELECT * FROM claim_npc_from_pool('campaign-seed', '{"x": 100, "y": 200}');

-- Returns NPC personality ready to roleplay
```

### Claiming an Encounter

```typescript
// In your backend code
const { data: encounter } = await supabaseServiceClient
  .from('combat_encounters')
  .select('*')
  .eq('used', false)
  .eq('location_type', 'forest')
  .gte('challenge_rating', playerLevel * 0.5)
  .lte('challenge_rating', playerLevel * 1.5)
  .order('random()')
  .limit(1)
  .single();

if (encounter) {
  // Mark as used
  await supabaseServiceClient
    .from('combat_encounters')
    .update({
      used: true,
      used_at: new Date().toISOString(),
      spawned_at_location: { x, y, campaign_seed }
    })
    .eq('id', encounter.id);

  // Use encounter.enemies for combat
  // Use encounter.description for narrative
}
```

## Performance Expectations

### Generation Times (GTX 1080)

| Task | Items | Time | Acceptable? |
|------|-------|------|-------------|
| Quests | 10 | ~60-90s | ✅ (background) |
| NPCs | 15 | ~90-120s | ✅ (background) |
| Encounters | 15 | ~90-150s | ✅ (background) |
| Dungeons | 5 | ~60-100s | ✅ (background) |
| Session Summary | 1 | ~10-15s | ✅ (after logout) |

**Total for full pool check: 6-10 minutes** (acceptable since it's background)

## Cost Savings

### Without Background Worker
- Every quest = Gemini API call = $0.0002-0.0005
- 100 quests = $0.02-0.05
- Plus NPCs, encounters, dungeons = $0.10-0.20/month

### With Background Worker
- All pre-generation = FREE (Local LLM)
- Only real-time chat uses Gemini = $2-5/month
- **Savings: ~$0.10-0.20/month** (5-10% cost reduction)

At scale (1000 players):
- Without: ~$50/month
- With: ~$45/month
- **Savings: $5/month** (10% reduction)

## Troubleshooting

### Worker Not Processing Jobs

```bash
# Check if worker is running
podman-compose ps

# Check logs
podman-compose logs worker

# Restart worker
podman-compose restart worker
```

### Local LLM Connection Errors

```bash
# Verify Local LLM is accessible
curl http://192.168.42.145:1234/v1/models

# Check env var in worker
podman-compose exec worker env | grep LOCAL_LLM_ENDPOINT
```

### Jobs Stuck in "running"

```sql
-- Reset stuck jobs (older than 30 minutes)
UPDATE worker_jobs
SET status = 'failed',
    error_message = 'Job timeout - reset by admin'
WHERE status = 'running'
  AND started_at < NOW() - INTERVAL '30 minutes';
```

### Pools Not Refilling

```sql
-- Manually trigger pool check
SELECT enqueue_worker_job('check_all_pools', NULL, 1);

-- Check if job was processed
SELECT * FROM worker_jobs
WHERE job_type = 'check_all_pools'
ORDER BY created_at DESC
LIMIT 5;
```

## Configuration

### Environment Variables

```bash
# Worker polling interval (milliseconds)
# Default: 60000 (1 minute)
WORKER_POLL_INTERVAL_MS=60000

# Worker health check port
WORKER_PORT=3002

# Local LLM endpoint
LOCAL_LLM_ENDPOINT=http://192.168.42.145:1234/v1
```

### Tuning Pool Sizes

Edit `backend/src/workers/backgroundWorker.ts`:

```typescript
// Increase for high-traffic servers
const MIN_QUEST_POOL_SIZE = 50; // Default: 20
const MIN_NPC_POOL_SIZE = 60;   // Default: 30
const MIN_ENCOUNTER_POOL_SIZE = 60; // Default: 30
```

## Best Practices

1. **Schedule regular pool checks** (hourly) to keep pools stocked
2. **Monitor pool sizes** to avoid running empty
3. **Use priority** for urgent jobs (1=highest, 10=lowest)
4. **Clean up old completed jobs** periodically
5. **Set up alerts** if pools drop below 50% capacity

## Next Steps

- [ ] Run database migration
- [ ] Start worker container
- [ ] Schedule hourly pool check
- [ ] Monitor first generation cycle
- [ ] Verify content quality
- [ ] Integrate claim functions into gameplay

---

**Questions? Check logs at:** `podman-compose logs -f worker`
