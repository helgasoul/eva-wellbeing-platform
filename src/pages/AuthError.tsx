import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Activity, RefreshCw, Shield, Home } from 'lucide-react';

export const AuthError: React.FC = () => {
  const navigate = useNavigate();

  // Получаем детали ошибки из localStorage
  const getErrorDetails = () => {
    try {
      const authError = localStorage.getItem('eva_auth_error');
      const operationError = localStorage.getItem('eva_last_operation_error');
      
      if (authError) {
        return JSON.parse(authError);
      }
      if (operationError) {
        return JSON.parse(operationError);
      }
      return null;
    } catch (error) {
      console.error('Error parsing error details:', error);
      return null;
    }
  };

  const errorDetails = getErrorDetails();

  const handleRetry = () => {
    // Очищаем ошибки перед повторной попыткой
    localStorage.removeItem('eva_auth_error');
    localStorage.removeItem('eva_last_operation_error');
    window.location.reload();
  };

  const handleSafeLogin = () => {
    // Clear any corrupted session data
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleClearErrors = () => {
    localStorage.removeItem('eva_auth_error');
    localStorage.removeItem('eva_last_operation_error');
    navigate('/');
  };

  const handleNetworkDiagnostics = () => {
    // Simple network diagnostic
    const performDiagnostics = async () => {
      try {
        const response = await fetch('https://wbydubxjcdhoinhrozwx.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1YnhqY2Rob2luaHJvend4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjI2MjgsImV4cCI6MjA2NTYzODYyOH0.A_n3yGRvALma5H9LTY6Cl1DLwgLg-xgwIP2slREkgy4'
          }
        });
        
        if (response.ok) {
          alert('Соединение с сервером: ✅ Успешно\nПроблема может быть в настройках авторизации.');
        } else {
          alert('Соединение с сервером: ❌ Ошибка\nПроверьте подключение к интернету.');
        }
      } catch (error) {
        alert('Соединение с сервером: ❌ Недоступно\nПроверьте подключение к интернету.');
      }
    };
    
    performDiagnostics();
  };

  return (
    <div className="min-h-screen app-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Произошла ошибка авторизации
          </h1>
          <p className="text-muted-foreground">
            Не волнуйтесь! Мы автоматически восстановили безопасное состояние. 
            Попробуйте один из вариантов ниже.
          </p>
          
          {/* Error Details */}
          {errorDetails && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-left">
              <h3 className="font-semibold text-sm mb-2">Детали ошибки:</h3>
              <div className="text-xs space-y-1">
                {errorDetails.error && (
                  <p><strong>Ошибка:</strong> {errorDetails.error}</p>
                )}
                {errorDetails.errorDescription && (
                  <p><strong>Описание:</strong> {errorDetails.errorDescription}</p>
                )}
                {errorDetails.timestamp && (
                  <p><strong>Время:</strong> {new Date(errorDetails.timestamp).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Common Solutions */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left">
            <h3 className="font-semibold text-sm mb-2">Распространенные решения:</h3>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Проверьте настройки Site URL и Redirect URLs в Supabase</li>
              <li>Убедитесь, что домен добавлен в разрешенные</li>
              <li>Очистите кэш браузера и cookies</li>
              <li>Попробуйте открыть в режиме инкогнито</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Network Diagnostics */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleNetworkDiagnostics}
          >
            <Activity className="w-4 h-4 mr-2" />
            Показать диагностику сети
          </Button>

          {/* Try Again - Primary Action */}
          <Button
            className="w-full"
            onClick={handleRetry}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>

          {/* Safe Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSafeLogin}
          >
            <Shield className="w-4 h-4 mr-2" />
            Безопасный вход
          </Button>

          {/* Clear Errors */}
          {errorDetails && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearErrors}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Очистить ошибки
            </Button>
          )}

          {/* Home */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleHome}
          >
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>

        {/* Support Contact */}
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p className="mb-2">
            Если проблема повторяется, обратитесь в поддержку:
          </p>
          <p className="font-mono text-xs">
            support@bez-pauzy.com
          </p>
        </div>
      </Card>
    </div>
  );
};