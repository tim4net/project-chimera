# Character Creation Redesign - Task Assignments

## FULL-STACK DEVELOPER - PHASE 1: TEST INFRASTRUCTURE

**Blocker for all other work.** Start immediately. This is the foundation.

### Task 1.1: Test Utilities & Mock Setup (1 day)

**File**: `frontend/src/test/testUtils.ts` (~150 lines)

**Deliverables**:
- [ ] Character data generator (creates valid test characters)
- [ ] Mock Supabase client
- [ ] Mock portrait service
- [ ] Test wrapper components with providers
- [ ] Helper functions for common test patterns

**Acceptance Criteria**:
```typescript
// Should export:
export function generateCharacter(overrides?: Partial<CharacterDraft>): CharacterDraft
export function generateValidCharacter(): CharacterDraft
export function generateInvalidCharacter(invalidField: string): CharacterDraft
export function renderWithProviders(component: React.ReactElement): RenderResult
export const mockSupabase: MockSupabaseClient
export const mockPortraitService: MockPortraitService
```

**Tests**: 20 tests verifying:
- Data generator creates valid characters
- Generator properly applies overrides
- Mock clients behave correctly
- Providers wrap components properly

**PR Template**: `feature/test-infrastructure-1-utils`

---

### Task 1.2: State Management Tests (1.5 days)

**File**: `frontend/src/__tests__/context/CharacterDraftContextV2.test.tsx` (~400 lines)

**Deliverables**:
- [ ] 30+ tests for 5-step CharacterDraftContext v2
- [ ] Tests for each step's validation
- [ ] Navigation constraint tests
- [ ] localStorage persistence tests
- [ ] Data transformation tests (frontend -> backend)

**Acceptance Criteria**:
```typescript
describe('CharacterDraftContext - 5 Steps', () => {
  // Step 1 Tests (4 tests)
  it('validates step 1: name, race, class, background required')
  it('rejects invalid names')
  it('allows progression to step 2 when valid')
  it('persists step 1 data to localStorage')

  // Step 2 Tests (4 tests)
  it('validates step 2: alignment required, backstory optional')
  it('prevents backward navigation without validation')
  it('preserves step 1 data when moving to step 2')
  it('persists step 2 data to localStorage')

  // Step 3 Tests (5 tests)
  it('validates ability scores: 27 points total, 8-15 range')
  it('calculates racial bonuses correctly')
  it('applies proficiency bonus based on level')
  it('validates skill selection constraints by class')
  it('persists step 3 data')

  // Step 4 Tests (4 tests)
  it('validates equipment selection')
  it('calculates starting gold correctly')
  it('handles portrait URL')
  it('persists step 4 data')

  // Step 5 Tests (3 tests)
  it('validates all required fields present')
  it('transforms data to backend format')
  it('allows step navigation from review')

  // Navigation Tests (4 tests)
  it('prevents forward navigation when current step invalid')
  it('allows backward navigation always')
  it('allows direct navigation to reviewed steps')
  it('resets on complete()')

  // localStorage Tests (2 tests)
  it('persists draft to localStorage on each update')
  it('restores draft from localStorage on mount')
})
```

**Tests**: 30+ passing tests

**PR Template**: `feature/test-infrastructure-2-state`

---

### Task 1.3: API Integration Tests (1 day)

**File**: `backend/src/__tests__/routes/characters.integration.test.ts` (~350 lines)

**Deliverables**:
- [ ] POST /api/characters endpoint tests
- [ ] Request/response format validation
- [ ] Error handling tests
- [ ] Database interaction tests
- [ ] Welcome message generation tests

