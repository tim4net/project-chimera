# Travel System Integration Checklist

## Overview

This checklist ensures all components of the travel system are properly integrated, tested, and ready for end-to-end player testing. Complete each section in order, marking items as complete only when verified.

---

## Phase 1: Database Setup

### Database Migrations
- [ ] `travel_sessions` table created
  - Verify: `\d travel_sessions` in psql
  - Required columns: id, character_id, destination_id, destination_x, destination_y, miles_total, miles_traveled, travel_mode, status
  - Status values: 'active', 'paused', 'completed', 'cancelled'
  - Foreign key: character_id → characters(id)

- [ ] `travel_events` table created
  - Verify: `\d travel_events` in psql
  - Required columns: id, session_id, type, severity, description, choices, requires_response, resolved, resolution
  - Severity enum: 'trivial', 'minor', 'moderate', 'dangerous', 'deadly'
  - Foreign key: session_id → travel_sessions(id) ON DELETE CASCADE

- [ ] `world_pois` has danger_level column
  - Verify: `SELECT danger_level FROM world_pois LIMIT 1;`
  - Type: INTEGER CHECK (danger_level BETWEEN 1 AND 5)
  - Default: 1 (safe)

- [ ] Indexes created for performance
  - travel_sessions: character_id, status, created_at
  - travel_events: session_id, severity, resolved, created_at

- [ ] Test data loaded
  - Run: `psql <connection-string> -f TRAVEL_TEST_DATA.sql`
  - Verify: 10 test locations with varying danger levels
  - Verify: Test character "Test Adventurer" exists

**Database Setup Complete**: [ ]

---

## Phase 2: Backend Services

### Travel Service (Core Business Logic)
- [ ] `backend/src/services/travelService.ts` exists
- [ ] ENCOUNTER_POOLS defined for all 5 severity levels
  - trivial: 4 events
  - minor: 4 events
  - moderate: 4 events
  - dangerous: 4 events
  - deadly: 3 events

- [ ] `calculateSeverity()` function implemented
  - Danger level 1: 70% trivial, 25% minor, 5% moderate
  - Danger level 2: 40% trivial, 40% minor, 15% moderate, 5% dangerous
  - Danger level 3: 20% each (balanced)
  - Danger level 4: 10% trivial, 15% minor, 25% moderate, 35% dangerous, 15% deadly
  - Danger level 5: 10% trivial, 10% minor, 15% moderate, 30% dangerous, 35% deadly

- [ ] `generateTravelEvent()` function implemented
  - Generates events from severity pools
  - Returns TravelEvent with UUID, session_id, description, choices

- [ ] `autoResolveEvent()` function implemented
  - Auto-resolves trivial events
  - Returns contextual narration
  - Throws error for non-trivial events

- [ ] `generateTravelEventWithResolution()` function implemented
  - Combines generation + auto-resolution
  - Returns TravelEventGenerationResult with auto_resolved flag

### Travel Service Tests
- [ ] `backend/src/services/__tests__/travelService.test.ts` exists
- [ ] Test suite runs successfully
  - Run: `cd backend && npm test travelService`
  - All tests passing (70+ test cases)

- [ ] Coverage for ENCOUNTER_POOLS structure
- [ ] Coverage for calculateSeverity() distributions
- [ ] Coverage for generateTravelEvent() logic
- [ ] Coverage for autoResolveEvent() narration
- [ ] Coverage for integration workflows

**Backend Services Complete**: [ ]

---

## Phase 3: API Routes

### Travel API Routes
- [ ] `backend/src/routes/travel.ts` exists
- [ ] Routes compile without TypeScript errors
  - Run: `cd backend && npm run build`
  - Check: `dist/routes/travel.js` exists

- [ ] POST `/api/travel/start` endpoint implemented
  - Accepts: character_id, destination_id, travel_mode
  - Returns: sessionId, milesTotal, estimatedArrival, travelMode, message
  - Validates character exists
  - Calculates distance and ETA
  - Inserts travel_sessions record

- [ ] GET `/api/travel/status/:sessionId` endpoint implemented
  - Returns: session, events[], progressPercent, currentEvent
  - Fetches session from database
  - Fetches all events for session
  - Calculates progress percentage
  - Identifies current unresolved event

- [ ] POST `/api/travel/choose` endpoint implemented
  - Accepts: sessionId, choiceLabel
  - Performs skill check if choice has DC
  - Updates event as resolved
  - Returns: success, consequence, skillCheck, sessionCompleted

- [ ] Travel service integration
  - Routes call travelService functions
  - generateTravelEvent() used for event creation
  - autoResolveEvent() used for trivial events
  - Proper error handling and HTTP status codes

### API Integration Tests (Optional but Recommended)
- [ ] Integration tests for `/api/travel/start`
- [ ] Integration tests for `/api/travel/status/:sessionId`
- [ ] Integration tests for `/api/travel/choose`
- [ ] Tests with mock database or test database

**API Routes Complete**: [ ]

---

## Phase 4: WebSocket Integration

### WebSocket Server
- [ ] WebSocket server running on backend
  - Verify: Backend logs show WebSocket server started
  - Port: 3001 (or configured port)

