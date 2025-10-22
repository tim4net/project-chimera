import { GoogleGenerativeAI, type GenerativeModel, type CachedContent } from '@google/generative-ai';
import type { CharacterRecord } from '../types';
import type { ChatMessage, ParsedDmResponse } from '../types/chat';

interface CharacterSummary {
  name: string;
  race: string;
  class: string;
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Model types supported
export type GeminiModelType = 'pro' | 'flash' | 'image' | 'image-flash';

// Model selection cache
let cachedFlashModel: string | null = null;
let cachedProModel: string | null = null;
let cachedImageModel: string | null = null;
let cachedImageFlashModel: string | null = null;
let modelListFetched = false;

/**
 * Enumerate Gemini models and select best one based on model type
 */
async function selectBestModel(modelType: GeminiModelType = 'pro'): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Return cached if available
  if (modelType === 'flash' && cachedFlashModel) return cachedFlashModel;
  if (modelType === 'pro' && cachedProModel) return cachedProModel;
  if (modelType === 'image' && cachedImageModel) return cachedImageModel;
  if (modelType === 'image-flash' && cachedImageFlashModel) return cachedImageFlashModel;

  // Fetch model list once
  if (!modelListFetched) {
    try {
      console.log('[Gemini] Enumerating available models from API...');
      // Note: listModels may not be available in all SDK versions
      // Using type assertion to handle potential API differences
      const listResult = await (genAI as any).listModels?.();

      if (listResult && listResult.models) {
        const modelNames = listResult.models.map((m: any) => m.name.replace('models/', ''));
        console.log(`[Gemini] Found ${modelNames.length} models:`, modelNames.slice(0, 5).join(', '));

        // Select best flash model (fast, cheap - for quick tasks)
        const flashCandidates = modelNames.filter((n: string) =>
          n.toLowerCase().includes('flash') &&
          n.toLowerCase().includes('gemini') &&
          !n.toLowerCase().includes('imagen')
        ).sort().reverse(); // Newest first

        if (flashCandidates.length > 0) {
          cachedFlashModel = flashCandidates[0];
          console.log(`[Gemini] Selected flash model: ${cachedFlashModel}`);
        }

        // Select best pro model (quality - for important tasks)
        const proCandidates = modelNames.filter((n: string) =>
          n.toLowerCase().includes('pro') &&
          n.toLowerCase().includes('gemini') &&
          !n.toLowerCase().includes('flash') &&
          !n.toLowerCase().includes('imagen')
        ).sort().reverse(); // Newest first

        if (proCandidates.length > 0) {
          cachedProModel = proCandidates[0];
          console.log(`[Gemini] Selected pro model: ${cachedProModel}`);
        }

        // Select best image model (for image generation)
        const imageCandidates = modelNames.filter((n: string) =>
          n.toLowerCase().includes('imagen') &&
          !n.toLowerCase().includes('flash')
        ).sort().reverse(); // Newest first

        if (imageCandidates.length > 0) {
          cachedImageModel = imageCandidates[0];
          console.log(`[Gemini] Selected image model: ${cachedImageModel}`);
        }

        // Select best image-flash model (fast image generation)
        const imageFlashCandidates = modelNames.filter((n: string) =>
          n.toLowerCase().includes('imagen') &&
          n.toLowerCase().includes('flash')
        ).sort().reverse(); // Newest first

        if (imageFlashCandidates.length > 0) {
          cachedImageFlashModel = imageFlashCandidates[0];
          console.log(`[Gemini] Selected image-flash model: ${cachedImageFlashModel}`);
        }

        modelListFetched = true;
      }
    } catch (error) {
      console.error('[Gemini] Failed to enumerate models:', error);
      // Will fallback below
    }
  }

  // Return best match or fallback
  if (modelType === 'flash' && cachedFlashModel) return cachedFlashModel;
  if (modelType === 'pro' && cachedProModel) return cachedProModel;
  if (modelType === 'image' && cachedImageModel) return cachedImageModel;
  if (modelType === 'image-flash' && cachedImageFlashModel) return cachedImageFlashModel;

  // Fallback to known working models (updated for 2025)
  // Note: Gemini 1.5 models retired April 29, 2025
  const fallbacks: Record<GeminiModelType, string> = {
    'pro': 'gemini-2.5-pro',      // Stable, most powerful (Session 0, important tasks)
    'flash': 'gemini-2.5-flash',  // Stable, fast (quick generation)
    'image': 'imagen-3.0-generate-001',
    'image-flash': 'imagen-3.0-fast-generate-001'
  };

