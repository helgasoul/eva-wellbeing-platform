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
    <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Filter className="h-5 w-5 text-primary" />
          Фильтры питания
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Временные рамки */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Период планирования
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTimeframe === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange('daily')}
              className="flex-1"
            >
              📅 День
            </Button>
            <Button
              variant={selectedTimeframe === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeframeChange('weekly')}
              className="flex-1"
            >
              📊 Неделя
            </Button>
          </div>
        </div>

        {/* Фазы менопаузы */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-primary">🌸</span>
            Фаза менопаузы
          </div>
          <div className="flex flex-wrap gap-2">
            {phases.map((phase) => (
              <Button
                key={phase.id}
                variant={selectedPhase === phase.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPhaseChange(phase.id)}
                className="h-auto py-2 px-3 text-xs"
              >
                <span className="mr-1">{phase.icon}</span>
                {phase.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Типы приемов пищи */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Прием пищи
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedMealType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onMealTypeChange(type.id)}
                className="h-auto py-2 px-3 text-xs justify-start"
              >
                <span className="mr-2">
                  {typeof type.icon === 'string' ? type.icon : type.icon}
                </span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Сложность приготовления */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ChefHat className="h-4 w-4" />
            Сложность
          </div>
          <div className="flex gap-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty.id}
                variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDifficultyChange(difficulty.id)}
                className="flex-1 h-auto py-2 px-3 text-xs"
              >
                <span className="mr-1">
                  {typeof difficulty.icon === 'string' ? difficulty.icon : difficulty.icon}
                </span>
                {difficulty.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Активные фильтры */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex flex-wrap gap-2">
            {selectedPhase !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {phases.find(p => p.id === selectedPhase)?.label}
              </Badge>
            )}
            {selectedMealType !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {mealTypes.find(m => m.id === selectedMealType)?.label}
              </Badge>
            )}
            {selectedDifficulty !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {difficulties.find(d => d.id === selectedDifficulty)?.label}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};