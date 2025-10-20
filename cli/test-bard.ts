#!/usr/bin/env ts-node
/**
 * Quick CLI Test - Bard Character Creation and Session 0
 *
 * Usage: npx ts-node cli/test-bard.ts
 */

import 'dotenv/config';

console.log('='.repeat(80));
console.log('BARD SESSION 0 - AUTOMATED TEST');
console.log('='.repeat(80));
console.log('');

const API_BASE = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test@chimera.local';
const TEST_PASSWORD = 'test123456';

async function testBardCreation() {
  console.log('[1/6] Creating test account...');

  // This is a skeleton - full implementation would:
  // 1. Call /api/auth/signup
  // 2. Get auth token
  // 3. Call /api/characters (POST) to create Bard
  // 4. Call /api/chat/dm to interact with Session 0
  // 5. Verify responses contain database spell lists
  // 6. Complete Session 0
  // 7. Verify character reaches Level 1 with spells
  // 8. Cleanup: Delete test character

  console.log('✓ Test account created (mock)');
  console.log('');

  console.log('[2/6] Creating Bard character...');
  console.log('✓ Bard created: Level 0, tutorial_state: interview_welcome');
  console.log('');

  console.log('[3/6] Testing Session 0 interview...');
  console.log('  Sending: "ready"');
  console.log('  Expected: Class introduction');
  console.log('✓ Would test here with actual API call');
  console.log('');

  console.log('[4/6] Testing cantrip selection...');
  console.log('  Sending: "Vicious Mockery and Mage Hand"');
  console.log('  Expected: Validation passes, advances to spell selection');
  console.log('✓ Would test here');
  console.log('');

  console.log('[5/6] Testing spell selection...');
  console.log('  Sending: "Healing Word, Charm Person, Dissonant Whispers, Faerie Fire"');
  console.log('  Expected: Validation passes, advances to equipment');
  console.log('✓ Would test here');
  console.log('');

  console.log('[6/6] Completing Session 0...');
  console.log('  Sending: "I\'m ready to enter the world"');
  console.log('  Expected: Level 0→1, spell_slots initialized, position set');
  console.log('✓ Would test here');
  console.log('');

  console.log('='.repeat(80));
  console.log('TEST COMPLETE (SKELETON)');
  console.log('='.repeat(80));
  console.log('');
  console.log('Full implementation would make actual HTTP calls to backend.');
  console.log('For now, manually test via web UI:');
  console.log('  1. Go to http://localhost:8080');
  console.log('  2. Create new Bard');
  console.log('  3. Complete Session 0');
  console.log('  4. Verify spell lists are REAL from database');
  console.log('');
}

testBardCreation().catch(console.error);
