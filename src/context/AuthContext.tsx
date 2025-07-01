
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, LoginCredentials, RegisterData } from '@/types/auth';
import { UserRole, getRoleDashboardPath } from '@/types/roles';
import { toast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('eva-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
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

      // Mock successful login with role-based user data
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        firstName: credentials.email.includes('doctor') ? 'Доктор' : 'Анна',
        lastName: credentials.email.includes('doctor') ? 'Петрова' : 'Иванова',
        role: credentials.email.includes('doctor') ? UserRole.DOCTOR : 
              credentials.email.includes('admin') ? UserRole.ADMIN : UserRole.PATIENT,
        createdAt: new Date()
      };

      setUser(mockUser);
      
      // Save to localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('eva-user', JSON.stringify(mockUser));
      }

      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });

      // Redirect to role-specific dashboard
      const dashboardPath = getRoleDashboardPath(mockUser.role);
      navigate(dashboardPath);
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
        createdAt: new Date()
      };

      setUser(mockUser);
      localStorage.setItem('eva-user', JSON.stringify(mockUser));

      toast({
        title: 'Добро пожаловать в Eva!',
        description: 'Ваш аккаунт успешно создан',
      });

      // Redirect to role-specific dashboard
      const dashboardPath = getRoleDashboardPath(mockUser.role);
      navigate(dashboardPath);
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

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
