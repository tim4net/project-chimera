/**
 * D&D 5e SRD Monster Database - CR 6-10 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_HIGHCRPART3: Record<string, Monster> = {
  "cloud-giant": {
    index: "cloud-giant",
    name: "Cloud Giant",
    size: "Huge",
    type: "giant",
    alignment: "neutral good (50%) or neutral evil (50%)",
    armorClass: 14,
    hitPoints: 200,
    hitDice: "16d12",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 10,
      constitution: 22,
      intelligence: 12,
      wisdom: 16,
      charisma: 16
    },
    challengeRating: 9,
    proficiencyBonus: 4,
    xp: 5000,
    attacks: [
      {
        name: "Morningstar",
        attackBonus: 12,
        damage: "3d8+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 21 (3d8 + 8) piercing damage."
      },
      {
        name: "Rock",
        attackBonus: 12,
        damage: "4d10+8",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +12 to hit, range 60/240 ft., one target. Hit: 30 (4d10 + 8) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Smell",
        description: "The giant has advantage on Wisdom (Perception) checks that rely on smell."
      },
      {
        name: "Innate Spellcasting",
        description: "The giant's innate spellcasting ability is Charisma. It can innately cast the following spells, requiring no material components:  At will: detect magic, fog cloud, light 3/day each: feather fall, fly, misty step, telekinesis 1/day each: control weather, gaseous form"
      }
    ],
    senses: { passive_perception: "17" },
    languages: "Common, Giant",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "deva": {
    index: "deva",
    name: "Deva",
    size: "Medium",
    type: "celestial",
    alignment: "lawful good",
    armorClass: 17,
    hitPoints: 136,
    hitDice: "16d8",
    speed: { walk: "30 ft.", fly: "90 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 18,
      constitution: 18,
      intelligence: 17,
      wisdom: 20,
      charisma: 20
    },
    challengeRating: 10,
    proficiencyBonus: 4,
    xp: 5900,
    attacks: [
      {
        name: "Mace",
        attackBonus: 8,
        damage: "1d6+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) bludgeoning damage plus 18 (4d8) radiant damage."
      }
    ],
    specialAbilities: [
      {
        name: "Angelic Weapons",
        description: "The deva's weapon attacks are magical. When the deva hits with any weapon, the weapon deals an extra 4d8 radiant damage (included in the attack)."
      },
      {
        name: "Innate Spellcasting",
        description: "The deva's spellcasting ability is Charisma (spell save DC 17). The deva can innately cast the following spells, requiring only verbal components: At will: detect evil and good 1/day each: commune, raise dead"
      },
      {
        name: "Magic Resistance",
        description: "The deva has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "19" },
    languages: "all, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["radiant", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: [],
    conditionImmunities: ["Charmed", "Exhaustion", "Frightened"]
  },

  "drider": {
    index: "drider",
    name: "Drider",
    size: "Large",
    type: "monstrosity",
    alignment: "chaotic evil",
    armorClass: 19,
    hitPoints: 123,
    hitDice: "13d10",
    speed: { walk: "30 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 16,
      constitution: 18,
      intelligence: 13,
      wisdom: 14,
      charisma: 12
    },
    challengeRating: 6,
    proficiencyBonus: 3,
    xp: 2300,
    attacks: [
      {
        name: "Bite",
        attackBonus: 6,
        damage: "1d4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 2 (1d4) piercing damage plus 9 (2d8) poison damage."
      },
      {
        name: "Longsword",
        attackBonus: 6,
        damage: "",
        damageType: "",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands."
      },
      {
        name: "Longbow",
        attackBonus: 6,
        damage: "1d8+3",
        damageType: "Piercing",
        description: "Ranged Weapon Attack: +6 to hit, range 150/600 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) poison damage."
      }
    ],
    specialAbilities: [
      {
        name: "Fey Ancestry",
        description: "The drider has advantage on saving throws against being charmed, and magic can't put the drider to sleep."
      },
      {
        name: "Innate Spellcasting",
        description: "The drider's innate spellcasting ability is Wisdom (spell save DC 13). The drider can innately cast the following spells, requiring no material components: At will: dancing lights 1/day each: darkness, faerie fire"
      },
      {
        name: "Spider Climb",
        description: "The drider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        name: "Sunlight Sensitivity",
        description: "While in sunlight, the drider has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight."
      },
      {
        name: "Web Walker",
        description: "The drider ignores movement restrictions caused by webbing."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "15" },
    languages: "Elvish, Undercommon",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "fire-giant": {
    index: "fire-giant",
    name: "Fire Giant",
    size: "Huge",
    type: "giant",
    alignment: "lawful evil",
    armorClass: 18,
    hitPoints: 162,
    hitDice: "13d12",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 25,
      dexterity: 9,
      constitution: 23,
      intelligence: 10,
      wisdom: 14,
      charisma: 13
    },
    challengeRating: 9,
    proficiencyBonus: 4,
    xp: 5000,
    attacks: [
      {
        name: "Greatsword",
        attackBonus: 11,
        damage: "6d6+7",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 28 (6d6 + 7) slashing damage."
      },
      {
        name: "Rock",
        attackBonus: 11,
        damage: "4d10+7",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +11 to hit, range 60/240 ft., one target. Hit: 29 (4d10 + 7) bludgeoning damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "16" },
    languages: "Giant",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: []
  }
};
