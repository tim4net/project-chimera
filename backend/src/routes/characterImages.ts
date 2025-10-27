/**
 * @fileoverview Character Images Route
 * Generates fantasy character art in Vox Machina style using Replicate API
 * Falls back to DiceBear if Replicate is unavailable
 */

import { Router, type Request, type Response } from 'express';
import { supabaseServiceClient } from '../services/supabaseClient';

const router = Router();
const replicateApiToken = process.env.REPLICATE_API_TOKEN;
const supabase = supabaseServiceClient;

console.log(`[CharacterImages] Initialized - Replicate token available: ${!!replicateApiToken}`);

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

    // Try to generate via Replicate first, fall back to DiceBear
    let imageUrl: string;
    let source = 'replicate';

    if (replicateApiToken) {
      try {
        imageUrl = await generateViaReplicate(type, name);
        console.log(`[CharacterImages] ✅ Generated via Replicate: ${type}/${name}`);
      } catch (error) {
        console.warn(`[CharacterImages] Replicate failed, falling back to DiceBear:`, error instanceof Error ? error.message : error);
        imageUrl = generateFallbackImageUrl(type, name);
        source = 'dicebear-fallback';
      }
    } else {
      imageUrl = generateFallbackImageUrl(type, name);
      source = 'dicebear-fallback';
    }

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
 * Generate image via Replicate's Stable Diffusion model
 * Uses fantasy-specific prompts in the style of Vox Machina (Critical Role)
 */
async function generateViaReplicate(type: 'race' | 'class' | 'background', name: string): Promise<string> {
  const prompt = generateReplicatePrompt(type, name);
  console.log(`[CharacterImages] Replicate request - type: ${type}, name: ${name}`);

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        input: {
          prompt,
          negative_prompt: 'blurry, low quality, cartoon, simple, ugly, deformed',
          num_inference_steps: 20,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[CharacterImages] Replicate error body:`, errorBody);
      throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const prediction = await response.json();

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30; // Max 30 seconds of polling

    while (!completed && attempts < maxAttempts) {
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: { Authorization: `Token ${replicateApiToken}` },
        }
      );

      if (!statusResponse.ok) {
        throw new Error(`Failed to check prediction status: ${statusResponse.status}`);
      }

      const status = await statusResponse.json();

      if (status.status === 'succeeded') {
        completed = true;
        if (status.output && Array.isArray(status.output) && status.output.length > 0) {
          return status.output[0] as string;
        }
        throw new Error('No output from Replicate');
      } else if (status.status === 'failed') {
        throw new Error(`Prediction failed: ${status.error}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Image generation timed out');
  } catch (error) {
    console.error('[CharacterImages] Replicate error:', error);
    throw error;
  }
}

/**
 * Create a Vox Machina-style fantasy prompt for Replicate/Stable Diffusion
 */
