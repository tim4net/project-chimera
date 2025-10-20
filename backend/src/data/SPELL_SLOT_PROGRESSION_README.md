# Spell Slot Progression System

Complete D&D 5e spell slot progression implementation for all spellcasting classes.

## Overview

This system provides accurate spell slot tables and helper functions for all D&D 5e spellcasting classes from the Player's Handbook. It includes:

- **Full Casters**: Bard, Cleric, Druid, Sorcerer, Wizard
- **Half Casters**: Paladin, Ranger
- **Third Casters**: Eldritch Knight, Arcane Trickster
- **Warlock**: Unique Pact Magic system

## Files

### Core Data
- `spellSlotProgression.ts` - Spell slot tables and query functions

### Integration
- `../services/spellSlotLevelingIntegration.ts` - Integration with leveling system

### Tests
- `../__tests__/data/spellSlotProgression.test.ts` - 50 tests for core functionality
- `../__tests__/services/spellSlotLevelingIntegration.test.ts` - 29 tests for integration

## Usage Examples

### Get Spell Slots for a Character

```typescript
import { getSpellSlotsForLevel } from './data/spellSlotProgression';

// Full caster (Wizard level 5)
const wizardSlots = getSpellSlotsForLevel('Wizard', 5);
// Returns: { level1: 4, level2: 3, level3: 2, ... }

// Warlock (level 5) - Pact Magic
const warlockSlots = getSpellSlotsForLevel('Warlock', 5);
// Returns: { slots: 2, slotLevel: 3 }

// Non-caster
const fighterSlots = getSpellSlotsForLevel('Fighter', 5);
// Returns: null
```

### Get Complete Spellcasting Info

```typescript
import { getSpellcastingInfo } from './data/spellSlotProgression';

const info = getSpellcastingInfo('Sorcerer', 3);
// Returns:
// {
//   slots: { level1: 4, level2: 2, ... },
//   cantripsKnown: 4,
//   spellsKnown: 4,
//   spellsLearned: 1,      // New spells at this level
//   cantripsLearned: 0,    // New cantrips at this level
//   newSpellLevel: 2       // Newly unlocked spell level
// }
```

### Check for New Spells/Cantrips

```typescript
import {
  getNewSpellsLearnedCount,
  getNewCantripsCount,
  getSpellLevelUnlocked
} from './data/spellSlotProgression';

// Sorcerer leveling 2 → 3
const newSpells = getNewSpellsLearnedCount('Sorcerer', 3);     // 1
const newCantrips = getNewCantripsCount('Sorcerer', 3);        // 0
const newSpellLevel = getSpellLevelUnlocked('Sorcerer', 3);    // 2
```

### Integration with Leveling System

```typescript
import {
  getUpdatedSpellSlots,
  getSpellSlotLevelUpMessage,
  needsSpellSelection
} from './services/spellSlotLevelingIntegration';

// Get updated spell slots in DB format
const dbSlots = getUpdatedSpellSlots('Wizard', 5);
// Returns: { "1": 4, "2": 3, "3": 2 }

// Generate level-up message
const message = getSpellSlotLevelUpMessage('Wizard', 4, 5);
// "You unlock 2 3rd-level spell slots!"

// Check if spell selection needed
const selection = needsSpellSelection('Sorcerer', 3);
// {
//   needsSelection: true,
//   cantripsNeeded: 0,
//   spellsNeeded: 1,
//   newSpellLevel: 2
// }
```

## Class-Specific Details

### Full Casters
- Start with spells at level 1
- Progress to 9th-level spells at level 17
- All use same slot progression table

**Spells Known vs. Prepared:**
- **Bard, Sorcerer**: Limited spells known (use `spellsKnown`)
- **Cleric, Druid, Wizard**: Prepare from full class list (no `spellsKnown`)

### Half Casters (Paladin, Ranger)
- Gain spells starting at level 2
- Cap at 5th-level spells (level 17)
- No cantrips (except Ranger with certain subclasses)

### Third Casters (Eldritch Knight, Arcane Trickster)
- Gain spells starting at level 3
- Cap at 4th-level spells (level 19)
- Limited spell selection

### Warlock (Pact Magic)
- Unique system: few slots, all highest level
- Slots recover on short rest (vs. long rest for others)
- At level 5: 2 slots of 3rd level
- At level 11: 3 slots of 5th level
- At level 17: 4 slots of 5th level

## Spellcasting Abilities

```typescript
import { getSpellcastingAbility } from './data/spellSlotProgression';

getSpellcastingAbility('Wizard');    // 'INT'
getSpellcastingAbility('Cleric');    // 'WIS'
getSpellcastingAbility('Sorcerer');  // 'CHA'
getSpellcastingAbility('Fighter');   // null
```

**Charisma:** Bard, Sorcerer, Paladin, Warlock
**Intelligence:** Wizard, Eldritch Knight, Arcane Trickster
**Wisdom:** Cleric, Druid, Ranger

## Testing

Run all tests:
```bash
npm test -- spellSlotProgression.test.ts
npm test -- spellSlotLevelingIntegration.test.ts
```

### Test Coverage
- ✅ All class progressions (1-20)
- ✅ Spell level unlocking
- ✅ Cantrip progression
- ✅ Spells known/learned
- ✅ Warlock Pact Magic
- ✅ Database format conversion
- ✅ Level-up messages
- ✅ Spell selection detection

## Implementation Notes

### Database Format
Spell slots are stored as `Record<string, number>`:
```typescript
// Standard caster
{ "1": 4, "2": 3, "3": 2 }

// Warlock (Pact Magic)
{ "3": 2, "pact_magic": 1 }
```

### Level-Up Integration
When a character levels up:
1. Call `getUpdatedSpellSlots()` to get new slot counts
2. Call `getSpellSlotLevelUpMessage()` for player notification
3. Call `needsSpellSelection()` to check if spell selection UI needed
4. Update character record with new spell slots

### Future Enhancements
- [ ] Multiclassing spell slot calculations
- [ ] Spell preparation tracking
- [ ] Spell slot usage/recovery tracking
- [ ] Integration with spell list database
- [ ] Automatic spell selection during character creation

## References
- D&D 5e Player's Handbook (PHB)
- Spell slot tables: PHB Chapter 3 (Classes)
- Spellcasting rules: PHB Chapter 10 (Spellcasting)
