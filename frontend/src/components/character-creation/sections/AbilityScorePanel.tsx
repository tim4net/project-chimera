/**
 * @file AbilityScorePanel.tsx
 * @description Section 4: Ability score point-buy system with racial bonuses
 */

import React from 'react';
import type { AbilityScores } from '../../../types';
import type { Race, CharacterClass, AbilityName } from '../../../types/wizard';
import { POINT_BUY_COSTS, POINT_BUY_TOTAL, ABILITY_SCORE_MIN, ABILITY_SCORE_MAX } from '../../../types/wizard';

interface AbilityScorePanelProps {
  abilityScores: AbilityScores;
  race: Race;
  characterClass: CharacterClass;
  onScoreChange: (ability: AbilityName, newScore: number) => void;
  onUseRecommended: () => void;
  onReset: () => void;
}

const ABILITIES: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

const RACIAL_BONUSES: Record<Race, Partial<AbilityScores>> = {
  Dwarf: { CON: 2 },
  Elf: { DEX: 2 },
  Halfling: { DEX: 2 },
  Human: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
  Dragonborn: { STR: 2, CHA: 1 },
  Gnome: { INT: 2 },
  Tiefling: { CHA: 2, INT: 1 },
  Aasimar: { CHA: 2, WIS: 1 },
  Goliath: { STR: 2, CON: 1 },
  Orc: { STR: 2, CON: 1 },
  'Half-Elf': { CHA: 2 },
  'Half-Orc': { STR: 2, CON: 1 },
};

const ABILITY_DESCRIPTIONS: Record<AbilityName, string> = {
  STR: 'Physical power for melee attacks and carrying',
  DEX: 'Agility for ranged attacks and defense',
  CON: 'Health, stamina, and concentration',
  INT: 'Knowledge, logic, and arcane magic',
  WIS: 'Perception, insight, and divine magic',
  CHA: 'Personality, influence, and innate magic',
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function AbilityScorePanel({
  abilityScores,
  race,
  characterClass,
  onScoreChange,
  onUseRecommended,
  onReset,
}: AbilityScorePanelProps) {
  const calculatePointsUsed = (scores: AbilityScores): number => {
    return ABILITIES.reduce((total, ability) => {
      return total + (POINT_BUY_COSTS[scores[ability]] || 0);
    }, 0);
  };

  const pointsUsed = calculatePointsUsed(abilityScores);
  const pointsRemaining = POINT_BUY_TOTAL - pointsUsed;

  const canIncrease = (ability: AbilityName): boolean => {
    const currentScore = abilityScores[ability];
    if (currentScore >= ABILITY_SCORE_MAX) return false;

    const costDiff = (POINT_BUY_COSTS[currentScore + 1] || 0) - (POINT_BUY_COSTS[currentScore] || 0);
    return pointsRemaining >= costDiff;
  };

  const canDecrease = (ability: AbilityName): boolean => {
    return abilityScores[ability] > ABILITY_SCORE_MIN;
  };

  const handleIncrement = (ability: AbilityName) => {
    if (canIncrease(ability)) {
      onScoreChange(ability, abilityScores[ability] + 1);
    }
  };

  const handleDecrement = (ability: AbilityName) => {
    if (canDecrease(ability)) {
      onScoreChange(ability, abilityScores[ability] - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-nuaibria-gold mb-2 tracking-wider">
          Ability Scores
        </h3>
        <p className="text-nuaibria-text-secondary text-sm">
          Distribute {POINT_BUY_TOTAL} points across your abilities (8-15 range)
        </p>
      </div>

      <div className="flex justify-between items-center bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4">
        <div>
          <div className="text-sm text-nuaibria-text-secondary">Points Remaining</div>
          <div
            className={`font-mono text-4xl font-bold ${
              pointsRemaining < 0
                ? 'text-nuaibria-danger'
                : pointsRemaining === 0
                ? 'text-nuaibria-success'
                : 'text-nuaibria-gold'
            }`}
          >
            {pointsRemaining}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUseRecommended}
            className="px-4 py-2 bg-nuaibria-gold/20 text-nuaibria-gold border-2 border-nuaibria-gold/50 rounded-lg hover:bg-nuaibria-gold/30 hover:border-nuaibria-gold transition-all text-sm font-semibold"
          >
            Recommended Build
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-nuaibria-border/20 text-nuaibria-text-secondary border-2 border-nuaibria-border rounded-lg hover:bg-nuaibria-border/30 hover:text-nuaibria-text-primary transition-all text-sm font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ABILITIES.map((ability) => {
          const baseScore = abilityScores[ability];
          const racialBonus = RACIAL_BONUSES[race]?.[ability] || 0;
          const finalScore = baseScore + racialBonus;
          const modifier = Math.floor((finalScore - 10) / 2);

          return (
            <div
              key={ability}
              className="flex items-center justify-between bg-nuaibria-elevated/50 rounded-lg p-4 border border-nuaibria-border hover:border-nuaibria-gold/30 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-lg text-nuaibria-text-secondary font-semibold">
                    {ability}
                  </span>
                  <span className="text-xs text-nuaibria-text-muted" title={ABILITY_DESCRIPTIONS[ability]}>
                    ?
                  </span>
                </div>
                {racialBonus > 0 && (
                  <div className="text-xs text-nuaibria-ember">
                    +{racialBonus} racial bonus
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement(ability)}
                  disabled={!canDecrease(ability)}
                  className="p-2 rounded-full border-2 border-nuaibria-gold/30 text-nuaibria-gold transition-all hover:enabled:bg-nuaibria-gold/20 hover:enabled:border-nuaibria-gold disabled:text-nuaibria-text-muted disabled:border-nuaibria-border disabled:cursor-not-allowed"
                >
                  <MinusIcon />
                </button>

                <div className="text-center">
                  <div className="font-mono text-2xl font-bold text-nuaibria-gold">
                    {baseScore}
                  </div>
                  {racialBonus > 0 && (
                    <div className="text-sm text-nuaibria-health">
                      {finalScore} ({modifier >= 0 ? '+' : ''}{modifier})
                    </div>
                  )}
                  {racialBonus === 0 && (
                    <div className="text-xs text-nuaibria-text-muted">
                      ({modifier >= 0 ? '+' : ''}{modifier})
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleIncrement(ability)}
                  disabled={!canIncrease(ability)}
                  className="p-2 rounded-full border-2 border-nuaibria-gold/30 text-nuaibria-gold transition-all hover:enabled:bg-nuaibria-gold/20 hover:enabled:border-nuaibria-gold disabled:text-nuaibria-text-muted disabled:border-nuaibria-border disabled:cursor-not-allowed"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
