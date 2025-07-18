
import { z } from 'zod';
import { UserRole } from '@/types/roles';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  onboardingData?: any;
  
  // Новые поля из многоэтапной регистрации
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  registrationCompleted?: boolean;
  onboardingCompleted?: boolean;
  
  // ✅ ДОБАВЛЕНО: Поля для персонализации и пресетов
  menopausePhase?: string;
  selectedPersona?: string;
  onboardingPresets?: OnboardingPresets;
}

// ✅ ДОБАВЛЕНО: Типизация для OnboardingPresets  
export interface OnboardingPresets {
  persona: string;
  userName: string;
  startStep: number;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  consents?: {
    terms: boolean;
    privacy: boolean;
  };
}

export interface UserDataSummary {
  hasData: boolean;
  summary: {
    onboardingCompleted: boolean;
    symptomEntries: any[];
    nutritionEntries: any[];
    aiChatHistory: any[];
    weatherData: any[];
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

// Enhanced password validation function that will be used in schemas
const createPasswordValidator = (fieldName: string = 'password') => {
  return z.string()
    .min(1, `${fieldName} обязателен`)
    .refine(async (password) => {
      // Basic validation for immediate feedback
      if (password.length < 8) return false;
      if (!/[A-Z]/.test(password)) return false;
      if (!/[a-z]/.test(password)) return false;
      if (!/\d/.test(password)) return false;
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
      return true;
    }, {
      message: 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы'
    });
};

// Схемы валидации Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .min(2, 'Фамилия должна содержать минимум 2 символа'),
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: createPasswordValidator(),
  confirmPassword: z
    .string()
    .min(1, 'Подтвердите пароль'),
  role: z.nativeEnum(UserRole, {
    required_error: 'Выберите роль',
  }),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'Необходимо согласиться с условиями использования'),
  agreeToPrivacy: z
    .boolean()
    .refine(val => val === true, 'Необходимо согласиться с политикой конфиденциальности'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

// Schema for password reset
export const resetPasswordSchema = z.object({
  password: createPasswordValidator('Новый пароль'),
  confirmPassword: z
    .string()
    .min(1, 'Подтвердите новый пароль'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

// Schema for password change
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Введите текущий пароль'),
  newPassword: createPasswordValidator('Новый пароль'),
  confirmPassword: z
    .string()
    .min(1, 'Подтвердите новый пароль'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Новый пароль должен отличаться от текущего',
  path: ['newPassword'],
});

// Выведенные типы из схем Zod
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Устаревшие интерфейсы для совместимости
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

// Multi-step registration data
export interface MultiStepRegistrationData {
  step1: {
    email: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  step2: {
    gdpr_basic: boolean;
    medical_data: boolean;
    ai_analysis: boolean;
    research_participation: boolean;
    marketing_communications: boolean;
  };
  step3: {
    personaId: string;
    additionalData: Record<string, string>;
  };
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  completeRegistration: (data: MultiStepRegistrationData) => Promise<User>;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (onboardingData: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string, accessToken?: string, refreshToken?: string) => Promise<{ user: User | null }>;
  isLoading: boolean;
  error: string | null;
  switchRole: (role: UserRole) => void;
  returnToOriginalRole: () => void;
  isTestingRole: boolean;
  
  // DataBridge методы
  saveUserData: (key: string, data: any) => Promise<void>;
  loadUserData: (key: string) => Promise<any>;
  getUserDataSummary: () => Promise<any>;
  
  // Методы диагностики data flow
  validateUserDataIntegrity: () => any;
  getDataFlowStatus: () => any[];
  repairDataFlow: () => Promise<boolean>;
  exportUserDataDump: () => any;
  
  // Добавляем флаг для определения нужна ли миграция
  needsMigration: boolean;
  isAuthenticated: boolean;
}
