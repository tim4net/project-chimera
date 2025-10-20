import { Router, type Request, type Response } from 'express';
import type { AuthError } from '@supabase/supabase-js';
import { validatePointBuy } from '../game/rules';
import { getStartingEquipment, getStartingGold } from '../game/equipment';
import { generateOnboardingScene } from '../services/gemini';
import { generateImage } from '../services/imageGeneration';
import { buildCharacterPortraitPrompt } from '../services/characterPortraitPrompts';
import { supabaseServiceClient } from '../services/supabaseClient';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import type { AbilityScores, CharacterRecord, NewCharacterRecord, TutorialState } from '../types';
import {
  applyRacialAbilityBonuses,
  getRacialSpeed,
  calculateLevel1HP,
  calculateBaseAC,
  getRacialLanguages,
  getRacialProficiencies,
  getDarkvisionRange
} from '../game/raceTraits';
import { getSubclassSelectionLevel } from '../services/subclassService';

interface CharacterCreationBody {
  name?: string;
  race?: string;
  class?: string;
  background?: string;
  alignment?: string;
  ability_scores?: AbilityScores; // Frontend sends snake_case
  abilityScores?: AbilityScores;  // Support camelCase too
  skills?: Record<string, unknown> | null;
  backstory?: Record<string, unknown> | null;
  portrait_url?: string | null;    // Frontend sends snake_case
  portraitUrl?: string | null;     // Support camelCase too
}

const router = Router();

// Spellcaster class detection
const SPELLCASTING_CLASSES = ['Bard', 'Wizard', 'Cleric', 'Sorcerer', 'Warlock', 'Druid'];
const HALF_CASTERS = ['Paladin', 'Ranger']; // Get spells at level 2

const handleSupabaseError = (res: Response, error: AuthError | null | undefined, status = 500): Response | undefined => {
  if (!error) {
    return undefined;
  }

  return res.status(status).json({ error: error.message });
};

/**
 * Generate a tutorial welcome message for classes that need subclass selection at level 1.
 * This message introduces The Chronicler and explains the subclass selection process.
 */
const generateSubclassTutorialWelcome = (name: string, characterClass: string): string => {
  const classIntros: Record<string, string> = {
    Cleric: 'As a Cleric, you must first choose your Divine Domain—the aspect of your deity that guides your powers.',
    Warlock: 'As a Warlock, you must first choose your Otherworldly Patron—the entity that grants you your eldritch powers.'
  };

  const intro = classIntros[characterClass] || `As a ${characterClass}, you must first choose your path.`;

  return `Welcome, ${name}! I am The Chronicler, and I shall guide you on your journey as a ${characterClass}.

Before your adventure begins, we must define your path. ${intro}

When you're ready to choose your path, simply say so, and we'll begin.`;
};

/**
 * Generate a tutorial welcome message for spellcasting classes.
 * This message introduces The Chronicler and explains the spell selection process.
 */
const generateTutorialWelcome = (name: string, race: string, characterClass: string): string => {
  return `Welcome, ${name}! I am The Chronicler, and I shall guide you on your journey as a ${characterClass}.

Before your adventure begins, we must prepare you for the path ahead. As a ${characterClass}, you wield magic—but first, you must choose your spells.

When you're ready to begin your training, simply say so, and we'll start with your cantrip selection.`;
};

/**
 * Generate a personalized welcome message from The Chronicler for a newly created character.
 * Incorporates world lore, character details, and sets the tone for their adventure.
 */
const generateWelcomeMessage = (
  name: string,
  race: string,
  characterClass: string,
  background: string,
  position: { x: number; y: number }
): string => {
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
};

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as CharacterRecord[]);
});

