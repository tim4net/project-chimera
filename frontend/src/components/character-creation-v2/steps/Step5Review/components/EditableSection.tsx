/**
 * @fileoverview EditableSection - Expandable section for inline editing
 * Allows editing of character data from any step
 */

import React, { useState } from 'react';
import { useCharacterDraft } from '../../../../../context/CharacterDraftContextV2';
import type { CharacterDraft } from '../../../../../context/characterDraftV2/validation';
import './EditableSection.css';

interface EditableSectionProps {
  sectionName: 'hero' | 'identity' | 'abilities' | 'loadout';
  draft: Partial<CharacterDraft>;
}

const EditableSection: React.FC<EditableSectionProps> = ({ sectionName, draft }) => {
  const { updateDraft } = useCharacterDraft();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSave = () => {
    setIsExpanded(false);
  };

  const renderHeroFields = () => (
    <div className="edit-fields">
      <div className="field-group">
        <label htmlFor="edit-name">Character Name</label>
        <input
          id="edit-name"
          type="text"
          value={draft.name || ''}
          onChange={(e) => updateDraft({ name: e.target.value })}
          aria-label="Character Name"
        />
      </div>
      <div className="field-group">
        <label htmlFor="edit-race">Race</label>
        <select
          id="edit-race"
          value={draft.race || ''}
          onChange={(e) => updateDraft({ race: e.target.value as any })}
          aria-label="Race"
        >
          <option value="">Select Race</option>
          <option value="Dwarf">Dwarf</option>
          <option value="Elf">Elf</option>
          <option value="Human">Human</option>
          <option value="Halfling">Halfling</option>
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="edit-class">Class</label>
        <select
          id="edit-class"
          value={draft.class || ''}
          onChange={(e) => updateDraft({ class: e.target.value as any })}
          aria-label="Class"
        >
          <option value="">Select Class</option>
          <option value="Fighter">Fighter</option>
          <option value="Wizard">Wizard</option>
          <option value="Cleric">Cleric</option>
          <option value="Rogue">Rogue</option>
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="edit-background">Background</label>
        <select
          id="edit-background"
          value={draft.background || ''}
          onChange={(e) => updateDraft({ background: e.target.value as any })}
          aria-label="Background"
        >
          <option value="">Select Background</option>
          <option value="Soldier">Soldier</option>
          <option value="Sage">Sage</option>
          <option value="Criminal">Criminal</option>
          <option value="Acolyte">Acolyte</option>
        </select>
      </div>
    </div>
  );

  const renderIdentityFields = () => (
    <div className="edit-fields">
      <div className="field-group">
        <label htmlFor="edit-alignment">Alignment</label>
        <select
          id="edit-alignment"
          value={draft.alignment || ''}
          onChange={(e) => updateDraft({ alignment: e.target.value as any })}
          aria-label="Alignment"
        >
          <option value="">Select Alignment</option>
          <option value="Lawful Good">Lawful Good</option>
          <option value="Neutral Good">Neutral Good</option>
          <option value="Chaotic Good">Chaotic Good</option>
          <option value="Lawful Neutral">Lawful Neutral</option>
          <option value="True Neutral">True Neutral</option>
          <option value="Chaotic Neutral">Chaotic Neutral</option>
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="edit-gender">Gender</label>
        <input
          id="edit-gender"
          type="text"
          value={draft.gender || ''}
          onChange={(e) => updateDraft({ gender: e.target.value })}
          aria-label="Gender"
        />
      </div>
      <div className="field-group">
        <label htmlFor="edit-traits">Personality Traits (comma separated)</label>
        <textarea
          id="edit-traits"
          value={draft.personalityTraits?.join(', ') || ''}
          onChange={(e) => updateDraft({
            personalityTraits: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          })}
          aria-label="Personality Traits"
        />
      </div>
    </div>
  );

  const renderAbilitiesFields = () => (
    <div className="edit-fields">
      <h4>Ability Scores</h4>
      <div className="abilities-edit-grid">
        <div className="field-group">
          <label htmlFor="edit-str">Strength</label>
          <input
            id="edit-str"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.STR || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                ...draft.abilityScores,
                STR: parseInt(e.target.value) || 10,
                DEX: draft.abilityScores?.DEX || 10,
                CON: draft.abilityScores?.CON || 10,
                INT: draft.abilityScores?.INT || 10,
                WIS: draft.abilityScores?.WIS || 10,
                CHA: draft.abilityScores?.CHA || 10,
              }
            })}
            aria-label="Strength"
          />
        </div>
        <div className="field-group">
          <label htmlFor="edit-dex">Dexterity</label>
          <input
            id="edit-dex"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.DEX || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                STR: draft.abilityScores?.STR || 10,
                DEX: parseInt(e.target.value) || 10,
                CON: draft.abilityScores?.CON || 10,
                INT: draft.abilityScores?.INT || 10,
                WIS: draft.abilityScores?.WIS || 10,
                CHA: draft.abilityScores?.CHA || 10,
              }
            })}
            aria-label="Dexterity"
          />
        </div>
        <div className="field-group">
          <label htmlFor="edit-con">Constitution</label>
          <input
            id="edit-con"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.CON || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                STR: draft.abilityScores?.STR || 10,
                DEX: draft.abilityScores?.DEX || 10,
                CON: parseInt(e.target.value) || 10,
                INT: draft.abilityScores?.INT || 10,
                WIS: draft.abilityScores?.WIS || 10,
                CHA: draft.abilityScores?.CHA || 10,
              }
            })}
            aria-label="Constitution"
          />
        </div>
        <div className="field-group">
          <label htmlFor="edit-int">Intelligence</label>
          <input
            id="edit-int"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.INT || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                STR: draft.abilityScores?.STR || 10,
                DEX: draft.abilityScores?.DEX || 10,
                CON: draft.abilityScores?.CON || 10,
                INT: parseInt(e.target.value) || 10,
                WIS: draft.abilityScores?.WIS || 10,
                CHA: draft.abilityScores?.CHA || 10,
              }
            })}
            aria-label="Intelligence"
          />
        </div>
        <div className="field-group">
          <label htmlFor="edit-wis">Wisdom</label>
          <input
            id="edit-wis"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.WIS || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                STR: draft.abilityScores?.STR || 10,
                DEX: draft.abilityScores?.DEX || 10,
                CON: draft.abilityScores?.CON || 10,
                INT: draft.abilityScores?.INT || 10,
                WIS: parseInt(e.target.value) || 10,
                CHA: draft.abilityScores?.CHA || 10,
              }
            })}
            aria-label="Wisdom"
          />
        </div>
        <div className="field-group">
          <label htmlFor="edit-cha">Charisma</label>
          <input
            id="edit-cha"
            type="number"
            min="3"
            max="20"
            value={draft.abilityScores?.CHA || 10}
            onChange={(e) => updateDraft({
              abilityScores: {
                STR: draft.abilityScores?.STR || 10,
                DEX: draft.abilityScores?.DEX || 10,
                CON: draft.abilityScores?.CON || 10,
                INT: draft.abilityScores?.INT || 10,
                WIS: draft.abilityScores?.WIS || 10,
                CHA: parseInt(e.target.value) || 10,
              }
            })}
            aria-label="Charisma"
          />
        </div>
      </div>
      <div className="field-group">
        <label>Select Skills</label>
        <p className="helper-text">Available skill selection will be implemented in full version</p>
      </div>
    </div>
  );

  const renderLoadoutFields = () => (
    <div className="edit-fields">
      <div className="field-group">
        <label>Select Equipment</label>
        <p className="helper-text">Equipment selection will be implemented in full version</p>
      </div>
      <div className="field-group">
        <label htmlFor="edit-gold">Starting Gold</label>
        <input
          id="edit-gold"
          type="number"
          min="0"
          value={draft.startingGold || 0}
          onChange={(e) => updateDraft({ startingGold: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="field-group">
        <label htmlFor="edit-portrait">Portrait URL</label>
        <input
          id="edit-portrait"
          type="text"
          value={draft.avatarUrl || ''}
          onChange={(e) => updateDraft({ avatarUrl: e.target.value })}
          aria-label="Portrait"
        />
      </div>
    </div>
  );

  const getSectionTitle = () => {
    switch (sectionName) {
      case 'hero': return 'Hero';
      case 'identity': return 'Identity';
      case 'abilities': return 'Abilities';
      case 'loadout': return 'Loadout';
    }
  };

  const renderFields = () => {
    switch (sectionName) {
      case 'hero': return renderHeroFields();
      case 'identity': return renderIdentityFields();
      case 'abilities': return renderAbilitiesFields();
      case 'loadout': return renderLoadoutFields();
    }
  };

  return (
    <div
      className={`editable-section ${isExpanded ? 'expanded' : 'collapsed'}`}
      data-testid={`editable-section-${sectionName}`}
    >
      <div className="section-header">
        <h4>{getSectionTitle()}</h4>
        <button
          onClick={handleToggle}
          type="button"
          className="edit-button"
          data-testid={`edit-button-${sectionName}`}
          aria-label={`Edit ${getSectionTitle()}`}
        >
          {isExpanded ? 'Collapse' : `Edit ${getSectionTitle()}`}
        </button>
      </div>

      {isExpanded && (
        <>
          {renderFields()}
          <button
            onClick={handleSave}
            type="button"
            className="save-button"
            aria-label="Save"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default EditableSection;
