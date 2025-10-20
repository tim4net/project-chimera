/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 4
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART4: Record<string, Monster> = {
  "ghost": {
    index: "ghost",
    name: "Ghost",
    size: "Medium",
    type: "undead",
    alignment: "any alignment",
    armorClass: 11,
    hitPoints: 45,
    hitDice: "10d8",
    speed: { walk: "0 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 7,
      dexterity: 13,
      constitution: 10,
      intelligence: 10,
      wisdom: 12,
      charisma: 17
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Withering Touch",
        attackBonus: 5,
        damage: "4d6+3",
        damageType: "Necrotic",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 17 (4d6 + 3) necrotic damage."
      }
    ],
    specialAbilities: [
      {
        name: "Ethereal Sight",
        description: "The ghost can see 60 ft. into the Ethereal Plane when it is on the Material Plane, and vice versa."
      },
      {
        name: "Incorporeal Movement",
        description: "The ghost can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "11" },
    languages: "any languages it knew in life",
    damageVulnerabilities: [],
    damageResistances: ["acid", "fire", "lightning", "thunder", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["cold", "necrotic", "poison"],
    conditionImmunities: ["Charmed", "Exhaustion", "Frightened", "Grappled", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained"]
  },

  "giant-crocodile": {
    index: "giant-crocodile",
    name: "Giant Crocodile",
    size: "Huge",
    type: "beast",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 85,
    hitDice: "9d12",
    speed: { walk: "30 ft.", swim: "50 ft." },
    abilityScores: {
      strength: 21,
      dexterity: 9,
      constitution: 17,
      intelligence: 2,
      wisdom: 10,
      charisma: 7
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Bite",
        attackBonus: 8,
        damage: "3d10+5",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 21 (3d10 + 5) piercing damage, and the target is grappled (escape DC 16). Until this grapple ends, the target is restrained, and the crocodile can't bite another target."
      },
      {
        name: "Tail",
        attackBonus: 8,
        damage: "2d8+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target not grappled by the crocodile. Hit: 14 (2d8 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 16 Strength saving throw or be knocked prone."
      }
    ],
    specialAbilities: [
      {
        name: "Hold Breath",
        description: "The crocodile can hold its breath for 30 minutes."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "giant-scorpion": {
    index: "giant-scorpion",
    name: "Giant Scorpion",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 15,
    hitPoints: 52,
    hitDice: "7d10",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 13,
      constitution: 15,
      intelligence: 1,
      wisdom: 9,
      charisma: 3
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Claw",
        attackBonus: 4,
        damage: "1d8+2",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) bludgeoning damage, and the target is grappled (escape DC 12). The scorpion has two claws, each of which can grapple only one target."
      },
      {
        name: "Sting",
        attackBonus: 4,
        damage: "1d10+2",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 7 (1d10 + 2) piercing damage, and the target must make a DC 12 Constitution saving throw, taking 22 (4d10) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [],
    senses: { blindsight: "60 ft.", passive_perception: "9" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "giant-shark": {
    index: "giant-shark",
    name: "Giant Shark",
    size: "Huge",
    type: "beast",
    alignment: "unaligned",
    armorClass: 13,
    hitPoints: 126,
    hitDice: "11d12",
    speed: { swim: "50 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 11,
      constitution: 21,
      intelligence: 1,
      wisdom: 10,
      charisma: 5
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Bite",
        attackBonus: 9,
        damage: "3d10+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 22 (3d10 + 6) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Blood Frenzy",
        description: "The shark has advantage on melee attack rolls against any creature that doesn't have all its hit points."
      },
      {
        name: "Water Breathing",
        description: "The shark can breathe only underwater."
      }
    ],
    senses: { blindsight: "60 ft.", passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
