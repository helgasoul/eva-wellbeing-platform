import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, LoginCredentials, RegisterData } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { getRoleDashboardPath } from '@/types/roles';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { onboardingService } from '@/services/onboardingService';
import { supabase } from '@/integrations/supabase/client';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { authRecoveryService } from '@/services/authRecoveryService';
import { asyncJITMigrationService } from '@/services/asyncJITMigration';
import { useCircuitBreaker } from '@/hooks/useCircuitBreaker';
import { authReducer, initialAuthState, AuthState } from '@/types/authState';

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
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const navigate = useNavigate();

  // 🔍 DIAGNOSTIC COUNTERS for race condition detection
  const [initCallCount, setInitCallCount] = useState(0);
  const [authStateChangeCount, setAuthStateChangeCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  // 🔍 DIAGNOSTIC: Debug Supabase state function
  const debugSupabaseState = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('📊 SUPABASE SESSION DEBUG:', {
      hasSession: !!session,
      sessionError: error,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      tokenExpiry: session?.expires_at,
      refreshToken: !!session?.refresh_token,
      timestamp: new Date().toISOString()
    });
    
    // Check user_profiles table
    if (session?.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      console.log('👤 USER PROFILE DEBUG:', {
        profileExists: !!profile,
        profileError: profileError,
        onboardingCompleted: profile?.onboarding_completed,
        userRole: profile?.user_role,
        profileData: profile,
        timestamp: new Date().toISOString()
      });
    }
  };

  // 🔍 DIAGNOSTIC: Log current auth state
  console.log('🔐 AUTH DEBUG - Current State:', {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    initializationComplete: state.initializationComplete,
    sessionRecoveryAttempted: state.sessionRecoveryAttempted,
    retryCount: state.retryCount,
    timestamp: new Date().toISOString()
  });

  // Circuit breaker for retry logic
  const { canExecute, onSuccess, onFailure, isOpen } = useCircuitBreaker(
    state.circuitBreakerState,
    state.retryCount,
    state.lastFailureTime,
    useCallback((newState) => dispatch({ type: 'SET_CIRCUIT_BREAKER_STATE', payload: newState }), []),
    useCallback((time) => dispatch({ type: 'SET_LAST_FAILURE_TIME', payload: time }), [])
  );

  // Stable initialization function
  const initializeAuth = useCallback(async () => {
    if (state.initializationComplete) return;

    // 🔍 DIAGNOSTIC: Track initialization calls
    const currentCount = initCallCount + 1;
    setInitCallCount(currentCount);
    
    console.log('🏃 initializeAuth CALL #', currentCount, 'at:', new Date().toISOString());
    
    if (currentCount > 1) {
      console.warn('⚠️ RACE CONDITION DETECTED: Multiple init calls!', {
        callCount: currentCount,
        currentState: state,
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔐 Starting auth initialization');
    dispatch({ type: 'SET_LOADING', payload: true });

    // 🔍 DIAGNOSTIC: Debug Supabase state before init
    await debugSupabaseState();

    try {
      // Check if circuit breaker allows execution
      if (!canExecute()) {
        console.log('⚡ Circuit breaker is open, skipping initialization');
        dispatch({ type: 'SET_ERROR', payload: 'Система временно недоступна. Попробуйте позже.' });
        return;
      }

      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Found active session');
        const { user } = await authService.getCurrentUser();
        
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
          authRecoveryService.createBackup(user);
          onSuccess();
          console.log('✅ User authenticated successfully');
        } else {
          console.log('⚠️ Session exists but no user profile');
          throw new Error('Failed to load user profile');
        }
      } else {
        console.log('ℹ️ No active session, attempting recovery');
        
        if (!state.sessionRecoveryAttempted) {
          dispatch({ type: 'SET_SESSION_RECOVERY_ATTEMPTED', payload: true });
          
          const recovery = await authRecoveryService.attemptRecovery();
          
          if (recovery.success && recovery.user) {
            console.log(`✅ User recovered from ${recovery.source}`);
            dispatch({ type: 'SET_USER', payload: recovery.user });
            authRecoveryService.createBackup(recovery.user);
            onSuccess();
            
            toast({
              title: 'Сессия восстановлена',
              description: `Данные восстановлены из ${recovery.source}`,
            });
          } else {
            console.log('ℹ️ No recovery options available');
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      }

      onSuccess();
      dispatch({ type: 'RESET_RETRY_COUNT' });
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      
      onFailure();
      dispatch({ type: 'INCREMENT_RETRY_COUNT' });
      
      const errorMessage = error instanceof Error ? error.message : 'Ошибка инициализации';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Attempt recovery on error
      if (!state.sessionRecoveryAttempted) {
        dispatch({ type: 'SET_SESSION_RECOVERY_ATTEMPTED', payload: true });
        
        try {
          const recovery = await authRecoveryService.attemptRecovery();
          if (recovery.success && recovery.user) {
            dispatch({ type: 'SET_USER', payload: recovery.user });
            dispatch({ type: 'SET_ERROR', payload: null });
            console.log('✅ Recovery successful after error');
          }
        } catch (recoveryError) {
          console.error('❌ Recovery failed:', recoveryError);
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZATION_COMPLETE', payload: true });
    }
  }, [state.initializationComplete, state.sessionRecoveryAttempted, canExecute, onSuccess, onFailure]);

  // Initialize auth system
  useEffect(() => {
    console.log('🏗️ AuthProvider MOUNTED - initializeAuth useEffect triggered at:', new Date().toISOString());
    initializeAuth();
    
    return () => {
      console.log('🏗️ AuthProvider initializeAuth useEffect CLEANUP at:', new Date().toISOString());
    };
  }, [initializeAuth]);

  // Auth state change subscription
  useEffect(() => {
    const currentSubCount = subscriptionCount + 1;
    setSubscriptionCount(currentSubCount);
    
    console.log('🔌 AUTH SUBSCRIPTION CREATED #', currentSubCount, 'at:', new Date().toISOString());
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentAuthStateCount = authStateChangeCount + 1;
      setAuthStateChangeCount(currentAuthStateCount);
      
      console.log('🔄 Auth state change #', currentAuthStateCount, ':', { 
        event, 
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        sessionUserEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ SIGNED_IN event - setting timeout for profile load');
        setTimeout(async () => {
          try {
            console.log('📞 Calling authService.getCurrentUser after SIGNED_IN...');
            const { user } = await authService.getCurrentUser();
            console.log('📋 authService.getCurrentUser result:', {
              hasUser: !!user,
              userId: user?.id,
              userEmail: user?.email,
              timestamp: new Date().toISOString()
            });
            
            if (user) {
              dispatch({ type: 'SET_USER', payload: user });
              authRecoveryService.createBackup(user);
              dispatch({ type: 'SET_ERROR', payload: null });
            }
          } catch (error) {
            console.error('❌ Error after sign in:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Ошибка загрузки профиля' });
          }
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 SIGNED_OUT event - clearing user state');
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_ERROR', payload: null });
        authRecoveryService.reset();
      }
    });

    return () => {
      console.log('🔌 AUTH SUBSCRIPTION CLEANUP #', currentSubCount, 'at:', new Date().toISOString());
      subscription.unsubscribe();
    };
  }, [authStateChangeCount, subscriptionCount]);

  // Process queued migrations on network recovery
  useEffect(() => {
    console.log('🌐 Network recovery useEffect setup at:', new Date().toISOString());
    
    const handleOnline = () => {
      console.log('🌐 Network restored, processing queued migrations');
      asyncJITMigrationService.processQueuedMigrations();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      console.log('🌐 Network recovery useEffect cleanup at:', new Date().toISOString());
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // 🔍 DIAGNOSTIC: Track component mount/unmount
  useEffect(() => {
    console.log('🏗️ AuthProvider MOUNTED at:', new Date().toISOString());
    
    // 🔍 DIAGNOSTIC: Check all data sources
    const allDataSources = {
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
      urlParams: new URLSearchParams(window.location.search).toString(),
      currentUrl: window.location.href
    };
    
    console.log('📊 ALL DATA SOURCES ON MOUNT:', allDataSources);
    
    return () => {
      console.log('🏗️ AuthProvider UNMOUNTED at:', new Date().toISOString());
    };
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    dispatch({ type: 'SET_USER', payload: updatedUser });
    authRecoveryService.createBackup(updatedUser);
    
    // Sync with Supabase
    if (state.user.id && !state.user.id.startsWith('temp-')) {
      try {
        await authService.updateProfile(state.user.id, updates);
      } catch (error) {
        console.error('❌ Failed to sync user update:', error);
        toast({
          title: 'Предупреждение',
          description: 'Данные сохранены локально. Синхронизация произойдет при следующем входе.',
          variant: 'destructive',
        });
      }
    }
  }, [state.user]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    console.log('🚀 AuthContext.login START:', {
      email: credentials.email,
      hasPassword: !!credentials.password,
      rememberMe: credentials.rememberMe,
      timestamp: new Date().toISOString()
    });

    if (!canExecute()) {
      throw new Error('Система временно недоступна. Попробуйте позже.');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('📞 Calling authService.login...');
      const { user: authenticatedUser, error: authError } = await authService.login(credentials);
      
      console.log('📋 authService.login result:', {
        hasUser: !!authenticatedUser,
        userId: authenticatedUser?.id,
        userEmail: authenticatedUser?.email,
        hasError: !!authError,
        errorMessage: authError,
        timestamp: new Date().toISOString()
      });

      if (authError) {
        // Check if this might be a JIT migration case
        if (authError.includes('Неверный email или пароль')) {
          dispatch({ type: 'SET_JIT_MIGRATION_IN_PROGRESS', payload: true });
          
          const migrationResult = await asyncJITMigrationService.attemptJITMigration(
            credentials.email, 
            credentials.password
          );
          
          if (migrationResult.success) {
            dispatch({ type: 'SET_USER', payload: migrationResult.user });
            authRecoveryService.createBackup(migrationResult.user);
            onSuccess();
            
            toast({
              title: 'Аккаунт обновлен!',
              description: 'Ваши данные были успешно перенесены в новую систему',
            });
            
            // Redirect user
            if (migrationResult.user.role === UserRole.PATIENT) {
              const onboardingCheck = await onboardingService.isOnboardingComplete(migrationResult.user.id);
              navigate(onboardingCheck.completed ? '/patient/dashboard' : '/patient/onboarding');
            } else {
              navigate(getRoleDashboardPath(migrationResult.user.role));
            }
            
            return;
          } else if (migrationResult.requiresUI) {
            // Let the UI component handle the migration
            dispatch({ type: 'SET_ERROR', payload: 'MIGRATION_REQUIRED' });
            return;
          }
        }
        
        onFailure();
        dispatch({ type: 'SET_ERROR', payload: authError });
        throw new Error(authError);
      }

      if (!authenticatedUser) {
        throw new Error('Не удалось войти в систему');
      }

      dispatch({ type: 'SET_USER', payload: authenticatedUser });
      authRecoveryService.createBackup(authenticatedUser);
      onSuccess();

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });

      // Redirect logic
      if (authenticatedUser.role === UserRole.PATIENT) {
        const onboardingCheck = await onboardingService.isOnboardingComplete(authenticatedUser.id);
        navigate(onboardingCheck.completed ? '/patient/dashboard' : '/patient/onboarding');
      } else {
        navigate(getRoleDashboardPath(authenticatedUser.role));
      }

    } catch (error: any) {
      console.error('❌ AuthContext.login error:', {
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
        authContextState: {
          user: state.user,
          isLoading: state.isLoading,
          error: state.error,
          isAuthenticated: state.isAuthenticated
        }
      });
      
      // 🔍 DIAGNOSTIC: Check localStorage for legacy data
      const legacyData = localStorage.getItem('eva_user_data');
      console.log('🗂️ LEGACY DATA CHECK:', {
        hasLegacyData: !!legacyData,
        legacyEmail: legacyData ? JSON.parse(legacyData).email : null,
        emailMatches: legacyData ? JSON.parse(legacyData).email === credentials.email : false,
        timestamp: new Date().toISOString()
      });
      
      onFailure();
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_JIT_MIGRATION_IN_PROGRESS', payload: false });
    }
  }, [canExecute, onSuccess, onFailure, navigate]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    if (!canExecute()) {
      throw new Error('Система временно недоступна. Попробуйте позже.');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { user: newUser, error: authError } = await authService.register(data);

      if (authError) {
        onFailure();
        dispatch({ type: 'SET_ERROR', payload: authError });
        throw new Error(authError);
      }

      if (!newUser) {
        throw new Error('Не удалось создать аккаунт');
      }

      dispatch({ type: 'SET_USER', payload: newUser });
      authRecoveryService.createBackup(newUser);
      onSuccess();

      toast({
        title: 'Добро пожаловать в без | паузы!',
        description: 'Ваш аккаунт успешно создан',
      });

      // Redirect logic
      if (newUser.role === UserRole.PATIENT) {
        navigate('/patient/onboarding');
      } else {
        navigate(getRoleDashboardPath(newUser.role));
      }

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      onFailure();
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [canExecute, onSuccess, onFailure, navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: 'RESET_AUTH_STATE' });
      authRecoveryService.reset();
      navigate('/');
      
      toast({
        title: 'До свидания!',
        description: 'Вы успешно вышли из системы',
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      dispatch({ type: 'RESET_AUTH_STATE' });
      navigate('/');
    }
  }, [navigate]);

  const forgotPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error: resetError } = await authService.resetPassword(email);

      if (resetError) {
        dispatch({ type: 'SET_ERROR', payload: resetError });
        throw new Error(resetError);
      }

      toast({
        title: 'Письмо отправлено',
        description: `Инструкции по восстановлению пароля отправлены на ${email}`,
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePassword = async (newPassword: string, accessToken?: string, refreshToken?: string): Promise<{ user: User | null }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error: updateError } = await authService.updatePassword(newPassword, accessToken, refreshToken);

      if (updateError) {
        dispatch({ type: 'SET_ERROR', payload: updateError });
        throw new Error(updateError);
      }

      const { user: updatedUser } = await authService.getCurrentUser();
      
      if (updatedUser) {
        dispatch({ type: 'SET_USER', payload: updatedUser });
        authRecoveryService.createBackup(updatedUser);
      }

      return { user: updatedUser };
    } catch (error: any) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeOnboarding = async (onboardingData: any): Promise<void> => {
    if (!state.user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
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
      
      const { error } = await onboardingService.completeOnboarding(
        state.user.id, 
        onboardingData.formData || {}, 
        analysis || undefined
      );
      
      if (error) {
        throw new Error(error);
      }
      
      if (onboardingData.formData?.geolocation) {
        localStorage.setItem('eva-user-location', JSON.stringify(onboardingData.formData.geolocation));
      }
      
      const onboardingUpdate: Partial<User> = {
        onboardingCompleted: true,
        onboardingData: {
          ...onboardingData,
          completedAt: new Date().toISOString()
        }
      };
      
      const updatedUser = { ...state.user, ...onboardingUpdate };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      authRecoveryService.createBackup(updatedUser);
      
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
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Placeholder methods for compatibility
  const completeRegistration = async (data: any): Promise<User> => {
    throw new Error('Multi-step registration not implemented');
  };

  const switchRole = (role: UserRole) => {
    console.log('Role switching not available');
  };

  const returnToOriginalRole = () => {
    console.log('Role switching not available');
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
      hasData: !!state.user,
      summary: {
        onboardingCompleted: state.user?.onboardingCompleted || false,
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
    return { user: state.user, timestamp: new Date().toISOString() };
  };

  const value: AuthContextType = {
    user: state.user,
    login,
    register,
    completeRegistration,
    updateUser,
    completeOnboarding,
    logout,
    forgotPassword,
    updatePassword,
    isLoading: state.isLoading,
    error: state.error,
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
    isAuthenticated: state.isAuthenticated
  };

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </AuthErrorBoundary>
  );
};
