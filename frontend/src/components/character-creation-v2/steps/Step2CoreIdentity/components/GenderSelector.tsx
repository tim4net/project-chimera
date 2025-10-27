/**
 * @fileoverview GenderSelector - Dropdown for gender selection
 * Provides 4 standard options with clear labeling
 */

import React, { useState, useRef, useEffect } from 'react';

interface GenderSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
];

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value || 'Select gender...';

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label
        className="block text-sm font-medium"
        style={{ color: 'var(--nuaibria-gold)' }}
      >
        Gender
      </label>
      <div className="relative">
        <button
          type="button"
          data-testid="gender-select"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-lg text-left transition-all duration-200 border"
          style={{
            backgroundColor: 'var(--nuaibria-surface)',
            borderColor: 'rgba(212, 175, 55, 0.3)',
            color: 'var(--nuaibria-text)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
          }}
        >
          <span style={{ color: value ? 'var(--nuaibria-text)' : 'var(--nuaibria-text-secondary)' }}>
            {displayValue}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              style={{ color: 'var(--nuaibria-gold)' }}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute z-10 w-full mt-2 rounded-lg shadow-lg overflow-hidden border"
            style={{
              backgroundColor: 'var(--nuaibria-surface)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
            }}
          >
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-2.5 text-left transition-colors duration-150 border-l-2"
                style={{
                  backgroundColor: value === option ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  color: value === option ? 'var(--nuaibria-gold)' : 'var(--nuaibria-text)',
                  borderLeftColor: value === option ? 'var(--nuaibria-gold)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (value !== option) {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.color = 'var(--nuaibria-gold)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--nuaibria-text)';
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenderSelector;
