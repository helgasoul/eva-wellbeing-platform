
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
    <div className="bloom-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Недавние записи
      </h3>
      
      <div className="space-y-2">
        {entries.map(entry => (
          <button
            key={entry.id}
            onClick={() => onDateSelect(entry.date)}
            className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-foreground">
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getSymptomSummary(entry)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
