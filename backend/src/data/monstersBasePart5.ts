/**
 * D&D 5e SRD Monster Database - Base Collection Part 5
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART5: Record<string, Monster> = {
  "specter": {
    index: "specter",
    name: "Specter",
    size: "Medium",
    type: "undead",
    alignment: "chaotic evil",
    armorClass: 12,
    hitPoints: 22,
    hitDice: "5d8",
    speed: { walk: "0 ft.", fly: "50 ft. (hover)" },
    abilityScores: {
      strength: 1,
      dexterity: 14,
      constitution: 11,
      intelligence: 10,
      wisdom: 10,
      charisma: 11
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Life Drain",
        attackBonus: 4,
        damage: "3d6",
        damageType: "necrotic",
        description: "Melee Spell Attack: +4 to hit, reach 5 ft., one creature. Hit: 10 (3d6) necrotic damage. The target must succeed on a DC 10 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      }
    ],
    specialAbilities: [
      {
        name: "Incorporeal Movement",
        description: "The specter can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        name: "Sunlight Sensitivity",
        description: "While in sunlight, the specter has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "understands all languages it knew in life but can't speak",
    damageVulnerabilities: [],
    damageResistances: ["acid", "cold", "fire", "lightning", "thunder", "bludgeoning", "piercing", "slashing from nonmagical attacks"],
    damageImmunities: ["necrotic", "poison"],
    conditionImmunities: ["charmed", "exhaustion", "grappled", "paralyzed", "petrified", "poisoned", "prone", "restrained", "unconscious"]
  },

  "brown-bear": {
    index: "brown-bear",
    name: "Brown Bear",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 11,
    hitPoints: 34,
    hitDice: "4d10+12",
    speed: { walk: "40 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 10,
      constitution: 16,
      intelligence: 2,
      wisdom: 13,
      charisma: 7
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The bear makes two attacks: one with its bite and one with its claws."
      },
      {
        name: "Bite",
        attackBonus: 5,
        damage: "1d8+4",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage."
      },
      {
        name: "Claws",
        attackBonus: 5,
        damage: "2d6+4",
        damageType: "slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Smell",
        description: "The bear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    senses: { passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "black-bear": {
    index: "black-bear",
    name: "Black Bear",
    size: "Medium",
    type: "beast",
    alignment: "unaligned",
    armorClass: 11,
    hitPoints: 19,
    hitDice: "3d8+6",
    speed: { walk: "40 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 10,
      constitution: 14,
      intelligence: 2,
      wisdom: 12,
      charisma: 7
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The bear makes two attacks: one with its bite and one with its claws."
      },
      {
        name: "Bite",
        attackBonus: 3,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        name: "Claws",
        attackBonus: 3,
        damage: "2d4+2",
        damageType: "slashing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Smell",
        description: "The bear has advantage on Wisdom (Perception) checks that rely on smell."
      }
    ],
    senses: { passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "wight": {
    index: "wight",
    name: "Wight",
    size: "Medium",
    type: "undead",
    alignment: "neutral evil",
    armorClass: 14,
    hitPoints: 45,
    hitDice: "6d8+18",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 16,
      intelligence: 10,
      wisdom: 13,
      charisma: 15
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The wight makes two longsword attacks or two longbow attacks. It can use its Life Drain in place of one longsword attack."
      },
      {
        name: "Life Drain",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "necrotic",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 5 (1d6 + 2) necrotic damage. The target must succeed on a DC 13 Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest. The target dies if this effect reduces its hit point maximum to 0."
      },
      {
        name: "Longsword",
        attackBonus: 4,
        damage: "1d8+2",
        damageType: "slashing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands."
      }
    ],
    specialAbilities: [
      {
        name: "Sunlight Sensitivity",
        description: "While in sunlight, the wight has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "13" },
    languages: "the languages it knew in life",
    damageVulnerabilities: [],
    damageResistances: ["necrotic", "bludgeoning", "piercing", "slashing from nonmagical attacks that aren't silvered"],
    damageImmunities: ["poison"],
    conditionImmunities: ["exhaustion", "poisoned"]
  },

  "quasit": {
    index: "quasit",
    name: "Quasit",
    size: "Tiny",
    type: "fiend",
    subtype: "demon",
    alignment: "chaotic evil",
    armorClass: 13,
    hitPoints: 7,
    hitDice: "3d4",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 5,
      dexterity: 17,
      constitution: 10,
      intelligence: 7,
      wisdom: 10,
      charisma: 10
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Claws (Bite in Beast Form)",
        attackBonus: 4,
        damage: "1d4+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must succeed on a DC 10 Constitution saving throw or take 5 (2d4) poison damage and become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    specialAbilities: [
      {
        name: "Shapechanger",
        description: "The quasit can use its action to polymorph into a beast form that resembles a bat (speed 10 ft. fly 40 ft.), a centipede (40 ft., climb 40 ft.), or a toad (40 ft., swim 40 ft.), or back into its true form . Its statistics are the same in each form, except for the speed changes noted. Any equipment it is wearing or carrying isn't transformed . It reverts to its true form if it dies."
      },
      {
        name: "Magic Resistance",
        description: "The quasit has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "10" },
    languages: "Abyssal, Common",
    damageVulnerabilities: [],
    damageResistances: ["cold", "fire", "lightning", "bludgeoning", "piercing", "slashing from nonmagical attacks"],
    damageImmunities: ["poison"],
    conditionImmunities: ["poisoned"]
  },


};
