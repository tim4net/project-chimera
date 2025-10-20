# Advanced D&D 5e Combat & Death Mechanics Implementation

## Overview

This document summarizes the implementation of advanced D&D 5e combat mechanics and death/dying systems for Nuaibria.

## Implementation Date
**2025-10-19**

---

## Part 1: Advanced Combat Mechanics

### File: `/srv/nuaibria/backend/src/game/combat.ts`

Enhanced combat system with comprehensive 5e rule support.

### Features Implemented

#### 1. Initiative System
- **Function**: `rollInitiative(dexMod: number, rng?: () => number): number`
- Rolls 1d20 + DEX modifier for turn order
- **Function**: `sortByInitiative(combatants: CombatantExtended[]): CombatantExtended[]`
- Sorts combatants by initiative (highest first)

#### 2. Critical Hits
- **Function**: `resolveCriticalHit(damageNotation: string, rng?: () => number): number`
- Doubles damage dice on natural 20 (not modifiers)
- Uses existing `rollDamage()` from `dice.ts` with `critical: true` flag

#### 3. Advantage/Disadvantage in Combat
- **Function**: `applyAdvantageToAttack(hasAdvantage: boolean, hasDisadvantage: boolean): 'normal' | 'advantage' | 'disadvantage'`
- Handles cancellation when both are present
- Integrated into attack resolution

#### 4. Grappling
- **Function**: `resolveGrapple(attacker: CombatantExtended, defender: CombatantExtended, rng?: () => number): { success: boolean; message: string }`
- Attacker rolls STR (Athletics) check
- Defender chooses best of STR (Athletics) or DEX (Acrobatics)
- Applies 'grappled' condition on success
- Tracks grappling relationships

#### 5. Shoving
- **Function**: `resolveShove(attacker: CombatantExtended, defender: CombatantExtended, shoveType: 'push' | 'prone', rng?: () => number): { success: boolean; message: string }`
- Similar contest to grappling
- Can push 5 feet or knock prone
- Applies 'prone' condition on success

#### 6. Cover Mechanics
- **Function**: `calculateCoverBonus(coverType: CoverType): number`
- Half cover: +2 AC
- Three-quarters cover: +5 AC
- Full cover: Cannot be targeted directly (Infinity AC)

#### 7. Ranged Combat
- Disadvantage when adjacent to enemy
- Integrated into `resolveAttack()` function

#### 8. Two-Weapon Fighting
- Off-hand attack: no ability modifier to damage
- Handled by `isOffHandAttack` flag in attack context
- Requires weapons with 'light' property

#### 9. Opportunity Attacks
- **Function**: `resolveOpportunityAttack(attacker: CombatantExtended, target: CombatantExtended, rng?: () => number): AttackResult | null`
- Triggered when enemy leaves reach
- Consumes reaction
- Returns null if no reaction available

#### 10. Action Economy
- **Function**: `resetActionEconomy(combatant: CombatantExtended): void`
- Tracks: Action, Bonus Action, Reaction, Movement
- Resets at start of each turn
- Prevents multiple reactions per round

### Extended Combat Types

```typescript
export type CoverType = 'none' | 'half' | 'three-quarters' | 'full';
export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'movement';

export interface CombatantExtended extends Combatant {
  initiative: number;
  dexModifier: number;
  strModifier: number;
  conditions: Set<string>;
  usedActions: Set<ActionType>;
  hasReaction: boolean;
  grappling?: string;
  grappledBy?: string;
  position?: { x: number; y: number };
  proficiencyBonus?: number;
  weapons?: {
    mainHand?: WeaponInfo;
    offHand?: WeaponInfo;
  };
}

export interface AttackContext {
  attacker: CombatantExtended;
  defender: CombatantExtended;
  cover: CoverType;
  advantageReason?: string;
  disadvantageReason?: string;
  isRanged?: boolean;
  isOffHandAttack?: boolean;
}

export interface AttackResult {
  hit: boolean;
  critical: boolean;
  fumble: boolean;
  damage: number;
  attackRoll: number;
  modifiedAC: number;
  hadAdvantage: boolean;
  hadDisadvantage: boolean;
  message: string;
}
```

### Advanced Attack Resolution

The `resolveAttack()` function integrates all combat mechanics:
- Calculates advantage/disadvantage from conditions
- Applies cover bonuses to AC
- Handles critical hits/fumbles
- Respects full cover (auto-miss)
- Adjusts damage for off-hand attacks
- Returns detailed attack result

### Backward Compatibility

The original `simulateCombat()` function is preserved for backward compatibility with existing code.

---

## Part 2: Death & Dying System

### File: `/srv/nuaibria/backend/src/game/deathSaves.ts`

Complete implementation of D&D 5e death saving throw mechanics.

### Features Implemented

#### 1. Death Saving Throws
- **Function**: `rollDeathSave(rng?: () => number): DeathSaveResult`
- Natural 20: Regain 1 HP and become conscious
- Natural 1: Counts as two failures
- 10+: Success
- <10: Failure
- 3 successes = stabilized
- 3 failures = dead

