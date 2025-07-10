import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  Settings,
  Users,
  UserCheck
} from 'lucide-react';
import { UserRole } from '@/types/roles';

export const EmergencyLogin: React.FC = () => {
  const [isActivating, setIsActivating] = useState(false);
  const [systemChecks, setSystemChecks] = useState<any>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем системное состояние
    const checkSystemHealth = () => {
      const checks = localStorage.getItem('eva_system_checks');
      const emergencyStatus = localStorage.getItem('eva_emergency_mode');
      const recoveryStatus = localStorage.getItem('eva_recovery_available');
      
      if (checks) {
        setSystemChecks(JSON.parse(checks));
      }
      
      if (emergencyStatus === 'active') {
        setEmergencyMode(true);
      }
      
      if (recoveryStatus === 'true') {
        setRecoveryAvailable(true);
      }
    };

    checkSystemHealth();
    
    // Обновляем проверки каждые 10 секунд
    const interval = setInterval(checkSystemHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyAccess = async (role: 'patient' | 'doctor' | 'admin') => {
    setIsActivating(true);
    
    try {
      const emergencyCredentials = {
        patient: {
          email: 'emergency.patient@eva.local',
          password: 'emergency-patient-2025'
        },
        doctor: {
          email: 'emergency.doctor@eva.local', 
          password: 'emergency-doctor-2025'
        },
        admin: {
          email: 'admin@eva-platform.com',
          password: 'EvaAdmin2025!'
        }
      };

      // Создаем временного пользователя для экстренного доступа
      const emergencyUser = {
        id: `emergency-${role}-${Date.now()}`,
        email: emergencyCredentials[role].email,
        firstName: role === 'patient' ? 'Emergency' : role === 'doctor' ? 'Dr. Emergency' : 'Admin',
        lastName: role === 'patient' ? 'User' : role === 'doctor' ? 'Access' : 'Emergency',
        role: role.toUpperCase() as UserRole,
        createdAt: new Date(),
        registrationCompleted: true,
        onboardingCompleted: role !== 'patient' // Только пациенты нуждаются в онбординге
      };

      // Логируем экстренный доступ
      const accessLog = {
        timestamp: new Date().toISOString(),
        type: 'emergency_access',
        role: role,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('eva_access_logs') || '[]');
      existingLogs.push(accessLog);
      localStorage.setItem('eva_access_logs', JSON.stringify(existingLogs));
      
      // Сохраняем emergency пользователя
      localStorage.setItem('eva-user', JSON.stringify(emergencyUser));
      localStorage.setItem('eva_emergency_active', 'true');
      
      toast({
        title: '🚨 Экстренный доступ активирован',
        description: `Вы вошли как ${role === 'patient' ? 'пациент' : role === 'doctor' ? 'врач' : 'администратор'} в режиме восстановления`,
        variant: 'default',
      });

      // Принудительно обновляем страницу для сброса состояния
      setTimeout(() => {
        if (role === 'patient') {
          window.location.href = '/patient/dashboard';
        } else if (role === 'doctor') {
          window.location.href = '/doctor/dashboard';
        } else {
          window.location.href = '/admin/dashboard';
        }
      }, 1000);

    } catch (error) {
      console.error('Emergency access error:', error);
      toast({
        title: 'Ошибка экстренного доступа',
        description: 'Не удалось активировать экстренный режим',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleRecoveryRestore = () => {
    const backup = localStorage.getItem('eva_auth_backup');
    if (backup) {
      try {
        const backupData = JSON.parse(backup);
        if (backupData.user) {
          localStorage.setItem('eva-user', JSON.stringify(backupData.user));
          localStorage.removeItem('eva_last_error');
          localStorage.removeItem('eva_recovery_available');
          
          toast({
            title: '✅ Сессия восстановлена',
            description: 'Данные восстановлены из резервной копии',
          });
          
          // Перезагружаем страницу для применения восстановленных данных
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        toast({
          title: 'Ошибка восстановления',
          description: 'Не удалось восстановить сессию из резервной копии',
          variant: 'destructive',
        });
      }
    }
  };

  const handleClearData = () => {
    // Очищаем все данные для чистого старта
    const keysToRemove = [
      'eva-user',
      'eva_user_data', 
      'eva_onboarding_data',
      'eva_auth_backup',
      'eva_last_error',
      'eva_emergency_mode',
      'eva_recovery_available',
      'eva_system_checks'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: 'Данные очищены',
      description: 'Все данные авторизации удалены. Попробуйте войти заново.',
    });
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  const handleExportLogs = () => {
    const logs = {
      accessLogs: JSON.parse(localStorage.getItem('eva_access_logs') || '[]'),
      systemChecks: JSON.parse(localStorage.getItem('eva_system_checks') || '{}'),
      lastError: localStorage.getItem('eva_last_error'),
      emergencyMode: localStorage.getItem('eva_emergency_mode'),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-emergency-logs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Логи экспортированы',
      description: 'Файл с диагностической информацией загружен',
    });
  };

  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Главная карточка экстренного доступа */}
        <Card className="border-red-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-playfair text-red-800">
              🚨 Экстренное Восстановление Доступа
            </CardTitle>
            <CardDescription className="text-red-600">
              Система авторизации недоступна. Используйте экстренные методы входа.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Системная диагностика */}
            {systemChecks && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-yellow-800">Системная диагностика:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Supabase Client:</span>
                        <span className={systemChecks.hasSupabaseClient ? "text-green-600" : "text-red-600"}>
                          {systemChecks.hasSupabaseClient ? "✅" : "❌"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auth Service:</span>
                        <span className={systemChecks.hasAuthService ? "text-green-600" : "text-red-600"}>
                          {systemChecks.hasAuthService ? "✅" : "❌"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>LocalStorage:</span>
                        <span className={systemChecks.hasLocalStorage ? "text-green-600" : "text-red-600"}>
                          {systemChecks.hasLocalStorage ? "✅" : "❌"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Mode:</span>
                        <span className={emergencyMode ? "text-red-600" : "text-green-600"}>
                          {emergencyMode ? "🚨 Active" : "✅ Normal"}
                        </span>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Восстановление из резервной копии */}
            {recoveryAvailable && (
              <Alert className="border-blue-200 bg-blue-50">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-800">Найдена резервная копия сессии</p>
                      <p className="text-sm text-blue-600">Вы можете восстановить предыдущую сессию</p>
                    </div>
                    <Button
                      onClick={handleRecoveryRestore}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Восстановить
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Экстренные методы входа */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Экстренные методы входа:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Пациент */}
                <Button
                  onClick={() => handleEmergencyAccess('patient')}
                  disabled={isActivating}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Пациент</div>
                    <div className="text-xs opacity-90">Базовый доступ</div>
                  </div>
                </Button>

                {/* Врач */}
                <Button
                  onClick={() => handleEmergencyAccess('doctor')}
                  disabled={isActivating}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserCheck className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Врач</div>
                    <div className="text-xs opacity-90">Медицинский доступ</div>
                  </div>
                </Button>

                {/* Администратор */}
                <Button
                  onClick={() => handleEmergencyAccess('admin')}
                  disabled={isActivating}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Settings className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Админ</div>
                    <div className="text-xs opacity-90">Полный доступ</div>
                  </div>
                </Button>
                
              </div>
            </div>

            {/* Дополнительные инструменты */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Инструменты восстановления:</h4>
              <div className="flex flex-wrap gap-2">
                
                <Button
                  onClick={handleExportLogs}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Экспорт логов
                </Button>
                
                <Button
                  onClick={handleClearData}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Очистить данные
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Обычный вход
                </Button>
                
              </div>
            </div>

            {/* Статус активации */}
            {isActivating && (
              <Alert className="border-green-200 bg-green-50">
                <Clock className="h-4 w-4 text-green-600 animate-spin" />
                <AlertDescription className="text-green-800">
                  Активируем экстренный доступ...
                </AlertDescription>
              </Alert>
            )}

          </CardContent>
        </Card>

        {/* Информационная карточка */}
        <Card className="bg-muted/50 border-muted">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-semibold text-sm">ℹ️ О экстренном режиме</h4>
              <p className="text-xs text-muted-foreground">
                Экстренный режим обеспечивает доступ к платформе при проблемах с основной системой авторизации. 
                Все действия логируются для последующего анализа.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};