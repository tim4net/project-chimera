# Nuaibria WebSocket-Based Travel System & Map Rendering Exploration

## 1. System Architecture Overview

The Nuaibria project implements a comprehensive travel and map system with real-time WebSocket communication, fog of war mechanics, and canvas-based map rendering. The system is designed for:
- **Async travel mechanics** with event-driven encounters
- **Real-time player position tracking** via WebSocket
- **Fog of war visibility** management for strategic world maps
- **Canvas-based rendering** for high-performance map display

---

## 2. WebSocket Implementation

### 2.1 Server-Side WebSocket Setup

**File**: `/srv/project-chimera/backend/src/websocket/index.ts`

**Key Components:**
- **Socket.IO Server** initialized in `server.ts` with HTTP server
- **Event types**: `ClientEvents` and `ServerEvents` enums for type-safe messaging
- **Authentication**: JWT token verification with Supabase
- **Room-based broadcasting**: Messages sent to character-specific or user-specific rooms

**Connection Flow:**
```typescript
// Server initialization (server.ts)
const httpServer = createServer(app);
initializeWebSocketServer(httpServer);
startTravelWorker(); // Background travel ticker
```

**Event Handlers:**
```typescript
- AUTHENTICATE: JWT validation with Supabase auth
- CHAT_MESSAGE: DM interactions
- GAME_ACTION: Action processing
- SUBSCRIBE_CHARACTER: Join room for character updates
- UNSUBSCRIBE_CHARACTER: Leave room
- DISCONNECT: Cleanup on client disconnect
```

**Broadcast Functions:**
```typescript
broadcastToCharacter(characterId, event, data) // Sends to all sockets subscribed to character
broadcastToUser(userId, event, data)           // Sends to all sockets for user
broadcastToRoom(room, event, data)             // Generic room broadcast
broadcastToAll(event, data)                    // Sends to all connected clients
```

### 2.2 Client-Side WebSocket Hook

**File**: `/srv/project-chimera/frontend/src/hooks/useWebSocket.ts`

**Features:**
- Socket.IO client with auto-reconnection (5 retries, exponential backoff)
- Event registration with storage for re-subscription on reconnect
- Character subscription management
- Automatic authentication when token provided

**Key Methods:**
- `connect()`: Establish connection
- `disconnect()`: Close connection
- `authenticate(token, characterId?)`: Send JWT auth
- `on/off(event, handler)`: Register/unregister handlers
- `emit(event, data)`: Send client events
- `subscribeToCharacter(charId)`: Join character room
- `sendChatMessage(charId, message)`: Convenience method
- `sendGameAction(charId, actionType, target)`: Convenience method

---

## 3. Travel System

### 3.1 Backend Travel Routes

**File**: `/srv/project-chimera/backend/src/routes/travel.ts`

**Endpoints:**

#### POST `/api/travel/start`
- Validates character exists and calculates distance to destination
- Creates `travel_sessions` database record
- Emits `TRAVEL_SESSION_START` WebSocket event
- Returns session ID, miles total, estimated arrival, travel mode

**Example Response:**
```json
{
  "sessionId": "uuid",
  "milesTotal": 42.5,
  "estimatedArrival": "2025-10-21T15:30:00Z",
  "travelMode": "normal",
  "message": "Travel session started..."
}
```

#### GET `/api/travel/status/:sessionId`
- Fetches session from database
- Returns all travel events for session
- Calculates progress percentage
- Finds current unresolved event
- Emits `TRAVEL_EVENT` if active event exists

#### POST `/api/travel/choose`
- Resolves current travel event
- Optionally performs skill check if DC/skill provided
- Updates event as resolved in database
- Emits `TRAVEL_EVENT_RESOLVED` WebSocket event

### 3.2 Travel Worker (Background Ticker)

**File**: `/srv/project-chimera/backend/src/workers/travelWorker.ts`

**Purpose:** Advances active travel sessions every 60 seconds

