import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface QuickStatsProps {
  cycleAnalysis: CycleAnalysis | null;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ cycleAnalysis }) => {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'bg-red-100 text-red-800';
      case 'follicular': return 'bg-green-100 text-green-800';
      case 'ovulatory': return 'bg-purple-100 text-purple-800';
      case 'luteal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'Менструация';
      case 'follicular': return 'Фолликулярная';
      case 'ovulatory': return 'Овуляторная';
      case 'luteal': return 'Лютеиновая';
      default: return 'Нерегулярный';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'stable': return '📊';
      case 'lengthening': return '📈';
      case 'shortening': return '📉';
      default: return '🌀';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'premenopause': return 'bg-blue-100 text-blue-800';
      case 'early_perimenopause': return 'bg-orange-100 text-orange-800';
      case 'late_perimenopause': return 'bg-red-100 text-red-800';
      case 'menopause': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!cycleAnalysis) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  const daysUntilNext = cycleAnalysis.current_cycle.next_predicted_date 
    ? Math.ceil((new Date(cycleAnalysis.current_cycle.next_predicted_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      {/* Текущая фаза */}
      <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            🩸 Текущая фаза
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={getPhaseColor(cycleAnalysis.current_cycle.phase)}>
              {getPhaseLabel(cycleAnalysis.current_cycle.phase)}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            День {cycleAnalysis.current_cycle.day_of_cycle} из {cycleAnalysis.current_cycle.estimated_length}
          </p>
        </CardContent>
      </Card>

      {/* Следующая менструация */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            📅 Прогноз
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {daysUntilNext !== null ? `${daysUntilNext} дней` : 'Н/Д'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            до следующей менструации
          </p>
          <div className="mt-2">
            <div className="text-xs text-gray-600">
              Точность: {cycleAnalysis.current_cycle.confidence}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Тренд цикла */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            {getTrendIcon(cycleAnalysis.cycle_history.trend)} Тренд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {cycleAnalysis.cycle_history.average_length} дней
          </div>
          <p className="text-xs text-gray-500 mt-1">
            средняя длина цикла
          </p>
          <div className="text-xs text-gray-600 mt-2">
            Вариабельность: {cycleAnalysis.cycle_history.irregularity_score}%
          </div>
        </CardContent>
      </Card>

      {/* Стадия */}
      <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            🔍 Стадия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={getStageColor(cycleAnalysis.perimenopause_indicators.probable_stage)}>
            {cycleAnalysis.perimenopause_indicators.probable_stage === 'premenopause' ? 'Пременопауза' :
             cycleAnalysis.perimenopause_indicators.probable_stage === 'early_perimenopause' ? 'Ранняя перименопауза' :
             cycleAnalysis.perimenopause_indicators.probable_stage === 'late_perimenopause' ? 'Поздняя перименопауза' :
             'Менопауза'}
          </Badge>
          <p className="text-xs text-gray-500 mt-2">
            Пропущено циклов: {cycleAnalysis.perimenopause_indicators.missed_periods_count}
          </p>
        </CardContent>
      </Card>
    </>
  );
};