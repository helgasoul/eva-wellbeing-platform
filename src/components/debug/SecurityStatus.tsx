import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authConfig } from '@/config/auth';
import { logger } from '@/utils/logger';
import { verifyAuthSecurity, quickAuthCheck, testAuthFlow } from '@/utils/authVerification';

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ className = '' }) => {
  // Показываем только в development режиме
  if (import.meta.env.PROD) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    // Автоматически обновляем отчет при монтировании
    if (isVisible) {
      const securityReport = verifyAuthSecurity();
      setReport(securityReport);
    }
  }, [isVisible]);

  const handleRunTest = async () => {
    logger.debug('Running security test...');
    const result = await testAuthFlow();
    setTestResult(result);
    
    // Обновляем отчет после теста
    const securityReport = verifyAuthSecurity();
    setReport(securityReport);
  };

  const handleQuickCheck = () => {
    const securityReport = quickAuthCheck();
    setReport(securityReport);
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded text-sm z-50 hover:bg-blue-600 transition-colors ${className}`}
      >
        🔒 Security Status
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50 max-h-96 overflow-y-auto ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-900 text-sm">🔒 Security Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>

      {report && (
        <div className="space-y-3 text-xs">
          {/* Общая информация */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Environment:</span>
            <Badge variant="outline" className="text-xs">
              {report.environment}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Security Level:</span>
            <Badge className={`text-white text-xs ${getSecurityLevelColor(report.securityLevel)}`}>
              {report.securityLevel.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Admin Login:</span>
            <Badge variant="outline" className="text-xs">
              {report.adminLoginStatus}
            </Badge>
          </div>

          {/* Детальные проверки */}
          <div className="border-t pt-2">
            <div className="font-medium mb-2">Security Checks:</div>
            <div className="space-y-1">
              {report.checks.map((check: any, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">{getCheckIcon(check.status)}</span>
                  <span className="text-xs leading-tight">
                    {check.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Рекомендации */}
          {report.recommendations.length > 0 && (
            <div className="border-t pt-2">
              <div className="font-medium mb-2">Recommendations:</div>
              <div className="space-y-1">
                {report.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Результат теста */}
          {testResult !== null && (
            <div className="border-t pt-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Test Result:</span>
                <span className={testResult ? 'text-green-600' : 'text-red-600'}>
                  {testResult ? '✅ PASSED' : '❌ FAILED'}
                </span>
              </div>
            </div>
          )}

          {/* Кнопки управления */}
          <div className="border-t pt-2 space-y-2">
            <Button
              onClick={handleQuickCheck}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🔄 Refresh Status
            </Button>
            
            <Button
              onClick={handleRunTest}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🧪 Run Security Test
            </Button>
          </div>
        </div>
      )}

      {!report && (
        <div className="text-center py-4">
          <Button
            onClick={handleQuickCheck}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Run Security Check
          </Button>
        </div>
      )}
    </div>
  );
};