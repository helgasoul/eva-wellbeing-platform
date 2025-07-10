import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * OnboardingGuard - защищает роуты от доступа до завершения онбординга
 * 
 * Логика:
 * - Если пациентка не завершила онбординг → редирект на /patient/onboarding
 * - Если онбординг завершен → показать компонент
 * - Для других ролей (doctor, admin) → пропустить проверку
 * 
 * ✅ ОБНОВЛЕНО: Улучшенная логика проверки статуса онбординга
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем только после загрузки пользователя
    if (isLoading || !user) return;

    // Проверка только для пациенток
    if (user.role === 'patient') {
      // ✅ УЛУЧШЕНО: Более детальная проверка статуса онбординга
      const hasCompletedOnboarding = Boolean(user.onboardingCompleted);
      const hasOnboardingData = Boolean(user.onboardingData);
      
      if (!hasCompletedOnboarding) {
        console.log('🔒 OnboardingGuard: Redirecting to onboarding', {
          userId: user.id,
          hasCompletedOnboarding,
          hasOnboardingData,
          registrationCompleted: user.registrationCompleted
        });
        navigate('/patient/onboarding', { replace: true });
        return;
      }
      
      console.log('✅ OnboardingGuard: Onboarding completed, allowing access', {
        userId: user.id,
        onboardingCompletedAt: user.onboardingData?.completedAt
      });
    }
  }, [user, isLoading, navigate]);

  // Показываем загрузку пока проверяем статус
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Проверяем ваш статус...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не загружен - не показываем контент
  if (!user) {
    return null;
  }

  // Для пациенток проверяем завершение онбординга
  if (user.role === 'patient' && !user.onboardingCompleted) {
    // Редирект уже произошел в useEffect, показываем загрузку
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Перенаправляем на онбординг...</p>
        </div>
      </div>
    );
  }

  // Все проверки прошли - показываем контент
  return <>{children}</>;
};