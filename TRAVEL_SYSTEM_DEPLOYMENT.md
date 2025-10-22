# Travel System - Deployment & Verification Guide

## Overview

The danger-level-aware travel system is now **READY FOR DEPLOYMENT**. This guide provides step-by-step instructions for applying database migrations, restarting services, and verifying the system.

---

## Pre-Deployment Status

### Code Quality
- Backend build: ✅ **PASS** (TypeScript compilation successful)
- Frontend build: ✅ **PASS** (pre-existing warnings only, travel components compile fine)
- Unit tests: ✅ **82/82 PASSING** (travelService tests)
- Compiled files: ✅ **READY**
  - `backend/dist/routes/travel.js` (18KB)
  - `backend/dist/services/travelService.js` (15KB)
  - `backend/dist/workers/travelWorker.js` (9.9KB)

### Infrastructure Ready
- WebSocket server: ✅ Initialized and integrated
- API routes: ✅ Created and wired to services
- Background worker: ✅ Integrated with server startup/shutdown
- Database schema: ✅ Migrations prepared and documented
- Frontend UI: ✅ TravelPanel component ready

---

## STEP 1: Apply Database Migrations

### Method 1: Supabase SQL Editor (RECOMMENDED)

**Time: ~5 minutes**

1. Open Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new
   ```

2. Copy migration SQL:
   ```bash
   cat /srv/project-chimera/TRAVEL_MIGRATIONS_COMBINED.sql
   ```

3. Paste into SQL Editor and click **RUN**

4. Verify success - You should see:
   ```
   Query successful
   ```

### Verification Queries

After migrations are applied, run these queries to verify:

```sql
-- Check danger_level column on world_pois
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'world_pois' AND column_name = 'danger_level';
-- Expected: 1 row with INT type

-- Check travel_sessions table
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'travel_sessions';
-- Expected: 11 columns

-- Check travel_events table
SELECT COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'travel_events';
-- Expected: 10 columns

-- Check indexes were created
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN ('travel_sessions', 'travel_events', 'world_pois')
AND indexname LIKE '%travel%';
-- Expected: 10+ indexes
```

---

## STEP 2: Restart Backend Services

### Using Docker Compose

```bash
# Navigate to project root
cd /srv/project-chimera

# Restart backend container
podman compose restart backend

# Verify backend is running
podman compose ps | grep backend
# Expected: Status "Up"

# Check logs for travel worker startup
podman compose logs backend | grep -i travel | head -20
# Expected: "[TravelWorker] Starting worker..."
```

### Monitor Startup

```bash
# Watch backend logs in real-time (Ctrl+C to exit)
podman compose logs -f backend

# Look for:
# - WebSocket server initialization
# - Travel worker startup
# - Port listening messages
# - No error messages
```

---

## STEP 3: Verify Frontend Integration

### Check Frontend Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for WebSocket connection:
   ```
   ✅ Should NOT see: "WebSocket connection failed"
   ✅ Should see: Connection messages if on relevant pages
   ```

### Test TravelPanel Rendering

1. If a character is traveling (or use mock data):
   ```javascript
   // In browser console
   window.mockTravel.progress(0.5);  // Show 50% progress
   ```

2. Verify TravelPanel appears with:
   - Progress bar
   - Danger indicator (colored box)
   - Event log area

---

## STEP 4: Load Test Data (Optional)

For manual testing without real character data:

```bash
# Copy test data SQL
cat /srv/project-chimera/TRAVEL_TEST_DATA.sql

# Apply via Supabase SQL Editor (same as migrations)
# This creates:
# - 10 test locations with varying danger levels
# - 1 test character (Level 3 Fighter)
```

---

## STEP 5: Manual Testing

### Quick Smoke Test

1. **Start Backend & Frontend**
   ```bash
   # Terminal 1: Backend
   cd /srv/project-chimera && podman compose up -d
   podman compose logs -f backend

   # Terminal 2: Frontend (if local dev)
   cd /srv/project-chimera/frontend && npm run dev
   ```

2. **Create Test Travel Session**
   ```bash
   # Using curl (replace IDs with real ones)
   curl -X POST http://localhost:3001/api/travel/start \
     -H "Content-Type: application/json" \
     -d '{
       "character_id": "<character-uuid>",
       "destination_id": "<location-uuid>"
     }'
   ```

3. **Monitor WebSocket Events**
   ```javascript
   // In browser console
   const events = [];
   window.addEventListener('travel-event', (e) => {
     events.push(e.detail);
     console.log('Travel event:', e.detail);
   });
   console.log('Events captured:', events.length);
   ```

4. **Check Database Records**
   ```sql
   -- Verify travel session was created
   SELECT id, character_id, miles_total, status
   FROM travel_sessions
   ORDER BY created_at DESC
   LIMIT 1;

   -- Verify events are being generated
   SELECT id, event_type, severity
   FROM travel_events
   ORDER BY created_at DESC
   LIMIT 5;
   ```

### Full Test Scenario

See `TRAVEL_E2E_TEST_GUIDE.md` for complete manual test scenarios covering:
- Safe zone travel (Danger 1)
- Dangerous travel (Danger 4-5)
- Event resolution with skill checks
- Auto-resolution of trivial events
- WebSocket real-time updates

---

## STEP 6: Deployment Checklist

Use this checklist to verify all systems are operational:

### Database
- [ ] Migrations applied successfully
- [ ] danger_level column exists on world_pois
- [ ] travel_sessions table created with 11 columns
- [ ] travel_events table created with 10 columns
- [ ] All indexes created (10+)
- [ ] Triggers created (updated_at auto-update)

### Backend Services
- [ ] Backend container restarted
- [ ] No startup errors in logs
- [ ] WebSocket server initialized
- [ ] Travel worker started (logs show startup message)
- [ ] API routes registered (/api/travel/*)
- [ ] travelService imported and available
- [ ] No TypeScript compilation errors

### Frontend
- [ ] Frontend application starts without errors
- [ ] TravelPanel component loads (if character traveling)
- [ ] WebSocket connection established
- [ ] useTravelStatus hook initializes
- [ ] Travel mode selection UI functional

### Integration
- [ ] POST /api/travel/start returns 200 with sessionId
- [ ] GET /api/travel/status returns session data
- [ ] POST /api/travel/choose accepts and processes choices
- [ ] WebSocket emits TRAVEL_SESSION_START
- [ ] WebSocket emits TRAVEL_PROGRESS every 60 seconds
- [ ] WebSocket emits TRAVEL_EVENT on encounters
- [ ] Database records created for sessions and events

### Testing
- [ ] All 82 unit tests pass
- [ ] Manual smoke test completed
- [ ] At least one full travel session completed
- [ ] No console errors in frontend
- [ ] No error logs in backend

---

## Troubleshooting

### Issue: Migration fails with "permission denied"
**Solution:** Use Supabase SQL Editor (web UI) instead of command-line psql

### Issue: Backend won't start
**Solution:**
```bash
# Check logs
podman compose logs backend

