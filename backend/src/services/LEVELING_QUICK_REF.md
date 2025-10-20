# Leveling System - Quick Reference

## Import

```typescript
import { checkAndProcessLevelUp, checkPendingLevelUpChoices } from './services/levelingSystem';
import type { LevelUpResult, PendingLevelUpChoices } from './services/levelingSystem';
```

## Basic Usage

```typescript
// After awarding XP
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp) {
  console.log(result.message);
  // Handle choices (ASI, subclass, spells, etc.)
}
```

## Return Value Fields

| Field | Type | Description |
|-------|------|-------------|
| `leveledUp` | `boolean` | Did character level up? |
| `newLevel` | `number?` | New character level |
| `hpGained` | `number?` | HP increase this level |
| `proficiencyIncreased` | `boolean?` | Did proficiency bonus increase? |
| `newProficiencyBonus` | `number?` | New proficiency bonus |
| `newSpellSlots` | `SpellSlotsByLevel?` | Updated spell slots (casters only) |
| `learnNewSpells` | `number?` | Number of spells to learn |
| `learnNewCantrips` | `number?` | Number of cantrips to learn |
| `cantripsDamageIncrease` | `boolean?` | Did cantrip damage scale? |
| `requiresASI` | `boolean?` | Must choose ASI or Feat? |
| `requiresSubclass` | `boolean?` | Must choose subclass? |
| `availableSubclasses` | `Subclass[]?` | Available subclasses (if selection required) |
| `newClassFeatures` | `ClassFeature[]?` | Class features gained |
| `newSubclassFeatures` | `SubclassFeature[]?` | Subclass features gained |
| `message` | `string?` | User-facing message |

## ASI Levels by Class

| Class | ASI Levels |
|-------|------------|
| All Classes | 4, 8, 12, 16, 19 |
| Fighter (extra) | 6, 14 |
| Rogue (extra) | 10 |

## Spell Learning by Class

| Class | Spells Learned Per Level |
|-------|-------------------------|
| Wizard | 2 |
| Sorcerer | 1 |
| Bard | 1 |
| Warlock | 1 (mostly) |
| Ranger | 1 (at specific levels: 2, 3, 5, 7, 9, 11, 13, 15, 17, 19) |
| Cleric | 0 (prepares from full list) |
| Druid | 0 (prepares from full list) |
| Paladin | 0 (prepares from full list) |
| Non-casters | 0 |

## Cantrip Learning

Most casters learn new cantrips at:
- **Level 4**: +1 cantrip
- **Level 10**: +1 cantrip

## Cantrip Damage Scaling

Cantrip damage increases at:
- **Level 5**: 2 dice
- **Level 11**: 3 dice
- **Level 17**: 4 dice

## Subclass Selection Levels

| Class | Subclass Level |
|-------|----------------|
| Cleric, Sorcerer, Warlock | 1 |
| Druid, Wizard | 2 |
| All others | 3 |

## Proficiency Bonus Progression

| Levels | Proficiency |
|--------|-------------|
| 1-4 | +2 |
| 5-8 | +3 |
| 9-12 | +4 |
| 13-16 | +5 |
| 17-20 | +6 |

## Spell Slot Progression

### Full Casters (Bard, Cleric, Druid, Sorcerer, Wizard)
- Level 1: 1st level slots
- Level 17: 9th level slots

### Half Casters (Paladin, Ranger)
- Level 2: 1st level slots (start spellcasting)
- Level 17: 5th level slots (max)

### Warlock (Pact Magic)
- Unique: All slots same level
- Recharge on short rest
- Fewer total slots

## Checking Pending Choices

```typescript
const pending = await checkPendingLevelUpChoices(characterId);

if (pending.hasPendingChoices) {
  if (pending.choices.asi) {
    // Show ASI/Feat modal
  }
  if (pending.choices.subclass) {
    // Show subclass modal
  }
  if (pending.choices.spellsToLearn) {
    // Show spell selection
  }
  if (pending.choices.cantripsToLearn) {
    // Show cantrip selection
  }
}
```

## Common Patterns

### Pattern 1: Full Level-Up Handler

```typescript
async function handleLevelUp(characterId: string) {
  const result = await checkAndProcessLevelUp(characterId);

  if (!result.leveledUp) return;

  // Show notification
  showNotification(result.message);

  // Handle required choices
  if (result.requiresASI) {
    await openASIModal(characterId);
  }

  if (result.requiresSubclass) {
    await openSubclassModal(characterId, result.availableSubclasses);
  }

  if (result.learnNewSpells) {
    await openSpellSelectionModal(characterId, result.learnNewSpells);
  }

  if (result.learnNewCantrips) {
    await openCantripSelectionModal(characterId, result.learnNewCantrips);
  }

  // Show new features
  if (result.newClassFeatures.length > 0) {
    showClassFeatures(result.newClassFeatures);
  }

  if (result.newSubclassFeatures.length > 0) {
    showSubclassFeatures(result.newSubclassFeatures);
  }

  // Refresh character data
  refreshCharacter(characterId);
}
```

### Pattern 2: On Character Load

```typescript
async function onCharacterLoad(characterId: string) {
  // Check for pending choices from previous session
  const pending = await checkPendingLevelUpChoices(characterId);

  if (pending.hasPendingChoices) {
    // Block gameplay until choices resolved
    blockGameplay();

    if (pending.choices.subclass) {
      await resolveSubclass(characterId);
    }
    // ... handle other pending choices

    unblockGameplay();
  }
}
```

### Pattern 3: After XP Award

```typescript
async function awardXP(characterId: string, xpGained: number) {
  // Update XP in database
  await updateCharacterXP(characterId, xpGained);

  // Check for level-up
  const result = await checkAndProcessLevelUp(characterId);

  if (result.leveledUp) {
    await handleLevelUp(characterId, result);
  }

  return result;
}
```

## Error Handling

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (!result.leveledUp) {
  // Either:
  // 1. Character doesn't have enough XP
  // 2. Database error occurred
  // Check server logs for details
}
```

## Testing

```typescript
import { checkAndProcessLevelUp } from './services/levelingSystem';

// Mock or use test database
const result = await checkAndProcessLevelUp(testCharacterId);

expect(result.leveledUp).toBe(true);
expect(result.newLevel).toBe(5);
expect(result.requiresASI).toBe(false);
```

## Performance Notes

- **Fast**: No additional DB queries for most level-ups
- **Efficient**: Class features from static data
- **Scalable**: O(1) lookups for spell slots and ASI checks

## See Also

- [Full Guide](./LEVELING_SYSTEM_GUIDE.md) - Comprehensive documentation
- [Enhancement Summary](../../../LEVELING_SYSTEM_ENHANCEMENT_SUMMARY.md) - What changed
- [Tests](../../../backend/src/__tests__/services/levelingSystem.test.ts) - Test examples
