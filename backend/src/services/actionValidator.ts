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
function performDeterministicChecks(
  action: ActionSpec,
  character: CharacterRecord,
  originalMessage: string
): ValidationResult | null {
  const normalized = originalMessage.toLowerCase();

  // Check 1: Spell casting without the spell
  const spellCastPattern = /\b(cast|use)\s+(\w+)/i;
  const spellMatch = originalMessage.match(spellCastPattern);
  if (spellMatch) {
    const spellName = spellMatch[2];
    // TODO: Check character's known spells list once spell system is implemented
    // For now, pass to AI validator
    return null;
  }

  // Check 2: Using items not in inventory
  const itemUsePattern = /\b(use|wield|equip|drink|consume)\s+(my\s+)?(\w+)/i;
  const itemMatch = originalMessage.match(itemUsePattern);
  if (itemMatch) {
    const itemName = itemMatch[3];
    // TODO: Check character's inventory once item system is fully integrated
    // For now, pass to AI validator
    return null;
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
const VALIDATOR_SYSTEM_PROMPT = `You are a strict D&D 5e Dungeon Master's rules assistant. Your role is to validate if a player's described action is possible based on:
1. The laws of physics (can't play a sword as a flute)
2. The character's abilities, inventory, and spells
3. D&D 5e rules

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

**Examples:**

Action: "I play my longsword as a musical instrument"
Response: {"isValid": false, "reason": "A sword cannot be played as an instrument.", "suggestion": "If you're a bard, you could play your actual musical instrument. Or describe how you strike your sword against your shield to make noise."}

Action: "I cast Wish"
Character: Level 3 Wizard, knows Magic Missile and Shield
Response: {"isValid": false, "reason": "You don't know the Wish spell.", "suggestion": "Wish is a 9th-level spell requiring 17th level. You currently know: Magic Missile, Shield. Try using one of these spells."}

Action: "I carefully examine the room for traps"
Response: {"isValid": true, "reason": "Valid Investigation action"}

Action: "I try to convince the guard I'm a visiting noble"
Response: {"isValid": true, "reason": "Valid Persuasion/Deception attempt (DM will determine success)"}`;

/**
 * Build validation prompt for the LLM
 */
function buildValidationPrompt(
  character: CharacterRecord,
  originalMessage: string
): string {
  // Build character context
  const inventory = "TODO: Fetch from items table"; // TODO: Implement once items system is ready
  const spells = "TODO: Fetch from character spells"; // TODO: Implement once spell system is ready

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
async function validateWithAI(
  character: CharacterRecord,
  originalMessage: string
): Promise<ValidationResult> {
  try {
    const prompt = buildValidationPrompt(character, originalMessage);

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
        response_format: { type: 'json_object' } // Request JSON response
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      console.error('[ActionValidator] LLM request failed:', response.status);
      // Fail open: allow the action but log the failure
      return {
        isValid: true,
        reason: "Validation service unavailable, action allowed"
      };
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>
    };

    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error('[ActionValidator] Empty response from LLM');
      return { isValid: true };
    }

    // Parse JSON response
    const result = JSON.parse(content) as {
      isValid: boolean;
      reason?: string;
      suggestion?: string;
    };

    console.log(`[ActionValidator] Validation result for "${originalMessage}": ${result.isValid ? 'VALID' : 'INVALID'}`);
    if (!result.isValid) {
      console.log(`[ActionValidator] Reason: ${result.reason}`);
    }

    return {
      isValid: result.isValid,
      reason: result.reason,
      suggestion: result.suggestion
    };
  } catch (error) {
    console.error('[ActionValidator] AI validation failed:', error);
    // Fail open: if validation service fails, allow the action
    return {
      isValid: true,
      reason: "Validation service error, action allowed"
    };
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
  const deterministicResult = performDeterministicChecks(action, character, originalMessage);
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
