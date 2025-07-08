import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('6months');
  
  if (!analysis) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Недостаточно данных для анализа
          </h3>
          <p className="text-gray-600">
            Отслеживайте цикл минимум 2 месяца для получения детального анализа
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Заголовок с выбором периода */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              📊 Анализ цикла
            </CardTitle>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['3months', '6months', '1year'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="text-sm"
                >
                  {period === '3months' ? '3 месяца' : 
                   period === '6months' ? '6 месяцев' : '1 год'}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-gray-600">
            Детальный анализ вашего менструального цикла и признаков перименопаузы
          </p>
        </CardHeader>
      </Card>

      {/* Основная статистика цикла */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CycleStatCard
          title="Средняя длина цикла"
          value={`${analysis.cycle_history.average_length} дней`}
          icon="📅"
          color="bg-blue-50 border-blue-200"
          trend={analysis.cycle_history.trend}
        />
        <CycleStatCard
          title="Вариация цикла"
          value={`±${Math.abs(analysis.cycle_history.longest_cycle - analysis.cycle_history.shortest_cycle)} дней`}
          icon="📊"
          color="bg-purple-50 border-purple-200"
          description={`${analysis.cycle_history.shortest_cycle}-${analysis.cycle_history.longest_cycle} дней`}
        />
        <CycleStatCard
          title="Регулярность"
          value={`${100 - analysis.cycle_history.irregularity_score}%`}
          icon="⭐"
          color={analysis.cycle_history.irregularity_score < 30 ? "bg-green-50 border-green-200" : 
                analysis.cycle_history.irregularity_score < 60 ? "bg-yellow-50 border-yellow-200" : 
                "bg-red-50 border-red-200"}
          description={getRegularityDescription(analysis.cycle_history.irregularity_score)}
        />
        <CycleStatCard
          title="Фаза менопаузы"
          value={getStageLabel(analysis.perimenopause_indicators.probable_stage)}
          icon="🌸"
          color="bg-pink-50 border-pink-200"
        />
      </div>

      {/* График длительности циклов */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            📈 Динамика длительности циклов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CycleLengthChart entries={entries} period={selectedPeriod} />
        </CardContent>
      </Card>

      {/* Признаки перименопаузы */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            🔍 Признаки перименопаузы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerimenopausalIndicators indicators={analysis.perimenopause_indicators} />
        </CardContent>
      </Card>

      {/* Паттерны симптомов по фазам */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            🌙 Симптомы по фазам цикла
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomPatternsByPhase entries={entries} />
        </CardContent>
      </Card>

      {/* Рекомендации на основе анализа */}
      <CycleRecommendations analysis={analysis} />
    </div>
  );
};

// Карточка статистики цикла
interface CycleStatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
  description?: string;
}

const CycleStatCard: React.FC<CycleStatCardProps> = ({ title, value, icon, color, trend, description }) => (
  <Card className={cn("border-2", color)}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <Badge variant="outline" className={cn(
            "text-xs",
            trend === 'lengthening' ? 'text-red-600 border-red-300' :
            trend === 'shortening' ? 'text-blue-600 border-blue-300' : 'text-green-600 border-green-300'
          )}>
            {trend === 'lengthening' ? (
              <>
                <TrendingUp className="w-3 h-3 mr-1" />
                Удлиняется
              </>
            ) : trend === 'shortening' ? (
              <>
                <TrendingDown className="w-3 h-3 mr-1" />
                Укорачивается
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 mr-1" />
                Стабильно
              </>
            )}
          </Badge>
        )}
      </div>
      <h4 className="text-sm font-medium text-gray-700 mb-1">{title}</h4>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      {description && (
        <div className="text-xs text-gray-600">{description}</div>
      )}
    </CardContent>
  </Card>
);

// График длительности циклов
interface CycleLengthChartProps {
  entries: MenstrualEntry[];
  period: '3months' | '6months' | '1year';
}

