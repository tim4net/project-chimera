/**
 * Nuaibria Design System - Slider Component
 *
 * Modern, accessible slider component with smooth animations and real-time value display.
 * Supports keyboard navigation and touch interactions.
 */

import React, { useState, useCallback } from 'react';

export interface SliderProps {
  /** Slider ID (for accessibility) */
  id?: string;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Step increment */
  step?: number;
  /** Label text */
  label?: string;
  /** Whether to show the current value */
  showValue?: boolean;
  /** Value display format function */
  formatValue?: (value: number) => string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Test ID for testing */
  testId?: string;
  /** Show tooltip on hover/drag */
  showTooltip?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  disabled = false,
  className = '',
  ariaLabel,
  testId,
  showTooltip = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onChange(newValue);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      let newValue = value;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, value - step);
          onChange(newValue);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, value + step);
          onChange(newValue);
          break;
        case 'Home':
          e.preventDefault();
          onChange(min);
          break;
        case 'End':
          e.preventDefault();
          onChange(max);
          break;
        default:
          break;
      }
    },
    [value, min, max, step, onChange]
  );

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsDragging(false);
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const showTooltipNow = showTooltip && (isDragging || isHovered);

  return (
    <div className={`slider-container ${className}`}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-semibold text-nuaibria-text-primary"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-mono font-semibold text-nuaibria-gold">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      {/* Slider Input */}
      <div className="relative">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
          data-testid={testId}
          className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Tooltip (appears on hover/drag) */}
        {showTooltipNow && !disabled && (
          <div
            className="absolute -top-10 left-0 pointer-events-none transition-all duration-200"
            style={{ left: `calc(${percentage}% - 24px)` }}
          >
            <div className="bg-nuaibria-purple-2 text-nuaibria-text-primary text-xs font-semibold px-3 py-1.5 rounded shadow-lg border border-nuaibria-gold/30">
              {formatValue(value)}
              {/* Arrow pointing down */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-nuaibria-purple-2 border-b border-r border-nuaibria-gold/30 rotate-45"
              />
            </div>
          </div>
        )}
      </div>

      {/* Min/Max Labels (Optional) */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-nuaibria-text-muted">{min}</span>
        <span className="text-xs text-nuaibria-text-muted">{max}</span>
      </div>
    </div>
  );
};

export default Slider;
