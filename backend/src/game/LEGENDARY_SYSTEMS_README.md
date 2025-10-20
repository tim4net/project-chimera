# D&D 5e Legendary Systems Implementation

This directory contains complete implementations of two key D&D 5e legendary creature mechanics:

## 1. Legendary Resistance (`legendaryResistance.ts`)

**Feature**: Legendary creatures can automatically succeed on failed saving throws a limited number of times (typically 3/day).

### Key Functions
- `createLegendaryResistance(uses)` - Initialize state with N uses
- `canUseLegendaryResistance(state)` - Check if uses remain
- `useLegendaryResistance(state)` - Consume one use
- `resetLegendaryResistance(state)` - Reset to max (typically on long rest)
- `applyToSavingThrow(saveResult, state)` - Auto-succeed on failed save if available

### Usage Example
```typescript
import { createLegendaryResistance, applyToSavingThrow } from './legendaryResistance';

// Initialize when spawning legendary monster
const dragonResistances = createLegendaryResistance(3);

// During combat when a saving throw is made
const saveResult = { roll: 8, dc: 18, totalBonus: 3, success: false };
const result = applyToSavingThrow(saveResult, dragonResistances);

console.log(result.finalSuccess); // true (used legendary resistance)
console.log(result.usesRemaining); // 2
console.log(result.message); // Full descriptive message
```

### Database Integration

**Recommended Schema Changes:**
```sql
-- Add to monster_instances table (or combat_participants table)
ALTER TABLE monster_instances ADD COLUMN legendary_resistances_remaining INTEGER DEFAULT 0;
ALTER TABLE monster_instances ADD COLUMN legendary_resistances_max INTEGER DEFAULT 0;

-- When spawning a legendary creature:
-- 1. Check if monster has legendary resistance special ability
-- 2. Extract uses from monster data (typically 3)
-- 3. Set both columns to that value
```

**Initialization Logic:**
```typescript
import { hasLegendaryResistance, extractLegendaryResistanceUses } from './legendaryResistance';
import { ALL_MONSTERS } from '../data/monsters';

function spawnMonster(monsterIndex: string) {
  const monster = ALL_MONSTERS[monsterIndex];

  let legendaryResistancesMax = 0;
  if (hasLegendaryResistance(monster.specialAbilities)) {
    legendaryResistancesMax = extractLegendaryResistanceUses(monster.specialAbilities);
  }

  // Insert into database
  await db.query(`
    INSERT INTO monster_instances
    (monster_index, legendary_resistances_remaining, legendary_resistances_max, ...)
    VALUES ($1, $2, $2, ...)
  `, [monsterIndex, legendaryResistancesMax, ...]);
}
```

---

## 2. Lair Actions (`lairActions.ts`)

**Feature**: Legendary creatures in their lairs can take special actions on initiative count 20 (losing ties).

### Key Functions
- `createLairActionState(available)` - Initialize state (available = creature is in lair)
- `shouldTriggerLairAction(initiative)` - Returns true on init count 20
- `canTakeLairAction(state, initiative)` - Check if action can be taken
- `takeLairAction(state, initiative)` - Mark action as used this round
- `resetLairActionForNewRound(state)` - Reset for next round of combat
- `getLairActionsForMonster(name)` - Get available lair actions
- `selectRandomLairAction(actions)` - Randomly choose one
- `resolveLairAction(action, targets, environment)` - Resolve effects
- `autoResolveLairAction(monsterName, state, targets, env)` - All-in-one convenience function

### Usage Example
```typescript
import { createLairActionState, canTakeLairAction, autoResolveLairAction } from './lairActions';

// Initialize when combat starts in a legendary creature's lair
const lairState = createLairActionState(true); // true = in lair

// During initiative tracker when count reaches 20
if (canTakeLairAction(lairState, currentInitiative)) {
  const result = autoResolveLairAction(
    'Ancient Red Dragon',
    lairState,
    combatParticipants,
    { terrain: 'volcanic' }
  );

  if (result) {
    console.log(result.message); // Descriptive action text
    console.log(result.effects); // Array of effect strings
    console.log(result.targets); // Affected creatures
  }
}

// At start of each new round
resetLairActionForNewRound(lairState);
```

