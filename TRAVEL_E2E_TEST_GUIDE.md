# Travel System E2E Test Guide

## Overview

This guide provides comprehensive end-to-end testing scenarios for the complete travel system, covering travel initiation, real-time event generation, player choice resolution, skill checks, and WebSocket communication.

---

## Prerequisites

### 1. Backend Running
```bash
cd /srv/project-chimera/backend
npm run dev
```

**Verify**: Backend should be running on `http://localhost:3001`
- Console output should show: `Server running on port 3001`
- No TypeScript compilation errors

### 2. Frontend Running
```bash
cd /srv/project-chimera/frontend
npm run dev
```

**Verify**: Frontend should be running on `http://localhost:5173`
- Vite dev server should start successfully
- Browser should open to login page

### 3. Database Migrations Applied

**Check migration status**:
```bash
# Connect to Supabase and verify tables exist
psql <connection-string>
```

**Required tables**:
- `travel_sessions` - Tracks active/completed journeys
- `travel_events` - Records all events that occur during travel
- `characters` - Character data with position
- `world_pois` - Points of interest (destinations)

**Verify schema**:
```sql
-- Check travel_sessions table
\d travel_sessions

-- Check travel_events table
\d travel_events
```

### 4. Valid Test Character

**Create test character** (if needed):
```sql
-- Insert test character at starting position
INSERT INTO characters (
  id, user_id, name, race, class, level,
  hp_current, hp_max, xp, position_x, position_y, campaign_seed
) VALUES (
  gen_random_uuid(),
  '<your-auth-user-id>',
  'Test Adventurer',
  'Human',
  'Fighter',
  3,
  30, 30, 900,
  0, 0,
  'test-seed-001'
);
```

**Get character ID**:
```sql
SELECT id, name, position_x, position_y FROM characters WHERE name = 'Test Adventurer';
```

### 5. Test Locations with Danger Levels

Run the test data SQL script (see `TRAVEL_TEST_DATA.sql`):
```bash
psql <connection-string> -f TRAVEL_TEST_DATA.sql
```

---

## Manual Test Scenarios

### Scenario 1: Safe Zone Travel (Low Danger)

**Objective**: Test travel through a safe area with mostly trivial/minor events.

**Setup**:
1. Character starts at position (0, 0)
2. Destination: Low danger area (danger_level = 1)
3. Distance: ~5 miles
4. Travel mode: Normal

**Steps**:
1. Log in with test character
2. Open DashboardPage
3. Click on safe zone destination on map
4. Select "Normal" travel mode
5. Click "Start Travel"

**Expected Results**:
- Travel session created successfully
- Progress bar appears showing 0% → 100%
- Estimated time: ~1-2 minutes (based on 3 mph)
- Events generated are mostly **trivial** (70%):
  - Traveling merchant
  - Interesting landmark
  - Pleasant weather
  - Fellow traveler
- Occasional **minor** events (25%):
  - Light drizzle
  - Weary traveler asking directions
  - Merchant offering supplies
- Rare **moderate** events (5%):
  - Minor bandit encounter
  - Small storm
- Events auto-resolve without player input (trivial)
- Minor events may require simple choices
- Travel completes successfully at destination

**Success Criteria**:
- [ ] No deadly or dangerous events occur
- [ ] Most events auto-resolve
- [ ] Progress updates every minute via WebSocket
- [ ] Character position updated on completion
- [ ] No console errors

---

### Scenario 2: Dangerous Travel (High Danger)

**Objective**: Test travel through a dangerous area with frequent high-severity events.

**Setup**:
1. Character at known position
2. Destination: High danger area (danger_level = 4 or 5)
3. Distance: ~5 miles
4. Travel mode: Normal

**Steps**:
1. Navigate to dangerous zone on map
2. Click destination in high-danger region
3. Observe danger indicator (should show RED or PURPLE)
4. Start travel with "Normal" mode

**Expected Results**:
- Danger indicator shows **Level 4** (RED) or **Level 5** (PURPLE)
- Frequent **dangerous** and **deadly** events:
  - Organized bandit gang
  - Young dragon encounter
  - Violent tempest
  - Magical trap
  - Ancient owlbear boss
  - Adult dragon
- Events require player response (not auto-resolved)
- Choices involve skill checks with high DCs (15-19)
- Skill check results displayed with roll details
- Combat events may pause travel
- Risk of character damage or forced retreat

