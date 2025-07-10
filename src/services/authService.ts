// ✅ ЭТАП 4: Сервис аутентификации с Supabase + Audit Logging
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, LoginCredentials, RegisterData } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { authAuditService } from './authAuditService';
import { rateLimitService } from './rateLimitService';
import { passwordPolicyService } from './passwordPolicyService';

export interface AuthResponse {
  user: User | null;
  error: string | null;
  rateLimited?: boolean;
  retryAfter?: number;
}

class AuthService {
  // Преобразование Supabase User в наш User тип
  private transformSupabaseUser(supabaseUser: SupabaseUser, profileData?: any): User {
    return {
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
  }

  // Регистрация пользователя
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Начинаем регистрацию для:', userData.email);

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

      // Проверяем rate limiting
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
        console.error('❌ Ошибка регистрации:', error);
        // Логируем неудачную попытку регистрации
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
        console.error('❌ Пользователь не создан');
        await authAuditService.logRegistrationAttempt(
          userData.email, 
          false, 
          'Пользователь не создан', 
          undefined, 
          userData.role
        );
        return { user: null, error: 'Не удалось создать пользователя' };
      }

      console.log('✅ Регистрация успешна, ID:', data.user.id);

      // Профиль должен создаться автоматически через триггер
      // Но на всякий случай проверим через небольшую задержку
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user = this.transformSupabaseUser(data.user, {
        first_name: profileData?.first_name || userData.firstName,
        last_name: profileData?.last_name || userData.lastName,
        role: profileData?.role || userData.role,
        onboarding_completed: profileData?.onboarding_completed || false,
        registration_completed: true
      });

      console.log('✅ Пользователь зарегистрирован:', user.email);
      
      // Логируем успешную регистрацию и сбрасываем rate limit
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
      console.error('💥 Критическая ошибка при регистрации:', error);
      await authAuditService.logRegistrationAttempt(
        userData.email, 
        false, 
        error.message
      );
      return { user: null, error: error.message };
    }
  }

  // Вход в систему
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Начинаем процесс входа для:', credentials.email);
      
      // Проверяем rate limiting
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
      
      // 1. Аутентификация в Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ Ошибка аутентификации Supabase:', error);
        
        // Логируем неудачную попытку входа
        await authAuditService.logLoginAttempt(credentials.email, false, error.message);
        
        // Если это ошибка невалидных учетных данных, показываем более понятное сообщение
        if (error.message === 'Invalid login credentials') {
          return { 
            user: null, 
            error: 'Неверный email или пароль. Проверьте данные или восстановите пароль.' 
          };
        }
        
        return { 
          user: null, 
          error: `Ошибка входа: ${error.message}` 
        };
      }

      if (!data.user) {
        console.error('❌ Пользователь не получен после аутентификации');
        await authAuditService.logLoginAttempt(credentials.email, false, 'Пользователь не получен');
        return { 
          user: null, 
          error: 'Не удалось получить данные пользователя' 
        };
      }

      console.log('✅ Аутентификация успешна, ID пользователя:', data.user.id);

      // 2. Загружаем профиль пользователя
      console.log('📋 Загружаем профиль пользователя...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle(); // Используем maybeSingle вместо single для лучшей обработки

      if (profileError) {
        console.error('❌ Ошибка загрузки профиля:', profileError);
        return { 
          user: null, 
          error: `Ошибка загрузки профиля: ${profileError.message}` 
        };
      }

      let finalProfileData = profileData;

      if (!profileData) {
        console.error('❌ Профиль пользователя не найден в базе данных');
        console.log('🔧 Попытка создать профиль автоматически...');
        
        // Попытка создать профиль автоматически
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            role: data.user.user_metadata?.role || 'patient',
            onboarding_completed: false
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Не удалось создать профиль:', createError);
          return { 
            user: null, 
            error: 'Профиль пользователя не найден и не может быть создан автоматически. Обратитесь к администратору.' 
          };
        }

        console.log('✅ Профиль создан автоматически:', newProfile);
        finalProfileData = newProfile;
      }

      console.log('✅ Профиль загружен:', finalProfileData);

      // 3. Формируем объект пользователя
      const user = this.transformSupabaseUser(data.user, finalProfileData);

      // 4. Проверяем и корректируем статус регистрации для старых пользователей
      if (!user.registrationCompleted && user.email && user.firstName) {
        console.log('🔧 Обновляем статус регистрации для существующего пользователя');
        await this.updateProfile(user.id, { registrationCompleted: true });
        user.registrationCompleted = true;
      }

      console.log('✅ Вход выполнен успешно для пользователя:', user.email);
      
      // Логируем успешный вход и сбрасываем rate limit
      await authAuditService.logLoginAttempt(credentials.email, true, undefined, user.id);
      await rateLimitService.recordAttempt('login', true, credentials.email);
      
      return { user, error: null };

    } catch (error: any) {
      console.error('💥 Критическая ошибка в процессе входа:', error);
      await authAuditService.logLoginAttempt(credentials.email, false, error.message);
      return { 
        user: null, 
        error: `Произошла неожиданная ошибка: ${error.message}` 
      };
    }
  }

  // Выход из системы
  async logout(): Promise<{ error: string | null }> {
    try {
      // Получаем данные пользователя перед выходом для логирования
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const email = session?.user?.email;
      
      const { error } = await supabase.auth.signOut();
      
      // Логируем выход
      if (userId) {
        await authAuditService.logLogout(userId, email);
      }
      
      return { error: error?.message || null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message || 'Ошибка выхода из системы' };
    }
  }

  // Получение текущего пользователя
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // 1. Получаем текущую сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        return { user: null, error: sessionError.message };
      }

      if (!session?.user) {
        return { user: null, error: null };
      }

      // 2. Загружаем профиль
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { user: null, error: 'Ошибка загрузки профиля' };
      }

      // 3. Формируем пользователя
      const user = this.transformSupabaseUser(session.user, profileData);

      return { user, error: null };

    } catch (error: any) {
      console.error('Get current user error:', error);
      return { user: null, error: error.message || 'Ошибка получения пользователя' };
    }
  }

  // Обновление профиля пользователя
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

      // Логируем обновление профиля
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

  // Восстановление пароля
  async resetPassword(email: string): Promise<{ error: string | null; rateLimited?: boolean; retryAfter?: number }> {
    try {
      // Проверяем rate limiting
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

      // Логируем запрос на восстановление пароля и обновляем rate limit
      await authAuditService.logPasswordReset(email, !error, error?.message);
      await rateLimitService.recordAttempt('passwordReset', !error, email);

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Reset password error:', error);
      await authAuditService.logPasswordReset(email, false, error.message);
      return { error: error.message || 'Ошибка восстановления пароля' };
    }
  }

  // Обновление пароля
  async updatePassword(newPassword: string, accessToken?: string, refreshToken?: string): Promise<{ error: string | null }> {
    try {
      // Если переданы токены (из ссылки сброса), устанавливаем сессию
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

      // Получаем ID пользователя для логирования
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (userId) {
        await authAuditService.logPasswordUpdate(userId, !error, error?.message);
      }

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Update password error:', error);
      
      // Логируем ошибку обновления пароля
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await authAuditService.logPasswordUpdate(userId, false, error.message);
      }
      
      return { error: error.message || 'Ошибка обновления пароля' };
    }
  }

  // Подписка на изменения аутентификации
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