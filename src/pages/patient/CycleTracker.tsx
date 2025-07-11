import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { CycleCalendarView } from '@/components/cycle-tracker/CycleCalendarView';
import { CycleAnalysisView } from '@/components/cycle-tracker/CycleAnalysisView';
import { CorrelationAnalysisView } from '@/components/cycle-tracker/CorrelationAnalysisView';
import { CycleInsightsView } from '@/components/cycle-tracker/CycleInsightsView';
import { CycleSidebar } from '@/components/cycle-tracker/CycleSidebar';
import { AddCycleEntryModal } from '@/components/cycle-tracker/AddCycleEntryModal';
import { QuickStats } from '@/components/cycle-tracker/QuickStats';
import { analyzeIntegratedHealth } from '@/utils/cycleAnalyzer';
import { healthDataService } from '@/services/healthDataService';
import { cn } from '@/lib/utils';

interface MenstrualEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'menstruation' | 'spotting' | 'missed_expected' | 'ovulation_predicted';
  flow: 'light' | 'normal' | 'heavy' | 'very_heavy' | null;
  duration_days?: number;
  symptoms: {
    cramping: number; // 1-5
    breast_tenderness: number;
    bloating: number;
    mood_changes: number;
    headache: boolean;
    back_pain: boolean;
  };
  notes?: string;
  created_at: string;
}

interface CycleAnalysis {
  current_cycle: {
    start_date: string;
    day_of_cycle: number;
    estimated_length: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular';
    next_predicted_date?: string;
    confidence: number; // 0-100%
  };
  cycle_history: {
    average_length: number;
    shortest_cycle: number;
    longest_cycle: number;
    irregularity_score: number; // 0-100%
    trend: 'stable' | 'lengthening' | 'shortening' | 'irregular';
  };
  perimenopause_indicators: {
    missed_periods_count: number;
    cycle_variability: number;
    symptom_severity_trend: 'increasing' | 'stable' | 'decreasing';
    probable_stage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause';
  };
}

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number; // 0-1
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'high_intensity';
  symptom_impact: {
    cramps: number; // -1 to 1 (negative = reduces, positive = increases)
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
}

