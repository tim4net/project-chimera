# Travel UI Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (FRONTEND)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  DashboardPage                          │    │
│  ├────────────┬──────────────────────┬────────────────────┤    │
│  │ Left       │ Center               │ Right              │    │
│  │ Column     │ Column               │ Column             │    │
│  │            │                      │                    │    │
│  │ • Stats    │ • ChatInterface      │ • StrategicMap     │    │
│  │ • Quests   │   (PRIMARY)          │ • TravelPanel ←────┼────┤
│  │ • Party    │                      │   (NEW)            │    │
│  │ • Idle     │                      │                    │    │
│  └────────────┴──────────────────────┴────────────────────┘    │
│                                              ↑                   │
│                                              │                   │
│  ┌──────────────────────────────────────────┴────────────────┐ │
│  │           useTravelStatus Hook                            │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ • WebSocket connection (auto-reconnect)                   │ │
│  │ • State: currentSession, events, currentEvent             │ │
│  │ • Functions: startTravel, chooseOption, cancelTravel      │ │
│  └───────────┬──────────────────────────┬────────────────────┘ │
│              │ WebSocket                │ REST API             │
│              │ ws://host:3001/ws/travel │ /api/travel/*        │
└──────────────┼──────────────────────────┼──────────────────────┘
               │                          │
               ↓                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (EXPRESS)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐        ┌─────────────────────────┐   │
