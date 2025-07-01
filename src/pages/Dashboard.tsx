
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath } from '@/types/roles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      // Redirect to role-specific dashboard
      const dashboardPath = getRoleDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen eva-gradient flex items-center justify-center">
      <div className="eva-card p-8 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-playfair font-semibold text-foreground mb-2">
          Перенаправляем вас...
        </h2>
        <p className="text-muted-foreground">
          Загружаем персональный дашборд
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
