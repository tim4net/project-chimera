import { Router, type Request, type Response } from 'express';
import type { AuthError } from '@supabase/supabase-js';
import { generateOnboardingScene } from '../services/gemini';
import { generateImage } from '../services/imageGeneration';
import { buildCharacterPortraitPrompt } from '../services/characterPortraitPrompts';
import { TownGenerationService } from '../services/townGenerationService';
import { supabaseServiceClient } from '../services/supabaseClient';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import type { AbilityScores, CharacterRecord, NewCharacterRecord } from '../types';
import { generatePOIsInRadius } from '../game/map';
import { initializeStartingArea } from '../services/fogOfWarService';
import {
  validateCharacterData,
  createCharacterRecord,
  generateCharacterDefaults,
  getCharacterMetadata,
  type CharacterCreationData
} from '../services/characterCreation';
import {
  generateWelcomeMessage,
  generateSubclassTutorialWelcome
} from '../services/characterWelcomeMessages';

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

// Global campaign seed - all players share this world
const GLOBAL_CAMPAIGN_SEED = 'nuaibria-shared-world-v1';

/**
 * Verify character ownership - ensures authenticated user owns the character
 * Returns true if ownership is verified, false otherwise
 * Also handles response error sending
 */
const verifyCharacterOwnership = async (
  characterId: string,
  userId: string,
  res: Response
): Promise<boolean> => {
  const { data: character, error } = await supabaseServiceClient
    .from('characters')
    .select('user_id')
    .eq('id', characterId)
    .single();

  if (error || !character) {
    res.status(404).json({ error: 'Character not found' });
    return false;
  }

  if (character.user_id !== userId) {
    res.status(403).json({ error: 'Forbidden: You do not own this character' });
    return false;
  }

  return true;
};


/**
 * GET /api/characters
 * List characters for the authenticated user only
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as CharacterRecord[]);
});

/**
 * GET /api/characters/user/:email
 * Get characters by user email - restricted to authenticated user's own email only
 */
