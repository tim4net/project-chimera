/**
 * D&D 5e SRD Monster Database - CR 11-15 Part 4
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_VERYHIGHCRPART4: Record<string, Monster> = {
  "erinyes": {
    index: "erinyes",
    name: "Erinyes",
    size: "Medium",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 18,
    hitPoints: 153,
    hitDice: "18d8",
    speed: { walk: "30 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 16,
      constitution: 18,
      intelligence: 14,
      wisdom: 14,
      charisma: 18
    },
    challengeRating: 12,
    proficiencyBonus: 4,
    xp: 8400,
    attacks: [
      {
        name: "Longsword",
        attackBonus: 8,
        damage: "",
        damageType: "",
        description: "Melee Weapon Attack: +8 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) slashing damage, or 9 (1d10 + 4) slashing damage if used with two hands, plus 13 (3d8) poison damage."
      },
      {
        name: "Longbow",
        attackBonus: 7,
        damage: "1d8+3",
        damageType: "Piercing",
        description: "Ranged Weapon Attack: +7 to hit, range 150/600 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 13 (3d8) poison damage, and the target must succeed on a DC 14 Constitution saving throw or be poisoned. The poison lasts until it is removed by the lesser restoration spell or similar magic."
      }
    ],
    specialAbilities: [
      {
        name: "Hellish Weapons",
        description: "The erinyes's weapon attacks are magical and deal an extra 13 (3d8) poison damage on a hit (included in the attacks)."
      },
      {
        name: "Magic Resistance",
        description: "The erinyes has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "12" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  },

  "gynosphinx": {
    index: "gynosphinx",
    name: "Gynosphinx",
    size: "Large",
    type: "monstrosity",
    alignment: "lawful neutral",
    armorClass: 17,
    hitPoints: 136,
    hitDice: "16d10",
    speed: { walk: "40 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 18,
      dexterity: 15,
      constitution: 16,
      intelligence: 18,
      wisdom: 18,
      charisma: 18
    },
    challengeRating: 11,
    proficiencyBonus: 4,
    xp: 7200,
    attacks: [
      {
        name: "Claw",
        attackBonus: 9,
        damage: "2d8+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Inscrutable",
        description: "The sphinx is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the sphinx's intentions or sincerity have disadvantage."
      },
      {
        name: "Magic Weapons",
        description: "The sphinx's weapon attacks are magical."
      },
      {
        name: "Spellcasting",
        description: "The sphinx is a 9th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 16, +8 to hit with spell attacks). It requires no material components to cast its spells. The sphinx has the following wizard spells prepared:  - Cantrips (at will): mage hand, minor illusion, prestidigitation - 1st level (4 slots): detect magic, identify, shield - 2nd level (3 slots): darkness, locate object, suggestion - 3rd level (3 slots): dispel magic, remove curse, tongues - 4th level (3 slots): banishment, greater invisibility - 5th level (1 slot): legend lore"
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "18" },
    languages: "Common, Sphinx",
    damageVulnerabilities: [],
    damageResistances: ["bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["psychic"],
    conditionImmunities: ["Charmed", "Frightened"],
    legendaryActions: [
      {
        name: "Claw Attack",
        description: "The sphinx makes one claw attack.",
        cost: 1
      },
      {
        name: "Teleport (Costs 2 Actions)",
        description: "The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see.",
        cost: 1
      },
      {
        name: "Cast a Spell (Costs 3 Actions)",
        description: "The sphinx casts a spell from its list of prepared spells, using a spell slot as normal.",
        cost: 1
      }
    ]
  },

  "horned-devil": {
    index: "horned-devil",
    name: "Horned Devil",
    size: "Large",
    type: "fiend",
    subtype: "devil",
    alignment: "lawful evil",
    armorClass: 18,
    hitPoints: 178,
    hitDice: "17d10",
    speed: { walk: "20 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 22,
      dexterity: 17,
      constitution: 21,
      intelligence: 12,
      wisdom: 16,
      charisma: 17
    },
    challengeRating: 11,
    proficiencyBonus: 4,
    xp: 7200,
    attacks: [
      {
        name: "Fork",
        attackBonus: 10,
        damage: "2d8+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 15 (2d8 + 6) piercing damage."
      },
      {
        name: "Tail",
        attackBonus: 10,
        damage: "1d8+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 10 (1d8 + 6) piercing damage. If the target is a creature other than an undead or a construct, it must succeed on a DC 17 Constitution saving throw or lose 10 (3d6) hit points at the start of each of its turns due to an infernal wound. Each time the devil hits the wounded target with this attack, the damage dealt by the wound increases by 10 (3d6). Any creature can take an action to stanch the wound with a successful DC 12 Wisdom (Medicine) check. The wound also closes if the target receives magical healing."
      },
      {
        name: "Hurl Flame",
        attackBonus: 7,
        damage: "4d6",
        damageType: "Fire",
        description: "Ranged Spell Attack: +7 to hit, range 150 ft., one target. Hit: 14 (4d6) fire damage. If the target is a flammable object that isn't being worn or carried, it also catches fire."
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
    senses: { darkvision: "120 ft.", passive_perception: "13" },
    languages: "Infernal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "bludgeoning, piercing, and slashing from nonmagical weapons that aren't silvered"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  }
};
