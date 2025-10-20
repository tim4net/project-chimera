import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
}

/**
 * Card component - BG3-inspired card with dark fantasy styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const variantStyles = {
    default: 'bg-nuaibria-surface border border-nuaibria-border shadow-card',
    elevated: 'bg-nuaibria-elevated border border-nuaibria-border shadow-card-hover',
    bordered: 'bg-nuaibria-surface border-2 border-nuaibria-gold/20 shadow-glow'
  };

  const hoverStyles = hover
    ? 'hover:shadow-card-hover hover:border-nuaibria-gold/30 hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  gradient = true
}) => {
  const gradientStyle = gradient
    ? 'bg-gradient-to-r from-nuaibria-gold/20 to-nuaibria-ember/20 border-b border-nuaibria-border'
    : 'border-b border-nuaibria-border';

  return (
    <div className={`px-6 py-4 ${gradientStyle} ${className}`}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`px-6 py-4 border-t border-nuaibria-border bg-nuaibria-bg/50 ${className}`}>
      {children}
    </div>
  );
};
