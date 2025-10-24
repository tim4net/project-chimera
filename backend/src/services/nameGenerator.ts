/**
 * LLM-Powered Fantasy Name Generator
 * Uses free/local LLM to generate creative, unique fantasy names
 */

import { generateWithLocalLLM } from './narratorLLM';
import { parseJsonFromResponse, validateJsonStructure } from './jsonParser';

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

    // Parse the LLM response
    return parseNameResponse(llmResponse);
  } catch (error) {
    console.warn(`[NameGenerator] ⚠ LLM name generation failed for ${request.race} ${request.gender}, using deterministic fallback`);
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

  return `You are a fantasy name generator. Create a unique name for a ${genderText} ${request.race}${classContext}${backgroundContext}.

CRITICAL: YOU MUST OUTPUT EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"firstName":"FIRST","lastName":"LAST","meaning":"MEANING"}

CULTURAL CONTEXT: ${cultureHint}

REQUIREMENTS FOR EACH FIELD:
- firstName (string): First/given name only (5-15 chars). Evocative of ${request.race} culture. Pronounceable but mysterious. Examples: Selendra, Thorin, Aeliana, Kael, Sylvira
- lastName (string): Family name or title-based surname (5-20 chars). Examples: Moonwhisper, Stonehelm, Shadowbane, Embercrest
- meaning (string): 1-2 sentences explaining the name's origin or meaning (30-100 chars). NO markdown.

INVALID OUTPUT EXAMPLES (DO NOT DO THESE):
- {"firstName":"A","lastName":"B"...} - WRONG: Names too short
- {"firstName":"Bob","lastName":"Smith"...} - WRONG: Not fantasy-appropriate
- {"meaning":"This is a very long explanation that goes on and on and on explaining every detail"...} - WRONG: Too long
- \`\`\`json {...}\`\`\` - WRONG: Don't use code blocks
- {"firstName":"Name's","lastName":"Test"...} - WRONG: Quotes not escaped in strings

VALID OUTPUT EXAMPLE:
{"firstName":"Selendra","lastName":"Moonwhisper","meaning":"Moon-touched seeker of hidden arcane secrets, blessed by the ancient forest."}

Generate ONE UNIQUE ${genderText} ${request.race}${classContext}${backgroundContext} name now. Output ONLY the JSON on a single line, nothing else:`;
}