**Tick Interval:** 1 minute = 60,000ms
- **Cautious**: 0.033 miles/minute (~2 mph)
- **Normal**: 0.05 miles/minute (~3 mph)
- **Hasty**: 0.067 miles/minute (~4 mph)

**Encounter Chances Per Tick:**
- **Cautious**: 1% (~60% per hour)
- **Normal**: 1.5% (~90% per hour)
- **Hasty**: 2.5% (~150% per hour, capped at 100%)

**Worker Flow:**
1. Fetch all active sessions from `travel_sessions` table
2. For each session:
   - Calculate new miles_traveled
   - Check if destination reached (miles_traveled >= miles_total)
   - Update database with new progress
   - If completed: Update character position to destination
   - If not completed: Roll for encounter
3. If encounter triggered:
   - Generate event using `travelService.generateTravelEvent()`
   - Insert into `travel_events` table
   - Emit `TRAVEL_EVENT` or auto-resolve

**WebSocket Events Emitted:**
- `TRAVEL_PROGRESS`: Every tick with current progress
- `TRAVEL_EVENT`: When encounter generated (requires_response=true)

### 3.3 Travel Service (Event Generation)

**File**: `/srv/project-chimera/backend/src/services/travelService.ts`

**Event Pools by Severity:**
- **Trivial**: Merchant, landmark, weather, traveler (no response needed)
- **Minor**: Weather, traveler, merchant, landmark (some with choices)
- **Moderate**: Bandits, storm, trap, monster (all require response)
- **Dangerous**: Bandit gangs, dragons (high stakes)
- **Deadly**: (exists but not shown in excerpt)

**Event Template Structure:**
```typescript
{
  type: TravelEventType;
  severity: Severity;
  description: string;
  requires_response: boolean;
  choices?: Array<{
    label: string;
    consequence: string;
    dc?: number;      // Difficulty Class for skill check
    skill?: string;   // Skill required
  }>;
}
```

**Severity Calculation:**
- Based on travel mode and region danger level
- Hasty mode = higher severity chance
- Cautious mode = lower severity

### 3.4 Travel Types

**File**: `/srv/project-chimera/backend/src/types/travel.ts`

**Key Types:**
```typescript
type TravelMode = 'cautious' | 'normal' | 'hasty';
type TravelStatus = 'active' | 'paused' | 'completed' | 'cancelled';
type Severity = 'trivial' | 'minor' | 'moderate' | 'dangerous' | 'deadly';

interface TravelSession {
  id: string;
  character_id: string;
  destination_id?: string;
  destination_x: number;
  destination_y: number;
  miles_total: number;
  miles_traveled: number;
  travel_mode: TravelMode;
  status: TravelStatus;
  created_at: string;
  completed_at?: string;
}

interface TravelEvent {
  id: string;
  session_id: string;
  type: TravelEventType;
  severity: Severity;
  description: string;
  choices?: TravelChoice[];
  requires_response: boolean;
  resolved?: boolean;
  resolution?: string;
}
```

### 3.5 Travel WebSocket Events

**File**: `/srv/project-chimera/backend/src/types/websocket.ts`

```typescript
enum ServerEvents {
  TRAVEL_SESSION_START = 'travel:session_start',    // Start of new journey
  TRAVEL_EVENT = 'travel:event',                    // Encounter during travel
  TRAVEL_EVENT_RESOLVED = 'travel:event_resolved',  // Player choice made
  TRAVEL_PROGRESS = 'travel:progress',              // Progress update every tick
}

interface TravelSessionStartEvent {
  sessionId: string;
  destination: string;
  milesTotal: number;
  dangerLevel: number;
  timestamp: number;
}

interface TravelEventEvent {
  eventId: string;
  type: string;
  description: string;
  choices?: Array<{
    label: string;
    consequence: string;
    dc?: number;
    skill?: string;
  }>;
  timestamp: number;
}

interface TravelProgressEvent {
  sessionId: string;
  milesTraveled: number;
  milesTotal: number;
  percentage: number;
  estimatedArrival?: string;
}

interface TravelEventResolvedEvent {
  sessionId: string;
  eventId: string;
  choice: string;
  consequence: string;
  timestamp: number;
}
```

