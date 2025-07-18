// ✅ ЭТАП 4: Сервис аутентификации с Supabase + Audit Logging
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, LoginCredentials, RegisterData } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { authAuditService } from './authAuditService';
import { rateLimitService } from './rateLimitService';
import { passwordPolicyService } from './passwordPolicyService';
import { asyncJITMigrationService } from './asyncJITMigration';

export interface AuthResponse {
  user: User | null;
  error: string | null;
  rateLimited?: boolean;
  retryAfter?: number;
  requiresMigration?: boolean;
}

class AuthService {
  private transformSupabaseUser(supabaseUser: SupabaseUser, profileData?: any): User {
    const user = {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName: profileData?.first_name || '',
      lastName: profileData?.last_name || '',
      role: (profileData?.user_role as UserRole) || UserRole.PATIENT,
      phone: profileData?.phone,
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      phoneVerified: profileData?.phone_verified || false,
      registrationCompleted: profileData?.registration_completed || false,
      onboardingCompleted: profileData?.onboarding_completed || false,
      avatar: profileData?.avatar_url,
      createdAt: new Date(supabaseUser.created_at)
    };
    
    return user;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Validate password against policy
      const passwordValidation = await passwordPolicyService.validatePassword(userData.password, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      if (!passwordValidation.isValid) {
        return {
          user: null,
          error: passwordValidation.errors[0] || 'Пароль не соответствует требованиям безопасности'
        };
      }

      // Check rate limiting
      const rateLimitResult = await rateLimitService.checkRateLimit('register', userData.email);
      if (!rateLimitResult.allowed) {
        await authAuditService.logRegistrationAttempt(
          userData.email,
          false,
          'Rate limit exceeded',
          undefined,
          userData.role
        );
        return {
          user: null,
          error: `Превышено количество попыток регистрации. Попробуйте через ${Math.ceil(rateLimitResult.retryAfter! / 60)} минут.`,
          rateLimited: true,
          retryAfter: rateLimitResult.retryAfter
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          },
        },
      });

      if (error) {
        await authAuditService.logRegistrationAttempt(
          userData.email, 
          false, 
          error.message, 
          undefined, 
          userData.role
        );
        return { user: null, error: error.message };
      }

      if (!data.user) {
        await authAuditService.logRegistrationAttempt(
          userData.email, 
          false, 
          'Пользователь не создан', 
          undefined, 
          userData.role
        );
        return { user: null, error: 'Не удалось создать пользователя' };
      }

