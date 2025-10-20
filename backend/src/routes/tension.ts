/**
 * @file Tension API - Player-facing tension and reputation information
 *
 * Provides VAGUE warnings and narrative context WITHOUT exposing
 * threat percentages or mechanical details.
 */

import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import { getPlayerTensionInfo, getVagueWarningText, getReputationSummary } from '../services/playerFacingTension';
import type { CharacterRecord } from '../types';

const router = Router();

/**
 * GET /api/tension/:characterId
 * Get vague tension indicators for character (safe for UI)
 */
router.get(
  '/:characterId',
  requireAuth,
  async (req, res): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;

    try {
      const { characterId } = req.params;

      // Verify ownership
      const { data: character, error } = await supabaseServiceClient
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .eq('user_id', authenticatedReq.user.id)
        .single();

      if (error || !character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      // Get player-safe tension info
      const tensionInfo = getPlayerTensionInfo(character as CharacterRecord);
      const warning = getVagueWarningText(character as CharacterRecord);
      const reputation = getReputationSummary(character as CharacterRecord);

      res.status(200).json({
        tension: {
          feeling: tensionInfo.feeling,
          icon: tensionInfo.icon,
          color: tensionInfo.color,
          hasWarning: tensionInfo.shouldShowWarning,
        },
        warning: warning, // Vague description like "You feel watched..."
        reputation: reputation, // Narrative tags like "Claimed royal blood"
        // ❌ NOT INCLUDED: threat percentages, specific threat types, mechanics
      });

    } catch (error) {
      console.error('[Tension API] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
