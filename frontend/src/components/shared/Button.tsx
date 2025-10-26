/**
 * Nuaibria Design System - Button Component
 *
 * Reusable button component with primary and secondary variants.
 * Supports loading, disabled states, and icon integration.
 */

import React from 'react';

export interface ButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Button type (for forms) */
  type?: 'button' | 'submit' | 'reset';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Callback when button is clicked */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  iconBefore?: React.ReactNode;
  /** Icon to display after text */
  iconAfter?: React.ReactNode;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Test ID for testing */
  testId?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  fullWidth = false,
  iconBefore,
  iconAfter,
  ariaLabel,
  testId,
}) => {
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  const variantClasses = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const widthClasses = fullWidth ? 'w-full' : '';
  const loadingClasses = loading ? 'relative' : '';

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      data-testid={testId}
      className={`${variantClasses} ${widthClasses} ${loadingClasses} ${className} inline-flex items-center justify-center gap-2`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}

      <span className={`inline-flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {iconBefore && <span className="flex-shrink-0">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="flex-shrink-0">{iconAfter}</span>}
      </span>
    </button>
  );
};

/**
 * Spinner Component (Internal)
 */
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Button;
