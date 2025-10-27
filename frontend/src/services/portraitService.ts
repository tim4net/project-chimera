/**
 * @file portraitService.ts
 * @description Service for generating character portraits using AI
 * Integrates with backend characterPortraitPrompts service
 */

import type { Character } from '../types/wizard';

export interface PortraitGenerationOptions {
  character: Partial<Character>;
  customDescription?: string;
}

export interface PortraitResult {
  imageUrl: string;
  prompt: string;
}

/**
 * Generates a character portrait using AI
 * @param options Character data and optional custom description
 * @returns Promise resolving to image URL
 * @throws Error if generation fails
 */
export async function generatePortrait(
  options: PortraitGenerationOptions
): Promise<PortraitResult> {
  const { character, customDescription } = options;

  // Validate required fields
  if (!character.race || !character.class) {
    throw new Error('Character must have race and class to generate portrait');
  }

  try {
    const response = await fetch('/api/character-portrait/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        race: character.race,
        class: character.class,
        description: character.description || customDescription,
        alignment: character.alignment,
        name: character.name,
        customDescription,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Portrait generation failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.imageUrl,
      prompt: data.prompt,
    };
  } catch (error) {
    console.error('[PortraitService] Generation failed:', error);

    // Return fallback placeholder on error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during portrait generation');
  }
}

/**
 * Mock portrait generation for testing
 * Returns a placeholder image immediately
 */
export async function generatePortraitMock(
  options: PortraitGenerationOptions
): Promise<PortraitResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { character } = options;
  const placeholderUrl = `https://via.placeholder.com/512x512/1a1a2e/d4af37?text=${encodeURIComponent(
    `${character.race} ${character.class}`
  )}`;

  return {
    imageUrl: placeholderUrl,
    prompt: `Mock portrait for ${character.name || 'Hero'}`,
  };
}
