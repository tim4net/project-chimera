/**
 * @file CharacterFoundation.tsx
 * @description Page 1 of character creation - all 5 foundation sections on one scrollable page
 */

import React, { useCallback, useMemo } from 'react';
import { useCharacterDraft } from '../../../hooks/useCharacterDraft';
import { CharacterPreview } from '../shared/CharacterPreview';
import { Identity } from '../sections/Identity';
import { CoreAttributes } from '../sections/CoreAttributes';
import { AlignmentGrid } from '../sections/AlignmentGrid';
import { AbilityScorePanel } from '../sections/AbilityScorePanel';
import { SkillsPanel } from '../sections/SkillsPanel';
import type { AbilityName, Race, CharacterClass, Background, Alignment, SkillName } from '../../../types/wizard';
import type { AbilityScores } from '../../../types';
import { ABILITY_SCORE_MIN } from '../../../types/wizard';

const RECOMMENDED_STATS: Record<CharacterClass, AbilityScores> = {
  Barbarian: { STR: 15, DEX: 13, CON: 14, INT: 8, WIS: 10, CHA: 12 },
  Bard: { STR: 8, DEX: 14, CON: 12, INT: 10, WIS: 13, CHA: 15 },
  Cleric: { STR: 14, DEX: 8, CON: 13, INT: 10, WIS: 15, CHA: 12 },
  Druid: { STR: 8, DEX: 12, CON: 14, INT: 13, WIS: 15, CHA: 10 },
  Fighter: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 10, CHA: 12 },
  Monk: { STR: 12, DEX: 15, CON: 13, INT: 8, WIS: 14, CHA: 10 },
  Paladin: { STR: 15, DEX: 10, CON: 13, INT: 8, WIS: 12, CHA: 14 },
  Ranger: { STR: 12, DEX: 15, CON: 13, INT: 8, WIS: 14, CHA: 10 },
  Rogue: { STR: 8, DEX: 15, CON: 12, INT: 14, WIS: 13, CHA: 10 },
  Sorcerer: { STR: 8, DEX: 13, CON: 14, INT: 10, WIS: 12, CHA: 15 },
  Warlock: { STR: 8, DEX: 13, CON: 14, INT: 10, WIS: 12, CHA: 15 },
  Wizard: { STR: 8, DEX: 14, CON: 13, INT: 15, WIS: 12, CHA: 10 },
};