**Acceptance Criteria**:
```typescript
describe('POST /api/characters - Integration Tests', () => {
  // Happy Path (3 tests)
  it('creates character with all required fields')
  it('applies racial bonuses correctly')
  it('generates welcome message')

  // Validation (5 tests)
  it('rejects missing required fields')
  it('rejects invalid ability scores')
  it('rejects invalid race/class/background')
  it('validates point-buy constraint (27 points)')
  it('validates skill selection constraints')

  // Database (3 tests)
  it('inserts character into database')
  it('returns created character with ID')
  it('sets correct starting position')

  // Portrait Generation (2 tests)
  it('generates portrait when AUTO_GENERATE_PORTRAITS=true')
  it('skips portrait when already provided')

  // Error Handling (3 tests)
  it('returns 400 on validation error')
  it('returns 401 if not authenticated')
  it('returns 500 on database error with context')
})
```

**Tests**: 16 integration tests + mocks

**PR Template**: `feature/test-infrastructure-3-api`

---

### Task 1.4: E2E Test Scenarios (1 day)

**File**: `e2e/character-creation-v2.spec.ts` (~300 lines)

**Deliverables**:
- [ ] 15+ Playwright E2E tests
- [ ] Happy path scenarios
- [ ] Error/edge case scenarios
- [ ] Draft persistence tests
- [ ] Complete user flows

**Acceptance Criteria**:
```typescript
test.describe('Character Creation E2E - Full Flows', () => {
  // Happy Path (3 tests)
  test('complete character creation: all steps')
  test('create character with optional fields skipped')
  test('character displays in dashboard after creation')

  // Navigation (4 tests)
  test('can navigate forward through all steps')
  test('can navigate backward and edit')
  test('cannot skip steps')
  test('page indicator shows correct progress')

  // Validation (3 tests)
  test('shows error when trying to proceed without filling required fields')
  test('prevents submission if data invalid')
  test('shows specific error messages for each field')

  // Draft Persistence (2 tests)
  test('draft persists after page reload')
  test('draft persists when navigating between steps')

  // Portrait Generation (2 tests)
  test('can generate portrait in step 2')
  test('portrait displays in review step')

  // Error Handling (1 test)
  test('shows error if character submission fails')
})
```

**Tests**: 15 passing E2E tests

**PR Template**: `feature/test-infrastructure-4-e2e`

---

## FRONTEND DEVELOPER 1 - STEPS 1 & 2

**Dependency**: Wait for Phase 1 complete (test infrastructure ready)

### Task 2.1: Step 1 - Hero Concept (2 days)

**Directory**: `frontend/src/components/character-creation-v2/steps/Step1HeroConcept/`

**Step 2.1a: Write All Tests First (1 day)**

**File**: `Step1HeroConcept.test.tsx` (~250 lines)

**Tests to Write** (TDD - BEFORE coding):
```typescript
describe('Step 1: Hero Concept', () => {
  // Name Input Tests (5)
  it('renders name input field')
  it('validates name 2-50 chars')
  it('rejects special characters')
  it('shows error for invalid names')
  it('calls onNameChange on input')

  // AI Name Generator (3)
  it('renders generate button')
  it('disables button until race/class/background selected')
  it('generates and inserts name on click')

  // Race Selector (4)
  it('renders 10 race cards')
  it('highlights selected race')
  it('updates hero preview on selection')
  it('calls onRaceChange')

  // Class Selector (4)
  it('renders 12 class cards')
  it('highlights selected class')
  it('updates hero preview on selection')
  it('calls onClassChange')

  // Background Selector (3)
  it('renders 6 background cards')
  it('highlights selected background')
  it('calls onBackgroundChange')

  // Hero Preview (3)
  it('displays hero silhouette')
  it('updates race/class visually')
  it('shows "Choose a hero concept" when empty')

  // Navigation (2)
  it('disables Next button until all fields filled')
  it('enables Next button when valid')

  // Form Integration (1)
  it('all data saves to draft context')
})
```

**File**: `components/RaceCard.test.tsx` (~80 lines)
- Test card selection, display, hover states

**File**: `components/ClassCard.test.tsx` (~80 lines)
- Test card selection, display, hover states

**File**: `components/BackgroundCard.test.tsx` (~80 lines)
- Test card selection, display, hover states

