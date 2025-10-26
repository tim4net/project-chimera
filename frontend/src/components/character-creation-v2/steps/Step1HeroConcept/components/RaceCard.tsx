import React from 'react';
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
      <div className="card-icon">{RACE_ICONS[race]}</div>
      <div className="card-name">{race}</div>
      <div className="card-description">{RACE_DESCRIPTIONS[race]}</div>
    </div>
  );
};

export default RaceCard;
