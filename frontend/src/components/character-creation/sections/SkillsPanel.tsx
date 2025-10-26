/**
 * @file SkillsPanel.tsx
 * @description Section 5: Skill proficiency selection with background and class skills
 */

import React from 'react';
import type { SkillName, CharacterClass, Background } from '../../../types/wizard';

interface SkillsPanelProps {
  background: Background;
  characterClass: CharacterClass;
  selectedSkills: SkillName[];
  onToggleSkill: (skill: SkillName) => void;
}

const ALL_SKILLS: SkillName[] = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
];

const BACKGROUND_SKILLS: Record<Background, SkillName[]> = {
  Acolyte: ['Insight', 'Religion'],
  Criminal: ['Deception', 'Stealth'],
  'Folk Hero': ['Animal Handling', 'Survival'],
  Noble: ['History', 'Persuasion'],
  Sage: ['Arcana', 'History'],
  Soldier: ['Athletics', 'Intimidation'],
  Charlatan: ['Deception', 'Sleight of Hand'],
  Entertainer: ['Acrobatics', 'Performance'],
  'Guild Artisan': ['Insight', 'Persuasion'],
  Hermit: ['Medicine', 'Religion'],
  Outlander: ['Athletics', 'Survival'],
  Sailor: ['Athletics', 'Perception'],
  Urchin: ['Sleight of Hand', 'Stealth'],
};

const CLASS_SKILLS: Record<CharacterClass, { choices: number; options: SkillName[] }> = {
  Barbarian: { choices: 2, options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
  Bard: { choices: 3, options: ALL_SKILLS },
  Cleric: { choices: 2, options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
  Druid: { choices: 2, options: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
  Fighter: { choices: 2, options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
  Monk: { choices: 2, options: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
  Paladin: { choices: 2, options: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
  Ranger: { choices: 3, options: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
  Rogue: { choices: 4, options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
  Sorcerer: { choices: 2, options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
  Warlock: { choices: 2, options: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
  Wizard: { choices: 2, options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
};

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-2.99" />
  </svg>
);

export function SkillsPanel({
  background,
  characterClass,
  selectedSkills,
  onToggleSkill,
}: SkillsPanelProps) {
  const backgroundSkills = new Set(BACKGROUND_SKILLS[background] || []);
  const classConfig = CLASS_SKILLS[characterClass];
  const availableClassSkills = new Set(classConfig.options);

  const classSelectedCount = selectedSkills.filter(
    (skill) => !backgroundSkills.has(skill)
  ).length;
  const remaining = classConfig.choices - classSelectedCount;

  const handleToggle = (skill: SkillName) => {
    // Background skills cannot be toggled
    if (backgroundSkills.has(skill)) return;

    // Class skills not in available options cannot be toggled
    if (!availableClassSkills.has(skill)) return;

    onToggleSkill(skill);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-nuaibria-gold mb-2 tracking-wider">
          Skill Proficiencies
        </h3>
        <p className="text-nuaibria-text-secondary text-sm">
          Background grants automatic skills. Select {classConfig.choices} additional from your
          class
        </p>
      </div>

      <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-nuaibria-text-secondary text-sm">
              <strong className="text-nuaibria-gold">
                {BACKGROUND_SKILLS[background].join(', ')}
              </strong>{' '}
              (from {background})
            </span>
          </div>
          <div className="text-sm">
            <span
              className={`font-semibold ${
                remaining === 0 ? 'text-nuaibria-success' : 'text-nuaibria-gold'
              }`}
            >
              {remaining} remaining
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_SKILLS.map((skill) => {
          const isBackgroundSkill = backgroundSkills.has(skill);
          const isClassSkill = availableClassSkills.has(skill);
          const isSelected = selectedSkills.includes(skill);
          const canSelect = isClassSkill && !isBackgroundSkill;

          return (
            <div
              key={skill}
              onClick={() => canSelect && handleToggle(skill)}
              className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
                isBackgroundSkill
                  ? 'border-nuaibria-ember bg-nuaibria-ember/10 opacity-90'
                  : isSelected
                  ? 'border-nuaibria-gold bg-nuaibria-gold/10'
                  : canSelect
                  ? 'border-nuaibria-border hover:border-nuaibria-gold/50 hover:bg-nuaibria-elevated/50 cursor-pointer'
                  : 'border-nuaibria-border opacity-40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isSelected || isBackgroundSkill
                    ? 'bg-nuaibria-gold border-nuaibria-gold'
                    : 'border-nuaibria-border'
                }`}
              >
                {(isSelected || isBackgroundSkill) && <CheckCircleIcon />}
              </div>

              <span
                className={`font-semibold text-sm flex-1 ${
                  isSelected || isBackgroundSkill
                    ? 'text-nuaibria-gold'
                    : 'text-nuaibria-text-primary'
                }`}
              >
                {skill}
              </span>

              {isBackgroundSkill && (
                <span className="text-xs bg-nuaibria-ember/20 text-nuaibria-ember px-2 py-0.5 rounded-full">
                  BG
                </span>
              )}
              {!isClassSkill && !isBackgroundSkill && (
                <span className="text-xs bg-nuaibria-border/20 text-nuaibria-text-muted px-2 py-0.5 rounded-full">
                  N/A
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
