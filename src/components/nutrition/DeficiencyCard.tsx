import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Heart, 
  Brain, 
  Shield,
  Pill,
  ChefHat,
  Info
} from 'lucide-react';
import type { NutrientDeficiency, SupplementRecommendation } from '@/services/nutritionAnalyzer';

interface DeficiencyCardProps {
  deficiency: NutrientDeficiency;
  onAddSupplement?: (supplement: SupplementRecommendation) => void;
  className?: string;
}

export const DeficiencyCard: React.FC<DeficiencyCardProps> = ({
  deficiency,
  onAddSupplement,
  className = ""
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'moderate': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'mild': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressPercentage = () => {
    // Примерная логика для расчета процента от нормы
    const targetValue = parseFloat(deficiency.targetRange.split('-')[0]);
    return Math.min((deficiency.currentLevel / targetValue) * 100, 100);
  };

  const handleAddSupplement = () => {
    if (deficiency.supplementRecommendation && onAddSupplement) {
      onAddSupplement(deficiency.supplementRecommendation);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl hover:shadow-floating transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              {getSeverityIcon(deficiency.severity)}
              {deficiency.nutrient}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Текущий уровень: {deficiency.currentLevel} (норма: {deficiency.targetRange})
            </p>
          </div>
          <Badge className={`text-xs ${getSeverityColor(deficiency.severity)}`}>
            {deficiency.severity === 'severe' && '⚠️ Серьезный'}
            {deficiency.severity === 'moderate' && '🟡 Умеренный'}
            {deficiency.severity === 'mild' && '🟢 Легкий'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Прогресс-бар уровня */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Текущий уровень</span>
            <span>{Math.round(getProgressPercentage())}% от нормы</span>
          </div>
          <Progress 
            value={getProgressPercentage()} 
            className="h-2"
          />
        </div>

        {/* Влияние на здоровье */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Влияние на здоровье
          </h4>
          <div className="flex flex-wrap gap-1">
            {deficiency.healthImpact.map((impact, index) => (
              <Badge key={index} variant="outline" className="text-xs border-primary/20">
                {impact}
              </Badge>
            ))}
          </div>
        </div>

        {/* Продукты-источники */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-secondary" />
            Натуральные источники
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {deficiency.foodSources.slice(0, 6).map((food, index) => (
              <div key={index} className="text-xs text-muted-foreground pl-4 relative">
                <span className="absolute left-0 top-0 text-secondary">•</span>
                {food}
              </div>
            ))}
          </div>
        </div>

        {/* Связь с менопаузой */}
        <div className="bg-gradient-to-r from-background/50 to-accent/5 p-3 rounded-2xl border border-border/50">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Значение в менопаузе
              </h4>
              <p className="text-xs text-muted-foreground">
                {deficiency.menopauseRelevance}
              </p>
            </div>
          </div>
        </div>

        {/* Рекомендации по БАД */}
        {deficiency.supplementRecommendation && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Рекомендация БАД
              </span>
            </div>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Препарат:</span>
                  <br />
                  {deficiency.supplementRecommendation.name}
                </div>
                <div>
                  <span className="font-medium">Дозировка:</span>
                  <br />
                  {deficiency.supplementRecommendation.dosage}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Время приема:</span>
                  <br />
                  {deficiency.supplementRecommendation.timing}
                </div>
                <div>
                  <span className="font-medium">Длительность:</span>
                  <br />
                  {deficiency.supplementRecommendation.duration}
                </div>
              </div>

              {deficiency.supplementRecommendation.contraindications.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="h-3 w-3 text-red-600" />
                    <span className="font-medium text-red-800 text-xs">Противопоказания:</span>
                  </div>
                  <p className="text-xs text-red-700">
                    {deficiency.supplementRecommendation.contraindications.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddSupplement}
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Pill className="h-4 w-4 mr-2" />
              Добавить в план БАД
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};