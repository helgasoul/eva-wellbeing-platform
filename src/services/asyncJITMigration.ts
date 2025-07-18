
import { supabase } from '@/integrations/supabase/client';
import { legacyAuthService } from './legacyAuthService';
import { toast } from '@/hooks/use-toast';

export interface JITMigrationResult {
  success: boolean;
  requiresUI: boolean;
  user?: any;
  error?: string;
}

class AsyncJITMigrationService {
  private migrationQueue = new Set<string>();
  private migrationInProgress = new Set<string>();

  async attemptJITMigration(email: string, password: string): Promise<JITMigrationResult> {
    const migrationKey = `${email}:${Date.now()}`;
    
    // Prevent duplicate migrations
    if (this.migrationInProgress.has(email)) {
      return { success: false, requiresUI: false, error: 'Migration already in progress' };
    }

    this.migrationInProgress.add(email);
    
    try {
      console.log('🔄 Starting async JIT migration for:', email);
      
      // Quick legacy auth check
      const legacyResult = await Promise.race([
        legacyAuthService.authenticateUser(email, password),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Legacy auth timeout')), 5000)
        )
      ]);

      if (!legacyResult.success) {
        return { success: false, requiresUI: false, error: 'User not found in legacy system' };
      }

      // Attempt background migration
      const migrationResult = await this.performBackgroundMigration(email, password, legacyResult.user);
      
      if (migrationResult.success) {
        this.cleanupLegacyData(email);
        return { success: true, requiresUI: false, user: migrationResult.user };
      } else {
        // If background migration fails, fall back to UI migration
        return { success: false, requiresUI: true, error: 'Background migration failed' };
      }
      
    } catch (error) {
      console.error('❌ JIT migration error:', error);
      return { 
        success: false, 
        requiresUI: true, 
        error: error instanceof Error ? error.message : 'Migration failed'
      };
    } finally {
      this.migrationInProgress.delete(email);
    }
  }

  private async performBackgroundMigration(email: string, password: string, legacyUser: any): Promise<{ success: boolean; user?: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('jit-password-migration', {
        body: {
          email,
          password,
          legacyUserData: legacyAuthService.prepareMigrationData(legacyUser)
        }
      });

      if (error) {
        throw new Error(`Migration function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Migration failed');
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Background migration failed:', error);
      return { success: false };
    }
  }

  async performUIBasedMigration(email: string, newPassword: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const legacyUser = localStorage.getItem('eva_user_data');
      if (!legacyUser) {
        return { success: false, error: 'No legacy user data found' };
      }

      const userData = JSON.parse(legacyUser);
      if (userData.email !== email) {
        return { success: false, error: 'Email mismatch' };
      }

      const { data, error } = await supabase.functions.invoke('jit-password-migration', {
        body: {
          email,
          password: newPassword,
          legacyUserData: legacyAuthService.prepareMigrationData(userData)
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Migration failed' };
      }

      this.cleanupLegacyData(email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ UI migration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Migration failed'
      };
    }
  }

  private cleanupLegacyData(email: string): void {
    try {
      localStorage.removeItem('eva_user_data');
      localStorage.removeItem('eva_onboarding_data');
      console.log('🧹 Legacy data cleaned up for:', email);
    } catch (error) {
      console.warn('❌ Failed to cleanup legacy data:', error);
    }
  }

  // Queue migration for later if network is unavailable
  queueMigration(email: string, password: string): void {
    this.migrationQueue.add(JSON.stringify({ email, password, timestamp: Date.now() }));
  }

  // Process queued migrations when network is available
  async processQueuedMigrations(): Promise<void> {
    if (this.migrationQueue.size === 0) return;

    console.log(`🔄 Processing ${this.migrationQueue.size} queued migrations`);
    
    const migrations = Array.from(this.migrationQueue);
    this.migrationQueue.clear();

    for (const migrationData of migrations) {
      try {
        const { email, password } = JSON.parse(migrationData);
        const result = await this.attemptJITMigration(email, password);
        
        if (result.success) {
          toast({
            title: 'Миграция завершена',
            description: `Аккаунт ${email} успешно обновлен`,
          });
        }
      } catch (error) {
        console.error('❌ Failed to process queued migration:', error);
      }
    }
  }
}

export const asyncJITMigrationService = new AsyncJITMigrationService();
