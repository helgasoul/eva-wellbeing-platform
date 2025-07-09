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
      <div className="caring-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 py-4">
          {/* Теплое приветствие */}
          <div className="caring-card spacious-card super-rounded">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 super-rounded flex items-center justify-center animate-warm-glow">
                  <Utensils className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-playfair font-bold text-foreground mb-3">
                    Дневник питания 🥗
                  </h1>
                  <p className="soft-text text-xl mb-2">
                    Заботимся о себе вместе: отмечайте, что и когда вы едите — и получайте персональные рекомендации для лёгкости и баланса.
                  </p>
                  <p className="caring-text text-lg">
                    Помните: питание — это забота о себе, а не контроль. Здесь вы можете мягко отслеживать свои привычки и получать добрые советы.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 super-rounded border-caring-mint/40 bg-caring-cream"
                />
              </div>
            </div>
          </div>
          
          {/* Мотивационный баннер */}
          <div className="motivational-banner">
            <div className="flex items-center gap-4">
              <div className="text-3xl animate-gentle-wave">🌸</div>
              <div>
                <p className="warm-text text-lg font-semibold">
                  "Каждый ваш шаг — вклад в здоровье. Даже если вы просто посмотрели сюда — это уже забота о себе."
                </p>
              </div>
            </div>
          </div>

          {/* Сводка по нутриентам */}
          <div className="gentle-card spacious-card super-rounded">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-primary animate-caring-pulse" />
              <div>
                <h2 className="text-2xl font-playfair font-bold text-foreground">
                  Ваш прогресс сегодня 📊
                </h2>
                <p className="soft-text">
                  Мягко отслеживайте баланс нутриентов — каждая запись помогает лучше узнать свое тело
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Калории */}
              <div className="personal-touch space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-semibold text-foreground">Энергия</span>
                  </div>
                  <span className="text-sm soft-text">
                    {dailyNutrients.calories}/{targetNutrients.calories}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.calories, targetNutrients.calories)} 
                  className="h-3 super-rounded"
                />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{dailyNutrients.calories}</div>
                  <div className="text-sm soft-text">ккал</div>
                </div>
              </div>

              {/* Белки */}
              <div className="personal-touch space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💪</span>
                    <span className="font-semibold text-foreground">Белки</span>
                  </div>
                  <span className="text-sm soft-text">
                    {dailyNutrients.protein}/{targetNutrients.protein}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.protein, targetNutrients.protein)} 
                  className="h-3 super-rounded"
                />
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{dailyNutrients.protein}</div>
                  <div className="text-sm soft-text">г</div>
                </div>
              </div>

              {/* Углеводы */}
              <div className="personal-touch space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌾</span>
                    <span className="font-semibold text-foreground">Углеводы</span>
                  </div>
                  <span className="text-sm soft-text">
                    {dailyNutrients.carbs}/{targetNutrients.carbs}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.carbs, targetNutrients.carbs)} 
                  className="h-3 super-rounded"
                />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{dailyNutrients.carbs}</div>
                  <div className="text-sm soft-text">г</div>
                </div>
              </div>

              {/* Жиры */}
              <div className="personal-touch space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥑</span>
                    <span className="font-semibold text-foreground">Жиры</span>
                  </div>
                  <span className="text-sm soft-text">
                    {dailyNutrients.fat}/{targetNutrients.fat}
                  </span>
                </div>
                <Progress 
                  value={getNutrientProgress(dailyNutrients.fat, targetNutrients.fat)} 
                  className="h-3 super-rounded"
                />
                <div className="text-center">
                  <div className="text-3xl font-bold caring-text">{dailyNutrients.fat}</div>
                  <div className="text-sm soft-text">г</div>
                </div>
              </div>
            </div>
          </div>

          {/* Записи по типам приема пищи */}
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([mealType, entries]) => (
              <div key={mealType} className="mint-card spacious-card super-rounded">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl animate-gentle-wave">
                    {mealTypeLabels[mealType as keyof typeof mealTypeLabels].icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-playfair font-bold text-foreground">
                      {mealTypeLabels[mealType as keyof typeof mealTypeLabels].label}
                    </h3>
                    <p className="soft-text text-sm">
                      {entries.length === 0 ? 'Пока нет записей' : `${entries.length} записей`}
                    </p>
                  </div>
                </div>
                
                {entries.length === 0 ? (
                  <div className="empty-state">
                    <div className="text-6xl mb-4 animate-caring-pulse">🍽️</div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Сегодня вы ещё ничего не отмечали
                    </h4>
                    <p className="soft-text mb-4">
                      Начните с малого: добавьте первый приём пищи, и я помогу вам отслеживать баланс.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <span className="text-sm caring-text">💚</span>
                      <span className="text-sm caring-text">Каждый шаг важен</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className="personal-touch p-6 hover:shadow-caring transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-lg font-semibold text-foreground">{entry.name}</span>
                              {entry.source === 'recipe' && (
                                <Badge className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/20">
                                  Из рецепта
                                </Badge>
                              )}
                              {entry.portionSize !== 1 && (
                                <Badge className="bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary border-secondary/20">
                                  {entry.portionSize}x порция
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm caring-text mb-3">
                              <span className="flex items-center gap-1">
                                <span className="text-lg">⚡</span>
                                {entry.calories} ккал
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-lg">💪</span>
                                {entry.protein}г белка
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-lg">🌾</span>
                                {entry.carbs}г углеводов
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-lg">🥑</span>
                                {entry.fat}г жиров
                              </span>
                            </div>
                            
                            {entry.benefits && entry.benefits.length > 0 && (
                              <div className="text-sm gentle-text">
                                <span className="text-lg mr-2">🌟</span>
                                Польза: {entry.benefits.slice(0, 3).join(', ')}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm soft-text">
                              <Clock className="h-4 w-4" />
                              <span>{entry.time}</span>
                            </div>
                            <Button
                              onClick={() => handleDeleteEntry(entry.id)}
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive super-rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Быстрые действия */}
          <div className="peach-card spacious-card super-rounded">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="h-8 w-8 text-primary animate-caring-pulse" />
              <div>
                <h3 className="text-xl font-playfair font-bold text-foreground">
                  Быстрые действия
                </h3>
                <p className="soft-text">
                  Добавьте приём пищи или получите совет по питанию
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => window.location.href = '/patient/nutrition-plan'}
                className="btn-caring spacious-button"
              >
                <ChefHat className="h-6 w-6 mr-3" />
                Добавить из рецептов
              </Button>
              <Button
                variant="outline"
                className="btn-gentle spacious-button"
                disabled={!canUseAdvanced}
              >
                <Plus className="h-6 w-6 mr-3" />
                {canUseAdvanced ? 'Добавить вручную' : 'Ручное добавление в Plus'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default FoodDiary;