# WebSocket Quick Start Guide

## For Developers: How to Use WebSocket in Your Components

### 1. Import the Hook
```typescript
import { useWebSocket, ServerEvents } from '../hooks/useWebSocket';
```

### 2. Initialize in Your Component
```typescript
function MyGameComponent() {
  const ws = useWebSocket({
    autoConnect: true,
    autoAuthenticate: true,
    token: supabaseSession?.access_token,
    characterId: currentCharacter?.id,
    onConnect: () => console.log('Connected!'),
    onDisconnect: (reason) => console.log('Disconnected:', reason),
  });

  // Rest of your component...
}
```

### 3. Listen for Server Events
```typescript
useEffect(() => {
  // Listen for DM messages
  ws.on(ServerEvents.DM_MESSAGE, (data) => {
    console.log('DM says:', data.message);
    // Update UI with new message
  });

  // Listen for character updates
  ws.on(ServerEvents.CHARACTER_UPDATE, (data) => {
    console.log('Character updated:', data);
    // Update character state
  });

  // Cleanup listeners on unmount
  return () => {
    ws.off(ServerEvents.DM_MESSAGE, () => {});
    ws.off(ServerEvents.CHARACTER_UPDATE, () => {});
  };
}, [ws]);
```

### 4. Send Messages to Server
```typescript
// Send chat message to DM
const handleSendMessage = (message: string) => {
  ws.sendChatMessage(characterId, message);
};

// Send game action
const handleAttack = (targetId: string) => {
  ws.sendGameAction(characterId, 'ATTACK', targetId);
};

// Raw emit (advanced)
ws.emit(ClientEvents.GAME_ACTION, {
  characterId,
  actionType: 'USE_ITEM',
  target: itemId,
  metadata: { slot: 'inventory' }
});
```

### 5. Check Connection Status
```typescript
// Connection state
{ws.isConnected ? 'Online' : 'Offline'}

// Detailed status
{ws.status} // 'disconnected', 'connecting', 'connected', 'authenticated'

// Conditional rendering
{ws.isAuthenticated && (
  <button onClick={handleSendMessage}>Send Message</button>
)}
```

### 6. Manual Connection Control
```typescript
// Connect manually
<button onClick={() => ws.connect()}>Connect</button>

// Disconnect
<button onClick={() => ws.disconnect()}>Disconnect</button>

// Re-authenticate
<button onClick={() => ws.authenticate(newToken, characterId)}>
  Re-authenticate
</button>
```

---

## Backend: How to Send Messages from Services

### 1. Import Broadcast Functions
```typescript
import {
  broadcastToCharacter,
  broadcastToUser,
  broadcastToAll,
} from '../websocket';
import { ServerEvents } from '../types/websocket';
```

### 2. Broadcast to Specific Character
```typescript
// Example: Character HP changed
broadcastToCharacter(characterId, ServerEvents.CHARACTER_UPDATE, {
  characterId,
  state: {
    hp: newHp,
  },
  timestamp: Date.now(),
});
```

### 3. Broadcast to All User's Sockets
```typescript
// Example: User notification
broadcastToUser(userId, ServerEvents.NOTIFICATION, {
  type: 'INFO',
  message: 'Quest completed!',
  timestamp: Date.now(),
});
```

### 4. Broadcast to Everyone
```typescript
// Example: World event
broadcastToAll(ServerEvents.WORLD_EVENT, {
  eventType: 'EPOCH',
  data: {
    title: 'New Era Begins',
    description: 'The world has changed...',
  },
  timestamp: Date.now(),
});
```

---

## Common Patterns

### Pattern 1: Real-time Chat with DM
```typescript
// Frontend
const [messages, setMessages] = useState([]);

useEffect(() => {
  ws.on(ServerEvents.DM_MESSAGE, (data) => {
    setMessages(prev => [...prev, data]);
  });
}, [ws]);

const sendMessage = (text: string) => {
  ws.sendChatMessage(characterId, text);
};
```

