import React, { useState, useEffect } from 'react';
import { CharacterDraft } from '@/types/wizard';
import { AbilitySlider } from './components/AbilitySlider';
import { SkillsGrid } from './components/SkillsGrid';
import { StatsPreview } from './components/StatsPreview';
import {
  AbilityScores,
  calculatePointsRemaining,
  calculateTotalPointsSpent,
  TOTAL_POINTS,
} from './utils/abilityScoreCalculations';

export interface Step3AbilitiesSkillsProps {
  draft: CharacterDraft;
  updateDraft: (updates: Partial<CharacterDraft>) => void;
  errors: Record<string, string>;
}

const DEFAULT_ABILITY_SCORES: AbilityScores = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

export const Step3AbilitiesSkills: React.FC<Step3AbilitiesSkillsProps> = ({
  draft,
  updateDraft,
  errors,
}) => {
  const [abilityScores, setAbilityScores] = useState<AbilityScores>(
    draft.abilityScores || DEFAULT_ABILITY_SCORES
  );

  const pointsSpent = calculateTotalPointsSpent(abilityScores);
  const pointsRemaining = calculatePointsRemaining(abilityScores);
  const isBudgetValid = pointsSpent === TOTAL_POINTS;
  const isBudgetExceeded = pointsSpent > TOTAL_POINTS;

  const racialBonuses = draft.race?.racialBonuses || {};
  const backgroundSkills = draft.background?.skills || [];
  const skillLimit = draft.class?.skillLimit || 2;
  const selectedSkills = draft.skills || [];
  const hitDie = draft.class?.hitDie || 10;
  const proficiencyBonus = 2; // Level 1

  useEffect(() => {
    updateDraft({ abilityScores });
  }, [abilityScores, updateDraft]);

  const handleAbilityChange = (ability: keyof AbilityScores, newScore: number) => {
    setAbilityScores((prev) => ({
      ...prev,
      [ability]: newScore,
    }));
  };

  const handleReset = () => {
    setAbilityScores(DEFAULT_ABILITY_SCORES);
  };

  const handleSkillToggle = (skillId: string) => {
    const isSelected = selectedSkills.includes(skillId);
    const newSkills = isSelected
      ? selectedSkills.filter((s) => s !== skillId)
      : [...selectedSkills, skillId];

    updateDraft({ skills: newSkills });
  };

  const classSkillsCount = selectedSkills.filter(
    (skill) => !backgroundSkills.includes(skill)
  ).length;

  const isNextButtonEnabled = isBudgetValid && classSkillsCount === skillLimit;

  return (
    <div className="step3-abilities-skills">
      <div className="step-header">
        <h2>Abilities & Skills</h2>
        <p className="step-description">
          Allocate your ability scores using the point-buy system, then select your skill proficiencies.
        </p>
      </div>

      {/* Points Budget Display */}
      <div className={`budget-tracker ${isBudgetExceeded ? 'error' : isBudgetValid ? 'success' : ''}`}>
        <div className="budget-info">
          <span className="budget-label">Points Remaining:</span>
          <span className="budget-value">{pointsRemaining}</span>
          <span className="budget-total">/ {TOTAL_POINTS}</span>
        </div>
        {isBudgetExceeded && (
          <div className="budget-warning">You have exceeded your point budget!</div>
        )}
        {isBudgetValid && (
          <div className="budget-success">Perfect! Budget used efficiently.</div>
        )}
        <button onClick={handleReset} className="reset-button" type="button">
          Reset to Defaults
        </button>
      </div>

      {/* Ability Sliders Grid */}
      <div className="abilities-section">
        <h3>Ability Scores</h3>
        <div className="abilities-grid">
          <AbilitySlider
            ability="str"
            baseScore={abilityScores.str}
            racialBonus={racialBonuses.str}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('str', newScore)}
          />
          <AbilitySlider
            ability="dex"
            baseScore={abilityScores.dex}
            racialBonus={racialBonuses.dex}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('dex', newScore)}
          />
          <AbilitySlider
            ability="con"
            baseScore={abilityScores.con}
            racialBonus={racialBonuses.con}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('con', newScore)}
          />
          <AbilitySlider
            ability="int"
            baseScore={abilityScores.int}
            racialBonus={racialBonuses.int}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('int', newScore)}
          />
          <AbilitySlider
            ability="wis"
            baseScore={abilityScores.wis}
            racialBonus={racialBonuses.wis}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('wis', newScore)}
          />
          <AbilitySlider
            ability="cha"
            baseScore={abilityScores.cha}
            racialBonus={racialBonuses.cha}
            pointsRemaining={pointsRemaining}
            onScoreChange={(newScore) => handleAbilityChange('cha', newScore)}
          />
        </div>
      </div>

      {/* Stats Preview */}
      <StatsPreview
        proficiencyBonus={proficiencyBonus}
        constitutionScore={Math.min(20, abilityScores.con + (racialBonuses.con || 0))}
        dexterityScore={Math.min(20, abilityScores.dex + (racialBonuses.dex || 0))}
        hitDie={hitDie}
      />

      {/* Skills Grid */}
      <SkillsGrid
        skills={[]}
        selectedSkills={selectedSkills}
        backgroundSkills={backgroundSkills}
        abilityScores={{
          str: Math.min(20, abilityScores.str + (racialBonuses.str || 0)),
          dex: Math.min(20, abilityScores.dex + (racialBonuses.dex || 0)),
          con: Math.min(20, abilityScores.con + (racialBonuses.con || 0)),
          int: Math.min(20, abilityScores.int + (racialBonuses.int || 0)),
          wis: Math.min(20, abilityScores.wis + (racialBonuses.wis || 0)),
          cha: Math.min(20, abilityScores.cha + (racialBonuses.cha || 0)),
        }}
        proficiencyBonus={proficiencyBonus}
        skillLimit={skillLimit}
        onSkillToggle={handleSkillToggle}
      />

      {/* Navigation */}
      <div className="step-navigation">
        <button
          type="button"
          className="next-button"
          disabled={!isNextButtonEnabled}
        >
          Next: Choose Spells
        </button>
        {!isNextButtonEnabled && (
          <div className="validation-hint">
            {!isBudgetValid && <p>• Use all 27 ability points</p>}
            {classSkillsCount !== skillLimit && (
              <p>• Select {skillLimit} skill proficiencies</p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .step3-abilities-skills {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .step-header {
          text-align: center;
        }

        .step-header h2 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .step-description {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        .budget-tracker {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .budget-tracker.error {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .budget-tracker.success {
          border-color: #059669;
          background: #f0fdf4;
        }

        .budget-info {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 18px;
        }

        .budget-label {
          font-weight: 600;
          color: #374151;
        }

        .budget-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .budget-total {
          font-size: 18px;
          color: #6b7280;
        }

        .budget-warning {
          padding: 8px 12px;
          background: #fee2e2;
          border-left: 4px solid #dc2626;
          color: #991b1b;
          font-weight: 600;
          border-radius: 4px;
        }

        .budget-success {
          padding: 8px 12px;
          background: #d1fae5;
          border-left: 4px solid #059669;
          color: #065f46;
          font-weight: 600;
          border-radius: 4px;
        }

        .reset-button {
          align-self: flex-start;
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reset-button:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .abilities-section h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .abilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .step-navigation {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .next-button {
          padding: 14px 32px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(5, 150, 105, 0.4);
        }

        .next-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          box-shadow: none;
        }

        .validation-hint {
          font-size: 14px;
          color: #dc2626;
          text-align: center;
        }

        .validation-hint p {
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .step3-abilities-skills {
            padding: 16px;
            gap: 24px;
          }

          .abilities-grid {
            grid-template-columns: 1fr;
          }

          .step-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};
