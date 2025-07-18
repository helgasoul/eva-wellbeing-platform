
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export interface RecoveryResult {
  success: boolean;
  user: User | null;
  source: string;
  error?: string;
}

class AuthRecoveryService {
  private recoveryAttempted = false;

  async attemptRecovery(): Promise<RecoveryResult> {
    if (this.recoveryAttempted) {
      console.log('🔄 Recovery already attempted, skipping');
      return { success: false, user: null, source: 'already_attempted' };
    }

    this.recoveryAttempted = true;
    console.log('🆘 Starting auth recovery process');

    try {
      // Try multiple recovery sources in order of reliability
      const recoveryMethods = [
        this.recoverFromSupabaseSession,
        this.recoverFromLocalStorage,
        this.recoverFromSessionStorage,
        this.recoverFromIndexedDB
      ];

      for (const method of recoveryMethods) {
        try {
          const result = await method();
          if (result.success && result.user) {
            console.log(`✅ Recovery successful from ${result.source}`);
            return result;
          }
        } catch (error) {
          console.warn(`❌ Recovery method ${method.name} failed:`, error);
        }
      }

      return { success: false, user: null, source: 'no_recovery_available' };
    } catch (error) {
      console.error('💥 Critical error during recovery:', error);
      return { 
        success: false, 
        user: null, 
        source: 'recovery_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private recoverFromSupabaseSession = async (): Promise<RecoveryResult> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Supabase session error: ${error.message}`);
    }

    if (!session?.user) {
      return { success: false, user: null, source: 'supabase_session' };
    }

    // Load profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    const user = this.transformToUser(session.user, profile);
    return { success: true, user, source: 'supabase_session' };
  };

  private recoverFromLocalStorage = async (): Promise<RecoveryResult> => {
    const backupData = localStorage.getItem('eva_user_backup');
    if (!backupData) {
      return { success: false, user: null, source: 'localStorage' };
    }

    const user = JSON.parse(backupData);
    return { success: true, user, source: 'localStorage' };
  };

  private recoverFromSessionStorage = async (): Promise<RecoveryResult> => {
    const backupData = sessionStorage.getItem('eva_user_session');
    if (!backupData) {
      return { success: false, user: null, source: 'sessionStorage' };
    }

    const user = JSON.parse(backupData);
    return { success: true, user, source: 'sessionStorage' };
  };

  private recoverFromIndexedDB = async (): Promise<RecoveryResult> => {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['user_data'], 'readonly');
      const store = transaction.objectStore('user_data');
      const request = store.get('current_user');

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const user = request.result;
          resolve({
            success: !!user,
            user: user || null,
            source: 'indexedDB'
          });
        };
        request.onerror = () => {
          resolve({ success: false, user: null, source: 'indexedDB' });
        };
      });
    } catch (error) {
      return { success: false, user: null, source: 'indexedDB' };
    }
  };

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eva_auth_backup', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('user_data')) {
          db.createObjectStore('user_data');
        }
      };
    });
  }

  private transformToUser(supabaseUser: any, profile: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: profile?.user_role || 'patient',
      phone: profile?.phone,
      emailVerified: !!supabaseUser.email_confirmed_at,
      phoneVerified: profile?.phone_verified || false,
      registrationCompleted: profile?.registration_completed || false,
      onboardingCompleted: profile?.onboarding_completed || false,
      avatar: profile?.avatar_url,
      createdAt: new Date(supabaseUser.created_at)
    };
  }

  createBackup(user: User): void {
    try {
      // Multiple backup strategies
      localStorage.setItem('eva_user_backup', JSON.stringify(user));
      sessionStorage.setItem('eva_user_session', JSON.stringify(user));
      
      // IndexedDB backup (async, non-blocking)
      this.createIndexedDBBackup(user);
    } catch (error) {
      console.warn('❌ Failed to create user backup:', error);
    }
  }

  private async createIndexedDBBackup(user: User): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['user_data'], 'readwrite');
      const store = transaction.objectStore('user_data');
      store.put(user, 'current_user');
    } catch (error) {
      console.warn('❌ Failed to create IndexedDB backup:', error);
    }
  }

  reset(): void {
    this.recoveryAttempted = false;
  }
}

export const authRecoveryService = new AuthRecoveryService();
