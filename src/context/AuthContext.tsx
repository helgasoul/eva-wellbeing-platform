
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, LoginCredentials, RegisterData, UserRole, MultiStepRegistrationData } from '@/types/auth';
import { getRoleDashboardPath } from '@/types/roles';
import { toast } from '@/hooks/use-toast';
import { DataFlowValidator } from '@/services/dataFlowValidator';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing user on mount and redirect based on onboarding status
  useEffect(() => {
    const savedUser = localStorage.getItem('eva-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // ✅ НОВОЕ: Проверка статуса онбординга при входе в приложение
        if (parsedUser.role === UserRole.PATIENT) {
          if (parsedUser.onboardingCompleted) {
            console.log('✅ User authenticated with completed onboarding - redirecting to dashboard');
            // Пользователь завершил онбординг, можем редиректить на дашборд
            // Редирект будет происходить через компоненты, здесь только логирование
          } else {
            console.log('🔄 User authenticated but onboarding not completed - need onboarding');
            // Пользователь не завершил онбординг, нужно показать онбординг
            // Это будет обработано в OnboardingGuard
          }
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('eva-user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      let mockUser: User;

      // Проверяем админские credentials
      if (credentials.email === ADMIN_CREDENTIALS.email && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        mockUser = {
          id: 'admin-001',
          email: ADMIN_CREDENTIALS.email,
          firstName: 'Администратор',
          lastName: 'Eva Platform',
          role: UserRole.ADMIN,
          createdAt: new Date()
        };
      } else {
        // Mock обычный login
        mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: credentials.email,
          firstName: credentials.email.includes('doctor') ? 'Доктор' : 'Анна',
          lastName: credentials.email.includes('doctor') ? 'Петрова' : 'Иванова',
          role: credentials.email.includes('doctor') ? UserRole.DOCTOR : UserRole.PATIENT,
          createdAt: new Date(),
          // ✅ НОВОЕ: Симулируем статус онбординга для демонстрации
          onboardingCompleted: credentials.email.includes('completed'),
          registrationCompleted: true
        };
      }

      setUser(mockUser);
      
      // Save to localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('eva-user', JSON.stringify(mockUser));
      }

      toast({
        title: 'Добро пожаловать!',
        description: mockUser.role === UserRole.ADMIN ? 
          'Добро пожаловать в админ-панель Eva!' : 
          'Вы успешно вошли в систему',
      });

      // ✅ УЛУЧШЕНО: Редирект с учетом статуса онбординга
      if (mockUser.role === UserRole.PATIENT) {
        if (mockUser.onboardingCompleted) {
          navigate('/patient/dashboard');
        } else {
          navigate('/patient/onboarding');
        }
      } else {
        const dashboardPath = getRoleDashboardPath(mockUser.role);
        navigate(dashboardPath);
      }
    } catch (error) {
      const errorMessage = 'Ошибка входа в систему';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Mock successful registration
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: new Date(),
        // ✅ НОВОЕ: Устанавливаем статус регистрации и онбординга
        registrationCompleted: true,
        onboardingCompleted: false // Новые пользователи должны пройти онбординг
      };

      setUser(mockUser);
      localStorage.setItem('eva-user', JSON.stringify(mockUser));

      toast({
        title: 'Добро пожаловать в Eva!',
        description: 'Ваш аккаунт успешно создан',
      });

      // ✅ УЛУЧШЕНО: Редирект с учетом статуса онбординга для новых пользователей
      if (mockUser.role === UserRole.PATIENT) {
        // Новые пациентки должны пройти онбординг
        navigate('/patient/onboarding');
      } else {
        const dashboardPath = getRoleDashboardPath(mockUser.role);
        navigate(dashboardPath);
      }
    } catch (error) {
      const errorMessage = 'Ошибка создания аккаунта';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Письмо отправлено',
        description: `Инструкции по восстановлению пароля отправлены на ${email}`,
      });
    } catch (error) {
      const errorMessage = 'Ошибка отправки письма';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eva-user');
    navigate('/');
    toast({
      title: 'До свидания!',
      description: 'Вы успешно вышли из системы',
    });
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

  // ✅ НОВОЕ: Обновление пользователя
  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setIsLoading(true);
      
      // Обновляем пользователя в состоянии
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Сохраняем в localStorage
      localStorage.setItem('eva-user', JSON.stringify(updatedUser));
      
      console.log('✅ User updated successfully:', updates);
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ УЛУЧШЕНО: Завершение онбординга с сохранением геолокации
  const completeOnboarding = async (onboardingData: any): Promise<void> => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      setIsLoading(true);
      
      // Сохраняем дополнительные данные из онбординга
      const onboardingUpdate: Partial<User> = {
        onboardingCompleted: true,
        onboardingData: {
          ...onboardingData,
          completedAt: new Date().toISOString()
        }
      };
      
      // ✅ НОВОЕ: Сохраняем данные геолокации если они есть
      if (onboardingData.formData?.geolocation) {
        console.log('💾 Saving geolocation data from onboarding');
        localStorage.setItem('eva-user-location', JSON.stringify(onboardingData.formData.geolocation));
      }
      
      // Обновляем статус онбординга
      await updateUser(onboardingUpdate);
      
      toast({
        title: 'Онбординг завершен!',
        description: 'Добро пожаловать в Eva! Теперь у вас есть доступ ко всем функциям платформы.',
      });
      
      console.log('✅ Onboarding completed successfully', {
        userId: user.id,
        hasGeolocation: !!onboardingData.formData?.geolocation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
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
    isLoading,
    error,
    switchRole,
    returnToOriginalRole,
    isTestingRole,
    validateUserDataIntegrity,
    getDataFlowStatus,
    repairDataFlow,
    exportUserDataDump,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