---

## 4. Map Rendering System

### 4.1 Strategic Map Component

**File**: `/srv/project-chimera/frontend/src/components/StrategicMap.tsx`

**Purpose:** High-performance canvas-based world map renderer

**Rendering Features:**
- **Canvas 2D API** for tile rendering
- **Tile size**: 4 pixels per tile (strategic zoom), scalable 0.5x - 4.0x
- **Pan & Zoom**: Mouse wheel zoom, click-drag pan
- **Dynamic sizing**: Resizes with container
- **Fog of war visualization**: Different colors for unexplored/explored/visible

**Biome Colors:**
```typescript
const BIOME_COLORS: Record<string, string> = {
  water: '#4A90E2',
  plains: '#7EC850',
  forest: '#228B22',
  mountains: '#8B7355',
  desert: '#EDC9AF',
};
```

**Rendering Flow:**
1. Fetch map data from `/api/strategic-map/{campaignSeed}`
2. Store in local state: `mapData`
3. `useEffect` renders canvas when mapData changes
4. Render sequence:
   - Clear with dark background (#0a0a0f)
   - Render tiles with fog state coloring (darkened if explored, full if visible)
   - Render grid (if zoomed in enough)
   - Render roads as polylines
   - Render player position as gold glowing circle
   - Render player label "YOU"

**Interaction Features:**
- Mouse wheel: Zoom (0.5x to 4.0x)
- Click-drag: Pan viewport
- Click on tile: Callback with coordinates (for travel destination selection)

**Controls (fullscreen only):**
- World/Region view toggle
- Center on player
- Zoom in/out buttons
- Display stats (tiles discovered, zoom level)

### 4.2 Strategic Map API Route

**File**: `/srv/project-chimera/backend/src/routes/strategicMap.ts`

**Endpoint**: `GET /api/strategic-map/:campaignSeed`

**Features:**
- Requires authentication
- Verifies character ownership
- Returns discovered tiles with fog state
- Supports optional viewport bounds for performance
- Includes roads network data

**Response Structure:**
```json
{
  "campaignSeed": "string",
  "playerPosition": { "x": number, "y": number },
  "bounds": {
    "minX": number, "maxX": number,
    "minY": number, "maxY": number,
    "width": number, "height": number
  },
  "tiles": [
    { "x": number, "y": number, "biome": string, "fogState": "unexplored|explored|visible" }
  ],
  "tilesDiscovered": number,
  "roads": [
    {
      "id": string,
      "from": { "id": string, "name": string },
      "to": { "id": string, "name": string },
      "polyline": [{ "x": number, "y": number }]
    }
  ]
}
```

### 4.3 Fog of War Service

**File**: `/srv/project-chimera/backend/src/services/fogOfWarService.ts`

**Purpose:** Manage tile discovery and visibility states

**World Bounds:**
- X: -1000 to 1000 (2000 tiles wide)
- Y: -1000 to 1000 (2000 tiles high)
- Total: 4 million tiles max

**Tile States:**
- `unexplored`: Not yet discovered (dark gray)
- `explored`: Previously discovered, not currently visible (muted colors)
- `visible`: Currently accessible/recently discovered (full color)

**Key Functions:**

#### `revealTilesInRadius(campaignSeed, centerX, centerY, radius, characterId)`
- Security: Max radius 50 tiles (prevents DoS)
- Generates circular tile pattern
- Marks as 'explored'
- Updates campaign bounds

#### `revealTilesAlongPath(campaignSeed, startX, startY, endX, endY, pathWidth, characterId)`
- Security: Max path distance 500 tiles
- Uses Bresenham's line algorithm for accuracy
- Reveals tiles in radius on each side of path
- Batch inserts into `world_fog` table

#### `getDiscoveredTiles(campaignSeed, viewport?)`
- Fetches from `world_fog` table
- Optional viewport filtering for performance (prevents server crashes with 10,000+ tiles)
- Returns bounds and fog state for each tile

#### `initializeStartingArea(campaignSeed, spawnX, spawnY, characterId)`
- Called during character creation
- Reveals initial area around spawn point

**Database Tables:**
- `world_fog`: Stores fog state (campaign_seed, tile_x, tile_y, visibility_state)
- `campaign_bounds`: Tracks min/max x/y for campaign

---

## 5. Position Tracking & Updates

### 5.1 Player Position Storage

**Database Field**: `characters.position`
- Format: JSON object `{ x: number, y: number }`
- Updated when travel completes (via travelWorker)
- Updated on idle task completion (scout, etc.)

### 5.2 Position Update Flow

**Travel Completion:**
1. TravelWorker detects miles_traveled >= miles_total
2. Updates `travel_sessions.status = 'completed'`
3. Updates `characters.position` to destination coordinates
4. Logs completion message

**Real-Time Updates to Client:**
1. Client listens for `TRAVEL_PROGRESS` events (every minute)
2. Client can poll `/api/travel/status/:sessionId` for immediate updates
3. On travel completion, character position updated server-side
4. Next map render fetches from API and gets new position

### 5.3 Frontend Travel Status Hook

**File**: `/srv/project-chimera/frontend/src/hooks/useTravelStatus.ts`

**WebSocket Connection:**
- Direct WebSocket connection (not Socket.IO) to `ws://host:port/ws/travel?characterId=...`
- Auto-reconnect after 5 seconds on close

**Message Types:**
```typescript
type TravelMessageType = 'TRAVEL_PROGRESS' | 'TRAVEL_EVENT' | 'TRAVEL_COMPLETE' | 'TRAVEL_ERROR';

interface TravelMessage {
  type: TravelMessageType;
  payload: any;
}
```

**State Management:**
- `currentSession`: Active travel session or null
- `events`: Array of all events during session
- `currentEvent`: Current event requiring player response
- `loading`: Fetch state
- `error`: Error message

**Functions Exposed:**
- `startTravel(destinationId, travelMode?)`: POST /api/travel/start
- `chooseOption(label)`: POST /api/travel/choose
- `cancelTravel()`: POST /api/travel/cancel
- `getCurrentStatus()`: GET /api/travel/status

---

## 6. Travel UI Components

### 6.1 Travel Panel Component

**File**: `/srv/project-chimera/frontend/src/components/TravelPanel.tsx`

**UI Elements:**
1. **Header**: Destination name + cancel button
2. **Progress Bar**: Visual miles_traveled / milesTotal
3. **Danger Indicator**: Color-coded 1-5 level (green to purple)
4. **Travel Status**: "In Progress", "Completed", etc.
5. **Current Encounter**: Event description + choice buttons
6. **Event Log**: Scrolling history of events
7. **Travel Mode Selector**: Smart (AI), Active (player), Quiet (skip)

**State Handling:**
- Uses `useTravelStatus` hook for data
- Displays loading spinner during requests
- Shows error messages if failures occur
- Disables buttons while processing

---

## 7. Database Schema

**Key Tables:**

### `travel_sessions`
```
id (UUID)
character_id (UUID, FK)
destination_id (string)
destination_x (number)
destination_y (number)
miles_total (number)
miles_traveled (number)
travel_mode ('cautious' | 'normal' | 'hasty')
status ('active' | 'paused' | 'completed' | 'cancelled')
created_at (timestamp)
updated_at (timestamp)
completed_at (timestamp)
```

### `travel_events`
```
id (UUID)
session_id (UUID, FK)
type (string)
severity ('trivial' | 'minor' | 'moderate' | 'dangerous' | 'deadly')
description (text)
choices (JSON array)
requires_response (boolean)
resolved (boolean)
resolution (text)
created_at (timestamp)
```

### `world_fog`
```
campaign_seed (string)
tile_x (number)
tile_y (number)
visibility_state ('unexplored' | 'explored' | 'visible')
discovered_by_character_id (UUID)
discovered_at (timestamp)
```

### `campaign_bounds`
```
campaign_seed (string)
min_x (number)
max_x (number)
min_y (number)
max_y (number)
total_tiles_discovered (number)
```

---

## 8. Error Handling & Logging

### Backend Logging

**Pattern**: `[Component] Message` with context

Examples:
- `[Travel] Error starting travel: ...`
- `[TravelWorker] Session 123: 50% complete`
- `[StrategicMap] Fetching map data...`
- `[FogOfWar] Revealed 150 tiles around (100, 200)`

### Client-Side Error Handling

- Try/catch blocks in API calls
- WebSocket error listeners
- User-facing error messages in UI
- Console logging for debugging

---

## 9. Key Integration Points

### Server Startup
1. Create HTTP server
2. Initialize WebSocket server (attach to HTTP)
3. Start travel worker (tick every 60s)
4. Start cache cleaner
5. Start cost tracking

### Character Creation
1. Create character record with spawn position
2. Call `/api/strategic-map/initialize` to reveal starting area
3. Initialize fog of war with starting tiles

### Travel Flow
1. Player selects destination on map (click on tile)
2. Call `/api/travel/start` with character_id, destination_id, travel_mode
3. Returns session_id and estimated arrival
4. TravelWorker processes ticks every 60 seconds
5. Emits `TRAVEL_PROGRESS` every tick
6. Randomly generates events during travel
7. Client receives `TRAVEL_EVENT` and displays choices
8. Player selects choice → POST `/api/travel/choose`
9. Server resolves event, may apply skill checks
10. On completion: character position updated, session marked complete

### Map Rendering
1. Component calls `/api/strategic-map/:campaignSeed` on mount
2. Receives all discovered tiles with fog states
3. Renders canvas with:
   - Tile biome colors
   - Fog of war coloring
   - Roads overlay
   - Player position marker
4. Supports zoom/pan interactions
5. Click on tile to initiate travel

---

## 10. Performance Considerations

### Map Rendering
- **Canvas 2D**: Efficient for tile-based rendering
- **Tile lookup**: Uses Map for O(1) access
- **Lazy rendering**: Only renders visible bounds
- **Viewport filtering**: Optional query parameter to limit tiles fetched

### Travel Processing
- **Async worker**: Non-blocking background tick
- **Database batching**: Multiple tiles in single upsert
- **Line algorithm**: Bresenham's for efficient path calculation

### WebSocket
- **Room-based broadcasting**: Only sends to subscribed clients
- **Graceful degradation**: Fallback to polling if WebSocket unavailable
- **Auto-reconnect**: Attempts reconnect with exponential backoff

---

## 11. Security & Validation

### Authentication
- All API endpoints require Supabase JWT token
- WebSocket connection requires authentication
- Character ownership verified before operations

### Input Validation
- Radius bounds checked (max 50 tiles)
- Path distance limited (max 500 tiles)
- World coordinates bounded (-1000 to 1000)
- Skill checks validated against defined skill list

### Rate Limiting
- Travel worker runs once per minute (prevents spam)
- Encounter generation limited by chance rolls

---

## 12. Known Issues & Limitations

1. **WebSocket vs REST Hybrid**: Frontend uses both Socket.IO and raw WebSocket (useTravelStatus)
2. **Viewport Implementation**: Not fully implemented in frontend (commented out)
3. **Travel Cancellation**: Endpoint exists but not fully implemented in worker
4. **Skill Check Integration**: Falls back to random roll if ruleEngine unavailable
5. **No Persistence**: Travel session state lost if server restarts

---

## Summary

The Nuaibria travel and map system is a sophisticated, well-structured implementation combining:
- **Real-time WebSocket communication** for live updates
- **Background workers** for autonomous game ticks
- **Fog of war mechanics** for exploration tracking
- **High-performance canvas rendering** for large maps
- **REST APIs** for session/event management
- **D&D 5e mechanics** for skill checks during events

The architecture supports solo idle gameplay with optional active encounters and provides a foundation for future multiplayer integration.
