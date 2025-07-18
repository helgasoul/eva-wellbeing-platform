
import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  supabaseConnection: boolean;
  userSession: boolean;
  dataIntegrity: boolean;
  localStorage: boolean;
  overall: 'healthy' | 'warning' | 'critical';
  details: {
    supabaseLatency?: number;
    sessionValid?: boolean;
    dataConsistency?: boolean;
    storageSpace?: number;
  };
}

export class HealthCheckService {
  
  static async performHealthCheck(): Promise<HealthStatus> {
    console.log('🔍 Starting health check...');
    
    const results = {
      supabaseConnection: false,
      userSession: false,
      dataIntegrity: false,
      localStorage: false,
      overall: 'critical' as const,
      details: {}
    };
    
    // Параллельная проверка всех компонентов
    const [
      supabaseResult,
      sessionResult,
      integrityResult,
      storageResult
    ] = await Promise.allSettled([
      this.checkSupabaseConnection(),
      this.checkUserSession(),
      this.checkDataIntegrity(),
      this.checkLocalStorage()
    ]);
    
    // Обработка результатов
    if (supabaseResult.status === 'fulfilled') {
      results.supabaseConnection = supabaseResult.value.connected;
      results.details.supabaseLatency = supabaseResult.value.latency;
    }
    
    if (sessionResult.status === 'fulfilled') {
      results.userSession = sessionResult.value.valid;
      results.details.sessionValid = sessionResult.value.valid;
    }
    
    if (integrityResult.status === 'fulfilled') {
      results.dataIntegrity = integrityResult.value.consistent;
      results.details.dataConsistency = integrityResult.value.consistent;
    }
    
    if (storageResult.status === 'fulfilled') {
      results.localStorage = storageResult.value.available;
      results.details.storageSpace = storageResult.value.spaceUsed;
    }
    
    // Определение общего состояния
    const healthyCount = Object.values(results).filter(v => v === true).length;
    
    if (healthyCount >= 3) {
      results.overall = 'healthy';
    } else if (healthyCount >= 2) {
      results.overall = 'warning';
    } else {
      results.overall = 'critical';
    }
    
    console.log('🔍 Health Check Results:', results);
    return results;
  }
  
  private static async checkSupabaseConnection(): Promise<{ connected: boolean; latency: number }> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      const latency = Date.now() - startTime;
      
      return {
        connected: !error,
        latency
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime
      };
    }
  }
  
  private static async checkUserSession(): Promise<{ valid: boolean; userId?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return {
        valid: !error && !!user,
        userId: user?.id
      };
    } catch (error) {
      return { valid: false };
    }
  }
  
  private static async checkDataIntegrity(): Promise<{ consistent: boolean; issues?: string[] }> {
    try {
      const issues: string[] = [];
      
      // Проверка пользовательских данных
      const localUser = JSON.parse(localStorage.getItem('eva_user_backup') || 'null');
      if (!localUser) {
        issues.push('No local user backup found');
      }
      
      // Проверка синхронизации с Supabase
      if (localUser?.id) {
        const { data: supabaseProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', localUser.id)
          .maybeSingle();
          
        if (!supabaseProfile) {
          issues.push('User profile not found in Supabase');
        } else {
          // Проверка консистентности данных
          if (supabaseProfile.email !== localUser.email) {
            issues.push('Email mismatch between local and remote');
          }
          if (supabaseProfile.first_name !== localUser.firstName) {
            issues.push('First name mismatch');
          }
        }
      }
      
      // Проверка онбординга
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        try {
          JSON.parse(onboardingData);
        } catch {
          issues.push('Corrupted onboarding data');
        }
      }
      
      return {
        consistent: issues.length === 0,
        issues: issues.length > 0 ? issues : undefined
      };
      
    } catch (error) {
      return {
        consistent: false,
        issues: ['Data integrity check failed']
      };
    }
  }
  
  private static checkLocalStorage(): { available: boolean; spaceUsed: number } {
    try {
      // Проверка доступности localStorage
      const testKey = 'eva_health_check_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Подсчет используемого пространства
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage.getItem(key)!.length;
        }
      }
      
      return {
        available: true,
        spaceUsed: totalSize
      };
    } catch (error) {
      return {
        available: false,
        spaceUsed: 0
      };
    }
  }
  
  // Автоматическое восстановление при обнаружении проблем
  static async attemptAutoRecovery(healthStatus: HealthStatus): Promise<boolean> {
    console.log('🔧 Attempting auto-recovery...');
    
    try {
      // Если проблемы с данными, попытаться восстановить из резервных копий
      if (!healthStatus.dataIntegrity) {
        const { EmergencyRecoveryService } = await import('./emergencyRecovery');
        const recovery = await EmergencyRecoveryService.recoverUserSession();
        
        if (recovery.success) {
          console.log('✅ Auto-recovery successful');
          return true;
        }
      }
      
      // Если проблемы с localStorage, попытаться очистить поврежденные данные
      if (!healthStatus.localStorage) {
        try {
          localStorage.clear();
          console.log('🧹 Cleared localStorage');
        } catch (error) {
          console.error('Failed to clear localStorage:', error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Auto-recovery failed:', error);
      return false;
    }
  }
  
  // Мониторинг в реальном времени
  static startHealthMonitoring(intervalMs: number = 60000): () => void {
    let isMonitoring = true;
    
    const monitor = async () => {
      if (!isMonitoring) return;
      
      const status = await this.performHealthCheck();
      
      if (status.overall === 'critical') {
        console.warn('🚨 Critical health issues detected!');
        await this.attemptAutoRecovery(status);
      } else if (status.overall === 'warning') {
        console.warn('⚠️ Health warnings detected');
      }
      
      // Планирование следующей проверки
      setTimeout(monitor, intervalMs);
    };
    
    // Запуск мониторинга
    monitor();
    
    // Возврат функции для остановки мониторинга
    return () => {
      isMonitoring = false;
    };
  }
}
