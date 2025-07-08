import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Calendar, Heart } from 'lucide-react';

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

interface CycleSidebarProps {
  cycleAnalysis: CycleAnalysis | null;
  onQuickLog: () => void;
}

export const CycleSidebar: React.FC<CycleSidebarProps> = ({
  cycleAnalysis,
  onQuickLog
}) => {
  const getPhaseProgress = () => {
    if (!cycleAnalysis) return 0;
    return (cycleAnalysis.current_cycle.day_of_cycle / cycleAnalysis.current_cycle.estimated_length) * 100;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'text-red-600';
      case 'follicular': return 'text-green-600';
      case 'ovulatory': return 'text-purple-600';
      case 'luteal': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'Время отдыха и восстановления. Прислушивайтесь к своему телу.';
      case 'follicular':
        return 'Энергия растет! Отличное время для новых проектов.';
      case 'ovulatory':
        return 'Пик энергии и настроения. Используйте это время максимально.';
      case 'luteal':
        return 'Время замедления. Сосредоточьтесь на завершении дел.';
      default:
        return 'Цикл нерегулярный. Ведите подробные записи для анализа.';
    }
  };

  const getRecommendations = () => {
    if (!cycleAnalysis) return [];
    
    const phase = cycleAnalysis.current_cycle.phase;
    switch (phase) {
      case 'menstrual':
        return [
          '🛀 Тёплые ванны для расслабления',
          '🥗 Продукты богатые железом',
          '😴 Больше отдыха и сна',
          '🧘‍♀️ Лёгкая йога или растяжка'
        ];
      case 'follicular':
        return [
          '🏃‍♀️ Интенсивные тренировки',
          '🥬 Свежие овощи и фрукты',
          '📚 Планирование новых проектов',
          '☕ Умеренное потребление кофеина'
        ];
      case 'ovulatory':
        return [
          '💃 Танцы и активные виды спорта',
          '🥑 Здоровые жиры (авокадо, орехи)',
          '👥 Социальная активность',
          '📝 Важные переговоры и презентации'
        ];
      case 'luteal':
        return [
          '🍫 Магний для снижения тяги к сладкому',
          '🚶‍♀️ Спокойные прогулки',
          '📱 Ограничение стрессовых ситуаций',
          '🛏️ Регулярный режим сна'
        ];
      default:
        return [
          '📊 Ведите подробный дневник',
          '👩‍⚕️ Консультация с врачом',
          '🧘‍♀️ Практики снижения стресса',
          '⏰ Регулярный режим дня'
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Быстрое добавление */}
      <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Быстрая запись
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onQuickLog}
            className="w-full bg-white text-pink-600 hover:bg-pink-50"
          >
            Добавить запись о цикле
          </Button>
        </CardContent>
      </Card>

      {/* Текущая фаза */}
      {cycleAnalysis && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Текущая фаза
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPhaseColor(cycleAnalysis.current_cycle.phase)}`}>
                {cycleAnalysis.current_cycle.phase === 'menstrual' ? 'Менструальная' :
                 cycleAnalysis.current_cycle.phase === 'follicular' ? 'Фолликулярная' :
                 cycleAnalysis.current_cycle.phase === 'ovulatory' ? 'Овуляторная' :
                 cycleAnalysis.current_cycle.phase === 'luteal' ? 'Лютеиновая' :
                 'Нерегулярная'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getPhaseDescription(cycleAnalysis.current_cycle.phase)}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Прогресс цикла</span>
                <span>{cycleAnalysis.current_cycle.day_of_cycle}/{cycleAnalysis.current_cycle.estimated_length} дней</span>
              </div>
              <Progress value={getPhaseProgress()} className="h-2" />
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Точность прогноза: {cycleAnalysis.current_cycle.confidence}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Рекомендации */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRecommendations().map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-lg leading-none">
                  {rec.split(' ')[0]}
                </span>
                <span className="text-gray-600">
                  {rec.split(' ').slice(1).join(' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      {cycleAnalysis && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ваша статистика
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Средний цикл:</span>
              <span className="font-medium">{cycleAnalysis.cycle_history.average_length} дней</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Диапазон:</span>
              <span className="font-medium">
                {cycleAnalysis.cycle_history.shortest_cycle}-{cycleAnalysis.cycle_history.longest_cycle} дней
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Нерегулярность:</span>
              <span className="font-medium">{cycleAnalysis.cycle_history.irregularity_score}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Тренд:</span>
              <Badge variant="outline" className="text-xs">
                {cycleAnalysis.cycle_history.trend === 'stable' ? 'Стабильный' :
                 cycleAnalysis.cycle_history.trend === 'lengthening' ? 'Удлинение' :
                 cycleAnalysis.cycle_history.trend === 'shortening' ? 'Укорачивание' :
                 'Нерегулярный'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};