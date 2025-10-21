/**
 * @file ActionSpec - Structured action format for game mechanics
 *
 * This defines the "contract" between Intent Detection and the Rule Engine.
 * The LLM never generates these - only the Intent Detector and Rule Engine use them.
 */

// Base action that all specific actions extend
export interface BaseActionSpec {
  actionId: string; // Unique ID for idempotency
  actorId: string; // Character performing the action
  timestamp: number; // When action was initiated
  turnId?: string; // Optional turn/phase tracking
}

// ============================================================================
// COMBAT ACTIONS
// ============================================================================

export interface MeleeAttackAction extends BaseActionSpec {
  type: 'MELEE_ATTACK';
  targetId: string;
  weaponId?: string; // If not specified, use equipped weapon
}

export interface RangedAttackAction extends BaseActionSpec {
  type: 'RANGED_ATTACK';
  targetId: string;
  weaponId?: string;
  range: number;
}

export interface CastSpellAction extends BaseActionSpec {
  type: 'CAST_SPELL';
  spellId: string;
  targetId?: string;
  spellLevel: number;
  concentration: boolean;
}

// ============================================================================
// SKILL CHECKS
// ============================================================================

export type SkillName =
  | 'acrobatics' | 'animal_handling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleight_of_hand'
  | 'stealth' | 'survival';

