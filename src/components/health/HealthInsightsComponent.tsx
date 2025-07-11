import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, TrendingUp, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeminiAI } from '@/hooks/useGeminiAI';

interface HealthInsightsProps {
  healthData?: any;
  symptomData?: any;
  userProfile?: any;
}

export const HealthInsightsComponent: React.FC<HealthInsightsProps> = ({ 
  healthData, 
  symptomData, 
  userProfile 
}) => {
  const [insights, setInsights] = useState(null);
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'symptom_pattern' | 'health_correlation' | 'personalized_recommendations'>('comprehensive');
  const { generateHealthInsights, isAnalyzing } = useGeminiAI();
  const { toast } = useToast();

  // Mock data if none provided
  const mockHealthData = healthData || {
    steps: [8500, 9200, 7800, 10100, 8900],
    heartRate: [72, 75, 78, 74, 76],
    sleep: [7.5, 6.8, 8.2, 7.1, 7.9],
    weight: [65.2, 65.1, 65.3, 65.0, 65.2]
  };

  const mockSymptomData = symptomData || {
    hotFlashes: [3, 2, 4, 1, 2],
    moodChanges: [2, 3, 2, 4, 1],
    sleepQuality: [3, 2, 4, 3, 4],
    energyLevel: [3, 4, 2, 3, 4]
  };

  const mockUserProfile = userProfile || {
    age: 48,
    menopauseStage: 'perimenopause',
    healthConditions: ['hypertension'],
    medications: ['lisinopril'],
    lifestyle: {
      exerciseFrequency: 'moderate',
      diet: 'balanced',
      stressLevel: 'medium'
    }
  };

  const handleGenerateInsights = async () => {
    try {
      const result = await generateHealthInsights(mockHealthData, mockSymptomData, mockUserProfile);
      setInsights(result);
      
      toast({
        title: "Анализ завершен",
        description: "Получены персонализированные инсайты о здоровье",
      });
    } catch (error) {
      toast({
        title: "Ошибка анализа",
        description: error.message || "Не удалось сгенерировать инсайты",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <Lightbulb className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            ИИ-анализ здоровья с Gemini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Тип анализа
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={analysisType === 'comprehensive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('comprehensive')}
              >
                Комплексный
              </Button>
              <Button
                variant={analysisType === 'symptom_pattern' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('symptom_pattern')}
              >
                Симптомы
              </Button>
              <Button
                variant={analysisType === 'health_correlation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('health_correlation')}
              >
                Корреляции
              </Button>
              <Button
                variant={analysisType === 'personalized_recommendations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnalysisType('personalized_recommendations')}
              >
                Рекомендации
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateInsights}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация инсайтов...
              </>
            ) : (
              'Сгенерировать инсайты'
            )}
          </Button>
        </CardContent>
      </Card>

      {insights && (
        <div className="space-y-6">
          {/* Summary */}
          {insights.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Общий анализ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{insights.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {insights.insights?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ключевые инсайты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getPriorityIcon(insight.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {insight.confidence}% уверенности
                          </Badge>
                        </div>
                        <p className="text-sm mb-3">{insight.description}</p>
                        
                        {insight.recommendations?.length > 0 && (
                          <div>
                            <p className="font-medium text-sm mb-2">Рекомендации:</p>
                            <ul className="space-y-1">
                              {insight.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="text-sm flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Patterns */}
          {insights.patterns?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Выявленные паттерны</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.patterns.map((pattern, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">{pattern.pattern}</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Частота:</span>
                        <p className="text-blue-700">{pattern.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Влияние:</span>
                        <p className="text-blue-700">{pattern.impact}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Триггеры:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pattern.triggers?.map((trigger, triggerIndex) => (
                            <Badge key={triggerIndex} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Correlations */}
          {insights.correlations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Корреляции</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.correlations.map((correlation, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-900">
                        {correlation.factor1} ↔ {correlation.factor2}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-purple-700">Сила связи:</span>
                        <Progress 
                          value={Math.abs(correlation.strength) * 100} 
                          className="w-16 h-2"
                        />
                        <span className="text-sm font-medium text-purple-800">
                          {(Math.abs(correlation.strength) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-700">{correlation.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          {insights.disclaimer && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <p className="text-xs text-yellow-800">{insights.disclaimer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};