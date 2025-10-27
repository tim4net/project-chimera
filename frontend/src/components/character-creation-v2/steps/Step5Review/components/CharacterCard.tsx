/**
 * @fileoverview CharacterCard - Display complete character summary
 * Shows all fields from Steps 1-5 with calculated stats
 */

import React from 'react';
import type { CharacterDraft } from '../../../../../context/characterDraftV2/validation';
import './CharacterCard.css';

interface CharacterCardProps {
  draft: Partial<CharacterDraft>;
}

const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

const calculateHP = (draft: Partial<CharacterDraft>): number => {
  // Fighter hit die is d10, so base HP is 10
  const baseHP = draft.class === 'Fighter' ? 10 : 8; // Simplified
  const conModifier = draft.abilityScores?.CON
    ? calculateModifier(draft.abilityScores.CON)
    : 0;
  return baseHP + conModifier;
};

const CharacterCard: React.FC<CharacterCardProps> = ({ draft }) => {
  const proficiencyBonus = 2; // Level 1 proficiency bonus
  const hp = calculateHP(draft);

  return (
    <div className="character-card" data-testid="character-card">
      {/* Hero Section */}
      <section className="card-section hero-section">
        <h3>Hero</h3>
        <div className="hero-info">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{draft.name || 'Unnamed'}</span>
          </div>
          <div className="info-row">
            <span className="label">Race:</span>
            <span className="value">{draft.race || 'Not selected'}</span>
          </div>
          <div className="info-row">
            <span className="label">Class:</span>
            <span className="value">{draft.class || 'Not selected'}</span>
          </div>
          <div className="info-row">
            <span className="label">Background:</span>
            <span className="value">{draft.background || 'Not selected'}</span>
          </div>
        </div>
      </section>

      {/* Identity Section */}
      <section className="card-section identity-section">
        <h3>Identity</h3>
        <div className="identity-info">
          <div className="info-row">
            <span className="label">Alignment:</span>
            <span className="value">{draft.alignment || 'Not selected'}</span>
          </div>
          <div className="info-row">
            <span className="label">Gender:</span>
            <span className="value">{draft.gender || 'Not specified'}</span>
          </div>

          {/* Portrait */}
          {draft.avatarUrl && (
            <div className="portrait-container">
              <img
                src={draft.avatarUrl}
                alt="Character Portrait"
                className="character-portrait"
              />
            </div>
          )}

          {/* Backstory Elements */}
          {draft.personalityTraits && draft.personalityTraits.length > 0 && (
            <div className="backstory-section">
              <h4>Personality Traits</h4>
              <ul>
                {draft.personalityTraits.map((trait, idx) => (
                  <li key={idx}>{trait}</li>
                ))}
              </ul>
            </div>
          )}

          {draft.ideals && draft.ideals.length > 0 && (
            <div className="backstory-section">
              <h4>Ideals</h4>
              <ul>
                {draft.ideals.map((ideal, idx) => (
                  <li key={idx}>{ideal}</li>
                ))}
              </ul>
            </div>
          )}

          {draft.bonds && draft.bonds.length > 0 && (
            <div className="backstory-section">
              <h4>Bonds</h4>
              <ul>
                {draft.bonds.map((bond, idx) => (
                  <li key={idx}>{bond}</li>
                ))}
              </ul>
            </div>
          )}

          {draft.flaws && draft.flaws.length > 0 && (
            <div className="backstory-section">
              <h4>Flaws</h4>
              <ul>
                {draft.flaws.map((flaw, idx) => (
                  <li key={idx}>{flaw}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Abilities Section */}
      <section className="card-section abilities-section">
        <h3>Abilities</h3>
        <div className="abilities-grid">
          {draft.abilityScores ? (
            <>
              <div className="ability-score">
                <span className="ability-name">STR</span>
                <span className="ability-value">{draft.abilityScores.STR}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.STR) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.STR)}
                </span>
              </div>
              <div className="ability-score">
                <span className="ability-name">DEX</span>
                <span className="ability-value">{draft.abilityScores.DEX}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.DEX) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.DEX)}
                </span>
              </div>
              <div className="ability-score">
                <span className="ability-name">CON</span>
                <span className="ability-value">{draft.abilityScores.CON}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.CON) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.CON)}
                </span>
              </div>
              <div className="ability-score">
                <span className="ability-name">INT</span>
                <span className="ability-value">{draft.abilityScores.INT}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.INT) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.INT)}
                </span>
              </div>
              <div className="ability-score">
                <span className="ability-name">WIS</span>
                <span className="ability-value">{draft.abilityScores.WIS}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.WIS) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.WIS)}
                </span>
              </div>
              <div className="ability-score">
                <span className="ability-name">CHA</span>
                <span className="ability-value">{draft.abilityScores.CHA}</span>
                <span className="ability-modifier">
                  {calculateModifier(draft.abilityScores.CHA) >= 0 ? '+' : ''}
                  {calculateModifier(draft.abilityScores.CHA)}
                </span>
              </div>
            </>
          ) : (
            <p>Ability scores not set</p>
          )}
        </div>

        {/* Calculated Stats */}
        <div className="calculated-stats">
          <div className="stat-row">
            <span className="stat-label">Proficiency Bonus:</span>
            <span className="stat-value">+{proficiencyBonus}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Hit Points:</span>
            <span className="stat-value">{hp}</span>
          </div>
        </div>

        {/* Skills */}
        {draft.proficientSkills && draft.proficientSkills.length > 0 && (
          <div className="skills-section">
            <h4>Proficient Skills</h4>
            <ul className="skills-list">
              {draft.proficientSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Equipment Section */}
      <section className="card-section equipment-section">
        <h3>Equipment</h3>
        <div className="equipment-info">
          {draft.equipment && draft.equipment.length > 0 ? (
            <ul className="equipment-list">
              {draft.equipment.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No equipment selected</p>
          )}

          {draft.startingGold !== undefined && (
            <div className="gold-display">
              <span className="gold-label">Starting Gold:</span>
              <span className="gold-value">{draft.startingGold} gold</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CharacterCard;
