/**
 * Character Portrait Prompt Service
 *
 * Builds detailed prompts for AI image generation of D&D 5e character portraits.
 * Emphasizes race-specific physical traits to ensure non-human races are accurately depicted.
 */

interface VisualTraits {
  positive: string[];
  negative?: string[];
}

/**
 * Comprehensive mapping of D&D 5e races to their distinctive visual features.
 * The 'positive' array contains traits to emphasize.
 * The 'negative' array contains traits to explicitly avoid.
 */
const RACE_VISUAL_TRAITS: Record<string, VisualTraits> = {
  Dragonborn: {
    positive: [
      'draconic humanoid',
      'reptilian scales covering entire body',
      'dragon-like head with elongated snout',
      'sharp fangs and teeth',
      'prominent curved horns',
      'clawed hands with scaled fingers',
      'powerful muscular build',
      'reptilian eyes with vertical pupils',
      'no hair whatsoever'
    ],
    negative: ['human face', 'human skin', 'hair', 'fur', 'round ears']
  },

  Tiefling: {
    positive: [
      'humanoid with demonic features',
      'large curved horns protruding from forehead',
      'long prehensile tail',
      'skin in shades of red, purple, blue, or gray',
      'glowing eyes without pupils',
      'sharp canine teeth',
      'pointed ears',
      'otherworldly appearance'
    ],
    negative: ['normal human skin tone', 'no horns', 'no tail', 'round ears']
  },

  Elf: {
    positive: [
      'slender graceful build',
      'long pointed ears',
      'sharp elegant facial features',
      'ethereal beauty',
      'almond-shaped eyes',
      'no facial hair',
      'lithe and agile appearance'
    ],
    negative: ['stocky build', 'broad shoulders', 'facial hair', 'round ears', 'gruff appearance']
  },

  'High Elf': {
    positive: [
      'slender graceful build',
      'long pointed ears',
      'sharp elegant facial features',
      'pale skin',
      'ethereal beauty',
      'aristocratic bearing',
      'almond-shaped eyes'
    ],
    negative: ['stocky build', 'facial hair', 'round ears', 'dark skin']
  },

  'Wood Elf': {
    positive: [
      'slender athletic build',
      'long pointed ears',
      'sharp features',
      'copper or tan skin tones',
      'forest-green or brown eyes',
      'wild hair',
      'natural appearance'
    ],
    negative: ['stocky build', 'facial hair', 'round ears', 'pale skin']
  },

  'Dark Elf': {
    positive: [
      'slender build',
      'long pointed ears',
      'dark obsidian or purple-black skin',
      'white or silver hair',
      'pale or red eyes',
      'sharp elegant features'
    ],
    negative: ['light skin', 'dark hair', 'round ears', 'stocky build']
  },

  Dwarf: {
    positive: [
      'stocky powerful build',
      'broad muscular shoulders',
      'standing 4 to 5 feet tall',
      'thick braided beard',
      'weathered rugged features',
      'prominent nose',
      'stout frame',
      'sturdy appearance'
    ],
    negative: ['tall', 'slender', 'pointed ears', 'clean-shaven', 'delicate features']
  },

  'Mountain Dwarf': {
    positive: [
      'stocky muscular build',
      'broad shoulders',
      '4 to 5 feet tall',
      'thick beard',
      'fair or light brown skin',
      'battle-hardened appearance'
    ],
    negative: ['tall', 'slender', 'pointed ears', 'clean-shaven']
  },

  'Hill Dwarf': {
    positive: [
      'stocky build',
      'broad frame',
      '4 feet tall',
      'thick beard',
      'deep tan or brown skin',
      'keen bright eyes'
    ],
    negative: ['tall', 'slender', 'pointed ears', 'pale skin']
  },

  Halfling: {
    positive: [
      'small humanoid standing 3 feet tall',
      'cheerful round face',
      'curly hair',
      'child-like proportions',
      'bare feet or simple shoes',
      'friendly appearance',
      'nimble build'
    ],
    negative: ['tall', 'muscular', 'imposing', 'angular features']
  },

  'Lightfoot Halfling': {
    positive: [
      '3 feet tall',
      'slender build',
      'round cheerful face',
      'brown or sandy hair',
      'bare feet',
      'inconspicuous appearance'
    ],
    negative: ['tall', 'stocky', 'imposing']
  },

  'Stout Halfling': {
    positive: [
      '3 feet tall',
      'stocky build',
      'round face',
      'resilient appearance',
      'curly hair',
      'bare feet'
    ],
    negative: ['tall', 'slender', 'delicate']
  },

  Human: {
    positive: [
      'average human build',
      'varied features',
      'diverse appearance',
      'medium height'
    ],
    negative: ['pointed ears', 'horns', 'tail', 'scales', 'fur']
  },

  'Half-Elf': {
    positive: [
      'blend of human and elven features',
      'slightly pointed ears',
      'graceful but sturdy build',
      'human-like but refined features',
      'charismatic appearance'
    ],
    negative: ['fully pointed ears', 'stocky build', 'heavy features']
  },

  'Half-Orc': {
    positive: [
      'muscular powerful build',
      'greenish or grayish skin tone',
      'prominent lower canines protruding like tusks',
      'strong jaw',
      'heavy brow',
      'intimidating stature',
      'coarse dark hair',
      'standing 6 to 7 feet tall'
    ],
    negative: ['delicate features', 'pale skin', 'slender build', 'small stature']
  },

  Gnome: {
    positive: [
      'small humanoid 3 to 4 feet tall',
      'prominent nose',
      'bright curious eyes',
      'energetic expression',
      'tan or brown skin',
      'light-colored hair',
      'youthful appearance despite age'
    ],
    negative: ['tall', 'imposing', 'dull expression', 'dark skin']
  },

  'Forest Gnome': {
    positive: [
      '3 feet tall',
      'prominent nose',
      'bright eyes',
      'tan or brown skin',
      'natural woodsy appearance'
    ],
    negative: ['tall', 'pale skin', 'refined appearance']
  },

  'Rock Gnome': {
    positive: [
      '3 to 4 feet tall',
      'prominent nose',
      'bright eyes',
      'light or fair skin',
      'inventor or tinkerer appearance'
    ],
    negative: ['tall', 'dark skin', 'primitive appearance']
  }
};

