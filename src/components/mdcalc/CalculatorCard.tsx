import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type MDCalcTool } from '@/services/mdcalcService';

interface CalculatorCardProps {
  calculator: MDCalcTool;
  isFavorite: boolean;
  isRecentlyUsed: boolean;
  onUse: () => void;
  onToggleFavorite: () => void;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  calculator,
  isFavorite,
  isRecentlyUsed,
  onUse,
  onToggleFavorite
}) => {
  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 4) return 'bg-green-100 text-green-700 border-green-200';
    if (relevance >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRelevanceText = (relevance: number) => {
    if (relevance >= 4) return 'Высокая';
    if (relevance >= 3) return 'Средняя';
    return 'Низкая';
  };

  return (
    <Card className="border hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{calculator.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm line-clamp-1">{calculator.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {calculator.isPopular && (
                  <Badge variant="secondary" className="text-xs">
                    Популярный
                  </Badge>
                )}
                {isRecentlyUsed && (
                  <div className="flex items-center text-blue-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-xs">Недавно</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className={cn(
              "p-1 h-8 w-8",
              isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"
            )}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        </div>

        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
          {calculator.description}
        </p>

        {/* Релевантность для менопаузы */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs border",
              getRelevanceColor(calculator.relevanceToMenopause)
            )}
          >
            {getRelevanceText(calculator.relevanceToMenopause)} релевантность
          </Badge>
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-1 mb-4">
          {calculator.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {calculator.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{calculator.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Кнопка использования */}
        <Button
          onClick={onUse}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Использовать калькулятор
        </Button>
      </CardContent>
    </Card>
  );
};