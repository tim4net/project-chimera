# Level-Up Orchestrator Integration Guide

## Quick Start

The Level-Up Orchestrator is a complete, drop-in solution for managing character level-ups. It handles all the modals, choices, and progression steps automatically.

## Basic Usage

### 1. Import the Orchestrator

```typescript
import LevelUpOrchestrator from '@/components/level-up/LevelUpOrchestrator';
```

### 2. Add State Variables

```typescript
const [showLevelUp, setShowLevelUp] = useState(false);
const [levelUpData, setLevelUpData] = useState<any>(null);
```

### 3. Detect Level-Up

When your character gains XP, check for level-up:

```typescript
// After granting XP
const checkLevelUp = async (characterId: string) => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    const response = await fetch(`/api/characters/${characterId}/level-up`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.leveledUp) {
      setLevelUpData(result);
      setShowLevelUp(true);
    }
  } catch (error) {
    console.error('Level-up check failed:', error);
  }
};
```

### 4. Render the Orchestrator

```tsx
<LevelUpOrchestrator
  show={showLevelUp}
  characterId={character.id}
  character={character}
  newLevel={levelUpData?.newLevel || character.level}
  levelUpData={levelUpData}
  onComplete={() => {
    setShowLevelUp(false);
    setLevelUpData(null);
    // Refresh character data
    refetchCharacter();
  }}
/>
```

## Complete Example

```tsx
import { useState, useEffect } from 'react';
import LevelUpOrchestrator from '@/components/level-up/LevelUpOrchestrator';

const DashboardPage = () => {
  const [character, setCharacter] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);

  // Check for level-up after XP gain
  const handleQuestComplete = async (xpGained: number) => {
    // Award XP
    await awardXP(character.id, xpGained);

    // Check for level-up
    const levelUpResult = await checkForLevelUp(character.id);

    if (levelUpResult.leveledUp) {
      setLevelUpData(levelUpResult);
      setShowLevelUp(true);
    }
  };

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    setLevelUpData(null);
    // Refresh character data from backend
    fetchCharacter(character.id).then(setCharacter);
  };

  return (
    <div>
      {/* Your dashboard UI */}
      <CharacterSheet character={character} />
      <QuestLog onQuestComplete={handleQuestComplete} />

      {/* Level-Up Orchestrator */}
      <LevelUpOrchestrator
        show={showLevelUp}
        characterId={character.id}
        character={character}
        newLevel={levelUpData?.newLevel || character.level}
        levelUpData={levelUpData}
        onComplete={handleLevelUpComplete}
      />
    </div>
  );
};
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `show` | `boolean` | Controls visibility of the orchestrator |
| `characterId` | `string` | ID of the character leveling up |
| `character` | `any` | Full character record with all properties |
| `newLevel` | `number` | The new level reached |
| `levelUpData` | `any` | Result from backend's `checkAndProcessLevelUp()` |
| `onComplete` | `() => void` | Callback when all level-up steps are complete |

### Character Object Structure

The `character` prop should include:

```typescript
{
  id: string;
  level: number;
  class_name: string;
  subclass_name?: string;
  current_hp: number;
  max_hp: number;
  proficiency_bonus: number;
  ability_scores: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  known_spells?: Array<{
    name: string;
    level: number;
  }>;
  // ... other character properties
}
```

### LevelUpData Structure

The `levelUpData` prop should match the backend's `LevelUpResult`:

```typescript
{
  leveledUp: boolean;
  newLevel: number;
  hpGained: number;
  proficiencyIncreased?: boolean;
  newProficiencyBonus?: number;

  // Spell progression
  newSpellSlots?: {
    [level: number]: number;
  };
  learnNewSpells?: number;  // How many spells to learn
  learnNewCantrips?: number;  // How many cantrips to learn
  cantripsDamageIncrease?: boolean;

  // Choices required
  requiresASI?: boolean;  // Ability Score Improvement
  requiresSubclass?: boolean;
  availableSubclasses?: Array<{
    name: string;
    description: string;
    features: Array<{
      level: number;
      name: string;
      description: string;
    }>;
  }>;

  // Features granted
  newClassFeatures?: Array<{
    name: string;
    description: string;
  }>;
  newSubclassFeatures?: Array<{
    level: number;
    name: string;
    description: string;
  }>;
}
```

## Backend Integration

### Required Endpoints

Your backend must provide these endpoints:

#### 1. Level-Up Check
```
POST /api/characters/{characterId}/level-up
Response: LevelUpResult (see above)
```

#### 2. ASI Application
```
POST /api/characters/{characterId}/asi
Body: {
  abilityIncreases: {
    STR?: number,
    DEX?: number,
    // ... other abilities
  }
}
```

#### 3. Spell Learning
```
GET /api/spells/available?class={className}&level={level}&cantripsOnly={boolean}
Response: {
  spells: Array<{
    name: string,
    level: number,
    school: string,
    castingTime: string,
    range: string,
    components: string,
    duration: string,
    description: string
  }>
}

