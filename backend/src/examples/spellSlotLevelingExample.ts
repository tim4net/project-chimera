/**
 * @file Spell Slot Leveling Example
 *
 * Demonstrates how to integrate spell slot progression into the leveling system.
 * This example shows how to modify the existing checkAndProcessLevelUp function.
 */

import {
  getUpdatedSpellSlots,
  getSpellSlotLevelUpMessage,
  needsSpellSelection,
} from '../services/spellSlotLevelingIntegration';
import { getSpellcastingInfo } from '../data/spellSlotProgression';

/**
 * EXAMPLE: Enhanced level-up processing with spell slot updates
 *
 * This function demonstrates how to integrate spell slot progression
 * into the existing levelingSystem.ts checkAndProcessLevelUp function.
 */
export async function exampleEnhancedLevelUp(
  characterClass: string,
  oldLevel: number,
  newLevel: number
): Promise<{
  spellSlots?: Record<string, number>;
  spellMessage?: string;
  requiresSpellSelection?: boolean;
  spellSelectionInfo?: {
    cantripsNeeded: number;
    spellsNeeded: number;
    newSpellLevel?: number;
  };
}> {
  // 1. Get updated spell slots
  const newSpellSlots = getUpdatedSpellSlots(characterClass, newLevel);

  // 2. Generate player-friendly message
  const spellMessage = getSpellSlotLevelUpMessage(characterClass, oldLevel, newLevel);

  // 3. Check if spell selection UI is needed
  const selection = needsSpellSelection(characterClass, newLevel);

  return {
    spellSlots: newSpellSlots || undefined,
    spellMessage: spellMessage || undefined,
    requiresSpellSelection: selection.needsSelection,
    spellSelectionInfo: selection.needsSelection ? {
      cantripsNeeded: selection.cantripsNeeded,
      spellsNeeded: selection.spellsNeeded,
      newSpellLevel: selection.newSpellLevel,
    } : undefined,
  };
}

/**
 * EXAMPLE: Integration snippet for levelingSystem.ts
 *
 * Add this code to the checkAndProcessLevelUp function in levelingSystem.ts
 * after calculating HP and proficiency bonus updates.
 */
export function exampleLevelingSystemIntegration() {
  return `
  // --- ADD THIS CODE TO levelingSystem.ts checkAndProcessLevelUp ---

  import {
    getUpdatedSpellSlots,
    getSpellSlotLevelUpMessage,
    needsSpellSelection,
  } from './spellSlotLevelingIntegration';

  // ... existing level up code (HP, proficiency, etc.) ...

  // Update spell slots if character is a spellcaster
  const newSpellSlots = getUpdatedSpellSlots(typedCharacter.class, newLevel);
  const spellMessage = getSpellSlotLevelUpMessage(typedCharacter.class, currentLevel, newLevel);
  const spellSelection = needsSpellSelection(typedCharacter.class, newLevel);

  // Build update object
  const updateData: Partial<CharacterRecord> = {
    level: newLevel,
    hp_max: newHPMax,
    hp_current: newHPCurrent,
    proficiency_bonus: newProficiencyBonus,
  };

  // Add spell slots if character is spellcaster
  if (newSpellSlots) {
    updateData.spell_slots = newSpellSlots;
  }

  // Update character in database
  const { data: updatedCharacter, error: updateError } = await supabaseServiceClient
    .from('characters')
    .update(updateData)
    .eq('id', characterId)
    .select()
    .single();

  // ... existing subclass and journal entry code ...

  // Append spell slot message to journal content
  if (spellMessage) {
    journalContent += \`\\n\\n\${spellMessage}\`;
  }

  if (spellSelection.needsSelection) {
    journalContent += \`\\n\\n⚠️ You must select new spells/cantrips!\`;
  }

  // ... rest of existing code ...

  return {
    leveledUp: true,
    newLevel,
    hpGained: hpGain,
    message,
    subclassFeatures,
    requiresSubclassSelection: needsSelection,
    availableSubclasses: needsSelection ? getAvailableSubclasses(updatedTypedCharacter.class) : [],
    // ADD THESE NEW FIELDS:
    spellSlotsUpdated: !!newSpellSlots,
    spellMessage: spellMessage || undefined,
    requiresSpellSelection: spellSelection.needsSelection,
    spellSelectionInfo: spellSelection.needsSelection ? {
      cantripsNeeded: spellSelection.cantripsNeeded,
      spellsNeeded: spellSelection.spellsNeeded,
      newSpellLevel: spellSelection.newSpellLevel,
    } : undefined,
  };
  `;
}

