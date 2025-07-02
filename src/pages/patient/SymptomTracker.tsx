
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { DateSelector } from '@/components/symptom-tracker/DateSelector';
import { SymptomEntryForm } from '@/components/symptom-tracker/SymptomEntryForm';
import { SymptomEntryView } from '@/components/symptom-tracker/SymptomEntryView';
import { RecentEntries } from '@/components/symptom-tracker/RecentEntries';

interface SymptomEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hotFlashes: {
    count: number;
    severity: number; // 1-5
    triggers?: string[];
  };
  nightSweats: {
    occurred: boolean;
    severity: number; // 1-5
  };
  sleep: {
    hoursSlept: number;
    quality: number; // 1-5
    fallAsleepTime?: string;
    wakeUpTime?: string;
  };
  mood: {
    overall: number; // 1-5 (1=очень плохое, 5=отличное)
    anxiety: number; // 1-5
    irritability: number; // 1-5
  };
  physicalSymptoms: string[]; // ['headache', 'joint_pain', 'fatigue', 'bloating']
  energy: number; // 1-5
  notes?: string;
  createdAt: string;
}

const SymptomTracker: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<SymptomEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Дневник симптомов' }
  ];

  // Загрузка записей при монтировании компонента
  useEffect(() => {
    loadEntries();
  }, []);

  // Загрузка записи для выбранной даты
  useEffect(() => {
    const entry = entries.find(e => e.date === selectedDate);
    setCurrentEntry(entry || null);
    setIsEditing(false);
  }, [selectedDate, entries]);

  const loadEntries = () => {
    // Загрузка из localStorage (позже заменить на API)
    const saved = localStorage.getItem(`symptom_entries_${user?.id}`);
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  };

  const saveEntry = (entry: SymptomEntry) => {
    const updated = entries.filter(e => e.date !== entry.date);
    updated.push(entry);
    updated.sort((a, b) => b.date.localeCompare(a.date));
    
    setEntries(updated);
    localStorage.setItem(`symptom_entries_${user?.id}`, JSON.stringify(updated));
    setCurrentEntry(entry);
    setIsEditing(false);
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
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
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
