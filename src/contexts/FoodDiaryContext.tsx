import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DiaryEntry } from '@/components/nutrition/AddToDiaryModal';
import { nutritionDiaryService } from '@/services/nutritionDiaryService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NutrientSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodDiaryContextType {
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: DiaryEntry) => void;
  removeDiaryEntry: (id: string) => void;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  getEntriesForDate: (date: string) => DiaryEntry[];
  calculateDailyNutrients: (date: string) => NutrientSummary;
  getEntriesByMealType: (date: string, mealType: DiaryEntry['mealType']) => DiaryEntry[];
}

const FoodDiaryContext = createContext<FoodDiaryContextType | undefined>(undefined);

export const useFoodDiary = () => {
  const context = useContext(FoodDiaryContext);
  if (!context) {
    throw new Error('useFoodDiary must be used within a FoodDiaryProvider');
  }
  return context;
};

export const FoodDiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load entries from Supabase when user is available
  useEffect(() => {
    if (user?.id) {
      loadEntriesFromDatabase();
    }
  }, [user?.id]);

  // Also save to localStorage as backup
  useEffect(() => {
    if (diaryEntries.length > 0) {
      localStorage.setItem('foodDiaryEntries', JSON.stringify(diaryEntries));
    }
  }, [diaryEntries]);

  const loadEntriesFromDatabase = async () => {
    if (!user?.id) return;

    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const entries = await nutritionDiaryService.getDiaryEntries(user.id, startDate, endDate);
      setDiaryEntries(entries);
    } catch (error) {
      console.error('Error loading entries from database:', error);
      
      // Fallback to localStorage
      const savedEntries = localStorage.getItem('foodDiaryEntries');
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries);
          const entriesWithDates = parsedEntries.map((entry: any) => ({
            ...entry,
            addedAt: new Date(entry.addedAt)
          }));
          setDiaryEntries(entriesWithDates);
        } catch (parseError) {
          console.error('Error parsing local entries:', parseError);
        }
      }
      
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные. Используются локальные данные.",
        variant: "destructive"
      });
    }
  };

  const addDiaryEntry = async (entry: DiaryEntry) => {
    if (!user?.id) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему для сохранения записей.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to Supabase
      await nutritionDiaryService.saveDiaryEntry(user.id, entry);
      
      // Update local state
      setDiaryEntries(prev => [...prev, entry]);
      
      toast({
        title: "Запись добавлена",
        description: "Рецепт успешно добавлен в дневник питания.",
      });
    } catch (error) {
      console.error('Error saving diary entry:', error);
      
      // Fallback to local storage
      setDiaryEntries(prev => [...prev, entry]);
      
      toast({
        title: "Сохранено локально",
        description: "Запись сохранена на устройстве и будет синхронизирована позже.",
        variant: "destructive"
      });
    }
  };

  const removeDiaryEntry = async (id: string) => {
    if (!user?.id) return;

    try {
      await nutritionDiaryService.deleteDiaryEntry(user.id, id);
      setDiaryEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Запись удалена",
        description: "Запись успешно удалена из дневника.",
      });
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      
      // Still remove from local state
      setDiaryEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Удалено локально",
        description: "Запись удалена локально. Изменения будут синхронизированы позже.",
        variant: "destructive"
      });
    }
  };

  const updateDiaryEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    if (!user?.id) return;

    try {
      await nutritionDiaryService.updateDiaryEntry(user.id, id, updates);
      
      setDiaryEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
      
      toast({
        title: "Запись обновлена",
        description: "Изменения успешно сохранены.",
      });
    } catch (error) {
      console.error('Error updating diary entry:', error);
      
      // Still update local state
      setDiaryEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
      
      toast({
        title: "Обновлено локально",
        description: "Изменения сохранены локально и будут синхронизированы позже.",
        variant: "destructive"
      });
    }
  };

  const getEntriesForDate = (date: string) => {
    return diaryEntries.filter(entry => entry.date === date);
  };

  const getEntriesByMealType = (date: string, mealType: DiaryEntry['mealType']) => {
    return diaryEntries.filter(entry => entry.date === date && entry.mealType === mealType);
  };

  const calculateDailyNutrients = (date: string): NutrientSummary => {
    const entries = getEntriesForDate(date);
    return entries.reduce((total, entry) => ({
      calories: total.calories + entry.calories,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <FoodDiaryContext.Provider value={{
      diaryEntries,
      addDiaryEntry,
      removeDiaryEntry,
      updateDiaryEntry,
      getEntriesForDate,
      calculateDailyNutrients,
      getEntriesByMealType
    }}>
      {children}
    </FoodDiaryContext.Provider>
  );
};