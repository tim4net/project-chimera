import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import {
  createParty,
  inviteToParty,
  acceptInvite,
  getPartyMembers,
  leaveParty
} from '../services/partyService';

const router = Router();

// POST /api/party/create - Create a new party
router.post(
  '/create',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { characterId, partyName } = req.body as {
      characterId: string;
      partyName: string;
    };

    // Verify ownership
    const { data: character } = await supabaseServiceClient
      .from('characters')
      .select('campaign_seed')
      .eq('id', characterId)
      .eq('user_id', authenticatedReq.user.id)
      .single();

    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const result = await createParty(characterId, partyName, character.campaign_seed);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ partyId: result.partyId });
  }
);

// POST /api/party/:partyId/invite - Invite character to party
router.post(
  '/:partyId/invite',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { partyId } = req.params;
    const { characterId, invitedCharacterId, message } = req.body as {
      characterId: string;
      invitedCharacterId: string;
      message?: string;
    };

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

    const result = await inviteToParty(partyId, invitedCharacterId, characterId, message);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ inviteId: result.inviteId });
  }
);

// POST /api/party/invite/:inviteId/accept - Accept party invite
router.post(
  '/invite/:inviteId/accept',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { inviteId } = req.params;
    const { characterId } = req.body as { characterId: string };

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

    const result = await acceptInvite(inviteId, characterId);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true });
  }
);

// GET /api/party/:partyId/members - Get party members
router.get(
  '/:partyId/members',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { partyId } = req.params;

    // Verify user has a character in this party
    const { data: userChars } = await supabaseServiceClient
      .from('characters')
      .select('id')
      .eq('user_id', authenticatedReq.user.id);

    const characterIds = userChars?.map(c => c.id) || [];

    const { data: membership } = await supabaseServiceClient
      .from('party_members')
      .select('character_id')
      .eq('party_id', partyId)
      .in('character_id', characterIds)
      .single();

    if (!membership) {
      res.status(403).json({ error: 'You are not in this party' });
      return;
    }

    const result = await getPartyMembers(partyId);

    if (result.error) {
      res.status(500).json({ error: result.error.message });
      return;
    }

    res.json({ members: result.data });
  }
);

// POST /api/party/:partyId/leave - Leave party
router.post(
  '/:partyId/leave',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { partyId } = req.params;
    const { characterId } = req.body as { characterId: string };

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

    const result = await leaveParty(partyId, characterId);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({ success: true });
  }
);

export default router;
