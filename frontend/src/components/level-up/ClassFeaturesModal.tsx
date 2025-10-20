/**
 * @file ClassFeaturesModal - Class and subclass features summary
 *
 * Final step in level-up workflow. Displays all new features gained at this level,
 * including class features, subclass features, spell slot progression, and other
 * improvements. This is a read-only summary with a completion button.
 */

import { useState } from 'react';

// Icons
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Types
interface ClassFeature {
  name: string;
  description: string;
  level?: number;
}

interface SubclassFeature {
  name: string;
  description: string;
  level: number;
}

interface SpellSlotsByLevel {
  [level: number]: number;
}

interface ClassFeaturesModalProps {
  show: boolean;
  newLevel: number;
  className: string;
  subclassName?: string;
  classFeatures: ClassFeature[];
  subclassFeatures: SubclassFeature[];
  spellSlots?: SpellSlotsByLevel;
  cantripsDamageIncrease?: boolean;
  onComplete: () => void;
}

const ClassFeaturesModal = ({
  show,
  newLevel,
  className,
  subclassName,
  classFeatures,
  subclassFeatures,
  spellSlots,
  cantripsDamageIncrease,
  onComplete,
}: ClassFeaturesModalProps) => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  if (!show) return null;

  const hasFeatures = classFeatures.length > 0 || subclassFeatures.length > 0;
  const hasSpellSlots = spellSlots && Object.keys(spellSlots).length > 0;

  // Toggle feature expansion
  const toggleFeature = (featureName: string) => {
    setExpandedFeature(expandedFeature === featureName ? null : featureName);
  };

  // Get ordinal suffix for spell level
  const getSpellLevelLabel = (level: number): string => {
    if (level === 1) return '1st';
    if (level === 2) return '2nd';
    if (level === 3) return '3rd';
    return `${level}th`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-nuaibria-surface via-nuaibria-bg to-nuaibria-surface border-4 border-nuaibria-gold rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-nuaibria-gold/20 to-nuaibria-arcane/20 border-b-2 border-nuaibria-gold/30 p-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon />
            <h2 className="font-display text-3xl text-nuaibria-gold drop-shadow-glow text-center">
              Level {newLevel} Features
            </h2>
            <SparklesIcon />
          </div>
          <p className="text-nuaibria-text-secondary text-center text-sm">
            Your {className}{subclassName ? ` (${subclassName})` : ''} grows in power
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6 space-y-6 custom-scrollbar">
          {/* Class Features */}
          {classFeatures.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookIcon />
                <h3 className="font-display text-xl text-nuaibria-gold">
                  Class Features
                </h3>
              </div>
              <div className="space-y-3">
                {classFeatures.map((feature, idx) => {
                  const isExpanded = expandedFeature === `class-${feature.name}`;
                  const isLong = feature.description.length > 150;

                  return (
                    <div
                      key={idx}
                      className="bg-nuaibria-elevated border-2 border-nuaibria-gold/30 rounded-lg p-4 hover:border-nuaibria-gold/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-lg text-nuaibria-gold">
                          {feature.name}
                        </h4>
                        {isLong && (
                          <button
                            onClick={() => toggleFeature(`class-${feature.name}`)}
                            className="text-nuaibria-gold hover:text-nuaibria-gold/80 text-xs font-semibold transition-colors ml-4"
                          >
                            {isExpanded ? 'Less' : 'More'}
                          </button>
                        )}
                      </div>
                      <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                        {isExpanded || !isLong
                          ? feature.description
                          : `${feature.description.substring(0, 150)}...`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subclass Features */}
          {subclassFeatures.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ZapIcon />
                <h3 className="font-display text-xl text-nuaibria-arcane">
                  {subclassName} Features
                </h3>
              </div>
              <div className="space-y-3">
                {subclassFeatures.map((feature, idx) => {
                  const isExpanded = expandedFeature === `subclass-${feature.name}`;
                  const isLong = feature.description.length > 150;

                  return (
                    <div
                      key={idx}
                      className="bg-nuaibria-elevated border-2 border-nuaibria-arcane/30 rounded-lg p-4 hover:border-nuaibria-arcane/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-lg text-nuaibria-arcane">
                          {feature.name}
                        </h4>
                        {isLong && (
                          <button
                            onClick={() => toggleFeature(`subclass-${feature.name}`)}
                            className="text-nuaibria-arcane hover:text-nuaibria-arcane/80 text-xs font-semibold transition-colors ml-4"
                          >
                            {isExpanded ? 'Less' : 'More'}
                          </button>
                        )}
                      </div>
                      <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                        {isExpanded || !isLong
                          ? feature.description
                          : `${feature.description.substring(0, 150)}...`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spell Slots */}
          {hasSpellSlots && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookIcon />
                <h3 className="font-display text-xl text-nuaibria-arcane">
                  New Spell Slots
                </h3>
              </div>
              <div className="bg-nuaibria-elevated border-2 border-nuaibria-arcane/30 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(spellSlots || {}).map(([level, slots]) => (
                    <div
                      key={level}
                      className="bg-nuaibria-bg/50 rounded-lg p-3 text-center"
                    >
                      <div className="text-nuaibria-text-muted text-xs mb-1">
                        {getSpellLevelLabel(parseInt(level))} Level
                      </div>
                      <div className="text-nuaibria-arcane font-bold text-lg">
                        {slots} {slots === 1 ? 'slot' : 'slots'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cantrip Damage Increase */}
          {cantripsDamageIncrease && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ZapIcon />
                <h3 className="font-display text-xl text-nuaibria-ember">
                  Cantrip Power Increase
                </h3>
              </div>
              <div className="bg-nuaibria-elevated border-2 border-nuaibria-ember/30 rounded-lg p-4">
                <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
                  Your cantrips grow more powerful! Offensive cantrips now deal additional damage dice.
                  Check your spell descriptions for updated damage values.
                </p>
              </div>
            </div>
          )}

          {/* No features message */}
          {!hasFeatures && !hasSpellSlots && !cantripsDamageIncrease && (
            <div className="text-center py-12 text-nuaibria-text-muted">
              <p className="mb-2">No new class features at this level.</p>
              <p className="text-sm">Your HP and proficiency bonus have already been increased.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-nuaibria-gold/30 p-4 bg-nuaibria-surface/50">
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-nuaibria-gold to-nuaibria-ember hover:from-nuaibria-gold/90 hover:to-nuaibria-ember/90 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-glow"
          >
            Complete Level Up
          </button>
          <p className="text-center text-nuaibria-text-muted text-xs mt-3">
            Your character sheet has been updated with all improvements
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassFeaturesModal;
