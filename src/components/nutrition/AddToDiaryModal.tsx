import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Minus, Clock, Calendar, Target, Utensils } from 'lucide-react';
import type { BasicMealPlan } from '@/data/baseMealPlans';

interface AddToDiaryModalProps {
  isOpen: boolean;
  meal: BasicMealPlan | null;
  onClose: () => void;
  onConfirm: (diaryEntry: DiaryEntry) => void;
}

export interface DiaryEntry {
  id: string;
  recipeId: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  time: string;
  portionSize: number;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  benefits: string[];
  addedAt: Date;
  source: 'recipe' | 'manual';
}

const mealTypeOptions = [
  { value: 'breakfast', label: 'Завтрак', icon: '🌅', time: '08:00' },
  { value: 'lunch', label: 'Обед', icon: '☀️', time: '13:00' },
  { value: 'dinner', label: 'Ужин', icon: '🌙', time: '19:00' },
  { value: 'snack', label: 'Перекус', icon: '🥜', time: '16:00' }
];

export const AddToDiaryModal: React.FC<AddToDiaryModalProps> = ({
  isOpen,
  meal,
  onClose,
  onConfirm
}) => {
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [portionSize, setPortionSize] = useState(1);

  const handleMealTypeChange = (mealType: string) => {
    setSelectedMealType(mealType);
    const option = mealTypeOptions.find(opt => opt.value === mealType);
    if (option) {
      setSelectedTime(option.time);
    }
  };

  const handlePortionChange = (change: number) => {
    setPortionSize(prev => Math.max(0.5, Math.min(3, prev + change)));
  };

  const handleConfirm = () => {
    if (!meal) return;

    const diaryEntry: DiaryEntry = {
      id: `diary_${Date.now()}`,
      recipeId: meal.id,
      name: meal.name,
      mealType: selectedMealType as DiaryEntry['mealType'],
      date: selectedDate,
      time: selectedTime,
      portionSize: portionSize,
      ingredients: meal.ingredients.map(ing => `${ing} (${portionSize}x)`),
      calories: Math.round(meal.calories * portionSize),
      protein: Math.round(meal.protein * portionSize),
      carbs: Math.round(meal.carbs * portionSize),
      fat: Math.round(meal.fat * portionSize),
      benefits: meal.benefits,
      addedAt: new Date(),
      source: 'recipe'
    };

    onConfirm(diaryEntry);
    onClose();
    
    // Сброс формы
    setSelectedMealType('breakfast');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTime('08:00');
    setPortionSize(1);
  };

  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-accent/5 shadow-elegant border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-playfair text-foreground flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Добавить в дневник питания
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Информация о блюде */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Блюдо</Label>
            <div className="p-3 bg-gradient-to-r from-background/50 to-accent/5 rounded-xl border border-border/50">
              <div className="font-medium text-foreground">{meal.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{meal.description}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{meal.calories} ккал</span>
                <span>{meal.protein}г белка</span>
                <span>{meal.carbs}г углеводов</span>
                <span>{meal.fat}г жиров</span>
              </div>
            </div>
          </div>

          {/* Тип приема пищи */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Тип приема пищи</Label>
            <Select value={selectedMealType} onValueChange={handleMealTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mealTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Дата</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Время</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Размер порции */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Размер порции</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => handlePortionChange(-0.5)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={portionSize <= 0.5}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{portionSize}</span>
                <span className="text-sm text-muted-foreground">порции</span>
              </div>
              <Button
                onClick={() => handlePortionChange(0.5)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={portionSize >= 3}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              От 0.5 до 3 порций
            </div>
          </div>

          {/* Итоговые нутриенты */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-foreground">Итоговые нутриенты:</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Калории:</span>
                <span className="font-medium text-foreground">
                  {Math.round(meal.calories * portionSize)} ккал
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Белки:</span>
                <span className="font-medium text-foreground">
                  {Math.round(meal.protein * portionSize)}г
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Углеводы:</span>
                <span className="font-medium text-foreground">
                  {Math.round(meal.carbs * portionSize)}г
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Жиры:</span>
                <span className="font-medium text-foreground">
                  {Math.round(meal.fat * portionSize)}г
                </span>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить в дневник
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};