import React from 'react';
import { cn } from '@/lib/utils';

interface ComfortLevelSelectorProps {
  value: number;
  onChange: (value: number) => void;
  labels: string[];
}

export const ComfortLevelSelector: React.FC<ComfortLevelSelectorProps> = ({ 
  value, 
  onChange, 
  labels 
}) => {
  return (
    <div className="flex space-x-2">
      {[1,2,3,4,5].map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={cn(
            "flex-1 p-2 rounded-lg text-center transition-colors text-xs",
            value === level 
              ? "bg-primary text-white shadow-warm" 
              : "bg-white gentle-text interactive-hover"
          )}
        >
          <div className="font-medium">{level}</div>
          <div className="text-xs">{labels[level - 1]}</div>
        </button>
      ))}
    </div>
  );
};