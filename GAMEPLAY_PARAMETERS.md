# Project Chimera: Gameplay Parameters Specification

This document defines the concrete parameters for map size, time systems, and gameplay mechanics for the MVP.

---

## WORLD

### World Name

The world of Project Chimera is named **Nuaibria**.

---

## MAP SYSTEM

### World Scale & Size

**World Grid**:
- **Type**: Infinite chunk-based procedural generation
- **Chunk Size**: 64x64 tiles per chunk
- **Active Chunks**: Load 3x3 chunks around player (9 chunks = 192x192 tiles visible)
- **Coordinate System**: Signed integers (x, y) where (0,0) is world origin
- **Tile Scale**: 1 tile = 1 kilometer in-game distance

**Rendering**:
- **Viewport**: 32x32 tiles visible on screen at once
- **Zoom Levels**: 3 levels (close, medium, far)
- **API Response**: Return 48x48 tile area centered on player position

### Fog of War

**Visibility System**:
- **Unexplored**: Black/dark gray, no information
- **Explored**: Visible terrain and POIs, cached in database
- **Currently Visible**: Highlighted, 5-tile radius from character
- **Shared Vision**: Party members share fog of war in same region

**Exploration Tracking**:
```sql
CREATE TABLE explored_tiles (
  character_id UUID REFERENCES characters(id),
  world_seed TEXT,
  tile_x INTEGER,
  tile_y INTEGER,
  explored_at TIMESTAMP,
  PRIMARY KEY (character_id, tile_x, tile_y)
);
```

### Procedural Generation

**Biome Distribution** (by tile):
- Plains: 30%
- Forest: 25%
- Mountains: 15%
- Desert: 10%
- Swamp: 8%
- Tundra: 7%
- Special: 5% (magical zones, ruins)

**POI Density**:
- Settlement: 1 per 200 tiles (average)
- Dungeon: 1 per 150 tiles
- Camp/Shrine: 1 per 50 tiles
- Resource Node: 1 per 25 tiles
- Quest Marker: Dynamic (quest-driven)

**Starting Location**:
- New characters spawn at (0, 0) + random offset within 10 tiles
- Always spawn in "safe" biome (Plains or Forest)
- Within 20 tiles of a starting settlement ("Wayrest Haven")

---

## TIME SYSTEM

### Real-Time to Game-Time Mapping

**Time Conversion**:
- **1 real-world minute = 10 in-game minutes**
- **1 real-world hour = 10 in-game hours**
- **1 real-world day = 10 in-game days**

**Purpose**: Fast enough to feel dynamic, slow enough to not overwhelm

### Idle Phase Task Timers

**Travel** (per tile):
- **Plains/Roads**: 5 minutes real-time per tile
- **Forest**: 7 minutes per tile
- **Mountains**: 10 minutes per tile
- **Desert/Swamp**: 8 minutes per tile
- **On Road**: -50% time (faster travel)

**Scout** (area):
- **Duration**: 10 minutes real-time
- **Area**: Reveals 5-tile radius of Fog of War
- **Cooldown**: 5 minutes between scouts

**Other Idle Tasks** (Not in MVP):
- Craft: 15-60 minutes depending on item
- Forage: 20 minutes
- Rest: 30 minutes (restores HP)

### Active Phase Timing

**Turn Timer**:
- **Player Turn**: 5 minute real-time limit (async play)
- **Grace Period**: +2 minutes warning before auto-pass
- **Notification**: Discord ping when turn starts

**Resolution**:
- **Instant**: Choice made → AI generates outcome immediately
- **No waiting**: Next turn starts as soon as player chooses

### Daily Resets (Real-Time)

Based on player's timezone:
- **Portal Usage**: Resets at midnight local time
- **Daily Quests**: Refresh at midnight (not in MVP)
- **Login Bonuses**: First login each day (not in MVP)

---

## MOVEMENT & TRAVEL

### Travel Mechanics

**Pathfinding**:
- **Auto-path**: Click destination, character auto-travels
- **Background**: Travel happens while offline
- **Interrupts**: Random encounters trigger Active Phase (10% chance per tile)

**Movement Constraints**:
- **Stamina**: Characters can travel max 20 tiles before needing rest (not in MVP)
- **Speed**: Base speed from table above, modified by:
  - Mounted: +50% speed (not in MVP)
  - Encumbered: -25% speed (not in MVP)
  - Party: Slowest member's speed

**Distance Formula**:
```javascript
// Manhattan distance (no diagonal movement in MVP)
distance = Math.abs(target_x - current_x) + Math.abs(target_y - current_y)

// Travel time calculation
time_minutes = distance * tile_time_modifier[terrain_type]
```

### Scout Mechanics

**Scouting**:
- **Reveals**: 5-tile radius circle
- **Information**: Terrain, POIs, nearby enemies
- **Uses**:
  - Find safe path
  - Locate quest objectives
  - Avoid danger
