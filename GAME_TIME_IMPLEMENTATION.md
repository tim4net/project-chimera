# Game-Time System Implementation

**Date:** 2025-10-22
**Status:** ✅ DEPLOYED
**Time Progression:** 1 real-time minute = 10 in-game minutes

## Overview

Implemented a proper game-time system for semi-idle gameplay. Travel now consumes **in-game time**, not real-time, allowing players to progress offline.

## How It Works

### Time Progression

**Real-Time ↔ Game-Time Conversion:**
```
1 real-time minute = 10 in-game minutes
TravelWorker ticks every 60 seconds (real-time)
Each tick advances game-time by 10 minutes
Character receives game_time_minutes increment with each tick
```

### Travel Calculation

**Travel speeds (in-game):**
- Cautious: 2 mph
- Normal: 3 mph
- Hasty: 4 mph

**Miles per tick calculation:**
```
miles_per_tick = speed_mph × (game_minutes_per_tick / 60)

For normal mode:
= 3 mph × (10 game-minutes / 60 minutes-per-hour)
= 3 × 0.1667
= 0.5 miles per tick
```

**Example journey:**
- Distance: 30 miles at 3 mph
- Game-time needed: 30 ÷ 3 = 10 game-hours
- Real-time needed: 10 game-hours ÷ 10 = 1 real-time hour
- Ticks needed: 1 hour ÷ 60 seconds = 60 ticks

### Semi-Idle Gameplay

**Offline Progression:**
1. Player: "I travel to the distant city" (30 miles)
2. Chat creates travel_session (game-time calculated)
3. Player closes app
4. Backend TravelWorker continues ticking every real-time minute
5. Player comes back in 1 real-time hour
6. Character has arrived (10 game-hours have passed, 30 miles traveled)

**Real-Time Observation:**
1. Player: "I travel to the distant city"
2. Player watches logs or map refresh
3. Every real-time minute:
   - TravelWorker advances game-time 10 minutes
   - Position updates by 0.5 miles
   - Tiles discovered
   - Progress visible if player is watching

## Implementation Details

### Files Modified

**1. backend/src/workers/travelWorker.ts**

Constants updated:
```typescript
const TICK_INTERVAL_MS = 60000; // 1 real-time minute
const GAME_MINUTES_PER_TICK = 10; // Game-time per tick

// Travel speeds in mph (in-game hours)
const TRAVEL_SPEED_MPH = {
  cautious: 2,
  normal: 3,
  hasty: 4,
};

// Calculated miles per tick
const MILES_PER_TICK = {
  cautious: 0.333, // 2 × (10/60)
  normal: 0.5,     // 3 × (10/60)
  hasty: 0.667,    // 4 × (10/60)
};
```

Position update:
```typescript
// Each tick increments game_time_minutes AND position
await supabaseServiceClient
  .from('characters')
  .update({
    position_x: newX,
    position_y: newY,
    game_time_minutes: (character.game_time_minutes || 0) + GAME_MINUTES_PER_TICK,
  })
  .eq('id', character_id);
```

**2. backend/src/routes/dmChatSecure.ts**

Added game_time_minutes handling:
```typescript
case 'game_time_minutes': {
  const { error } = await supabaseServiceClient
    .from('characters')
    .update({ game_time_minutes: change.newValue })
    .eq('id', characterId);
  break;
}
```

### Database Fields

Characters table now tracks:
- `game_time_minutes` - Total in-game minutes elapsed (auto-incremented by TravelWorker)

This field is optional - the system uses `|| 0` as fallback for characters without it.

## Behavior Examples

### Example 1: Short Journey (10 miles)
```
Distance: 10 miles
Speed: 3 mph (normal)
Game-time: 10 ÷ 3 = 3.33 hours = 200 game-minutes
Real-time: 200 ÷ 10 = 20 real-time minutes
Ticks: 20

Action: "I travel 10 miles east"
After 20 real-time minutes:
- Character has moved 10 miles
- Game-time advanced 200 minutes (3h 20m)
- Tiles discovered along path
```

### Example 2: Long Journey (100 miles)
```
Distance: 100 miles
Speed: 3 mph (normal)
Game-time: 100 ÷ 3 = 33.33 hours
Real-time: 33.33 ÷ 10 = 3.33 real-time hours
Ticks: 200

Action: "I travel to the distant kingdom" (100 miles)
Player closes app
3 real-time hours later:
- Player returns and checks map
- Character has arrived
- Game-time shows "4 days, 9 hours" (33.33 hours)
```

### Example 3: Offline Observation
```
Action: "Travel 50 miles"
Real-time elapsed: 30 minutes (offline)
Result when player returns:
- TravelWorker processed 30 ticks
- 30 × 0.5 miles = 15 miles traveled
- 30 × 10 game-minutes = 300 game-minutes = 5 hours
- Position updated 15 miles along path
- Tiles discovered along 15-mile stretch
```

## Adjusting Travel Speed

To change how fast the game-time advances:

**Option 1: Change game-minutes per tick**
Edit: `backend/src/workers/travelWorker.ts` line 29
```typescript
const GAME_MINUTES_PER_TICK = 10; // Change to 20 for 2x speed, etc.
```

**Option 2: Change travel speeds**
Edit: `backend/src/workers/travelWorker.ts` lines 32-36
```typescript
const TRAVEL_SPEED_MPH = {
  cautious: 2,  // Change to 4 for 2x speed
  normal: 3,    // Change to 6 for 2x speed
  hasty: 4,     // Change to 8 for 2x speed
};
```

After any changes, restart: `podman compose restart backend`

## Key Benefits

✅ **Offline Progression** - Player can travel while offline
✅ **Semi-Idle Gameplay** - Check back later to see progress
✅ **Flexible Speed** - Easy to adjust travel pace
✅ **Time Tracking** - Game maintains world time progression
✅ **Tile Discovery** - Fog-of-war continuously revealed along journey
✅ **Workers Handle It** - TravelWorker processes all movement

## Current Status

✅ Backend running with game-time system
✅ TravelWorker ticking every 60 seconds
✅ Game-time advances 10 minutes per tick
✅ Travel uses game-time calculations
✅ Position updates based on game-time progression
✅ Tiles discovered along journey path
✅ Ready for semi-idle gameplay testing

## Testing Checklist

- [ ] Create character
- [ ] Initiate travel to distant location (20+ miles)
- [ ] Check backend logs for "Game time: Xh Ym" output
- [ ] Wait 2 real-time minutes
- [ ] Check if position has moved ~1 mile
- [ ] Check if game_time_minutes has increased by ~20
- [ ] Reload map and verify tiles expanded
- [ ] Calculate: distance ÷ 3 mph ÷ 10 = expected real-time minutes
- [ ] Verify actual real-time matches calculation

---

**System Status:** ✅ LIVE
**Ready for:** Semi-idle gameplay testing with offline progression
