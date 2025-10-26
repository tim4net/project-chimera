/**
 * @file PageIndicator.tsx
 * @description Visual indicator showing current page with navigation dots
 */

import React from 'react';
import type { PageNumber } from './types';

interface PageIndicatorProps {
  /**
   * Current active page
   */
  currentPage: PageNumber;

  /**
   * Total number of pages
   */
  totalPages: 3;

  /**
   * Which pages are valid/complete
   */
  validPages: Set<PageNumber>;

  /**
   * Called when user clicks a dot to navigate
   * @param page - Target page number
   */
  onNavigate: (page: PageNumber) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageIndicator Component
 * Displays 3 dots representing the 3 wizard pages
 * - Current page is highlighted
 * - Clicking a dot navigates to that page (if valid)
 * - Fully accessible with ARIA labels
 */
export const PageIndicator: React.FC<PageIndicatorProps> = ({
  currentPage,
  validPages,
  onNavigate,
  className = '',
}) => {
  const pages: PageNumber[] = [1, 2, 3];

  const handleClick = (page: PageNumber) => {
    // Only allow navigation to valid pages or current page
    if (page === currentPage || validPages.has(page) || page === 1) {
      onNavigate(page);
    }
  };

  const isPageAccessible = (page: PageNumber): boolean => {
    return page === 1 || page === currentPage || validPages.has(page);
  };

  return (
    <nav
      className={`flex items-center justify-center gap-3 ${className}`}
      role="navigation"
      aria-label="Character creation progress"
    >
      {pages.map((page) => {
        const isCurrent = page === currentPage;
        const isValid = validPages.has(page);
        const isAccessible = isPageAccessible(page);

        return (
          <button
            key={page}
            type="button"
            onClick={() => handleClick(page)}
            disabled={!isAccessible}
            className={`
              relative w-3 h-3 rounded-full transition-all duration-200
              ${isCurrent
                ? 'bg-nuaibria-gold shadow-glow scale-125'
                : isValid
                  ? 'bg-nuaibria-gold/60 hover:bg-nuaibria-gold/80'
                  : 'bg-nuaibria-border'
              }
              ${isAccessible && !isCurrent
                ? 'cursor-pointer hover:scale-110'
                : ''
              }
              ${!isAccessible
                ? 'opacity-50 cursor-not-allowed'
                : ''
              }
              focus:outline-none focus:ring-2 focus:ring-nuaibria-gold/50 focus:ring-offset-2 focus:ring-offset-nuaibria-bg
            `}
            aria-label={`Page ${page}${isCurrent ? ' (current)' : ''}${isValid ? ' (complete)' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
            aria-disabled={!isAccessible}
          >
            {/* Outer ring for current page */}
            {isCurrent && (
              <span
                className="absolute inset-0 -m-1 rounded-full border-2 border-nuaibria-gold/50 animate-pulse"
                aria-hidden="true"
              />
            )}

            {/* Checkmark for completed pages */}
            {isValid && !isCurrent && (
              <svg
                className="absolute inset-0 -m-0.5 w-4 h-4 text-nuaibria-gold"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default PageIndicator;
