const express = require('express');
const router = express.Router();
const { generateMapTiles, generatePOIsInRadius } = require('../game/map');

// GET /api/world/:seed/map - Get map tiles around position
router.get('/:seed/map', async (req, res) => {
  try {
    const { seed } = req.params;
    const x = parseInt(req.query.x) || 0;
    const y = parseInt(req.query.y) || 0;
    const radius = parseInt(req.query.radius) || 10;

    // Validate parameters
    if (isNaN(x) || isNaN(y) || isNaN(radius)) {
      return res.status(400).json({
        error: 'Invalid parameters. x, y, and radius must be numbers.'
      });
    }

    if (radius > 50) {
      return res.status(400).json({
        error: 'Radius too large. Maximum radius is 50.'
      });
    }

    // Generate map tiles
    const tiles = generateMapTiles(x, y, radius, seed);

    // TODO: Implement fog of war based on character exploration
    // For MVP, we'll mark all tiles as explored
    const tilesWithFog = tiles.map(tile => ({
      ...tile,
      explored: true // In production, check against character's exploration data
    }));

    res.json({
      center: { x, y },
      radius,
      tiles: tilesWithFog,
      tileCount: tilesWithFog.length
    });
  } catch (error) {
    console.error('Error generating map:', error);
    res.status(500).json({
      error: 'Failed to generate map',
      message: error.message
    });
  }
});

// GET /api/world/:seed/poi - Get Points of Interest near position
router.get('/:seed/poi', async (req, res) => {
  try {
    const { seed } = req.params;
    const x = parseInt(req.query.x) || 0;
    const y = parseInt(req.query.y) || 0;
    const radius = parseInt(req.query.radius) || 20;

    // Validate parameters
    if (isNaN(x) || isNaN(y) || isNaN(radius)) {
      return res.status(400).json({
        error: 'Invalid parameters. x, y, and radius must be numbers.'
      });
    }

    if (radius > 100) {
      return res.status(400).json({
        error: 'Radius too large. Maximum radius is 100.'
      });
    }

    // Generate POIs
    const pois = generatePOIsInRadius(x, y, radius, seed);

    // TODO: Filter by discovered status based on character data
    // For MVP, we'll show all POIs in range
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
      message: error.message
    });
  }
});

// GET /api/world/:seed/tile/:x/:y - Get a single tile (useful for detail views)
router.get('/:seed/tile/:x/:y', async (req, res) => {
  try {
    const { seed, x, y } = req.params;
    const xCoord = parseInt(x);
    const yCoord = parseInt(y);

    if (isNaN(xCoord) || isNaN(yCoord)) {
      return res.status(400).json({
        error: 'Invalid coordinates. x and y must be numbers.'
      });
    }

    const { generateTile, generatePOI } = require('../game/map');
    const tile = generateTile(xCoord, yCoord, seed);
    const poi = generatePOI(xCoord, yCoord, seed);

    res.json({
      tile: {
        ...tile,
        explored: true // TODO: Check character exploration data
      },
      poi: poi || null
    });
  } catch (error) {
    console.error('Error generating tile:', error);
    res.status(500).json({
      error: 'Failed to generate tile',
      message: error.message
    });
  }
});

module.exports = router;
