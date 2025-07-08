import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { TodayNutritionContent } from '@/components/nutrition/TodayNutritionContent';
import { NutritionTrendsContent } from '@/components/nutrition/NutritionTrendsContent';
import { NutritionInsightsContent } from '@/components/nutrition/NutritionInsightsContent';
import { cn } from '@/lib/utils';

interface FoodEntry {
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

interface MealData {
  id: string;
  name: string;
  category: 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'other';
  portion_size: string;
  estimated_calories?: number;
  contains_trigger_foods: string[]; // ['caffeine', 'alcohol', 'spicy', 'sugar']
  time?: string; // HH:MM
}

interface SupplementEntry {
  id: string;
  name: string;
  dosage: string;
  time: string;
  type: 'vitamin' | 'mineral' | 'herbal' | 'omega' | 'probiotic' | 'other';
}

export default function NutritionTracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<FoodEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'trends' | 'insights'>('today');

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Дневник питания' }
  ];

  // Загрузка данных из localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`nutrition_entries_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEntries(parsed);
          
          // Найти запись для выбранной даты
          const dayEntry = parsed.find((entry: FoodEntry) => entry.date === selectedDate);
          setCurrentEntry(dayEntry || null);
        } catch (error) {
          console.error('Ошибка загрузки данных питания:', error);
        }
      }
    }
  }, [user?.id, selectedDate]);

  // Сохранение данных в localStorage
  const saveEntry = (entry: FoodEntry) => {
    if (!user?.id) return;

    const updatedEntries = entries.filter(e => e.id !== entry.id);
    updatedEntries.push(entry);
    
    setEntries(updatedEntries);
    setCurrentEntry(entry);
    localStorage.setItem(`nutrition_entries_${user.id}`, JSON.stringify(updatedEntries));
    setIsEditing(false);
  };

  return (
    <PatientLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-6">
          
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center">
              🥗 Дневник питания
            </h1>
            <p className="soft-text mt-2">
              Отслеживайте влияние питания на симптомы менопаузы
            </p>
          </div>

          {/* Табы */}
          <div className="flex bg-white rounded-xl p-1 shadow-warm mb-6 max-w-md">
            {(['today', 'trends', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-warm"
                    : "gentle-text interactive-hover"
                )}
              >
                {tab === 'today' ? '📅 Сегодня' : 
                 tab === 'trends' ? '📈 Тренды' : '🧠 Инсайты'}
              </button>
            ))}
          </div>

          {/* Контент по табам */}
          {activeTab === 'today' && (
            <TodayNutritionContent 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              entry={currentEntry}
              onEntryUpdate={saveEntry}
              isEditing={isEditing}
              onEditToggle={setIsEditing}
              entries={entries}
            />
          )}

          {activeTab === 'trends' && (
            <NutritionTrendsContent entries={entries} />
          )}

          {activeTab === 'insights' && (
            <NutritionInsightsContent entries={entries} />
          )}
        </div>
      </div>
    </PatientLayout>
  );
}

export type { FoodEntry, MealData, SupplementEntry };