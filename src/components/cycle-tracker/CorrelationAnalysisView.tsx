import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Activity, Apple, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number; // 0-1
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
  claude_insight?: string; // Дополнительный инсайт от Claude
}

interface ActivityCorrelation {
  activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'high_intensity';
  symptom_impact: {
    cramps: number; // -1 to 1 (negative = reduces, positive = increases)
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
  claude_insight?: string; // Дополнительный инсайт от Claude
}

interface CorrelationAnalysisViewProps {
  nutritionCorrelations: NutritionCorrelation[];
  activityCorrelations: ActivityCorrelation[];
  onUpdateLifestyle: () => void;
}

export const CorrelationAnalysisView: React.FC<CorrelationAnalysisViewProps> = ({
  nutritionCorrelations,
  activityCorrelations,
  onUpdateLifestyle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nutrition' | 'activity'>('all');

  return (
    <div className="space-y-8">
      
      {/* Заголовок */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            🔗 Анализ корреляций
          </CardTitle>
          <p className="text-gray-600">
            ИИ-анализ влияния питания и физической активности на ваш цикл и симптомы
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              Все корреляции
            </Button>
            <Button
              variant={selectedCategory === 'nutrition' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('nutrition')}
              className="gap-2"
            >
              <Apple className="h-4 w-4" />
              Питание
            </Button>
            <Button
              variant={selectedCategory === 'activity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('activity')}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Активность
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Корреляции питания */}
      {(selectedCategory === 'all' || selectedCategory === 'nutrition') && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              🍎 Влияние питания на цикл
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nutritionCorrelations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 mb-4">
                  Ведите дневник питания минимум 2 недели для анализа корреляций
                </p>
                <Button onClick={onUpdateLifestyle} variant="outline">
                  Обновить анализ
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nutritionCorrelations.map(correlation => (
                  <NutritionCorrelationCard 
                    key={correlation.nutrient}
                    correlation={correlation}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Корреляции активности */}
      {(selectedCategory === 'all' || selectedCategory === 'activity') && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              🏃‍♀️ Влияние физической активности
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityCorrelations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏃‍♀️</div>
                <p className="text-gray-600 mb-4">
                  Отслеживайте физическую активность для анализа влияния на симптомы
                </p>
                <Button onClick={onUpdateLifestyle} variant="outline">
                  Обновить анализ
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activityCorrelations.map(correlation => (
                  <ActivityCorrelationCard 
                    key={correlation.activity_type}
                    correlation={correlation}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Комплексные рекомендации */}
      {(nutritionCorrelations.length > 0 || activityCorrelations.length > 0) && (
        <ComplexRecommendations 
          nutritionCorrelations={nutritionCorrelations}
          activityCorrelations={activityCorrelations}
        />
      )}
    </div>
  );
};

// Карточка корреляции питания
const NutritionCorrelationCard: React.FC<{ correlation: NutritionCorrelation }> = ({ correlation }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'border-green-300 bg-green-50';
      case 'negative': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCorrelationStrength = (strength: number) => {
    if (strength >= 0.7) return { label: 'Сильная', color: 'text-red-600' };
    if (strength >= 0.4) return { label: 'Умеренная', color: 'text-yellow-600' };
    return { label: 'Слабая', color: 'text-green-600' };
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const strengthInfo = getCorrelationStrength(correlation.correlation_strength);

  return (
    <Card className={cn("border-2", getImpactColor(correlation.cycle_impact))}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getImpactIcon(correlation.cycle_impact)}
            <h4 className="font-semibold text-gray-800">{correlation.nutrient}</h4>
          </div>
          <div className="text-right">
            <div className={cn("text-sm font-medium", strengthInfo.color)}>
              {strengthInfo.label} связь
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(correlation.correlation_strength * 100)}%
            </div>
          </div>
        </div>

        {/* Визуализация корреляции */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Влияние на цикл</span>
            <span>{correlation.cycle_impact === 'positive' ? 'Положительное' : 
                   correlation.cycle_impact === 'negative' ? 'Отрицательное' : 'Нейтральное'}</span>
          </div>
          <Progress 
            value={correlation.correlation_strength * 100} 
            className="h-2"
          />
        </div>

        {/* Текущее потребление vs оптимальное */}
        {correlation.current_intake && (
          <div className="mb-3 p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Текущее потребление:</div>
            <div className="font-medium">{correlation.current_intake} / {correlation.optimal_range}</div>
          </div>
        )}

        {/* Claude инсайт */}
        {correlation.claude_insight && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-indigo-800">Claude AI:</div>
                <div className="text-sm text-indigo-700">{correlation.claude_insight}</div>
              </div>
            </div>
          </div>
        )}

        {/* Рекомендации */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700">Рекомендации:</div>
          {correlation.recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="flex items-start text-sm text-gray-600">
              <span className="text-purple-500 mr-2">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Карточка корреляции активности
const ActivityCorrelationCard: React.FC<{ correlation: ActivityCorrelation }> = ({ correlation }) => {
  const getImpactIcon = (impact: number) => {
    if (impact > 0.3) return { icon: <TrendingUp className="h-4 w-4" />, color: 'text-red-500', label: 'Ухудшает' };
    if (impact < -0.3) return { icon: <TrendingDown className="h-4 w-4" />, color: 'text-green-500', label: 'Улучшает' };
    return { icon: <Minus className="h-4 w-4" />, color: 'text-gray-500', label: 'Нейтрально' };
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      cardio: 'Кардио',
      strength: 'Силовые тренировки',
      yoga: 'Йога',
      walking: 'Ходьба',
      high_intensity: 'Высокоинтенсивные'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSymptomLabel = (symptom: string) => {
    const labels = {
      cramps: 'Спазмы',
      mood: 'Настроение',
      energy: 'Энергия',
      hot_flashes: 'Приливы'
    };
    return labels[symptom as keyof typeof labels] || symptom;
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">
            {getActivityTypeLabel(correlation.activity_type)}
          </h4>
        </div>

        {/* Влияние на симптомы */}
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-medium text-gray-700">Влияние на симптомы:</h5>
          {Object.entries(correlation.symptom_impact).map(([symptom, impact]) => {
            const impactInfo = getImpactIcon(impact);
            return (
              <div key={symptom} className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-sm text-gray-700">
                  {getSymptomLabel(symptom)}
                </span>
                <div className="flex items-center gap-1">
                  <span className={cn(impactInfo.color)}>
                    {impactInfo.icon}
                  </span>
                  <span className={cn("text-sm font-medium", impactInfo.color)}>
                    {impactInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Claude инсайт */}
        {correlation.claude_insight && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-indigo-800">Claude AI:</div>
                <div className="text-sm text-indigo-700">{correlation.claude_insight}</div>
              </div>
            </div>
          </div>
        )}

        {/* Оптимальное время */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Лучше всего:</div>
          <div className="flex flex-wrap gap-1">
            {correlation.optimal_timing.map(time => (
              <Badge key={time} variant="secondary" className="bg-blue-200 text-blue-800">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Рекомендации */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700">Советы:</div>
          {correlation.recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="flex items-start text-sm text-gray-600">
              <span className="text-blue-500 mr-2">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Комплексные рекомендации
const ComplexRecommendations: React.FC<{
  nutritionCorrelations: NutritionCorrelation[];
  activityCorrelations: ActivityCorrelation[];
}> = ({ nutritionCorrelations, activityCorrelations }) => {
  const generateComplexRecommendations = () => {
    const recommendations = [];
    
    // Анализ питания
    const negativeNutrition = nutritionCorrelations.filter(n => n.cycle_impact === 'negative');
    const positiveNutrition = nutritionCorrelations.filter(n => n.cycle_impact === 'positive');
    
    if (negativeNutrition.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Ограничить в рационе',
        items: negativeNutrition.map(n => `${n.nutrient} - ${n.recommendations[0]}`).slice(0, 3)
      });
    }
    
    if (positiveNutrition.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Увеличить потребление',
        items: positiveNutrition.map(n => `${n.nutrient} - ${n.recommendations[0]}`).slice(0, 3)
      });
    }
    
    // Анализ активности
    const beneficialActivities = activityCorrelations.filter(a => 
      Object.values(a.symptom_impact).some(impact => impact < -0.2)
    );
    
    if (beneficialActivities.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Рекомендуемые виды активности',
        items: beneficialActivities.map(a => `${a.activity_type} - ${a.recommendations[0]}`).slice(0, 3)
      });
    }
    
    return recommendations;
  };

  const recommendations = generateComplexRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          🧠 Персональные рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className={cn(
              "p-4 rounded-lg border-2",
              rec.type === 'warning' && "bg-red-50 border-red-200",
              rec.type === 'success' && "bg-green-50 border-green-200",
              rec.type === 'info' && "bg-blue-50 border-blue-200"
            )}>
              <h4 className="font-medium text-gray-800 mb-2">{rec.title}</h4>
              <ul className="space-y-1">
                {rec.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-600 flex items-start">
                    <span className={cn(
                      "mr-2",
                      rec.type === 'warning' && "text-red-500",
                      rec.type === 'success' && "text-green-500",
                      rec.type === 'info' && "text-blue-500"
                    )}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};