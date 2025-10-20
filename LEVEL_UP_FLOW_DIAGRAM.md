# Level-Up Workflow Diagram

## Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CHARACTER GAINS XP                       │
│                                                                   │
│  Backend: checkAndProcessLevelUp() detects threshold crossed     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR INITIALIZES                      │
│                                                                   │
│  Analyzes levelUpData and builds step array:                     │
│  • Always: celebration                                           │
│  • If requiresASI: asi                                           │
│  • If requiresSubclass: subclass                                 │
│  • If learnNewSpells > 0: spells                                 │
│  • If learnNewCantrips > 0: cantrips                             │
│  • Always: features                                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STEP 1: CELEBRATION                         │
│                                                                   │
│  Component: LevelUpModal                                         │
│  Shows:                                                          │
│  • 🎉 LEVEL UP!                                                 │
│  • Level number (e.g., Level 4)                                  │
│  • HP gained: +8 HP (45 → 53)                                    │
│  • Proficiency bonus: +2                                         │
│  • "Continue Adventure" button                                   │
│                                                                   │
│  Duration: Auto-advance after 3-5 seconds OR manual click        │
│  Progress: ● ○ ○ ○ ○                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 2: ASI (if required)                      │
│                                                                   │
│  Component: ASISelectionModal                                    │
│  Shows:                                                          │
│  • Current ability scores with modifiers                         │
│  • +/- buttons to allocate 2 points                              │
│  • Can do +2 to one OR +1 to two abilities                       │
│  • Maximum score: 20                                             │
│  • "Confirm" button (disabled until 2 points spent)              │
│                                                                   │
│  Backend Call: POST /api/characters/{id}/asi                     │
│  Progress: ● ● ○ ○ ○                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               STEP 3: SUBCLASS (if required)                     │
│                                                                   │
│  Component: SubclassSelectionModal                               │
│  Shows:                                                          │
│  • Available subclasses for character class                      │
│  • Subclass description and flavor text                          │
│  • Level-appropriate features preview                            │
│  • Expandable for full feature list                              │
│  • "Choose [Subclass Name]" button per option                    │
│                                                                   │
│  Backend Call: POST /api/subclass/{id}/subclass                  │
│  Progress: ● ● ● ○ ○                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: SPELLS (if applicable)                      │
│                                                                   │
│  Component: SpellLearningModal                                   │
│  Shows:                                                          │
│  • "Choose X spells to learn"                                    │
│  • Selection counter: 2 / 2                                      │
│  • Available spells from class list                              │
│  • Spell level, school, brief description                        │
│  • Expandable for full spell details                             │
│  • Checkboxes for selection                                      │
│  • "Confirm Selection" button                                    │
│                                                                   │
│  Backend Calls:                                                  │
│    GET /api/spells/available?class={}&level={}                   │
│    POST /api/characters/{id}/spells                              │
│  Progress: ● ● ● ● ○                                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             STEP 5: CANTRIPS (if applicable)                     │
│                                                                   │
│  Component: SpellLearningModal (cantripsOnly mode)               │
│  Shows:                                                          │
│  • "Choose X cantrips to learn"                                  │
│  • Same interface as spell learning                              │
│  • Only shows level 0 spells                                     │
│                                                                   │
│  Backend Calls:                                                  │
│    GET /api/spells/available?cantripsOnly=true                   │
│    POST /api/characters/{id}/spells                              │
│  Progress: ● ● ● ● ● ○                                          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 6: FEATURES SUMMARY                         │
│                                                                   │
│  Component: ClassFeaturesModal                                   │
│  Shows:                                                          │
│  • ✨ Level X Features ✨                                       │
│  • Class Features section:                                       │
│    - New features gained at this level                           │
│    - Expandable descriptions                                     │
│  • Subclass Features section (if any):                           │
│    - Features from character's subclass                          │
│  • New Spell Slots:                                              │
│    - Grid showing slots per level                                │
│  • Cantrip Power Increase (if applicable)                        │
│  • "Complete Level Up" button                                    │
│                                                                   │
│  Progress: ● ● ● ● ● ●                                          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR COMPLETE                       │
│                                                                   │
│  Actions:                                                        │
│  • Calls onComplete() callback                                   │
│  • Dashboard refreshes character data                            │
│  • Character sheet shows new values                              │
│  • Player can continue adventuring                               │
└─────────────────────────────────────────────────────────────────┘
```

## Example: Fighter Leveling from 3 to 4

```
Level 3 Fighter → Gains XP → Levels to 4

