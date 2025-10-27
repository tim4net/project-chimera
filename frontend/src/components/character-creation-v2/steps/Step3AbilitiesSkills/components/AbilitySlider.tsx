import React from 'react';
import {
  calculateModifier,
  formatModifier,
  getScoreCost,
  MIN_SCORE,
  MAX_SCORE,
} from '../utils/abilityScoreCalculations';

export interface AbilitySliderProps {
  ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  baseScore: number;
  racialBonus?: number;
  pointsRemaining: number;
  onScoreChange: (newScore: number) => void;
  disabled?: boolean;
}

const ABILITY_NAMES: Record<string, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const AbilitySlider: React.FC<AbilitySliderProps> = ({
  ability,
  baseScore,
  racialBonus = 0,
  pointsRemaining,
  onScoreChange,
  disabled = false,
}) => {
  const finalScore = Math.min(20, baseScore + racialBonus);
  const modifier = calculateModifier(finalScore);
  const currentCost = getScoreCost(baseScore);
  const abilityName = ABILITY_NAMES[ability];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value, 10);
    const newCost = getScoreCost(newScore);
    const costDifference = newCost - currentCost;

    // Only allow change if we have enough points
    if (costDifference <= pointsRemaining || newScore < baseScore) {
      onScoreChange(newScore);
    }
  };

  return (
    <div className="ability-slider">
      <div className="ability-header">
        <label htmlFor={`${ability}-slider`} className="ability-label">
          {abilityName}
        </label>
        <div className="ability-modifier">
          {formatModifier(modifier)}
        </div>
      </div>

      <div className="slider-container">
        <input
          id={`${ability}-slider`}
          type="range"
          min={MIN_SCORE}
          max={MAX_SCORE}
          value={baseScore}
          onChange={handleChange}
          disabled={disabled}
          className="ability-range-slider"
          aria-label={abilityName}
        />
        <div className="slider-track-fill" style={{ width: `${((baseScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100}%` }} />
      </div>

      <div className="ability-score-display">
        <div className="score-breakdown">
          <span className="base-score">Base: {baseScore}</span>
          {racialBonus > 0 && (
            <>
              <span className="racial-bonus">+{racialBonus} racial</span>
              <span className="equals">=</span>
              <span className="final-score">{finalScore}</span>
            </>
          )}
        </div>
        <div className="score-cost">Cost: {currentCost} pts</div>
      </div>

      <style>{`
        .ability-slider {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
        }

        .ability-slider:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .ability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ability-label {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
        }

        .ability-modifier {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
          min-width: 40px;
          text-align: right;
        }

        .slider-container {
          position: relative;
          padding: 8px 0;
        }

        .ability-range-slider {
          width: 100%;
          height: 8px;
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(to right, #fecaca 0%, #fbbf24 50%, #34d399 100%);
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }

        .ability-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #059669;
          border: 2px solid white;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }

        .ability-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .ability-range-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .ability-range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #059669;
          border: 2px solid white;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.15s ease;
        }

        .ability-range-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .ability-range-slider::-moz-range-thumb:active {
          cursor: grabbing;
        }

        .ability-range-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ability-score-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .score-breakdown {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .base-score {
          font-weight: 600;
          color: #374151;
        }

        .racial-bonus {
          color: #d97706;
          font-weight: 600;
        }

        .equals {
          color: #9ca3af;
        }

        .final-score {
          font-weight: 700;
          color: #059669;
          font-size: 14px;
        }

        .score-cost {
          color: #6b7280;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .ability-slider {
            padding: 12px;
          }

          .ability-range-slider::-webkit-slider-thumb,
          .ability-range-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
};
