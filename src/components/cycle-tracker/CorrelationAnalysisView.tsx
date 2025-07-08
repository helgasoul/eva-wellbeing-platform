import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Activity, Apple, Target } from 'lucide-react';

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number;
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'high_intensity';
  symptom_impact: {
    cramps: number;
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
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
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getActivityName = (type: string) => {
    switch (type) {
      case 'cardio': return 'Кардио';
      case 'strength': return 'Силовые';
      case 'yoga': return 'Йога';
      case 'walking': return 'Ходьба';
      case 'high_intensity': return 'ВИИТ';
      default: return type;
    }
  };

  const getSymptomImpactColor = (value: number) => {
    if (value > 0.3) return 'text-green-600';
    if (value < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatImpactValue = (value: number, isPositive = true) => {
    const absValue = Math.abs(value);
    if (absValue < 0.2) return 'Слабое';
    if (absValue < 0.5) return 'Умеренное';
    if (absValue < 0.7) return 'Сильное';
    return 'Очень сильное';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Анализ корреляций</h2>
          <p className="text-gray-600">Как питание и активность влияют на ваш цикл</p>
        </div>
        <Button onClick={onUpdateLifestyle} variant="outline" className="gap-2">
          <Target className="h-4 w-4" />
          Обновить анализ
        </Button>
      </div>

      <Tabs defaultValue="nutrition" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="h-4 w-4" />
            Питание
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Активность
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-6">
          {/* Обзор питания */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥗 Влияние питательных веществ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {nutritionCorrelations.map((correlation, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md ${getImpactColor(correlation.cycle_impact)} ${
                      selectedNutrient === correlation.nutrient ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => setSelectedNutrient(
                      selectedNutrient === correlation.nutrient ? null : correlation.nutrient
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{correlation.nutrient}</h3>
                        {getImpactIcon(correlation.cycle_impact)}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Корреляция</span>
                            <span>{Math.round(correlation.correlation_strength * 100)}%</span>
                          </div>
                          <Progress 
                            value={correlation.correlation_strength * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        {correlation.current_intake !== undefined && (
                          <div className="text-xs text-gray-600">
                            Текущий прием: {correlation.current_intake} 
                            {correlation.optimal_range.includes('мг') ? ' мг' : ' г'}/день
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Детали выбранного питательного вещества */}
          {selectedNutrient && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Подробности: {selectedNutrient}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const correlation = nutritionCorrelations.find(c => c.nutrient === selectedNutrient);
                  if (!correlation) return null;

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {Math.round(correlation.correlation_strength * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Сила корреляции</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {correlation.optimal_range}
                          </div>
                          <div className="text-sm text-gray-600">Оптимальная доза</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            correlation.cycle_impact === 'positive' ? 'text-green-600' :
                            correlation.cycle_impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {correlation.cycle_impact === 'positive' ? '👍' :
                             correlation.cycle_impact === 'negative' ? '👎' : '➖'}
                          </div>
                          <div className="text-sm text-gray-600">Влияние на цикл</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Рекомендации:</h4>
                        <div className="space-y-2">
                          {correlation.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-pink-500 mt-0.5">•</span>
                              <span className="text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {correlation.current_intake !== undefined && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">
                            Ваш текущий прием vs рекомендуемый
                          </h4>
                          <div className="text-sm text-blue-700">
                            Вы принимаете: {correlation.current_intake} 
                            {correlation.optimal_range.includes('мг') ? ' мг' : ' г'}/день
                          </div>
                          <div className="text-sm text-blue-700">
                            Рекомендуется: {correlation.optimal_range}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Обзор активности */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏃‍♀️ Влияние физической активности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activityCorrelations.map((correlation, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md border-purple-200 bg-purple-50 ${
                      selectedActivity === correlation.activity_type ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => setSelectedActivity(
                      selectedActivity === correlation.activity_type ? null : correlation.activity_type
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{getActivityName(correlation.activity_type)}</h3>
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Спазмы:</span>
                          <span className={getSymptomImpactColor(correlation.symptom_impact.cramps)}>
                            {formatImpactValue(correlation.symptom_impact.cramps)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Настроение:</span>
                          <span className={getSymptomImpactColor(correlation.symptom_impact.mood)}>
                            {formatImpactValue(correlation.symptom_impact.mood)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Энергия:</span>
                          <span className={getSymptomImpactColor(correlation.symptom_impact.energy)}>
                            {formatImpactValue(correlation.symptom_impact.energy)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-purple-200">
                        <div className="text-xs text-gray-600">
                          Лучшее время: {correlation.optimal_timing.join(', ')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Детали выбранной активности */}
          {selectedActivity && (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Подробности: {getActivityName(selectedActivity)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const correlation = activityCorrelations.find(c => c.activity_type === selectedActivity);
                  if (!correlation) return null;

                  return (
                    <div className="space-y-6">
                      {/* Влияние на симптомы */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Влияние на симптомы:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(correlation.symptom_impact).map(([symptom, impact]) => (
                            <div key={symptom} className="text-center p-3 rounded-lg bg-gray-50">
                              <div className={`text-2xl font-bold ${getSymptomImpactColor(impact)}`}>
                                {impact > 0 ? '+' : ''}{Math.round(impact * 100)}%
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {symptom === 'cramps' ? 'Спазмы' :
                                 symptom === 'mood' ? 'Настроение' :
                                 symptom === 'energy' ? 'Энергия' :
                                 'Приливы'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Оптимальное время */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Оптимальное время для занятий:</h4>
                        <div className="flex flex-wrap gap-2">
                          {correlation.optimal_timing.map((timing, idx) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50">
                              {timing}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Рекомендации */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Рекомендации:</h4>
                        <div className="space-y-2">
                          {correlation.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-purple-500 mt-0.5">•</span>
                              <span className="text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};