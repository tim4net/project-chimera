const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/characters/:id/active-event - Get current active event
router.get('/:id/active-event', async (req, res) => {
  // This is a placeholder for the actual logic to get the active event
  res.json({});
});

// POST /api/characters/:id/active-event/choose - Make choice in event
router.post('/:id/active-event/choose', async (req, res) => {
  // This is a placeholder for the actual logic to process the choice
  res.json({ outcome: 'You defeated the goblin!' });
});

// GET /api/characters/:id/active-event/history - Past active events
router.get('/:id/active-event/history', async (req, res) => {
  // This is a placeholder for the actual logic to get the event history
  res.json([{ event: 'You encountered a goblin!', outcome: 'You defeated the goblin!' }]);
});

module.exports = router;