│  │   WebSocket Handler  │        │   REST API Routes       │   │
│  │   /ws/travel         │        │   /api/travel/*         │   │
│  └──────────┬───────────┘        └──────────┬──────────────┘   │
│             │                               │                   │
│             └───────────────┬───────────────┘                   │
│                             ↓                                    │
│              ┌─────────────────────────────┐                    │
│              │  TravelSessionService       │                    │
│              │  (Agent 2 - Phase 4)        │                    │
│              └─────────────┬───────────────┘                    │
│                            ↓                                     │
│              ┌─────────────────────────────┐                    │
│              │  Travel Event System        │                    │
│              │  (Agent 1 - Phase 3)        │                    │
│              └─────────────┬───────────────┘                    │
│                            ↓                                     │
│              ┌─────────────────────────────┐                    │
│              │      Supabase Database      │                    │
│              │  • travel_sessions          │                    │
│              │  • travel_events            │                    │
│              └─────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Start Travel

```
User clicks destination on map
         │
         ↓
TravelPanel.startTravel(destId, mode)
         │
         ↓
useTravelStatus.startTravel()
         │
         ↓
POST /api/travel/start
         │
         ↓
TravelSessionService.createSession()
         │
         ↓
Database INSERT travel_sessions
         │
         ↓
← Response: { session: {...} }
         │
         ↓
Hook updates state.currentSession
         │
         ↓
TravelPanel re-renders with progress bar
```

### 2. Progress Update (Real-time)

```
Travel system ticks every N seconds
         │
         ↓
TravelSessionService.progressTravel()
         │
         ↓
Event generated (random encounter)
         │
         ↓
WebSocket SEND to client
         │
         ↓
ws.onmessage({ type: 'TRAVEL_EVENT', payload: {...} })
         │
         ↓
useTravelStatus.handleWebSocketMessage()
         │
         ↓
Hook updates state.currentEvent
         │
         ↓
TravelPanel re-renders with event + choices
```

### 3. Player Choice

```
User clicks choice button
         │
         ↓
TravelPanel.handleChoiceSelect(label)
         │
         ↓
useTravelStatus.chooseOption(label)
         │
         ↓
POST /api/travel/choose
         │
         ↓
TravelEventSystem.resolveChoice()
         │
         ↓
Database UPDATE travel_events
         │
         ↓
← Response: { success: true }
         │
         ↓
Hook clears state.currentEvent
         │
         ↓
TravelPanel removes event UI
         │
         ↓
(Travel continues, next event arrives via WebSocket)
```

## Component Hierarchy

```
DashboardPage (React Component)
│
├─ useAuth() ──────────────────── Get current user
│
├─ useState(character) ──────────── Character data
│
├─ useState(travelMode) ─────────── Smart/Active/Quiet
│
└─ TravelPanel ───────────────────── Travel UI
   │
   ├─ useTravelStatus(characterId) ─ Custom hook
   │  │
   │  ├─ useState(state) ─────────── Local state
   │  │  ├─ currentSession
   │  │  ├─ events[]
   │  │  ├─ currentEvent
   │  │  ├─ loading
   │  │  └─ error
   │  │
   │  ├─ useRef(wsRef) ────────────── WebSocket instance
   │  │
   │  ├─ useEffect(connectWS) ──────── Auto-connect on mount
   │  │
   │  ├─ startTravel() ───────────────┐
   │  ├─ chooseOption() ──────────────┤ API functions
   │  ├─ cancelTravel() ──────────────┤
   │  └─ getCurrentStatus() ──────────┘
   │
   └─ UI Elements
      ├─ Header (destination name)
      ├─ Progress Bar (miles)
      ├─ Danger Indicator (color-coded)
      ├─ Current Event (if any)
      │  └─ Choice Buttons
      └─ Event Log (scrollable history)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  useTravelStatus Hook State                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  currentSession: TravelSession | null                          │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ id, characterId, destinationId, destinationName       │    │
│  │ milesTraveled, milesTotal, dangerLevel, status        │    │
│  │ travelMode, startedAt, estimatedArrival               │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  events: TravelEvent[]                                         │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ [0]: { id, description, timestamp, dangerLevel, ... } │    │
│  │ [1]: { id, description, timestamp, dangerLevel, ... } │    │
│  │ [2]: { id, description, timestamp, dangerLevel, ... } │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  currentEvent: TravelEvent | null                              │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ description: "A band of goblins..."                   │    │
│  │ dangerLevel: 3                                        │    │
│  │ choices: [                                            │    │
│  │   { label: "Fight", description: "..." },            │    │
│  │   { label: "Negotiate", description: "..." },        │    │
│  │   { label: "Flee", description: "..." }              │    │
│  │ ]                                                     │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  loading: boolean                                              │
│  error: string | null                                          │
└────────────────────────────────────────────────────────────────┘
```

## WebSocket Message Types

### Client → Server

```json
{
  "type": "GET_STATUS"
}
```

### Server → Client

#### TRAVEL_PROGRESS
```json
{
  "type": "TRAVEL_PROGRESS",
  "payload": {
    "session": {
      "id": "uuid",
      "characterId": "uuid",
      "destinationId": "uuid",
      "destinationName": "Ancient Ruins",
      "milesTraveled": 4.5,
      "milesTotal": 10.0,
      "dangerLevel": 2,
      "status": "in_progress",
      "travelMode": "smart",
      "startedAt": "2025-10-21T14:30:00Z",
      "estimatedArrival": "2025-10-21T15:00:00Z"
    }
  }
}
```

#### TRAVEL_EVENT
```json
{
  "type": "TRAVEL_EVENT",
  "payload": {
    "event": {
      "id": "uuid",
      "description": "A band of goblin raiders emerges...",
      "timestamp": "2025-10-21T14:35:00Z",
      "dangerLevel": 3,
      "choices": [
        { "label": "Fight", "description": "Draw weapon..." },
        { "label": "Negotiate", "description": "Attempt to bargain..." },
        { "label": "Flee", "description": "Run away..." }
      ]
    }
  }
}
```

#### TRAVEL_COMPLETE
```json
{
  "type": "TRAVEL_COMPLETE",
  "payload": {
    "session": {
      "id": "uuid",
      "status": "completed",
      "milesTraveled": 10.0,
      "milesTotal": 10.0
      // ... other fields
    }
  }
}
```

#### TRAVEL_ERROR
```json
{
  "type": "TRAVEL_ERROR",
  "payload": {
    "error": "Failed to process travel event"
  }
}
```

## API Endpoints

### POST /api/travel/start

**Request**:
```json
{
  "characterId": "uuid",
  "destinationId": "uuid",
  "travelMode": "smart" | "active" | "quiet"
}
```

**Response**:
```json
{
  "session": { /* TravelSession */ }
}
```

### POST /api/travel/choose

**Request**:
```json
{
  "characterId": "uuid",
  "sessionId": "uuid",
  "eventId": "uuid",
  "choice": "Fight"
}
```

**Response**:
```json
{
  "success": true
}
```

### POST /api/travel/cancel

**Request**:
```json
{
  "characterId": "uuid",
  "sessionId": "uuid"
}
```

**Response**:
```json
{
  "success": true
}
```

### GET /api/travel/status

**Request**: Query param `?characterId=uuid`

**Response**:
```json
{
  "session": { /* TravelSession | null */ },
  "events": [ /* TravelEvent[] */ ],
  "currentEvent": { /* TravelEvent | null */ }
}
```

## Danger Level Visual Guide

```
┌──────────┬────────────┬───────────────────┬──────────────────┐
│ Level    │ Color      │ Name              │ Example          │
├──────────┼────────────┼───────────────────┼──────────────────┤
│ 1        │ Green      │ Safe              │ Traveling        │
│          │ #10b981    │                   │ merchant         │
├──────────┼────────────┼───────────────────┼──────────────────┤
│ 2        │ Blue       │ Minor Danger      │ Ancient marker   │
│          │ #06b6d4    │                   │ investigation    │
├──────────┼────────────┼───────────────────┼──────────────────┤
│ 3        │ Amber      │ Moderate Danger   │ Goblin raiders   │
│          │ #f59e0b    │                   │ combat           │
├──────────┼────────────┼───────────────────┼──────────────────┤
│ 4        │ Red        │ High Danger       │ Lightning storm  │
│          │ #dc2626    │                   │ hazard           │
├──────────┼────────────┼───────────────────┼──────────────────┤
│ 5        │ Purple     │ Extreme Danger    │ Dragon           │
│          │ #8b5cf6    │                   │ encounter        │
└──────────┴────────────┴───────────────────┴──────────────────┘
```

## Animation Timeline

```
Event Arrives (WebSocket message)
         │
         ↓
    [0ms] setState(currentEvent)
         │
         ↓
  [16ms] React re-render triggered
         │
         ↓
  [16ms] TravelPanel detects new event
         │
         ↓
  [16ms] CSS class applied: animate-slide-in-right
         │
         ↓
