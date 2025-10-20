/**
 * D&D 5e SRD Monster Database - CR 0-2 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LOWCRPART2: Record<string, Monster> = {
  "baboon": {
    index: "baboon",
    name: "Baboon",
    size: "Small",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 3,
    hitDice: "1d6",
    speed: { walk: "30 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 8,
      dexterity: 14,
      constitution: 11,
      intelligence: 4,
      wisdom: 12,
      charisma: 6
    },
    challengeRating: 0,
    proficiencyBonus: 2,
    xp: 10,
    attacks: [
      {
        name: "Bite",
        attackBonus: 1,
        damage: "1d4-1",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 1 (1d4 - 1) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Pack Tactics",
        description: "The baboon has advantage on an attack roll against a creature if at least one of the baboon's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "badger": {
    index: "badger",
    name: "Badger",
    size: "Tiny",
    type: "beast",
    alignment: "unaligned",
    armorClass: 10,
    hitPoints: 3,
    hitDice: "1d4",
    speed: { walk: "20 ft.", burrow: "5 ft." },
    abilityScores: {
      strength: 4,
      dexterity: 11,
      constitution: 12,
      intelligence: 2,
      wisdom: 12,
      charisma: 5
    },
    challengeRating: 0,
    proficiencyBonus: 2,
    xp: 10,
    attacks: [
      {
        name: "Bite",
        attackBonus: 2,
        damage: "1",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 1 piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Smell",
        description: "The badger has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    senses: { darkvision: "30 ft.", passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "bandit-captain": {
    index: "bandit-captain",
    name: "Bandit Captain",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any non-lawful alignment",
    armorClass: 15,
    hitPoints: 65,
    hitDice: "10d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 16,
      constitution: 14,
      intelligence: 14,
      wisdom: 11,
      charisma: 14
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage."
      },
      {
        name: "Dagger",
        attackBonus: 5,
        damage: "1d4+3",
        damageType: "Piercing",
        description: "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 5 (1d4 + 3) piercing damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "10" },
    languages: "any two languages",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "bat": {
    index: "bat",
    name: "Bat",
    size: "Tiny",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 1,
    hitDice: "1d4",
    speed: { walk: "5 ft.", fly: "30 ft." },
    abilityScores: {
      strength: 2,
      dexterity: 15,
      constitution: 8,
      intelligence: 2,
      wisdom: 12,
      charisma: 4
    },
    challengeRating: 0,
    proficiencyBonus: 2,
    xp: 10,
    attacks: [],
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

  "berserker": {
    index: "berserker",
    name: "Berserker",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any chaotic alignment",
    armorClass: 13,
    hitPoints: 67,
    hitDice: "9d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 12,
      constitution: 17,
      intelligence: 9,
      wisdom: 11,
      charisma: 9
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Greataxe",
        attackBonus: 5,
        damage: "1d12+3",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Reckless",
        description: "At the start of its turn, the berserker can gain advantage on all melee weapon attack rolls during that turn, but attack rolls against it have advantage until the start of its next turn."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