/**
 * Maps character classes to appropriate equipment and attire descriptions.
 */
const CLASS_VISUAL_CONTEXT: Record<string, string> = {
  Barbarian: 'tribal warrior, minimal armor, carrying great weapon, battle scars, fierce expression',
  Bard: 'stylish clothing, musical instrument, charismatic pose, elegant appearance',
  Cleric: 'holy symbol, religious vestments or plate armor, divine aura, sacred appearance',
  Druid: 'natural materials, wooden staff, animal companion or nature motifs, earth tones',
  Fighter: 'full plate armor or chainmail, sword and shield, battle-ready stance, martial bearing',
  Monk: 'simple robes, martial arts stance, no armor, spiritual energy, disciplined appearance',
  Paladin: 'shining plate armor, holy symbol, sword or warhammer, righteous bearing, noble appearance',
  Ranger: 'leather armor, bow and arrows, forest cloak, rugged outdoorsman, animal companion hints',
  Rogue: 'dark leather armor, multiple daggers, hooded cloak, cunning expression, stealthy appearance',
  Sorcerer: 'elegant robes, magical energy crackling around hands, confident stance, arcane tattoos',
  Warlock: 'dark mysterious robes, eldritch energy, otherworldly features, occult symbols, ominous aura',
  Wizard: 'flowing wizard robes, spellbook, arcane staff or wand, scholarly appearance, mystical runes'
};

/**
 * Maps character backgrounds to clothing and context descriptions.
 */
const BACKGROUND_VISUAL_CONTEXT: Record<string, string> = {
  Acolyte: 'religious robes, simple but clean attire, holy symbols',
  Charlatan: 'flashy but practical clothing, disguise elements, confidence',
  Criminal: 'dark practical clothing, street-smart appearance, hidden weapons',
  Entertainer: 'colorful performance outfit, dramatic flair, eye-catching',
  Folk_Hero: 'common clothing, modest heroic bearing, relatable appearance',
  'Folk Hero': 'common clothing, modest heroic bearing, relatable appearance',
  Guild_Artisan: 'practical work clothes, tool marks, professional appearance',
  'Guild Artisan': 'practical work clothes, tool marks, professional appearance',
  Hermit: 'worn simple clothing, weathered appearance, ascetic bearing',
  Noble: 'fine expensive clothing, jewelry, aristocratic bearing, elegant',
  Outlander: 'rugged wilderness clothing, weather-beaten appearance, survival gear',
  Sage: 'scholarly robes, reading glasses, book or scroll, intellectual appearance',
  Sailor: 'practical nautical clothing, weathered by sea and sun, rope and knots',
  Soldier: 'military uniform or practical armor, disciplined bearing, campaign marks',
  Urchin: 'patched clothing, street-smart appearance, scrappy bearing'
};

/**
 * Maps character alignments to visual mood, lighting, and aesthetic modifiers.
 * Alignments influence the overall atmosphere and emotional tone of the portrait.
 */
