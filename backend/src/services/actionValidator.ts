/**
 * @file Action Validator - AI-powered validation for player actions
 *
 * This service validates unrecognized player actions (CONVERSATION type) to ensure:
 * 1. Physical possibility (can't play a sword as a flute)
 * 2. Character has necessary abilities/items
 * 3. D&D 5e rules compliance
 *
 * Architecture: Two-stage validation
 * - Stage 1: Fast deterministic checks (spell lists, inventory, abilities)
 * - Stage 2: AI sanity check using Local LLM (physics, common sense, D&D rules)
 */

import type { ActionSpec } from '../types/actions';
import type { CharacterRecord } from '../types';
import { supabaseServiceClient } from './supabaseClient';

const LOCAL_LLM_ENDPOINT = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  reason?: string; // Why it's invalid
  suggestion?: string; // What the player CAN do instead
  requiresClarification?: boolean; // Need more details from player
}

interface LLMValidationRequest {
  character: {
    name: string;
    race: string;
    class: string;
    level: number;
    abilities: Record<string, number>;
    inventory: string[];
    spells: string[];
    currentHP: number;
    maxHP: number;
  };
  action: string;
  context: {
    inCombat: boolean;
    location?: string;
  };
}

// ============================================================================
// STAGE 1: DETERMINISTIC CHECKS (Fast)
// ============================================================================

/**
 * Fast checks for obvious impossibilities based on character sheet
 */