- [ ] WebSocket message types defined
  - TRAVEL_PROGRESS
  - TRAVEL_EVENT
  - TRAVEL_COMPLETE
  - TRAVEL_ERROR

- [ ] `emitTravelEvent()` function wired to Socket.io
  - Emits TRAVEL_EVENT to specific character/session
  - Payload includes event data (id, description, severity, choices)

- [ ] `emitTravelProgress()` function wired to Socket.io
  - Emits TRAVEL_PROGRESS every N seconds (60 seconds default)
  - Payload includes milesTraveled, milesTotal, progressPercent

- [ ] WebSocket authentication/authorization
  - Only character owner receives events
  - Session ID validated before emission

### Background Worker (Travel Tick System)
- [ ] `backend/src/workers/backgroundWorker.ts` integrated
- [ ] Travel worker ticks every 60 seconds
- [ ] Worker increments `miles_traveled` each tick
- [ ] Worker generates events based on danger level
- [ ] Worker emits WebSocket updates
- [ ] Worker completes session when `miles_traveled >= miles_total`
- [ ] Worker updates character position on completion

**WebSocket Integration Complete**: [ ]

---

## Phase 5: Frontend Components

### TravelPanel Component (if implemented)
- [ ] `frontend/src/components/TravelPanel.tsx` exists
- [ ] Component renders without errors
  - Check: No TypeScript compilation errors
  - Check: Component appears in DashboardPage

- [ ] UI Elements
  - [ ] Progress bar (shows miles traveled / total)
  - [ ] Danger indicator (color-coded by danger level)
  - [ ] Current event display (description + choices)
  - [ ] Event log (scrollable history)
  - [ ] Start/Cancel travel buttons

- [ ] useTravelStatus Hook
  - [ ] WebSocket connection established
  - [ ] Auto-reconnect on disconnect
  - [ ] State management: currentSession, events[], currentEvent
  - [ ] Functions: startTravel(), chooseOption(), cancelTravel()

### Frontend WebSocket Integration
- [ ] Frontend connects to `ws://localhost:3001/ws/travel`
- [ ] Receives TRAVEL_PROGRESS messages
  - Updates progress bar in real-time
  - Updates miles traveled display

- [ ] Receives TRAVEL_EVENT messages
  - Displays event description
  - Renders choice buttons
  - Highlights severity with color-coded badges

- [ ] Receives TRAVEL_COMPLETE messages
  - Shows arrival notification
  - Clears travel UI
  - Updates character position on map

### Frontend Error Handling
- [ ] Network errors display user-friendly message
- [ ] WebSocket disconnects trigger reconnection attempt
- [ ] Invalid session ID shows error state
- [ ] No unhandled promise rejections in console

**Frontend Components Complete**: [ ]

---

## Phase 6: Integration Testing

### Manual Test Scenarios
- [ ] Scenario 1: Safe Zone Travel
  - Start travel to danger level 1 location
  - Observe mostly trivial events (70%)
  - Events auto-resolve without player input
  - Travel completes successfully

- [ ] Scenario 2: Dangerous Travel
  - Start travel to danger level 4-5 location
  - Observe frequent dangerous/deadly events
  - Events require player choices
  - Skill checks execute correctly

- [ ] Scenario 3: Event Resolution
  - Trigger moderate event with skill check
  - Select choice requiring skill check (DC 12-15)
  - Verify d20 roll displays
  - Verify success/failure narration
  - Event resolves and travel continues

- [ ] Scenario 4: Auto-Resolution
  - Observe trivial events in safe zone
  - Verify events resolve without player input
  - Verify narration appears
  - Verify progress continues

- [ ] Scenario 5: WebSocket Real-Time
  - Open browser DevTools Console
  - Watch WebSocket messages arrive
  - Verify TRAVEL_PROGRESS every 60 seconds
  - Verify TRAVEL_EVENT on encounters
  - Verify TRAVEL_COMPLETE on arrival

### Database Verification
- [ ] Travel sessions created in database
  - Query: `SELECT * FROM travel_sessions WHERE character_id = '<test-char-id>';`
  - Verify status updates: 'active' → 'completed'

- [ ] Travel events recorded in database
  - Query: `SELECT * FROM travel_events WHERE session_id = '<session-id>';`
  - Verify event structure: id, session_id, type, severity, description, choices
  - Verify resolved events have resolution text

- [ ] Character position updated on completion
  - Query: `SELECT position_x, position_y FROM characters WHERE id = '<test-char-id>';`
  - Verify position matches destination coordinates

**Integration Testing Complete**: [ ]

---

## Phase 7: Quality Assurance

### Console Errors
- [ ] No JavaScript errors in browser console
- [ ] No TypeScript compilation errors
- [ ] No React warnings (key props, state mutations, etc.)
- [ ] No unhandled promise rejections
- [ ] No CORS errors

### Performance
- [ ] API response times < 200ms
  - Test: Browser DevTools Network tab
  - /api/travel/start: < 200ms
  - /api/travel/choose: < 150ms

