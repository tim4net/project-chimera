/**
 * Test Script: Travel System Integration
 *
 * Tests the complete travel flow:
 * 1. Create a character
 * 2. Initiate travel action via chat
 * 3. Verify travel_session is created
 * 4. Wait for TravelWorker to process it
 * 5. Verify position updates
 * 6. Verify game_time_minutes increments
 * 7. Verify tiles are discovered
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  stage: string;
  success: boolean;
  details: string;
  data?: any;
}

const results: TestResult[] = [];

function log(stage: string, success: boolean, details: string, data?: any) {
  const result: TestResult = { stage, success, details, data };
  results.push(result);
  const icon = success ? '✅' : '❌';
  console.log(`${icon} [${stage}] ${details}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

async function testTravelSystem() {
  try {
    console.log('\n🚀 Starting Travel System Integration Test\n');

    // =====================================================
    // Stage 1: Get or Create Test Character
    // =====================================================
    console.log('📍 Stage 1: Getting existing test character...');
    const characterName = `TravelTest_${Date.now()}`;

    // For this test, we'll use a service key approach by directly querying
    // First, let's try to get any existing character from a known user
    const { data: existingChars, error: queryError } = await supabase
      .from('characters')
      .select('*')
      .limit(1);

    let characterId: string;
    let userId: string;

    if (queryError || !existingChars || existingChars.length === 0) {
      log('CharacterQuery', false, `Could not find existing character: ${queryError?.message}`);
      console.log('Note: Using test character ID from environment or creating mock test');
      // For now, we'll exit gracefully
      return;
    }

    const character = existingChars[0];
    characterId = character.id;
    userId = character.user_id;
    log('CharacterFound', true, `Using character: ${character.name} at (${character.position_x}, ${character.position_y})`);

    // =====================================================
    // Stage 2: Check Initial State
    // =====================================================
    console.log('\n📍 Stage 2: Checking initial character state...');
    const { data: initialChar } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    log('InitialState', true, `Initial position: (${initialChar?.position_x}, ${initialChar?.position_y}), game_time: ${initialChar?.game_time_minutes || 0}`);

    // =====================================================
    // Stage 3: Simulate Travel Action via Chat API
    // =====================================================
    console.log('\n📍 Stage 3: Initiating travel via chat API...');

    const destinationX = 50;
    const destinationY = 50;
    const travelDistance = Math.sqrt(
      (destinationX - (initialChar?.position_x || 0)) ** 2 +
      (destinationY - (initialChar?.position_y || 0)) ** 2
    );

    console.log(`   Travel distance: ${travelDistance.toFixed(2)} miles from (${initialChar?.position_x}, ${initialChar?.position_y}) to (${destinationX}, ${destinationY})`);

    // Make chat request to initiate travel
    const chatResponse = await fetch('http://localhost:3001/api/chat/dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId,
        message: `I travel to coordinate ${destinationX},${destinationY}`,
      }),
    });

    if (!chatResponse.ok) {
      log('ChatAPI', false, `Chat API returned status ${chatResponse.status}`);
      const text = await chatResponse.text();
      console.log('   Response:', text);
      return;
    }

    const chatData = await chatResponse.json();
    log('ChatAPI', true, `Chat API responded successfully`);
    console.log('   Response:', JSON.stringify(chatData, null, 2).substring(0, 200));

    // =====================================================
    // Stage 4: Verify Travel Session Created
    // =====================================================
    console.log('\n📍 Stage 4: Verifying travel_session creation...');

    // Wait a moment for database to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: sessions, error: sessError } = await supabase
      .from('travel_sessions')
      .select('*')
      .eq('character_id', characterId)
      .eq('status', 'active');

    if (sessError) {
      log('TravelSessionQuery', false, `Failed to query travel_sessions: ${sessError.message}`);
      return;
    }

    if (!sessions || sessions.length === 0) {
      log('TravelSessionCreate', false, 'No travel_session created after chat API call');
      return;
    }

    const session = sessions[0];
    log('TravelSessionCreate', true, `Travel session created: ${session.id}`);
    log('TravelSessionDetails', true,
      `Miles: ${session.miles_traveled}/${session.miles_total}, Mode: ${session.travel_mode}, Status: ${session.status}`,
      session
    );

    // =====================================================
    // Stage 5: Wait for TravelWorker to Process (1 tick = 60 seconds)
    // =====================================================
    console.log('\n📍 Stage 5: Waiting for TravelWorker to process (60 seconds)...');
    console.log('   Note: TravelWorker ticks every 60 real-time seconds');

    for (let i = 0; i < 12; i++) {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second intervals
    }
    console.log(' Done!');

    // =====================================================
    // Stage 6: Check Position and Game Time Updates
    // =====================================================
    console.log('\n📍 Stage 6: Checking position and game time updates...');

    const { data: updatedChar } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (!updatedChar) {
      log('CharacterUpdate', false, 'Character not found after travel');
      return;
    }

    const positionChanged =
      updatedChar.position_x !== initialChar?.position_x ||
      updatedChar.position_y !== initialChar?.position_y;

    const gameTimeChanged = (updatedChar.game_time_minutes || 0) > (initialChar?.game_time_minutes || 0);

    log('PositionUpdate', positionChanged,
      `Position: (${updatedChar.position_x}, ${updatedChar.position_y}) - ${positionChanged ? 'CHANGED ✓' : 'NO CHANGE ✗'}`
    );

    log('GameTimeUpdate', gameTimeChanged,
      `Game Time: ${initialChar?.game_time_minutes || 0} → ${updatedChar.game_time_minutes || 0} minutes - ${gameTimeChanged ? 'INCREMENTED ✓' : 'NO CHANGE ✗'}`
    );

    // =====================================================
    // Stage 7: Check Session Progress
    // =====================================================
    console.log('\n📍 Stage 7: Checking session progress...');

    const { data: updatedSession } = await supabase
      .from('travel_sessions')
      .select('*')
      .eq('id', session.id)
      .single();

    if (!updatedSession) {
      log('SessionCheck', false, 'Session not found');
      return;
    }

    const progressPercent = Math.round((updatedSession.miles_traveled / updatedSession.miles_total) * 100);

    log('SessionProgress', updatedSession.miles_traveled > 0,
      `Miles: ${updatedSession.miles_traveled.toFixed(2)}/${updatedSession.miles_total.toFixed(2)} (${progressPercent}%)`,
      updatedSession
    );

    // =====================================================
    // Stage 8: Check Fog of War Tiles Discovery
    // =====================================================
    console.log('\n📍 Stage 8: Checking fog of war tiles discovery...');

    const { data: fogTiles, error: fogError } = await supabase
      .from('world_fog')
      .select('COUNT(*)')
      .eq('campaign_seed', character.campaign_seed)
      .eq('character_id', characterId);

    if (fogError) {
      log('FogOfWarQuery', false, `Failed to query world_fog: ${fogError.message}`);
    } else {
      const tileCount = (fogTiles as any)?.[0]?.count || 0;
      log('FogOfWarTiles', tileCount > 0,
        `Discovered ${tileCount} tiles during travel`,
        { tileCount }
      );
    }

    // =====================================================
    // Summary
    // =====================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);

    results.forEach(r => {
      const icon = r.success ? '✅' : '❌';
      console.log(`${icon} ${r.stage.padEnd(20)} ${r.details}`);
    });

    console.log('-'.repeat(60));
    console.log(`Overall: ${passed}/${total} tests passed (${percentage}%)`);
    console.log('='.repeat(60) + '\n');

    if (passed === total) {
      console.log('🎉 All tests passed! Travel system is working correctly.');
    } else {
      console.log(`⚠️  ${total - passed} test(s) failed. Check the details above.`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testTravelSystem();
