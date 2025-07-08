import React from 'react';
import { NutritionDateSelector } from './NutritionDateSelector';
import { NutritionEntryForm } from './NutritionEntryForm';
import { NutritionEntryView } from './NutritionEntryView';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';

interface TodayNutritionContentProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  entry: FoodEntry | null;
  onEntryUpdate: (entry: FoodEntry) => void;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  entries: FoodEntry[];
}

export const TodayNutritionContent: React.FC<TodayNutritionContentProps> = ({
  selectedDate,
  onDateChange,
  entry,
  onEntryUpdate,
  isEditing,
  onEditToggle,
  entries
}) => {
  return (
    <div className="space-y-6">
      
      {/* Селектор даты и быстрые действия */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Выбор даты */}
        <div className="lg:col-span-2">
          <NutritionDateSelector 
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            entries={entries}
          />
        </div>

        {/* Быстрые действия */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <h3 className="font-semibold gentle-text mb-3">Быстрые действия</h3>
          <div className="space-y-2">
            <button
              onClick={() => onEditToggle(true)}
              className="w-full bg-gradient-to-r from-primary to-primary-glow text-white py-2 px-4 rounded-lg interactive-hover transition-all"
            >
              {entry ? 'Редактировать' : 'Добавить'} питание
            </button>
            <button className="w-full bg-gradient-to-r from-accent to-accent-glow text-white py-2 px-4 rounded-lg interactive-hover transition-all">
              📊 Анализ за неделю
            </button>
          </div>
        </div>

        {/* Краткая сводка дня */}
        <NutritionDaySummary entry={entry} />
      </div>

      {/* Основной контент */}
      {isEditing ? (
        <NutritionEntryForm 
          date={selectedDate}
          entry={entry}
          onSave={onEntryUpdate}
          onCancel={() => onEditToggle(false)}
        />
      ) : (
        <NutritionEntryView 
          entry={entry}
          date={selectedDate}
          onEdit={() => onEditToggle(true)}
        />
      )}
    </div>
  );
};

// Компонент краткой сводки дня
const NutritionDaySummary = ({ entry }: { entry: FoodEntry | null }) => {
  if (!entry) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <h3 className="font-semibold gentle-text mb-3">Сводка дня</h3>
        <div className="text-center py-4">
          <div className="text-4xl mb-2 animate-gentle-float">🍽️</div>
          <p className="soft-text text-sm">Нет записей</p>
        </div>
      </div>
    );
  }

  const totalMeals = Object.values(entry.meals).flat().length;
  const hasSupplements = entry.supplements.length > 0;
  const waterIntake = entry.water_intake;

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
      <h3 className="font-semibold gentle-text mb-3">Сводка дня</h3>
      <div className="space-y-3">
        
        <div className="flex items-center justify-between">
          <span className="text-sm soft-text">🍽️ Приемы пищи</span>
          <span className="font-medium warm-text">{totalMeals}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm soft-text">💧 Вода</span>
          <span className="font-medium warm-text">{waterIntake}л</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm soft-text">💊 Добавки</span>
          <span className="font-medium warm-text">{hasSupplements ? '✅' : '❌'}</span>
        </div>

        {/* Индикатор самочувствия */}
        <div className="pt-2 border-t border-bloom-cream">
          <div className="text-xs soft-text mb-1">Пищеварение</div>
          <div className="flex space-x-1">
            {[1,2,3,4,5].map(i => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= (entry.digestive_comfort || 0) ? 'bg-primary shadow-warm' : 'bg-bloom-vanilla'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};