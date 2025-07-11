// ✅ ЭТАП 4: Сервис онбординга с Supabase (Enhanced)
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '@/types/onboarding';
import { validateOnboardingCompleteness, getOnboardingProgress } from '@/utils/onboardingValidation';
import { runOnboardingDiagnostics, autoRepairOnboarding } from '@/utils/onboardingDiagnostics';

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

  // Enhanced onboarding completion check with comprehensive validation
  async isOnboardingComplete(userId: string): Promise<{ 
    completed: boolean; 
    error: string | null; 
    progress?: any;
    diagnostics?: any;
  }> {
    try {
      // 1. Check profile flag
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, registration_completed')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Check onboarding complete error:', profileError);
        return { completed: false, error: profileError.message };
      }

      if (!profile) {
        return { completed: false, error: 'User profile not found' };
      }

      // 2. If flag says complete, validate data integrity
      if (profile.onboarding_completed) {
        const validation = await validateOnboardingCompleteness(userId);
        
        // If validation fails but flag is true, this indicates data corruption
        if (!validation.isValid && validation.errors.some(e => e.includes('Missing'))) {
          console.warn('⚠️ Onboarding marked complete but validation failed:', validation.errors);
          
          // Auto-repair if possible
          const repair = await autoRepairOnboarding(userId);
          if (repair.repaired) {
            console.log('✅ Auto-repaired onboarding issues:', repair.actions);
          }
          
          return { 
            completed: validation.progress.hasEssentialData, // Use validation result
            error: null,
            progress: validation.progress,
            diagnostics: { autoRepaired: repair.repaired, actions: repair.actions }
          };
        }

        return { 
          completed: true, 
          error: null,
          progress: validation.progress 
        };
      }

      // 3. If flag says incomplete, check if we have sufficient data anyway
      const validation = await validateOnboardingCompleteness(userId);
      
      if (validation.progress.hasEssentialData) {
        console.log('🔧 User has sufficient data but flag is false - fixing...');
        
        // Update the flag
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (!updateError) {
          return { completed: true, error: null, progress: validation.progress };
        }
      }

      return { 
        completed: false, 
        error: null,
        progress: validation.progress
      };

    } catch (error: any) {
      console.error('Check onboarding complete error:', error);
      return { completed: false, error: error.message || 'Ошибка проверки статуса онбординга' };
    }
  }

  // Сохранение анализа менопаузы
  async saveAnalysis(userId: string, analysis: MenopauseAnalysisResult): Promise<{ error: string | null }> {
    try {
      // Ensure phase_confidence is a valid number between 0 and 1
      const validatedConfidence = Math.max(0, Math.min(1, Number(analysis.phase_confidence) || 0));
      
      const { error } = await supabase
        .from('menopause_analysis')
        .upsert({
          user_id: userId,
          menopause_phase: analysis.menopause_phase,
          phase_confidence: validatedConfidence,
          risk_factors: analysis.risk_factors,
          recommendations: analysis.recommendations
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Save analysis error:', error);
        return { error: `Ошибка сохранения анализа: ${error.message}` };
      }

      console.log(`✅ Menopause analysis saved for user ${userId} with confidence ${validatedConfidence}`);
      return { error: null };

    } catch (error: any) {
      console.error('Save analysis error:', error);
      return { error: error.message || 'Ошибка сохранения анализа' };
    }
  }

  // Enhanced onboarding completion with validation
  async completeOnboarding(userId: string, onboardingData: OnboardingData, analysis?: MenopauseAnalysisResult): Promise<{ error: string | null }> {
    try {
      console.log('🚀 Starting enhanced onboarding completion process...');
      
      // 1. Pre-completion validation
      const validation = await validateOnboardingCompleteness(userId, onboardingData);
      
      if (!validation.isValid) {
        console.warn('⚠️ Onboarding validation failed:', validation.errors);
        
        // Allow completion if we have essential data (70%+)
        if (!validation.progress.hasEssentialData) {
          return { error: `Insufficient onboarding data. Missing: ${validation.progress.missingSteps.join(', ')}` };
        }
        
        console.log('✅ Proceeding with essential data despite minor validation issues');
      }

      // 2. Save analysis if provided
      if (analysis) {
        console.log('🔄 Saving menopause analysis...', { 
          phase: analysis.menopause_phase, 
          confidence: analysis.phase_confidence 
        });
        
        const { error: analysisError } = await this.saveAnalysis(userId, analysis);
        if (analysisError) {
          console.error('❌ Analysis save failed:', analysisError);
          return { error: `Не удалось сохранить анализ: ${analysisError}` };
        }
        
        console.log('✅ Analysis saved successfully');
      }

      // 3. Update profile with comprehensive data
      console.log('🔄 Updating user profile completion status...');
      
      const profileUpdate = {
        onboarding_completed: true,
        registration_completed: true,
        menopause_phase: analysis?.menopause_phase,
        onboarding_completion_percentage: validation.progress.completionPercentage,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Profile update failed:', profileError);
        return { error: `Ошибка обновления профиля: ${profileError.message}` };
      }

      // 4. Verify completion with enhanced diagnostics  
      const diagnostics = await runOnboardingDiagnostics(userId);
      
      if (diagnostics.systemStatus === 'error') {
        console.error('❌ Post-completion diagnostics failed:', diagnostics.recommendations);
        return { error: 'Onboarding completion verification failed' };
      }

      // 5. Auto-repair any issues found
      if (diagnostics.systemStatus === 'warning') {
        console.log('🔧 Running auto-repair for minor issues...');
        const repair = await autoRepairOnboarding(userId);
        if (repair.repaired) {
          console.log('✅ Auto-repaired issues:', repair.actions);
        }
      }

      console.log(`✅ Enhanced onboarding completed successfully for user ${userId}`, {
        completionPercentage: validation.progress.completionPercentage,
        systemStatus: diagnostics.systemStatus,
        hasEssentialData: validation.progress.hasEssentialData
      });
      
      return { error: null };

    } catch (error: any) {
      console.error('❌ Enhanced onboarding completion error:', error);
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

  // Get comprehensive onboarding progress
  async getProgress(userId: string) {
    return await getOnboardingProgress(userId);
  }

  // Run diagnostics
  async runDiagnostics(userId: string) {
    return await runOnboardingDiagnostics(userId);
  }

  // Validate data completeness
  async validateCompleteness(userId: string, onboardingData?: OnboardingData) {
    return await validateOnboardingCompleteness(userId, onboardingData);
  }
}

export const onboardingService = new OnboardingService();