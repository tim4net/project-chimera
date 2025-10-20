/**
 * D&D 5e SRD Monster Database - CR 6-10 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_HIGHCRPART2: Record<string, Monster> = {
  "chain-devil": {
    index: "chain-devil",
    name: "Chain Devil",
    size: "Medium",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 16,
    hitPoints: 85,
    hitDice: "10d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 15,
      constitution: 18,
      intelligence: 11,
      wisdom: 12,
      charisma: 14
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Chain",
        attackBonus: 8,
        damage: "2d6+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the devil isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."
      }
    ],
    specialAbilities: [
      {
        name: "Devil's Sight",
        description: "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        name: "Magic Resistance",
        description: "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "11" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  },

  "chimera": {
    index: "chimera",
    name: "Chimera",
    size: "Large",
    type: "monstrosity",
    alignment: "chaotic evil",
    armorClass: 14,
    hitPoints: 114,
    hitDice: "12d10",
    speed: { walk: "30 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 11,
      constitution: 19,
      intelligence: 3,
      wisdom: 14,
      charisma: 10
    },
    challengeRating: 6,
    proficiencyBonus: 3,
    xp: 2300,
    attacks: [
      {
        name: "Bite",
        attackBonus: 7,
        damage: "2d6+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) piercing damage."
      },
      {
        name: "Horns",
        attackBonus: 7,
        damage: "1d12+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 10 (1d12 + 4) bludgeoning damage."
      },
      {
        name: "Claws",
        attackBonus: 7,
        damage: "2d6+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", passive_perception: "18" },
    languages: "understands Draconic but can't speak",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "clay-golem": {
    index: "clay-golem",
    name: "Clay Golem",
    size: "Large",
    type: "construct",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 133,
    hitDice: "14d10",
    speed: { walk: "20 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 9,
      constitution: 18,
      intelligence: 3,
      wisdom: 8,
      charisma: 1
    },
    challengeRating: 9,
    proficiencyBonus: 4,
    xp: 5000,
    attacks: [
      {
        name: "Slam",
        attackBonus: 8,
        damage: "2d10+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 15 Constitution saving throw or have its hit point maximum reduced by an amount equal to the damage taken. The target dies if this attack reduces its hit point maximum to 0. The reduction lasts until removed by the greater restoration spell or other magic."
      }
    ],
    specialAbilities: [
      {
        name: "Acid Absorption",
        description: "Whenever the golem is subjected to acid damage, it takes no damage and instead regains a number of hit points equal to the acid damage dealt."
      },
      {
        name: "Berserk",
        description: "Whenever the golem starts its turn with 60 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points."
      },
      {
        name: "Immutable Form",
        description: "The golem is immune to any spell or effect that would alter its form."
      },
      {
        name: "Magic Resistance",
        description: "The golem has advantage on saving throws against spells and other magical effects."
      },
      {
        name: "Magic Weapons",
        description: "The golem's weapon attacks are magical."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "9" },
    languages: "understands the languages of its creator but can't speak",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["acid", "poison", "psychic", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"],
    conditionImmunities: ["Charmed", "Exhaustion", "Frightened", "Paralyzed", "Petrified", "Poisoned"]
  },

  "cloaker": {
    index: "cloaker",
    name: "Cloaker",
    size: "Large",
    type: "aberration",
    alignment: "chaotic neutral",
    armorClass: 14,
    hitPoints: 78,
    hitDice: "12d10",
    speed: { walk: "10 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 15,
      constitution: 12,
      intelligence: 13,
      wisdom: 12,
      charisma: 14
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Bite",
        attackBonus: 6,
        damage: "2d6+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one creature. Hit: 10 (2d6 + 3) piercing damage, and if the target is Large or smaller, the cloaker attaches to it. If the cloaker has advantage against the target, the cloaker attaches to the target's head, and the target is blinded and unable to breathe while the cloaker is attached. While attached, the cloaker can make this attack only against the target and has advantage on the attack roll. The cloaker can detach itself by spending 5 feet of its movement. A creature, including the target, can take its action to detach the cloaker by succeeding on a DC 16 Strength check."
      },
      {
        name: "Tail",
        attackBonus: 6,
        damage: "1d8+3",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +6 to hit, reach 10 ft., one creature. Hit: 7 (1d8 + 3) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Damage Transfer",
        description: "While attached to a creature, the cloaker takes only half the damage dealt to it (rounded down). and that creature takes the other half."
      },
      {
        name: "False Appearance",
        description: "While the cloaker remains motionless without its underside exposed, it is indistinguishable from a dark leather cloak."
      },
      {
        name: "Light Sensitivity",
        description: "While in bright light, the cloaker has disadvantage on attack rolls and Wisdom (Perception) checks that rely on sight."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "11" },
    languages: "Deep Speech, Undercommon",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
