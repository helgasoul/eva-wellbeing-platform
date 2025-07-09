
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhaseResult, PersonalizedRecommendations, OnboardingData } from '@/types/onboarding';
import { ComprehensiveRecommendation } from '@/types/comprehensiveRecommendations';
import { getPhaseName, getPhaseDescription } from '@/utils/menopausePhaseDetector';
import { generateComprehensiveRecommendations } from '@/services/comprehensiveRecommendationService';
import { ComprehensiveRecommendations } from './ComprehensiveRecommendations';
import { CheckCircle, Heart, BookOpen, Calendar, Stethoscope, FlaskConical, MapPin, ArrowRight } from 'lucide-react';

interface OnboardingResultsProps {
  phaseResult: PhaseResult;
  recommendations: PersonalizedRecommendations;
  onboardingData: OnboardingData;
  onComplete: () => void;
  onSetupGeolocation?: () => void; // ✅ НОВОЕ: функция настройки геолокации
  hasGeolocation?: boolean; // ✅ НОВОЕ: флаг наличия геолокации
}

export const OnboardingResults: React.FC<OnboardingResultsProps> = ({
  phaseResult,
  recommendations,
  onboardingData,
  onComplete,
  onSetupGeolocation, // ✅ НОВОЕ: деструктурируем
  hasGeolocation // ✅ НОВОЕ: деструктурируем
}) => {
  const [comprehensiveRecommendations, setComprehensiveRecommendations] = useState<ComprehensiveRecommendation[]>([]);

  useEffect(() => {
    const generated = generateComprehensiveRecommendations(phaseResult, onboardingData);
    setComprehensiveRecommendations(generated);
  }, [phaseResult, onboardingData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-success/10 text-success';
    if (confidence >= 60) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const handleRecommendationAction = (recommendationId: string, actionType: string, provider?: any) => {
    console.log('Recommendation action:', { recommendationId, actionType, provider });
    // Здесь будет логика обработки действий (запись в календарь, запись к врачу и т.д.)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Congratulations Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-playfair font-bold text-foreground mb-2">
          Поздравляем! Онбординг завершен
        </h2>
        <p className="text-muted-foreground">
          Мы проанализировали вашу информацию и подготовили персональные рекомендации
        </p>
      </div>

      {/* Phase Result */}
      <Card className="bg-gradient-to-br from-secondary to-muted border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Ваша фаза менопаузы</span>
            </CardTitle>
            <Badge className={getConfidenceColor(phaseResult.confidence)}>
              Уверенность: {phaseResult.confidence}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-primary mb-2">
              {getPhaseName(phaseResult.phase)}
            </h3>
            <p className="text-muted-foreground mb-4">
              {getPhaseDescription(phaseResult.phase)}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Обоснование:</h4>
            <ul className="space-y-1">
              {phaseResult.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Recommendations Tabs */}
      <Tabs defaultValue="comprehensive" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="comprehensive" className="flex items-center space-x-2">
            <FlaskConical className="h-4 w-4" />
            <span>Комплексные рекомендации</span>
          </TabsTrigger>
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Базовые рекомендации</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-6">
          <ComprehensiveRecommendations
            recommendations={comprehensiveRecommendations}
            onActionClick={handleRecommendationAction}
          />
        </TabsContent>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Immediate Actions */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  <span>Немедленные действия</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.immediateActions.map((action, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Medical Consultations */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Stethoscope className="h-5 w-5" />
                  <span>Медицинские консультации</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.medicalConsultations.map((consultation, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      {consultation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Lifestyle Changes */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Heart className="h-5 w-5" />
                  <span>Изменения образа жизни</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.lifestyleChanges.map((change, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Educational Resources */}
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <BookOpen className="h-5 w-5" />
                  <span>Образовательные ресурсы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.educationalResources.map((resource, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Priorities */}
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-primary">Приоритеты отслеживания</CardTitle>
              <CardDescription>
                Мы рекомендуем сосредоточиться на этих аспектах здоровья
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.trackingPriorities.map((priority, index) => (
                  <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground">
                    {priority}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ✅ НОВОЕ: Секция настройки геолокации */}
      {onSetupGeolocation && !hasGeolocation && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <MapPin className="h-5 w-5" />
              <span>Настройте персонализацию по климату</span>
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Получайте рекомендации с учетом погоды и климата вашего региона
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  Анализ корреляций с погодными условиями
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Обнаружение связи между изменениями погоды и вашими симптомами
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  Персонализированные уведомления
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Предупреждения о неблагоприятных погодных условиях
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={onSetupGeolocation}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Настроить геолокацию
              </Button>
              <Button
                onClick={onComplete}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
              >
                Пропустить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ НОВОЕ: Индикатор настроенной геолокации */}
      {hasGeolocation && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
          <CardContent className="flex items-center space-x-3 py-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Геолокация настроена
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Вы будете получать персонализированные рекомендации на основе климата
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="text-center pt-6">
        {hasGeolocation || !onSetupGeolocation ? (
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
          >
            Перейти в приложение
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : null}
        
        <p className="text-sm text-muted-foreground mt-2">
          Ваши данные сохранены. Вы сможете начать отслеживание симптомов и использовать все функции bloom.
        </p>
      </div>
    </div>
  );
};
