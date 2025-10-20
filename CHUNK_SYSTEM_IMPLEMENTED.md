# Chunk System - Implemented!

## What's Complete

### 1. Database Schema
- `characters` table has `chunk_x`, `chunk_y` columns
- position_x, position_y now LOCAL (within chunk, 0-99, 0-79)
- Index created for chunk queries

### 2. Backend ChunkManager Service
**File:** `backend/src/services/chunkManager.ts`

**Functions:**
- `generateChunkSeed(campaignSeed, chunkX, chunkY)` - Deterministic seed
- `getChunkType(chunkX, chunkY)` - Determines biome:
  - (0,0) → town (village)
  - Distance 1 → plains
  - Distance 2-3 → forest
  - Further → plains (expandable)
- `getOrCreateChunk(campaignSeed, chunkX, chunkY)` - Load or generate
- `loadActiveChunks(campaignSeed, centerX, centerY)` - Load 3×3 grid
- `coordsToChunkId()` / `chunkIdToCoords()` - Conversion helpers

### 3. Frontend Chunk Utilities
**File:** `frontend/src/utils/chunkLoader.ts`

**Functions:**
- `convertToChunkCoordinates(globalX, globalY)` - Global → chunk/local
- `convertToGlobalCoordinates(chunkX, chunkY, localX, localY)` - Chunk → global
- `loadChunkGrid(campaignSeed, chunkX, chunkY)` - Load 3×3 chunks
- Chunk caching for performance

---

## How It Works

### Coordinate System

**Old (single map):**
```
position: (50, 40) - absolute position
```

**New (chunk-based):**
```
chunk: (0, 0)      - which chunk
local: (50, 40)    - position within chunk
global: (50, 40)   - calculated from chunk + local
```

**Example positions:**
- Village center: chunk(0,0) local(50,40)
- East forest: chunk(1,0) local(20,30)
- North area: chunk(0,1) local(15,60)
- Southwest: chunk(-1,-1) local(80,70)

### World Layout

```
         North
           |
  [-1,1] [0,1] [1,1]
           |
  [-1,0] [0,0] [1,0]  East
           |
  [-1,-1][0,-1][1,-1]
           |
         South

chunk(0,0) = Village (Wayward Hamlet)
Each chunk = 152m × 122m
```

### Chunk Generation

**Deterministic:**
- Same campaign_seed + chunk coords = same chunk
- chunk(0,0) always village
- chunk(1,0) always same eastern plains
- Consistent world for each campaign

**Types:**
- Center: Town (village with buildings)
- Adjacent: Plains (open grassland)
- Distance 2-3: Forest (trees and clearings)
- Further: More biomes (future)

---

## Current Status

### Implemented:
- Database columns
- ChunkManager service
- Chunk utilities
- Coordinate conversion
- Caching system

### Not Yet Wired:
- Frontend doesn't call chunk system yet
- Still shows single-chunk village
- Multi-chunk rendering not active
- MapScene needs update for multiple chunks

---

## To Activate Chunk System

### Next Steps:

1. **Add chunks API endpoint**
   ```typescript
   // backend/src/routes/chunks.ts
   router.get('/:campaignSeed/chunks/:chunkX/:chunkY', async (req, res) => {
     const { campaignSeed, chunkX, chunkY } = req.params;
     const chunk = await getOrCreateChunk(campaignSeed, parseInt(chunkX), parseInt(chunkY));
     res.json(chunk);
   });
   ```

2. **Update DashboardPage**
   - Use `loadChunkGrid()` instead of single zone
   - Pass multiple chunks to MapScene
   - Track chunk_x, chunk_y in character state

3. **Update MapScene**
   - Render multiple chunks with offsets
   - Expand camera bounds for 3×3 grid
   - Handle chunk transitions

---

## Benefits When Active

### Infinite Exploration:
- Map grows as you explore
- No boundaries
- New chunks auto-generate

### Performance:
- Only loads 9 chunks (3×3 grid)
- Unloads distant chunks
- Smart caching

### Persistence:
- Each chunk saved separately
- Explored chunks tracked
- Return to any visited area

### Scale:
- Current view: 456m × 366m (3×3 chunks)
- Can expand infinitely
- Each direction has unique content

---

## MVP Recommendation

**Current single-chunk (152m × 122m) is perfect for MVP!**

The infrastructure is built, but activating multi-chunk requires:
- API endpoint (15 mins)
- Frontend integration (1-2 hours)
- MapScene multi-chunk rendering (2-3 hours)

**Ship with single chunk, activate expansion in next phase.**

---

**Chunk system is built and ready to activate!**

See code in:
- `backend/src/services/chunkManager.ts`
- `frontend/src/utils/chunkLoader.ts`
