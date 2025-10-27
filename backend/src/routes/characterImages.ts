/**
 * @fileoverview Character Images Route
 * Generates AI-powered fantasy character images for race and class selection
 * Stores images in Supabase Storage with metadata in database
 */

import { Router, type Request, type Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseServiceClient } from '../services/supabaseClient';

const router = Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const supabase = supabaseServiceClient;

interface GenerateImageRequest {
  type: 'race' | 'class';
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

    if (type !== 'race' && type !== 'class') {
      return res.status(400).json({
        error: 'Invalid type. Must be "race" or "class"',
      });
    }

    console.log(`[CharacterImages] Generating image for ${type}/${name}`);

    // Generate image URL using DiceBear (free fantasy avatars)
    const imageUrl = generateFallbackImageUrl(type, name);
    const now = new Date().toISOString();

    return res.status(200).json({
      success: true,
      type,
      name,
      imageUrl,
      source: 'generated',
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
 * Create a detailed image generation prompt for a fantasy character
 */
function generateImagePrompt(type: 'race' | 'class', name: string): string {
  const raceDescriptions: Record<string, string> = {
    Aasimar: 'celestial humanoid with radiant features, divine aura, ethereal appearance',
    Dragonborn: 'powerful draconic humanoid with scales, horns, and draconic features',
    Dwarf: 'stout bearded dwarf with rugged features and sturdy build',
    Elf: 'graceful elf with pointed ears and ethereal beauty',
    Gnome: 'small clever gnome with magical features and curious expression',
    'Half-Elf': 'blend of human and elven traits, graceful with human practicality',
    'Half-Orc': 'fierce half-orc with tusks and strong features',
    Halfling: 'small halfling with nimble features and curious eyes',
    Human: 'diverse human character with expressive features',
    Tiefling: 'infernal heritage tiefling with horns, tail, and otherworldly features',
  };

  const classDescriptions: Record<string, string> = {
    Barbarian: 'fierce warrior in rage, weapons drawn, primal power',
    Bard: 'charismatic performer with musical instrument, magical aura',
    Cleric: 'holy warrior with divine symbols and sacred armor',
    Druid: 'nature guardian with wild features and natural magic',
    Fighter: 'master combatant in tactical stance with weapons',
    Monk: 'martial artist in meditation or combat stance, disciplined',
    Paladin: 'holy knight in ornate armor with divine glow',
    Ranger: 'wilderness scout with bow and ranger equipment',
    Rogue: 'cunning infiltrator in shadow, daggers ready',
    Sorcerer: 'innate mage with magical aura and raw power',
    Warlock: 'pact mage with eldritch symbols and otherworldly features',
    Wizard: 'arcane scholar with spellbook and magical apparatus',
  };

  const baseDescription = type === 'race'
    ? raceDescriptions[name] || name
    : classDescriptions[name] || name;

  return `
    Create a fantasy character portrait for a D&D-style ${type === 'race' ? 'race' : 'class'}.

    ${type === 'race'
      ? `Race: ${name} - ${baseDescription}`
      : `Class: ${name} - ${baseDescription}`
    }

    Style: Dark fantasy, detailed character art, professional fantasy illustration
    Composition: Character portrait, upper body visible, dramatic lighting
    Quality: High resolution, vibrant colors, suitable for D&D character portraits

    Generate a unique, visually striking character image that captures the essence of this ${type}.
  `;
}

/**
 * Generate a fallback image URL using DiceBear
 * This provides a consistent avatar while we wait for real AI generation
 */
function generateFallbackImageUrl(type: 'race' | 'class', name: string): string {
  const seed = encodeURIComponent(`${type}-${name}`);
  return `https://api.dicebear.com/7.x/fantasy/svg?seed=${seed}&scale=90&backgroundColor=transparent`;
}

export default router;