- [ ] WebSocket message latency < 50ms
  - Test: Console timestamp logs
  - Message sent → received < 50ms

- [ ] UI updates smoothly (no lag or jank)
  - Progress bar animates smoothly
  - Event cards slide in without stutter
  - Choice buttons respond immediately

### Error Handling
- [ ] Invalid character ID returns 404
- [ ] Invalid destination ID returns 400
- [ ] Invalid session ID returns 404
- [ ] Network failures show retry option
- [ ] Database errors logged (not exposed to user)

### Security
- [ ] Character ID validated on backend
- [ ] Session ID validated before updates
- [ ] User can only access own travel sessions
- [ ] SQL injection protected (parameterized queries)
- [ ] XSS protected (React escapes user input)

**Quality Assurance Complete**: [ ]

---

## Phase 8: Documentation

### Developer Documentation
- [ ] `TRAVEL_E2E_TEST_GUIDE.md` created
  - Prerequisites section
  - 5 manual test scenarios
  - Database verification queries
  - Expected behavior checklist
  - Troubleshooting guide

- [ ] `TRAVEL_TEST_DATA.sql` created
  - Test locations with varying danger levels
  - Test character creation
  - Migration verification
  - Cleanup instructions

- [ ] `TRAVEL_INTEGRATION_CHECKLIST.md` (this file) created
  - Comprehensive integration checklist
  - Phase-by-phase verification
  - Sign-off sections

### Code Documentation
- [ ] TypeScript types exported and documented
  - `backend/src/types/travel.ts` has JSDoc comments

- [ ] Service functions have JSDoc comments
  - `travelService.ts` functions documented
  - Parameter descriptions
  - Return type descriptions

- [ ] API endpoints documented
  - Request/response types documented
  - Example payloads included

**Documentation Complete**: [ ]

---

## Phase 9: Final Readiness

### System Health Check
- [ ] Backend server running without errors
  - Run: `cd backend && npm run dev`
  - Check logs for startup errors

- [ ] Frontend server running without errors
  - Run: `cd frontend && npm run dev`
  - Check Vite dev server starts successfully

- [ ] Database connection healthy
  - Check: Backend logs show successful Supabase connection
  - No connection pool errors

- [ ] WebSocket server healthy
  - Check: Backend logs show WebSocket server listening
  - Test connection: `wscat -c ws://localhost:3001/ws/travel`

### Deployment Readiness (Optional - for production)
- [ ] Environment variables configured
  - SUPABASE_URL
  - SUPABASE_SERVICE_KEY
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

- [ ] Build passes without errors
  - Backend: `npm run build`
  - Frontend: `npm run build`

- [ ] Production database migrations applied
- [ ] Monitoring/logging configured
- [ ] Error tracking configured (Sentry, etc.)

**Final Readiness Complete**: [ ]

---

## Sign-Off

### Development Team Sign-Off
- [ ] Backend Developer: Travel service logic verified
- [ ] Backend Developer: API routes tested
- [ ] Backend Developer: WebSocket integration verified
- [ ] Frontend Developer: UI components tested (if applicable)
- [ ] Frontend Developer: WebSocket client tested (if applicable)
- [ ] QA Engineer: All manual test scenarios passed
- [ ] QA Engineer: Database verification complete
- [ ] QA Engineer: No critical bugs found

### System Status
- [ ] **READY FOR PLAYER TESTING**: All checklist items complete
- [ ] **READY FOR PRODUCTION**: Deployment readiness verified

---

## Notes

### Known Issues (if any)
```
Document any known issues or limitations here:

Example:
- Skill check modifiers currently use placeholder values (+2)
- Distance calculation uses stub implementation (random 10-100 miles)
- WebSocket reconnection logic needs stress testing
```

### Future Improvements (post-MVP)
```
Document planned enhancements for future iterations:

Example:
- Add support for multiple simultaneous travel sessions (party travel)
- Implement travel mode effects (cautious = slower but safer)
- Add road network integration for faster travel on roads
- Implement encounter variety based on biome types
- Add random events based on time of day
- Create combat integration for dangerous encounters
```

### Testing Notes
```
Document any testing observations or recommendations:

Example:
- Test scenarios should be repeated 3x for reliability
- WebSocket stress testing recommended for 10+ concurrent sessions
- Performance profiling needed for 100+ active travel sessions
- Automated E2E tests should be written using Playwright/Cypress
```

---

**Checklist Version**: 1.0
**Last Updated**: 2025-10-21
**Maintained By**: QA Integration Agent

---

## Quick Reference: Commands

```bash
# Database Setup
psql <connection-string> -f TRAVEL_TEST_DATA.sql

# Backend Tests
cd backend && npm test travelService

# Backend Build
cd backend && npm run build

# Backend Run
cd backend && npm run dev

# Frontend Run
cd frontend && npm run dev

# Database Queries
psql <connection-string> -c "SELECT * FROM travel_sessions;"
psql <connection-string> -c "SELECT * FROM travel_events;"

# WebSocket Test
wscat -c ws://localhost:3001/ws/travel
```

---

**END OF CHECKLIST**
