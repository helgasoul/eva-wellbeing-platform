import React from 'react';
import { Edit, TrendingUp } from 'lucide-react';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';

interface NutritionEntryViewProps {
  entry: FoodEntry | null;
  date: string;
  onEdit: () => void;
}

export const NutritionEntryView: React.FC<NutritionEntryViewProps> = ({
  entry,
  date,
  onEdit
}) => {
  if (!entry) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
        <div className="text-6xl mb-4 animate-gentle-float">🍽️</div>
        <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
          Нет записей за {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h3>
        <p className="soft-text mb-6">
          Добавьте информацию о питании, чтобы отслеживать влияние рациона на самочувствие
        </p>
        <button
          onClick={onEdit}
          className="bg-gradient-to-r from-primary to-primary-glow text-white px-6 py-3 rounded-lg interactive-hover transition-all shadow-warm"
        >
          ➕ Добавить запись
        </button>
      </div>
    );
  }

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snacks': return '🍿';
      default: return '🍽️';
    }
  };

  const getMealTitle = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      case 'snacks': return 'Перекусы';
      default: return 'Прием пищи';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'caffeine': return '☕';
      case 'alcohol': return '🍷';
      case 'spicy': return '🌶️';
      case 'sugar': return '🍭';
      case 'processed': return '🍟';
      default: return '⚠️';
    }
  };

  const getMoodEmoji = (mood: number) => {
    const moodMap = [null, '😢', '😕', '😐', '😊', '😍'];
    return moodMap[mood] || '😐';
  };

  return (
    <div className="space-y-6">
      
      {/* Заголовок с кнопкой редактирования */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold gentle-text">
          Питание за {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h2>
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 bg-gradient-to-r from-accent to-accent-glow text-white px-4 py-2 rounded-lg interactive-hover transition-all"
        >
          <Edit className="h-4 w-4" />
          <span>Редактировать</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Приемы пищи */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(entry.meals).map(([mealType, meals]) => {
            if (meals.length === 0) return null;
            
            return (
              <div key={mealType} className="bloom-card bg-white/90 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold gentle-text flex items-center">
                    <span className="text-xl mr-2">{getMealEmoji(mealType)}</span>
                    {getMealTitle(mealType)}
                  </h3>
                  <div className="text-sm soft-text">
                    {meals.length} {meals.length === 1 ? 'продукт' : 'продуктов'}
                  </div>
                </div>

                {/* Настроение до и после */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-bloom-vanilla rounded-lg">
                  <div className="text-center">
                    <div className="text-xs soft-text mb-1">До еды</div>
                    <div className="text-lg">
                      {getMoodEmoji(entry.mood_before_meals?.[mealType as keyof typeof entry.mood_before_meals] || 3)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs soft-text mb-1">После еды</div>
                    <div className="text-lg">
                      {getMoodEmoji(entry.mood_after_meals?.[mealType as keyof typeof entry.mood_after_meals] || 3)}
                    </div>
                  </div>
                </div>

                {/* Список продуктов */}
                <div className="space-y-2">
                  {meals.map(meal => (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-bloom-cream">
                      <div className="flex-1">
                        <div className="font-medium gentle-text">{meal.name}</div>
                        <div className="text-sm soft-text">
                          {meal.portion_size}
                          {meal.time && ` • ${meal.time}`}
                        </div>
                        {meal.contains_trigger_foods.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {meal.contains_trigger_foods.map(trigger => (
                              <span key={trigger} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs flex items-center">
                                <span className="mr-1">{getTriggerIcon(trigger)}</span>
                                {trigger}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Боковая панель со сводкой */}
        <div className="space-y-4">
          
          {/* Потребление воды */}
          <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
            <h3 className="font-semibold gentle-text mb-3 flex items-center">
              💧 Потребление воды
            </h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">{entry.water_intake}л</div>
              <div className="flex justify-center space-x-1 mb-2">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div 
                    key={i}
                    className={`w-3 h-6 rounded border ${
                      i <= entry.water_intake 
                        ? 'bg-blue-400 border-blue-500' 
                        : 'bg-bloom-vanilla border-bloom-cream'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs soft-text">
                {entry.water_intake >= 2 ? 'Норма выполнена ✅' : 'Нужно больше воды 💧'}
              </div>
            </div>
          </div>

          {/* Добавки */}
          {entry.supplements.length > 0 && (
            <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
              <h3 className="font-semibold gentle-text mb-3 flex items-center">
                💊 Добавки
              </h3>
              <div className="space-y-2">
                {entry.supplements.map(supplement => (
                  <div key={supplement.id} className="p-2 bg-bloom-vanilla rounded">
                    <div className="font-medium text-sm gentle-text">{supplement.name}</div>
                    <div className="text-xs soft-text">{supplement.dosage} • {supplement.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Уровни энергии */}
          <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
            <h3 className="font-semibold gentle-text mb-3 flex items-center">
              ⚡ Энергия
            </h3>
            <div className="space-y-3">
              {Object.entries(entry.energy_levels).map(([period, level]) => (
                <div key={period} className="flex items-center justify-between">
                  <span className="text-sm soft-text">
                    {period === 'morning' ? '🌅 Утром' :
                     period === 'afternoon' ? '🌞 Днем' : '🌙 Вечером'}
                  </span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div 
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i <= level ? 'bg-primary' : 'bg-bloom-vanilla'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Пищеварительный комфорт */}
          <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
            <h3 className="font-semibold gentle-text mb-3 flex items-center">
              🫄 Пищеварение
            </h3>
            <div className="text-center">
              <div className="flex justify-center space-x-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <div 
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i <= entry.digestive_comfort ? 'bg-primary' : 'bg-bloom-vanilla'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm soft-text">
                {entry.digestive_comfort >= 4 ? 'Отличное самочувствие' :
                 entry.digestive_comfort >= 3 ? 'Нормальное состояние' : 'Есть дискомфорт'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Заметки */}
      {entry.notes && (
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <h3 className="font-semibold gentle-text mb-3 flex items-center">
            📝 Заметки
          </h3>
          <p className="soft-text">{entry.notes}</p>
        </div>
      )}
    </div>
  );
};