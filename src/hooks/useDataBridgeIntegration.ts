
import { useState, useEffect, useCallback } from 'react';
import { useDataBridge } from '@/services/DataBridgeService';
import type { 
  DataTransferResult, 
  DataValidationResult, 
  DataHealthReport,
  DataBridgeEvent,
  DataBridgeEventListener
} from '@/types/dataBridgeService';

export interface DataBridgeIntegrationOptions {
  enableRealTimeValidation?: boolean;
  enableHealthMonitoring?: boolean;
  healthCheckInterval?: number; // minutes
  enableEventLogging?: boolean;
}

export const useDataBridgeIntegration = (options: DataBridgeIntegrationOptions = {}) => {
  const dataBridge = useDataBridge();
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState<DataHealthReport | null>(null);
  const [transferHistory, setTransferHistory] = useState<DataTransferResult[]>([]);
  const [validationErrors, setValidationErrors] = useState<DataValidationResult | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Real-time health monitoring
  useEffect(() => {
    if (!options.enableHealthMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const healthReport = await dataBridge.performHealthCheck();
        setLastHealthCheck(healthReport);
        setIsHealthy(healthReport.overall === 'healthy');
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
      }
    }, (options.healthCheckInterval || 5) * 60 * 1000);

    return () => clearInterval(interval);
  }, [options.enableHealthMonitoring, options.healthCheckInterval, dataBridge]);

  // Event logging
  useEffect(() => {
    if (!options.enableEventLogging) return;

    const eventHandler: DataBridgeEventListener = (event: DataBridgeEvent) => {
      if (event.type === 'transfer') {
        setTransferHistory(prev => [...prev.slice(-9), event.data as DataTransferResult]);
      }
      
      if (event.type === 'error') {
        console.warn('Data Bridge Error:', event.data);
      }
    };

    dataBridge.addEventListener('transfer', eventHandler);
    dataBridge.addEventListener('error', eventHandler);

    return () => {
      dataBridge.removeEventListener('transfer', eventHandler);
      dataBridge.removeEventListener('error', eventHandler);
    };
  }, [options.enableEventLogging, dataBridge]);

  // Enhanced transfer with validation
  const transferWithValidation = useCallback(async (
    from: string,
    to: string,
    data: any,
    validationRules?: any[]
  ): Promise<DataTransferResult> => {
    try {
      // Pre-transfer validation if enabled
      if (options.enableRealTimeValidation && validationRules) {
        const validation = dataBridge.validateData(data, validationRules);
        setValidationErrors(validation);
        
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const result = await dataBridge.transferData(from, to, data, {
        validateBefore: options.enableRealTimeValidation,
        backupBefore: true,
        atomicTransfer: true
      });

      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }, [dataBridge, options.enableRealTimeValidation]);

  // Batch operations
  const batchTransfer = useCallback(async (
    operations: Array<{ from: string; to: string; data: any }>
  ): Promise<DataTransferResult[]> => {
    const results: DataTransferResult[] = [];
    
    for (const operation of operations) {
      try {
        const result = await transferWithValidation(
          operation.from,
          operation.to,
          operation.data
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          transferredKeys: [],
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          timestamp: new Date().toISOString(),
          duration: 0
        });
      }
    }
    
    return results;
  }, [transferWithValidation]);

  // Recovery operations
  const performRecovery = useCallback(async (backupId: string): Promise<any> => {
    try {
      const restoredData = await dataBridge.restoreFromBackup(backupId);
      
      // Trigger health check after recovery
      if (options.enableHealthMonitoring) {
        const healthReport = await dataBridge.performHealthCheck();
        setLastHealthCheck(healthReport);
        setIsHealthy(healthReport.overall === 'healthy');
      }
      
      return restoredData;
    } catch (error) {
      console.error('Recovery failed:', error);
      throw error;
    }
  }, [dataBridge, options.enableHealthMonitoring]);

  // Data integrity check
  const checkIntegrity = useCallback(async (): Promise<DataHealthReport> => {
    const healthReport = await dataBridge.performHealthCheck();
    setLastHealthCheck(healthReport);
    setIsHealthy(healthReport.overall === 'healthy');
    return healthReport;
  }, [dataBridge]);

  // Start/stop monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    // Immediate health check
    checkIntegrity();
  }, [checkIntegrity]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  return {
    // State
    isHealthy,
    lastHealthCheck,
    transferHistory,
    validationErrors,
    isMonitoring,
    
    // Methods
    transferWithValidation,
    batchTransfer,
    performRecovery,
    checkIntegrity,
    startMonitoring,
    stopMonitoring,
    
    // Direct access to dataBridge methods
    validateData: dataBridge.validateData,
    createBackup: dataBridge.createBackup,
    exportData: dataBridge.exportData,
    importData: dataBridge.importData,
    getMetrics: dataBridge.getMetrics
  };
};
