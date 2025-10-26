/**
 * D&D 5e Skill Data Constants
 *
 * Defines all skills with their associated abilities,
 * descriptions, and helper functions for checking proficiency
 * based on class and background.
 */

export type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface Skill {
  name: string;
  description: string;
  ability: AbilityScore;
  examples: string[];
}

export const SKILLS: Skill[] = [
  {
    name: 'Acrobatics',
    description: 'Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you\'re trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship\'s deck.',
    ability: 'DEX',
    examples: [
      'Staying balanced on a narrow ledge',
      'Performing flips and tumbles',
      'Escaping from bonds or grapples',
      'Landing safely after a fall'
    ]
  },
  {
    name: 'Animal Handling',
    description: 'When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal\'s intentions, the DM might call for a Wisdom (Animal Handling) check.',
    ability: 'WIS',
    examples: [
      'Calming a frightened horse',
      'Sensing an animal\'s mood',
      'Training an animal to perform tricks',
      'Controlling a mount in combat'
    ]
  },
  {
    name: 'Arcana',
    description: 'Your Intelligence (Arcana) check measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes.',
    ability: 'INT',
    examples: [
      'Identifying a spell being cast',
      'Recognizing magical symbols or runes',
      'Recalling lore about magical creatures',
      'Understanding planar phenomena'
    ]
  },
  {
    name: 'Athletics',
    description: 'Your Strength (Athletics) check covers difficult situations you encounter while climbing, jumping, or swimming.',
    ability: 'STR',
    examples: [
      'Climbing a cliff or wall',
      'Swimming across a raging river',
      'Jumping across a chasm',
      'Grappling or shoving an opponent'
    ]
  },
  {
    name: 'Deception',
    description: 'Your Charisma (Deception) check determines whether you can convincingly hide the truth, either verbally or through your actions.',
    ability: 'CHA',
    examples: [
      'Telling a convincing lie',
      'Disguising yourself',
      'Bluffing in a card game',
      'Maintaining a false identity'
    ]
  },
  {
    name: 'History',
    description: 'Your Intelligence (History) check measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations.',
    ability: 'INT',
    examples: [
      'Recalling information about past events',
      'Identifying historical artifacts',
      'Knowing legends and lore',
      'Understanding cultural traditions'
    ]
  },
  {
    name: 'Insight',
    description: 'Your Wisdom (Insight) check decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone\'s next move.',
    ability: 'WIS',
    examples: [
      'Detecting a lie',
      'Reading body language',
      'Sensing someone\'s true mood',
      'Predicting another\'s intentions'
    ]
  },
  {
    name: 'Intimidation',
    description: 'When you attempt to influence someone through overt threats, hostile actions, and physical violence, the DM might ask you to make a Charisma (Intimidation) check.',
    ability: 'CHA',
    examples: [
      'Threatening information out of a prisoner',
      'Using menacing presence in negotiation',
      'Frightening an enemy into surrender',
      'Displaying strength to cow opponents'
    ]
  },
  {
    name: 'Investigation',
    description: 'When you look around for clues and make deductions based on those clues, you make an Intelligence (Investigation) check.',
    ability: 'INT',
    examples: [
      'Searching a room for hidden items',
      'Deducing the location of a hidden object',
      'Following complex clues',
      'Determining how a mechanism works'
    ]
  },
  {
    name: 'Medicine',
    description: 'A Wisdom (Medicine) check lets you try to stabilize a dying companion or diagnose an illness.',
    ability: 'WIS',
    examples: [
      'Stabilizing a dying creature',
      'Diagnosing a disease',
      'Treating poison',
      'Determining cause of death'
    ]
  },
  {
    name: 'Nature',
    description: 'Your Intelligence (Nature) check measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles.',
    ability: 'INT',
    examples: [
      'Identifying plants and their properties',
      'Predicting weather patterns',
      'Recognizing animal tracks',
      'Understanding natural phenomena'
    ]
  },
  {
    name: 'Perception',
    description: 'Your Wisdom (Perception) check lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses.',
    ability: 'WIS',
    examples: [
      'Spotting a hidden creature',
      'Hearing a distant sound',
      'Noticing something unusual',
      'Keeping watch during a rest'
    ]
  },
  {
    name: 'Performance',
    description: 'Your Charisma (Performance) check determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment.',
    ability: 'CHA',
    examples: [
      'Playing a musical instrument',
      'Acting in a play',
      'Telling an engaging story',
      'Performing a dance'
    ]
  },
  {
    name: 'Persuasion',
    description: 'When you attempt to influence someone or a group of people with tact, social graces, or good nature, the DM might ask you to make a Charisma (Persuasion) check.',
    ability: 'CHA',
    examples: [
      'Convincing a guard to let you pass',
      'Negotiating a trade deal',
      'Inspiring a crowd',
      'Settling a dispute diplomatically'
    ]
  },
  {
    name: 'Religion',
    description: 'Your Intelligence (Religion) check measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults.',
    ability: 'INT',
    examples: [
      'Identifying religious symbols',
      'Recalling information about deities',
      'Performing religious rituals',
      'Understanding religious practices'
    ]
  },
  {
    name: 'Sleight of Hand',
    description: 'Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person, make a Dexterity (Sleight of Hand) check.',
    ability: 'DEX',
    examples: [
      'Pickpocketing',
      'Concealing a small object',
      'Performing magic tricks',
      'Planting evidence'
    ]
  },
  {
    name: 'Stealth',
    description: 'Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies, slink past guards, slip away without being noticed, or sneak up on someone without being seen or heard.',
    ability: 'DEX',
    examples: [
      'Hiding from enemies',
      'Moving silently',
      'Sneaking past guards',
      'Following someone without being noticed'
    ]
  },
  {
    name: 'Survival',
    description: 'The DM might ask you to make a Wisdom (Survival) check to follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards.',
    ability: 'WIS',
    examples: [
      'Tracking creatures',
      'Finding food and water',
      'Navigating wilderness',
      'Predicting weather'
    ]
  }
];

