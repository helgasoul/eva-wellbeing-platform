/**
 * Утилита для миграции данных онбординга между localStorage и Supabase
 */

export interface LegacyOnboardingData {
  completed?: boolean;
  completedAt?: string;
  menopausePhase?: string;
  age?: number;
  basicInfo?: any;
  formData?: any;
}

/**
 * Мигрирует существующие данные онбординга из localStorage
 * Проверяет различные ключи и форматы данных
 */
export const migrateOnboardingData = (): {
  onboardingCompleted: boolean;
  onboardingData?: any;
  migrationPerformed: boolean;
} => {
  try {
    // Проверяем флаг завершения онбординга
    const completedFlag = localStorage.getItem('onboardingCompleted');
    if (completedFlag === 'true') {
      console.log('✅ Found onboardingCompleted flag in localStorage');
      
      // Ищем данные онбординга
      const onboardingDataStr = localStorage.getItem('onboardingData');
      let onboardingData = null;
      
      if (onboardingDataStr) {
        try {
          onboardingData = JSON.parse(onboardingDataStr);
          console.log('✅ Migrated onboarding data from localStorage');
        } catch (error) {
          console.warn('⚠️ Failed to parse onboardingData from localStorage');
        }
      }
      
      return {
        onboardingCompleted: true,
        onboardingData,
        migrationPerformed: true
      };
    }

    // Проверяем старые данные пользователя
    const oldUserData = localStorage.getItem('eva_user_data');
    if (oldUserData) {
      try {
        const userData = JSON.parse(oldUserData);
        
        // Если есть признаки завершенного онбординга
        if (userData.onboarding_completed || 
            userData.age || 
            userData.menopausePhase || 
            userData.basicInfo) {
          
          console.log('✅ Migrating onboarding from legacy user data');
          
          // Устанавливаем флаг завершения
          localStorage.setItem('onboardingCompleted', 'true');
          
          // Сохраняем данные в новом формате
          const migratedData = {
            completedAt: userData.completedAt || new Date().toISOString(),
            menopausePhase: userData.menopausePhase,
            formData: userData.basicInfo || userData.formData || {},
            migratedFrom: 'legacy_user_data'
          };
          
          localStorage.setItem('onboardingData', JSON.stringify(migratedData));
          
          return {
            onboardingCompleted: true,
            onboardingData: migratedData,
            migrationPerformed: true
          };
        }
      } catch (error) {
        console.error('❌ Error parsing legacy user data:', error);
        localStorage.removeItem('eva_user_data');
      }
    }

    // Проверяем данные в bloom-onboarding-data
    const bloomOnboardingData = localStorage.getItem('bloom-onboarding-data');
    if (bloomOnboardingData) {
      try {
        const data = JSON.parse(bloomOnboardingData);
        
        // Если данные достаточно полные, считаем онбординг завершенным
        if (data.basicInfo && data.symptoms && Object.keys(data).length >= 3) {
          console.log('✅ Migrating from bloom-onboarding-data');
          
          localStorage.setItem('onboardingCompleted', 'true');
          
          const migratedData = {
            completedAt: new Date().toISOString(),
            formData: data,
            migratedFrom: 'bloom_onboarding'
          };
          
          localStorage.setItem('onboardingData', JSON.stringify(migratedData));
          
          return {
            onboardingCompleted: true,
            onboardingData: migratedData,
            migrationPerformed: true
          };
        }
      } catch (error) {
        console.error('❌ Error parsing bloom onboarding data:', error);
      }
    }

    // Миграция не требуется
    return {
      onboardingCompleted: false,
      migrationPerformed: false
    };

  } catch (error) {
    console.error('❌ Critical error in onboarding migration:', error);
    return {
      onboardingCompleted: false,
      migrationPerformed: false
    };
  }
};

/**
 * Очищает устаревшие данные после успешной миграции
 */
export const cleanupLegacyData = () => {
  try {
    const keysToClean = [
      'eva_user_data',
      'bloom-onboarding-data',
      'eva_onboarding_data'
    ];
    
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up legacy key: ${key}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up legacy data:', error);
  }
};

/**
 * Проверяет, нужна ли пользователю миграция при входе
 */
export const checkMigrationNeeded = (user: any): boolean => {
  if (!user) return false;
  
  // Если у пользователя уже есть onboardingCompleted в профиле, миграция не нужна
  if (user.onboardingCompleted !== undefined) {
    return false;
  }
  
  // Проверяем наличие данных для миграции
  const hasLegacyData = Boolean(
    localStorage.getItem('onboardingCompleted') ||
    localStorage.getItem('eva_user_data') ||
    localStorage.getItem('bloom-onboarding-data')
  );
  
  return hasLegacyData;
};