**Acceptance Criteria**:
- [ ] 28 tests written and failing (red phase of TDD)
- [ ] Each test is atomic and testable
- [ ] Mocks are set up correctly
- [ ] No implementation code yet

**PR Template**: `feature/step1-hero-concept-1-tests`

---

**Step 2.1b: Implement Components (1 day)**

**Files to Create**:
- `Step1HeroConcept.tsx` (~200 lines) - Main component
- `components/RaceCard.tsx` (~60 lines)
- `components/ClassCard.tsx` (~60 lines)
- `components/BackgroundCard.tsx` (~60 lines)
- `components/HeroPreview.tsx` (~80 lines)

**Implementation Requirements**:
- [ ] All 28 tests pass (green phase of TDD)
- [ ] Component handles 10 races, 12 classes, 6 backgrounds
- [ ] AI name generation works (integrates with backend)
- [ ] Hero preview updates in real-time
- [ ] Card-based UI (modern design)
- [ ] Proper TypeScript types
- [ ] No prop drilling - use context

**Acceptance Criteria**:
- [ ] All 28 tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Components under 300 lines each
- [ ] Accessibility: proper ARIA labels
- [ ] Mobile responsive

**PR Template**: `feature/step1-hero-concept-2-implementation`

---

### Task 2.2: Step 2 - Core Identity (2 days)

**Directory**: `frontend/src/components/character-creation-v2/steps/Step2CoreIdentity/`

**Step 2.2a: Write All Tests First (1 day)**

**File**: `Step2CoreIdentity.test.tsx` (~280 lines)

**Tests to Write**:
```typescript
describe('Step 2: Core Identity', () => {
  // Alignment Grid (5)
  it('renders 9 alignment cards in 3x3 grid')
  it('highlights selected alignment')
  it('displays alignment name and philosophy')
  it('shows archetype example')
  it('calls onAlignmentChange')

  // Gender Selector (4)
  it('renders 4 gender options')
  it('allows custom gender input')
  it('highlights selected gender')
  it('calls onGenderChange')

  // Backstory Inputs (5)
  it('renders ideal input (optional)')
  it('renders bond input (optional)')
  it('renders flaw input (optional)')
  it('shows character count and limit')
  it('calls onBackstoryChange')

  // Portrait Display (3)
  it('displays portrait if provided')
  it('shows placeholder if not provided')
  it('uploads custom portrait')

  // State Integration (3)
  it('persists alignment to draft')
  it('persists gender to draft')
  it('persists backstory to draft')

  // Navigation (2)
  it('enables Next when alignment selected')
  it('allows skip when optional fields empty')
})
```

**Tests**: 22 tests written and failing

**PR Template**: `feature/step2-core-identity-1-tests`

---

**Step 2.2b: Implement Components (1 day)**

**Files to Create**:
- `Step2CoreIdentity.tsx` (~200 lines)
- `components/AlignmentCard.tsx` (~70 lines)
- `components/GenderSelector.tsx` (~80 lines)
- `components/BackstoryForm.tsx` (~90 lines)
- `components/PortraitDisplay.tsx` (~70 lines)

**Implementation Requirements**:
- [ ] All 22 tests pass
- [ ] Alignment: 9 cards (LG, NG, CG, LN, N, CN, LE, NE, CE)
- [ ] Gender: 4 buttons + custom input
- [ ] Backstory: 3 optional fields with char counters
- [ ] Portrait: Display + upload button
- [ ] Card-based design consistent with Step 1
- [ ] No prop drilling

**Acceptance Criteria**:
- [ ] All 22 tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Components under 300 lines
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA compliant

**PR Template**: `feature/step2-core-identity-2-implementation`

---

## FRONTEND DEVELOPER 2 - STEPS 3 & 4

**Dependency**: Wait for Phase 1 complete

### Task 2.3: Step 3 - Abilities & Skills (2.5 days)

**Directory**: `frontend/src/components/character-creation-v2/steps/Step3AbilitiesSkills/`