router.get('/user/:email', requireAuth, async (req: Request, res: Response) => {
  const { email } = req.params;
  const authenticatedUser = (req as AuthenticatedRequest).user;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // SECURITY: Only allow users to query their own email
  if (authenticatedUser.email !== email) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own characters' });
  }

  try {
    const { data, error } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('user_id', authenticatedUser.id);

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

    // Handle both snake_case and camelCase from frontend
    const abilityScores = body.ability_scores || body.abilityScores;
    const portraitUrl = body.portrait_url || body.portraitUrl;

    // Build character creation data
    const characterData: CharacterCreationData = {
      name: body.name || '',
      race: body.race || '',
      class: body.class || '',
      background: body.background || '',
      alignment: body.alignment || '',
      abilityScores: abilityScores!,
      skills: body.skills,
      backstory: body.backstory,
      portraitUrl
    };

    // Find a nearby village to start in; if none found, expand search radius
    let startingPosition = { x: 500, y: 500 };
    const baseX = 500;
    const baseY = 500;
    const searchRadii = [30, 60, 100, 150]; // Expanding search radii

    for (const radius of searchRadii) {
      const pois = generatePOIsInRadius(baseX, baseY, radius, GLOBAL_CAMPAIGN_SEED);
      const village = pois.find(poi => poi.type === 'village');
      if (village) {
        startingPosition = { x: village.x, y: village.y };
        console.log(`[Characters] Found starting village "${village.name}" at (${village.x}, ${village.y})`);
        break;
      }
    }

    if (startingPosition.x === baseX && startingPosition.y === baseY) {
      console.log(`[Characters] No village found nearby, starting at default (500, 500)`);
    }

    // Use service layer to create character record
    let characterPayload: NewCharacterRecord;
    try {
      characterPayload = createCharacterRecord(characterData, user.id, startingPosition);
    } catch (validationError: unknown) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid character data';
      return res.status(400).json({ error: errorMessage });
    }

    // Insert into database
    const { data: insertedCharacter, error } = await supabaseServiceClient
      .from('characters')
      .insert(characterPayload)
      .select()
      .single();

    if (error) {
      console.error('[Characters] create error:', error);
      return res.status(500).json({ error: 'Failed to create character', details: error.message });
    }

    const createdCharacter = insertedCharacter as CharacterRecord;

    // Log character metadata
    const metadata = getCharacterMetadata(
      characterData.race,
      characterData.class,
      characterData.abilityScores,
      createdCharacter.ability_scores
    );
    console.info(`[Characters] Created ${createdCharacter.name} (${createdCharacter.id})`);
    console.info(`[Characters] Applied racial bonuses - Base: ${JSON.stringify(metadata.baseScores)}, Final: ${JSON.stringify(metadata.finalScores)}`);
    console.info(`[Characters] Racial traits - Languages: ${metadata.racialLanguages.join(', ')}, Proficiencies: ${metadata.racialProficiencies.join(', ')}${metadata.darkvisionRange ? `, Darkvision: ${metadata.darkvisionRange}ft` : ''}`);

    // Auto-generate portrait if enabled and none was provided
    if (process.env.AUTO_GENERATE_PORTRAITS === 'true' && !portraitUrl) {
      try {
        console.info(`[Characters] Generating portrait for ${characterData.name} (${characterData.race} ${characterData.class} - ${characterData.alignment})...`);
        const prompt = buildCharacterPortraitPrompt(
          characterData.race,
          characterData.class,
          characterData.background,
          characterData.alignment,
          characterData.name
        );
        const imageResult = await generateImage({
          prompt,
          dimensions: { width: 512, height: 512 },
          contextType: 'character_portrait',
          context: {
            race: characterData.race,
            class: characterData.class,
            background: characterData.background,
            alignment: characterData.alignment
          }
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
            console.info(`[Characters] Portrait generated and saved for ${characterData.name}`);
          }
        }
      } catch (generationError) {
        console.error('[Characters] Portrait generation failed (non-fatal):', generationError);
        // Character creation succeeds even if portrait generation fails
      }
    }

    // Get starting equipment for logging (not actually inserted yet)
    const defaults = generateCharacterDefaults(characterData.race, characterData.class);
    if (defaults.startingEquipment.length > 0) {
      console.info(`[Characters] ${createdCharacter.name} would receive ${defaults.startingEquipment.length} starting items (skipped for now, gold given instead)`);
    }

    // Initialize fog of war around starting position (async, non-blocking)
    void initializeStartingArea(
      GLOBAL_CAMPAIGN_SEED,
      startingPosition.x,
      startingPosition.y,
      createdCharacter.id
    ).catch((fwError: unknown) => {
      console.error('[Characters] fog of war initialization failed (non-fatal):', fwError);
    });

    // Generate shared starter town for the global world (async, non-blocking)
    // This only generates once - subsequent characters reuse the same town
    void TownGenerationService.getOrGenerateTown({
      campaignSeed: GLOBAL_CAMPAIGN_SEED,
      campaignName: 'Nuaibria - Shared World',
      regionType: 'temperate forest'
    }).catch((townError: unknown) => {
      console.error('[Characters] town generation failed (non-fatal):', townError);
      // Character creation succeeds even if town generation fails
    });

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
    if (createdCharacter.tutorial_state === 'needs_subclass') {
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
          tutorialMessage: createdCharacter.tutorial_state === 'needs_subclass',
          characterState: {
            hp: createdCharacter.hp_current,
            position: startingPosition,
            level: createdCharacter.level
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

/**
 * PATCH /api/characters/:id
 * Update a character - requires authentication and ownership
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as AuthenticatedRequest).user.id;
  const payload = req.body as Partial<NewCharacterRecord>;

  // Verify ownership
  if (!(await verifyCharacterOwnership(id, userId, res))) {
    return;
  }

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
 * Learn spells for a character - requires ownership verification
 */
router.post('/:characterId/learn-spells', requireAuth, async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const { spells } = req.body as { spells: string[] };

    if (!spells || !Array.isArray(spells)) {
      return res.status(400).json({ error: 'spells array is required' });
    }

    // Verify ownership first
    if (!(await verifyCharacterOwnership(characterId, userId, res))) {
      return;
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
