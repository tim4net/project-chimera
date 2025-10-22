# Nuaibria Travel & Map System - Quick Reference

## File Locations Reference

### Backend Files

| Component | File Path | Purpose |
|-----------|-----------|---------|
| WebSocket Server | `backend/src/websocket/index.ts` | Socket.IO initialization, room management, broadcasting |
| Travel Routes | `backend/src/routes/travel.ts` | POST /travel/start, GET /travel/status, POST /travel/choose |
| Travel Worker | `backend/src/workers/travelWorker.ts` | Background ticker (every 60s), encounter generation |
| Travel Service | `backend/src/services/travelService.ts` | Event pools, severity calculation, event generation |
| Map Routes | `backend/src/routes/strategicMap.ts` | GET /strategic-map/{campaignSeed}, POST initialize |
| Fog of War Service | `backend/src/services/fogOfWarService.ts` | Tile revelation, visibility management, path discovery |
| Travel Types | `backend/src/types/travel.ts` | TravelSession, TravelEvent, TravelChoice interfaces |
| WebSocket Types | `backend/src/types/websocket.ts` | Event enums, payload interfaces, type guards |
| Server Config | `backend/src/server.ts` | HTTP server, WebSocket init, worker startup |

### Frontend Files

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Strategic Map | `frontend/src/components/StrategicMap.tsx` | Canvas-based world map renderer |
| Travel Panel | `frontend/src/components/TravelPanel.tsx` | Travel UI with progress, encounters, choices |
| useWebSocket Hook | `frontend/src/hooks/useWebSocket.ts` | Socket.IO connection management |
| useTravelStatus Hook | `frontend/src/hooks/useTravelStatus.ts` | Travel state management, WebSocket listener |
| Dashboard | `frontend/src/pages/DashboardPage.tsx` | Main dashboard layout |

## Database Tables

```sql
-- Travel Sessions
CREATE TABLE travel_sessions (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL,
  destination_x FLOAT,
  destination_y FLOAT,
  miles_total FLOAT,
  miles_traveled FLOAT,
  travel_mode TEXT,           -- 'cautious', 'normal', 'hasty'
  status TEXT,                -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Travel Events
CREATE TABLE travel_events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES travel_sessions,
  type TEXT,                  -- Event type from pool
  severity TEXT,              -- 'trivial', 'minor', 'moderate', 'dangerous', 'deadly'
  description TEXT,
  choices JSONB,              -- Array of {label, consequence, dc?, skill?}
  requires_response BOOLEAN,
  resolved BOOLEAN,
  resolution TEXT,            -- Player's consequence
  created_at TIMESTAMP
);

-- Fog of War
CREATE TABLE world_fog (
  campaign_seed TEXT,
  tile_x INT,
  tile_y INT,
  visibility_state TEXT,      -- 'unexplored', 'explored', 'visible'
  discovered_by_character_id UUID,
  discovered_at TIMESTAMP,
  PRIMARY KEY (campaign_seed, tile_x, tile_y)
);

-- Campaign Bounds
CREATE TABLE campaign_bounds (
  campaign_seed TEXT PRIMARY KEY,
  min_x INT,
  max_x INT,
  min_y INT,
  max_y INT,
  total_tiles_discovered INT,
  updated_at TIMESTAMP
);
```

## WebSocket Event Reference

### Server Events

| Event | Payload | Frequency | Purpose |
|-------|---------|-----------|---------|
| `travel:session_start` | `{sessionId, destination, milesTotal, dangerLevel, timestamp}` | Once per travel | Travel session initiated |
| `travel:progress` | `{sessionId, milesTraveled, milesTotal, percentage, estimatedArrival}` | Every 60s | Progress update |
| `travel:event` | `{eventId, type, description, choices[], timestamp}` | On encounter | Player must respond |
| `travel:event_resolved` | `{sessionId, eventId, choice, consequence, timestamp}` | On choice | Consequence applied |

### Broadcasting Functions

```typescript
// Send to all clients subscribed to a character
broadcastToCharacter(characterId: string, event: ServerEvents, data: unknown)

// Send to all sockets for a user
broadcastToUser(userId: string, event: ServerEvents, data: unknown)

// Send to specific room
broadcastToRoom(room: string, event: ServerEvents, data: unknown)

// Send to all connected clients
broadcastToAll(event: ServerEvents, data: unknown)
```

## API Endpoints

### Travel Endpoints

```
POST /api/travel/start
├─ Body: {character_id, destination_id, travel_mode?}
└─ Response: {sessionId, milesTotal, estimatedArrival, travelMode, message}

GET /api/travel/status/:sessionId
├─ Response: {session, events[], progressPercent, currentEvent?}
└─ Emits: TRAVEL_EVENT if unresolved event exists

POST /api/travel/choose
├─ Body: {sessionId, choiceLabel}
└─ Response: {success, consequence, skillCheck?, sessionCompleted?}
```

### Map Endpoints

```
GET /api/strategic-map/:campaignSeed[?minX=&maxX=&minY=&maxY=]
├─ Response: {campaignSeed, playerPosition, bounds, tiles[], roads[]}
└─ Optional viewport params for performance

POST /api/strategic-map/initialize
├─ Body: {characterId, spawnX?, spawnY?}
└─ Response: {success, message}
```

## Travel Mechanics

### Speed

| Mode | Speed | Miles/Minute | Miles/Hour |
|------|-------|--------------|-----------|
| Cautious | 2 mph | 0.033 | 2 |
| Normal | 3 mph | 0.050 | 3 |
| Hasty | 4 mph | 0.067 | 4 |

