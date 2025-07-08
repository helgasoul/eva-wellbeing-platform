import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

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

interface DayData {
  cycle?: MenstrualEntry;
  symptoms?: any;
  nutrition?: any;
  activity?: any;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  data: DayData;
  status: {
    phase: string;
    color: string;
    icon: string;
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
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Функция для расчета дня цикла
  const calculateDayOfCycle = (date: string, entries: MenstrualEntry[]): number | null => {
    if (!cycleAnalysis?.current_cycle.start_date) return null;
    
    const startDate = new Date(cycleAnalysis.current_cycle.start_date);
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : null;
  };

  // Функция для получения названия фазы на русском
  const getPhaseName = (phase: string): string => {
    switch (phase) {
      case 'menstrual': return 'Менструальная';
      case 'follicular': return 'Фолликулярная';
      case 'ovulatory': return 'Овуляторная';
      case 'luteal': return 'Лютеиновая';
      default: return 'Неопределена';
    }
  };

  // Интеграция данных с других трекеров
  const getDateData = (date: string): DayData => {
    const cycleEntry = entries.find(e => e.date === date);
    
    // Данные из трекера симптомов
    const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
    const symptomEntry = symptomEntries.find((s: any) => s.date === date);
    
    // Данные питания
    const nutritionEntries = JSON.parse(localStorage.getItem(`nutrition_entries_${user?.id}`) || '[]');
    const nutritionEntry = nutritionEntries.find((n: any) => n.date === date);
    
    // Данные активности
    const activityEntries = JSON.parse(localStorage.getItem(`activity_entries_${user?.id}`) || '[]');
    const activityEntry = activityEntries.find((a: any) => a.date === date);
    
    return {
      cycle: cycleEntry,
      symptoms: symptomEntry,
      nutrition: nutritionEntry,
      activity: activityEntry
    };
  };

  const getDayStatus = (date: string) => {
    const data = getDateData(date);
    const dayOfCycle = calculateDayOfCycle(date, entries);
    
    // Определяем фазу цикла
    if (data.cycle?.type === 'menstruation') {
      return { phase: 'menstrual', color: 'bg-red-100 border-red-400', icon: '🔴' };
    }
    
    if (dayOfCycle && cycleAnalysis?.current_cycle.estimated_length) {
      const cycleLength = cycleAnalysis.current_cycle.estimated_length;
      
      if (dayOfCycle <= 5) {
        return { phase: 'menstrual', color: 'bg-red-50 border-red-200', icon: '🌑' };
      } else if (dayOfCycle <= cycleLength / 2 - 3) {
        return { phase: 'follicular', color: 'bg-green-50 border-green-200', icon: '🌱' };
      } else if (dayOfCycle <= cycleLength / 2 + 3) {
        return { phase: 'ovulatory', color: 'bg-yellow-50 border-yellow-200', icon: '🌕' };
      } else {
        return { phase: 'luteal', color: 'bg-purple-50 border-purple-200', icon: '🌘' };
      }
    }
    
    return { phase: 'unknown', color: 'bg-gray-50 border-gray-200', icon: '⚪' };
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const data = getDateData(dateStr);
        const status = getDayStatus(dateStr);
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          isCurrentMonth,
          isToday,
          data,
          status
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      
      {/* Текущий цикл - краткая информация */}
      {cycleAnalysis?.current_cycle && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📊 Текущий цикл
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cycleAnalysis.current_cycle.day_of_cycle}
                </div>
                <div className="text-sm text-gray-600">День цикла</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cycleAnalysis.current_cycle.estimated_length}
                </div>
                <div className="text-sm text-gray-600">Ожидаемая длина</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {getPhaseName(cycleAnalysis.current_cycle.phase)}
                </div>
                <div className="text-sm text-gray-600">Фаза</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {cycleAnalysis.current_cycle.confidence}%
                </div>
                <div className="text-sm text-gray-600">Уверенность</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Календарь */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          {/* Заголовок календаря */}
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Сегодня
              </Button>
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
          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Дни календаря */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <DayCell
                key={index}
                day={day}
                isSelected={day.date === selectedDate}
                onClick={() => onDateSelect(day.date)}
              />
            ))}
          </div>

          {/* Легенда */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Фазы цикла:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border border-red-400 rounded mr-2"></div>
                <span>🔴 Менструация</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-2"></div>
                <span>🌱 Фолликулярная</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded mr-2"></div>
                <span>🌕 Овуляторная</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-100 border border-purple-400 rounded mr-2"></div>
                <span>🌘 Лютеиновая</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Индикаторы данных:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Цикл</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span>Симптомы</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Питание</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Активность</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка добавления записи */}
      <div className="text-center">
        <Button
          onClick={onAddEntry}
          className="bg-pink-500 text-white hover:bg-pink-600 gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Отметить день цикла
        </Button>
      </div>
    </div>
  );
};

// Компонент ячейки дня
interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, isSelected, onClick }) => {
  const hasSymptoms = day.data.symptoms?.hotFlashes?.count > 0 || 
                     day.data.symptoms?.mood?.overall <= 2 ||
                     day.data.symptoms?.severity > 3;
  const hasNutrition = day.data.nutrition?.meals?.length > 0 ||
                      day.data.nutrition?.totalCalories > 0;
  const hasActivity = day.data.activity?.exercises?.length > 0 ||
                     day.data.activity?.totalMinutes > 0;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 h-20 border-2 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400",
        day.status.color,
        !day.isCurrentMonth && "opacity-50",
        day.isToday && "ring-2 ring-blue-400",
        isSelected && "ring-2 ring-purple-500"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Номер дня */}
        <div className="text-sm font-medium text-gray-800 mb-1">
          {day.day}
        </div>
        
        {/* Индикатор фазы */}
        <div className="flex justify-center mb-1">
          <span className="text-lg">{day.status.icon}</span>
        </div>
        
        {/* Индикаторы данных */}
        <div className="flex justify-center space-x-1 mt-auto">
          {day.data.cycle && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
          {hasSymptoms && (
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
          {hasNutrition && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          {hasActivity && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>
    </button>
  );
};