/**
 * EXAMPLE USE CASES
 */

// Example 1: Wizard leveling from 1 to 2
async function example1_WizardLevelUp() {
  console.log('=== Example 1: Wizard Level 1 → 2 ===');
  const result = await exampleEnhancedLevelUp('Wizard', 1, 2);
  console.log('Spell Slots:', result.spellSlots);
  // { "1": 3 }
  console.log('Message:', result.spellMessage);
  // "You gain 1 additional 1st-level spell slot!"
  console.log('Requires Selection:', result.requiresSpellSelection);
  // false (Wizard doesn't learn spells on level up)
  console.log('');
}

// Example 2: Sorcerer leveling from 2 to 3 (learns new spell + unlocks 2nd level)
async function example2_SorcererLevelUp() {
  console.log('=== Example 2: Sorcerer Level 2 → 3 ===');
  const result = await exampleEnhancedLevelUp('Sorcerer', 2, 3);
  console.log('Spell Slots:', result.spellSlots);
  // { "1": 4, "2": 2 }
  console.log('Message:', result.spellMessage);
  // "You unlock 2 2nd-level spell slots! You can learn 1 new spell!"
  console.log('Requires Selection:', result.requiresSpellSelection);
  // true
  console.log('Selection Info:', result.spellSelectionInfo);
  // { cantripsNeeded: 0, spellsNeeded: 1, newSpellLevel: 2 }
  console.log('');
}

// Example 3: Paladin gaining spellcasting at level 2
async function example3_PaladinGainsSpells() {
  console.log('=== Example 3: Paladin Level 1 → 2 ===');
  const result = await exampleEnhancedLevelUp('Paladin', 1, 2);
  console.log('Spell Slots:', result.spellSlots);
  // { "1": 2 }
  console.log('Message:', result.spellMessage);
  // "You gain the ability to cast spells! You unlock 2 1st-level spell slots!"
  console.log('Requires Selection:', result.requiresSpellSelection);
  // false (Paladin prepares spells)
  console.log('');
}

// Example 4: Warlock leveling (Pact Magic upgrade)
async function example4_WarlockPactMagic() {
  console.log('=== Example 4: Warlock Level 2 → 3 ===');
  const result = await exampleEnhancedLevelUp('Warlock', 2, 3);
  console.log('Spell Slots:', result.spellSlots);
  // { "2": 2, "pact_magic": 1 }
  console.log('Message:', result.spellMessage);
  // "Your spell slots upgrade to 2nd level! You can learn 1 new spell!"
  console.log('Requires Selection:', result.requiresSpellSelection);
  // true
  console.log('Selection Info:', result.spellSelectionInfo);
  // { cantripsNeeded: 0, spellsNeeded: 1, newSpellLevel: 2 }
  console.log('');
}

// Example 5: Bard gaining new cantrip at level 4
async function example5_BardNewCantrip() {
  console.log('=== Example 5: Bard Level 3 → 4 ===');
  const result = await exampleEnhancedLevelUp('Bard', 3, 4);
  console.log('Spell Slots:', result.spellSlots);
  // { "1": 4, "2": 3 }
  console.log('Message:', result.spellMessage);
  // "You gain 1 additional 2nd-level spell slot! You can learn 1 new cantrip! You can learn 1 new spell!"
  console.log('Requires Selection:', result.requiresSpellSelection);
  // true
  console.log('Selection Info:', result.spellSelectionInfo);
  // { cantripsNeeded: 1, spellsNeeded: 1, newSpellLevel: undefined }
  console.log('');
}

// Example 6: Getting full spellcasting info for UI display
function example6_DisplaySpellcastingInfo() {
  console.log('=== Example 6: Display Wizard Level 5 Info ===');
  const info = getSpellcastingInfo('Wizard', 5);
  console.log('Full Info:', JSON.stringify(info, null, 2));
  // {
  //   "slots": { "level1": 4, "level2": 3, "level3": 2, ... },
  //   "cantripsKnown": 4,
  //   "newSpellLevel": 3
  // }
  console.log('');
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('\n====================================');
  console.log('SPELL SLOT PROGRESSION EXAMPLES');
  console.log('====================================\n');

  await example1_WizardLevelUp();
  await example2_SorcererLevelUp();
  await example3_PaladinGainsSpells();
  await example4_WarlockPactMagic();
  await example5_BardNewCantrip();
  example6_DisplaySpellcastingInfo();

  console.log('====================================');
  console.log('Integration Code Snippet:');
  console.log('====================================');
  console.log(exampleLevelingSystemIntegration());
}

// Uncomment to run examples:
// runAllExamples();
