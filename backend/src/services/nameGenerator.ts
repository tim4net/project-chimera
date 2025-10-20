/**
 * LLM-Powered Fantasy Name Generator
 * Uses free/local LLM to generate creative, unique fantasy names
 */

// Name generation uses simple logic instead of LLM for now
// import { generateWithLocalLLM } from './narratorLLM';

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
    // Name generation currently uses fallback
    // TODO: Re-implement with proper LLM call when needed
    return generateFallbackName(request);
  } catch (error) {
    console.error('[NameGenerator] Generation failed:', error);
    // Fallback to simple generation
    return generateFallbackName(request);
  }
}

function buildNamePrompt(request: NameGenerationRequest): string {
  const genderText = request.gender === 'nonbinary' ? 'gender-neutral' : request.gender;

  return `Generate a creative fantasy name for a ${genderText} ${request.race}${request.characterClass ? ` ${request.characterClass}` : ''}${request.background ? ` with ${request.background} background` : ''}.

Requirements:
- First name and last name
- Appropriate for ${request.race} culture in dark fantasy setting
- Unique and memorable
- Evocative and mysterious
- Not common or mundane

Respond ONLY with JSON in this exact format:
{
  "firstName": "...",
  "lastName": "...",
  "meaning": "brief meaning or origin"
}

Example for Female Elf Wizard:
{
  "firstName": "Selendriel",
  "lastName": "Starwhisper",
  "meaning": "Moon-blessed seeker of ancient magic"
}

Generate name now:`;
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