export default function CycleTracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cycleEntries, setCycleEntries] = useState<MenstrualEntry[]>([]);
  const [cycleAnalysis, setCycleAnalysis] = useState<CycleAnalysis | null>(null);
  const [nutritionCorrelations, setNutritionCorrelations] = useState<NutritionCorrelation[]>([]);
  const [activityCorrelations, setActivityCorrelations] = useState<ActivityCorrelation[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'analysis' | 'correlations' | 'insights'>('calendar');
  const [loading, setLoading] = useState(true);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient' },
    { label: 'Трекер цикла' }
  ];

  useEffect(() => {
    loadCycleData();
    generateCorrelationAnalysis();
  }, [user?.id]);

  const loadCycleData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('🔄 CycleTracker: Загрузка данных из Supabase...');
      
      // Загружаем последние 90 дней
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const menstrualData = await healthDataService.getMenstrualEntries(user.id, {
        start: startDate,
        end: endDate
      });
      
      // Конвертируем данные из Supabase в формат компонента
      const convertedEntries: MenstrualEntry[] = menstrualData.map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        type: entry.is_period_start ? 'menstruation' : 'spotting',
        flow: ['', 'light', 'normal', 'heavy', 'very_heavy'][entry.flow_level] as any,
        symptoms: {
          cramping: (entry.symptoms as any)?.cramps || 1,
          breast_tenderness: (entry.symptoms as any)?.other_symptoms?.includes('breast_tenderness') ? 3 : 1,
          bloating: (entry.symptoms as any)?.bloating || 1,
          mood_changes: parseInt((entry.symptoms as any)?.mood_changes?.[0] || '1'),
          headache: (entry.symptoms as any)?.other_symptoms?.includes('headache') || false,
          back_pain: (entry.symptoms as any)?.other_symptoms?.includes('back_pain') || false
        },
        notes: entry.notes || '',
        created_at: entry.created_at
      }));
      
      setCycleEntries(convertedEntries);
      console.log('✅ CycleTracker: Загружено записей из Supabase:', convertedEntries.length);
      
    } catch (error) {
      console.error('❌ CycleTracker: Ошибка загрузки данных:', error);
      
      // Fallback к localStorage
      const stored = localStorage.getItem(`cycle_entries_${user.id}`);
      if (stored) {
        try {
          setCycleEntries(JSON.parse(stored));
        } catch (parseError) {
          console.error('Error parsing stored cycle data:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const generateCorrelationAnalysis = async () => {
    if (!user?.id) return;
    
    try {
      // Интеграция всех данных платформы
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user.id}`) || '[]');
      const nutritionEntries = JSON.parse(localStorage.getItem(`nutrition_entries_${user.id}`) || '[]');
      const activityEntries = JSON.parse(localStorage.getItem(`activity_entries_${user.id}`) || '[]');
      
      // ИИ-анализ корреляций
      const correlationResults = await analyzeIntegratedHealth(
        cycleEntries,
        symptomEntries,
        nutritionEntries,
        activityEntries
      );
      
      setNutritionCorrelations(correlationResults.nutrition);
      setActivityCorrelations(correlationResults.activity);
      setCycleAnalysis(correlationResults.cycle);
    } catch (error) {
      console.error('Error generating correlation analysis:', error);
    }
  };

  const handleSaveEntry = async (formEntry: MenstrualEntry) => {
    if (!user?.id) return;

    try {
      console.log('🔄 CycleTracker: Сохранение записи в Supabase...', formEntry);

      // Маппинг строк в числа для flow_level
      const flowMapping = {
        'light': 1,
        'normal': 2,
        'heavy': 3,
        'very_heavy': 4
      };

      // Преобразуем данные формы в формат базы данных
      const entryData = {
        entry_date: formEntry.date,
        flow_level: formEntry.flow ? flowMapping[formEntry.flow] : 0,
        symptoms: {
          cramps: formEntry.symptoms.cramping,
          bloating: formEntry.symptoms.bloating,
          mood_changes: [formEntry.symptoms.mood_changes.toString()],
          other_symptoms: [
            ...(formEntry.symptoms.headache ? ['headache'] : []),
            ...(formEntry.symptoms.back_pain ? ['back_pain'] : []),
            ...(formEntry.symptoms.breast_tenderness > 1 ? ['breast_tenderness'] : [])
          ]
        },
        cycle_day: null, // Будет вычислено автоматически
        is_period_start: formEntry.type === 'menstruation',
        notes: formEntry.notes || ''
      };

      // Сохраняем в Supabase
      const savedEntry = await healthDataService.saveMenstrualEntry(user.id, entryData);
      
      if (savedEntry) {
        // Конвертируем данные из Supabase обратно в формат компонента для локального состояния
        const convertedEntry: MenstrualEntry = {
          id: savedEntry.id,
          date: savedEntry.entry_date,
          type: savedEntry.is_period_start ? 'menstruation' : 'spotting',
          flow: ['', 'light', 'normal', 'heavy', 'very_heavy'][savedEntry.flow_level] as any,
          symptoms: {
            cramping: (savedEntry.symptoms as any)?.cramps || 1,
            breast_tenderness: (savedEntry.symptoms as any)?.other_symptoms?.includes('breast_tenderness') ? 3 : 1,
            bloating: (savedEntry.symptoms as any)?.bloating || 1,
            mood_changes: parseInt((savedEntry.symptoms as any)?.mood_changes?.[0] || '1'),
            headache: (savedEntry.symptoms as any)?.other_symptoms?.includes('headache') || false,
            back_pain: (savedEntry.symptoms as any)?.other_symptoms?.includes('back_pain') || false
          },
          notes: savedEntry.notes || '',
          created_at: savedEntry.created_at
        };
        
        // Обновляем локальное состояние конвертированными данными
        const updatedEntries = [...cycleEntries, convertedEntry];
        setCycleEntries(updatedEntries);
        
        console.log('✅ CycleTracker: Запись успешно сохранена в Supabase');
      } else {
        throw new Error('Не удалось сохранить в Supabase');
      }
    } catch (error) {
      console.error('❌ CycleTracker: Ошибка сохранения записи:', error);
      
      // Fallback к localStorage
      const updatedEntries = [...cycleEntries, formEntry];
      setCycleEntries(updatedEntries);
      localStorage.setItem(`cycle_entries_${user.id}`, JSON.stringify(updatedEntries));
    }
    
    setShowAddEntry(false);
    generateCorrelationAnalysis();
  };

  if (loading) {
    return (
      <PatientLayout breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout breadcrumbs={breadcrumbs}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              📅 Умный трекер цикла
            </h1>
            <p className="text-gray-600 mt-2">
              Отслеживайте цикл и анализируйте влияние питания и активности на ваше самочувствие
            </p>
          </div>

          {/* Быстрая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <QuickStats cycleAnalysis={cycleAnalysis} />
          </div>

          {/* Табы */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 max-w-3xl">
            {(['calendar', 'analysis', 'correlations', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-pink-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {tab === 'calendar' ? '📅 Календарь' :
                 tab === 'analysis' ? '📊 Анализ цикла' :
                 tab === 'correlations' ? '🔗 Корреляции' : '🧠 ИИ-инсайты'}
              </button>
            ))}
          </div>

          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Главная область */}
            <div className="lg:col-span-3">
              {activeTab === 'calendar' && (
                <CycleCalendarView
                  entries={cycleEntries}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onAddEntry={() => setShowAddEntry(true)}
                  cycleAnalysis={cycleAnalysis}
                />
              )}
              
              {activeTab === 'analysis' && (
                <CycleAnalysisView 
                  analysis={cycleAnalysis}
                  entries={cycleEntries}
                />
              )}
              
              {activeTab === 'correlations' && (
                <CorrelationAnalysisView
                  nutritionCorrelations={nutritionCorrelations}
                  activityCorrelations={activityCorrelations}
                  onUpdateLifestyle={generateCorrelationAnalysis}
                />
              )}
              
              {activeTab === 'insights' && (
                <CycleInsightsView
                  cycleAnalysis={cycleAnalysis}
                  correlations={{ nutrition: nutritionCorrelations, activity: activityCorrelations }}
                />
              )}
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              <CycleSidebar 
                cycleAnalysis={cycleAnalysis}
                onQuickLog={() => setShowAddEntry(true)}
              />
            </div>
          </div>

          {/* Модальное окно добавления записи */}
          {showAddEntry && (
            <AddCycleEntryModal
              date={selectedDate}
              onClose={() => setShowAddEntry(false)}
              onSave={handleSaveEntry}
            />
          )}
        </div>
      </div>
    </PatientLayout>
  );
}