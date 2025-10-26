/**
 * D&D 5e Alignment Data Constants
 *
 * Defines the nine alignments with their moral and ethical frameworks,
 * descriptions, philosophies, and examples.
 */

export interface Alignment {
  code: string;
  name: string;
  description: string;
  philosophy: string;
  example: string;
}

export const ALIGNMENTS: Alignment[] = [
  {
    code: 'LG',
    name: 'Lawful Good',
    description: 'Creatures that act with compassion and honor within a structured code. They combine a commitment to oppose evil with discipline and belief that order helps others.',
    philosophy: 'Society and order protect all. The needs of the many outweigh the needs of the few, but individuals matter. Honor, truth, and justice guide all actions.',
    example: 'A paladin sworn to protect the innocent, a judge who upholds fair law, or a knight defending their kingdom with unwavering honor.'
  },
  {
    code: 'NG',
    name: 'Neutral Good',
    description: 'Folk who do the best they can to help others according to their needs. They are committed to helping others but don\'t feel strongly about order or chaos.',
    philosophy: 'Do good without being bound by law or tradition. Help those in need regardless of society\'s rules. The right thing matters more than the method.',
    example: 'A traveling healer who aids everyone regardless of status, a charitable merchant, or a hero who helps villages without seeking reward.'
  },
  {
    code: 'CG',
    name: 'Chaotic Good',
    description: 'Creatures that act as their conscience directs, with little regard for what others expect. They make their own way, but are kind and benevolent.',
    philosophy: 'Freedom is essential to goodness. Rigid rules and hierarchy create oppression. Follow your heart to do what\'s right, even if it breaks unjust laws.',
    example: 'A rebel who fights against tyranny, a vigilante protecting the weak from corrupt officials, or a free spirit helping outcasts and misfits.'
  },
  {
    code: 'LN',
    name: 'Lawful Neutral',
    description: 'Individuals who act in accordance with law, tradition, or personal codes. They believe in order and organization above all else.',
    philosophy: 'Order and reliability are paramount. Law provides structure that prevents chaos. Follow the rules without bias toward good or evil.',
    example: 'A city guard following orders regardless of personal feelings, a monk adhering strictly to monastic discipline, or a judge applying law impartially.'
  },
  {
    code: 'N',
    name: 'True Neutral',
    description: 'Those who prefer to steer clear of moral questions and don\'t take sides, doing what seems best at the time. They believe in balance and nature\'s way.',
    philosophy: 'Balance is essential. Extremism in any direction is dangerous. The natural order should be maintained. Personal survival and comfort matter most.',
    example: 'A druid maintaining nature\'s balance, a mercenary who works for coin without ideological commitment, or a hermit avoiding societal conflicts.'
  },
  {
    code: 'CN',
    name: 'Chaotic Neutral',
    description: 'Creatures that follow their whims, holding personal freedom above all else. They resent authority and restrictions, acting on impulse.',
    philosophy: 'Total freedom is the only truth. Do what you want, when you want. Authority and rules are chains to be broken. Live in the moment.',
    example: 'A wandering barbarian following their desires, a thief stealing for thrills rather than need, or an unpredictable trickster causing chaos for fun.'
  },
  {
    code: 'LE',
    name: 'Lawful Evil',
    description: 'Creatures that methodically take what they want within the limits of a code of tradition, loyalty, or order. They care about tradition and order, but not freedom or life.',
    philosophy: 'Power and order should serve the strong. Use laws and systems to control others. Honor agreements, but twist them to your advantage. Domination through structure.',
    example: 'A tyrannical ruler maintaining iron-fisted control, a corrupt official using their position for gain, or a devil binding souls through contracts.'
  },
  {
    code: 'NE',
    name: 'Neutral Evil',
    description: 'Those who do whatever they can get away with, without compassion or qualms. They are purely self-interested and show no remorse.',
    philosophy: 'Self-interest above all. Take what you want however you can. No loyalty, no code, just personal gain. Use any means necessary to get ahead.',
    example: 'A ruthless mercenary who kills without hesitation, a crime boss eliminating rivals, or a power-hungry mage sacrificing others for knowledge.'
  },
  {
    code: 'CE',
    name: 'Chaotic Evil',
    description: 'Creatures that act with arbitrary violence, spurred by greed, hatred, or bloodlust. They are utterly self-centered and recognize no authority.',
    philosophy: 'Strength and destruction prove superiority. Take what you want through violence. Rules and mercy are weakness. Chaos and suffering bring power.',
    example: 'A demon reveling in destruction, a raiding warlord burning villages, or a serial killer acting on dark impulses without pattern or reason.'
  }
];

/**
 * Helper function to get alignment by code
 */
export function getAlignmentByCode(code: string): Alignment | undefined {
  return ALIGNMENTS.find(alignment => alignment.code.toUpperCase() === code.toUpperCase());
}

/**
 * Helper function to get alignment by name
 */
export function getAlignmentByName(name: string): Alignment | undefined {
  return ALIGNMENTS.find(alignment => alignment.name.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function to get all alignment codes
 */
export function getAllAlignmentCodes(): string[] {
  return ALIGNMENTS.map(alignment => alignment.code);
}

/**
 * Helper function to get all alignment names
 */
export function getAllAlignmentNames(): string[] {
  return ALIGNMENTS.map(alignment => alignment.name);
}

/**
 * Helper function to check if alignment is good-aligned
 */
export function isGoodAligned(code: string): boolean {
  return ['LG', 'NG', 'CG'].includes(code.toUpperCase());
}

/**
 * Helper function to check if alignment is evil-aligned
 */
export function isEvilAligned(code: string): boolean {
  return ['LE', 'NE', 'CE'].includes(code.toUpperCase());
}

/**
 * Helper function to check if alignment is lawful
 */
export function isLawful(code: string): boolean {
  return ['LG', 'LN', 'LE'].includes(code.toUpperCase());
}

/**
 * Helper function to check if alignment is chaotic
 */
export function isChaotic(code: string): boolean {
  return ['CG', 'CN', 'CE'].includes(code.toUpperCase());
}