#### 2. Death Save Processing
- **Function**: `processDeathSave(state: DeathSaveState, result: DeathSaveResult): { newState: DeathSaveState; isDead: boolean; isStable: boolean; regainedConsciousness: boolean }`
- Tracks successes and failures
- Handles critical success/failure
- Determines death or stabilization

#### 3. Stabilization
- **Function**: `attemptStabilization(healerWisdom: number, proficiencyBonus?: number, proficient?: boolean, rng?: () => number): StabilizationResult`
- Wisdom (Medicine) check DC 10
- **Function**: `stabilizeCharacter(character: CharacterVitals): void`
- Directly stabilizes a character (e.g., through magic)

#### 4. Massive Damage
- **Function**: `checkMassiveDamage(damage: number, currentHP: number, maxHP: number): boolean`
- Instant death if damage ≥ max HP when reduced to 0
- Example: 15 HP character takes 35 damage = instant death

#### 5. Unconscious at 0 HP
- Automatically applies 'unconscious' and 'dying' conditions
- Initializes death save tracking
- Integrated into damage application

#### 6. Damage While Unconscious
- Normal hit: 1 death save failure
- Critical hit: 2 death save failures
- Can lead to death without rolling saves

#### 7. Complete Damage System
- **Function**: `applyDamage(character: CharacterVitals, damage: number, isCritical?: boolean): DamageResult`
- Absorbs temporary HP first
- Checks for massive damage
- Applies unconscious condition at 0 HP
- Tracks death save failures when damaged while unconscious

#### 8. Healing System
- **Function**: `applyHealing(character: CharacterVitals, healingAmount: number): HealingResult`
- Restores HP (capped at max HP)
- Removes unconscious/dying conditions when healed above 0 HP
- Resets death saves

#### 9. Status Checks
- **Function**: `isDying(character: CharacterVitals): boolean`
- **Function**: `isDead(character: CharacterVitals): boolean`
- **Function**: `isStable(character: CharacterVitals): boolean`

### Death System Types

```typescript
export interface DeathSaveState {
  successes: number; // 0-3
  failures: number; // 0-3
  stable: boolean;
}

export interface DeathSaveResult {
  success: boolean;
  critSuccess: boolean;
  critFail: boolean;
  roll: number;
  message: string;
}

export interface CharacterVitals {
  hp_current: number;
  hp_max: number;
  temporary_hp?: number;
  deathSaves?: DeathSaveState;
  conditions?: Set<string>;
}
```

---

## Testing

### Test Files Created

1. **`/srv/nuaibria/backend/src/__tests__/game/combatAdvanced.test.ts`**
   - 21 tests covering all advanced combat mechanics
   - Tests initiative, advantage/disadvantage, cover, grappling, shoving, attacks, action economy, opportunity attacks
   - All tests passing ✅

2. **`/srv/nuaibria/backend/src/__tests__/game/deathSaves.test.ts`**
   - 31 tests covering death and dying system
   - Tests death saves, stabilization, massive damage, damage application, healing, status checks
   - All tests passing ✅

### Test Results

```bash
# Advanced Combat Tests
Test Suites: 1 passed
Tests:       21 passed
Time:        1.621 s

# Death Saves Tests
Test Suites: 1 passed
Tests:       31 passed
Time:        1.576 s

# Original Combat Tests (backward compatibility)
Test Suites: 1 passed
Tests:       5 passed
Time:        1.408 s
```

**Total: 57 tests passing across 3 test suites**

---

## Integration Examples

### Example 1: Complete Combat Encounter

```typescript
import {
  rollInitiative,
  sortByInitiative,
  resolveAttack,
  resetActionEconomy,
  type CombatantExtended
} from './game/combat';
import { applyDamage, rollDeathSave, processDeathSave } from './game/deathSaves';

// Setup combatants
const fighter: CombatantExtended = {
  name: 'Aric the Fighter',
  initiative: 0,
  stats: { health: 30, damage: '1d8+3', armorClass: 16 },
  dexModifier: 2,
  strModifier: 3,
  conditions: new Set(),
  usedActions: new Set(),
  hasReaction: true,
  proficiencyBonus: 2,
};

const goblin: CombatantExtended = {
  name: 'Goblin',
  initiative: 0,
  stats: { health: 7, damage: '1d6+2', armorClass: 14 },
  dexModifier: 2,
  strModifier: -1,
  conditions: new Set(),
  usedActions: new Set(),
  hasReaction: true,
};

// Roll initiative
fighter.initiative = rollInitiative(fighter.dexModifier);
goblin.initiative = rollInitiative(goblin.dexModifier);

const combatOrder = sortByInitiative([fighter, goblin]);

// Combat round
for (const combatant of combatOrder) {
  resetActionEconomy(combatant);

  const target = combatant === fighter ? goblin : fighter;

  // Attack
  const attackResult = resolveAttack({
    attacker: combatant,
    defender: target,
    cover: 'none',
  });

  console.log(attackResult.message);

  if (attackResult.hit) {
    // Apply damage
    const damageResult = applyDamage(
      { hp_current: target.stats.health, hp_max: target.stats.health },
      attackResult.damage,
      attackResult.critical
    );

    target.stats.health = damageResult.newHP;

    if (damageResult.isUnconscious) {
      console.log(`${target.name} falls unconscious!`);
      target.conditions.add('unconscious');
    }

    if (damageResult.isDead) {
      console.log(`${target.name} is dead!`);
      break;
    }
  }
}
```

