
import React from 'react';
import { cn } from '@/lib/utils';

interface RecentEntriesProps {
  entries: any[];
  onDateSelect: (date: string) => void;
}

export const RecentEntries: React.FC<RecentEntriesProps> = ({
  entries,
  onDateSelect
}) => {
  if (entries.length === 0) {
    return null;
  }

  const getSymptomSummary = (entry: any) => {
    const symptoms = [];
    if (entry.hotFlashes?.count > 0) symptoms.push(`🔥 ${entry.hotFlashes.count}`);
    if (entry.nightSweats?.occurred) symptoms.push('💦');
    if (entry.sleep?.quality <= 2) symptoms.push('😴❌');
    if (entry.mood?.overall <= 2) symptoms.push('😔');
    return symptoms.length > 0 ? symptoms.join(' ') : '✅';
  };

  return (
    <div className="bloom-card p-6 bg-white/90 backdrop-blur-sm">
      <h3 className="text-lg font-semibold gentle-text mb-4">
        Недавние записи
      </h3>
      
      <div className="space-y-2">
        {entries.map(entry => (
          <button
            key={entry.id}
            onClick={() => onDateSelect(entry.date)}
            className="w-full text-left p-3 rounded-lg interactive-hover gentle-border border bg-gradient-to-r from-white to-bloom-vanilla transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium gentle-text">
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="text-sm soft-text mt-1">
                  {getSymptomSummary(entry)}
                </div>
              </div>
              <div className="text-sm soft-text">
                {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