/**
 * Helper function to get skill by name
 */
export function getSkillByName(name: string): Skill | undefined {
  return SKILLS.find(skill => skill.name.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function to get all skill names
 */
export function getAllSkillNames(): string[] {
  return SKILLS.map(skill => skill.name);
}

/**
 * Helper function to get skills by ability score
 */
export function getSkillsByAbility(ability: AbilityScore): Skill[] {
  return SKILLS.filter(skill => skill.ability === ability);
}

/**
 * Check if a skill is a class skill for the given class
 * Import CLASSES from classes.ts when needed
 */
export function isClassSkill(skillName: string, className: string): boolean {
  // This requires importing CLASSES from classes.ts
  // For now, returning a type-safe stub
  // Implementation should check if skillName is in CLASSES.find(c => c.name === className)?.skills
  return false; // Placeholder - implement with classes.ts import
}

/**
 * Check if a skill is granted by the given background
 * Import BACKGROUNDS from backgrounds.ts when needed
 */
export function isBackgroundSkill(skillName: string, backgroundName: string): boolean {
  // This requires importing BACKGROUNDS from backgrounds.ts
  // For now, returning a type-safe stub
  // Implementation should check if skillName is in BACKGROUNDS.find(b => b.name === backgroundName)?.skillBonuses
  return false; // Placeholder - implement with backgrounds.ts import
}

/**
 * Calculate skill modifier given ability score, proficiency bonus, and proficiency status
 */
export function calculateSkillModifier(
  abilityScore: number,
  proficiencyBonus: number,
  isProficient: boolean,
  hasExpertise: boolean = false
): number {
  const abilityModifier = Math.floor((abilityScore - 10) / 2);

  if (hasExpertise) {
    return abilityModifier + (proficiencyBonus * 2);
  } else if (isProficient) {
    return abilityModifier + proficiencyBonus;
  } else {
    return abilityModifier;
  }
}
