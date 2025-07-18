import { useMemo } from 'react';
import type { User, SafeUserData, PersonaType, OnboardingPresets } from '@/types/auth';

/**
 * ✅ ХУК для безопасной работы с данными пользователя
 * Предотвращает ошибки undefined и обеспечивает типизацию
 */
export const useSafeUserData = (user: User | null): SafeUserData => {
  return useMemo(() => {
    // ✅ Безопасная проверка персоны
    const validatePersona = (persona: unknown): persona is PersonaType => {
      return typeof persona === 'string' && 
        ['first_signs', 'active_phase', 'postmenopause'].includes(persona);
    };

    // ✅ Безопасная проверка пресетов
    const validatePresets = (presets: unknown): presets is OnboardingPresets => {
      if (!presets || typeof presets !== 'object') return false;
      
      const p = presets as any;
      return (
        typeof p.persona === 'string' &&
        typeof p.userName === 'string' &&
        typeof p.startStep === 'number'
      );
    };

    const selectedPersona = validatePersona(user?.selectedPersona) 
      ? user.selectedPersona 
      : null;

    const onboardingPresets = validatePresets(user?.onboardingPresets)
      ? user.onboardingPresets
      : null;

    return {
      selectedPersona,
      onboardingPresets,
      hasValidPersona: selectedPersona !== null,
      hasValidPresets: onboardingPresets !== null
    };
  }, [user?.selectedPersona, user?.onboardingPresets]);
};

/**
 * ✅ ХУК для безопасного получения данных персоны
 */
export const usePersonaData = (user: User | null) => {
  const { selectedPersona, hasValidPersona } = useSafeUserData(user);

  const personaConfig = useMemo(() => {
    if (!hasValidPersona || !selectedPersona) {
      return {
        title: 'Не определено',
        description: 'Персона не выбрана',
        startStep: 1,
        defaultQuestions: ['basic_info'],
        isValid: false
      };
    }

    const configs = {
      first_signs: {
        title: 'Первые признаки',
        description: 'Начальный этап перименопаузы',
        startStep: 1,
        defaultQuestions: ['menstrual_history', 'family_history'],
        isValid: true
      },
      active_phase: {
        title: 'Активная фаза',
        description: 'Основные симптомы менопаузы',
        startStep: 2,
        defaultQuestions: ['current_symptoms', 'impact_assessment'],
        isValid: true
      },
      postmenopause: {
        title: 'Постменопауза',
        description: 'Период после менопаузы',
        startStep: 3,
        defaultQuestions: ['health_screening', 'wellness'],
        isValid: true
      }
    };

    return configs[selectedPersona] || configs.active_phase;
  }, [selectedPersona, hasValidPersona]);

  return {
    selectedPersona,
    hasValidPersona,
    ...personaConfig
  };
};