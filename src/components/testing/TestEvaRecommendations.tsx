import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const TestEvaRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [isTestingClaudeAnalysis, setIsTestingClaudeAnalysis] = useState(false);
  const [isTestingRecommendations, setIsTestingRecommendations] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const runClaudeAnalysis = async () => {
    if (!user?.id) {
      toast.error('Пользователь не авторизован');
      return;
    }

    setIsTestingClaudeAnalysis(true);
    try {
      console.log('🧠 Запускаем ежедневный анализ Claude...');
      
      const { data, error } = await supabase.functions.invoke('daily-health-analysis', {
        body: {
          userId: user.id,
          analysisDate: new Date().toISOString().split('T')[0]
        }
      });

      if (error) {
        throw error;
      }

      setTestResults(data);
      toast.success('✅ Анализ Claude выполнен успешно!');
      console.log('Claude analysis result:', data);
      
    } catch (error) {
      console.error('Error running Claude analysis:', error);
      toast.error('Ошибка при выполнении анализа: ' + (error as Error).message);
    } finally {
      setIsTestingClaudeAnalysis(false);
    }
  };

  const testRecommendationsUpdate = async () => {
    if (!user?.id) {
      toast.error('Пользователь не авторизован');
      return;
    }

    setIsTestingRecommendations(true);
    try {
      console.log('🔄 Обновляем виджет рекомендаций Eva...');
      
      // Имитируем обновление виджета, как это происходит в PatientDashboard
      const { evaRecommendationEngine } = await import('@/services/evaRecommendationEngine');
      const updatedRecommendations = await evaRecommendationEngine.analyzePatientData(user.id);
      
      setRecommendations(updatedRecommendations);
      toast.success('✅ Виджет рекомендаций обновлен!');
      console.log('Updated recommendations:', updatedRecommendations);
      
    } catch (error) {
      console.error('Error updating recommendations:', error);
      toast.error('Ошибка при обновлении рекомендаций: ' + (error as Error).message);
    } finally {
      setIsTestingRecommendations(false);
    }
  };

  const runFullTest = async () => {
    toast.info('🧪 Запускаем полный тест интеграции');
    
    // Шаг 1: Запускаем анализ Claude
    await runClaudeAnalysis();
    
    // Шаг 2: Ждем немного для обработки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Шаг 3: Обновляем рекомендации
    await testRecommendationsUpdate();
    
    toast.success('🎉 Полный тест завершен!');
  };

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Тестирование виджета "Рекомендации Eva"
        </CardTitle>
        <CardDescription>
          Проверка интеграции между ежедневным анализом Claude и виджетом рекомендаций
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Кнопки тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={runClaudeAnalysis}
            disabled={isTestingClaudeAnalysis}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTestingClaudeAnalysis ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            1. Запустить анализ Claude
          </Button>
          
          <Button 
            onClick={testRecommendationsUpdate}
            disabled={isTestingRecommendations}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isTestingRecommendations ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            2. Обновить рекомендации
          </Button>
          
          <Button 
            onClick={runFullTest}
            disabled={isTestingClaudeAnalysis || isTestingRecommendations}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Полный тест
          </Button>
        </div>

        {/* Результаты анализа Claude */}
        {testResults && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Результаты анализа Claude:
            </h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Session ID:</span> {testResults.sessionId}
                </div>
                <div>
                  <span className="font-medium">Статус:</span> 
                  <Badge variant="default" className="ml-1">
                    {testResults.success ? 'Успешно' : 'Ошибка'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Краткое резюме:</span>
                  <p className="text-muted-foreground mt-1">
                    {testResults.summary || 'Анализ выполнен'}
                  </p>
                </div>
                {testResults.hasNutritionPlan && (
                  <div className="col-span-2">
                    <Badge variant="secondary">План питания создан ✅</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Результаты рекомендаций */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Обновленные рекомендации Eva ({recommendations.length}):
            </h4>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={rec.id} className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{rec.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Уверенность: {rec.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recommendations.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... и еще {recommendations.length - 3} рекомендаций
                </p>
              )}
            </div>
          </div>
        )}

        {/* Инструкция */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            Как проходит тест:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Claude анализирует все ваши данные из Supabase</li>
            <li>Результаты сохраняются в таблицы ai_insights и correlation_analysis</li>
            <li>Eva обновляет рекомендации на основе свежих инсайтов Claude</li>
            <li>Виджет отображает персонализированные рекомендации от ИИ</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};