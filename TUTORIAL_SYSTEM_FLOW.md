# Tutorial Guidance System - Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PLAYER INTERACTION                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ "I want to choose my cantrips"
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DM CHAT BACKEND ROUTE                          │
│                   (/api/characters/:id/chat)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Fetches CharacterRecord
                                  │ (level: 0, tutorial_state: 'needs_cantrips')
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NARRATOR LLM SERVICE                        │
│                     (buildNarrativePrompt)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
    ┌───────────────────────────┐   ┌────────────────────────┐
    │  getTutorialContext()     │   │  Regular Game Context  │
    │  (tutorialGuidance.ts)    │   │  (world, quests, etc.) │
    └───────────────────────────┘   └────────────────────────┘
                    │                           │
                    │ Returns tutorial prompt   │
                    │ with full spell list      │
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  │ Builds complete prompt:
                                  │ "=== TUTORIAL MODE ==="
                                  │ [Cantrip Selection Prompt]
                                  │ "=== END TUTORIAL ==="
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        THE CHRONICLER (LLM)                         │
│                  (Local LLM or Gemini Fallback)                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Generates engaging narrative:
                                  │ "Welcome, young wizard! Before you
                                  │  embark on your journey, you must
                                  │  choose your cantrips..."
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          PLAYER RECEIVES                            │
│                    Educational Spell Selection UI                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Player: "I choose Fire Bolt,
                                  │          Mage Hand, and
                                  │          Prestidigitation"
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       VALIDATION (Future Step)                      │
│                   validateCantripSelection()                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌──────────────┐          ┌──────────────────┐
            │ VALID (3)    │          │ INVALID (1, 5)   │
            └──────────────┘          └──────────────────┘
                    │                           │
                    │                           │ "You need exactly 3
                    │                           │  cantrips, but you
                    │                           │  selected 1."
                    │                           │
                    │ Update character:         └──────► Retry
                    │ - known_cantrips
                    │ - tutorial_state='needs_spells'
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NEXT TUTORIAL STAGE                               │
│              (Spell Selection or Equipment)                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Tutorial State Machine

```
                     CHARACTER CREATION
                            │
                            │ Spellcasting class?
                            ▼
                    ┌───────────────┐
                    │   Level 0     │
                    │ tutorial_state│
                    │  undefined    │
                    └───────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
     ┌──────────────────┐       ┌──────────────────┐
     │  Spellcaster     │       │  Non-Spellcaster │
     │  (Wizard, Bard)  │       │  (Fighter, Rogue)│
     └──────────────────┘       └──────────────────┘
              │                           │
              │ tutorial_state=           │ tutorial_state=
              │ 'needs_cantrips'          │ 'needs_equipment'
              ▼                           ▼
     ┌──────────────────┐       ┌──────────────────┐
     │  CANTRIP         │       │  EQUIPMENT       │
     │  SELECTION       │       │  SELECTION       │
     │  getTutorial     │       │  (Future)        │
     │  Context()       │       └──────────────────┘
     │  returns prompt  │                 │
     └──────────────────┘                 │
              │                           │
              │ Player selects            │
              │ N cantrips                │
              ▼                           │
     ┌──────────────────┐                │
     │  VALIDATE        │                │
     │  validateCantrip │                │
     │  Selection()     │                │
     └──────────────────┘                │
              │                           │
              │ Valid? Yes                │
              │ tutorial_state=           │
              │ 'needs_spells'            │
              ▼                           │
     ┌──────────────────┐                │
     │  SPELL           │                │
     │  SELECTION       │                │
     │  (for known-     │                │
     │  spell classes)  │                │
     │  OR              │                │
     │  PREPARATION     │                │
     │  EXPLANATION     │                │
     │  (for prepared-  │                │
     │  spell classes)  │                │
     └──────────────────┘                │
              │                           │
              │ Player completes          │
              │ tutorial_state=           │
              │ 'complete'                │
              │                           │
              └─────────────┬─────────────┘
                            │
                            │ Character levels up
                            │ to Level 1
                            ▼
                    ┌───────────────┐
                    │   LEVEL 1     │
                    │   GAMEPLAY    │
                    │   (Normal)    │
                    └───────────────┘
```

## Class-Specific Tutorial Paths

### Wizard (Known Spells)
```
Level 0, needs_cantrips
  ↓
Choose 3 cantrips
  ↓
Level 0, needs_spells
  ↓
Choose 6 Level 1 spells
  ↓
Level 0, complete → Level 1
```

