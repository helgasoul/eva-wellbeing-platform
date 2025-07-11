import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateId, showNotification } from '@/utils/dataUtils';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { DateSelector } from '@/components/symptom-tracker/DateSelector';
import { SymptomEntryForm } from '@/components/symptom-tracker/SymptomEntryForm';
import { SymptomEntryView } from '@/components/symptom-tracker/SymptomEntryView';
import { RecentEntries } from '@/components/symptom-tracker/RecentEntries';
import { healthDataService } from '@/services/healthDataService';
import type { SymptomEntry } from '@/types/healthData';
import { useToast } from '@/hooks/use-toast';
import { SupabaseErrorBoundary } from '@/components/error/SupabaseErrorBoundary';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';

const SymptomTracker: React.FC = () => {
  const { user, saveUserData, loadUserData } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<SymptomEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Дневник симптомов' }
  ];

  // Загрузка записей при монтировании компонента
  useEffect(() => {
    if (user?.id) {
      loadEntries();
    }
  }, [user?.id]);

  // Загрузка записи для выбранной даты
  useEffect(() => {
    if (user?.id) {
      loadCurrentEntry();
    }
  }, [selectedDate, user?.id]);

  const loadEntries = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 SymptomTracker: Загрузка записей...');
      
      // 1. Сначала пытаемся загрузить через DataBridge
      const savedEntries = await loadUserData('symptom_entries');
      if (savedEntries && Array.isArray(savedEntries)) {
        setEntries(savedEntries);
        console.log(`✅ SymptomTracker: Загружено ${savedEntries.length} записей через DataBridge`);
        return;
      }

      // 2. Fallback: загружаем из Supabase
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await healthDataService.getSymptomEntries(user.id, {
        start: startDate,
        end: endDate
      });
      
      if (data && data.length > 0) {
        setEntries(data);
        // Сохраняем в DataBridge для будущих загрузок
        await saveUserData('symptom_entries', data);
        console.log(`✅ SymptomTracker: Загружено ${data.length} записей из Supabase`);
      } else {
        console.log('📥 SymptomTracker: Записи не найдены, создание пустого массива');
        setEntries([]);
      }
      
    } catch (error) {
      console.error('❌ SymptomTracker: Ошибка загрузки записей:', error);
      
      // Последний fallback к старому localStorage
      const saved = localStorage.getItem(`symptom_entries_${user.id}`);
      if (saved) {
        try {
          const localData = JSON.parse(saved);
          setEntries(localData);
          showNotification('Данные загружены из локального хранилища', 'warning');
        } catch (parseError) {
          console.error('Error parsing local data:', parseError);
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
      
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные с сервера. Используются локальные данные.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentEntry = async () => {
    if (!user?.id) return;
    
    try {
      // Загружаем все записи за выбранную дату
      const entriesForDate = entries.filter(e => e.entry_date === selectedDate);
      
      if (entriesForDate.length > 0) {
        // Берем последнюю запись за день для редактирования
        const latestEntry = entriesForDate.sort((a, b) => 
          (b.entry_time || '00:00:00').localeCompare(a.entry_time || '00:00:00')
        )[0];
        setCurrentEntry(latestEntry);
      } else {
        setCurrentEntry(null);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error loading current entry:', error);
      setCurrentEntry(null);
    }
  };

  const saveEntry = async (formData: any) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 SymptomTracker: Сохранение записи в Supabase...', formData);

      // Преобразуем данные формы в формат базы данных
      const entryData = {
        entry_date: formData.date,
        entry_time: formData.time || new Date().toTimeString().split(' ')[0].substring(0, 5) + ':00',
        hot_flashes: formData.hotFlashes,
        night_sweats: formData.nightSweats,
        sleep_data: formData.sleep,
        mood_data: formData.mood,
        energy_level: formData.energy,
        physical_symptoms: formData.physicalSymptoms,
        notes: formData.notes
      };

      console.log('🔄 Преобразованные данные для базы:', entryData);

      // Сначала сохраняем в Supabase
      const savedEntry = await healthDataService.saveSymptomEntry(user.id, entryData);
      
      if (!savedEntry) {
        throw new Error('Не удалось сохранить в Supabase');
      }

      // Обновляем локальное состояние с данными из Supabase
      const updatedEntries = entries.filter(e => 
        !(e.entry_date === savedEntry.entry_date && 
          e.entry_time === savedEntry.entry_time)
      );
      updatedEntries.push(savedEntry);
      updatedEntries.sort((a, b) => {
        const dateCompare = b.entry_date.localeCompare(a.entry_date);
        if (dateCompare !== 0) return dateCompare;
        return (b.entry_time || '00:00:00').localeCompare(a.entry_time || '00:00:00');
      });
      
      setEntries(updatedEntries);
      setCurrentEntry(savedEntry);
      setIsEditing(false);

      // Сохраняем в DataBridge для синхронизации
      await saveUserData('symptom_entries', updatedEntries);
      
      // Сохраняем локально как резервную копию
      localStorage.setItem(`symptom_entries_${user.id}`, JSON.stringify(updatedEntries));

      console.log('✅ SymptomTracker: Запись успешно сохранена в Supabase и синхронизирована');
      showNotification('Запись симптомов сохранена', 'success');
      
      toast({
        title: "Запись сохранена",
        description: "Данные успешно сохранены в облаке"
      });
      
    } catch (error) {
      console.error('❌ SymptomTracker: Ошибка сохранения записи:', error);
      
      // Fallback к старому localStorage
      const localEntry: SymptomEntry = {
        id: generateId(),
        user_id: user.id,
        entry_date: formData.date,
        hot_flashes: formData.hotFlashes,
        night_sweats: formData.nightSweats,
        sleep_data: formData.sleep,
        mood_data: formData.mood,
        energy_level: formData.energy,
        physical_symptoms: formData.physicalSymptoms,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const updated = entries.filter(e => e.entry_date !== localEntry.entry_date);
      updated.push(localEntry);
      updated.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
      
      setEntries(updated);
      setCurrentEntry(localEntry);
      setIsEditing(false);
      localStorage.setItem(`symptom_entries_${user.id}`, JSON.stringify(updated));

      showNotification('Запись сохранена локально', 'warning');
      
      toast({
        title: "Сохранено локально",
        description: "Данные сохранены на устройстве. Синхронизация произойдет при восстановлении соединения.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientLayout title="bloom - Дневник симптомов" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="bloom-card p-6">
          <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
            Дневник симптомов 📊
          </h1>
          <p className="text-muted-foreground">
            Отслеживайте свои симптомы, чтобы лучше понимать изменения в организме
          </p>
        </div>

        {/* Календарь и быстрые действия */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DateSelector 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              entries={entries}
            />
          </div>
          
          <div className="bloom-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Быстрые действия</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {currentEntry ? 'Редактировать запись' : 'Добавить запись'}
              </button>
              
              <button className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary/80 transition-colors">
                Посмотреть тренды
              </button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        {isEditing ? (
          <SymptomEntryForm
            date={selectedDate}
            entry={currentEntry}
            onSave={saveEntry}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <SymptomEntryView
            entry={currentEntry}
            entries={entries}
            date={selectedDate}
            onEdit={() => setIsEditing(true)}
          />
        )}

        {/* Недавние записи */}
        <RecentEntries
          entries={entries.slice(0, 7)}
          onDateSelect={setSelectedDate}
        />
      </div>
    </PatientLayout>
  );
};

export default SymptomTracker;