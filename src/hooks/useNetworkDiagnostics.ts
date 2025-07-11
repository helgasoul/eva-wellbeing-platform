import { useState, useCallback } from 'react';
import { networkDiagnosticsService, DiagnosticReport, NetworkDiagnosticResult } from '@/services/networkDiagnosticsService';

export const useNetworkDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentReport, setCurrentReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setError(null);
    
    try {
      console.log('🔬 Starting network diagnostics...');
      const report = await networkDiagnosticsService.runComprehensiveDiagnostics();
      setCurrentReport(report);
      
      // Log summary for debugging
      console.log('📊 Diagnostics Summary:', report.summary);
      
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Diagnostics failed:', err);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const diagnoseAuthFailure = useCallback(async (authError: Error) => {
    setIsRunning(true);
    setError(null);
    
    try {
      console.log('🩺 Running auth failure diagnostics...');
      const results = await networkDiagnosticsService.diagnoseAuthFailure(authError);
      
      // Create a simplified report for auth failures
      const authReport: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        environment: {
          userAgent: navigator.userAgent,
          hostname: window.location.hostname,
          online: navigator.onLine
        },
        results,
        summary: {
          totalTests: results.length,
          passed: results.filter(r => r.status === 'success').length,
          warnings: results.filter(r => r.status === 'warning').length,
          failed: results.filter(r => r.status === 'error').length,
          overallStatus: results.some(r => r.status === 'error') ? 'critical' : 'degraded'
        }
      };
      
      setCurrentReport(authReport);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auth diagnostics failed';
      setError(errorMessage);
      console.error('❌ Auth diagnostics failed:', err);
      return [];
    } finally {
      setIsRunning(false);
    }
  }, []);

  const getHistory = useCallback(() => {
    return networkDiagnosticsService.getHistory();
  }, []);

  const getLatestReport = useCallback(() => {
    return networkDiagnosticsService.getLatestReport();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRunning,
    currentReport,
    error,
    runDiagnostics,
    diagnoseAuthFailure,
    getHistory,
    getLatestReport,
    clearError
  };
};