### Bard (Known Spells)
```
Level 0, needs_cantrips
  ↓
Choose 2 cantrips
  ↓
Level 0, needs_spells
  ↓
Choose 4 Level 1 spells
  ↓
Level 0, complete → Level 1
```

### Cleric (Prepared Spells)
```
Level 0, needs_cantrips
  ↓
Choose 3 cantrips
  ↓
Level 0, needs_spells
  ↓
Explanation: "You prepare spells daily"
(No selection needed)
  ↓
Level 0, complete → Level 1
```

### Fighter (Non-Spellcaster)
```
Level 0, needs_equipment
  ↓
Choose starting equipment
  ↓
Level 0, complete → Level 1
```

## Data Flow: Spell List Generation

```
┌─────────────────────────────────────────────────────────────┐
│                   D&D 5e SRD Spell Data                     │
│         /backend/src/data/cantrips.ts                       │
│         /backend/src/data/level1Spells.ts                   │
│                                                             │
│   [                                                         │
│     {                                                       │
│       name: "Fire Bolt",                                    │
│       level: 0,                                             │
│       school: "Evocation",                                  │
│       description: "You hurl a mote of fire...",            │
│       classes: ["Wizard", "Sorcerer"],                      │
│       damageType: "Fire",                                   │
│       ...                                                   │
│     },                                                      │
│     ...                                                     │
│   ]                                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Import
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           tutorialGuidance.ts: CANTRIPS array              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Filter by character.class
                            ▼
┌─────────────────────────────────────────────────────────────┐
│     Available Cantrips for Wizard:                          │
│     - Acid Splash                                           │
│     - Chill Touch                                           │
│     - Fire Bolt                                             │
│     - ...                                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Categorize (COMBAT, UTILITY, etc.)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│     Formatted Tutorial Prompt:                              │
│                                                             │
│     "Your available cantrips:                               │
│                                                             │
│     - **Fire Bolt**: You hurl a mote of fire... (COMBAT)    │
│     - **Mage Hand**: A spectral hand... (UTILITY)          │
│     ..."                                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Return to narratorLLM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Injected into LLM Prompt                   │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Character Creation Flow
```typescript
// When creating a Level 0 spellcaster character
const newCharacter = {
  level: 0,
  class: 'Wizard',
  tutorial_state: 'needs_cantrips', // ← Set this
  // ... other fields
};
```

### 2. DM Chat Endpoint
```typescript
// In /api/characters/:id/chat route
const character = await getCharacter(id);
const response = await generateNarrative(
  character,
  conversationHistory,
  playerMessage,
  actionResult
);
// ← narratorLLM automatically includes tutorial context
```

### 3. Spell Selection Handler (Future)
```typescript
// When player submits spell choices
const validation = validateCantripSelection(
  character.class,
  selectedCantrips
);

if (validation.valid) {
  await updateCharacter(id, {
    known_cantrips: selectedCantrips,
    tutorial_state: 'needs_spells'
  });
}
```

## Example Output

**Input**: Level 0 Wizard with `tutorial_state: 'needs_cantrips'`

**LLM Receives**:
```
CHARACTER SHEET (READ-ONLY):
Character: Gandalf (Human Wizard Level 0)
HP: 8/8
Gold: 15 gp
...

=== TUTORIAL MODE ===
📚 TUTORIAL MODE - Level 0 Wizard

**CANTRIP SELECTION**

As a Wizard, you study the fundamental building blocks of magic...

**Your available cantrips:**
- **Fire Bolt**: You hurl a mote of fire... (COMBAT)
- **Mage Hand**: A spectral hand... (UTILITY)
...

**You must choose exactly 3 cantrips.**

💡 **Tips for beginners:**
- Include at least one combat cantrip
...
=== END TUTORIAL ===
```

**LLM Generates**:
```
Welcome to the Arcane Academy, Gandalf! Before you embark on your journey,
you must master the fundamental cantrips that will serve you throughout
your adventures. I see before you the basic spells of a beginning wizard.

Fire Bolt and Ray of Frost are excellent combat cantrips - reliable damage
when you've exhausted your spell slots. Mage Hand and Prestidigitation
offer clever solutions to everyday problems. Light will guide your way
through dark dungeons.

Which three cantrips call to you? Choose wisely - these will be your
constant companions.
```

## Summary

The tutorial system provides:
- ✅ **Automatic spell list generation** from D&D 5e data
- ✅ **Class-specific guidance** for all spellcasters
- ✅ **Educational content** about game mechanics
- ✅ **Validation** against D&D 5e rules
- ✅ **Seamless integration** with The Chronicler AI
- ✅ **State-based progression** through tutorial stages