const ALIGNMENT_VISUAL_STYLE: Record<string, { mood: string; lighting: string; expression: string }> = {
  'Lawful Good': {
    mood: 'noble and pure atmosphere, divine radiance, heroic presence',
    lighting: 'bright golden light, warm highlights, halo effect',
    expression: 'confident and kind expression, determined noble gaze, compassionate eyes'
  },
  'Neutral Good': {
    mood: 'warm and protective atmosphere, gentle heroism, caring presence',
    lighting: 'soft warm lighting, natural sunlight, gentle glow',
    expression: 'warm friendly expression, genuine smile, approachable demeanor'
  },
  'Chaotic Good': {
    mood: 'rebellious hero atmosphere, free-spirited energy, adventurous vibe',
    lighting: 'dynamic dramatic lighting, bold contrasts, energetic highlights',
    expression: 'mischievous smile, adventurous spirit, defiant yet kind eyes'
  },
  'Lawful Neutral': {
    mood: 'orderly and disciplined atmosphere, structured presence, formal bearing',
    lighting: 'balanced even lighting, clean shadows, professional illumination',
    expression: 'serious focused expression, disciplined gaze, composed demeanor'
  },
  'True Neutral': {
    mood: 'balanced natural atmosphere, harmonious presence, pragmatic bearing',
    lighting: 'natural balanced lighting, neutral tones, realistic shadows',
    expression: 'calm neutral expression, observant eyes, unbiased demeanor'
  },
  'Chaotic Neutral': {
    mood: 'unpredictable atmosphere, wild energy, free-spirited presence',
    lighting: 'erratic lighting, sharp contrasts, dynamic shadows',
    expression: 'unpredictable expression, curious eyes, free-spirited demeanor'
  },
  'Lawful Evil': {
    mood: 'cold tyrannical atmosphere, oppressive presence, authoritarian bearing',
    lighting: 'harsh cold lighting, deep shadows, ominous red or purple tints',
    expression: 'cold calculating expression, cruel smile, merciless eyes'
  },
  'Neutral Evil': {
    mood: 'selfish malevolent atmosphere, predatory presence, opportunistic bearing',
    lighting: 'dim sinister lighting, murky shadows, sickly green or gray tones',
    expression: 'selfish smirk, greedy eyes, uncaring cold demeanor'
  },
  'Chaotic Evil': {
    mood: 'destructive chaotic atmosphere, malevolent madness, terrifying presence',
    lighting: 'flickering hellish lighting, violent red and orange tones, chaotic shadows',
    expression: 'maniacal expression, wild dangerous eyes, cruel twisted smile'
  }
};

/**
 * Base style prompt for consistent D&D character portrait aesthetics.
 */
const BASE_PORTRAIT_STYLE = 'fantasy digital painting, detailed character portrait, cinematic lighting, heroic pose, D&D art style, professional quality, sharp focus on face';

/**
 * Builds a comprehensive prompt for generating a character portrait.
 *
 * @param race - The character's race (e.g., "Dragonborn", "Elf", "Dwarf")
 * @param characterClass - The character's class (e.g., "Fighter", "Wizard")
 * @param background - The character's background (e.g., "Noble", "Outlander")
 * @param alignment - Optional character alignment (e.g., "Lawful Good", "Chaotic Neutral")
 * @param name - Optional character name for logging purposes
 * @returns A detailed prompt string optimized for AI image generation
 */
export function buildCharacterPortraitPrompt(
  race: string,
  characterClass: string,
  background: string,
  alignment?: string,
  name?: string
): string {
  // Get race-specific traits (fallback to generic if race not found)
  const raceTraits = RACE_VISUAL_TRAITS[race] || {
    positive: [race, 'humanoid'],
    negative: []
  };

  // Get class and background context
  const classContext = CLASS_VISUAL_CONTEXT[characterClass] || characterClass;
  const backgroundContext = BACKGROUND_VISUAL_CONTEXT[background] || background;

  // Get alignment-based visual styling
  const alignmentStyle = alignment && ALIGNMENT_VISUAL_STYLE[alignment]
    ? ALIGNMENT_VISUAL_STYLE[alignment]
    : null;

  // Build positive prompt components
  const positiveComponents = [
    ...raceTraits.positive,
    classContext,
    backgroundContext,
    BASE_PORTRAIT_STYLE
  ];

  // Add alignment modifiers if present
  if (alignmentStyle) {
    positiveComponents.push(
      alignmentStyle.mood,
      alignmentStyle.lighting,
      alignmentStyle.expression
    );
  }

  // Build final prompt
  const positivePrompt = positiveComponents.join(', ');
  const negativePrompt = raceTraits.negative && raceTraits.negative.length > 0
    ? ` Avoid: ${raceTraits.negative.join(', ')}`
    : '';

  const fullPrompt = `${positivePrompt}${negativePrompt}`;

  // Log for debugging
  if (name) {
    const alignmentInfo = alignment ? ` ${alignment}` : '';
    console.log(`[PortraitPrompts] Generated prompt for ${name} (${race} ${characterClass}${alignmentInfo}):`);
    console.log(`[PortraitPrompts] ${fullPrompt.substring(0, 200)}...`);
  }

  return fullPrompt;
}

/**
 * Gets a list of all supported races with visual trait mappings.
 */
export function getSupportedRaces(): string[] {
  return Object.keys(RACE_VISUAL_TRAITS);
}

/**
 * Checks if a race has custom visual trait mappings.
 */
export function hasCustomTraits(race: string): boolean {
  return race in RACE_VISUAL_TRAITS && race !== 'Human';
}

/**
 * Gets a list of all supported alignments with visual style mappings.
 */
export function getSupportedAlignments(): string[] {
  return Object.keys(ALIGNMENT_VISUAL_STYLE);
}

/**
 * Gets the visual style modifiers for a specific alignment.
 * Useful for previewing how alignment affects portrait generation.
 */
export function getAlignmentStyle(alignment: string): { mood: string; lighting: string; expression: string } | null {
  return ALIGNMENT_VISUAL_STYLE[alignment] || null;
}
