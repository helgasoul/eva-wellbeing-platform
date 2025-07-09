import type { UserSubscription } from '@/context/SubscriptionContext';

export const FEATURES = {
  UNLIMITED_SYMPTOMS: 'unlimited_symptoms',
  UNLIMITED_AI: 'unlimited_ai',
  BIOMARKER_ANALYSIS: 'biomarker_analysis',
  DOCTOR_CONSULTATIONS: 'doctor_consultations',
  GENETIC_TESTING: 'genetic_testing',
  PRIORITY_SUPPORT: 'priority_support',
  PERSONAL_COORDINATOR: 'personal_coordinator',
  WEARABLE_INTEGRATION: 'wearable_integration'
} as const;

export const hasFeatureAccess = (
  subscription: UserSubscription | null,
  feature: string
): boolean => {
  if (!subscription || subscription.status !== 'active') {
    return false;
  }
  
  const plan = subscription.plan;
  
  switch (feature) {
    case FEATURES.UNLIMITED_SYMPTOMS:
      return plan.limitations.symptom_entries === 'unlimited';
    case FEATURES.UNLIMITED_AI:
      return plan.limitations.ai_questions_daily === 'unlimited';
    case FEATURES.BIOMARKER_ANALYSIS:
      return plan.limitations.biomarker_tests > 0;
    case FEATURES.DOCTOR_CONSULTATIONS:
      return plan.limitations.doctor_consultations > 0;
    case FEATURES.GENETIC_TESTING:
      return plan.limitations.genetic_testing;
    case FEATURES.PRIORITY_SUPPORT:
      return plan.limitations.priority_support;
    case FEATURES.PERSONAL_COORDINATOR:
      return plan.limitations.personal_coordinator;
    case FEATURES.WEARABLE_INTEGRATION:
      return ['plus', 'optimum'].includes(plan.id);
    default:
      return true;
  }
};

export const getUsageLimit = (
  subscription: UserSubscription | null,
  resource: string
): number | 'unlimited' => {
  if (!subscription || subscription.status !== 'active') {
    return 0;
  }

  const plan = subscription.plan;

  switch (resource) {
    case 'symptom_entries':
      return plan.limitations.symptom_entries;
    case 'ai_questions':
      return plan.limitations.ai_questions_daily;
    case 'doctor_consultations':
      return plan.limitations.doctor_consultations;
    case 'biomarker_tests':
      return plan.limitations.biomarker_tests;
    default:
      return 0;
  }
};

export const getPlanRecommendation = (userAge: number, symptoms: string[]): string => {
  if (userAge >= 50 || symptoms.includes('family_history')) {
    return 'optimum';
  } else if (userAge >= 45 || symptoms.length > 3) {
    return 'plus';
  } else {
    return 'essential';
  }
};

export const formatPrice = (price: number, currency: string = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};