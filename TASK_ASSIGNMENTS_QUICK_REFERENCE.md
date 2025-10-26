# Character Creation Redesign - Task Assignments QUICK REFERENCE

## WHO DOES WHAT

### FULL-STACK DEVELOPER (Days 1-7)

**Phase 1 (Days 1-4)** - FOUNDATION / BLOCKS EVERYTHING
```
Day 1: Task 1.1 - Test Utilities & Mocks
       File: frontend/src/test/testUtils.ts (~150 lines)
       Deliverable: 20 tests passing
       Branch: feature/test-infrastructure-1-utils

Day 2: Task 1.2 - State Management Tests
       File: frontend/src/__tests__/context/CharacterDraftContextV2.test.tsx (~400 lines)
       Deliverable: 30+ tests for 5-step context
       Branch: feature/test-infrastructure-2-state

Day 3: Task 1.3 - API Integration Tests
       File: backend/src/__tests__/routes/characters.integration.test.ts (~350 lines)
       Deliverable: 16 integration tests + mocks
       Branch: feature/test-infrastructure-3-api

Day 4: Task 1.4 - E2E Test Scenarios
       File: e2e/character-creation-v2.spec.ts (~300 lines)
       Deliverable: 15+ E2E tests with Playwright
       Branch: feature/test-infrastructure-4-e2e
```

**Phase 3 (Days 5-7)** - PARALLEL WITH COMPONENT DEVS
```
Day 5-6: Task 3.1 - CharacterDraftContext V2
         File: frontend/src/context/characterDraftV2/*
         Deliverable: 5-step context with 30+ tests passing
         Branch: feature/state-v2-context

Day 6-7: Task 3.2 - Services Layer
         File: frontend/src/services/*
         Deliverable: 4 services with 100+ tests
         Branch: feature/services-layer-v2

Day 7:   Task 3.3 - Backend API Tests
         File: backend/src/__tests__/routes/characters.integration.test.ts
         Deliverable: 30+ integration tests
         Branch: feature/api-tests-comprehensive
```

---

### FRONTEND DEVELOPER 1 (Days 5-8)

**BLOCKED UNTIL**: Phase 1 complete (test infrastructure ready)

```
Day 5: Task 2.1a - Step 1 Tests
       File: frontend/src/components/character-creation-v2/steps/Step1HeroConcept/
       Deliverable: 28 tests (RED phase - all failing)
       Branch: feature/step1-hero-concept-1-tests
       Time: 1 day

Day 6: Task 2.1b - Step 1 Implementation
       Files: Step1HeroConcept.tsx, RaceCard.tsx, ClassCard.tsx,
              BackgroundCard.tsx, HeroPreview.tsx
       Deliverable: All 28 tests passing (GREEN phase)
       Branch: feature/step1-hero-concept-2-implementation
       Time: 1 day

Day 7: Task 2.2a - Step 2 Tests
       File: frontend/src/components/character-creation-v2/steps/Step2CoreIdentity/
       Deliverable: 22 tests (RED phase)
       Branch: feature/step2-core-identity-1-tests
       Time: 1 day

Day 8: Task 2.2b - Step 2 Implementation
       Files: Step2CoreIdentity.tsx, AlignmentCard.tsx, GenderSelector.tsx,
              BackstoryForm.tsx, PortraitDisplay.tsx
       Deliverable: All 22 tests passing (GREEN phase)
       Branch: feature/step2-core-identity-2-implementation
       Time: 1 day
```

---

### FRONTEND DEVELOPER 2 (Days 5-9)

**BLOCKED UNTIL**: Phase 1 complete

```
Day 5-6: Task 2.3a - Step 3 Tests
         File: frontend/src/components/character-creation-v2/steps/Step3AbilitiesSkills/
         Deliverable: 32 tests (RED phase) - SLIDERS & ABILITY CALCULATIONS
         Branch: feature/step3-abilities-skills-1-tests
         Time: 1.5 days

Day 7: Task 2.3b - Step 3 Implementation
       Files: Step3AbilitiesSkills.tsx, AbilitySlider.tsx (MODERN!), SkillsGrid.tsx,
              StatsPreview.tsx, abilityScoreCalculations.ts
       Deliverable: All 32 tests passing (GREEN phase)
       Branch: feature/step3-abilities-skills-2-implementation
       Time: 1 day
       NOTE: Modern sliders (NOT +/- buttons) - this is key difference!

Day 8: Task 2.4a - Step 4 Tests
       File: frontend/src/components/character-creation-v2/steps/Step4Loadout/
       Deliverable: 22 tests (RED phase)
       Branch: feature/step4-loadout-1-tests
       Time: 1 day

Day 9: Task 2.4b - Step 4 Implementation
       Files: Step4Loadout.tsx, EquipmentPresets.tsx, AppearanceInput.tsx,
              PortraitGenerator.tsx, EquipmentPreview.tsx
       Deliverable: All 22 tests passing (GREEN phase)
       Branch: feature/step4-loadout-2-implementation
       Time: 1 day
```

