/**
 * LLM-Powered Fantasy Name Generator
 * Uses free/local LLM to generate creative, unique fantasy names
 */

import { generateWithLocalLLM } from './narratorLLM';

interface NameGenerationRequest {
  race: string;
  gender: 'male' | 'female' | 'nonbinary';
  characterClass?: string;
  background?: string;
}

interface NameGenerationResult {
  fullName: string;
  firstName: string;
  lastName: string;
  meaning?: string;
}

/**
 * Generate a fantasy name using LLM
 */
export async function generateFantasyName(
  request: NameGenerationRequest
): Promise<NameGenerationResult> {
  const prompt = buildNamePrompt(request);

  try {
    // Call local LLM for creative name generation
    // Use higher temperature (0.9) for creative, unique names
    const llmResponse = await generateWithLocalLLM(prompt, {
      temperature: 0.9,
      maxTokens: 200,
    });

    console.log('[NameGenerator] LLM generated name for', request.race, request.gender);

    // Parse the LLM response
    return parseNameResponse(llmResponse);
  } catch (error) {
    console.warn('[NameGenerator] LLM generation failed, using fallback:', error instanceof Error ? error.message : String(error));
    // Fallback to deterministic generation on any LLM error
    return generateFallbackName(request);
  }
}

function buildNamePrompt(request: NameGenerationRequest): string {
  const genderText = request.gender === 'nonbinary' ? 'gender-neutral' : request.gender;
  const classContext = request.characterClass ? ` ${request.characterClass}` : '';
  const backgroundContext = request.background ? ` (${request.background})` : '';

  // Culture and name inspiration hints by race
  const culturalHints: Record<string, string> = {
    Human: 'Anglo-Saxon, Germanic, or Mediterranean inspired',
    Elf: 'Elvish: flowing, musical, nature-inspired syllables',
    Dwarf: 'Dwarven: sturdy, earth-inspired with hard consonants',
    Halfling: 'Halfling: whimsical, agricultural references',
    Tiefling: 'Infernal or demonic undertones, mysterious',
    'Half-Orc': 'Orcish honor-based names, strong and commanding',
    Dragonborn: 'Dragon-inspired, powerful and resonant',
    Gnome: 'Gnomish: clever, mechanical, whimsical elements',
  };

  const cultureHint = culturalHints[request.race] || 'Fantasy-appropriate to the character\'s culture';

  return `Generate a fantasy name for a ${genderText} ${request.race}${classContext}${backgroundContext}.

CULTURAL CONTEXT: ${cultureHint}

REQUIREMENTS:
- First name and surname (or title-based last name)
- Unique and memorable - NOT generic or clichéd
- Evocative of ${request.race} heritage and culture
- Mysterious but pronounceable
- Fits a dark fantasy world (medieval, dangerous, mysterious)

RESPOND ONLY WITH JSON (no markdown, no extra text):
{
  "firstName": "first name only",
  "lastName": "family name or title-based surname",
  "meaning": "1-2 sentence origin or meaning"
}

EXAMPLE for Female Elf Wizard:
{
  "firstName": "Selendra",
  "lastName": "Moonwhisper",
  "meaning": "Moon-touched seeker of hidden arcane secrets"
}

Now generate a UNIQUE name for this character:`;
}

function parseNameResponse(response: string): NameGenerationResult {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        fullName: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        meaning: data.meaning,
      };
    }

    // Fallback: parse line-by-line
    const lines = response.split('\n');
    let firstName = '';
    let lastName = '';

    for (const line of lines) {
      if (line.toLowerCase().includes('first') || line.toLowerCase().includes('given')) {
        firstName = line.split(':')[1]?.trim().replace(/['"]/g, '') || '';
      }
      if (line.toLowerCase().includes('last') || line.toLowerCase().includes('family') || line.toLowerCase().includes('surname')) {
        lastName = line.split(':')[1]?.trim().replace(/['"]/g, '') || '';
      }
    }

    if (firstName && lastName) {
      return {
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
      };
    }

    throw new Error('Could not parse name from LLM response');
  } catch (error) {
    console.error('[NameGenerator] Parse error:', error);
    throw error;
  }
}

function generateFallbackName(request: NameGenerationRequest): NameGenerationResult {
  // Simple fallback based on race
  const fallbacks: Record<string, { male: string[]; female: string[]; last: string[] }> = {
    Human: {
      male: ['Aldric', 'Kaelith', 'Severin', 'Theron', 'Vesper'],
      female: ['Aeliana', 'Celestia', 'Isolde', 'Ravenna', 'Selene'],
      last: ['Darkbane', 'Emberstorm', 'Shadowmend', 'Starcaller', 'Winterfang'],
    },
    Elf: {
      male: ['Aelrindel', 'Faelynor', 'Soveliss', 'Tharivol'],
      female: ['Celestara', 'Lirazel', 'Melandriel', 'Thalindra'],
      last: ['Moonwhisper', 'Starweaver', 'Mythweaver', 'Crystalwing'],
    },
    Dwarf: {
      male: ['Bruenor', 'Thorin', 'Grimforge', 'Ironhelm'],
      female: ['Kathra', 'Brunhilde', 'Mardred', 'Vistra'],
      last: ['Ironforge', 'Runekeeper', 'Mountainborn', 'Earthshaker'],
    },
    Tiefling: {
      male: ['Damakos', 'Infernus', 'Mordai', 'Zethris'],
      female: ['Lilith', 'Seraphina', 'Orianna', 'Belladonna'],
      last: ['Hellsfire', 'Shadowflame', 'Voidseeker', 'Dreadborn'],
    },
  };

  const raceFallback = fallbacks[request.race] || fallbacks.Human;
  const firstNames = request.gender === 'female' ? raceFallback.female : raceFallback.male;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = raceFallback.last[Math.floor(Math.random() * raceFallback.last.length)];

  return {
    fullName: `${firstName} ${lastName}`,
    firstName,
    lastName,
  };
}

/**
 * Generate multiple name options (for user to choose from)
 */
export async function generateNameOptions(
  request: NameGenerationRequest,
  count: number = 3
): Promise<NameGenerationResult[]> {
  const names: NameGenerationResult[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const name = await generateFantasyName(request);
      names.push(name);
    } catch (error) {
      // If one fails, continue with others
      console.error(`[NameGenerator] Failed to generate name ${i + 1}:`, error);
    }
  }

  // Ensure we have at least some names
  while (names.length < Math.min(count, 3)) {
    names.push(generateFallbackName(request));
  }

  return names;
}
