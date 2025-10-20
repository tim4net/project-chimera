/**
 * D&D 5e SRD Monster Database - Base Collection Part 4
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART4: Record<string, Monster> = {
  "giant-spider": {
    index: "giant-spider",
    name: "Giant Spider",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 26,
    hitDice: "4d10+4",
    speed: { walk: "30 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 14,
      dexterity: 16,
      constitution: 12,
      intelligence: 2,
      wisdom: 11,
      charisma: 4
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "1d8+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 7 (1d8 + 3) piercing damage, and the target must make a DC 11 Constitution saving throw, taking 9 (2d8) poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
      }
    ],
    specialAbilities: [
      {
        name: "Spider Climb",
        description: "The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      },
      {
        name: "Web Sense",
        description: "While in contact with a web, the spider knows the exact location of any other creature in contact with the same web."
      },
      {
        name: "Web Walker",
        description: "The spider ignores movement restrictions caused by webbing."
      }
    ],
    senses: { blindsight: "10 ft.", darkvision: "60 ft.", passive_perception: "10" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "ghoul": {
    index: "ghoul",
    name: "Ghoul",
    size: "Medium",
    type: "undead",
    alignment: "chaotic evil",
    armorClass: 12,
    hitPoints: 22,
    hitDice: "5d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 13,
      dexterity: 15,
      constitution: 10,
      intelligence: 7,
      wisdom: 10,
      charisma: 6
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Bite",
        attackBonus: 2,
        damage: "2d6+2",
        damageType: "piercing",
        description: "Melee Weapon Attack: +2 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) piercing damage."
      },
      {
        name: "Claws",
        attackBonus: 4,
        damage: "2d4+2",
        damageType: "slashing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) slashing damage. If the target is a creature other than an elf or undead, it must succeed on a DC 10 Constitution saving throw or be paralyzed for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Common",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["charmed", "exhaustion", "poisoned"]
  },

  "imp": {
    index: "imp",
    name: "Imp",
    size: "Tiny",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 13,
    hitPoints: 10,
    hitDice: "3d4+3",
    speed: { walk: "20 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 6,
      dexterity: 17,
      constitution: 13,
      intelligence: 11,
      wisdom: 12,
      charisma: 14
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Sting (Bite in Beast Form)",
        attackBonus: 5,
        damage: "1d4+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must make on a DC 11 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [
      {
        name: "Shapechanger",
        description: "The imp can use its action to polymorph into a beast form that resembles a rat (speed 20 ft.), a raven (20 ft., fly 60 ft.), or a spider (20 ft., climb 20 ft.), or back into its true form. Its statistics are the same in each form, except for the speed changes noted. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        name: "Devil's Sight",
        description: "Magical darkness doesn't impede the imp's darkvision."
      },
      {
        name: "Magic Resistance",
        description: "The imp has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "11" },
    languages: "Infernal, Common",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning", "piercing", "slashing from nonmagical attacks not made with silvered weapons"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["poisoned"]
  },

  "animated-armor": {
    index: "animated-armor",
    name: "Animated Armor",
    size: "Medium",
    type: "construct",
    alignment: "unaligned",
    armorClass: 18,
    hitPoints: 33,
    hitDice: "6d8+6",
    speed: { walk: "25 ft." },
    abilityScores: {
      strength: 14,
      dexterity: 11,
      constitution: 13,
      intelligence: 1,
      wisdom: 3,
      charisma: 1
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
        description: "The armor makes two melee attacks."
      },
      {
        name: "Slam",
        attackBonus: 4,
        damage: "1d6+2",
        damageType: "bludgeoning",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Antimagic Susceptibility",
        description: "The armor is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the armor must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute."
      },
      {
        name: "False Appearance",
        description: "While the armor remains motionless, it is indistinguishable from a normal suit of armor."
      }
    ],
    senses: { blindsight: "60 ft. (blind beyond this radius)", passive_perception: "6" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison", "psychic"],
    conditionImmunities: ["blinded", "charmed", "deafened", "exhaustion", "frightened", "paralyzed", "petrified", "poisoned"]
  },

  // ========================================
  // CR 2: Hard Encounters
  // ========================================

  "orc": {
    index: "orc",
    name: "Orc",
    size: "Medium",
    type: "humanoid",
    subtype: "orc",
    alignment: "chaotic evil",
    armorClass: 13,
    hitPoints: 15,
    hitDice: "2d8+6",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 12,
      constitution: 16,
      intelligence: 7,
      wisdom: 11,
      charisma: 10
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Greataxe",
        attackBonus: 5,
        damage: "1d12+3",
        damageType: "slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage."
      },
      {
        name: "Javelin",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "piercing",
        description: "Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Aggressive",
        description: "As a bonus action, the orc can move up to its speed toward a hostile creature that it can see."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Common, Orc",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },


};
