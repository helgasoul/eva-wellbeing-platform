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

  // Priority 1: Check database completion flag
  const isCompleted = Boolean(user.onboarding_completed || user.onboardingCompleted);
  
  const hasGeolocation = Boolean(user.onboardingData?.geolocation) || 
                        Boolean(localStorage.getItem('eva-user-location'));
  
  return {
    isCompleted,
    hasGeolocation,
    completedAt: user.onboarding_completed_at || user.onboardingData?.completedAt,
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
 * Enhanced check for onboarding redirect with data validation
 */
export const shouldRedirectToOnboarding = (user: any): boolean => {
  if (!user || user.role !== 'patient') return false;
  
  // If password recovery and user has essential data, skip onboarding
  const urlParams = new URLSearchParams(window.location.search);
  const isPasswordRecovery = urlParams.get('type') === 'recovery';
  
  if (isPasswordRecovery && user.registrationCompleted) {
    return false;
  }
  
  // Primary check: database completion flag - this is definitive
  const isCompleted = Boolean(user.onboarding_completed || user.onboardingCompleted);
  if (isCompleted) {
    console.log('✅ User onboarding complete - skipping redirect');
    return false;
  }
  
  return true;
};

/**
 * Enhanced check for dashboard redirect with progress validation
 */
export const shouldRedirectToDashboard = (user: any): boolean => {
  if (!user || user.role !== 'patient') return false;
  
  // Primary check: database completion flag - this is definitive
  const isCompleted = Boolean(user.onboarding_completed || user.onboardingCompleted);
  return isCompleted;
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