export function CharacterFoundation() {
  const { draft, updateStep, isPageValid, nextPage } = useCharacterDraft();

  // Extract current values from draft with safe defaults
  const name = draft.name || '';
  const race = draft.race || 'Human';
  const characterClass = draft.class || 'Fighter';
  const background = draft.background || 'Soldier';
  const alignment = draft.alignment || 'True Neutral';
  const abilityScores = draft.abilityScores || {
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8,
  };
  const proficientSkills = draft.proficientSkills || [];

  // Handlers for Identity section
  const handleNameChange = useCallback(
    (newName: string) => {
      updateStep('identity', { name: newName });
    },
    [updateStep]
  );

  const handleGenderChange = useCallback(
    (gender: string) => {
      // Gender is stored in identity but not persisted to database
      updateStep('identity', { description: gender });
    },
    [updateStep]
  );

  // Handlers for Core Attributes section
  const handleRaceChange = useCallback(
    (newRace: Race) => {
      updateStep('coreAttributes', { race: newRace });
    },
    [updateStep]
  );

  const handleClassChange = useCallback(
    (newClass: CharacterClass) => {
      updateStep('coreAttributes', { class: newClass });
      // Reset skills when class changes
      updateStep('skills', { proficientSkills: [] });
    },
    [updateStep]
  );

  const handleBackgroundChange = useCallback(
    (newBackground: Background) => {
      updateStep('coreAttributes', { background: newBackground });
    },
    [updateStep]
  );

  // Handlers for Alignment section
  const handleAlignmentChange = useCallback(
    (newAlignment: Alignment) => {
      updateStep('alignment', { alignment: newAlignment });
    },
    [updateStep]
  );

  // Handlers for Ability Scores section
  const handleScoreChange = useCallback(
    (ability: AbilityName, newScore: number) => {
      const updatedScores = { ...abilityScores, [ability]: newScore };
      updateStep('abilityScores', { finalScores: updatedScores });
    },
    [abilityScores, updateStep]
  );

  const handleUseRecommended = useCallback(() => {
    const recommendedScores = RECOMMENDED_STATS[characterClass];
    if (recommendedScores) {
      updateStep('abilityScores', { finalScores: recommendedScores });
    }
  }, [characterClass, updateStep]);

  const handleReset = useCallback(() => {
    const resetScores: AbilityScores = {
      STR: ABILITY_SCORE_MIN,
      DEX: ABILITY_SCORE_MIN,
      CON: ABILITY_SCORE_MIN,
      INT: ABILITY_SCORE_MIN,
      WIS: ABILITY_SCORE_MIN,
      CHA: ABILITY_SCORE_MIN,
    };
    updateStep('abilityScores', { finalScores: resetScores });
  }, [updateStep]);

  // Handlers for Skills section
  const handleToggleSkill = useCallback(
    (skill: SkillName) => {
      const currentSkills = new Set(proficientSkills);
      if (currentSkills.has(skill)) {
        currentSkills.delete(skill);
      } else {
        currentSkills.add(skill);
      }
      updateStep('skills', { proficientSkills: Array.from(currentSkills) });
    },
    [proficientSkills, updateStep]
  );

  // Validation
  const isValid = useMemo(() => {
    return (
      name.length >= 2 &&
      name.length <= 50 &&
      /^[a-zA-Z0-9\s\-]+$/.test(name) &&
      race &&
      characterClass &&
      background &&
      alignment &&
      proficientSkills.length > 0
    );
  }, [name, race, characterClass, background, alignment, proficientSkills]);

  const handleNext = () => {
    if (isValid) {
      nextPage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nuaibria-bg via-nuaibria-surface to-nuaibria-bg text-white p-4 sm:p-8 font-body">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Character Preview (Sticky) */}
        <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
          <CharacterPreview draft={draft} />
        </div>

        {/* Right Form: Scrollable Sections */}
        <div className="lg:col-span-2 space-y-8">
          <header className="text-center lg:text-left">
            <h1 className="font-display text-5xl text-nuaibria-gold tracking-widest drop-shadow-lg">
              Character Foundation
            </h1>
            <p className="text-nuaibria-text-secondary mt-3 text-lg">
              Page 1 of 3: Define your character's core identity
            </p>
          </header>

          {/* Section 1: Identity */}
          <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
            <Identity
              name={name}
              gender={draft.description || 'Male'}
              onNameChange={handleNameChange}
              onGenderChange={handleGenderChange}
              race={race}
              characterClass={characterClass}
              background={background}
            />
          </div>

          {/* Section 2: Core Attributes */}
          <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
            <CoreAttributes
              race={race}
              characterClass={characterClass}
              background={background}
              onRaceChange={handleRaceChange}
              onClassChange={handleClassChange}
              onBackgroundChange={handleBackgroundChange}
            />
          </div>

          {/* Section 3: Alignment */}
          <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
            <AlignmentGrid alignment={alignment} onAlignmentChange={handleAlignmentChange} />
          </div>

          {/* Section 4: Ability Scores */}
          <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
            <AbilityScorePanel
              abilityScores={abilityScores}
              race={race}
              characterClass={characterClass}
              onScoreChange={handleScoreChange}
              onUseRecommended={handleUseRecommended}
              onReset={handleReset}
            />
          </div>

          {/* Section 5: Skills */}
          <div className="bg-nuaibria-surface border border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover animate-fade-in">
            <SkillsPanel
              background={background}
              characterClass={characterClass}
              selectedSkills={proficientSkills}
              onToggleSkill={handleToggleSkill}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValid}
              className="font-display text-xl bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember text-white px-12 py-4 rounded-lg hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 hover:shadow-glow-lg transition-all hover:-translate-y-0.5 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
            >
              Next: Customization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
