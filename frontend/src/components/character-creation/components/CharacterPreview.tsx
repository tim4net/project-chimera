/**
 * @fileoverview CharacterPreview - Real-time character preview sidebar
 * Displays character information as the user progresses through creation wizard
 * Features: Sticky positioning, responsive layout, calculated stats, visual indicators
 */

import React, { useMemo } from 'react';
import type { CharacterDraft, Race, CharacterClass, Alignment, SkillName } from '../../../types/wizard';
import type { AbilityScores } from '../../../types';

/**
 * Props for CharacterPreview component
 */
interface CharacterPreviewProps {
  draft: Partial<CharacterDraft>;
  className?: string;
}

/**
 * Racial ability bonuses (D&D 5e SRD)
 */
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

/**
 * Hit dice by class (D&D 5e)
 */
const CLASS_HIT_DICE: Record<CharacterClass, number> = {
  Barbarian: 12,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Fighter: 10,
  Monk: 8,
  Paladin: 10,
  Ranger: 10,
  Rogue: 8,
  Sorcerer: 6,
  Warlock: 8,
  Wizard: 6,
};

/**
 * Base armor class by class (unarmored)
 */
const BASE_AC: Record<CharacterClass, number> = {
  Barbarian: 10, // + DEX + CON (if unarmored)
  Monk: 10, // + DEX + WIS (if unarmored)
  Bard: 11, // Light armor (leather)
  Cleric: 16, // Chain mail
  Druid: 11, // Light armor (leather)
  Fighter: 16, // Chain mail
  Paladin: 16, // Chain mail
  Ranger: 13, // Scale mail
  Rogue: 11, // Light armor (leather)
  Sorcerer: 10, // Unarmored
  Warlock: 11, // Light armor (leather)
  Wizard: 10, // Unarmored
};

/**
 * Base speed by race (feet)
 */
const RACIAL_SPEED: Record<Race, number> = {
  Dwarf: 25,
  Elf: 30,
  Halfling: 25,
  Human: 30,
  Dragonborn: 30,
  Gnome: 25,
  Tiefling: 30,
  Aasimar: 30,
  Goliath: 30,
  Orc: 30,
  'Half-Elf': 30,
  'Half-Orc': 30,
};

/**
 * Alignment color indicators
 */
const ALIGNMENT_COLORS: Record<Alignment, string> = {
  'Lawful Good': 'text-blue-400',
  'Neutral Good': 'text-green-400',
  'Chaotic Good': 'text-cyan-400',
  'Lawful Neutral': 'text-gray-400',
  'True Neutral': 'text-yellow-400',
  'Chaotic Neutral': 'text-orange-400',
  'Lawful Evil': 'text-red-600',
  'Neutral Evil': 'text-purple-600',
  'Chaotic Evil': 'text-red-800',
};

/**
 * Race icons (Unicode symbols)
 */
const RACE_ICONS: Record<Race, string> = {
  Aasimar: '✨',
  Dragonborn: '🐉',
  Dwarf: '⚒️',
  Elf: '🏹',
  Gnome: '🔧',
  Goliath: '⛰️',
  Halfling: '🌿',
  Human: '👤',
  Orc: '⚔️',
  Tiefling: '😈',
  'Half-Elf': '🌙',
  'Half-Orc': '💪',
};

/**
 * Class icons (Unicode symbols)
 */
const CLASS_ICONS: Record<CharacterClass, string> = {
  Barbarian: '⚡',
  Bard: '🎵',
  Cleric: '✝️',
  Druid: '🍃',
  Fighter: '🗡️',
  Monk: '👊',
  Paladin: '🛡️',
  Ranger: '🏹',
  Rogue: '🗝️',
  Sorcerer: '🔮',
  Warlock: '👁️',
  Wizard: '📚',
};

/**
 * Calculate ability modifier from score
 */
const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * CharacterPreview Component
 * Displays real-time preview of character during creation
 */
