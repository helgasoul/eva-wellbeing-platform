import React, { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 AuthErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // ✅ Восстанавливаем состояние auth при критических ошибках
    this.fallbackToEmergencyMode();
  }

  fallbackToEmergencyMode = () => {
    try {
      // Сохраняем текущее состояние для восстановления
      const currentPath = window.location.pathname;
      const errorTimestamp = new Date().toISOString();
      
      localStorage.setItem('eva_error_recovery', JSON.stringify({
        path: currentPath,
        timestamp: errorTimestamp,
        userAgent: navigator.userAgent
      }));

      // Очищаем поврежденные данные auth
      const authKeys = ['eva_user', 'eva_auth_token', 'eva_session'];
      authKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            JSON.parse(data);
          } catch (e) {
            console.warn(`🔧 Removing corrupted ${key}:`, e);
            localStorage.removeItem(key);
          }
        }
      });

      console.log('✅ Emergency auth recovery completed');
    } catch (recoveryError) {
      console.error('❌ Emergency recovery failed:', recoveryError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleEmergencyLogin = () => {
    // Переход к emergency login с сохранением контекста
    const currentPath = window.location.pathname;
    window.location.href = `/login-safe?returnTo=${encodeURIComponent(currentPath)}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bloom-card p-8 text-center">
              {/* Иконка ошибки */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-playfair font-bold text-foreground mb-4">
                Произошла ошибка авторизации
              </h1>

              <p className="text-muted-foreground mb-6">
                Не волнуйтесь! Мы автоматически восстановили безопасное состояние. 
                Попробуйте один из вариантов ниже.
              </p>

              {/* Информация об ошибке для разработчиков */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Детали ошибки:</h3>
                  <p className="text-sm text-red-700 font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-600 cursor-pointer">
                        Стек вызовов
                      </summary>
                      <pre className="text-xs text-red-600 mt-1 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Варианты восстановления */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bloom-button flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Попробовать снова
                </Button>

                <Button
                  onClick={this.handleEmergencyLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Безопасный вход
                </Button>

                <Link to="/" className="block">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    На главную
                  </Button>
                </Link>
              </div>

              {/* Поддержка */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Если проблема повторяется, обратитесь в поддержку: 
                  <br />
                  <span className="font-mono text-xs">support@eva-platform.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ HOC для быстрого оборачивания компонентов
export const withAuthErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <AuthErrorBoundary fallbackComponent={fallbackComponent}>
      <Component {...props} />
    </AuthErrorBoundary>
  );
  
  WrappedComponent.displayName = `withAuthErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};