
import React from 'react';
import { cn } from '@/lib/utils';

interface SeverityScaleProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}

const severityEmojis = ['😌', '😐', '😕', '😰', '😵'];

export const SeverityScale: React.FC<SeverityScaleProps> = ({
  value,
  onChange,
  label,
  min = 1,
  max = 10
}) => {
  const getEmojiForValue = (val: number) => {
    if (val <= 2) return severityEmojis[0];
    if (val <= 4) return severityEmojis[1];
    if (val <= 6) return severityEmojis[2];
    if (val <= 8) return severityEmojis[3];
    return severityEmojis[4];
  };

  const getDescription = (val: number) => {
    if (val <= 2) return 'Очень слабо';
    if (val <= 4) return 'Слабо';
    if (val <= 6) return 'Умеренно';
    if (val <= 8) return 'Сильно';
    return 'Очень сильно';
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground block">
        {label}
      </label>
      
      <div className="text-center">
        <div className="text-4xl mb-2">
          {getEmojiForValue(value)}
        </div>
        <div className="text-lg font-medium text-primary mb-1">
          {value}
        </div>
        <div className="text-sm text-muted-foreground">
          {getDescription(value)}
        </div>
      </div>

      <div className="flex justify-between items-center space-x-1">
        {Array.from({ length: max - min + 1 }, (_, index) => {
          const scaleValue = min + index;
          return (
            <button
              key={scaleValue}
              type="button"
              onClick={() => onChange(scaleValue)}
              className={cn(
                "w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 hover:scale-110",
                value === scaleValue
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-2'
                  : 'bg-muted text-primary hover:bg-accent'
              )}
            >
              {scaleValue}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Слабо</span>
        <span>Сильно</span>
      </div>
    </div>
  );
};
