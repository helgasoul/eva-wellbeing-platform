import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';

interface NutritionDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  entries: FoodEntry[];
}

export const NutritionDateSelector: React.FC<NutritionDateSelectorProps> = ({
  selectedDate,
  onDateChange,
  entries
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const hasEntryForDate = (date: string) => {
    return entries.some(entry => entry.date === date);
  };

  const getQuickDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold gentle-text flex items-center">
          <Calendar className="h-5 w-5 text-primary mr-2" />
          Выбор даты
        </h3>
      </div>

      {/* Навигация по дням */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 rounded-lg interactive-hover bg-bloom-vanilla"
        >
          <ChevronLeft className="h-4 w-4 text-primary" />
        </button>
        
        <div className="text-center">
          <div className="font-medium gentle-text">{formatDate(selectedDate)}</div>
          {hasEntryForDate(selectedDate) && (
            <div className="text-xs text-primary">✅ Есть записи</div>
          )}
        </div>
        
        <button
          onClick={() => navigateDate('next')}
          className="p-2 rounded-lg interactive-hover bg-bloom-vanilla"
          disabled={selectedDate >= new Date().toISOString().split('T')[0]}
        >
          <ChevronRight className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Быстрый выбор последних дней */}
      <div>
        <div className="text-xs soft-text mb-2">Последние дни:</div>
        <div className="grid grid-cols-7 gap-1">
          {getQuickDates().map(date => {
            const dayDate = new Date(date + 'T00:00:00');
            const dayName = dayDate.toLocaleDateString('ru-RU', { weekday: 'short' });
            const dayNumber = dayDate.getDate();
            const isSelected = date === selectedDate;
            const hasEntry = hasEntryForDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <button
                key={date}
                onClick={() => onDateChange(date)}
                className={cn(
                  "p-2 rounded-lg text-xs transition-all",
                  isSelected 
                    ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-warm"
                    : "interactive-hover bg-bloom-vanilla gentle-text"
                )}
              >
                <div className="text-center">
                  <div className="font-medium">{dayNumber}</div>
                  <div className="text-xs opacity-75">{dayName}</div>
                  {hasEntry && <div className="text-xs">•</div>}
                  {isToday && !isSelected && <div className="text-xs text-primary">●</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Прямой ввод даты */}
      <div className="mt-4 pt-4 border-t border-bloom-cream">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border border-bloom-cream rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
    </div>
  );
};