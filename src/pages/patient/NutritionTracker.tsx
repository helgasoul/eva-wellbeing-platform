import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { TodayNutritionContent } from '@/components/nutrition/TodayNutritionContent';
import { NutritionTrendsContent } from '@/components/nutrition/NutritionTrendsContent';
import { NutritionInsightsContent } from '@/components/nutrition/NutritionInsightsContent';
import { healthDataService } from '@/services/healthDataService';
import type { 
  FoodEntry, 
  MealData, 
  SupplementEntry
} from '@/types/nutritionCompat';
import { 
  convertNutritionEntryToFoodEntry,
  convertFoodEntryToNutritionEntries
} from '@/types/nutritionCompat';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function NutritionTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<FoodEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'trends' | 'insights'>('today');

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Дневник питания' }
  ];

  // Загрузка данных из Supabase
  useEffect(() => {
    if (user?.id) {
      loadNutritionData();
    }
  }, [user?.id]);

  // Обновление текущей записи при изменении выбранной даты
  useEffect(() => {
    const dayEntry = entries.find(entry => entry.date === selectedDate);
    setCurrentEntry(dayEntry || null);
  }, [selectedDate, entries]);

  const loadNutritionData = async () => {
    if (!user?.id) return;
    
    try {
      // Загружаем последние 30 дней
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const nutritionEntries = await healthDataService.getNutritionEntries(user.id, {
        start: startDate,
        end: endDate
      });

      // Группируем записи по датам и конвертируем в FoodEntry
      const entriesByDate = nutritionEntries.reduce((acc, entry) => {
        if (!acc[entry.entry_date]) {
          acc[entry.entry_date] = [];
        }
        acc[entry.entry_date].push(entry);
        return acc;
      }, {} as Record<string, any[]>);

      const foodEntries: FoodEntry[] = Object.entries(entriesByDate).map(([date, dateEntries]) => {
        return convertNutritionEntryToFoodEntry(dateEntries);
      });

      setEntries(foodEntries);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
      
      // Fallback к localStorage
      const saved = localStorage.getItem(`nutrition_entries_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEntries(parsed);
        } catch (parseError) {
          console.error('Error parsing local nutrition data:', parseError);
        }
      }
      
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные с сервера. Используются локальные данные.",
        variant: "destructive"
      });
    }
  };

  const saveEntry = async (entry: FoodEntry) => {
    if (!user?.id) return;

    try {
      // Конвертируем FoodEntry обратно в NutritionEntry записи
      const nutritionEntries = convertFoodEntryToNutritionEntries(entry);
      
      // Сохраняем каждую запись в Supabase
      for (const nutritionEntry of nutritionEntries) {
        await healthDataService.saveNutritionEntry(user.id, nutritionEntry);
      }

      // Обновляем локальное состояние
      const updatedEntries = entries.filter(e => e.date !== entry.date);
      updatedEntries.push(entry);
      updatedEntries.sort((a, b) => b.date.localeCompare(a.date));
      
      setEntries(updatedEntries);
      setCurrentEntry(entry);
      setIsEditing(false);

      // Сохраняем в localStorage как резервную копию
      localStorage.setItem(`nutrition_entries_${user.id}`, JSON.stringify(updatedEntries));

      toast({
        title: "Запись сохранена",
        description: "Данные успешно сохранены в облаке"
      });
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      
      // Fallback к localStorage
      const updatedEntries = entries.filter(e => e.date !== entry.date);
      updatedEntries.push(entry);
      updatedEntries.sort((a, b) => b.date.localeCompare(a.date));
      
      setEntries(updatedEntries);
      setCurrentEntry(entry);
      setIsEditing(false);
      localStorage.setItem(`nutrition_entries_${user.id}`, JSON.stringify(updatedEntries));

      toast({
        title: "Сохранено локально",
        description: "Данные сохранены на устройстве. Синхронизация произойдет при восстановлении соединения.",
        variant: "destructive"
      });
    }
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