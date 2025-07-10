
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@/types/roles';

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

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-6">
            У вас нет прав для доступа к этой странице
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
