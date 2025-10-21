import type { GenerativeModel } from '@google/generative-ai';

import type { EncounterPromptContext, GeneratedEncounter } from '../types/encounter-types';
import { getModel } from './gemini';

const GENERATION_TIMEOUT_MS = 8000;

function sanitizeJsonResponse(response: string): string | null {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return jsonMatch[0];
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Gemini encounter generation timed out.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

export class EncounterGenerationService {
  private flashModel: Promise<GenerativeModel> | null = null;

  private async getFlashModel(): Promise<GenerativeModel> {
    if (!this.flashModel) {
      this.flashModel = getModel('flash');
    }
    return this.flashModel;
  }

  async generateEncounter(context: EncounterPromptContext): Promise<GeneratedEncounter> {
    const model = await this.getFlashModel();

    const prompt = this.buildPrompt(context);
    const result = await withTimeout(model.generateContent(prompt), GENERATION_TIMEOUT_MS);
    const response = await result.response;
    const text = await response.text();
    const jsonPayload = sanitizeJsonResponse(text);

    if (!jsonPayload) {
      throw new Error('Gemini encounter generation returned invalid response.');
    }

    const parsed = JSON.parse(jsonPayload) as GeneratedEncounter;
    return parsed;
  }

  private buildPrompt(context: EncounterPromptContext): string {
    const subtypeLine = context.subtype ? `- Subtype: ${context.subtype}\n` : '';

    return `You are The Chronicler, generating a flavorful travel encounter for a tabletop RPG.

Encounter Inputs:
- Encounter Type: ${context.type}
${subtypeLine}- Biome: ${context.biome}
- Time of Day: ${context.timeOfDay}
- Distance Travelled in session (tiles): ${Math.round(context.distanceTravelled)}
- Danger Level: ${context.dangerLevel}
- Road Danger: ${context.roadDanger}
- On Road: ${context.onRoad}

Respond ONLY with a JSON object shaped exactly like this:
{
  "id": "string (unique short identifier)",
  "name": "short evocative title",
  "type": "${context.type}",
  "subtype": "${context.subtype ?? context.type}",
  "description": "2 sentences of vivid description, include sensory details",
  "npcMotivations": ["short bullet-style motivation or rumor", "another"],
  "hook": "player-facing prompt or choice",
  "tone": "whimsical | ominous | mysterious | urgent | calm"
}

Guidelines:
- Tie the encounter strongly to the biome and road danger level.
- If type is weather_event, describe weather hazards.
- If type is merchant_caravan or traveling_party, include NPC motivations.
- Keep language game-master friendly.
- Avoid combat directives; focus on story beats.
- 2 motivations maximum.
`;
  }
}

export const encounterGenerationService = new EncounterGenerationService();
