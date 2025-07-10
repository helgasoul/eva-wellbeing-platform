/**
 * Утилиты для работы с данными онбординга и геолокации
 */

export interface OnboardingStatus {
  isCompleted: boolean;
  hasGeolocation: boolean;
  completedAt?: string;
  geolocationData?: any;
}

/**
 * Получить статус онбординга пользователя
 */
export const getOnboardingStatus = (user: any): OnboardingStatus => {
  if (!user) {
    return {
      isCompleted: false,
      hasGeolocation: false
    };
  }

  const hasGeolocation = Boolean(user.onboardingData?.geolocation) || 
                        Boolean(localStorage.getItem('eva-user-location'));
  
  return {
    isCompleted: Boolean(user.onboardingCompleted),
    hasGeolocation,
    completedAt: user.onboardingData?.completedAt,
    geolocationData: user.onboardingData?.geolocation || 
                    JSON.parse(localStorage.getItem('eva-user-location') || 'null')
  };
};

/**
 * Сохранить данные геолокации
 */
export const saveGeolocationData = (geolocationData: any) => {
  try {
    localStorage.setItem('eva-user-location', JSON.stringify({
      ...geolocationData,
      savedAt: new Date().toISOString()
    }));
    console.log('💾 Geolocation data saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save geolocation data:', error);
  }
};

/**
 * Получить сохраненные данные геолокации
 */
export const getGeolocationData = () => {
  try {
    const saved = localStorage.getItem('eva-user-location');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('❌ Failed to load geolocation data:', error);
    return null;
  }
};

/**
 * Проверить, нужно ли перенаправить пользователя на онбординг
 */
export const shouldRedirectToOnboarding = (user: any): boolean => {
  if (!user || user.role !== 'patient') return false;
  return !Boolean(user.onboardingCompleted);
};

/**
 * Проверить, нужно ли перенаправить пользователя на дашборд
 */
export const shouldRedirectToDashboard = (user: any): boolean => {
  if (!user || user.role !== 'patient') return false;
  return Boolean(user.onboardingCompleted);
};

/**
 * Очистить данные онбординга при выходе
 */
export const clearOnboardingData = () => {
  try {
    localStorage.removeItem('bloom-onboarding-data');
    localStorage.removeItem('eva_onboarding_presets');
    console.log('🧹 Onboarding data cleared');
  } catch (error) {
    console.error('❌ Failed to clear onboarding data:', error);
  }
};

/**
 * Получить демо-конфиги для тестирования
 */
export const getDemoConfigs = () => {
  return {
    newUser: {
      email: 'new@demo.com',
      password: 'demo123',
      expectedBehavior: 'redirect to onboarding'
    },
    completedUser: {
      email: 'completed@demo.com', 
      password: 'demo123',
      expectedBehavior: 'redirect to dashboard'
    }
  };
};