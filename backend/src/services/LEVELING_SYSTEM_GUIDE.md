# D&D 5e Comprehensive Leveling System Guide

## Overview

The enhanced leveling system now handles **ALL** D&D 5e level-up features, not just HP and proficiency bonus. This includes spell progression, ASI requirements, class features, subclass features, and more.

## Key Features

### 1. Complete Level-Up Data

The `checkAndProcessLevelUp()` function now returns comprehensive information about what happens when a character levels up:

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

### 2. Spell Progression

#### Spell Slots
- Automatically updated for all spellcasting classes
- Full casters (Wizard, Sorcerer, Bard, Cleric, Druid)
- Half casters (Paladin, Ranger)
- Warlock Pact Magic
- Third casters (Eldritch Knight, Arcane Trickster subclasses)

#### Spells Learned
- **Wizard**: Learns 2 spells per level
- **Sorcerer/Bard**: Learns 1 spell per level (limited spells known)
- **Warlock**: Learns 1 spell per level (with some exceptions at higher levels)
- **Ranger**: Learns spells at specific levels (2, 3, 5, 7, 9, 11, 13, 15, 17, 19)
- **Prepared Casters** (Cleric, Druid, Paladin): Don't "learn" spells - they prepare from entire class list

#### Cantrips
- Most casters gain new cantrips at levels 4 and 10
- Cantrip damage increases at levels 5, 11, and 17

### 3. Ability Score Improvements (ASI)

The system tracks when characters must choose an ASI or Feat:

- **Standard classes**: Levels 4, 8, 12, 16, 19
- **Fighter**: Additional ASI at levels 6, 14
- **Rogue**: Additional ASI at level 10

When `requiresASI` is true, the frontend should display a modal for the player to:
1. Increase two ability scores by +1 each (max 20)
2. Increase one ability score by +2 (max 20)
3. Choose a feat (from available feats in `/backend/src/data/feats.ts`)

### 4. Class Features

New class features are automatically retrieved and included in the level-up result:

```typescript
newClassFeatures: [
  {
    level: 5,
    name: 'Extra Attack',
    description: 'Beginning at 5th level, you can attack twice...',
    type: 'active'
  }
]
```

### 5. Subclass Features

If a character already has a subclass, new subclass features are automatically granted:

```typescript
newSubclassFeatures: [
  {
    level: 3,
    name: 'Frenzy',
    description: 'When you rage, you can go into a frenzy...'
  }
]
```

### 6. Pending Choices

Use `checkPendingLevelUpChoices()` to check if a character has unresolved level-up decisions:

```typescript
const pending = await checkPendingLevelUpChoices(characterId);

if (pending.hasPendingChoices) {
  // Display modal or block gameplay
  if (pending.choices.asi) {
    // Show ASI/Feat selection
  }
  if (pending.choices.subclass) {
    // Show subclass selection
  }
  if (pending.choices.spellsToLearn) {
    // Show spell selection (learn X new spells)
  }
  if (pending.choices.cantripsToLearn) {
    // Show cantrip selection (learn X new cantrips)
  }
}
```

## Usage Examples

### Example 1: Fighter Leveling from 3 to 4

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp) {
  console.log(`Level ${result.newLevel}!`);
  console.log(`HP gained: ${result.hpGained}`);
  console.log(`Requires ASI: ${result.requiresASI}`); // true

  // Fighter at level 4 must choose ASI or Feat
  if (result.requiresASI) {
    // Display ASI/Feat modal
  }
}
```

### Example 2: Wizard Leveling from 2 to 3

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp) {
  console.log(`Spell slots: ${JSON.stringify(result.newSpellSlots)}`);
  // { level1: 4, level2: 2, level3: 0, ... }

  console.log(`Learn new spells: ${result.learnNewSpells}`); // 2

  // Wizard learns 2 new spells at level 3
  if (result.learnNewSpells) {
    // Display spell selection modal
  }
}
```