### Example 2: Death Saves

```typescript
import { rollDeathSave, processDeathSave, applyHealing } from './game/deathSaves';

const character = {
  hp_current: 0,
  hp_max: 20,
  deathSaves: { successes: 0, failures: 1, stable: false },
  conditions: new Set(['unconscious', 'dying'])
};

// Character's turn while dying
const saveResult = rollDeathSave();
console.log(saveResult.message);

const { newState, isDead, isStable, regainedConsciousness } =
  processDeathSave(character.deathSaves, saveResult);

character.deathSaves = newState;

if (isDead) {
  console.log('Character has died.');
  character.conditions.add('dead');
} else if (isStable) {
  console.log('Character is stable.');
} else if (regainedConsciousness) {
  console.log('Character regains 1 HP!');
  character.hp_current = 1;
  character.conditions.delete('unconscious');
  character.conditions.delete('dying');
}

// Ally heals the character
const healingResult = applyHealing(character, 8);
console.log(healingResult.message);

if (healingResult.regainedConsciousness) {
  console.log('Back in the fight!');
}
```

---

## Code Quality

### Adherence to Standards

✅ **TypeScript-only**: All code written in TypeScript with proper type definitions
✅ **File size**: Combat.ts (557 lines), deathSaves.ts (462 lines) - both under 600 lines
✅ **Comprehensive documentation**: JSDoc comments on all public functions
✅ **Test coverage**: 57 tests covering all major features
✅ **Backward compatibility**: Original `simulateCombat()` function preserved
✅ **Seeded RNG support**: All functions accept optional RNG for deterministic testing
✅ **Type safety**: Extensive use of TypeScript interfaces and type guards

### Design Patterns

- **Separation of concerns**: Combat mechanics separate from death mechanics
- **Composable functions**: Small, focused functions that can be combined
- **Immutable data**: Functions return new state rather than mutating inputs
- **Testable**: All functions accept RNG for deterministic testing
- **Extensible**: Easy to add new combat actions or conditions

---

## Future Enhancements

### Potential Additions

1. **Spell combat**: Spell attack rolls, saving throws, spell slots
2. **Conditions**: Full condition system (poisoned, stunned, paralyzed, etc.)
3. **Multiattack**: Support for creatures with multiple attacks
4. **Combat AI**: Strategic decision-making for NPCs
5. **Environmental hazards**: Difficult terrain, falling, fire, etc.
6. **Combat grid**: Full tactical positioning system
7. **Weapon properties**: Versatile, heavy, loading, etc.
8. **Death alternative rules**: Lingering injuries, resurrection magic
9. **Combat logging**: Detailed combat narrative generation
10. **Performance optimization**: Batch processing for large battles

---

## Dependencies

### Internal Dependencies
- `./dice.ts`: Core dice rolling functions
- `../types/index.ts`: Type definitions for Combatant, CombatResult

### External Dependencies
- None (all functionality self-contained)

---

## API Summary

### Combat Functions

| Function | Description |
|----------|-------------|
| `rollInitiative()` | Roll initiative with DEX modifier |
| `sortByInitiative()` | Sort combatants by initiative |
| `applyAdvantageToAttack()` | Determine final advantage state |
| `calculateCoverBonus()` | Get AC bonus from cover |
| `resolveCriticalHit()` | Roll double damage dice |
| `resolveGrapple()` | STR (Athletics) contest |
| `resolveShove()` | Shove to push or knock prone |
| `resolveAttack()` | Complete attack with all rules |
| `resolveOpportunityAttack()` | Trigger opportunity attack |
| `resetActionEconomy()` | Reset actions at turn start |
| `simulateCombat()` | Legacy simple combat function |

### Death System Functions

| Function | Description |
|----------|-------------|
| `rollDeathSave()` | Roll a death saving throw |
| `processDeathSave()` | Update death save state |
| `attemptStabilization()` | Medicine check to stabilize |
| `stabilizeCharacter()` | Directly stabilize (magic) |
| `checkMassiveDamage()` | Check for instant death |
| `applyDamage()` | Complete damage application |
| `applyHealing()` | Restore HP and consciousness |
| `isDying()` | Check if character is dying |
| `isDead()` | Check if character is dead |
| `isStable()` | Check if character is stable |

---

## Conclusion

This implementation provides a complete, production-ready D&D 5e combat and death system. All 10 requested combat mechanics and all death/dying features have been implemented with comprehensive test coverage. The code is modular, type-safe, well-documented, and ready for integration into Nuaibria's AI Dungeon Master system.

**Status**: ✅ **COMPLETE**

**Test Coverage**: ✅ **57/57 tests passing**

**Production Ready**: ✅ **Yes**