  const fallbackModel = fallbacks[modelType];
  console.warn(`[Gemini] Using fallback model for '${modelType}': ${fallbackModel}`);
  return fallbackModel;
}

export const getModel = async (modelType: GeminiModelType = 'pro'): Promise<GenerativeModel> => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const modelName = await selectBestModel(modelType);
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateOnboardingScene = async (character: CharacterSummary): Promise<string> => {
  const prompt = `Generate a short, exciting onboarding scene for a new D&D character.

Character Details:
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class}

Scene:`;

  try {
    const model = await getModel('pro'); // Use pro model for high-quality onboarding
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    return 'You awaken in a strange place...';
  }
};

export const generateText = async (
  prompt: string,
  options: { temperature?: number; maxTokens?: number; modelType?: GeminiModelType } = {}
): Promise<string> => {
  try {
    const model = await getModel(options.modelType ?? 'flash'); // Default to flash for quick text generation
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.8,
        maxOutputTokens: options.maxTokens ?? 200
      }
    });
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating text from Gemini:', error);
    throw error;
  }
};

export const generateImage = async (
  prompt: string,
  dimensions: { width: number; height: number } = { width: 512, height: 512 }
): Promise<null> => {
  // TODO: Replace placeholder once Gemini image generation is implemented; currently returns null.
  console.info('[Gemini] Image generation requested:', prompt, dimensions);
  console.info('[Gemini] Placeholder implementation. Configure Imagen or Stable Diffusion for real images.');
  return null;
};

// DM Response System for conversational gameplay
const SYSTEM_PROMPT = `You are The Chronicler, a master storyteller and Dungeon Master for a text-based RPG.
Your responses must be in two parts:
1. A narrative description of the world and the outcomes of the player's actions. This should be engaging, descriptive, and end with a question or prompt for the player.
2. A single, valid JSON object enclosed in a \`\`\`json ... \`\`\` block. This JSON object must not contain any comments and must conform to the specified schema.

The JSON object must have the following structure:
{
  "stateChanges": {
    "position": { "x": number, "y": number } | null,
    "hp": number | null,
    "xp": number | null
  },
  "journalEntry": { "type": string, "content": string } | null,
  "triggerActivePhase": boolean
}

- Only include fields in "stateChanges" if they actually change. If position doesn't change, set "position" to null or omit it.
- "hp" represents the CHANGE in HP (e.g., -5 for damage, 10 for healing).
- "journalEntry" should only be created for significant events. For minor actions, set it to null.
- Base your response on the provided context. Keep the narrative concise (2-4 sentences).

EXAMPLE:
You push through dense undergrowth for an hour. The canopy blocks most light. You arrive at coordinates (500, 505). A ruined tower looms ahead. What do you do?
\`\`\`json
{
  "stateChanges": {
    "position": { "x": 500, "y": 505 },
    "hp": null,
    "xp": 10
  },
  "journalEntry": {
    "type": "exploration",
    "content": "Traveled north and discovered a ruined tower at (500, 505)."
  },
  "triggerActivePhase": false
}
\`\`\`
`;

function buildDmPrompt(character: CharacterRecord, history: ChatMessage[], playerMessage: string): string {
  const characterSheet = `
    Name: ${character.name}
    Class: ${character.class}, Level: ${character.level}
    HP: ${character.hp_current}/${character.hp_max}
    Position: (${character.position_x}, ${character.position_y})
    XP: ${character.xp}
    Gold: ${character.gold || 0} gp
    Abilities: ${JSON.stringify(character.ability_scores)}
  `;

  const conversation = history
    .map(msg => `${msg.role === 'dm' ? 'Chronicler' : 'Player'}: ${msg.content}`)
    .join('\n');

  // Add recap instruction for returning sessions
  let recapInstruction = '';
  if (history.length > 0 && history.length <= 3) {
    const lastActions = history
      .filter(msg => msg.role === 'player')
      .slice(-2)
      .map(msg => msg.content)
      .join('; ');

    if (lastActions) {
      recapInstruction = `\nNOTE: This player is returning. Briefly remind them of their recent actions: ${lastActions}`;
    }
  }

  return `
    ${SYSTEM_PROMPT}${recapInstruction}

    CONTEXT:
    ---
    Character Sheet:
    ${characterSheet}
    ---
    Recent Conversation:
    ${conversation}
    ---

    PLAYER ACTION:
    "${playerMessage}"
  `;
}

