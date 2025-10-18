import { Router, type Request, type Response } from 'express';
import { supabaseServiceClient } from '../services/supabaseClient';

interface IdleTaskRecord {
  idle_task: string | null;
  idle_task_started_at: string | null;
}

const router = Router();

router.post('/:id/idle-task', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { task } = req.body as { task?: string };

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  const { data, error } = await supabaseServiceClient
    .from('characters')
    .update({
      idle_task: task,
      idle_task_started_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('idle_task, idle_task_started_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as IdleTaskRecord[]);
});

router.get('/:id/idle-task/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabaseServiceClient
    .from('characters')
    .select('idle_task, idle_task_started_at')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json(data as IdleTaskRecord);
});

router.post('/:id/idle-task/resolve', async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabaseServiceClient
    .from('characters')
    .update({
      idle_task: null,
      idle_task_started_at: null
    })
    .eq('id', id)
    .select('idle_task, idle_task_started_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as IdleTaskRecord[]);
});

export default router;
