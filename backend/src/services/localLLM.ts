/**
 * @fileoverview Service for interacting with local LLM endpoint (OpenAI-compatible API)
 * Automatically selects the best small model (≤8B parameters) for speed
 */
import type { CharacterRecord } from '../types';
import type { ChatMessage, ParsedDmResponse } from '../types/chat';

const LOCAL_LLM_ENDPOINT = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';

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

- Only include fields in "stateChanges" if they actually change.
- "hp" represents the CHANGE in HP (e.g., -5 for damage, 10 for healing).
- "journalEntry" should only be created for significant events.
- Keep the narrative concise (2-4 sentences).

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

interface LocalLlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function listAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${LOCAL_LLM_ENDPOINT}/models`);
    const data = await response.json() as { data: Array<{ id: string }> };
    return data.data.map(m => m.id);
  } catch (error) {
    console.error('[LocalLLM] Failed to list models:', error);
    return [];
  }
}

function selectBestModel(availableModels: string[]): string {
  // Preferred models in order (all ≤8B for speed)
  // YOUR SUGGESTION: qwen/qwen3-4b-2507 (4B - fast and high quality)
  const preferredModels = [
    'qwen/qwen3-4b-2507',           // 4B - RECOMMENDED
    'google/gemma-3-4b',            // 4B - Google's latest
    'grok-3-gemma3-4b-distilled',   // 4B - optimized
    'qwen/qwen3-4b',                // 4B - stable
    'ibm/granite-3.1-8b',           // 8B - good quality
    'qwen2-nextgen-8b',             // 8B - creative
  ];

  for (const preferred of preferredModels) {
    if (availableModels.includes(preferred)) {
      console.log(`[LocalLLM] ✓ Selected model: ${preferred}`);
      return preferred;
    }
  }

  // Fallback: find any model with 4b or 8b in name
  const smallModel = availableModels.find(m =>
    m.toLowerCase().includes('4b') || m.toLowerCase().includes('8b')
  );

  if (smallModel) {
    console.log(`[LocalLLM] ✓ Selected fallback model: ${smallModel}`);
    return smallModel;
  }

  console.warn('[LocalLLM] No small models found, using first available');
  return availableModels[0] || 'qwen/qwen3-4b-2507';
}

function buildPrompt(character: CharacterRecord, history: ChatMessage[], playerMessage: string): LocalLlmMessage[] {
  const characterSheet = `Name: ${character.name}, Class: ${character.class}, Level: ${character.level}
HP: ${character.hp_current}/${character.hp_max}, Position: (${character.position_x}, ${character.position_y})
XP: ${character.xp}, Gold: ${character.gold || 0} gp
Abilities: STR ${character.ability_scores.STR}, DEX ${character.ability_scores.DEX}, CON ${character.ability_scores.CON}, INT ${character.ability_scores.INT}, WIS ${character.ability_scores.WIS}, CHA ${character.ability_scores.CHA}`;

  const messages: LocalLlmMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Character: ${characterSheet}` },
  ];

  // If this is a returning session (history exists but no recent activity)
  // Add a context reminder to The Chronicler
  if (history.length > 0 && history.length <= 3) {
    const lastActions = history
      .filter(msg => msg.role === 'player')
      .slice(-2)
      .map(msg => msg.content)
      .join('; ');

    if (lastActions) {
      messages.push({
        role: 'system',
        content: `NOTE: When greeting this returning player, briefly remind them of their recent actions: ${lastActions}. Then respond to their current message.`
      });
    }
  }

  // Add conversation history
  history.forEach(msg => {
    messages.push({
      role: msg.role === 'dm' ? 'assistant' : 'user',
      content: msg.content
    });
  });

  // Add current player message
  messages.push({ role: 'user', content: playerMessage });

  return messages;
}

function parseResponse(responseText: string): ParsedDmResponse {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = responseText.match(jsonRegex);

  let jsonPayload = null;
  const narrative = responseText.replace(jsonRegex, '').trim();

  if (match && match[1]) {
    try {
      jsonPayload = JSON.parse(match[1]);
    } catch (error) {
      console.error('[LocalLLM] Failed to parse JSON:', error);
    }
  }

  return { narrative, jsonPayload };
}

let cachedModel: string | null = null;

export async function getDmResponseLocal(
  character: CharacterRecord,
  conversationHistory: ChatMessage[],
  playerMessage: string
): Promise<ParsedDmResponse> {
  // Select best model (cache the selection)
  if (!cachedModel) {
    const models = await listAvailableModels();
    cachedModel = selectBestModel(models);
  }

  const messages = buildPrompt(character, conversationHistory, playerMessage);

  const response = await fetch(`${LOCAL_LLM_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: cachedModel,
      messages,
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`Local LLM returned ${response.status}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const responseText = data.choices[0]?.message?.content || '';
  return parseResponse(responseText);
}

// Legacy function for compatibility
export const generateText = async (
  _prompt: string,
  _options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> => {
  console.warn('[LocalLLM] Legacy generateText called - use getDmResponseLocal instead');
  throw new Error('Use getDmResponseLocal for chat functionality');
};

export default {
  generateText,
  getDmResponseLocal
};
