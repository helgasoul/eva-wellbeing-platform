
import { useEffect, useState } from 'react';
import { HealthCheckService, HealthStatus } from '@/services/healthCheck';
import { toast } from '@/hooks/use-toast';

export const useHealthCheck = (options?: {
  runOnMount?: boolean;
  monitoringInterval?: number;
  showToasts?: boolean;
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const {
    runOnMount = true,
    monitoringInterval = 300000, // 5 минут
    showToasts = true
  } = options || {};

  // Выполнить проверку здоровья
  const performHealthCheck = async () => {
    try {
      setIsChecking(true);
      console.log('🔍 Performing health check...');
      
      const status = await HealthCheckService.performHealthCheck();
      setHealthStatus(status);
      setLastCheckTime(new Date());
      
      // Показать уведомления о проблемах
      if (showToasts) {
        if (status.overall === 'critical') {
          toast({
            title: 'Критические проблемы',
            description: 'Обнаружены проблемы с системой. Пытаемся восстановить.',
            variant: 'destructive',
          });
          
          // Попытка автоматического восстановления
          const recovered = await HealthCheckService.attemptAutoRecovery(status);
          if (recovered) {
            toast({
              title: 'Восстановление выполнено',
              description: 'Проблемы были автоматически устранены.',
            });
          }
        } else if (status.overall === 'warning') {
          toast({
            title: 'Предупреждение',
            description: 'Обнаружены незначительные проблемы в системе.',
            variant: 'destructive',
          });
        }
      }
      
      return status;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    if (runOnMount) {
      performHealthCheck();
    }
  }, [runOnMount]);

  // Мониторинг в реальном времени
  useEffect(() => {
    if (monitoringInterval > 0) {
      const stopMonitoring = HealthCheckService.startHealthMonitoring(monitoringInterval);
      return stopMonitoring;
    }
  }, [monitoringInterval]);

  return {
    healthStatus,
    isChecking,
    lastCheckTime,
    performHealthCheck,
    
    // Удобные геттеры
    isHealthy: healthStatus?.overall === 'healthy',
    hasWarnings: healthStatus?.overall === 'warning',
    isCritical: healthStatus?.overall === 'critical',
    
    // Детальная информация
    supabaseConnected: healthStatus?.supabaseConnection || false,
    userSessionValid: healthStatus?.userSession || false,
    dataIntegrityOk: healthStatus?.dataIntegrity || false,
    localStorageWorking: healthStatus?.localStorage || false
  };
};
