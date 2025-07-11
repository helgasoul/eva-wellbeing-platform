import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useSubscriptionInterest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const expressInterest = async (planId: string) => {
    setIsLoading(true);
    
    try {
      const interestData = {
        subscription_plan_id: planId,
        user_id: user?.id || null,
        email: user?.email || null,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      };

      const { error } = await supabase
        .from('subscription_interest')
        .insert([interestData]);

      if (error) {
        throw error;
      }

      toast.success('Спасибо за ваш интерес! Мы сообщим, когда тариф будет доступен', {
        description: 'Вы получите уведомление на email, когда BLOOM Digital Twin будет запущен'
      });

      return true;
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast.error('Не удалось зарегистрировать интерес', {
        description: 'Попробуйте еще раз или свяжитесь с поддержкой'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getInterestCount = async (planId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('subscription_interest')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_plan_id', planId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting interest count:', error);
      return 0;
    }
  };

  return {
    expressInterest,
    getInterestCount,
    isLoading
  };
};