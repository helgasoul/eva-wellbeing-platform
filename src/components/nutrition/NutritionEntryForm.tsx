import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MealForm } from './MealForm';
import { SupplementsForm } from './SupplementsForm';
import { EnergyLevelSelector } from './EnergyLevelSelector';
import { ComfortLevelSelector } from './ComfortLevelSelector';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';

interface NutritionEntryFormProps {
  date: string;
  entry: FoodEntry | null;
  onSave: (entry: FoodEntry) => void;
  onCancel: () => void;
}

export const NutritionEntryForm: React.FC<NutritionEntryFormProps> = ({
  date,
  entry,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<FoodEntry>>({
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    water_intake: 2,
    supplements: [],
    mood_before_meals: { breakfast: 3, lunch: 3, dinner: 3 },
    mood_after_meals: { breakfast: 3, lunch: 3, dinner: 3 },
    energy_levels: { morning: 3, afternoon: 3, evening: 3 },
    digestive_comfort: 3,
    notes: ''
  });

  const [activeMeal, setActiveMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    }
  }, [entry]);

  const handleSave = () => {
    const newEntry: FoodEntry = {
      id: entry?.id || Date.now().toString(),
      date,
      ...(formData as Required<Partial<FoodEntry>>),
      created_at: entry?.created_at || new Date().toISOString()
    };
    onSave(newEntry);
  };

  return (
    <div className="bloom-card bg-white/95 backdrop-blur-sm shadow-warm p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-playfair font-bold gentle-text">
          Питание за {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Приемы пищи */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">🍽️ Приемы пищи</h3>
          
          {/* Табы приемов пищи */}
          <div className="flex bg-bloom-vanilla rounded-lg p-1 mb-4 max-w-md">
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
              <button
                key={meal}
                onClick={() => setActiveMeal(meal)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeMeal === meal
                    ? "bg-white gentle-text shadow-sm"
                    : "soft-text interactive-hover"
                )}
              >
                {meal === 'breakfast' ? 'Завтрак' :
                 meal === 'lunch' ? 'Обед' :
                 meal === 'dinner' ? 'Ужин' : 'Перекусы'}
              </button>
            ))}
          </div>

          {/* Форма для активного приема пищи */}
          <MealForm 
            mealType={activeMeal}
            meals={formData.meals?.[activeMeal] || []}
            onMealsUpdate={(meals) => setFormData(prev => ({
              ...prev,
              meals: {
                ...prev.meals,
                [activeMeal]: meals
              }
            }))}
            moodBefore={formData.mood_before_meals?.[activeMeal] || 3}
            moodAfter={formData.mood_after_meals?.[activeMeal] || 3}
            onMoodUpdate={(before, after) => setFormData(prev => ({
              ...prev,
              mood_before_meals: {
                ...prev.mood_before_meals,
                [activeMeal]: before
              },
              mood_after_meals: {
                ...prev.mood_after_meals,
                [activeMeal]: after
              }
            }))}
          />
        </div>

        {/* Потребление воды */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">💧 Потребление воды</h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.water_intake || 2}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                water_intake: parseFloat(e.target.value) || 0
              }))}
              className="w-24 p-2 border border-bloom-cream rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <span className="soft-text">литров</span>
            
            {/* Визуальные индикаторы воды */}
            <div className="flex space-x-1 ml-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div 
                  key={i}
                  className={`w-6 h-8 rounded border-2 transition-colors ${
                    i <= (formData.water_intake || 0) 
                      ? 'bg-blue-400 border-blue-500' 
                      : 'bg-bloom-vanilla border-bloom-cream'
                  }`}
                  style={{
                    background: i <= (formData.water_intake || 0) 
                      ? 'linear-gradient(to top, #3b82f6 70%, transparent 70%)'
                      : undefined
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-sm soft-text mt-2">
            Рекомендуемая норма: 2-2.5 литра в день
          </p>
        </div>

        {/* Добавки и витамины */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">💊 Добавки и витамины</h3>
          <SupplementsForm 
            supplements={formData.supplements || []}
            onSupplementsUpdate={(supplements) => setFormData(prev => ({
              ...prev,
              supplements
            }))}
          />
        </div>

        {/* Уровни энергии */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">⚡ Уровни энергии</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {(['morning', 'afternoon', 'evening'] as const).map(period => (
              <div key={period} className="bg-bloom-vanilla rounded-lg p-4">
                <label className="block text-sm font-medium gentle-text mb-2">
                  {period === 'morning' ? '🌅 Утром' :
                   period === 'afternoon' ? '🌞 Днем' : '🌙 Вечером'}
                </label>
                <EnergyLevelSelector
                  value={formData.energy_levels?.[period] || 3}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    energy_levels: {
                      ...prev.energy_levels,
                      [period]: value
                    }
                  }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Пищеварительный комфорт */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">🫄 Пищеварительный комфорт</h3>
          <div className="bg-bloom-vanilla rounded-lg p-4 max-w-md">
            <ComfortLevelSelector
              value={formData.digestive_comfort || 3}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                digestive_comfort: value
              }))}
              labels={['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']}
            />
          </div>
        </div>

        {/* Заметки */}
        <div>
          <h3 className="text-lg font-semibold gentle-text mb-4">📝 Заметки</h3>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            placeholder="Особенности питания, реакции на продукты, самочувствие..."
            rows={4}
            className="w-full p-3 border border-bloom-cream rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-bloom-cream">
        <button
          onClick={onCancel}
          className="px-6 py-2 soft-text bg-bloom-vanilla rounded-lg interactive-hover transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-primary to-primary-glow text-white rounded-lg interactive-hover transition-all shadow-warm"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};