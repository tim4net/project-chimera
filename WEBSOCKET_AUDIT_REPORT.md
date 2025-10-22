# WebSocket Implementation Audit Report
**Date**: 2025-10-21
**Agent**: Agent 1 (Backend Infrastructure)
**Task**: Task 1.1 - Audit Current WebSocket Setup

---

## Executive Summary

**WebSocket Status**: **NEEDS IMPLEMENTATION** - No WebSocket infrastructure exists in the codebase.

The Nuaibria project currently has NO WebSocket implementation. All real-time communication must be built from scratch.

---

## Audit Findings

### 1. Package Dependencies

#### Backend (`/srv/project-chimera/backend/package.json`)
- **socket.io**: ❌ NOT INSTALLED
- **ws**: ❌ NOT INSTALLED (only in node_modules as transitive dependency)
- Current dependencies: express, cors, helmet, @supabase/supabase-js, @google/generative-ai

#### Frontend (`/srv/project-chimera/frontend/package.json`)
- **socket.io-client**: ❌ NOT INSTALLED
- **ws**: ✅ INSTALLED (v8.18.3) - but not configured or used
- Current dependencies: React, Vite, Zustand, @supabase/supabase-js, React Router

### 2. Backend Infrastructure

#### Server Setup (`/srv/project-chimera/backend/src/server.ts`)
- Uses Express app with `app.listen()` directly
- Does NOT expose HTTP server instance needed for Socket.io
- No WebSocket server initialization
- No WebSocket middleware
- **Issue**: Socket.io requires access to the HTTP server instance, not just Express app

#### WebSocket Server Files
- `/srv/project-chimera/backend/src/websocket/`: ❌ DOES NOT EXIST
- WebSocket routes: ❌ NONE FOUND
- WebSocket services: ❌ NONE FOUND

### 3. Type Definitions

#### Backend Types (`/srv/project-chimera/backend/src/types/`)
- `websocket.ts`: ❌ DOES NOT EXIST
- Existing type files:
  - `actions.ts` - game actions
  - `chat.ts` - chat types
  - `database.ts` - DB types
  - `encounter-types.ts`, `landmark-types.ts`, `npc-types.ts`, `road-types.ts`
  - `index.ts` - type exports
  - `map.ts`, `quests.ts`

**Missing**: No WebSocket message types, event types, or Socket.io types

### 4. Frontend Infrastructure

#### Hooks Directory (`/srv/project-chimera/frontend/src/hooks/`)
- Existing hooks:
  - `useAssetGeneration.ts` - asset generation hook
  - `usePhaserGame.ts` - Phaser game integration
- `useWebSocket.ts`: ❌ DOES NOT EXIST

#### Services Directory
- `/srv/project-chimera/frontend/src/services/`: ❌ DOES NOT EXIST
- No WebSocket service layer
- No connection management
- No reconnection logic

### 5. Integration Points

#### Current Communication Pattern
- RESTful API endpoints via Express routes
- Direct Supabase client calls from frontend
- No real-time push notifications
- No live game state updates

#### Routes That Could Benefit from WebSocket
1. `/api/chat/dm` (dmChatSecure.ts) - AI DM conversation
2. `/api/active` - Active phase combat
3. `/api/active-events` - Real-time event updates
4. `/api/idle` - Idle task completion notifications
5. `/api/tension` - Tension level changes
6. `/api/party` - Multiplayer party updates (post-MVP)

---

## Missing Components Breakdown

### Backend Components
1. **Socket.io Server Package** - Not installed
2. **WebSocket Server Module** (`backend/src/websocket/index.ts`)
   - Server initialization
   - Connection handling
   - Authentication middleware
   - Event routing
3. **Type Definitions** (`backend/src/types/websocket.ts`)
   - Message types
   - Event names (enums)
   - Client-to-Server events
   - Server-to-Client events
   - Socket data interfaces
4. **HTTP Server Refactor** (`backend/src/server.ts`)
   - Expose HTTP server instance
   - Initialize Socket.io with server
   - Mount WebSocket middleware

### Frontend Components
1. **Socket.io Client Package** - Not installed
2. **WebSocket Hook** (`frontend/src/hooks/useWebSocket.ts`)
   - Connection management
   - Auto-reconnection
   - Event listeners
   - Message sending
   - Connection status tracking
3. **Type Definitions** (shared from backend or frontend-specific)
   - Message type contracts
   - Event name constants

### Integration Components
1. **Authentication Bridge**
   - Supabase JWT verification in WebSocket handshake
   - Session validation