**Success Criteria**:
- [ ] Danger indicator correctly shows high danger
- [ ] Multiple dangerous/deadly events occur
- [ ] All events require player choice
- [ ] Skill checks execute with proper DC validation
- [ ] Travel may not complete if player fails critical checks
- [ ] WebSocket delivers events in real-time

---

### Scenario 3: Event Resolution with Skill Checks

**Objective**: Test the full event resolution flow including player choice and skill checks.

**Setup**:
1. Character traveling through moderate danger zone
2. Trigger moderate event (bandits, storm, trap, etc.)

**Steps**:
1. Start travel to moderate danger area (danger_level = 3)
2. Wait for moderate event to appear:
   - **Example**: "Two bandits emerge from the brush, demanding your coin purse."
3. Observe available choices:
   - Fight (DC 12, athletics)
   - Intimidate (DC 13, intimidation)
   - Flee (DC 11, athletics)
4. Select choice with skill check (e.g., "Intimidate")
5. Observe skill check resolution

**Expected Results**:
- Event displays with clear description
- 2-3 choices presented as buttons
- Each choice shows:
  - Label (e.g., "Intimidate")
  - Description/consequence
  - DC and skill (if applicable)
- On choice selection:
  - D20 roll executed (1-20)
  - Modifiers applied (based on character stats)
  - Total compared to DC
  - **Success**: Positive outcome narration
    - Example: "Success! You attempt to scare them off. The bandits hesitate, then flee into the woods."
  - **Failure**: Negative outcome narration
    - Example: "Failed (11 vs DC 13). The bandits laugh at your attempt and draw their weapons."
- Event marked as resolved
- Travel continues automatically
- Event added to event log

**Success Criteria**:
- [ ] Skill check UI displays correctly
- [ ] D20 roll is random (1-20)
- [ ] Modifiers applied correctly
- [ ] DC comparison accurate
- [ ] Success/failure narration appropriate
- [ ] Event resolves and travel continues
- [ ] Database records skill check result

---

### Scenario 4: Auto-Resolution of Trivial Events

**Objective**: Verify that trivial events auto-resolve without player interaction.

**Setup**:
1. Character traveling through safe zone (danger_level = 1)
2. Multiple trivial events generated

**Steps**:
1. Start travel to safe destination
2. Observe events as they arrive via WebSocket
3. Do not click any buttons - remain passive

**Expected Results**:
- Trivial events appear briefly:
  - "A traveling merchant waves at you from their cart..."
  - "You notice an interesting rock formation in the distance."
  - "The sun breaks through the clouds, warming your face."
  - "A fellow traveler passes by, offering a friendly nod."
- Events auto-resolve within 1-2 seconds
- Auto-resolution narration appears:
  - "The merchant waves goodbye as you pass, their cart rattling down the road."
  - "You pause briefly to admire the landmark before moving on."
  - "The pleasant weather lifts your spirits as you travel."
- No player choices required
- Travel progress continues uninterrupted
- Event log shows resolved events with narration

**Success Criteria**:
- [ ] Trivial events do not block travel
- [ ] Auto-resolution happens automatically
- [ ] Narration contextually appropriate
- [ ] Progress bar continues advancing
- [ ] No player input required
- [ ] Events logged with resolution text

---

### Scenario 5: WebSocket Real-Time Updates

**Objective**: Verify WebSocket communication delivers real-time travel progress and events.

**Setup**:
1. Character starting travel
2. Browser DevTools Console open

**Steps**:
1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Start travel to any destination
4. Observe WebSocket messages in console

**Console Output Examples**:
```
[WebSocket] Connected to ws://localhost:3001/ws/travel
[WebSocket] Message: {"type":"TRAVEL_PROGRESS","payload":{...}}
[WebSocket] Message: {"type":"TRAVEL_EVENT","payload":{...}}
[WebSocket] Message: {"type":"TRAVEL_PROGRESS","payload":{...}}
[WebSocket] Message: {"type":"TRAVEL_COMPLETE","payload":{...}}
```

**Expected Results**:
- WebSocket connects on page load
- `TRAVEL_PROGRESS` messages arrive every 60 seconds:
  ```json
  {
    "type": "TRAVEL_PROGRESS",
    "payload": {
      "milesTraveled": 1.5,
      "milesTotal": 10.0,
      "progressPercent": 15
    }
  }
  ```
