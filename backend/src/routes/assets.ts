import { Router, type Request, type Response } from 'express';
import { generateImage } from '../services/imageGeneration';
import { batchGenerateText, generateText } from '../services/textGeneration';
import { getActiveStyleConfig, getAllStyleVersions, setActiveStyle } from '../services/styleConfig';
import type {
  ImageContextType,
  ImageDimensions,
  ImageGenerationResult,
  TextGenerationParams,
  TextGenerationResult,
  TextType
} from '../types';

const router = Router();

const validContextTypes: ImageContextType[] = [
  'character_portrait',
  'location_banner',
  'item_icon',
  'biome_tile',
  'ui_element'
];

const validTextTypes: TextType[] = [
  'narration',
  'description',
  'dialogue',
  'quest_text',
  'flavor'
];

router.post('/image', async (req: Request, res: Response) => {
  req.setTimeout(180_000);

  try {
    const { prompt, dimensions, contextType, context } = req.body as {
      prompt?: string;
      dimensions?: ImageDimensions;
      contextType?: ImageContextType;
      context?: Record<string, unknown>;
    };

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

    if (!validContextTypes.includes(contextType)) {
      return res.status(400).json({
        error: `Invalid contextType. Must be one of: ${validContextTypes.join(', ')}`
      });
    }

    const result: ImageGenerationResult = await generateImage({
      prompt,
      dimensions,
      contextType,
      context: context ?? {}
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/text', async (req: Request, res: Response) => {
  try {
    const { contextKey, textType, prompt, context, useGemini } = req.body as TextGenerationParams;

    if (!contextKey || !textType || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: contextKey, textType, prompt'
      });
    }

    if (!validTextTypes.includes(textType)) {
      return res.status(400).json({
        error: `Invalid textType. Must be one of: ${validTextTypes.join(', ')}`
      });
    }

    const result: TextGenerationResult = await generateText({
      contextKey,
      textType,
      prompt,
      context,
      useGemini
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/text/batch', async (req: Request, res: Response) => {
  try {
    const { requests } = req.body as { requests?: TextGenerationParams[] };

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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/style', async (_req: Request, res: Response) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/style/versions', async (_req: Request, res: Response) => {
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
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/style/activate', async (req: Request, res: Response) => {
  try {
    const { versionId } = req.body as { versionId?: string };

    if (!versionId) {
      return res.status(400).json({
        error: 'Missing required field: versionId'
      });
    }

    const updatedVersion = await setActiveStyle(versionId);

    res.json({
      success: true,
      version: updatedVersion
    });
  } catch (error) {
    console.error('[API] Style activate error:', error);
    res.status(500).json({
      error: 'Failed to set active style',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
