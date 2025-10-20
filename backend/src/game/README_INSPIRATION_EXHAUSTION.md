# D&D 5e Inspiration and Exhaustion Systems

## Overview

This implementation provides two core D&D 5e mechanics:
- **Inspiration**: A reward system for exceptional roleplay
- **Exhaustion**: A debilitating condition system with 6 progressive levels

## Database Schema

### Characters Table Columns

```sql
-- Inspiration: Boolean flag (default: false)
inspiration BOOLEAN DEFAULT FALSE

-- Exhaustion: Integer level 0-6 (default: 0)
exhaustion_level INTEGER DEFAULT 0 CHECK (exhaustion_level >= 0 AND exhaustion_level <= 6)
```

## Inspiration System

### Module: `/srv/nuaibria/backend/src/game/inspiration.ts`

Inspiration represents a character's connection to the narrative. A character can only have one inspiration point at a time.

### Functions

```typescript
import { awardInspiration, useInspiration, hasInspiration } from './game/inspiration';

// Award inspiration for great roleplay
awardInspiration(character);

// Check if character has inspiration
if (hasInspiration(character)) {
  console.log('You have inspiration!');
}

// Use inspiration to gain advantage on a roll
const { hadInspiration } = useInspiration(character);
if (hadInspiration) {
  // Apply advantage to the roll
  rollD20({ advantage: 'advantage', ... });
}
```

### Usage Example

```typescript
// DM awards inspiration for exceptional roleplay
if (playerRoleplayScore > 8) {
  awardInspiration(character);
  narrateLLM.generate({
    prompt: "The DM awards you inspiration for your excellent portrayal!"
  });
}

// Player uses inspiration on a critical ability check
if (isImportantCheck && hasInspiration(character)) {
  const { hadInspiration } = useInspiration(character);
  const roll = rollAbilityCheck({
    ability: 'Charisma',
    abilityScore: character.ability_scores.CHA,
    advantage: hadInspiration ? 'advantage' : undefined,
    proficient: true,
  });
}
```

## Exhaustion System

### Module: `/srv/nuaibria/backend/src/game/exhaustion.ts`

Exhaustion is measured in six levels. Effects are cumulative - a character suffers from all effects at their current level and below.

### Exhaustion Levels

| Level | Effects |
|-------|---------|
| 1 | Disadvantage on ability checks |
| 2 | Speed halved |
| 3 | Disadvantage on attack rolls and saving throws |
| 4 | Hit point maximum halved |
| 5 | Speed reduced to 0 |
| 6 | Death |

### Functions

```typescript
import {
  gainExhaustion,
  removeExhaustion,
  applyExhaustionPenalties,
  isExhausted,
  isDead,
  getExhaustionSummary
} from './game/exhaustion';

// Character gains exhaustion from forced march
gainExhaustion(character, 1);

// Check penalties
const penalties = applyExhaustionPenalties(character);
console.log('Speed modifier:', penalties.speedMod); // 0.5 at level 2+
console.log('Disadvantage on:', penalties.disadvantageOn); // ['ability_checks', 'attacks', 'saves']
console.log('HP max modifier:', penalties.hpMaxMod); // 0.5 at level 4+

// Long rest removes 1 level of exhaustion
removeExhaustion(character, 1);

// Check if dead from exhaustion
if (isDead(character)) {
  console.log('Character has died from exhaustion!');
}
```

### Usage Example

```typescript
// Apply exhaustion from environmental hazards
if (character.position.biome === 'desert' && hoursOfTravel > 8) {
  const newLevel = gainExhaustion(character, 1);
  narrateLLM.generate({
    prompt: `The scorching heat takes its toll. You now have ${newLevel} level(s) of exhaustion.`
  });
}

// Apply penalties during combat
const penalties = applyExhaustionPenalties(character);

// Modify speed
const effectiveSpeed = Math.floor(character.speed * penalties.speedMod);

// Apply disadvantage to attack rolls
const attackAdvantage = penalties.disadvantageOn.includes('attacks')
  ? 'disadvantage'
  : undefined;

const attackRoll = rollAttackRoll({
  ability: 'Strength',
  abilityScore: character.ability_scores.STR,
  advantage: attackAdvantage,
  proficient: true,
});

// Modify HP maximum
const effectiveHpMax = Math.floor(character.hp_max * penalties.hpMaxMod);
if (character.hp_current > effectiveHpMax) {
  character.hp_current = effectiveHpMax;
}

// Long rest recovery
if (completedLongRest && isExhausted(character)) {
  const newLevel = removeExhaustion(character, 1);
  narrateLLM.generate({
    prompt: `After a restful sleep, you feel slightly better. Exhaustion reduced to level ${newLevel}.`
  });
}
```

## Integration with Resting System

The exhaustion system integrates with the existing resting system:

```typescript
import { performLongRest } from './game/resting';
import { removeExhaustion, isExhausted } from './game/exhaustion';

// After a successful long rest
const restResult = performLongRest(character);

if (restResult.success && isExhausted(character)) {
  // Remove 1 level of exhaustion
  const newLevel = removeExhaustion(character, 1);
  restResult.exhaustionReduced = true;
  restResult.newExhaustionLevel = newLevel;
}
```

## Integration with Game Loop

### Idle Phase Travel
```typescript
// Apply exhaustion from long journeys without rest
if (travelDuration > 16 && !hasRested) {
  gainExhaustion(character, 1);
}
```

### Active Phase Combat
```typescript
// Check exhaustion penalties before each action
const penalties = applyExhaustionPenalties(character);

// Can the character move?
if (penalties.speedMod === 0) {
  return { error: 'You are too exhausted to move!' };
}

// Apply disadvantage to rolls
const advantage = penalties.disadvantageOn.includes('attacks')
  ? 'disadvantage'
  : undefined;
```

### Environmental Conditions
```typescript
// Extreme heat/cold, starvation, dehydration
if (exposedToHarshConditions && !hasProtection) {
  gainExhaustion(character, 1);
}
```

## Testing

Comprehensive test suites are available:

```bash
# Test inspiration system
npm test src/__tests__/game/inspiration.test.ts

# Test exhaustion system
npm test src/__tests__/game/exhaustion.test.ts
```

**Test Coverage:**
- Inspiration: 12 tests, 100% pass rate
- Exhaustion: 37 tests, 100% pass rate

## Database Migrations

Applied migrations:
- `20251020011921_add_inspiration_to_characters`
- `20251020011947_add_exhaustion_level_to_characters_v2`

## TypeScript Types

Character type updated in `/srv/nuaibria/backend/src/types/index.ts`:

```typescript
export interface CharacterRecord {
  // ... other fields
  inspiration?: boolean;        // D&D 5e inspiration system
  exhaustion_level?: number;    // D&D 5e exhaustion level (0-6)
  // ... other fields
}
```
