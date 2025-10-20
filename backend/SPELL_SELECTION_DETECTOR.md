# Spell Selection Detector

## Overview

The Spell Selection Detector is a natural language processing service that parses player spell selections during character creation (specifically for the Level 0 tutorial system where new Bard characters must select their starting spells).

## Files Created

1. **`/srv/nuaibria/backend/src/services/spellSelectionDetector.ts`** (273 lines)
   - Main service implementation
   - Exports detection functions and validation helpers

2. **`/srv/nuaibria/backend/src/__tests__/services/spellSelectionDetector.test.ts`** (445 lines)
   - Comprehensive test suite (52 tests, all passing)
   - Tests patterns, edge cases, validation, and security

## Files Modified

1. **`/srv/nuaibria/backend/src/types/actions.ts`**
   - Added `SelectCantripsAction` interface
   - Added `SelectSpellsAction` interface
   - Added both to `ActionSpec` union type

2. **`/srv/nuaibria/backend/src/services/intentDetector.ts`**
   - Imported `detectSpellSelection`
   - Added spell selection detection as PRIORITY 2 in detection chain
   - Integrated into main `detectIntent` function

## Functionality

### Core Detection Functions

#### `detectCantripSelection(text: string, actorId: string): SelectCantripsAction | null`
Detects when a player is selecting cantrips (level 0 spells).

**Examples:**
- "I choose Vicious Mockery" → `{ type: 'SELECT_CANTRIPS', spellNames: ['Vicious Mockery'] }`
- "I pick Mage Hand and Minor Illusion" → `{ type: 'SELECT_CANTRIPS', spellNames: ['Mage Hand', 'Minor Illusion'] }`

#### `detectLeveledSpellSelection(text: string, actorId: string): SelectSpellsAction | null`
Detects when a player is selecting leveled spells (level 1+).

**Examples:**
- "I'll take Healing Word" → `{ type: 'SELECT_SPELLS', spellNames: ['Healing Word'] }`
- "Charm Person, Sleep, and Thunderwave" → `{ type: 'SELECT_SPELLS', spellNames: ['Charm Person', 'Sleep', 'Thunderwave'] }`

#### `detectSpellSelection(text: string, actorId: string): SelectCantripsAction | SelectSpellsAction | null`
Unified function that tries cantrip detection first, then leveled spell detection.

### Validation Helpers

#### `isValidCantrip(spellName: string): boolean`
Checks if a spell name is a valid cantrip.

#### `isValidLevel1Spell(spellName: string): boolean`
Checks if a spell name is a valid level 1 spell.

#### `getOfficialSpellName(userInput: string, spellLevel: 0 | 1): string | null`
Returns the official spell name for a user-provided name (handles case, spacing variations).

#### `getCantripsForClass(className: string): string[]`
Returns all cantrips available to a specific class.

#### `getLevel1SpellsForClass(className: string): string[]`
Returns all level 1 spells available to a specific class.

## Natural Language Patterns Supported

### Selection Verbs
- "I choose X"
- "I pick X"
- "I select X"
- "I take X"
- "I want X"
- "I'll take X"
- "I'd like X"
- "I learn X"
- "I get X"

### Multiple Spell Selection
- "X and Y" → 2 spells
- "X, Y, and Z" → 3 spells
- "X and Y and Z" → 3 spells

### Explicit Type Mentions
- "For my cantrips: X"
- "My level 1 spells are X and Y"
- "I choose X for cantrips"

### Case Variations
- Handles case-insensitive input: "vicious mockery" → "Vicious Mockery"
- Normalizes spacing: "magehand" → "Mage Hand"

## Security Features

1. **Unicode Normalization**: Prevents homoglyph attacks
2. **Spell Validation**: Only returns officially recognized spell names
3. **Duplicate Prevention**: Automatically deduplicates repeated spell selections
4. **Prompt Injection Protection**: Ignores non-spell text in extraction

## Integration with Intent Detector

The spell selection detector is integrated into the main intent detector as **PRIORITY 2** (after social claims, before combat). This ensures spell selections are detected early in the parsing chain.

```typescript
// In intentDetector.ts
for (const part of parts) {
  let action: ActionSpec | null = null;

  // PRIORITY 1: Social claims
  action = detectSocialClaim(part, context.characterId);
  if (action) { actions.push(action); continue; }

  // PRIORITY 2: Spell selection (NEW!)
  action = detectSpellSelection(part, context.characterId);
  if (action) { actions.push(action); continue; }

  // PRIORITY 3+: Combat, skills, travel, etc.
  // ...
}
```

## Test Coverage

52 comprehensive tests covering:
- ✅ Single and multiple spell detection
- ✅ Cantrip vs leveled spell differentiation
- ✅ 12 natural language pattern variations
- ✅ Validation helpers
- ✅ Class-specific spell lists
- ✅ Edge cases (empty strings, invalid names, Unicode)
- ✅ Security (prompt injection prevention)

All tests passing.

## Usage Example

```typescript
import { detectSpellSelection } from './services/spellSelectionDetector';

// In DM chat handler
const playerMessage = "I choose Vicious Mockery and Mage Hand for my cantrips";
const action = detectSpellSelection(playerMessage, characterId);

if (action?.type === 'SELECT_CANTRIPS') {
  console.log('Player selected cantrips:', action.spellNames);
  // ['Vicious Mockery', 'Mage Hand']

  // Validate against Bard spell list
  const bardCantrips = getCantripsForClass('Bard');
  const valid = action.spellNames.every(spell => bardCantrips.includes(spell));

  if (valid) {
    // Apply selections to character
  } else {
    // Ask DM to clarify invalid selections
  }
}
```

## Future Enhancements

1. **Higher-Level Spell Detection**: Currently only handles level 0 and level 1. Could be extended for levels 2-9.
2. **Spell Swapping**: Detect when players want to replace known spells.
3. **Spell Preparation**: For prepared caster classes (Wizard, Cleric), detect daily preparation choices.
4. **Subclass Spell Lists**: Handle subclass-specific spell additions (e.g., College of Lore's Magical Secrets).
5. **Fuzzy Matching**: Use Levenshtein distance for misspelled spell names.
6. **Spell Description Queries**: Detect when players are asking about spells vs. selecting them.

## Implementation Notes

- Uses pre-built spell name maps for O(1) lookup performance
- Normalizes apostrophes, whitespace, and case for robust matching
- Returns `null` when no valid spells detected (allows DM to ask for clarification)
- Fully type-safe with TypeScript interfaces
- Follows existing codebase patterns (similar to `socialClaimDetector.ts`)

## Action Types

```typescript
export interface SelectCantripsAction extends BaseActionSpec {
  type: 'SELECT_CANTRIPS';
  spellNames: string[]; // Parsed from player message (official spell names)
}

export interface SelectSpellsAction extends BaseActionSpec {
  type: 'SELECT_SPELLS';
  spellNames: string[]; // Parsed from player message (official spell names)
}
```

Both actions extend `BaseActionSpec` which provides:
- `actionId: string` - Unique UUID for idempotency
- `actorId: string` - Character performing the action
- `timestamp: number` - When action was initiated

## Dependencies

- `uuid`: For generating unique action IDs
- `../data/cantrips`: Official D&D 5e SRD cantrip data
- `../data/level1Spells`: Official D&D 5e SRD level 1 spell data
- `../data/spellTypes`: Spell type definitions

## Conclusion

The Spell Selection Detector provides robust, secure, and user-friendly natural language parsing for spell selection during character creation. It handles a wide variety of input patterns while maintaining strict validation against official spell lists, making it perfect for the Level 0 tutorial system where players converse with an AI DM to build their character.
