# D&D 5e Multiclassing System - Usage Examples

This document demonstrates how to use the multiclassing system implemented in `multiclassing.ts`.

## Quick Start

```typescript
import {
  canMulticlassInto,
  getMulticlassProficiencies,
  calculateMulticlassSpellSlots,
  validateMulticlassCharacter,
  calculateMulticlassHP,
  type ClassLevel,
  type MulticlassCharacter,
} from './multiclassing';
import type { AbilityScores } from '../types';
```

## Checking Prerequisites

Before allowing a character to multiclass, verify they meet the ability score requirements:

```typescript
const abilityScores: AbilityScores = {
  STR: 15,
  DEX: 12,
  CON: 14,
  INT: 13,
  WIS: 10,
  CHA: 8,
};

// Can this Fighter multiclass into Wizard?
const canMulticlass = canMulticlassInto(abilityScores, 'Fighter', 'Wizard');
// Returns: true (STR 15 ≥ 13 for Fighter, INT 13 ≥ 13 for Wizard)

// Can they multiclass into Paladin?
const canBePaladin = canMulticlassInto(abilityScores, 'Fighter', 'Paladin');
// Returns: false (Paladin requires CHA 13, character has 8)
```

## Getting Multiclass Proficiencies

When a character takes their first level in a new class, they gain limited proficiencies:

```typescript
// What proficiencies does a character gain when multiclassing into Rogue?
const proficiencies = getMulticlassProficiencies('Rogue');
console.log(proficiencies);
// {
//   armor: ['Light Armor'],
//   weapons: [],
//   tools: ["Thieves' Tools"]
// }
// Note: No saving throw proficiencies from multiclassing!
```

## Calculating Spell Slots

The system automatically calculates spell slots for multiclass spellcasters:

```typescript
const classes: ClassLevel[] = [
  { className: 'Wizard', level: 5 },
  { className: 'Paladin', level: 4 },
];

const spellSlots = calculateMulticlassSpellSlots(classes);
console.log(spellSlots);
// {
//   casterLevel: 7,  // Wizard 5 + (Paladin 4 / 2) = 7
//   slots: [4, 3, 3, 1, 0, 0, 0, 0, 0],  // 7th level spell slots
//   hasPactMagic: false
// }
```

### Warlock Pact Magic

Warlock spell slots are calculated separately and don't combine with other spellcasting:

```typescript
const sorlockClasses: ClassLevel[] = [
  { className: 'Sorcerer', level: 10 },
  { className: 'Warlock', level: 3 },
];

const slots = calculateMulticlassSpellSlots(sorlockClasses);
console.log(slots);
// {
//   casterLevel: 10,  // Only Sorcerer contributes
//   slots: [4, 3, 3, 3, 2, 0, 0, 0, 0],  // Standard 10th level slots
//   hasPactMagic: true,
//   pactMagicSlots: { level: 2, slots: 2 }  // Separate Warlock slots
// }
```

## Validating Multiclass Characters

Use the validation function to check if a complete character build is legal:

```typescript
const character: MulticlassCharacter = {
  classes: [
    { className: 'Fighter', level: 11 },
    { className: 'Wizard', level: 3 },
  ],
  totalLevel: 14,
  abilityScores: {
    STR: 15,
    DEX: 12,
    CON: 14,
    INT: 13,
    WIS: 10,
    CHA: 8,
  },
};

const validation = validateMulticlassCharacter(character);
console.log(validation);
// { valid: true, errors: [] }
```

If there are issues, you'll get detailed error messages:

```typescript
const invalidCharacter: MulticlassCharacter = {
  classes: [
    { className: 'Fighter', level: 11 },
    { className: 'Wizard', level: 3 },
  ],
  totalLevel: 14,
  abilityScores: {
    STR: 15,
    DEX: 12,
    CON: 14,
    INT: 10, // Too low!
    WIS: 10,
    CHA: 8,
  },
};

const validation = validateMulticlassCharacter(invalidCharacter);
console.log(validation);
// {
//   valid: false,
//   errors: ['Wizard requires INT 13 (has 10)']
// }
```

## Calculating Hit Points

Calculate total HP for multiclass characters:

```typescript
const classes: ClassLevel[] = [
  { className: 'Fighter', level: 8 },
  { className: 'Rogue', level: 4 },
];

const totalHP = calculateMulticlassHP(classes, 14, true);
// Constitution score: 14 (modifier +2)
// useAverage: true (recommended for consistency)
//
// Fighter 1st level: 10 (max die) + 2 (CON) = 12
// Fighter 2nd-8th: 7 levels × (6 avg + 2 CON) = 56
// Rogue 9th-12th: 4 levels × (5 avg + 2 CON) = 28
// Total: 12 + 56 + 28 = 96 HP

console.log(totalHP); // 96
```

## Common Multiclass Builds

### The "Padlock" (Paladin/Warlock)

A powerful combination using Charisma for both classes:

```typescript
const padlock: ClassLevel[] = [
  { className: 'Paladin', level: 6 },
  { className: 'Warlock', level: 2 },
];

// Prerequisites: STR 13, CHA 13
// Spell slots: 3 caster levels from Paladin (6/2)
// Pact Magic: 2 × 1st level slots from Warlock
// Can use Warlock spell slots for Divine Smite!
```

### The "Gish" (Fighter/Wizard)

Melee combatant with magical support:

```typescript
const gish: ClassLevel[] = [
  { className: 'Fighter', level: 11 },
  { className: 'Wizard', level: 3 },
];

// Prerequisites: STR 13, INT 13
// Extra Attack at Fighter 5, Extra Attack (2) at Fighter 11
// Limited spellcasting: 3 caster levels = 2nd level spells
// Combines martial prowess with utility magic
```

### The "Sorlock" (Sorcerer/Warlock)

Infinite cantrip damage with short rest spell slots:

```typescript
const sorlock: ClassLevel[] = [
  { className: 'Sorcerer', level: 10 },
  { className: 'Warlock', level: 2 },
];

// Prerequisites: CHA 13
// Standard spell slots: 10 caster levels
// Pact Magic: 2 × 1st level slots (short rest)
// Use Warlock slots to fuel Sorcery Points!
```

## Integration with Character System

Convert existing character records to multiclass format:

```typescript
import { characterToMulticlass } from './multiclassing';
import type { CharacterRecord } from '../types';

// Assuming you have a character from the database
const character: CharacterRecord = {
  /* ... character data ... */
  class: 'Fighter',
  level: 10,
  ability_scores: {
    STR: 15,
    DEX: 12,
    CON: 14,
    INT: 10,
    WIS: 10,
    CHA: 8,
  },
  /* ... */
};

const multiclassFormat = characterToMulticlass(character);
// Can now use with validation and calculation functions
```

## Notes on Implementation

- **Prerequisites**: Classes with multiple ability score requirements (Paladin, Monk, Ranger) are fully supported
- **Spell Slots**: Follows PHB p.164-165 multiclass spellcaster table exactly
- **Pact Magic**: Warlock spell slots are completely separate and don't combine with other classes
- **Proficiencies**: Starting proficiencies from first class only; multiclass proficiencies for additional classes
- **Saving Throws**: You NEVER gain saving throw proficiencies from multiclassing
- **HP Calculation**: First level uses max hit die, all subsequent levels use average (die/2 + 1)

## Future Enhancements

The current system supports single-class characters with the foundation for multiclassing.
To enable full multiclassing in the game:

1. Update database schema to store multiple class levels
2. Update character creation/leveling UI to support class selection
3. Add class feature tracking per class level
4. Implement subclass selection per class
5. Add spell list management for multiclass spellcasters
