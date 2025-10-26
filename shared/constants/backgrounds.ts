/**
 * D&D 5e Background Data Constants
 *
 * Defines character backgrounds with their skill proficiencies,
 * tool proficiencies, and special benefits.
 */

export interface Background {
  name: string;
  description: string;
  skillBonuses: string[];
  toolProficiencies?: string[];
  languages?: number;
  otherBenefits: string[];
  feature: {
    name: string;
    description: string;
  };
}

export const BACKGROUNDS: Background[] = [
  {
    name: 'Acolyte',
    description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world, performing sacred rites and offering sacrifices to conduct worshippers into the presence of the divine.',
    skillBonuses: ['Insight', 'Religion'],
    languages: 2,
    otherBenefits: [
      'Equipment: Holy symbol, prayer book or wheel, 5 sticks of incense, vestments, common clothes, belt pouch with 15 gp'
    ],
    feature: {
      name: 'Shelter of the Faithful',
      description: 'As an acolyte, you command the respect of those who share your faith, and you can perform religious ceremonies. You and your companions can expect free healing and care at temples, shrines, and other religious establishments of your faith. Those who share your religion will support you (but only you) at a modest lifestyle.'
    }
  },
  {
    name: 'Criminal',
    description: 'You are an experienced criminal with a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld. You\'re far closer than most people to the world of murder, theft, and violence that pervades the underbelly of civilization.',
    skillBonuses: ['Deception', 'Stealth'],
    toolProficiencies: ['Thieves\' tools', 'One type of gaming set'],
    otherBenefits: [
      'Equipment: Crowbar, dark common clothes with hood, belt pouch with 15 gp',
      'Criminal Specialty: Choose or roll specialty (blackmailer, burglar, fence, highway robber, hired killer, pickpocket, smuggler)'
    ],
    feature: {
      name: 'Criminal Contact',
      description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances. You know local messengers, corrupt caravan masters, and seedy sailors who can deliver messages for you.'
    }
  },
  {
    name: 'Folk Hero',
    description: 'You come from a humble social rank, but you are destined for so much more. Already the people of your home village regard you as their champion, and your destiny calls you to stand against the tyrants and monsters that threaten the common folk everywhere.',
    skillBonuses: ['Animal Handling', 'Survival'],
    toolProficiencies: ['One type of artisan\'s tools', 'Vehicles (land)'],
    otherBenefits: [
      'Equipment: Set of artisan\'s tools, shovel, iron pot, common clothes, belt pouch with 10 gp',
      'Defining Event: Roll or choose how you became a folk hero'
    ],
    feature: {
      name: 'Rustic Hospitality',
      description: 'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone searching for you, though they will not risk their lives for you.'
    }
  },
  {
    name: 'Noble',
    description: 'You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence. You might be a pampered aristocrat unfamiliar with work or discomfort, a former merchant just elevated to the nobility, or a disinherited scoundrel with a chip on your shoulder.',
    skillBonuses: ['History', 'Persuasion'],
    toolProficiencies: ['One type of gaming set'],
    languages: 1,
    otherBenefits: [
      'Equipment: Fine clothes, signet ring, scroll of pedigree, purse with 25 gp',
      'Position of Privilege: Hereditary title (discuss with DM)'
    ],
    feature: {
      name: 'Position of Privilege',
      description: 'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure, and other nobles treat you as a member of the same social sphere.'
    }
  },
  {
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on subjects that interest you. Your efforts have made you a master in your field of study.',
    skillBonuses: ['Arcana', 'History'],
    languages: 2,
    otherBenefits: [
      'Equipment: Bottle of black ink, quill, small knife, letter from dead colleague with unanswered question, common clothes, belt pouch with 10 gp',
      'Specialty: Choose field of study (alchemist, astronomer, researcher, wizard\'s apprentice, etc.)'
    ],
    feature: {
      name: 'Researcher',
      description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually, this comes from a library, scriptorium, university, or sage. Your DM might rule that the knowledge you seek is secreted away in an almost inaccessible place, or that it simply cannot be found.'
    }
  },
  {
    name: 'Soldier',
    description: 'War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques, including how to stay alive on the battlefield. You might have been part of a national army or a mercenary company, or perhaps a member of a local militia who rose to prominence during a recent war.',
    skillBonuses: ['Athletics', 'Intimidation'],
    toolProficiencies: ['One type of gaming set', 'Vehicles (land)'],
    otherBenefits: [
      'Equipment: Insignia of rank, trophy from fallen enemy, bone dice or deck of cards, common clothes, belt pouch with 10 gp',
      'Specialty: Officer, scout, infantry, cavalry, healer, quartermaster, standard bearer, support staff'
    ],
    feature: {
      name: 'Military Rank',
      description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they defer to you if they are of lower rank. You can invoke your rank to exert influence over other soldiers and requisition simple equipment or horses. You can also usually gain access to friendly military encampments and fortresses where your rank is recognized.'
    }
  }
];

/**
 * Helper function to get background by name
 */
export function getBackgroundByName(name: string): Background | undefined {
  return BACKGROUNDS.find(bg => bg.name.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function to get all background names
 */
export function getAllBackgroundNames(): string[] {
  return BACKGROUNDS.map(bg => bg.name);
}

/**
 * Helper function to check if a skill is granted by a background
 */
export function backgroundGrantsSkill(backgroundName: string, skillName: string): boolean {
  const background = getBackgroundByName(backgroundName);
  return background?.skillBonuses.some(skill => skill.toLowerCase() === skillName.toLowerCase()) ?? false;
}
