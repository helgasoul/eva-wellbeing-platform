
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ContactVerificationData {
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationCodes: {
    email?: string;
    phone?: string;
  };
}

export interface LegalConsentsData {
  gdpr_basic: boolean;
  medical_data: boolean;
  ai_analysis: boolean;
  research_participation: boolean;
  marketing_communications: boolean;
  timestamp?: string;
}

export interface PersonaSelectionData {
  selectedPersona: 'first_signs' | 'active_phase' | 'postmenopause' | null;
  additionalAnswers: Record<string, string>;
  selectedAt?: string;
}

export interface RegistrationState {
  currentStep: 1 | 2 | 3 | 4;
  step1Data: ContactVerificationData;
  step2Data: LegalConsentsData;
  step3Data: PersonaSelectionData;
  step4Data: {
    password: string;
    firstName: string;
    lastName: string;
  };
  isCompleted: boolean;
}

interface RegistrationContextType {
  state: RegistrationState;
  updateStep1Data: (data: Partial<ContactVerificationData>) => void;
  updateStep2Data: (data: Partial<LegalConsentsData>) => void;
  updateStep3Data: (data: Partial<PersonaSelectionData>) => void;
  updateStep4Data: (data: Partial<{ password: string; firstName: string; lastName: string }>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceedToStep: (step: number) => boolean;
  completeRegistration: () => void;
  resetRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const initialState: RegistrationState = {
  currentStep: 1,
  step1Data: {
    email: 'test@eva-platform.ru',
    phone: '+7 999 123 45 67',
    emailVerified: true,
    phoneVerified: true,
    verificationCodes: {}
  },
  step2Data: {
    gdpr_basic: true,
    medical_data: true,
    ai_analysis: true,
    research_participation: true,
    marketing_communications: true
  },
  step3Data: {
    selectedPersona: 'active_phase',
    additionalAnswers: {}
  },
  step4Data: {
    password: '',
    firstName: 'Анна',
    lastName: 'Тестова'
  },
  isCompleted: false
};

export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<RegistrationState>(initialState);

  // Simplified mock functions for m4p version
  const updateStep1Data = (data: Partial<ContactVerificationData>) => {
    setState(prev => ({ ...prev, step1Data: { ...prev.step1Data, ...data } }));
  };

  const updateStep2Data = (data: Partial<LegalConsentsData>) => {
    setState(prev => ({ ...prev, step2Data: { ...prev.step2Data, ...data } }));
  };

  const updateStep3Data = (data: Partial<PersonaSelectionData>) => {
    setState(prev => ({ ...prev, step3Data: { ...prev.step3Data, ...data } }));
  };

  const updateStep4Data = (data: Partial<{ password: string; firstName: string; lastName: string }>) => {
    setState(prev => ({ ...prev, step4Data: { ...prev.step4Data, ...data } }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(4, prev.currentStep + 1) as 1 | 2 | 3 | 4
    }));
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3 | 4
    }));
  };

  const canProceedToStep = (step: number): boolean => {
    // Always return true for m4p version
    return true;
  };

  const completeRegistration = () => {
    setState(prev => ({
      ...prev,
      isCompleted: true,
      step2Data: {
        ...prev.step2Data,
        timestamp: new Date().toISOString()
      },
      step3Data: {
        ...prev.step3Data,
        selectedAt: new Date().toISOString()
      }
    }));
  };

  const resetRegistration = () => {
    setState(initialState);
  };

  return (
    <RegistrationContext.Provider value={{
      state,
      updateStep1Data,
      updateStep2Data,
      updateStep3Data,
      updateStep4Data,
      nextStep,
      prevStep,
      canProceedToStep,
      completeRegistration,
      resetRegistration
    }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
