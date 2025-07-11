import React from 'react';
import { cn } from '@/lib/utils';

interface EnergyLevelSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const EnergyLevelSelector: React.FC<EnergyLevelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2">
      {[1,2,3,4,5].map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={cn(
            "flex-1 p-2 rounded-lg text-center transition-colors",
            value === level 
              ? "bg-primary text-primary-foreground shadow-warm" 
              : "bg-white gentle-text interactive-hover"
          )}
        >
          <div className="text-lg">⚡</div>
          <div className="text-xs">{level}</div>
        </button>
      ))}
    </div>
  );
};