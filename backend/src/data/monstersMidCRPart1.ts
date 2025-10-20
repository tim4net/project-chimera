/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 1
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART1: Record<string, Monster> = {
  "air-elemental": {
    index: "air-elemental",
    name: "Air Elemental",
    size: "Large",
    type: "elemental",
    alignment: "neutral",
    armorClass: 15,
    hitPoints: 90,
    hitDice: "12d10",
    speed: { fly: "90 ft." },
    abilityScores: {
      strength: 14,
      dexterity: 20,
      constitution: 14,
      intelligence: 6,
      wisdom: 10,
      charisma: 6
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Slam",
        attackBonus: 8,
        damage: "2d8+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Air Form",
        description: "The elemental can enter a hostile creature's space and stop there. It can move through a space as narrow as 1 inch wide without squeezing."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Auran",
    damageVulnerabilities: [],
    damageResistances: ["lightning", "thunder", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["poison"],
    conditionImmunities: ["Exhaustion", "Grappled", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Unconscious"]
  },

  "barbed-devil": {
    index: "barbed-devil",
    name: "Barbed Devil",
    size: "Medium",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 15,
    hitPoints: 110,
    hitDice: "13d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 17,
      constitution: 18,
      intelligence: 12,
      wisdom: 14,
      charisma: 14
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Claw",
        attackBonus: 6,
        damage: "1d6+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        name: "Tail",
        attackBonus: 6,
        damage: "2d6+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage."
      },
      {
        name: "Hurl Flame",
        attackBonus: 5,
        damage: "3d6",
        damageType: "Fire",
        description: "Ranged Spell Attack: +5 to hit, range 150 ft., one target. Hit: 10 (3d6) fire damage. If the target is a flammable object that isn't being worn or carried, it also catches fire."
      }
    ],
    specialAbilities: [
      {
        name: "Barbed Hide",
        description: "At the start of each of its turns, the barbed devil deals 5 (1d10) piercing damage to any creature grappling it."
      },
      {
        name: "Devil's Sight",
        description: "Magical darkness doesn't impede the devil's darkvision."
      },
      {
        name: "Magic Resistance",
        description: "The devil has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "18" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  },

  "bearded-devil": {
    index: "bearded-devil",
    name: "Bearded Devil",
    size: "Medium",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 13,
    hitPoints: 52,
    hitDice: "8d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 15,
      constitution: 15,
      intelligence: 9,
      wisdom: 11,
      charisma: 11
    },
    challengeRating: 3,
    proficiencyBonus: 2,
    xp: 700,
    attacks: [
      {
        name: "Beard",
        attackBonus: 5,
        damage: "1d8+2",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 6 (1d8 + 2) piercing damage, and the target must succeed on a DC 12 Constitution saving throw or be poisoned for 1 minute. While poisoned in this way, the target can't regain hit points. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
      },
      {
        name: "Glaive",
        attackBonus: 5,
        damage: "1d10+3",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 10 ft., one target. Hit: 8 (1d10 + 3) slashing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 12 Constitution saving throw or lose 5 (1d10) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 5 (1d10). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing."
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
      },
      {
        name: "Steadfast",
        description: "The devil can't be frightened while it can see an allied creature within 30 feet of it."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "10" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  },

  "black-pudding": {
    index: "black-pudding",
    name: "Black Pudding",
    size: "Large",
    type: "ooze",
    alignment: "unaligned",
    armorClass: 7,
    hitPoints: 85,
    hitDice: "10d10",
    speed: { walk: "20 ft.", climb: "20 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 5,
      constitution: 16,
      intelligence: 1,
      wisdom: 6,
      charisma: 1
    },
    challengeRating: 4,
    proficiencyBonus: 2,
    xp: 1100,
    attacks: [
      {
        name: "Pseudopod",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage plus 18 (4d8) acid damage. In addition, nonmagical armor worn by the target is partly dissolved and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10."
      }
    ],
    specialAbilities: [
      {
        name: "Amorphous",
        description: "The pudding can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        name: "Corrosive Form",
        description: "A creature that touches the pudding or hits it with a melee attack while within 5 feet of it takes 4 (1d8) acid damage. Any nonmagical weapon made of metal or wood that hits the pudding corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal or wood that hits the pudding is destroyed after dealing damage. The pudding can eat through 2-inch-thick, nonmagical wood or metal in 1 round."
      },
      {
        name: "Spider Climb",
        description: "The pudding can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
      }
    ],
    senses: { blindsight: "60 ft. (blind beyond this radius)", passive_perception: "8" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["acid", "cold", "lightning", "slashing"],
    conditionImmunities: ["Blinded", "Charmed", "Exhaustion", "Frightened", "Prone"]
  }
};
