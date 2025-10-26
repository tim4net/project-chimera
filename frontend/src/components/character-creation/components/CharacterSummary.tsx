/**
 * @file CharacterSummary.tsx
 * @description Displays complete character information for review before creation
 */

import React from 'react';

// Types
interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

interface Backstory {
  ideal: string;
  bond: string;
  flaw: string;
}

interface CharacterDraft {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  gender: string;
  abilityScores: AbilityScores;
  skills: string[];
  backstory: Backstory;
  equipment: string[];
  gold: number;
  portraitUrl?: string | null;
  appearance?: string;
}

interface CharacterSummaryProps {
  character: CharacterDraft;
  onEditBasicInfo: () => void;
  onEditAbilities: () => void;
}

// Helper: Calculate ability modifier
const getModifier = (score: number): string => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Helper: Calculate proficiency bonus (always +2 at level 1)
const getProficiencyBonus = (): string => '+2';

// Helper: Calculate skill modifier
const getSkillModifier = (
  score: number,
  isProficient: boolean
): string => {
  const baseModifier = Math.floor((score - 10) / 2);
  const profBonus = isProficient ? 2 : 0;
  const total = baseModifier + profBonus;
  return total >= 0 ? `+${total}` : `${total}`;
};

// Skill to ability mapping
const SKILL_ABILITIES: Record<string, keyof AbilityScores> = {
  'Acrobatics': 'DEX',
  'Animal Handling': 'WIS',
  'Arcana': 'INT',
  'Athletics': 'STR',
  'Deception': 'CHA',
  'History': 'INT',
  'Insight': 'WIS',
  'Intimidation': 'CHA',
  'Investigation': 'INT',
  'Medicine': 'WIS',
  'Nature': 'INT',
  'Perception': 'WIS',
  'Performance': 'CHA',
  'Persuasion': 'CHA',
  'Religion': 'INT',
  'Sleight of Hand': 'DEX',
  'Stealth': 'DEX',
  'Survival': 'WIS',
};

// Icons
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Section wrapper
const SummarySection: React.FC<{
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}> = ({ title, onEdit, children }) => (
  <div className="bg-nuaibria-elevated/50 border border-nuaibria-gold/20 rounded-lg p-5 space-y-4">
    <div className="flex items-center justify-between border-b border-nuaibria-gold/20 pb-3">
      <h3 className="font-display text-xl text-nuaibria-gold tracking-wider">{title}</h3>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-nuaibria-gold hover:text-nuaibria-text-primary bg-nuaibria-gold/10 hover:bg-nuaibria-gold/20 border border-nuaibria-gold/30 hover:border-nuaibria-gold/50 rounded transition-all"
        >
          <EditIcon />
          <span>Edit</span>
        </button>
      )}
    </div>
    {children}
  </div>
);

// Field display
const Field: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-nuaibria-text-secondary text-sm font-semibold">{label}:</span>
    <span className="text-nuaibria-text-primary font-body">{value}</span>
  </div>
);

