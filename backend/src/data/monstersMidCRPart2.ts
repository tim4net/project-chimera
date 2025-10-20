/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART2: Record<string, Monster> = {
  "blue-dragon-wyrmling": {
    index: "blue-dragon-wyrmling",
    name: "Blue Dragon Wyrmling",
    size: "Medium",
    type: "dragon",
    alignment: "lawful evil",
    armorClass: 17,
    hitPoints: 52,
    hitDice: "8d8",
    speed: { walk: "30 ft.", burrow: "15 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 10,
      constitution: 15,
      intelligence: 12,
      wisdom: 11,
      charisma: 15
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "1d10+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d10 + 3) piercing damage plus 3 (1d6) lightning damage."
      }
    ],
    specialAbilities: [],
    senses: { blindsight: "10 ft.", darkvision: "60 ft.", passive_perception: "14" },
    languages: "Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning"],
    conditionImmunities: []
  },

  "bulette": {
    index: "bulette",
    name: "Bulette",
    size: "Large",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 17,
    hitPoints: 94,
    hitDice: "9d10",
    speed: { walk: "40 ft.", burrow: "40 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 11,
      constitution: 21,
      intelligence: 2,
      wisdom: 10,
      charisma: 5
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Bite",
        attackBonus: 7,
        damage: "4d12+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 30 (4d12 + 4) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Standing Leap",
        description: "The bulette's long jump is up to 30 ft. and its high jump is up to 15 ft., with or without a running start."
      }
    ],
    senses: { darkvision: "60 ft.", tremorsense: "60 ft.", passive_perception: "16" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "chuul": {
    index: "chuul",
    name: "Chuul",
    size: "Large",
    type: "aberration",
    alignment: "chaotic evil",
    armorClass: 16,
    hitPoints: 93,
    hitDice: "11d10",
    speed: { walk: "30 ft.", swim: "30 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 10,
      constitution: 16,
      intelligence: 5,
      wisdom: 11,
      charisma: 5
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Pincer",
        attackBonus: 6,
        damage: "2d6+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) bludgeoning damage. The target is grappled (escape DC 14) if it is a Large or smaller creature and the chuul doesn't have two other creatures grappled."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The chuul can breathe air and water."
      },
      {
        name: "Sense Magic",
        description: "The chuul senses magic within 120 feet of it at will. This trait otherwise works like the detect magic spell but isn't itself magical."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "14" },
    languages: "understands Deep Speech but can't speak",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["Poisoned"]
  },

  "couatl": {
    index: "couatl",
    name: "Couatl",
    size: "Medium",
    type: "celestial",
    alignment: "lawful good",
    armorClass: 19,
    hitPoints: 97,
    hitDice: "13d8",
    speed: { walk: "30 ft.", fly: "90 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 20,
      constitution: 17,
      intelligence: 18,
      wisdom: 20,
      charisma: 18
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Bite",
        attackBonus: 8,
        damage: "1d6+5",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one creature. Hit: 8 (1d6 + 5) piercing damage, and the target must succeed on a DC 13 Constitution saving throw or be poisoned for 24 hours. Until this poison ends, the target is unconscious. Another creature can use an action to shake the target awake."
      },
      {
        name: "Constrict",
        attackBonus: 6,
        damage: "2d6+3",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +6 to hit, reach 10 ft., one Medium or smaller creature. Hit: 10 (2d6 + 3) bludgeoning damage, and the target is grappled (escape DC 15). Until this grapple ends, the target is restrained, and the couatl can't constrict another target."
      }
    ],
    specialAbilities: [
      {
        name: "Innate Spellcasting",
        description: "The couatl's spellcasting ability is Charisma (spell save DC 14). It can innately cast the following spells, requiring only verbal components:  At will: detect evil and good, detect magic, detect thoughts 3/day each: bless, create food and water, cure wounds, lesser restoration, protection from poison, sanctuary, shield 1/day each: dream, greater restoration, scrying"
      },
      {
        name: "Magic Weapons",
        description: "The couatl's weapon attacks are magical."
      },
      {
        name: "Shielded Mind",
        description: "The couatl is immune to scrying and to any effect that would sense its emotions, read its thoughts, or detect its location."
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "15" },
    languages: "all, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["radiant"],
    damageImmunities: ["psychic", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    conditionImmunities: []
  }
};
