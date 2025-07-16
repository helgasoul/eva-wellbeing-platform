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
  Plus,
  Lock,
  Crown
} from 'lucide-react';
import { BasicMealPlan } from '@/data/baseMealPlans';
import { getRecipeImage } from '@/utils/recipeImages';
import { useSubscription } from '@/context/SubscriptionContext';
import { canAccessRecipe } from '@/utils/subscriptionUtils';

interface RecipeCardProps {
  recipe: BasicMealPlan;
  onViewRecipe?: () => void;
  onAddToDiary?: (recipe: BasicMealPlan) => void;
  onUpgrade?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onViewRecipe,
  onAddToDiary,
  onUpgrade
}) => {
  const subscription = useSubscription();
  
  const hasAccess = canAccessRecipe(
    subscription.subscription?.plan?.id || 'essential',
    recipe.minAccessLevel || 'essential'
  );
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

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'plus':
        return <Star className="h-3 w-3" />;
      case 'optimum':
        return <Crown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'plus':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      case 'optimum':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default:
        return 'bg-green-500/20 text-green-700 border-green-500/30';
    }
  };

  const getAccessLevelText = (level: string) => {
    switch (level) {
      case 'plus':
        return 'Plus';
      case 'optimum':
        return 'Optimum';
      default:
        return 'Essential';
    }
  };

  return (
    <Card className={`group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-card to-accent/5 border-primary/10 max-w-sm ${!hasAccess ? 'opacity-75' : ''}`}>
      {/* Recipe Image */}
      {(recipe.imageUrl || getRecipeImage(recipe.id)) && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg relative">
          <img 
            src={getRecipeImage(recipe.id) || recipe.imageUrl} 
            alt={recipe.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!hasAccess ? 'grayscale' : ''}`}
          />
          {!hasAccess && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-3">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          {recipe.minAccessLevel && recipe.minAccessLevel !== 'essential' && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`${getAccessLevelColor(recipe.minAccessLevel)} backdrop-blur-sm text-xs`}
              >
                {getAccessLevelIcon(recipe.minAccessLevel)} {getAccessLevelText(recipe.minAccessLevel)}
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span>{getMealTypeIcon(recipe.mealType)}</span>
            <span className="capitalize truncate">{recipe.mealType}</span>
            <span>•</span>
            <span>{getPhaseIcon(recipe.menopausePhase)}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${getDifficultyColor(recipe.difficulty)} text-xs font-medium flex-shrink-0`}
          >
            {getDifficultyIcon(recipe.difficulty)} {recipe.difficulty}
          </Badge>
        </div>
        
        <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
          {recipe.name}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {recipe.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Nutritional Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-orange-500 flex-shrink-0" />
              <span className="text-muted-foreground truncate">Калории:</span>
              <span className="font-medium">{recipe.calories}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-muted-foreground truncate">Белки:</span>
              <span className="font-medium">{recipe.protein}г</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-purple-500 flex-shrink-0" />
              <span className="text-muted-foreground truncate">Время:</span>
              <span className="font-medium">{recipe.prepTime + recipe.cookTime} мин</span>
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Жиры: {recipe.fat}г • Углеводы: {recipe.carbs}г
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            <span>Польза:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs truncate max-w-20">
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
        <div className="flex gap-2 pt-2 mt-auto">
          {hasAccess ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewRecipe}
                className="flex-1 h-8 text-xs px-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                <span className="truncate">Рецепт</span>
              </Button>
              
              <Button
                size="sm"
                onClick={() => onAddToDiary?.(recipe)}
                className="flex-1 h-8 text-xs px-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                <span className="truncate">В дневник</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="w-full h-8 text-xs px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              <Lock className="h-3 w-3 mr-1" />
              <span className="truncate">Обновить до {getAccessLevelText(recipe.minAccessLevel || 'essential')}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};