import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types and interfaces
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

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number;
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: string;
  symptom_impact: {
    cramps: number;
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
}

interface CycleInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'prediction' | 'warning' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  title: string;
  description: string;
  icon: string;
  based_on: string[];
  actionable: boolean;
  actions?: string[];
}

interface CyclePrediction {
  id: string;
  title: string;
  description: string;
  timeframe: 'next_cycle' | 'next_month' | 'next_quarter';
  timeframe_label: string;
  probability: number;
  influencing_factors: {
    name: string;
    impact: number;
  }[];
}

interface PersonalPattern {
  id: string;
  name: string;
  description: string;
  frequency: string;
  icon: string;
}

interface OptimizationSuggestion {
  category: string;
  title: string;
  icon: string;
  suggestions: string[];
  expected_impact?: string;
}

interface CycleInsightsViewProps {
  cycleAnalysis: CycleAnalysis | null;
  correlations: {
    nutrition: NutritionCorrelation[];
    activity: ActivityCorrelation[];
  };
}

// Helper functions
const analyzeCycleInsights = async (
  cycleAnalysis: CycleAnalysis | null,
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] }
): Promise<{ insights: CycleInsight[]; predictions: CyclePrediction[] }> => {
  if (!cycleAnalysis) {
    return { insights: [], predictions: [] };
  }

  const insights: CycleInsight[] = [];
  const predictions: CyclePrediction[] = [];

  // Generate insights based on cycle regularity
  if (cycleAnalysis.cycle_history.irregularity_score > 30) {
    insights.push({
      id: 'irregularity_warning',
      type: 'warning',
      priority: 'high',
      confidence: 85,
      title: 'Высокая нерегулярность цикла',
      description: 'Ваш цикл показывает значительные колебания в длительности, что может указывать на гормональный дисбаланс.',
      icon: '⚠️',
      based_on: ['История циклов', 'Анализ длительности'],
      actionable: true,
      actions: [
        'Обратитесь к гинекологу-эндокринологу',
        'Ведите более детальный дневник симптомов',
        'Проанализируйте уровень стресса'
      ]
    });
  }

  // Generate insights based on nutrition correlations
  correlations.nutrition.forEach(correlation => {
    if (correlation.correlation_strength > 0.6) {
      insights.push({
        id: `nutrition_${correlation.nutrient}`,
        type: 'correlation',
        priority: 'medium',
        confidence: Math.round(correlation.correlation_strength * 100),
        title: `Влияние ${correlation.nutrient} на цикл`,
        description: `${correlation.nutrient} показывает ${correlation.cycle_impact === 'positive' ? 'положительное' : 'отрицательное'} влияние на ваш менструальный цикл.`,
        icon: correlation.cycle_impact === 'positive' ? '✅' : '⚠️',
        based_on: ['Данные питания', 'Анализ симптомов'],
        actionable: true,
        actions: correlation.recommendations.slice(0, 2)
      });
    }
  });

  // Generate predictions
  if (cycleAnalysis.current_cycle.confidence > 70) {
    predictions.push({
      id: 'next_cycle_prediction',
      title: 'Следующая менструация',
      description: 'На основе анализа ваших данных прогнозируем дату начала следующего цикла.',
      timeframe: 'next_cycle',
      timeframe_label: 'Следующий цикл',
      probability: cycleAnalysis.current_cycle.confidence,
      influencing_factors: [
        { name: 'Регулярность', impact: 0.4 },
        { name: 'Текущая фаза', impact: 0.3 },
        { name: 'Стресс', impact: -0.2 }
      ]
    });
  }

  return { insights, predictions };
};

