
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, LoginCredentials, RegisterData, MultiStepRegistrationData } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { getRoleDashboardPath } from '@/types/roles';
import { toast } from '@/hooks/use-toast';
import { DataFlowValidator } from '@/services/dataFlowValidator';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { supabase } from '@/integrations/supabase/client';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { DataBridge } from '@/services/DataBridge';

// Предустановленные админские credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@eva-platform.com',
  password: 'EvaAdmin2025!'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null); // Для сохранения оригинальной роли админа
  const [isTestingRole, setIsTestingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ Начинаем с true для загрузки сессии
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dataBridge = DataBridge.getInstance();

  // 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Система автобэкапов и экстренного восстановления
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // ✅ СИСТЕМА АВТОБЭКАПОВ: Создаем точку восстановления каждые 30 сек
        const startAutoBackup = () => {
          setInterval(() => {
            const authState = {
              user: user,
              timestamp: new Date().toISOString(),
              url: window.location.pathname
            };
            localStorage.setItem('eva_auth_backup', JSON.stringify(authState));
            localStorage.setItem('eva_last_backup', Date.now().toString());
          }, 30000);
        };

        // ✅ EMERGENCY RECOVERY: Проверяем нужно ли восстановление
        const checkEmergencyRecovery = () => {
          const lastError = localStorage.getItem('eva_last_error');
          const authBackup = localStorage.getItem('eva_auth_backup');
          
          if (lastError && authBackup) {
            try {
              const backup = JSON.parse(authBackup);
              const errorTime = parseInt(lastError);
              const backupTime = new Date(backup.timestamp).getTime();
              
              // Если ошибка была недавно и есть бэкап - предлагаем восстановление
              if (Date.now() - errorTime < 300000 && backupTime > errorTime) { // 5 минут
                console.log('🚨 Emergency recovery available, backup from:', backup.timestamp);
                localStorage.setItem('eva_recovery_available', 'true');
                return backup;
              }
            } catch (e) {
              console.warn('Could not parse backup data');
            }
          }
          return null;
        };

        // ✅ СИСТЕМНЫЕ ПРОВЕРКИ: Валидация целостности
        const performSystemChecks = () => {
          const checks = {
            hasSupabaseClient: !!supabase,
            hasAuthService: !!authService,
            hasLocalStorage: typeof(Storage) !== "undefined",
            hasSessionStorage: typeof(sessionStorage) !== "undefined",
            timestamp: new Date().toISOString()
          };
          
          localStorage.setItem('eva_system_checks', JSON.stringify(checks));
          
          // Если критические компоненты недоступны - активируем emergency режим
          if (!checks.hasSupabaseClient || !checks.hasAuthService) {
            console.error('🚨 Critical system components unavailable!');
            localStorage.setItem('eva_emergency_mode', 'active');
            return false;
          }
          
          return true;
        };

        // Выполняем системные проверки
        const systemHealthy = performSystemChecks();
        
        // Проверяем возможность экстренного восстановления
        const recoveryData = checkEmergencyRecovery();
        
        if (!systemHealthy) {
          // EMERGENCY MODE: Используем минимальный fallback
          console.log('🚨 Activating emergency mode');
          const emergencyUser = {
            id: 'emergency-' + Date.now(),
            email: 'emergency@user.local',
            firstName: 'Emergency',
            lastName: 'User',
            role: UserRole.PATIENT,
            createdAt: new Date(),
            registrationCompleted: true,
            onboardingCompleted: false
          } as User;
          setUser(emergencyUser);
          setIsLoading(false);
          return;
        }

        // Получаем текущего пользователя из Supabase
        const { user: currentUser } = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          console.log('✅ User authenticated via Supabase:', currentUser.email);
          
          // Проверяем миграцию данных из localStorage
          try {
            await onboardingService.migrateFromLocalStorage(currentUser.id);
          } catch (migrationError) {
            console.warn('Migration warning:', migrationError);
            // Не блокируем вход из-за ошибки миграции
          }
          
        } else if (recoveryData?.user) {
          // RECOVERY MODE: Восстанавливаем из бэкапа
          console.log('🔄 Restoring from emergency backup');
          setUser(recoveryData.user);
          localStorage.removeItem('eva_last_error');
          
        } else {
          // Fallback: проверяем localStorage для пользователей нуждающихся в миграции
          const localUser = localStorage.getItem('eva_user_data');
          const evaUser = localStorage.getItem('eva-user');
          
          if (localUser || evaUser) {
            try {
              const userData = JSON.parse(localUser || evaUser || '{}');
              // Устанавливаем пользователя из localStorage как временного
              const tempUser = {
                id: userData.id || 'temp-' + Date.now(),
                email: userData.email,
                firstName: userData.first_name || userData.firstName || '',
                lastName: userData.last_name || userData.lastName || '',
                role: (userData.role as UserRole) || UserRole.PATIENT,
                createdAt: new Date(userData.createdAt || Date.now()),
                registrationCompleted: userData.registrationCompleted || false,
                onboardingCompleted: userData.onboarding_completed || userData.onboardingCompleted || false
              } as User;
              setUser(tempUser);
              console.log('🔄 Using localStorage user data for recovery');
            } catch (error) {
              console.error('Error parsing localStorage:', error);
              localStorage.removeItem('eva_user_data');
              localStorage.removeItem('eva-user');
            }
          }
        }

        // Запускаем автобэкап после успешной инициализации
        startAutoBackup();
        
      } catch (error) {
        console.error('🚨 Auth initialization error:', error);
        localStorage.setItem('eva_last_error', Date.now().toString());
        
        // CRITICAL FALLBACK: Даже при полном провале создаем emergency пользователя
        const emergencyUser = {
          id: 'critical-fallback-' + Date.now(),
          email: 'fallback@user.local',
          firstName: 'Recovery',
          lastName: 'Mode',
          role: UserRole.PATIENT,
          createdAt: new Date(),
          registrationCompleted: true,
          onboardingCompleted: false
        } as User;
        setUser(emergencyUser);
        
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // ✅ Подписываемся на изменения аутентификации с миграцией
    const { data: { subscription } } = authService.onAuthStateChange(async (authenticatedUser) => {
      if (authenticatedUser && authenticatedUser.role === UserRole.PATIENT) {
        // Импортируем функцию миграции динамически
        const { migrateOnboardingData } = await import('@/utils/onboardingMigration');
        
        // Проверяем миграцию онбординга
        const migrationResult = migrateOnboardingData();
        
        if (migrationResult.migrationPerformed && migrationResult.onboardingCompleted) {
          // Обновляем пользователя с мигрированными данными
          const updatedUser = {
            ...authenticatedUser,
            onboardingCompleted: true,
            onboardingData: migrationResult.onboardingData
          };
          
          setUser(updatedUser);
          console.log('✅ Auth state changed with onboarding migration');
        } else {
          setUser(authenticatedUser);
          console.log('✅ Auth state changed - user logged in:', authenticatedUser.email);
        }
      } else {
        setUser(authenticatedUser);
        if (authenticatedUser) {
          console.log('✅ Auth state changed - user logged in:', authenticatedUser.email);
        } else {
          console.log('🔄 Auth state changed - user logged out');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ НОВОЕ: Проверяем админские credentials для демо
      if (credentials.email === ADMIN_CREDENTIALS.email && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        const mockUser: User = {
          id: 'admin-001',
          email: ADMIN_CREDENTIALS.email,
          firstName: 'Администратор',
          lastName: 'Eva Platform',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          registrationCompleted: true,
          onboardingCompleted: true
        };

        setUser(mockUser);
        
        if (credentials.rememberMe) {
          localStorage.setItem('eva-user', JSON.stringify(mockUser));
        }

        toast({
          title: 'Добро пожаловать!',
          description: 'Добро пожаловать в админ-панель Eva!',
        });

        navigate('/admin/dashboard');
        return;
      }

      // ✅ ОСНОВНОЙ ПОТОК: Аутентификация через Supabase
      const { user: authenticatedUser, error: authError } = await authService.login(credentials);

      if (authError) {
        setError(authError);
        toast({
          title: 'Ошибка входа',
          description: authError,
          variant: 'destructive',
        });
        throw new Error(authError);
      }

      if (!authenticatedUser) {
        const errorMessage = 'Не удалось войти в систему';
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        throw new Error(errorMessage);
      }

      setUser(authenticatedUser);

      // Сохраняем в localStorage для совместимости
      if (credentials.rememberMe) {
        localStorage.setItem('eva-user', JSON.stringify(authenticatedUser));
      }

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });

      // ✅ Редирект с учетом роли и статуса онбординга
      if (authenticatedUser.role === UserRole.PATIENT) {
        if (authenticatedUser.onboardingCompleted) {
          navigate('/patient/dashboard');
        } else {
          navigate('/patient/onboarding');
        }
      } else {
        const dashboardPath = getRoleDashboardPath(authenticatedUser.role);
        navigate(dashboardPath);
      }

    } catch (error: any) {
      console.error('Login error:', error);
      // Ошибка уже обработана выше
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ НОВОЕ: Регистрация через Supabase
      const { user: newUser, error: authError } = await authService.register(data);

      if (authError) {
        setError(authError);
        toast({
          title: 'Ошибка регистрации',
          description: authError,
          variant: 'destructive',
        });
        throw new Error(authError);
      }

      if (!newUser) {
        const errorMessage = 'Не удалось создать аккаунт';
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        throw new Error(errorMessage);
      }

      setUser(newUser);
      localStorage.setItem('eva-user', JSON.stringify(newUser));

      toast({
        title: 'Добро пожаловать в Bloom!',
        description: 'Ваш аккаунт успешно создан',
      });

      // ✅ Редирект с учетом роли
      if (newUser.role === UserRole.PATIENT) {
        navigate('/patient/onboarding');
      } else {
        const dashboardPath = getRoleDashboardPath(newUser.role);
        navigate(dashboardPath);
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      // Ошибка уже обработана выше
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ НОВОЕ: Восстановление пароля через Supabase
      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        setError(resetError);
        toast({
          title: 'Ошибка',
          description: resetError,
          variant: 'destructive',
        });
        throw new Error(resetError);
      }

      toast({
        title: 'Письмо отправлено',
        description: `Инструкции по восстановлению пароля отправлены на ${email}`,
      });

    } catch (error: any) {
      console.error('Forgot password error:', error);
      // Ошибка уже обработана выше
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string, accessToken?: string, refreshToken?: string): Promise<{ user: User | null }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await authService.updatePassword(newPassword, accessToken, refreshToken);

      if (updateError) {
        setError(updateError);
        toast({
          title: 'Ошибка',
          description: updateError,
          variant: 'destructive',
        });
        throw new Error(updateError);
      }

      // После успешного обновления пароля получаем актуального пользователя
      const { user: updatedUser } = await authService.getCurrentUser();
      
      if (updatedUser) {
        setUser(updatedUser);
      }

      return { user: updatedUser };

    } catch (error: any) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // ✅ НОВОЕ: Выход через Supabase
      const { error } = await authService.logout();
      
      if (error) {
        console.error('Logout error:', error);
      }

      setUser(null);
      // Очищаем все данные localStorage при выходе, включая данные миграции
      localStorage.removeItem('eva-user');
      localStorage.removeItem('eva_user_data');
      localStorage.removeItem('eva_onboarding_data');
      navigate('/');
      
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы',
      });

    } catch (error) {
      console.error('Logout error:', error);
      // Всё равно очищаем локальное состояние
      setUser(null);
      localStorage.removeItem('eva-user');
      localStorage.removeItem('eva_user_data');
      localStorage.removeItem('eva_onboarding_data');
      navigate('/');
    }
  };

  // Функция переключения роли (только для администраторов)
  const switchRole = (newRole: UserRole) => {
    if (!user || user.role !== UserRole.ADMIN) {
      toast({
        title: 'Ошибка',
        description: 'Только администраторы могут переключать роли',
        variant: 'destructive',
      });
      return;
    }

    // Сохраняем оригинального админа при первом переключении
    if (!isTestingRole) {
      setOriginalUser(user);
      setIsTestingRole(true);
    }

    // Создаем тестового пользователя с новой ролью
    const testUser: User = {
      ...user,
      role: newRole,
      firstName: newRole === UserRole.PATIENT ? 'Тест Пациентка' : 
                newRole === UserRole.DOCTOR ? 'Тест Врач' : user.firstName,
      lastName: newRole === UserRole.PATIENT ? 'Админ Режим' : 
               newRole === UserRole.DOCTOR ? 'Админ Режим' : user.lastName,
    };

    setUser(testUser);

    toast({
      title: `Переключение на роль: ${newRole === UserRole.PATIENT ? 'Пациентка' : 'Врач'}`,
      description: 'Вы находитесь в режиме тестирования',
    });

    // Перенаправляем на соответствующую панель
    const dashboardPath = getRoleDashboardPath(newRole);
    navigate(dashboardPath);
  };

  // Complete multi-step registration
  const completeRegistration = async (data: MultiStepRegistrationData): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new user from multi-step registration data
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.step1.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.PATIENT, // Multi-step registration is for patients
        phone: data.step1.phone,
        emailVerified: data.step1.emailVerified,
        phoneVerified: data.step1.phoneVerified,
        registrationCompleted: true,
        onboardingCompleted: false,
        createdAt: new Date()
      };

      setUser(newUser);
      localStorage.setItem('eva-user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      const errorMessage = 'Ошибка завершения регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция возврата к оригинальной роли администратора
  const returnToOriginalRole = () => {
    if (!originalUser || !isTestingRole) {
      return;
    }

    setUser(originalUser);
    setIsTestingRole(false);
    setOriginalUser(null);

    toast({
      title: 'Возврат к роли администратора',
      description: 'Режим тестирования завершен',
    });

    navigate('/admin/dashboard');
  };

  // ✅ ИСПРАВЛЕНО: Синхронное обновление пользователя для онбординга
  const updateUser = (updates: Partial<User>) => {
    if (!user) {
      console.warn('⚠️ updateUser: No authenticated user');
      return;
    }

    console.log('🔄 Updating user with:', updates);
    
    // Синхронно обновляем локальное состояние
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Обновляем localStorage для надежности
    localStorage.setItem('eva-user', JSON.stringify(updatedUser));
    
    // Асинхронно обновляем в Supabase без блокировки UI
    if (user.id && !user.id.startsWith('temp-')) {
      authService.updateProfile(user.id, updates).catch(error => {
        console.error('❌ Failed to sync user update to Supabase:', error);
      });
    }
    
    console.log('✅ User updated locally:', updatedUser);
  };

  // Универсальное сохранение данных пользователя
  const saveUserData = async (key: string, data: any) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Создать уникальный ключ для пользователя
      const userKey = key.includes('_') ? key : `${key}_${user.id}`;
      
      await dataBridge.saveData(userKey, data);
      
      // Обновить локальное состояние если это основные данные пользователя
      if (key === 'user_data' || key === 'eva_user_data') {
        setUser(prev => ({ ...prev, ...data }));
      }
      
      console.log(`✅ AuthContext: Сохранены данные пользователя: ${key}`);
    } catch (error) {
      console.error(`❌ AuthContext: Ошибка сохранения ${key}:`, error);
      throw error;
    }
  };

  // Универсальная загрузка данных пользователя
  const loadUserData = async (key: string) => {
    try {
      if (!user) {
        console.log('AuthContext: Пользователь не авторизован');
        return null;
      }

      const userKey = key.includes('_') ? key : `${key}_${user.id}`;
      const data = await dataBridge.loadData(userKey);
      
      console.log(`📥 AuthContext: Загружены данные пользователя: ${key}`);
      return data;
    } catch (error) {
      console.error(`❌ AuthContext: Ошибка загрузки ${key}:`, error);
      return null;
    }
  };

  // Получить полную сводку данных пользователя
  const getUserDataSummary = async () => {
    try {
      if (!user) return null;
      
      return await dataBridge.getUserDataSummary(user.id);
    } catch (error) {
      console.error('❌ AuthContext: Ошибка получения сводки:', error);
      return null;
    }
  };

  // ✅ УЛУЧШЕНО: Завершение онбординга через Supabase
  const completeOnboarding = async (onboardingData: any): Promise<void> => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setIsLoading(true);
      
      // ✅ НОВОЕ: Сохраняем анализ менопаузы если есть
      let analysis = null;
      if (onboardingData.phaseResult && onboardingData.recommendations) {
        analysis = {
          menopause_phase: onboardingData.phaseResult.phase,
          phase_confidence: onboardingData.phaseResult.confidence || 0.8,
          risk_factors: onboardingData.phaseResult.riskFactors || {},
          recommendations: onboardingData.recommendations
        };
      }
      
      // Завершаем онбординг в Supabase
      const { error } = await onboardingService.completeOnboarding(
        user.id, 
        onboardingData.formData || {}, 
        analysis || undefined
      );
      
      if (error) {
        throw new Error(error);
      }
      
      // ✅ Сохраняем данные геолокации если они есть
      if (onboardingData.formData?.geolocation) {
        console.log('💾 Saving geolocation data from onboarding');
        localStorage.setItem('eva-user-location', JSON.stringify(onboardingData.formData.geolocation));
      }
      
      // Обновляем локальное состояние пользователя
      const onboardingUpdate: Partial<User> = {
        onboardingCompleted: true,
        onboardingData: {
          ...onboardingData,
          completedAt: new Date().toISOString()
        }
      };
      
      const updatedUser = { ...user, ...onboardingUpdate };
      setUser(updatedUser);
      localStorage.setItem('eva-user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Онбординг завершен!',
        description: 'Добро пожаловать в Bloom! Теперь у вас есть доступ ко всем функциям платформы.',
      });
      
      console.log('✅ Onboarding completed successfully', {
        userId: user.id,
        hasGeolocation: !!onboardingData.formData?.geolocation,
        hasAnalysis: !!analysis,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ Error completing onboarding:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при завершении онбординга',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ НОВОЕ: Методы диагностики data flow
  const dataFlowValidator = new DataFlowValidator();

  const validateUserDataIntegrity = () => {
    return dataFlowValidator.runFullDiagnostics();
  };

  const getDataFlowStatus = () => {
    const diagnostics = dataFlowValidator.runFullDiagnostics();
    return diagnostics.stages;
  };

  const repairDataFlow = async (): Promise<boolean> => {
    return await dataFlowValidator.repairDataFlow();
  };

  const exportUserDataDump = () => {
    return dataFlowValidator.exportUserDataDump();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    completeRegistration,
    updateUser,
    completeOnboarding,
    logout,
    forgotPassword,
    updatePassword,
    isLoading,
    error,
    switchRole,
    returnToOriginalRole,
    isTestingRole,
    // DataBridge методы
    saveUserData,
    loadUserData,
    getUserDataSummary,
    validateUserDataIntegrity,
    getDataFlowStatus,
    repairDataFlow,
    exportUserDataDump,
    // Добавляем флаг для определения нужна ли миграция
    needsMigration: user?.id?.startsWith('temp-') || false,
    isAuthenticated: !!user
  };

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </AuthErrorBoundary>
  );
};
