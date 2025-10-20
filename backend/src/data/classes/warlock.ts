/**
 * Warlock Class Data
 * Imported from D&D 5e SRD
 */

import { ClassData } from '../classTypes';

export const WARLOCK_DATA: ClassData = {
  name: "Warlock",
  hitDice: 8,
  proficiencies: {
    armor: ["Light Armor"],
    weapons: ["Simple Weapons"],
    tools: [],
    savingThrows: ["WIS", "CHA"]
  },
  features: [
  { level: 1, name: "Otherworldly Patron", description: "At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 1, name: "Pact Magic", description: "Your arcane research and the magic bestowed on you by your patron have given you facility with spells.", type: "passive" },
  { level: 2, name: "Eldritch Invocations", description: "In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability.\n\nAt 2nd level, you gain two eldritch invocations of your choice. Your invocation options are detailed at the end of the class description. When you gain certain warlock levels, you gain additional invocations of your choice, as shown in the Invocations Known column of the Warlock table.\n\nAdditionally, when you gain a level in this class, you can choose one of the invocations you know and replace it with another invocation that you could learn at that level.", type: "passive" },
  { level: 3, name: "Pact Boon", description: "At 3rd level, your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features of your choice.", type: "passive" },
  { level: 4, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 6, name: "Otherworldly Patron feature", description: "At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 8, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 10, name: "Otherworldly Patron feature", description: "At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 11, name: "Mystic Arcanum (6th level)", description: "At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th- level spell from the warlock spell list as this arcanum.\n\nYou can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again.\n\nAt higher levels, you gain more warlock spells of your choice that can be cast in this way: one 7th- level spell at 13th level, one 8th-level spell at 15th level, and one 9th-level spell at 17th level. You regain all uses of your Mystic Arcanum when you finish a long rest.", type: "passive" },
  { level: 12, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 13, name: "Mystic Arcanum (7th level)", description: "At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th- level spell from the warlock spell list as this arcanum.\n\nYou can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again.\n\nAt higher levels, you gain more warlock spells of your choice that can be cast in this way: one 7th- level spell at 13th level, one 8th-level spell at 15th level, and one 9th-level spell at 17th level. You regain all uses of your Mystic Arcanum when you finish a long rest.", type: "passive" },
  { level: 14, name: "Otherworldly Patron feature", description: "At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 15, name: "Mystic Arcanum (8th level)", description: "At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th- level spell from the warlock spell list as this arcanum.\n\nYou can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again.\n\nAt higher levels, you gain more warlock spells of your choice that can be cast in this way: one 7th- level spell at 13th level, one 8th-level spell at 15th level, and one 9th-level spell at 17th level. You regain all uses of your Mystic Arcanum when you finish a long rest.", type: "passive" },
  { level: 16, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 17, name: "Mystic Arcanum (9th level)", description: "At 11th level, your patron bestows upon you a magical secret called an arcanum. Choose one 6th- level spell from the warlock spell list as this arcanum.\n\nYou can cast your arcanum spell once without expending a spell slot. You must finish a long rest before you can do so again.\n\nAt higher levels, you gain more warlock spells of your choice that can be cast in this way: one 7th- level spell at 13th level, one 8th-level spell at 15th level, and one 9th-level spell at 17th level. You regain all uses of your Mystic Arcanum when you finish a long rest.", type: "passive" },
  { level: 19, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 20, name: "Eldritch Master", description: "At 20th level, you can draw on your inner reserve of mystical power while entreating your patron to regain expended spell slots. You can spend 1 minute entreating your patron for aid to regain all your expended spell slots from your Pact Magic feature.\n\nOnce you regain spell slots with this feature, you must finish a long rest before you can do so again.", type: "passive" }
  ],
  spellcasting: {
    ability: "CHA",
    slotsPerLevel: { 1: [1, 0, 0, 0, 0, 0, 0, 0, 0], 2: [2, 0, 0, 0, 0, 0, 0, 0, 0], 3: [0, 2, 0, 0, 0, 0, 0, 0, 0], 4: [0, 2, 0, 0, 0, 0, 0, 0, 0], 5: [0, 0, 2, 0, 0, 0, 0, 0, 0], 6: [0, 0, 2, 0, 0, 0, 0, 0, 0], 7: [0, 0, 0, 2, 0, 0, 0, 0, 0], 8: [0, 0, 0, 2, 0, 0, 0, 0, 0], 9: [0, 0, 0, 0, 2, 0, 0, 0, 0], 10: [0, 0, 0, 0, 2, 0, 0, 0, 0], 11: [0, 0, 0, 0, 3, 0, 0, 0, 0], 12: [0, 0, 0, 0, 3, 0, 0, 0, 0], 13: [0, 0, 0, 0, 3, 0, 0, 0, 0], 14: [0, 0, 0, 0, 3, 0, 0, 0, 0], 15: [0, 0, 0, 0, 3, 0, 0, 0, 0], 16: [0, 0, 0, 0, 3, 0, 0, 0, 0], 17: [0, 0, 0, 0, 4, 0, 0, 0, 0], 18: [0, 0, 0, 0, 4, 0, 0, 0, 0], 19: [0, 0, 0, 0, 4, 0, 0, 0, 0], 20: [0, 0, 0, 0, 4, 0, 0, 0, 0] }
  },
  subclasses: ["Fiend"]
};