**Step 2.3a: Write All Tests First (1.5 days)**

**File**: `Step3AbilitiesSkills.test.tsx` (~350 lines)

**Tests to Write**:
```typescript
describe('Step 3: Abilities & Skills', () => {
  // Ability Sliders (8)
  it('renders 6 ability sliders (STR, DEX, CON, INT, WIS, CHA)')
  it('slider range is 8-15')
  it('shows base score, racial bonus, final score')
  it('calculates modifier correctly (score-10)//2')
  it('updates budget as points spent')
  it('enforces 27-point budget total')
  it('prevents exceeding budget')
  it('resets all scores to default')

  // Racial Bonuses (4)
  it('applies +2 to CON for Dwarves')
  it('applies +1 to all for Humans')
  it('applies +2 DEX, +2 INT for Elves')
  it('shows bonus clearly in UI')

  // Skills Grid (6)
  it('renders 18 skills')
  it('highlights proficient skills (gold color)')
  it('shows skill modifier (ability modifier + proficiency)')
  it('skill count matches class requirement')
  it('cant exceed class skill limit')
  it('background skills auto-selected')

  // Stats Preview (3)
  it('shows proficiency bonus (+2 at level 1)')
  it('shows HP calculation (hit die + CON mod)')
  it('shows AC if armor available')

  // State Integration (2)
  it('persists ability scores to draft')
  it('persists skill selection to draft')

  // Navigation (2)
  it('disables Next if points exceeded')
  it('enables Next if budget valid and skills selected')
})
```

**Tests**: 32 tests written and failing

**Files**:
- `Step3AbilitiesSkills.test.tsx` (~350 lines)
- `components/AbilitySlider.test.tsx` (~120 lines)
- `components/SkillsGrid.test.tsx` (~140 lines)
- `components/StatsPreview.test.tsx` (~100 lines)

**PR Template**: `feature/step3-abilities-skills-1-tests`

---

**Step 2.3b: Implement Components (1 day)**

**Files to Create**:
- `Step3AbilitiesSkills.tsx` (~220 lines)
- `components/AbilitySlider.tsx` (~100 lines) - Modern slider UI
- `components/SkillsGrid.tsx` (~150 lines)
- `components/StatsPreview.tsx` (~100 lines)
- `utils/abilityScoreCalculations.ts` (~80 lines)

**Implementation Requirements**:
- [ ] All 32 tests pass
- [ ] Sliders with visual feedback
- [ ] Real-time calculations
- [ ] Point budget tracker (visual)
- [ ] Racial bonuses applied correctly
- [ ] Skills grid with proficiency indicators
- [ ] Modern slider UI (NOT +/- buttons)
- [ ] Debounced updates to context

**Acceptance Criteria**:
- [ ] All 32 tests pass
- [ ] Sliders are smooth (60 FPS)
- [ ] No TypeScript errors
- [ ] Mobile-friendly sliders
- [ ] WCAG 2.1 AA compliant
- [ ] All calculations verified

**PR Template**: `feature/step3-abilities-skills-2-implementation`

---

### Task 2.4: Step 4 - Loadout (2 days)

**Directory**: `frontend/src/components/character-creation-v2/steps/Step4Loadout/`

**Step 2.4a: Write All Tests First (1 day)**

**File**: `Step4Loadout.test.tsx` (~300 lines)

**Tests to Write**:
```typescript
describe('Step 4: Loadout', () => {
  // Equipment Presets (5)
  it('renders class-specific equipment presets')
  it('shows 2 presets per class')
  it('highlights selected preset')
  it('displays items in preset')
  it('calls onEquipmentChange')

  // Gold Calculation (3)
  it('calculates starting gold per class')
  it('displays remaining gold')
  it('shows gold after purchases')

  // Equipment Preview (2)
  it('displays selected equipment visually')
  it('shows AC if armor equipped')

  // Appearance Description (3)
  it('renders appearance textarea')
  it('has placeholder for custom description')
  it('calls onAppearanceChange')

  // Portrait Generation (4)
  it('renders Generate Portrait button')
  it('shows loading state during generation')
  it('displays generated portrait')
  it('allows regenerate')

  // Portrait Upload (2)
  it('allows uploading custom portrait')
  it('displays uploaded portrait')

  // State Integration (2)
  it('persists equipment to draft')
  it('persists appearance to draft')

  // Navigation (1)
  it('enables Next when equipment selected')
})
```

