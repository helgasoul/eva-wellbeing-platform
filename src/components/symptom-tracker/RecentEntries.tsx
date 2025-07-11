
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
    if (entry.hot_flashes?.count > 0) symptoms.push(`🔥 ${entry.hot_flashes.count}`);
    if (entry.night_sweats?.occurred) symptoms.push('💦');
    if (entry.sleep_data?.quality <= 2) symptoms.push('😴❌');
    if (entry.mood_data?.overall <= 2) symptoms.push('😔');
    return symptoms.length > 0 ? symptoms.join(' ') : '✅';
  };

  // Группируем записи по дням
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.entry_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bloom-card p-6 bg-white/90 backdrop-blur-sm">
      <h3 className="text-lg font-semibold gentle-text mb-4">
        Недавние записи
      </h3>
      
      <div className="space-y-3">
        {Object.entries(entriesByDate)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 7) // Показываем последние 7 дней
          .map(([date, dayEntries]) => (
          <div key={date} className="border border-border rounded-lg p-3">
            <div className="font-medium gentle-text mb-2">
              {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </div>
            
            <div className="space-y-2">
              {(dayEntries as any[])
                .sort((a, b) => (b.entry_time || '00:00:00').localeCompare(a.entry_time || '00:00:00'))
                .map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onDateSelect(entry.entry_date)}
                  className="w-full text-left p-2 rounded-lg interactive-hover gentle-border border bg-gradient-to-r from-white to-bloom-vanilla transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-primary">
                        {(entry.entry_time || '12:00:00').substring(0, 5)}
                      </span>
                      <span className="text-sm soft-text">
                        {getSymptomSummary(entry)}
                      </span>
                    </div>
                    <div className="text-xs soft-text">
                      {new Date(entry.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
