/**
 * D&D 5e SRD Monster Database - Base Collection Part 6
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART6: Record<string, Monster> = {
  "hobgoblin": {
    index: "hobgoblin",
    name: "Hobgoblin",
    size: "Medium",
    type: "humanoid",
    subtype: "goblinoid",
    alignment: "lawful evil",
    armorClass: 18,
    hitPoints: 11,
    hitDice: "2d8+2",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 13,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 10,
      charisma: 9
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Longsword",
        attackBonus: 3,
        damage: "1d8+1",
        damageType: "slashing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) slashing damage, or 6 (1d10 + 1) slashing damage if used with two hands."
      },
      {
        name: "Longbow",
        attackBonus: 3,
        damage: "1d8+1",
        damageType: "piercing",
        description: "Ranged Weapon Attack: +3 to hit, range 150/600 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Martial Advantage",
        description: "Once per turn, the hobgoblin can deal an extra 7 (2d6) damage to a creature it hits with a weapon attack if that creature is within 5 feet of an ally of the hobgoblin that isn't incapacitated."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Common, Goblin",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "bugbear": {
    index: "bugbear",
    name: "Bugbear",
    size: "Medium",
    type: "humanoid",
    subtype: "goblinoid",
    alignment: "chaotic evil",
    armorClass: 16,
    hitPoints: 27,
    hitDice: "5d8+5",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 8,
      wisdom: 11,
      charisma: 9
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Morningstar",
        attackBonus: 4,
        damage: "2d8+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 11 (2d8 + 2) piercing damage."
      },
      {
        name: "Javelin",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "piercing",
        description: "Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage in melee or 5 (1d6 + 2) piercing damage at range."
      }
    ],
    specialAbilities: [
      {
        name: "Brute",
        description: "A melee weapon deals one extra die of its damage when the bugbear hits with it (included in the attack)."
      },
      {
        name: "Surprise Attack",
        description: "If the bugbear surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 7 (2d6) damage from the attack."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Common, Goblin",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  // ========================================
  // CR 3-5: Deadly Encounters
  // ========================================

  "hell-hound": {
    index: "hell-hound",
    name: "Hell Hound",
    size: "Medium",
    type: "fiend",
    alignment: "lawful evil",
    armorClass: 15,
    hitPoints: 45,
    hitDice: "7d8+14",
    speed: { walk: "50 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 12,
      constitution: 14,
      intelligence: 6,
      wisdom: 13,
      charisma: 6
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "1d8+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 7 (2d6) fire damage."
      },
      {
        name: "Fire Breath",
        attackBonus: 0,
        damage: "6d6",
        damageType: "fire",
        description: "The hound exhales fire in a 15-foot cone. Each creature in that area must make a DC 12 Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Hearing and Smell",
        description: "The hound has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        name: "Pack Tactics",
        description: "The hound has advantage on an attack roll against a creature if at least one of the hound's allies is within 5 feet of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "15" },
    languages: "understands Infernal but can't speak it",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: []
  },

  "owlbear": {
    index: "owlbear",
    name: "Owlbear",
    size: "Large",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 13,
    hitPoints: 59,
    hitDice: "7d10+21",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 12,
      constitution: 17,
      intelligence: 3,
      wisdom: 12,
      charisma: 7
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
        description: "The owlbear makes two attacks: one with its beak and one with its claws."
      },
      {
        name: "Beak",
        attackBonus: 7,
        damage: "1d10+5",
        damageType: "piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one creature. Hit: 10 (1d10 + 5) piercing damage."
      },
      {
        name: "Claws",
        attackBonus: 7,
        damage: "2d8+5",
        damageType: "slashing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Sight and Smell",
        description: "The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "basilisk": {
    index: "basilisk",
    name: "Basilisk",
    size: "Medium",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 15,
    hitPoints: 52,
    hitDice: "8d8+16",
    speed: { walk: "20 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 8,
      constitution: 15,
      intelligence: 2,
      wisdom: 8,
      charisma: 7
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "2d6+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage plus 7 (2d6) poison damage."
      }
    ],
    specialAbilities: [
      {
        name: "Petrifying Gaze",
        description: "If a creature starts its turn within 30 feet of the basilisk and the two of them can see each other, the basilisk can force the creature to make a DC 12 Constitution saving throw if the basilisk isn't incapacitated. On a failed save, the creature magically begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "9" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },


};
