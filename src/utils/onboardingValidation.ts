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
    let dbCompletionData: { completed_steps?: string[], completion_percentage?: number } = {};
    
    if (!data) {
      const { data: onboardingRow } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      data = {};
      if (onboardingRow) {
        // Use type casting to handle the new column structure
        const row = onboardingRow as any;
        
        // Store completion data from database
        dbCompletionData = {
          completed_steps: row.completed_steps || [],
          completion_percentage: row.completion_percentage || 0
        };
        
        if (row.basic_info) data.basicInfo = row.basic_info;
        if (row.menstrual_history) data.menstrualHistory = row.menstrual_history;
        if (row.symptoms) data.symptoms = row.symptoms;
        if (row.medical_history) data.medicalHistory = row.medical_history;
        if (row.lifestyle) data.lifestyle = row.lifestyle;
        if (row.goals) data.goals = row.goals;
      }
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const completedSteps: string[] = dbCompletionData.completed_steps || [];
    const missingSteps: string[] = [];

    // Use database completion percentage if available, otherwise calculate
    const completionPercentage = dbCompletionData.completion_percentage || 0;
    const totalSteps = Object.keys(STEP_SCHEMAS).length;
    const isComplete = completionPercentage >= 100;

    // Validate each step for detailed errors/warnings
    for (const [stepName, schema] of Object.entries(STEP_SCHEMAS)) {
      const stepData = data[stepName];
      
      if (!stepData) {
        if (!completedSteps.includes(stepName)) {
          missingSteps.push(stepName);
          errors.push(`Missing ${stepName} data`);
        }
        continue;
      }

      // Check required fields with support for "none_of_the_above" options
      const missingRequired = schema.required.filter(field => {
        const fieldValue = stepData[field];
        
        // Handle arrays - consider valid if contains "none_of_the_above" or has other values
        if (Array.isArray(fieldValue)) {
          return fieldValue.length === 0;
        }
        
        // Handle family history object - consider valid if noneOfTheAbove is true
        if (field === 'familyHistory' && fieldValue && typeof fieldValue === 'object') {
          return !fieldValue.noneOfTheAbove && 
                 !Object.keys(fieldValue).some(key => 
                   key !== 'noneOfTheAbove' && fieldValue[key] === true
                 );
        }
        
        // Special handling for symptoms - frequency fields can be "never"
        if (stepName === 'symptoms' && typeof fieldValue === 'object' && fieldValue !== null) {
          // For symptom objects with frequency, "never" is acceptable
          return !fieldValue.frequency;
        }
        
        // Handle other fields normally (including 0 as valid)
        return !fieldValue && fieldValue !== 0;
      });

      if (missingRequired.length > 0) {
        errors.push(`Step ${stepName} missing required fields: ${missingRequired.join(', ')}`);
        if (!missingSteps.includes(stepName)) {
          missingSteps.push(stepName);
        }
      }

      // Check optional fields for warnings
      const missingOptional = schema.optional.filter(field => !stepData[field]);
      if (missingOptional.length > 0) {
        warnings.push(`Step ${stepName} could benefit from: ${missingOptional.join(', ')}`);
      }
    }

    // Add missing steps that aren't in completed_steps
    const allSteps = Object.keys(STEP_SCHEMAS);
    for (const step of allSteps) {
      if (!completedSteps.includes(step) && !missingSteps.includes(step)) {
        missingSteps.push(step);
      }
    }

    const hasEssentialData = completedSteps.length >= Math.ceil(totalSteps * 0.7); // 70% minimum

    const progress: OnboardingProgress = {
      isComplete,
      completedSteps: completedSteps.length,
      totalSteps,
      missingSteps,
      completionPercentage,
      hasEssentialData,
      lastUpdated: new Date().toISOString()
    };

    console.log(`🔍 Onboarding validation for user ${userId}:`, {
      completionPercentage,
      completedSteps: completedSteps.length,
      totalSteps,
      isComplete,
      errors: errors.length,
      warnings: warnings.length
    });

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
 * Enhanced validation for specific step data with better "none of the above" handling
 */
export const validateStep = (stepName: string, stepData: any): { isValid: boolean; errors: string[] } => {
  const schema = STEP_SCHEMAS[stepName as keyof typeof STEP_SCHEMAS];
  if (!schema) {
    return { isValid: false, errors: [`Unknown step: ${stepName}`] };
  }

  const errors: string[] = [];
  
  // Check required fields with support for "none_of_the_above" options
  for (const field of schema.required) {
    const fieldValue = stepData[field];
    
    // Handle arrays - consider valid if contains "none_of_the_above" or has other values
    if (Array.isArray(fieldValue)) {
      if (fieldValue.length === 0) {
        errors.push(`Required field missing: ${field}`);
      }
    }
    // Handle family history object - consider valid if noneOfTheAbove is true
    else if (field === 'familyHistory' && fieldValue && typeof fieldValue === 'object') {
      if (!fieldValue.noneOfTheAbove && 
          !Object.keys(fieldValue).some(key => 
            key !== 'noneOfTheAbove' && fieldValue[key] === true
          )) {
        errors.push(`Required field missing: ${field}`);
      }
    }
    // Special handling for symptoms step - frequency fields can be "never"
    else if (stepName === 'symptoms' && typeof fieldValue === 'object' && fieldValue !== null) {
      // For symptom objects with frequency, "never" is acceptable
      if (!fieldValue.frequency) {
        errors.push(`Required field missing: ${field}.frequency`);
      }
    }
    // Handle other fields normally
    else if (!fieldValue && fieldValue !== 0) {
      errors.push(`Required field missing: ${field}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};