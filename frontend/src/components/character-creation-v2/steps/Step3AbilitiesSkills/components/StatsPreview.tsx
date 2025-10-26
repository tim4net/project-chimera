import React from 'react';
import { calculateModifier } from '../utils/abilityScoreCalculations';

export interface StatsPreviewProps {
  proficiencyBonus: number;
  constitutionScore: number;
  hitDie: number;
  armorClass?: number;
  dexterityScore?: number;
}

export const StatsPreview: React.FC<StatsPreviewProps> = ({
  proficiencyBonus,
  constitutionScore,
  hitDie,
  armorClass,
  dexterityScore,
}) => {
  const conModifier = calculateModifier(constitutionScore);
  const hitPoints = hitDie + conModifier;
  const ac = armorClass || 10 + (dexterityScore ? calculateModifier(dexterityScore) : 0);

  return (
    <div className="stats-preview">
      <h3 className="stats-title">Character Stats</h3>

      <div className="stats-grid">
        <div className="stat-card proficiency">
          <div className="stat-label">Proficiency Bonus</div>
          <div className="stat-value">+{proficiencyBonus}</div>
          <div className="stat-note">Level 1</div>
        </div>

        <div className="stat-card hp">
          <div className="stat-label">Hit Points</div>
          <div className="stat-value">{hitPoints}</div>
          <div className="stat-note">
            {hitDie} (hit die) + {conModifier >= 0 ? '+' : ''}{conModifier} (CON)
          </div>
        </div>

        <div className="stat-card ac">
          <div className="stat-label">Armor Class</div>
          <div className="stat-value">{ac}</div>
          <div className="stat-note">Unarmored</div>
        </div>
      </div>

      <style jsx>{`
        .stats-preview {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stats-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .stat-card.proficiency {
          border-top: 3px solid #8b5cf6;
        }

        .stat-card.hp {
          border-top: 3px solid #dc2626;
        }

        .stat-card.ac {
          border-top: 3px solid #2563eb;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-note {
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 12px;
          }

          .stat-value {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};
