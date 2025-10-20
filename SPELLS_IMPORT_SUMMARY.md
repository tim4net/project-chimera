# D&D 5e Spells Import Summary

## Overview
Successfully imported **169 spells** from the D&D 5e SRD API (https://www.dnd5eapi.co)

### Breakdown by Level
- **Cantrips (Level 0)**: 24 spells
- **Level 1 Spells**: 49 spells
- **Level 2 Spells**: 54 spells
- **Level 3 Spells**: 42 spells

### Special Properties
- **Ritual Spells**: 22
- **Concentration Spells**: 64

## Spells by Class

| Class | Cantrips | Level 1 | Level 2 | Level 3 | Total |
|-------|----------|---------|---------|---------|-------|
| Bard | 9 | 19 | 19 | 15 | **62** |
| Cleric | 7 | 15 | 17 | 19 | **58** |
| Druid | 7 | 16 | 17 | 12 | **52** |
| Paladin | 0 | 11 | 8 | 6 | **25** |
| Ranger | 0 | 11 | 11 | 9 | **31** |
| Sorcerer | 14 | 17 | 21 | 20 | **72** |
| Warlock | 7 | 7 | 10 | 11 | **35** |
| Wizard | 14 | 27 | 31 | 28 | **100** |

## Spells by School of Magic

| School | Cantrips | Level 1 | Level 2 | Level 3 | Total |
|--------|----------|---------|---------|---------|-------|
| Abjuration | 1 | 6 | 6 | 8 | **21** |
| Conjuration | 4 | 6 | 4 | 7 | **21** |
| Divination | 2 | 7 | 6 | 2 | **17** |
| Enchantment | 1 | 8 | 6 | 0 | **15** |
| Evocation | 7 | 9 | 11 | 7 | **34** |
| Illusion | 1 | 4 | 6 | 4 | **15** |
| Necromancy | 2 | 2 | 3 | 4 | **11** |
| Transmutation | 6 | 7 | 12 | 10 | **35** |

## File Structure

```
backend/src/data/
├── spellTypes.ts        # TypeScript interfaces and types
├── cantrips.ts          # All cantrips (level 0 spells)
├── level1Spells.ts      # All level 1 spells
├── level2Spells.ts      # All level 2 spells
├── level3Spells.ts      # All level 3 spells
├── spells.ts            # Main index with utility functions
└── spellSlots.ts        # Spell slots per class per level

backend/src/game/
└── spellcasting.ts      # Spellcasting mechanics (DC, attack bonus, etc.)
```

## API Functions

### From `spells.ts`:
- `getSpellsForClass(className, maxLevel)` - Get all spells for a class
- `getSpellByName(name)` - Find a spell by name
- `getSpellsBySchool(school)` - Get spells by magic school
- `getRitualSpells()` - Get all ritual spells
- `getConcentrationSpells()` - Get all concentration spells

### From `spellSlots.ts`:
- `getSpellSlotsForClass(className, characterLevel)` - Get spell slots
- `getMaxSpellLevel(className, characterLevel)` - Get max castable spell level

### From `spellcasting.ts`:
- `calculateSpellcastingStats(className, level, abilityScores)` - Full stats
- `calculateSpellSaveDC(profBonus, abilityMod)` - Calculate save DC
- `calculateSpellAttackBonus(profBonus, abilityMod)` - Calculate attack bonus
- `canCastSpell(spell, class, level, slots)` - Check if spell can be cast
- `rollSavingThrow(abilityMod, dc)` - Roll saving throw
- `rollSpellAttack(attackBonus, targetAC)` - Roll spell attack
- `rollDamage(diceNotation)` - Roll damage dice
- `rollConcentrationCheck(conMod, damage)` - Check concentration

## Sample Spells

### Popular Cantrips:
- Fire Bolt (Evocation) - Ranged spell attack, 1d10 fire damage
- Mage Hand (Conjuration) - Create spectral hand
- Prestidigitation (Transmutation) - Minor magical tricks
- Sacred Flame (Evocation) - Dexterity save, 1d8 radiant damage

### Popular Level 1 Spells:
- Magic Missile (Evocation) - Auto-hit 3 darts, 1d4+1 each
- Shield (Abjuration) - +5 AC until start of next turn
- Cure Wounds (Evocation) - Heal 1d8 + spellcasting modifier
- Burning Hands (Evocation) - 15ft cone, 3d6 fire damage

### Popular Level 2 Spells:
- Misty Step (Conjuration) - Bonus action teleport 30ft
- Invisibility (Illusion) - Turn invisible until attack/cast
- Scorching Ray (Evocation) - Three ranged spell attacks, 2d6 each
- Hold Person (Enchantment) - Paralyze humanoid

### Popular Level 3 Spells:
- Fireball (Evocation) - 20ft radius, 8d6 fire damage
- Counterspell (Abjuration) - Interrupt enemy spellcasting
- Lightning Bolt (Evocation) - 100ft line, 8d6 lightning damage
- Fly (Transmutation) - Grant flying speed of 60ft

## Usage Example

```typescript
import { getSpellsForClass, getSpellByName } from './data/spells';
import { calculateSpellcastingStats } from './game/spellcasting';
import { getSpellSlotsForClass } from './data/spellSlots';

// Get all wizard spells up to level 3
const wizardSpells = getSpellsForClass('Wizard', 3);

// Calculate spellcasting stats for a level 5 wizard
const stats = calculateSpellcastingStats('Wizard', 5, {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 16, // +3 modifier
  wisdom: 10,
  charisma: 8
});
// Result: { spellSaveDC: 14, spellAttackBonus: +6, maxSpellLevel: 3 }

// Get spell slots
const slots = getSpellSlotsForClass('Wizard', 5);
// Result: { level1: 4, level2: 3, level3: 2, ... }

// Look up a specific spell
const fireball = getSpellByName('Fireball');
console.log(fireball.description);
```

## Notes

- All spell data is from the official D&D 5e SRD (System Reference Document)
- Spell descriptions include full text and higher level casting effects
- Material components are included when specified
- Each spell includes class availability, saving throw info, and damage types
- Files are organized by spell level for maintainability
