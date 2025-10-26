# Quick Reference - Shared Constants

## Import Syntax

### Backend (CommonJS)
```typescript
import { RACES, CLASSES, ALIGNMENTS, BACKGROUNDS, SKILLS } from '../../shared/constants';
```

### Frontend (ES Modules)
```typescript
import { RACES, CLASSES, ALIGNMENTS, BACKGROUNDS, SKILLS } from '../../shared/constants/index.ts';
```

## Available Constants

| Constant | Count | File |
|----------|-------|------|
| RACES | 10 | races.ts |
| CLASSES | 12 | classes.ts |
| ALIGNMENTS | 9 | alignments.ts |
| BACKGROUNDS | 6 | backgrounds.ts |
| SKILLS | 18 | skills.ts |
| FULL_CASTER_SLOTS | 20 levels | spellSlots.ts |
| HALF_CASTER_SLOTS | 20 levels | spellSlots.ts |
| PACT_CASTER_SLOTS | 20 levels | spellSlots.ts |

## Helper Functions

### Lookups (Case-Insensitive)
```typescript
getRaceByName(name: string): Race | undefined
getClassByName(name: string): CharacterClass | undefined
getAlignmentByCode(code: string): Alignment | undefined
getAlignmentByName(name: string): Alignment | undefined
getBackgroundByName(name: string): Background | undefined
getSkillByName(name: string): Skill | undefined
```

### Lists
```typescript
getAllRaceNames(): string[]
getAllClassNames(): string[]
getAllAlignmentCodes(): string[]
getAllAlignmentNames(): string[]
getAllBackgroundNames(): string[]
getAllSkillNames(): string[]
```

### Utility
```typescript
isSpellcaster(className: string): boolean
isGoodAligned(code: string): boolean
isEvilAligned(code: string): boolean
isLawful(code: string): boolean
isChaotic(code: string): boolean
backgroundGrantsSkill(backgroundName: string, skillName: string): boolean
getSkillsByAbility(ability: AbilityScore): Skill[]
calculateSkillModifier(abilityScore: number, proficiencyBonus: number, isProficient: boolean, hasExpertise?: boolean): number
getSpellSlotsForLevel(casterType: 'full' | 'half' | 'pact' | 'none', level: number): number[] | undefined
```

## Common Patterns

### Populate Dropdown Menu
```typescript
import { RACES } from '../../shared/constants/index.ts';

const raceOptions = RACES.map(race => ({
  value: race.name,
  label: race.name
}));
```

### Validate Character Build
```typescript
import { getClassByName, getRaceByName } from '../../shared/constants';

const characterClass = getClassByName(formData.class);
const characterRace = getRaceByName(formData.race);

if (!characterClass || !characterRace) {
  throw new Error('Invalid character build');
}
```

### Calculate Skill Modifier
```typescript
import { calculateSkillModifier, getSkillByName } from '../../shared/constants';

const skill = getSkillByName('Stealth');
const dexterity = 16; // +3 modifier
const proficiencyBonus = 2;
const isProficient = true;
const hasExpertise = false;

const modifier = calculateSkillModifier(
  dexterity,
  proficiencyBonus,
  isProficient,
  hasExpertise
);
// Result: 5 (dex +3 + proficiency +2)
```

### Check Alignment
```typescript
import { isGoodAligned, isLawful } from '../../shared/constants';

if (isGoodAligned(character.alignment)) {
  // Good-aligned character logic
}

if (isLawful(character.alignment)) {
  // Lawful character logic
}
```

### Get Skills for Ability
```typescript
import { getSkillsByAbility } from '../../shared/constants';

const dexteritySkills = getSkillsByAbility('DEX');
// Returns: [Acrobatics, Sleight of Hand, Stealth]
```

### Get Spell Slots
```typescript
import { getSpellSlotsForLevel, getClassByName } from '../../shared/constants';

const wizard = getClassByName('Wizard');
const level = 5;

if (wizard.spellcasting.type !== 'none') {
  const slots = getSpellSlotsForLevel(wizard.spellcasting.type, level);
  // Result: [4, 3, 2] - 4 first-level, 3 second-level, 2 third-level slots
}
```

## Test Commands

```bash
cd /srv/project-chimera/shared

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Build TypeScript
npm run build

# Clean dist
npm run clean
```

## File Locations

```
/srv/project-chimera/shared/
├── constants/
│   ├── races.ts           # Race data
│   ├── classes.ts         # Class data
│   ├── alignments.ts      # Alignment data
│   ├── backgrounds.ts     # Background data
│   ├── skills.ts          # Skill data
│   ├── spellSlots.ts      # Spell slot progression
│   ├── index.ts           # Barrel exports
│   ├── README.md          # Full documentation
│   ├── SUMMARY.md         # Implementation summary
│   └── QUICK_REFERENCE.md # This file
├── __tests__/
│   └── constants.test.ts  # Test suite
└── dist/                  # Compiled output
    └── constants/
        ├── *.js           # JavaScript files
        ├── *.d.ts         # Type definitions
        └── *.map          # Source maps
```

## TypeScript Interfaces

```typescript
interface Race {
  name: string;
  description: string;
  abilityBonuses: { [key in 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA']?: number };
  speed: number;
  languages: string[];
  traits: string[];
  hitDie?: number;
}

interface CharacterClass {
  name: string;
  description: string;
  hitDie: number;
  spellcasting: {
    enabled: boolean;
    ability?: 'INT' | 'WIS' | 'CHA';
    type?: 'full' | 'half' | 'pact' | 'none';
  };
  skills: string[];
  skillCount: number;
  spellSlots?: SpellSlotProgression;
}

interface Alignment {
  code: string;
  name: string;
  description: string;
  philosophy: string;
  example: string;
}

interface Background {
  name: string;
  description: string;
  skillBonuses: string[];
  toolProficiencies?: string[];
  languages?: number;
  otherBenefits: string[];
  feature: {
    name: string;
    description: string;
  };
}

interface Skill {
  name: string;
  description: string;
  ability: AbilityScore;
  examples: string[];
}

type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

type SpellSlotProgression = {
  [level: number]: number[];
};
```

## Quick Data Reference

### Races by Size
- Medium: All except Gnome, Halfling
- Small: Gnome, Halfling

### Classes by Hit Die
- d6: Sorcerer, Wizard
- d8: Bard, Cleric, Druid, Monk, Rogue, Warlock
- d10: Fighter, Paladin, Ranger
- d12: Barbarian

### Skills by Ability
- STR: Athletics
- DEX: Acrobatics, Sleight of Hand, Stealth
- INT: Arcana, History, Investigation, Nature, Religion
- WIS: Animal Handling, Insight, Medicine, Perception, Survival
- CHA: Deception, Intimidation, Performance, Persuasion

### Spellcasting Classes
- Full (INT): Wizard
- Full (WIS): Cleric, Druid
- Full (CHA): Bard, Sorcerer
- Half (WIS): Ranger
- Half (CHA): Paladin
- Pact (CHA): Warlock
- None: Barbarian, Fighter, Monk, Rogue

---

For detailed documentation, see [README.md](./README.md)
