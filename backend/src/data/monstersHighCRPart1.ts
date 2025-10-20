/**
 * D&D 5e SRD Monster Database - CR 6-10 Part 1
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_HIGHCRPART1: Record<string, Monster> = {
  "aboleth": {
    index: "aboleth",
    name: "Aboleth",
    size: "Large",
    type: "aberration",
    alignment: "lawful evil",
    armorClass: 17,
    hitPoints: 135,
    hitDice: "18d10",
    speed: { walk: "10 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 21,
      dexterity: 9,
      constitution: 15,
      intelligence: 18,
      wisdom: 15,
      charisma: 18
    },
    challengeRating: 10,
    proficiencyBonus: 4,
    xp: 5900,
    attacks: [
      {
        name: "Tentacle",
        attackBonus: 9,
        damage: "2d6+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed."
      },
      {
        name: "Tail",
        attackBonus: 9,
        damage: "3d6+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 15 (3d6 + 5) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The aboleth can breathe air and water."
      },
      {
        name: "Mucous Cloud",
        description: "While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 ft. of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater."
      },
      {
        name: "Probing Telepathy",
        description: "If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires if the aboleth can see the creature."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "20" },
    languages: "Deep Speech, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    legendaryActions: [
      {
        name: "Detect",
        description: "The aboleth makes a Wisdom (Perception) check.",
        cost: 1
      },
      {
        name: "Tail Swipe",
        description: "The aboleth makes one tail attack.",
        cost: 1
      },
      {
        name: "Psychic Drain (Costs 2 Actions)",
        description: "One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes.",
        cost: 1
      }
    ]
  },

  "assassin": {
    index: "assassin",
    name: "Assassin",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any non-good alignment",
    armorClass: 15,
    hitPoints: 78,
    hitDice: "12d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 11,
      dexterity: 16,
      constitution: 14,
      intelligence: 13,
      wisdom: 11,
      charisma: 10
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Shortsword",
        attackBonus: 6,
        damage: "1d6+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."
      },
      {
        name: "Light Crossbow",
        attackBonus: 6,
        damage: "1d8+3",
        damageType: "Piercing",
        description: "Ranged Weapon Attack: +6 to hit, range 80/320 ft., one target. Hit: 7 (1d8 + 3) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 24 (7d6) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [
      {
        name: "Assassinate",
        description: "During its first turn, the assassin has advantage on attack rolls against any creature that hasn't taken a turn. Any hit the assassin scores against a surprised creature is a critical hit."
      },
      {
        name: "Evasion",
        description: "If the assassin is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the assassin instead takes no damage if it succeeds on the saving throw, and only half damage if it fails."
      },
      {
        name: "Sneak Attack (1/Turn)",
        description: "The assassin deals an extra 13 (4d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 ft. of an ally of the assassin that isn't incapacitated and the assassin doesn't have disadvantage on the attack roll."
      }
    ],
    senses: { passive_perception: "13" },
    languages: "Thieves' cant plus any two languages",
    damageVulnerabilities: [],
    damageResistances: ["poison"],
    damageImmunities: [],
    conditionImmunities: []
  },

  "bone-devil": {
    index: "bone-devil",
    name: "Bone Devil",
    size: "Large",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 19,
    hitPoints: 142,
    hitDice: "15d10",
    speed: { walk: "40 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 16,
      constitution: 18,
      intelligence: 13,
      wisdom: 14,
      charisma: 16
    },
    challengeRating: 9,
    proficiencyBonus: 4,
    xp: 5000,
    attacks: [
      {
        name: "Claw",
        attackBonus: 8,
        damage: "1d8+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 8 (1d8 + 4) slashing damage."
      },
      {
        name: "Sting",
        attackBonus: 8,
        damage: "2d8+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 13 (2d8 + 4) piercing damage plus 17 (5d6) poison damage, and the target must succeed on a DC 14 Constitution saving throw or become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
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
    senses: { darkvision: "120 ft.", passive_perception: "12" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  }
};
