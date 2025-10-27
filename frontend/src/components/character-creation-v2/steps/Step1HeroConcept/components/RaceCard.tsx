import React, { useState, useEffect } from 'react';
import { getCharacterImage } from '../../../../../services/raceClassImageService';
import './RaceCard.css';

interface RaceCardProps {
  race: string;
  selected: boolean;
  onSelect: (race: string) => void;
}

const RACE_DESCRIPTIONS: Record<string, string> = {
  Aasimar: 'Celestial heritage, radiant soul',
  Dragonborn: 'Draconic ancestry, breath weapon',
  Dwarf: 'Sturdy mountain folk, resilient',
  Elf: 'Graceful and long-lived, keen senses',
  Gnome: 'Small and clever, innate magic',
  'Half-Elf': 'Blend of human and elven traits',
  'Half-Orc': 'Fierce and strong, relentless',
  Halfling: 'Small and lucky, nimble',
  Human: 'Versatile and ambitious',
  Tiefling: 'Infernal heritage, otherworldly'
};

// Fallback emoji icons in case image loading fails
const RACE_ICONS: Record<string, string> = {
  Aasimar: '✨',
  Dragonborn: '🐉',
  Dwarf: '⚒️',
  Elf: '🌿',
  Gnome: '🔮',
  'Half-Elf': '🌓',
  'Half-Orc': '⚔️',
  Halfling: '🍀',
  Human: '👤',
  Tiefling: '🔥'
};

const RaceCard: React.FC<RaceCardProps> = ({ race, selected, onSelect }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const url = await getCharacterImage('race', race);
        setImageUrl(url);
      } catch (error) {
        console.error(`Failed to load image for race ${race}:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [race]);

  return (
    <div
      className={`race-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(race)}
      data-testid={`race-card-${race}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(race);
        }
      }}
    >
      <div className="card-icon">
        {isLoading ? (
          <div className="loading-spinner">⏳</div>
        ) : hasError || !imageUrl ? (
          <span className="fallback-icon">{RACE_ICONS[race]}</span>
        ) : (
          <img
            src={imageUrl}
            alt={`${race} character`}
            className="card-image"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="card-name">{race}</div>
      <div className="card-description">{RACE_DESCRIPTIONS[race]}</div>
    </div>
  );
};

export default RaceCard;
