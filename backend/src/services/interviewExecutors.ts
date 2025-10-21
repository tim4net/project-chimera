/**
 * Interview Executors - Handle Session 0 interview actions
 * These functions were extracted from ruleEngine.ts to reduce file size
 */

import type { CharacterRecord } from '../types';
import type { ActionResult, SkipInterviewAction, ContinueInterviewAction, EnterWorldAction } from '../types/actions';

/**
 * Execute SKIP_INTERVIEW action
 * Auto-assigns default choices and completes Session 0 interview
 */
export function executeSkipInterview(
  action: SkipInterviewAction,
  character: CharacterRecord
): ActionResult {
  const startTime = Date.now();
  // Mark interview as complete
  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges: [
      {
        entityType: 'character',
        entityId: action.actorId,
        field: 'tutorial_state',
        oldValue: character.tutorial_state,
        newValue: undefined, // Clear tutorial state
      },
    ],
    source: {
      action,
      ruleEngineVersion: '1.0.0',
      timestamp: startTime,
    },
    narrativeContext: {
      summary: 'You skip the interview and are ready to begin your adventure.',
      details: 'Interview completed. Tutorial state cleared.',
      mood: 'neutral',
    },
    executionTimeMs: Date.now() - startTime,
  };
}

/**
 * Execute CONTINUE_INTERVIEW action
 * Advances to next interview state
 */
export function executeContinueInterview(
  action: ContinueInterviewAction,
  character: CharacterRecord
): ActionResult {
  const startTime = Date.now();
  // Determine next interview state based on current state
  const currentState = character.tutorial_state;
  let nextState: string | undefined;

  switch (currentState) {
    case 'interview_welcome':
      nextState = 'interview_class_intro';
      break;
    case 'interview_class_intro':
      nextState = 'needs_equipment';
      break;
    case 'needs_equipment':
      nextState = 'interview_backstory';
      break;
    case 'interview_backstory':
      nextState = 'interview_complete';
      break;
    case 'interview_complete':
      nextState = undefined; // Clear tutorial state
      break;
    default:
      nextState = undefined;
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges: [
      {
        entityType: 'character',
        entityId: action.actorId,
        field: 'tutorial_state',
        oldValue: currentState,
        newValue: nextState,
      },
    ],
    source: {
      action,
      ruleEngineVersion: '1.0.0',
      timestamp: startTime,
    },
    narrativeContext: {
      summary: 'You continue with the interview.',
      details: `Interview progressed from ${currentState} to ${nextState || 'complete'}`,
      mood: 'neutral',
    },
    executionTimeMs: Date.now() - startTime,
  };
}

/**
 * Execute ENTER_WORLD action
 * Sets starting position and completes interview
 */
export function executeEnterWorld(
  action: EnterWorldAction,
  character: CharacterRecord
): ActionResult {
  const startTime = Date.now();
  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges: [
      {
        entityType: 'character',
        entityId: action.actorId,
        field: 'tutorial_state',
        oldValue: character.tutorial_state,
        newValue: undefined, // Clear tutorial state
      },
      {
        entityType: 'character',
        entityId: action.actorId,
        field: 'position_x',
        oldValue: character.position.x,
        newValue: 500,
      },
      {
        entityType: 'character',
        entityId: action.actorId,
        field: 'position_y',
        oldValue: character.position.y,
        newValue: 500,
      },
    ],
    source: {
      action,
      ruleEngineVersion: '1.0.0',
      timestamp: startTime,
    },
    narrativeContext: {
      summary: 'You step into the world of Nuaibria, ready to begin your adventure.',
      details: 'Character entered world at position (500, 500). Tutorial completed.',
      mood: 'triumph',
    },
    executionTimeMs: Date.now() - startTime,
  };
}