---

### FRONTEND DEVELOPER 3 (Days 9-11) OR DEV 1/2 AFTER THEIR WORK

**BLOCKED UNTIL**: Phases 1-3 mostly complete + Steps 1-4 done

```
Day 9-10: Task 2.5a - Step 5 Tests
          File: frontend/src/components/character-creation-v2/steps/Step5Review/
          Deliverable: 18 tests (RED phase)
          Branch: feature/step5-review-1-tests
          Time: 0.5 days

Day 10: Task 2.5b - Step 5 Implementation
        Files: Step5Review.tsx, CharacterCard.tsx, EditableSection.tsx
        Deliverable: All 18 tests passing (GREEN phase)
        Branch: feature/step5-review-2-implementation
        Time: 1 day

Day 11: Task 2.6 - Wizard Orchestrator V2
        File: frontend/src/components/character-creation-v2/CharacterCreationWizardV2.tsx
        Deliverable: 15+ tests passing, full 5-step routing working
        Branch: feature/wizard-orchestrator-v2
        Time: 1 day
```

---

### QA / TEST ENGINEER (Days 12-14)

**BLOCKED UNTIL**: All components complete (Day 11+)

```
Day 12: Task 4.4 - Comprehensive E2E Tests
        File: e2e/character-creation-v2.spec.ts (expand from Phase 1)
        Deliverable: 30+ E2E tests passing across browsers
        Branch: feature/e2e-comprehensive-v2
        Time: 1.5 days

Day 13-14: Task 4.4b - Accessibility Audit
           Deliverable: WCAG 2.1 AA compliance verified
           Report: ACCESSIBILITY_AUDIT.md + fixes
           Branch: feature/accessibility-v2
           Time: 1 day

           Tools: axe DevTools, WAVE, Lighthouse, manual screen reader testing
           Checks: Color contrast, keyboard nav, ARIA labels, focus indicators
```

---

### DESIGNER (Days 1-2, PARALLEL WITH PHASE 1)

```
Days 1-2: Task 4.3 - Design System
          Deliverable: DESIGN_SYSTEM.md + implementation files

          Includes:
          - Color palette (primary, secondary, status colors)
          - Typography system (fonts, sizes, weights)
          - Icon set (races, classes, backgrounds, abilities, UI)
          - Component specs (cards, buttons, inputs, sliders, etc.)
          - Animation specs (transitions, hover effects, micro-interactions)

          IMPORTANT: Share color palette ASAP so devs can implement early

          Branch: feature/design-system-v2
```

---

## CRITICAL PATH (What Blocks What)

```
CRITICAL PATH:
Phase 1 (4 days) ─────> BLOCKS ────> Phase 2 (6 days) ──> Phase 4 (2 days) ──> DONE
                                 ──> Phase 3 (3 days) ──┘
                                 ──> Phase 4 (QA, 2 days)

Longest path: 4 + 6 + 2 = 12 days minimum (with perfect parallelization)
Most realistic: 14-16 days (with some serial work)
```

---

## TEST COUNTS BY ROLE

| Developer | Component Tests | Total Tests | Target |
|-----------|-----------------|-------------|--------|
| Dev 1 | Step 1 (28) + Step 2 (22) | 50 | 50 |
| Dev 2 | Step 3 (32) + Step 4 (22) | 54 | 54 |
| Dev 3 | Step 5 (18) + Wizard (15) | 33 | 33 |
| Full-Stack | Context (30) + Services (100) + API (30) + E2E (15) | 175+ | 175+ |
| QA | E2E (30) + A11y (audit) | 30+ | 30+ |
| **TOTAL** | | **342+** | **342+** |

---

## DAILY STANDUP TEMPLATE

**For each developer, every standup answer:**

1. What tests did you write yesterday?
2. What code did you implement yesterday?
3. How many tests are passing now?
4. Are you blocked on anything?
5. What are you starting today?

