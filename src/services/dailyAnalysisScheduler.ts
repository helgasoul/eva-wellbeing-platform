import { supabase } from '@/integrations/supabase/client';

export interface DailyAnalysisScheduler {
  scheduleUserAnalysis: (userId: string) => Promise<void>;
  runDailyAnalysisForAllUsers: () => Promise<void>;
  initializeDailySchedule: () => void;
}

class DailyAnalysisSchedulerService implements DailyAnalysisScheduler {
  private isInitialized = false;

  /**
   * Инициализирует ежедневное расписание обновления данных
   */
  initializeDailySchedule(): void {
    if (this.isInitialized) return;
    
    console.log('🕐 Инициализация ежедневного обновления анализа корреляций...');
    
    // Проверяем, нужно ли запустить анализ сегодня при загрузке приложения
    this.checkAndRunTodaysAnalysis();
    
    // Устанавливаем расписание на каждое утро в 6:00
    this.scheduleDailyExecution();
    
    this.isInitialized = true;
  }

  /**
   * Проверяет и запускает анализ на сегодня, если он еще не был выполнен
   */
  private async checkAndRunTodaysAnalysis(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (!currentUser) return;

      // Проверяем, был ли уже выполнен анализ сегодня
      const { data: existingAnalysis } = await supabase
        .from('ai_analysis_sessions')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('session_type', 'daily_health_analysis')
        .eq('analysis_date', today)
        .single();

      if (!existingAnalysis) {
        console.log('🧠 Запускаем сегодняшний анализ корреляций...');
        await this.scheduleUserAnalysis(currentUser.id);
      } else {
        console.log('✅ Анализ на сегодня уже выполнен');
      }
    } catch (error) {
      console.error('❌ Ошибка проверки сегодняшнего анализа:', error);
    }
  }

  /**
   * Устанавливает расписание на ежедневное выполнение в 6:00 утра
   */
  private scheduleDailyExecution(): void {
    const now = new Date();
    const nextRun = new Date();
    
    // Устанавливаем время на 6:00 утра
    nextRun.setHours(6, 0, 0, 0);
    
    // Если уже прошло 6 утра сегодня, планируем на завтра
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const timeUntilNextRun = nextRun.getTime() - now.getTime();
    
    console.log(`⏰ Следующий автоматический анализ запланирован на: ${nextRun.toLocaleString()}`);
    
    setTimeout(() => {
      this.runDailyAnalysisForAllUsers();
      
      // Устанавливаем интервал на каждые 24 часа после первого запуска
      setInterval(() => {
        this.runDailyAnalysisForAllUsers();
      }, 24 * 60 * 60 * 1000); // 24 часа
      
    }, timeUntilNextRun);
  }

  /**
   * Планирует анализ для конкретного пользователя
   */
  async scheduleUserAnalysis(userId: string): Promise<void> {
    try {
      console.log(`🔬 Запуск ежедневного анализа для пользователя ${userId}...`);
      
      // Вызываем edge функцию для ежедневного анализа
      const { data, error } = await supabase.functions.invoke('daily-health-analysis', {
        body: { 
          userId, 
          analysisDate: new Date().toISOString().split('T')[0] 
        }
      });

      if (error) {
        console.error(`❌ Ошибка анализа для пользователя ${userId}:`, error);
        return;
      }

      console.log(`✅ Анализ завершен для пользователя ${userId}:`, data);

      // Также запускаем обновление корреляций цикла с Claude
      await this.updateCycleCorrelations(userId);

    } catch (error) {
      console.error(`❌ Ошибка планирования анализа для пользователя ${userId}:`, error);
    }
  }

  /**
   * Обновляет корреляции цикла с помощью Claude
   */
  private async updateCycleCorrelations(userId: string): Promise<void> {
    try {
      // Получаем данные пользователя из локального хранилища и Supabase
      const cycleEntries = JSON.parse(localStorage.getItem(`cycle_entries_${userId}`) || '[]');
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${userId}`) || '[]');
      const nutritionEntries = JSON.parse(localStorage.getItem(`nutrition_entries_${userId}`) || '[]');
      const activityEntries = JSON.parse(localStorage.getItem(`activity_entries_${userId}`) || '[]');
      
      // Получаем данные из Supabase
      const { data: supabaseSymptoms } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      const { data: supabaseNutrition } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Объединяем данные
      const allSymptoms = [...symptomEntries, ...(supabaseSymptoms || [])];
      const allNutrition = [...nutritionEntries, ...(supabaseNutrition || [])];

      // Запускаем анализ корреляций Claude
      const { data: correlationData, error: correlationError } = await supabase.functions.invoke('claude-cycle-analysis', {
        body: {
          cycleEntries,
          symptomEntries: allSymptoms,
          nutritionEntries: allNutrition,
          activityEntries,
          userProfile: this.getUserProfile(userId)
        }
      });

      if (correlationError) {
        console.error('❌ Ошибка анализа корреляций Claude:', correlationError);
        return;
      }

      // Сохраняем результаты анализа в локальное хранилище для быстрого доступа
      if (correlationData && correlationData.success) {
        const analysisResults = {
          cycle: correlationData.analysis.cycle_analysis,
          nutrition: correlationData.analysis.nutrition_correlations,
          activity: correlationData.analysis.activity_correlations,
          insights: correlationData.analysis.integrated_insights,
          recommendations: correlationData.analysis.personalized_recommendations,
          lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(`daily_cycle_analysis_${userId}`, JSON.stringify(analysisResults));
        console.log('✅ Результаты анализа корреляций сохранены');
      }

    } catch (error) {
      console.error('❌ Ошибка обновления корреляций цикла:', error);
    }
  }

  /**
   * Получает профиль пользователя
   */
  private getUserProfile(userId: string) {
    try {
      const onboardingData = localStorage.getItem('bloom-onboarding-data');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        return {
          age: data.age,
          menopausePhase: data.menopausePhase,
          symptoms: data.symptoms,
          goals: data.goals,
          medicalHistory: data.medicalHistory
        };
      }
    } catch (error) {
      console.warn('Ошибка получения профиля пользователя:', error);
    }
    return null;
  }

  /**
   * Запускает ежедневный анализ для всех активных пользователей
   */
  async runDailyAnalysisForAllUsers(): Promise<void> {
    try {
      console.log('🌅 Запуск ежедневного анализа для всех пользователей...');
      
      // Получаем текущего пользователя
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (currentUser) {
        await this.scheduleUserAnalysis(currentUser.id);
      }
      
      console.log('✅ Ежедневный анализ завершен');
      
    } catch (error) {
      console.error('❌ Ошибка ежедневного анализа:', error);
    }
  }

  /**
   * Получает последние результаты анализа для пользователя
   */
  async getLatestAnalysisResults(userId: string): Promise<any> {
    try {
      const cachedResults = localStorage.getItem(`daily_cycle_analysis_${userId}`);
      if (cachedResults) {
        const results = JSON.parse(cachedResults);
        const lastUpdated = new Date(results.lastUpdated);
        const hoursAgo = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        // Если данные обновлялись менее 24 часов назад, используем кэшированные
        if (hoursAgo < 24) {
          return results;
        }
      }
      
      // Если данных нет или они устарели, запускаем новый анализ
      await this.scheduleUserAnalysis(userId);
      
      // Возвращаем кэшированные данные (если есть) или null
      return cachedResults ? JSON.parse(cachedResults) : null;
      
    } catch (error) {
      console.error('❌ Ошибка получения результатов анализа:', error);
      return null;
    }
  }
}

// Экспортируем singleton instance
export const dailyAnalysisScheduler = new DailyAnalysisSchedulerService();