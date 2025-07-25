import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Clock, ChefHat, Utensils } from 'lucide-react';

interface RecipeFiltersProps {
  selectedPhase: string;
  selectedMealType: string;
  selectedDifficulty: string;
  onPhaseChange: (phase: string) => void;
  onMealTypeChange: (type: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  selectedPhase,
  selectedMealType,
  selectedDifficulty,
  onPhaseChange,
  onMealTypeChange,
  onDifficultyChange
}) => {
  const phases = [
    { id: 'all', label: 'Все фазы', icon: '🌸' },
    { id: 'premenopause', label: 'Пременопауза', icon: '🌱' },
    { id: 'perimenopause', label: 'Перименопауза', icon: '🌿' },
    { id: 'menopause', label: 'Менопауза', icon: '🌺' },
    { id: 'postmenopause', label: 'Постменопауза', icon: '🌷' }
  ];

  const mealTypes = [
    { id: 'all', label: 'Все приемы пищи', icon: <Utensils className="h-4 w-4" /> },
    { id: 'breakfast', label: 'Завтрак', icon: '🌅' },
    { id: 'lunch', label: 'Обед', icon: '☀️' },
    { id: 'dinner', label: 'Ужин', icon: '🌙' },
    { id: 'snack', label: 'Перекус', icon: '🥜' }
  ];

  const difficulties = [
    { id: 'all', label: 'Любая сложность', icon: <ChefHat className="h-4 w-4" /> },
    { id: 'easy', label: 'Легко', icon: '🟢' },
    { id: 'medium', label: 'Средне', icon: '🟡' },
    { id: 'hard', label: 'Сложно', icon: '🔴' }
  ];

  return (
    <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl sticky top-4 z-10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Filter className="h-4 w-4 text-primary" />
          Фильтры рецептов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Фазы менопаузы */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-primary">🌸</span>
            <span>Фаза менопаузы</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {phases.map((phase) => (
              <Button
                key={phase.id}
                variant={selectedPhase === phase.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPhaseChange(phase.id)}
                className="h-7 py-1 px-2 text-xs min-w-0 flex-shrink-0"
              >
                <span className="mr-1">{phase.icon}</span>
                <span className="truncate">{phase.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Типы приемов пищи */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Прием пищи</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {mealTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedMealType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMealTypeChange(type.id)}
                className="h-7 py-1 px-2 text-xs justify-start min-w-0"
              >
                <span className="mr-1.5 flex-shrink-0">
                  {typeof type.icon === 'string' ? type.icon : type.icon}
                </span>
                <span className="truncate">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Сложность приготовления */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ChefHat className="h-4 w-4" />
            <span>Сложность</span>
          </div>
          <div className="flex gap-1.5">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.id}
                variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDifficultyChange(difficulty.id)}
                className="flex-1 h-7 py-1 px-2 text-xs min-w-0"
              >
                <span className="mr-1 flex-shrink-0">
                  {typeof difficulty.icon === 'string' ? difficulty.icon : difficulty.icon}
                </span>
                <span className="truncate">{difficulty.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Активные фильтры */}
        {(selectedPhase !== 'all' || selectedMealType !== 'all' || selectedDifficulty !== 'all') && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-1">
              {selectedPhase !== 'all' && (
                <Badge variant="secondary" className="text-xs truncate max-w-24">
                  {phases.find(p => p.id === selectedPhase)?.label}
                </Badge>
              )}
              {selectedMealType !== 'all' && (
                <Badge variant="secondary" className="text-xs truncate max-w-24">
                  {mealTypes.find(m => m.id === selectedMealType)?.label}
                </Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge variant="secondary" className="text-xs truncate max-w-24">
                  {difficulties.find(d => d.id === selectedDifficulty)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};