import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Flame, 
  Target, 
  Plus,
  Heart,
  Star
} from 'lucide-react';
import type { BasicMealPlan } from '@/data/baseMealPlans';

interface RecipeDetailModalProps {
  recipe: BasicMealPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToDiary: (recipe: BasicMealPlan) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onAddToDiary
}) => {
  if (!recipe) return null;

  const difficultyLabels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  };

  const mealTypeLabels = {
    breakfast: 'Завтрак',
    lunch: 'Обед', 
    dinner: 'Ужин',
    snack: 'Перекус'
  };

  const phaseLabels: Record<string, string> = {
    premenopause: 'Пременопауза',
    perimenopause: 'Пременопауза',
    menopause: 'Менопауза',
    postmenopause: 'Постменопауза'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-700">{recipe.calories}</span>
                </div>
                <p className="text-sm text-orange-600 font-medium">ккал</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-700">{recipe.prepTime}</span>
                </div>
                <p className="text-sm text-blue-600 font-medium">мин</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">1</span>
                </div>
                <p className="text-sm text-green-600 font-medium">порций</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-bold text-purple-700">{difficultyLabels[recipe.difficulty]}</span>
                </div>
                <p className="text-sm text-purple-600 font-medium">сложность</p>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {mealTypeLabels[recipe.mealType]}
            </Badge>
            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
              {phaseLabels[recipe.menopausePhase] || recipe.menopausePhase}
            </Badge>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-background/50 to-accent/5 rounded-xl p-4 border border-border/50">
            <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
          </div>

          {/* Nutrition Info */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Пищевая ценность</h3>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{recipe.protein}г</div>
                  <div className="text-sm text-muted-foreground">Белки</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{recipe.carbs}г</div>
                  <div className="text-sm text-muted-foreground">Углеводы</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{recipe.fat}г</div>
                  <div className="text-sm text-muted-foreground">Жиры</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Ингредиенты
                </h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            {recipe.benefits.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Польза для здоровья
                  </h3>
                  <ul className="space-y-2">
                    {recipe.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Action Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button 
              onClick={() => onAddToDiary(recipe)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить в дневник
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};