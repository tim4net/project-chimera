/**
 * Subclass Routes
 *
 * API endpoints for managing character subclasses
 */

import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import {
  getAvailableSubclasses,
  getSubclassData,
  assignSubclass,
  needsSubclassSelection
} from '../services/subclassService';
import { supabaseServiceClient } from '../services/supabaseClient';

const router = Router();

/**
 * GET /api/subclass/:id/available-subclasses
 * Get available subclasses for a character's class
 */
router.get('/:id/available-subclasses', requireAuth, async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id;
    const userId = (req as AuthenticatedRequest).user.id;

    console.log(`[SubclassRoutes] Fetching available subclasses for character ${characterId}`);

    // Fetch character and verify ownership
    const { data: character, error: fetchError } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      console.error(`[SubclassRoutes] Character not found: ${characterId}`);
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Verify ownership
    if (character.user_id !== userId) {
      console.warn(`[SubclassRoutes] User ${userId} attempted to access character ${characterId}`);
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get available subclasses for the character's class
    const subclasses = getAvailableSubclasses(character.class);

    // Check if character needs to select a subclass
    const needsSelection = needsSubclassSelection(character);

    console.log(`[SubclassRoutes] Found ${subclasses.length} subclasses for class ${character.class}`);

    res.json({
      subclasses,
      needsSelection,
      currentSubclass: character.subclass || null
    });
  } catch (error) {
    console.error('[SubclassRoutes] Error fetching available subclasses:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch available subclasses'
    });
  }
});

/**
 * POST /api/subclass/:id/subclass
 * Assign a subclass to a character
 *
 * Body: { subclassName: string }
 */
router.post('/:id/subclass', requireAuth, async (req: Request, res: Response) => {
  try {
    const characterId = req.params.id;
    const userId = (req as AuthenticatedRequest).user.id;
    const { subclassName } = req.body;

    console.log(`[SubclassRoutes] Assigning subclass "${subclassName}" to character ${characterId}`);

    // Validate request body
    if (!subclassName || typeof subclassName !== 'string') {
      res.status(400).json({ error: 'subclassName is required' });
      return;
    }

    // Verify subclass exists
    const subclassData = getSubclassData(subclassName);
    if (!subclassData) {
      console.error(`[SubclassRoutes] Invalid subclass: ${subclassName}`);
      res.status(400).json({ error: `Invalid subclass: ${subclassName}` });
      return;
    }

    // Fetch character and verify ownership
    const { data: character, error: fetchError } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      console.error(`[SubclassRoutes] Character not found: ${characterId}`);
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    // Verify ownership
    if (character.user_id !== userId) {
      console.warn(`[SubclassRoutes] User ${userId} attempted to modify character ${characterId}`);
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if character already has a subclass
    if (character.subclass) {
      console.warn(`[SubclassRoutes] Character ${characterId} already has subclass: ${character.subclass}`);
      res.status(400).json({ error: `Character already has a subclass: ${character.subclass}` });
      return;
    }

    // Assign subclass and grant features
    await assignSubclass(characterId, subclassName);

    // Fetch updated character
    const { data: updatedCharacter, error: updateFetchError } = await supabaseServiceClient
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (updateFetchError || !updatedCharacter) {
      throw new Error('Failed to fetch updated character');
    }

    console.log(`[SubclassRoutes] Successfully assigned subclass "${subclassName}" to character ${characterId}`);

    res.json({
      success: true,
      character: updatedCharacter,
      message: `Successfully selected ${subclassName} subclass`
    });
  } catch (error) {
    console.error('[SubclassRoutes] Error assigning subclass:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to assign subclass'
    });
  }
});

export default router;
