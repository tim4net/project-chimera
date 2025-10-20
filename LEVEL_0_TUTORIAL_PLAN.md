# Level 0 to Level 1 Tutorial System - Implementation Plan

**Status**: Phase 1 Complete (Database ready)
**Designed by**: Gemini-2.5-Pro (Planning model)
**Remaining Work**: 3-4 hours

---

## PROBLEM IDENTIFIED

When creating a Bard (or any spellcaster), they start at Level 1 but have:
- No spells assigned
- No spell slots initialized
- Empty spell_slots: {}

Result: Spellcasters can't cast spells!

---

## SOLUTION: Level 0 Tutorial System

Characters start at "Level 0" (incomplete) and The Chronicler guides them through:
1. Cantrip selection (Bard: choose 2)
2. Spell selection (Bard: choose 4)
3. Equipment choices
4. Level-up to official Level 1

All done conversationally through chat - no UI wizards!

---

## ARCHITECTURE

```
Character Creation
  ↓
Level: 0, tutorial_state: 'needs_cantrips'
  ↓
First Login → DM Chat
  ↓
DM: "Welcome, Bard! Choose 2 cantrips: Vicious Mockery, Mage Hand..."
  ↓
Player: "I choose Vicious Mockery and Minor Illusion"
  ↓
Intent: SELECT_CANTRIP → Rule Engine validates → State updates
  ↓
tutorial_state: 'needs_spells'
  ↓
DM: "Excellent! Now choose 4 first-level spells..."
  ↓
Player: "Healing Word, Charm Person, Dissonant Whispers, Faerie Fire"
  ↓
Intent: SELECT_SPELL → Rule Engine validates → State updates
  ↓
tutorial_state: 'complete'
  ↓
Player: "I'm ready"
  ↓
Intent: COMPLETE_TUTORIAL → Rule Engine levels 0 → 1
  ↓
Level: 1, spell_slots: {'1': 2}, HP updated
  ↓
DM: "Level 1 Bard ready! Your adventure begins!"
```

---

## DATABASE (COMPLETE)

### Tables Updated:
```sql
characters:
  + tutorial_state TEXT (needs_cantrips/needs_spells/needs_equipment/complete)
  + selected_cantrips TEXT[]
  + selected_spells TEXT[]

spells:
  Already exists with 10 spells seeded
  (Bard cantrips + level 1 spells available)
```

---

## REMAINING IMPLEMENTATION

### PHASE 2: Spell Selection Intents (1 hour)

**Files to create:**
1. `services/spellSelectionDetector.ts`
   - Detect "I choose/select/pick X" patterns
   - Parse spell names from message
   - Return SELECT_CANTRIP or SELECT_SPELL intent

2. `types/actions.ts` (update)
   - Add SELECT_CANTRIP action
   - Add SELECT_SPELL action
   - Add COMPLETE_TUTORIAL action

### PHASE 3: Spell Validation (1 hour)

**Files to create:**
3. `services/spellValidator.ts`
   - Query spells table for class
   - Validate spell on correct list
   - Check quantity limits
   - Prevent duplicates
   - Return validation result

4. `services/ruleEngine.ts` (update)
   - executeSelectCantrip()
   - executeSelectSpell()
   - executeCompleteTutorial()

### PHASE 4: DM Tutorial Prompts (30 min)

**Files to update:**
5. `services/narratorLLM.ts`
   - Detect character.level === 0
   - Inject tutorial context
   - Provide spell lists
   - Guide player through choices

### PHASE 5: Character Creation (30 min)

**Files to update:**
6. `routes/characters.ts`
   - For spellcasters: level = 0, tutorial_state = 'needs_cantrips'
   - For non-casters: level = 1, tutorial_state = 'complete'
   - Create initial DM welcome message

### PHASE 6: Tests (1 hour)

**Files to create:**
7. `__tests__/spellSelection.test.ts`
   - Unit tests for intent detection
   - Spell validation tests
   - Tutorial completion tests

8. `__tests__/level0Tutorial.test.ts`
   - End-to-end Bard creation
   - Invalid spell rejection
   - Duplicate prevention
   - Multi-class support

---

## SPELL DATA AVAILABLE

The spells table already has basic spells. Need to verify/expand Bard spell list:

**Cantrips** (should have ~10):
- Vicious Mockery
- Minor Illusion
- Prestidigitation
- Mage Hand
- Light
- Dancing Lights
- Friends
- Message
- (need to add more)

**Level 1 Spells** (should have ~17):
- Healing Word
- Charm Person
- Dissonant Whispers
- Faerie Fire
- Sleep
- Thunderwave
- (need to add remaining Bard spells)

---

## IMPLEMENTATION SEQUENCE

1. Spell selection detector (detect "I choose X")
2. Spell validator (check if valid for class)
3. Rule Engine executors (apply selections)
4. Tutorial completion logic (level 0 → 1)
5. Update character creation (start at level 0)
6. Update DM prompts (guide tutorial)
7. Write comprehensive tests
8. Test end-to-end flow

Estimated total: 3-4 hours

---

## BENEFITS

Once implemented:
- All spellcasters get proper spell selection
- Conversational, immersive onboarding
- Educational (explains class features)
- Reusable for subclass selection at level 3
- No UI wizards needed (DM guides everything)
- Maintains secure architecture

---

## NEXT STEPS

Ready to continue implementation?

The database is ready. Next tasks:
1. Create spell selection intents
2. Build spell validator
3. Update Rule Engine
4. Test the flow

Want me to continue building this system?
