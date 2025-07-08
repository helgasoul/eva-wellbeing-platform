import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MenstrualEntry {
  id: string;
  date: string;
  type: 'menstruation' | 'spotting' | 'missed_expected' | 'ovulation_predicted';
  flow: 'light' | 'normal' | 'heavy' | 'very_heavy' | null;
  duration_days?: number;
  symptoms: {
    cramping: number;
    breast_tenderness: number;
    bloating: number;
    mood_changes: number;
    headache: boolean;
    back_pain: boolean;
  };
  notes?: string;
  created_at: string;
}

interface CycleAnalysis {
  current_cycle: {
    start_date: string;
    day_of_cycle: number;
    estimated_length: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular';
    next_predicted_date?: string;
    confidence: number;
  };
}

interface CycleCalendarViewProps {
  entries: MenstrualEntry[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onAddEntry: () => void;
  cycleAnalysis: CycleAnalysis | null;
}

export const CycleCalendarView: React.FC<CycleCalendarViewProps> = ({
  entries,
  selectedDate,
  onDateSelect,
  onAddEntry,
  cycleAnalysis
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(entry => entry.date === dateStr);
  };

  const getDateStyle = (date: Date) => {
    const entry = getEntryForDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = dateStr === selectedDate;
    
    let baseClasses = 'relative w-full h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ';
    
    if (isSelected) {
      baseClasses += 'ring-2 ring-pink-500 ';
    }
    
    if (entry) {
      switch (entry.type) {
        case 'menstruation':
          baseClasses += entry.flow === 'heavy' || entry.flow === 'very_heavy' 
            ? 'bg-red-500 text-white ' 
            : 'bg-red-300 text-white ';
          break;
        case 'spotting':
          baseClasses += 'bg-pink-200 text-pink-800 ';
          break;
        case 'ovulation_predicted':
          baseClasses += 'bg-purple-200 text-purple-800 ';
          break;
        case 'missed_expected':
          baseClasses += 'bg-gray-200 text-gray-600 border-2 border-dashed border-gray-400 ';
          break;
      }
    } else {
      // Проверяем, попадает ли дата в предсказанную фазу цикла
      if (cycleAnalysis && cycleAnalysis.current_cycle.phase) {
        const cycleStart = parseISO(cycleAnalysis.current_cycle.start_date);
        const dayOfCycle = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayOfCycle > 0 && dayOfCycle <= cycleAnalysis.current_cycle.estimated_length) {
          if (dayOfCycle <= 5) {
            baseClasses += 'bg-red-50 ';
          } else if (dayOfCycle <= 14) {
            baseClasses += 'bg-green-50 ';
          } else if (dayOfCycle <= 16) {
            baseClasses += 'bg-purple-50 ';
          } else {
            baseClasses += 'bg-yellow-50 ';
          }
        }
      }
      
      baseClasses += 'hover:bg-gray-100 ';
    }
    
    return baseClasses;
  };

  const renderCalendarDay = (date: Date) => {
    const entry = getEntryForDate(date);
    const dayNum = format(date, 'd');
    
    return (
      <div
        className={getDateStyle(date)}
        onClick={() => onDateSelect(format(date, 'yyyy-MM-dd'))}
      >
        <span>{dayNum}</span>
        {entry && (
          <div className="absolute -top-1 -right-1">
            {entry.type === 'menstruation' && (
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            )}
            {entry.type === 'spotting' && (
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            )}
            {entry.type === 'ovulation_predicted' && (
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Получаем первый день недели для выравнивания календаря
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000) // 6 недель
  });

  const selectedEntry = entries.find(entry => entry.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Календарь */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-800">
              Календарь цикла
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Заголовки дней недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Дни календаря */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <div key={index}>
                {renderCalendarDay(date)}
              </div>
            ))}
          </div>
          
          {/* Легенда */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Легенда:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>Менструация</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-200 rounded"></div>
                <span>Кровянистые выделения</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-200 rounded"></div>
                <span>Овуляция</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border-2 border-dashed border-gray-400 rounded"></div>
                <span>Пропущенная</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Детали выбранного дня */}
      {selectedDate && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(parseISO(selectedDate), 'dd MMMM yyyy', { locale: ru })}
              </CardTitle>
              <Button onClick={onAddEntry} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить запись
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedEntry ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={selectedEntry.type === 'menstruation' ? 'destructive' : 'secondary'}>
                    {selectedEntry.type === 'menstruation' ? '🩸 Менструация' :
                     selectedEntry.type === 'spotting' ? '💧 Кровянистые выделения' :
                     selectedEntry.type === 'ovulation_predicted' ? '🥚 Овуляция' :
                     '❌ Пропущенная'}
                  </Badge>
                  {selectedEntry.flow && (
                    <Badge variant="outline">
                      {selectedEntry.flow === 'light' ? 'Слабые' :
                       selectedEntry.flow === 'normal' ? 'Обычные' :
                       selectedEntry.flow === 'heavy' ? 'Обильные' :
                       'Очень обильные'}
                    </Badge>
                  )}
                </div>
                
                {/* Симптомы */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Симптомы:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedEntry.symptoms.cramping > 0 && (
                      <div>Спазмы: {selectedEntry.symptoms.cramping}/5</div>
                    )}
                    {selectedEntry.symptoms.breast_tenderness > 0 && (
                      <div>Болезненность груди: {selectedEntry.symptoms.breast_tenderness}/5</div>
                    )}
                    {selectedEntry.symptoms.bloating > 0 && (
                      <div>Вздутие: {selectedEntry.symptoms.bloating}/5</div>
                    )}
                    {selectedEntry.symptoms.mood_changes > 0 && (
                      <div>Настроение: {selectedEntry.symptoms.mood_changes}/5</div>
                    )}
                    {selectedEntry.symptoms.headache && <div>✓ Головная боль</div>}
                    {selectedEntry.symptoms.back_pain && <div>✓ Боль в спине</div>}
                  </div>
                </div>
                
                {selectedEntry.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Заметки:</h4>
                    <p className="text-sm text-gray-600">{selectedEntry.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Нет записей на эту дату</p>
                <p className="text-sm mt-1">Нажмите "Добавить запись", чтобы начать отслеживание</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};