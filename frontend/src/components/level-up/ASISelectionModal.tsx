/**
 * @file ASI Selection Modal - Ability Score Improvement
 *
 * Appears at levels 4, 8, 12, 16, 19 (and Fighter 6, 14, Rogue 10)
 * Allows players to improve ability scores or choose a feat (coming soon).
 */

import { useState, useEffect, useMemo } from 'react';
import type { AbilityScores } from '../../types';

interface ASISelectionModalProps {
  show: boolean;
  characterId: string;
  level: number;
  currentAbilityScores: AbilityScores;
  onComplete: () => void;
  onClose: () => void;
}

type AbilityKey = keyof AbilityScores;
type SelectionType = 'plus-two' | 'plus-one-one' | 'feat';

const ABILITY_LABELS: Record<AbilityKey, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

const ABILITY_DESCRIPTIONS: Record<AbilityKey, string> = {
  STR: 'Melee attacks, carrying capacity, Athletics',
  DEX: 'Ranged attacks, AC (light armor), Initiative, Acrobatics',
  CON: 'Hit points, Constitution saves, endurance',
  INT: 'Investigation, Arcana, History, wizard spells',
  WIS: 'Perception, Insight, Survival, cleric/druid spells',
  CHA: 'Persuasion, Deception, Performance, sorcerer/warlock spells',
};

