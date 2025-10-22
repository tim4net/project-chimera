# Handoff to Agent 3 (Backend Routes)

**From**: Agent 4 (Frontend UI)
**To**: Agent 3 (Backend Routes)
**Date**: 2025-10-21
**Status**: Frontend Complete, Awaiting Backend Integration

---

## Summary

Agent 4 has completed all frontend tasks for Phase 5 - Travel UI Implementation. The `TravelPanel` component and `useTravelStatus` hook are fully implemented, tested with mock data, and integrated into the dashboard.

**The frontend is now waiting for the backend routes to be created by Agent 3.**

---

## What's Complete (Agent 4)

### ✅ Frontend Components
- `/srv/project-chimera/frontend/src/hooks/useTravelStatus.ts` - WebSocket hook (375 lines)
- `/srv/project-chimera/frontend/src/components/TravelPanel.tsx` - UI component (311 lines)
- `/srv/project-chimera/frontend/src/utils/mockTravelEvents.ts` - Testing utilities (191 lines)

### ✅ Integration
- Dashboard updated to include TravelPanel in right column
- CSS styles added for danger levels (green → purple)
- Animations added for smooth transitions

### ✅ Documentation
- `/srv/project-chimera/frontend/TRAVEL_UI_IMPLEMENTATION.md` - Technical docs
- `/srv/project-chimera/AGENT_4_COMPLETION_REPORT.md` - Completion report
- `/srv/project-chimera/TRAVEL_UI_ARCHITECTURE.md` - Architecture diagrams

---

## What's Needed (Agent 3)

### Task 3.1: Create Travel Routes File

**File to Create**: `/srv/project-chimera/backend/src/routes/travelRoutes.ts`

