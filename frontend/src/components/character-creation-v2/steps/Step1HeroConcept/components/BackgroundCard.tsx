import React, { useState, useEffect } from 'react';
import { getCharacterImage } from '../../../../../services/raceClassImageService';
import './BackgroundCard.css';

interface BackgroundCardProps {
  background: string;
  selected: boolean;
  onSelect: (background: string) => void;
}

const BACKGROUND_DESCRIPTIONS: Record<string, string> = {
  Acolyte: 'Temple servant, divine knowledge',
  Charlatan: 'Cunning con artist, smooth talker',
  Criminal: 'Outlaw past, street connections',
  Entertainer: 'Charismatic performer, storyteller',
  'Folk Hero': 'Champion of common folk',
  'Guild Artisan': 'Skilled craftsperson, expertise',
  Hermit: 'Wise recluse, spiritual seeker',
  Noble: 'Aristocrat, refined upbringing',
  Outlander: 'Wilderness wanderer, tracker',
  Sage: 'Scholar and researcher',
  Sailor: 'Seasoned adventurer at sea',
  Soldier: 'Military training, discipline',
  Urchin: 'Street survivor, resourceful'
};

// Fallback emoji icons in case image loading fails
const BACKGROUND_ICONS: Record<string, string> = {
  Acolyte: '🙏',
  Charlatan: '🎭',
  Criminal: '🗡️',
  Entertainer: '🎪',
  'Folk Hero': '🌾',
  'Guild Artisan': '🔨',
  Hermit: '🏔️',
  Noble: '👑',
  Outlander: '🏕️',
  Sage: '📚',
  Sailor: '⛵',
  Soldier: '⚔️',
  Urchin: '🏚️'
};

const BackgroundCard: React.FC<BackgroundCardProps> = ({ background, selected, onSelect }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const url = await getCharacterImage('background', background);
        setImageUrl(url);
      } catch (error) {
        console.error(`Failed to load image for background ${background}:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [background]);

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
      <div className="card-icon">
        {isLoading ? (
          <div className="loading-spinner">⏳</div>
        ) : hasError || !imageUrl ? (
          <span className="fallback-icon">{BACKGROUND_ICONS[background]}</span>
        ) : (
          <img
            src={imageUrl}
            alt={`${background} character`}
            className="card-image"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="card-name">{background}</div>
      <div className="card-description">{BACKGROUND_DESCRIPTIONS[background]}</div>
    </div>
  );
};

export default BackgroundCard;