- `TRAVEL_EVENT` messages arrive when encounters occur:
  ```json
  {
    "type": "TRAVEL_EVENT",
    "payload": {
      "event": {
        "id": "uuid",
        "description": "A band of goblin raiders emerges...",
        "severity": "moderate",
        "choices": [...]
      }
    }
  }
  ```
- `TRAVEL_COMPLETE` message on arrival:
  ```json
  {
    "type": "TRAVEL_COMPLETE",
    "payload": {
      "session": {
        "status": "completed",
        "milesTraveled": 10.0
      }
    }
  }
  ```

**JavaScript Console Tests**:
```javascript
// Monitor travel events in real-time
window.travelEvents = [];
window.addEventListener('message', (e) => {
  if (e.data.type === 'TRAVEL_EVENT') {
    window.travelEvents.push(e.data.payload);
    console.log('Travel event received:', e.data.payload.event);
  }
});

// After 1-2 minutes, check event log
console.log('Total events:', window.travelEvents.length);
console.log('Event details:', window.travelEvents);
```

**Success Criteria**:
- [ ] WebSocket connects successfully
- [ ] TRAVEL_PROGRESS arrives every 60 seconds
- [ ] TRAVEL_EVENT arrives when encounters generated
- [ ] Messages contain valid JSON structure
- [ ] UI updates immediately on message receipt
- [ ] No WebSocket disconnections or errors
- [ ] Reconnection happens automatically if dropped

---

## Database Verification

After completing test scenarios, verify database records were created correctly.

### Check Travel Sessions
```sql
-- View all travel sessions for test character
SELECT
  id,
  character_id,
  destination_id,
  miles_total,
  miles_traveled,
  travel_mode,
  status,
  created_at,
  completed_at
FROM travel_sessions
WHERE character_id = '<test-character-id>'
ORDER BY created_at DESC;
```

**Expected**:
- One session per test scenario
- `status` should be 'completed' or 'active'
- `miles_traveled` should match progress
- `completed_at` should be set for finished journeys

### Check Travel Events
```sql
-- View all events for a specific session
SELECT
  id,
  session_id,
  type,
  severity,
  description,
  requires_response,
  resolved,
  resolution,
  created_at
FROM travel_events
WHERE session_id = '<session-id>'
ORDER BY created_at ASC;
```

**Expected**:
- Multiple events per session (varies by danger level)
- `severity` distribution matches danger level probabilities
- `resolved` = true for all events in completed sessions
- `resolution` contains narration for trivial/resolved events
- `choices` JSON contains available options (if applicable)

### Verify Character Position Update
```sql
-- Check character moved to destination
SELECT
  id,
  name,
  position_x,
  position_y,
  idle_task,
  idle_task_started_at
FROM characters
WHERE id = '<test-character-id>';
```

**Expected**:
- `position_x` and `position_y` updated to destination coordinates
- `idle_task` should be NULL or 'travel' during active travel
- `idle_task_started_at` should match travel start time

---

## Expected Behavior Checklist

### Travel Initiation
- [ ] Player clicks destination on map
- [ ] Destination details displayed (name, danger level, distance)
- [ ] Travel mode selector works (cautious/normal/hasty)
- [ ] "Start Travel" button initiates journey
- [ ] POST `/api/travel/start` returns session ID

### Progress Updates
- [ ] Progress bar visible and updating
- [ ] Miles traveled / total miles displayed
- [ ] Percentage progress accurate (0-100%)
- [ ] Estimated arrival time shown
- [ ] Progress updates every 60 seconds via WebSocket