const CycleLengthChart: React.FC<CycleLengthChartProps> = ({ entries, period }) => {
  const cycles = calculateCycles(entries, period);
  
  if (cycles.length < 2) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">Недостаточно данных для построения графика</p>
      </div>
    );
  }

  const maxLength = Math.max(...cycles.map(c => c.length));
  const minLength = Math.min(...cycles.map(c => c.length));
  const range = maxLength - minLength;

  return (
    <div className="space-y-4">
      {/* Легенда */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Длительность цикла</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>Средняя (28 дней)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span>Норма (21-35 дней)</span>
        </div>
      </div>

      {/* График */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Фоновая сетка */}
          {[21, 28, 35].map(line => (
            <line
              key={line}
              x1="0"
              x2="100"
              y1={((35 - line) / 14) * 100}
              y2={((35 - line) / 14) * 100}
              stroke={line === 28 ? "#ef4444" : "#d1d5db"}
              strokeWidth={line === 28 ? "0.5" : "0.2"}
              strokeDasharray={line === 28 ? "none" : "1,1"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          
          {/* Линия цикла */}
          <polyline
            points={cycles.map((cycle, index) => 
              `${(index / Math.max(cycles.length - 1, 1)) * 100},${((35 - cycle.length) / 14) * 100}`
            ).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Точки данных */}
          {cycles.map((cycle, index) => (
            <circle
              key={index}
              cx={(index / Math.max(cycles.length - 1, 1)) * 100}
              cy={((35 - cycle.length) / 14) * 100}
              r="1"
              fill="#3b82f6"
              className="hover:r-2 transition-all cursor-pointer"
            >
              <title>{`Цикл ${index + 1}: ${cycle.length} дней`}</title>
            </circle>
          ))}
        </svg>
        
        {/* Подписи осей */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 mt-2">
          <span>Цикл 1</span>
          <span>Цикл {Math.floor(cycles.length / 2)}</span>
          <span>Цикл {cycles.length}</span>
        </div>
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 -ml-8">
          <span>35</span>
          <span>28</span>
          <span>21</span>
        </div>
      </div>
      
      {/* Анализ тренда */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">📊 Анализ тренда:</h4>
        <div className="text-sm text-blue-700">
          <p>• Последние 3 цикла: {cycles.slice(-3).map(c => c.length).join(', ')} дней</p>
          <p>• Вариация: {range} дней (норма: до 7 дней)</p>
          <p>• {range > 7 ? '⚠️ Повышенная нерегулярность' : '✅ Нормальная вариация'}</p>
        </div>
      </div>
    </div>
  );
};

// Индикаторы перименопаузы
interface PerimenopausalIndicatorsProps {
  indicators: CycleAnalysis['perimenopause_indicators'];
}

const PerimenopausalIndicators: React.FC<PerimenopausalIndicatorsProps> = ({ indicators }) => {
  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'premenopause':
        return { 
          label: 'Пременопауза', 
          color: 'bg-green-100 text-green-800',
          description: 'Регулярные циклы, минимальные изменения'
        };
      case 'early_perimenopause':
        return { 
          label: 'Ранняя перименопауза', 
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Небольшие изменения в длительности цикла'
        };
      case 'late_perimenopause':
        return { 
          label: 'Поздняя перименопауза', 
          color: 'bg-orange-100 text-orange-800',
          description: 'Значительные изменения, пропуски циклов'
        };
      case 'menopause':
        return { 
          label: 'Менопауза', 
          color: 'bg-red-100 text-red-800',
          description: 'Отсутствие менструации 12+ месяцев'
        };
      default:
        return { 
          label: 'Определение...', 
          color: 'bg-gray-100 text-gray-800',
          description: 'Необходимо больше данных'
        };
    }
  };

  const stageInfo = getStageInfo(indicators.probable_stage);

  return (
    <div className="space-y-6">
      
      {/* Текущая стадия */}
      <div className="text-center">
        <Badge className={cn("text-lg font-semibold px-4 py-2", stageInfo.color)}>
          {stageInfo.label}
        </Badge>
        <p className="text-gray-600 mt-2">{stageInfo.description}</p>
      </div>

      {/* Детальные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-800 mb-2">Пропущенные циклы</h4>
            <div className="text-2xl font-bold text-purple-600">
              {indicators.missed_periods_count}
            </div>
            <div className="text-sm text-gray-600">
              {indicators.missed_periods_count === 0 ? 'Нет пропусков' :
               indicators.missed_periods_count < 3 ? 'Редкие пропуски' :
               indicators.missed_periods_count < 6 ? 'Умеренные пропуски' : 'Частые пропуски'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-800 mb-2">Вариабельность</h4>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(indicators.cycle_variability * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              {indicators.cycle_variability < 0.2 ? 'Низкая' :
               indicators.cycle_variability < 0.4 ? 'Умеренная' : 'Высокая'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-800 mb-2">Тренд симптомов</h4>
            <div className="text-2xl font-bold text-orange-600">
              {indicators.symptom_severity_trend === 'increasing' ? '📈' :
               indicators.symptom_severity_trend === 'decreasing' ? '📉' : '➡️'}
            </div>
            <div className="text-sm text-gray-600">
              {indicators.symptom_severity_trend === 'increasing' ? 'Усиливаются' :
               indicators.symptom_severity_trend === 'decreasing' ? 'Уменьшаются' : 'Стабильно'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Рекомендации по стадии */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">💡 Рекомендации для вашей стадии:</h4>
        <div className="space-y-2 text-sm text-blue-700">
          {getStageRecommendations(indicators.probable_stage).map((rec, index) => (
            <div key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Паттерны симптомов по фазам
interface SymptomPatternsByPhaseProps {
  entries: MenstrualEntry[];
}

const SymptomPatternsByPhase: React.FC<SymptomPatternsByPhaseProps> = ({ entries }) => {
  const symptomsByPhase = analyzeSymptomsByPhase(entries);
  
  if (!symptomsByPhase || Object.keys(symptomsByPhase).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌙</div>
        <p className="text-gray-600">Недостаточно данных о симптомах по фазам цикла</p>
      </div>
    );
  }

  const phases = [
    { key: 'menstrual', name: 'Менструальная', icon: '🔴', color: 'bg-red-50 border-red-200' },
    { key: 'follicular', name: 'Фолликулярная', icon: '🌱', color: 'bg-green-50 border-green-200' },
    { key: 'ovulatory', name: 'Овуляторная', icon: '🌕', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'luteal', name: 'Лютеиновая', icon: '🌘', color: 'bg-purple-50 border-purple-200' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {phases.map(phase => (
        <Card key={phase.key} className={cn("border-2", phase.color)}>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">{phase.icon}</span>
              <h4 className="font-semibold text-gray-800">{phase.name}</h4>
            </div>
            
            {symptomsByPhase[phase.key] ? (
              <div className="space-y-2">
                {Object.entries(symptomsByPhase[phase.key]).map(([symptom, severity]) => (
                  <div key={symptom} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 capitalize">
                      {symptom.replace('_', ' ')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-current h-2 rounded-full"
                          style={{ width: `${((severity as number) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{severity}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Недостаточно данных</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Рекомендации на основе анализа
interface CycleRecommendationsProps {
  analysis: CycleAnalysis;
}

const CycleRecommendations: React.FC<CycleRecommendationsProps> = ({ analysis }) => {
  const recommendations = generateCycleRecommendations(analysis);
  
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          🎯 Персональные рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((category, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start text-sm text-gray-700">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Вспомогательные функции
const getRegularityDescription = (irregularityScore: number): string => {
  if (irregularityScore < 30) return 'Очень регулярно';
  if (irregularityScore < 60) return 'Умеренно регулярно';
  return 'Нерегулярно';
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

const calculateCycles = (entries: MenstrualEntry[], period: string) => {
  const menstrualEntries = entries
    .filter(e => e.type === 'menstruation')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const cycles = [];
  for (let i = 1; i < menstrualEntries.length; i++) {
    const prevDate = new Date(menstrualEntries[i - 1].date);
    const currDate = new Date(menstrualEntries[i].date);
    const length = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (length > 15 && length < 45) {
      cycles.push({ 
        length, 
        startDate: menstrualEntries[i - 1].date,
        endDate: menstrualEntries[i].date
      });
    }
  }
  
  // Фильтруем по периоду
  const now = new Date();
  const periodMonths = period === '3months' ? 3 : period === '6months' ? 6 : 12;
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, now.getDate());
  
  return cycles.filter(cycle => new Date(cycle.startDate) >= cutoffDate);
};

const getStageRecommendations = (stage: string): string[] => {
  switch (stage) {
    case 'premenopause':
      return [
        'Поддерживайте регулярную физическую активность',
        'Следите за здоровым питанием',
        'Регулярные гинекологические осмотры',
        'Управляйте стрессом'
      ];
    case 'early_perimenopause':
      return [
        'Увеличьте потребление кальция и витамина D',
        'Рассмотрите йогу и медитацию',
        'Ведите дневник симптомов',
        'Обсудите с врачом гормональную терапию'
      ];
    case 'late_perimenopause':
      return [
        'Регулярные консультации с гинекологом',
        'Контроль плотности костной ткани',
        'Поддержка сердечно-сосудистой системы',
        'Психологическая поддержка при необходимости'
      ];
    case 'menopause':
      return [
        'Профилактика остеопороза',
        'Контроль веса и физическая активность',
        'Регулярные медицинские обследования',
        'Заместительная гормональная терапия по показаниям'
      ];
    default:
      return [
        'Ведите дневник цикла',
        'Здоровый образ жизни',
        'Регулярные медосмотры'
      ];
  }
};

const analyzeSymptomsByPhase = (entries: MenstrualEntry[]) => {
  // Упрощенный анализ симптомов по фазам
  const phases = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
  const result: Record<string, Record<string, number>> = {};
  
  phases.forEach(phase => {
    const phaseEntries = entries.filter(entry => {
      // Упрощенное определение фазы по типу записи
      if (phase === 'menstrual' && entry.type === 'menstruation') return true;
      if (phase === 'ovulatory' && entry.type === 'ovulation_predicted') return true;
      return false;
    });
    
    if (phaseEntries.length > 0) {
      const avgSymptoms = {
        cramping: phaseEntries.reduce((sum, e) => sum + e.symptoms.cramping, 0) / phaseEntries.length,
        bloating: phaseEntries.reduce((sum, e) => sum + e.symptoms.bloating, 0) / phaseEntries.length,
        mood_changes: phaseEntries.reduce((sum, e) => sum + e.symptoms.mood_changes, 0) / phaseEntries.length,
        breast_tenderness: phaseEntries.reduce((sum, e) => sum + e.symptoms.breast_tenderness, 0) / phaseEntries.length
      };
      
      result[phase] = avgSymptoms;
    }
  });
  
  return result;
};

const generateCycleRecommendations = (analysis: CycleAnalysis) => {
  const recommendations = [];
  
  // Рекомендации по питанию
  recommendations.push({
    icon: '🍎',
    title: 'Питание',
    items: [
      'Увеличьте потребление железа в период менструации',
      'Добавьте в рацион продукты с магнием',
      'Ограничьте кофеин во второй половине цикла',
      'Употребляйте больше омега-3 жирных кислот'
    ]
  });
  
  // Рекомендации по активности
  recommendations.push({
    icon: '🏃‍♀️',
    title: 'Физическая активность',
    items: [
      'Кардио тренировки в первой половине цикла',
      'Йога и растяжка во время менструации',
      'Силовые тренировки в фолликулярную фазу',
      'Легкие прогулки при сильных симптомах'
    ]
  });
  
  // Рекомендации по здоровью
  if (analysis.cycle_history.irregularity_score > 60) {
    recommendations.push({
      icon: '👩‍⚕️',
      title: 'Медицинские рекомендации',
      items: [
        'Консультация с гинекологом',
        'Анализы на гормоны',
        'УЗИ органов малого таза',
        'Контроль щитовидной железы'
      ]
    });
  }
  
  // Рекомендации по образу жизни
  recommendations.push({
    icon: '🧘‍♀️',
    title: 'Образ жизни',
    items: [
      'Регулярный сон 7-8 часов',
      'Техники управления стрессом',
      'Достаточное потребление воды',
      'Ведение дневника симптомов'
    ]
  });
  
  return recommendations;
};