import React from 'react';
import './BackgroundCard.css';

interface BackgroundCardProps {
  background: string;
  selected: boolean;
  onSelect: (background: string) => void;
}

const BACKGROUND_DESCRIPTIONS: Record<string, string> = {
  Acolyte: 'Temple servant, divine knowledge',
  Criminal: 'Outlaw past, street connections',
  'Folk Hero': 'Champion of common folk',
  Sage: 'Scholar and researcher',
  Soldier: 'Military training, discipline',
  Urchin: 'Street survivor, resourceful'
};

const BACKGROUND_ICONS: Record<string, string> = {
  Acolyte: '🙏',
  Criminal: '🎭',
  'Folk Hero': '🌾',
  Sage: '📚',
  Soldier: '⚔️',
  Urchin: '🏚️'
};

const BackgroundCard: React.FC<BackgroundCardProps> = ({ background, selected, onSelect }) => {
  return (
    <div
      className={`background-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(background)}
      data-testid={`background-card-${background}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(background);
        }
      }}
    >
      <div className="card-icon">{BACKGROUND_ICONS[background]}</div>
      <div className="card-name">{background}</div>
      <div className="card-description">{BACKGROUND_DESCRIPTIONS[background]}</div>
    </div>
  );
};

export default BackgroundCard;
