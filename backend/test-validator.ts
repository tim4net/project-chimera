/**
 * Standalone test script for Action Validator
 * Tests the validator without needing full API authentication
 */

import { validateAction } from './src/services/actionValidator';
import type { ActionSpec } from './src/types/actions';
import type { CharacterRecord } from './src/types';
import { v4 as uuidv4 } from 'uuid';

// Mock character
const mockCharacter: CharacterRecord = {
  id: 'test-character-id',
  user_id: 'test-user-id',
  name: 'Zrardra',
  race: 'Dragonborn',
  class: 'Bard',
  level: 3,
  xp: 900,
  gold: 50,
  ability_scores: {
    STR: 10,
    DEX: 14,
    CON: 12,
    INT: 10,
    WIS: 12,
    CHA: 16
  },
  hp_max: 20,
  hp_current: 20,
  temporary_hp: 0,
  armor_class: 12,
  speed: 30,
  hit_dice: { 8: 3 },
  position: { x: 500, y: 500 },
  campaign_seed: 'test-seed',
  spell_slots: {},
  proficiency_bonus: 2,
  portrait_url: null,
  backstory: null,
  skills: null,
  background: 'Entertainer',
  alignment: 'CG',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test cases
const testCases = [
  {
    name: 'Physical Impossibility: Play Longsword',
    message: 'I play my longsword as a musical instrument',
    expected: 'INVALID'
  },
  {
    name: 'Teleportation Without Ability',
    message: 'I teleport to the treasure room',
    expected: 'INVALID'
  },
  {
    name: 'God Mode Claim',
    message: "I'm a god and instantly win the fight",
    expected: 'INVALID'
  },
  {
    name: 'Valid Roleplay: Examine',
    message: 'I examine the mysterious door carefully',
    expected: 'VALID'
  },
  {
    name: 'Valid Social: Persuasion',
    message: 'I try to persuade the guard to let me pass',
    expected: 'VALID'
  },
  {
    name: 'Valid Combat Intent (would be caught by intent detector)',
    message: 'I attack the goblin with my sword',
    expected: 'VALID (bypass - not CONVERSATION type)'
  }
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('ACTION VALIDATOR TEST SUITE');
  console.log('='.repeat(80));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`TEST: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log('─'.repeat(80));

    // Create mock CONVERSATION action
    const mockAction: ActionSpec = {
      type: 'CONVERSATION',
      actionId: uuidv4(),
      actorId: mockCharacter.id,
      timestamp: Date.now()
    };

    try {
      const result = await validateAction(mockAction, mockCharacter, testCase.message);

      console.log(`\nResult: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
      if (result.reason) {
        console.log(`Reason: ${result.reason}`);
      }
      if (result.suggestion) {
        console.log(`Suggestion: ${result.suggestion}`);
      }

      // Check if result matches expectation
      const actualResult = result.isValid ? 'VALID' : 'INVALID';
      if (testCase.expected.includes(actualResult)) {
        console.log('\n✅ TEST PASSED');
        passed++;
      } else {
        console.log(`\n❌ TEST FAILED - Expected ${testCase.expected}, got ${actualResult}`);
        failed++;
      }
    } catch (error) {
      console.error(`\n❌ TEST ERROR:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log('='.repeat(80));
}

// Run tests
runTests().catch(console.error);
