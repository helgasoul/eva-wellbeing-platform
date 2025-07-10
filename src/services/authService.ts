// ✅ ЭТАП 3: Сервис аутентификации с Supabase
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, LoginCredentials, RegisterData, UserRole } from '@/types/auth';

export interface AuthResponse {
  user: User | null;
  error: string | null;
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
      // 1. Регистрируем пользователя в Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_role: userData.role
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!data.user) {
        return { user: null, error: 'Не удалось создать пользователя' };
      }

      // 2. Профиль создается автоматически через триггер handle_new_user()
      // Но мы можем обновить его дополнительными данными
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          user_role: userData.role,
          registration_completed: true
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Не возвращаем ошибку, так как основная регистрация прошла успешно
      }

      // 3. Возвращаем пользователя
      const user = this.transformSupabaseUser(data.user, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_role: userData.role,
        registration_completed: true,
        onboarding_completed: false
      });

      return { user, error: null };

    } catch (error: any) {
      console.error('Registration error:', error);
      return { user: null, error: error.message || 'Ошибка регистрации' };
    }
  }

  // Вход в систему
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // 1. Аутентификация через Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!data.user) {
        return { user: null, error: 'Не удалось войти в систему' };
      }

      // 2. Загружаем профиль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { user: null, error: 'Ошибка загрузки профиля пользователя' };
      }

      // 3. Формируем объект пользователя
      const user = this.transformSupabaseUser(data.user, profileData);

      return { user, error: null };

    } catch (error: any) {
      console.error('Login error:', error);
      return { user: null, error: error.message || 'Ошибка входа в систему' };
    }
  }

  // Выход из системы
  async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
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

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error: error.message || 'Ошибка обновления профиля' };
    }
  }

  // Восстановление пароля
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error: error?.message || null };

    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message || 'Ошибка восстановления пароля' };
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