**Example (Day 6, Frontend Dev 1):**
- Yesterday: Wrote 28 tests for Step 1 (RED phase, all failing as expected)
- Yesterday: Implemented Step 1 components (RaceCard, ClassCard, etc.)
- Status: All 28 tests now passing! Step 1 complete.
- Blockers: None
- Today: Starting Step 2 tests (22 tests to write)

---

## MERGING WORKFLOW

Each task must go through:

1. **WRITE TESTS** (Commit to feature branch)
   ```
   git commit -m "test: [component] tests (RED phase)"
   ```

2. **IMPLEMENT CODE** (Commit to same feature branch)
   ```
   git commit -m "feat: [component] implementation (GREEN phase)"
   ```

3. **CREATE PR** (From feature branch to staging)
   - Title: `[Step X] [Task Name]`
   - Description: Tests passing? Coverage? Mobile verified?
   - Link to task assignment

4. **CODE REVIEW** (Another dev reviews)
   - Tests passing?
   - No TypeScript errors?
   - Under 300 lines?
   - Mobile responsive?

5. **MERGE TO STAGING** (Test in staging first)

6. **MERGE TO MAIN** (After QA sign-off)

---

## DEFINITION OF DONE CHECKLIST

Before any PR is merged, task is DONE when:

- [ ] All tests written FIRST (TDD)
- [ ] All tests passing (0 failures)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] All components under 300 lines
- [ ] Code review approved
- [ ] No console warnings/errors
- [ ] Mobile responsive verified (tested on mobile screen)
- [ ] WCAG 2.1 AA basic checks (alt text, ARIA labels, keyboard nav)
- [ ] Proper Git history (clear commits)
- [ ] Documentation updated if needed

---

## HOW TO TRACK PROGRESS

Use this pattern:

**Phase 1 Progress** (Days 1-4)
```
[########____] 80% complete
- Task 1.1: DONE (20 tests)
- Task 1.2: IN PROGRESS (25/30 tests written)
- Task 1.3: BLOCKED (waiting for Supabase mock)
- Task 1.4: NOT STARTED
```

**Phase 2 Progress** (Days 5-11)
```
[###_________] 30% complete
- Step 1: DONE (50 tests passing)
- Step 2: IN PROGRESS (22 tests, 5 components)
- Step 3: BLOCKED (waiting for Phase 1)
- Step 4: NOT STARTED
- Step 5: NOT STARTED
```

---

## KEY SUCCESS FACTORS

1. **Test First**: Write tests BEFORE code (TDD)
2. **Atomic Tasks**: Each task is self-contained
3. **Daily Communication**: Quick standups prevent surprises
4. **Clear Blockers**: Identify blockers immediately
5. **Phase Dependencies**: Don't start Phase 2 until Phase 1 done
6. **Coverage Target**: 350+ tests across all layers
7. **No Exceptions**: ALL tasks must have tests
8. **Code Quality**: No code > untested code

---

## WHAT HAPPENS WHEN BLOCKER

If blocked:
1. **Document it** - Write why you're blocked
2. **Request help** - Tag the person who can unblock
3. **Continue other work** - Don't sit idle
4. **Track progress** - Update standup

Example:
- "Blocked: Task 1.2 needs mock Supabase client from Task 1.1"
- "Who can help: Full-Stack Dev (on Task 1.1)"
- "Alternative: Proceeding with Task 1.3 instead"

---

## QUESTIONS DEVS SHOULD ASK BEFORE STARTING

1. Have I read TASK_ASSIGNMENTS.md fully?
2. Have I reviewed the acceptance criteria for my task?
3. Do I understand all dependencies?
4. Do I have all the information needed?
5. Are the tests clear and specific?
6. Do I know what "DONE" means for my task?

---

## FINAL CHECKLIST BEFORE KICKOFF

- [ ] All developers have assignments
- [ ] Full-Stack Dev ready to start Phase 1
- [ ] Designer shared design system early
- [ ] Team has daily standup scheduled
- [ ] Git workflow understood
- [ ] Definition of Done posted publicly
- [ ] Blocker resolution process clear
- [ ] Test infrastructure tools ready (Vitest, Jest, Playwright)
- [ ] All developers have access to repo
- [ ] Project management tool set up (if using one)

---

**Status**: Ready to start Phase 1 immediately
**Next**: Assign Full-Stack Dev to Phase 1, Day 1

