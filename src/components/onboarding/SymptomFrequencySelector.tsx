
import React from 'react';
import { cn } from '@/lib/utils';

interface SymptomFrequencySelectorProps {
  value: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  onChange: (value: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily') => void;
  label: string;
}

const frequencyOptions = [
  { value: 'never' as const, label: 'Никогда', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'rarely' as const, label: 'Редко', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'sometimes' as const, label: 'Иногда', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'often' as const, label: 'Часто', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'daily' as const, label: 'Ежедневно', color: 'bg-red-200 text-red-900 border-red-300' }
];

export const SymptomFrequencySelector: React.FC<SymptomFrequencySelectorProps> = ({
  value,
  onChange,
  label
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground block">
        {label}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {frequencyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105",
              value === option.value
                ? option.color + ' ring-2 ring-eva-dusty-rose ring-offset-2'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
