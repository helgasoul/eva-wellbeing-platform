import React, { createContext, useContext, useEffect, useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/data/subscriptionPlans';

export interface SubscriptionPlan {
  id: 'essential' | 'plus' | 'optimum';
  name: string;
  price: number;
  monthlyPrice: number;
  currency: 'RUB';
  icon: string;
  color: string;
  popular?: boolean;
  features: string[];
  limitations: {
    symptom_entries: number | 'unlimited';
    ai_questions_daily: number | 'unlimited';
    doctor_consultations: number;
    biomarker_tests: number;
    genetic_testing: boolean;
    priority_support: boolean;
    personal_coordinator: boolean;
  };
  target_audience: string[];
  description: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_end?: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan | null;
  hasFeatureAccess: (feature: string) => boolean;
  getUsageLimit: (resource: string) => number | 'unlimited';
  upgradeSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = SUBSCRIPTION_PLANS;
  const currentPlan = subscription?.plan || null;

  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = subscription.plan;

    switch (feature) {
      case 'unlimited_symptoms':
        return plan.limitations.symptom_entries === 'unlimited';
      case 'unlimited_ai':
        return plan.limitations.ai_questions_daily === 'unlimited';
      case 'biomarker_analysis':
        return plan.limitations.biomarker_tests > 0;
      case 'doctor_consultations':
        return plan.limitations.doctor_consultations > 0;
      case 'genetic_testing':
        return plan.limitations.genetic_testing;
      case 'priority_support':
        return plan.limitations.priority_support;
      case 'personal_coordinator':
        return plan.limitations.personal_coordinator;
      case 'wearable_integration':
        return ['plus', 'optimum'].includes(plan.id);
      default:
        return true;
    }
  };

  const getUsageLimit = (resource: string): number | 'unlimited' => {
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

  const upgradeSubscription = async (planId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        throw new Error('План не найден');
      }

      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful subscription
      const newSubscription: UserSubscription = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: 'current-user-id',
        plan_id: planId,
        plan: selectedPlan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      setSubscription(newSubscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    plans,
    currentPlan,
    hasFeatureAccess,
    getUsageLimit,
    upgradeSubscription,
    cancelSubscription,
    isLoading,
    error
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};