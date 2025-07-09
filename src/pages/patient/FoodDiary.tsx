import React, { useState, useMemo } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useFoodDiary } from '@/contexts/FoodDiaryContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { 
  Calendar, 
  TrendingUp, 
  Plus, 
  Clock, 
  Utensils,
  Target,
  Trash2,
  Edit,
  ChefHat
} from 'lucide-react';
import type { DiaryEntry } from '@/components/nutrition/AddToDiaryModal';

const FoodDiary: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { 
    diaryEntries, 
    removeDiaryEntry, 
    getEntriesForDate, 
    calculateDailyNutrients,
    getEntriesByMealType 
  } = useFoodDiary();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Дневник питания' }
  ];

  const todayEntries = getEntriesForDate(selectedDate);
  const dailyNutrients = calculateDailyNutrients(selectedDate);

  // Целевые значения нутриентов (примерные)
  const targetNutrients = {
    calories: 1800,
    protein: 90,
    carbs: 225,
    fat: 60
  };

  // Группировка записей по типам приема пищи
  const groupedEntries = {
    breakfast: getEntriesByMealType(selectedDate, 'breakfast'),
    lunch: getEntriesByMealType(selectedDate, 'lunch'),
    dinner: getEntriesByMealType(selectedDate, 'dinner'),
    snack: getEntriesByMealType(selectedDate, 'snack')
  };

  const mealTypeLabels = {
    breakfast: { label: 'Завтрак', icon: '🌅' },
    lunch: { label: 'Обед', icon: '☀️' },
    dinner: { label: 'Ужин', icon: '🌙' },
    snack: { label: 'Перекусы', icon: '🥜' }
  };

  const getNutrientProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleDeleteEntry = (id: string) => {
    removeDiaryEntry(id);
  };

  const canUseAdvanced = currentPlan?.id === 'plus' || currentPlan?.id === 'optimum';

  return (
    <PatientLayout title="bloom - Дневник питания" breadcrumbs={breadcrumbs}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок и выбор даты */}
        <div className="bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8 rounded-3xl shadow-elegant border border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-full flex items-center justify-center animate-gentle-float">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                  Дневник питания 📖
                </h1>
                <p className="text-muted-foreground text-lg">
                  Отслеживайте свой рацион и прогресс по нутриентам
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* Сводка по нутриентам */}
        <Card className="bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/10 shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-playfair text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Прогресс по нутриентам
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Калории */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Калории</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyNutrients.calories}/{targetNutrients.calories}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.calories, targetNutrients.calories)} 
                  className="h-2"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dailyNutrients.calories}</div>
                  <div className="text-xs text-muted-foreground">ккал</div>
                </div>
              </div>

              {/* Белки */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Белки</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyNutrients.protein}/{targetNutrients.protein}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.protein, targetNutrients.protein)} 
                  className="h-2"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{dailyNutrients.protein}</div>
                  <div className="text-xs text-muted-foreground">г</div>
                </div>
              </div>

              {/* Углеводы */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Углеводы</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyNutrients.carbs}/{targetNutrients.carbs}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.carbs, targetNutrients.carbs)} 
                  className="h-2"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{dailyNutrients.carbs}</div>
                  <div className="text-xs text-muted-foreground">г</div>
                </div>
              </div>

              {/* Жиры */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Жиры</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyNutrients.fat}/{targetNutrients.fat}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.fat, targetNutrients.fat)} 
                  className="h-2"
                />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{dailyNutrients.fat}</div>
                  <div className="text-xs text-muted-foreground">г</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Записи по типам приема пищи */}
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([mealType, entries]) => (
            <Card key={mealType} className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                  <span className="text-xl">{mealTypeLabels[mealType as keyof typeof mealTypeLabels].icon}</span>
                  {mealTypeLabels[mealType as keyof typeof mealTypeLabels].label}
                  <Badge variant="outline" className="text-xs">
                    {entries.length} записей
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Нет записей для этого приема пищи</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Добавьте блюда из рецептов или вручную
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/50 hover:shadow-soft transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-foreground">{entry.name}</span>
                            {entry.source === 'recipe' && (
                              <Badge variant="outline" className="text-xs border-primary/20">
                                Из рецепта
                              </Badge>
                            )}
                            {entry.portionSize !== 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {entry.portionSize}x порция
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{entry.calories} ккал</span>
                            <span>{entry.protein}г белка</span>
                            <span>{entry.carbs}г углеводов</span>
                            <span>{entry.fat}г жиров</span>
                          </div>
                          
                          {entry.benefits && entry.benefits.length > 0 && (
                            <div className="text-xs text-primary">
                              Польза: {entry.benefits.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{entry.time}</span>
                          </div>
                          <Button
                            onClick={() => handleDeleteEntry(entry.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Быстрые действия */}
        <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20 shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-secondary" />
              Быстрое добавление
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.location.href = '/patient/nutrition-plan'}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-12"
              >
                <ChefHat className="h-5 w-5 mr-2" />
                Добавить из рецептов
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary/20 hover:bg-primary/10 h-12"
                disabled={!canUseAdvanced}
              >
                <Plus className="h-5 w-5 mr-2" />
                {canUseAdvanced ? 'Добавить вручную' : 'Ручное добавление в Plus'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default FoodDiary;