### Encounter Chances (Per Minute)

| Mode | Chance | ~Per Hour |
|------|--------|----------|
| Cautious | 1% | 60% |
| Normal | 1.5% | 90% |
| Hasty | 2.5% | 150% (capped) |

### Event Severity Pools

| Severity | Examples | Requires Response |
|----------|----------|-------------------|
| Trivial | Merchant, landmark, weather | No |
| Minor | Traveler, merchant (friendly) | Some |
| Moderate | Bandits, storm, trap, monster | Yes |
| Dangerous | Bandit gang, dragon | Yes |
| Deadly | (Boss encounters) | Yes |

## Skill Checks in Travel

```typescript
// Format in travel event choice
{
  label: "Fight the bandits",
  consequence: "You draw your weapon...",
  dc: 12,           // Difficulty Class
  skill: "athletics" // Required skill
}

// On player choice:
1. Backend calls performSkillCheck(characterId, skill, dc)
2. Executes through ruleEngine
3. Returns: {roll, total, passed}
4. Modifies consequence: "Success/Failed (total vs dc)"
```

## Map Rendering

### Canvas Properties

```typescript
// Rendering
TILE_SIZE = 4           // Base pixels per tile
MIN_TILE_SIZE = 2       // Minimum zoom
MAX_TILE_SIZE = 16      // Maximum zoom
ZOOM_RANGE = 0.5x to 4.0x

// Colors
water: '#4A90E2'
plains: '#7EC850'
forest: '#228B22'
mountains: '#8B7355'
desert: '#EDC9AF'

// Fog states
unexplored: Dark gray (#1a1a1f)
explored: Darkened color (0.4 factor)
visible: Full biome color
```

### Fog of War Limits

```typescript
MAX_REVEAL_RADIUS = 50 tiles      // For radius-based discovery
MAX_PATH_DISTANCE = 500 tiles     // For path-based discovery
WORLD_MIN_X/Y = -1000
WORLD_MAX_X/Y = 1000
```

## Common Operations

### Start Travel

```typescript
// Frontend
const { startTravel } = useTravelStatus(characterId);
await startTravel(destinationId, 'normal');

// Backend (automatically triggered)
// 1. POST /api/travel/start
// 2. TravelWorker begins ticking
// 3. Events generated as needed
```

### Handle Encounter Choice

```typescript
// Frontend
const { chooseOption } = useTravelStatus(characterId);
await chooseOption("Fight");

// Backend
// 1. Resolve event
// 2. Apply skill check if needed
// 3. Emit TRAVEL_EVENT_RESOLVED
// 4. Continue travel
```

### Render Map

```typescript
// Frontend
<StrategicMap 
  characterId={id}
  campaignSeed={campaign}
  onTileClick={(pos) => startTravel(coordsToDestId(pos))}
/>

// Automatically:
// 1. Fetches /api/strategic-map/:campaignSeed
// 2. Renders tiles with fog state
// 3. Shows player position
// 4. Allows pan/zoom
```

## Testing Tips

### Simulate Fast Travel
```typescript
// Modify travelWorker.ts MILES_PER_TICK
MILES_PER_TICK = {
  cautious: 10 / 60,    // 10 miles per minute
  normal: 15 / 60,
  hasty: 20 / 60,
}
```

### Force Encounter
```typescript
// In travelWorker.ts rollForEncounter()
// Replace encounter check with:
if (true) {  // Force encounter
  // Generate event
}
```

### Verify WebSocket Events
```typescript
// Frontend console
socket.on('travel:progress', msg => console.log('PROGRESS', msg));
socket.on('travel:event', msg => console.log('EVENT', msg));
socket.on('travel:event_resolved', msg => console.log('RESOLVED', msg));
```

## Debugging

### Check Active Sessions
```sql
SELECT id, character_id, miles_traveled, miles_total, status, created_at
FROM travel_sessions
WHERE status = 'active'
ORDER BY created_at DESC;
```

### Check Events for Session
```sql
SELECT * FROM travel_events
WHERE session_id = 'uuid-here'
ORDER BY created_at;
```

### Check Discovered Tiles
```sql
SELECT COUNT(*) as tile_count, campaign_seed
FROM world_fog
GROUP BY campaign_seed;
```

### Server Logs

```bash
# Watch backend logs
docker compose logs -f backend

# Look for:
[Travel] Error starting travel
[TravelWorker] Session completed
[TravelWorker] Encounter triggered
[StrategicMap] Fetching map
[FogOfWar] Revealed tiles
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Progress not updating | TravelWorker not running | Check server logs, restart container |
| Events not appearing | WebSocket not connected | Check browser console, verify auth |
| Map won't render | Viewport too large | Limit tiles or use viewport params |
| Position doesn't update | Travel not completed | Check miles_traveled vs miles_total |
| Skill check fails | Character not found | Verify character_id in database |
| White screen on map | No tiles discovered | Initialize starting area after character creation |

## Performance Tips

1. **Enable viewport filtering** for campaigns with >5,000 tiles
2. **Limit encounter generation** if too many concurrent travels
3. **Cache map data** in frontend after fetching
4. **Use batching** for fog of war updates
5. **Monitor WebSocket room sizes** to avoid broadcast spam

---

**Generated**: October 21, 2025
**For**: Nuaibria Development
**Covers**: v1.0 Travel & Map System

