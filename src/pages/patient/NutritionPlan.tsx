import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealFilters } from '@/components/nutrition/MealFilters';
import { MealCard } from '@/components/nutrition/MealCard';
import { PremiumTeaser } from '@/components/nutrition/PremiumTeaser';
import { AddToDiaryModal } from '@/components/nutrition/AddToDiaryModal';
import { baseMealPlans, BasicMealPlan } from '@/data/baseMealPlans';
import { useSubscription } from '@/context/SubscriptionContext';
import { useFoodDiary } from '@/contexts/FoodDiaryContext';
import { useToast } from '@/hooks/use-toast';
import { Utensils, ChefHat, Calendar, TrendingUp, Crown, BookOpen, Star } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  menopausePhase: 'premenopause' | 'perimenopause' | 'menopause' | 'postmenopause';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  subscriptionTier: 'essential' | 'plus' | 'optimum';
  symptoms: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
}

const NutritionPlan: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { addDiaryEntry } = useFoodDiary();
  const { toast } = useToast();
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMealForDiary, setSelectedMealForDiary] = useState<BasicMealPlan | null>(null);
  const [showAddToDiary, setShowAddToDiary] = useState(false);

  // Mock user profile - в реальном приложении это будет из контекста или API
  const userProfile: UserProfile = {
    id: '1',
    name: 'Анна',
    age: 48,
    weight: 65,
    height: 165,
    menopausePhase: 'perimenopause',
    activityLevel: 'moderate',
    subscriptionTier: (currentPlan?.id as 'essential' | 'plus' | 'optimum') || 'essential',
    symptoms: ['приливы', 'нарушение сна', 'перепады настроения'],
    allergies: [],
    dietaryRestrictions: []
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Планы питания' }
  ];

  // Объединяем все рецепты в один массив
  const allMeals = useMemo(() => {
    return Object.values(baseMealPlans).flat();
  }, []);

  // Фильтруем рецепты
  const filteredMeals = useMemo(() => {
    return allMeals.filter(meal => {
      const phaseMatch = selectedPhase === 'all' || meal.menopausePhase === selectedPhase;
      const typeMatch = selectedMealType === 'all' || meal.mealType === selectedMealType;
      const difficultyMatch = selectedDifficulty === 'all' || meal.difficulty === selectedDifficulty;
      
      return phaseMatch && typeMatch && difficultyMatch;
    });
  }, [allMeals, selectedPhase, selectedMealType, selectedDifficulty]);

  // Статистика для дашборда
  const stats = useMemo(() => {
    const totalMeals = filteredMeals.length;
    const avgCalories = Math.round(filteredMeals.reduce((sum, meal) => sum + meal.calories, 0) / totalMeals) || 0;
    const easyMeals = filteredMeals.filter(meal => meal.difficulty === 'easy').length;
    const uniqueBenefits = [...new Set(filteredMeals.flatMap(meal => meal.benefits))].length;
    
    return {
      totalMeals,
      avgCalories,
      easyMeals,
      uniqueBenefits
    };
  }, [filteredMeals]);

  const handleViewRecipe = (meal: BasicMealPlan) => {
    // Здесь будет логика открытия детального рецепта
    console.log('Viewing recipe for:', meal.name);
  };

  const handleAddToDiary = (meal: BasicMealPlan) => {
    setSelectedMealForDiary(meal);
    setShowAddToDiary(true);
  };

  const handleConfirmAddToDiary = (diaryEntry: any) => {
    addDiaryEntry(diaryEntry);
    toast({
      title: "Успешно добавлено!",
      description: `${diaryEntry.name} добавлен в дневник питания`,
    });
  };

  const handleUpgrade = () => {
    // Здесь будет логика перехода на страницу подписки
    console.log('Upgrading subscription');
  };

  const getPhaseRecommendation = (phase: string) => {
    switch (phase) {
      case 'premenopause':
        return 'Поддержите регулярность циклов и энергию с помощью сбалансированного питания';
      case 'perimenopause':
        return 'Смягчите переходные симптомы с помощью фитоэстрогенов и противовоспалительных продуктов';
      case 'menopause':
        return 'Управляйте интенсивными симптомами с помощью целевого питания';
      case 'postmenopause':
        return 'Поддерживайте здоровье костей и сердца для долгосрочного благополучия';
      default:
        return 'Персональное питание для каждой фазы менопаузы';
    }
  };

  return (
    <PatientLayout title="без | паузы - Планы питания" breadcrumbs={breadcrumbs}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок и статистика */}
        <div className="bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8 rounded-3xl shadow-elegant border border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-full flex items-center justify-center animate-gentle-float">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                  Персональное питание 🍽️
                </h1>
                <p className="text-muted-foreground text-lg">
                  {getPhaseRecommendation(userProfile.menopausePhase)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  💡 Для просмотра всех рецептов перейдите в раздел <Link to="/patient/recipes" className="text-primary hover:underline">Рецепты</Link>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {userProfile.menopausePhase === 'premenopause' && '🌱 Пременопауза'}
                    {userProfile.menopausePhase === 'perimenopause' && '🌿 Перименопауза'}
                    {userProfile.menopausePhase === 'menopause' && '🌺 Менопауза'}
                    {userProfile.menopausePhase === 'postmenopause' && '🌷 Постменопауза'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userProfile.subscriptionTier === 'essential' && '✨ Essential'}
                    {userProfile.subscriptionTier === 'plus' && '👑 Plus'}
                    {userProfile.subscriptionTier === 'optimum' && '⭐ Optimum'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {userProfile.subscriptionTier === 'essential' && (
              <Button
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Crown className="h-4 w-4 mr-2" />
                Улучшить план
              </Button>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-background/80 to-accent/5 border-primary/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{stats.totalMeals}</div>
                <div className="text-sm text-muted-foreground">Рецептов</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-background/80 to-accent/5 border-primary/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{stats.avgCalories}</div>
                <div className="text-sm text-muted-foreground">Ср. калории</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-background/80 to-accent/5 border-primary/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{stats.easyMeals}</div>
                <div className="text-sm text-muted-foreground">Легкие рецепты</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-background/80 to-accent/5 border-primary/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{stats.uniqueBenefits}</div>
                <div className="text-sm text-muted-foreground">Полезных свойств</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Фильтры */}
          <div className="xl:col-span-1">
            <div className="lg:max-w-xs mx-auto xl:max-w-none">
              <MealFilters
                selectedPhase={selectedPhase}
                selectedMealType={selectedMealType}
                selectedTimeframe={selectedTimeframe}
                selectedDifficulty={selectedDifficulty}
                onPhaseChange={setSelectedPhase}
                onMealTypeChange={setSelectedMealType}
                onTimeframeChange={setSelectedTimeframe}
                onDifficultyChange={setSelectedDifficulty}
              />
            </div>
          </div>

          {/* Список рецептов */}
          <div className="xl:col-span-3">
            <div className="max-w-full overflow-hidden">
              {userProfile.subscriptionTier === 'essential' && (
                <div className="mb-6">
                  <PremiumTeaser onUpgrade={handleUpgrade} />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-playfair font-semibold text-foreground">
                    Рецепты для вас
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant={selectedTimeframe === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe('daily')}
                      className="text-sm"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      День
                    </Button>
                    <Button
                      variant={selectedTimeframe === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe('weekly')}
                      className="text-sm"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Неделя
                    </Button>
                  </div>
                </div>

                {filteredMeals.length === 0 ? (
                  <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Рецепты не найдены
                      </h3>
                      <p className="text-muted-foreground">
                        Попробуйте изменить фильтры или выберите другую категорию
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                    {filteredMeals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        userSubscription={userProfile.subscriptionTier}
                        onViewRecipe={() => handleViewRecipe(meal)}
                        onUpgrade={handleUpgrade}
                        onAddToDiary={handleAddToDiary}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно добавления */}
        <AddToDiaryModal
          isOpen={showAddToDiary}
          meal={selectedMealForDiary}
          onClose={() => setShowAddToDiary(false)}
          onConfirm={handleConfirmAddToDiary}
        />
      </div>
    </PatientLayout>
  );
};

export default NutritionPlan;