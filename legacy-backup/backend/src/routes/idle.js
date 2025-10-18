const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// POST /api/characters/:id/idle-task - Set idle task (travel, scout)
router.post('/:id/idle-task', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .update({
      idle_task: req.body.task,
      idle_task_started_at: new Date(),
    })
    .eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// GET /api/characters/:id/idle-task/status - Check task status
router.get('/:id/idle-task/status', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .select('idle_task, idle_task_started_at')
    .eq('id', req.params.id)
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'Character not found' });
  }
  res.json(data);
});

// POST /api/characters/:id/idle-task/resolve - Manually resolve task
router.post('/:id/idle-task/resolve', async (req, res) => {
  // This is a placeholder for the actual task resolution logic
  const { data, error } = await supabase
    .from('characters')
    .update({
      idle_task: null,
      idle_task_started_at: null,
    })
    .eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

module.exports = router;