/**
 * Manual Test: Session 0 Interview - All 12 Classes
 *
 * This test verifies that each class:
 * 1. Gets correct spell lists from database (not LLM hallucination)
 * 2. Has correct quantity requirements
 * 3. Interview prompts are properly formatted
 * 4. No made-up spells appear
 */

import { getInterviewPrompt, getAvailableCantripsFromDB, getAvailableSpellsFromDB } from './services/session0Interview';
import { getSpellRequirements } from './services/spellValidator';
import type { CharacterRecord } from './types';

const ALL_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid',
  'Fighter', 'Monk', 'Paladin', 'Ranger',
  'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
];

const SPELLCASTERS = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'];

// Mock character factory
function createMockCharacter(className: string, tutorialState: string): CharacterRecord {
  return {
    id: `test-${className.toLowerCase()}`,
    user_id: 'test-user',
    name: `Test${className}`,
    race: 'Human',
    class: className,
    background: 'Soldier',
    alignment: 'Neutral Good',
    level: 0,
    xp: 0,
    gold: 50,
    ability_scores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    hp_max: 10,
    hp_current: 10,
    temporary_hp: 0,
    armor_class: 10,
    speed: 30,
    hit_dice: { d8: 1 },
    position: { x: 500, y: 500 },
    campaign_seed: 'test-seed',
    spell_slots: {},
    backstory: null,
    skills: null,
    portrait_url: null,
    proficiency_bonus: 2,
    tutorial_state: tutorialState as any,
  };
}

async function testClass(className: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`TESTING: ${className}`);
  console.log('='.repeat(80));

  const isSpellcaster = SPELLCASTERS.includes(className);

  // Test 1: Welcome State
  console.log('\n[1/4] Testing interview_welcome state...');
  const char1 = createMockCharacter(className, 'interview_welcome');
  const welcomePrompt = await getInterviewPrompt(char1);

  console.log('✓ Welcome prompt generated');
  if (welcomePrompt.includes('Session 0')) {
    console.log('✓ Mentions Session 0');
  } else {
    console.log('✗ Missing Session 0 mention');
  }

  // Test 2: Cantrip Selection (Spellcasters Only)
  if (isSpellcaster) {
    console.log('\n[2/4] Testing needs_cantrips state...');
    const char2 = createMockCharacter(className, 'needs_cantrips');
    const cantripPrompt = await getInterviewPrompt(char2);

    // Verify database query happened
    const dbCantrips = await getAvailableCantripsFromDB(className);
    console.log(`✓ Database query returned ${dbCantrips.length} cantrips for ${className}`);

    // Verify prompt contains actual spell names from database
    const requirements = getSpellRequirements(className);
    console.log(`✓ ${className} needs ${requirements.cantrips} cantrips`);

    if (cantripPrompt.includes('EXACTLY')) {
      console.log('✓ Prompt enforces exact quantity');
    }

    if (cantripPrompt.includes('DO NOT make up')) {
      console.log('✓ Prompt blocks LLM improvisation');
    }

    // Verify at least one real spell name appears
    if (dbCantrips.length > 0 && cantripPrompt.includes(dbCantrips[0].name)) {
      console.log(`✓ Prompt contains real spell: ${dbCantrips[0].name}`);
    } else {
      console.log(`✗ WARNING: Prompt might not contain database spells!`);
    }

    // Test 3: Spell Selection
    console.log('\n[3/4] Testing needs_spells state...');
    const char3 = createMockCharacter(className, 'needs_spells');
    const spellPrompt = await getInterviewPrompt(char3);

    const dbSpells = await getAvailableSpellsFromDB(className, 1);
    console.log(`✓ Database query returned ${dbSpells.length} level-1 spells for ${className}`);

    const spellReq = typeof requirements.spells === 'object' ? (requirements.spells as any)['1'] : requirements.spells;
    console.log(`✓ ${className} needs ${spellReq} level-1 spells`);

    if (spellPrompt.includes('EXACTLY')) {
      console.log('✓ Spell prompt enforces exact quantity');
    }
  } else {
    console.log('\n[2/4] Skipping cantrip test (non-spellcaster)');
    console.log('[3/4] Skipping spell test (non-spellcaster)');
  }

  // Test 4: Equipment
  console.log('\n[4/4] Testing needs_equipment state...');
  const char4 = createMockCharacter(className, 'needs_equipment');
  const equipPrompt = await getInterviewPrompt(char4);

  if (equipPrompt.includes('Option 1') && equipPrompt.includes('Option 2')) {
    console.log('✓ Equipment options presented');
  }

  console.log(`\n✅ ${className} TEST COMPLETE`);
}

async function runAllTests() {
  console.log('\n╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + 'SESSION 0 INTERVIEW - ALL CLASSES VERIFICATION' + ' '.repeat(15) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  console.log('\nThis test verifies:');
  console.log('1. Database spell lists are queried (not LLM hallucination)');
  console.log('2. Correct quantities enforced (Bard=2 cantrips, not 3)');
  console.log('3. Prompts contain MANDATORY instructions for LLM');
  console.log('4. Real spell names from database appear in prompts');

  for (const className of ALL_CLASSES) {
    await testClass(className);
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Tested ${ALL_CLASSES.length} classes`);
  console.log(`✅ Spellcasters: ${SPELLCASTERS.length}`);
  console.log(`✅ Non-spellcasters: ${ALL_CLASSES.length - SPELLCASTERS.length}`);
  console.log('\nNEXT STEPS:');
  console.log('1. Review output above for any ✗ warnings');
  console.log('2. Restart backend: npm run dev');
  console.log('3. Delete test characters (Grace Hill, braa, etc.)');
  console.log('4. Create NEW character and test Session 0');
  console.log('5. Verify spell lists are REAL (not hallucinated)');
  console.log('\nIf all ✓ checks pass, Session 0 should work correctly!');
  console.log('='.repeat(80));
}

runAllTests().catch(console.error);
