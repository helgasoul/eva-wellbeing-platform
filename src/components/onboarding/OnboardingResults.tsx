
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhaseResult, PersonalizedRecommendations } from '@/types/onboarding';
import { getPhaseName, getPhaseDescription } from '@/utils/menopausePhaseDetector';
import { CheckCircle, Heart, BookOpen, Calendar, Stethoscope } from 'lucide-react';

interface OnboardingResultsProps {
  phaseResult: PhaseResult;
  recommendations: PersonalizedRecommendations;
  onComplete: () => void;
}

export const OnboardingResults: React.FC<OnboardingResultsProps> = ({
  phaseResult,
  recommendations,
  onComplete
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Congratulations Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-playfair font-bold text-foreground mb-2">
          Поздравляем! Онбординг завершен
        </h2>
        <p className="text-muted-foreground">
          Мы проанализировали вашу информацию и подготовили персональные рекомендации
        </p>
      </div>

      {/* Phase Result */}
      <Card className="bg-gradient-to-br from-eva-soft-pink to-eva-cream border-eva-dusty-rose/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-eva-dusty-rose" />
              <span>Ваша фаза менопаузы</span>
            </CardTitle>
            <Badge className={getConfidenceColor(phaseResult.confidence)}>
              Уверенность: {phaseResult.confidence}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-eva-dusty-rose mb-2">
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
                  <span className="w-2 h-2 bg-eva-dusty-rose rounded-full mt-2 mr-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Immediate Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-eva-dusty-rose">
              <Calendar className="h-5 w-5" />
              <span>Немедленные действия</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.immediateActions.map((action, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Medical Consultations */}
        <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-eva-dusty-rose">
              <Stethoscope className="h-5 w-5" />
              <span>Медицинские консультации</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.medicalConsultations.map((consultation, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  {consultation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Lifestyle Changes */}
        <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-eva-dusty-rose">
              <Heart className="h-5 w-5" />
              <span>Изменения образа жизни</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.lifestyleChanges.map((change, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Educational Resources */}
        <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-eva-dusty-rose">
              <BookOpen className="h-5 w-5" />
              <span>Образовательные ресурсы</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.educationalResources.map((resource, index) => (
                <li key={index} className="text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  {resource}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Priorities */}
      <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
        <CardHeader>
          <CardTitle className="text-eva-dusty-rose">Приоритеты отслеживания</CardTitle>
          <CardDescription>
            Мы рекомендуем сосредоточиться на этих аспектах здоровья
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recommendations.trackingPriorities.map((priority, index) => (
              <Badge key={index} variant="secondary" className="bg-eva-soft-pink text-eva-dusty-rose">
                {priority}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="text-center pt-6">
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-eva-dusty-rose hover:bg-eva-mauve text-white px-8 py-3"
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