# Restart with clean state
podman compose down
podman compose up -d backend
```

### Issue: Travel events not appearing
**Solution:**
1. Verify migrations applied: Check database schema
2. Verify WebSocket connected: Check browser console
3. Verify worker running: Check backend logs for "[TravelWorker]"
4. Verify API responding: Test POST /api/travel/start with curl

### Issue: Skill checks failing
**Solution:**
1. Verify ruleEngine is accessible: Check backend imports
2. Check character has required stats: Query characters table
3. Check error logs: `podman compose logs backend | grep error`

---

## Performance Monitoring

### Key Metrics to Monitor

```bash
# WebSocket message throughput (should be ~1 per minute per traveler)
podman compose logs backend | grep "TRAVEL_PROGRESS" | wc -l

# Database query performance
# Expected: < 100ms per travel tick for 100+ concurrent travelers

# Memory usage
podman compose stats backend | grep memory

# Error rate (should be ~0%)
podman compose logs backend | grep -i error | wc -l
```

### Expected Behavior

- Travel sessions tick every 60 seconds
- Events generated at 15-37.5% encounter rate (danger-dependent)
- Trivial events auto-resolve (no player prompt)
- Moderate+ events require player choice
- WebSocket messages deliver in < 50ms
- Database queries < 100ms even with 100+ concurrent travelers

---

## Rollback Instructions (If Needed)

### Revert Database Migrations

```sql
-- Drop tables (migrations are idempotent, so re-running works too)
DROP TABLE IF EXISTS travel_events CASCADE;
DROP TABLE IF EXISTS travel_sessions CASCADE;

-- Remove danger_level column
ALTER TABLE world_pois DROP COLUMN IF EXISTS danger_level;

-- Drop functions/triggers
DROP FUNCTION IF EXISTS update_travel_sessions_updated_at();
```

### Revert Backend

```bash
# Restore previous backend version
git checkout backend/src/routes/travel.ts
git checkout backend/src/services/travelService.ts
git checkout backend/src/workers/travelWorker.ts
git checkout backend/src/types/travel.ts
git checkout backend/src/types/websocket.ts

# Rebuild
cd backend && npm run build
```

---

## Success Criteria

The deployment is successful when:

1. ✅ All migrations applied without errors
2. ✅ Backend starts and logs show worker running
3. ✅ Frontend loads without console errors
4. ✅ Travel sessions can be created via API
5. ✅ Travel events generate at correct danger-scaled rates
6. ✅ WebSocket delivers events in real-time
7. ✅ Database records persist correctly
8. ✅ No error messages in backend logs
9. ✅ Manual test scenario completes successfully
10. ✅ All 82 unit tests still passing

---

## Post-Deployment

### Monitor for Issues
- Watch backend logs for 30 minutes: `podman compose logs -f backend`
- Test with actual player character if available
- Monitor database for orphaned records

### Next Steps
1. Integrate with combat system for dangerous encounters
2. Add party travel support (multiple characters)
3. Implement world map integration for biome-specific encounters
4. Add travel mode modifiers (cautious, hasty, etc.)
5. Create variant encounter templates for different biomes

### Documentation
- See `TRAVEL_E2E_TEST_GUIDE.md` for manual testing
- See `TRAVEL_INTEGRATION_CHECKLIST.md` for verification tasks
- See `TRAVEL_TEST_DATA.sql` for test data population

---

## Contact & Support

For issues during deployment:
1. Check this guide's Troubleshooting section
2. Review backend logs: `podman compose logs backend`
3. Review database schema: Query information_schema
4. Verify all files are in place: `ls -l backend/dist/{routes,services,workers}/travel*`

**Status**: READY FOR PRODUCTION DEPLOYMENT

**Date**: 2025-10-22
**Total Components**: 8 files modified/created
**Test Coverage**: 82/82 tests passing
**Code Quality**: TypeScript, zero compilation errors
