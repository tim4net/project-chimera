/**
 * @file Bard Complete Progression Test
 *
 * Tests the full lifecycle of a Bard character:
 * 1. Session 0 interview (spell selection)
 * 2. Level 1 → 3 progression
 * 3. Subclass selection at level 3
 * 4. Verify all features present
 */

import { getInterviewPrompt, getAvailableCantripsFromDB, getAvailableSpellsFromDB } from '../services/session0Interview';
import { getSpellRequirements } from '../services/spellValidator';
import { getSubclassSelectionLevel, getAvailableSubclasses, needsSubclassSelection } from '../services/subclassService';
import type { CharacterRecord } from '../types';

describe('Bard Complete Progression', () => {

  // Mock Bard at different stages
  const createBard = (level: number, tutorial_state: string | null, subclass?: string): CharacterRecord => ({
    id: 'test-bard-123',
    user_id: 'test-user',
    name: 'Lyra',
    race: 'Human',
    class: 'Bard',
    background: 'Entertainer',
    alignment: 'Chaotic Good',
    level,
    xp: 0,
    gold: 50,
    ability_scores: { STR: 8, DEX: 14, CON: 12, INT: 10, WIS: 13, CHA: 15 },
    hp_max: level === 0 ? 10 : 14,
    hp_current: level === 0 ? 10 : 14,
    temporary_hp: 0,
    armor_class: 12,
    speed: 30,
    hit_dice: { d8: level },
    position: { x: 500, y: 500 },
    campaign_seed: 'test-seed',
    spell_slots: level > 0 ? { '1': 2 } : {},
    backstory: null,
    skills: null,
    portrait_url: null,
    proficiency_bonus: 2,
    tutorial_state: tutorial_state as any,
    subclass,
  });

  // ============================================================================
  // SESSION 0 INTERVIEW TESTS
  // ============================================================================

  describe('Session 0 Interview', () => {

    test('Bard starts at interview_welcome', async () => {
      const bard = createBard(0, 'interview_welcome');

      const prompt = await getInterviewPrompt(bard);

      expect(prompt).toContain('Session 0');
      expect(prompt).toContain('Lyra');
      expect(prompt.toLowerCase()).not.toContain('skip'); // Skip option removed
      console.log('✓ Welcome prompt correct (no skip option)');
    });

    test('Cantrip selection uses DATABASE spell list', async () => {
      const bard = createBard(0, 'needs_cantrips');

      // Query database for Bard cantrips
      const dbCantrips = await getAvailableCantripsFromDB('Bard');

      // Get interview prompt
      const prompt = await getInterviewPrompt(bard);

      // Verify prompt contains database spells
      console.log(`\n[Bard Cantrips] Database returned ${dbCantrips.length} cantrips`);

      expect(dbCantrips.length).toBeGreaterThan(0);

      // Verify at least 3 real spells appear in prompt
      const realSpellsFound = dbCantrips.filter(spell =>
        prompt.includes(spell.name)
      );

      console.log(`Real spells in prompt: ${realSpellsFound.map(s => s.name).join(', ')}`);

      expect(realSpellsFound.length).toBeGreaterThanOrEqual(3);

      // Verify correct quantity mentioned
      const requirements = getSpellRequirements('Bard');
      expect(prompt).toContain(`${requirements.cantrips}`); // Should say "2"
      expect(prompt.toLowerCase()).toContain('exactly'); // Enforces limit

      console.log('✓ Cantrip prompt uses database (not hallucination)');
      console.log(`✓ Correct quantity: ${requirements.cantrips} cantrips`);
    });

    test('Spell selection uses DATABASE spell list', async () => {
      const bard = createBard(0, 'needs_spells');

      // Query database
      const dbSpells = await getAvailableSpellsFromDB('Bard', 1);

      // Get prompt
      const prompt = await getInterviewPrompt(bard);

      console.log(`\n[Bard Spells] Database returned ${dbSpells.length} level-1 spells`);

      expect(dbSpells.length).toBeGreaterThan(0);

      // Verify real spells in prompt
      const realSpellsFound = dbSpells.filter(spell =>
        prompt.includes(spell.name)
      );

      console.log(`Real spells in prompt: ${realSpellsFound.map(s => s.name).join(', ')}`);

      expect(realSpellsFound.length).toBeGreaterThanOrEqual(3);

      // Verify correct quantity
      const requirements = getSpellRequirements('Bard');
      const spellCount = typeof requirements.spells === 'object' ? (requirements.spells as any)['1'] : requirements.spells;

      expect(prompt).toContain(`${spellCount}`); // Should say "4"

      console.log('✓ Spell prompt uses database');
      console.log(`✓ Correct quantity: ${spellCount} spells`);
    });

    test('Prompt blocks LLM improvisation', async () => {
      const bard = createBard(0, 'needs_cantrips');
      const prompt = await getInterviewPrompt(bard);

      // Verify blocking instructions
      expect(prompt).toContain('DO NOT make up');
      expect(prompt).toContain('EXACTLY');
      expect(prompt).toContain('ONLY valid choices');

      console.log('✓ Prompt has anti-hallucination instructions');
    });

  });

  // ============================================================================
  // SUBCLASS TESTS
  // ============================================================================

  describe('Subclass Selection at Level 3', () => {

    test('Bard gets subclass at level 3', () => {
      const subclassLevel = getSubclassSelectionLevel('Bard');

      expect(subclassLevel).toBe(3);
      console.log('✓ Bard subclass selection at level 3');
    });

    test('Bard has available subclasses', () => {
      const subclasses = getAvailableSubclasses('Bard');

      expect(subclasses.length).toBeGreaterThan(0);

      console.log(`\n[Bard Subclasses] Available: ${subclasses.map(s => s.name).join(', ')}`);

      // Verify at least College of Lore exists
      const lore = subclasses.find(s => s.name === 'College of Lore');
      expect(lore).toBeDefined();
      expect(lore?.class).toBe('Bard');

      console.log('✓ Bard subclasses available');
    });

    test('Level 2 Bard does NOT need subclass yet', () => {
      const bard = createBard(2, null);

      const needs = needsSubclassSelection(bard);

      expect(needs).toBe(false);
      console.log('✓ Level 2 Bard - no subclass yet');
    });

    test('Level 3 Bard NEEDS subclass', () => {
      const bard = createBard(3, null); // No subclass assigned

      const needs = needsSubclassSelection(bard);

      expect(needs).toBe(true);
      console.log('✓ Level 3 Bard - requires subclass selection');
    });

    test('Level 3 Bard WITH subclass does not need selection', () => {
      const bard = createBard(3, null, 'College of Lore');

      const needs = needsSubclassSelection(bard);

      expect(needs).toBe(false);
      console.log('✓ Level 3 Bard with subclass - selection complete');
    });

  });

  // ============================================================================
  // INTEGRATION TEST
  // ============================================================================

  describe('Full Bard Lifecycle', () => {

    test('Bard progression from creation to level 3 with subclass', async () => {
      console.log('\n=== BARD FULL LIFECYCLE ===');

      // Stage 1: Created (Level 0, Session 0)
      console.log('\nStage 1: Character Creation');
      const newBard = createBard(0, 'interview_welcome');

      expect(newBard.level).toBe(0);
      expect(newBard.tutorial_state).toBe('interview_welcome');
      expect(newBard.spell_slots).toEqual({});
      console.log('✓ Created at Level 0, interview_welcome state');

      // Stage 2: After Cantrip Selection
      console.log('\nStage 2: After Cantrip Selection');
      const bardWithCantrips = {
        ...newBard,
        tutorial_state: 'needs_spells' as any,
        selected_cantrips: ['Vicious Mockery', 'Mage Hand'],
      };

      expect(bardWithCantrips.selected_cantrips).toHaveLength(2);
      console.log('✓ 2 cantrips selected');

      // Stage 3: After Spell Selection (Complete Session 0)
      console.log('\nStage 3: After Spell Selection');
      const bardWithSpells = {
        ...bardWithCantrips,
        tutorial_state: 'interview_complete' as any,
        selected_spells: ['Healing Word', 'Charm Person', 'Dissonant Whispers', 'Faerie Fire'],
      };

      expect(bardWithSpells.selected_spells).toHaveLength(4);
      console.log('✓ 4 spells selected');

      // Stage 4: Level 1 (Entered World)
      console.log('\nStage 4: Level 1 - World Entry');
      const level1Bard = createBard(1, null);
      const level1WithSpells = {
        ...level1Bard,
        selected_cantrips: ['Vicious Mockery', 'Mage Hand'],
        selected_spells: ['Healing Word', 'Charm Person', 'Dissonant Whispers', 'Faerie Fire'],
      };

      expect(level1WithSpells.level).toBe(1);
      expect(level1WithSpells.spell_slots).toEqual({ '1': 2 });
      expect(level1WithSpells.selected_cantrips).toHaveLength(2);
      expect(level1WithSpells.selected_spells).toHaveLength(4);
      console.log('✓ Level 1: Has spell slots, cantrips, spells');

      // Stage 5: Level 3 (Needs Subclass)
      console.log('\nStage 5: Level 3 - Subclass Selection Required');
      const level3Bard = createBard(3, null);

      const needsSub = needsSubclassSelection(level3Bard);
      expect(needsSub).toBe(true);

      const availableSubs = getAvailableSubclasses('Bard');
      expect(availableSubs.length).toBeGreaterThan(0);

      console.log(`✓ Level 3: Needs subclass (${availableSubs.length} options available)`);

      // Stage 6: Level 3 with Subclass
      console.log('\nStage 6: Level 3 - Subclass Assigned');
      const completeBard = createBard(3, null, 'College of Lore');

      const stillNeeds = needsSubclassSelection(completeBard);
      expect(stillNeeds).toBe(false);
      expect(completeBard.subclass).toBe('College of Lore');

      console.log('✓ Level 3: Subclass assigned (College of Lore)');
      console.log('✓ Bard is COMPLETE with all features');

      console.log('\n=== BARD LIFECYCLE: ALL STAGES PASS ===');
    });

  });

  // ============================================================================
  // DATA INTEGRITY TESTS
  // ============================================================================

  describe('Bard Spell Data Integrity', () => {

    test('Database has Bard-specific cantrips', async () => {
      const cantrips = await getAvailableCantripsFromDB('Bard');

      expect(cantrips.length).toBeGreaterThanOrEqual(5);

      // Verify signature Bard cantrips exist
      const cantripNames = cantrips.map(c => c.name);

      expect(cantripNames).toContain('Vicious Mockery'); // Bard-only
      console.log(`✓ Vicious Mockery in database (Bard signature spell)`);

      // Should NOT contain Cleric-only cantrips
      expect(cantripNames).not.toContain('Sacred Flame');

      console.log(`✓ Database contains ${cantrips.length} Bard cantrips`);
      console.log(`  Cantrips: ${cantripNames.slice(0, 5).join(', ')}...`);
    });

    test('Database has Bard-specific level 1 spells', async () => {
      const spells = await getAvailableSpellsFromDB('Bard', 1);

      expect(spells.length).toBeGreaterThanOrEqual(10);

      const spellNames = spells.map(s => s.name);

      // Bard signature spells
      expect(spellNames).toContain('Healing Word');
      expect(spellNames).toContain('Charm Person');

      // Bard-exclusive spell
      expect(spellNames).toContain('Dissonant Whispers');

      console.log(`✓ Database contains ${spells.length} Bard level-1 spells`);
      console.log(`  Spells: ${spellNames.slice(0, 5).join(', ')}...`);
    });

    test('Bard spell requirements are correct', () => {
      const requirements = getSpellRequirements('Bard');

      expect(requirements.cantrips).toBe(2); // NOT 3!
      expect(requirements.spells).toEqual({ '1': 4 }); // 4 level-1 spells

      console.log(`✓ Bard requirements: ${requirements.cantrips} cantrips, 4 spells`);
    });

  });

  // ============================================================================
  // PROMPT QUALITY TESTS
  // ============================================================================

  describe('Bard Interview Prompt Quality', () => {

    test('Cantrip prompt is strict and database-driven', async () => {
      const bard = createBard(0, 'needs_cantrips');
      const prompt = await getInterviewPrompt(bard);

      // Must contain database spells
      const dbCantrips = await getAvailableCantripsFromDB('Bard');
      const firstSpell = dbCantrips[0]?.name;

      expect(prompt).toContain(firstSpell);
      console.log(`✓ Prompt contains database spell: ${firstSpell}`);

      // Must enforce limits
      expect(prompt).toContain('EXACTLY 2');
      expect(prompt).toContain('DO NOT make up');

      console.log('✓ Prompt enforces rules strictly');

      // Must NOT contain hallucinated spells
      expect(prompt.toLowerCase()).not.toContain('vine'); // Fake spell
      expect(prompt.toLowerCase()).not.toContain('cure wounds'); // That's level 1!

      console.log('✓ Prompt contains no hallucinated spells');
    });

    test('Spell prompt separates cantrips from level-1 spells', async () => {
      const bard = createBard(0, 'needs_spells');
      const prompt = await getInterviewPrompt(bard);

      // Should NOT contain cantrip-only spells
      expect(prompt.toLowerCase()).not.toContain('prestidigitation'); // That's a cantrip
      expect(prompt.toLowerCase()).not.toContain('mage hand'); // That's a cantrip

      // SHOULD contain level 1 spells
      expect(prompt).toContain('Healing Word'); // Level 1
      expect(prompt).toContain('Charm Person'); // Level 1

      console.log('✓ Prompt correctly separates cantrips from spells');
    });

  });

});

console.log('\n' + '='.repeat(80));
console.log('RUN THIS TEST:');
console.log('npm test -- bard-complete-progression.test.ts');
console.log('='.repeat(80));
