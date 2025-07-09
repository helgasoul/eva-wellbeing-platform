
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
import { CheckCircle, Heart, BookOpen, Calendar, Stethoscope, FlaskConical } from 'lucide-react';

interface OnboardingResultsProps {
  phaseResult: PhaseResult;
  recommendations: PersonalizedRecommendations;
  onboardingData: OnboardingData;
  onComplete: () => void;
}

export const OnboardingResults: React.FC<OnboardingResultsProps> = ({
  phaseResult,
  recommendations,
  onboardingData,
  onComplete
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

      {/* Continue Button */}
      <div className="text-center pt-6">
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
        >
          Перейти в приложение
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Ваши данные сохранены. Вы сможете начать отслеживание симптомов и использовать все функции Eva.
        </p>
      </div>
    </div>
  );
};
