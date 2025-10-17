const express = require('express');
const router = express.Router();
const { generateImage } = require('../services/imageGeneration');
const { generateText, batchGenerateText } = require('../services/textGeneration');
const { getActiveStyleConfig, getAllStyleVersions, setActiveStyle } = require('../services/styleConfig');

/**
 * POST /api/assets/image
 * Generate or retrieve cached image
 */
router.post('/image', async (req, res) => {
  // Increase timeout for image generation (can take 2+ minutes)
  req.setTimeout(180000); // 3 minutes

  try {
    const { prompt, dimensions, contextType, context } = req.body;

    // Validation
    if (!prompt || !dimensions || !contextType) {
      return res.status(400).json({
        error: 'Missing required fields: prompt, dimensions, contextType'
      });
    }

    if (!dimensions.width || !dimensions.height) {
      return res.status(400).json({
        error: 'Dimensions must include width and height'
      });
    }

    const validContextTypes = ['character_portrait', 'location_banner', 'item_icon', 'biome_tile', 'ui_element'];
    if (!validContextTypes.includes(contextType)) {
      return res.status(400).json({
        error: `Invalid contextType. Must be one of: ${validContextTypes.join(', ')}`
      });
    }

    const result = await generateImage({
      prompt,
      dimensions,
      contextType,
      context: context || {}
    });

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      cached: result.cached,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('[API] Image generation error:', error);
    res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
});

/**
 * POST /api/assets/text
 * Generate or retrieve cached text
 */
router.post('/text', async (req, res) => {
  try {
    const { contextKey, textType, prompt, context, useGemini } = req.body;

    // Validation
    if (!contextKey || !textType || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: contextKey, textType, prompt'
      });
    }

    const validTextTypes = ['narration', 'description', 'dialogue', 'quest_text', 'flavor'];
    if (!validTextTypes.includes(textType)) {
      return res.status(400).json({
        error: `Invalid textType. Must be one of: ${validTextTypes.join(', ')}`
      });
    }

    const result = await generateText({
      contextKey,
      textType,
      prompt,
      context: context || {},
      useGemini: useGemini || false
    });

    res.json({
      success: true,
      content: result.content,
      cached: result.cached,
      llmUsed: result.llmUsed,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('[API] Text generation error:', error);
    res.status(500).json({
      error: 'Failed to generate text',
      message: error.message
    });
  }
});

/**
 * POST /api/assets/text/batch
 * Batch generate multiple text requests
 */
router.post('/text/batch', async (req, res) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: 'requests must be a non-empty array'
      });
    }

    if (requests.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 requests per batch'
      });
    }

    const results = await batchGenerateText(requests);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('[API] Batch text generation error:', error);
    res.status(500).json({
      error: 'Failed to batch generate text',
      message: error.message
    });
  }
});

/**
 * GET /api/assets/style
 * Get current active style configuration
 */
router.get('/style', async (req, res) => {
  try {
    const styleConfig = await getActiveStyleConfig();

    res.json({
      success: true,
      style: styleConfig
    });
  } catch (error) {
    console.error('[API] Style config error:', error);
    res.status(500).json({
      error: 'Failed to fetch style configuration',
      message: error.message
    });
  }
});

/**
 * GET /api/assets/style/versions
 * Get all style versions
 */
router.get('/style/versions', async (req, res) => {
  try {
    const versions = await getAllStyleVersions();

    res.json({
      success: true,
      versions
    });
  } catch (error) {
    console.error('[API] Style versions error:', error);
    res.status(500).json({
      error: 'Failed to fetch style versions',
      message: error.message
    });
  }
});

/**
 * POST /api/assets/style/activate
 * Set a style version as active
 */
router.post('/style/activate', async (req, res) => {
  try {
    const { versionId } = req.body;

    if (!versionId) {
      return res.status(400).json({
        error: 'Missing required field: versionId'
      });
    }

    const updatedVersion = await setActiveStyle(versionId);

    res.json({
      success: true,
      activeVersion: updatedVersion
    });
  } catch (error) {
    console.error('[API] Style activation error:', error);
    res.status(500).json({
      error: 'Failed to activate style version',
      message: error.message
    });
  }
});

module.exports = router;
