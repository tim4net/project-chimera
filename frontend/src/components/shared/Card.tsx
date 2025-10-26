/**
 * Nuaibria Design System - Card Component
 *
 * Reusable card component for selectable items (races, classes, backgrounds).
 * Supports hover, selected, and disabled states with smooth animations.
 */

import React from 'react';

export interface CardProps {
  /** Whether the card is currently selected */
  selected?: boolean;
  /** Whether the card is disabled (not clickable) */
  disabled?: boolean;
  /** Callback when card is clicked */
  onClick?: () => void;
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Variant style (default or compact) */
  variant?: 'default' | 'compact';
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Test ID for testing */
  testId?: string;
}

export const Card: React.FC<CardProps> = ({
  selected = false,
  disabled = false,
  onClick,
  children,
  className = '',
  variant = 'default',
  ariaLabel,
  testId,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  const baseClasses = 'card';
  const variantClasses = variant === 'compact' ? 'p-3' : '';
  const stateClasses = `${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${baseClasses} ${variantClasses} ${stateClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
