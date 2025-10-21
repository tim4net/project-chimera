/**
 * @file TownApproachingLoader.tsx
 * @description Atmospheric loading screen showing player approaching a town
 * Displays narrative flavor text while town is being generated in background
 */

import React, { useState, useEffect } from 'react';

interface TownApproachingLoaderProps {
  townName?: string;
  characterName?: string;
}

export const TownApproachingLoader: React.FC<TownApproachingLoaderProps> = ({
  townName,
  characterName = 'Adventurer',
}) => {
  const [narrativeIndex, setNarrativeIndex] = useState(0);

  const narrativeSequence = [
    'The road stretches before you...',
    'You make your way through the wilderness...',
    'The path becomes more worn, more traveled...',
    'Smoke begins to rise on the horizon...',
    'Buildings appear in the distance...',
    'The sounds of civilization grow louder...',
    'You approach the town gates...',
  ];

  // Cycle through narrative text
  useEffect(() => {
    const timer = setTimeout(() => {
      setNarrativeIndex((prev) =>
        prev < narrativeSequence.length - 1 ? prev + 1 : prev
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [narrativeIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-900/20 to-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background atmospheric effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl text-amber-100 mb-12 font-bold tracking-wide">
          {townName ? `Approaching ${townName}` : 'Approaching Town'}
        </h1>

        {/* Narrative text with fade animation */}
        <div className="mb-12 h-20 flex items-center justify-center">
          <p
            key={narrativeIndex}
            className="font-serif text-xl md:text-2xl text-amber-50/90 animate-fade-in italic"
          >
            {narrativeSequence[narrativeIndex]}
          </p>
        </div>

        {/* Character name display */}
        <p className="text-lg text-amber-100/70 mb-8">
          {characterName}, your adventure begins...
        </p>

        {/* Loading animation - horizon effect */}
        <div className="relative h-32 mb-8">
          {/* Horizon line that rises */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Sun/glow rising */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 w-16 h-16 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 blur-xl animate-pulse" />
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 w-12 h-12 rounded-full bg-amber-300/80 blur-md animate-pulse" />

          {/* Breath/pulse effect */}
          <style>{`
            @keyframes breath {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 0.8; }
            }
            .animate-breath {
              animation: breath 3s ease-in-out infinite;
            }
            @keyframes fade-in {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.8s ease-out;
            }
          `}</style>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>

        {/* Loading text */}
        <p className="text-amber-100/60 text-sm animate-breath">
          Preparing the town...
        </p>

        {/* Optional: Show elapsed time */}
        <p className="text-amber-100/40 text-xs mt-4">Please wait, this may take up to 60 seconds</p>
      </div>
    </div>
  );
};

export default TownApproachingLoader;
