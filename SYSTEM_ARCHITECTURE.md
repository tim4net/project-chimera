# Nuaibria System Architecture - Travel & Map System

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vite)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐    ┌──────────────────────┐                 │
│  │   StrategicMap.tsx   │    │   TravelPanel.tsx    │                 │
│  │  (Canvas Rendering)  │    │  (Travel UI)         │                 │
│  └──────────┬───────────┘    └──────────┬───────────┘                 │
│             │                           │                             │
│             │ fetch                     │ useWebSocket()              │
│             │                           │ useTravelStatus()           │
│             │                           │                             │
│  ┌──────────▼───────────────────────────▼────────────┐                │
│  │      useWebSocket Hook (Socket.IO)                │                │
│  │      useTravelStatus Hook (Raw WebSocket)         │                │
│  │  ┌────────────────────────────────────────────┐   │                │
│  │  │ Events:                                    │   │                │
│  │  │ - TRAVEL_PROGRESS (every tick)             │   │                │
│  │  │ - TRAVEL_EVENT (encounter)                 │   │                │
│  │  │ - TRAVEL_EVENT_RESOLVED (choice made)      │   │                │
│  │  │ - CHARACTER_UPDATE (position change)       │   │                │
│  │  └────────────────────────────────────────────┘   │                │
│  └──────────┬──────────────────────────────────────┬──┘                │
│             │                                      │                  │
│             │ REST API                            │ WebSocket         │
└─────────────┼──────────────────────────────────────┼──────────────────┘
              │                                      │
              │ HTTP Server (Express)                │
┌─────────────▼──────────────────────────────────────▼──────────────────┐
│                     BACKEND (Node.js/Express)                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              WebSocket Server (Socket.IO)                     │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ Room Management:                                         │ │   │
│  │  │ - character:{characterId} (character-specific updates)  │ │   │
│  │  │ - user:{userId} (user-specific updates)                │ │   │
│  │  │                                                          │ │   │
│  │  │ Broadcast Functions:                                    │ │   │
│  │  │ - broadcastToCharacter()                               │ │   │
│  │  │ - broadcastToUser()                                    │ │   │
│  │  │ - broadcastToRoom()                                    │ │   │
│  │  │ - broadcastToAll()                                     │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              Travel Worker (Background Tick)                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ Runs every 60 seconds:                                   │ │   │
│  │  │ 1. Fetch all active travel_sessions                      │ │   │
│  │  │ 2. For each session:                                     │ │   │
│  │  │    - Increment miles_traveled                            │ │   │
│  │  │    - Emit TRAVEL_PROGRESS event                          │ │   │
│  │  │    - Check if completed                                  │ │   │
│  │  │    - Roll for encounter                                  │ │   │
│  │  │    - Generate event if hit                               │ │   │
│  │  │ 3. Emit TRAVEL_EVENT via WebSocket                       │ │   │
│  │  │ 4. Update character position on arrival                  │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐              │
│  │  API Routes            │  │  Services              │              │
│  ├────────────────────────┤  ├────────────────────────┤              │
│  │ POST /travel/start     │  │ travelService:         │              │
│  │ GET /travel/status     │  │ - Event generation     │              │
│  │ POST /travel/choose    │  │ - Severity calc        │              │
│  │ GET /strategic-map/:id │  │                        │              │
│  │ POST /strategic-map/   │  │ fogOfWarService:       │              │
│  │      initialize        │  │ - Tile revelation      │              │
│  │                        │  │ - Path discovery       │              │
│  │                        │  │ - Visibility management│              │
│  └────────────────────────┘  └────────────────────────┘              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
              │
              │ Supabase Cloud (PostgreSQL)