async function performDeterministicChecks(
  action: ActionSpec,
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult | null> {
  const normalized = originalMessage.toLowerCase();

  // Check 0: Allow simple questions and conversational RP without LLM overhead
  const questionPatterns = [
    /^(what|where|which|who|how|why|when|can i|could i|should i|is there|are there)/i,
    /\?$/, // Ends with question mark
    /\b(look|examine|inspect|observe|check|see|notice|hear|smell)\b/i, // Perception/investigation
    /\b(ask|tell|say|talk|speak|greet|introduce)\b/i, // Social interaction
  ];

  if (questionPatterns.some(p => p.test(originalMessage))) {
    return {
      isValid: true,
      reason: "Valid conversational question or roleplay action"
    };
  }

  // Check 1: Spell casting without the spell
  const spellCastPattern = /\b(cast|use)\s+(\w+)/i;
  const spellMatch = originalMessage.match(spellCastPattern);
  if (spellMatch) {
    const spellName = spellMatch[2];

    // Check if character has the spell
    const knownCantrips = (character as any).selected_cantrips || [];
    const knownSpells = (character as any).selected_spells || [];
    const allKnownSpells = [...knownCantrips, ...knownSpells];

    // Case-insensitive spell name matching
    const hasSpell = allKnownSpells.some(
      spell => spell.toLowerCase() === spellName.toLowerCase()
    );

    if (!hasSpell) {
      return {
        isValid: false,
        reason: `You don't know the spell "${spellName}".`,
        suggestion: allKnownSpells.length > 0
          ? `You currently know: ${allKnownSpells.join(', ')}`
          : "You don't know any spells yet."
      };
    }
  }

  // Check 2: Using items not in inventory
  const itemUsePattern = /\b(use|wield|equip|drink|consume)\s+(my\s+)?(\w+)/i;
  const itemMatch = originalMessage.match(itemUsePattern);
  if (itemMatch) {
    const itemName = itemMatch[3];

    // Query inventory from database
    const { data: items, error } = await supabaseServiceClient
      .from('game_items')
      .select('name, quantity')
      .eq('character_id', character.id);

    if (error) {
      console.error('[ActionValidator] Failed to fetch inventory:', error);
      // Pass to AI validator if database query fails
      return null;
    }

    // Case-insensitive item name matching
    const hasItem = items?.some(
      item => item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!hasItem) {
      const inventoryList = items && items.length > 0
        ? items.map(i => `${i.name} (${i.quantity || 1})`).join(', ')
        : 'empty';

      return {
        isValid: false,
        reason: `You don't have "${itemName}" in your inventory.`,
        suggestion: `Your inventory: ${inventoryList}`
      };
    }

    // Check quantity for consumables
    const item = items?.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
    if (item && item.quantity !== undefined && item.quantity <= 0) {
      return {
        isValid: false,
        reason: `You're out of ${item.name}.`,
        suggestion: 'You need to find or purchase more.'
      };
    }
  }

  // Check 3: Physical impossibilities (obvious cases)
  const impossibleActions = [
    { pattern: /play.*sword.*(?:flute|instrument|music)/, message: "You can't play a sword as a musical instrument. Did you mean to attack with it?" },
    { pattern: /fly\s+(?:without|no).*wings/, message: "Without wings or magic, you cannot fly. Do you have a spell or item that grants flight?" },
    { pattern: /breathe.*underwater.*without/, message: "You cannot breathe underwater without magical assistance. Do you have a spell or item for this?" },
    { pattern: /\b(teleport|blink)\b/, message: "You don't have teleportation abilities. Consider traveling normally or finding a teleportation circle." },
  ];

  for (const { pattern, message } of impossibleActions) {
    if (pattern.test(normalized)) {
      return {
        isValid: false,
        reason: "This action is physically impossible.",
        suggestion: message
      };
    }
  }

  // Check 4: God-mode claims
  const godModePatterns = [
    /\b(i am|i'm)\s+(a\s+)?(god|deity|divine|immortal)\b/i,
    /\b(give me|grant me)\s+.*\b(legendary|artifact|divine|ultimate)\b/i,
    /\binstantly (kill|destroy|win)\b/i,
  ];

  if (godModePatterns.some(p => p.test(normalized))) {
    return {
      isValid: false,
      reason: "You cannot claim divine powers or omnipotence.",
      suggestion: "Describe what your character attempts to do within their abilities."
    };
  }

  // Passed deterministic checks, move to AI validation
  return null;
}

// ============================================================================
// STAGE 2: AI VALIDATION (Thorough)
// ============================================================================

/**
 * System prompt for the validator LLM
 */
const VALIDATOR_SYSTEM_PROMPT = `You are The Chronicler, the AI Dungeon Master for this D&D 5e game. Your role is to validate if a player's described action is possible based on:
1. The laws of physics (can't play a sword as a flute)
2. The character's abilities, inventory, and spells
3. D&D 5e rules

**CRITICAL: You ARE the DM. Never say "ask your DM" or reference "the DM" as another person. Speak directly to the player.**

**Your Response:**
Always respond with valid JSON in this exact format:
{
  "isValid": true/false,
  "reason": "Brief explanation for the player",
  "suggestion": "What they CAN do instead (if invalid)"
}

**Guidelines:**
- Be strict but fair
- Physical impossibilities: REJECT (playing swords, breathing underwater without magic)
- Creative roleplay: ALLOW (examining surroundings, talking to NPCs, reasonable actions)
- Missing abilities/items: REJECT with helpful suggestion
- D&D rule violations: REJECT with explanation
- XP/Gold cheating: REJECT and remind them to earn rewards through gameplay

**Examples:**

Action: "I play my longsword as a musical instrument"
Response: {"isValid": false, "reason": "A sword cannot be played as an instrument.", "suggestion": "If you're a bard, you could play your actual musical instrument. Or describe how you strike your sword against your shield to make noise."}

Action: "I cast Wish"
Character: Level 3 Wizard, knows Magic Missile and Shield
Response: {"isValid": false, "reason": "You don't know the Wish spell.", "suggestion": "Wish is a 9th-level spell requiring 17th level. You currently know: Magic Missile, Shield. Try using one of these spells."}

Action: "I carefully examine the room for traps"
Response: {"isValid": true, "reason": "Valid Investigation action"}

Action: "I try to convince the guard I'm a visiting noble"
Response: {"isValid": true, "reason": "Valid Persuasion/Deception attempt"}

Action: "Give me 10000 XP"
Response: {"isValid": false, "reason": "XP must be earned through gameplay.", "suggestion": "Complete quests, defeat monsters, or achieve story milestones to earn experience points."}`;

/**
 * Build validation prompt for the LLM
 */
async function buildValidationPrompt(
  character: CharacterRecord,
  originalMessage: string
): Promise<string> {
  // Get known spells from character
  const knownCantrips = (character as any).selected_cantrips || [];
  const knownSpells = (character as any).selected_spells || [];
  const allKnownSpells = [...knownCantrips, ...knownSpells];
  const spells = allKnownSpells.length > 0 ? allKnownSpells.join(', ') : 'None';

  // Fetch inventory from database
  let inventory = 'Unknown';
  try {
    const { data: items, error } = await supabaseServiceClient
      .from('game_items')
      .select('name, quantity')
      .eq('character_id', character.id);

    if (!error && items) {
      inventory = items.length > 0
        ? items.map(i => `${i.name} (${i.quantity || 1})`).join(', ')
        : 'Empty';
    }
  } catch (error) {
    console.error('[ActionValidator] Failed to fetch inventory for prompt:', error);
  }

  const characterContext = `
**Character Sheet:**
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class}
- Level: ${character.level}
- HP: ${character.hp_current}/${character.hp_max}
- Ability Scores: STR ${character.ability_scores.STR}, DEX ${character.ability_scores.DEX}, CON ${character.ability_scores.CON}, INT ${character.ability_scores.INT}, WIS ${character.ability_scores.WIS}, CHA ${character.ability_scores.CHA}
- Inventory: ${inventory}
- Known Spells: ${spells}

**Player's Action:**
"${originalMessage}"

**Your Validation:**`;

  return characterContext;
}

/**
 * Call the Local LLM for AI validation
 */
async function validateWithLocalLLM(
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult> {
  const prompt = await buildValidationPrompt(character, originalMessage);

  const response = await fetch(`${LOCAL_LLM_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen/qwen3-4b-2507', // Fast 4B model for quick validation
      messages: [
        { role: 'system', content: VALIDATOR_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Low temperature for consistent validation
      max_tokens: 200, // Short response
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'action_validation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              isValid: {
                type: 'boolean',
                description: 'Whether the action is valid according to D&D 5e rules and physics'
              },
              reason: {
                type: 'string',
                description: 'Brief explanation for the player about why the action is valid or invalid'
              },
              suggestion: {
                type: 'string',
                description: 'What the player CAN do instead (if action is invalid)'
              }
            },
            required: ['isValid', 'reason'],
            additionalProperties: false
          }
        }
      }
    }),
    signal: AbortSignal.timeout(15000) // 15 second timeout for LLM validation
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('[ActionValidator] LLM request failed:', {
      status: response.status,
      statusText: response.statusText,
      endpoint: LOCAL_LLM_ENDPOINT,
      errorBody: errorText
    });
    throw new Error(`Local LLM request failed with status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    console.error('[ActionValidator] Empty response from LLM');
    throw new Error('Local LLM returned empty response');
  }

  let parsed: { isValid: boolean; reason?: string; suggestion?: string };
  try {
    parsed = JSON.parse(content) as {
      isValid: boolean;
      reason?: string;
      suggestion?: string;
    };
  } catch (parseError) {
    console.error('[ActionValidator] Failed to parse local LLM response:', parseError);
    throw new Error('Local LLM returned invalid JSON');
  }

  console.log(`[ActionValidator] Validation result for "${originalMessage}": ${parsed.isValid ? 'VALID' : 'INVALID'}`);
  if (!parsed.isValid) {
    console.log(`[ActionValidator] Reason: ${parsed.reason}`);
  }

  return {
    isValid: parsed.isValid,
    reason: parsed.reason,
    suggestion: parsed.suggestion
  };
}

async function validateWithGemini(
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult> {
  try {
    const prompt = await buildValidationPrompt(character, originalMessage);
    const { generateText } = await import('./gemini');

    const fullPrompt = `${VALIDATOR_SYSTEM_PROMPT}\n\n${prompt}\n\nRespond ONLY with the JSON object described above.`;
    const responseText = await generateText(fullPrompt, {
      temperature: 0.2,
      maxTokens: 200,
      modelType: 'flash'
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[ActionValidator] Gemini fallback returned non-JSON response:', responseText);
      throw new Error('Gemini fallback response missing JSON');
    }

    const result = JSON.parse(jsonMatch[0]) as {
      isValid: boolean;
      reason?: string;
      suggestion?: string;
    };

    console.log(`[ActionValidator] Gemini fallback result for "${originalMessage}": ${result.isValid ? 'VALID' : 'INVALID'}`);
    if (!result.isValid) {
      console.log(`[ActionValidator] Gemini reason: ${result.reason}`);
    }

    return {
      isValid: result.isValid,
      reason: result.reason,
      suggestion: result.suggestion
    };
  } catch (error) {
    console.error('[ActionValidator] Gemini fallback failed:', error);
    throw error;
  }
}

async function validateWithAI(
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult> {
  try {
    return await validateWithLocalLLM(character, originalMessage);
  } catch (localError) {
    console.warn('[ActionValidator] Local LLM validation failed, attempting Gemini fallback:', {
      error: localError instanceof Error ? localError.message : String(localError),
      endpoint: LOCAL_LLM_ENDPOINT
    });

    try {
      return await validateWithGemini(character, originalMessage);
    } catch (geminiError) {
      console.error('[ActionValidator] All validation fallbacks failed:', geminiError);
      return {
        isValid: false,
        reason: "I'm having trouble validating that action right now. Please try describing what you want to do in a different way, or use a standard action.",
        suggestion: "Try: 'I attack', 'I travel north', 'I search the area', or 'I rest'"
      };
    }
  }
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates a player action for physical possibility, character abilities, and D&D rules
 *
 * @param action - The detected action spec
 * @param character - The character attempting the action
 * @param originalMessage - The original player message
 * @returns Validation result with validity flag and suggestions
 */
export async function validateAction(
  action: ActionSpec,
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult> {
  // Only validate CONVERSATION-type actions (unrecognized patterns)
  // Recognized actions (ATTACK, TRAVEL, etc.) are validated by Rule Engine
  if (action.type !== 'CONVERSATION') {
    return { isValid: true };
  }

  console.log(`[ActionValidator] Validating: "${originalMessage}"`);

  // Stage 1: Fast deterministic checks
  const deterministicResult = await performDeterministicChecks(action, character, originalMessage);
  if (deterministicResult) {
    // Found an obvious issue, return immediately
    return deterministicResult;
  }

  // Stage 2: AI validation for ambiguous cases
  const aiResult = await validateWithAI(character, originalMessage);
  return aiResult;
}

/**
 * Convenience function to format validation failure as player-facing message
 */
export function formatValidationFailure(result: ValidationResult): string {
  if (result.suggestion) {
    return result.suggestion;
  }

  if (result.reason) {
    return `I can't do that. ${result.reason}`;
  }

  return "That action isn't possible right now.";
}
