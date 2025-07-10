import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { DateSelector } from '@/components/symptom-tracker/DateSelector';
import { SymptomEntryForm } from '@/components/symptom-tracker/SymptomEntryForm';
import { SymptomEntryView } from '@/components/symptom-tracker/SymptomEntryView';
import { RecentEntries } from '@/components/symptom-tracker/RecentEntries';
import { healthDataService } from '@/services/healthDataService';
import type { SymptomEntry } from '@/types/healthData';
import { useToast } from '@/hooks/use-toast';

const SymptomTracker: React.FC = () => {
  const { user } = useAuth();
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
      // Загружаем последние 30 дней для отображения в календаре
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await healthDataService.getSymptomEntries(user.id, {
        start: startDate,
        end: endDate
      });
      
      setEntries(data);
    } catch (error) {
      console.error('Error loading symptom entries:', error);
      
      // Fallback к localStorage при ошибке
      const saved = localStorage.getItem(`symptom_entries_${user.id}`);
      if (saved) {
        try {
          const localData = JSON.parse(saved);
          setEntries(localData);
        } catch (parseError) {
          console.error('Error parsing local data:', parseError);
        }
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
      const entry = await healthDataService.getSymptomEntry(user.id, selectedDate);
      setCurrentEntry(entry);
      setIsEditing(false);
    } catch (error) {
      console.error('Error loading current entry:', error);
      // Fallback к поиску в уже загруженных данных
      const entry = entries.find(e => e.entry_date === selectedDate);
      setCurrentEntry(entry || null);
    }
  };

  const saveEntry = async (entryData: Omit<SymptomEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const savedEntry = await healthDataService.saveSymptomEntry(user.id, entryData);
      
      if (savedEntry) {
        // Обновляем локальные данные
        const updatedEntries = entries.filter(e => e.entry_date !== savedEntry.entry_date);
        updatedEntries.push(savedEntry);
        updatedEntries.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
        
        setEntries(updatedEntries);
        setCurrentEntry(savedEntry);
        setIsEditing(false);

        // Сохраняем в localStorage как резервную копию
        localStorage.setItem(`symptom_entries_${user.id}`, JSON.stringify(updatedEntries));

        toast({
          title: "Запись сохранена",
          description: "Данные успешно сохранены в облаке"
        });
      }
    } catch (error) {
      console.error('Error saving symptom entry:', error);
      
      // Fallback к localStorage
      const localEntry: SymptomEntry = {
        id: Date.now().toString(),
        user_id: user.id,
        ...entryData,
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