/**
 * D&D 5e SRD Feats Database
 * Source: https://www.dnd5eapi.co/api/feats (partial) + D&D 5e SRD
 *
 * Common feats available in D&D 5e System Reference Document.
 * These feats provide special abilities and bonuses to characters.
 */

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Feat {
  name: string;
  description: string;
  prerequisites?: string;
  abilityScoreIncrease?: Partial<AbilityScores>;
  benefits: string[];
}

export const FEATS: Record<string, Feat> = {
  grappler: {
    name: 'Grappler',
    description: 'You\'ve developed the skills necessary to hold your own in close-quarters grappling.',
    prerequisites: 'Strength 13 or higher',
    benefits: [
      'You have advantage on attack rolls against a creature you are grappling',
      'You can use your action to try to pin a creature grappled by you. To do so, make another grapple check. If you succeed, you and the creature are both restrained until the grapple ends'
    ]
  },

  alert: {
    name: 'Alert',
    description: 'Always on the lookout for danger, you gain the following benefits.',
    benefits: [
      'You gain a +5 bonus to initiative',
      'You can\'t be surprised while you are conscious',
      'Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you'
    ]
  },

  athlete: {
    name: 'Athlete',
    description: 'You have undergone extensive physical training to gain the following benefits.',
    benefits: [
      'Increase your Strength or Dexterity score by 1, to a maximum of 20',
      'When you are prone, standing up uses only 5 feet of your movement',
      'Climbing doesn\'t cost you extra movement',
      'You can make a running long jump or a running high jump after moving only 5 feet on foot, rather than 10 feet'
    ]
  },

  durable: {
    name: 'Durable',
    description: 'Hardy and resilient, you gain the following benefits.',
    benefits: [
      'Increase your Constitution score by 1, to a maximum of 20',
      'When you roll a Hit Die to regain hit points, the minimum number of hit points you regain from the roll equals twice your Constitution modifier (minimum of 2)'
    ]
  },

  greatWeaponMaster: {
    name: 'Great Weapon Master',
    description: 'You\'ve learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes.',
    benefits: [
      'On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action',
      'Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage'
    ]
  },

  lucky: {
    name: 'Lucky',
    description: 'You have inexplicable luck that seems to kick in at just the right moment.',
    benefits: [
      'You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20. You can choose to spend one of your luck points after you roll the die, but before the outcome is determined. You choose which of the d20s is used for the attack roll, ability check, or saving throw',
      'You can also spend one luck point when an attack roll is made against you. Roll a d20, and then choose whether the attack uses the attacker\'s roll or yours',
      'You regain your expended luck points when you finish a long rest'
    ]
  },

  mobileFootwork: {
    name: 'Mobile',
    description: 'You are exceptionally speedy and agile.',
    benefits: [
      'Your speed increases by 10 feet',
      'When you use the Dash action, difficult terrain doesn\'t cost you extra movement on that turn',
      'When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature for the rest of the turn, whether you hit or not'
    ]
  },

  resilient: {
    name: 'Resilient',
    description: 'Choose one ability score. You gain the following benefits.',
    benefits: [
      'Increase the chosen ability score by 1, to a maximum of 20',
      'You gain proficiency in saving throws using the chosen ability'
    ]
  },

  sentinal: {
    name: 'Sentinel',
    description: 'You have mastered techniques to take advantage of every drop in any enemy\'s guard.',
    benefits: [
      'When you hit a creature with an opportunity attack, the creature\'s speed becomes 0 for the rest of the turn',
      'Creatures provoke opportunity attacks from you even if they take the Disengage action before leaving your reach',
      'When a creature within 5 feet of you makes an attack against a target other than you (and that target doesn\'t have this feat), you can use your reaction to make a melee weapon attack against the attacking creature'
    ]
  },

  sharpshooter: {
    name: 'Sharpshooter',
    description: 'You have mastered ranged weapons and can make shots that others find impossible.',
    benefits: [
      'Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls',
      'Your ranged weapon attacks ignore half cover and three-quarters cover',
      'Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage'
    ]
  },

  tavern_brawler: {
    name: 'Tavern Brawler',
    description: 'Accustomed to rough-and-tumble fighting using whatever weapons happen to be at hand.',
    benefits: [
      'Increase your Strength or Constitution score by 1, to a maximum of 20',
      'You are proficient with improvised weapons',
      'Your unarmed strike uses a d4 for damage',
      'When you hit a creature with an unarmed strike or an improvised weapon on your turn, you can use a bonus action to attempt to grapple the target'
    ]
  },

  tough: {
    name: 'Tough',
    description: 'Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    benefits: [
      'Your hit point maximum increases by an amount equal to twice your level',
      'Whenever you gain a level, your hit point maximum increases by an additional 2 hit points'
    ]
  },

  warCaster: {
    name: 'War Caster',
    description: 'You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits.',
    prerequisites: 'The ability to cast at least one spell',
    benefits: [
      'You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage',
      'You can perform the somatic components of spells even when you have weapons or a shield in one or both hands',
      'When a hostile creature\'s movement provokes an opportunity attack from you, you can use your reaction to cast a spell at the creature, rather than making an opportunity attack. The spell must have a casting time of 1 action and must target only that creature'
    ]
  },

  defensive_duelist: {
    name: 'Defensive Duelist',
    description: 'When you are wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack, potentially causing the attack to miss you.',
    prerequisites: 'Dexterity 13 or higher',
    benefits: [
      'When wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack, potentially causing the attack to miss you'
    ]
  },

  dual_wielder: {
    name: 'Dual Wielder',
    description: 'You master fighting with two weapons, gaining the following benefits.',
    benefits: [
      'You gain a +1 bonus to AC while you are wielding a separate melee weapon in each hand',
      'You can use two-weapon fighting even when the one-handed melee weapons you are wielding aren\'t light',
      'You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one'
    ]
  },

  elemental_adept: {
    name: 'Elemental Adept',
    description: 'When you gain this feat, choose one of the following damage types: acid, cold, fire, lightning, or thunder.',
    prerequisites: 'The ability to cast at least one spell',
    benefits: [
      'Spells you cast ignore resistance to damage of the chosen type',
      'When you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2',
      'You can select this feat multiple times. Each time you do so, you must choose a different damage type'
    ]
  },

  heavily_armored: {
    name: 'Heavily Armored',
    description: 'You have trained to master the use of heavy armor, gaining the following benefits.',
    prerequisites: 'Proficiency with medium armor',
    benefits: [
      'Increase your Strength score by 1, to a maximum of 20',
      'You gain proficiency with heavy armor'
    ]
  },

  heavy_armor_master: {
    name: 'Heavy Armor Master',
    description: 'You can use your armor to deflect strikes that would kill others.',
    prerequisites: 'Proficiency with heavy armor',
    benefits: [
      'Increase your Strength score by 1, to a maximum of 20',
      'While you are wearing heavy armor, bludgeoning, piercing, and slashing damage that you take from nonmagical weapons is reduced by 3'
    ]
  },

  inspiring_leader: {
    name: 'Inspiring Leader',
    description: 'You can spend 10 minutes inspiring your companions, shoring up their resolve to fight.',
    prerequisites: 'Charisma 13 or higher',
    benefits: [
      'You can spend 10 minutes inspiring your companions. When you do so, choose up to six friendly creatures (which can include yourself) within 30 feet of you who can see or hear you and who can understand you',
      'Each creature can gain temporary hit points equal to your level + your Charisma modifier',
      'A creature can\'t gain temporary hit points from this feat again until it has finished a short or long rest'
    ]
  },

  keen_mind: {
    name: 'Keen Mind',
    description: 'You have a mind that can track time, direction, and detail with uncanny precision.',
    benefits: [
      'Increase your Intelligence score by 1, to a maximum of 20',
      'You always know which way is north',
      'You always know the number of hours left before the next sunrise or sunset',
      'You can accurately recall anything you have seen or heard within the past month'
    ]
  },

  lightly_armored: {
    name: 'Lightly Armored',
    description: 'You have trained to master the use of light armor.',
    benefits: [
      'Increase your Strength or Dexterity score by 1, to a maximum of 20',
      'You gain proficiency with light armor'
    ]
  },

  linguist: {
    name: 'Linguist',
    description: 'You have studied languages and codes, gaining the following benefits.',
    benefits: [
      'Increase your Intelligence score by 1, to a maximum of 20',
      'You learn three languages of your choice',
      'You can ably create written ciphers. Others can\'t decipher a code you create unless you teach them, they succeed on an Intelligence check (DC equal to your Intelligence score + your proficiency bonus), or they use magic to decipher it'
    ]
  },

  mage_slayer: {
    name: 'Mage Slayer',
    description: 'You have practiced techniques useful in melee combat against spellcasters.',
    benefits: [
      'When a creature within 5 feet of you casts a spell, you can use your reaction to make a melee weapon attack against that creature',
      'When you damage a creature that is concentrating on a spell, that creature has disadvantage on the saving throw it makes to maintain its concentration',
      'You have advantage on saving throws against spells cast by creatures within 5 feet of you'
    ]
  },

  magic_initiate: {
    name: 'Magic Initiate',
    description: 'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list.',
    benefits: [
      'You learn two cantrips of your choice from that class\'s spell list',
      'You learn one 1st-level spell of your choice from that class\'s spell list. You can cast this spell once without expending a spell slot. You must finish a long rest before you can cast it in this way again',
      'Your spellcasting ability for these spells depends on the class you chose: Charisma for bard, sorcerer, or warlock; Wisdom for cleric or druid; or Intelligence for wizard'
    ]
  },

  martial_adept: {
    name: 'Martial Adept',
    description: 'You have martial training that allows you to perform special combat maneuvers.',
    benefits: [
      'You learn two maneuvers of your choice from among those available to the Battle Master archetype in the fighter class',
      'If a maneuver you use requires your target to make a saving throw to resist the maneuver\'s effects, the saving throw DC equals 8 + your proficiency bonus + your Strength or Dexterity modifier (your choice)',
      'You gain one superiority die, which is a d6 (this die is added to any superiority dice you have from another source). This die is used to fuel your maneuvers. A superiority die is expended when you use it. You regain your expended superiority dice when you finish a short or long rest'
    ]
  },

  medium_armor_master: {
    name: 'Medium Armor Master',
    description: 'You have practiced moving in medium armor to gain the following benefits.',
    prerequisites: 'Proficiency with medium armor',
    benefits: [
      'Wearing medium armor doesn\'t impose disadvantage on your Dexterity (Stealth) checks',
      'When you wear medium armor, you can add 3, rather than 2, to your AC if you have a Dexterity of 16 or higher'
    ]
  },

  moderately_armored: {
    name: 'Moderately Armored',
    description: 'You have trained to master the use of medium armor and shields.',
    prerequisites: 'Proficiency with light armor',
    benefits: [
      'Increase your Strength or Dexterity score by 1, to a maximum of 20',
      'You gain proficiency with medium armor and shields'
    ]
  },

  mounted_combatant: {
    name: 'Mounted Combatant',
    description: 'You are a dangerous foe to face while mounted.',
    benefits: [
      'You have advantage on melee attack rolls against any unmounted creature that is smaller than your mount',
      'You can force an attack targeted at your mount to target you instead',
      'If your mount is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails'
    ]
  },

  observant: {
    name: 'Observant',
    description: 'Quick to notice details of your environment, you gain the following benefits.',
    benefits: [
      'Increase your Intelligence or Wisdom score by 1, to a maximum of 20',
      'If you can see a creature\'s mouth while it is speaking a language you understand, you can interpret what it\'s saying by reading its lips',
      'You have a +5 bonus to your passive Wisdom (Perception) and passive Intelligence (Investigation) scores'
    ]
  },

  polearm_master: {
    name: 'Polearm Master',
    description: 'You can keep your enemies at bay with reach weapons.',
    benefits: [
      'When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon. This attack uses the same ability modifier as the primary attack. The weapon\'s damage die for this attack is a d4, and it deals bludgeoning damage',
      'While you are wielding a glaive, halberd, pike, quarterstaff, or spear, other creatures provoke an opportunity attack from you when they enter your reach'
    ]
  },

  ritual_caster: {
    name: 'Ritual Caster',
    description: 'You have learned a number of spells that you can cast as rituals.',
    prerequisites: 'Intelligence or Wisdom 13 or higher',
    benefits: [
      'Choose one of the following classes: bard, cleric, druid, sorcerer, warlock, or wizard. You acquire a ritual book holding two 1st-level spells of your choice from that class\'s spell list',
      'If you come across a spell in written form, such as a magical spell scroll or a wizard\'s spellbook, you might be able to add it to your ritual book',
      'The spell\'s level can be no higher than half your level (rounded up), and it must have the ritual tag. The process of copying the spell into your ritual book takes 2 hours per level of the spell, and costs 50 gp per level',
      'You can cast any spell in your ritual book as a ritual'
    ]
  },

  savage_attacker: {
    name: 'Savage Attacker',
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total.',
    benefits: [
      'Once per turn when you roll damage for a melee weapon attack, you can reroll the weapon\'s damage dice and use either total'
    ]
  },

  shield_master: {
    name: 'Shield Master',
    description: 'You use shields not just for protection but also for offense.',
    benefits: [
      'If you take the Attack action on your turn, you can use a bonus action to try to shove a creature within 5 feet of you with your shield',
      'If you aren\'t incapacitated, you can add your shield\'s AC bonus to any Dexterity saving throw you make against a spell or other harmful effect that targets only you',
      'If you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you can use your reaction to take no damage if you succeed on the saving throw, interposing your shield between yourself and the source of the effect'
    ]
  },

  skilled: {
    name: 'Skilled',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    benefits: [
      'You gain proficiency in any combination of three skills or tools of your choice'
    ]
  },

  skulker: {
    name: 'Skulker',
    description: 'You are expert at slinking through shadows.',
    prerequisites: 'Dexterity 13 or higher',
    benefits: [
      'You can try to hide when you are lightly obscured from the creature from which you are hiding',
      'When you are hidden from a creature and miss it with a ranged weapon attack, making the attack doesn\'t reveal your position',
      'Dim light doesn\'t impose disadvantage on your Wisdom (Perception) checks relying on sight'
    ]
  },

  spell_sniper: {
    name: 'Spell Sniper',
    description: 'You have learned techniques to enhance your attacks with certain kinds of spells.',
    prerequisites: 'The ability to cast at least one spell',
    benefits: [
      'When you cast a spell that requires you to make an attack roll, the spell\'s range is doubled',
      'Your ranged spell attacks ignore half cover and three-quarters cover',
      'You learn one cantrip that requires an attack roll. Choose the cantrip from the bard, cleric, druid, sorcerer, warlock, or wizard spell list. Your spellcasting ability for this cantrip depends on the spell list you chose from'
    ]
  },

  weapon_master: {
    name: 'Weapon Master',
    description: 'You have practiced extensively with a variety of weapons.',
    benefits: [
      'Increase your Strength or Dexterity score by 1, to a maximum of 20',
      'You gain proficiency with four weapons of your choice. Each one must be a simple or a martial weapon'
    ]
  }
};

/**
 * Get a feat by name (case-insensitive)
 */
export function getFeat(name: string): Feat | undefined {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return FEATS[key];
}

/**
 * Get all feat names
 */
export function getAllFeatNames(): string[] {
  return Object.values(FEATS).map(f => f.name);
}

/**
 * Check if a feat exists
 */
export function hasFeat(name: string): boolean {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return key in FEATS;
}

/**
 * Get feats by prerequisite (returns all feats that match or have no prerequisites)
 */
export function getFeatsByPrerequisite(hasPrerequisites: boolean = false): Feat[] {
  return Object.values(FEATS).filter(feat =>
    hasPrerequisites ? !!feat.prerequisites : !feat.prerequisites
  );
}

/**
 * Export all feats as an array
 */
export const ALL_FEATS = Object.values(FEATS);
