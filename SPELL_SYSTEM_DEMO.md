# D&D 5e Spell System - Complete Demo

This document demonstrates the complete spell system implementation.

## System Components

### 1. Spell Database (`/backend/src/data/`)
- **spellTypes.ts** - TypeScript interfaces for spell data
- **cantrips.ts** - 24 cantrips (level 0 spells)
- **level1Spells.ts** - 49 level 1 spells
- **level2Spells.ts** - 54 level 2 spells
- **level3Spells.ts** - 42 level 3 spells
- **spells.ts** - Main index with utility functions
- **spellSlots.ts** - Spell slot progression tables

### 2. Game Mechanics (`/backend/src/game/`)
- **spellcasting.ts** - All spellcasting rules and calculations

## Complete Gameplay Example

### Character: Elara the Wizard (Level 5)

```typescript
import { getSpellsForClass, getSpellByName } from './data/spells';
import {
  calculateSpellcastingStats,
  canCastSpell,
  rollSpellAttack,
  rollDamage,
  rollConcentrationCheck
} from './game/spellcasting';
import { getSpellSlotsForClass } from './data/spellSlots';

// Character stats
const elara = {
  name: 'Elara',
  class: 'Wizard',
  level: 5,
  abilityScores: {
    strength: 8,
    dexterity: 14,
    constitution: 13,
    intelligence: 16, // Primary stat for Wizard
    wisdom: 12,
    charisma: 10
  }
};

// Calculate spellcasting stats
const stats = calculateSpellcastingStats(
  elara.class,
  elara.level,
  elara.abilityScores
);

console.log('=== Elara the Wizard (Level 5) ===');
console.log('Spellcasting Stats:');
console.log(`  Ability: Intelligence +3`);
console.log(`  Spell Save DC: ${stats.spellSaveDC}`);
console.log(`  Spell Attack Bonus: +${stats.spellAttackBonus}`);
console.log(`  Max Spell Level: ${stats.maxSpellLevel}`);

// Get spell slots
const slots = getSpellSlotsForClass(elara.class, elara.level);
console.log('\nSpell Slots:');
console.log(`  1st Level: ${slots.level1} slots`);
console.log(`  2nd Level: ${slots.level2} slots`);
console.log(`  3rd Level: ${slots.level3} slots`);

// Get available spells
const wizardSpells = getSpellsForClass('Wizard', 3);
console.log(`\nAvailable Spells: ${wizardSpells.length} total`);

// Track current spell slots (would be stored in character state)
const currentSlots = {
  level1: 4,
  level2: 3,
  level3: 2
};

console.log('\n=== COMBAT SCENARIO ===');
console.log('Elara faces three goblins!');

// Round 1: Cast Fireball
const fireball = getSpellByName('Fireball');
if (fireball) {
  console.log(`\nRound 1: Elara casts ${fireball.name}!`);

  const canCast = canCastSpell(
    fireball,
    elara.class,
    elara.level,
    currentSlots
  );

  if (canCast.canCast) {
    console.log(`  Range: ${fireball.range}`);
    console.log(`  Components: ${fireball.components.verbal ? 'V' : ''}${fireball.components.somatic ? 'S' : ''}${fireball.components.material ? 'M' : ''}`);

    if (fireball.savingThrow) {
      console.log(`  Targets must make DC ${stats.spellSaveDC} ${fireball.savingThrow.abilityScore} save`);
      console.log(`  Success: ${fireball.savingThrow.successEffect} damage`);
    }

    // Roll damage (8d6 for Fireball)
    const damage = rollDamage('8d6');
    console.log(`  Damage Roll: ${damage} fire damage`);

    // Consume spell slot
    currentSlots.level3--;
    console.log(`  Spell slots remaining: ${currentSlots.level3} (3rd level)`);
  }
}

// Round 2: Use Fire Bolt cantrip
const fireBolt = getSpellByName('Fire Bolt');
if (fireBolt) {
  console.log(`\nRound 2: Elara casts ${fireBolt.name} (cantrip)!`);
  console.log('  (Cantrips don\'t use spell slots)');

  const attack = rollSpellAttack(stats.spellAttackBonus, 15); // vs AC 15
  console.log(`  Attack Roll: ${attack.roll} + ${stats.spellAttackBonus} = ${attack.total}`);

  if (attack.hit) {
    const damage = rollDamage('1d10'); // Base cantrip damage at level 5
    console.log(`  HIT! Damage: ${damage} fire damage`);
  } else {
    console.log('  MISS!');
  }
}

// Round 3: Cast Shield as reaction
const shield = getSpellByName('Shield');
if (shield) {
  console.log(`\nRound 3: Goblin attacks! Elara casts ${shield.name} as a reaction!`);
  console.log(`  Duration: ${shield.duration}`);
  console.log('  Effect: +5 AC until start of next turn');
  currentSlots.level1--;
  console.log(`  Spell slots remaining: ${currentSlots.level1} (1st level)`);
}

// Check concentration
console.log('\n=== CONCENTRATION CHECK ===');
console.log('Elara is concentrating on Fly...');
console.log('She takes 10 damage from a goblin arrow!');

const constitutionMod = Math.floor((elara.abilityScores.constitution - 10) / 2);
const concentrationCheck = rollConcentrationCheck(constitutionMod, 10);

console.log(`Constitution Save: ${concentrationCheck.roll} + ${constitutionMod} = ${concentrationCheck.total}`);
console.log(`DC: ${concentrationCheck.dc}`);
console.log(`Result: ${concentrationCheck.success ? 'SUCCESS - maintains concentration' : 'FAILED - loses concentration'}`);

console.log('\n=== FINAL SPELL SLOTS ===');
console.log(`1st Level: ${currentSlots.level1}/${slots.level1}`);
console.log(`2nd Level: ${currentSlots.level2}/${slots.level2}`);
console.log(`3rd Level: ${currentSlots.level3}/${slots.level3}`);
```

