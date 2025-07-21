
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
    // New fields to accommodate onboarding summary
    phaseResult?: any;
    recommendations?: any;
    formData?: any;
    completedAt?: string;
    version?: string;
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
  rememberMe?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginCredentials {
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

export interface RegisterData {
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
  
  // Updated DataBridge methods with overloaded signatures
  saveUserData: {
    (key: string, data: any): Promise<void>;
    (data: any): Promise<void>;
  };
  loadUserData: (key?: string) => Promise<any>;
  getUserDataSummary: () => Promise<any>;
  
  // Diagnostic methods
  validateUserDataIntegrity: () => any;
  getDataFlowStatus: () => any[];
  repairDataFlow: () => Promise<boolean>;
  exportUserDataDump: () => any;
  
  needsMigration: boolean;
  isAuthenticated: boolean;
}

export interface SafeUserData {
  selectedPersona: PersonaType | null;
  onboardingPresets: OnboardingPresets | null;
  hasValidPersona: boolean;
  hasValidPresets: boolean;
}

export interface OnboardingPresets {
  persona: {
    id: string;
    name: string;
  };
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
  onboardingConfig?: {
    estimatedDuration?: string;
    prefilledSections?: string[];
  };
}

// Mock schema validation
export const registerSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => ({ success: true, data }),
  _type: 'ZodType',
  _output: {},
  _input: {},
  _def: {}
};

export const loginSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => ({ success: true, data }),
  _type: 'ZodType',
  _output: {},
  _input: {},
  _def: {}
};

export const resetPasswordSchema = {
  parse: (data: any) => data,
  safeParse: (data: any) => ({ success: true, data }),
  _type: 'ZodType',
  _output: {},
  _input: {},
  _def: {}
};
