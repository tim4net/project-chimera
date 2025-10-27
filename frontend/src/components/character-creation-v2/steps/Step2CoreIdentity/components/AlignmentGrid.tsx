/**
 * @fileoverview AlignmentGrid - 3×3 grid of D&D 5e alignments
 * Allows selection of character alignment with visual feedback
 */

import React from 'react';
import type { Alignment } from '../../../../../types/wizard';

interface AlignmentGridProps {
  selectedAlignment?: string;
  onSelectAlignment: (alignment: Alignment) => void;
}

const ALIGNMENT_MAP: Record<string, Alignment> = {
  LG: 'Lawful Good',
  NG: 'Neutral Good',
  CG: 'Chaotic Good',
  LN: 'Lawful Neutral',
  TN: 'True Neutral',
  CN: 'Chaotic Neutral',
  LE: 'Lawful Evil',
  NE: 'Neutral Evil',
  CE: 'Chaotic Evil',
};

const AlignmentGrid: React.FC<AlignmentGridProps> = ({
  selectedAlignment,
  onSelectAlignment,
}) => {
  const alignmentCodes = ['LG', 'NG', 'CG', 'LN', 'TN', 'CN', 'LE', 'NE', 'CE'];

  const handleClick = (code: string) => {
    onSelectAlignment(ALIGNMENT_MAP[code]);
  };

  const isSelected = (code: string) => {
    return selectedAlignment === ALIGNMENT_MAP[code];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Alignment
      </label>
      <div
        data-testid="alignment-grid"
        className="grid grid-cols-3 gap-2"
      >
        {alignmentCodes.map((code) => (
          <button
            key={code}
            type="button"
            data-testid={`alignment-button-${code}`}
            onClick={() => handleClick(code)}
            className={`
              px-4 py-3 rounded-md border-2 transition-all
              ${
                isSelected(code)
                  ? 'border-nuaibria-gold bg-nuaibria-gold/10 text-nuaibria-gold'
                  : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }
            `}
          >
            <div className="font-semibold">{code}</div>
            <div className="text-xs mt-1">{ALIGNMENT_MAP[code]}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlignmentGrid;
