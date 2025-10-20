/**
 * Fighter Class Data
 * Imported from D&D 5e SRD
 */

import { ClassData } from '../classTypes';

export const FIGHTER_DATA: ClassData = {
  name: "Fighter",
  hitDice: 10,
  proficiencies: {
    armor: [],
    weapons: ["Simple Weapons", "Martial Weapons"],
    tools: [],
    savingThrows: ["STR", "CON"]
  },
  features: [
  { level: 1, name: "Fighting Style", description: "You adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.", type: "choice" },
  { level: 1, name: "Second Wind", description: "You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.", type: "passive" },
  { level: 2, name: "Action Surge (1 use)", description: "Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action.\n\nOnce you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.", type: "active" },
  { level: 3, name: "Martial Archetype", description: "At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", type: "passive" },
  { level: 4, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 5, name: "Extra Attack", description: "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.", type: "active" },
  { level: 6, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 7, name: "Martial Archetype feature", description: "At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", type: "passive" },
  { level: 8, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 9, name: "Indomitable (1 use)", description: "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.", type: "passive" },
  { level: 10, name: "Martial Archetype feature", description: "At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", type: "passive" },
  { level: 11, name: "Extra Attack (2)", description: "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.", type: "active" },
  { level: 12, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 13, name: "Indomitable (2 uses)", description: "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.", type: "passive" },
  { level: 14, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 15, name: "Martial Archetype feature", description: "At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", type: "passive" },
  { level: 16, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 17, name: "Action Surge (2 uses)", description: "Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action.\n\nOnce you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.", type: "active" },
  { level: 17, name: "Indomitable (3 uses)", description: "Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can't use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.", type: "passive" },
  { level: 18, name: "Martial Archetype feature", description: "At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques, such as Champion. The archetype you choose grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.", type: "passive" },
  { level: 19, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 20, name: "Extra Attack (3)", description: "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.", type: "active" }
  ],
  subclasses: ["Champion"]
};
