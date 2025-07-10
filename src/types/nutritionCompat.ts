// Типы для совместимости с существующими компонентами питания
import type { NutritionEntry } from './healthData';

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: MealData[];
    lunch: MealData[];
    dinner: MealData[];
    snacks: MealData[];
  };
  water_intake: number; // литры
  supplements: SupplementEntry[];
  notes?: string;
  mood_before_meals: {
    breakfast: number; // 1-5
    lunch: number;
    dinner: number;
  };
  mood_after_meals: {
    breakfast: number; // 1-5  
    lunch: number;
    dinner: number;
  };
  energy_levels: {
    morning: number; // 1-5
    afternoon: number;
    evening: number;
  };
  digestive_comfort: number; // 1-5
  created_at: string;
}

export interface MealData {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'other';
  portion_size: string;
  estimated_calories?: number;
  contains_trigger_foods: string[]; // ['caffeine', 'alcohol', 'spicy', 'sugar']
  time?: string; // HH:MM
}

export interface SupplementEntry {
  id: string;
  name: string;
  dosage: string;
  time: string;
  type: 'vitamin' | 'mineral' | 'herbal' | 'omega' | 'probiotic' | 'other';
}

// Конвертеры между типами
export const convertNutritionEntryToFoodEntry = (entries: NutritionEntry[]): FoodEntry => {
  // Группируем записи по дате и типу приема пищи
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.entry_date]) {
      acc[entry.entry_date] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      };
    }
    
    const mealKey = entry.meal_type === 'snack' ? 'snacks' : entry.meal_type;
    acc[entry.entry_date][mealKey].push(...(entry.food_items as MealData[]));
    
    return acc;
  }, {} as Record<string, any>);

  // Возвращаем первую найденную дату (для совместимости)
  const firstDate = Object.keys(entriesByDate)[0];
  const firstEntry = entries[0];
  
  if (!firstEntry) {
    return {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
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
      created_at: new Date().toISOString()
    };
  }

  return {
    id: firstEntry.id,
    date: firstEntry.entry_date,
    meals: entriesByDate[firstDate] || {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    water_intake: 2, // Значение по умолчанию
    supplements: [],
    mood_before_meals: { breakfast: 3, lunch: 3, dinner: 3 },
    mood_after_meals: { breakfast: 3, lunch: 3, dinner: 3 },
    energy_levels: { morning: 3, afternoon: 3, evening: 3 },
    digestive_comfort: firstEntry.symptoms_after?.digestive_comfort || 3,
    notes: '',
    created_at: firstEntry.created_at
  };
};

export const convertFoodEntryToNutritionEntries = (foodEntry: FoodEntry): Omit<NutritionEntry, 'id' | 'user_id' | 'created_at'>[] => {
  const entries: Omit<NutritionEntry, 'id' | 'user_id' | 'created_at'>[] = [];
  
  // Конвертируем каждый прием пищи в отдельную запись
  Object.entries(foodEntry.meals).forEach(([mealType, meals]) => {
    if (meals.length > 0) {
      const mealTypeKey = mealType === 'snacks' ? 'snack' : mealType as 'breakfast' | 'lunch' | 'dinner';
      
      entries.push({
        entry_date: foodEntry.date,
        meal_type: mealTypeKey,
        food_items: meals,
        calories: meals.reduce((sum, meal) => sum + (meal.estimated_calories || 0), 0),
        symptoms_after: {
          digestive_comfort: foodEntry.digestive_comfort,
          energy_change: 0,
          mood_change: 0,
          symptoms: []
        }
      });
    }
  });

  return entries;
};