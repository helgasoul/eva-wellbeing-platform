/**
 * Legacy Auth Service для JIT миграции пользователей
 * Проверяет учетные данные в старой системе и мигрирует их в Supabase
 */

interface LegacyUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  profile_data?: Record<string, any>;
}

interface LegacyAuthResult {
  success: boolean;
  user?: LegacyUser;
  error?: string;
}

class LegacyAuthService {
  /**
   * Проверяет учетные данные в старой системе
   * В реальной реализации здесь может быть:
   * - API вызов к старой системе
   * - Проверка в локальной базе данных
   * - Проверка в файлах localStorage (как временное решение)
   */
  async authenticateUser(email: string, password: string): Promise<LegacyAuthResult> {
    try {
      console.log('🔍 Проверяем legacy аутентификацию для:', email);

      // Временная реализация - проверяем localStorage
      const legacyData = this.checkLocalStorageAuth(email, password);
      if (legacyData.success) {
        return legacyData;
      }

      // Здесь может быть вызов к legacy API
      const legacyApiResult = await this.checkLegacyAPI(email, password);
      if (legacyApiResult.success) {
        return legacyApiResult;
      }

      return {
        success: false,
        error: 'Пользователь не найден в legacy системе'
      };

    } catch (error: any) {
      console.error('❌ Ошибка legacy аутентификации:', error);
      return {
        success: false,
        error: error.message || 'Ошибка проверки в старой системе'
      };
    }
  }

  /**
   * Проверяет наличие пользователя в localStorage (временная реализация)
   */
  private checkLocalStorageAuth(email: string, password: string): LegacyAuthResult {
    try {
      // Проверяем локальные данные (для тестирования миграции)
      const localUserData = localStorage.getItem('eva_user_data');
      if (!localUserData) {
        return { success: false, error: 'Нет данных в localStorage' };
      }

      const userData = JSON.parse(localUserData);
      if (userData.email !== email) {
        return { success: false, error: 'Email не совпадает' };
      }

      // В реальной системе здесь была бы проверка хеша пароля
      // Для демонстрации считаем любой пароль валидным для существующего email
      const onboardingData = localStorage.getItem('eva_onboarding_data');
      let parsedOnboarding = null;
      if (onboardingData) {
        try {
          parsedOnboarding = JSON.parse(onboardingData);
        } catch (e) {
          console.warn('Не удалось парсить данные онбординга');
        }
      }

      return {
        success: true,
        user: {
          id: `legacy_${userData.email}`,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'patient',
          phone: userData.phone,
          onboarding_completed: userData.onboarding_completed || false,
          created_at: new Date().toISOString(),
          profile_data: parsedOnboarding
        }
      };

    } catch (error) {
      return { success: false, error: 'Ошибка проверки localStorage' };
    }
  }

  /**
   * Проверяет учетные данные через legacy API
   * В реальной реализации здесь должен быть HTTP запрос к старому API
   */
  private async checkLegacyAPI(email: string, password: string): Promise<LegacyAuthResult> {
    // Placeholder для реального API вызова
    // В настоящей реализации здесь должно быть что-то вроде:
    /*
    const response = await fetch('https://legacy-api.example.com/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          // ... другие поля
        }
      };
    }
    */

    // Для демонстрации возвращаем неуспешный результат
    return {
      success: false,
      error: 'Legacy API недоступен'
    };
  }

  /**
   * Подготавливает данные пользователя для миграции в Supabase
   */
  prepareMigrationData(legacyUser: LegacyUser) {
    return {
      email: legacyUser.email,
      metadata: {
        first_name: legacyUser.first_name || '',
        last_name: legacyUser.last_name || '',
        role: legacyUser.role || 'patient',
        phone: legacyUser.phone,
        legacy_id: legacyUser.id,
        migrated_at: new Date().toISOString(),
        onboarding_completed: legacyUser.onboarding_completed || false
      },
      profileData: legacyUser.profile_data
    };
  }
}

export const legacyAuthService = new LegacyAuthService();