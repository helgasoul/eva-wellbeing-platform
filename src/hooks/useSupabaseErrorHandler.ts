import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SupabaseErrorDetails {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface UseSupabaseErrorHandlerReturn {
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    fallbackData?: T,
    options?: {
      successMessage?: string;
      skipErrorToast?: boolean;
      retryCount?: number;
    }
  ) => Promise<T | null>;
  isLoading: boolean;
  lastError: SupabaseErrorDetails | null;
  clearError: () => void;
}

export const useSupabaseErrorHandler = (): UseSupabaseErrorHandlerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<SupabaseErrorDetails | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const isNetworkError = (error: any): boolean => {
    const errorMessage = error?.message || '';
    return (
      errorMessage.includes('Load failed') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('TypeError: Load failed') ||
      error?.code === 'NETWORK_ERROR'
    );
  };

  const isAuthError = (error: any): boolean => {
    const errorMessage = error?.message || '';
    return (
      errorMessage.includes('requested path is invalid') ||
      errorMessage.includes('Authentication failed') ||
      errorMessage.includes('Invalid login credentials') ||
      errorMessage.includes('Email not confirmed') ||
      errorMessage.includes('User not found') ||
      error?.code === 'SIGNUP_DISABLED' ||
      error?.code === 'INVALID_CREDENTIALS' ||
      error?.code === 'EMAIL_NOT_CONFIRMED'
    );
  };

  const isSupabaseError = (error: any): boolean => {
    return error?.code && error?.message && (error?.details || error?.hint);
  };

  const getErrorMessage = (error: any): string => {
    if (isNetworkError(error)) {
      return 'Проблемы с подключением к серверу. Используются локальные данные.';
    }
    
    if (isAuthError(error)) {
      if (error?.message?.includes('requested path is invalid')) {
        return 'Неверные настройки авторизации. Перейдите в настройки Supabase для исправления.';
      }
      return 'Ошибка авторизации. Попробуйте войти заново или обратитесь к администратору.';
    }
    
    if (isSupabaseError(error)) {
      return `Ошибка базы данных: ${error.message}`;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'Произошла неизвестная ошибка. Попробуйте еще раз.';
  };

  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      fallbackData?: T,
      options?: {
        successMessage?: string;
        skipErrorToast?: boolean;
        retryCount?: number;
      }
    ): Promise<T | null> => {
      const { successMessage, skipErrorToast = false, retryCount = 0 } = options || {};
      
      setIsLoading(true);
      setLastError(null);

      let lastAttemptError: any = null;
      const maxRetries = retryCount + 1;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await operation();
          
          // Успешное выполнение
          if (successMessage) {
            toast({
              title: 'Успешно',
              description: successMessage,
            });
          }
          
          setIsLoading(false);
          return result;
          
        } catch (error: any) {
          lastAttemptError = error;
          console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
          
          // Если это не последняя попытка и ошибка сетевая, ждем перед повтором
          if (attempt < maxRetries - 1 && isNetworkError(error)) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }
      }

      // Все попытки провалились
      const errorDetails: SupabaseErrorDetails = {
        message: getErrorMessage(lastAttemptError),
        code: lastAttemptError?.code,
        details: lastAttemptError?.details,
        hint: lastAttemptError?.hint,
      };
      
      setLastError(errorDetails);
      
      // Показываем toast только если не отключен
      if (!skipErrorToast) {
        toast({
          title: isNetworkError(lastAttemptError) ? 'Проблемы с подключением' : 'Ошибка загрузки',
          description: errorDetails.message,
          variant: 'destructive',
        });
      }

      // Логируем ошибку для диагностики
      const errorLog = {
        error: lastAttemptError,
        timestamp: new Date().toISOString(),
        attempts: maxRetries,
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine
      };
      
      localStorage.setItem('eva_last_operation_error', JSON.stringify(errorLog));
      
      setIsLoading(false);
      
      // Возвращаем fallback данные если есть
      return fallbackData || null;
    },
    [toast]
  );

  return {
    executeWithErrorHandling,
    isLoading,
    lastError,
    clearError
  };
};