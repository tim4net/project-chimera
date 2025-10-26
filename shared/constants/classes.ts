/**
 * D&D 5e Class Data Constants
 *
 * Defines all playable classes with their mechanical properties,
 * hit dice, skills, and spellcasting capabilities.
 */

import { FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, PACT_CASTER_SLOTS, SpellSlotProgression } from './spellSlots';

export interface CharacterClass {
  name: string;
  description: string;
  hitDie: number;
  spellcasting: {
    enabled: boolean;
    ability?: 'INT' | 'WIS' | 'CHA';
    type?: 'full' | 'half' | 'pact' | 'none';
  };
  skills: string[];
  skillCount: number;
  spellSlots?: SpellSlotProgression;
}

export const CLASSES: CharacterClass[] = [
  {
    name: 'Barbarian',
    description: 'A fierce warrior of primitive background who can enter a battle rage. Barbarians excel in melee combat and can take tremendous punishment while dishing out devastating attacks.',
    hitDie: 12,
    spellcasting: {
      enabled: false,
      type: 'none'
    },
    skills: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    skillCount: 2
  },
  {
    name: 'Bard',
    description: 'An inspiring magician whose power echoes the music of creation. Bards are versatile spellcasters and skilled performers who can support allies and debilitate foes.',
    hitDie: 8,
    spellcasting: {
      enabled: true,
      ability: 'CHA',
      type: 'full'
    },
    skills: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
    skillCount: 3,
    spellSlots: FULL_CASTER_SLOTS
  },
  {
    name: 'Cleric',
    description: 'A priestly champion who wields divine magic in service of a higher power. Clerics combine the helpful magic of healing and inspiring their allies with spells that harm and hinder foes.',
    hitDie: 8,
    spellcasting: {
      enabled: true,
      ability: 'WIS',
      type: 'full'
    },
    skills: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    skillCount: 2,
    spellSlots: FULL_CASTER_SLOTS
  },
  {
    name: 'Druid',
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms. Druids are guardians of the wilderness who can call upon elemental forces and transform into beasts.',
    hitDie: 8,
    spellcasting: {
      enabled: true,
      ability: 'WIS',
      type: 'full'
    },
    skills: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    skillCount: 2,
    spellSlots: FULL_CASTER_SLOTS
  },
  {
    name: 'Fighter',
    description: 'A master of martial combat, skilled with a variety of weapons and armor. Fighters can be archers, duelists, or heavily armored warriors, and are the most versatile combatants.',
    hitDie: 10,
    spellcasting: {
      enabled: false,
      type: 'none'
    },
    skills: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    skillCount: 2
  },
  {
    name: 'Monk',
    description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection. Monks are lightning-fast warriors who strike with devastating precision.',
    hitDie: 8,
    spellcasting: {
      enabled: false,
      type: 'none'
    },
    skills: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    skillCount: 2
  },
  {
    name: 'Paladin',
    description: 'A holy warrior bound to a sacred oath. Paladins combine martial prowess with divine magic, smiting evil and protecting the innocent through strength of arms and conviction.',
    hitDie: 10,
    spellcasting: {
      enabled: true,
      ability: 'CHA',
      type: 'half'
    },
    skills: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
    skillCount: 2,
    spellSlots: HALF_CASTER_SLOTS
  },
  {
    name: 'Ranger',
    description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization. Rangers are skilled hunters and trackers who protect borders and hunt down monsters.',
    hitDie: 10,
    spellcasting: {
      enabled: true,
      ability: 'WIS',
      type: 'half'
    },
    skills: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
    skillCount: 3,
    spellSlots: HALF_CASTER_SLOTS
  },
  {
    name: 'Rogue',
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies. Rogues are skilled at finding and exploiting weaknesses, dealing devastating sneak attacks.',
    hitDie: 8,
    spellcasting: {
      enabled: false,
      type: 'none'
    },
    skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    skillCount: 4
  },
  {
    name: 'Sorcerer',
    description: 'A spellcaster who draws on inherent magic from a gift or bloodline. Sorcerers can manipulate their spells with metamagic, making them uniquely versatile and unpredictable.',
    hitDie: 6,
    spellcasting: {
      enabled: true,
      ability: 'CHA',
      type: 'full'
    },
    skills: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    skillCount: 2,
    spellSlots: FULL_CASTER_SLOTS
  },
  {
    name: 'Warlock',
    description: 'A wielder of magic derived from a bargain with an extraplanar entity. Warlocks gain unique abilities and a small but powerful set of spells that recharge on short rests.',
    hitDie: 8,
    spellcasting: {
      enabled: true,
      ability: 'CHA',
      type: 'pact'
    },
    skills: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    skillCount: 2,
    spellSlots: PACT_CASTER_SLOTS
  },
  {
    name: 'Wizard',
    description: 'A scholarly magic-user capable of manipulating the structures of reality. Wizards are the ultimate masters of arcane magic, with vast spellbooks and unparalleled versatility.',
    hitDie: 6,
    spellcasting: {
      enabled: true,
      ability: 'INT',
      type: 'full'
    },
    skills: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    skillCount: 2,
    spellSlots: FULL_CASTER_SLOTS
  }
];

/**
 * Helper function to get a class by name
 */
export function getClassByName(name: string): CharacterClass | undefined {
  return CLASSES.find(cls => cls.name.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function to get all class names
 */
export function getAllClassNames(): string[] {
  return CLASSES.map(cls => cls.name);
}

/**
 * Helper function to check if a class is a spellcaster
 */
export function isSpellcaster(className: string): boolean {
  const cls = getClassByName(className);
  return cls?.spellcasting.enabled ?? false;
}