2. **Error Handling**
   - Connection failures
   - Message errors
   - Timeout handling
3. **Testing Infrastructure**
   - Connection tests
   - Message round-trip tests
   - Reconnection tests

---

## Implementation Priority

### Phase 1: Core Infrastructure (Tasks 1.2-1.5)
1. Install dependencies (socket.io, socket.io-client)
2. Create type contracts
3. Implement WebSocket server
4. Refactor server.ts to expose HTTP server
5. Create frontend useWebSocket hook
6. Test end-to-end connection

### Phase 2: Game Integration (Subsequent Tasks)
1. Integrate with game state services
2. Add authentication middleware
3. Implement game-specific message handlers
4. Update UI components to use WebSocket

### Phase 3: Advanced Features (Post-MVP)
1. Reconnection with state sync
2. Message queuing and retry
3. Compression and optimization
4. Rate limiting and abuse prevention

---

## Technical Recommendations

### Socket.io vs Native WebSocket
**Recommendation**: Use **Socket.io** for the following reasons:
1. Built-in reconnection logic
2. Fallback to HTTP long-polling
3. Room/namespace support for multiplayer (post-MVP)
4. Event-based API (cleaner than raw WebSocket)
5. Built-in binary support
6. Mature ecosystem with TypeScript support

### Architecture Pattern
```
Frontend (React Component)
    ↓
useWebSocket Hook (Connection Manager)
    ↓
socket.io-client
    ↓ [WebSocket Protocol]
    ↓
socket.io (Backend Server)
    ↓
Event Handlers (Game Logic)
    ↓
Supabase (State Persistence)
```

### Message Flow Example
```typescript
// Frontend sends action
socket.emit('game:action', { type: 'ATTACK', targetId: '123' });

// Backend processes
socket.on('game:action', async (data) => {
  const result = await processAction(data);
  socket.emit('game:state_update', result);
});

// Frontend receives update
socket.on('game:state_update', (state) => {
  updateGameState(state);
});
```

---

## Blockers Identified

### No Critical Blockers
All required infrastructure can be implemented incrementally.

### Minor Considerations
1. **Server Refactor**: Need to expose HTTP server from Express app (low risk)
2. **Container Networking**: WebSocket port (default 3001) must be exposed in docker-compose.yml
3. **CORS Configuration**: WebSocket handshake requires CORS headers (already configured for REST)
4. **Authentication**: Need to integrate Supabase JWT verification (pattern exists in dmChatSecure.ts)

---

## Next Steps

1. **IMMEDIATE**: Install socket.io packages (Task 1.2)
   ```bash
   cd /srv/project-chimera/backend && npm install socket.io
   cd /srv/project-chimera/frontend && npm install socket.io-client
   ```

2. **Define Contracts**: Create type definitions (Task 1.3)
   - Backend: `/srv/project-chimera/backend/src/types/websocket.ts`
   - Export from `/srv/project-chimera/backend/src/types/index.ts`

3. **Build Server**: Implement WebSocket server (Task 1.4)
   - Create `/srv/project-chimera/backend/src/websocket/index.ts`
   - Implement connection handling
   - Add authentication middleware

4. **Integrate**: Refactor server.ts (Task 1.5)
   - Export HTTP server instance
   - Initialize Socket.io
   - Mount WebSocket middleware

5. **Build Client**: Create useWebSocket hook (Task 1.6)
   - Connection management
   - Event listeners
   - Auto-reconnection

6. **Test**: End-to-end connection test (Task 1.7)
   - Test connection handshake
   - Test message round-trip
   - Test reconnection

---

## Estimated Timeline

- **Task 1.2** (Install): 5 minutes
- **Task 1.3** (Types): 15 minutes
- **Task 1.4** (Server): 30 minutes
- **Task 1.5** (Integration): 15 minutes
- **Task 1.6** (Client Hook): 30 minutes
- **Task 1.7** (Testing): 20 minutes

**Total**: ~2 hours for complete WebSocket infrastructure

---

## Conclusion

The Nuaibria project has NO existing WebSocket implementation. All components must be built from scratch. However, the codebase is well-structured with clear separation of concerns, making WebSocket integration straightforward.

The primary work involves:
1. Installing dependencies
2. Creating type contracts
3. Building server and client modules
4. Testing connectivity

No major architectural changes are required. The existing Express server can be easily adapted to support Socket.io.

**Status**: Ready to proceed with implementation (Tasks 1.2-1.7)
