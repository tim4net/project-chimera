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
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      name,
      race,
      class: characterClass,
      background,
      alignment,
      abilityScores,
      skills,
      backstory,
      portraitUrl
    } = req.body;

    // Validate required fields
    if (!name || !race || !characterClass || !background || !alignment || !abilityScores) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate point-buy
    const scores = {
      strength: abilityScores.STR,
      dexterity: abilityScores.DEX,
      constitution: abilityScores.CON,
      intelligence: abilityScores.INT,
      wisdom: abilityScores.WIS,
      charisma: abilityScores.CHA
    };

    if (!validatePointBuy(scores)) {
      return res.status(400).json({ error: 'Invalid ability scores for point-buy' });
    }

    // Calculate derived stats
    const conMod = Math.floor((abilityScores.CON - 10) / 2);
    const dexMod = Math.floor((abilityScores.DEX - 10) / 2);

    // Hit dice by class
    const hitDice = {
      'Barbarian': 12, 'Fighter': 10, 'Paladin': 10, 'Ranger': 10,
      'Bard': 8, 'Cleric': 8, 'Druid': 8, 'Monk': 8, 'Rogue': 8, 'Warlock': 8,
      'Sorcerer': 6, 'Wizard': 6
    };

    const classHitDie = hitDice[characterClass] || 8;
    const maxHp = classHitDie + conMod;

    // Base speed by race
    const raceSpeeds = {
      'Aasimar': 30, 'Dragonborn': 30, 'Dwarf': 25, 'Elf': 30, 'Gnome': 25,
      'Goliath': 30, 'Halfling': 25, 'Human': 30, 'Orc': 30, 'Tiefling': 30
    };
    const speed = raceSpeeds[race] || 30;

    // Generate campaign seed
    const campaignSeed = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Starting position
    const startingPosition = { x: 500, y: 500 };

    // Calculate AC (base 10 + DEX modifier)
    const armorClass = 10 + dexMod;

    // Create character
    const { data: character, error } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name,
        race,
        class: characterClass,
        background,
        alignment,
        level: 1,
        xp: 0,
        ability_scores: abilityScores,
        hp_max: maxHp,
        hp_current: maxHp,
        temporary_hp: 0,
        armor_class: armorClass,
        speed,
        hit_dice: { [classHitDie]: 1 },
        position: startingPosition,
        campaign_seed: campaignSeed,
        spell_slots: {},
        backstory: backstory ? JSON.stringify(backstory) : null,
        skills: skills ? JSON.stringify(skills) : null,
        portrait_url: portraitUrl,
        proficiency_bonus: 2
      })
      .select()
      .single();

    if (error) {
      console.error('[Characters] Create error:', error);
      return res.status(500).json({ error: 'Failed to create character', details: error.message });
    }

    console.log(`[Characters] Created: ${character.name} (${character.id})`);

    // TODO: Add starting equipment
    // TODO: Generate onboarding scene with Gemini

    res.status(201).json(character);
  } catch (error) {
    console.error('[Characters] Create exception:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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