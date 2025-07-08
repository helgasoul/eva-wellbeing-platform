import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, TrendingUp } from 'lucide-react';
import { type MDCalcTool, type CalculatorCategory, getCalculatorById } from '@/services/mdcalcService';

interface QuickAccessPanelProps {
  favorites: string[];
  recentlyUsed: string[];
  categories: CalculatorCategory[];
  onCalculatorSelect: (calculator: MDCalcTool) => void;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  favorites,
  recentlyUsed,
  categories,
  onCalculatorSelect
}) => {
  const handleRecommendedClick = (calculatorId: string) => {
    const calculator = getCalculatorById(categories, calculatorId);
    if (calculator) {
      onCalculatorSelect(calculator);
    }
  };

  const FavoriteCalculatorItem: React.FC<{ calculatorId: string }> = ({ calculatorId }) => {
    const calculator = getCalculatorById(categories, calculatorId);
    if (!calculator) return null;

    return (
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{calculator.icon}</span>
          <div>
            <p className="text-sm font-medium">{calculator.title}</p>
            <p className="text-xs text-muted-foreground truncate">{calculator.description}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCalculatorSelect(calculator)}
        >
          Открыть
        </Button>
      </div>
    );
  };

  const RecentCalculatorItem: React.FC<{ calculatorId: string }> = ({ calculatorId }) => {
    const calculator = getCalculatorById(categories, calculatorId);
    if (!calculator) return null;

    return (
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{calculator.icon}</span>
          <div>
            <p className="text-sm font-medium">{calculator.title}</p>
            <p className="text-xs text-muted-foreground">Недавно использован</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCalculatorSelect(calculator)}
        >
          Открыть
        </Button>
      </div>
    );
  };

  const RecommendedCalculatorItem: React.FC<{
    title: string;
    description: string;
    icon: string;
    calculatorId: string;
  }> = ({ title, description, icon, calculatorId }) => (
    <div 
      className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200 cursor-pointer hover:bg-white/80 transition-colors"
      onClick={() => handleRecommendedClick(calculatorId)}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <TrendingUp className="h-4 w-4 text-purple-600" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Избранное */}
      <Card className="bg-white border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-blue-700">
            <Star className="h-5 w-5 mr-2" />
            Избранные калькуляторы
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Добавьте калькуляторы в избранное для быстрого доступа
            </p>
          ) : (
            <div className="space-y-2">
              {favorites.slice(0, 3).map(calculatorId => (
                <FavoriteCalculatorItem
                  key={calculatorId}
                  calculatorId={calculatorId}
                />
              ))}
              {favorites.length > 3 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{favorites.length - 3} еще
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Недавно использованные */}
      <Card className="bg-white border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-green-700">
            <Clock className="h-5 w-5 mr-2" />
            Недавно использованные
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentlyUsed.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Здесь появятся недавно использованные калькуляторы
            </p>
          ) : (
            <div className="space-y-2">
              {recentlyUsed.slice(0, 3).map(calculatorId => (
                <RecentCalculatorItem
                  key={calculatorId}
                  calculatorId={calculatorId}
                />
              ))}
              {recentlyUsed.length > 3 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  +{recentlyUsed.length - 3} еще
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Рекомендованные для менопаузы */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-purple-700">
            <span className="text-xl mr-2">🌸</span>
            Для менопаузы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <RecommendedCalculatorItem
              title="FRAX"
              description="Риск переломов"
              icon="🦴"
              calculatorId="frax"
            />
            <RecommendedCalculatorItem
              title="Gail Model"
              description="Риск рака груди"
              icon="🎗️"
              calculatorId="gail-model"
            />
            <RecommendedCalculatorItem
              title="ASCVD Risk"
              description="Сердечно-сосудистый риск"
              icon="❤️"
              calculatorId="ascvd-risk"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};