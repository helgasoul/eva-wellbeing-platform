import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DiaryEntry } from '@/components/nutrition/AddToDiaryModal';

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

  // Загрузить записи из localStorage при инициализации
  useEffect(() => {
    const savedEntries = localStorage.getItem('foodDiaryEntries');
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        // Преобразовать строки дат обратно в Date объекты
        const entriesWithDates = parsedEntries.map((entry: any) => ({
          ...entry,
          addedAt: new Date(entry.addedAt)
        }));
        setDiaryEntries(entriesWithDates);
      } catch (error) {
        console.error('Error parsing saved diary entries:', error);
      }
    }
  }, []);

  // Сохранить записи в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('foodDiaryEntries', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  const addDiaryEntry = (entry: DiaryEntry) => {
    setDiaryEntries(prev => [...prev, entry]);
  };

  const removeDiaryEntry = (id: string) => {
    setDiaryEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateDiaryEntry = (id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
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