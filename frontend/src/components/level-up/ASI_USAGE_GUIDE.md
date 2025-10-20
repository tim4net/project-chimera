# ASI Selection Modal - Usage Guide

## Quick Start

```typescript
import { ASISelectionModal } from './components/level-up';

// Basic usage
<ASISelectionModal
  show={showModal}
  characterId="character-uuid"
  level={4}
  currentAbilityScores={{
    STR: 14, DEX: 16, CON: 13,
    INT: 10, WIS: 12, CHA: 8
  }}
  onComplete={() => {
    // Refresh character data
    // Close modal
  }}
  onClose={() => setShowModal(false)}
/>
```

## When to Show This Modal

The modal should appear when a character levels up and reaches an ASI level:

### Standard Classes
- Levels: **4, 8, 12, 16, 19**

### Fighter
- Levels: **4, 6, 8, 12, 14, 16, 19**

### Rogue
- Levels: **4, 8, 10, 12, 16, 19**

## Implementation Example

### With LevelUpOrchestrator (Recommended)

The `LevelUpOrchestrator` already handles ASI integration:

```typescript
import LevelUpOrchestrator from './components/level-up/LevelUpOrchestrator';

function GameScreen() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const handleLevelUp = async (characterId: string) => {
    // Call backend to process level up
    const response = await fetch(`/api/characters/${characterId}/level-up`, {
      method: 'POST'
    });

    const data = await response.json();
    setLevelUpData(data);
    setShowLevelUp(true);
  };

  return (
    <>
      {/* Your game UI */}

      <LevelUpOrchestrator
        show={showLevelUp}
        characterId={character.id}
        character={character}
        newLevel={character.level}
        levelUpData={levelUpData}
        onComplete={() => {
          setShowLevelUp(false);
          refreshCharacter();
        }}
      />
    </>
  );
}
```

### Standalone Usage

If you need to show ASI selection independently:

```typescript
function CharacterSheet() {
  const [showASI, setShowASI] = useState(false);

  const handleASIComplete = async () => {
    // Reload character from backend
    const updated = await fetchCharacter(characterId);
    setCharacter(updated);
    setShowASI(false);
  };

  return (
    <>
      <button onClick={() => setShowASI(true)}>
        Improve Ability Scores
      </button>

      <ASISelectionModal
        show={showASI}
        characterId={character.id}
        level={character.level}
        currentAbilityScores={character.ability_scores}
        onComplete={handleASIComplete}
        onClose={() => setShowASI(false)}
      />
    </>
  );
}
```

## Backend API Requirement

The component POSTs to `/api/characters/:characterId/asi` with this payload:

```typescript
{
  selectionType: 'plus-two' | 'plus-one-one' | 'feat',
  ability1: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
  ability2: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' | null,
  level: number
}
```

Expected response:

```typescript
// Success (200)
{
  success: true,
  updatedAbilityScores: {
    STR: 14, DEX: 17, CON: 13,
    INT: 10, WIS: 12, CHA: 8
  }
}

// Error (400/500)
{
  error: "Error message"
}
```

## User Flow

1. **Modal Opens** - Player sees three options:
   - +2 to one ability
   - +1 to two abilities
   - Choose feat (coming soon)

2. **Selection** - Player chooses option and picks ability/abilities from dropdown(s)

3. **Preview** - Live preview shows:
   - Current scores
   - New scores after change
   - Modifiers before/after
   - Helpful descriptions

4. **Validation** - Component ensures:
   - No score exceeds 20
   - No duplicate selections (for +1/+1)
   - Valid ability is selected

5. **Confirmation** - Player clicks "Confirm Selection"
   - Modal sends request to backend
   - Shows loading state
   - On success: triggers `onComplete()`
   - On error: displays error message

## Customization

### Styling

The component uses Tailwind with Nuaibria theme colors. To customize:

