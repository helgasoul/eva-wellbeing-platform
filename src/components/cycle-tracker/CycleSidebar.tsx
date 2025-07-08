import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface CycleAnalysis {
  current_cycle: {
    start_date: string;
    day_of_cycle: number;
    estimated_length: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular';
    next_predicted_date?: string;
    confidence: number;
  };
  cycle_history: {
    average_length: number;
    shortest_cycle: number;
    longest_cycle: number;
    irregularity_score: number;
    trend: 'stable' | 'lengthening' | 'shortening' | 'irregular';
  };
  perimenopause_indicators: {
    missed_periods_count: number;
    cycle_variability: number;
    symptom_severity_trend: 'increasing' | 'stable' | 'decreasing';
    probable_stage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause';
  };
}

interface UpcomingEvent {
  type: string;
  title: string;
  date: string;
  daysUntil: number;
  icon: string;
  color: string;
}

interface TodayData {
  symptoms: any;
  cycle: any;
  hasData: boolean;
}

interface CycleSidebarProps {
  cycleAnalysis: CycleAnalysis | null;
  onQuickLog: () => void;
}

// Helper functions
const getPhaseName = (phase: string): string => {
  switch (phase) {
    case 'menstrual': return 'Менструальная';
    case 'follicular': return 'Фолликулярная';
    case 'ovulatory': return 'Овуляторная';
    case 'luteal': return 'Лютеиновая';
    case 'irregular': return 'Нерегулярная';
    default: return 'Неопределенная';
  }
};

const getStageLabel = (stage: string): string => {
  switch (stage) {
    case 'premenopause': return 'Пременопауза';
    case 'early_perimenopause': return 'Ранняя перименопауза';
    case 'late_perimenopause': return 'Поздняя перименопауза';
    case 'menopause': return 'Менопауза';
    default: return 'Неопределено';
  }
};

const calculateEstimatedOvulation = (cycleAnalysis: CycleAnalysis | null): string | null => {
  if (!cycleAnalysis?.current_cycle) return null;
  
  const cycleStart = new Date(cycleAnalysis.current_cycle.start_date);
  const estimatedOvulationDay = Math.floor(cycleAnalysis.cycle_history.average_length / 2);
  const ovulationDate = new Date(cycleStart);
  ovulationDate.setDate(cycleStart.getDate() + estimatedOvulationDay);
  
  return ovulationDate.toISOString().split('T')[0];
};

const getDailyTip = (cycleAnalysis: CycleAnalysis | null): string => {
  if (!cycleAnalysis?.current_cycle) {
    return 'Начните отслеживать свой цикл для получения персональных рекомендаций!';
  }

  const phase = cycleAnalysis.current_cycle.phase;
  const dayOfCycle = cycleAnalysis.current_cycle.day_of_cycle;

  switch (phase) {
    case 'menstrual':
      return 'Время отдыха и самозаботы. Пейте больше воды и отдавайте предпочтение легким упражнениям.';
    case 'follicular':
      return 'Энергия растет! Это отличное время для планирования новых проектов и интенсивных тренировок.';
    case 'ovulatory':
      return 'Пик энергии и либидо. Используйте это время для важных встреч и социальных активностей.';
    case 'luteal':
      return 'Время замедлиться. Сосредоточьтесь на завершении дел и подготовке к отдыху.';
    default:
      return 'Ведите дневник симптомов для лучшего понимания своего цикла.';
  }
};