┌─────────────▼───────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │   travel_sessions  │  │   travel_events    │                  │
│  ├────────────────────┤  ├────────────────────┤                  │
│  │ id (UUID)          │  │ id (UUID)          │                  │
│  │ character_id       │  │ session_id (FK)    │                  │
│  │ destination_x/y    │  │ type               │                  │
│  │ miles_total        │  │ severity           │                  │
│  │ miles_traveled     │  │ description        │                  │
│  │ travel_mode        │  │ choices (JSON)     │                  │
│  │ status             │  │ requires_response  │                  │
│  │ created_at         │  │ resolved           │                  │
│  │ completed_at       │  │ created_at         │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │    world_fog       │  │  campaign_bounds   │                  │
│  ├────────────────────┤  ├────────────────────┤                  │
│  │ campaign_seed      │  │ campaign_seed      │                  │
│  │ tile_x, tile_y     │  │ min_x/max_x        │                  │
│  │ visibility_state   │  │ min_y/max_y        │                  │
│  │ discovered_by_char │  │ total_tiles        │                  │
│  │ discovered_at      │  │ discovered         │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                     │
│  ┌────────────────────┐                                           │
│  │    characters      │                                           │
│  ├────────────────────┤                                           │
│  │ id, user_id        │                                           │
│  │ position_x/y       │ ◄── Updated by travelWorker             │
│  │ campaign_seed      │     on arrival                            │
│  │ ... other fields   │                                           │
│  └────────────────────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Travel Start Flow

```
Player clicks tile on map
      │
      ▼
TravelPanel.tsx
      │
      ├─ calls useTravelStatus.startTravel(destinationId)
      │
      ▼
Frontend: POST /api/travel/start
  {
    character_id,
    destination_id,
    travel_mode
  }
      │
      ▼
Backend: travel.ts /start endpoint
  ├─ Validate character
  ├─ Get destination coords
  ├─ Calculate distance
  ├─ Create travel_sessions record
  ├─ Emit TRAVEL_SESSION_START via WebSocket
  └─ Return session data
      │
      ▼
Frontend: useTravelStatus receives response
  ├─ Update local state (currentSession)
  ├─ Re-render TravelPanel with progress
  └─ Wait for TravelWorker events
```

### Travel Tick Flow (Every 60 seconds)

```
TravelWorker tick() runs
      │
      ▼
Query all active travel_sessions
      │
      ├─ For each session:
      │  ├─ Calculate new miles_traveled
      │  ├─ Update database
      │  ├─ Emit TRAVEL_PROGRESS via WebSocket
      │  │
      │  ├─ Check if completed (miles >= total)
      │  │  ├─ If YES:
      │  │  │  ├─ Update session status → 'completed'
      │  │  │  ├─ Update character.position to dest coords
      │  │  │  └─ Return (no encounter)
      │  │  │
      │  │  └─ If NO:
      │  │     ├─ Roll for encounter chance
      │  │     └─ If hit:
      │  │        ├─ Generate event (travelService)
      │  │        ├─ Insert into travel_events
      │  │        ├─ Emit TRAVEL_EVENT if requires_response
      │  │        └─ Auto-resolve if not
      │
      ▼
Frontend listens for events via WebSocket
  ├─ TRAVEL_PROGRESS → Update progress bar
  └─ TRAVEL_EVENT → Display encounter + choices
```

### Player Choice Flow

```
Frontend: Player clicks choice button
      │
      ▼
TravelPanel.tsx handleChoiceSelect()
      │
      ├─ calls useTravelStatus.chooseOption(label)
      │
      ▼
Frontend: POST /api/travel/choose
  {
    sessionId,
    choiceLabel
  }
      │
      ▼
Backend: travel.ts /choose endpoint
  ├─ Fetch active event
  ├─ Find matching choice
  ├─ If choice has DC/skill:
  │  ├─ Perform skill check (ruleEngine)
  │  └─ Modify consequence based on result
  ├─ Mark event as resolved
  ├─ Emit TRAVEL_EVENT_RESOLVED via WebSocket
  └─ Return consequence + skill check result
      │
      ▼
Frontend: useTravelStatus receives response
  ├─ Update local state (clear currentEvent)
  ├─ Re-render (wait for next event or progress)
  └─ TravelWorker will continue ticking...
```

### Map Rendering Flow