      // Wait for profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user = this.transformSupabaseUser(data.user, {
        first_name: profileData?.first_name || userData.firstName,
        last_name: profileData?.last_name || userData.lastName,
        user_role: profileData?.user_role || userData.role,
        onboarding_completed: profileData?.onboarding_completed || false,
        registration_completed: true
      });

      await authAuditService.logRegistrationAttempt(
        user.email, 
        true, 
        undefined, 
        user.id, 
        user.role
      );
      await rateLimitService.recordAttempt('register', true, userData.email);
      
      return { user, error: null };

    } catch (error: any) {
      console.error('Registration error:', error);
      await authAuditService.logRegistrationAttempt(
        userData.email, 
        false, 
        error.message
      );
      return { user: null, error: error.message };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check rate limiting
      const rateLimitResult = await rateLimitService.checkRateLimit('login', credentials.email);
      if (!rateLimitResult.allowed) {
        await authAuditService.logLoginAttempt(credentials.email, false, 'Rate limit exceeded');
        return {
          user: null,
          error: `Превышено количество попыток входа. Попробуйте через ${Math.ceil(rateLimitResult.retryAfter! / 60)} минут.`,
          rateLimited: true,
          retryAfter: rateLimitResult.retryAfter
        };
      }

      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Check if this might be a JIT migration case
        if (error.message === 'Invalid login credentials') {
          const migrationResult = await asyncJITMigrationService.attemptJITMigration(
            credentials.email,
            credentials.password
          );
          
          if (migrationResult.success) {
            return { user: migrationResult.user, error: null };
          } else if (migrationResult.requiresUI) {
            return { 
              user: null, 
              error: 'Неверный email или пароль',
              requiresMigration: true 
            };
          }
        }
        
        await authAuditService.logLoginAttempt(credentials.email, false, error.message);
        
        if (error.message === 'Invalid login credentials') {
          return { 
            user: null, 
            error: 'Неверный email или пароль. Проверьте данные или восстановите пароль.' 
          };
        }
        
        return { user: null, error: error.message };
      }

      if (!data.user) {
        await authAuditService.logLoginAttempt(credentials.email, false, 'Пользователь не получен');
        return { user: null, error: 'Не удалось получить данные пользователя' };
      }

      // Load profile with retry logic
      let profileData = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profile) {
          profileData = profile;
          break;
        }
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          return { user: null, error: 'Ошибка загрузки профиля' };
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }

      if (!profileData) {
        // Try to create profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            user_role: data.user.user_metadata?.role || 'patient',
            onboarding_completed: false
          })
          .select()
          .maybeSingle();

        if (createError && createError.code !== '23505') {
          console.error('Profile creation error:', createError);
          return { user: null, error: 'Ошибка создания профиля пользователя' };
        }

        profileData = newProfile;
      }

      const user = this.transformSupabaseUser(data.user, profileData);

      // Update registration status for old users
      if (!user.registrationCompleted && user.email && user.firstName) {
        await this.updateProfile(user.id, { registrationCompleted: true });
        user.registrationCompleted = true;
      }

      await authAuditService.logLoginAttempt(credentials.email, true, undefined, user.id);
      await rateLimitService.recordAttempt('login', true, credentials.email);
      
      return { user, error: null };

    } catch (error: any) {
      console.error('Login error:', error);
      await authAuditService.logLoginAttempt(credentials.email, false, error.message);
      return { user: null, error: error.message };
    }
  }

  async logout(): Promise<{ error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const email = session?.user?.email;
      
      const { error } = await supabase.auth.signOut();
      
      if (userId) {
        await authAuditService.logLogout(userId, email);
      }
      
      return { error: error?.message || null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message || 'Ошибка выхода из системы' };
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        return { user: null, error: sessionError.message };
      }

      if (!session?.user) {
        return { user: null, error: null };
      }

      let profileData = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (data) {
          profileData = data;
          break;
        }
        
        if (error) {
          console.error('Profile fetch error:', error);
          return { user: null, error: 'Ошибка загрузки профиля' };
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }

      const user = this.transformSupabaseUser(session.user, profileData);
      return { user, error: null };

    } catch (error: any) {
      console.error('Get current user error:', error);
      return { user: null, error: error.message || 'Ошибка получения пользователя' };
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ error: string | null }> {
    try {
      const profileUpdates: any = {};

      if (updates.firstName) profileUpdates.first_name = updates.firstName;
      if (updates.lastName) profileUpdates.last_name = updates.lastName;
      if (updates.phone) profileUpdates.phone = updates.phone;
      if (updates.avatar) profileUpdates.avatar_url = updates.avatar;
      if (updates.onboardingCompleted !== undefined) {
        profileUpdates.onboarding_completed = updates.onboardingCompleted;
      }
      if (updates.registrationCompleted !== undefined) {
        profileUpdates.registration_completed = updates.registrationCompleted;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId);

      const changedFields = Object.keys(updates);
      await authAuditService.logProfileUpdate(
        userId, 
        changedFields, 
        !error, 
        error?.message
      );

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error: error.message || 'Ошибка обновления профиля' };
    }
  }

  async resetPassword(email: string): Promise<{ error: string | null; rateLimited?: boolean; retryAfter?: number }> {
    try {
      const rateLimitResult = await rateLimitService.checkRateLimit('passwordReset', email);
      if (!rateLimitResult.allowed) {
        await authAuditService.logPasswordReset(email, false, 'Rate limit exceeded');
        return {
          error: `Превышено количество попыток восстановления пароля. Попробуйте через ${Math.ceil(rateLimitResult.retryAfter! / 60)} минут.`,
          rateLimited: true,
          retryAfter: rateLimitResult.retryAfter
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      await authAuditService.logPasswordReset(email, !error, error?.message);
      await rateLimitService.recordAttempt('passwordReset', !error, email);

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Reset password error:', error);
      await authAuditService.logPasswordReset(email, false, error.message);
      return { error: error.message || 'Ошибка восстановления пароля' };
    }
  }

  async updatePassword(newPassword: string, accessToken?: string, refreshToken?: string): Promise<{ error: string | null }> {
    try {
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          return { error: sessionError.message };
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        await authAuditService.logPasswordUpdate(userId, !error, error?.message);
      }

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Update password error:', error);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await authAuditService.logPasswordUpdate(userId, false, error.message);
      }
      
      return { error: error.message || 'Ошибка обновления пароля' };
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user } = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
