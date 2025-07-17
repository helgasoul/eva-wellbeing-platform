import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { diagnoseAuthState, diagnoseStorage, clearAuthStorage, AuthDiagnosticResult } from '../../utils/auth-diagnostics';
import { logger } from '../../utils/logger';

const AuthMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState<AuthDiagnosticResult | null>(null);
  const [storageReport, setStorageReport] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'storage' | 'actions'>('diagnostics');
  const { user, isLoading } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const result = await diagnoseAuthState();
      setDiagnostics(result);
      logger.info('Auth diagnostics completed:', result);
    } catch (error) {
      logger.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runStorageCheck = () => {
    const report = diagnoseStorage();
    setStorageReport(report);
    logger.info('Storage diagnostics completed:', report);
  };

  const handleClearStorage = () => {
    if (confirm('Clear all auth storage? This will log you out.')) {
      clearAuthStorage();
      window.location.reload();
    }
  };

  const handleForceRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (isVisible && !diagnostics) {
      runDiagnostics();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm z-50 opacity-80 hover:opacity-100"
      >
        🔍 Monitor
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-hidden z-50">
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
        <h3 className="font-bold text-gray-900">🔍 Auth Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="flex border-b">
        {(['diagnostics', 'storage', 'actions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'diagnostics' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Refresh'}
              </button>
            </div>
            
            {diagnostics && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong>Auth Session:</strong> {diagnostics.authSession ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Profile:</strong> {diagnostics.supabaseProfile ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Network:</strong> {diagnostics.networkDiagnostics.canReachSupabase ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Content-Type:</strong> {diagnostics.networkDiagnostics.contentTypeSupported ? '✅' : '❌'}
                  </div>
                </div>
                
                {diagnostics.inconsistencies.length > 0 && (
                  <div>
                    <strong className="text-red-600">Issues:</strong>
                    <ul className="list-disc list-inside text-red-600 mt-1">
                      {diagnostics.inconsistencies.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {diagnostics.recommendations.length > 0 && (
                  <div>
                    <strong className="text-orange-600">Recommendations:</strong>
                    <ul className="list-disc list-inside text-orange-600 mt-1">
                      {diagnostics.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Report:</span>
              <button
                onClick={runStorageCheck}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs"
              >
                Check
              </button>
            </div>
            
            {storageReport && (
              <div className="space-y-2 text-xs">
                <div>
                  <strong>localStorage:</strong> {storageReport.localStorage.available ? '✅' : '❌'}
                  {storageReport.localStorage.keyCount && (
                    <span className="ml-2">({storageReport.localStorage.keyCount} keys)</span>
                  )}
                </div>
                
                {storageReport.issues.length > 0 && (
                  <div>
                    <strong className="text-red-600">Storage Issues:</strong>
                    <ul className="list-disc list-inside text-red-600 mt-1">
                      {storageReport.issues.map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClearStorage}
                className="px-3 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                Clear Storage
              </button>
              <button
                onClick={handleForceRefresh}
                className="px-3 py-2 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
              >
                Force Refresh
              </button>
            </div>
            
            <div className="text-xs text-gray-600">
              <p><strong>Current User:</strong> {user?.email || 'None'}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Role:</strong> {user?.role || 'None'}</p>
              <p><strong>Onboarding:</strong> {user?.onboardingCompleted ? 'Complete' : 'Incomplete'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthMonitor;