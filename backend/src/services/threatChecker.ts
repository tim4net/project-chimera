/**
 * @file Threat Checker - Rolls for threat encounters based on character's active threats
 *
 * Called during vulnerable actions (rest, travel, public events) to determine
 * if threats (kidnapping, assassination, etc.) are triggered.
 */

import type { CharacterRecord } from '../types';
import { calculateThreatChance } from '../config/threats';

// ============================================================================
// THREAT ENCOUNTER RESULT
// ============================================================================

export interface ThreatEncounter {
  triggered: boolean;
  threatType?: string; // e.g., "royal_target"
  variant?: string; // e.g., "kidnapping"
  severity?: string; // e.g., "high"
  actualChance?: number; // Calculated threat chance that was rolled against
  roll?: number; // The 1d100 roll
}

// ============================================================================
// CHECK FOR THREATS
// ============================================================================

/**
 * Check if any active threats trigger during this action
 *
 * @param character - Character with potential active threats
 * @param action - Type of action ('rest' | 'travel' | 'public')
 * @param location - Current location (affects threat chance)
 * @returns ThreatEncounter if triggered, null otherwise
 */
export async function checkForThreats(
  character: CharacterRecord,
  action: 'rest' | 'travel' | 'public',
  location: string = 'current_location'
): Promise<ThreatEncounter> {

  // No threats if character has none active
  if (!character.active_threats || Object.keys(character.active_threats).length === 0) {
    return { triggered: false };
  }

  console.log(`[ThreatChecker] Checking threats for action: ${action} at location: ${location}`);

  // Check each active threat
  for (const [threatType, threatData] of Object.entries(character.active_threats)) {
    // Calculate days since threat was created
    const createdDate = new Date(threatData.created_at);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate actual threat chance with all modifiers
    const actualChance = calculateThreatChance(
      threatData.chance,
      location,
      action,
      daysSince
    );

    // Roll for threat
    const roll = Math.random() * 100;

    console.log(`[ThreatChecker] ${threatType}: Roll ${roll.toFixed(1)} vs ${actualChance}% chance`);

    if (roll <= actualChance) {
      // THREAT TRIGGERED!
      const variant = threatData.types[Math.floor(Math.random() * threatData.types.length)];

      console.log(`[ThreatChecker] 🚨 THREAT TRIGGERED: ${threatType} → ${variant}`);

      return {
        triggered: true,
        threatType,
        variant,
        severity: threatData.severity,
        actualChance,
        roll,
      };
    }
  }

  // No threats triggered
  console.log(`[ThreatChecker] ✅ No threats triggered`);
  return { triggered: false };
}

/**
 * Reduce threat level after player takes action to mitigate it
 */
export function reduceThreat(
  character: CharacterRecord,
  threatType: string,
  reduction: number
): Record<string, any> {
  if (!character.active_threats || !character.active_threats[threatType]) {
    return character.active_threats || {};
  }

  const updatedThreat = {
    ...character.active_threats[threatType],
    chance: Math.max(0, character.active_threats[threatType].chance - reduction),
  };

  // Remove threat if chance drops to 0
  if (updatedThreat.chance === 0) {
    const { [threatType]: removed, ...remaining } = character.active_threats;
    console.log(`[ThreatChecker] Threat eliminated: ${threatType}`);
    return remaining;
  }

  return {
    ...character.active_threats,
    [threatType]: updatedThreat,
  };
}

/**
 * Increase threat level (escalation over time or failed mitigation)
 */
export function escalateThreat(
  character: CharacterRecord,
  threatType: string,
  increase: number
): Record<string, any> {
  if (!character.active_threats || !character.active_threats[threatType]) {
    return character.active_threats || {};
  }

  const updatedThreat = {
    ...character.active_threats[threatType],
    chance: Math.min(100, character.active_threats[threatType].chance + increase),
  };

  console.log(`[ThreatChecker] Threat escalated: ${threatType} → ${updatedThreat.chance}%`);

  return {
    ...character.active_threats,
    [threatType]: updatedThreat,
  };
}