export interface SkillCheckAction extends BaseActionSpec {
  type: 'SKILL_CHECK';
  skill: SkillName;
  dc?: number; // Difficulty Class (DM may set this)
  context: string; // What the player is trying to do
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface AbilityCheckAction extends BaseActionSpec {
  type: 'ABILITY_CHECK';
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  dc?: number;
  context: string;
}

export interface SavingThrowAction extends BaseActionSpec {
  type: 'SAVING_THROW';
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  dc: number;
  source: string; // What caused the save (spell, trap, etc.)
}

// ============================================================================
// MOVEMENT & EXPLORATION
// ============================================================================

export interface MoveAction extends BaseActionSpec {
  type: 'MOVE';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  movementCost: number; // In feet
}

export interface TravelAction extends BaseActionSpec {
  type: 'TRAVEL';
  direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  distance: number; // Number of tiles
}

export interface SearchAction extends BaseActionSpec {
  type: 'SEARCH';
  areaId?: string; // Specific area being searched
  investigationCheck: boolean; // Whether to roll Investigation
}

// ============================================================================
// INVENTORY & ITEMS
// ============================================================================

export interface TakeItemAction extends BaseActionSpec {
  type: 'TAKE_ITEM';
  itemId: string;
  sourceId: string; // Where item is coming from (loot_pile_123, merchant_456, etc.)
  sourceType: 'loot' | 'merchant' | 'container' | 'ground';
  cost?: number; // If purchasing
}

export interface DropItemAction extends BaseActionSpec {
  type: 'DROP_ITEM';
  itemId: string;
}

export interface EquipItemAction extends BaseActionSpec {
  type: 'EQUIP_ITEM';
  itemId: string;
  slot: 'main_hand' | 'off_hand' | 'armor' | 'accessory';
}

export interface UseItemAction extends BaseActionSpec {
  type: 'USE_ITEM';
  itemId: string;
  targetId?: string; // For items that target someone (potions, scrolls)
}

// ============================================================================
// SOCIAL & REST
// ============================================================================

export type SocialClaimType =
  | 'royal_heritage'    // "I'm the king's son"
  | 'fame'              // "I'm famous"
  | 'powerful_connection' // "Dragon owes me a favor"
  | 'supernatural'      // "I'm cursed"
  | 'physical_prowess'  // "I'm incredibly strong"
  | 'expertise';        // "I'm a master swordsman"

export interface SocialClaimAction extends BaseActionSpec {
  type: 'SOCIAL_CLAIM';
  claimType: SocialClaimType;
  claimText: string; // Original player statement
  threatType: string; // What threat this creates if believed
  difficulty: number; // DC for Persuasion check
  npcId?: string; // If claiming to specific NPC
}

export interface RestAction extends BaseActionSpec {
  type: 'REST';
  restType: 'short' | 'long';
  duration: number; // In minutes
  location: string;
}

export interface ConversationAction extends BaseActionSpec {
  type: 'CONVERSATION';
  npcId?: string; // If talking to specific NPC
  topic?: string; // What they're asking about
  // Note: Pure RP conversation with no mechanical effect
}

// ============================================================================
// CHARACTER CREATION & PROGRESSION
// ============================================================================

export interface SelectCantripsAction extends BaseActionSpec {
  type: 'SELECT_CANTRIPS';
  spellNames: string[]; // Parsed from player message (official spell names)
}

export interface SelectSpellsAction extends BaseActionSpec {
  type: 'SELECT_SPELLS';
  spellNames: string[]; // Parsed from player message (official spell names)
}

export interface CompleteTutorialAction extends BaseActionSpec {
  type: 'COMPLETE_TUTORIAL';
  // Levels character from 0 -> 1 and initializes spell slots
}

// ============================================================================
// SESSION 0 INTERVIEW ACTIONS
// ============================================================================

export interface SkipInterviewAction extends BaseActionSpec {
  type: 'SKIP_INTERVIEW';
  // Auto-assigns default choices and completes Session 0 interview
}

export interface ContinueInterviewAction extends BaseActionSpec {
  type: 'CONTINUE_INTERVIEW';
  // Advances to next interview state
}

export interface EnterWorldAction extends BaseActionSpec {
  type: 'ENTER_WORLD';
  // Sets starting position (500,500) and completes interview
}

export interface ReviewDMResponseAction extends BaseActionSpec {
  type: 'REVIEW_DM_RESPONSE';
  playerFeedback?: string; // Optional player comment about what's wrong
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type ActionSpec =
  | MeleeAttackAction
  | RangedAttackAction
  | CastSpellAction
  | SkillCheckAction
  | AbilityCheckAction
  | SavingThrowAction
  | MoveAction
  | TravelAction
  | SearchAction
  | TakeItemAction
  | DropItemAction
  | EquipItemAction
  | UseItemAction
  | RestAction
  | SocialClaimAction
  | ConversationAction
  | SelectCantripsAction
  | SelectSpellsAction
  | CompleteTutorialAction
  | SkipInterviewAction
  | ContinueInterviewAction
  | EnterWorldAction
  | ReviewDMResponseAction;

// ============================================================================
// ACTION RESULT (from Rule Engine)
// ============================================================================

export interface DiceRoll {
  dice: string; // e.g., "1d20", "2d6"
  rolls: number[]; // Individual die results
  modifier: number;
  total: number;
  advantage?: boolean;
  disadvantage?: boolean;
  criticalHit?: boolean;
  criticalMiss?: boolean;
}

export interface StateChange {
  entityId: string; // Who/what is being changed
  entityType: 'character' | 'npc' | 'enemy' | 'object';
  field: string; // What field is changing
  oldValue: any;
  newValue: any;
  delta?: number; // For numeric fields
}

export interface ActionResult {
  actionId: string; // Matches ActionSpec.actionId
  success: boolean;
  outcome: 'success' | 'failure' | 'partial' | 'critical_success' | 'critical_failure';

  // Dice rolls performed
  rolls: Record<string, DiceRoll>; // e.g., { attack: {...}, damage: {...} }

  // State changes to apply (AUTHORITATIVE)
  stateChanges: StateChange[];

  // Provenance (where did these changes come from?)
  source: {
    action: ActionSpec;
    ruleEngineVersion: string;
    timestamp: number;
  };

  // Narrative hints for LLM (READ-ONLY)
  narrativeContext: {
    summary: string; // "You hit the goblin for 8 damage"
    details?: string; // Additional context
    mood?: 'triumph' | 'defeat' | 'neutral' | 'tense';
    threatType?: string; // Type of threat encounter if triggered
    threatVariant?: string; // Specific variant of the threat
    threatSeverity?: string; // Severity level of the threat
    enemyDefeated?: boolean; // Was enemy killed? (triggers loot)
    enemyCR?: number; // Enemy Challenge Rating (for loot generation)
  };

  // Flags
  triggerActivePhase?: boolean; // Did this start combat?
  createJournalEntry?: boolean;

  // Metadata
  executionTimeMs: number;
}
