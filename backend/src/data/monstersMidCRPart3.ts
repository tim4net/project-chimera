/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART3: Record<string, Monster> = {
  "doppelganger": {
    index: "doppelganger",
    name: "Doppelganger",
    size: "Medium",
    type: "monstrosity",
    subtype: "shapechanger",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 52,
    hitDice: "8d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 11,
      dexterity: 18,
      constitution: 14,
      intelligence: 11,
      wisdom: 12,
      charisma: 14
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Slam",
        attackBonus: 6,
        damage: "1d6+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 7 (1d6 + 4) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Shapechanger",
        description: "The doppelganger can use its action to polymorph into a Small or Medium humanoid it has seen, or back into its true form. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        name: "Ambusher",
        description: "In the first round of combat, the doppelganger has advantage on attack rolls against any creature it has surprised."
      },
      {
        name: "Surprise Attack",
        description: "If the doppelganger surprises a creature and hits it with an attack during the first round of combat, the target takes an extra 10 (3d6) damage from the attack."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "11" },
    languages: "Common",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: ["Charmed"]
  },

  "elephant": {
    index: "elephant",
    name: "Elephant",
    size: "Huge",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 76,
    hitDice: "8d12",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 22,
      dexterity: 9,
      constitution: 17,
      intelligence: 3,
      wisdom: 11,
      charisma: 6
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Gore",
        attackBonus: 8,
        damage: "3d8+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 19 (3d8 + 6) piercing damage."
      },
      {
        name: "Stomp",
        attackBonus: 8,
        damage: "3d10+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one prone creature. Hit: 22 (3d10 + 6) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Trampling Charge",
        description: "If the elephant moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 12 Strength saving throw or be knocked prone. If the target is prone, the elephant can make one stomp attack against it as a bonus action."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "ettin": {
    index: "ettin",
    name: "Ettin",
    size: "Large",
    type: "giant",
    alignment: "chaotic evil",
    armorClass: 12,
    hitPoints: 85,
    hitDice: "10d10",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 21,
      dexterity: 8,
      constitution: 17,
      intelligence: 6,
      wisdom: 10,
      charisma: 8
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Battleaxe",
        attackBonus: 7,
        damage: "2d8+5",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) slashing damage."
      },
      {
        name: "Morningstar",
        attackBonus: 7,
        damage: "2d8+5",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Two Heads",
        description: "The ettin has advantage on Wisdom (Perception) checks and on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious."
      },
      {
        name: "Wakeful",
        description: "When one of the ettin's heads is asleep, its other head is awake."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "14" },
    languages: "Giant, Orc",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "flesh-golem": {
    index: "flesh-golem",
    name: "Flesh Golem",
    size: "Medium",
    type: "construct",
    alignment: "neutral",
    armorClass: 9,
    hitPoints: 93,
    hitDice: "11d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 9,
      constitution: 18,
      intelligence: 6,
      wisdom: 10,
      charisma: 5
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Slam",
        attackBonus: 7,
        damage: "2d8+4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Berserk",
        description: "Whenever the golem starts its turn with 40 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points. The golem's creator, if within 60 feet of the berserk golem, can try to calm it by speaking firmly and persuasively. The golem must be able to hear its creator, who must take an action to make a DC 15 Charisma (Persuasion) check. If the check succeeds, the golem ceases being berserk. If it takes damage while still at 40 hit points or fewer, the golem might go berserk again."
      },
      {
        name: "Aversion of Fire",
        description: "If the golem takes fire damage, it has disadvantage on attack rolls and ability checks until the end of its next turn."
      },
      {
        name: "Immutable Form",
        description: "The golem is immune to any spell or effect that would alter its form."
      },
      {
        name: "Lightning Absorption",
        description: "Whenever the golem is subjected to lightning damage, it takes no damage and instead regains a number of hit points equal to the lightning damage dealt."
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
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "understands the languages of its creator but can't speak",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning", "poison", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't adamantine"],
    conditionImmunities: ["Charmed", "Exhaustion", "Frightened", "Paralyzed", "Petrified", "Poisoned"]
  }
};