Steps Required:
1. Celebration ✓
2. ASI ✓ (Level 4 grants ASI)
3. Features ✓ (Always show)

Progress Visualization:
Step 1: ● ○ ○  (Celebration)
Step 2: ● ● ○  (ASI Selection)
Step 3: ● ● ●  (Features Summary)
```

## Example: Wizard Leveling from 2 to 3

```
Level 2 Wizard → Gains XP → Levels to 3

Steps Required:
1. Celebration ✓
2. Subclass ✓ (Wizard gets subclass at level 3)
3. Spells ✓ (Learn 2 new spells)
4. Features ✓ (Show subclass features)

Progress Visualization:
Step 1: ● ○ ○ ○  (Celebration)
Step 2: ● ● ○ ○  (Subclass: Evocation/Abjuration/etc.)
Step 3: ● ● ● ○  (Learn 2 new 2nd-level spells)
Step 4: ● ● ● ●  (Features: Subclass abilities)
```

## Example: Cleric Leveling from 3 to 4

```
Level 3 Cleric → Gains XP → Levels to 4

Steps Required:
1. Celebration ✓
2. ASI ✓ (Level 4 grants ASI)
3. Cantrips ✓ (Learn 1 new cantrip)
4. Features ✓ (Show ASI feature)

Progress Visualization:
Step 1: ● ○ ○ ○  (Celebration)
Step 2: ● ● ○ ○  (ASI: +2 WIS or +1 WIS/+1 CON)
Step 3: ● ● ● ○  (Cantrip: Sacred Flame/Guidance/etc.)
Step 4: ● ● ● ●  (Features Summary)
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│              Orchestrator State Variables                 │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  currentStepIndex: number                                 │
│    • Tracks which step is currently shown                 │
│    • Starts at 0                                          │
│    • Increments on step completion                        │
│                                                            │
│  steps: Step[]                                            │
│    • Array of step names to show                          │
│    • Built dynamically from levelUpData                   │
│    • Example: ['celebration', 'asi', 'features']          │
│                                                            │
│  completedData: CompletedData                             │
│    • Accumulates choices made in each step                │
│    • Example:                                             │
│      {                                                    │
│        asiSelection: { STR: +2 },                         │
│        subclassSelected: 'Champion',                      │
│        spellsLearned: ['Fireball', 'Haste']               │
│      }                                                    │
│                                                            │
└──────────────────────────────────────────────────────────┘

Step Completion Handler:
┌──────────────────────────────────────────────────────────┐
│  handleStepComplete(stepData?)                            │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  1. Log completed step                                    │
│  2. Store stepData if provided                            │
│  3. Check if more steps remain:                           │
│     • YES: Increment currentStepIndex                     │
│     • NO:  Call onComplete() callback                     │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## Progress Indicator States

```
● = Completed (green)
◉ = Current (gold, pulsing)
○ = Upcoming (gray)

Example with 5 steps:

Start:      ◉ ○ ○ ○ ○
After 1:    ● ◉ ○ ○ ○
After 2:    ● ● ◉ ○ ○
After 3:    ● ● ● ◉ ○
After 4:    ● ● ● ● ◉
Complete:   ● ● ● ● ●  (closes immediately)
```

## Error Handling

```
┌──────────────────────────────────────────────────────────┐
│                      Error States                         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Each modal handles its own errors:                       │
│                                                            │
│  • Network failures → Show error banner                   │
│  • Validation errors → Highlight invalid input            │
│  • Auth failures → Redirect to login                      │
│                                                            │
│  Orchestrator continues to show modal on error            │
│  User can retry or close (doesn't auto-advance)           │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## Backend Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend → Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  checkAndProcessLevelUp()                                   │
│    Returns: LevelUpResult                                   │
│    ├─ leveledUp: boolean                                    │
│    ├─ newLevel: number                                      │
│    ├─ hpGained: number                                      │
│    ├─ requiresASI: boolean                                  │
│    ├─ requiresSubclass: boolean                             │
│    ├─ learnNewSpells: number                                │
│    ├─ learnNewCantrips: number                              │
│    ├─ newClassFeatures: ClassFeature[]                      │
│    └─ newSubclassFeatures: SubclassFeature[]                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Frontend → Backend                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/characters/{id}/asi                              │
│    Body: { abilityIncreases: { STR: 2 } }                   │
│                                                              │
│  POST /api/subclass/{id}/subclass                           │
│    Body: { subclassName: 'Champion' }                       │
│                                                              │
│  POST /api/characters/{id}/spells                           │
│    Body: { spells: ['Fireball', 'Haste'] }                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
