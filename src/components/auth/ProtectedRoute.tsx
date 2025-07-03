
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { ErrorMessage } from '@/components/ui/error-message';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center">
        <div className="bloom-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, редиректим на логин
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверяем роль, если она требуется
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center py-12 px-4">
        <div className="bloom-card p-8 text-center max-w-md">
          <div className="inline-flex p-4 bg-destructive/10 rounded-full mb-6">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-playfair font-semibold text-foreground mb-4">
            Доступ запрещен
          </h2>
          <ErrorMessage 
            message={`Эта страница доступна только для роли: ${requiredRole}`}
            className="justify-center mb-4"
          />
          <p className="text-muted-foreground mb-6">
            Ваша текущая роль: {user.role}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bloom-button"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Проверяем массив разрешенных ролей
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center py-12 px-4">
        <div className="bloom-card p-8 text-center max-w-md">
          <div className="inline-flex p-4 bg-destructive/10 rounded-full mb-6">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-playfair font-semibold text-foreground mb-4">
            Доступ запрещен
          </h2>
          <ErrorMessage 
            message="У вас нет прав для доступа к этой странице"
            className="justify-center mb-4"
          />
          <p className="text-muted-foreground mb-6">
            Ваша текущая роль: {user.role}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bloom-button"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
