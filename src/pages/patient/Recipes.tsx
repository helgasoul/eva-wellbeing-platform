import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecipeFilters } from '@/components/nutrition/RecipeFilters';
import { RecipeCard } from '@/components/nutrition/RecipeCard';
import { AddToDiaryModal } from '@/components/nutrition/AddToDiaryModal';
import { RecipeDetailModal } from '@/components/nutrition/RecipeDetailModal';
import { baseMealPlans, BasicMealPlan } from '@/data/baseMealPlans';
import { useFoodDiary } from '@/contexts/FoodDiaryContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Search, TrendingUp, Star, ChefHat } from 'lucide-react';

const Recipes: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedMealForDiary, setSelectedMealForDiary] = useState<BasicMealPlan | null>(null);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<BasicMealPlan | null>(null);

  const { addDiaryEntry } = useFoodDiary();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Flatten all recipes from all phases
  const allRecipes = useMemo(() => {
    const recipes: BasicMealPlan[] = [];
    Object.values(baseMealPlans).forEach(phaseRecipes => {
      recipes.push(...phaseRecipes);
    });
    return recipes;
  }, []);

  // Filter recipes based on selected criteria
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      if (selectedPhase !== 'all' && recipe.menopausePhase !== selectedPhase) {
        return false;
      }
      if (selectedMealType !== 'all' && recipe.mealType !== selectedMealType) {
        return false;
      }
      if (selectedDifficulty !== 'all' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }
      return true;
    });
  }, [allRecipes, selectedPhase, selectedMealType, selectedDifficulty]);

  // Calculate statistics
  const stats = useMemo(() => {
    const recipes = filteredRecipes;
    const totalRecipes = recipes.length;
    const avgCalories = recipes.length > 0 
      ? Math.round(recipes.reduce((sum, recipe) => sum + recipe.calories, 0) / recipes.length)
      : 0;
    const easyRecipes = recipes.filter(r => r.difficulty === 'easy').length;
    const uniquePhases = new Set(recipes.map(r => r.menopausePhase)).size;

    return {
      totalRecipes,
      avgCalories,
      easyRecipes,
      uniquePhases
    };
  }, [filteredRecipes]);

  const handleAddToDiary = (recipe: BasicMealPlan) => {
    setSelectedMealForDiary(recipe);
  };

  const handleConfirmAddToDiary = (diaryEntry: any) => {
    addDiaryEntry(diaryEntry);
    setSelectedMealForDiary(null);
    toast({
      title: "Рецепт добавлен в дневник",
      description: `${diaryEntry.name} успешно добавлен в ваш дневник питания.`,
    });
  };

  const handleViewRecipe = (recipe: BasicMealPlan) => {
    setSelectedRecipeForDetail(recipe);
  };

  const handleAddToDiaryFromDetail = (recipe: BasicMealPlan) => {
    setSelectedRecipeForDetail(null);
    setSelectedMealForDiary(recipe);
  };

  const handleUpgrade = () => {
    navigate('/patient/subscription');
  };

  return (
    <PatientLayout 
      title="Рецепты - без | паузы"
      breadcrumbs={[
        { label: 'Главная', href: '/patient/dashboard' },
        { label: 'Рецепты', href: '/patient/recipes' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Рецепты здорового питания</h1>
              <p className="text-muted-foreground">
                Коллекция рецептов для всех фаз менопаузы - доступно для всех подписок
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">{stats.totalRecipes}</span>
              </div>
              <p className="text-sm text-blue-600 font-medium">Найдено рецептов</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{stats.avgCalories}</span>
              </div>
              <p className="text-sm text-green-600 font-medium">Средние калории</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">{stats.easyRecipes}</span>
              </div>
              <p className="text-sm text-yellow-600 font-medium">Легких рецептов</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ChefHat className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-700">{stats.uniquePhases}</span>
              </div>
              <p className="text-sm text-purple-600 font-medium">Фаз менопаузы</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <RecipeFilters
              selectedPhase={selectedPhase}
              selectedMealType={selectedMealType}
              selectedDifficulty={selectedDifficulty}
              onPhaseChange={setSelectedPhase}
              onMealTypeChange={setSelectedMealType}
              onDifficultyChange={setSelectedDifficulty}
            />
          </div>

          {/* Recipes Grid */}
          <div className="lg:col-span-3 space-y-6">
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onViewRecipe={() => handleViewRecipe(recipe)}
                    onAddToDiary={handleAddToDiary}
                    onUpgrade={handleUpgrade}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🔍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Рецепты не найдены</h3>
                    <p className="text-muted-foreground">
                      Попробуйте изменить фильтры для поиска рецептов
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipeForDetail}
        isOpen={!!selectedRecipeForDetail}
        onClose={() => setSelectedRecipeForDetail(null)}
        onAddToDiary={handleAddToDiaryFromDetail}
      />

      {/* Add to Diary Modal */}
      <AddToDiaryModal
        isOpen={!!selectedMealForDiary}
        meal={selectedMealForDiary}
        onClose={() => setSelectedMealForDiary(null)}
        onConfirm={handleConfirmAddToDiary}
      />
    </PatientLayout>
  );
};

export default Recipes;