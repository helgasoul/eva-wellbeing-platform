
import React from 'react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  entries: any[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  entries
}) => {
  // Генерируем последние 7 дней
  const getRecentDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const recentDates = getRecentDates();
  const hasEntry = (date: string) => entries.some(e => e.date === date);

  const formatDateDisplay = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (date === today) return 'Сегодня';
    if (date === yesterdayStr) return 'Вчера';
    
    return d.toLocaleDateString('ru-RU', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="bloom-card p-4">
      <h3 className="font-semibold text-foreground mb-4">Выберите дату</h3>
      
      {/* Быстрый выбор последних дней */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {recentDates.map(date => (
          <button
            key={date}
            onClick={() => onDateChange(date)}
            className={cn(
              "p-2 rounded-lg text-sm font-medium transition-colors relative",
              selectedDate === date
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {formatDateDisplay(date)}
            {hasEntry(date) && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Полный выбор даты */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Или выберите другую дату:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
        />
      </div>
    </div>
  );
};
