# Tutorial Guidance System Implementation Summary

## Overview

Successfully implemented a comprehensive tutorial guidance system for Level 0 spellcaster onboarding in Nuaibria. The system guides new players through spell selection in an educational, immersive way through The Chronicler (AI DM).

## Files Created/Modified

### 1. `/srv/nuaibria/backend/src/services/tutorialGuidance.ts` (NEW)
**Purpose**: Core tutorial guidance service that generates spell selection prompts.

**Key Functions**:
- `getTutorialContext(character)`: Main entry point - returns tutorial prompt based on character's tutorial_state
- `validateCantripSelection(class, cantrips)`: Validates cantrip selection against D&D 5e rules
- `validateSpellSelection(class, spells)`: Validates spell selection against D&D 5e rules
- `getStartingSpellInfo(class)`: Returns starting spell counts for any class

**Features**:
- Automatic spell list generation from D&D 5e SRD data
- Class-specific guidance (Wizard, Bard, Sorcerer, Cleric, Druid, Warlock)
- Spell categorization (COMBAT, HEALING, DEFENSE, SOCIAL, UTILITY)
- Beginner-friendly descriptions
- Educational content about cantrips vs. spells, spell slots, and preparation
- Handles both "known spells" classes and "prepared spells" classes

**Starting Spell Counts** (per D&D 5e):
```typescript
Bard:     2 cantrips, 4 spells
Cleric:   3 cantrips, prepares spells daily
Druid:    2 cantrips, prepares spells daily
Sorcerer: 4 cantrips, 2 spells
Warlock:  2 cantrips, 2 spells
Wizard:   3 cantrips, 6 spells
```

### 2. `/srv/nuaibria/backend/src/services/narratorLLM.ts` (MODIFIED)
**Changes Made**:
- Added import for `getTutorialContext` from tutorialGuidance service
- Updated `buildNarrativePrompt()` to include tutorial context
- Modified system prompt to handle Tutorial Mode
- Tutorial content is injected between `=== TUTORIAL MODE ===` markers

**Integration Flow**:
1. Character sends message to AI DM
2. `narratorLLM.ts` calls `getTutorialContext(character)`
3. If character is Level 0 with tutorial_state set, full spell list is included
4. The Chronicler receives tutorial context in the prompt
5. The Chronicler presents spell lists and guides the player

### 3. `/srv/nuaibria/backend/src/services/__tests__/tutorialGuidance.test.ts` (NEW)
**Purpose**: Comprehensive test suite for tutorial system.

**Test Coverage** (20 tests, all passing):
- Tutorial context generation for all spellcasting classes
- Cantrip validation (correct count, invalid spells, wrong class)
- Spell validation (correct count, prepare vs. know spells)
- Starting spell info retrieval
- Edge cases (non-spellcasters, Level 1+ characters, completed tutorials)

### 4. `/srv/nuaibria/backend/src/examples/tutorialDemo.ts` (NEW)
**Purpose**: Interactive demo showing tutorial prompts for different classes.

**Demonstrates**:
- Wizard cantrip selection (3 cantrips)
- Bard cantrip selection (2 cantrips)
- Sorcerer spell selection (2 spells)
- Cleric spell preparation explanation
- Validation examples

## Tutorial State Flow

The `tutorial_state` field on CharacterRecord controls the tutorial progression:

```typescript
export type TutorialState = 'complete' | 'needs_cantrips' | 'needs_spells';
```

**Progression**:
1. **Level 0 + 'needs_cantrips'**: Display cantrip selection prompt
2. **Level 0 + 'needs_spells'**: Display spell selection prompt
3. **Level 0 + 'complete'**: No tutorial, normal gameplay
4. **Level 1+**: Tutorial system is bypassed (empty string returned)

## Example Tutorial Prompt (Wizard - Cantrips)

```
📚 TUTORIAL MODE - Level 0 Wizard

**CANTRIP SELECTION**

As a Wizard, you study the fundamental building blocks of magic.
Cantrips are simple spells you've mastered completely - you can cast
them as often as you like without exhausting your magical reserves.

**What are cantrips?**
Cantrips are Level 0 spells. Unlike higher-level spells that consume
spell slots, you can cast cantrips unlimited times.

**Your available cantrips:**

- **Fire Bolt**: You hurl a mote of fire at a creature or object. (COMBAT)
- **Mage Hand**: A spectral, floating hand appears at a point. (UTILITY)
- **Prestidigitation**: Minor magical trick for practice. (UTILITY)
[... more cantrips ...]

**You must choose exactly 3 cantrips.**

💡 **Tips for beginners:**
- Include at least one combat cantrip
- Utility cantrips solve problems creatively
- You'll gain more cantrips as you level up

**Please tell me which 3 cantrips you'd like to learn.**
```

