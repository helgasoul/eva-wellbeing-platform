import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProviderSafe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ ИЗ localStorage
  useEffect(() => {
    console.log('🔍 AuthContextSafe: Checking for saved user...');
    const savedUser = localStorage.getItem('eva_user');
    const savedToken = localStorage.getItem('eva_auth_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ AuthContextSafe: Found saved user:', parsedUser.email);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ AuthContextSafe: Error loading saved user:', error);
        localStorage.removeItem('eva_user');
        localStorage.removeItem('eva_auth_token');
      }
    } else {
      console.log('ℹ️ AuthContextSafe: No saved user found');
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔍 AuthContextSafe: Login attempt for:', email);
    setIsLoading(true);
    try {
      // ПРОСТАЯ ИМИТАЦИЯ ВХОДА
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: 'user_' + Date.now(),
        email,
        firstName: 'Пользователь',
        lastName: 'Тест',
        role: 'patient',
        isVerified: true
      };

      localStorage.setItem('eva_user', JSON.stringify(newUser));
      localStorage.setItem('eva_auth_token', 'token_' + Date.now());
      setUser(newUser);
      console.log('✅ AuthContextSafe: Login successful');
    } catch (error) {
      console.error('❌ AuthContextSafe: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🔍 AuthContextSafe: Logging out user');
    localStorage.removeItem('eva_user');
    localStorage.removeItem('eva_auth_token');
    setUser(null);
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  console.log('🔍 AuthContextSafe: Context value:', {
    hasUser: !!user,
    userRole: user?.role,
    isAuthenticated: !!user,
    isLoading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSafe must be used within an AuthProviderSafe');
  }
  return context;
};