import React from 'react';
import './HeroPreview.css';

interface HeroPreviewProps {
  race: string;
  className: string;
}

const HeroPreview: React.FC<HeroPreviewProps> = ({ race, className }) => {
  const hasSelections = race || className;

  return (
    <div
      className="hero-preview"
      data-testid="hero-preview"
      data-race={race || ''}
      data-class={className || ''}
    >
      <div className="preview-container">
        {!hasSelections ? (
          <div className="preview-empty">
            <div className="preview-placeholder">
              <svg
                width="200"
                height="300"
                viewBox="0 0 200 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="100"
                  cy="80"
                  rx="40"
                  ry="50"
                  fill="rgba(212, 175, 55, 0.3)"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                />
                <rect
                  x="60"
                  y="130"
                  width="80"
                  height="120"
                  rx="10"
                  fill="rgba(212, 175, 55, 0.3)"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                />
                <line
                  x1="60"
                  y1="150"
                  x2="30"
                  y2="200"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="140"
                  y1="150"
                  x2="170"
                  y2="200"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="70"
                  y1="250"
                  x2="70"
                  y2="290"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="130"
                  y1="250"
                  x2="130"
                  y2="290"
                  stroke="rgba(212, 175, 55, 0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="preview-text">Choose your hero concept</p>
          </div>
        ) : (
          <div className="preview-hero">
            <div className={`hero-silhouette ${race.toLowerCase()} ${className.toLowerCase()}`}>
              <div className="hero-head" />
              <div className="hero-body" />
              <div className="hero-arms" />
              <div className="hero-legs" />
            </div>
            <div className="preview-info">
              {race && <p className="preview-race">{race}</p>}
              {className && <p className="preview-class">{className}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroPreview;
