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
  const navigate = useNavigate();

  // Initialize auth state with enhanced monitoring
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('🔐 Initializing authentication...');
        
        // Get current user from Supabase with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log('📊 Session status:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          environment: window.location.hostname
        });
        
        if (session?.user) {
          // Get user profile data
          console.log('👤 Fetching user profile...');
          const { user: currentUser } = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            console.log('✅ User authenticated via Supabase', { 
              email: currentUser.email,
              role: currentUser.role,
              id: currentUser.id
            });
          }
        } else {
          console.log('ℹ️ No active session found');
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setError('Ошибка инициализации авторизации');
        
        // Try to clear potentially corrupted session data
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Failed to clear session:', signOutError);
        }
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();

    // Subscribe to auth state changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { 
        event, 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('👤 Processing sign in...');
          const { user: authenticatedUser } = await authService.getCurrentUser();
          if (authenticatedUser) {
            setUser(authenticatedUser);
            setError(null); // Clear any previous errors
            console.log('✅ User logged in successfully', { 
              email: authenticatedUser.email,
              role: authenticatedUser.role
            });
          }
        } catch (error) {
          console.error('❌ Error getting user profile after sign in:', error);
          setError('Ошибка получения профиля пользователя');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
        console.log('👋 User logged out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
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

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });

      // Redirect based on role and onboarding status
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

      toast({
        title: 'Добро пожаловать в Bloom!',
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

  const updateUser = (updates: Partial<User>) => {
    if (!user) {
      console.warn('⚠️ updateUser: No authenticated user');
      return;
    }

    console.log('Updating user', { updates });
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Async update to Supabase without blocking UI
    if (user.id && !user.id.startsWith('temp-')) {
      authService.updateProfile(user.id, updates).catch(error => {
        console.error('❌ Failed to sync user update to Supabase:', error);
      });
    }
    
    console.log('User updated locally', { userId: updatedUser.id });
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

  // Simplified methods for compatibility
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
    updateUser,
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