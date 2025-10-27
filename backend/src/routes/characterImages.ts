/**
 * @fileoverview Character Images Route
 * Provides DiceBear avatars for character races, classes, and backgrounds
 */

import { Router, type Request, type Response } from 'express';
import { supabaseServiceClient } from '../services/supabaseClient';

const router = Router();
const supabase = supabaseServiceClient;

console.log(`[CharacterImages] Initialized - using DiceBear for character avatars`);

interface GenerateImageRequest {
  type: 'race' | 'class' | 'background';
  name: string;
}

/**
 * Generate a fantasy character image using Gemini's image generation
 * POST /api/character-images/generate
 * Stores and caches generated images in database
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, name } = req.body as GenerateImageRequest;

    // Validate input
    if (!type || !name) {
      return res.status(400).json({
        error: 'Missing required fields: type and name',
      });
    }

    if (type !== 'race' && type !== 'class' && type !== 'background') {
      return res.status(400).json({
        error: 'Invalid type. Must be "race", "class", or "background"',
      });
    }

    console.log(`[CharacterImages] Generating image for ${type}/${name}`);

    // Use DiceBear avatars for consistent, fast image generation
    const imageUrl = generateFallbackImageUrl(type, name);
    const source = 'dicebear';

    const now = new Date().toISOString();

    return res.status(200).json({
      success: true,
      type,
      name,
      imageUrl,
      source,
      generatedAt: now,
    });
  } catch (error) {
    console.error('[CharacterImages] Error:', error);
    res.status(500).json({
      error: 'Failed to process image request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate consistent avatar URLs using DiceBear
 */
function generateFallbackImageUrl(type: 'race' | 'class' | 'background', name: string): string {
  const seed = encodeURIComponent(`${type}-${name}`);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&scale=90&backgroundColor=transparent`;
}

export default router;
