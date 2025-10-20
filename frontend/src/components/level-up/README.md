# Level-Up Components

This directory contains components related to character level-up mechanics in Project Chimera.

## ASISelectionModal

The ASI (Ability Score Improvement) Selection Modal appears when a character reaches specific levels and needs to improve their ability scores.

### When It Appears

- **Standard Classes**: Levels 4, 8, 12, 16, 19
- **Fighter**: Also at levels 6, 14
- **Rogue**: Also at level 10

### Usage Example

```tsx
import { ASISelectionModal } from './components/level-up';

function YourComponent() {
  const [showASI, setShowASI] = useState(false);
  const character = {
    id: 'character-id',
    level: 4,
    ability_scores: {
      STR: 14,
      DEX: 16,
      CON: 13,
      INT: 10,
      WIS: 12,
      CHA: 8,
    }
  };

  return (
    <>
      <button onClick={() => setShowASI(true)}>Level Up!</button>

      <ASISelectionModal
        show={showASI}
        characterId={character.id}
        level={character.level}
        currentAbilityScores={character.ability_scores}
        onComplete={() => {
          console.log('ASI applied successfully');
          setShowASI(false);
          // Refresh character data
        }}
        onClose={() => setShowASI(false)}
      />
    </>
  );
}
```

### Features

1. **Three Selection Options**:
   - +2 to ONE ability score
   - +1 to TWO different ability scores
   - Choose a Feat (coming soon)

2. **Live Preview**: Shows current scores, new scores, and modifier changes

3. **Validation**:
   - Prevents exceeding ability score maximum (20)
   - Prevents selecting the same ability twice for +1/+1
   - Requires a valid selection before confirmation

4. **Backend Integration**:
   - POSTs to `/api/characters/:characterId/asi`
   - Updates character ability scores in database
   - Handles errors gracefully

### Backend API Endpoint

The component expects a backend endpoint:

```typescript
POST /api/characters/:characterId/asi

Body:
{
  selectionType: 'plus-two' | 'plus-one-one' | 'feat',
  ability1: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
  ability2: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' | null,
  level: number
}

Response: 200 OK
{
  success: true,
  updatedAbilityScores: AbilityScores
}

Error: 400/500
{
  error: string
}
```

### Styling

The modal uses Nuaibria theme colors:
- `nuaibria-gold`: Primary accent
- `nuaibria-ember`: Secondary accent
- `nuaibria-arcane`: Preview highlight
- `nuaibria-surface`: Background elements
- Gradient borders and shadow-glow effects

### Integration with LevelUpModal

This component is designed to be triggered after the main `LevelUpModal` displays level-up celebration, similar to how `SubclassSelectionModal` works.

Example integration:

```tsx
// In your level-up logic
const handleLevelUp = async () => {
  // 1. Show LevelUpModal
  setShowLevelUp(true);

  // 2. Check if ASI is needed
  const needsASI = [4, 8, 12, 16, 19].includes(newLevel) ||
    (className === 'Fighter' && [6, 14].includes(newLevel)) ||
    (className === 'Rogue' && newLevel === 10);

  if (needsASI) {
    // Show ASI modal after level-up celebration
    setTimeout(() => {
      setShowASI(true);
    }, 3000);
  }
};
```

### Future Enhancements

- **Feat Selection**: Currently disabled, will be implemented in a future update
- **Class-specific ASI rules**: Some homebrew classes may have different ASI levels
- **Racial bonuses**: Some races may have ability score caps different from 20