- **Skill Check**: Perception (d20 + WIS modifier)
  - DC 10: Reveals basic terrain
  - DC 15: Reveals hidden POIs
  - DC 20: Reveals enemy patrol routes

---

## ENCOUNTER RATES

### Idle Phase (Travel)

**Encounter Chance** (per tile traveled):
- **Plains**: 8% chance
- **Forest**: 12% chance
- **Mountains**: 15% chance
- **Desert**: 10% chance
- **Road**: 3% chance

**Encounter Types**:
- Minor Combat: 60% (resolved in idle phase)
- Active Combat: 20% (triggers active phase)
- NPC Encounter: 10%
- Quest Hook: 5%
- Loot Find: 5%

### Active Phase Triggers

**Major Event Threshold**:
- **Critical Fail** on travel (roll 1 on d20)
- **Quest Location** reached
- **Story Event** location
- **Elite Enemy** territory
- **Player Choice** (scout result shows danger, player proceeds anyway)

---

## PROGRESSION RATES

### Experience Points

**XP Sources** (MVP):
- **Travel**: 1 XP per tile
- **Scout Success**: 5 XP
- **Minor Combat Win**: 10-25 XP (based on difficulty)
- **Active Phase Win**: 50-200 XP (based on encounter)
- **Quest Complete**: 100-500 XP (based on complexity)

**Level Thresholds** (5e Standard):
```
Level 2: 300 XP
Level 3: 900 XP
Level 4: 2,700 XP
Level 5: 6,500 XP
... (follow PHB)
```

**MVP Level Cap**: Level 5 (focus on early game)

### Loot Drop Rates

**Per Encounter**:
- **Gold**: 100% (amount scales with CR)
- **Consumable**: 40% (potions, scrolls)
- **Equipment**: 25% (weapons, armor)
- **Special**: 5% (unique items - not in MVP)

**Gold Formula**:
```
gold_dropped = enemy_CR × (10 + 1d20) × party_size_modifier
```

---

## DATABASE STORAGE IMPLICATIONS

### Map Data

**Chunk Caching Strategy**:
```sql
CREATE TABLE world_chunks (
  seed TEXT,
  chunk_x INTEGER,
  chunk_y INTEGER,
  generated_data JSONB, -- terrain, POIs, etc.
  generated_at TIMESTAMP,
  PRIMARY KEY (seed, chunk_x, chunk_y)
);

-- Expires after 7 days of no access
CREATE INDEX idx_chunks_age ON world_chunks(generated_at);
```

**Estimated Storage**:
- 1 chunk = ~5KB JSON
- Active game (100 chunks explored) = 500KB
- 1000 players = 500MB max

### Time-Series Data

**Active Tasks**:
```sql
CREATE TABLE active_idle_tasks (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  task_type TEXT, -- 'travel', 'scout'
  started_at TIMESTAMP,
  will_complete_at TIMESTAMP, -- calculated from duration
  destination_x INTEGER,
  destination_y INTEGER,
  status TEXT -- 'pending', 'complete', 'interrupted'
);

CREATE INDEX idx_tasks_completion ON active_idle_tasks(will_complete_at);
```

**Background Processor**:
- Cron job every 1 minute
- Query tasks where `will_complete_at <= NOW()`
- Resolve task, call LLM, update character
- Create journal entry
- Check for Active Phase trigger

---

## UI/UX PARAMETERS

### Map Viewport

**Canvas Size**:
- **Desktop**: 1200x800 pixels (32x32 tiles at 25px per tile)
- **Mobile**: Responsive, min 600x400 pixels
- **Max Zoom**: 50px per tile (16x16 tiles visible)
- **Min Zoom**: 10px per tile (80x80 tiles visible)

**Performance**:
- Render only visible tiles + 2-tile buffer
- Use canvas for map, DOM for UI overlay
- Lazy load tile textures
- Cache rendered chunks

### Update Frequency

**Real-Time Subscriptions** (via Supabase Realtime):
- Character position: 500ms throttle
- Journal entries: Instant
- Active phase events: Instant
- Idle task completion: 1-minute poll + realtime notification

**API Polling** (fallback):
- Task status: Every 30 seconds
- Map updates: On position change only

---

## IMPLEMENTATION CONSTANTS

### Configuration File: `shared/config/gameplay.ts`

