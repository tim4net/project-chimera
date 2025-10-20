/**
 * Barbarian Class Data
 * Imported from D&D 5e SRD
 */

import { ClassData } from '../classTypes';

export const BARBARIAN_DATA: ClassData = {
  name: "Barbarian",
  hitDice: 12,
  proficiencies: {
    armor: ["Light Armor", "Medium Armor"],
    weapons: ["Simple Weapons", "Martial Weapons"],
    tools: [],
    savingThrows: ["STR", "CON"]
  },
  features: [
  { level: 1, name: "Rage", description: "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain the following benefits if you aren't wearing heavy armor:\n\n- You have advantage on Strength checks and Strength saving throws.\n\n- When you make a melee weapon Attack using Strength, you gain a +2 bonus to the damage roll. This bonus increases as you level.\n\n- You have Resistance to bludgeoning, piercing, and slashing damage.\n\nIf you are able to cast Spells, you can't cast them or concentrate on them while raging.\n\nYour rage lasts for 1 minute. It ends early if you are knocked Unconscious or if Your Turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on Your Turn as a Bonus Action.\n\nOnce you have raged the maximum number of times for your barbarian level, you must finish a Long Rest before you can rage again. You may rage 2 times at 1st level, 3 at 3rd, 4 at 6th, 5 at 12th, and 6 at 17th.", type: "active" },
  { level: 1, name: "Unarmored Defense", description: "While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.", type: "passive" },
  { level: 2, name: "Reckless Attack", description: "Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.", type: "active" },
  { level: 2, name: "Danger Sense", description: "At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger. You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can't be blinded, deafened, or incapacitated.", type: "passive" },
  { level: 3, name: "Primal Path", description: "At 3rd level, you choose a path that shapes the nature of your rage. Choose the Path of the Berserker or the Path of the Totem Warrior, both detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.", type: "passive" },
  { level: 4, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 5, name: "Extra Attack", description: "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.", type: "active" },
  { level: 5, name: "Fast Movement", description: "Starting at 5th level, your speed increases by 10 feet while you aren't wearing heavy armor.", type: "passive" },
  { level: 6, name: "Path feature", description: "At 3rd level, you choose a path that shapes the nature of your rage. Choose the Path of the Berserker or the Path of the Totem Warrior, both detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.", type: "passive" },
  { level: 7, name: "Feral Instinct", description: "By 7th level, your instincts are so honed that you have advantage on initiative rolls.\n\nAdditionally, if you are surprised at the beginning of combat and aren't incapacitated, you can act normally on your first turn, but only if you enter your rage before doing anything else on that turn.", type: "passive" },
  { level: 8, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 9, name: "Brutal Critical (1 die)", description: "Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.", type: "passive" },
  { level: 10, name: "Path feature", description: "At 3rd level, you choose a path that shapes the nature of your rage. Choose the Path of the Berserker or the Path of the Totem Warrior, both detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.", type: "passive" },
  { level: 11, name: "Relentless Rage", description: "Starting at 11th level, your rage can keep you fighting despite grievous wounds. If you drop to 0 hit points while you're raging and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, you drop to 1 hit point instead.\n\nEach time you use this feature after the first, the DC increases by 5. When you finish a short or long rest, the DC resets to 10.", type: "active" },
  { level: 12, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 13, name: "Brutal Critical (2 dice)", description: "Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.", type: "passive" },
  { level: 14, name: "Path feature", description: "At 3rd level, you choose a path that shapes the nature of your rage. Choose the Path of the Berserker or the Path of the Totem Warrior, both detailed at the end of the class description. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.", type: "passive" },
  { level: 15, name: "Persistent Rage", description: "Beginning at 15th level, your rage is so fierce that it ends early only if you fall unconscious or if you choose to end it.", type: "active" },
  { level: 16, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 17, name: "Brutal Critical (3 dice)", description: "Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.", type: "passive" },
  { level: 18, name: "Indomitable Might", description: "Beginning at 18th level, if your total for a Strength check is less than your Strength score, you can use that score in place of the total.", type: "passive" },
  { level: 19, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 20, name: "Primal Champion", description: "At 20th level, you embody the power of the wilds. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24.", type: "passive" }
  ],
  subclasses: ["Berserker"]
};
