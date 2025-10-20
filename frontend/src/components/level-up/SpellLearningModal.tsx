/**
 * @file SpellLearningModal - Comprehensive spell learning UI for spellcaster leveling
 *
 * This modal appears when spellcasters level up and need to learn new spells.
 * Features search, filtering by level/school, spell details on hover, and optional
 * spell replacement for Bard/Sorcerer classes.
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Types
interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialComponents?: string;
}

interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: SpellComponents;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels?: string;
  damageType?: string;
  classes: string[];
}

interface SpellLearningModalProps {
  show: boolean;
  characterId: string;
  characterClass: string;
  currentLevel: number;
  spellsKnown: string[];
  cantripsKnown: string[];
  spellsToLearn: number;
  cantripsToLearn?: number;
  maxSpellLevel: number;
  canReplaceSpell: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const MAGIC_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
] as const;

// Get color for spell level
const getSpellLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    0: 'text-nuaibria-mana border-nuaibria-mana/30 bg-nuaibria-mana/10',
    1: 'text-green-400 border-green-400/30 bg-green-400/10',
    2: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    3: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    4: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    5: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    6: 'text-red-400 border-red-400/30 bg-red-400/10',
    7: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
    8: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
    9: 'text-nuaibria-gold border-nuaibria-gold/30 bg-nuaibria-gold/10',
  };
  return colors[level] || 'text-nuaibria-text-primary border-nuaibria-border bg-nuaibria-border/10';
};

const SpellLearningModal = ({
  show,
  characterId,
  characterClass,
  currentLevel,
  spellsKnown,
  cantripsKnown,
  spellsToLearn,
  cantripsToLearn = 0,
  maxSpellLevel,
  canReplaceSpell,
  onComplete,
  onClose,
}: SpellLearningModalProps) => {
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [spellToReplace, setSpellToReplace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [hoveredSpell, setHoveredSpell] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available spells from backend
  useEffect(() => {
    const fetchSpells = async () => {
      if (!show) return;

      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `/api/spells?class=${encodeURIComponent(characterClass)}&maxLevel=${maxSpellLevel}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch spells');
        }

        const data = await response.json();
        setAvailableSpells(data.spells || []);
      } catch (err) {
        console.error('[SpellLearningModal] Error fetching spells:', err);
        setError(err instanceof Error ? err.message : 'Failed to load spells');
      } finally {
        setLoading(false);
      }
    };

    fetchSpells();
  }, [show, characterClass, maxSpellLevel]);

  // Separate cantrips and leveled spells
  const { cantrips, leveledSpells } = useMemo(() => {
    return {
      cantrips: availableSpells.filter(s => s.level === 0),
      leveledSpells: availableSpells.filter(s => s.level > 0),
    };
  }, [availableSpells]);

  // Apply filters to leveled spells
  const filteredSpells = useMemo(() => {
    let spells = leveledSpells;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      spells = spells.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    if (levelFilter !== null) {
      spells = spells.filter(s => s.level === levelFilter);
    }

    if (schoolFilter) {
      spells = spells.filter(s => s.school === schoolFilter);
    }

    return spells.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  }, [leveledSpells, searchQuery, levelFilter, schoolFilter]);

  // Apply filters to cantrips
  const filteredCantrips = useMemo(() => {
    let spells = cantrips;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      spells = spells.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    if (schoolFilter) {
      spells = spells.filter(s => s.school === schoolFilter);
    }

    return spells.sort((a, b) => a.name.localeCompare(b.name));
  }, [cantrips, searchQuery, schoolFilter]);

  // Check if spell is already known
  const isSpellKnown = (spellName: string, isCantrip: boolean): boolean => {
    return isCantrip
      ? cantripsKnown.includes(spellName)
      : spellsKnown.includes(spellName);
  };

  // Toggle spell selection
  const toggleSpellSelection = (spellName: string, isCantrip: boolean) => {
    if (isCantrip) {
      setSelectedCantrips(prev =>
        prev.includes(spellName)
          ? prev.filter(s => s !== spellName)
          : prev.length < cantripsToLearn
          ? [...prev, spellName]
          : prev
      );
    } else {
      setSelectedSpells(prev =>
        prev.includes(spellName)
          ? prev.filter(s => s !== spellName)
          : prev.length < spellsToLearn
          ? [...prev, spellName]
          : prev
      );
    }
  };

  // Validation
  const isValid = useMemo(() => {
    const hasCorrectCantrips = cantripsToLearn === 0 || selectedCantrips.length === cantripsToLearn;
    const hasCorrectSpells = selectedSpells.length === spellsToLearn;
    return hasCorrectCantrips && hasCorrectSpells;
  }, [selectedSpells, selectedCantrips, spellsToLearn, cantripsToLearn]);

  // Submit spell selection
  const handleConfirm = async () => {
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/characters/${characterId}/learn-spells`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          spells: selectedSpells,
          cantrips: selectedCantrips,
          replaceSpell: spellToReplace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to learn spells');
      }

      onComplete();
    } catch (err) {
      console.error('[SpellLearningModal] Error learning spells:', err);
      setError(err instanceof Error ? err.message : 'Failed to learn spells');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-nuaibria-surface via-nuaibria-bg to-nuaibria-surface border-4 border-nuaibria-arcane rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-nuaibria-arcane/20 to-nuaibria-mana/20 border-b-2 border-nuaibria-arcane/30 p-6">
          <h2 className="font-display text-3xl text-nuaibria-arcane drop-shadow-glow mb-2 text-center">
            Learn New Spells
          </h2>
          <p className="text-nuaibria-text-secondary text-center text-sm">
            Level {currentLevel} {characterClass}
          </p>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            {cantripsToLearn > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-nuaibria-text-muted">Cantrips:</span>
                <span className={`font-bold ${selectedCantrips.length === cantripsToLearn ? 'text-green-400' : 'text-nuaibria-mana'}`}>
                  {selectedCantrips.length} / {cantripsToLearn}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-nuaibria-text-muted">Spells:</span>
              <span className={`font-bold ${selectedSpells.length === spellsToLearn ? 'text-green-400' : 'text-nuaibria-arcane'}`}>
                {selectedSpells.length} / {spellsToLearn}
              </span>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 bg-nuaibria-ember/20 border-2 border-nuaibria-ember rounded-lg p-4">
            <p className="text-nuaibria-ember font-semibold">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="p-6 border-b border-nuaibria-border space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search spells by name or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-nuaibria-elevated border border-nuaibria-border rounded-lg pl-10 pr-4 py-2 text-nuaibria-text-primary placeholder-nuaibria-text-muted focus:outline-none focus:border-nuaibria-arcane transition-colors"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-nuaibria-text-muted">
              <SearchIcon />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Level filter */}
            <div className="flex gap-1">
              <button
                onClick={() => setLevelFilter(null)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  levelFilter === null
                    ? 'bg-nuaibria-arcane text-white'
                    : 'bg-nuaibria-elevated text-nuaibria-text-secondary hover:bg-nuaibria-surface'
                }`}
              >
                All
              </button>
              {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(level => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    levelFilter === level
                      ? 'bg-nuaibria-arcane text-white'
                      : 'bg-nuaibria-elevated text-nuaibria-text-secondary hover:bg-nuaibria-surface'
                  }`}
                >
                  Lvl {level}
                </button>
              ))}
            </div>

            {/* School filter */}
            <div className="flex-1" />
            <select
              value={schoolFilter || ''}
              onChange={e => setSchoolFilter(e.target.value || null)}
              className="px-3 py-1 rounded text-xs font-semibold bg-nuaibria-elevated border border-nuaibria-border text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-arcane"
            >
              <option value="">All Schools</option>
              {MAGIC_SCHOOLS.map(school => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Spell replacement option */}
        {canReplaceSpell && spellsKnown.length > 0 && (
          <div className="px-6 py-4 bg-nuaibria-elevated/50 border-b border-nuaibria-border">
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={spellToReplace !== null}
                onChange={e => setSpellToReplace(e.target.checked ? '' : null)}
                className="rounded border-nuaibria-border"
              />
              <span className="text-nuaibria-text-secondary">
                Replace one known spell (optional for {characterClass})
              </span>
            </label>
            {spellToReplace !== null && (
              <select
                value={spellToReplace}
                onChange={e => setSpellToReplace(e.target.value)}
                className="w-full px-3 py-2 rounded bg-nuaibria-surface border border-nuaibria-border text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-arcane"
              >
                <option value="">Select spell to replace...</option>
                {spellsKnown.map(spell => (
                  <option key={spell} value={spell}>
                    {spell}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Spell List */}
        <div className="overflow-y-auto max-h-[calc(90vh-450px)] custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner className="w-8 h-8 text-nuaibria-arcane" />
              <span className="ml-3 text-nuaibria-text-secondary">Loading spells...</span>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Cantrips section */}
              {cantripsToLearn > 0 && filteredCantrips.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-nuaibria-mana mb-3">Cantrips (Level 0)</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCantrips.map(spell => {
                      const known = isSpellKnown(spell.name, true);
                      const selected = selectedCantrips.includes(spell.name);
                      const disabled = known || (selectedCantrips.length >= cantripsToLearn && !selected);

                      return (
                        <SpellCard
                          key={spell.name}
                          spell={spell}
                          selected={selected}
                          disabled={disabled}
                          known={known}
                          onToggle={() => toggleSpellSelection(spell.name, true)}
                          onHover={setHoveredSpell}
                          isHovered={hoveredSpell === spell.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Leveled spells section */}
              {filteredSpells.length > 0 && (
                <div>
                  <h3 className="font-display text-xl text-nuaibria-arcane mb-3">Leveled Spells</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredSpells.map(spell => {
                      const known = isSpellKnown(spell.name, false);
                      const selected = selectedSpells.includes(spell.name);
                      const disabled = known || (selectedSpells.length >= spellsToLearn && !selected);

                      return (
                        <SpellCard
                          key={spell.name}
                          spell={spell}
                          selected={selected}
                          disabled={disabled}
                          known={known}
                          onToggle={() => toggleSpellSelection(spell.name, false)}
                          onHover={setHoveredSpell}
                          isHovered={hoveredSpell === spell.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredSpells.length === 0 && filteredCantrips.length === 0 && !loading && (
                <div className="text-center py-12 text-nuaibria-text-muted">
                  <p>No spells found matching your filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLevelFilter(null);
                      setSchoolFilter(null);
                    }}
                    className="mt-2 text-nuaibria-arcane hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-nuaibria-arcane/30 p-6 bg-nuaibria-surface/50 flex gap-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-nuaibria-elevated hover:bg-nuaibria-surface text-nuaibria-text-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || submitting}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-nuaibria-arcane to-nuaibria-mana hover:from-nuaibria-arcane/90 hover:to-nuaibria-mana/90 text-white transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed hover:shadow-glow"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner className="w-5 h-5" />
                Learning...
              </span>
            ) : (
              'Confirm Selection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Spell Card Component
interface SpellCardProps {
  spell: Spell;
  selected: boolean;
  disabled: boolean;
  known: boolean;
  onToggle: () => void;
  onHover: (name: string | null) => void;
  isHovered: boolean;
}

const SpellCard = ({ spell, selected, disabled, known, onToggle, onHover, isHovered }: SpellCardProps) => {
  const levelColor = getSpellLevelColor(spell.level);
  const componentString = [
    spell.components.verbal && 'V',
    spell.components.somatic && 'S',
    spell.components.material && 'M',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={`relative bg-nuaibria-elevated border-2 rounded-lg p-4 transition-all ${
        selected
          ? 'border-nuaibria-arcane bg-nuaibria-arcane/10 shadow-glow'
          : known
          ? 'border-nuaibria-border/50 opacity-50'
          : disabled
          ? 'border-nuaibria-border opacity-70 cursor-not-allowed'
          : 'border-nuaibria-border hover:border-nuaibria-gold/50 cursor-pointer'
      }`}
      onClick={() => !disabled && !known && onToggle()}
      onMouseEnter={() => onHover(spell.name)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Checkbox */}
      {!known && (
        <div className="absolute top-4 right-4">
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled}
            onChange={onToggle}
            className="w-5 h-5 rounded border-nuaibria-border cursor-pointer"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Known badge */}
      {known && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-400/30">
          Known
        </div>
      )}

      {/* Spell header */}
      <div className="flex items-start gap-3 mb-2 pr-10">
        <div className={`px-2 py-1 rounded text-xs font-bold border ${levelColor}`}>
          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-nuaibria-gold">{spell.name}</h4>
          <p className="text-xs text-nuaibria-text-muted italic">{spell.school}</p>
        </div>
      </div>

      {/* Quick info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-nuaibria-text-secondary mb-2">
        <span>⏱️ {spell.castingTime}</span>
        <span>📍 {spell.range}</span>
        <span>🔮 {componentString}</span>
        <span>⌛ {spell.duration}</span>
        {spell.concentration && <span className="text-nuaibria-poison">⚠️ Concentration</span>}
        {spell.ritual && <span className="text-nuaibria-mana">📿 Ritual</span>}
      </div>

      {/* Description (truncated) */}
      <p className="text-sm text-nuaibria-text-muted leading-relaxed line-clamp-2">
        {spell.description}
      </p>

      {/* Hover tooltip */}
      {isHovered && !known && (
        <div className="absolute left-0 right-0 top-full mt-2 z-10 bg-nuaibria-surface border-2 border-nuaibria-arcane rounded-lg p-4 shadow-2xl max-w-md">
          <h4 className="font-semibold text-nuaibria-gold mb-2">{spell.name}</h4>
          <div className="space-y-2 text-xs">
            <div className="flex gap-2">
              <span className="text-nuaibria-text-muted font-semibold">School:</span>
              <span className="text-nuaibria-text-primary">{spell.school}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-nuaibria-text-muted font-semibold">Casting Time:</span>
              <span className="text-nuaibria-text-primary">{spell.castingTime}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-nuaibria-text-muted font-semibold">Range:</span>
              <span className="text-nuaibria-text-primary">{spell.range}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-nuaibria-text-muted font-semibold">Duration:</span>
              <span className="text-nuaibria-text-primary">{spell.duration}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-nuaibria-text-muted font-semibold">Components:</span>
              <span className="text-nuaibria-text-primary">
                {componentString}
                {spell.components.material && spell.components.materialComponents && (
                  <span className="text-nuaibria-text-muted block mt-1">
                    ({spell.components.materialComponents})
                  </span>
                )}
              </span>
            </div>
            {spell.damageType && (
              <div className="flex gap-2">
                <span className="text-nuaibria-text-muted font-semibold">Damage:</span>
                <span className="text-nuaibria-text-primary">{spell.damageType}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-nuaibria-border">
            <p className="text-xs text-nuaibria-text-secondary leading-relaxed">{spell.description}</p>
            {spell.higherLevels && (
              <p className="text-xs text-nuaibria-text-muted mt-2 italic">
                <strong>At Higher Levels:</strong> {spell.higherLevels}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellLearningModal;
