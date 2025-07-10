import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  retryCount: number;
}

export class SupabaseErrorBoundary extends Component<Props, State> {
  private retryTimer?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isNetworkError = error.message.includes('Load failed') || 
                          error.message.includes('NetworkError') ||
                          error.message.includes('Failed to fetch');

    return {
      hasError: true,
      error,
      isNetworkError
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 SupabaseErrorBoundary caught error:', error, errorInfo);
    
    // Логируем детали ошибки для диагностики
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      online: navigator.onLine
    };
    
    localStorage.setItem('eva_last_supabase_error', JSON.stringify(errorDetails));
    
    // Если это сетевая ошибка, пытаемся автоматически восстановиться
    if (this.state.isNetworkError && this.state.retryCount < 3) {
      this.scheduleAutoRetry();
    }
  }

  scheduleAutoRetry = () => {
    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, 3000 + (this.state.retryCount * 2000)); // Увеличиваем delay
  };

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1
    }));
    
    // Вызываем пользовательский retry если есть
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const isOffline = !navigator.onLine;
      const isNetworkError = this.state.isNetworkError;

      return (
        <div className="w-full p-4">
          <Card className="max-w-md mx-auto border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                {isOffline ? (
                  <WifiOff className="w-5 h-5" />
                ) : isNetworkError ? (
                  <Wifi className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {isOffline ? 'Нет подключения к интернету' : 
                 isNetworkError ? 'Проблемы с загрузкой данных' : 
                 'Ошибка загрузки'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-orange-700">
                {isOffline ? (
                  <p>Проверьте подключение к интернету. Доступны сохраненные данные.</p>
                ) : isNetworkError ? (
                  <p>Не удалось подключиться к серверу. Используются локальные данные.</p>
                ) : (
                  <p>Произошла ошибка при загрузке. Попробуйте обновить страницу.</p>
                )}
              </div>

              {this.state.retryCount > 0 && this.state.retryCount < 3 && (
                <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                  Автоматическая попытка восстановления #{this.state.retryCount}...
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleManualRetry}
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
                
                {this.state.retryCount >= 3 && (
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Обновить страницу
                  </Button>
                )}
              </div>

              <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                💡 <strong>Ваши данные в безопасности:</strong> все записи сохраняются локально 
                и будут синхронизированы при восстановлении подключения.
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-orange-600">
                    Детали ошибки (dev mode)
                  </summary>
                  <pre className="mt-2 p-2 bg-orange-100 rounded overflow-auto text-xs">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC для оборачивания компонентов
export const withSupabaseErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  onRetry?: () => void
) => {
  const WrappedComponent = (props: P) => (
    <SupabaseErrorBoundary onRetry={onRetry}>
      <Component {...props} />
    </SupabaseErrorBoundary>
  );
  
  WrappedComponent.displayName = `withSupabaseErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};