**Tests**: 22 tests written and failing

**PR Template**: `feature/step4-loadout-1-tests`

---

**Step 2.4b: Implement Components (1 day)**

**Files to Create**:
- `Step4Loadout.tsx` (~210 lines)
- `components/EquipmentPresets.tsx` (~120 lines)
- `components/AppearanceInput.tsx` (~80 lines)
- `components/PortraitGenerator.tsx` (~100 lines)
- `components/EquipmentPreview.tsx` (~80 lines)

**Implementation Requirements**:
- [ ] All 22 tests pass
- [ ] Equipment presets by class (12 classes)
- [ ] Gold calculation
- [ ] Appearance textarea
- [ ] Portrait generation integration
- [ ] Loading states
- [ ] Error handling for portrait generation
- [ ] Visual equipment preview

**Acceptance Criteria**:
- [ ] All 22 tests pass
- [ ] No TypeScript errors
- [ ] Portrait generation works
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA compliant
- [ ] All equipment options available

**PR Template**: `feature/step4-loadout-2-implementation`

---

## FRONTEND DEVELOPER 3 (or DEV 1 after Step 2) - STEPS 5 & ORCHESTRATOR

**Dependency**: Phases 1-3 complete

### Task 2.5: Step 5 - Review & Confirm (1.5 days)

**Directory**: `frontend/src/components/character-creation-v2/steps/Step5Review/`

**Step 2.5a: Write All Tests First (0.5 days)**

**File**: `Step5Review.test.tsx` (~200 lines)

**Tests to Write**:
```typescript
describe('Step 5: Review & Confirm', () => {
  // Character Card (6)
  it('displays character portrait')
  it('displays all character stats')
  it('displays all abilities and modifiers')
  it('displays equipment list')
  it('displays skills with proficiency')
  it('displays alignment and background')

  // Editable Sections (4)
  it('Step 1 info has edit button')
  it('clicking edit goes back to Step 1')
  it('Step 2 info has edit button')
  it('clicking edit goes back to Step 2')
  // ... and so on for each step

  // Create Button (3)
  it('renders Create Character button')
  it('disables button during submission')
  it('shows loading spinner during submission')

  // Success/Error (3)
  it('shows success message after creation')
  it('displays error message on failure')
  it('allows retry on failure')

  // Data Validation (2)
  it('verifies all required fields present')
  it('transforms data to backend format')
})
```

**Tests**: 18 tests written and failing

**PR Template**: `feature/step5-review-1-tests`

---

**Step 2.5b: Implement Components (1 day)**

**Files to Create**:
- `Step5Review.tsx` (~200 lines)
- `components/CharacterCard.tsx` (~150 lines)
- `components/EditableSection.tsx` (~80 lines)

**Implementation Requirements**:
- [ ] All 18 tests pass
- [ ] Full character display
- [ ] Editable sections with callbacks
- [ ] Create button with loading state
- [ ] Success/error messages
- [ ] Data transformation to backend format

**Acceptance Criteria**:
- [ ] All 18 tests pass
- [ ] Clean card layout
- [ ] Mobile responsive
- [ ] WCAG 2.1 AA compliant

**PR Template**: `feature/step5-review-2-implementation`

---

### Task 2.6: Wizard Orchestrator V2 (1 day)

**File**: `frontend/src/components/character-creation-v2/CharacterCreationWizardV2.tsx` (~250 lines)