[0-300ms] Transform: translateX(20px) → translateX(0)
          Opacity: 0 → 1
         │
         ↓
 [300ms] Animation complete
         │
         ↓
         Event fully visible, choices clickable
```

## Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────┐
│ Mobile (< 768px)                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    ChatInterface                         │ │
│ │                    (Full Width)                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    TravelPanel                           │ │
│ │                    (Full Width, Below Chat)              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Desktop (≥ 1024px)                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌────────┬────────────────────────┬─────────────────────┐  │
│ │ Left   │ Center                 │ Right               │  │
│ │ 2 cols │ 7 cols                 │ 3 cols              │  │
│ │        │                        │                     │  │
│ │ Stats  │ ChatInterface          │ Map                 │  │
│ │ Quests │                        │ TravelPanel         │  │
│ └────────┴────────────────────────┴─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/src/
├── hooks/
│   └── useTravelStatus.ts ──────────── WebSocket hook
│
├── components/
│   ├── TravelPanel.tsx ─────────────── UI component
│   ├── ChatInterface.tsx ───────────── Chat (existing)
│   └── StrategicMap.tsx ────────────── Map (existing)
│
├── pages/
│   └── DashboardPage.tsx ───────────── Main layout
│
├── utils/
│   └── mockTravelEvents.ts ─────────── Testing utilities
│
├── index.css ───────────────────────── Danger level styles
│
└── tailwind.config.js ──────────────── Animation config
```

---

**End of Architecture Diagram**
