const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// GET /api/characters - List user's characters
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

const { validatePointBuy } = require('../game/rules');
const { getStartingEquipment } = require('../game/equipment');
const { generateOnboardingScene } = require('../services/gemini');

// POST /api/characters - Create new character
router.post('/', async (req, res) => {
  const { strength, dexterity, constitution, intelligence, wisdom, charisma, class: characterClass } = req.body;
  const scores = { strength, dexterity, constitution, intelligence, wisdom, charisma };

  if (!validatePointBuy(scores)) {
    return res.status(400).json({ error: 'Invalid ability scores for point-buy.' });
  }

  const characterData = {
    ...req.body,
    position_x: Math.floor(Math.random() * 100),
    position_y: Math.floor(Math.random() * 100),
    campaign_seed: 'default', // Placeholder
  };

  const { data: character, error } = await supabase
    .from('characters')
    .insert([characterData])
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const equipment = getStartingEquipment(characterClass).map((item) => ({
    ...item,
    character_id: character.id,
  }));

  if (equipment.length > 0) {
    const { error: equipmentError } = await supabase
      .from('items')
      .insert(equipment);

    if (equipmentError) {
      // Handle equipment insertion error (e.g., rollback character creation)
      return res.status(500).json({ error: equipmentError.message });
    }
  }

  const onboardingScene = await generateOnboardingScene(character);
  const { error: journalError } = await supabase
    .from('journal_entries')
    .insert([{
      character_id: character.id,
      entry_type: 'narrative',
      content: onboardingScene,
    }]);

  if (journalError) {
    // Handle journal entry error
    return res.status(500).json({ error: journalError.message });
  }

  res.status(201).json(character);
});

// GET /api/characters/:id - Get character details
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
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

// PATCH /api/characters/:id - Update character
router.patch('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .update(req.body)
    .eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// DELETE /api/characters/:id - Delete character
router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('characters')
    .delete()
    .eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
});

module.exports = router;