```typescript
// In your tailwind.config.js
theme: {
  extend: {
    colors: {
      nuaibria: {
        gold: '#d4af37',    // Primary accent
        ember: '#ff6b35',   // Secondary accent
        arcane: '#8b5cf6',  // Preview highlight
        // ... other colors
      }
    }
  }
}
```

### Validation Rules

To modify validation (e.g., allow scores above 20):

```typescript
// In ASISelectionModal.tsx
const newAbilityScores = useMemo((): AbilityScores => {
  const preview = { ...currentAbilityScores };

  if (selectionType === 'plus-two' && selectedAbility1) {
    // Change this line:
    preview[selectedAbility1] = Math.min(20, preview[selectedAbility1] + 2);
    // To allow higher:
    preview[selectedAbility1] = preview[selectedAbility1] + 2;
  }
  // ...
}, [/* deps */]);
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `show` | `boolean` | ✅ | Controls modal visibility |
| `characterId` | `string` | ✅ | UUID of character |
| `level` | `number` | ✅ | Character's new level |
| `currentAbilityScores` | `AbilityScores` | ✅ | Current ability scores object |
| `onComplete` | `() => void` | ✅ | Called after successful ASI |
| `onClose` | `() => void` | ✅ | Called when modal closes |

## Troubleshooting

### Modal doesn't appear
- Check `show` prop is `true`
- Verify z-index isn't being overridden (modal uses `z-50`)

### Backend returns 404
- Ensure `/api/characters/:characterId/asi` endpoint exists
- Check characterId is valid UUID

### Selection not saving
- Check backend is updating database correctly
- Verify `onComplete` callback refreshes character data

### Abilities at 20 not selectable
- This is correct behavior (20 is max in standard D&D 5e)
- To allow higher, see Customization section above

## Testing Checklist

- [ ] Modal renders when `show={true}`
- [ ] All three radio options are visible
- [ ] Dropdowns populate with current abilities
- [ ] Preview updates when selections change
- [ ] Cannot select ability already at 20
- [ ] Cannot select same ability twice in +1/+1 mode
- [ ] Confirm button disabled until valid selection
- [ ] Loading state shows during submission
- [ ] Success triggers `onComplete()`
- [ ] Error displays in modal
- [ ] Cancel button closes modal

## Screenshots

```
┌─────────────────────────────────────────────────┐
│                      ✨                         │
│        Ability Score Improvement                │
│           Level 4 - Choose how to improve       │
│                                                 │
│  ○ +2 to One Ability                           │
│    [Select an ability...]                      │
│                                                 │
│  ● +1 to Two Abilities                         │
│    [Dexterity (Current: 14)]                   │
│    [Constitution (Current: 12)]                │
│                                                 │
│  ○ Choose a Feat (Coming Soon)                 │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │         Preview Changes                  │  │
│  │                                          │  │
│  │  STR: 16 (+3)    DEX: 15 (+2) ✨       │  │
│  │  CON: 13 (+1) ✨ INT: 10 (+0)          │  │
│  │  WIS: 12 (+1)    CHA: 8  (-1)           │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [  Cancel  ] [  Confirm Selection  ]          │
│                                                 │
│  Ability scores cannot exceed 20.              │
│  This choice is permanent.                     │
└─────────────────────────────────────────────────┘
```

## Related Components

- `LevelUpModal` - Initial celebration modal
- `SubclassSelectionModal` - Subclass selection
- `LevelUpOrchestrator` - Coordinates all level-up modals
- `SpellLearningModal` - Spell selection for casters

## Future Features

- **Feat Selection** - Full feat library with descriptions and prerequisites
- **Racial Caps** - Support for different ability score maximums
- **Homebrew Rules** - Configurable ASI rules
- **Undo Window** - Allow changing selection within X minutes
- **Advanced Preview** - Show impact on attack rolls, AC, spell DCs, etc.

---

**Need Help?** See `/srv/project-chimera/frontend/src/components/level-up/README.md` for more details.