```
StrategicMap.tsx mounts
      │
      ▼
useEffect: Fetch map data
      │
      ├─ GET /api/strategic-map/{campaignSeed}
      │
      ▼
Backend: strategicMap.ts route
  ├─ Verify character owns campaign
  ├─ Call fogOfWarService.getDiscoveredTiles()
  │  ├─ Query world_fog table
  │  ├─ Query campaign_bounds
  │  └─ Return tiles with visibility state
  ├─ Call roadNetworkService.ensureRoadNetwork()
  └─ Return complete map data
      │
      ▼
Frontend: setMapData(response)
      │
      ▼
useEffect: Render Canvas
  ├─ Create canvas context
  ├─ Render background
  ├─ For each tile:
  │  ├─ Get biome color
  │  ├─ Darken if explored (not visible)
  │  ├─ Full color if visible
  │  └─ fillRect()
  │
  ├─ Render grid (if zoomed in)
  ├─ Render roads as polylines
  ├─ Render player position (gold circle)
  └─ Render player label "YOU"
      │
      ▼
User interacts:
  ├─ Mouse wheel → Zoom (0.5x to 4.0x)
  ├─ Click-drag → Pan
  ├─ Click on tile → onTileClick(coords)
  │  └─ Initiates travel to that tile
  └─ Button → Toggle view, center player, etc.
```

## Component Hierarchy

```
DashboardPage
├── StrategicMap
│   └── Canvas (tile rendering)
├── TravelPanel
│   └── useTravelStatus hook
│       ├── useWebSocket (for events)
│       └── REST API calls
├── ChatInterface
├── IdleTaskPanel
├── QuestPanel
├── TensionBadge
└── PartyPanel
```

## Event Flow Timeline

```
T+0s:   Player clicks destination on map
        └─ startTravel() → POST /api/travel/start
           └─ Session created, TRAVEL_SESSION_START emitted

T+30s:  TravelWorker tick
        ├─ miles_traveled: 0 → 0.05 (normal mode)
        ├─ TRAVEL_PROGRESS emitted
        └─ No encounter (0% chance this tick)

T+60s:  TravelWorker tick
        ├─ miles_traveled: 0.05 → 0.1
        ├─ TRAVEL_PROGRESS emitted
        ├─ Roll for encounter: HIT!
        ├─ Generate event: "Bandits block path"
        ├─ TRAVEL_EVENT emitted
        └─ Player must choose

T+60s+: Player selects "Fight" choice
        ├─ chooseOption() → POST /api/travel/choose
        ├─ Skill check performed
        ├─ Event marked resolved
        ├─ TRAVEL_EVENT_RESOLVED emitted
        └─ UI shows consequence

T+120s: TravelWorker tick
        ├─ miles_traveled: 0.1 → 0.15
        ├─ TRAVEL_PROGRESS emitted
        └─ No encounter this tick

...

T+840s: TravelWorker tick
        ├─ miles_traveled: 42.45 → 42.5 (COMPLETE!)
        ├─ character.position updated to destination
        ├─ session.status = 'completed'
        ├─ TRAVEL_PROGRESS emitted (100%)
        └─ TravelPanel shows arrival

Anywhere:
- Player can check map via StrategicMap
  ├─ GET /api/strategic-map/{campaignSeed}
  ├─ Fog of war reveals path traveled
  └─ Player position shows on map
```

## Key Technologies

**Frontend:**
- React 18 + TypeScript
- Vite (build)
- Socket.IO client (WebSocket)
- HTML5 Canvas API (rendering)
- Tailwind CSS (styling)

**Backend:**
- Node.js + Express
- Socket.IO server (WebSocket)
- PostgreSQL (via Supabase)
- TypeScript
- Supabase Auth (JWT)

**Database:**
- Supabase Cloud (hosted PostgreSQL)
- Real-time capabilities
- REST API layer

**D&D 5e Integration:**
- Skill checks for travel choices
- Severity-based encounter generation
- Exhaustion/condition mechanics

---

## Performance Optimization Points

1. **Canvas Rendering**: Uses requestAnimationFrame implicitly via React.useEffect
2. **Tile Lookup**: Map<string, MapTile> for O(1) access
3. **Viewport Filtering**: Optional query param limits tile count
4. **WebSocket Rooms**: Only sends to subscribed clients
5. **Batch Database Operations**: Upsert multiple tiles in single query
6. **Bresenham's Algorithm**: Efficient line drawing for path revelation

