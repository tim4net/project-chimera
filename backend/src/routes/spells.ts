import { Router, type Request, type Response } from 'express';
import { getSpellsForClass, ALL_SPELLS, SPELLS_BY_LEVEL } from '../data/spells';
import type { Spell } from '../data/spellTypes';

const router = Router();

/**
 * GET /api/spells
 * Query params:
 * - class: Filter by class (e.g., "Bard", "Wizard")
 * - maxLevel: Maximum spell level to include (default: 9)
 * - level: Specific spell level (0 for cantrips)
 * - school: Filter by magic school (e.g., "Evocation")
 * - ritual: Filter ritual spells only (true/false)
 * - concentration: Filter concentration spells only (true/false)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      class: className,
      maxLevel,
      level,
      school,
      ritual,
      concentration,
    } = req.query;

    let spells: Spell[] = ALL_SPELLS;

    // Filter by class
    if (className && typeof className === 'string') {
      const maxLevelNum = maxLevel ? parseInt(maxLevel as string, 10) : 9;
      spells = getSpellsForClass(className, maxLevelNum);
    }

    // Filter by specific level
    if (level !== undefined) {
      const levelNum = parseInt(level as string, 10);
      if (!isNaN(levelNum) && levelNum >= 0 && levelNum <= 9) {
        spells = spells.filter(spell => spell.level === levelNum);
      }
    }

    // Filter by school
    if (school && typeof school === 'string') {
      spells = spells.filter(spell =>
        spell.school.toLowerCase() === school.toLowerCase()
      );
    }

    // Filter by ritual
    if (ritual === 'true') {
      spells = spells.filter(spell => spell.ritual);
    }

    // Filter by concentration
    if (concentration === 'true') {
      spells = spells.filter(spell => spell.concentration);
    }

    res.json({
      count: spells.length,
      spells,
    });
  } catch (error) {
    console.error('[Spells API] Error fetching spells:', error);
    res.status(500).json({
      error: 'Failed to fetch spells',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/spells/:spellName
 * Get a specific spell by name
 */
router.get('/:spellName', (req: Request, res: Response) => {
  try {
    const { spellName } = req.params;
    const spell = ALL_SPELLS.find(
      s => s.name.toLowerCase() === spellName.toLowerCase()
    );

    if (!spell) {
      res.status(404).json({
        error: 'Spell not found',
        spellName,
      });
      return;
    }

    res.json(spell);
  } catch (error) {
    console.error('[Spells API] Error fetching spell:', error);
    res.status(500).json({
      error: 'Failed to fetch spell',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/spells/levels/:level
 * Get all spells of a specific level
 */
router.get('/levels/:level', (req: Request, res: Response) => {
  try {
    const level = parseInt(req.params.level, 10);

    if (isNaN(level) || level < 0 || level > 9) {
      res.status(400).json({
        error: 'Invalid spell level',
        message: 'Level must be between 0 (cantrips) and 9',
      });
      return;
    }

    const spells = SPELLS_BY_LEVEL[level] || [];

    res.json({
      level,
      count: spells.length,
      spells,
    });
  } catch (error) {
    console.error('[Spells API] Error fetching spells by level:', error);
    res.status(500).json({
      error: 'Failed to fetch spells',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