```typescript
export const GAMEPLAY_CONFIG = {
  // Map
  CHUNK_SIZE: 64,
  VIEWPORT_CHUNKS: 3,
  VIEWPORT_TILES: 32,
  TILE_SCALE_KM: 1,
  FOG_VISION_RADIUS: 5,

  // Time (minutes in real-time)
  TIME_MULTIPLIER: 10, // 1 real min = 10 game min
  TRAVEL_TIME_PLAINS: 5,
  TRAVEL_TIME_FOREST: 7,
  TRAVEL_TIME_MOUNTAINS: 10,
  TRAVEL_TIME_DESERT: 8,
  TRAVEL_TIME_ROAD_MODIFIER: 0.5,
  SCOUT_DURATION: 10,
  SCOUT_COOLDOWN: 5,
  ACTIVE_PHASE_TURN_TIMER: 5,

  // Encounters
  ENCOUNTER_RATE_PLAINS: 0.08,
  ENCOUNTER_RATE_FOREST: 0.12,
  ENCOUNTER_RATE_MOUNTAINS: 0.15,
  ENCOUNTER_RATE_DESERT: 0.10,
  ENCOUNTER_RATE_ROAD: 0.03,

  // Progression
  XP_PER_TILE: 1,
  XP_SCOUT: 5,
  XP_MINOR_COMBAT: 15,
  MVP_LEVEL_CAP: 5,

  // POI Density (1 per X tiles)
  POI_SETTLEMENT: 200,
  POI_DUNGEON: 150,
  POI_CAMP: 50,
  POI_RESOURCE: 25,

  // Starting position
  SPAWN_ORIGIN_X: 0,
  SPAWN_ORIGIN_Y: 0,
  SPAWN_RADIUS: 10,
};
```

---

## BALANCING NOTES

### Why These Values?

**5-minute travel per tile**:
- Typical session: 1 hour = 12 tiles traveled
- Feels like progress without being instant
- Offline: 8 hours AFK = 96 tiles (meaningful distance)

**Chunk-based infinite world**:
- No artificial boundaries
- Scales to any number of players
- Manageable storage (cache active chunks only)
- Procedural generation spreads server load

**10-minute game time multiplier**:
- Day/night cycle: 2.4 real hours = 1 game day
- Feels dynamic without being frantic
- Portal daily cooldown still meaningful

**10% encounter rate**:
- Not too grindy (90% peaceful travel)
- Keeps travel interesting
- Can be modified by difficulty settings

---

## FUTURE EXPANSION (Post-MVP)

### Features to Add

**Map Enhancements**:
- Weather effects (slow travel in storms)
- Seasons (affect biome difficulty)
- Territorial control (faction-owned regions)
- Player-built structures (visible on map)

**Time Mechanics**:
- Day/night cycle with visual effects
- Time-of-day events (night ambushes more common)
- Seasonal events
- Age mechanics (long-term campaigns)

**Movement**:
- Mounts (horses, griffons)
- Teleportation spells
- Waypoint fast travel
- Group travel formations

---

## TESTING & TUNING

### Metrics to Monitor

**Engagement**:
- Average session length
- Tiles traveled per session
- Idle vs Active phase ratio
- Quest completion rate

**Balance**:
- Encounter frequency (should feel right, not grindy)
- Travel time satisfaction
- Level progression curve
- Gold/loot acquisition rate

### Tunable Parameters

Can be adjusted via config without code changes:
- All time values (TRAVEL_TIME_*)
- Encounter rates
- XP rewards
- Fog of War radius
- View distance

**Recommendation**: Start with these values, collect metrics, iterate monthly.

---

## IMPLEMENTATION PRIORITY

### Phase 1 (MVP): Core Parameters
- ✅ Map: Tile-based with coordinates
- ✅ Travel: Time-based background tasks
- ✅ Fog of War: Simple revealed/unrevealed
- ⏳ Scout: Area reveal mechanic

### Phase 2 (Post-MVP): Enhanced Systems
- Day/night cycle
- Weather effects
- Seasonal content
- Advanced pathfinding

### Phase 3 (Long-term): Complex Features
- Player structures
- Territorial control
- Mount system
- Dynamic world events

---

## CODE INTEGRATION

### Backend Implementation

**Travel Task Processor** (`backend/src/services/travelProcessor.ts`):
```typescript
import { GAMEPLAY_CONFIG } from '../../shared/config/gameplay';

export async function processTravelTask(task: IdleTask) {
  const distance = Math.abs(task.destination_x - task.start_x) +
                   Math.abs(task.destination_y - task.start_y);

  const terrain = await getTerrainType(task.current_x, task.current_y);
  const baseTime = GAMEPLAY_CONFIG[`TRAVEL_TIME_${terrain.toUpperCase()}`];
  const travelTime = distance * baseTime;

  // Check if task should complete
  const elapsed = Date.now() - task.started_at;
  if (elapsed >= travelTime * 60 * 1000) {
    await resolveTravelTask(task);
  }
}
```