export const CharacterSummary: React.FC<CharacterSummaryProps> = ({
  character,
  onEditBasicInfo,
  onEditAbilities,
}) => {
  const proficiencyBonus = getProficiencyBonus();

  return (
    <div className="space-y-6">
      {/* Identity Section */}
      <SummarySection title="Identity" onEdit={onEditBasicInfo}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" value={character.name} />
          <Field label="Gender" value={character.gender} />
          <Field label="Race" value={character.race} />
          <Field label="Class" value={character.class} />
          <Field label="Background" value={character.background} />
          <Field label="Alignment" value={character.alignment} />
        </div>
      </SummarySection>

      {/* Ability Scores Section */}
      <SummarySection title="Ability Scores" onEdit={onEditAbilities}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(Object.keys(character.abilityScores) as Array<keyof AbilityScores>).map((ability) => (
            <div
              key={ability}
              className="flex flex-col items-center bg-nuaibria-bg/50 rounded-lg p-3 border border-nuaibria-border"
            >
              <span className="text-nuaibria-text-secondary text-sm font-semibold">{ability}</span>
              <span className="text-nuaibria-gold text-2xl font-bold font-mono">
                {character.abilityScores[ability]}
              </span>
              <span className="text-nuaibria-text-muted text-xs">
                {getModifier(character.abilityScores[ability])}
              </span>
            </div>
          ))}
        </div>
      </SummarySection>

      {/* Vitals Section */}
      <SummarySection title="Vitals">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-nuaibria-text-secondary text-xs font-semibold mb-1">HP</div>
            <div className="text-nuaibria-health text-xl font-bold">
              {/* HP calculation will be done by backend */}
              --
            </div>
          </div>
          <div className="text-center">
            <div className="text-nuaibria-text-secondary text-xs font-semibold mb-1">AC</div>
            <div className="text-nuaibria-text-primary text-xl font-bold">
              {/* AC calculation will be done by backend */}
              --
            </div>
          </div>
          <div className="text-center">
            <div className="text-nuaibria-text-secondary text-xs font-semibold mb-1">Speed</div>
            <div className="text-nuaibria-text-primary text-xl font-bold">30 ft</div>
          </div>
          <div className="text-center">
            <div className="text-nuaibria-text-secondary text-xs font-semibold mb-1">Proficiency</div>
            <div className="text-nuaibria-gold text-xl font-bold">{proficiencyBonus}</div>
          </div>
        </div>
      </SummarySection>

      {/* Skills Section */}
      <SummarySection title="Skills">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(SKILL_ABILITIES).map(([skill, ability]) => {
            const isProficient = character.skills.includes(skill);
            const modifier = getSkillModifier(character.abilityScores[ability], isProficient);

            return (
              <div
                key={skill}
                className={`flex justify-between items-center px-3 py-2 rounded ${
                  isProficient
                    ? 'bg-nuaibria-gold/10 border border-nuaibria-gold/30'
                    : 'bg-nuaibria-bg/30'
                }`}
              >
                <span
                  className={`text-sm ${
                    isProficient ? 'text-nuaibria-gold font-semibold' : 'text-nuaibria-text-muted'
                  }`}
                >
                  {skill}
                </span>
                <span
                  className={`text-sm font-mono ${
                    isProficient ? 'text-nuaibria-gold font-bold' : 'text-nuaibria-text-muted'
                  }`}
                >
                  {modifier}
                </span>
              </div>
            );
          })}
        </div>
      </SummarySection>

      {/* Equipment & Gold Section */}
      <SummarySection title="Equipment & Gold">
        <div className="space-y-3">
          <Field label="Starting Gold" value={`${character.gold} gp`} />
          <div>
            <div className="text-nuaibria-text-secondary text-sm font-semibold mb-2">Equipment:</div>
            <ul className="list-disc list-inside space-y-1 text-nuaibria-text-primary text-sm ml-2">
              {character.equipment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SummarySection>

      {/* Backstory Section */}
      {(character.backstory.ideal || character.backstory.bond || character.backstory.flaw) && (
        <SummarySection title="Backstory" onEdit={onEditBasicInfo}>
          <div className="space-y-3">
            {character.backstory.ideal && (
              <div>
                <div className="text-nuaibria-text-secondary text-sm font-semibold mb-1">Ideal:</div>
                <p className="text-nuaibria-text-primary text-sm leading-relaxed">
                  {character.backstory.ideal}
                </p>
              </div>
            )}
            {character.backstory.bond && (
              <div>
                <div className="text-nuaibria-text-secondary text-sm font-semibold mb-1">Bond:</div>
                <p className="text-nuaibria-text-primary text-sm leading-relaxed">
                  {character.backstory.bond}
                </p>
              </div>
            )}
            {character.backstory.flaw && (
              <div>
                <div className="text-nuaibria-text-secondary text-sm font-semibold mb-1">Flaw:</div>
                <p className="text-nuaibria-text-primary text-sm leading-relaxed">
                  {character.backstory.flaw}
                </p>
              </div>
            )}
          </div>
        </SummarySection>
      )}

      {/* Appearance Section */}
      {character.appearance && (
        <SummarySection title="Appearance" onEdit={onEditBasicInfo}>
          <p className="text-nuaibria-text-primary text-sm leading-relaxed">{character.appearance}</p>
        </SummarySection>
      )}
    </div>
  );
};

export default CharacterSummary;
