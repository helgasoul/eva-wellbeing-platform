import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MenstrualEntry {
  id: string;
  date: string;
  type: 'menstruation' | 'spotting' | 'missed_expected' | 'ovulation_predicted';
  flow: 'light' | 'normal' | 'heavy' | 'very_heavy' | null;
  symptoms: {
    cramping: number;
    breast_tenderness: number;
    bloating: number;
    mood_changes: number;
    headache: boolean;
    back_pain: boolean;
  };
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

interface CycleAnalysisViewProps {
  analysis: CycleAnalysis | null;
  entries: MenstrualEntry[];
}

export const CycleAnalysisView: React.FC<CycleAnalysisViewProps> = ({
  analysis,
  entries
}) => {
  
  if (!analysis) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg mb-2">Недостаточно данных для анализа</p>
              <p className="text-sm">Добавьте записи о менструации для получения подробной аналитики</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Подготавливаем данные для графика симптомов
  const symptomData = entries
    .filter(entry => entry.type === 'menstruation')
    .slice(-12)
    .map(entry => ({
      date: format(new Date(entry.date), 'dd MMM', { locale: ru }),
      cramping: entry.symptoms.cramping,
      mood: entry.symptoms.mood_changes,
      bloating: entry.symptoms.bloating,
      breast: entry.symptoms.breast_tenderness
    }));

  // Данные для графика циклов
  const cycleData = [];
  const menstruationEntries = entries
    .filter(entry => entry.type === 'menstruation')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-6);

  for (let i = 1; i < menstruationEntries.length; i++) {
    const currentDate = new Date(menstruationEntries[i].date);
    const previousDate = new Date(menstruationEntries[i - 1].date);
    const lengthInDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
    
    cycleData.push({
      cycle: `Цикл ${i}`,
      length: lengthInDays,
      date: format(currentDate, 'MMM yyyy', { locale: ru })
    });
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'bg-red-100 text-red-800 border-red-200';
      case 'follicular': return 'bg-green-100 text-green-800 border-green-200';
      case 'ovulatory': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'luteal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPhaseProgress = () => {
    return (analysis.current_cycle.day_of_cycle / analysis.current_cycle.estimated_length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Текущий статус */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🩸 Текущий цикл
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className={`${getPhaseColor(analysis.current_cycle.phase)} text-lg px-4 py-2`}>
                {analysis.current_cycle.phase === 'menstrual' ? 'Менструальная фаза' :
                 analysis.current_cycle.phase === 'follicular' ? 'Фолликулярная фаза' :
                 analysis.current_cycle.phase === 'ovulatory' ? 'Овуляторная фаза' :
                 analysis.current_cycle.phase === 'luteal' ? 'Лютеиновая фаза' :
                 'Нерегулярный цикл'}
              </Badge>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Прогресс цикла</span>
                <span>{analysis.current_cycle.day_of_cycle}/{analysis.current_cycle.estimated_length} дней</span>
              </div>
              <Progress value={getPhaseProgress()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Начало цикла:</span>
                <p className="font-medium">
                  {format(new Date(analysis.current_cycle.start_date), 'dd MMMM', { locale: ru })}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Следующая:</span>
                <p className="font-medium">
                  {analysis.current_cycle.next_predicted_date 
                    ? format(new Date(analysis.current_cycle.next_predicted_date), 'dd MMMM', { locale: ru })
                    : 'Н/Д'}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Точность прогноза: {analysis.current_cycle.confidence}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Статистика циклов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.cycle_history.average_length}
                </div>
                <div className="text-sm text-gray-600">Средняя длина</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.cycle_history.irregularity_score}%
                </div>
                <div className="text-sm text-gray-600">Нерегулярность</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Диапазон:</span>
                <span className="font-medium">
                  {analysis.cycle_history.shortest_cycle}-{analysis.cycle_history.longest_cycle} дней
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Тренд:</span>
                <Badge variant="outline" className="text-xs">
                  {getTrendIcon(analysis.cycle_history.trend)} {
                    analysis.cycle_history.trend === 'stable' ? 'Стабильный' :
                    analysis.cycle_history.trend === 'lengthening' ? 'Удлинение' :
                    analysis.cycle_history.trend === 'shortening' ? 'Укорачивание' :
                    'Нерегулярный'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* График длины циклов */}
      {cycleData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>📈 История циклов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cycleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" />
                <YAxis domain={[20, 40]} />
                <Tooltip 
                  formatter={(value: number) => [`${value} дней`, 'Длина цикла']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="length" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* График симптомов */}
      {symptomData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>📊 Динамика симптомов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={symptomData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="cramping" stroke="#ef4444" name="Спазмы" strokeWidth={2} />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" name="Настроение" strokeWidth={2} />
                <Line type="monotone" dataKey="bloating" stroke="#f59e0b" name="Вздутие" strokeWidth={2} />
                <Line type="monotone" dataKey="breast" stroke="#10b981" name="Грудь" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Индикаторы перименопаузы */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Анализ жизненной стадии
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Вероятная стадия:</span>
            <Badge className={getStageColor(analysis.perimenopause_indicators.probable_stage)}>
              {analysis.perimenopause_indicators.probable_stage === 'premenopause' ? 'Пременопауза' :
               analysis.perimenopause_indicators.probable_stage === 'early_perimenopause' ? 'Ранняя перименопауза' :
               analysis.perimenopause_indicators.probable_stage === 'late_perimenopause' ? 'Поздняя перименопауза' :
               'Менопауза'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Пропущенные циклы:</span>
              <p className="font-medium text-lg">
                {analysis.perimenopause_indicators.missed_periods_count}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Вариабельность:</span>
              <p className="font-medium text-lg">
                {analysis.perimenopause_indicators.cycle_variability} дней
              </p>
            </div>
            <div>
              <span className="text-gray-600">Тренд симптомов:</span>
              <p className="font-medium text-lg">
                {analysis.perimenopause_indicators.symptom_severity_trend === 'increasing' ? '📈 Усиление' :
                 analysis.perimenopause_indicators.symptom_severity_trend === 'decreasing' ? '📉 Ослабление' :
                 '📊 Стабильно'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Рекомендации:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {analysis.perimenopause_indicators.probable_stage === 'premenopause' && (
                <>
                  <li>• Продолжайте вести регулярные записи</li>
                  <li>• Поддерживайте здоровый образ жизни</li>
                  <li>• Обратитесь к врачу при изменениях</li>
                </>
              )}
              {analysis.perimenopause_indicators.probable_stage.includes('perimenopause') && (
                <>
                  <li>• Консультация с гинекологом-эндокринологом</li>
                  <li>• Рассмотрите гормональную терапию</li>
                  <li>• Уделите внимание питанию и упражнениям</li>
                  <li>• Поддержка при симптомах менопаузы</li>
                </>
              )}
              {analysis.perimenopause_indicators.probable_stage === 'menopause' && (
                <>
                  <li>• Регулярные осмотры у врача</li>
                  <li>• Профилактика остеопороза</li>
                  <li>• Поддержание здоровья сердца</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};