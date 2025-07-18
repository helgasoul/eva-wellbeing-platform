
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Улучшенная загрузка с таймаутом для предотвращения бесконечной загрузки
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Проверяем параметры URL на наличие ошибок авторизации
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.error('Auth error detected:', error, errorDescription);
      setAuthError(error);
      
      // Сохраняем детали ошибки в localStorage для диагностики
      localStorage.setItem('eva_auth_error', JSON.stringify({
        error,
        errorDescription,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }));
    }
  }, [location.search]);

  // Если обнаружена ошибка авторизации, перенаправляем на страницу ошибки
  if (authError) {
    return <Navigate to="/auth-error" replace />;
  }

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

  // Если загрузка зависла, перенаправляем на страницу ошибки авторизации
  if (loadingTimeout) {
    return <Navigate to="/auth-error" replace />;
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

// Вспомогательная функция для определения пути редиректа
const getUserRedirectPath = (user: any) => {
  // Если нет пользователя - на логин
  if (!user) return '/login';
  
  // Если регистрация не завершена
  if (!user.registrationCompleted) {
    return '/register'; 
  }
  
  // Если онбординг не завершен ИЛИ нет геолокации - на онбординг
  if (!user.onboardingCompleted) {
    return '/patient/onboarding';
  }
  
  // Если все завершено, но нет геолокации - на настройку профиля  
  if (!user.locationData) {
    return '/patient/profile-setup'; // Новая страница
  }
  
  // Все завершено - в дашборд
  return '/patient/dashboard';
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
