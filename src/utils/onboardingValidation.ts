/**
 * Comprehensive onboarding validation and completion checking
 */

import { OnboardingData } from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  isComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  missingSteps: string[];
  completionPercentage: number;
  hasEssentialData: boolean;
  lastUpdated?: string;
}

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  progress: OnboardingProgress;
}

// Required fields for each onboarding step
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
    required: ['primarySymptoms'],
    optional: ['secondarySymptoms', 'symptomsSeverity']
  },
  medicalHistory: {
    required: ['currentMedications', 'chronicConditions'],
    optional: ['allergies', 'surgeries']
  },
  lifestyle: {
    required: ['exerciseFrequency', 'sleepHours'],
    optional: ['diet', 'stressLevel', 'smokingStatus']
  },
  goals: {
    required: ['primaryGoals'],
    optional: ['preferences', 'priorities']
  }
};

/**
 * Validate completeness of onboarding data
 */
export const validateOnboardingCompleteness = async (
  userId: string, 
  onboardingData?: OnboardingData
): Promise<OnboardingValidationResult> => {
  try {
    // Load onboarding data if not provided
    let data = onboardingData;
    if (!data) {
      const { data: steps } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .order('step_number');
      
      data = {};
      steps?.forEach(step => {
        data![step.step_name] = step.step_data;
      });
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const completedSteps: string[] = [];
    const missingSteps: string[] = [];

    // Validate each step
    for (const [stepName, schema] of Object.entries(STEP_SCHEMAS)) {
      const stepData = data[stepName];
      
      if (!stepData) {
        missingSteps.push(stepName);
        errors.push(`Missing ${stepName} data`);
        continue;
      }

      // Check required fields
      const missingRequired = schema.required.filter(field => 
        !stepData[field] || 
        (Array.isArray(stepData[field]) && stepData[field].length === 0)
      );

      if (missingRequired.length > 0) {
        errors.push(`Step ${stepName} missing required fields: ${missingRequired.join(', ')}`);
        missingSteps.push(stepName);
      } else {
        completedSteps.push(stepName);
      }

      // Check optional fields for warnings
      const missingOptional = schema.optional.filter(field => !stepData[field]);
      if (missingOptional.length > 0) {
        warnings.push(`Step ${stepName} could benefit from: ${missingOptional.join(', ')}`);
      }
    }

    const totalSteps = Object.keys(STEP_SCHEMAS).length;
    const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);
    const hasEssentialData = completedSteps.length >= Math.ceil(totalSteps * 0.7); // 70% minimum

    const progress: OnboardingProgress = {
      isComplete: errors.length === 0 && completedSteps.length === totalSteps,
      completedSteps: completedSteps.length,
      totalSteps,
      missingSteps,
      completionPercentage,
      hasEssentialData,
      lastUpdated: new Date().toISOString()
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      progress
    };

  } catch (error: any) {
    console.error('❌ Onboarding validation error:', error);
    return {
      isValid: false,
      errors: ['Failed to validate onboarding data'],
      warnings: [],
      progress: {
        isComplete: false,
        completedSteps: 0,
        totalSteps: Object.keys(STEP_SCHEMAS).length,
        missingSteps: Object.keys(STEP_SCHEMAS),
        completionPercentage: 0,
        hasEssentialData: false
      }
    };
  }
};

/**
 * Get detailed onboarding progress for a user
 */
export const getOnboardingProgress = async (userId: string): Promise<OnboardingProgress> => {
  const validation = await validateOnboardingCompleteness(userId);
  return validation.progress;
};

/**
 * Check if user should be allowed to skip onboarding
 */
export const canSkipOnboarding = (progress: OnboardingProgress): boolean => {
  return progress.hasEssentialData && progress.completionPercentage >= 70;
};

/**
 * Get next recommended step for onboarding
 */
export const getNextOnboardingStep = (progress: OnboardingProgress): string | null => {
  if (progress.isComplete) return null;
  
  const stepOrder = ['basicInfo', 'menstrualHistory', 'symptoms', 'medicalHistory', 'lifestyle', 'goals'];
  
  for (const step of stepOrder) {
    if (progress.missingSteps.includes(step)) {
      return step;
    }
  }
  
  return null;
};

/**
 * Validate specific step data
 */
export const validateStep = (stepName: string, stepData: any): { isValid: boolean; errors: string[] } => {
  const schema = STEP_SCHEMAS[stepName as keyof typeof STEP_SCHEMAS];
  if (!schema) {
    return { isValid: false, errors: [`Unknown step: ${stepName}`] };
  }

  const errors: string[] = [];
  
  // Check required fields
  for (const field of schema.required) {
    if (!stepData[field] || (Array.isArray(stepData[field]) && stepData[field].length === 0)) {
      errors.push(`Required field missing: ${field}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};