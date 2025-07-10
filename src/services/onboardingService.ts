// ✅ ЭТАП 4: Сервис онбординга с Supabase
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/types/onboarding';

export interface OnboardingStep {
  step_number: number;
  step_name: string;
  step_data: any;
  completed_at: string;
}

export interface MenopauseAnalysisResult {
  menopause_phase: string;
  phase_confidence: number;
  risk_factors: any;
  recommendations: any;
}

class OnboardingService {
  // Сохранение шага онбординга
  async saveStep(userId: string, stepNumber: number, stepName: string, stepData: any): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('onboarding_data')
        .upsert({
          user_id: userId,
          step_number: stepNumber,
          step_name: stepName,
          step_data: stepData
        });

      if (error) {
        console.error('Save step error:', error);
        return { error: error.message };
      }

      console.log(`✅ Onboarding step ${stepNumber} saved for user ${userId}`);
      return { error: null };

    } catch (error: any) {
      console.error('Save step error:', error);
      return { error: error.message || 'Ошибка сохранения шага' };
    }
  }

  // Загрузка всех шагов онбординга пользователя
  async loadUserOnboarding(userId: string): Promise<{ data: OnboardingData | null, error: string | null }> {
    try {
      const { data: steps, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .order('step_number');

      if (error) {
        console.error('Load onboarding error:', error);
        return { data: null, error: error.message };
      }

      // Преобразуем данные в формат OnboardingData
      const onboardingData: OnboardingData = {};
      
      steps?.forEach((step: OnboardingStep) => {
        const stepName = step.step_name;
        onboardingData[stepName] = step.step_data;
      });

      console.log(`✅ Loaded ${steps?.length || 0} onboarding steps for user ${userId}`);
      return { data: onboardingData, error: null };

    } catch (error: any) {
      console.error('Load onboarding error:', error);
      return { data: null, error: error.message || 'Ошибка загрузки данных онбординга' };
    }
  }

  // Проверка завершения онбординга
  async isOnboardingComplete(userId: string): Promise<{ completed: boolean, error: string | null }> {
    try {
      // Проверяем профиль пользователя
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Check onboarding complete error:', profileError);
        return { completed: false, error: profileError.message };
      }

      return { completed: profile?.onboarding_completed || false, error: null };

    } catch (error: any) {
      console.error('Check onboarding complete error:', error);
      return { completed: false, error: error.message || 'Ошибка проверки статуса онбординга' };
    }
  }

  // Сохранение анализа менопаузы
  async saveAnalysis(userId: string, analysis: MenopauseAnalysisResult): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('menopause_analysis')
        .insert({
          user_id: userId,
          menopause_phase: analysis.menopause_phase,
          phase_confidence: analysis.phase_confidence,
          risk_factors: analysis.risk_factors,
          recommendations: analysis.recommendations
        });

      if (error) {
        console.error('Save analysis error:', error);
        return { error: error.message };
      }

      console.log(`✅ Menopause analysis saved for user ${userId}`);
      return { error: null };

    } catch (error: any) {
      console.error('Save analysis error:', error);
      return { error: error.message || 'Ошибка сохранения анализа' };
    }
  }

  // Завершение онбординга
  async completeOnboarding(userId: string, onboardingData: OnboardingData, analysis?: MenopauseAnalysisResult): Promise<{ error: string | null }> {
    try {
      // 1. Сохраняем анализ, если предоставлен
      if (analysis) {
        const { error: analysisError } = await this.saveAnalysis(userId, analysis);
        if (analysisError) {
          return { error: analysisError };
        }
      }

      // 2. Обновляем статус онбординга в профиле
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          menopause_phase: analysis?.menopause_phase
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Complete onboarding error:', profileError);
        return { error: profileError.message };
      }

      console.log(`✅ Onboarding completed for user ${userId}`);
      return { error: null };

    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return { error: error.message || 'Ошибка завершения онбординга' };
    }
  }

  // Получение последнего анализа пользователя
  async getLatestAnalysis(userId: string): Promise<{ data: MenopauseAnalysisResult | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('menopause_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Get latest analysis error:', error);
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };

    } catch (error: any) {
      console.error('Get latest analysis error:', error);
      return { data: null, error: error.message || 'Ошибка получения анализа' };
    }
  }

  // Миграция данных из localStorage
  async migrateFromLocalStorage(userId: string): Promise<{ migrated: number, error: string | null }> {
    try {
      const STORAGE_KEY = 'bloom-onboarding-data';
      const localData = localStorage.getItem(STORAGE_KEY);
      
      if (!localData) {
        return { migrated: 0, error: null };
      }

      const onboardingData: OnboardingData = JSON.parse(localData);
      let migratedSteps = 0;

      // Маппинг данных в шаги
      const stepMapping = [
        { key: 'basicInfo', stepNumber: 2, stepName: 'basicInfo' },
        { key: 'menstrualHistory', stepNumber: 3, stepName: 'menstrualHistory' },
        { key: 'symptoms', stepNumber: 4, stepName: 'symptoms' },
        { key: 'medicalHistory', stepNumber: 5, stepName: 'medicalHistory' },
        { key: 'lifestyle', stepNumber: 6, stepName: 'lifestyle' },
        { key: 'goals', stepNumber: 7, stepName: 'goals' }
      ];

      // Сохраняем каждый шаг
      for (const mapping of stepMapping) {
        if (onboardingData[mapping.key]) {
          const { error } = await this.saveStep(
            userId,
            mapping.stepNumber,
            mapping.stepName,
            onboardingData[mapping.key]
          );

          if (!error) {
            migratedSteps++;
          }
        }
      }

      // Очищаем localStorage после миграции
      if (migratedSteps > 0) {
        localStorage.removeItem(STORAGE_KEY);
        console.log(`✅ Migrated ${migratedSteps} onboarding steps from localStorage`);
      }

      return { migrated: migratedSteps, error: null };

    } catch (error: any) {
      console.error('Migration from localStorage error:', error);
      return { migrated: 0, error: error.message || 'Ошибка миграции данных' };
    }
  }

  // Очистка данных онбординга (для тестирования)
  async clearOnboardingData(userId: string): Promise<{ error: string | null }> {
    try {
      const { error: dataError } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('user_id', userId);

      const { error: analysisError } = await supabase
        .from('menopause_analysis')
        .delete()
        .eq('user_id', userId);

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: false, menopause_phase: null })
        .eq('id', userId);

      if (dataError || analysisError || profileError) {
        const error = dataError || analysisError || profileError;
        return { error: error!.message };
      }

      console.log(`✅ Cleared onboarding data for user ${userId}`);
      return { error: null };

    } catch (error: any) {
      console.error('Clear onboarding data error:', error);
      return { error: error.message || 'Ошибка очистки данных онбординга' };
    }
  }
}

export const onboardingService = new OnboardingService();