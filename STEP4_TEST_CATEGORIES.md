# Step 4 Loadout - Test Categories & Requirements

## Overview
22 comprehensive tests covering all Step 4 functionality in TDD RED phase.

---

## Test Category Breakdown

### 1. Equipment Preset Tests (5 tests)
**Purpose**: Test class-based equipment preset selection

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 1 | Renders 3-4 equipment presets based on character class | Preset count varies by class |
| 2 | Shows preset name, description, and icon | UI displays all preset metadata |
| 3 | Selects preset and shows selected state with gold highlight | Visual feedback for selection |
| 4 | Can change preset selection | Deselects previous, selects new |
| 5 | Displays selected equipment in preview | Context update with equipment array |

**Key Features**:
- Class-specific presets (Fighter ≠ Wizard)
- 3-4 options per class
- Gold highlight for selected state
- Preview updates on selection

---

### 2. Equipment Preview Tests (3 tests)
**Purpose**: Test visual display of selected equipment

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 6 | Shows visual representation of selected gear | Equipment items displayed |
| 7 | Updates preview when preset changes | Reactive UI updates |
| 8 | Shows equipment name and type | Categorization (Weapon/Armor/Shield) |

**Key Features**:
- Visual equipment display
- Real-time preview updates
- Equipment type labels

---

### 3. Appearance Input Tests (5 tests)
**Purpose**: Test physical description text input

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 9 | Renders text area with placeholder text | UI presence & guidance |
| 10 | Accepts max 150 characters | Character limit enforcement |
| 11 | Shows character counter (X/150) | Real-time feedback |
| 12 | Allows multiline input | Textarea functionality |
| 13 | Next button disabled if appearance < 5 chars | Validation requirement |

**Key Features**:
- 150 character max
- 5 character minimum
- Character counter display
- Multiline support

---

### 4. Portrait Generation Tests (6 tests)
**Purpose**: Test AI portrait generation integration

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 14 | Renders portrait canvas or image placeholder | UI container present |
| 15 | "Generate Portrait" button is visible | Action trigger available |
| 16 | Clicking "Generate Portrait" calls portraitService | Service integration |
| 17 | Shows loading spinner during generation | Async feedback |
| 18 | Displays generated portrait in preview | Success state handling |
| 19 | "Upload Custom" button allows existing portrait | Alternative input method |

**Key Features**:
- AI portrait generation via service
- Loading states (spinner)
- Success/error handling
- Custom upload option

---

### 5. Portrait Upload Tests (2 tests)
**Purpose**: Test custom portrait file upload

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 20 | Has file input for custom portrait upload | File input element present |
| 21 | Validates file is image (JPG/PNG) and loads | File type validation |

**Key Features**:
- File type validation (images only)
- Custom portrait loading
- Error handling for invalid files

---

### 6. Navigation Tests (1 test)
**Purpose**: Test wizard navigation controls

| Test # | Test Name | Validates |
|--------|-----------|-----------|
| 22 | Previous/Next buttons with proper enabled states | Navigation logic |

**Key Features**:
- Previous button always enabled
- Next enabled when: equipment selected + appearance valid
- Proper routing (Step 3 ← → Step 5)

---

## Validation Requirements (from validation.ts)

### Step 4 Validation Logic
```typescript
function validateStep4(draft: Partial<CharacterDraft>): boolean {
  const equipment = draft.equipment || draft.selectedEquipment || [];
  
  // Must have at least 1 equipment item
  if (equipment.length === 0) {
    return false;
  }
  
  // Must have appearance text (min 5 chars) - tested but not in validation yet
  if (!draft.appearance || draft.appearance.length < 5) {
    return false;
  }
  
  return true;
}
```

**Required Fields**:
- `selectedEquipment: string[]` - At least 1 item
- `appearance: string` - Min 5 characters, max 150

**Optional Fields**:
- `portraitUrl: string` - Generated or uploaded portrait URL

---

## Service Integration

