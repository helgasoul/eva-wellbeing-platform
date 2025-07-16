import { User } from '@/types/auth';

interface EmergencyAuthData {
  email: string;
  password: string;
  timestamp: number;
}

interface EmergencySession {
  user: User;
  token: string;
  expiresAt: number;
}

class EmergencyAuthService {
  private readonly STORAGE_KEY = 'eva_emergency_auth';
  private readonly SESSION_KEY = 'eva_emergency_session';
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 минут

  // Сохранение credentials для экстренного доступа
  storeEmergencyCredentials(email: string, password: string): void {
    const data: EmergencyAuthData = {
      email,
      password,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Получение сохраненных credentials
  getEmergencyCredentials(): EmergencyAuthData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const parsed: EmergencyAuthData = JSON.parse(data);
      
      // Проверяем, что данные не старше 24 часов
      if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
      
      return parsed;
    } catch {
      return null;
    }
  }

  // Создание локальной сессии для оффлайн режима
  createOfflineSession(user: User): void {
    const session: EmergencySession = {
      user,
      token: this.generateToken(),
      expiresAt: Date.now() + this.SESSION_DURATION
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  // Проверка локальной сессии
  getOfflineSession(): EmergencySession | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      
      const session: EmergencySession = JSON.parse(data);
      
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  // Очистка экстренных данных
  clearEmergencyData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Проверка доступности экстренного режима
  isEmergencyModeAvailable(): boolean {
    const credentials = this.getEmergencyCredentials();
    return credentials !== null;
  }

  // Попытка восстановления сессии из локального хранилища
  attemptSessionRecovery(): User | null {
    const session = this.getOfflineSession();
    if (session) {
      return session.user;
    }
    
    return null;
  }

  // Генерация временного токена
  private generateToken(): string {
    return 'emergency_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Диагностика локального хранилища
  diagnoseLocalStorage(): {
    available: boolean;
    hasCredentials: boolean;
    hasSession: boolean;
    error?: string;
  } {
    try {
      // Проверка доступности localStorage
      const testKey = 'eva_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      return {
        available: true,
        hasCredentials: !!this.getEmergencyCredentials(),
        hasSession: !!this.getOfflineSession()
      };
    } catch (error) {
      return {
        available: false,
        hasCredentials: false,
        hasSession: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const emergencyAuthService = new EmergencyAuthService();