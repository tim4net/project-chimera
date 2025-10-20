/**
 * D&D 5e SRD Monster Database - CR 6-10 Part 5
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_HIGHCRPART5: Record<string, Monster> = {
  "hezrou": {
    index: "hezrou",
    name: "Hezrou",
    size: "Large",
    type: "fiend",
    subtype: "demon",
    alignment: "chaotic evil",
    armorClass: 16,
    hitPoints: 136,
    hitDice: "13d10",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 17,
      constitution: 20,
      intelligence: 5,
      wisdom: 12,
      charisma: 13
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Bite",
        attackBonus: 7,
        damage: "2d10+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 15 (2d10 + 4) piercing damage."
      },
      {
        name: "Claws",
        attackBonus: 7,
        damage: "2d6+4",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 11 (2d6 + 4) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Magic Resistance",
        description: "The hezrou has advantage on saving throws against spells and other magical effects."
      },
      {
        name: "Stench",
        description: "Any creature that starts its turn within 10 feet of the hezrou must succeed on a DC 14 Constitution saving throw or be poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the hezrou's stench for 24 hours."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "11" },
    languages: "Abyssal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "fire", "lightning", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["poison"],
    conditionImmunities: ["Poisoned"]
  },

  "hydra": {
    index: "hydra",
    name: "Hydra",
    size: "Huge",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 15,
    hitPoints: 172,
    hitDice: "15d12",
    speed: { walk: "30 ft.", swim: "30 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 12,
      constitution: 20,
      intelligence: 2,
      wisdom: 10,
      charisma: 7
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Bite",
        attackBonus: 8,
        damage: "1d10+5",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 10 (1d10 + 5) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Hold Breath",
        description: "The hydra can hold its breath for 1 hour."
      },
      {
        name: "Multiple Heads",
        description: "The hydra has five heads. While it has more than one head, the hydra has advantage on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious. Whenever the hydra takes 25 or more damage in a single turn, one of its heads dies. If all its heads die, the hydra dies. At the end of its turn, it grows two heads for each of its heads that died since its last turn, unless it has taken fire damage since its last turn. The hydra regains 10 hit points for each head regrown in this way."
      },
      {
        name: "Reactive Heads",
        description: "For each head the hydra has beyond one, it gets an extra reaction that can be used only for opportunity attacks."
      },
      {
        name: "Wakeful",
        description: "While the hydra sleeps, at least one of its heads is awake."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "16" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
