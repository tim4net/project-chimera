/**
 * Tutorial Guidance System for Level 0 Spellcaster Onboarding
 *
 * Provides educational, immersive guidance for spell selection during character creation.
 * The Chronicler (AI DM) uses these prompts to teach new players about their spellcasting class.
 */

import type { CharacterRecord } from '../types';
import { CANTRIPS, LEVEL_1_SPELLS } from '../data/spells';
import type { Spell } from '../data/spellTypes';

/**
 * Starting cantrip counts by class (D&D 5e standard)
 */
const STARTING_CANTRIPS: Record<string, number> = {
  'Bard': 2,
  'Cleric': 3,
  'Druid': 2,
  'Sorcerer': 4,
  'Warlock': 2,
  'Wizard': 3,
};

/**
 * Starting level-1 spell counts by class (D&D 5e standard)
 */
const STARTING_SPELLS: Record<string, number> = {
  'Bard': 4,
  'Cleric': 0, // Clerics prepare spells
  'Druid': 0,  // Druids prepare spells
  'Sorcerer': 2,
  'Warlock': 2,
  'Wizard': 6,
};

/**
 * Categorize spells by their primary use
 */
function categorizeSpell(spell: Spell): string {
  const desc = spell.description.toLowerCase();
  const name = spell.name.toLowerCase();

  // Combat indicators
  if (spell.damageType || spell.attackType ||
      desc.includes('damage') || desc.includes('attack')) {
    return 'COMBAT';
  }

  // Healing indicators
  if (desc.includes('heal') || desc.includes('restore') ||
      desc.includes('revive')) {
    return 'HEALING';
  }

  // Defensive indicators
  if (desc.includes('armor') || desc.includes('protect') ||
      desc.includes('shield') || desc.includes('ward')) {
    return 'DEFENSE';
  }

  // Social/Enchantment indicators
  if (spell.school === 'Enchantment' ||
      desc.includes('charm') || desc.includes('persuade') ||
      desc.includes('friend')) {
    return 'SOCIAL';
  }

  // Utility is the default
  return 'UTILITY';
}

/**
 * Create a brief, beginner-friendly description of a spell
 */
function createBeginnerDescription(spell: Spell): string {
  const category = categorizeSpell(spell);

  // Extract first sentence or first 100 chars of description
  const firstSentence = spell.description.split('.')[0] + '.';
  const brief = firstSentence.length > 120
    ? spell.description.substring(0, 120) + '...'
    : firstSentence;

  return `${brief} (${category})`;
}

/**
 * Build cantrip selection prompt for a specific class
 */
function buildCantripSelectionPrompt(characterClass: string): string {
  const count = STARTING_CANTRIPS[characterClass] || 2;
  const cantrips = CANTRIPS.filter(c => c.classes.includes(characterClass));

  if (cantrips.length === 0) {
    return ''; // Non-spellcasting class
  }

  const cantripList = cantrips
    .map(spell => `- **${spell.name}**: ${createBeginnerDescription(spell)}`)
    .join('\n');

  const intro = characterClass === 'Wizard'
    ? `As a Wizard, you study the fundamental building blocks of magic. Cantrips are simple spells you've mastered completely - you can cast them as often as you like without exhausting your magical reserves.`
    : characterClass === 'Sorcerer'
    ? `Your innate magical bloodline grants you access to cantrips - basic spells that flow naturally from your being. These spells are so ingrained in you that casting them requires no effort.`
    : characterClass === 'Bard'
    ? `Your musical training has taught you simple magical melodies - cantrips that you can perform endlessly. These are the building blocks of your bardic repertoire.`
    : characterClass === 'Cleric'
    ? `Your deity grants you divine orison - simple prayers that require no spell slots. These cantrips represent the most basic blessings your god bestows upon you.`
    : characterClass === 'Druid'
    ? `Nature has taught you primal cantrips - simple magical effects drawn from the natural world. You can call upon these minor blessings whenever you need them.`
    : characterClass === 'Warlock'
    ? `Your pact with an otherworldly patron has granted you eldritch invocations - cantrips that you can cast at will. These are the first gifts of your mysterious benefactor.`
    : `You have access to cantrips - spells you can cast without using spell slots.`;

  return `
📚 TUTORIAL MODE - Level 0 ${characterClass}

**CANTRIP SELECTION**

${intro}

**What are cantrips?**
Cantrips are Level 0 spells. Unlike higher-level spells that consume spell slots, you can cast cantrips unlimited times. They're less powerful than leveled spells, but their unlimited use makes them essential for any spellcaster.

**Your available cantrips:**

${cantripList}

**You must choose exactly ${count} cantrip${count > 1 ? 's' : ''}.**

💡 **Tips for beginners:**
- Include at least one combat cantrip (for when spell slots run out)
- Utility cantrips can solve problems creatively
- Don't worry too much - you'll gain more cantrips as you level up

**Please tell me which ${count} cantrip${count > 1 ? 's' : ''} you'd like to learn.** Type their names clearly (e.g., "I choose Fire Bolt and Prestidigitation").

If you choose fewer or more than ${count}, I'll politely remind you how many you need to select.
`.trim();
}

