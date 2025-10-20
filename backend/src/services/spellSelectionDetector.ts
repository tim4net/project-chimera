/**
 * @file Spell Selection Detector - Parses spell selection from natural language
 *
 * This service is specifically designed for the Level 0 tutorial system where
 * new Bard characters must select their starting spells through conversation
 * with the AI DM.
 *
 * Security principles:
 * 1. Treat all player input as untrusted
 * 2. Normalize text to prevent exploits
 * 3. Validate spell names against official spell lists
 * 4. Prevent duplicate selections
 *
 * @example
 * detectSpellSelection("I choose Vicious Mockery")
 * // => { type: 'SELECT_CANTRIPS', spellNames: ['Vicious Mockery'] }
 *
 * @example
 * detectSpellSelection("I'll take Healing Word and Charm Person")
 * // => { type: 'SELECT_SPELLS', spellNames: ['Healing Word', 'Charm Person'] }
 */

import { v4 as uuidv4 } from 'uuid';
import type { SelectCantripsAction, SelectSpellsAction } from '../types/actions';
import { CANTRIPS } from '../data/cantrips';
import { LEVEL_1_SPELLS } from '../data/level1Spells';
import type { Spell } from '../data/spellTypes';

// ============================================================================
// SPELL NAME NORMALIZATION
// ============================================================================

/**
 * Normalize spell names for matching
 * Handles case, whitespace, and common variations
 */
function normalizeSpellName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "'") // Normalize apostrophes
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Build a map of normalized spell names to official spell names
 */
function buildSpellNameMap(spells: Spell[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const spell of spells) {
    const normalized = normalizeSpellName(spell.name);
    map.set(normalized, spell.name);

    // Also add common variations
    // e.g., "faerie fire" -> "faeriefire", "fearie fire"
    const withoutSpaces = normalized.replace(/\s+/g, '');
    map.set(withoutSpaces, spell.name);
  }

  return map;
}

// Pre-build spell name maps for efficient lookup
const CANTRIP_NAME_MAP = buildSpellNameMap(CANTRIPS);
const LEVEL_1_SPELL_NAME_MAP = buildSpellNameMap(LEVEL_1_SPELLS);

/**
 * Find the official spell name from a user-provided name
 * Returns null if no match found
 */
function findOfficialSpellName(
  userInput: string,
  spellMap: Map<string, string>
): string | null {
  const normalized = normalizeSpellName(userInput);
  return spellMap.get(normalized) || null;
}

// ============================================================================
// SPELL NAME EXTRACTION
// ============================================================================

/**
 * Extract potential spell names from text
 * Looks for capitalized words and phrases that might be spell names
 */
function extractPotentialSpellNames(text: string): string[] {
  const potentialSpells: string[] = [];

  // Pattern 1: Quoted spell names ("Vicious Mockery")
  const quotedPattern = /["']([^"']+)["']/g;
  let match;
  while ((match = quotedPattern.exec(text)) !== null) {
    potentialSpells.push(match[1]);
  }

  // Pattern 2: Capitalized phrases (likely spell names)
  // Match sequences of capitalized words: "Healing Word", "Cure Wounds"
  const capitalizedPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  while ((match = capitalizedPattern.exec(text)) !== null) {
    potentialSpells.push(match[1]);
  }

  // Pattern 3: Common spell names without capitals (for fuzzy matching)
  // Match words after selection phrases
  const afterSelectionPattern = /(?:choose|pick|take|select|learn|get)\s+([a-zA-Z\s]+?)(?:\s+(?:and|,|\.)|$)/gi;
  while ((match = afterSelectionPattern.exec(text)) !== null) {
    const phrase = match[1].trim();
    if (phrase.length > 2) { // Avoid matching single words like "a", "the"
      potentialSpells.push(phrase);
    }
  }

  return potentialSpells;
}

/**
 * Parse spell names from natural language, validating against spell lists
 */
function parseSpellNames(
  text: string,
  spellMap: Map<string, string>
): string[] {
  const potentialSpells = extractPotentialSpellNames(text);
  const validSpells: string[] = [];
  const seenSpells = new Set<string>();

  for (const potentialSpell of potentialSpells) {
    const officialName = findOfficialSpellName(potentialSpell, spellMap);

    if (officialName && !seenSpells.has(officialName)) {
      validSpells.push(officialName);
      seenSpells.add(officialName);
    }
  }

  return validSpells;
}

// ============================================================================
// INTENT DETECTION PATTERNS
// ============================================================================

/**
 * Patterns that indicate spell selection intent
 */
const SELECTION_PATTERNS = [
  /\b(choose|pick|select|take|want|learn|get|grab)\b/i,
  /\b(i'll take|i will take|i'd like|i would like)\b/i,
  /\b(my spells? (?:are|will be))\b/i,
  /\b(for (?:my )?(?:cantrips?|spells?))\b/i,
];

/**
 * Patterns that specifically indicate cantrip selection
 */
const CANTRIP_PATTERNS = [
  /\bcantrips?\b/i,
  /\b(?:level )?0\s+spells?\b/i,
  /\b(?:starting|basic)\s+spells?\b/i,
];

/**
 * Patterns that specifically indicate leveled spell selection
 */
const LEVELED_SPELL_PATTERNS = [
  /\b(?:level\s+)?1\s+spells?\b/i,
  /\b(?:first|1st)\s+level\s+spells?\b/i,
  /\b(?:known\s+)?spells?\b/i, // Generic "spells" usually means leveled
];

/**
 * Check if text contains selection intent
 */
