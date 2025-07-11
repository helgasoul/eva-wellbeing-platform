import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Utensils, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeminiAI } from '@/hooks/useGeminiAI';

interface MealAnalysisProps {
  userProfile?: {
    age?: number;
    weight?: number;
    height?: number;
    activityLevel?: string;
    healthConditions?: string[];
    dietaryRestrictions?: string[];
  };
}

export const MealAnalysisComponent: React.FC<MealAnalysisProps> = ({ userProfile }) => {
  const [mealDescription, setMealDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const { analyzeMeal, isAnalyzing } = useGeminiAI();
  const { toast } = useToast();

  const handleAnalyzeMeal = async () => {
    if (!mealDescription.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, опишите ваш прием пищи",
        variant: "destructive",
      });
      return;
    }

    try {
      const mealData = {
        description: mealDescription,
        timestamp: new Date().toISOString(),
        type: 'manual_entry'
      };

      const result = await analyzeMeal(mealData, userProfile);
      setAnalysis(result);
      
      toast({
        title: "Анализ завершен",
        description: "Получены рекомендации по питанию",
      });
    } catch (error) {
      toast({
        title: "Ошибка анализа",
        description: error.message || "Не удалось проанализировать прием пищи",
        variant: "destructive",
      });
    }
  };

  const getNutrientBadgeColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage < 70) return "bg-red-100 text-red-800";
    if (percentage > 130) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Анализ питания с ИИ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Опишите ваш прием пищи
            </label>
            <Textarea
              placeholder="Например: Завтрак - овсяная каша с бананом и орехами, зеленый чай"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleAnalyzeMeal}
            disabled={isAnalyzing || !mealDescription.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализ питания...
              </>
            ) : (
              'Анализировать питание'
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Nutritional Information */}
          {analysis.nutrition && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Пищевая ценность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{analysis.nutrition.calories}</p>
                    <p className="text-sm text-muted-foreground">Калории</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analysis.nutrition.protein}г</p>
                    <p className="text-sm text-muted-foreground">Белки</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analysis.nutrition.carbs}г</p>
                    <p className="text-sm text-muted-foreground">Углеводы</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{analysis.nutrition.fat}г</p>
                    <p className="text-sm text-muted-foreground">Жиры</p>
                  </div>
                </div>
                
                {analysis.nutrition.keyMicronutrients?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Ключевые микронутриенты:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.nutrition.keyMicronutrients.map((nutrient, index) => (
                        <Badge key={index} variant="secondary">{nutrient}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Menopause Benefits */}
          {analysis.menopauseBenefits?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Польза для менопаузы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.menopauseBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Concerns */}
          {analysis.concerns?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Моменты для внимания
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {analysis.improvements?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Рекомендации по улучшению</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Timing and Portion Assessment */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.portionAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Оценка порций</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.portionAssessment}</p>
                </CardContent>
              </Card>
            )}
            
            {analysis.timingRecommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Рекомендации по времени
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.timingRecommendations}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Disclaimer */}
          {analysis.disclaimer && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <p className="text-xs text-yellow-800">{analysis.disclaimer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};