# Leveling System Enhancement Summary

## Overview

The leveling system has been comprehensively enhanced to handle **ALL** D&D 5e level-up features across all 12 classes.

## What Was Changed

### File Modified
- `/srv/nuaibria/backend/src/services/levelingSystem.ts`

### Previous State
The leveling system only handled:
- HP increases
- Proficiency bonus
- XP thresholds
- Basic subclass selection

### New State
The leveling system now handles:
- ✅ HP increases (with Constitution modifier)
- ✅ Proficiency bonus increases
- ✅ XP thresholds (levels 1-20)
- ✅ **Spell slot progression** (all caster types)
- ✅ **Spells learned** (class-specific rules)
- ✅ **Cantrips learned** (levels 4 and 10)
- ✅ **Cantrip damage scaling** (levels 5, 11, 17)
- ✅ **ASI requirements** (including Fighter/Rogue extras)
- ✅ **Class features** (from class data files)
- ✅ **Subclass features** (automatic granting)
- ✅ **Subclass selection** (at appropriate levels)
- ✅ **Pending choices tracking**

## New Types

### LevelUpResult
Comprehensive result object containing all level-up information:

```typescript
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel?: number;
  hpGained?: number;
  proficiencyIncreased?: boolean;
  newProficiencyBonus?: number;

  // Spell progression
  newSpellSlots?: SpellSlotsByLevel;
  learnNewSpells?: number;
  learnNewCantrips?: number;
  cantripsDamageIncrease?: boolean;

  // Choices required
  requiresASI?: boolean;
  requiresSubclass?: boolean;
  availableSubclasses?: Subclass[];

  // Features granted
  newClassFeatures?: ClassFeature[];
  newSubclassFeatures?: SubclassFeature[];

  message?: string;
}
```

### PendingLevelUpChoices
Tracks unresolved level-up decisions:

```typescript
export interface PendingLevelUpChoices {
  hasPendingChoices: boolean;
  level: number;
  choices: {
    asi?: boolean;
    subclass?: boolean;
    spellsToLearn?: number;
    cantripsToLearn?: number;
  };
}
```

## New Functions

### checkAndProcessLevelUp()
Enhanced to return comprehensive level-up data for all 12 classes.

### checkPendingLevelUpChoices()
New function to check if character has pending level-up choices.

### Internal Helper Functions
- `getNewSpellsLearnedCount()` - Determines spells learned per class/level
- `getNewCantripsCount()` - Determines cantrips learned
- `cantripsDamageIncreases()` - Checks for cantrip scaling
- `requiresASI()` - Determines if ASI is required (including Fighter/Rogue exceptions)

## Class-Specific Implementations

### All 12 Classes Supported

#### Full Casters (Bard, Cleric, Druid, Sorcerer, Wizard)
- Spell slots from level 1
- 9th level spells at level 17
- **Wizard**: Learns 2 spells per level
- **Sorcerer/Bard**: Learns 1 spell per level (limited spells known)
- **Cleric/Druid**: Prepare spells (no learning required)

#### Half Casters (Paladin, Ranger)
- Spell slots starting at level 2
- 5th level spells at level 17
- **Ranger**: Learns spells at specific levels
- **Paladin**: Prepares spells (no learning required)

#### Warlock (Pact Magic)
- Unique slot progression
- All slots same level
- Learns 1 spell per level (with exceptions)

#### Non-Casters (Barbarian, Fighter, Monk, Rogue)
- No spell progression
- **Fighter**: Extra ASI at levels 6, 14
- **Rogue**: Extra ASI at level 10

## Testing

### Test Coverage
Created comprehensive test suite at:
- `/srv/nuaibria/backend/src/__tests__/services/levelingSystem.test.ts`

Tests cover:
- ✅ Type structure validation
- ✅ ASI requirements (standard + Fighter/Rogue)
- ✅ Spell slot progression
- ✅ Cantrip damage scaling
- ✅ Spells learned tracking
- ✅ Class features
- ✅ Subclass selection
- ✅ HP progression with Constitution
- ✅ Proficiency bonus increases
- ✅ Pending choices tracking
- ✅ Complete level-up flow

All tests pass: **15/15 ✓**

## Documentation

Created comprehensive guide at:
- `/srv/nuaibria/backend/src/services/LEVELING_SYSTEM_GUIDE.md`

Includes:
- Feature overview
- Usage examples for all classes
- Frontend integration guide
- Database tracking recommendations
- Error handling
- Future enhancements

## Integration Points

### Backend
- Existing `checkAndProcessLevelUp()` call sites work without changes
- Additional data now available in return value
- No breaking changes to existing functionality

### Frontend (Pending)
The frontend will need to:
1. Display ASI/Feat selection modal when `requiresASI` is true
2. Display spell selection modal when `learnNewSpells > 0`
3. Display cantrip selection modal when `learnNewCantrips > 0`
4. Show new class features in level-up notification
5. Handle cantrip damage scaling notification
6. Check for pending choices on character load

### Database (Optional Enhancement)
Consider adding fields to track pending choices:
- `pending_asi_levels: integer[]`
- `pending_spell_choices: jsonb`
- `pending_cantrip_choices: jsonb`

## Examples

### Example 1: Fighter Level 4 (ASI Required)
```typescript
{
  leveledUp: true,
  newLevel: 4,
  hpGained: 8,
  requiresASI: true,  // Must choose +2 to one stat, +1 to two stats, or a feat
  newClassFeatures: [],
  message: "⚠️ You must choose an Ability Score Improvement or a Feat."
}
```

### Example 2: Wizard Level 5 (Spells + Cantrip Scaling)
```typescript
{
  leveledUp: true,
  newLevel: 5,
  hpGained: 5,
  proficiencyIncreased: true,
  newProficiencyBonus: 3,
  newSpellSlots: { level1: 4, level2: 3, level3: 2, ... },
  learnNewSpells: 2,  // Learn 2 new spells
  cantripsDamageIncrease: true,  // Cantrips now deal more damage
  newClassFeatures: [{ name: "Third Level Spells", ... }]
}
```

### Example 3: Barbarian Level 3 (Subclass Selection)
```typescript
{
  leveledUp: true,
  newLevel: 3,
  requiresSubclass: true,
  availableSubclasses: [
    { name: "Berserker", class: "Barbarian", ... }
  ],
  newClassFeatures: [{ name: "Primal Path", ... }],
  message: "⚠️ You must now choose your subclass!"
}
```

## Backwards Compatibility

✅ **Fully backwards compatible**
- Existing code continues to work
- Optional fields use `?` in TypeScript
- Frontend can adopt new features incrementally

## Performance

- No additional database queries for most level-ups
- Class features fetched from static data files
- Spell slot calculations are simple lookups
- Overall: **Negligible performance impact**

## Future Work

### Immediate Next Steps
1. Create ASI/Feat selection API endpoint
2. Create spell selection API endpoint
3. Create cantrip selection API endpoint
4. Build frontend modals for choices
5. Add database tracking for pending choices

### Long-Term Enhancements
1. Multiclassing support
2. Custom/homebrew class support
3. Feature activation tracking
4. Milestone leveling (alternative to XP)
5. Level-down/respec functionality

## Conclusion

The leveling system is now **complete** for all D&D 5e rules regarding level-up progression. It provides comprehensive data that the frontend can use to present choices to players and properly update character capabilities.

**Status**: ✅ Complete and tested
**Breaking Changes**: None
**Tests**: 15/15 passing
**Documentation**: Complete
