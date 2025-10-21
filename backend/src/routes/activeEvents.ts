import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import {
  startCombat,
  getActiveEncounter,
  executeCombatAction,
  endEncounter,
  type CombatAction
} from '../services/activePhaseService';
import { supabaseServiceClient } from '../services/supabaseClient';

const router = Router();

// GET /api/active-events/:characterId - Get current active event
router.get(
  '/:characterId',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { characterId } = req.params;

    try {
      // Verify ownership
      const { data: character } = await supabaseServiceClient
        .from('characters')
        .select('id')
        .eq('id', characterId)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const encounter = await getActiveEncounter(characterId);

      if (!encounter) {
        res.json({ hasActiveEvent: false });
        return;
      }

      res.json({ hasActiveEvent: true, encounter });
    } catch (error) {
      console.error('[ActiveEvents] Error fetching encounter:', error);
      res.status(500).json({ error: 'Failed to fetch active event' });
    }
  }
);

// POST /api/active-events/:characterId/start - Trigger a combat encounter
router.post(
  '/:characterId/start',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { characterId } = req.params;
    const { encounterType, difficulty } = req.body as {
      encounterType?: string;
      difficulty?: number;
    };

    try {
      // Verify ownership
      const { data: character } = await supabaseServiceClient
        .from('characters')
        .select('id')
        .eq('id', characterId)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const encounter = await startCombat(characterId, encounterType, difficulty);
      res.json({ encounter });
    } catch (error) {
      console.error('[ActiveEvents] Error starting combat:', error);
      res.status(500).json({ error: 'Failed to start combat' });
    }
  }
);

// POST /api/active-events/:encounterId/action - Take a combat action
router.post(
  '/:encounterId/action',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { encounterId } = req.params;
    const { action } = req.body as { action: CombatAction };

    try {
      // Fetch encounter and verify ownership
      const { data: encounter } = await supabaseServiceClient
        .from('active_encounters')
        .select('character_id')
        .eq('id', encounterId)
        .single();

      if (!encounter) {
        res.status(404).json({ error: 'Encounter not found' });
        return;
      }

      // Verify user owns the character in this encounter
      const { data: character } = await supabaseServiceClient
        .from('characters')
        .select('*')
        .eq('id', encounter.character_id)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (!character) {
        res.status(403).json({ error: 'You are not in this encounter' });
        return;
      }

      const result = await executeCombatAction(encounterId, action, character);
      res.json(result);
    } catch (error) {
      console.error('[ActiveEvents] Error executing action:', error);
      res.status(500).json({ error: 'Failed to execute action' });
    }
  }
);

// POST /api/active-events/:encounterId/end - End an encounter
router.post(
  '/:encounterId/end',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { encounterId } = req.params;
    const { outcome } = req.body as {
      outcome: 'victory' | 'defeat' | 'escaped';
    };

    try {
      // Fetch encounter and verify ownership
      const { data: encounter } = await supabaseServiceClient
        .from('active_encounters')
        .select('character_id')
        .eq('id', encounterId)
        .single();

      if (!encounter) {
        res.status(404).json({ error: 'Encounter not found' });
        return;
      }

      // Verify user owns the character
      const { data: character } = await supabaseServiceClient
        .from('characters')
        .select('id')
        .eq('id', encounter.character_id)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (!character) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Server calculates rewards, not client
      await endEncounter(encounterId, outcome);
      res.json({ success: true });
    } catch (error) {
      console.error('[ActiveEvents] Error ending encounter:', error);
      res.status(500).json({ error: 'Failed to end encounter' });
    }
  }
);

export default router;