function generateReplicatePrompt(type: 'race' | 'class' | 'background', name: string): string {
  const racePrompts: Record<string, string> = {
    Aasimar: 'D&D fantasy character portrait, celestial aasimar with divine radiance, silver eyes, ethereal glowing aura, ornate divine clothing, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Dragonborn: 'D&D fantasy character portrait, draconic dragonborn with scales and horns, powerful draconic features, fantasy warrior, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Dwarf: 'D&D fantasy character portrait, sturdy dwarf with elaborate beard and rugged features, fantasy armor and tools, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Elf: 'D&D fantasy character portrait, graceful elf with pointed ears and ethereal beauty, noble fantasy clothing, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Gnome: 'D&D fantasy character portrait, clever gnome with magical features and curious expression, fantasy robes and magical aura, professional fantasy art, critical role style, detailed, atmospheric lighting',
    'Half-Elf': 'D&D fantasy character portrait, half-elf with blend of human and elven traits, graceful and noble, professional fantasy art, critical role style, detailed, atmospheric lighting',
    'Half-Orc': 'D&D fantasy character portrait, fierce half-orc with tusks and strong draconic features, intimidating warrior, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Halfling: 'D&D fantasy character portrait, small halfling with nimble features and curious eyes, adventuring gear, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Human: 'D&D fantasy character portrait, expressive human with diverse features and determined look, adventuring gear, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Tiefling: 'D&D fantasy character portrait, tiefling with infernal heritage, horns and tail, otherworldly features and arcane aura, professional fantasy art, critical role style, detailed, atmospheric lighting',
  };

  const classPrompts: Record<string, string> = {
    Barbarian: 'D&D fantasy character portrait, fierce barbarian warrior in combat rage, weapons drawn, primal power and battle scars, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Bard: 'D&D fantasy character portrait, charismatic bard with musical instrument, magical aura and charm, colorful fantasy clothing, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Cleric: 'D&D fantasy character portrait, holy warrior cleric with divine symbols and sacred armor, glowing holy light, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Druid: 'D&D fantasy character portrait, nature guardian druid with wild features and natural magic, surrounded by nature, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Fighter: 'D&D fantasy character portrait, master combatant fighter in tactical stance with weapons and armor, confident warrior, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Monk: 'D&D fantasy character portrait, disciplined martial artist monk in meditation or combat stance, mystical aura, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Paladin: 'D&D fantasy character portrait, holy knight paladin in ornate armor with divine glow and sacred symbols, righteous warrior, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Ranger: 'D&D fantasy character portrait, wilderness scout ranger with bow and ranger equipment, nature connection, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Rogue: 'D&D fantasy character portrait, cunning infiltrator rogue in shadows with daggers ready, mysterious assassin, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Sorcerer: 'D&D fantasy character portrait, innate mage sorcerer with magical aura and raw arcane power, mystical features, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Warlock: 'D&D fantasy character portrait, pact mage warlock with eldritch symbols and otherworldly features, dark mystical aura, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Wizard: 'D&D fantasy character portrait, arcane scholar wizard with spellbook and magical apparatus, mystical robes, professional fantasy art, critical role style, detailed, atmospheric lighting',
  };

  const backgroundPrompts: Record<string, string> = {
    Acolyte: 'D&D fantasy character portrait, religious cleric acolyte in temple robes with divine symbols, spiritual wisdom, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Charlatan: 'D&D fantasy character portrait, cunning con artist with rogueish charm and fine stolen clothes, mysterious and deceptive, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Criminal: 'D&D fantasy character portrait, street-hardened thief in dark leather with weapons and lock picks, dangerous criminal, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Entertainer: 'D&D fantasy character portrait, charismatic performer on stage with instruments and performance presence, colorful and expressive, professional fantasy art, critical role style, detailed, atmospheric lighting',
    'Folk Hero': 'D&D fantasy character portrait, noble peasant champion in humble clothing with heroic bearing, people\'s hero, professional fantasy art, critical role style, detailed, atmospheric lighting',
    'Guild Artisan': 'D&D fantasy character portrait, skilled craftsperson at work with tools and creations, masterful artisan, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Hermit: 'D&D fantasy character portrait, wise sage in meditation with robes of seclusion and mystical atmosphere, spiritual recluse, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Noble: 'D&D fantasy character portrait, aristocrat in fine clothing and jewelry, proud and dignified nobility, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Outlander: 'D&D fantasy character portrait, rugged wilderness wanderer with furs and survival gear, hardened adventurer, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Sage: 'D&D fantasy character portrait, scholar surrounded by books and scrolls, intellectual and focused researcher, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Sailor: 'D&D fantasy character portrait, seasoned sailor with nautical attire and sea experience, ocean in background, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Soldier: 'D&D fantasy character portrait, military warrior in armor and uniform, disciplined and battle-worn veteran, professional fantasy art, critical role style, detailed, atmospheric lighting',
    Urchin: 'D&D fantasy character portrait, street urchin in tattered clothes, scrappy and resourceful survivor, professional fantasy art, critical role style, detailed, atmospheric lighting',
  };

  let basePrompt = name;

  if (type === 'race' && racePrompts[name]) {
    basePrompt = racePrompts[name];
  } else if (type === 'class' && classPrompts[name]) {
    basePrompt = classPrompts[name];
  } else if (type === 'background' && backgroundPrompts[name]) {
    basePrompt = backgroundPrompts[name];
  }

  return basePrompt;
}

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
