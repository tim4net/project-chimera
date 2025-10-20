/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 5
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART5: Record<string, Monster> = {
  "gladiator": {
    index: "gladiator",
    name: "Gladiator",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any alignment",
    armorClass: 16,
    hitPoints: 112,
    hitDice: "15d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 15,
      constitution: 16,
      intelligence: 10,
      wisdom: 12,
      charisma: 15
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Spear",
        attackBonus: 7,
        damage: "",
        damageType: "",
        description: "Melee or Ranged Weapon Attack: +7 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 11 (2d6 + 4) piercing damage, or 13 (2d8 + 4) piercing damage if used with two hands to make a melee attack."
      },
      {
        name: "Shield Bash",
        attackBonus: 7,
        damage: "2d4+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 9 (2d4 + 4) bludgeoning damage. If the target is a Medium or smaller creature, it must succeed on a DC 15 Strength saving throw or be knocked prone."
      }
    ],
    specialAbilities: [
      {
        name: "Brave",
        description: "The gladiator has advantage on saving throws against being frightened."
      },
      {
        name: "Brute",
        description: "A melee weapon deals one extra die of its damage when the gladiator hits with it (included in the attack)."
      }
    ],
    senses: { passive_perception: "11" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "gold-dragon-wyrmling": {
    index: "gold-dragon-wyrmling",
    name: "Gold Dragon Wyrmling",
    size: "Medium",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 17,
    hitPoints: 60,
    hitDice: "8d8",
    speed: { walk: "30 ft.", fly: "60 ft.", swim: "30 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 14,
      constitution: 17,
      intelligence: 14,
      wisdom: 11,
      charisma: 16
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Bite",
        attackBonus: 6,
        damage: "1d10+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (1d10 + 4) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon can breathe air and water."
      }
    ],
    senses: { blindsight: "10 ft.", darkvision: "60 ft.", passive_perception: "14" },
    languages: "Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: []
  },

  "gorgon": {
    index: "gorgon",
    name: "Gorgon",
    size: "Large",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 19,
    hitPoints: 114,
    hitDice: "12d10",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 11,
      constitution: 18,
      intelligence: 2,
      wisdom: 12,
      charisma: 7
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Gore",
        attackBonus: 8,
        damage: "2d12+5",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 18 (2d12 + 5) piercing damage."
      },
      {
        name: "Hooves",
        attackBonus: 8,
        damage: "2d10+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Trampling Charge",
        description: "If the gorgon moves at least 20 feet straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 16 Strength saving throw or be knocked prone. If the target is prone, the gorgon can make one attack with its hooves against it as a bonus action."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "14" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: ["Petrified"]
  },

  "green-hag": {
    index: "green-hag",
    name: "Green Hag",
    size: "Medium",
    type: "fey",
    alignment: "neutral evil",
    armorClass: 17,
    hitPoints: 82,
    hitDice: "11d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 12,
      constitution: 16,
      intelligence: 13,
      wisdom: 14,
      charisma: 14
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Claws",
        attackBonus: 6,
        damage: "2d8+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The hag can breathe air and water."
      },
      {
        name: "Innate Spellcasting",
        description: "The hag's innate spellcasting ability is Charisma (spell save DC 12). She can innately cast the following spells, requiring no material components:  At will: dancing lights, minor illusion, vicious mockery"
      },
      {
        name: "Mimicry",
        description: "The hag can mimic animal sounds and humanoid voices. A creature that hears the sounds can tell they are imitations with a successful DC 14 Wisdom (Insight) check."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "14" },
    languages: "Common, Draconic, Sylvan",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
