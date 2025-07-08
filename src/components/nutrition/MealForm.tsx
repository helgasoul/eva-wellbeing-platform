import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MealData } from '@/pages/patient/NutritionTracker';

interface MealFormProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  meals: MealData[];
  onMealsUpdate: (meals: MealData[]) => void;
  moodBefore: number;
  moodAfter: number;
  onMoodUpdate: (before: number, after: number) => void;
}

export const MealForm: React.FC<MealFormProps> = ({
  mealType,
  meals,
  onMealsUpdate,
  moodBefore,
  moodAfter,
  onMoodUpdate
}) => {
  const [newFoodName, setNewFoodName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealData['category']>('other');
  const [portionSize, setPortionSize] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const foodCategories = [
    { id: 'protein', label: 'Белки', icon: '🥩' },
    { id: 'carbs', label: 'Углеводы', icon: '🍞' },
    { id: 'vegetables', label: 'Овощи', icon: '🥕' },
    { id: 'fruits', label: 'Фрукты', icon: '🍎' },
    { id: 'dairy', label: 'Молочные', icon: '🥛' },
    { id: 'other', label: 'Другое', icon: '🍽️' }
  ];

  const triggerFoods = [
    { id: 'caffeine', label: 'Кофеин', icon: '☕' },
    { id: 'alcohol', label: 'Алкоголь', icon: '🍷' },
    { id: 'spicy', label: 'Острое', icon: '🌶️' },
    { id: 'sugar', label: 'Сахар', icon: '🍭' }
  ];

  const addFood = () => {
    if (!newFoodName.trim()) return;

    const newFood: MealData = {
      id: Date.now().toString(),
      name: newFoodName.trim(),
      category: selectedCategory,
      portion_size: portionSize || 'стандартная порция',
      contains_trigger_foods: selectedTriggers,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    onMealsUpdate([...meals, newFood]);
    setNewFoodName('');
    setPortionSize('');
    setSelectedTriggers([]);
  };

  return (
    <div className="space-y-6">
      {/* Настроение */}
      <div className="grid grid-cols-2 gap-4 bg-bloom-vanilla rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium gentle-text mb-2">До еды</label>
          <MoodSelector value={moodBefore} onChange={(value) => onMoodUpdate(value, moodAfter)} />
        </div>
        <div>
          <label className="block text-sm font-medium gentle-text mb-2">После еды</label>
          <MoodSelector value={moodAfter} onChange={(value) => onMoodUpdate(moodBefore, value)} />
        </div>
      </div>

      {/* Список продуктов */}
      {meals.length > 0 && (
        <div className="space-y-2">
          {meals.map(meal => (
            <div key={meal.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-bloom-cream">
              <div>
                <div className="font-medium gentle-text">{meal.name}</div>
                <div className="text-sm soft-text">{meal.portion_size}</div>
              </div>
              <button
                onClick={() => onMealsUpdate(meals.filter(m => m.id !== meal.id))}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления */}
      <div className="bg-white rounded-lg border-2 border-dashed border-bloom-cream p-4">
        <div className="space-y-4">
          <input
            type="text"
            value={newFoodName}
            onChange={(e) => setNewFoodName(e.target.value)}
            placeholder="Название продукта"
            className="w-full p-2 border border-bloom-cream rounded-lg focus:ring-2 focus:ring-primary/50"
          />
          
          <input
            type="text"
            value={portionSize}
            onChange={(e) => setPortionSize(e.target.value)}
            placeholder="Размер порции"
            className="w-full p-2 border border-bloom-cream rounded-lg focus:ring-2 focus:ring-primary/50"
          />

          <div className="grid grid-cols-3 gap-2">
            {foodCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as MealData['category'])}
                className={cn(
                  "p-2 rounded-lg text-sm border",
                  selectedCategory === category.id ? "bg-primary text-white" : "bg-bloom-vanilla"
                )}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>

          <button
            onClick={addFood}
            disabled={!newFoodName.trim()}
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-white py-2 rounded-lg disabled:opacity-50"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

const MoodSelector = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
  <div className="flex space-x-2">
    {[1,2,3,4,5].map(mood => (
      <button
        key={mood}
        onClick={() => onChange(mood)}
        className={cn(
          "flex-1 p-2 rounded-lg text-center",
          value === mood ? "bg-primary text-white" : "bg-white"
        )}
      >
        {mood === 1 ? '😢' : mood === 2 ? '😕' : mood === 3 ? '😐' : mood === 4 ? '😊' : '😍'}
      </button>
    ))}
  </div>
);