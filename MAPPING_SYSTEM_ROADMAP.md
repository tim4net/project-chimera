# Mapping System Implementation Roadmap

## Executive Summary
The Phaser 3 + rot.js PoC is **complete and working**. Now we need to integrate it into the production dashboard and build the missing features to make it a fully functional game system.

**Good News:** ChatInterface and ChatMessage components already exist! The AI DM chat system is partially built.

---

## Phase 1: Integration & Core Features (CRITICAL - 2-3 weeks)

### 1.1 Dashboard Integration ⭐ HIGHEST PRIORITY
**Status:** Dashboard exists but map is not integrated
**Files:** `frontend/src/pages/DashboardPage.tsx`

**Tasks:**
- [ ] Replace placeholder map grid with `<GameCanvas>` component
- [ ] Wrap dashboard in `<PhaserBridgeProvider>`
- [ ] Connect character position data to map player sprite
- [ ] Sync player movement events to backend (position_x, position_y)
- [ ] Display character stats in left panel (HP, XP, level) - **already exists**
- [ ] Display ChatInterface in right panel - **component exists at `/components/ChatInterface.tsx`**
- [ ] Ensure 3-column layout: Stats | Map | Chat

**Dependencies:**
- Existing: CharacterRecord type, ChatInterface component, DashboardPage structure
- Need: Backend endpoint for position updates

### 1.2 Real Asset Integration
**Status:** Using placeholder colored tiles
**Priority:** HIGH

**Tasks:**
- [ ] Source or create tilesets (recommend Kenney.nl for MVP)
  - Dungeon tiles (16x16 or 32x32)
  - Forest/nature biomes
  - Plains/grasslands
  - Water tiles
- [ ] Create tileset atlas with proper indices matching TileType enum
- [ ] Replace `createPlaceholderTileset()` with real image loading
- [ ] Add player character sprite (idle, walk animations optional for MVP)
- [ ] Create simple NPC/enemy sprite placeholders

**Assets needed:**
```
/frontend/public/assets/tilesets/
  ├── dungeon-16x16.png
  ├── forest-16x16.png
  ├── plains-16x16.png
  └── water-16x16.png
/frontend/public/assets/sprites/
  ├── player.png
  └── npc-placeholder.png
```

### 1.3 Backend Integration - Map Persistence
**Status:** Character position exists in DB, but map data doesn't persist
**Priority:** HIGH

**Tasks:**
- [ ] Create `maps` table in Supabase
  ```sql
  CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_seed TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    zone_type TEXT NOT NULL, -- 'dungeon', 'forest', 'town'
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    tiles JSONB NOT NULL,
    seed INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_seed, zone_id)
  );
  ```
- [ ] Backend endpoint: `GET /api/maps/:campaignSeed/:zoneId`
- [ ] Backend endpoint: `POST /api/maps` (save generated map)
- [ ] Modify map generation flow:
  1. Check if map exists in DB
  2. If yes, load from DB
  3. If no, generate procedurally, save to DB
- [ ] Add map caching to reduce DB queries

**Files to create:**
- `backend/src/routes/maps.ts`
- `backend/src/services/mapService.ts`

---

## Phase 2: AI DM Chat Integration (CRITICAL - 1-2 weeks)

### 2.1 Chat ↔ Map Communication
**Status:** ChatInterface exists but doesn't communicate with map
**Priority:** CRITICAL (Core gameplay loop)

**Tasks:**
- [ ] Review existing ChatInterface.tsx implementation
- [ ] Create DM response parser to detect location changes
  - Example: "You travel north" → trigger map update
  - Example: "You enter the dungeon" → load dungeon zone
- [ ] Implement chat-driven movement:
  - Player: "I walk to the forest"
  - DM: [generates narrative]
  - System: Updates map, triggers zone change if needed
- [ ] Add map click → chat integration:
  - Click tile on map
  - Generate chat message: "I want to move to [location]"
  - Send to DM for narrative response
- [ ] Display player actions in chat when using map
  - Example: *[You moved to coordinates (45, 23)]*

**New event types for PhaserBridge:**
```typescript
'dm/narrative-update': {
  narrative: string;
  location?: { x: number; y: number; zone?: string };
  state_changes?: Record<string, any>;
}
'chat/player-intent': {
  intent: 'move' | 'explore' | 'interact';
  target?: { x: number; y: number };
  target_object?: string;
}
```

### 2.2 DM Endpoint Integration
**Status:** Need to check if DM endpoints exist
**Priority:** CRITICAL

**Tasks:**
- [ ] Verify `/api/dm/chat` endpoint exists (likely exists based on DashboardPage imports)
- [ ] Enhance DM prompt with map context:
  ```
  Current location: Forest (45, 23)
  Nearby: Ancient Oak Tree (47, 24), Cave Entrance (42, 20)
  Available actions: Travel, Explore, Rest
  ```
- [ ] Parse DM responses for game state changes
- [ ] Auto-update map based on DM narrative
  - If DM says "You arrive at the cave", load cave dungeon map
  - If DM says "You spot a goblin", add goblin sprite to map

