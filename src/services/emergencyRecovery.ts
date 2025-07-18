
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export interface RecoveryResult {
  success: boolean;
  user?: User;
  source?: string;
  error?: string;
}

export class EmergencyRecoveryService {
  
  // Основной метод восстановления сессии пользователя
  static async recoverUserSession(): Promise<RecoveryResult> {
    console.log('🔄 Starting emergency recovery...');
    
    try {
      // 1. Проверить все возможные источники данных
      const sources = [
        { name: 'Supabase', fn: () => this.trySupabaseRecovery() },
        { name: 'LocalStorage', fn: () => this.tryLocalStorageRecovery() },
        { name: 'Registration', fn: () => this.tryRegistrationDataRecovery() },
        { name: 'Onboarding', fn: () => this.tryOnboardingDataRecovery() }
      ];
      
      for (const source of sources) {
        const recovered = await source.fn();
        if (recovered) {
          console.log(`✅ Recovered from: ${source.name}`);
          await this.syncRecoveredData(recovered);
          return { 
            success: true, 
            user: recovered, 
            source: source.name 
          };
        }
      }
      
      return { success: false, error: 'No recovery sources available' };
    } catch (error) {
      console.error('🚨 Emergency recovery failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Попытка восстановления из Supabase
  private static async trySupabaseRecovery(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        return {
          id: user.id,
          email: user.email!,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role || 'patient',
          onboardingCompleted: profile.onboarding_completed || false,
          createdAt: new Date(profile.created_at),
          onboardingData: profile.onboarding_data || null
        };
      }
      
      return null;
    } catch (error) {
      console.log('Supabase recovery failed:', error);
      return null;
    }
  }
  
  // Восстановление из localStorage
  private static tryLocalStorageRecovery(): User | null {
    const backups = [
      'eva_user_backup',
      'eva_emergency_backup', 
      'eva_user_data',
      'user_profile',
      'bloom-user-data'
    ];
    
    for (const key of backups) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.email && parsed.id) {
            console.log(`Found backup in ${key}`);
            return {
              id: parsed.id,
              email: parsed.email,
              firstName: parsed.firstName || parsed.first_name || '',
              lastName: parsed.lastName || parsed.last_name || '',
              role: parsed.role || 'patient',
              onboardingCompleted: parsed.onboardingCompleted || false,
              createdAt: new Date(parsed.createdAt || Date.now()),
              onboardingData: parsed.onboardingData || null
            };
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }
  
  // Восстановление из данных регистрации
  private static tryRegistrationDataRecovery(): User | null {
    try {
      const regData = localStorage.getItem('registration_data');
      if (regData) {
        const parsed = JSON.parse(regData);
        console.log('Found registration data, creating user from it');
        
        return {
          id: parsed.id || `temp_${Date.now()}`,
          email: parsed.email,
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          role: parsed.role || 'patient',
          onboardingCompleted: false,
          createdAt: new Date(parsed.createdAt || Date.now()),
          onboardingData: null
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // Восстановление из данных онбординга
  private static tryOnboardingDataRecovery(): User | null {
    try {
      const onboardingData = localStorage.getItem('onboarding_data');
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        if (parsed.user) {
          console.log('Found onboarding data, creating user from it');
          
          return {
            id: parsed.user.id || `temp_${Date.now()}`,
            email: parsed.user.email,
            firstName: parsed.user.firstName || '',
            lastName: parsed.user.lastName || '',
            role: parsed.user.role || 'patient',
            onboardingCompleted: parsed.completed || false,
            createdAt: new Date(parsed.user.createdAt || Date.now()),
            onboardingData: parsed
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // Синхронизация восстановленных данных
  private static async syncRecoveredData(user: User): Promise<void> {
    try {
      // Убедиться, что данные есть в Supabase
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!existing && !user.id.startsWith('temp_')) {
        // Создать профиль в Supabase если его нет
        await supabase.from('user_profiles').insert({
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          onboarding_completed: user.onboardingCompleted
        });
        
        console.log('✅ Synced recovered user to Supabase');
      }
      
      // Обновить все backup копии
      const backupData = {
        ...user,
        recoveryTime: new Date().toISOString()
      };
      
      localStorage.setItem('eva_user_backup', JSON.stringify(backupData));
      localStorage.setItem('eva_emergency_backup', JSON.stringify(backupData));
      localStorage.setItem('bloom-user-data', JSON.stringify(backupData));
      
    } catch (error) {
      console.error('Failed to sync recovered data:', error);
    }
  }
  
  // Создание множественных резервных копий
  static createMultipleBackups(user: User): void {
    const backupData = {
      ...user,
      backupTime: new Date().toISOString(),
      version: '1.0'
    };
    
    const backupKeys = [
      'eva_user_backup',
      'eva_emergency_backup',
      'bloom-user-data',
      'user_profile_backup'
    ];
    
    backupKeys.forEach(key => {
      try {
        localStorage.setItem(key, JSON.stringify(backupData));
      } catch (error) {
        console.warn(`Failed to create backup for ${key}:`, error);
      }
    });
    
    console.log('✅ Created multiple user backups');
  }
  
  // Проверка целостности данных
  static async checkDataIntegrity(userId: string): Promise<boolean> {
    try {
      const localUser = JSON.parse(localStorage.getItem('eva_user_backup') || 'null');
      if (!localUser || localUser.id !== userId) return false;
      
      const { data: supabaseProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      return !!supabaseProfile;
    } catch {
      return false;
    }
  }
}