function parseNameResponse(response: string): NameGenerationResult {
  try {
    // Use centralized JSON parser with automatic cleanup
    const parseResult = parseJsonFromResponse<NameGenerationResult>(response, {
      fixCommonErrors: true,
    });

    if (parseResult.success && parseResult.data) {
      const data = parseResult.data;

      // Validate required fields
      if (
        validateJsonStructure(data, ['firstName', 'lastName']) &&
        data.firstName &&
        data.lastName
      ) {
        return {
          fullName: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          meaning: data.meaning,
        };
      }
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
      console.info('[NameGenerator] ✅ Used fallback line-by-line parsing for LLM response');
      return {
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
      };
    }

    throw new Error('LLM response could not be parsed - malformed or missing required fields');
  } catch (error) {
    console.warn(
      '[NameGenerator] ⚠ Badly formatted LLM response:',
      error instanceof Error ? error.message : String(error)
    );
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

/**
 * Generate 10 first names and 10 last names separately
 * Used for caching on the frontend - select random combinations
 */
export interface NameCache {
  firstNames: string[];
  lastNames: string[];
}

function buildNameCachePrompt(request: NameGenerationRequest): string {
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

  return `You are a fantasy name generator. Generate EXACTLY 10 first names and 10 last names for ${genderText} ${request.race}${classContext}${backgroundContext} characters.

CULTURAL CONTEXT: ${cultureHint}

CRITICAL: YOU MUST OUTPUT EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"firstNames":["NAME1","NAME2",...,"NAME10"],"lastNames":["SURNAME1","SURNAME2",...,"SURNAME10"]}

REQUIREMENTS:
- firstNames (array of 10 strings): Evocative of ${request.race} culture. Pronounceable but mysterious. 5-15 chars each. All UNIQUE.
  Examples: Selendra, Thorin, Aeliana, Kael, Sylvira, Meridian, Kassian, Lysander, Thalia, Elowen
- lastNames (array of 10 strings): Family names or title-based surnames. 5-20 chars each. All UNIQUE.
  Examples: Moonwhisper, Stonehelm, Shadowbane, Embercrest, Ironveil, Frostwhisper, Darkbane, Starweaver, Nightbloom, Crystalwing

INVALID OUTPUT EXAMPLES (DO NOT DO THESE):
- {"firstNames":["A","B",...]} - WRONG: Names too short
- {"firstNames":["Bob","Smith",...]} - WRONG: Not fantasy-appropriate
- ["name1", "name2"] - WRONG: Must be JSON object with firstNames and lastNames arrays
- \`\`\`json {...}\`\`\` - WRONG: Don't use code blocks
- Duplicate names in either array - WRONG: All names must be unique

VALID OUTPUT EXAMPLE:
{"firstNames":["Selendra","Thorin","Aeliana","Kael","Sylvira","Meridian","Kassian","Lysander","Thalia","Elowen"],"lastNames":["Moonwhisper","Stonehelm","Shadowbane","Embercrest","Ironveil","Frostwhisper","Darkbane","Starweaver","Nightbloom","Crystalwing"]}

Generate NOW. Output ONLY the JSON on a single line, nothing else:`;
}

function parseNameCacheResponse(response: string): NameCache | null {
  try {
    // Use centralized JSON parser with automatic cleanup
    const parseResult = parseJsonFromResponse<NameCache>(response, {
      fixCommonErrors: true,
    });

    if (parseResult.success && parseResult.data) {
      const data = parseResult.data;

      // Validate required fields
      if (
        validateJsonStructure(data, ['firstNames', 'lastNames']) &&
        Array.isArray(data.firstNames) &&
        Array.isArray(data.lastNames) &&
        data.firstNames.length === 10 &&
        data.lastNames.length === 10 &&
        data.firstNames.every((n: any) => typeof n === 'string' && n.length > 0) &&
        data.lastNames.every((n: any) => typeof n === 'string' && n.length > 0)
      ) {
        return {
          firstNames: data.firstNames,
          lastNames: data.lastNames,
        };
      }
    }

    return null;
  } catch (error) {
    console.warn(
      '[NameGenerator] ⚠ Failed to parse name cache response:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

export async function generateNameCache(
  request: NameGenerationRequest
): Promise<NameCache> {
  try {
    const prompt = buildNameCachePrompt(request);

    // Call local LLM once to generate all 10 first and 10 last names
    const llmResponse = await generateWithLocalLLM(prompt, {
      temperature: 0.9,
      maxTokens: 500,
    });

    const parsedCache = parseNameCacheResponse(llmResponse);
    if (parsedCache) {
      console.info('[NameGenerator] ✅ Successfully generated 10 first + 10 last names in single LLM request');
      return parsedCache;
    }
  } catch (error) {
    console.warn(
      `[NameGenerator] ⚠ LLM name cache generation failed for ${request.race} ${request.gender}, using fallback names`
    );
  }

  // Fallback: Generate using our curated list approach
  const seenFirstNames = new Set<string>();
  const seenLastNames = new Set<string>();
  const firstNames: string[] = [];
  const lastNames: string[] = [];

  for (let i = 0; i < 10; i++) {
    const name = generateFallbackName(request);
    if (!seenFirstNames.has(name.firstName)) {
      firstNames.push(name.firstName);
      seenFirstNames.add(name.firstName);
    }
    if (!seenLastNames.has(name.lastName)) {
      lastNames.push(name.lastName);
      seenLastNames.add(name.lastName);
    }
  }

  // Ensure we have exactly 10 of each
  while (firstNames.length < 10) {
    const name = generateFallbackName(request);
    if (!seenFirstNames.has(name.firstName)) {
      firstNames.push(name.firstName);
      seenFirstNames.add(name.firstName);
    }
  }

  while (lastNames.length < 10) {
    const name = generateFallbackName(request);
    if (!seenLastNames.has(name.lastName)) {
      lastNames.push(name.lastName);
      seenLastNames.add(name.lastName);
    }
  }

  return { firstNames: firstNames.slice(0, 10), lastNames: lastNames.slice(0, 10) };
}