const identifyPersonalPatterns = (
  cycleAnalysis: CycleAnalysis | null,
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] }
): PersonalPattern[] => {
  if (!cycleAnalysis) return [];

  const patterns: PersonalPattern[] = [];

  // Pattern based on cycle trend
  if (cycleAnalysis.cycle_history.trend !== 'stable') {
    patterns.push({
      id: 'cycle_trend',
      name: `Тенденция к ${cycleAnalysis.cycle_history.trend === 'lengthening' ? 'удлинению' : 'укорочению'} циклов`,
      description: `Ваши циклы показывают устойчивую тенденцию к ${cycleAnalysis.cycle_history.trend === 'lengthening' ? 'увеличению' : 'уменьшению'} продолжительности.`,
      frequency: 'Последние 3 месяца',
      icon: cycleAnalysis.cycle_history.trend === 'lengthening' ? '📈' : '📉'
    });
  }

  // Pattern based on perimenopause stage
  if (cycleAnalysis.perimenopause_indicators.probable_stage !== 'premenopause') {
    patterns.push({
      id: 'perimenopause_pattern',
      name: 'Перименопаузальные изменения',
      description: 'Ваши данные указывают на характерные изменения, связанные с перименопаузой.',
      frequency: 'Развивающийся паттерн',
      icon: '🌸'
    });
  }

  return patterns;
};

const generateOptimizationSuggestions = (
  insights: CycleInsight[],
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] }
): OptimizationSuggestion[] => {
  const optimizations: OptimizationSuggestion[] = [];

  // Nutrition optimization
  const nutritionSuggestions = correlations.nutrition
    .filter(n => n.cycle_impact === 'positive')
    .flatMap(n => n.recommendations)
    .slice(0, 3);

  if (nutritionSuggestions.length > 0) {
    optimizations.push({
      category: 'nutrition',
      title: 'Оптимизация питания',
      icon: '🍎',
      suggestions: nutritionSuggestions,
      expected_impact: 'Улучшение регулярности цикла на 15-20%'
    });
  }

  // Activity optimization
  const activitySuggestions = correlations.activity
    .flatMap(a => a.recommendations)
    .slice(0, 3);

  if (activitySuggestions.length > 0) {
    optimizations.push({
      category: 'activity',
      title: 'Физическая активность',
      icon: '🏃‍♀️',
      suggestions: activitySuggestions,
      expected_impact: 'Снижение симптомов на 25-30%'
    });
  }

  // Lifestyle optimization
  optimizations.push({
    category: 'lifestyle',
    title: 'Образ жизни',
    icon: '🧘‍♀️',
    suggestions: [
      'Регулярный сон 7-8 часов',
      'Практика управления стрессом',
      'Ведение дневника симптомов'
    ],
    expected_impact: 'Общее улучшение самочувствия'
  });

  return optimizations;
};