**Map Generator** (`backend/src/services/mapGenerator.ts`):
```typescript
export function generateChunk(seed: string, chunkX: number, chunkY: number) {
  const rng = seedrandom(seed + chunkX + chunkY);
  const tiles = [];

  for (let x = 0; x < GAMEPLAY_CONFIG.CHUNK_SIZE; x++) {
    for (let y = 0; y < GAMEPLAY_CONFIG.CHUNK_SIZE; y++) {
      const worldX = chunkX * GAMEPLAY_CONFIG.CHUNK_SIZE + x;
      const worldY = chunkY * GAMEPLAY_CONFIG.CHUNK_SIZE + y;

      tiles.push({
        x: worldX,
        y: worldY,
        terrain: generateTerrain(rng, worldX, worldY),
        poi: generatePOI(rng, worldX, worldY),
      });
    }
  }

  return tiles;
}
```

### Frontend Implementation

**Map Component** (`frontend/src/components/GameMap.tsx`):
```typescript
export function GameMap({ characterPosition, seed }) {
  const viewportSize = GAMEPLAY_CONFIG.VIEWPORT_TILES;
  const centerX = characterPosition.x;
  const centerY = characterPosition.y;

  // Load tiles in viewport
  const tiles = useTiles({
    seed,
    minX: centerX - viewportSize / 2,
    maxX: centerX + viewportSize / 2,
    minY: centerY - viewportSize / 2,
    maxY: centerY + viewportSize / 2,
  });

  return (
    <MapCanvas
      tiles={tiles}
      characterPosition={characterPosition}
      viewportSize={viewportSize}
    />
  );
}
```

---

## PERFORMANCE CONSIDERATIONS

### Database Queries

**Optimizations**:
- Index on `(tile_x, tile_y)` for position queries
- Index on `explored_at` for fog of war cleanup
- JSONB indexes on chunk data for POI searches
- Spatial database extension (PostGIS) for advanced queries (optional)

**Query Example**:
```sql
-- Get visible tiles (with fog of war check)
SELECT
  w.tile_x,
  w.tile_y,
  w.terrain,
  w.poi,
  e.explored_at IS NOT NULL as is_explored
FROM world_chunks w
LEFT JOIN explored_tiles e ON (
  e.character_id = $1
  AND e.tile_x = w.tile_x
  AND e.tile_y = w.tile_y
)
WHERE w.tile_x BETWEEN $2 AND $3
  AND w.tile_y BETWEEN $4 AND $5
  AND w.seed = $6;
```

### Client Performance

**Rendering Optimization**:
- Canvas-based rendering (not DOM per tile)
- Tile sprite atlas (single image, multiple tiles)
- Viewport culling (only render visible)
- Dirty rectangle rendering (only update changed tiles)
- Offscreen canvas for fog of war layer

**Target Performance**:
- 60 FPS at 32x32 viewport
- <100ms tile load time
- <50ms position update

---

## TESTING VALUES

### Development Mode Overrides

For faster testing, create `.env.development`:
```bash
# Accelerated time for testing
TRAVEL_TIME_MULTIPLIER=0.1  # 10x faster (30 seconds per tile)
ENCOUNTER_RATE_MULTIPLIER=5.0  # 5x more encounters
SCOUT_DURATION=60  # 1 minute instead of 10
XP_MULTIPLIER=10.0  # Level up faster for testing

# Smaller world for testing
CHUNK_SIZE=16
VIEWPORT_TILES=16
```

### Test Scenarios

**Scenario 1: Basic Travel**
- Start at (0, 0)
- Travel to (5, 5) - 10 tiles
- Expected: 50 minutes in plains
- Should have ~1 encounter (10 × 0.08 = 80%)

**Scenario 2: Scout & Explore**
- Scout at (0, 0)
- Should reveal (−5,−5) to (5,5) = 121 tiles
- Takes 10 minutes
- Awards 5 XP

**Scenario 3: Active Phase**
- Travel triggers encounter (RNG)
- Turn timer: 5 minutes
- Player makes choice
- Outcome resolves immediately
- Return to idle phase

---

## SUMMARY

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Tile Scale** | 1 km | Manageable world scale |
| **Travel Time** | 5-10 min/tile | Balance progress & engagement |
| **Scout Duration** | 10 minutes | Quick enough for frequent use |
| **Fog Radius** | 5 tiles | Rewards scouting |
| **Encounter Rate** | 8-15% | Not grindy, keeps interesting |
| **XP per Tile** | 1 XP | Rewards exploration |
| **Level Cap (MVP)** | 5 | Focus on early game |
| **Chunk Size** | 64×64 tiles | Performance vs detail |
| **Time Multiplier** | 10x | Dynamic feel |

These values create a **semi-idle experience** where:
- ✅ Meaningful progress in 30-60 minute sessions
- ✅ Worthwhile offline progression (8 hours AFK = significant distance)
- ✅ Active Phase events feel special (not too frequent)
- ✅ Exploration rewarded (XP + fog reveal)
- ✅ Scalable to many players (chunk-based)
