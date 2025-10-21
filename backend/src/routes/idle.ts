import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { supabaseServiceClient } from '../services/supabaseClient';
import {
  startIdleTask,
  checkIdleTaskStatus,
  resolveIdleTask,
  type IdleTaskType
} from '../services/idleTaskService';

const router = Router();

// POST /api/idle/:id/start - Start an idle task
router.post(
  '/:id/start',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id: characterId } = req.params;
    const { taskType, parameters } = req.body as {
      taskType?: IdleTaskType;
      parameters?: Record<string, any>;
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

    if (!taskType) {
      res.status(400).json({ error: 'Task type is required' });
      return;
    }

    const result = await startIdleTask(characterId, taskType, parameters);

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json(result);
  }
);

// GET /api/idle/:id/status - Check idle task status
router.get(
  '/:id/status',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id: characterId } = req.params;

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

    const status = await checkIdleTaskStatus(characterId);
    res.json(status);
  }
);

// POST /api/idle/:id/resolve - Complete an idle task
router.post(
  '/:id/resolve',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id: characterId } = req.params;

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

    const result = await resolveIdleTask(characterId);

    if ('error' in result) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  }
);

// POST /api/idle/:id/cancel - Cancel an idle task
router.post(
  '/:id/cancel',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id: characterId } = req.params;

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

    const { error } = await supabaseServiceClient
      .from('characters')
      .update({
        idle_task: null,
        idle_task_started_at: null,
      })
      .eq('id', characterId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ success: true, message: 'Idle task cancelled' });
  }
);

export default router;