**Deliverables**:
- [ ] Main wizard component routing 5 steps
- [ ] Progress indicator (visual step counter)
- [ ] Navigation logic
- [ ] Context integration
- [ ] Tests: 15+ tests

**Tests**:
```typescript
describe('CharacterCreationWizard V2', () => {
  it('renders step 1 initially')
  it('navigates to step 2 on Next')
  it('navigates back with Back button')
  it('prevents forward navigation if step invalid')
  it('shows correct page number')
  it('persists draft throughout')
  // ... 10+ more navigation/state tests
})
```

**Acceptance Criteria**:
- [ ] 15+ tests passing
- [ ] Smooth transitions between steps
- [ ] No data loss on navigation
- [ ] Proper context usage

**PR Template**: `feature/wizard-orchestrator-v2`

---

## FULL-STACK DEVELOPER (continued) - PHASE 3: STATE & SERVICES

**Can start parallel with Component Phase (Task 2.1+)**

### Task 3.1: CharacterDraftContext V2 (1.5 days)

**Files to Create**:
- `frontend/src/context/characterDraftV2/CharacterDraftContextV2.tsx` (~200 lines)
- `frontend/src/context/characterDraftV2/useCharacterDraftV2.ts` (~100 lines)
- `frontend/src/context/characterDraftV2/validation.ts` (~150 lines)
- `frontend/src/context/characterDraftV2/__tests__/CharacterDraftContextV2.test.tsx` (already written in Phase 1)

**Deliverables**:
- [ ] 5-step support (vs 3 in v1)
- [ ] Validation for each step
- [ ] localStorage persistence with debounce
- [ ] Ability score calculation with slider data
- [ ] Tests: 30+ passing tests

**Implementation Requirements**:
- [ ] All Phase 1 tests passing
- [ ] No regressions from v1
- [ ] Type-safe state management
- [ ] Efficient re-renders (memoization)
- [ ] Clear separation of concerns

**PR Template**: `feature/state-v2-context`

---

### Task 3.2: Services Layer Enhancements (1.5 days)

**Files to Create/Enhance**:
- `frontend/src/services/portraitService.ts` (enhance existing)
- `frontend/src/services/characterSubmit.ts` (update for 5 steps)
- `frontend/src/services/abilityScoreService.ts` (NEW - ~80 lines)
- `frontend/src/services/equipmentService.ts` (NEW - ~100 lines)
- Tests for each service

**Deliverables**:
- [ ] portraitService: Better error handling, retry logic
- [ ] characterSubmit: 5-step data transformation
- [ ] abilityScoreService: Slider calculations, racial bonuses
- [ ] equipmentService: Equipment presets, gold calculations
- [ ] Tests: 20+ tests per service

**Acceptance Criteria**:
- [ ] All services fully tested (100+ tests total)
- [ ] No API contract breaks
- [ ] Proper error handling
- [ ] TypeScript strict mode

**PR Template**: `feature/services-layer-v2`

---

### Task 3.3: Backend API Tests (1 day)

**Enhance**: `backend/src/__tests__/routes/characters.integration.test.ts`

**Deliverables**:
- [ ] 5-step data validation
- [ ] Ability score calculations
- [ ] Equipment/gold logic
- [ ] All edge cases
- [ ] Tests: 30+ integration tests

**Acceptance Criteria**:
- [ ] All 30+ tests passing
- [ ] No breaking changes
- [ ] Error handling comprehensive

**PR Template**: `feature/api-tests-comprehensive`

---

## QA / TEST ENGINEER - E2E & ACCESSIBILITY

**Can start after Phase 2 components complete**

### Task 4.4: Comprehensive E2E Tests (1.5 days)

**Enhance**: `e2e/character-creation-v2.spec.ts`

**Deliverables**:
- [ ] 30+ Playwright E2E tests (started in Phase 1 with 15)
- [ ] Happy path, error cases, edge cases
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing scenarios
- [ ] Performance benchmarks

