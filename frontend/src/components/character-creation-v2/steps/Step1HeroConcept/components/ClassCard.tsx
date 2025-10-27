import React, { useState, useEffect } from 'react';
import { getCharacterImage } from '../../../../../services/raceClassImageService';
import './ClassCard.css';

interface ClassCardProps {
  className: string;
  selected: boolean;
  onSelect: (className: string) => void;
}

const CLASS_DESCRIPTIONS: Record<string, string> = {
  Barbarian: 'Fierce warrior, primal rage',
  Bard: 'Charismatic performer, versatile magic',
  Cleric: 'Divine champion, healing power',
  Druid: 'Nature guardian, shape shifter',
  Fighter: 'Master of arms, tactical combat',
  Monk: 'Martial artist, inner discipline',
  Paladin: 'Holy warrior, divine oaths',
  Ranger: 'Wilderness scout, hunter',
  Rogue: 'Cunning infiltrator, precise strikes',
  Sorcerer: 'Innate magic, raw power',
  Warlock: 'Pact magic, eldritch power',
  Wizard: 'Arcane scholar, spellbook master'
};

// Fallback emoji icons in case image loading fails
const CLASS_ICONS: Record<string, string> = {
  Barbarian: '🪓',
  Bard: '🎵',
  Cleric: '✨',
  Druid: '🌳',
  Fighter: '⚔️',
  Monk: '👊',
  Paladin: '🛡️',
  Ranger: '🏹',
  Rogue: '🗡️',
  Sorcerer: '🔥',
  Warlock: '👁️',
  Wizard: '📖'
};

const ClassCard: React.FC<ClassCardProps> = ({ className, selected, onSelect }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const url = await getCharacterImage('class', className);
        setImageUrl(url);
      } catch (error) {
        console.error(`Failed to load image for class ${className}:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [className]);

  return (
    <div
      className={`class-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(className)}
      data-testid={`class-card-${className}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(className);
        }
      }}
    >
      <div className="card-icon">
        {isLoading ? (
          <div className="loading-spinner">⏳</div>
        ) : hasError || !imageUrl ? (
          <span className="fallback-icon">{CLASS_ICONS[className]}</span>
        ) : (
          <img
            src={imageUrl}
            alt={`${className} class`}
            className="card-image"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="card-name">{className}</div>
      <div className="card-description">{CLASS_DESCRIPTIONS[className]}</div>
    </div>
  );
};

export default ClassCard;
