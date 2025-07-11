import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ChefHat, Users, Calendar, ShoppingCart, Apple, Loader2 } from 'lucide-react';
import { NutritionPlanService, type NutritionPlan, type Meal } from '@/services/nutritionPlanService';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { NutritionDeficiencyAnalysisService, type NutritionAnalysisResult } from '@/services/nutritionDeficiencyAnalysisService';
import { MonthlyAnalysisService } from '@/services/monthlyAnalysisService';
import { toast } from '@/hooks/use-toast';

interface PersonalizedNutritionPlanProps {
  className?: string;
}

export const PersonalizedNutritionPlan: React.FC<PersonalizedNutritionPlanProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadCurrentPlan();
    }
  }, [user?.id]);

  const loadCurrentPlan = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const plan = await NutritionPlanService.getLatestNutritionPlan(user.id);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error loading nutrition plan:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить план питания",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMealCard = (meal: Meal) => (
    <Card key={meal.name} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{NutritionPlanService.getMealIcon(meal.type)}</span>
            <div>
              <CardTitle className="text-lg">{meal.name}</CardTitle>
              <CardDescription>{NutritionPlanService.formatMealTime(meal.type)}</CardDescription>
            </div>
          </div>
          <Badge variant={meal.difficulty === 'easy' ? 'default' : meal.difficulty === 'medium' ? 'secondary' : 'destructive'}>
            {meal.difficulty === 'easy' ? 'Легко' : meal.difficulty === 'medium' ? 'Средне' : 'Сложно'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{meal.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Калории:</span>
            <span>{meal.calories} ккал</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{meal.preparation_time} мин</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold text-blue-600">{meal.macros.protein}г</div>
            <div className="text-muted-foreground">Белки</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold text-green-600">{meal.macros.carbs}г</div>
            <div className="text-muted-foreground">Углеводы</div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="font-semibold text-yellow-600">{meal.macros.fat}г</div>
            <div className="text-muted-foreground">Жиры</div>
          </div>
        </div>

        {meal.ingredients && meal.ingredients.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Ингредиенты:</h4>
            <ul className="text-sm space-y-1">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between">
                  <span>{ingredient.name}</span>
                  <span className="text-muted-foreground">{ingredient.amount} {ingredient.unit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {meal.cooking_tips && meal.cooking_tips.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              Советы по приготовлению:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {meal.cooking_tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загружаем ваш план питания...</p>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Персональный план питания недоступен</h3>
            <p className="text-muted-foreground mb-4">
              Планы питания доступны для подписчиков Plus и Optimum после ежедневного анализа здоровья
            </p>
            <Button onClick={loadCurrentPlan}>Обновить</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCalories = NutritionPlanService.calculateTotalCalories(
    currentPlan.meal_plan, 
    currentPlan.personalization_factors.snacks
  );

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                План питания на {new Date(currentPlan.plan_date).toLocaleDateString('ru-RU')}
              </CardTitle>
              <CardDescription>
                Персонализирован на основе ваших данных о здоровье
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentPlan.subscription_tier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCalories}</div>
              <div className="text-sm text-muted-foreground">ккал в день</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentPlan.macro_targets.protein}г</div>
              <div className="text-sm text-muted-foreground">белки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{currentPlan.macro_targets.carbs}г</div>
              <div className="text-sm text-muted-foreground">углеводы</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{currentPlan.macro_targets.fat}г</div>
              <div className="text-sm text-muted-foreground">жиры</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meals">Приёмы пищи</TabsTrigger>
          <TabsTrigger value="snacks">Перекусы</TabsTrigger>
          <TabsTrigger value="shopping">Список покупок</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          {currentPlan.meal_plan.map(renderMealCard)}
        </TabsContent>

        <TabsContent value="snacks" className="space-y-4">
          {currentPlan.personalization_factors.snacks.map((snack, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{snack.name}</CardTitle>
                <CardDescription>{snack.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm mb-3">
                  <span><strong>Калории:</strong> {snack.calories} ккал</span>
                  <span><strong>Время:</strong> {snack.preparation_time} мин</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ингредиенты:</h4>
                  <ul className="text-sm space-y-1">
                    {snack.ingredients.map((ingredient, i) => (
                      <li key={i}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Список покупок
              </CardTitle>
              <CardDescription>
                Всё необходимое для приготовления блюд из плана
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {NutritionPlanService.generateShoppingList(currentPlan).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
