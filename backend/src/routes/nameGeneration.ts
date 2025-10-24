/**
 * Name Generation API - Uses LLM for creative fantasy names
 */

import { Router } from 'express';
import { generateFantasyName, generateNameOptions, generateNameCache } from '../services/nameGenerator';

const router = Router();

/**
 * POST /api/names/generate
 * Generate a single fantasy name
 */
router.post('/generate', async (req, res) => {
  try {
    const { race, gender, characterClass, background } = req.body;

    if (!race || !gender) {
      return res.status(400).json({ error: 'Race and gender are required' });
    }

    const name = await generateFantasyName({
      race,
      gender,
      characterClass,
      background,
    });

    return res.status(200).json(name);
  } catch (error) {
    console.error('[NameGeneration] Error:', error);
    return res.status(500).json({ error: 'Failed to generate name' });
  }
});

/**
 * POST /api/names/options
 * Generate multiple name options (3-5)
 */
router.post('/options', async (req, res) => {
  try {
    const { race, gender, characterClass, background, count = 3 } = req.body;

    if (!race || !gender) {
      return res.status(400).json({ error: 'Race and gender are required' });
    }

    const names = await generateNameOptions(
      { race, gender, characterClass, background },
      Math.min(count, 5) // Max 5 names
    );

    return res.status(200).json({ names });
  } catch (error) {
    console.error('[NameGeneration] Error:', error);
    return res.status(500).json({ error: 'Failed to generate names' });
  }
});

/**
 * POST /api/names/cache
 * Generate 10 first names and 10 last names for caching
 * Frontend will randomly select one from each list on subsequent clicks
 */
router.post('/cache', async (req, res) => {
  try {
    const { race, gender, characterClass, background } = req.body;

    if (!race || !gender) {
      return res.status(400).json({ error: 'Race and gender are required' });
    }

    const nameCache = await generateNameCache({
      race,
      gender,
      characterClass,
      background,
    });

    return res.status(200).json(nameCache);
  } catch (error) {
    console.error('[NameGeneration] Error generating name cache:', error);
    return res.status(500).json({ error: 'Failed to generate name cache' });
  }
});

export default router;
