# D&D 5e Data Constants

This directory contains centralized TypeScript constants for all D&D 5th Edition game data used throughout the Nuaibria project. These constants are shared between the frontend and backend to ensure consistency and type safety.

## Contents

### 1. races.ts
Defines all 10 playable races with complete mechanical properties:
- **Races Included**: Aasimar, Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling
- **Properties**:
  - Ability score bonuses
  - Movement speed
  - Languages
  - Racial traits
  - Descriptions and lore

**Example Usage:**
```typescript
import { RACES, getRaceByName } from '@nuaibria/shared/constants';

const elf = getRaceByName('Elf');
console.log(elf.speed); // 30
console.log(elf.abilityBonuses); // { DEX: 2 }
```

### 2. classes.ts
Defines all 12 playable classes with mechanics and progression:
- **Classes Included**: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
- **Properties**:
  - Hit die (d6, d8, d10, or d12)
  - Spellcasting capabilities (full, half, pact, or none)
  - Available skills
  - Skill selection count
  - Spell slots by level

**Example Usage:**
```typescript
import { CLASSES, getClassByName, isSpellcaster } from '@nuaibria/shared/constants';

const wizard = getClassByName('Wizard');
console.log(wizard.hitDie); // 6
console.log(isSpellcaster('Wizard')); // true
console.log(wizard.spellSlots[1]); // [2] - 2 first-level slots at level 1
```

### 3. alignments.ts
Defines all 9 alignments with philosophy and examples:
- **Alignments Included**: Lawful Good (LG), Neutral Good (NG), Chaotic Good (CG), Lawful Neutral (LN), True Neutral (N), Chaotic Neutral (CN), Lawful Evil (LE), Neutral Evil (NE), Chaotic Evil (CE)
- **Properties**:
  - Two-letter code (e.g., 'LG')
  - Full name
  - Description and philosophy
  - Character examples

**Example Usage:**
```typescript
import { ALIGNMENTS, getAlignmentByCode, isGoodAligned } from '@nuaibria/shared/constants';

const lg = getAlignmentByCode('LG');
console.log(lg.name); // "Lawful Good"
console.log(isGoodAligned('LG')); // true
console.log(isLawful('LG')); // true
```

### 4. backgrounds.ts
Defines all 6 character backgrounds with skills and features:
- **Backgrounds Included**: Acolyte, Criminal, Folk Hero, Noble, Sage, Soldier
- **Properties**:
  - Skill proficiencies (always 2)
  - Tool proficiencies
  - Language bonuses
  - Background feature (name + description)
  - Starting equipment

**Example Usage:**
```typescript
import { BACKGROUNDS, getBackgroundByName, backgroundGrantsSkill } from '@nuaibria/shared/constants';

const acolyte = getBackgroundByName('Acolyte');
console.log(acolyte.skillBonuses); // ['Insight', 'Religion']
console.log(backgroundGrantsSkill('Acolyte', 'Insight')); // true
console.log(acolyte.feature.name); // "Shelter of the Faithful"
```

### 5. skills.ts
Defines all 18 skills with associated abilities and usage examples:
- **Skills Included**: Acrobatics, Animal Handling, Arcana, Athletics, Deception, History, Insight, Intimidation, Investigation, Medicine, Nature, Perception, Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival
- **Properties**:
  - Associated ability score (STR, DEX, INT, WIS, CHA)
  - Description
  - Usage examples

**Example Usage:**
```typescript
import { SKILLS, getSkillByName, getSkillsByAbility, calculateSkillModifier } from '@nuaibria/shared/constants';

const perception = getSkillByName('Perception');
console.log(perception.ability); // 'WIS'

const wisdomSkills = getSkillsByAbility('WIS');
// Returns: Perception, Insight, Medicine, Animal Handling, Survival

// Calculate skill modifier: 14 DEX (+2), proficiency +2, not expert
const modifier = calculateSkillModifier(14, 2, true, false);
console.log(modifier); // 4 (ability mod +2, proficiency +2)
```

## Installation & Usage

### From Backend (CommonJS)
```typescript
import { RACES, CLASSES, ALIGNMENTS, BACKGROUNDS, SKILLS } from '../../shared/constants';
```

### From Frontend (ES Modules)
```typescript
import { RACES, CLASSES, ALIGNMENTS, BACKGROUNDS, SKILLS } from '../../shared/constants/index.ts';
```

## Testing

The constants are thoroughly tested with 53 test cases covering:
- Structure validation
- Data completeness
- Helper function correctness
- Cross-constant integration
- Edge cases

```bash
cd shared
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report (97%+ coverage)
```

## Building

To compile the TypeScript constants to JavaScript:

```bash
cd shared
npm run build
```

This generates:
- `dist/constants/*.js` - Compiled JavaScript
- `dist/constants/*.d.ts` - Type definitions
- `dist/constants/*.map` - Source maps

## Type Safety

All constants are fully typed with TypeScript interfaces:
- `Race` - Race data structure
- `CharacterClass` - Class data structure
- `Alignment` - Alignment data structure
- `Background` - Background data structure
- `Skill` - Skill data structure
- `AbilityScore` - Type for ability scores ('STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA')

## Helper Functions

Each constant file includes utility functions:

### Races
- `getRaceByName(name: string): Race | undefined`
- `getAllRaceNames(): string[]`

### Classes
- `getClassByName(name: string): CharacterClass | undefined`
- `getAllClassNames(): string[]`
- `isSpellcaster(className: string): boolean`

### Alignments
- `getAlignmentByCode(code: string): Alignment | undefined`
- `getAlignmentByName(name: string): Alignment | undefined`
- `getAllAlignmentCodes(): string[]`
- `getAllAlignmentNames(): string[]`
- `isGoodAligned(code: string): boolean`
- `isEvilAligned(code: string): boolean`
- `isLawful(code: string): boolean`
- `isChaotic(code: string): boolean`

### Backgrounds
- `getBackgroundByName(name: string): Background | undefined`
- `getAllBackgroundNames(): string[]`
- `backgroundGrantsSkill(backgroundName: string, skillName: string): boolean`

### Skills
- `getSkillByName(name: string): Skill | undefined`
- `getAllSkillNames(): string[]`
- `getSkillsByAbility(ability: AbilityScore): Skill[]`
- `calculateSkillModifier(abilityScore: number, proficiencyBonus: number, isProficient: boolean, hasExpertise?: boolean): number`

## Design Principles

1. **Immutability**: All constants are read-only arrays/objects
2. **Type Safety**: Full TypeScript typing with no `any` types
3. **Case Insensitivity**: All lookup functions are case-insensitive
4. **Completeness**: All official D&D 5e data included
5. **Documentation**: Every field includes description and examples
6. **Testability**: 97%+ test coverage with comprehensive validation

## Integration with Project

These constants are used throughout the Nuaibria project:
- **Character Creation**: Frontend forms populate from these constants
- **Rules Engine**: Backend validates character builds against these constants
- **AI Narrator**: Uses race/class/background descriptions for narrative generation
- **Combat System**: Uses skill/ability data for dice roll calculations
- **Database Schema**: Character data structure mirrors these type definitions

## Maintenance

When adding new content:
1. Add data to the appropriate constant file
2. Update interfaces if structure changes
3. Add test cases to `__tests__/constants.test.ts`
4. Run `npm test` to verify all tests pass
5. Run `npm run build` to compile
6. Update this README if adding new files

## License

Part of the Nuaibria project. D&D 5e content follows Wizards of the Coast's SRD 5.1 under OGL.