/**
 * Build level-1 spell selection prompt for a specific class
 */
function buildSpellSelectionPrompt(
  characterClass: string,
  selectedCantrips: string[]
): string {
  const count = STARTING_SPELLS[characterClass];
  const spells = LEVEL_1_SPELLS.filter(s => s.classes.includes(characterClass));

  // Classes that prepare spells rather than knowing fixed spells
  if (count === 0) {
    const prepareCount = characterClass === 'Cleric' || characterClass === 'Druid'
      ? 'your level + your spellcasting modifier'
      : 'unknown';

    return `
📚 TUTORIAL MODE - Level 0 ${characterClass}

**SPELL PREPARATION (Not Selection)**

Congratulations on choosing your cantrips: ${selectedCantrips.join(', ')}!

**Good news:** As a ${characterClass}, you don't choose a fixed list of spells. Instead, you **prepare** spells each day from your full class spell list.

**How it works:**
- You have access to ALL ${characterClass} spells of levels you can cast
- Each morning, you prepare ${prepareCount} spells
- You can change your prepared spells after a long rest
- This gives you amazing flexibility!

**For now:** Your tutorial character starts with a default prepared spell list. Once you reach Level 1, you'll be able to choose which spells to prepare each day.

🎉 **Tutorial complete!** You're ready to begin your adventure. Type "ready" or describe what you'd like to do first.
`.trim();
  }

  // Classes that know fixed spells
  if (spells.length === 0) {
    return ''; // Non-spellcasting class or no spells available
  }

  const spellList = spells
    .map(spell => `- **${spell.name}**: ${createBeginnerDescription(spell)}`)
    .join('\n');

  const intro = characterClass === 'Wizard'
    ? `Your spellbook contains the leveled spells you've learned during your studies. Unlike cantrips, these spells consume spell slots when cast.`
    : characterClass === 'Sorcerer'
    ? `Beyond cantrips, you know powerful leveled spells that tap deeper into your magical bloodline. These require spell slots to cast.`
    : characterClass === 'Bard'
    ? `You've mastered more complex magical songs that require concentration and effort. These leveled spells consume spell slots.`
    : characterClass === 'Warlock'
    ? `Your patron has granted you knowledge of powerful spells beyond simple cantrips. These require pact magic slots to cast.`
    : `You know leveled spells that require spell slots to cast.`;

  return `
📚 TUTORIAL MODE - Level 0 ${characterClass}

**LEVEL 1 SPELL SELECTION**

Great choices on cantrips: ${selectedCantrips.join(', ')}!

${intro}

**What are spell slots?**
Spell slots are your magical energy reserves. Each time you cast a leveled spell, you consume one slot of the appropriate level. You regain all spell slots after a long rest. At Level 1, you'll have 2 first-level spell slots.

**Your available Level 1 spells:**

${spellList}

**You must choose exactly ${count} spell${count > 1 ? 's' : ''}.**

💡 **Tips for beginners:**
- Balance offense and defense/utility
- Consider spells that complement your cantrips
- Think about your character's personality - what magic fits their style?
- Healing spells can save your life (or your party's)

**Please tell me which ${count} spell${count > 1 ? 's' : ''} you'd like to learn.** Type their names clearly.

If you choose fewer or more than ${count}, I'll gently correct you.
`.trim();
}

