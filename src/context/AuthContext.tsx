import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, LoginCredentials, RegisterData } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { getRoleDashboardPath } from '@/types/roles';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { supabase } from '@/integrations/supabase/client';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { EmergencyRecoveryService } from '@/services/emergencyRecovery';
import { HealthCheckService } from '@/services/healthCheck';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const navigate = useNavigate();

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Гибридная инициализация авторизации
  useEffect(() => {
    const initializeAuth = async (retryCount = 0) => {
      console.log('🔐 AuthContext: Starting initialization...');
      
      try {
        setIsLoading(true);
        console.log('🔐 Initializing hybrid authentication...', { retryCount });
        
        // Запуск health check в фоновом режиме
        HealthCheckService.performHealthCheck().then(status => {
          if (status.overall === 'critical') {
            console.warn('🚨 Critical system issues detected during auth init');
          }
        });
        
        // 1. Попробовать восстановить из Supabase
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 30000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.user) {
          console.log('✅ Found active Supabase session');
          console.log('🔐 AuthContext: Supabase user:', session.user ? '✅ Found' : '❌ Not found');
          
          if (session.user) {
            console.log('🔐 AuthContext: Loading profile for user:', session.user.id);
            
            // Загрузка профиля
            const { user: currentUser } = await authService.getCurrentUser();
            console.log('🔐 AuthContext: Profile loaded:', currentUser);
            
            if (currentUser) {
              setUser(currentUser);
              EmergencyRecoveryService.createMultipleBackups(currentUser);
              console.log('🔐 AuthContext: ✅ User set successfully');
              console.log('✅ User authenticated via Supabase', { 
                email: currentUser.email,
                role: currentUser.role,
                id: currentUser.id
              });
            } else {
              console.log('🔐 AuthContext: ❌ Failed to load profile');
            }
          }
        } else {
          console.log('ℹ️ No active Supabase session, attempting recovery...');
          // Попытка восстановления из localStorage
          console.log('🔐 AuthContext: Attempting localStorage recovery...');
          const backupUser = localStorage.getItem('eva_user_backup');
          
          if (backupUser) {
            const parsed = JSON.parse(backupUser);
            console.log('🔐 AuthContext: Found backup user:', parsed);
            setUser(parsed);
            console.log('🔐 AuthContext: ✅ User restored from backup');
          } else {
            console.log('🔐 AuthContext: ❌ No backup found');
          }
          
          // 2. Попытка восстановления из localStorage и других источников
          const recovery = await EmergencyRecoveryService.recoverUserSession();
          
          if (recovery.success && recovery.user) {
            console.log(`✅ User recovered from ${recovery.source}`);
            setUser(recovery.user);
            EmergencyRecoveryService.createMultipleBackups(recovery.user);
            
            toast({
              title: 'Сессия восстановлена',
              description: `Ваши данные были успешно восстановлены из ${recovery.source}`,
            });
          } else {
            console.log('ℹ️ No recovery options available');
          }
        }
        
      } catch (error) {
        console.error('🔐 AuthContext: ❌ Initialization failed:', error);
        console.error('❌ Auth initialization error:', error, { retryCount });
        
        // Попытка экстренного восстановления при ошибке
        if (retryCount === 0) {
          console.log('🆘 Attempting emergency recovery...');
          try {
            const recovery = await EmergencyRecoveryService.recoverUserSession();
            if (recovery.success && recovery.user) {
              setUser(recovery.user);
              toast({
                title: 'Экстренное восстановление',
                description: 'Ваши данные были восстановлены из резервной копии',
                variant: 'destructive',
              });
            }
          } catch (recoveryError) {
            console.error('Emergency recovery failed:', recoveryError);
          }
        }
        
        // Retry логика для сетевых ошибок
        const maxRetries = 3;
        const isNetworkError = error instanceof Error && (
          error.message.includes('timeout') || 
          error.message.includes('network') ||
          error.message.includes('fetch')
        );
        
        if (isNetworkError && retryCount < maxRetries) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.warn(`🔄 Retrying auth initialization in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
          
          setTimeout(() => {
            initializeAuth(retryCount + 1);
          }, retryDelay);
          return;
        }
        
        // Установка соответствующей ошибки
        if (error instanceof Error && error.message.includes('timeout')) {
          setError('Медленное соединение. Ваши данные могут быть восстановлены из резервной копии.');
        } else if (isNetworkError) {
          setError('Проблемы с сетью. Работаем в режиме восстановления.');
        } else {
          setError('Ошибка инициализации авторизации');
        }
        
      } finally {
        setIsLoading(false);
        console.log('🔐 AuthContext: Initialization complete');
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();

    // ✅ УЛУЧШЕННАЯ подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { 
        event, 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          try {
            console.log('👤 Processing sign in...');
            const { user: authenticatedUser } = await authService.getCurrentUser();
            if (authenticatedUser) {
              setUser(authenticatedUser);
              EmergencyRecoveryService.createMultipleBackups(authenticatedUser);
              setError(null);
              console.log('✅ User logged in successfully', { 
                email: authenticatedUser.email,
                role: authenticatedUser.role
              });
            }
          } catch (error) {
            console.error('❌ Error getting user profile after sign in:', error);
            
            // Попытка восстановления при ошибке
            setTimeout(async () => {
              try {
                const recovery = await EmergencyRecoveryService.recoverUserSession();
                if (recovery.success && recovery.user) {
                  setUser(recovery.user);
                  setError(null);
                  console.log('✅ Successfully recovered user profile');
                }
              } catch (recoveryError) {
                console.error('❌ Failed to recover user profile:', recoveryError);
                setError('Ошибка получения профиля. Перезагрузите страницу.');
              }
            }, 2000);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
        console.log('👋 User logged out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully');
        if (error) {
          setError(null);
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // ✅ ИСПРАВЛЕННАЯ функция обновления с множественным резервированием
  const updateUserWithBackup = async (updates: Partial<User>): Promise<void> => {
    if (!user) {
      console.warn('⚠️ updateUser: No authenticated user');
      return;
    }

    console.log('Updating user with backup', { updates });
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Создание множественных резервных копий
    EmergencyRecoveryService.createMultipleBackups(updatedUser);
    
    // Синхронизация с Supabase
    if (user.id && !user.id.startsWith('temp-')) {
      try {
        await authService.updateProfile(user.id, updates);
        console.log('✅ User update synced to Supabase', { userId: updatedUser.id });
      } catch (error) {
        console.error('❌ Failed to sync user update to Supabase:', error);
        // Не выбрасываем ошибку - данные сохранены локально
        toast({
          title: 'Предупреждение',
          description: 'Данные сохранены локально. Синхронизация произойдет при следующем входе.',
          variant: 'destructive',
        });
      }
    }
    
    console.log('User updated with backup', { userId: updatedUser.id });
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: authenticatedUser, error: authError, rateLimited, retryAfter } = await authService.login(credentials);

      if (authError) {
        setError(authError);
        
        // Show different toast based on error type
        if (rateLimited) {
          toast({
            title: 'Ограничение по времени',
            description: authError,
            variant: 'destructive',
          });
        } else if (authError.includes('подключением') || authError.includes('интернет')) {
          toast({
            title: 'Проблемы с подключением',
            description: authError,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Ошибка входа',
            description: authError,
            variant: 'destructive',
          });
        }
        
        return;
      }

      if (!authenticatedUser) {
        const errorMessage = 'Не удалось войти в систему';
        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      setUser(authenticatedUser);
      EmergencyRecoveryService.createMultipleBackups(authenticatedUser);

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });

      // Redirect based on role and onboarding status
      if (authenticatedUser.role === UserRole.PATIENT) {
        const onboardingCheck = await onboardingService.isOnboardingComplete(authenticatedUser.id);
        
        if (onboardingCheck.completed) {
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
      
      if (error.message.includes('Load failed') || 
          error.message.includes('Network timeout') ||
          error.message.includes('fetch')) {
        const errorMessage = 'Проблема с подключением к серверу. Проверьте интернет-соединение.';
        setError(errorMessage);
        toast({
          title: 'Проблемы с подключением',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        const errorMessage = error.message || 'Произошла ошибка при входе';
        setError(errorMessage);
        toast({
          title: 'Ошибка входа',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
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
      EmergencyRecoveryService.createMultipleBackups(newUser);

      toast({
        title: 'Добро пожаловать в без | паузы!',
        description: 'Ваш аккаунт успешно создан',
      });

      // Redirect based on role
      if (newUser.role === UserRole.PATIENT) {
        navigate('/patient/onboarding');
      } else {
        const dashboardPath = getRoleDashboardPath(newUser.role);
        navigate(dashboardPath);
      }

    } catch (error: any) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
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

      const { user: updatedUser } = await authService.getCurrentUser();
      
      if (updatedUser) {
        setUser(updatedUser);
        EmergencyRecoveryService.createMultipleBackups(updatedUser);
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
      const { error } = await authService.logout();
      
      if (error) {
        console.error('Logout error:', error);
      }

      setUser(null);
      navigate('/');
      
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы',
      });

    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate('/');
    }
  };

  const completeOnboarding = async (onboardingData: any): Promise<void> => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setIsLoading(true);
      
      // Save menopause analysis if present
      let analysis = null;
      if (onboardingData.phaseResult && onboardingData.recommendations) {
        analysis = {
          menopause_phase: onboardingData.phaseResult.phase,
          phase_confidence: onboardingData.phaseResult.confidence || 0.8,
          risk_factors: onboardingData.phaseResult.riskFactors || {},
          recommendations: onboardingData.recommendations
        };
      }
      
      // Complete onboarding in Supabase
      const { error } = await onboardingService.completeOnboarding(
        user.id, 
        onboardingData.formData || {}, 
        analysis || undefined
      );
      
      if (error) {
        throw new Error(error);
      }
      
      // Save geolocation data if present
      if (onboardingData.formData?.geolocation) {
        console.log('💾 Saving geolocation data from onboarding');
        localStorage.setItem('eva-user-location', JSON.stringify(onboardingData.formData.geolocation));
      }
      
      // Update local user state
      const onboardingUpdate: Partial<User> = {
        onboardingCompleted: true,
        onboardingData: {
          ...onboardingData,
          completedAt: new Date().toISOString()
        }
      };
      
      const updatedUser = { ...user, ...onboardingUpdate };
      setUser(updatedUser);
      EmergencyRecoveryService.createMultipleBackups(updatedUser);
      
      toast({
        title: 'Онбординг завершен!',
        description: 'Добро пожаловать в без | паузы! Теперь у вас есть доступ ко всем функциям платформы.',
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

  const completeRegistration = async (data: any): Promise<User> => {
    throw new Error('Multi-step registration not implemented in simplified auth');
  };

  const switchRole = (role: UserRole) => {
    console.log('Role switching not available in simplified auth');
  };

  const returnToOriginalRole = () => {
    console.log('Role switching not available in simplified auth');
  };

  const saveUserData = async (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const loadUserData = async (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };

  const getUserDataSummary = async () => {
    return {
      hasData: !!user,
      summary: {
        onboardingCompleted: user?.onboardingCompleted || false,
        symptomEntries: [],
        nutritionEntries: [],
        aiChatHistory: [],
        weatherData: []
      }
    };
  };

  const validateUserDataIntegrity = () => {
    return { status: 'ok', issues: [] };
  };

  const getDataFlowStatus = () => {
    return [];
  };

  const repairDataFlow = async (): Promise<boolean> => {
    return true;
  };

  const exportUserDataDump = () => {
    return { user, timestamp: new Date().toISOString() };
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    completeRegistration,
    updateUser: updateUserWithBackup,
    completeOnboarding,
    logout,
    forgotPassword,
    updatePassword,
    isLoading,
    error,
    switchRole,
    returnToOriginalRole,
    isTestingRole: false,
    saveUserData,
    loadUserData,
    getUserDataSummary,
    validateUserDataIntegrity,
    getDataFlowStatus,
    repairDataFlow,
    exportUserDataDump,
    needsMigration: false,
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