This file should:
1. Import TravelSessionService (from Agent 2's Phase 4 work)
2. Implement REST API endpoints
3. Implement WebSocket handler
4. Export router for registration in server.ts

### Required API Endpoints

#### 1. POST /api/travel/start
Start a new travel session.

**Request**:
```typescript
{
  characterId: string;
  destinationId: string;
  travelMode: 'smart' | 'active' | 'quiet';
}
```

**Response**:
```typescript
{
  session: {
    id: string;
    characterId: string;
    destinationId: string;
    destinationName: string;
    milesTraveled: number;
    milesTotal: number;
    dangerLevel: 1 | 2 | 3 | 4 | 5;
    status: 'in_progress' | 'paused' | 'completed' | 'cancelled';
    travelMode: 'smart' | 'active' | 'quiet';
    startedAt: string;  // ISO timestamp
    estimatedArrival?: string;  // ISO timestamp
  }
}
```

**Example Implementation**:
```typescript
router.post('/start', async (req, res) => {
  const { characterId, destinationId, travelMode } = req.body;

  // Validate inputs
  if (!characterId || !destinationId || !travelMode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Call TravelSessionService from Phase 4
    const session = await TravelSessionService.createSession({
      characterId,
      destinationId,
      travelMode
    });

    res.json({ session });
  } catch (error) {
    console.error('[Travel Routes] Error starting travel:', error);
    res.status(500).json({ error: 'Failed to start travel' });
  }
});
```

---

#### 2. POST /api/travel/choose
Submit a choice during a travel event.

**Request**:
```typescript
{
  characterId: string;
  sessionId: string;
  eventId: string;
  choice: string;  // Choice label (e.g., "Fight", "Negotiate")
}
```

**Response**:
```typescript
{
  success: boolean;
}
```

**Example Implementation**:
```typescript
router.post('/choose', async (req, res) => {
  const { characterId, sessionId, eventId, choice } = req.body;

  // Validate inputs
  if (!characterId || !sessionId || !eventId || !choice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Call TravelSessionService to process choice
    await TravelSessionService.processChoice({
      sessionId,
      eventId,
      choice
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[Travel Routes] Error processing choice:', error);
    res.status(500).json({ error: 'Failed to process choice' });
  }
});
```

---

#### 3. POST /api/travel/cancel
Cancel an active travel session.

**Request**:
```typescript
{
  characterId: string;
  sessionId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
}
```

**Example Implementation**:
```typescript
router.post('/cancel', async (req, res) => {
  const { characterId, sessionId } = req.body;

  // Validate inputs
  if (!characterId || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Call TravelSessionService to cancel
    await TravelSessionService.cancelSession(sessionId);

    res.json({ success: true });
  } catch (error) {
    console.error('[Travel Routes] Error canceling travel:', error);
    res.status(500).json({ error: 'Failed to cancel travel' });
  }
});
```

---

#### 4. GET /api/travel/status
Get current travel status for a character.

**Request**: Query param `?characterId={uuid}`

**Response**:
```typescript
{
  session: {
    // TravelSession or null
  } | null;
  events: TravelEvent[];  // Recent events
  currentEvent: TravelEvent | null;  // Current pending event
}
```

**Example Implementation**:
```typescript
router.get('/status', async (req, res) => {
  const { characterId } = req.query;

  // Validate input
  if (!characterId || typeof characterId !== 'string') {
    return res.status(400).json({ error: 'Missing characterId' });
  }

  try {
    // Get active session for character
    const session = await TravelSessionService.getActiveSession(characterId);

    if (!session) {
      return res.json({ session: null, events: [], currentEvent: null });
    }

    // Get recent events for this session
    const events = await TravelSessionService.getSessionEvents(session.id);

    // Get current pending event (if any)
    const currentEvent = await TravelSessionService.getCurrentEvent(session.id);

    res.json({ session, events, currentEvent });
  } catch (error) {
    console.error('[Travel Routes] Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch travel status' });
  }
});
```

---

### Required WebSocket Handler

**Endpoint**: `ws://localhost:3001/ws/travel?characterId={uuid}`

The WebSocket handler should:
1. Accept connections with `characterId` query parameter
2. Listen for `GET_STATUS` messages from client
3. Subscribe to travel events for that character
4. Send real-time updates to client

**Message Types to Send**:
- `TRAVEL_PROGRESS`: Update progress (miles, danger level)
- `TRAVEL_EVENT`: New encounter during travel
- `TRAVEL_COMPLETE`: Journey finished
- `TRAVEL_ERROR`: Error occurred

**Example Implementation**:
```typescript
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ noServer: true });

// Upgrade HTTP connection to WebSocket
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);

  if (url.pathname === '/ws/travel') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);
  const characterId = url.searchParams.get('characterId');

  if (!characterId) {
    ws.close(1008, 'Missing characterId');
    return;
  }

  console.log(`[Travel WebSocket] Client connected: ${characterId}`);

  // Subscribe to travel events for this character
  const eventHandler = (event: TravelEvent) => {
    ws.send(JSON.stringify({
      type: 'TRAVEL_EVENT',
      payload: { event }
    }));
  };

  TravelSessionService.subscribe(characterId, eventHandler);

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'GET_STATUS') {
        // Send current status
        const session = await TravelSessionService.getActiveSession(characterId);
        ws.send(JSON.stringify({
          type: 'TRAVEL_PROGRESS',
          payload: { session }
        }));
      }
    } catch (error) {
      console.error('[Travel WebSocket] Error handling message:', error);
    }
  });

  // Cleanup on disconnect
  ws.on('close', () => {
    console.log(`[Travel WebSocket] Client disconnected: ${characterId}`);
    TravelSessionService.unsubscribe(characterId, eventHandler);
  });
});
```

---

### Server Registration

**File**: `/srv/project-chimera/backend/src/server.ts`

Add the following imports and route registration:

```typescript
import travelRoutes from './routes/travelRoutes';

// ... existing routes ...

app.use('/api/travel', travelRoutes);  // Add this line
```

---

## Integration Testing

Once you've created the routes file, test the integration:

### 1. Start Backend Server
```bash
cd /srv/project-chimera/backend
npm run dev
```

### 2. Start Frontend Dev Server
```bash
cd /srv/project-chimera/frontend
npm run dev
```

### 3. Test WebSocket Connection
1. Open browser DevTools (Network tab → WS filter)
2. Navigate to dashboard
3. Verify WebSocket connection to `ws://localhost:3001/ws/travel?characterId={id}`
4. Check for successful connection (status 101)

### 4. Test Travel Flow
1. Click destination on Strategic Map
2. Verify travel session starts
3. Check console for WebSocket messages
4. Verify progress updates appear in TravelPanel
5. Test event choices (if events occur)
6. Verify travel completion

### 5. Test Error Handling
1. Stop backend server while traveling
2. Verify frontend shows reconnection attempt
3. Restart backend
4. Verify frontend reconnects automatically

---

## Expected Frontend Behavior

### When Routes Are Available
1. ✅ WebSocket connection establishes on dashboard load
2. ✅ Travel sessions can be started via map click
3. ✅ Progress updates appear in real-time
4. ✅ Events slide in with animations
5. ✅ Choice buttons respond to clicks
6. ✅ Event log populates with history

### Current Behavior (Without Backend)
1. ⚠️ WebSocket connection fails (expected)
2. ⚠️ API calls return 404 (expected)
3. ✅ TravelPanel shows "No active journey"
4. ✅ Mock utilities work in browser console

---

## Troubleshooting

### WebSocket Connection Fails
- Verify backend server is running on port 3001
- Check `/ws/travel` route is registered
- Verify `characterId` query parameter is included
- Check CORS settings allow WebSocket upgrades

### API Endpoints Return 404
- Verify routes are imported in `server.ts`
- Check route registration: `app.use('/api/travel', travelRoutes)`
- Verify endpoint paths match exactly (case-sensitive)

### Events Not Appearing
- Check TravelSessionService is emitting events
- Verify WebSocket message format matches expected types
- Check browser console for JSON parse errors
- Verify event payload includes all required fields

---

## Reference Documentation

For detailed technical specifications, see:
- `/srv/project-chimera/frontend/TRAVEL_UI_IMPLEMENTATION.md` - Frontend implementation details
- `/srv/project-chimera/TRAVEL_UI_ARCHITECTURE.md` - Architecture diagrams
- `/srv/project-chimera/AGENT_4_COMPLETION_REPORT.md` - Full completion report

---

## Questions?

If you have questions about the frontend implementation or need clarification on the expected API contract, please refer to the documentation files listed above.

The frontend is fully implemented and awaiting your backend routes. Once you complete Task 3.1, we can proceed with integration testing.

---

## Summary Checklist for Agent 3

- [ ] Create `/srv/project-chimera/backend/src/routes/travelRoutes.ts`
- [ ] Implement `POST /api/travel/start`
- [ ] Implement `POST /api/travel/choose`
- [ ] Implement `POST /api/travel/cancel`
- [ ] Implement `GET /api/travel/status`
- [ ] Implement WebSocket handler at `/ws/travel`
- [ ] Register routes in `server.ts`
- [ ] Test WebSocket connection
- [ ] Test REST API endpoints
- [ ] Verify integration with frontend

**Good luck! The frontend is ready and waiting for your backend routes. 🚀**

---

**End of Handoff Document**