export const CharacterPreview: React.FC<CharacterPreviewProps> = React.memo(({ draft, className = '' }) => {
  // Calculate final ability scores with racial bonuses
  const finalAbilityScores = useMemo(() => {
    if (!draft.abilityScores || !draft.race) return null;

    const bonuses = RACIAL_BONUSES[draft.race] || {};
    const final: AbilityScores = { ...draft.abilityScores };

    (Object.keys(bonuses) as Array<keyof AbilityScores>).forEach(ability => {
      final[ability] = (final[ability] || 0) + (bonuses[ability] || 0);
    });

    return final;
  }, [draft.abilityScores, draft.race]);

  // Calculate HP (Level 1: max hit die + CON modifier)
  const maxHP = useMemo(() => {
    if (!draft.class || !finalAbilityScores) return null;
    const hitDie = CLASS_HIT_DICE[draft.class];
    const conModifier = calculateModifier(finalAbilityScores.CON);
    return hitDie + conModifier;
  }, [draft.class, finalAbilityScores]);

  // Calculate AC
  const armorClass = useMemo(() => {
    if (!draft.class || !finalAbilityScores) return null;
    const baseAC = BASE_AC[draft.class];
    const dexModifier = calculateModifier(finalAbilityScores.DEX);

    // Special cases for unarmored classes
    if (draft.class === 'Barbarian') {
      const conModifier = calculateModifier(finalAbilityScores.CON);
      return 10 + dexModifier + conModifier;
    }
    if (draft.class === 'Monk') {
      const wisModifier = calculateModifier(finalAbilityScores.WIS);
      return 10 + dexModifier + wisModifier;
    }

    // For armored classes, add DEX modifier (max +2 for medium armor)
    if (baseAC >= 13) {
      return baseAC + Math.min(dexModifier, 2);
    }

    return baseAC + dexModifier;
  }, [draft.class, finalAbilityScores]);

  // Get speed
  const speed = useMemo(() => {
    if (!draft.race) return null;
    return RACIAL_SPEED[draft.race];
  }, [draft.race]);

  return (
    <aside className={`bg-nuaibria-surface border-2 border-nuaibria-gold/20 rounded-lg p-6 shadow-card-hover sticky top-8 ${className}`}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-nuaibria-gold/20">
        <h2 className="font-display text-2xl text-nuaibria-gold tracking-wider mb-2">
          Character Preview
        </h2>
        <p className="text-nuaibria-text-secondary text-sm">
          Live updates as you build
        </p>
      </div>

      {/* Portrait */}
      {draft.avatarUrl && (
        <div className="mb-6">
          <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-nuaibria-gold/30">
            <img
              src={draft.avatarUrl}
              alt={draft.name || 'Character portrait'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Character Name */}
      <div className="mb-6">
        <h3 className="font-display text-3xl text-nuaibria-gold tracking-wider text-center">
          {draft.name || 'Unnamed Hero'}
        </h3>
      </div>

      {/* Race, Class, Level */}
      {(draft.race || draft.class) && (
        <div className="mb-6 text-center space-y-2">
          {draft.race && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{RACE_ICONS[draft.race]}</span>
              <span className="text-nuaibria-text-primary font-semibold">
                {draft.race}
              </span>
            </div>
          )}
          {draft.class && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{CLASS_ICONS[draft.class]}</span>
              <span className="text-nuaibria-text-primary font-semibold">
                {draft.class}
              </span>
            </div>
          )}
          <div className="text-nuaibria-text-secondary text-sm">
            Level 1
          </div>
        </div>
      )}

      {/* Alignment & Background */}
      {(draft.alignment || draft.background) && (
        <div className="mb-6 space-y-2 text-center">
          {draft.alignment && (
            <div className={`${ALIGNMENT_COLORS[draft.alignment]} font-semibold text-sm`}>
              {draft.alignment}
            </div>
          )}
          {draft.background && (
            <div className="text-nuaibria-text-secondary text-sm">
              {draft.background}
            </div>
          )}
        </div>
      )}

      {/* Core Stats */}
      {(maxHP || armorClass || speed) && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {maxHP && (
            <div className="bg-nuaibria-bg/50 rounded-lg p-3 border border-nuaibria-border text-center">
              <div className="text-nuaibria-health font-mono text-2xl font-bold">
                {maxHP}
              </div>
              <div className="text-nuaibria-text-muted text-xs uppercase tracking-wider mt-1">
                HP
              </div>
            </div>
          )}
          {armorClass && (
            <div className="bg-nuaibria-bg/50 rounded-lg p-3 border border-nuaibria-border text-center">
              <div className="text-nuaibria-gold font-mono text-2xl font-bold">
                {armorClass}
              </div>
              <div className="text-nuaibria-text-muted text-xs uppercase tracking-wider mt-1">
                AC
              </div>
            </div>
          )}
          {speed && (
            <div className="bg-nuaibria-bg/50 rounded-lg p-3 border border-nuaibria-border text-center">
              <div className="text-nuaibria-ember font-mono text-2xl font-bold">
                {speed}
              </div>
              <div className="text-nuaibria-text-muted text-xs uppercase tracking-wider mt-1">
                Speed
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ability Scores */}
      {finalAbilityScores && (
        <div className="mb-6">
          <h4 className="text-nuaibria-text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Ability Scores
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(finalAbilityScores) as [keyof AbilityScores, number][]).map(([ability, score]) => {
              const modifier = calculateModifier(score);
              const hasBonus = draft.race && RACIAL_BONUSES[draft.race]?.[ability];

              return (
                <div
                  key={ability}
                  className="bg-nuaibria-elevated/50 rounded-md p-2 border border-nuaibria-border text-center"
                >
                  <div className="text-nuaibria-text-secondary text-xs font-semibold mb-1">
                    {ability}
                  </div>
                  <div className={`font-mono text-lg font-bold ${hasBonus ? 'text-nuaibria-gold' : 'text-nuaibria-text-primary'}`}>
                    {score}
                  </div>
                  <div className="text-nuaibria-text-muted text-xs">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills */}
      {draft.proficientSkills && draft.proficientSkills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-nuaibria-text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Proficient Skills ({draft.proficientSkills.length})
          </h4>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {draft.proficientSkills.map((skill: SkillName) => (
              <div
                key={skill}
                className="text-nuaibria-text-primary text-sm bg-nuaibria-bg/30 rounded px-2 py-1"
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {draft.equipment && draft.equipment.length > 0 && (
        <div>
          <h4 className="text-nuaibria-text-secondary font-semibold text-sm uppercase tracking-wider mb-3">
            Equipment ({draft.equipment.length})
          </h4>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {draft.equipment.map((item: string, idx: number) => (
              <div
                key={idx}
                className="text-nuaibria-text-primary text-sm bg-nuaibria-bg/30 rounded px-2 py-1"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!draft.name && !draft.race && !draft.class && (
        <div className="text-center py-8">
          <div className="text-nuaibria-text-muted text-sm">
            Start creating your character to see preview
          </div>
        </div>
      )}
    </aside>
  );
});

CharacterPreview.displayName = 'CharacterPreview';

export default CharacterPreview;
