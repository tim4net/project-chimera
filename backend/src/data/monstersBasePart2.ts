/**
 * D&D 5e SRD Monster Database - Base Collection Part 2
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART2: Record<string, Monster> = {
  "kobold": {
    index: "kobold",
    name: "Kobold",
    size: "Small",
    type: "humanoid",
    subtype: "kobold",
    alignment: "lawful evil",
    armorClass: 12,
    hitPoints: 5,
    hitDice: "2d6-2",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 7,
      dexterity: 15,
      constitution: 9,
      intelligence: 8,
      wisdom: 7,
      charisma: 8
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Dagger",
        attackBonus: 4,
        damage: "1d4+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      },
      {
        name: "Sling",
        attackBonus: 4,
        damage: "1d4+2",
        damageType: "bludgeoning",
        description: "Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 4 (1d4 + 2) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Sunlight Sensitivity",
        description: "While in sunlight, the kobold has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      },
      {
        name: "Pack Tactics",
        description: "The kobold has advantage on an attack roll against a creature if at least one of the kobold's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "8" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "goblin": {
    index: "goblin",
    name: "Goblin",
    size: "Small",
    type: "humanoid",
    subtype: "goblinoid",
    alignment: "neutral evil",
    armorClass: 15,
    hitPoints: 7,
    hitDice: "2d6",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "slashing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
      },
      {
        name: "Shortbow",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Nimble Escape",
        description: "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "9" },
    languages: "Common, Goblin",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  // ========================================
  // CR 1/2 - 1: Easy Encounters
  // ========================================

  "skeleton": {
    index: "skeleton",
    name: "Skeleton",
    size: "Medium",
    type: "undead",
    alignment: "lawful evil",
    armorClass: 13,
    hitPoints: 13,
    hitDice: "2d8+4",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 10,
      dexterity: 14,
      constitution: 15,
      intelligence: 6,
      wisdom: 8,
      charisma: 5
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Shortsword",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        name: "Shortbow",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", passive_perception: "9" },
    languages: "understands all languages it spoke in life but can't speak",
    damageVulnerabilities: ["bludgeoning"],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["exhaustion", "poisoned"]
  },

  "zombie": {
    index: "zombie",
    name: "Zombie",
    size: "Medium",
    type: "undead",
    alignment: "neutral evil",
    armorClass: 8,
    hitPoints: 22,
    hitDice: "3d8+9",
    speed: { walk: "20 ft." },
    abilityScores: {
      strength: 13,
      dexterity: 6,
      constitution: 16,
      intelligence: 3,
      wisdom: 6,
      charisma: 5
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Slam",
        attackBonus: 3,
        damage: "1d6+1",
        damageType: "bludgeoning",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Undead Fortitude",
        description: "If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "8" },
    languages: "understands the languages it knew in life but can't speak",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["poisoned"]
  },

  "wolf": {
    index: "wolf",
    name: "Wolf",
    size: "Medium",
    type: "beast",
    alignment: "unaligned",
    armorClass: 13,
    hitPoints: 11,
    hitDice: "2d8+2",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 12,
      dexterity: 15,
      constitution: 12,
      intelligence: 3,
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
        damage: "2d4+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Hearing and Smell",
        description: "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        name: "Pack Tactics",
        description: "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },


};
