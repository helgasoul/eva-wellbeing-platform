// ✅ ЭТАП 2: Безопасная конфигурация аутентификации
import { UserRole } from '@/types/roles';

// Интерфейс для конфигурации администратора
interface AdminConfig {
  email: string;
  password: string;
}

// Интерфейс для тестовых пользователей
interface TestUserConfig {
  patient: {
    email: string;
    name: { first: string; last: string };
  };
  doctor: {
    email: string;
    name: { first: string; last: string };
  };
  admin: {
    email: string;
    name: { first: string; last: string };
  };
}

// ✅ Безопасная загрузка админских credentials
const getAdminCredentials = (): AdminConfig | null => {
  // Проверяем наличие переменных окружения (в production)
  const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  
  if (envEmail && envPassword) {
    return {
      email: envEmail,
      password: envPassword
    };
  }
  
  // ✅ Fallback для development/demo режима
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return {
      email: 'admin@eva-platform.com',
      password: 'EvaAdmin2025!'
    };
  }
  
  // В production без env переменных - отключаем админский вход
  return null;
};

// ✅ Безопасная конфигурация тестовых пользователей  
const getTestUsersConfig = (): TestUserConfig => {
  const baseConfig: TestUserConfig = {
    patient: {
      email: 'test-patient@eva.com',
      name: { first: 'Тест', last: 'Пациент' }
    },
    doctor: {
      email: 'test-doctor@eva.com', 
      name: { first: 'Тест', last: 'Врач' }
    },
    admin: {
      email: 'test-admin@eva.com',
      name: { first: 'Тест', last: 'Админ' }
    }
  };
  
  // В production можем переопределить из env переменных
  if (import.meta.env.PROD) {
    return {
      patient: {
        email: import.meta.env.VITE_TEST_PATIENT_EMAIL || baseConfig.patient.email,
        name: baseConfig.patient.name
      },
      doctor: {
        email: import.meta.env.VITE_TEST_DOCTOR_EMAIL || baseConfig.doctor.email,
        name: baseConfig.doctor.name
      },
      admin: {
        email: import.meta.env.VITE_TEST_ADMIN_EMAIL || baseConfig.admin.email,
        name: baseConfig.admin.name
      }
    };
  }
  
  return baseConfig;
};

// ✅ Безопасная генерация ID
export const generateSecureId = (prefix: string = 'user'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`;
};

// ✅ Проверка безопасности среды
export const isSecureEnvironment = (): boolean => {
  // Проверяем HTTPS в production
  if (import.meta.env.PROD && window.location.protocol !== 'https:') {
    return false;
  }
  
  // Проверяем наличие необходимых API
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    return false;
  }
  
  return true;
};

// ✅ Экспорт конфигурации
export const authConfig = {
  // Админские credentials (могут быть null в production)
  adminCredentials: getAdminCredentials(),
  
  // Тестовые пользователи
  testUsers: getTestUsersConfig(),
  
  // Настройки безопасности
  security: {
    isSecureEnvironment: isSecureEnvironment(),
    requireHttps: import.meta.env.PROD,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 минут
  },
  
  // Настройки сессии
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    autoBackupInterval: 30 * 1000, // 30 секунд
    emergencyRecoveryWindow: 5 * 60 * 1000, // 5 минут
  }
};

// ✅ Проверка доступности админского входа
export const isAdminLoginAvailable = (): boolean => {
  return authConfig.adminCredentials !== null;
};

// ✅ Логирование конфигурации для отладки (только в dev)
if (import.meta.env.DEV) {
  console.log('🔧 Auth Configuration:', {
    adminLoginAvailable: isAdminLoginAvailable(),
    isSecureEnvironment: authConfig.security.isSecureEnvironment,
    testUsersCount: Object.keys(authConfig.testUsers).length,
    environment: import.meta.env.MODE
  });
}