/**
 * Main function: Get tutorial context for a character
 * Returns empty string if character is not in tutorial mode
 */
export function getTutorialContext(character: CharacterRecord): string {
  // Only provide tutorial guidance for Level 0 characters
  if (character.level !== 0) {
    return '';
  }

  // Check tutorial state
  const tutorialState = character.tutorial_state;

  if (!tutorialState || tutorialState === 'complete') {
    return '';
  }

  switch (tutorialState) {
    case 'needs_cantrips':
      return buildCantripSelectionPrompt(character.class);

    case 'needs_spells': {
      // Extract selected cantrips from character (assumes they're stored somewhere)
      // For now, we'll use a placeholder
      const selectedCantrips: string[] = []; // TODO: Get from character.known_spells or similar
      return buildSpellSelectionPrompt(character.class, selectedCantrips);
    }

    default:
      return '';
  }
}

/**
 * Validate cantrip selection for a character
 * Returns validation result
 */
export function validateCantripSelection(
  characterClass: string,
  selectedCantrips: string[]
): { valid: boolean; message: string } {
  const expectedCount = STARTING_CANTRIPS[characterClass];

  if (!expectedCount) {
    return {
      valid: false,
      message: `${characterClass} is not a spellcasting class.`
    };
  }

  if (selectedCantrips.length !== expectedCount) {
    return {
      valid: false,
      message: `You need to select exactly ${expectedCount} cantrip${expectedCount > 1 ? 's' : ''}, but you selected ${selectedCantrips.length}.`
    };
  }

  // Validate that all selected cantrips exist and are available to this class
  const availableCantrips = CANTRIPS.filter(c => c.classes.includes(characterClass));
  const availableNames = availableCantrips.map(c => c.name.toLowerCase());

  for (const cantripName of selectedCantrips) {
    if (!availableNames.includes(cantripName.toLowerCase())) {
      return {
        valid: false,
        message: `"${cantripName}" is not a valid cantrip for ${characterClass}.`
      };
    }
  }

  return {
    valid: true,
    message: 'Valid cantrip selection!'
  };
}

/**
 * Validate spell selection for a character
 */
export function validateSpellSelection(
  characterClass: string,
  selectedSpells: string[]
): { valid: boolean; message: string } {
  const expectedCount = STARTING_SPELLS[characterClass];

  // Classes that prepare spells don't select starting spells
  if (expectedCount === 0) {
    return {
      valid: true,
      message: `${characterClass} prepares spells rather than learning them.`
    };
  }

  if (selectedSpells.length !== expectedCount) {
    return {
      valid: false,
      message: `You need to select exactly ${expectedCount} spell${expectedCount > 1 ? 's' : ''}, but you selected ${selectedSpells.length}.`
    };
  }

  // Validate that all selected spells exist and are available to this class
  const availableSpells = LEVEL_1_SPELLS.filter(s => s.classes.includes(characterClass));
  const availableNames = availableSpells.map(s => s.name.toLowerCase());

  for (const spellName of selectedSpells) {
    if (!availableNames.includes(spellName.toLowerCase())) {
      return {
        valid: false,
        message: `"${spellName}" is not a valid Level 1 spell for ${characterClass}.`
      };
    }
  }

  return {
    valid: true,
    message: 'Valid spell selection!'
  };
}

/**
 * Get starting spell information for a class
 */
export function getStartingSpellInfo(characterClass: string): {
  cantrips: number;
  spells: number;
  prepareSpells: boolean;
} {
  return {
    cantrips: STARTING_CANTRIPS[characterClass] || 0,
    spells: STARTING_SPELLS[characterClass] || 0,
    prepareSpells: STARTING_SPELLS[characterClass] === 0
  };
}
