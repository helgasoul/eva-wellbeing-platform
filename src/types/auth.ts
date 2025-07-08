
import { z } from 'zod';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  onboardingData?: any;
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

// Схемы валидации Zod
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
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
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
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

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
