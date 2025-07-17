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
      // Try to insert/update to the new onboarding_data table structure
      const updateData: any = {
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // Map step data to the appropriate column
      switch (stepName) {
        case 'basicInfo':
          updateData.basic_info = stepData;
          break;
        case 'menstrualHistory':
          updateData.menstrual_history = stepData;
          break;
        case 'symptoms':
          updateData.symptoms = stepData;
          break;
        case 'medicalHistory':
          updateData.medical_history = stepData;
          break;
        case 'lifestyle':
          updateData.lifestyle = stepData;
          break;
        case 'goals':
          updateData.goals = stepData;
          break;
        default:
          console.warn(`Unknown step name: ${stepName}`);
          return { error: `Unknown step: ${stepName}` };
      }

      const { error } = await supabase
        .from('onboarding_data')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('Save step error:', error);
        return { error: error.message };
      }

      console.log(`✅ Onboarding step ${stepName} saved for user ${userId}`);
      return { error: null };

    } catch (error: any) {
      console.error('Save step error:', error);
      return { error: error.message || 'Ошибка сохранения шага' };
    }
  }

  // Загрузка всех шагов онбординга пользователя
  async loadUserOnboarding(userId: string): Promise<{ data: OnboardingData | null, error: string | null }> {
    try {
      const { data: onboardingRow, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Load onboarding error:', error);
        return { data: null, error: error.message };
      }

      if (!onboardingRow) {
        return { data: null, error: null };
      }

      // Transform the database row into OnboardingData format
      const onboardingData: OnboardingData = {};
      
      // Use type casting to handle the new column structure
      const row = onboardingRow as any;
      
      if (row.basic_info) onboardingData.basicInfo = row.basic_info;
      if (row.menstrual_history) onboardingData.menstrualHistory = row.menstrual_history;
      if (row.symptoms) onboardingData.symptoms = row.symptoms;
      if (row.medical_history) onboardingData.medicalHistory = row.medical_history;
      if (row.lifestyle) onboardingData.lifestyle = row.lifestyle;
      if (row.goals) onboardingData.goals = row.goals;

      console.log(`✅ Loaded onboarding data for user ${userId}`);
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
        .select('onboarding_completed, registration_completed, onboarding_completion_percentage')
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
        
        // Check menopause analysis separately - it's important but not critical
        const { data: analysis } = await supabase
          .from('menopause_analysis')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const hasMenopauseAnalysis = !!analysis;
        
        // If validation fails but flag is true, this indicates data corruption
        if (!validation.isValid && validation.errors.some(e => e.includes('Missing'))) {
          console.warn('⚠️ Onboarding marked complete but validation failed:', validation.errors);
          
          // If user has essential data AND onboarding steps, consider them complete
          // even without menopause analysis (can be generated later)
          const canProceed = validation.progress.hasEssentialData && validation.progress.completedSteps >= 4;
          
          return { 
            completed: canProceed, // Allow completion with essential data
            error: null,
            progress: validation.progress,
            diagnostics: { 
              hasMenopauseAnalysis,
              canGenerateAnalysis: canProceed && !hasMenopauseAnalysis
            }
          };
        }

        return { 
          completed: true, 
          error: null,
          progress: validation.progress,
          diagnostics: { hasMenopauseAnalysis }
        };
      }

      // 3. If flag says incomplete, check if we have sufficient data anyway
      const validation = await validateOnboardingCompleteness(userId);
      
      if (validation.progress.hasEssentialData) {
        console.log('🔧 User has sufficient data but flag is false - fixing...');
        
        // Update the flag using the sync function
        await supabase.rpc('sync_onboarding_completion_status', {
          p_user_id: userId,
          p_completion_percentage: validation.progress.completionPercentage,
          p_phase_result: {},
          p_completed_steps: Object.keys(STEP_SCHEMAS).filter(step => 
            !validation.progress.missingSteps.includes(step)
          )
        });

        return { completed: true, error: null, progress: validation.progress };
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
      
      // 1. Save all onboarding data to database first
      await this.saveAllOnboardingData(userId, onboardingData);
      
      // 2. Pre-completion validation
      const validation = await validateOnboardingCompleteness(userId, onboardingData);
      
      if (!validation.isValid) {
        console.warn('⚠️ Onboarding validation failed:', validation.errors);
        
        // Allow completion if we have essential data (70%+)
        if (!validation.progress.hasEssentialData) {
          return { error: `Insufficient onboarding data. Missing: ${validation.progress.missingSteps.join(', ')}` };
        }
        
        console.log('✅ Proceeding with essential data despite minor validation issues');
      }

      // 3. Save analysis if provided
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

      // 4. Use the sync function to update user profile
      await supabase.rpc('sync_onboarding_completion_status', {
        p_user_id: userId,
        p_completion_percentage: validation.progress.completionPercentage,
        p_phase_result: analysis ? {
          menopause_phase: analysis.menopause_phase,
          phase_confidence: analysis.phase_confidence
        } : {},
        p_completed_steps: validation.progress.missingSteps.length === 0 ? 
          ['basicInfo', 'menstrualHistory', 'symptoms', 'medicalHistory', 'lifestyle', 'goals'] : 
          Object.keys(onboardingData)
      });

      console.log(`✅ Enhanced onboarding completed successfully for user ${userId}`, {
        completionPercentage: validation.progress.completionPercentage,
        hasEssentialData: validation.progress.hasEssentialData
      });
      
      return { error: null };

    } catch (error: any) {
      console.error('❌ Enhanced onboarding completion error:', error);
      return { error: error.message || 'Ошибка завершения онбординга' };
    }
  }

  // Save all onboarding data at once
  private async saveAllOnboardingData(userId: string, onboardingData: OnboardingData): Promise<void> {
    try {
      const updateData: any = {
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // Map all onboarding data to database columns
      if (onboardingData.basicInfo) updateData.basic_info = onboardingData.basicInfo;
      if (onboardingData.menstrualHistory) updateData.menstrual_history = onboardingData.menstrualHistory;
      if (onboardingData.symptoms) updateData.symptoms = onboardingData.symptoms;
      if (onboardingData.medicalHistory) updateData.medical_history = onboardingData.medicalHistory;
      if (onboardingData.lifestyle) updateData.lifestyle = onboardingData.lifestyle;
      if (onboardingData.goals) updateData.goals = onboardingData.goals;

      // Set completed steps
      updateData.completed_steps = Object.keys(onboardingData);

      await supabase
        .from('onboarding_data')
        .upsert(updateData, { onConflict: 'user_id' });

      console.log('✅ All onboarding data saved to database');
    } catch (error) {
      console.error('❌ Save all onboarding data error:', error);
      throw error;
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
        .maybeSingle();

      if (error) {
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
      
      // Save all data at once using the new structure
      await this.saveAllOnboardingData(userId, onboardingData);
      
      // Clear localStorage after migration
      localStorage.removeItem(STORAGE_KEY);
      console.log(`✅ Migrated onboarding data from localStorage for user ${userId}`);
      
      return { migrated: Object.keys(onboardingData).length, error: null };

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
        .update({ 
          onboarding_completed: false, 
          menopause_phase: null,
          onboarding_completion_percentage: 0
        })
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

  // Generate missing menopause analysis for completed users
  async generateMissingAnalysis(userId: string): Promise<{ error: string | null; generated: boolean }> {
    try {
      // Check if analysis already exists
      const { data: existingAnalysis } = await supabase
        .from('menopause_analysis')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingAnalysis) {
        return { error: null, generated: false };
      }

      // Load onboarding data to generate analysis
      const { data: onboardingData, error: loadError } = await this.loadUserOnboarding(userId);
      if (loadError || !onboardingData) {
        return { error: 'No onboarding data found to generate analysis', generated: false };
      }

      // Generate a basic analysis based on available data
      const basicInfo = onboardingData.basicInfo || {};
      const menstrualHistory = onboardingData.menstrualHistory || {};
      const symptoms = onboardingData.symptoms || {};

      // Simple analysis logic based on age and menstrual status
      let menopausePhase = 'unknown';
      let confidence = 0.7;

      // Safely access properties with type checking
      const userAge = (basicInfo as any)?.age;
      const menstrualStatus = (menstrualHistory as any)?.menstrualStatus;
      const primarySymptoms = (symptoms as any)?.primarySymptoms;

      if (userAge) {
        const age = parseInt(userAge);
        if (age < 45) {
          menopausePhase = 'premenopause';
        } else if (age < 55) {
          menopausePhase = 'perimenopause';
        } else {
          menopausePhase = 'postmenopause';
        }
      }

      if (menstrualStatus === 'stopped') {
        menopausePhase = 'postmenopause';
        confidence = 0.9;
      } else if (menstrualStatus === 'irregular') {
        menopausePhase = 'perimenopause';
        confidence = 0.8;
      }

      const analysis: MenopauseAnalysisResult = {
        menopause_phase: menopausePhase,
        phase_confidence: confidence,
        risk_factors: {
          age: userAge,
          menstrualStatus: menstrualStatus,
          symptoms: primarySymptoms || []
        },
        recommendations: {
          immediate: ['Track symptoms daily', 'Maintain healthy lifestyle'],
          lifestyle: ['Regular exercise', 'Balanced nutrition', 'Stress management'],
          medical: ['Consult healthcare provider for personalized advice']
        }
      };

      const { error: saveError } = await this.saveAnalysis(userId, analysis);
      if (saveError) {
        return { error: saveError, generated: false };
      }

      console.log(`✅ Generated missing menopause analysis for user ${userId}`);
      return { error: null, generated: true };

    } catch (error: any) {
      console.error('❌ Generate missing analysis error:', error);
      return { error: error.message || 'Failed to generate analysis', generated: false };
    }
  }
}

// Step schemas for validation
const STEP_SCHEMAS = {
  basicInfo: {
    required: ['age', 'height', 'weight'],
    optional: ['occupation', 'education']
  },
  menstrualHistory: {
    required: ['menstrualStatus', 'lastPeriodDate'],
    optional: ['cycleLength', 'periodLength']  
  },
  symptoms: {
    required: ['physicalSymptoms', 'cognitiveSymptoms'],
    optional: ['hotFlashes', 'nightSweats', 'sleepProblems', 'moodChanges']
  },
  medicalHistory: {
    required: ['chronicConditions', 'familyHistory', 'surgicalHistory'],
    optional: ['currentMedications', 'isOnHRT', 'hrtDetails']
  },
  lifestyle: {
    required: ['exerciseFrequency', 'sleepHours', 'exerciseTypes', 'supplementsUsed'],
    optional: ['dietType', 'stressLevel', 'smokingStatus', 'alcoholConsumption']
  },
  goals: {
    required: ['primaryGoals'],
    optional: ['preferences', 'priorities']
  }
};

export const onboardingService = new OnboardingService();