import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat, Users, Zap, Lock, Crown, Star } from 'lucide-react';
import { BasicMealPlan } from '@/data/baseMealPlans';

interface MealCardProps {
  meal: BasicMealPlan;
  userSubscription: 'essential' | 'plus' | 'optimum';
  onViewRecipe?: () => void;
  onUpgrade?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  userSubscription,
  onViewRecipe,
  onUpgrade
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🥜';
      default: return '🍽️';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'premenopause': return '🌱';
      case 'perimenopause': return '🌿';
      case 'menopause': return '🌺';
      case 'postmenopause': return '🌷';
      default: return '🌸';
    }
  };

  const canViewFullRecipe = userSubscription === 'plus' || userSubscription === 'optimum';
  const canViewPremiumDetails = userSubscription === 'optimum';

  return (
    <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl hover:shadow-floating transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              <span className="text-xl">{getMealTypeIcon(meal.mealType)}</span>
              {meal.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getDifficultyColor(meal.difficulty)}`}>
              {getDifficultyIcon(meal.difficulty)} {meal.difficulty}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getPhaseIcon(meal.menopausePhase)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Базовая информация - доступна всем */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{meal.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChefHat className="h-4 w-4" />
            <span>{meal.prepTime + meal.cookTime} мин</span>
          </div>
        </div>

        {/* Польза для менопаузы */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Польза при менопаузе
          </h4>
          <div className="flex flex-wrap gap-2">
            {meal.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs border-primary/20">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Контент в зависимости от подписки */}
        {userSubscription === 'essential' && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Для полного доступа</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Получите полный рецепт, список ингредиентов и КБЖУ в Plus подписке
            </p>
            <Button
              onClick={onUpgrade}
              size="sm"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Crown className="h-4 w-4 mr-2" />
              Перейти на Plus
            </Button>
          </div>
        )}

        {canViewFullRecipe && (
          <>
            {/* КБЖУ */}
            <div className="bg-gradient-to-r from-background/50 to-accent/5 p-4 rounded-2xl border border-border/50">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">{meal.calories}</div>
                  <div className="text-xs text-muted-foreground">ккал</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{meal.protein}</div>
                  <div className="text-xs text-muted-foreground">белки</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{meal.carbs}</div>
                  <div className="text-xs text-muted-foreground">углеводы</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{meal.fat}</div>
                  <div className="text-xs text-muted-foreground">жиры</div>
                </div>
              </div>
            </div>

            {/* Ингредиенты */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Ингредиенты
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="text-xs text-muted-foreground pl-4 relative">
                    <span className="absolute left-0 top-0 text-primary">•</span>
                    {ingredient}
                  </div>
                ))}
              </div>
            </div>

            {/* Детальная информация */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>🥄</span>
                <span>Подготовка: {meal.prepTime} мин</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>🔥</span>
                <span>Готовка: {meal.cookTime} мин</span>
              </div>
            </div>
          </>
        )}

        {canViewPremiumDetails && (
          <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-4 rounded-2xl border border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">Optimum детали</span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Персональные вариации рецепта</p>
              <p>• Замены ингредиентов при аллергиях</p>
              <p>• Оптимизация под ваши симптомы</p>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-2">
          <Button
            onClick={onViewRecipe}
            variant="outline"
            className="flex-1 border-primary/20 hover:bg-primary/10"
            disabled={!canViewFullRecipe}
          >
            {canViewFullRecipe ? 'Посмотреть рецепт' : 'Рецепт в Plus'}
          </Button>
          {canViewFullRecipe && (
            <Button
              variant="outline"
              size="sm"
              className="px-4 border-primary/20 hover:bg-primary/10"
            >
              💾
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};