**Scenarios to Test**:
- Complete flow all 5 steps
- Skip optional fields
- Portrait generation and regeneration
- Navigate back and edit
- Draft persistence and reload
- Error handling and recovery
- Mobile responsiveness
- Accessibility workflows

**Acceptance Criteria**:
- [ ] 30+ tests passing
- [ ] All browsers passing
- [ ] Mobile workflows verified
- [ ] Performance < 2s page load

**PR Template**: `feature/e2e-comprehensive-v2`

---

### Task 4.4b: Accessibility Audit (1 day)

**Deliverables**:
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Keyboard navigation testing
- [ ] Color contrast verification (WCAG)
- [ ] Focus indicator testing
- [ ] Form labeling audit
- [ ] Report + fixes

**Tools to Use**:
- axe DevTools
- WAVE
- Lighthouse
- Manual keyboard testing
- Screen reader (NVDA/JAWS)

**Acceptance Criteria**:
- [ ] 0 WCAG errors
- [ ] 0 axe violations
- [ ] All keyboard accessible
- [ ] Screen reader compatible
- [ ] Report documented

**Deliverable**: `ACCESSIBILITY_AUDIT.md` + fixes

---

## DESIGNER - UI/UX POLISH

**Can start immediately (Phase 1 in parallel)**

### Task 4.3: Modern Design System (2 days)

**Deliverables**:

