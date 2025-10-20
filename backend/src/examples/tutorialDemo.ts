/**
 * Tutorial Guidance System Demo
 *
 * This script demonstrates how the tutorial system guides Level 0 spellcasters
 * through cantrip and spell selection.
 */

import {
  getTutorialContext,
  validateCantripSelection,
  validateSpellSelection,
  getStartingSpellInfo,
} from '../services/tutorialGuidance';
import type { CharacterRecord } from '../types';

// Mock character factory
function createMockCharacter(
  charClass: string,
  tutorialState: 'needs_cantrips' | 'needs_spells' | 'complete'
): CharacterRecord {
  return {
    id: 'demo-id',
    user_id: 'demo-user',
    name: `Demo ${charClass}`,
    race: 'Human',
    class: charClass,
    background: 'Sage',
    alignment: 'Neutral Good',
    level: 0, // Tutorial mode
    xp: 0,
    gold: 15,
    ability_scores: {
      STR: 10,
      DEX: 14,
      CON: 12,
      INT: 16,
      WIS: 13,
      CHA: 15,
    },
    hp_max: 8,
    hp_current: 8,
    temporary_hp: 0,
    armor_class: 12,
    speed: 30,
    hit_dice: { d8: 1 },
    position: { x: 0, y: 0 },
    campaign_seed: 'demo-campaign',
    spell_slots: {},
    backstory: null,
    skills: null,
    portrait_url: null,
    proficiency_bonus: 2,
    tutorial_state: tutorialState,
  };
}

console.log('='.repeat(80));
console.log('TUTORIAL GUIDANCE SYSTEM DEMO');
console.log('='.repeat(80));
console.log();

// Demo 1: Wizard Cantrip Selection
console.log('DEMO 1: Wizard Cantrip Selection');
console.log('-'.repeat(80));
const wizardCantrips = createMockCharacter('Wizard', 'needs_cantrips');
const wizardCantripPrompt = getTutorialContext(wizardCantrips);
console.log(wizardCantripPrompt);
console.log();

// Validate some selections
console.log('Testing cantrip selections:');
console.log('  Valid:  ', validateCantripSelection('Wizard', ['Fire Bolt', 'Mage Hand', 'Prestidigitation']));
console.log('  Too few:', validateCantripSelection('Wizard', ['Fire Bolt']));
console.log('  Invalid:', validateCantripSelection('Wizard', ['Fire Bolt', 'Mage Hand', 'Eldritch Blast']));
console.log();
console.log();

// Demo 2: Bard Cantrip Selection
console.log('DEMO 2: Bard Cantrip Selection');
console.log('-'.repeat(80));
const bardCantrips = createMockCharacter('Bard', 'needs_cantrips');
const bardCantripPrompt = getTutorialContext(bardCantrips);
console.log(bardCantripPrompt);
console.log();
console.log();

// Demo 3: Sorcerer Spell Selection
console.log('DEMO 3: Sorcerer Level 1 Spell Selection');
console.log('-'.repeat(80));
const sorcererSpells = createMockCharacter('Sorcerer', 'needs_spells');
const sorcererSpellPrompt = getTutorialContext(sorcererSpells);
console.log(sorcererSpellPrompt);
console.log();

// Validate spell selections
console.log('Testing spell selections:');
console.log('  Valid:  ', validateSpellSelection('Sorcerer', ['Magic Missile', 'Shield']));
console.log('  Too few:', validateSpellSelection('Sorcerer', ['Magic Missile']));
console.log();
console.log();

// Demo 4: Cleric Spell Preparation
console.log('DEMO 4: Cleric Spell Preparation (No Selection Needed)');
console.log('-'.repeat(80));
const clericSpells = createMockCharacter('Cleric', 'needs_spells');
const clericSpellPrompt = getTutorialContext(clericSpells);
console.log(clericSpellPrompt);
console.log();
console.log();

// Demo 5: Starting Spell Info for All Classes
console.log('DEMO 5: Starting Spell Info for All Spellcasting Classes');
console.log('-'.repeat(80));
const classes = ['Wizard', 'Sorcerer', 'Bard', 'Cleric', 'Druid', 'Warlock', 'Fighter'];
classes.forEach(cls => {
  const info = getStartingSpellInfo(cls);
  console.log(`${cls.padEnd(12)}: ${info.cantrips} cantrips, ${info.spells} spells${info.prepareSpells ? ' (prepared)' : ''}`);
});
console.log();

console.log('='.repeat(80));
console.log('INTEGRATION WITH NARRATOR LLM');
console.log('='.repeat(80));
console.log();
console.log('When a Level 0 character with tutorial_state="needs_cantrips" sends a message');
console.log('to the AI DM, the narrative prompt will include:');
console.log();
console.log('  === TUTORIAL MODE ===');
console.log('  [Full cantrip selection prompt with spell lists]');
console.log('  === END TUTORIAL ===');
console.log();
console.log('The Chronicler will then present this information in an engaging,');
console.log('educational way, guiding the player through their first spell choices.');
console.log();