### Danger Indicator
- [ ] Color-coded by danger level:
  - Level 1: Green (#10b981)
  - Level 2: Blue (#06b6d4)
  - Level 3: Amber (#f59e0b)
  - Level 4: Red (#dc2626)
  - Level 5: Purple (#8b5cf6)
- [ ] Danger level label displayed
- [ ] Tooltip explains severity

### Event Display
- [ ] Events appear on schedule (based on danger level)
- [ ] Event description clear and narrative
- [ ] Event severity badge visible (trivial/minor/moderate/dangerous/deadly)
- [ ] Timestamp shown
- [ ] Animation smooth (slide-in-right effect)

### Player Choices
- [ ] Choice buttons clickable
- [ ] Button labels match event choices
- [ ] Hover effects work
- [ ] Disabled during resolution
- [ ] Skill check info shown (DC, skill name)

### Skill Check Resolution
- [ ] D20 roll displayed (1-20)
- [ ] Modifiers applied (character stats)
- [ ] Total calculated correctly
- [ ] DC comparison accurate
- [ ] Success/failure message appropriate
- [ ] Resolution narration displays

### Auto-Resolution
- [ ] Trivial events resolve without input
- [ ] Auto-resolution narration appears
- [ ] Travel continues automatically
- [ ] Event logged to history

### WebSocket Reliability
- [ ] Connection established on page load
- [ ] Auto-reconnect on disconnect
- [ ] Messages arrive in real-time (<1 second latency)
- [ ] No message loss during travel
- [ ] Clean connection close on page unload

### Travel Completion
- [ ] UI updates when travel completes
- [ ] "Arrived at destination" message displays
- [ ] Progress bar shows 100%
- [ ] Character position updated
- [ ] Session marked 'completed' in database
- [ ] UI transitions to destination view

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Invalid session ID handled gracefully
- [ ] Database errors logged (not exposed to user)
- [ ] WebSocket reconnect on connection drop
- [ ] Skill check failures don't crash UI

---

## Common Issues & Troubleshooting

### Issue: No Events Appearing
**Symptoms**: Travel progresses but no events generated

**Checks**:
1. Verify travel worker is running (`backgroundWorker.ts`)
2. Check danger level of destination (level 1 has 70% trivial events)
3. Verify `travel_events` table exists
4. Check backend logs for event generation errors

**Fix**:
```bash
# Restart backend with verbose logging
cd backend
npm run dev
```

### Issue: WebSocket Not Connecting
**Symptoms**: No real-time updates, progress frozen

**Checks**:
1. Verify backend WebSocket server running on port 3001
2. Check browser console for WebSocket errors
3. Verify firewall not blocking WebSocket connections

**Fix**:
```javascript
// Test WebSocket connection manually
const ws = new WebSocket('ws://localhost:3001/ws/travel');
ws.onopen = () => console.log('Connected');
ws.onerror = (err) => console.error('WebSocket error:', err);
```

### Issue: Skill Checks Always Fail
**Symptoms**: All skill checks return failures regardless of roll

**Checks**:
1. Verify character has ability scores in database
2. Check skill modifiers calculated correctly
3. Verify DC values are reasonable (10-20 range)

**Fix**:
```sql
-- Check character ability scores
SELECT id, name, ability_scores FROM characters WHERE id = '<character-id>';

-- Update if missing
UPDATE characters SET ability_scores = '{
  "strength": 14,
  "dexterity": 12,
  "constitution": 13,
  "intelligence": 10,
  "wisdom": 11,
  "charisma": 15
}'::jsonb WHERE id = '<character-id>';
```

### Issue: Travel Never Completes
**Symptoms**: Progress bar stuck at 99%, never reaches 100%

**Checks**:
1. Verify `miles_traveled` vs `miles_total` in database
2. Check for unresolved blocking events
3. Verify travel worker tick frequency

**Fix**:
```sql
-- Manually complete stuck session
UPDATE travel_sessions
SET status = 'completed',
    miles_traveled = miles_total,
    completed_at = NOW()
WHERE id = '<session-id>' AND status = 'active';
```

---

## Performance Expectations

### Response Times
- API `/api/travel/start`: < 200ms
- API `/api/travel/choose`: < 150ms
- WebSocket message latency: < 50ms
- Event generation: < 100ms
- Skill check calculation: < 10ms

### Resource Usage
- WebSocket connections: 1 per active session
- Database queries per event: 2-3 (INSERT + SELECT)
- Memory per session: ~5KB
- CPU usage: < 1% per active travel session

### Scalability Targets
- Concurrent travel sessions: 100+
- Events per session: 5-20 (varies by danger level)
- WebSocket connections: 100+ simultaneous
- Database table growth: ~1000 events/day (10 active players)

---

## Regression Test Automation Ideas

For future automation, consider:

1. **Unit Tests**: Travel service business logic (already implemented)
2. **Integration Tests**: API endpoints with test database
3. **E2E Tests**: Playwright/Cypress for UI workflows
4. **Load Tests**: Artillery.io for WebSocket stress testing
5. **Chaos Tests**: Simulate network drops, database failures

---

## Next Steps

After manual testing completes successfully:

1. Document any bugs found in GitHub Issues
2. Update test scenarios if behavior changes
3. Create automated E2E test suite (Playwright)
4. Add monitoring/alerting for travel system health
5. Performance profiling with production data

---

**Document Version**: 1.0
**Last Updated**: 2025-10-21
**Maintained By**: QA Integration Agent
