/**
 * D&D 5e SRD Monster Database - Base Collection Part 8
 *
 * Original monsters from initial database (3 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART8: Record<string, Monster> = {
  "earth-elemental": {
    index: "earth-elemental",
    name: "Earth Elemental",
    size: "Large",
    type: "elemental",
    alignment: "neutral",
    armorClass: 17,
    hitPoints: 126,
    hitDice: "12d10+60",
    speed: { walk: "30 ft.", burrow: "30 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 8,
      constitution: 20,
      intelligence: 5,
      wisdom: 10,
      charisma: 5
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The elemental makes two slam attacks."
      },
      {
        name: "Slam",
        attackBonus: 8,
        damage: "2d8+5",
        damageType: "bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Earth Glide",
        description: "The elemental can burrow through nonmagical, unworked earth and stone. While doing so, the elemental doesn't disturb the material it moves through."
      },
      {
        name: "Siege Monster",
        description: "The elemental deals double damage to objects and structures."
      }
    ],
    senses: { darkvision: "60 ft.", tremorsense: "60 ft.", passive_perception: "10" },
    languages: "Terran",
    damageVulnerabilities: ["thunder"],
    damageResistances: ["bludgeoning", "piercing", "slashing from nonmagical attacks"],
    damageImmunities: ["poison"],
    conditionImmunities: ["exhaustion", "paralyzed", "petrified", "poisoned", "unconscious"]
  },

  // ========================================
  // CR 7-10: Boss Encounters (Young Dragons)
  // ========================================

  "young-red-dragon": {
    index: "young-red-dragon",
    name: "Young Red Dragon",
    size: "Large",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 18,
    hitPoints: 178,
    hitDice: "17d10+85",
    speed: { walk: "40 ft.", climb: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 10,
      constitution: 21,
      intelligence: 14,
      wisdom: 11,
      charisma: 19
    },
    challengeRating: 10,
    proficiencyBonus: 4,
    xp: 5900,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        name: "Bite",
        attackBonus: 10,
        damage: "2d10+6",
        damageType: "piercing",
        description: "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 3 (1d6) fire damage."
      },
      {
        name: "Claw",
        attackBonus: 10,
        damage: "2d6+6",
        damageType: "slashing",
        description: "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        name: "Fire Breath",
        attackBonus: 0,
        damage: "16d6",
        damageType: "fire",
        description: "The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [],
    senses: { blindsight: "30 ft.", darkvision: "120 ft.", passive_perception: "14" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: []
  },

  "young-black-dragon": {
    index: "young-black-dragon",
    name: "Young Black Dragon",
    size: "Large",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 18,
    hitPoints: 127,
    hitDice: "15d10+45",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 14,
      constitution: 17,
      intelligence: 12,
      wisdom: 11,
      charisma: 15
    },
    challengeRating: 7,
    proficiencyBonus: 3,
    xp: 2900,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The dragon makes three attacks: one with its bite and two with its claws."
      },
      {
        name: "Bite",
        attackBonus: 7,
        damage: "2d10+4",
        damageType: "piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 10 ft., one target. Hit: 15 (2d10 + 4) piercing damage plus 4 (1d8) acid damage."
      },
      {
        name: "Claw",
        attackBonus: 7,
        damage: "2d6+4",
        damageType: "slashing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      },
      {
        name: "Acid Breath",
        attackBonus: 0,
        damage: "11d8",
        damageType: "acid",
        description: "The dragon exhales acid in a 30-foot line that is 5 feet wide. Each creature in that line must make a DC 14 Dexterity saving throw, taking 49 (11d8) acid damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon can breathe air and water."
      }
    ],
    senses: { blindsight: "30 ft.", darkvision: "120 ft.", passive_perception: "14" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["acid"],
    conditionImmunities: [],
  },
};
