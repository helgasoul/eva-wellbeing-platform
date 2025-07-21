
import { UserRole } from './roles';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: Date;
  onboardingData?: {
    menopausePhase?: string;
    symptoms?: string[];
    lifestyle?: string;
  };
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  registrationCompleted?: boolean;
  onboardingCompleted?: boolean;
  menopausePhase?: string;
  selectedPersona?: PersonaType;
  onboardingPresets?: {
    persona: string;
    userName: string;
    startStep: number;
    user: {
      email: string;
      firstName: string;
      lastName: string;
    };
    consents: {
      terms: boolean;
      privacy: boolean;
    };
  };
}

export type PersonaType = 'first_signs' | 'active_phase' | 'postmenopause';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  completeRegistration: (data: any) => Promise<User>;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: (data: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (data: { password: string; confirmPassword: string }) => Promise<{ user: User }>;
  isLoading: boolean;
  error: string | null;
  switchRole: (role: UserRole) => void;
  returnToOriginalRole: () => void;
  isTestingRole: boolean;
  
  // DataBridge methods
  saveUserData: (data: any) => Promise<void>;
  loadUserData: () => Promise<any>;
  getUserDataSummary: () => Promise<any>;
  
  // Diagnostic methods
  validateUserDataIntegrity: () => any;
  getDataFlowStatus: () => any[];
  repairDataFlow: () => Promise<boolean>;
  exportUserDataDump: () => any;
  
  needsMigration: boolean;
  isAuthenticated: boolean;
}

// Mock schema validation
export const registerSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => ({ success: true, data })
};