## Expected Output

```
=== Elara the Wizard (Level 5) ===
Spellcasting Stats:
  Ability: Intelligence +3
  Spell Save DC: 14
  Spell Attack Bonus: +6
  Max Spell Level: 3

Spell Slots:
  1st Level: 4 slots
  2nd Level: 3 slots
  3rd Level: 2 slots

Available Spells: 100 total

=== COMBAT SCENARIO ===
Elara faces three goblins!

Round 1: Elara casts Fireball!
  Range: 150 feet
  Components: VSM
  Targets must make DC 14 DEX save
  Success: half damage
  Damage Roll: 32 fire damage
  Spell slots remaining: 1 (3rd level)

Round 2: Elara casts Fire Bolt (cantrip)!
  (Cantrips don't use spell slots)
  Attack Roll: 15 + 6 = 21
  HIT! Damage: 8 fire damage

Round 3: Goblin attacks! Elara casts Shield as a reaction!
  Duration: 1 round
  Effect: +5 AC until start of next turn
  Spell slots remaining: 3 (1st level)

=== CONCENTRATION CHECK ===
Elara is concentrating on Fly...
She takes 10 damage from a goblin arrow!
Constitution Save: 12 + 1 = 13
DC: 10
Result: SUCCESS - maintains concentration

=== FINAL SPELL SLOTS ===
1st Level: 3/4
2nd Level: 3/3
3rd Level: 1/2
```

## Feature Highlights

### 1. Complete Spell Database
- 169 SRD spells (levels 0-3)
- Full metadata: components, range, duration, concentration
- Damage types and saving throw information
- Class availability

### 2. Accurate 5e Mechanics
- Spell save DC calculation: 8 + proficiency + ability modifier
- Spell attack bonus: proficiency + ability modifier
- Spell slot progression by class type (full/half/pact casters)
- Concentration checks: DC = 10 or half damage taken

### 3. Utility Functions
- Query spells by class, school, or name
- Check if a spell can be cast
- Roll spell attacks and damage
- Handle concentration mechanics

### 4. Class Support
- **Full Casters**: Wizard (100 spells), Sorcerer (72), Cleric (58), Bard (62), Druid (52)
- **Pact Caster**: Warlock (35 spells, unique slot system)
- **Half Casters**: Ranger (31 spells), Paladin (25)

## Integration with Nuaibria

This spell system integrates with:

1. **Character Creation** - Assign starting spells based on class
2. **Combat System** - Resolve spell attacks and saves
3. **AI DM** - Generate spell descriptions and effects
4. **Character Progression** - Learn new spells on level up
5. **Rest System** - Restore spell slots on long rest (short rest for Warlocks)

## Next Steps

To fully integrate spellcasting into Nuaibria:

1. Add spell selection to character creation
2. Create spell list UI in character sheet
3. Implement spell slot tracking in character state
4. Add spell casting actions to combat system
5. Generate spell effect descriptions with AI
6. Track concentration status
7. Implement rest mechanics for slot restoration

## References

- D&D 5e SRD: https://www.dnd5eapi.co
- File: `/srv/nuaibria/SPELLS_IMPORT_SUMMARY.md`
- File: `/srv/nuaibria/CLASS_SPELL_REFERENCE.md`