const ASISelectionModal = ({
  show,
  characterId,
  level,
  currentAbilityScores,
  onComplete,
  onClose,
}: ASISelectionModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType>('plus-two');
  const [selectedAbility1, setSelectedAbility1] = useState<AbilityKey | ''>('');
  const [selectedAbility2, setSelectedAbility2] = useState<AbilityKey | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setError(null);
    } else {
      setIsAnimating(false);
      setSelectedAbility1('');
      setSelectedAbility2('');
      setSelectionType('plus-two');
    }
  }, [show]);

  // Calculate modifiers
  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  // Preview new ability scores based on current selection
  const newAbilityScores = useMemo((): AbilityScores => {
    const preview = { ...currentAbilityScores };

    if (selectionType === 'plus-two' && selectedAbility1) {
      preview[selectedAbility1] = Math.min(20, preview[selectedAbility1] + 2);
    } else if (selectionType === 'plus-one-one' && selectedAbility1 && selectedAbility2) {
      preview[selectedAbility1] = Math.min(20, preview[selectedAbility1] + 1);
      preview[selectedAbility2] = Math.min(20, preview[selectedAbility2] + 1);
    }

    return preview;
  }, [currentAbilityScores, selectionType, selectedAbility1, selectedAbility2]);

  // Validation
  const isValidSelection = useMemo((): boolean => {
    if (selectionType === 'feat') return false; // Feats not implemented yet

    if (selectionType === 'plus-two') {
      return selectedAbility1 !== '';
    }

    if (selectionType === 'plus-one-one') {
      return (
        selectedAbility1 !== '' &&
        selectedAbility2 !== '' &&
        selectedAbility1 !== selectedAbility2
      );
    }

    return false;
  }, [selectionType, selectedAbility1, selectedAbility2]);

  // Get available abilities (not at max 20)
  const availableAbilities = useMemo((): AbilityKey[] => {
    return (Object.keys(currentAbilityScores) as AbilityKey[]).filter(
      (key) => currentAbilityScores[key] < 20
    );
  }, [currentAbilityScores]);

  // Get available abilities for second selection (excluding first)
  const availableAbilities2 = useMemo((): AbilityKey[] => {
    return availableAbilities.filter((key) => key !== selectedAbility1);
  }, [availableAbilities, selectedAbility1]);

  const handleConfirm = async () => {
    if (!isValidSelection) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${characterId}/asi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectionType,
          ability1: selectedAbility1,
          ability2: selectionType === 'plus-one-one' ? selectedAbility2 : null,
          level,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply ASI');
      }

      // Success!
      onComplete();
    } catch (err) {
      console.error('ASI selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply ability score improvement');
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`bg-gradient-to-br from-nuaibria-surface via-nuaibria-elevated to-nuaibria-surface border-4 border-nuaibria-gold rounded-xl p-8 max-w-3xl w-full shadow-2xl transform transition-all duration-500 max-h-[90vh] overflow-y-auto ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-3xl font-display font-bold text-nuaibria-gold drop-shadow-glow mb-2">
            Ability Score Improvement
          </h2>
          <p className="text-nuaibria-text-secondary">
            Level {level} - Choose how to improve your character
          </p>
        </div>

        {/* Selection Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: +2 to one ability */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectionType === 'plus-two'
                ? 'border-nuaibria-gold bg-nuaibria-gold/10'
                : 'border-nuaibria-border hover:border-nuaibria-gold/50 bg-nuaibria-surface/30'
            }`}
            onClick={() => setSelectionType('plus-two')}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selectionType === 'plus-two'}
                onChange={() => setSelectionType('plus-two')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-bold text-nuaibria-gold mb-2">+2 to One Ability</div>
                {selectionType === 'plus-two' && (
                  <select
                    value={selectedAbility1}
                    onChange={(e) => setSelectedAbility1(e.target.value as AbilityKey)}
                    className="w-full bg-nuaibria-elevated border border-nuaibria-border rounded px-3 py-2 text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold"
                    disabled={availableAbilities.length === 0}
                  >
                    <option value="">Select an ability...</option>
                    {availableAbilities.map((key) => (
                      <option key={key} value={key}>
                        {ABILITY_LABELS[key]} (Current: {currentAbilityScores[key]})
                      </option>
                    ))}
                  </select>
                )}
                {selectionType === 'plus-two' && availableAbilities.length === 0 && (
                  <p className="text-nuaibria-danger text-sm">All abilities are at maximum (20)</p>
                )}
              </div>
            </div>
          </div>

          {/* Option 2: +1 to two abilities */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectionType === 'plus-one-one'
                ? 'border-nuaibria-gold bg-nuaibria-gold/10'
                : 'border-nuaibria-border hover:border-nuaibria-gold/50 bg-nuaibria-surface/30'
            }`}
            onClick={() => setSelectionType('plus-one-one')}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selectionType === 'plus-one-one'}
                onChange={() => setSelectionType('plus-one-one')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-bold text-nuaibria-gold mb-2">+1 to Two Abilities</div>
                {selectionType === 'plus-one-one' && (
                  <div className="space-y-3">
                    <select
                      value={selectedAbility1}
                      onChange={(e) => setSelectedAbility1(e.target.value as AbilityKey)}
                      className="w-full bg-nuaibria-elevated border border-nuaibria-border rounded px-3 py-2 text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold"
                      disabled={availableAbilities.length === 0}
                    >
                      <option value="">Select first ability...</option>
                      {availableAbilities.map((key) => (
                        <option key={key} value={key}>
                          {ABILITY_LABELS[key]} (Current: {currentAbilityScores[key]})
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedAbility2}
                      onChange={(e) => setSelectedAbility2(e.target.value as AbilityKey)}
                      className="w-full bg-nuaibria-elevated border border-nuaibria-border rounded px-3 py-2 text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold"
                      disabled={!selectedAbility1 || availableAbilities2.length === 0}
                    >
                      <option value="">Select second ability...</option>
                      {availableAbilities2.map((key) => (
                        <option key={key} value={key}>
                          {ABILITY_LABELS[key]} (Current: {currentAbilityScores[key]})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectionType === 'plus-one-one' && availableAbilities.length < 2 && (
                  <p className="text-nuaibria-danger text-sm">
                    Need at least 2 abilities below 20
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Option 3: Feat (coming soon) */}
          <div
            className="border-2 rounded-lg p-4 opacity-50 cursor-not-allowed bg-nuaibria-surface/20 border-nuaibria-border"
          >
            <div className="flex items-start gap-3">
              <input type="radio" disabled className="mt-1" />
              <div className="flex-1">
                <div className="font-bold text-nuaibria-text-muted mb-1">Choose a Feat</div>
                <p className="text-sm text-nuaibria-text-muted italic">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {isValidSelection && (
          <div className="bg-nuaibria-elevated/50 border-2 border-nuaibria-arcane/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-nuaibria-arcane mb-3">Preview Changes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(currentAbilityScores) as AbilityKey[]).map((key) => {
                const current = currentAbilityScores[key];
                const newScore = newAbilityScores[key];
                const hasChanged = current !== newScore;
                const newMod = calculateModifier(newScore);

                return (
                  <div
                    key={key}
                    className={`bg-nuaibria-surface rounded-lg p-3 border ${
                      hasChanged
                        ? 'border-nuaibria-gold shadow-glow'
                        : 'border-nuaibria-border/30'
                    }`}
                  >
                    <div className="text-xs text-nuaibria-text-muted mb-1">
                      {ABILITY_LABELS[key]}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`text-2xl font-bold ${
                            hasChanged ? 'text-nuaibria-gold' : 'text-nuaibria-text-primary'
                          }`}
                        >
                          {newScore}
                        </span>
                        <span
                          className={`text-sm ml-2 ${
                            hasChanged ? 'text-nuaibria-gold' : 'text-nuaibria-text-muted'
                          }`}
                        >
                          ({newMod >= 0 ? '+' : ''}
                          {newMod})
                        </span>
                      </div>
                      {hasChanged && (
                        <div className="text-xs text-nuaibria-text-muted">
                          <div className="line-through">{current}</div>
                          <div className="text-nuaibria-gold">+{newScore - current}</div>
                        </div>
                      )}
                    </div>
                    {hasChanged && (
                      <div className="text-xs text-nuaibria-text-accent mt-1">
                        {ABILITY_DESCRIPTIONS[key]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-nuaibria-danger/20 border-2 border-nuaibria-danger rounded-lg p-3 mb-4">
            <p className="text-nuaibria-danger text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-nuaibria-surface border-2 border-nuaibria-border hover:border-nuaibria-gold text-nuaibria-text-primary font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValidSelection || isSubmitting}
            className="flex-1 bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
          >
            {isSubmitting ? 'Applying...' : 'Confirm Selection'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-center text-xs text-nuaibria-text-muted">
          <p>Ability scores cannot exceed 20.</p>
          <p className="mt-1">This choice is permanent and cannot be changed.</p>
        </div>
      </div>
    </div>
  );
};

export default ASISelectionModal;
