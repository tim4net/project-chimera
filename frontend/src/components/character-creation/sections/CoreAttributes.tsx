/**
 * @file CoreAttributes.tsx
 * @description Section 2: Race, Class, and Background selection with searchable dropdowns
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Race, CharacterClass, Background } from '../../../types/wizard';

interface CoreAttributesProps {
  race: Race;
  characterClass: CharacterClass;
  background: Background;
  onRaceChange: (race: Race) => void;
  onClassChange: (characterClass: CharacterClass) => void;
  onBackgroundChange: (background: Background) => void;
}

const RACES: Race[] = ['Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling', 'Human', 'Orc', 'Tiefling'];
const CLASSES: CharacterClass[] = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
const BACKGROUNDS: Background[] = ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier'];

const RACE_DESCRIPTIONS: Record<Race, string> = {
  Aasimar: 'Celestial-touched humanoids with divine heritage',
  Dragonborn: 'Draconic ancestry with elemental breath weapons',
  Dwarf: 'Stout and resilient mountain crafters',
  Elf: 'Graceful, long-lived beings with innate magic',
  Gnome: 'Inventive and mischievous tinkerers',
  Goliath: 'Towering mountain warriors',
  Halfling: 'Small, nimble, and naturally lucky',
  Human: 'Adaptable and ambitious',
  Orc: 'Fierce and honorable warriors',
  Tiefling: 'Infernal heritage with arcane power',
  'Half-Elf': 'Mixed elven and human heritage',
  'Half-Orc': 'Mixed orcish and human heritage',
};

const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  Barbarian: 'Primal warrior channeling rage',
  Bard: 'Charismatic performer with magic',
  Cleric: 'Divine healer and protector',
  Druid: 'Nature shapeshifter',
  Fighter: 'Master of weapons and combat',
  Monk: 'Disciplined ki warrior',
  Paladin: 'Holy warrior bound by oaths',
  Ranger: 'Wilderness hunter and tracker',
  Rogue: 'Stealth and precision master',
  Sorcerer: 'Innate magical power',
  Warlock: 'Pact-bound spellcaster',
  Wizard: 'Arcane scholar and researcher',
};

const BACKGROUND_DESCRIPTIONS: Record<Background, string> = {
  Acolyte: 'Served in a temple, learning rites and lore',
  Criminal: 'Experienced in breaking the law',
  'Folk Hero': 'Humble origins destined for greatness',
  Noble: 'Wealth, power, and privilege',
  Sage: 'Years spent learning lore of the multiverse',
  Soldier: 'War veteran with military training',
  Charlatan: 'Master of deception and disguise',
  Entertainer: 'Professional performer and artist',
  'Guild Artisan': 'Skilled tradesperson and craftsman',
  Hermit: 'Lived in isolation for contemplation',
  Outlander: 'Wilderness survivor and explorer',
  Sailor: 'Sea-faring adventurer',
  Urchin: 'Street-smart survivor',
};

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  descriptions: Record<T, string>;
  onChange: (value: T) => void;
}

function Dropdown<T extends string>({ label, value, options, descriptions, onChange }: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block font-body text-sm text-nuaibria-text-secondary font-semibold mb-2">
        {label} *
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-nuaibria-bg border-2 border-nuaibria-border rounded-lg px-4 py-3 font-body text-nuaibria-text-primary focus:outline-none focus:border-nuaibria-gold/50 focus:shadow-glow transition-all shadow-inner-dark"
      >
        <span>{value || `Select ${label}`}</span>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-nuaibria-elevated border-2 border-nuaibria-gold/50 rounded-lg shadow-glow-lg max-h-96 overflow-auto custom-scrollbar">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option as T);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-nuaibria-gold/10 cursor-pointer transition-all first:rounded-t-lg last:rounded-b-lg border-b border-nuaibria-border last:border-b-0"
            >
              <div className="text-nuaibria-text-primary font-semibold hover:text-nuaibria-gold transition-colors">
                {option}
              </div>
              <p className="text-nuaibria-text-muted text-xs mt-1 leading-relaxed">
                {descriptions[option]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CoreAttributes({
  race,
  characterClass,
  background,
  onRaceChange,
  onClassChange,
  onBackgroundChange,
}: CoreAttributesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-nuaibria-gold mb-2 tracking-wider">
          Core Attributes
        </h3>
        <p className="text-nuaibria-text-secondary text-sm">
          Define your character's race, class, and background
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dropdown
          label="Race"
          value={race}
          options={RACES}
          descriptions={RACE_DESCRIPTIONS}
          onChange={onRaceChange}
        />
        <Dropdown
          label="Class"
          value={characterClass}
          options={CLASSES}
          descriptions={CLASS_DESCRIPTIONS}
          onChange={onClassChange}
        />
        <Dropdown
          label="Background"
          value={background}
          options={BACKGROUNDS}
          descriptions={BACKGROUND_DESCRIPTIONS}
          onChange={onBackgroundChange}
        />
      </div>
    </div>
  );
}
