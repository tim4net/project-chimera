#!/usr/bin/env ts-node
/**
 * Automated Bard Creation and Session 0 Test
 *
 * This script:
 * 1. Creates a test Bard character via API
 * 2. Runs through Session 0 interview programmatically
 * 3. Verifies spell selection works correctly
 * 4. Verifies character reaches Level 1 with all features
 * 5. Cleans up test character
 *
 * Usage: npx ts-node test-bard-automated.ts
 */

import 'dotenv/config';
import axios from 'axios';

const API_BASE = process.env.API_URL || 'http://localhost:3001';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function error(message: string) {
  log(`✗ ${message}`, colors.red);
}

function info(message: string) {
  log(`→ ${message}`, colors.cyan);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBardCreation() {
  console.log('');
  log('='.repeat(80), colors.bright);
  log('AUTOMATED BARD SESSION 0 TEST', colors.bright);
  log('='.repeat(80), colors.bright);
  console.log('');

  let authToken: string | null = null;
  let characterId: string | null = null;

  try {
    // ========================================================================
    // STEP 1: AUTHENTICATE
    // ========================================================================
    log('[1/9] Authenticating with backend...', colors.yellow);

    // For testing, we'll use Supabase directly to create a test session
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    }

    // Create test account or login
    const supabaseAuth = await axios.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      email: 'test@chimera.test',
      password: 'testpassword123',
    }, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      }
    }).catch(async () => {
      // If login fails, try signup
      return axios.post(`${SUPABASE_URL}/auth/v1/signup`, {
        email: 'test@chimera.test',
        password: 'testpassword123',
      }, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        }
      });
    });

    authToken = supabaseAuth.data.access_token;
    success('Authenticated');
    info(`User: ${supabaseAuth.data.user.email}`);

    // ========================================================================
    // STEP 2: CREATE BARD CHARACTER
    // ========================================================================
    log('\n[2/9] Creating Bard character...', colors.yellow);

    const characterData = {
      name: `AutoBard_${Date.now()}`,
      race: 'Human',
      class: 'Bard',
      background: 'Entertainer',
      alignment: 'Chaotic Good',
      ability_scores: {
        STR: 8,
        DEX: 14,
        CON: 12,
        INT: 10,
        WIS: 13,
        CHA: 15
      }
    };

    const createResponse = await axios.post(`${API_BASE}/api/characters`, characterData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const character = createResponse.data;
    characterId = character.id;

    success(`Character created: ${character.name}`);
    info(`ID: ${characterId}`);
    info(`Level: ${character.level}`);
    info(`Tutorial State: ${character.tutorial_state}`);

    // Verify initial state
    if (character.level !== 0) {
      error(`Expected Level 0, got ${character.level}`);
      throw new Error('Character creation failed: wrong level');
    }
    if (character.tutorial_state !== 'interview_welcome') {
      error(`Expected interview_welcome, got ${character.tutorial_state}`);
      throw new Error('Character creation failed: wrong tutorial state');
    }

    await sleep(1000);

    // ========================================================================
    // STEP 3: SESSION 0 - WELCOME
    // ========================================================================
    log('\n[3/9] Testing Session 0 welcome...', colors.yellow);

    const welcomeResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: 'ready',
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    info('DM Response (truncated):');
    console.log(welcomeResponse.data.response.substring(0, 200) + '...');

    success('Session 0 welcome received');

    await sleep(1000);

    // ========================================================================
    // STEP 4: CLASS INTRODUCTION
    // ========================================================================
    log('\n[4/9] Testing class introduction...', colors.yellow);

    const introResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: 'continue',
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (introResponse.data.response.toLowerCase().includes('bard')) {
      success('Class introduction mentions Bard');
    }

    await sleep(1000);

    // ========================================================================
    // STEP 5: CANTRIP SELECTION
    // ========================================================================
    log('\n[5/9] Selecting cantrips...', colors.yellow);
    info('Sending: "I choose Vicious Mockery and Mage Hand"');

    const cantripResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: 'I choose Vicious Mockery and Mage Hand',
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    info('DM Response:');
    console.log(cantripResponse.data.response.substring(0, 200) + '...');

    // Check if state advanced
    if (cantripResponse.data.stateChanges) {
      const cantripChange = cantripResponse.data.stateChanges.find((sc: any) =>
        sc.field === 'selected_cantrips'
      );
      if (cantripChange) {
        success(`Cantrips selected: ${cantripChange.newValue.join(', ')}`);
      }
    }

    await sleep(1000);

    // ========================================================================
    // STEP 6: SPELL SELECTION
    // ========================================================================
    log('\n[6/9] Selecting spells...', colors.yellow);
    info('Sending: "Healing Word, Charm Person, Dissonant Whispers, Faerie Fire"');

    const spellResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: 'Healing Word, Charm Person, Dissonant Whispers, Faerie Fire',
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    info('DM Response:');
    console.log(spellResponse.data.response.substring(0, 200) + '...');

    if (spellResponse.data.stateChanges) {
      const spellChange = spellResponse.data.stateChanges.find((sc: any) =>
        sc.field === 'selected_spells'
      );
      if (spellChange) {
        success(`Spells selected: ${spellChange.newValue.join(', ')}`);
      }
    }

    await sleep(1000);

    // ========================================================================
    // STEP 7: EQUIPMENT SELECTION
    // ========================================================================
    log('\n[7/9] Selecting equipment...', colors.yellow);
    info('Sending: "option 1" or "rapier"');

    const equipResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: 'option 1',
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    success('Equipment selection sent');

    await sleep(1000);

    // ========================================================================
    // STEP 8: ENTER WORLD
    // ========================================================================
    log('\n[8/9] Entering the world...', colors.yellow);
    info('Sending: "I\'m ready to enter the world"');

    const enterResponse = await axios.post(`${API_BASE}/api/chat/dm`, {
      characterId,
      message: "I'm ready to enter the world",
      conversationHistory: []
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    info('DM Response:');
    console.log(enterResponse.data.response.substring(0, 300) + '...');

    // Check for level-up
    if (enterResponse.data.stateChanges) {
      const levelChange = enterResponse.data.stateChanges.find((sc: any) =>
        sc.field === 'level'
      );
      if (levelChange && levelChange.newValue === 1) {
        success('Character leveled up to 1!');
      }
    }

    await sleep(1000);

    // ========================================================================
    // STEP 9: VERIFY FINAL CHARACTER STATE
    // ========================================================================
    log('\n[9/9] Verifying final character state...', colors.yellow);

    const finalChar = await axios.get(`${API_BASE}/api/characters/${characterId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const finalState = finalChar.data;

    console.log('');
    log('FINAL CHARACTER STATE:', colors.bright);
    console.log('─'.repeat(80));
    info(`Name: ${finalState.name}`);
    info(`Class: ${finalState.class}`);
    info(`Level: ${finalState.level}`);
    info(`Tutorial State: ${finalState.tutorial_state}`);
    info(`Selected Cantrips: ${finalState.selected_cantrips?.join(', ') || 'none'}`);
    info(`Selected Spells: ${finalState.selected_spells?.join(', ') || 'none'}`);
    info(`Spell Slots: ${JSON.stringify(finalState.spell_slots)}`);
    info(`Position: (${finalState.position?.x}, ${finalState.position?.y})`);
    console.log('─'.repeat(80));
    console.log('');

    // Assertions
    const assertions = [
      { condition: finalState.level === 1, message: 'Level should be 1' },
      { condition: finalState.tutorial_state === null, message: 'Tutorial should be complete' },
      { condition: finalState.selected_cantrips?.length === 2, message: 'Should have 2 cantrips' },
      { condition: finalState.selected_spells?.length === 4, message: 'Should have 4 spells' },
      { condition: finalState.spell_slots?.['1'] === 2, message: 'Should have 2 level-1 spell slots' },
      { condition: finalState.position !== null, message: 'Should have position set' },
    ];

    let allPassed = true;
    for (const assertion of assertions) {
      if (assertion.condition) {
        success(assertion.message);
      } else {
        error(assertion.message);
        allPassed = false;
      }
    }

    console.log('');
    if (allPassed) {
      log('='.repeat(80), colors.green);
      log('TEST PASSED: BARD SESSION 0 COMPLETE!', colors.green);
      log('='.repeat(80), colors.green);
    } else {
      log('='.repeat(80), colors.red);
      log('TEST FAILED: See errors above', colors.red);
      log('='.repeat(80), colors.red);
    }
    console.log('');

  } catch (err) {
    console.log('');
    error('TEST FAILED WITH ERROR:');
    console.error(err);
    console.log('');
    process.exit(1);
  } finally {
    // ========================================================================
    // CLEANUP: Delete test character
    // ========================================================================
    if (characterId && authToken) {
      try {
        log('\nCleaning up test character...', colors.yellow);
        await axios.delete(`${API_BASE}/api/characters/${characterId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        success('Test character deleted');
      } catch (cleanupErr) {
        error('Failed to cleanup test character');
      }
    }
  }
}

// Run the test
testBardCreation().catch(err => {
  console.error(err);
  process.exit(1);
});
