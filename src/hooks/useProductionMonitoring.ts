import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productionMonitoringService } from '@/services/productionMonitoringService';
import { analyticsService } from '@/services/analyticsService';
import { logger } from '@/utils/logger';

export const useProductionMonitoring = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeProductionMonitoring();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (user?.id) {
      // Log user session start
      productionMonitoringService.logComplianceEvent(
        'user_consent',
        'session_started',
        user.id,
        ['analytics', 'performance'],
        'consent',
        undefined,
        true,
        { sessionId: analyticsService.sessionId }
      );
    }
  }, [user]);

  const initializeProductionMonitoring = async () => {
    try {
      // Perform initial health check
      await productionMonitoringService.performHealthCheck();
      
      // Log system startup
      await productionMonitoringService.logSecurityEvent(
        'system_startup',
        'application_started',
        {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          location: window.location.href
        }
      );

      // Start periodic health checks (every 5 minutes)
      setInterval(() => {
        productionMonitoringService.performHealthCheck().catch(console.error);
      }, 5 * 60 * 1000);

      logger.info('Production monitoring initialized');
    } catch (error) {
      logger.error('Failed to initialize production monitoring', error);
    }
  };

  return {
    isInitialized,
    logSecurityEvent: productionMonitoringService.logSecurityEvent.bind(productionMonitoringService),
    logComplianceEvent: productionMonitoringService.logComplianceEvent.bind(productionMonitoringService),
    performHealthCheck: productionMonitoringService.performHealthCheck.bind(productionMonitoringService),
    auditRLSPolicies: productionMonitoringService.auditRLSPolicies.bind(productionMonitoringService),
    triggerDataCleanup: productionMonitoringService.triggerDataCleanup.bind(productionMonitoringService)
  };
};