### Example 3: Cleric Leveling from 1 to 2

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp) {
  console.log(`New class features:`, result.newClassFeatures);
  // [{ name: 'Channel Divinity', ... }]

  console.log(`New subclass features:`, result.newSubclassFeatures);
  // [{ name: 'Channel Divinity: Preserve Life', ... }]
  // (if Life Domain was chosen at level 1)
}
```

### Example 4: Barbarian Leveling from 2 to 3

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp && result.requiresSubclass) {
  console.log(`Available subclasses:`, result.availableSubclasses);
  // [{ name: 'Berserker', class: 'Barbarian', ... }]

  // Display subclass selection modal
}
```

### Example 5: Sorcerer Leveling from 4 to 5

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (result.leveledUp) {
  console.log(`Cantrips damage increase: ${result.cantripsDamageIncrease}`); // true
  console.log(`New spell slots:`, result.newSpellSlots);
  // level3: 2 (gained 3rd level spell slots)

  console.log(`Learn new spells: ${result.learnNewSpells}`); // 1

  // At level 5, cantrips like Fire Bolt now deal 2d10 instead of 1d10
}
```

## Integration with Frontend

### Step 1: Check for Level-Up After XP Gain

```typescript
// After awarding XP (e.g., after combat, quest completion)
const levelUpResult = await checkAndProcessLevelUp(characterId);

if (levelUpResult.leveledUp) {
  // Display level-up notification
  showNotification(levelUpResult.message);

  // Handle required choices
  if (levelUpResult.requiresASI) {
    openASIModal(levelUpResult);
  }

  if (levelUpResult.requiresSubclass) {
    openSubclassModal(levelUpResult.availableSubclasses);
  }

  if (levelUpResult.learnNewSpells) {
    openSpellSelectionModal(levelUpResult.learnNewSpells);
  }

  if (levelUpResult.learnNewCantrips) {
    openCantripSelectionModal(levelUpResult.learnNewCantrips);
  }
}
```

### Step 2: Display Class Features

```typescript
if (levelUpResult.newClassFeatures.length > 0) {
  // Show feature descriptions
  levelUpResult.newClassFeatures.forEach(feature => {
    console.log(`${feature.name}: ${feature.description}`);
  });
}
```

### Step 3: Handle Pending Choices on Login

```typescript
// When player logs in or loads character
const pending = await checkPendingLevelUpChoices(characterId);

if (pending.hasPendingChoices) {
  // Block gameplay and show modal
  if (pending.choices.subclass) {
    openSubclassModal();
  } else if (pending.choices.asi) {
    openASIModal();
  }
  // etc.
}
```

## Database Tracking (Future Enhancement)

To fully track pending choices, consider adding these fields to the `characters` table:

```sql
ALTER TABLE characters ADD COLUMN pending_asi_levels integer[];
ALTER TABLE characters ADD COLUMN pending_spell_choices jsonb;
ALTER TABLE characters ADD COLUMN pending_cantrip_choices jsonb;
```

This would allow the system to remember which levels require choices even after logout.

## Class-Specific Behaviors

### Full Casters (Wizard, Sorcerer, Bard, Cleric, Druid)
- Gain spell slots at every level
- Reach 9th level spells at level 17

### Half Casters (Paladin, Ranger)
- Start spellcasting at level 2
- Reach 5th level spells at level 17

### Warlock (Pact Magic)
- Uses Pact Magic instead of traditional spell slots
- Fewer slots, but they're all the same level
- Recharge on short rest

### Non-Casters (Barbarian, Fighter, Monk, Rogue)
- No spell progression
- May get ASI at different levels (Fighter at 6, 14; Rogue at 10)

## Error Handling

The system gracefully handles errors:

```typescript
const result = await checkAndProcessLevelUp(characterId);

if (!result.leveledUp) {
  // Either not ready to level up, or an error occurred
  // Check logs for details
}
```

## Testing

Run tests to verify all level-up features:

```bash
npm test -- levelingSystem.test.ts
```

## Future Enhancements

1. **ASI Application**: API endpoint to apply ASI/Feat choices
2. **Spell Selection**: API endpoint to select learned spells
3. **Feature Activation**: Track which features are active/inactive
4. **Multiclassing**: Support for multiclass level-up progression
5. **Custom Classes**: Plugin system for homebrew classes
