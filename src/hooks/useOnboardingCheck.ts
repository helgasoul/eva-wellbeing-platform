import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';

/**
 * Хук для проверки статуса онбординга и автоматического редиректа
 * 
 * Логика:
 * - Если пользователь авторизован И завершил онбординг → редирект на дашборд
 * - Если пользователь авторизован НО не завершил онбординг → редирект на онбординг
 * - Для других ролей (doctor, admin) → проверка не нужна
 * - Исключение: не редиректим если пользователь на странице сброса пароля или уже на онбординге
 */
export const useOnboardingCheck = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ждем загрузки пользователя
    if (isLoading || !user) return;

    // Не редиректим если пользователь на странице сброса пароля или уже на онбординге
    if (location.pathname === '/reset-password' || location.pathname === '/patient/onboarding') return;

    // Проверяем только пациенток
    if (user.role === UserRole.PATIENT) {
      if (user.onboardingCompleted) {
        console.log('✅ User has completed onboarding - redirecting to dashboard');
        navigate('/patient/dashboard', { replace: true });
      } else {
        console.log('🔄 User needs to complete onboarding - redirecting to onboarding');
        navigate('/patient/onboarding', { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return {
    user,
    isLoading,
    needsOnboarding: user?.role === UserRole.PATIENT && !user?.onboardingCompleted,
    hasCompletedOnboarding: user?.role === UserRole.PATIENT && user?.onboardingCompleted
  };
};

/**
 * Утилитарная функция для проверки статуса онбординга без редиректа
 */
export const checkOnboardingStatus = (user: any) => {
  if (!user) return { isAuthenticated: false, needsOnboarding: false, canAccess: false };

  const isPatient = user.role === UserRole.PATIENT;
  const hasCompletedOnboarding = Boolean(user.onboardingCompleted);

  return {
    isAuthenticated: true,
    isPatient,
    needsOnboarding: isPatient && !hasCompletedOnboarding,
    canAccess: !isPatient || hasCompletedOnboarding,
    hasCompletedOnboarding
  };
};