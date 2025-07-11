
/**
 * Comprehensive onboarding system diagnostics
 */

import { supabase } from '@/integrations/supabase/client';
import { validateOnboardingCompleteness } from './onboardingValidation';

export interface OnboardingDiagnostics {
  userId: string;
  timestamp: string;
  checks: {
    hasSupabaseProfile: boolean;
    hasOnboardingData: boolean;
    hasMenopauseAnalysis: boolean;
    onboardingCompleted: boolean;
    registrationCompleted: boolean;
  };
  dataIntegrity: {
    onboardingDataCount: number;
    duplicateSteps: string[];
    orphanedData: boolean;
  };
  validation: {
    isComplete: boolean;
    completionPercentage: number;
    missingSteps: string[];
    errors: string[];
  };
  recommendations: string[];
  systemStatus: 'healthy' | 'warning' | 'error';
}

/**
 * Run comprehensive diagnostics on user's onboarding state
 */
export const runOnboardingDiagnostics = async (userId: string): Promise<OnboardingDiagnostics> => {
  const timestamp = new Date().toISOString();
  const recommendations: string[] = [];
  let systemStatus: 'healthy' | 'warning' | 'error' = 'healthy';

  try {
    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, registration_completed')
      .eq('id', userId)
      .maybeSingle();

    const hasSupabaseProfile = !!profile && !profileError;
    if (!hasSupabaseProfile) {
      recommendations.push('User profile missing or corrupted');
      systemStatus = 'error';
    }

    // Check onboarding data
    const { data: onboardingSteps, error: onboardingError } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId);

    const hasOnboardingData = !!onboardingSteps && onboardingSteps.length > 0 && !onboardingError;
    const onboardingDataCount = onboardingSteps?.length || 0;

    // Check for duplicate steps
    const stepCounts = new Map<string, number>();
    onboardingSteps?.forEach(step => {
      const count = stepCounts.get(step.step_name) || 0;
      stepCounts.set(step.step_name, count + 1);
    });
    
    const duplicateSteps = Array.from(stepCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([stepName, _]) => stepName);

    if (duplicateSteps.length > 0) {
      recommendations.push(`Found duplicate steps: ${duplicateSteps.join(', ')}`);
      systemStatus = 'warning';
    }

    // Check menopause analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('menopause_analysis')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const hasMenopauseAnalysis = !!analysis && !analysisError;

    // Run validation
    const validation = await validateOnboardingCompleteness(userId);
    
    if (!validation.isValid && validation.errors.length > 0) {
      systemStatus = 'error';
      recommendations.push('Onboarding data validation failed');
    }

    // Check for orphaned data (data exists but completion flag is false)
    const orphanedData = hasOnboardingData && validation.progress.hasEssentialData && !profile?.onboarding_completed;
    if (orphanedData) {
      recommendations.push('User has sufficient data but completion flag is false');
      systemStatus = 'warning';
    }

    // Performance recommendations
    if (onboardingDataCount > 20) {
      recommendations.push('High number of onboarding data records - consider cleanup');
    }

    if (validation.progress.completionPercentage > 50 && validation.progress.completionPercentage < 100) {
      recommendations.push('User partially completed onboarding - prompt for completion');
    }

    return {
      userId,
      timestamp,
      checks: {
        hasSupabaseProfile,
        hasOnboardingData,
        hasMenopauseAnalysis,
        onboardingCompleted: profile?.onboarding_completed || false,
        registrationCompleted: profile?.registration_completed || false,
      },
      dataIntegrity: {
        onboardingDataCount,
        duplicateSteps,
        orphanedData
      },
      validation: {
        isComplete: validation.isValid,
        completionPercentage: validation.progress.completionPercentage,
        missingSteps: validation.progress.missingSteps,
        errors: validation.errors
      },
      recommendations,
      systemStatus
    };

  } catch (error: any) {
    console.error('❌ Diagnostics error:', error);
    return {
      userId,
      timestamp,
      checks: {
        hasSupabaseProfile: false,
        hasOnboardingData: false,
        hasMenopauseAnalysis: false,
        onboardingCompleted: false,
        registrationCompleted: false,
      },
      dataIntegrity: {
        onboardingDataCount: 0,
        duplicateSteps: [],
        orphanedData: false
      },
      validation: {
        isComplete: false,
        completionPercentage: 0,
        missingSteps: [],
        errors: [`Diagnostics failed: ${error.message}`]
      },
      recommendations: ['System diagnostics failed - check connectivity'],
      systemStatus: 'error'
    };
  }
};

/**
 * Auto-repair common onboarding issues
 */
export const autoRepairOnboarding = async (userId: string): Promise<{ repaired: boolean; actions: string[] }> => {
  const actions: string[] = [];
  let repaired = false;

  try {
    const diagnostics = await runOnboardingDiagnostics(userId);
    
    // Fix orphaned data
    if (diagnostics.dataIntegrity.orphanedData) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (!error) {
        actions.push('Fixed orphaned data - marked onboarding as complete');
        repaired = true;
      }
    }

    // Remove duplicate steps (keep the latest)
    if (diagnostics.dataIntegrity.duplicateSteps.length > 0) {
      for (const stepName of diagnostics.dataIntegrity.duplicateSteps) {
        const { data: steps } = await supabase
          .from('onboarding_data')
          .select('id, completed_at')
          .eq('user_id', userId)
          .eq('step_name', stepName)
          .order('completed_at', { ascending: false });

        if (steps && steps.length > 1) {
          const duplicateIds = steps.slice(1).map(step => step.id);
          const { error } = await supabase
            .from('onboarding_data')
            .delete()
            .in('id', duplicateIds);

          if (!error) {
            actions.push(`Removed ${duplicateIds.length} duplicate ${stepName} entries`);
            repaired = true;
          }
        }
      }
    }

    return { repaired, actions };

  } catch (error: any) {
    console.error('❌ Auto-repair error:', error);
    return { repaired: false, actions: [`Auto-repair failed: ${error.message}`] };
  }
};