### Database Integration

**Recommended Schema Changes:**
```sql
-- Add to combat_encounters table
ALTER TABLE combat_encounters ADD COLUMN lair_actions_available BOOLEAN DEFAULT FALSE;
ALTER TABLE combat_encounters ADD COLUMN lair_action_triggered_this_round BOOLEAN DEFAULT FALSE;

-- Set lair_actions_available=TRUE when:
-- 1. The creature has lairActions in monster data
-- 2. The encounter is in the creature's lair (location check)
```

**Initiative System Integration:**
```typescript
function processCombatRound(encounterId: string) {
  const encounter = await getEncounter(encounterId);

  // Sort combatants by initiative
  const sortedCombatants = sortByInitiative(encounter.combatants);

  for (const combatant of sortedCombatants) {
    // Check for lair action on initiative 20
    if (combatant.initiative <= 20 && !encounter.lair_action_triggered_this_round) {
      if (encounter.lair_actions_available) {
        // Trigger lair action
        const lairState = {
          available: true,
          hasTriggeredThisRound: false,
          currentInitiative: 20,
          lastUsedInitiative: encounter.last_lair_action_initiative || -1
        };

        const result = autoResolveLairAction(
          encounter.legendary_creature_name,
          lairState,
          encounter.combatants
        );

        if (result) {
          // Log to combat log
          await addCombatLogEntry(encounterId, result.message);

          // Update database
          await db.query(`
            UPDATE combat_encounters
            SET lair_action_triggered_this_round = TRUE,
                last_lair_action_initiative = 20
            WHERE id = $1
          `, [encounterId]);
        }
      }
    }

    // Process combatant's turn
    await processTurn(combatant);
  }

  // Reset for next round
  await db.query(`
    UPDATE combat_encounters
    SET lair_action_triggered_this_round = FALSE
    WHERE id = $1
  `, [encounterId]);
}
```

---

## Testing

Both systems have comprehensive test suites:
- `/backend/src/__tests__/game/legendaryResistance.test.ts` - 31 tests covering all functions
- `/backend/src/__tests__/game/lairActions.test.ts` - 40 tests covering all functions

Run tests:
```bash
npm test -- legendaryResistance.test.ts
npm test -- lairActions.test.ts
```

---

## Integration with Combat System

The systems are designed to integrate with the existing combat system (`/backend/src/game/combat.ts`):

1. **Add to CombatantExtended interface:**
```typescript
export interface CombatantExtended extends Combatant {
  // ... existing fields ...
  legendaryResistance?: LegendaryResistanceState;
  lairActionState?: LairActionState;
}
```

2. **Initialize when spawning legendary creatures**
3. **Check during saving throws** (legendary resistance)
4. **Check during initiative processing** (lair actions on count 20)

---

## Notes on Monster Data

- Monster data includes `legendaryActions` and `lairActions` fields (see `/backend/src/data/monstersCore.ts`)
- Current monster database may not have lair actions fully populated yet
- Legendary resistance is identified by checking `specialAbilities` array
- Standard legendary creatures have 3 legendary resistances per day
- Lair actions only trigger when the creature is in its lair (location-dependent)

---

## Future Enhancements

1. **Legendary Actions** - Additional system needed (creatures can take actions at end of other creatures' turns)
2. **Regional Effects** - Environmental changes around legendary creature lairs
3. **Mythic Monsters** - Extended legendary creatures with additional phases
4. **Custom Lair Actions** - Allow DMs to define custom lair actions
5. **Saving Throw Integration** - Full integration with saving throw system when implemented
