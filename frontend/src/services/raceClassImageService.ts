/**
 * @fileoverview Race and Class Image Service
 * Handles fetching AI-generated images for races and classes
 */

// Cache for generated images to avoid redundant API calls
const imageCache = new Map<string, string>();

/**
 * Fetches an AI-generated image for a race or class
 * @param type - 'race' or 'class'
 * @param name - The race or class name
 * @returns A promise resolving to the image URL
 */
export const getCharacterImage = async (
  type: 'race' | 'class',
  name: string
): Promise<string> => {
  const cacheKey = `${type}:${name}`;

  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Call backend endpoint to generate or fetch image
    const response = await fetch('/api/character-images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.imageUrl;

    // Cache the result
    imageCache.set(cacheKey, imageUrl);

    return imageUrl;
  } catch (error) {
    console.error('Error fetching character image:', error);
    // Return a placeholder image URL on error
    return getFallbackImageUrl(type, name);
  }
};

/**
 * Gets a fallback image URL when AI generation fails
 * Uses DiceBear avatars as a temporary placeholder
 */
const getFallbackImageUrl = (type: 'race' | 'class', name: string): string => {
  // Use DiceBear avatars as fallback (free, no API key needed)
  // Maps name to a seed for consistent avatars
  const seed = encodeURIComponent(`${type}-${name}`);
  return `https://api.dicebear.com/7.x/fantasy/svg?seed=${seed}&scale=90`;
};

/**
 * Pre-loads all race and class images
 * Useful for warming up the cache before showing the selection screen
 */
export const preloadCharacterImages = async (
  races: string[],
  classes: string[]
): Promise<void> => {
  const allPromises: Promise<string>[] = [];

  races.forEach((race) => {
    allPromises.push(getCharacterImage('race', race));
  });

  classes.forEach((className) => {
    allPromises.push(getCharacterImage('class', className));
  });

  try {
    await Promise.all(allPromises);
  } catch (error) {
    console.warn('Failed to preload all images:', error);
    // Non-critical, images will load on demand
  }
};

export default getCharacterImage;
