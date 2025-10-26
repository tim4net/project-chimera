# Test Files Reference - Character Creation Wizard V2

## Directory Structure
```
frontend/src/components/character-creation-v2/
├── CharacterCreationWizardV2.test.tsx (15 tests) ✅
├── CharacterCreationWizardV2.tsx (TO BE IMPLEMENTED)
│
└── steps/
    ├── Step1HeroConcept/
    │   ├── Step1HeroConcept.test.tsx (exists)
    │   └── Step1HeroConcept.tsx (exists)
    │
    ├── Step3AbilitiesSkills/
    │   ├── Step3AbilitiesSkills.test.tsx (exists)
    │   └── Step3AbilitiesSkills.tsx (exists)
    │
    └── Step5Review/
        ├── Step5Review.test.tsx (18 tests) ✅
        ├── Step5Review.tsx (TO BE IMPLEMENTED)
        └── components/
            ├── CharacterCard.tsx (TO BE IMPLEMENTED)
            └── EditableSection.tsx (TO BE IMPLEMENTED)
```

## Test Commands

### Run All Tests
```bash
cd /srv/project-chimera/frontend
npm test
```

### Run Specific Test Files
```bash
# Step 5 Review tests only
npm test Step5Review.test.tsx

# Wizard Orchestrator tests only
npm test CharacterCreationWizardV2.test.tsx

# Context tests
npm test CharacterDraftContextV2.test.tsx
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## Test File Sizes
- `Step5Review.test.tsx`: ~19 KB (18 tests)
- `CharacterCreationWizardV2.test.tsx`: ~19 KB (15 tests)

## Implementation Checklist

### Step 5 Review Component
- [ ] Create `Step5Review.tsx` main component
- [ ] Create `CharacterCard.tsx` sub-component
- [ ] Create `EditableSection.tsx` sub-component
- [ ] Implement character display logic
- [ ] Implement edit section expansion
- [ ] Implement field modification handlers
- [ ] Implement API submission with loading states
- [ ] Implement error handling and retry logic
- [ ] Make all 18 tests pass

### Wizard Orchestrator Component
- [ ] Create `CharacterCreationWizardV2.tsx` main component
- [ ] Implement step routing (1-5)
- [ ] Implement progress indicator UI
- [ ] Implement Next/Previous navigation
- [ ] Implement validation gates
- [ ] Implement localStorage persistence
- [ ] Add page title updates
- [ ] Add progress bar visualization
- [ ] Make all 15 tests pass

## Expected Test Results (RED Phase)

Current status: **All tests should FAIL** (this is correct!)

Example output:
```
FAIL  Step5Review/Step5Review.test.tsx
  ● Step5Review - Character Card Display › should display hero info
    
    Error: Unable to find an element with the text: Thorin Oakenshield
    
FAIL  CharacterCreationWizardV2.test.tsx
  ● CharacterCreationWizardV2 - Initial Render › should render Step 1
    
    Error: Unable to find an element with the role "heading"
```

This is expected! Tests are written FIRST, implementation comes NEXT (TDD RED-GREEN-REFACTOR cycle).

## When Tests Pass (GREEN Phase)

After implementation, you should see:
```
PASS  Step5Review/Step5Review.test.tsx (18 tests)
PASS  CharacterCreationWizardV2.test.tsx (15 tests)

Test Suites: 2 passed, 2 total
Tests:       33 passed, 33 total
```
