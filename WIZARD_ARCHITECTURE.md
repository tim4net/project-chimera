# Character Creation Wizard - Architecture Diagram

## Component Hierarchy

```
CharacterDraftProvider (Context)
  └── CharacterCreationWizard (Orchestrator)
      ├── Header
      │   ├── Title: "Create Your Hero"
      │   ├── Step Indicator: "Step X of 3"
      │   └── PageIndicator (3 dots)
      │       ├── Dot 1 (Identity & Core Attributes)
      │       ├── Dot 2 (Abilities & Skills)
      │       └── Dot 3 (Equipment & Appearance)
      │
      ├── Main Content Area
      │   └── Current Page Component
      │       ├── Page 1: CharacterFoundation
      │       │   ├── Identity section
      │       │   ├── CoreAttributes section
      │       │   └── AlignmentGrid section
      │       │
      │       ├── Page 2: AbilitiesAndSkills
      │       │   ├── AbilityScorePanel section
      │       │   └── SkillsPanel section
      │       │
      │       └── Page 3: EquipmentAndAppearance
      │           ├── EquipmentSelector component
      │           └── AppearancePanel component
      │
      └── WizardFooter
          ├── Back Button (disabled on page 1)
          ├── Save Draft Button
          └── Next/Create Button
              ├── "Next" on pages 1-2
              └── "Create Character" on page 3
```

## Data Flow

```
User Input
    ↓
Page Component (receives PageComponentProps)
    ↓
updateDraft(changes)
    ↓
CharacterCreationWizard
    ↓
useCharacterDraft hook
    ↓
CharacterDraftContext (reducer)
    ↓
localStorage (auto-persist)
```

## State Management

```typescript
CharacterDraftContext {
  draft: Partial<CharacterDraft>,
  currentPage: 1 | 2 | 3,
  isModified: boolean,
  lastSaved: string | null,
  
  // Actions
  updateStep(stepName, data),
  goToPage(pageNumber),
  nextPage(),
  prevPage(),
  saveDraft(),
  resetDraft(),
  
  // Validation
  isPageValid(): boolean,
  getValidationErrors(): Record<string, string>
}
```

## Navigation Flow

```
Page 1 (Foundation)
  ├── Validates: name, race, class, background, alignment
  ├── On Valid: Enable "Next" button
  └── Next → Page 2

Page 2 (Abilities & Skills)
  ├── Validates: abilityScores, proficientSkills
  ├── On Valid: Enable "Next" button
  └── Next → Page 3

Page 3 (Equipment & Appearance)
  ├── Validates: equipment array not empty
  ├── On Valid: Enable "Create Character" button
  └── Create → onComplete(draft)
```

## Key Interfaces

```typescript
interface PageComponentProps {
  draft: Partial<CharacterDraft>;
  updateDraft: (updates: Partial<CharacterDraft>) => void;
  errors: string[];
  onNext: () => void;
  onBack: () => void;
}

interface WizardState {
  currentPage: 1 | 2 | 3;
  draft: Partial<CharacterDraft>;
  validationErrors: Record<PageNumber, string[]>;
  isSubmitting: boolean;
  isSavingDraft: boolean;
}
```

## Accessibility Features

- **ARIA Labels**: All buttons have descriptive `aria-label` attributes
- **ARIA Current**: Page indicator shows `aria-current="step"` for active page
- **ARIA Disabled**: Disabled states properly communicated
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Status updates announced via `role="status"` and `aria-live="polite"`

## Integration Example

```tsx
import { CharacterDraftProvider } from './context/CharacterDraftContext';
import { CharacterCreationWizard } from './components/character-creation';
import { 
  CharacterFoundation,
  AbilitiesAndSkills,
  EquipmentAndAppearance 
} from './components/character-creation/pages';

function App() {
  const handleComplete = (character: CharacterDraft) => {
    // Submit to backend
    console.log('Character created:', character);
  };

  const handleCancel = () => {
    // Navigate away or show confirmation
    console.log('Creation cancelled');
  };

  return (
    <CharacterDraftProvider>
      <CharacterCreationWizard
        pages={[
          CharacterFoundation,
          AbilitiesAndSkills,
          EquipmentAndAppearance
        ]}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </CharacterDraftProvider>
  );
}
```

## Testing Strategy

1. **Unit Tests**: Each component tested in isolation
2. **Integration Tests**: Full wizard flow tested end-to-end
3. **Navigation Tests**: All page transitions validated
4. **Validation Tests**: Page validation rules enforced
5. **State Tests**: Draft persistence verified
6. **Accessibility Tests**: ARIA attributes validated

## File Sizes

| Component | Lines | Purpose |
|-----------|-------|---------|
| types.tsx | 71 | Type definitions |
| PageIndicator.tsx | 128 | Progress dots UI |
| WizardFooter.tsx | 289 | Navigation buttons |
| CharacterCreationWizard.tsx | 287 | Main orchestrator |
| CharacterCreationWizard.test.tsx | 527 | Test suite (30+ tests) |
| **Total** | **1,302** | Complete wizard system |

All components stay under the 300-line guideline.
