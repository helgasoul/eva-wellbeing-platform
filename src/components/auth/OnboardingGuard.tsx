
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { logger } from '@/utils/logger';
import { UserRole } from '@/types/roles';

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
  const location = useLocation();

  useEffect(() => {
    // Проверяем только после загрузки пользователя
    if (isLoading) {
      logger.debug('OnboardingGuard: Still loading user');
      return;
    }

    if (!user) {
      logger.debug('OnboardingGuard: No user found');
      return;
    }

    // 🔍 ДИАГНОСТИКА: Проверяем логику OnboardingGuard после исправления
    console.group('🔍 ONBOARDING GUARD DEBUG');
    console.log('1. User:', user);
    console.log('2. User role:', user.role);
    console.log('3. User role type:', typeof user.role);
    console.log('4. Is patient?', user.role === UserRole.PATIENT);
    console.log('5. Onboarding completed?', user.onboardingCompleted);
    console.log('6. Current path:', location.pathname);
    console.log('7. Should redirect to onboarding?', 
      user.role === UserRole.PATIENT && !user.onboardingCompleted);
    console.groupEnd();

    // Проверка только для пациенток
    if (user.role === UserRole.PATIENT) {
      // ✅ ИСПРАВЛЕНО: Проверяем текущий маршрут - не редиректим если уже на онбординге
      if (location.pathname === '/patient/onboarding') {
        logger.debug('OnboardingGuard: Already on onboarding page, allowing access');
        return;
      }

      const hasCompletedOnboarding = Boolean(user.onboardingCompleted);
      
      // Проверяем, является ли это recovery-ссылкой (сброс пароля)
      const urlParams = new URLSearchParams(window.location.search);
      const isPasswordRecovery = urlParams.get('type') === 'recovery';
      
      // Check for forced onboarding state from session storage
      const forcedOnboarding = sessionStorage.getItem('forcedOnboarding') === 'true';
      
      // Проверяем, есть ли у пользователя критически важные данные
      const hasEssentialData = user.registrationCompleted || 
                              user.onboardingData || 
                              Boolean(user.menopausePhase) ||
                              (user.firstName && user.lastName);
      
      logger.debug('OnboardingGuard: Authentication check', {
        userId: user.id,
        email: user.email,
        hasCompletedOnboarding,
        hasEssentialData,
        registrationCompleted: user.registrationCompleted,
        firstName: user.firstName,
        lastName: user.lastName,
        menopausePhase: user.menopausePhase,
        onboardingData: !!user.onboardingData,
        currentPath: location.pathname,
        isPasswordRecovery,
        forcedOnboarding
      });
      
      // Если это восстановление пароля и у пользователя есть хотя бы базовые данные,
      // считаем онбординг завершенным и не редиректим
      if (isPasswordRecovery && hasEssentialData) {
        logger.debug('OnboardingGuard: Password recovery for registered user, allowing access');
        return;
      }
      
      // Если включен форсированный онбординг, разрешаем доступ к онбордингу
      if (forcedOnboarding) {
        logger.debug('OnboardingGuard: Forced onboarding mode active, allowing access');
        return;
      }
      
      // Улучшенная логика: проверяем наличие базовых данных онбординга
      if (!hasCompletedOnboarding && !hasEssentialData) {
        logger.info('OnboardingGuard: Redirecting to onboarding', {
          userId: user.id,
          currentPath: location.pathname,
          hasCompletedOnboarding,
          hasEssentialData,
          registrationCompleted: user.registrationCompleted,
          isPasswordRecovery
        });
        console.log('🔄 Redirecting to onboarding...');
        navigate('/patient/onboarding', { replace: true });
        return;
      }
      
      logger.debug('OnboardingGuard: Onboarding completed or has essential data, allowing access', {
        userId: user.id,
        currentPath: location.pathname,
        hasCompletedOnboarding,
        hasEssentialData
      });
    }
  }, [user, isLoading, navigate, location.pathname]);

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

  // ✅ ИСПРАВЛЕНО: Убрана вторая проверка которая создавала петлю
  // Если мы на странице онбординга, всегда показываем контент
  if (location.pathname === '/patient/onboarding') {
    return <>{children}</>;
  }

  // Для пациенток на других страницах проверяем завершение онбординга
  const hasEssentialData = user.registrationCompleted || 
                          user.onboardingData || 
                          Boolean(user.menopausePhase);
                          
  if (user.role === UserRole.PATIENT && !user.onboardingCompleted && !hasEssentialData) {
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