function parseDmResponse(responseText: string): ParsedDmResponse {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = responseText.match(jsonRegex);

  let jsonPayload = null;
  const narrative = responseText.replace(jsonRegex, '').trim();

  if (match && match[1]) {
    try {
      jsonPayload = JSON.parse(match[1]);
    } catch (error) {
      console.error('Failed to parse JSON from LLM response:', error);
      // Keep narrative, but payload is null
    }
  } else {
    console.warn('No JSON block found in LLM response.');
  }

  return { narrative, jsonPayload };
}

export async function getDmResponse(
  character: CharacterRecord,
  conversationHistory: ChatMessage[],
  playerMessage: string
): Promise<ParsedDmResponse> {
  const prompt = buildDmPrompt(character, conversationHistory, playerMessage);

  try {
    const model = await getModel('flash'); // Use flash for quick DM responses (cost optimization)
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    return parseDmResponse(responseText);
  } catch (error) {
    console.error('Error calling Gemini API for DM response:', error);
    return {
      narrative: 'The Chronicler seems to be pondering... (An error occurred). Please try again.',
      jsonPayload: null,
    };
  }
}

// ============================================================================
// PROMPT CACHING (Cost Optimization - 90% savings on repeated content)
// ============================================================================

/**
 * Cache system prompt and static context to reduce costs
 * Cached content can be reused across requests for up to 1 hour
 * Reduces input token costs by ~90% for repeated context
 *
 * NOTE: As of 2025-01, Gemini caching API may be in preview.
 * This is a placeholder implementation for future use.
 */

interface CacheKey {
  type: 'system_prompt' | 'character_sheet' | 'world_context';
  identifier: string;
}

const cacheStore: Map<string, { content: string; timestamp: number }> = new Map();
const CACHE_TTL = 3600000; // 1 hour
const MAX_CACHE_SIZE = 1000; // Maximum number of cached entries

/**
 * Create or retrieve cached prompt content
 * This is a simplified implementation - actual Gemini caching uses cachedContent API
 */
export async function createCachedPrompt(
  key: CacheKey,
  content: string
): Promise<string> {
  const cacheId = `${key.type}:${key.identifier}`;
  const now = Date.now();

  // Check if cache exists and is valid
  const cached = cacheStore.get(cacheId);
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`[Gemini Cache] HIT: ${cacheId}`);
    return cacheId;
  }

  // Store new cache
  cacheStore.set(cacheId, { content, timestamp: now });
  console.log(`[Gemini Cache] MISS: ${cacheId} - created new cache`);

  // Enforce cache size limit using LRU (Least Recently Used) eviction
  // Maps iterate in insertion order, so oldest entries are first
  if (cacheStore.size > MAX_CACHE_SIZE) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey) {
      cacheStore.delete(oldestKey);
      console.log(`[Gemini Cache] EVICT: ${oldestKey} (cache size limit reached)`);
    }
  }

  return cacheId;
}

/**
 * Generate content using cached prompts
 * Combines cached content with new user input
 */
export async function generateWithCache(
  cacheIds: string[],
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; modelType?: GeminiModelType } = {}
): Promise<string> {
  // Retrieve cached content
  const cachedContents = cacheIds
    .map(id => cacheStore.get(id))
    .filter((c): c is { content: string; timestamp: number } => c !== undefined)
    .map(c => c.content);

  if (cachedContents.length !== cacheIds.length) {
    console.warn('[Gemini Cache] Some cached content was not found, regenerating...');
  }

  // Combine cached content with user prompt
  const fullPrompt = [...cachedContents, userPrompt].join('\n\n');

  // Use standard generateText function
  // In future, this would use Gemini's cachedContent API for actual token savings
  return await generateText(fullPrompt, options);
}

/**
 * Clean up expired cache entries
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cacheStore.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cacheStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Gemini Cache] Cleaned ${cleaned} expired entries`);
  }
}

// Cache cleanup interval management (lifecycle-safe)
let cacheCleanupInterval: NodeJS.Timeout | null = null;

export function startCacheCleaner(): void {
  if (cacheCleanupInterval) {
    console.log('[Gemini Cache] Cleaner already running, skipping...');
    return;
  }
  console.log('[Gemini Cache] Starting cache cleanup interval (every 10 minutes)');
  cacheCleanupInterval = setInterval(cleanExpiredCache, 600000);
}

export function stopCacheCleaner(): void {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
    console.log('[Gemini Cache] Stopped cache cleanup interval');
  }
}

export default {
  generateOnboardingScene,
  generateText,
  generateImage,
  getDmResponse,
  createCachedPrompt,
  generateWithCache,
  cleanExpiredCache,
  startCacheCleaner,
  stopCacheCleaner
};