**Backend file:** `backend/src/routes/dmChat.ts` (already exists!)

---

## Phase 3: Map Features & Polish (2-3 weeks)

### 3.1 Points of Interest (POI) System
**Status:** Not implemented
**Priority:** MEDIUM-HIGH

**Tasks:**
- [ ] Add POI layer to MapZoneDefinition
- [ ] Create POI types:
  - Quest markers (exclamation icon)
  - NPCs (character sprites)
  - Interactive objects (treasure chests, doors)
  - Dungeon entrances (portal icons)
- [ ] Click POI → trigger chat interaction
  - Example: Click NPC → "I talk to the merchant"
- [ ] POI data structure:
  ```typescript
  interface PointOfInterest {
    id: string;
    type: 'npc' | 'quest' | 'entrance' | 'item';
    position: { x: number; y: number };
    sprite: string;
    interactionPrompt: string;
    metadata?: Record<string, any>;
  }
  ```
- [ ] Store POIs in database alongside map data
- [ ] Render POIs as sprites with hover tooltips

### 3.2 Fog of War / Exploration
**Status:** FOW layer exists but not implemented
**Priority:** MEDIUM

**Tasks:**
- [ ] Track explored tiles per character
- [ ] Create `explored_tiles` table:
  ```sql
  CREATE TABLE explored_tiles (
    character_id UUID REFERENCES characters(id),
    zone_id TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    explored_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (character_id, zone_id, x, y)
  );
  ```
- [ ] Implement FOV calculation using rot.js FOV algorithm
- [ ] Render dark overlay on unexplored tiles
- [ ] Reveal tiles as player moves (ROT.FOV.PreciseShadowcasting)
- [ ] Persist exploration state to backend

### 3.3 Minimap Component
**Status:** Not implemented
**Priority:** LOW-MEDIUM

**Tasks:**
- [ ] Create `<Minimap>` React component
- [ ] Render low-res version of current zone
- [ ] Show player position as dot
- [ ] Show POIs as colored markers
- [ ] Click minimap to pan camera
- [ ] Toggle minimap visibility

---

## Phase 4: Game Mechanics Integration (3-4 weeks)

### 4.1 Idle Task Visualization
**Status:** `idle_task` field exists in character table
**Priority:** MEDIUM

**Tasks:**
- [ ] Display idle task progress on map
  - "Traveling to forest" → show path/waypoint
  - "Resting" → show camp icon above player
  - "Crafting" → show workshop icon
- [ ] Show timer/progress bar for idle tasks
- [ ] Complete idle task → trigger DM narrative update
- [ ] Map visualization for travel tasks:
  - Draw dotted line from start to destination
  - Animate player moving along path

### 4.2 Combat Encounter Overlay
**Status:** Not implemented (Active Phase)
**Priority:** MEDIUM (can defer past MVP)

**Tasks:**
- [ ] Create `<CombatOverlay>` component
- [ ] Trigger when DM initiates combat
- [ ] Overlay tactical grid on top of map
- [ ] Show initiative order, HP bars, action menu
- [ ] Combat resolved → return to exploration map
- [ ] Store combat state in `combat_encounters` table

