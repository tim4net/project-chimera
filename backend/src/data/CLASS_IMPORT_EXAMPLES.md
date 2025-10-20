# D&D 5e Class Data Import - Usage Examples

## Files Created

- **classTypes.ts** - TypeScript type definitions (33 lines)
- **classFeatures.ts** - Main export file with helper functions (68 lines)
- **proficiencies.ts** - Armor, weapon, tool, and skill proficiencies (94 lines)
- **classes/*.ts** - Individual class data files (12 files, 37-51 lines each)

## Data Imported

- ✅ All 12 D&D 5e SRD classes (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)
- ✅ 261 total class features across all levels 1-20
- ✅ Complete spellcasting tables for 8 caster classes
- ✅ Proficiencies (armor, weapons, tools, saving throws)
- ✅ Hit dice for each class
- ✅ Subclass information

## Usage Examples

### Import the Data

```typescript
import {
  CLASS_DATA,
  getClassData,
  getFeaturesForLevel,
  getFeaturesUpToLevel,
  getSpellSlots,
  type ClassName,
  type ClassData,
  type ClassFeature
} from './data/classFeatures';

import { getProficiencyBonus } from './data/proficiencies';
```

### Example 1: Get Class Information

```typescript
const wizard = getClassData('Wizard');
console.log(wizard.name);              // "Wizard"
console.log(wizard.hitDice);           // 6
console.log(wizard.proficiencies.savingThrows); // ["INT", "WIS"]
console.log(wizard.spellcasting?.ability);      // "INT"
```

### Example 2: Get Features for a Level

```typescript
// Get all features gained at level 5
const level5Features = getFeaturesForLevel('Fighter', 5);
// Returns: [{ level: 5, name: "Extra Attack", description: "...", type: "active" }]

// Get all features up to level 5
const allFeatures = getFeaturesUpToLevel('Fighter', 5);
// Returns array of all features from levels 1-5
```

### Example 3: Spell Slots

```typescript
// Get spell slots for a wizard at level 5
const slots = getSpellSlots('Wizard', 5);
// Returns: [4, 3, 2, 0, 0, 0, 0, 0, 0]
// This means: 4 level-1 slots, 3 level-2 slots, 2 level-3 slots

// Non-casters return null
const noSlots = getSpellSlots('Fighter', 10); // null
```

### Example 4: Character Creation

```typescript
function createCharacter(className: ClassName, level: number) {
  const classData = getClassData(className);

  return {
    class: classData.name,
    level: level,
    hitDice: classData.hitDice,
    proficiencyBonus: getProficiencyBonus(level),
    savingThrows: classData.proficiencies.savingThrows,
    features: getFeaturesUpToLevel(className, level),
    spellSlots: classData.spellcasting
      ? getSpellSlots(className, level)
      : null
  };
}

const character = createCharacter('Wizard', 5);
```

### Example 5: Leveling Up

```typescript
function getLevelUpFeatures(className: ClassName, newLevel: number) {
  const features = getFeaturesForLevel(className, newLevel);

  return {
    level: newLevel,
    features: features.map(f => ({
      name: f.name,
      description: f.description,
      type: f.type
    })),
    proficiencyBonus: getProficiencyBonus(newLevel),
    newSpellSlots: getSpellSlots(className, newLevel)
  };
}

const levelUpInfo = getLevelUpFeatures('Paladin', 6);
```

### Example 6: Display All Classes

```typescript
import { CLASS_DATA } from './data/classFeatures';

Object.values(CLASS_DATA).forEach(classData => {
  console.log(`${classData.name}:`);
  console.log(`  Hit Die: d${classData.hitDice}`);
  console.log(`  Saves: ${classData.proficiencies.savingThrows.join(', ')}`);
  console.log(`  Caster: ${classData.spellcasting ? 'Yes' : 'No'}`);
  console.log(`  Features: ${classData.features.length}`);
});
```

## Feature Types

Each feature has a `type` field (inferred from feature names):

- **passive** - Always-on abilities (e.g., Unarmored Defense, Danger Sense)
- **active** - Requires action/bonus action (e.g., Rage, Extra Attack, Spellcasting)
- **choice** - Player makes a choice (e.g., Fighting Style, Ability Score Improvement)

## Spell Slot Arrays

Spell slot arrays have 9 elements representing spell levels 1-9:
```typescript
[4, 3, 3, 3, 2, 0, 0, 0, 0]
//    1st: 4 slots
//    2nd: 3 slots
//    3rd: 3 slots
//    4th: 3 slots
//    5th: 2 slots
//    6th-9th: 0 slots
```

**Note:** Warlock uses Pact Magic (different spell slot progression).

## Integration with Character System

Use this data when:
- Creating new characters (assign class, hit dice, proficiencies)
- Leveling up (grant new features, update spell slots)
- Validating character builds (check class requirements)
- Displaying character sheets (show available features)
- Calculating stats (proficiency bonus, spell save DC)

## Data Source

All data imported from the official D&D 5e SRD API:
**https://www.dnd5eapi.co/**
