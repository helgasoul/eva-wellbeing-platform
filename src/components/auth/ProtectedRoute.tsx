
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@/types/roles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole; // Backward compatibility
  requireGuest?: boolean; // НОВЫЙ ПРОП: для защиты от авторизованных пользователей
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredRole,
  requireGuest = false,
  redirectTo
}) => {
  const { user, isLoading } = useAuth();

  // Улучшенная загрузка с таймаутом для предотвращения бесконечной загрузки
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 секунд максимум для загрузки

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Показываем улучшенную загрузку
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center">
        <div className="bloom-card p-8 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-playfair font-semibold text-foreground mb-2">
            Проверяем авторизацию...
          </h2>
          <p className="text-muted-foreground">
            Подождите несколько секунд
          </p>
        </div>
      </div>
    );
  }

  // Если загрузка зависла, показываем ошибку с возможностью перезагрузки
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center">
        <div className="bloom-card p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-playfair font-semibold text-foreground mb-2">
            Проблема с подключением
          </h2>
          <p className="text-muted-foreground mb-4">
            Не удается загрузить данные авторизации
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }

  // ЛОГИКА ДЛЯ requireGuest (регистрация/вход)
  if (requireGuest) {
    // Проверяем, является ли это recovery-ссылкой (сброс пароля)
    const urlParams = new URLSearchParams(window.location.search);
    const isPasswordRecovery = urlParams.get('type') === 'recovery' && urlParams.has('access_token');
    
    // Если это recovery-ссылка, пропускаем пользователя независимо от статуса авторизации
    if (isPasswordRecovery) {
      return <>{children}</>;
    }
    
    // Если пользователь уже авторизован (НЕ recovery), редиректим
    if (user) {
      const defaultRedirect = getDashboardByRole(user.role);
      return <Navigate to={redirectTo || defaultRedirect} replace />;
    }
    
    // Если не авторизован, показываем страницу (регистрацию/вход)
    return <>{children}</>;
  }

  // СТАНДАРТНАЯ ЛОГИКА ДЛЯ ЗАЩИЩЕННЫХ РОУТОВ
  // Если пользователь не авторизован, редиректим на логин
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем роли, если они указаны
  const rolesToCheck = allowedRoles || (requiredRole ? [requiredRole] : undefined);
  if (rolesToCheck && !rolesToCheck.includes(user.role)) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center">
        <div className="bloom-card p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-playfair font-semibold text-destructive mb-4">
            Доступ запрещен
          </h1>
          <p className="text-muted-foreground mb-6">
            У вас нет прав для доступа к этой странице
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Если все проверки пройдены, показываем контент
  return <>{children}</>;
};

// Вспомогательная функция для определения дашборда по роли
const getDashboardByRole = (role: string): string => {
  switch (role) {
    case 'patient':
      return '/patient/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
};

// Дополнительный хук для проверки завершения регистрации
export const useRegistrationGuard = () => {
  const { user } = useAuth();
  
  const checkRegistrationComplete = () => {
    if (!user) return false;
    
    // Проверяем, завершена ли многоэтапная регистрация
    return user.registrationCompleted === true;
  };

  const checkOnboardingComplete = () => {
    if (!user) return false;
    
    return user.onboardingCompleted === true;
  };

  return {
    isRegistrationComplete: checkRegistrationComplete(),
    isOnboardingComplete: checkOnboardingComplete(),
    needsRegistration: user && !checkRegistrationComplete(),
    needsOnboarding: user && checkRegistrationComplete() && !checkOnboardingComplete()
  };
};