## Integration with Chronicler AI

The tutorial system integrates seamlessly with the existing narrative system:

### System Prompt Enhancement
The Chronicler's system prompt now includes:
```
**TUTORIAL MODE (Level 0 Characters):**
- If you see "=== TUTORIAL MODE ===" in the character sheet,
  the player is learning their spellcasting class
- Present the tutorial information EXACTLY as written
- Be encouraging and patient - this is their first time
- If they select wrong number of spells, gently remind them
- Keep your tone friendly and educational
```

### Prompt Injection
```typescript
// In buildNarrativePrompt():
const tutorialContext = getTutorialContext(character);

const characterSheet = `
  [... character data ...]

  ${tutorialContext ?
    `\n=== TUTORIAL MODE ===\n${tutorialContext}\n=== END TUTORIAL ===\n`
    : ''}
`;
```

## Validation API

The tutorial system provides validation functions that can be called by the rule engine or backend routes:

```typescript
// Validate cantrip selection
const result = validateCantripSelection('Wizard', [
  'Fire Bolt',
  'Mage Hand',
  'Prestidigitation'
]);

if (!result.valid) {
  console.error(result.message);
  // "You need to select exactly 3 cantrips, but you selected 2."
}

// Validate spell selection
const result2 = validateSpellSelection('Sorcerer', [
  'Magic Missile',
  'Shield'
]);

if (result2.valid) {
  // Apply spells to character
}
```

## Educational Design Principles

### 1. **Contextual Learning**
- Explains what cantrips are before listing them
- Clarifies spell slots and spell preparation
- Uses class-specific flavor text

### 2. **Strategic Guidance**
- Recommends balancing combat and utility
- Explains spell categories (COMBAT, UTILITY, etc.)
- Gives beginner tips without being prescriptive

### 3. **Immersive Tone**
- Written in second person ("Your magical training...")
- Uses emoji sparingly for visual structure
- Maintains fantasy RPG atmosphere

### 4. **Flexible System**
- Handles "known spells" classes (Wizard, Bard, Sorcerer, Warlock)
- Handles "prepared spells" classes (Cleric, Druid)
- Explains differences naturally

## Future Enhancements (Not Yet Implemented)

### 1. Equipment Selection Tutorial
Add `'needs_equipment'` tutorial state for non-spellcasters:
```typescript
case 'needs_equipment':
  return buildEquipmentSelectionPrompt(character.class);
```

### 2. Spell Storage on Character
Currently, selected cantrips/spells need a storage field:
```typescript
// Add to CharacterRecord:
known_cantrips?: string[];
known_spells?: string[];
```

### 3. Subclass-Specific Spell Lists
Expand to handle subclass spell lists (e.g., Eldritch Knight's limited wizard spells).

### 4. Multi-Turn Tutorial Conversations
Track intermediate state (player said "Fire Bolt" but hasn't finished selecting).

## Testing Results

All 20 tests pass successfully:
```
✓ getTutorialContext returns empty for Level 1+ characters
✓ Cantrip validation enforces exact counts
✓ Spell validation checks class availability
✓ Prepared-spell classes handled correctly
✓ Invalid spell names rejected
```

Run tests:
```bash
cd /srv/nuaibria/backend
npm test -- tutorialGuidance.test.ts
```

Run demo:
```bash
cd /srv/nuaibria/backend
npx ts-node src/examples/tutorialDemo.ts
```

## Database Schema Note

The `tutorial_state` field already exists in the CharacterRecord type:
```typescript
tutorial_state?: TutorialState; // Tutorial progression for spellcasters
```

Ensure your Supabase `characters` table includes this column:
```sql
ALTER TABLE characters
ADD COLUMN tutorial_state TEXT
CHECK (tutorial_state IN ('complete', 'needs_cantrips', 'needs_spells'));
```

## Conclusion

The tutorial guidance system is **fully functional** and integrated with the AI DM narrative system. It provides:

- ✅ Educational, immersive spell selection prompts
- ✅ Automatic spell list generation from D&D 5e data
- ✅ Validation against game rules
- ✅ Seamless integration with The Chronicler
- ✅ Class-specific guidance for all spellcasting classes
- ✅ Comprehensive test coverage

Players at Level 0 will now receive engaging, educational guidance when choosing their starting spells!
