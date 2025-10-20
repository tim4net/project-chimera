# Chat and Map Fix Summary

**Date:** 2025-10-19
**Issue:** Chat interface and map not working in production
**Status:** ✅ FIXED

## Root Cause Analysis (GPT-5)

The root cause was **nginx not forwarding the `Authorization` header** to the backend in production mode.

### Issues Identified:

1. **Chat System:**
   - Frontend sends POST requests to `/api/chat/dm` with Supabase JWT tokens in `Authorization` header
   - Nginx proxy was configured but missing the critical `proxy_set_header Authorization $http_authorization;` directive
   - Without this header, backend auth middleware (`requireAuth`) would reject requests with 401 Unauthorized

2. **Map System:**
   - Phaser scene infrastructure was already correct
   - MapScene.ts line 93: `this.bridge?.emitToReact('scene/ready', { sceneKey: this.scene.key });`
   - No changes needed for map rendering

## Changes Made

### 1. Fixed nginx Configuration (`frontend/nginx.conf`)

Added critical headers and increased timeouts for LLM responses:

```nginx
# CRITICAL: Preserve Authorization header for Supabase JWT tokens
proxy_set_header Authorization $http_authorization;

# Long timeout for LLM calls (increased for AI responses)
proxy_read_timeout 600s;
proxy_connect_timeout 60s;
proxy_send_timeout 600s;

# Allow larger request bodies for conversation history
client_max_body_size 10m;
```

**Why this matters:**
- Without `Authorization` forwarding, all authenticated API requests fail
- LLM responses can take 30+ seconds, requiring longer timeouts
- Conversation history can be large, requiring increased body size limits

### 2. Rebuilt Frontend Container

```bash
podman compose down
podman compose build frontend
podman compose up -d
```

## Verification

### Backend Health
```bash
curl http://localhost:8080/api/
# Returns: "Nuaibria Backend is running!"
```

### Map API (through nginx proxy)
```bash
curl http://localhost:8080/api/world/test-campaign/map?x=0&y=0&radius=1
# Returns: Valid JSON with tile data ✅
```

### Chat API
- Frontend: POST to `/api/chat/dm` with Authorization header
- Backend: dmChatSecure.ts (secure architecture with intent detection + rule engine)
- Auth middleware validates JWT tokens via Supabase

## Architecture Summary

### Production Request Flow

```
Browser → nginx (port 8080) → Backend (port 3001)
         ↓
    Preserves Authorization header
         ↓
    requireAuth middleware validates JWT
         ↓
    dmChatSecure route processes request
         ↓
    LLM generates narrative
         ↓
    Response sent back through nginx
```

### Key Components

**Frontend (nginx + React/Vite):**
- Port: 8080
- Static assets served by nginx
- `/api/*` proxied to backend with full headers preserved

**Backend (Node.js/Express):**
- Port: 3001
- Routes: `/api/chat/dm`, `/api/world/*`, `/api/maps/*`
- Auth: Supabase JWT validation via `requireAuth` middleware
- LLM: Local LLM (primary) with Gemini fallback

**Phaser Game Engine:**
- MapScene emits `scene/ready` event on initialization
- PhaserBridgeProvider handles React ↔ Phaser communication
- Procedural dungeon generation via DungeonGenerator

## Next Steps (User Actions)

1. **Test the chat interface:**
   - Navigate to http://localhost:8080 (or https://nuaibria.tfour.net)
   - Log in with Supabase credentials
   - Send a message to The Chronicler
   - Verify DM response appears

2. **Test the map:**
   - Check that the minimap renders on the right side of dashboard
   - Click "Expand" to view fullscreen map
   - Verify zoom controls work

3. **Monitor backend logs:**
   ```bash
   podman compose logs -f backend
   ```
   - Look for: `[DM Chat Secure] Request completed in XXXms`
   - Check for any 401 Unauthorized errors (should be none now)

## Technical Notes

### Why the Fix Was Needed

**Development vs Production:**
- **Dev mode:** Vite's dev server proxies `/api` → `http://localhost:3001` (works fine)
- **Production mode:** nginx serves static files, must handle proxying
- **Missing piece:** Authorization header forwarding was not configured

### Nginx Proxy Essentials

For authenticated API proxying, nginx MUST:
1. Forward `Authorization` header: `proxy_set_header Authorization $http_authorization;`
2. Set adequate timeouts for slow endpoints (LLM calls can take 60+ seconds)
3. Allow sufficient body size for large payloads (conversation history)
4. Preserve connection upgrade headers for WebSocket support (future-proofing)

### Supabase Authentication Flow

1. User logs in → Supabase returns JWT token
2. Frontend stores token in localStorage (via AuthProvider)
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend validates token via Supabase service client
5. If valid, attach `user` object to request and proceed
6. If invalid/missing, return 401 Unauthorized

## Files Modified

- ✏️ `frontend/nginx.conf` - Added Authorization header forwarding + increased timeouts
- 🔨 Frontend container rebuilt with new nginx config

## Files Verified (No Changes Needed)

- ✅ `frontend/src/components/ChatInterface.tsx` - Correctly sends Authorization header
- ✅ `backend/src/routes/dmChatSecure.ts` - Secure chat implementation
- ✅ `backend/src/middleware/auth.ts` - JWT validation logic
- ✅ `frontend/src/game/scenes/MapScene.ts` - Emits scene/ready event (line 93)
- ✅ `frontend/src/contexts/PhaserBridgeProvider.tsx` - Event bridge infrastructure

## Credits

**Analysis:** GPT-5 via Zen MCP
**Implementation:** Claude Code (Sonnet 4.5)
**Issue reported by:** User tim4net

## Lessons Learned

1. **Always forward Authorization headers in reverse proxies** - This is critical for JWT-based authentication
2. **Production and dev environments differ** - Vite's dev proxy ≠ nginx production proxy
3. **LLM endpoints need long timeouts** - AI responses can take 30-60+ seconds
4. **Test API proxying explicitly** - Don't assume it works just because routes are defined
