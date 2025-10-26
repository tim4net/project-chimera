/**
 * @file AlignmentGrid.tsx
 * @description Section 3: 3x3 grid of D&D alignment options with descriptions
 */

import React from 'react';
import type { Alignment } from '../../../types/wizard';

interface AlignmentGridProps {
  alignment: Alignment;
  onAlignmentChange: (alignment: Alignment) => void;
}

interface AlignmentInfo {
  code: string;
  name: Alignment;
  philosophy: string;
  archetype: string;
}

const ALIGNMENTS: AlignmentInfo[] = [
  {
    code: 'LG',
    name: 'Lawful Good',
    philosophy: 'Honor and compassion through law',
    archetype: 'Crusader, Saint',
  },
  {
    code: 'NG',
    name: 'Neutral Good',
    philosophy: 'Good without bias toward law or chaos',
    archetype: 'Benefactor, Hero',
  },
  {
    code: 'CG',
    name: 'Chaotic Good',
    philosophy: 'Freedom and kindness',
    archetype: 'Rebel, Freedom Fighter',
  },
  {
    code: 'LN',
    name: 'Lawful Neutral',
    philosophy: 'Order and tradition above all',
    archetype: 'Judge, Soldier',
  },
  {
    code: 'TN',
    name: 'True Neutral',
    philosophy: 'Balance and pragmatism',
    archetype: 'Druid, Mercenary',
  },
  {
    code: 'CN',
    name: 'Chaotic Neutral',
    philosophy: 'Personal freedom above all',
    archetype: 'Trickster, Wanderer',
  },
  {
    code: 'LE',
    name: 'Lawful Evil',
    philosophy: 'Order through tyranny and control',
    archetype: 'Tyrant, Devil',
  },
  {
    code: 'NE',
    name: 'Neutral Evil',
    philosophy: 'Pure self-interest without honor',
    archetype: 'Villain, Criminal',
  },
  {
    code: 'CE',
    name: 'Chaotic Evil',
    philosophy: 'Destruction and mayhem',
    archetype: 'Demon, Destroyer',
  },
];

export function AlignmentGrid({ alignment, onAlignmentChange }: AlignmentGridProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-2xl text-nuaibria-gold mb-2 tracking-wider">Alignment</h3>
        <p className="text-nuaibria-text-secondary text-sm">
          Choose your character's moral and ethical outlook
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ALIGNMENTS.map((info) => {
          const isSelected = alignment === info.name;
          return (
            <button
              key={info.code}
              type="button"
              onClick={() => onAlignmentChange(info.name)}
              className={`p-4 rounded-lg border-2 transition-all text-left group ${
                isSelected
                  ? 'border-nuaibria-gold bg-nuaibria-gold/10 shadow-glow'
                  : 'border-nuaibria-border hover:border-nuaibria-gold/50 hover:bg-nuaibria-elevated/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-mono text-lg font-bold ${
                    isSelected ? 'text-nuaibria-gold' : 'text-nuaibria-text-accent'
                  }`}
                >
                  {info.code}
                </span>
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-nuaibria-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div
                className={`font-semibold text-sm mb-1 ${
                  isSelected ? 'text-nuaibria-gold' : 'text-nuaibria-text-primary'
                }`}
              >
                {info.name}
              </div>

              <div className="text-xs text-nuaibria-text-muted mb-2 line-clamp-2">
                {info.philosophy}
              </div>

              <div className="text-xs text-nuaibria-text-accent italic">{info.archetype}</div>
            </button>
          );
        })}
      </div>

      <div className="bg-nuaibria-bg/50 border border-nuaibria-gold/20 rounded-lg p-4">
        <p className="text-nuaibria-text-secondary text-sm leading-relaxed">
          <strong className="text-nuaibria-gold">Note:</strong> Alignment is a guide for
          roleplaying, not a restriction. Your choices define your character's journey.
        </p>
      </div>
    </div>
  );
}
