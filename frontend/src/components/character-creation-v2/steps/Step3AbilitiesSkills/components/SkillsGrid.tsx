import React from 'react';
import { calculateModifier, formatModifier } from '../utils/abilityScoreCalculations';

export interface Skill {
  id: string;
  name: string;
  ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
}

export interface SkillsGridProps {
  skills: Skill[];
  selectedSkills: string[];
  backgroundSkills: string[];
  abilityScores: Record<string, number>;
  proficiencyBonus: number;
  skillLimit: number;
  onSkillToggle: (skillId: string) => void;
  disabled?: boolean;
}

const ALL_SKILLS: Skill[] = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { id: 'animal-handling', name: 'Animal Handling', ability: 'wis' },
  { id: 'arcana', name: 'Arcana', ability: 'int' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'deception', name: 'Deception', ability: 'cha' },
  { id: 'history', name: 'History', ability: 'int' },
  { id: 'insight', name: 'Insight', ability: 'wis' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { id: 'investigation', name: 'Investigation', ability: 'int' },
  { id: 'medicine', name: 'Medicine', ability: 'wis' },
  { id: 'nature', name: 'Nature', ability: 'int' },
  { id: 'perception', name: 'Perception', ability: 'wis' },
  { id: 'performance', name: 'Performance', ability: 'cha' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha' },
  { id: 'religion', name: 'Religion', ability: 'int' },
  { id: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'dex' },
  { id: 'stealth', name: 'Stealth', ability: 'dex' },
  { id: 'survival', name: 'Survival', ability: 'wis' },
];

export const SkillsGrid: React.FC<SkillsGridProps> = ({
  selectedSkills,
  backgroundSkills,
  abilityScores,
  proficiencyBonus,
  skillLimit,
  onSkillToggle,
  disabled = false,
}) => {
  const classSkillsCount = selectedSkills.filter(
    (skill) => !backgroundSkills.includes(skill)
  ).length;

  const handleSkillClick = (skillId: string) => {
    const isBackgroundSkill = backgroundSkills.includes(skillId);
    const isSelected = selectedSkills.includes(skillId);

    // Cannot deselect background skills
    if (isBackgroundSkill) {
      return;
    }

    // Check if we're at the limit
    if (!isSelected && classSkillsCount >= skillLimit) {
      return;
    }

    onSkillToggle(skillId);
  };

  const getSkillModifier = (skill: Skill, isProficient: boolean): string => {
    const abilityScore = abilityScores[skill.ability] || 10;
    const abilityMod = calculateModifier(abilityScore);
    const totalMod = isProficient ? abilityMod + proficiencyBonus : abilityMod;
    return formatModifier(totalMod);
  };

  const isAtLimit = classSkillsCount >= skillLimit;

  return (
    <div className="skills-grid">
      <div className="skills-header">
        <h3>Skill Proficiencies</h3>
        <div className="skills-count">
          <span className={classSkillsCount > skillLimit ? 'error' : classSkillsCount === skillLimit ? 'success' : ''}>
            {classSkillsCount}/{skillLimit}
          </span>
          <span className="count-label">selected</span>
        </div>
      </div>

      {isAtLimit && (
        <div className="limit-warning">
          Maximum skills selected. Deselect a skill to choose a different one.
        </div>
      )}

      <div className="skills-list">
        {ALL_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill.id);
          const isBackgroundSkill = backgroundSkills.includes(skill.id);
          const isProficient = isSelected;
          const modifier = getSkillModifier(skill, isProficient);

          return (
            <div
              key={skill.id}
              className={`skill-item ${isProficient ? 'proficient' : ''} ${
                isBackgroundSkill ? 'background' : ''
              } ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && handleSkillClick(skill.id)}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSkillClick(skill.id);
                }
              }}
            >
              <div className="skill-checkbox">
                <input
                  type="checkbox"
                  id={skill.id}
                  checked={isSelected}
                  onChange={() => handleSkillClick(skill.id)}
                  disabled={disabled || (isBackgroundSkill && isSelected)}
                  aria-label={skill.name}
                />
              </div>
              <div className="skill-info">
                <div className="skill-name">
                  {skill.name}
                  {isBackgroundSkill && <span className="bg-tag">BG</span>}
                </div>
                <div className="skill-ability">{skill.ability.toUpperCase()}</div>
              </div>
              <div className="skill-modifier">{modifier}</div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .skills-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skills-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .skills-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .skills-count {
          display: flex;
          gap: 8px;
          align-items: baseline;
          font-size: 16px;
          font-weight: 600;
        }

        .skills-count .error {
          color: #dc2626;
        }

        .skills-count .success {
          color: #059669;
        }

        .count-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 400;
        }

        .limit-warning {
          padding: 12px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          color: #92400e;
          font-size: 14px;
          border-radius: 4px;
        }

        .skills-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 8px;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .skill-item:hover:not(.disabled) {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .skill-item.proficient {
          background: linear-gradient(to right, #fef3c7 0%, #fefce8 100%);
          border-color: #d4af37;
          box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
        }

        .skill-item.proficient:hover:not(.disabled) {
          border-color: #b8941f;
        }

        .skill-item.background {
          border-color: #93c5fd;
          background: linear-gradient(to right, #dbeafe 0%, #eff6ff 100%);
        }

        .skill-item.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .skill-checkbox {
          flex-shrink: 0;
        }

        .skill-checkbox input[type='checkbox'] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .skill-checkbox input[type='checkbox']:disabled {
          cursor: not-allowed;
        }

        .skill-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .skill-name {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bg-tag {
          display: inline-block;
          padding: 2px 6px;
          background: #3b82f6;
          color: white;
          font-size: 10px;
          font-weight: 700;
          border-radius: 3px;
          text-transform: uppercase;
        }

        .skill-ability {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 500;
        }

        .skill-modifier {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
          min-width: 40px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .skills-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