// Get characters by user email (for CLI --user flag)
router.get('/user/:email', async (req: Request, res: Response) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabaseServiceClient.auth.admin.listUsers();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Now get all characters for this user
    const { data, error } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data as CharacterRecord[]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const authenticatedReq = req as AuthenticatedRequest;
  try {
    // User is already authenticated by requireAuth middleware
    const user = authenticatedReq.user;

    const body = authenticatedReq.body as CharacterCreationBody;

    const {
      name,
      race,
      class: characterClass,
      background,
      alignment,
      skills,
      backstory,
    } = body;

    // Handle both snake_case and camelCase from frontend
    const abilityScores = body.ability_scores || body.abilityScores;
    const portraitUrl = body.portrait_url || body.portraitUrl;

    if (!name || !race || !characterClass || !background || !alignment || !abilityScores) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const baseScores: AbilityScores = {
      STR: abilityScores.STR,
      DEX: abilityScores.DEX,
      CON: abilityScores.CON,
      INT: abilityScores.INT,
      WIS: abilityScores.WIS,
      CHA: abilityScores.CHA
    };

    // Validate base scores BEFORE racial bonuses
    if (!validatePointBuy(baseScores)) {
      return res.status(400).json({ error: 'Invalid ability scores for point-buy' });
    }

    // Apply racial ability bonuses
    const finalScores = applyRacialAbilityBonuses(race, baseScores);

    const conMod = Math.floor((finalScores.CON - 10) / 2);
    const dexMod = Math.floor((finalScores.DEX - 10) / 2);

    const hitDiceMap: Record<string, number> = {
      Barbarian: 12,
      Fighter: 10,
      Paladin: 10,
      Ranger: 10,
      Bard: 8,
      Cleric: 8,
      Druid: 8,
      Monk: 8,
      Rogue: 8,
      Warlock: 8,
      Sorcerer: 6,
      Wizard: 6
    };

    const classHitDie = hitDiceMap[characterClass] ?? 8;

    // Use racial trait system for HP calculation
    const maxHp = calculateLevel1HP(race, baseScores.CON, classHitDie);

    // Use racial trait system for speed
    const speed = getRacialSpeed(race);
    const campaignSeed = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    // Start at (500,500) but character won't be "in world" until tutorial_state is null
    const startingPosition = { x: 500, y: 500 } as const;

    // Use racial trait system for AC calculation
    const armorClass = calculateBaseAC(race, baseScores.DEX);
    const startingEquipment = getStartingEquipment(characterClass);
    const startingGold = getStartingGold(characterClass);

    // Map full alignment names to database abbreviations
    const alignmentMap: Record<string, string> = {
      'Lawful Good': 'LG',
      'Neutral Good': 'NG',
      'Chaotic Good': 'CG',
      'Lawful Neutral': 'LN',
      'True Neutral': 'N',
      'Neutral': 'N',
      'Chaotic Neutral': 'CN',
      'Lawful Evil': 'LE',
      'Neutral Evil': 'NE',
      'Chaotic Evil': 'CE'
    };
    const alignmentCode = alignmentMap[alignment] ?? alignment;

    // Get racial languages and proficiencies for metadata
    const racialLanguages = getRacialLanguages(race);
    const racialProficiencies = getRacialProficiencies(race);
    const darkvisionRange = getDarkvisionRange(race);

    // Characters start at level 1 (spell selection now happens during creation wizard)
    const subclassLevel = getSubclassSelectionLevel(characterClass);
    const isSpellcaster = SPELLCASTING_CLASSES.includes(characterClass);

    let tutorialState: TutorialState | null = null;  // No tutorial state by default
    let startingLevel: number = 1;  // Start at Level 1

    // Special case: if class needs subclass at level 1, mark it
    if (subclassLevel === 1) {
      tutorialState = 'needs_subclass';
    }

    const startingHp = maxHp; // Use proper HP from the start

    // Give spellcasters their Level 1 spell slots
    const spellSlots = isSpellcaster
      ? { '1': characterClass === 'Warlock' ? 1 : 2 }
      : {};

    const characterPayload: NewCharacterRecord = {
      user_id: user.id,
      name,
      race,
      class: characterClass,
      background,
      alignment: alignmentCode,
      level: startingLevel,
      xp: 0,
      gold: startingGold,
      ability_scores: finalScores, // Use scores WITH racial bonuses
      hp_max: startingHp,
      hp_current: startingHp,
      temporary_hp: 0,
      armor_class: armorClass,
      speed,
      hit_dice: { [classHitDie]: startingLevel },
      position: startingPosition,
      campaign_seed: campaignSeed,
      spell_slots: spellSlots,
      backstory: backstory ? JSON.stringify(backstory) : null,
      skills: skills ? JSON.stringify(skills) : null,
      portrait_url: portraitUrl ?? null,
      proficiency_bonus: 2,
      tutorial_state: tutorialState
      // Note: equipment stored in separate items table
    };

    const { data: characterData, error } = await supabaseServiceClient
      .from('characters')
      .insert(characterPayload)
      .select()
      .single();

    if (error) {
      console.error('[Characters] create error:', error);
      return res.status(500).json({ error: 'Failed to create character', details: error.message });
    }

    const createdCharacter = characterData as CharacterRecord;
    console.info(`[Characters] Created ${createdCharacter.name} (${createdCharacter.id})`);
    console.info(`[Characters] Applied racial bonuses - Base: ${JSON.stringify(baseScores)}, Final: ${JSON.stringify(finalScores)}`);
    console.info(`[Characters] Racial traits - Languages: ${racialLanguages.join(', ')}, Proficiencies: ${racialProficiencies.join(', ')}${darkvisionRange ? `, Darkvision: ${darkvisionRange}ft` : ''}`);

    // Auto-generate portrait if enabled and none was provided
    if (process.env.AUTO_GENERATE_PORTRAITS === 'true' && !portraitUrl) {
      try {
        console.info(`[Characters] Generating portrait for ${name} (${race} ${characterClass} - ${alignment})...`);
        const prompt = buildCharacterPortraitPrompt(race, characterClass, background, alignment, name);
        const imageResult = await generateImage({
          prompt,
          dimensions: { width: 512, height: 512 },
          contextType: 'character_portrait',
          context: { race, class: characterClass, background, alignment }
        });

        if (imageResult.imageUrl) {
          // Update character with generated portrait
          const { error: updateError } = await supabaseServiceClient
            .from('characters')
            .update({ portrait_url: imageResult.imageUrl })
            .eq('id', createdCharacter.id);

          if (updateError) {
            console.error('[Characters] Failed to update portrait URL:', updateError);
          } else {
            createdCharacter.portrait_url = imageResult.imageUrl;
            console.info(`[Characters] Portrait generated and saved for ${name}`);
          }
        }
      } catch (generationError) {
        console.error('[Characters] Portrait generation failed (non-fatal):', generationError);
        // Character creation succeeds even if portrait generation fails
      }
    }

    // TODO: Insert starting equipment into character_inventory
    // For now, we give gold instead of physical items to avoid complex inventory setup
    // The proper implementation would:
    // 1. Create items in game_items table (or reference existing catalog items)
    // 2. Link them to character via character_inventory table with item_id and character_id
    if (startingEquipment.length > 0) {
      console.info(`[Characters] ${createdCharacter.name} would receive ${startingEquipment.length} starting items (skipped for now, gold given instead)`);
    }

    // Placeholder hook for future onboarding features
    void generateOnboardingScene({
      name: createdCharacter.name,
      race: createdCharacter.race,
      class: createdCharacter.class
    }).catch((generationError: unknown) => {
      console.error('[Characters] onboarding scene generation failed:', generationError);
    });

    // Create welcome message from The Chronicler
    let welcomeMessage: string;
    let messageType: string;

    // Special welcome for classes that need subclass selection
    if (tutorialState === 'needs_subclass') {
      welcomeMessage = generateSubclassTutorialWelcome(
        createdCharacter.name,
        createdCharacter.class
      );
      messageType = 'subclass_tutorial_welcome';
    } else {
      // Standard welcome for characters ready to adventure
      welcomeMessage = generateWelcomeMessage(
        createdCharacter.name,
        createdCharacter.race,
        createdCharacter.class,
        createdCharacter.background,
        startingPosition
      );
      messageType = 'welcome';
    }

    const { error: welcomeError } = await supabaseServiceClient
      .from('dm_conversations')
      .insert({
        character_id: createdCharacter.id,
        role: 'dm',
        content: welcomeMessage,
        metadata: {
          timestamp: new Date().toISOString(),
          messageType,
          tutorialMessage: tutorialState === 'needs_subclass',
          characterState: {
            hp: createdCharacter.hp_current,
            position: startingPosition,
            level: startingLevel
          }
        }
      });

    if (welcomeError) {
      console.error('[Characters] Failed to create welcome message:', welcomeError);
      // Non-fatal: character was created successfully
    } else {
      console.info(`[Characters] ${messageType} message created for ${createdCharacter.name}`);
    }

    res.status(201).json(createdCharacter);
  } catch (error) {
    console.error('[Characters] create exception:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json(data as CharacterRecord);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as Partial<NewCharacterRecord>;

  const { data, error } = await supabaseServiceClient
    .from('characters')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as CharacterRecord);
});


