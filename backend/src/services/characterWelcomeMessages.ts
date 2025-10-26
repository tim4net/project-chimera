/**
 * Character Welcome Messages
 *
 * Generates personalized welcome messages from The Chronicler
 * for newly created characters.
 */

/**
 * Generate a tutorial welcome message for classes that need subclass selection at level 1.
 * This message introduces The Chronicler and explains the subclass selection process.
 */
export function generateSubclassTutorialWelcome(name: string, characterClass: string): string {
  const classIntros: Record<string, string> = {
    Cleric: 'As a Cleric, you must first choose your Divine Domain—the aspect of your deity that guides your powers.',
    Warlock: 'As a Warlock, you must first choose your Otherworldly Patron—the entity that grants you your eldritch powers.'
  };

  const intro = classIntros[characterClass] || `As a ${characterClass}, you must first choose your path.`;

  return `Welcome, ${name}! I am The Chronicler, and I shall guide you on your journey as a ${characterClass}.

Before your adventure begins, we must define your path. ${intro}

When you're ready to choose your path, simply say so, and we'll begin.`;
}

/**
 * Generate a tutorial welcome message for spellcasting classes.
 * This message introduces The Chronicler and explains the spell selection process.
 */
export function generateTutorialWelcome(name: string, race: string, characterClass: string): string {
  return `Welcome, ${name}! I am The Chronicler, and I shall guide you on your journey as a ${characterClass}.

Before your adventure begins, we must prepare you for the path ahead. As a ${characterClass}, you wield magic—but first, you must choose your spells.

When you're ready to begin your training, simply say so, and we'll start with your cantrip selection.`;
}

/**
 * Generate a personalized welcome message from The Chronicler for a newly created character.
 * Incorporates world lore, character details, and sets the tone for their adventure.
 */
export function generateWelcomeMessage(
  name: string,
  race: string,
  characterClass: string,
  background: string,
  position: { x: number; y: number }
): string {
  // World lore snippets about Nuaibria
  const loreSnippets = [
    "The realm of Nuaibria bears the scars of the ancient Sundering, where mortal ambition shattered the world and fractured magic itself.",
    "Nuaibria stands as a testament to resilience—a land of broken beauty where ancient power seeps through the cracks of reality.",
    "The world remembers the Old Empire's fall, and whispers of that catastrophic ritual still echo through the land.",
    "Magic flows differently here, unpredictable and wild, a reminder of the day the world was broken and remade."
  ];

  // Current events/atmosphere snippets
  const currentEvents = [
    "Strange energies have been stirring in the borderlands, drawing adventurers from across the realm.",
    "The roads are busier than usual—merchants speak of ancient ruins revealing themselves after centuries of slumber.",
    "Rumors spread of forgotten vaults and dormant powers awakening in the wilderness.",
    "The air itself seems charged with potential, as if the land itself awaits those brave enough to explore its secrets."
  ];

  // Background-specific flavor
  const backgroundFlavor: Record<string, string> = {
    Acolyte: "Your devotion to the divine arts has prepared you for the trials ahead.",
    Criminal: "Your shadowed past has taught you the value of cunning and opportunity.",
    Folk_Hero: "Tales of your deeds have already begun to spread among the common folk.",
    Noble: "Your noble bearing grants you both privilege and responsibility.",
    Sage: "Your thirst for knowledge has led you to this crossroads of destiny.",
    Soldier: "Your military training has forged you into a weapon ready for any challenge."
  };

  const selectedLore = loreSnippets[Math.floor(Math.random() * loreSnippets.length)];
  const selectedEvent = currentEvents[Math.floor(Math.random() * currentEvents.length)];
  const backgroundText = backgroundFlavor[background] || "Your unique experiences have shaped you into who you are today.";

  return `Greetings, ${name}, brave ${race} ${characterClass}. I am The Chronicler, keeper of tales and witness to your journey. ${selectedLore} ${selectedEvent} ${backgroundText} You stand at coordinates (${position.x}, ${position.y})—a threshold between the known and the unknown. What path will you choose, adventurer?`;
}