export const CycleInsightsView: React.FC<CycleInsightsViewProps> = ({
  cycleAnalysis,
  correlations
}) => {
  const [insights, setInsights] = useState<CycleInsight[]>([]);
  const [predictions, setPredictions] = useState<CyclePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateCycleInsights();
  }, [cycleAnalysis, correlations]);

  const generateCycleInsights = async () => {
    setIsLoading(true);
    try {
      const generatedInsights = await analyzeCycleInsights(cycleAnalysis, correlations);
      setInsights(generatedInsights.insights);
      setPredictions(generatedInsights.predictions);
    } catch (error) {
      console.error('Ошибка генерации инсайтов:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CycleInsightsLoading />;
  }

  return (
    <div className="space-y-8">
      
      {/* Заголовок */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            🧠 ИИ-инсайты вашего цикла
          </CardTitle>
          <p className="text-gray-600">
            Искусственный интеллект анализирует ваши данные и выявляет скрытые закономерности
          </p>
        </CardHeader>
      </Card>

      {/* Ключевые открытия */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            🔍 Ключевые открытия
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔬</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Накапливаем данные для анализа
              </h4>
              <p className="text-gray-600">
                Ведите дневник еще несколько недель для получения глубоких инсайтов
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.slice(0, 4).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Предсказания */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            🔮 Прогнозы и предсказания
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🔮</div>
              <p className="text-gray-600">
                Прогнозы появятся после накопления достаточного количества данных
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Персональные паттерны */}
      <PersonalPatterns cycleAnalysis={cycleAnalysis} correlations={correlations} />

      {/* Рекомендации по оптимизации */}
      <OptimizationRecommendations insights={insights} correlations={correlations} />
    </div>
  );
};

// Карточка инсайта
const InsightCard: React.FC<{ insight: CycleInsight }> = ({ insight }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("border-2 rounded-xl p-4 hover:shadow-md transition-shadow", getPriorityColor(insight.priority))}>
      
      {/* Заголовок с уверенностью */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{insight.icon}</span>
          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
        </div>
        <div className="text-right">
          <div className={cn("text-sm font-medium", getConfidenceColor(insight.confidence))}>
            {insight.confidence}%
          </div>
          <div className="text-xs text-gray-500">уверенность</div>
        </div>
      </div>

      {/* Описание */}
      <p className="text-sm text-gray-700 mb-4">{insight.description}</p>

      {/* Данные, на которых основан инсайт */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-600 mb-1">Основано на:</div>
        <div className="flex flex-wrap gap-1">
          {insight.based_on.map(source => (
            <span key={source} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Действия */}
      {insight.actionable && insight.actions && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700">Что делать:</div>
          {insight.actions.slice(0, 2).map((action, index) => (
            <div key={index} className="flex items-start text-xs text-gray-600">
              <span className="text-purple-500 mr-1">•</span>
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Карточка предсказания
const PredictionCard: React.FC<{ prediction: CyclePrediction }> = ({ prediction }) => {
  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'next_cycle': return 'bg-blue-50 border-blue-300';
      case 'next_month': return 'bg-purple-50 border-purple-300';
      case 'next_quarter': return 'bg-green-50 border-green-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className={cn("border-2 rounded-xl p-4", getTimeframeColor(prediction.timeframe))}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🔮</span>
          <div>
            <h4 className="font-semibold text-gray-800">{prediction.title}</h4>
            <div className="text-sm text-gray-600">{prediction.timeframe_label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">{prediction.probability}%</div>
          <div className="text-xs text-gray-500">вероятность</div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{prediction.description}</p>

      {/* Факторы влияния */}
      <div className="bg-white rounded-lg p-3">
        <div className="text-xs font-medium text-gray-700 mb-2">Влияющие факторы:</div>
        <div className="space-y-1">
          {prediction.influencing_factors.map((factor, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-gray-600">{factor.name}</span>
              <span className={cn(
                "font-medium",
                factor.impact > 0 ? "text-red-600" : "text-green-600"
              )}>
                {factor.impact > 0 ? '+' : ''}{Math.round(factor.impact * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Персональные паттерны
const PersonalPatterns: React.FC<{
  cycleAnalysis: CycleAnalysis | null;
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] };
}> = ({ cycleAnalysis, correlations }) => {
  const patterns = identifyPersonalPatterns(cycleAnalysis, correlations);

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          🎨 Ваши уникальные паттерны
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patterns.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-gray-600">Паттерны будут выявлены по мере накопления данных</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map(pattern => (
              <div key={pattern.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{pattern.icon}</span>
                  <h4 className="font-medium text-gray-800">{pattern.name}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-2">{pattern.description}</p>
                <div className="text-xs text-purple-700">
                  <strong>Частота:</strong> {pattern.frequency}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Рекомендации по оптимизации
const OptimizationRecommendations: React.FC<{
  insights: CycleInsight[];
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] };
}> = ({ insights, correlations }) => {
  const optimizations = generateOptimizationSuggestions(insights, correlations);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          ⚡ Как оптимизировать ваш цикл
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {optimizations.map(optimization => (
            <div key={optimization.category} className="bg-white rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{optimization.icon}</span>
                <h4 className="font-semibold text-gray-800">{optimization.title}</h4>
              </div>
              
              <div className="space-y-2">
                {optimization.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-blue-500 mr-2">•</span>
                    {suggestion}
                  </div>
                ))}
              </div>

              {optimization.expected_impact && (
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <div className="text-xs text-blue-700">
                    <strong>Ожидаемый эффект:</strong> {optimization.expected_impact}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Состояние загрузки
const CycleInsightsLoading: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);