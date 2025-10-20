# Spell Slot Progression - Quick Reference

## 🚀 Quick Start

```typescript
import { getSpellcastingInfo, getSpellSlotsForLevel } from './spellSlotProgression';
import { getUpdatedSpellSlots, getSpellSlotLevelUpMessage } from '../services/spellSlotLevelingIntegration';

// Get spell slots for a character
const slots = getSpellSlotsForLevel('Wizard', 5);
// → { level1: 4, level2: 3, level3: 2, ... }

// Get complete casting info
const info = getSpellcastingInfo('Sorcerer', 3);
// → { slots, cantripsKnown, spellsKnown, spellsLearned, newSpellLevel }

// Level up integration (DB format)
const dbSlots = getUpdatedSpellSlots('Wizard', 5);
// → { "1": 4, "2": 3, "3": 2 }

// Generate player message
const message = getSpellSlotLevelUpMessage('Wizard', 4, 5);
// → "You unlock 2 3rd-level spell slots!"
```

## 📊 Class Spell Level Caps

| Class Type | Start Level | Max Spell Level |
|------------|-------------|-----------------|
| Full Caster | 1 | 9th |
| Half Caster | 2 | 5th |
| Third Caster | 3 | 4th |
| Warlock | 1 | 5th (Pact Magic) |

## 🎯 Common Use Cases

### Character Creation
```typescript
const slots = getUpdatedSpellSlots(characterClass, 1);
const info = getSpellcastingInfo(characterClass, 1);

// Save slots to database
await supabase.from('characters').insert({
  ...characterData,
  spell_slots: slots
});
```

### Level Up
```typescript
const selection = needsSpellSelection(characterClass, newLevel);
if (selection.needsSelection) {
  // Show spell selection UI
  console.log(`Select ${selection.cantripsNeeded} cantrips`);
  console.log(`Select ${selection.spellsNeeded} spells`);
  console.log(`New spell level: ${selection.newSpellLevel}`);
}
```

### Check Spellcasting Ability
```typescript
const ability = getSpellcastingAbility('Wizard'); // 'INT'
const modifier = Math.floor((abilityScores[ability] - 10) / 2);
const spellDC = 8 + proficiencyBonus + modifier;
```

## 🔍 Function Reference

| Function | Returns | Use Case |
|----------|---------|----------|
| `getSpellSlotsForLevel(class, lvl)` | `SpellSlots \| WarlockSlots \| null` | Get spell slots for display |
| `getSpellcastingInfo(class, lvl)` | `SpellcastingInfo \| null` | Get complete casting details |
| `getUpdatedSpellSlots(class, lvl)` | `Record<string, number> \| null` | Save to database |
| `getSpellSlotLevelUpMessage(class, old, new)` | `string \| null` | Display to player |
| `needsSpellSelection(class, lvl)` | `object` | Show selection UI |
| `getNewSpellsLearnedCount(class, lvl)` | `number` | Count new spells |
| `getNewCantripsCount(class, lvl)` | `number` | Count new cantrips |
| `getSpellLevelUnlocked(class, lvl)` | `number \| null` | Check unlocks |
| `getSpellcastingAbility(class)` | `'INT' \| 'WIS' \| 'CHA' \| null` | Calculate DC/bonus |
| `isSpellcaster(class)` | `boolean` | Check if caster |

## 🎓 Class Details

### Full Casters (1-20)
**Bard, Cleric, Druid, Sorcerer, Wizard**
- Start: Level 1, 2 slots
- Cantrips: 2-6 (varies by class)
- Max: 9th-level spells (level 17)

**Spells Known:**
- Bard, Sorcerer: Limited (use `spellsKnown`)
- Cleric, Druid, Wizard: Prepare from list (no `spellsKnown`)

### Half Casters (2-20)
**Paladin, Ranger**
- Start: Level 2, 2 slots
- Cantrips: None (usually)
- Max: 5th-level spells (level 17)
- Prepare spells (no `spellsKnown`)

### Third Casters (3-20)
**Eldritch Knight, Arcane Trickster**
- Start: Level 3, 2 slots
- Cantrips: 2-4
- Max: 4th-level spells (level 19)
- Limited spells known

### Warlock (1-20)
**Pact Magic (Unique)**
- Start: Level 1, 1 slot
- All slots same level (upgrades with level)
- Max: 4 slots of 5th-level (level 17)
- Short rest recovery

## 🔢 Key Level Milestones

| Level | Full Caster | Half Caster | Third Caster | Warlock |
|-------|-------------|-------------|--------------|---------|
| 1 | 2×1st | - | - | 1×1st |
| 2 | 3×1st | 2×1st | - | 2×1st |
| 3 | 4×1st, 2×2nd | 3×1st | 2×1st | 2×2nd |
| 5 | 4×1st, 3×2nd, 2×3rd | 4×1st, 2×2nd | 3×1st | 2×3rd |
| 9 | +1×5th | 4×1st, 3×2nd, 2×3rd | 4×1st, 2×2nd | 2×5th |
| 11 | +1×6th | 4×1st, 3×2nd, 3×3rd | 4×1st, 3×2nd | **3×5th** |
| 17 | **+1×9th** | **+1×5th** | 4×1st, 3×2nd, 3×3rd, 3×4th | **4×5th** |
| 19 | 4/3/3/3/3/2/1/1/1 | 4×1st-5th (max) | **+1×4th** | 4×5th |
| 20 | +1×5th, +1×7th | +1×5th | 4/3/3/1 (max) | 4×5th |

## ⚡ Database Format

### Standard Caster
```json
{
  "1": 4,
  "2": 3,
  "3": 2
}
```

### Warlock (Pact Magic)
```json
{
  "3": 2,
  "pact_magic": 1
}
```

## 🧪 Testing

```bash
npm test -- spellSlotProgression.test.ts        # 50 tests
npm test -- spellSlotLevelingIntegration.test.ts  # 29 tests
```

## 📚 Full Documentation

- **Usage Guide**: `SPELL_SLOT_PROGRESSION_README.md`
- **Examples**: `../examples/spellSlotLevelingExample.ts`
- **Implementation**: `/SPELL_SLOT_IMPLEMENTATION_SUMMARY.md`

---

*Updated: 2025-10-20*
