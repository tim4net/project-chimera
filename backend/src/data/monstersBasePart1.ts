/**
 * D&D 5e SRD Monster Database - Base Collection Part 1
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART1: Record<string, Monster> = {
  // ========================================
  // CR 0 - 1/4: Trivial Encounters
  // ========================================

  "awakened-shrub": {
    index: "awakened-shrub",
    name: "Awakened Shrub",
    size: "Small",
    type: "plant",
    alignment: "unaligned",
    armorClass: 9,
    hitPoints: 10,
    hitDice: "3d6",
    speed: { walk: "20 ft." },
    abilityScores: {
      strength: 3,
      dexterity: 8,
      constitution: 11,
      intelligence: 10,
      wisdom: 10,
      charisma: 6
    },
    challengeRating: 0,
    proficiencyBonus: 2,
    xp: 10,
    attacks: [
      {
        name: "Rake",
        attackBonus: 1,
        damage: "1d4-1",
        damageType: "slashing",
        description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 1 (1d4 - 1) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "False Appearance",
        description: "While the shrub remains motionless, it is indistinguishable from a normal shrub."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "one language known by its creator",
    damageVulnerabilities: ["fire"],
    damageResistances: ["piercing"],
    damageImmunities: [],
    conditionImmunities: []
  },

  "giant-rat": {
    index: "giant-rat",
    name: "Giant Rat",
    size: "Small",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 7,
    hitDice: "2d6",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 7,
      dexterity: 15,
      constitution: 11,
      intelligence: 2,
      wisdom: 10,
      charisma: 4
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Bite",
        attackBonus: 4,
        damage: "1d4+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Smell",
        description: "The rat has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        name: "Pack Tactics",
        description: "The rat has advantage on an attack roll against a creature if at least one of the rat's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "giant-bat": {
    index: "giant-bat",
    name: "Giant Bat",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 13,
    hitPoints: 22,
    hitDice: "4d10",
    speed: { walk: "10 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 16,
      constitution: 11,
      intelligence: 2,
      wisdom: 12,
      charisma: 6
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Bite",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Echolocation",
        description: "The bat can't use its blindsight while deafened."
      },
      {
        name: "Keen Hearing",
        description: "The bat has advantage on Wisdom (Perception) checks that rely on hearing."
      }
    ],
    senses: { blindsight: "60 ft.", passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "stirge": {
    index: "stirge",
    name: "Stirge",
    size: "Tiny",
    type: "beast",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 2,
    hitDice: "1d4",
    speed: { walk: "10 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 4,
      dexterity: 16,
      constitution: 11,
      intelligence: 2,
      wisdom: 8,
      charisma: 6
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Blood Drain",
        attackBonus: 5,
        damage: "1d4+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 5 (1d4 + 3) piercing damage, and the stirge attaches to the target. While attached, the stirge doesn't attack. Instead, at the start of each of the stirge's turns, the target loses 5 (1d4 + 3) hit points due to blood loss."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", passive_perception: "9" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },


};
