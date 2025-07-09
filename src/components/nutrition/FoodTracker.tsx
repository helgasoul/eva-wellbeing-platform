import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Minus, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  Utensils,
  Zap,
  Heart,
  Brain,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import type { UserProfile } from '@/services/nutritionAnalyzer';

interface FoodTrackerProps {
  userProfile: UserProfile;
  targetNutrients: DailyNutrientTargets;
  onLogMeal: (meal: LoggedMeal) => void;
  className?: string;
}

interface DailyNutrientTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface LoggedMeal {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  
  // Для Optimum
  symptoms_before?: string[];
  symptoms_after?: string[];
  satisfaction_rating?: number;
  energy_level_before?: number;
  energy_level_after?: number;
  mood_before?: string;
  mood_after?: string;
}

const mealTypeIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🥜'
};

const mealTypeLabels = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус'
};

export const FoodTracker: React.FC<FoodTrackerProps> = ({
  userProfile,
  targetNutrients,
  onLogMeal,
  className = ""
}) => {
  const [selectedMealType, setSelectedMealType] = useState<LoggedMeal['mealType']>('breakfast');
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  
  // Optimum features
  const [symptomsBeforeEnabled, setSymptomsBeforeEnabled] = useState(false);
  const [symptomsAfterEnabled, setSymptomsAfterEnabled] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [energyBefore, setEnergyBefore] = useState(5);
  const [energyAfter, setEnergyAfter] = useState(5);
  const [moodBefore, setMoodBefore] = useState<string>('neutral');
  const [moodAfter, setMoodAfter] = useState<string>('neutral');

  const [todaysLog, setTodaysLog] = useState<LoggedMeal[]>([]);

  const canUseAdvanced = userProfile.subscriptionTier === 'optimum';

  // Текущий прогресс по нутриентам
  const currentNutrients = useMemo(() => {
    return todaysLog.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + meal.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [todaysLog]);

  const handleLogMeal = () => {
    if (!mealName.trim()) return;

    const newMeal: LoggedMeal = {
      id: Date.now().toString(),
      name: mealName,
      mealType: selectedMealType,
      timestamp: new Date(),
      ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean),
      calories,
      protein,
      carbs,
      fat,
      fiber,
      ...(canUseAdvanced && {
        satisfaction_rating: satisfactionRating,
        energy_level_before: energyBefore,
        energy_level_after: energyAfter,
        mood_before: moodBefore,
        mood_after: moodAfter
      })
    };

    setTodaysLog(prev => [...prev, newMeal]);
    onLogMeal(newMeal);
    
    // Очистка формы
    setMealName('');
    setIngredients('');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setFiber(0);
  };

  const getNutrientProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-green-600" />;
      case 'sad': return <Frown className="h-4 w-4 text-red-600" />;
      default: return <Meh className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Дневной прогресс */}
      <Card className="bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/10 shadow-elegant rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-playfair text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Прогресс питания на сегодня
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Калории */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Калории</Label>
                <span className="text-sm text-muted-foreground">
                  {currentNutrients.calories}/{targetNutrients.calories} ккал
                </span>
              </div>
              <Progress 
                value={getNutrientProgress(currentNutrients.calories, targetNutrients.calories)} 
                className="h-2"
              />
            </div>

            {/* Белки */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Белки</Label>
                <span className="text-sm text-muted-foreground">
                  {currentNutrients.protein}/{targetNutrients.protein} г
                </span>
              </div>
              <Progress 
                value={getNutrientProgress(currentNutrients.protein, targetNutrients.protein)} 
                className="h-2"
              />
            </div>

            {/* Углеводы */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Углеводы</Label>
                <span className="text-sm text-muted-foreground">
                  {currentNutrients.carbs}/{targetNutrients.carbs} г
                </span>
              </div>
              <Progress 
                value={getNutrientProgress(currentNutrients.carbs, targetNutrients.carbs)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Форма добавления еды */}
      <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Добавить прием пищи
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Тип приема пищи */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Тип приема пищи</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(mealTypeIcons).map(([type, icon]) => (
                <Button
                  key={type}
                  variant={selectedMealType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMealType(type as LoggedMeal['mealType'])}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm">{icon}</span>
                  {mealTypeLabels[type as keyof typeof mealTypeLabels]}
                </Button>
              ))}
            </div>
          </div>

          {/* Название блюда */}
          <div className="space-y-2">
            <Label htmlFor="meal-name" className="text-sm font-medium">
              Название блюда
            </Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Например: Овсянка с ягодами"
            />
          </div>

          {/* Ингредиенты */}
          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-sm font-medium">
              Ингредиенты
            </Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Перечислите ингредиенты через запятую"
              rows={2}
            />
          </div>

          {/* Пищевая ценность */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-medium">
                Калории
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-medium">
                Белки (г)
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm font-medium">
                Углеводы (г)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-medium">
                Жиры (г)
              </Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-sm font-medium">
                Клетчатка (г)
              </Label>
              <Input
                id="fiber"
                type="number"
                value={fiber}
                onChange={(e) => setFiber(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Дополнительные поля для Optimum */}
          {canUseAdvanced && (
            <div className="space-y-4 p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl border border-secondary/20">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs border-secondary/20">
                  <Heart className="h-3 w-3 mr-1" />
                  Optimum
                </Badge>
                <Label className="text-sm font-medium">Отслеживание симптомов</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Уровень энергии до еды</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">1</span>
                    <Progress value={energyBefore * 10} className="flex-1 h-2" />
                    <span className="text-sm">10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={energyBefore}
                    onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Настроение до еды</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={moodBefore === 'happy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMoodBefore('happy')}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={moodBefore === 'neutral' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMoodBefore('neutral')}
                    >
                      <Meh className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={moodBefore === 'sad' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMoodBefore('sad')}
                    >
                      <Frown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleLogMeal}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить прием пищи
          </Button>
        </CardContent>
      </Card>

      {/* Дневной журнал */}
      {todaysLog.length > 0 && (
        <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Дневной журнал
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {todaysLog.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{mealTypeIcons[meal.mealType]}</div>
                    <div>
                      <div className="font-medium text-foreground">{meal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {meal.calories} ккал • {meal.protein}г белка • {meal.carbs}г углеводов
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {meal.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>

                  {canUseAdvanced && meal.satisfaction_rating && (
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Энергия: {meal.energy_level_before} → {meal.energy_level_after}
                      </div>
                      {getMoodIcon(meal.mood_before || 'neutral')}
                      <span className="text-sm">→</span>
                      {getMoodIcon(meal.mood_after || 'neutral')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};