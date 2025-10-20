# Spell Selection Detector - Quick Reference

## Import
```typescript
import {
  detectSpellSelection,
  detectCantripSelection,
  detectLeveledSpellSelection,
  isValidCantrip,
  isValidLevel1Spell,
  getOfficialSpellName,
  getCantripsForClass,
  getLevel1SpellsForClass,
} from './services/spellSelectionDetector';
```

## Basic Usage

### Detect Any Spell Selection
```typescript
const action = detectSpellSelection("I choose Vicious Mockery", characterId);
// Returns: { type: 'SELECT_CANTRIPS', spellNames: ['Vicious Mockery'], ... }
```

### Detect Only Cantrips
```typescript
const action = detectCantripSelection("I pick Light and Mage Hand", characterId);
// Returns: { type: 'SELECT_CANTRIPS', spellNames: ['Light', 'Mage Hand'], ... }
```

### Detect Only Leveled Spells
```typescript
const action = detectLeveledSpellSelection("Healing Word and Charm Person", characterId);
// Returns: { type: 'SELECT_SPELLS', spellNames: ['Healing Word', 'Charm Person'], ... }
```

## Validation

### Check if Valid Spell
```typescript
isValidCantrip('Vicious Mockery')  // true
isValidCantrip('Healing Word')     // false (it's level 1)

isValidLevel1Spell('Healing Word') // true
isValidLevel1Spell('Vicious Mockery') // false (it's a cantrip)
```

### Get Official Name
```typescript
getOfficialSpellName('vicious mockery', 0) // 'Vicious Mockery'
getOfficialSpellName('magehand', 0)        // 'Mage Hand'
getOfficialSpellName('Not A Spell', 0)     // null
```

## Class Filtering

### Get Bard Spells
```typescript
const bardCantrips = getCantripsForClass('Bard');
// ['Dancing Lights', 'Light', 'Mage Hand', 'Mending', 'Message', ...]

const bardSpells = getLevel1SpellsForClass('Bard');
// ['Animal Friendship', 'Bane', 'Charm Person', 'Cure Wounds', ...]
```

## Supported Patterns

| Pattern | Example | Detected |
|---------|---------|----------|
| Simple selection | "I choose Light" | ✅ |
| Multiple (and) | "Light and Mage Hand" | ✅ |
| Multiple (comma) | "Light, Mage Hand, and Message" | ✅ |
| Explicit type | "For my cantrips: Light" | ✅ |
| Case insensitive | "vicious mockery" | ✅ (→ "Vicious Mockery") |
| Spacing variants | "magehand" | ✅ (→ "Mage Hand") |

## Common Patterns

```typescript
// ✅ These will detect
"I choose Vicious Mockery"
"I pick Light and Mage Hand"
"I'll take Healing Word"
"For my cantrips, I want Message"
"My level 1 spells are Cure Wounds and Charm Person"

// ❌ These won't detect (no selection verb)
"Tell me about Vicious Mockery"
"What does Light do?"
"Vicious Mockery" (just the name)
```

## Integration Example

```typescript
import { detectIntent } from './services/intentDetector';
import { getCantripsForClass } from './services/spellSelectionDetector';

// Player message
const result = detectIntent("I choose Vicious Mockery and Light", {
  characterId: 'char_123',
  character: bardCharacter,
  inCombat: false,
});

if (result.actions[0]?.type === 'SELECT_CANTRIPS') {
  const { spellNames } = result.actions[0];

  // Validate against class spell list
  const bardCantrips = getCantripsForClass('Bard');
  const allValid = spellNames.every(spell => bardCantrips.includes(spell));

  if (allValid) {
    // Apply to character
    await updateCharacterSpells(characterId, spellNames);
  } else {
    // Ask for clarification
    const invalid = spellNames.filter(s => !bardCantrips.includes(s));
    return `These aren't Bard cantrips: ${invalid.join(', ')}`;
  }
}
```

## Action Types

```typescript
interface SelectCantripsAction {
  type: 'SELECT_CANTRIPS';
  actionId: string;      // UUID
  actorId: string;       // Character ID
  timestamp: number;     // Unix timestamp
  spellNames: string[];  // ['Vicious Mockery', 'Light']
}

interface SelectSpellsAction {
  type: 'SELECT_SPELLS';
  actionId: string;
  actorId: string;
  timestamp: number;
  spellNames: string[];  // ['Healing Word', 'Charm Person']
}
```

## Return Values

| Function | Returns | On No Match |
|----------|---------|-------------|
| `detectSpellSelection` | `SelectCantripsAction \| SelectSpellsAction \| null` | `null` |
| `detectCantripSelection` | `SelectCantripsAction \| null` | `null` |
| `detectLeveledSpellSelection` | `SelectSpellsAction \| null` | `null` |
| `isValidCantrip` | `boolean` | `false` |
| `isValidLevel1Spell` | `boolean` | `false` |
| `getOfficialSpellName` | `string \| null` | `null` |
| `getCantripsForClass` | `string[]` | `[]` (empty array) |
| `getLevel1SpellsForClass` | `string[]` | `[]` (empty array) |

## Test Coverage

52 tests covering:
- ✅ Single spell detection
- ✅ Multiple spell detection
- ✅ Cantrip vs spell differentiation
- ✅ 12 natural language patterns
- ✅ Validation helpers
- ✅ Class-specific filtering
- ✅ Edge cases & security

Run tests:
```bash
cd /srv/nuaibria/backend
npm test -- spellSelectionDetector.test.ts
```