### Pattern 2: Combat Turn Notifications
```typescript
// Frontend
useEffect(() => {
  ws.on(ServerEvents.ACTIVE_TURN_START, (data) => {
    if (data.characterId === myCharacterId) {
      showNotification("It's your turn!");
    }
  });
}, [ws]);
```

### Pattern 3: Idle Task Completion
```typescript
// Backend (in idle task service)
import { broadcastToCharacter } from '../websocket';

async function completeIdleTask(characterId: string, taskType: string) {
  // Process task...
  const result = await processTask();

  // Notify client in real-time
  broadcastToCharacter(characterId, ServerEvents.IDLE_TASK_COMPLETE, {
    characterId,
    taskType,
    result: {
      success: true,
      narrative: "You arrived at the village...",
      rewards: { xp: 50 }
    },
    timestamp: Date.now(),
  });
}
```

---

## Event Reference

### Client → Server Events
- `auth:authenticate` - Authenticate with JWT
- `chat:message` - Send message to DM
- `game:action` - Perform game action
- `active:turn_action` - Take combat turn action
- `idle:task_start` - Start idle task
- `subscribe:character` - Subscribe to character updates
- `unsubscribe:character` - Unsubscribe from character

### Server → Client Events
- `connected` - Connection established
- `authenticated` - Authentication successful
- `auth:error` - Authentication failed
- `dm:message` - DM narrative response
- `game:state_update` - Game state changed
- `character:update` - Character stats changed
- `active:turn_start` - Combat turn started
- `active:combat_update` - Combat state changed
- `idle:task_complete` - Idle task finished
- `world:event` - World event occurred
- `notification` - General notification
- `error` - Error occurred

---

## Debugging Tips

### Enable Verbose Logging
```typescript
// Frontend
const ws = useWebSocket({
  autoConnect: true,
  onConnect: () => console.log('[WS] Connected'),
  onDisconnect: (reason) => console.log('[WS] Disconnected:', reason),
  onError: (error) => console.error('[WS] Error:', error),
});
```

### Check Socket ID
```typescript
console.log('Socket ID:', ws.socket?.id);
```

### Monitor Events (Browser Console)
```typescript
// Add this to your component for debugging
useEffect(() => {
  const logEvent = (eventName: string) => (data: any) => {
    console.log(`[WS Event] ${eventName}:`, data);
  };

  ws.on(ServerEvents.DM_MESSAGE, logEvent('DM_MESSAGE'));
  ws.on(ServerEvents.GAME_STATE_UPDATE, logEvent('GAME_STATE_UPDATE'));
  // ... add more events
}, [ws]);
```

### Backend Logging
Backend automatically logs:
- Connection/disconnection events
- Authentication attempts
- Event emissions

Check console for `[WebSocket]` prefixed logs.

---

## Production Checklist

Before deploying to production:

1. [ ] Set `VITE_BACKEND_URL` to production URL
2. [ ] Configure CORS with production origin only
3. [ ] Add rate limiting per socket
4. [ ] Enable compression for large payloads
5. [ ] Set up monitoring/alerts for WebSocket health
6. [ ] Test reconnection behavior on network failures
7. [ ] Verify authentication token refresh logic
8. [ ] Add error boundaries around WebSocket components
9. [ ] Test with slow/unstable network conditions
10. [ ] Load test with expected concurrent user count

---

## Need Help?

- **Type Definitions**: See `/srv/project-chimera/backend/src/types/websocket.ts`
- **Hook Implementation**: See `/srv/project-chimera/frontend/src/hooks/useWebSocket.ts`
- **Server Implementation**: See `/srv/project-chimera/backend/src/websocket/index.ts`
- **Full Documentation**: See `WEBSOCKET_IMPLEMENTATION_SUMMARY.md`
- **Test Component**: See `/srv/project-chimera/frontend/src/components/WebSocketTest.tsx`