### portraitService.ts
```typescript
interface PortraitGenerationOptions {
  character: Partial<Character>;
  customDescription?: string;
}

interface PortraitResult {
  imageUrl: string;
  prompt: string;
}

async function generatePortrait(options): Promise<PortraitResult>
```

**Integration Points**:
- Service location: `frontend/src/services/portraitService.ts`
- Mock available: `generatePortraitMock()`
- Backend endpoint: POST `/api/character-portrait/generate`
- Loading time: ~2-5 seconds (requires spinner)

---

## Data Structures

### Equipment Preset
```typescript
interface EquipmentPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: string[];
  class: CharacterClass;
}
```

### Equipment Item
```typescript
interface EquipmentItem {
  name: string;
  type: 'Weapon' | 'Armor' | 'Shield' | 'Tool' | 'Gear';
  description?: string;
  icon?: string;
}
```

---

## Test Utilities Used

### From testUtils.ts
- `generateValidCharacter()` - Creates mock draft
- `renderWithProviders()` - Renders with context

### From Testing Library
- `screen.getByTestId()` - Element queries
- `screen.getByRole()` - Semantic queries
- `fireEvent.click()` - User interactions
- `waitFor()` - Async assertions

### From Vitest
- `vi.fn()` - Mock functions
- `vi.spyOn()` - Service mocking
- `vi.mocked()` - Type-safe mocks

---

## Test Execution

### Run All Tests
```bash
npm test -- Step4Loadout.test.tsx --run
```

### Run Specific Category
```bash
# Equipment Presets only
npm test -- Step4Loadout.test.tsx -t "Equipment Preset"

# Portrait Generation only
npm test -- Step4Loadout.test.tsx -t "Portrait Generation"
```

### Watch Mode
```bash
npm test -- Step4Loadout.test.tsx
```

---

## Expected Output (RED Phase)

```
Test Files: 1 failed (1)
Tests: 22 failed (22)

Equipment Preset Tests (5 tests):
  × renders 3-4 equipment presets based on character class
  × shows preset name, description, and icon for each preset
  × selects preset and shows selected state with gold highlight
  × can change preset selection (deselects previous, selects new)
  × displays selected equipment in preview when preset is chosen

Equipment Preview Tests (3 tests):
  × shows visual representation of selected gear
  × updates preview when preset changes
  × shows equipment name and type (Weapon, Armor, Shield, etc.)

Appearance Input Tests (5 tests):
  × renders text area with placeholder text
  × accepts max 150 characters and rejects longer input
  × shows character counter (X/150)
  × allows multiline input
  × next button disabled if appearance is less than 5 characters

Portrait Generation Tests (6 tests):
  × renders portrait canvas or image placeholder
  × "Generate Portrait" button is visible
  × clicking "Generate Portrait" calls portraitService
  × shows loading spinner during portrait generation
  × displays generated portrait in preview after generation
  × "Upload Custom" button allows using existing portrait

Portrait Upload Tests (2 tests):
  × has file input for custom portrait upload
  × validates file is an image (JPG/PNG) and loads custom portrait

Navigation Tests (1 test):
  × "Previous" button goes back to Step 3, "Next" enabled when valid
```

All failures are EXPECTED and CORRECT for TDD RED phase. ✅

---

## Implementation Checklist

### Component Structure
- [ ] `Step4Loadout.tsx` - Main step component
- [ ] `components/EquipmentPresets.tsx` - Preset selector
- [ ] `components/EquipmentPreview.tsx` - Equipment display
- [ ] `components/AppearanceInput.tsx` - Text input
- [ ] `components/PortraitGenerator.tsx` - AI generation + upload

### Data Files
- [ ] `data/equipmentPresets.ts` - Class-based presets
- [ ] `data/equipmentItems.ts` - Individual items

### Validation
- [ ] Update `validation.ts` to check appearance field
- [ ] Add equipment validation logic

### Styling
- [ ] Use design system tokens (gold highlights, etc.)
- [ ] Responsive layout for mobile
- [ ] Loading spinners and transitions

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Status**: Tests written, implementation pending
