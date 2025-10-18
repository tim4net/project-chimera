import { Router, type Request, type Response } from 'express';
import { generateMapTiles, generatePOIsInRadius, generateTile, generatePOI } from '../game/map';

const router = Router();

const parseNumber = (value: string | string[] | undefined, fallback: number): number => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

router.get('/:seed/map', async (req: Request, res: Response) => {
  try {
    const { seed } = req.params;
    const x = parseNumber(req.query.x as string | undefined, 0);
    const y = parseNumber(req.query.y as string | undefined, 0);
    const radius = parseNumber(req.query.radius as string | undefined, 10);

    if (radius > 50) {
      return res.status(400).json({ error: 'Radius too large. Maximum radius is 50.' });
    }

    const tiles = generateMapTiles(x, y, radius, seed).map(tile => ({
      ...tile,
      explored: true
    }));

    res.json({
      center: { x, y },
      radius,
      tiles,
      tileCount: tiles.length
    });
  } catch (error) {
    console.error('Error generating map:', error);
    res.status(500).json({
      error: 'Failed to generate map',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:seed/poi', async (req: Request, res: Response) => {
  try {
    const { seed } = req.params;
    const x = parseNumber(req.query.x as string | undefined, 0);
    const y = parseNumber(req.query.y as string | undefined, 0);
    const radius = parseNumber(req.query.radius as string | undefined, 20);

    if (radius > 100) {
      return res.status(400).json({ error: 'Radius too large. Maximum radius is 100.' });
    }

    const pois = generatePOIsInRadius(x, y, radius, seed);

    res.json({
      center: { x, y },
      radius,
      pois,
      poiCount: pois.length
    });
  } catch (error) {
    console.error('Error generating POIs:', error);
    res.status(500).json({
      error: 'Failed to generate POIs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:seed/tile/:x/:y', async (req: Request, res: Response) => {
  try {
    const { seed } = req.params;
    const xCoord = Number.parseInt(req.params.x, 10);
    const yCoord = Number.parseInt(req.params.y, 10);

    if (Number.isNaN(xCoord) || Number.isNaN(yCoord)) {
      return res.status(400).json({ error: 'Invalid coordinates. x and y must be numbers.' });
    }

    const tile = generateTile(xCoord, yCoord, seed);
    const poi = generatePOI(xCoord, yCoord, seed);

    res.json({
      tile: {
        ...tile,
        explored: true
      },
      poi: poi ?? null
    });
  } catch (error) {
    console.error('Error generating tile:', error);
    res.status(500).json({
      error: 'Failed to generate tile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
