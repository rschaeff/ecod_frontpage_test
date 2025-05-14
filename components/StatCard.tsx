'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Percent, Info } from 'lucide-react';

/**
 * StatCard component props interface
 */
interface StatCardProps {
  /** The label/title for the statistic */
  label: string;

  /** The value to display (can be string or number) */
  value: string | number;

  /** Optional previous value to calculate and show change */
  previousValue?: string | number;

  /** Optional description or additional information */
  description?: string;

  /** Whether to animate the value counting up on render */
  animate?: boolean;

  /** Duration of the animation in milliseconds */
  animationDuration?: number;

  /** Format of the value (default, percentage, etc.) */
  format?: 'default' | 'percentage' | 'currency' | 'decimal';

  /** Currency symbol if using currency format */
  currencySymbol?: string;

  /** Number of decimal places to show */
  decimalPlaces?: number;

  /** Icon to display next to the value */
  icon?: React.ReactNode;

  /** Background color for trend indicators */
  trendColors?: {
    positive: string;
    negative: string;
    neutral: string;
  };

  /** CSS class for the card container */
  className?: string;

  /** CSS class for the label */
  labelClassName?: string;

  /** CSS class for the value */
  valueClassName?: string;

  /** Whether to show a trend indicator based on previous value */
  showTrend?: boolean;

  /** Optional link destination */
  href?: string;

  /** Click handler */
  onClick?: () => void;

  /** Whether the data is still loading */
  loading?: boolean;

  /** Text to display when loading */
  loadingText?: string;

  /** ID for the stat card */
  id?: string;

  /** Test ID for testing purposes */
  testId?: string;
}

/**
 * StatCard component for displaying statistics
 *
 * A flexible and customizable card component for displaying statistical information
 * with optional animations, trend indicators, and formatting options.
 */
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  previousValue,
  description,
  animate = false,
  animationDuration = 1000,
  format = 'default',
  currencySymbol = '$',
  decimalPlaces = 2,
  icon,
  trendColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  },
  className = '',
  labelClassName = '',
  valueClassName = '',
  showTrend = false,
  href,
  onClick,
  loading = false,
  loadingText = 'Loading...',
  id,
  testId
}) => {
  // State for animated value
  const [displayValue, setDisplayValue] = useState<string | number>(loading ? loadingText : '0');

  // Effect to handle animation
  useEffect(() => {
    if (loading) {
      setDisplayValue(loadingText);
      return;
    }

    if (animate && typeof value === 'number') {
      const startValue = 0;
      const endValue = value;
      const duration = animationDuration;
      const startTime = performance.now();

      const animateValue = (timestamp: number) => {
        const runtime = timestamp - startTime;
        const relativeProgress = runtime / duration;

        if (relativeProgress < 1) {
          const currentValue = Math.round(startValue + (endValue - startValue) * relativeProgress);
          setDisplayValue(formatValue(currentValue));
          requestAnimationFrame(animateValue);
        } else {
          setDisplayValue(formatValue(endValue));
        }
      };

      requestAnimationFrame(animateValue);
    } else {
      setDisplayValue(formatValue(value));
    }
  }, [value, animate, animationDuration, loading]);

  // Calculate percentage change
  const calculateChange = (): number | null => {
    if (previousValue === undefined || typeof value !== 'number' || typeof previousValue !== 'number') {
      return null;
    }

    if (previousValue === 0) {
      return value > 0 ? 100 : 0;
    }

    return ((value - previousValue) / Math.abs(previousValue)) * 100;
  };

  // Format the value based on specified format
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') {
      return val;
    }

    switch (format) {
      case 'percentage':
        return `${val.toFixed(decimalPlaces)}%`;
      case 'currency':
        return `${currencySymbol}${val.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        })}`;
      case 'decimal':
        return val.toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        });
      default:
        return val.toLocaleString();
    }
  };

  // Determine trend direction
  const getTrendDirection = (): 'up' | 'down' | 'neutral' => {
    const change = calculateChange();

    if (change === null) {
      return 'neutral';
    }

    if (change > 0) {
      return 'up';
    } else if (change < 0) {
      return 'down';
    } else {
      return 'neutral';
    }
  };

  // Get trend indicator color class
  const getTrendColorClass = (): string => {
    const direction = getTrendDirection();

    switch (direction) {
      case 'up':
        return trendColors.positive;
      case 'down':
        return trendColors.negative;
      default:
        return trendColors.neutral;
    }
  };

  // Render trend indicator
  const renderTrendIndicator = () => {
    const direction = getTrendDirection();
    const change = calculateChange();

    if (change === null) {
      return null;
    }

    return (
      <div className={`ml-2 px-2 py-1 rounded-full text-xs flex items-center ${getTrendColorClass()}`}>
        {direction === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
        {direction === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
        {format === 'percentage' && <Percent className="h-3 w-3 ml-0.5" />}
      </div>
    );
  };

  // The content of the card
  const cardContent = (
    <>
      <p className={`text-gray-500 mb-1 ${labelClassName}`}>{label}</p>
      <div className="flex items-center">
        <p className={`text-3xl font-bold text-blue-600 ${valueClassName}`}>
          {icon && <span className="mr-2">{icon}</span>}
          {loading ? loadingText : displayValue}
        </p>
        {showTrend && !loading && renderTrendIndicator()}
      </div>
      {description && (
        <div className="mt-1 flex items-start">
          <Info className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      )}
    </>
  );

  // The base card container classes
  const baseClasses = `bg-white p-6 rounded-lg shadow-md text-center ${className}`;

  // Render either as a link or a button or a div based on props
  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} hover:shadow-lg transition-shadow`}
        id={id}
        data-testid={testId}
        aria-label={`${label}: ${displayValue}`}
      >
        {cardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} hover:shadow-lg transition-shadow w-full text-left`}
        id={id}
        data-testid={testId}
        aria-label={`${label}: ${displayValue}`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div
      className={baseClasses}
      id={id}
      data-testid={testId}
      role="region"
      aria-label={`${label} statistic`}
    >
      {cardContent}
    </div>
  );
};

export default StatCard;
