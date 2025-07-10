import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Database,
  Wifi,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string | number;
  timestamp: string;
  details?: string;
}

interface AuthEvent {
  timestamp: string;
  type: 'login' | 'logout' | 'error' | 'emergency' | 'recovery';
  details: string;
  userId?: string;
}

export const SystemHealthMonitor: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const metrics: HealthMetric[] = [];
    
    try {
      // 1. Проверка Supabase соединения
      const startTime = Date.now();
      const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
      const dbLatency = Date.now() - startTime;
      
      metrics.push({
        name: 'Database Connection',
        status: error ? 'critical' : dbLatency > 1000 ? 'warning' : 'healthy',
        value: `${dbLatency}ms`,
        timestamp: new Date().toISOString(),
        details: error ? error.message : 'Connected'
      });

      // 2. Проверка localStorage
      try {
        localStorage.setItem('health-test', 'test');
        localStorage.removeItem('health-test');
        metrics.push({
          name: 'Local Storage',
          status: 'healthy',
          value: 'Available',
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        metrics.push({
          name: 'Local Storage',
          status: 'critical',
          value: 'Unavailable',
          timestamp: new Date().toISOString(),
          details: 'Cannot access localStorage'
        });
      }

      // 3. Проверка системных компонентов
      const systemChecks = localStorage.getItem('eva_system_checks');
      if (systemChecks) {
        const checks = JSON.parse(systemChecks);
        metrics.push({
          name: 'System Components',
          status: checks.hasSupabaseClient && checks.hasAuthService ? 'healthy' : 'critical',
          value: Object.values(checks).filter(Boolean).length + '/' + Object.keys(checks).length,
          timestamp: checks.timestamp
        });
      }

      // 4. Проверка ошибок
      const lastError = localStorage.getItem('eva_last_error');
      const errorTime = lastError ? parseInt(lastError) : 0;
      const timeSinceError = lastError ? Date.now() - errorTime : Infinity;
      
      metrics.push({
        name: 'Last Error',
        status: timeSinceError < 300000 ? 'warning' : 'healthy', // 5 минут
        value: lastError ? new Date(errorTime).toLocaleTimeString() : 'None',
        timestamp: new Date().toISOString(),
        details: timeSinceError < 300000 ? 'Recent error detected' : undefined
      });

      // 5. Проверка emergency режима
      const emergencyMode = localStorage.getItem('eva_emergency_mode');
      metrics.push({
        name: 'Emergency Mode',
        status: emergencyMode === 'active' ? 'warning' : 'healthy',
        value: emergencyMode === 'active' ? 'Active' : 'Inactive',
        timestamp: new Date().toISOString()
      });

      setHealthMetrics(metrics);

    } catch (error) {
      console.error('Health check error:', error);
      metrics.push({
        name: 'Health Check',
        status: 'critical',
        value: 'Failed',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      setHealthMetrics(metrics);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadAuthEvents = () => {
    try {
      // Загружаем логи доступа
      const accessLogs = JSON.parse(localStorage.getItem('eva_access_logs') || '[]');
      const events: AuthEvent[] = accessLogs.map((log: any) => ({
        timestamp: log.timestamp,
        type: log.type === 'emergency_access' ? 'emergency' : 'login',
        details: `${log.type} as ${log.role}`,
        userId: log.userId
      }));

      // Добавляем события ошибок
      const lastError = localStorage.getItem('eva_last_error');
      if (lastError) {
        events.push({
          timestamp: new Date(parseInt(lastError)).toISOString(),
          type: 'error',
          details: 'System error occurred'
        });
      }

      // Сортируем по времени (новые сверху)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAuthEvents(events.slice(0, 20)); // Показываем последние 20 событий
      setErrorCount(events.filter(e => e.type === 'error').length);
      
    } catch (error) {
      console.error('Error loading auth events:', error);
    }
  };

  const performAutoTest = async () => {
    try {
      // Тест авторизации без реального входа
      const testAuth = await supabase.auth.getSession();
      
      const testEvent: AuthEvent = {
        timestamp: new Date().toISOString(),
        type: testAuth.data.session ? 'login' : 'logout',
        details: 'Automated auth test',
        userId: testAuth.data.session?.user?.id
      };

      const existingEvents = [...authEvents];
      existingEvents.unshift(testEvent);
      setAuthEvents(existingEvents.slice(0, 20));

      toast({
        title: 'Автотест завершен',
        description: `Статус: ${testAuth.data.session ? 'Авторизован' : 'Не авторизован'}`,
      });

    } catch (error) {
      console.error('Auto test error:', error);
      toast({
        title: 'Ошибка автотеста',
        description: 'Не удалось выполнить автоматическую проверку',
        variant: 'destructive',
      });
    }
  };

  const clearAllData = () => {
    const keysToRemove = [
      'eva_access_logs',
      'eva_last_error', 
      'eva_emergency_mode',
      'eva_recovery_available',
      'eva_system_checks',
      'eva_auth_backup'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Сбрасываем состояние
    setAuthEvents([]);
    setErrorCount(0);
    
    toast({
      title: 'Данные очищены',
      description: 'Все логи и данные мониторинга удалены',
    });
    
    // Перезапускаем проверки
    setTimeout(() => {
      checkSystemHealth();
      loadAuthEvents();
    }, 1000);
  };

  const exportSystemReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      healthMetrics,
      authEvents,
      activeUsers,
      errorCount,
      currentUser: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: Object.keys(localStorage).filter(key => key.startsWith('eva'))
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-system-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Отчет экспортирован',
      description: 'Системный отчет сохранен в файл',
    });
  };

  useEffect(() => {
    checkSystemHealth();
    loadAuthEvents();

    // Автоматическое обновление каждые 30 секунд
    const interval = setInterval(() => {
      checkSystemHealth();
      loadAuthEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-playfair font-bold">Мониторинг Системы</h2>
          <p className="text-muted-foreground">Отслеживание состояния авторизации и системных компонентов</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={checkSystemHealth}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button onClick={exportSystemReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активных пользователей</p>
                <p className="text-xl font-bold">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ошибок за час</p>
                <p className="text-xl font-bold">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Системных компонентов</p>
                <p className="text-xl font-bold">{healthMetrics.filter(m => m.status === 'healthy').length}/{healthMetrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Последнее обновление</p>
                <p className="text-sm font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Системные метрики */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Состояние Системы
            </CardTitle>
            <CardDescription>
              Мониторинг ключевых компонентов платформы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      {metric.details && (
                        <p className="text-xs text-muted-foreground">{metric.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.value}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t flex gap-2">
              <Button onClick={performAutoTest} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-1" />
                Автотест
              </Button>
              <Button onClick={clearAllData} variant="outline" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* События авторизации */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              События Авторизации
            </CardTitle>
            <CardDescription>
              Последние события входа, ошибки и экстренные доступы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {authEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">События не найдены</p>
              ) : (
                authEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'error' ? 'bg-red-500' :
                      event.type === 'emergency' ? 'bg-yellow-500' :
                      event.type === 'recovery' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                        {event.userId && ` • ${event.userId.slice(0, 8)}...`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Критические предупреждения */}
      {healthMetrics.some(m => m.status === 'critical') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold">⚠️ Обнаружены критические проблемы!</p>
            <ul className="mt-2 text-sm list-disc list-inside">
              {healthMetrics
                .filter(m => m.status === 'critical')
                .map((metric, index) => (
                  <li key={index}>{metric.name}: {metric.details || metric.value}</li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
};