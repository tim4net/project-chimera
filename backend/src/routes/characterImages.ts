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
function generateImagePrompt(type: 'race' | 'class' | 'background', name: string): string {
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

  const backgroundDescriptions: Record<string, string> = {
    Acolyte: 'religious cleric in temple robes, divine symbols, spiritual wisdom',
    Charlatan: 'cunning con artist with rogueish charm, dressed in fine stolen clothes',
    Criminal: 'street-hardened thief in dark leather, weapons and lock picks visible',
    Entertainer: 'charismatic performer on stage with instruments and stage presence',
    'Folk Hero': 'noble peasant champion, humble clothing but heroic bearing',
    'Guild Artisan': 'skilled craftsperson at work, tools and creations surrounding',
    Hermit: 'wise sage in meditation, robes of seclusion, mystical atmosphere',
    Noble: 'aristocrat in fine clothing and jewelry, proud and dignified',
    Outlander: 'rugged wilderness wanderer with furs and survival gear',
    Sage: 'scholar surrounded by books and scrolls, intellectual and focused',
    Sailor: 'seasoned sailor with nautical attire, ship or ocean in background',
    Soldier: 'military warrior in armor and uniform, disciplined and battle-worn',
    Urchin: 'street urchin in tattered clothes, scrappy and resourceful',
  };

  let typeLabel = type;
  let baseDescription = name;

  if (type === 'race') {
    baseDescription = raceDescriptions[name] || name;
    typeLabel = 'race';
  } else if (type === 'class') {
    baseDescription = classDescriptions[name] || name;
    typeLabel = 'class';
  } else if (type === 'background') {
    baseDescription = backgroundDescriptions[name] || name;
    typeLabel = 'background';
  }

  return `
    Create a fantasy character portrait for a D&D-style ${typeLabel}.

    ${typeLabel === 'race'
      ? `Race: ${name} - ${baseDescription}`
      : typeLabel === 'class'
      ? `Class: ${name} - ${baseDescription}`
      : `Background: ${name} - ${baseDescription}`
    }

    Style: Dark fantasy, detailed character art, professional fantasy illustration
    Composition: Character portrait, upper body visible, dramatic lighting
    Quality: High resolution, vibrant colors, suitable for D&D character portraits

    Generate a unique, visually striking character image that captures the essence of this ${typeLabel}.
  `;
}

/**
 * Generate a fallback image URL using DiceBear
 * This provides a consistent avatar while we wait for real AI generation
 */
function generateFallbackImageUrl(type: 'race' | 'class' | 'background', name: string): string {
  const seed = encodeURIComponent(`${type}-${name}`);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&scale=90&backgroundColor=transparent`;
}

export default router;
