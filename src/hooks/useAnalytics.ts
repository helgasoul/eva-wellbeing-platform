import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyticsService } from '@/services/analyticsService';

export const useAnalytics = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      analyticsService.setUserId(user.id);
      analyticsService.syncOfflineEvents();
    }
  }, [user]);

  return analyticsService;
};