1. **Color Palette** (~4 hours)
   - Primary: Deep purple/indigo for main elements
   - Accent: Keep Nuaibria gold (#D4AF37 or similar)
   - Secondary: Muted teal/blue for highlights
   - Status: Green (success), Red (error), Yellow (warning)
   - Neutrals: Grays for backgrounds/text
   - Create Tailwind config or CSS variables

2. **Typography System** (~4 hours)
   - Modern sans-serif (e.g., Inter, Poppins, or similar)
   - Heading scale (H1-H6)
   - Body text sizing and line height
   - Monospace for code/stats

3. **Icon Set** (~4 hours)
   - Icons for 10 races
   - Icons for 12 classes
   - Icons for 6 backgrounds
   - Icons for abilities (STR, DEX, CON, INT, WIS, CHA)
   - UI icons (back, next, save, etc.)
   - Use existing icon library (Heroicons, Lucide, Tabler, etc.)

4. **Component Specs** (~4 hours)
   - Card design (hover, selected, disabled states)
   - Button styles (primary, secondary, danger)
   - Input/slider styles
   - Modal/dialog styles
   - Toast notification styles

5. **Animations Spec** (~4 hours)
   - Page transitions (fade/slide timing)
   - Card hover effects
   - Slider feedback
   - Button ripple effects
   - Loading spinner
   - Success celebration animation

**Deliverables**:
- [ ] Color palette with hex/RGB values
- [ ] Typography specs with font families and sizes
- [ ] Icon set (SVG or image collection)
- [ ] Component visual guide
- [ ] Animation timing specs
- [ ] Figma/Design file (optional but recommended)
- [ ] CSS variables or Tailwind config

**Implementation Coordination**:
- Share color palette early so devs can implement
- Share typography specs before Step 1 implementation
- Share icon specs for component use
- Coordinate animations during Phase 4

**Deliverable**: `DESIGN_SYSTEM.md` + implementation files

---

## TASK EXECUTION ORDER & DEPENDENCIES

```
START
  |
  +---> PHASE 1: Test Infrastructure (Full-Stack Dev, 4 days)
  |       |
  |       +---> (Complete before other work)
  |       |
  |       +---> BLOCKS: Components, Services, API
  |
  +---> PARALLEL AFTER P1:
  |       |
  |       +---> PHASE 2: Components (Frontend Dev 1+2, 5 days)
  |       |       |
  |       |       +---> Step 1 & 2 (Dev 1, 4 days)
  |       |       +---> Step 3 & 4 (Dev 2, 5 days)
  |       |       +---> Step 5 & Orchestrator (Dev 3, 2.5 days)
  |       |
  |       +---> PHASE 3: State & Services (Full-Stack, 3 days)
  |       |       |
  |       |       +---> CharacterDraftContext V2
  |       |       +---> Services Layer
  |       |       +---> Backend API Tests
  |       |
  |       +---> DESIGNER: Design System (2 days, parallel)
  |
  +---> PHASE 4: Integration & Polish (After P2 + P3)
          |
          +---> QA: E2E Tests + Accessibility (2 days)
          +---> Dev: Animations & Responsive Design (2 days)
          +---> Design: Final Polish & Refinements (1 day)
  |
  v
 COMPLETE - All 350+ tests passing, 100% coverage, WCAG 2.1 AA
```

---

## RESOURCE SUMMARY

| Role | Tasks | Timeline | Start |
|------|-------|----------|-------|
| Full-Stack Dev | Phase 1 (4 tasks) + Phase 3 (3 tasks) | 7 days | Day 1 |
| Frontend Dev 1 | Step 1+2 (4 tasks) | 4 days | After P1 (Day 5) |
| Frontend Dev 2 | Step 3+4 (4 tasks) | 5 days | After P1 (Day 5) |
| Frontend Dev 3 | Step 5 + Orchestrator (2 tasks) | 2.5 days | After P1 (Day 5) |
| QA/Test Engineer | E2E + Accessibility (2 tasks) | 3 days | After P2 (Day 10) |
| Designer | Design System (1 task) | 2 days | Day 1 (parallel) |

**Total Timeline**: ~14 days with full team (~7-10 days with efficient scheduling)

---

## DEFINITION OF DONE (For Each Task)

Every task must have:
- [ ] Tests written FIRST (TDD)
- [ ] Code implemented (makes tests pass)
- [ ] All tests passing (0 failures)
- [ ] No TypeScript errors
- [ ] Code review approved
- [ ] All files under 300 lines
- [ ] Proper documentation
- [ ] No console errors/warnings
- [ ] Mobile responsive verified
- [ ] WCAG 2.1 AA basic checks

---

## GIT WORKFLOW FOR EACH TASK

```bash
# 1. Create feature branch
git checkout -b feature/step1-hero-concept-1-tests

# 2. Write tests (red phase)
# - Commit: "test: write Step 1 tests (red phase)"

# 3. Implement code (green phase)
# - Commit: "feat: implement Step 1 hero concept"

# 4. Create PR with description
git push -u origin feature/step1-hero-concept-1-tests

# 5. PR Description must include:
  - Link to task assignment
  - Tests passing: X/X
  - Coverage: XX%
  - No regressions
  - Mobile verified

# 6. Merge to staging after approval
# 7. Test in staging environment
# 8. Merge to main when ready

# DO NOT commit to main directly
# All changes through PRs
```

---

## COMMUNICATION CHECKPOINTS

**Daily (15 min standup)**:
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

**After each phase**:
- Demo of work
- Discuss any issues
- Plan next phase

**After Phase 2 (Components complete)**:
- Performance audit
- Accessibility check
- Design review

**Before Phase 4 (Polish)**:
- All 350+ tests passing?
- Any regressions?
- Ready for final push?

---

## SUCCESS CRITERIA CHECKLIST

Task assignments will be considered complete when:

- [ ] All test specifications written and agreed upon
- [ ] Each developer has clear, actionable tasks
- [ ] Dependencies are clearly documented
- [ ] Timeline is realistic and agreed
- [ ] Definition of Done is clear
- [ ] Team understands the workflow
- [ ] Communication plan is set
- [ ] Success metrics are objective and measurable

---

## NEXT STEPS

1. Assign each developer a task from above
2. Have Full-Stack Dev start Phase 1 immediately
3. Other devs prepare by reviewing design/architecture
4. Daily standup meetings
5. After Phase 1 complete, start Phase 2 (parallel for Devs 1-3)
6. Keep tracking test coverage and progress

---

**Ready to start?** Pick a task and I can help set up the environment, create file stubs, and help with the first implementation.