**Database table:**
```sql
CREATE TABLE combat_encounters (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  zone_id TEXT,
  position_x INTEGER,
  position_y INTEGER,
  enemies JSONB NOT NULL,
  state TEXT DEFAULT 'active', -- active, victory, defeat
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Quest Integration
**Status:** Quest system not visible in dashboard
**Priority:** MEDIUM

**Tasks:**
- [ ] Display active quests in left panel (under character stats)
- [ ] Show quest objectives on map:
  - "Collect 5 herbs" → highlight herb locations
  - "Defeat goblin chief" → marker on goblin lair
- [ ] Update quest progress from map interactions
- [ ] Complete quest → trigger DM celebration narrative

### 4.4 Multi-Zone System
**Status:** Single zone only
**Priority:** MEDIUM

**Tasks:**
- [ ] Implement zone transitions:
  - Walk to edge of map → "You approach the forest boundary"
  - DM prompts: "Do you want to enter?"
  - Load adjacent zone
- [ ] Create world graph:
  - Plains (starting zone)
  - → Forest (north)
  - → Dungeon entrance (east of forest)
  - → Town (south of plains)
- [ ] Store zone connections in DB:
  ```sql
  CREATE TABLE zone_connections (
    from_zone TEXT NOT NULL,
    to_zone TEXT NOT NULL,
    direction TEXT,
    threshold_x INTEGER,
    threshold_y INTEGER,
    PRIMARY KEY (from_zone, to_zone)
  );
  ```
- [ ] Seamless zone loading (preload adjacent zones)

---

## Phase 5: Polish & UX (1-2 weeks)

### 5.1 Camera Controls
**Status:** Basic follow implemented
**Priority:** LOW

**Tasks:**
- [ ] Mouse wheel zoom in/out
- [ ] Middle mouse drag to pan (when not following player)
- [ ] Keyboard shortcuts:
  - Space: Re-center on player
  - +/-: Zoom
  - Arrow keys: Pan camera
- [ ] Touch gestures for mobile (pinch zoom, swipe pan)

### 5.2 Visual Feedback
**Status:** Minimal feedback
**Priority:** LOW-MEDIUM

**Tasks:**
- [ ] Movement animation tweening (smooth walking)
- [ ] Idle animations for player sprite
- [ ] Click feedback (ripple effect on target tile)
- [ ] Particle effects:
  - Dust clouds when moving
  - Sparkles on quest items
  - Fog effects in certain biomes
- [ ] Sound effects:
  - Footsteps (different per biome)
  - Ambient sounds (forest birds, dungeon echoes)
  - UI clicks

### 5.3 Loading & Error States
**Status:** Basic loading indicator exists
**Priority:** MEDIUM

**Tasks:**
- [ ] Loading spinner during map generation
- [ ] Progressive loading for large maps (chunk-based)
- [ ] Error handling:
  - Failed to load map → show error, retry button
  - Failed to save position → queue for retry
- [ ] Offline mode (cache maps locally)

---

## Phase 6: Advanced Features (Post-MVP)

### 6.1 More Biome Types
**Status:** Only dungeon and forest
**Priority:** LOW

**Tasks:**
- [ ] Desert biome generator
- [ ] Snow/tundra biome
- [ ] Swamp/marsh biome
- [ ] Mountain/caves
- [ ] Coastal/beach areas
- [ ] Each with unique tilesets and generation rules

### 6.2 Town Generation
**Status:** Not implemented
**Priority:** MEDIUM (post-MVP)

**Tasks:**
- [ ] Town/village generator (buildings, roads, NPCs)
- [ ] Shop interiors (click building → enter)
- [ ] NPC placement and pathfinding
- [ ] Day/night cycle visuals

### 6.3 Home Base System
**Status:** Mentioned in requirements but not implemented
**Priority:** LOW

**Tasks:**
- [ ] Player-owned home zone
- [ ] Furniture placement (edit mode)
- [ ] Crafting stations
- [ ] Storage containers
- [ ] Customizable layout

---

## Technical Debt & Refactoring

### Code Quality
- [ ] Split MapScene.ts (currently 600+ lines) into smaller modules
- [ ] Add unit tests for generators (DungeonGenerator, BiomeGenerator)
- [ ] Add integration tests for map loading
- [ ] Performance profiling for large maps (100x100+)
- [ ] Add JSDoc comments to all public methods

### Architecture Improvements
- [ ] Implement map chunk streaming (load tiles on-demand)
- [ ] Add Redis caching layer for frequently accessed maps
- [ ] WebSocket for real-time position updates
- [ ] State machine for game phases (exploration, combat, dialogue)

---

## Dependencies & Prerequisites

### Already Built ✅
- Phaser 3 integration with React
- Procedural generation (dungeons, biomes)
- Character database schema
- ChatInterface component
- Dashboard layout structure
- Supabase backend setup

### Need to Build 🚧
1. **Map persistence** (database table + endpoints)
2. **Asset integration** (real tilesets and sprites)
3. **DM ↔ Map communication** (event parsing and state sync)
4. **POI system** (database + rendering)
5. **FOW tracking** (exploration state)

### External Assets Needed 🎨
- Tileset images (Kenney.nl recommended)
- Character sprites
- UI icons (quest markers, etc.)
- Sound effects (optional for MVP)

---

## Estimated Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| **Phase 1: Integration & Core** | 2-3 weeks | CRITICAL |
| **Phase 2: AI DM Chat Integration** | 1-2 weeks | CRITICAL |
| **Phase 3: Map Features** | 2-3 weeks | HIGH |
| **Phase 4: Game Mechanics** | 3-4 weeks | MEDIUM |
| **Phase 5: Polish & UX** | 1-2 weeks | MEDIUM |
| **Phase 6: Advanced Features** | 4-6 weeks | LOW (post-MVP) |
| **TOTAL MVP** | **6-10 weeks** | |
| **Full System** | **13-20 weeks** | |

---

## Next Immediate Steps (This Week)

1. **Dashboard Integration** (2-3 days)
   - Replace map placeholder with GameCanvas
   - Connect to existing character data
   - Verify ChatInterface displays correctly

2. **Asset Setup** (1-2 days)
   - Download Kenney.nl tileset
   - Create simple player sprite
   - Update map generation to use real assets

3. **Map Persistence Backend** (2-3 days)
   - Create maps table
   - Build save/load endpoints
   - Test with procedurally generated maps

4. **Basic Chat Integration** (2-3 days)
   - Connect map clicks to chat
   - Parse DM responses for location changes
   - Display movement narration

**Total:** ~1-2 weeks to working MVP with chat-driven exploration!

---

## Success Criteria for MVP

- [ ] Player can see their character on a procedurally generated map
- [ ] Player can chat with The Chronicler to move around the map
- [ ] Map updates reflect the narrative (zone changes, position updates)
- [ ] Maps persist between sessions
- [ ] Basic exploration gameplay loop works end-to-end
- [ ] Uses real tile assets (not placeholders)

---

**Generated:** 2025-10-19
**Next Review:** After Phase 1 completion
