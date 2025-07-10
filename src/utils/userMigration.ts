import { supabase } from '@/integrations/supabase/client';

interface LocalUser {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  onboarding_completed?: boolean;
}

export const migrateLocalStorageUser = async (email: string, password: string) => {
  try {
    // Получаем данные пользователя из localStorage
    const localUserData = localStorage.getItem('eva_user_data');
    const onboardingData = localStorage.getItem('eva_onboarding_data');
    
    if (!localUserData) {
      throw new Error('Пользователь не найден в localStorage');
    }
    
    const userData: LocalUser = JSON.parse(localUserData);
    
    // Регистрируем пользователя в Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_role: userData.role || 'patient'
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Создаем профиль пользователя
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          onboarding_completed: userData.onboarding_completed || false
        })
        .eq('id', data.user.id);
      
      if (profileError) {
        console.error('Ошибка обновления профиля:', profileError);
      }
      
      // Если есть данные онбординга, мигрируем их
      if (onboardingData) {
        const onboarding = JSON.parse(onboardingData);
        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .insert({
            user_id: data.user.id,
            step_name: 'complete_onboarding',
            step_number: 1,
            step_data: onboarding
          });
        
        if (onboardingError) {
          console.error('Ошибка миграции онбординга:', onboardingError);
        }
      }
    }
    
    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Ошибка миграции:', error);
    return { success: false, error: error.message };
  }
};

export const clearLocalStorageUserData = () => {
  localStorage.removeItem('eva_user_data');
  localStorage.removeItem('eva_onboarding_data');
  console.log('Данные пользователя очищены из localStorage');
};