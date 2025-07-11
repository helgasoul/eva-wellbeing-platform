import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ChefHat, 
  Users, 
  Zap, 
  Star,
  Eye,
  Plus
} from 'lucide-react';
import { BasicMealPlan } from '@/data/baseMealPlans';

interface RecipeCardProps {
  recipe: BasicMealPlan;
  onViewRecipe?: () => void;
  onAddToDiary?: (recipe: BasicMealPlan) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onViewRecipe,
  onAddToDiary
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

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-accent/5 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getMealTypeIcon(recipe.mealType)}</span>
            <span className="capitalize">{recipe.mealType}</span>
            <span>•</span>
            <span>{getPhaseIcon(recipe.menopausePhase)}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getDifficultyColor(recipe.difficulty)} text-xs font-medium`}
          >
            {getDifficultyIcon(recipe.difficulty)} {recipe.difficulty}
          </Badge>
        </div>
        
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {recipe.name}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nutritional Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Калории:</span>
              <span className="font-medium">{recipe.calories}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Белки:</span>
              <span className="font-medium">{recipe.protein}г</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Время:</span>
              <span className="font-medium">{recipe.prepTime + recipe.cookTime} мин</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Жиры: {recipe.fat}г • Углеводы: {recipe.carbs}г
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            Польза:
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {recipe.benefits.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.benefits.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewRecipe}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Посмотреть рецепт
          </Button>
          
          <Button
            size="sm"
            onClick={() => onAddToDiary?.(recipe)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            В дневник
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};