/**
 * POST /api/characters/:characterId/learn-spells
 * Learn spells for a character (stores spell names in known_spells JSONB field)
 */
router.post('/:characterId/learn-spells', requireAuth, async (req, res) => {
  try {
    const { characterId } = req.params;
    const { spells } = req.body as { spells: string[] };

    if (!spells || !Array.isArray(spells)) {
      return res.status(400).json({ error: 'spells array is required' });
    }

    // Get current character data
    const { data: character, error: fetchError } = await supabaseServiceClient
      .from('characters')
      .select('known_spells')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      console.error('[LearnSpells] Character not found:', fetchError);
      return res.status(404).json({ error: 'Character not found' });
    }

    // Merge new spells with existing ones (avoid duplicates)
    const currentSpells = (character.known_spells as string[]) || [];
    const updatedSpells = [...new Set([...currentSpells, ...spells])];

    // Update character with new spells
    const { error: updateError } = await supabaseServiceClient
      .from('characters')
      .update({ known_spells: updatedSpells })
      .eq('id', characterId);

    if (updateError) {
      console.error('[LearnSpells] Failed to update spells:', updateError);
      return res.status(500).json({ error: 'Failed to save spells' });
    }

    console.info(`[LearnSpells] Character ${characterId} learned ${spells.length} spells`);
    res.json({ success: true, knownSpells: updatedSpells });
  } catch (error) {
    console.error('[LearnSpells] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
