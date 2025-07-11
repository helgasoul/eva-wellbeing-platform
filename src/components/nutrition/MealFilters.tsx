import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, Clock, ChefHat, Utensils } from 'lucide-react';

interface MealFiltersProps {
  selectedPhase: string;
  selectedMealType: string;
  selectedTimeframe: 'daily' | 'weekly';
  selectedDifficulty: string;
  onPhaseChange: (phase: string) => void;
  onMealTypeChange: (type: string) => void;
  onTimeframeChange: (timeframe: 'daily' | 'weekly') => void;
  onDifficultyChange: (difficulty: string) => void;
}

export const MealFilters: React.FC<MealFiltersProps> = ({
  selectedPhase,
  selectedMealType,
  selectedTimeframe,
  selectedDifficulty,
  onPhaseChange,
  onMealTypeChange,
  onTimeframeChange,
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
    <div className="sticky top-4 z-10">
      <Card className="bg-gradient-to-br from-card/95 to-accent/10 backdrop-blur-md border-primary/10 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Filter className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">Фильтры питания</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          {/* Временные рамки */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Период</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant={selectedTimeframe === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeframeChange('daily')}
                className="text-xs h-8 px-2"
              >
                📅 День
              </Button>
              <Button
                variant={selectedTimeframe === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeframeChange('weekly')}
                className="text-xs h-8 px-2"
              >
                📊 Неделя
              </Button>
            </div>
          </div>

          {/* Фазы менопаузы */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="text-primary text-sm">🌸</span>
              <span className="truncate">Фаза</span>
            </div>
            <div className="space-y-1">
              {phases.map((phase) => (
                <Button
                  key={phase.id}
                  variant={selectedPhase === phase.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPhaseChange(phase.id)}
                  className="w-full justify-start text-xs h-8 px-2"
                >
                  <span className="mr-1 flex-shrink-0">{phase.icon}</span>
                  <span className="truncate">{phase.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Типы приемов пищи */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Прием пищи</span>
            </div>
            <div className="space-y-1">
              {mealTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedMealType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onMealTypeChange(type.id)}
                  className="w-full justify-start text-xs h-8 px-2"
                >
                  <span className="mr-2 flex-shrink-0">
                    {typeof type.icon === 'string' ? type.icon : type.icon}
                  </span>
                  <span className="truncate">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Сложность приготовления */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ChefHat className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Сложность</span>
            </div>
            <div className="space-y-1">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty.id}
                  variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDifficultyChange(difficulty.id)}
                  className="w-full justify-start text-xs h-8 px-2"
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
            <div className="pt-3 border-t border-border/30">
              <div className="text-xs font-medium text-muted-foreground mb-2">Активные:</div>
              <div className="flex flex-wrap gap-1">
                {selectedPhase !== 'all' && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {phases.find(p => p.id === selectedPhase)?.label}
                  </Badge>
                )}
                {selectedMealType !== 'all' && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {mealTypes.find(m => m.id === selectedMealType)?.label}
                  </Badge>
                )}
                {selectedDifficulty !== 'all' && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {difficulties.find(d => d.id === selectedDifficulty)?.label}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};