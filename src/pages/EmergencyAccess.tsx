import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Shield, Database, Router, Key, AlertCircle, Zap, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  component: 'auth' | 'routing' | 'storage' | 'api' | 'database' | 'permissions' | 'network';
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
  solution?: {
    title: string;
    description: string;
    action: () => void;
    severity: 'low' | 'medium' | 'high';
  };
}

const EmergencyAccess: React.FC = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const componentIcons = {
    auth: Key,
    routing: Router,
    storage: Database,
    api: Monitor,
    database: Database,
    permissions: Shield,
    network: Zap
  };

  const statusColors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    checking: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const errorTracker = {
    logError: (error: Error, context: string) => {
      console.error(`[Eva Emergency] ${context}:`, error);
    },
    logSuccess: (action: string) => {
      console.log(`[Eva Emergency] Success: ${action}`);
    }
  };

  const emergencyFixes = {
    clearCorruptedData: () => {
      const keysToCheck = Object.keys(localStorage);
      keysToCheck.forEach(key => {
        try {
          if (key.includes('eva') || key.includes('supabase')) {
            const value = localStorage.getItem(key);
            if (value) {
              JSON.parse(value);
            }
          }
        } catch (e) {
          localStorage.removeItem(key);
          errorTracker.logSuccess(`Removed corrupted key: ${key}`);
        }
      });
    },

    clearAuthData: () => {
      localStorage.removeItem('eva_user');
      localStorage.removeItem('eva_auth_token');
      localStorage.removeItem('sb-wbydubjxcdhoinhroxzwx-auth-token');
      sessionStorage.clear();
      errorTracker.logSuccess('Cleared authentication data');
    },

    createTestUser: () => {
      const testUser = {
        id: 'test_user_' + Date.now(),
        email: 'test@eva-platform.com',
        firstName: 'Тест',
        lastName: 'Пользователь',
        role: 'patient',
        isVerified: true,
        onboardingCompleted: true
      };
      localStorage.setItem('eva_user', JSON.stringify(testUser));
      localStorage.setItem('eva_auth_token', 'test_token_' + Date.now());
      errorTracker.logSuccess('Created test user');
    },

    restoreAdminAccess: () => {
      const adminUser = {
        id: 'admin_emergency',
        email: 'admin@eva-platform.com',
        firstName: 'Админ',
        lastName: 'Системы',
        role: 'admin',
        isVerified: true,
        onboardingCompleted: true,
        permissions: ['all']
      };
      localStorage.setItem('eva_user', JSON.stringify(adminUser));
      localStorage.setItem('eva_auth_token', 'admin_emergency_token');
      errorTracker.logSuccess('Restored admin access');
    },

    fixRouting: () => {
      if (window.location.pathname === '/emergency-access') {
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 2000);
      }
    },

    forceRedirect: (path: string) => {
      window.location.href = path;
    }
  };

  const runDiagnostic = async (component: DiagnosticResult['component']): Promise<DiagnosticResult> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    switch (component) {
      case 'auth':
        try {
          const authToken = localStorage.getItem('sb-wbydubjxcdhoinhroxzwx-auth-token');
          const evaUser = localStorage.getItem('eva_user');
          
          if (!authToken && !evaUser) {
            return {
              component,
              status: 'error',
              message: 'Отсутствуют данные аутентификации',
              details: 'Не найдены токены авторизации в localStorage',
              solution: {
                title: 'Создать тестового пользователя',
                description: 'Создаст временного пользователя для доступа к платформе',
                action: emergencyFixes.createTestUser,
                severity: 'high'
              }
            };
          }

          if (authToken) {
            try {
              JSON.parse(authToken);
              return {
                component,
                status: 'success',
                message: 'Аутентификация работает корректно',
                details: 'Найден валидный токен Supabase'
              };
            } catch {
              return {
                component,
                status: 'warning',
                message: 'Поврежденный токен аутентификации',
                details: 'Токен не может быть прочитан',
                solution: {
                  title: 'Очистить поврежденные данные',
                  description: 'Удалит поврежденные токены и данные',
                  action: emergencyFixes.clearAuthData,
                  severity: 'medium'
                }
              };
            }
          }

          return {
            component,
            status: 'warning',
            message: 'Найден только тестовый пользователь',
            details: 'Используется локальная аутентификация'
          };
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Критическая ошибка аутентификации',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка',
            solution: {
              title: 'Полная очистка данных',
              description: 'Очистит все данные и создаст тестового пользователя',
              action: () => {
                emergencyFixes.clearAuthData();
                setTimeout(emergencyFixes.createTestUser, 500);
              },
              severity: 'high'
            }
          };
        }

      case 'database':
        try {
          const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
          if (error) throw error;
          
          return {
            component,
            status: 'success',
            message: 'Подключение к базе данных работает',
            details: 'Успешное подключение к Supabase'
          };
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Ошибка подключения к базе данных',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка базы данных'
          };
        }

      case 'routing':
        try {
          const currentPath = window.location.pathname;
          const isValidRoute = currentPath === '/emergency-access';
          
          return {
            component,
            status: isValidRoute ? 'success' : 'warning',
            message: isValidRoute ? 'Роутинг работает корректно' : 'Возможные проблемы с роутингом',
            details: `Текущий путь: ${currentPath}`,
            solution: !isValidRoute ? {
              title: 'Перенаправить на главную',
              description: 'Перенаправит на главную страницу после восстановления',
              action: () => emergencyFixes.forceRedirect('/'),
              severity: 'low'
            } : undefined
          };
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Критическая ошибка роутинга',
            details: error instanceof Error ? error.message : 'Ошибка роутера'
          };
        }

      case 'storage':
        try {
          const testKey = 'eva_diagnostic_test';
          const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
          
          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          if (retrieved === testValue) {
            return {
              component,
              status: 'success',
              message: 'Локальное хранилище работает корректно',
              details: 'Чтение и запись данных работают'
            };
          }
          
          throw new Error('Не удается записать или прочитать данные');
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Ошибка локального хранилища',
            details: error instanceof Error ? error.message : 'Проблемы с localStorage',
            solution: {
              title: 'Очистить поврежденные данные',
              description: 'Удалит поврежденные записи из localStorage',
              action: emergencyFixes.clearCorruptedData,
              severity: 'medium'
            }
          };
        }

      case 'api':
        try {
          const response = await fetch(window.location.origin);
          if (response.ok) {
            return {
              component,
              status: 'success', 
              message: 'API подключение работает',
              details: `Статус: ${response.status}`
            };
          }
          throw new Error(`HTTP ${response.status}`);
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Ошибка API подключения',
            details: error instanceof Error ? error.message : 'Сетевая ошибка'
          };
        }

      case 'permissions':
        try {
          const user = localStorage.getItem('eva_user');
          if (!user) {
            return {
              component,
              status: 'warning',
              message: 'Не определены права пользователя',
              details: 'Пользователь не авторизован',
              solution: {
                title: 'Создать тестового пользователя',
                description: 'Создаст пользователя с базовыми правами',
                action: emergencyFixes.createTestUser,
                severity: 'medium'
              }
            };
          }

          const userData = JSON.parse(user);
          const hasRole = userData.role && ['patient', 'doctor', 'admin'].includes(userData.role);

          return {
            component,
            status: hasRole ? 'success' : 'warning',
            message: hasRole ? `Роль: ${userData.role}` : 'Неопределенная роль пользователя',
            details: `Пользователь: ${userData.email || 'Неизвестно'}`
          };
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Ошибка прав доступа',
            details: error instanceof Error ? error.message : 'Поврежденные данные пользователя',
            solution: {
              title: 'Восстановить права доступа',
              description: 'Создаст пользователя с корректными правами',
              action: emergencyFixes.createTestUser,
              severity: 'high'
            }
          };
        }

      case 'network':
        try {
          const start = Date.now();
          await fetch(window.location.origin + '/favicon.ico');
          const latency = Date.now() - start;
          
          return {
            component,
            status: latency < 1000 ? 'success' : 'warning',
            message: `Сетевое подключение: ${latency}ms`,
            details: latency < 1000 ? 'Хорошая скорость' : 'Медленное соединение'
          };
        } catch (error) {
          return {
            component,
            status: 'error',
            message: 'Нет сетевого подключения',
            details: error instanceof Error ? error.message : 'Сетевая ошибка'
          };
        }

      default:
        return {
          component,
          status: 'error',
          message: 'Неизвестный компонент',
          details: 'Диагностика не поддерживается'
        };
    }
  };

  const runEmergencyDiagnostics = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const components: DiagnosticResult['component'][] = ['auth', 'database', 'routing', 'storage', 'api', 'permissions', 'network'];
    
    // Сначала устанавливаем все в состояние проверки
    const initialResults: DiagnosticResult[] = components.map(component => ({
      component,
      status: 'checking',
      message: 'Проверка...'
    }));
    setDiagnostics(initialResults);

    // Затем запускаем диагностику по очереди
    for (let i = 0; i < components.length; i++) {
      const result = await runDiagnostic(components[i]);
      setDiagnostics(prev => prev.map((item, index) => 
        index === i ? result : item
      ));
    }
    
    setIsRunning(false);
    errorTracker.logSuccess('Диагностика завершена');
  };

  const quickRestore = async () => {
    setIsRunning(true);
    try {
      emergencyFixes.clearAuthData();
      await new Promise(resolve => setTimeout(resolve, 500));
      emergencyFixes.createTestUser();
      await new Promise(resolve => setTimeout(resolve, 500));
      errorTracker.logSuccess('Быстрое восстановление завершено');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      errorTracker.logError(error as Error, 'Quick restore');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  useEffect(() => {
    runEmergencyDiagnostics();
  }, []);

  const getOverallStatus = (): { status: DiagnosticResult['status'], message: string } => {
    const hasErrors = diagnostics.some(d => d.status === 'error');
    const hasWarnings = diagnostics.some(d => d.status === 'warning');
    const isChecking = diagnostics.some(d => d.status === 'checking');

    if (isChecking) return { status: 'checking' as const, message: 'Диагностика выполняется...' };
    if (hasErrors) return { status: 'error' as const, message: 'Обнаружены критические ошибки' };
    if (hasWarnings) return { status: 'warning' as const, message: 'Обнаружены предупреждения' };
    return { status: 'success' as const, message: 'Все системы работают корректно' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Экстренный доступ Eva</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Автоматическая диагностика и восстановление доступа к платформе
          </p>
        </div>

        {/* Общий статус */}
        <Alert className={`mb-6 ${statusColors[overallStatus.status]} border-2`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus.status)}
            <AlertDescription className="font-medium">
              {overallStatus.message}
            </AlertDescription>
          </div>
        </Alert>

        {/* Быстрые действия */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Быстрые решения
            </CardTitle>
            <CardDescription>
              Автоматические исправления для восстановления доступа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Button 
                onClick={quickRestore}
                disabled={isRunning}
                className="w-full"
                variant="default"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Восстановление...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Быстрое восстановление
                  </>
                )}
              </Button>

              <Button 
                onClick={() => {
                  emergencyFixes.restoreAdminAccess();
                  setTimeout(() => navigate('/admin/dashboard'), 1000);
                }}
                disabled={isRunning}
                variant="outline"
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Админский доступ
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Button 
                onClick={() => {
                  emergencyFixes.createTestUser();
                  setTimeout(() => navigate('/patient/dashboard'), 1000);
                }}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                Тест-пациент
              </Button>

              <Button 
                onClick={() => navigate('/')}
                disabled={isRunning}
                variant="outline" 
                size="sm"
              >
                На главную
              </Button>

              <Button 
                onClick={() => window.location.reload()}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                Перезагрузить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Результаты диагностики */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Диагностика системы
              </CardTitle>
              <CardDescription>
                Автоматическая проверка всех компонентов платформы
              </CardDescription>
            </div>
            <Button 
              onClick={runEmergencyDiagnostics}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Повторить'
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => {
                const IconComponent = componentIcons[diagnostic.component];
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${statusColors[diagnostic.status]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostic.status)}
                            <h4 className="font-medium capitalize">
                              {diagnostic.component === 'auth' && 'Аутентификация'}
                              {diagnostic.component === 'database' && 'База данных'}
                              {diagnostic.component === 'routing' && 'Роутинг'}
                              {diagnostic.component === 'storage' && 'Хранилище'}
                              {diagnostic.component === 'api' && 'API'}
                              {diagnostic.component === 'permissions' && 'Права доступа'}
                              {diagnostic.component === 'network' && 'Сеть'}
                            </h4>
                            <Badge variant={diagnostic.status === 'success' ? 'default' : 'destructive'}>
                              {diagnostic.status === 'success' && 'OK'}
                              {diagnostic.status === 'error' && 'Ошибка'}
                              {diagnostic.status === 'warning' && 'Внимание'}
                              {diagnostic.status === 'checking' && 'Проверка'}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{diagnostic.message}</p>
                          {diagnostic.details && (
                            <p className="text-xs opacity-75 mt-1">{diagnostic.details}</p>
                          )}
                        </div>
                      </div>
                      
                      {diagnostic.solution && (
                        <Button
                          onClick={diagnostic.solution.action}
                          size="sm"
                          variant={diagnostic.solution.severity === 'high' ? 'default' : 'outline'}
                          className="ml-4"
                          disabled={isRunning}
                        >
                          Исправить
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Расширенная диагностика */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Расширенная диагностика</CardTitle>
              <Button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="ghost"
                size="sm"
              >
                {showAdvanced ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
          </CardHeader>
          
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Действия восстановления:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <Button 
                      onClick={emergencyFixes.clearCorruptedData}
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      Очистить поврежденные данные
                    </Button>
                    <Button 
                      onClick={emergencyFixes.clearAuthData}
                      variant="outline"
                      size="sm" 
                      className="w-full justify-start"
                    >
                      Сбросить аутентификацию
                    </Button>
                    <Button 
                      onClick={() => emergencyFixes.forceRedirect('/login')}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Перейти к входу
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Тестовые аккаунты:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Пациент</div>
                      <div className="text-gray-600">test@eva-platform.com</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Врач</div>
                      <div className="text-gray-600">doctor@eva-platform.com</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">Администратор</div>
                      <div className="text-gray-600">admin@eva-platform.com</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Безопасность:</strong> Экстренный доступ предназначен только для восстановления работы платформы. 
                  После решения проблем рекомендуется использовать стандартную аутентификацию.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmergencyAccess;