
import React, { createContext, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { unifiedDataBridge } from '@/services/UnifiedDataBridge';

// Test user data for m4p version
const TEST_USER: User = {
  id: 'test-user-123',
  email: 'test@eva-platform.ru',
  role: UserRole.PATIENT,
  firstName: 'Анна',
  lastName: 'Тестова',
  avatar: undefined,
  createdAt: new Date('2024-01-01'),
  onboardingData: {
    menopausePhase: 'active_phase',
    symptoms: ['приливы', 'бессонница', 'перепады настроения'],
    lifestyle: 'active'
  },
  phone: '+7 999 123 45 67',
  emailVerified: true,
  phoneVerified: true,
  registrationCompleted: true,
  onboardingCompleted: true,
  menopausePhase: 'active_phase',
  selectedPersona: 'active_phase',
  onboardingPresets: {
    persona: 'active_phase',
    userName: 'Анна',
    startStep: 4,
    user: {
      email: 'test@eva-platform.ru',
      firstName: 'Анна',
      lastName: 'Тестова'
    },
    consents: {
      terms: true,
      privacy: true
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Simplified context that always returns the test user
  const contextValue: AuthContextType = {
    user: TEST_USER,
    login: async () => {
      // No-op for m4p version
    },
    register: async () => {
      // No-op for m4p version
    },
    completeRegistration: async () => TEST_USER,
    updateUser: (data: Partial<User>) => {
      // Update the onboardingData if provided
      if (data.onboardingData) {
        Object.assign(TEST_USER.onboardingData || {}, data.onboardingData);
      }
      // Update other user fields
      Object.assign(TEST_USER, data);
    },
    completeOnboarding: async () => {
      // No-op for m4p version
    },
    logout: () => {
      // No-op for m4p version
    },
    forgotPassword: async () => {
      // No-op for m4p version
    },
    updatePassword: async () => ({ user: TEST_USER }),
    isLoading: false,
    error: null,
    switchRole: () => {
      // No-op for m4p version
    },
    returnToOriginalRole: () => {
      // No-op for m4p version
    },
    isTestingRole: false,
    
    // Updated DataBridge methods with unified interface
    saveUserData: async (keyOrData: string | any, data?: any) => {
      if (typeof keyOrData === 'string' && data !== undefined) {
        await unifiedDataBridge.saveUserData(keyOrData, data);
      } else {
        await unifiedDataBridge.saveUserData(keyOrData);
      }
    },
    
    loadUserData: async (key?: string) => {
      return await unifiedDataBridge.loadUserData(key);
    },
    
    getUserDataSummary: async () => {
      return await unifiedDataBridge.getUserDataSummary();
    },
    
    // Diagnostic methods
    validateUserDataIntegrity: () => unifiedDataBridge.validateUserDataIntegrity(),
    getDataFlowStatus: () => unifiedDataBridge.getDataFlowStatus(),
    repairDataFlow: async () => await unifiedDataBridge.repairDataFlow(),
    exportUserDataDump: () => unifiedDataBridge.exportUserDataDump(),
    
    needsMigration: false,
    isAuthenticated: true
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