function hasSelectionIntent(text: string): boolean {
  return SELECTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Determine if the selection is for cantrips or leveled spells
 * Returns 'cantrips', 'spells', or 'unknown'
 */
function determineSpellType(text: string): 'cantrips' | 'spells' | 'unknown' {
  const hasCantrip = CANTRIP_PATTERNS.some(p => p.test(text));
  const hasLeveled = LEVELED_SPELL_PATTERNS.some(p => p.test(text));

  // Explicit mention of cantrips
  if (hasCantrip && !hasLeveled) {
    return 'cantrips';
  }

  // Explicit mention of leveled spells
  if (hasLeveled && !hasCantrip) {
    return 'spells';
  }

  // Ambiguous or no explicit mention - need to infer from spell names
  return 'unknown';
}

// ============================================================================
// MAIN DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect cantrip selection intent
 *
 * @param text - Player's natural language message
 * @param actorId - Character ID making the selection
 * @returns SelectCantripsAction if detected, null otherwise
 *
 * @example
 * detectCantripSelection("I choose Vicious Mockery and Mage Hand", "char_123")
 * // => { type: 'SELECT_CANTRIPS', spellNames: ['Vicious Mockery', 'Mage Hand'], ... }
 */
export function detectCantripSelection(
  text: string,
  actorId: string
): SelectCantripsAction | null {
  // Must have selection intent
  if (!hasSelectionIntent(text)) {
    return null;
  }

  const spellType = determineSpellType(text);

  // If explicitly about leveled spells, not cantrips
  if (spellType === 'spells') {
    return null;
  }

  // Try to parse cantrip names
  const cantrips = parseSpellNames(text, CANTRIP_NAME_MAP);

  // Need at least one valid cantrip
  if (cantrips.length === 0) {
    // If explicit mention of cantrips but no valid names, still return null
    // The DM should ask for clarification
    return null;
  }

  return {
    type: 'SELECT_CANTRIPS',
    actionId: uuidv4(),
    actorId,
    timestamp: Date.now(),
    spellNames: cantrips,
  };
}

/**
 * Detect leveled spell selection intent
 *
 * @param text - Player's natural language message
 * @param actorId - Character ID making the selection
 * @returns SelectSpellsAction if detected, null otherwise
 *
 * @example
 * detectLeveledSpellSelection("I'll take Healing Word and Charm Person", "char_123")
 * // => { type: 'SELECT_SPELLS', spellNames: ['Healing Word', 'Charm Person'], ... }
 */
export function detectLeveledSpellSelection(
  text: string,
  actorId: string
): SelectSpellsAction | null {
  // Must have selection intent
  if (!hasSelectionIntent(text)) {
    return null;
  }

  const spellType = determineSpellType(text);

  // If explicitly about cantrips, not leveled spells
  if (spellType === 'cantrips') {
    return null;
  }

  // Try to parse spell names
  const spells = parseSpellNames(text, LEVEL_1_SPELL_NAME_MAP);

  // Need at least one valid spell
  if (spells.length === 0) {
    return null;
  }

  return {
    type: 'SELECT_SPELLS',
    actionId: uuidv4(),
    actorId,
    timestamp: Date.now(),
    spellNames: spells,
  };
}

/**
 * Detect any spell selection (cantrips or leveled spells)
 * Tries cantrips first, then leveled spells
 *
 * @param text - Player's natural language message
 * @param actorId - Character ID making the selection
 * @returns SelectCantripsAction, SelectSpellsAction, or null
 *
 * @example
 * detectSpellSelection("I choose Vicious Mockery", "char_123")
 * // => { type: 'SELECT_CANTRIPS', spellNames: ['Vicious Mockery'], ... }
 */
export function detectSpellSelection(
  text: string,
  actorId: string
): SelectCantripsAction | SelectSpellsAction | null {
  // Try cantrips first (more specific)
  const cantripAction = detectCantripSelection(text, actorId);
  if (cantripAction) {
    return cantripAction;
  }

  // Try leveled spells
  const spellAction = detectLeveledSpellSelection(text, actorId);
  if (spellAction) {
    return spellAction;
  }

  return null;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a spell name is a valid cantrip
 */
export function isValidCantrip(spellName: string): boolean {
  const normalized = normalizeSpellName(spellName);
  return CANTRIP_NAME_MAP.has(normalized);
}

/**
 * Check if a spell name is a valid level 1 spell
 */
export function isValidLevel1Spell(spellName: string): boolean {
  const normalized = normalizeSpellName(spellName);
  return LEVEL_1_SPELL_NAME_MAP.has(normalized);
}

/**
 * Get the official spell name for a user-provided name
 */
export function getOfficialSpellName(
  userInput: string,
  spellLevel: 0 | 1
): string | null {
  const spellMap = spellLevel === 0 ? CANTRIP_NAME_MAP : LEVEL_1_SPELL_NAME_MAP;
  return findOfficialSpellName(userInput, spellMap);
}

/**
 * Get all valid cantrip names
 */
export function getAllCantrips(): string[] {
  return CANTRIPS.map(spell => spell.name);
}

/**
 * Get all valid level 1 spell names
 */
export function getAllLevel1Spells(): string[] {
  return LEVEL_1_SPELLS.map(spell => spell.name);
}

/**
 * Filter cantrips available to a specific class
 */
export function getCantripsForClass(className: string): string[] {
  return CANTRIPS
    .filter(spell => spell.classes.includes(className))
    .map(spell => spell.name);
}

/**
 * Filter level 1 spells available to a specific class
 */
export function getLevel1SpellsForClass(className: string): string[] {
  return LEVEL_1_SPELLS
    .filter(spell => spell.classes.includes(className))
    .map(spell => spell.name);
}
