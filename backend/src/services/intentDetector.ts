/**
 * @file Intent Detector - Parses natural language into structured ActionSpecs
 *
 * Security principles:
 * 1. Treat all player input as untrusted
 * 2. Normalize Unicode to prevent homoglyph attacks
 * 3. Detect multi-intent smuggling
 * 4. Flag suspicious patterns
 */

import type { ActionSpec, SkillName, TravelAction } from '../types/actions';
import type { CharacterRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { detectSocialClaim } from './socialClaimDetector';
import { detectSpellSelection } from './spellSelectionDetector';

/**
 * Detect meta-commands like @claudecode
 */
function detectMetaCommand(text: string, context: GameContext): ActionSpec | null {
  const trimmed = text.trim();

  // @claudecode command - review last DM response
  if (trimmed.toLowerCase().startsWith('@claudecode')) {
    return {
      type: 'REVIEW_DM_RESPONSE' as any,
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      playerFeedback: trimmed.substring(11).trim() // Everything after "@claudecode"
    } as any;
  }

  return null;
}

/**
 * Detect interview-specific intents
 */
function detectInterviewIntent(text: string, context: GameContext): ActionSpec | null {
  const normalized = text.toLowerCase().trim();

  console.log('[IntentDetector] Checking interview intents for:', normalized);
  console.log('[IntentDetector] Character tutorial_state:', context.character?.tutorial_state);

  // Skip removed - all players must complete Session 0 to learn their character
  // This ensures proper onboarding and prevents confusion

  // Change/reselect choices (just return to appropriate state)
  if (/\b(change|reselect|redo)\s+(my\s+)?(cantrips?)\b/.test(normalized)) {
    // For now, just treat as continue - will need proper state reset logic
    return {
      type: 'CONTINUE_INTERVIEW' as any,
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
    };
  }

  // Enter world (after interview complete)
  if (/\b(enter|start|begin|let's\s+(go|begin))\b/.test(normalized) &&
      /\b(world|adventure|journey|game)\b/.test(normalized)) {
    return {
      type: 'ENTER_WORLD' as any,
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
    };
  }

  // "I'm ready" when at interview_complete
  if (/\b(i'm\s+ready|i\s+am\s+ready|ready\s+to\s+(enter|begin|start))\b/.test(normalized)) {
    return {
      type: 'ENTER_WORLD' as any,
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
    };
  }

  // Continue/proceed through interview
  if (/\b(ready|continue|yes|proceed|next)\b$/.test(normalized)) {
    return {
      type: 'CONTINUE_INTERVIEW' as any,
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
    };
  }

  return null;
}

// ============================================================================
// CONTEXT
// ============================================================================

export interface GameContext {
  characterId: string;
  character: CharacterRecord;
  inCombat: boolean;
  nearbyEnemies?: Array<{ id: string; name: string }>;
  nearbyNPCs?: Array<{ id: string; name: string }>;
  nearbyLoot?: Array<{ id: string; name: string }>;
  nearbyPOIs?: Array<{ name: string; type: string; position: any }>;
  inShop?: boolean;
  currentTurnId?: string;
}

// ============================================================================
// DETECTION RESULT
// ============================================================================

export interface IntentDetectionResult {
  actions: ActionSpec[]; // May be multiple for compound sentences
  confidence: number; // 0-1
  flags: {
    suspicious: boolean;
    multiIntent: boolean;
    requiresClarification: boolean;
  };
  clarificationPrompt?: string;
}

// ============================================================================
// TEXT NORMALIZATION (Security)
// ============================================================================

/**
 * Normalize text to prevent Unicode exploits
 */
function normalizeText(text: string): string {
  // Unicode normalization (NFC - Canonical Decomposition followed by Canonical Composition)
  let normalized = text.normalize('NFC');

  // Remove zero-width characters (used to hide actions)
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Convert to lowercase for matching
  normalized = normalized.toLowerCase();

  // Trim whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Check for homoglyph attacks (lookalike characters)
 */
function detectHomoglyphs(text: string): boolean {
  // Common homoglyph patterns
  const suspiciousPatterns = [
    /[а-яА-Я]/, // Cyrillic characters in otherwise English text
    /[αβγδε]/, // Greek characters
    /\u0430/, // Cyrillic 'a' that looks like Latin 'a'
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}

// ============================================================================
// INTENT CLASSIFICATION
// ============================================================================

/**
 * Detect if message contains multiple intents (compound actions)
 */
function detectMultipleIntents(normalized: string): string[] {
  const separators = [
    / and then /,
    / while /,
    / as I /,
    / before /,
    / after /,
    /, then /,
    /, and /,
  ];

  let parts = [normalized];

  for (const separator of separators) {
    parts = parts.flatMap(part => part.split(separator));
  }

  // Filter out very short parts (likely not real actions)
  return parts.filter(part => part.trim().length > 5);
}

/**
 * Detect combat actions
 */
function detectCombatIntent(text: string, context: GameContext): ActionSpec | null {
  const attackPatterns = [
    /\b(attack|hit|strike|stab|slash|shoot|fire at|swing at)\b/,
  ];

  if (!attackPatterns.some(p => p.test(text))) {
    return null;
  }

  // Extract target
  const targetMatch = text.match(/\b(the |a )?(goblin|bandit|orc|wolf|enemy|target)\b/);
  const targetName = targetMatch ? targetMatch[2] : null;

  // Find target ID from context
  let targetId = 'unknown_target';
  if (context.nearbyEnemies && targetName) {
    const enemy = context.nearbyEnemies.find(e =>
      e.name.toLowerCase().includes(targetName)
    );
    if (enemy) targetId = enemy.id;
  }

  // Determine melee vs ranged
  const rangedPatterns = /\b(shoot|fire|throw|bow|arrow)\b/;
  const isRanged = rangedPatterns.test(text);

  if (isRanged) {
    return {
      type: 'RANGED_ATTACK',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      targetId,
      range: 60, // Default bow range
    };
  } else {
    return {
      type: 'MELEE_ATTACK',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      targetId,
    };
  }
}

/**
 * Detect skill checks
 */
function detectSkillCheckIntent(text: string, context: GameContext): ActionSpec | null {
  const skillPatterns: Record<SkillName, RegExp[]> = {
    stealth: [/\b(sneak|hide|stealth|quietly|silently)\b/],
    perception: [/\b(look|search|spot|notice|perceive|scan)\b/],
    investigation: [/\b(investigate|examine|inspect|study)\b/],
    persuasion: [/\b(persuade|convince|charm)\b/],
    deception: [/\b(lie|deceive|bluff|trick)\b/],
    intimidation: [/\b(intimidate|threaten|scare)\b/],
    athletics: [/\b(climb|jump|swim|push|pull)\b/],
    acrobatics: [/\b(balance|tumble|flip|dodge)\b/],
    arcana: [/\b(arcana|magic|spell|enchant)\b/],
    nature: [/\b(nature|animal|plant|weather)\b/],
    religion: [/\b(religion|god|deity|prayer|holy)\b/],
    history: [/\b(history|lore|legend|ancient)\b/],
    medicine: [/\b(heal|medicine|treat|diagnose)\b/],
    animal_handling: [/\b(tame|calm|ride|animal)\b/],
    insight: [/\b(sense motive|read|insight|judge)\b/],
    performance: [/\b(perform|sing|dance|play)\b/],
    sleight_of_hand: [/\b(pickpocket|palm|steal|sleight)\b/],
    survival: [/\b(track|forage|survive|wilderness)\b/],
  };

  for (const [skill, patterns] of Object.entries(skillPatterns)) {
    if (patterns.some(p => p.test(text))) {
      return {
        type: 'SKILL_CHECK',
        actionId: uuidv4(),
        actorId: context.characterId,
        timestamp: Date.now(),
        skill: skill as SkillName,
        context: text,
      };
    }
  }

  return null;
}

/**
 * Detect travel/movement
 */
function detectTravelIntent(text: string, context: GameContext): ActionSpec | null {
  const travelPattern = /\b(travel|walk|go|move|head)\s+(north|south|east|west|n|s|e|w)\b/;
  const match = text.match(travelPattern);

  if (!match) return null;

  const directionMap: Record<string, TravelAction['direction']> = {
    north: 'north', n: 'north',
    south: 'south', s: 'south',
    east: 'east', e: 'east',
    west: 'west', w: 'west',
  };

  const direction = directionMap[match[2]];
  if (!direction) return null;

  return {
    type: 'TRAVEL',
    actionId: uuidv4(),
    actorId: context.characterId,
    timestamp: Date.now(),
    direction,
    distance: 1, // Default 1 tile
  };
}

/**
 * Detect inventory actions
 */
function detectInventoryIntent(text: string, context: GameContext): ActionSpec | null {
  // Equip items
  const equipPatterns = /\b(equip|wear|wield|put on)\b.*\b(sword|dagger|armor|shield|weapon)\b/;
  if (equipPatterns.test(text)) {
    return {
      type: 'EQUIP_ITEM',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      itemId: 'unknown_item', // TODO: Parse item name
      slot: 'main_hand', // TODO: Determine slot from item type
    };
  }

  // Use items
  const usePatterns = /\b(use|drink|consume|read)\b.*\b(potion|scroll|item)\b/;
  if (usePatterns.test(text)) {
    return {
      type: 'USE_ITEM',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      itemId: 'unknown_item', // TODO: Parse item name
    };
  }

  // Drop items
  const dropPatterns = /\b(drop|discard|throw away)\b.*\b(sword|dagger|potion|item)\b/;
  if (dropPatterns.test(text)) {
    return {
      type: 'DROP_ITEM',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      itemId: 'unknown_item', // TODO: Parse item name
    };
  }

  // Taking items
  const takePatterns = /\b(take|grab|pick up|loot|get)\b.*\b(sword|dagger|potion|gold|item)\b/;
  if (takePatterns.test(text)) {
    // Check if in valid context
    if (!context.nearbyLoot && !context.inShop) {
      return null; // Can't take items when none are available
    }

    return {
      type: 'TAKE_ITEM',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      itemId: 'unknown_item', // Rule engine will resolve
      sourceId: 'current_location',
      sourceType: context.inShop ? 'merchant' : 'loot',
    };
  }

  return null;
}

/**
 * Detect rest actions
 */
function detectRestIntent(text: string, context: GameContext): ActionSpec | null {
  const shortRestPattern = /\b(short rest|take a break|rest briefly)\b/;
  const longRestPattern = /\b(long rest|sleep|camp|rest for the night)\b/;

  if (longRestPattern.test(text)) {
    return {
      type: 'REST',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      restType: 'long',
      duration: 480, // 8 hours
      location: 'current_location',
    };
  }

  if (shortRestPattern.test(text)) {
    return {
      type: 'REST',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
      restType: 'short',
      duration: 60, // 1 hour
      location: 'current_location',
    };
  }

  return null;
}

/**
 * Detect suspicious patterns (potential exploits)
 */
function detectSuspiciousPatterns(text: string): boolean {
  const suspiciousPatterns = [
    /\b(as the chronicler|as dm|as dungeon master)\b/i, // Trying to impersonate DM
    /\b(ignore previous|disregard|forget|override)\b/i, // Prompt injection
    /\b(system:|admin:|debug:)\b/i, // Trying to inject commands
    /\b(I have|give me|grant me)\b.*\b(\+\d+|legendary|artifact)\b/i, // Item fabrication
  ];

  return suspiciousPatterns.some(p => p.test(text));
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

export function detectIntent(
  message: string,
  context: GameContext
): IntentDetectionResult {
  // Step 1: Normalize text
  const normalized = normalizeText(message);

  // Step 2: Security checks
  const hasHomoglyphs = detectHomoglyphs(message);
  const hasSuspiciousPatterns = detectSuspiciousPatterns(normalized);

  if (hasHomoglyphs || hasSuspiciousPatterns) {
    return {
      actions: [],
      confidence: 0,
      flags: {
        suspicious: true,
        multiIntent: false,
        requiresClarification: false,
      },
      clarificationPrompt: "Your message contains suspicious patterns. Please rephrase using simple, direct language.",
    };
  }

  // Step 3: Detect multiple intents
  const parts = detectMultipleIntents(normalized);
  const isMultiIntent = parts.length > 1;

  // Step 4: Process each part
  const actions: ActionSpec[] = [];

  for (const part of parts) {
    // Try each detector in order of priority
    let action: ActionSpec | null = null;

    // PRIORITY 0: Meta-commands (@claudecode, etc.)
    action = detectMetaCommand(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 1: Interview intents (Session 0)
    action = detectInterviewIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 2: Social claims (must detect before generic conversation)
    action = detectSocialClaim(part, context.characterId);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 3: Spell selection (character creation/leveling)
    action = detectSpellSelection(part, context.characterId);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 3: Combat
    action = detectCombatIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 4: Skills
    action = detectSkillCheckIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 5: Travel
    action = detectTravelIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 6: Rest
    action = detectRestIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // PRIORITY 7: Inventory
    action = detectInventoryIntent(part, context);
    if (action) {
      actions.push(action);
      continue;
    }

    // FALLBACK: Generic conversation
    actions.push({
      type: 'CONVERSATION',
      actionId: uuidv4(),
      actorId: context.characterId,
      timestamp: Date.now(),
    });
  }

  // Step 5: Calculate confidence
  const hasUnknownActions = actions.some(a => a.type === 'CONVERSATION');
  const confidence = hasUnknownActions ? 0.5 : 0.9;

  return {
    actions,
    confidence,
    flags: {
      suspicious: false,
      multiIntent: isMultiIntent,
      requiresClarification: isMultiIntent && actions.length > 2,
    },
    clarificationPrompt: isMultiIntent && actions.length > 2
      ? `I detected ${actions.length} different actions. Did you want to: ${actions.map((a, i) => `${i + 1}) ${a.type}`).join(', ')}?`
      : undefined,
  };
}