POST /api/characters/{characterId}/spells
Body: {
  spells: string[]  // Array of spell names
}
```

#### 4. Subclass Selection
```
POST /api/subclass/{characterId}/subclass
Body: {
  subclassName: string
}
```

## Workflow Steps

The orchestrator automatically determines which steps to show based on `levelUpData`:

1. **Celebration** (always shown)
   - Shows level number, HP gained, proficiency bonus
   - Auto-advances after 3-5 seconds or manual click

2. **ASI Selection** (shown if `requiresASI === true`)
   - Levels 4, 8, 12, 16, 19 (and Fighter 6, 14)
   - Player allocates 2 improvement points
   - Enforces 20 maximum per ability

3. **Subclass Selection** (shown if `requiresSubclass === true`)
   - Varies by class (usually level 3)
   - Shows available subclasses with features
   - Permanent choice

4. **Spell Learning** (shown if `learnNewSpells > 0`)
   - Spellcasters only
   - Choose X spells from class list
   - Can't select duplicates

5. **Cantrip Learning** (shown if `learnNewCantrips > 0`)
   - Spellcasters only
   - Choose X cantrips (level 0 spells)
   - Separate from regular spell learning

6. **Features Summary** (always shown)
   - Displays all class features gained
   - Shows subclass features
   - Shows spell slot progression
   - Final confirmation button

## Customization

### Styling

All modals use the project's color scheme:
- `nuaibria-gold`: Primary accents
- `nuaibria-arcane`: Spell-related elements
- `nuaibria-ember`: Warnings/important info

To customize, edit the individual modal components in `/components/level-up/`.

### Step Order

To change the order of steps, edit `LevelUpOrchestrator.tsx`:

```typescript
// Current order
requiredSteps.push('celebration');
if (levelUpData.requiresASI) requiredSteps.push('asi');
if (levelUpData.requiresSubclass) requiredSteps.push('subclass');
if (levelUpData.learnNewSpells > 0) requiredSteps.push('spells');
if (levelUpData.learnNewCantrips > 0) requiredSteps.push('cantrips');
requiredSteps.push('features');
```

### Adding New Steps

1. Add step type to `Step` union:
```typescript
type Step = 'celebration' | 'asi' | 'subclass' | 'spells' | 'cantrips' | 'features' | 'yourNewStep';
```

2. Add condition to step builder:
```typescript
if (levelUpData.requiresYourNewThing) {
  requiredSteps.push('yourNewStep');
}
```

3. Add case to `renderCurrentStep()`:
```typescript
case 'yourNewStep':
  return (
    <>
      <ProgressIndicator />
      <YourNewModal
        show={true}
        onComplete={() => handleStepComplete()}
        // ... other props
      />
    </>
  );
```

## Troubleshooting

### Issue: Orchestrator doesn't show
**Check:**
- Is `show` prop set to `true`?
- Is `levelUpData` not null?
- Does `levelUpData.leveledUp === true`?

### Issue: Steps are skipped
**Check:**
- Verify `levelUpData` has correct boolean flags
- Check console logs for step array construction

### Issue: Modal doesn't advance
**Check:**
- Is `onComplete` being called in the modal?
- Check for errors in browser console
- Verify API calls are succeeding

### Issue: Character data not updating
**Check:**
- Is `onComplete` callback refreshing character data?
- Are backend endpoints returning updated character?
- Check network tab for API responses

## Performance Considerations

- Orchestrator only renders one modal at a time
- Progress state prevents re-renders of completed steps
- API calls are made sequentially (not all at once)
- Character data is refreshed only after all steps complete

## Accessibility

- All modals have proper ARIA labels
- Keyboard navigation supported
- Screen reader friendly
- Focus management between steps

## Testing

```typescript
// Example test setup
describe('LevelUpOrchestrator', () => {
  it('shows celebration for basic level-up', () => {
    const levelUpData = {
      leveledUp: true,
      newLevel: 2,
      hpGained: 8,
      newProficiencyBonus: 2,
    };

    render(
      <LevelUpOrchestrator
        show={true}
        characterId="test-id"
        character={mockCharacter}
        newLevel={2}
        levelUpData={levelUpData}
        onComplete={jest.fn()}
      />
    );

    expect(screen.getByText('LEVEL UP!')).toBeInTheDocument();
  });

  it('includes ASI step at level 4', () => {
    const levelUpData = {
      leveledUp: true,
      newLevel: 4,
      hpGained: 8,
      requiresASI: true,
    };

    // Test that ASI modal appears
  });
});
```

## Additional Resources

- [Full Implementation Summary](/LEVEL_UP_ORCHESTRATOR_SUMMARY.md)
- [Workflow Diagram](/LEVEL_UP_FLOW_DIAGRAM.md)
- [ASI Modal Usage Guide](./ASI_USAGE_GUIDE.md)
- [Backend Leveling System](/backend/src/services/levelingSystem.ts)