export const CycleSidebar: React.FC<CycleSidebarProps> = ({
  cycleAnalysis,
  onQuickLog
}) => {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    loadTodayData();
    loadUpcomingEvents();
  }, [cycleAnalysis, user]);

  const loadTodayData = () => {
    if (!user?.id) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Данные симптомов на сегодня
    const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user.id}`) || '[]');
    const todaySymptoms = symptomEntries.find((s: any) => s.date === today);
    
    // Данные цикла на сегодня
    const cycleEntries = JSON.parse(localStorage.getItem(`cycle_entries_${user.id}`) || '[]');
    const todayCycle = cycleEntries.find((c: any) => c.date === today);
    
    setTodayData({
      symptoms: todaySymptoms,
      cycle: todayCycle,
      hasData: !!(todaySymptoms || todayCycle)
    });
  };

  const loadUpcomingEvents = () => {
    if (!cycleAnalysis?.current_cycle) return;
    
    const events: UpcomingEvent[] = [];
    const today = new Date();
    
    // Предсказание следующей менструации
    if (cycleAnalysis.current_cycle.next_predicted_date) {
      const nextPeriod = new Date(cycleAnalysis.current_cycle.next_predicted_date);
      const daysUntil = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= 14) {
        events.push({
          type: 'period',
          title: 'Ожидаемая менструация',
          date: cycleAnalysis.current_cycle.next_predicted_date,
          daysUntil,
          icon: '🔴',
          color: 'text-red-600'
        });
      }
    }
    
    // Предсказание овуляции
    const estimatedOvulation = calculateEstimatedOvulation(cycleAnalysis);
    if (estimatedOvulation) {
      const ovulationDate = new Date(estimatedOvulation);
      const daysUntilOvulation = Math.ceil((ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilOvulation > 0 && daysUntilOvulation <= 7) {
        events.push({
          type: 'ovulation',
          title: 'Предполагаемая овуляция',
          date: estimatedOvulation,
          daysUntil: daysUntilOvulation,
          icon: '🌕',
          color: 'text-yellow-600'
        });
      }
    }
    
    setUpcomingEvents(events);
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="space-y-6">
      
      {/* Быстрые действия */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">⚡ Быстрые действия</h3>
        <div className="space-y-3">
          <button
            onClick={onQuickLog}
            className="w-full bg-pink-500 text-white py-2 px-3 rounded-lg hover:bg-pink-600 transition-colors text-sm hover-scale"
          >
            📝 Отметить сегодня
          </button>
          <button 
            onClick={() => handleNavigation('/patient/symptom-tracker')}
            className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm hover-scale"
          >
            🔥 Записать симптомы
          </button>
          <button 
            onClick={() => handleNavigation('/patient/nutrition-tracker')}
            className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm hover-scale"
          >
            🍎 Дневник питания
          </button>
        </div>
      </div>

      {/* Статус сегодня */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">📅 Сегодня</h3>
        
        {cycleAnalysis?.current_cycle ? (
          <div className="space-y-3 animate-fade-in">
            {/* День цикла */}
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">День цикла</span>
                <span className="text-lg font-bold text-purple-600">
                  {cycleAnalysis.current_cycle.day_of_cycle}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Фаза: {getPhaseName(cycleAnalysis.current_cycle.phase)}
              </div>
            </div>

            {/* Данные за сегодня */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Данные за сегодня:</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  todayData?.hasData ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {todayData?.hasData ? "✓ Есть" : "○ Нет"}
                </span>
              </div>
              
              {!todayData?.hasData && (
                <div className="text-xs text-gray-600 bg-yellow-50 rounded p-2 animate-pulse">
                  💡 Не забудьте записать симптомы и состояние
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-gray-600">
              Начните отслеживать цикл для получения персональной аналитики
            </div>
          </div>
        )}
      </div>

      {/* Предстоящие события */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 animate-fade-in">
          <h3 className="font-semibold text-gray-800 mb-4">🔮 Ближайшие события</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 hover-scale">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{event.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className={cn("text-sm font-bold", event.color)}>
                    {event.daysUntil === 1 ? 'Завтра' : `${event.daysUntil} дн`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Совет дня */}
      <DailyTip cycleAnalysis={cycleAnalysis} />

      {/* Быстрая статистика */}
      <QuickStats cycleAnalysis={cycleAnalysis} />
    </div>
  );
};

// Совет дня
const DailyTip: React.FC<{ cycleAnalysis: CycleAnalysis | null }> = ({ cycleAnalysis }) => {
  const tip = getDailyTip(cycleAnalysis);
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-purple-200 animate-fade-in">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        💡 Совет дня
      </h3>
      <div className="text-sm text-gray-700">
        {tip}
      </div>
    </div>
  );
};

// Быстрая статистика
const QuickStats: React.FC<{ cycleAnalysis: CycleAnalysis | null }> = ({ cycleAnalysis }) => {
  if (!cycleAnalysis) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 animate-fade-in">
      <h3 className="font-semibold text-gray-800 mb-4">📊 Статистика</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Средний цикл</span>
          <span className="text-sm font-bold text-blue-600">
            {cycleAnalysis.cycle_history.average_length} дн
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Регулярность</span>
          <span className="text-sm font-bold text-green-600">
            {Math.max(0, 100 - cycleAnalysis.cycle_history.irregularity_score)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Стадия</span>
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
            {getStageLabel(cycleAnalysis.perimenopause_indicators.probable_stage)}
          </span>
        </div>
      </div>
    </div>
  );
};