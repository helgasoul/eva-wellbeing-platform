// ✅ ЭТАП 2: Утилиты для проверки безопасности аутентификации

import { authConfig, isAdminLoginAvailable, generateSecureId } from '@/config/auth';

interface AuthVerificationResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface AuthSecurityReport {
  environment: string;
  securityLevel: 'high' | 'medium' | 'low';
  adminLoginStatus: 'available' | 'env-configured' | 'disabled';
  secureIdGeneration: boolean;
  httpsEnforced: boolean;
  checks: AuthVerificationResult[];
  recommendations: string[];
}

// ✅ Проверка безопасности конфигурации
export const verifyAuthSecurity = (): AuthSecurityReport => {
  const checks: AuthVerificationResult[] = [];
  const recommendations: string[] = [];
  
  // Проверка 1: Админские credentials
  const adminCheck = verifyAdminCredentials();
  checks.push(adminCheck);
  
  // Проверка 2: Тестовые пользователи
  const testUsersCheck = verifyTestUsersConfig();
  checks.push(testUsersCheck);
  
  // Проверка 3: Генерация безопасных ID
  const idGenerationCheck = verifySecureIdGeneration();
  checks.push(idGenerationCheck);
  
  // Проверка 4: HTTPS в production
  const httpsCheck = verifyHttpsEnforcement();
  checks.push(httpsCheck);
  
  // Проверка 5: Environment variables
  const envCheck = verifyEnvironmentVariables();
  checks.push(envCheck);
  
  // Определяем общий уровень безопасности
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  
  let securityLevel: 'high' | 'medium' | 'low';
  if (errorCount > 0) {
    securityLevel = 'low';
    recommendations.push('Исправьте критические проблемы безопасности');
  } else if (warningCount > 1) {
    securityLevel = 'medium';
    recommendations.push('Рассмотрите возможность настройки environment variables');
  } else {
    securityLevel = 'high';
  }
  
  // Определяем статус админского входа
  let adminLoginStatus: 'available' | 'env-configured' | 'disabled';
  if (!isAdminLoginAvailable()) {
    adminLoginStatus = 'disabled';
  } else if (import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.VITE_ADMIN_PASSWORD) {
    adminLoginStatus = 'env-configured';
  } else {
    adminLoginStatus = 'available';
  }
  
  if (import.meta.env.PROD && adminLoginStatus === 'available') {
    recommendations.push('В production настройте VITE_ADMIN_EMAIL и VITE_ADMIN_PASSWORD');
  }
  
  return {
    environment: import.meta.env.MODE,
    securityLevel,
    adminLoginStatus,
    secureIdGeneration: checks.find(c => c.message.includes('ID generation'))?.status === 'success' || false,
    httpsEnforced: checks.find(c => c.message.includes('HTTPS'))?.status === 'success' || false,
    checks,
    recommendations
  };
};

// ✅ Проверка админских credentials
const verifyAdminCredentials = (): AuthVerificationResult => {
  if (!isAdminLoginAvailable()) {
    return {
      status: 'warning',
      message: 'Admin login disabled (production mode without env variables)',
      details: { available: false }
    };
  }
  
  const credentials = authConfig.adminCredentials;
  if (!credentials) {
    return {
      status: 'error',
      message: 'Admin credentials configuration error',
      details: { error: 'credentials null despite isAdminLoginAvailable=true' }
    };
  }
  
  // Проверяем использование env переменных в production
  if (import.meta.env.PROD) {
    const hasEnvVars = import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.VITE_ADMIN_PASSWORD;
    if (!hasEnvVars) {
      return {
        status: 'warning',
        message: 'Admin credentials using fallback values in production',
        details: { usingEnvVars: false }
      };
    }
  }
  
  return {
    status: 'success',
    message: 'Admin credentials properly configured',
    details: { 
      hasEmail: !!credentials.email,
      hasPassword: !!credentials.password,
      usingEnvVars: !!(import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.VITE_ADMIN_PASSWORD)
    }
  };
};

// ✅ Проверка конфигурации тестовых пользователей
const verifyTestUsersConfig = (): AuthVerificationResult => {
  const testUsers = authConfig.testUsers;
  
  const hasAllUsers = testUsers.patient && testUsers.doctor && testUsers.admin;
  const hasAllEmails = testUsers.patient?.email && testUsers.doctor?.email && testUsers.admin?.email;
  
  if (!hasAllUsers || !hasAllEmails) {
    return {
      status: 'error',
      message: 'Test users configuration incomplete',
      details: { hasAllUsers, hasAllEmails }
    };
  }
  
  return {
    status: 'success',
    message: 'Test users configuration valid',
    details: {
      patientEmail: testUsers.patient.email,
      doctorEmail: testUsers.doctor.email,
      adminEmail: testUsers.admin.email
    }
  };
};

// ✅ Проверка генерации безопасных ID
const verifySecureIdGeneration = (): AuthVerificationResult => {
  try {
    const testId1 = generateSecureId('test');
    const testId2 = generateSecureId('test');
    
    // Проверяем что ID уникальные
    if (testId1 === testId2) {
      return {
        status: 'error',
        message: 'Secure ID generation produces duplicates',
        details: { testId1, testId2 }
      };
    }
    
    // Проверяем формат
    if (!testId1.startsWith('test_') || testId1.length < 10) {
      return {
        status: 'error',
        message: 'Secure ID generation format invalid',
        details: { exampleId: testId1 }
      };
    }
    
    return {
      status: 'success',
      message: 'Secure ID generation working correctly',
      details: { exampleId: testId1 }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Secure ID generation failed',
      details: { error: error.message }
    };
  }
};

// ✅ Проверка HTTPS в production
const verifyHttpsEnforcement = (): AuthVerificationResult => {
  if (import.meta.env.PROD) {
    if (window.location.protocol !== 'https:') {
      return {
        status: 'error',
        message: 'HTTPS not enforced in production',
        details: { protocol: window.location.protocol }
      };
    }
  }
  
  return {
    status: 'success',
    message: 'HTTPS enforcement check passed',
    details: { 
      isProduction: import.meta.env.PROD,
      protocol: window.location.protocol 
    }
  };
};

// ✅ Проверка environment variables
const verifyEnvironmentVariables = (): AuthVerificationResult => {
  const envVars = {
    adminEmail: !!import.meta.env.VITE_ADMIN_EMAIL,
    adminPassword: !!import.meta.env.VITE_ADMIN_PASSWORD,
    testPatientEmail: !!import.meta.env.VITE_TEST_PATIENT_EMAIL,
    testDoctorEmail: !!import.meta.env.VITE_TEST_DOCTOR_EMAIL,
    testAdminEmail: !!import.meta.env.VITE_TEST_ADMIN_EMAIL
  };
  
  const totalEnvVars = Object.values(envVars).filter(Boolean).length;
  
  if (import.meta.env.PROD && totalEnvVars === 0) {
    return {
      status: 'warning',
      message: 'No environment variables configured for production',
      details: envVars
    };
  }
  
  return {
    status: totalEnvVars > 0 ? 'success' : 'warning',
    message: `Environment variables configured: ${totalEnvVars}/5`,
    details: envVars
  };
};

// ✅ Быстрая проверка аутентификации (для debugging)
export const quickAuthCheck = () => {
  const report = verifyAuthSecurity();
  
  console.group('🔐 Auth Security Verification');
  console.log('Environment:', report.environment);
  console.log('Security Level:', report.securityLevel);
  console.log('Admin Login:', report.adminLoginStatus);
  
  report.checks.forEach(check => {
    const icon = check.status === 'success' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${check.message}`);
  });
  
  if (report.recommendations.length > 0) {
    console.log('📋 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  console.groupEnd();
  
  return report;
};

// ✅ Тест аутентификации с мок-данными
export const testAuthFlow = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing auth flow...');
    
    // Тест 1: Проверка конфигурации
    const securityReport = verifyAuthSecurity();
    if (securityReport.securityLevel === 'low') {
      console.error('❌ Auth security level too low for testing');
      return false;
    }
    
    // Тест 2: Генерация secure ID
    const testId = generateSecureId('flow_test');
    if (!testId || testId.length < 10) {
      console.error('❌ Secure ID generation failed');
      return false;
    }
    
    // Тест 3: Проверка админских credentials
    if (isAdminLoginAvailable() && !authConfig.adminCredentials) {
      console.error('❌ Admin credentials configuration inconsistent');
      return false;
    }
    
    // Тест 4: Проверка тестовых пользователей
    const testUsers = authConfig.testUsers;
    if (!testUsers.patient?.email || !testUsers.doctor?.email) {
      console.error('❌ Test users configuration incomplete');
      return false;
    }
    
    console.log('✅ Auth flow test passed');
    return true;
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
    return false;
  }
};

// ✅ Автоматическая проверка при загрузке (только в dev)
if (import.meta.env.DEV) {
  // Запускаем проверку через небольшую задержку чтобы не блокировать загрузку
  setTimeout(() => {
    quickAuthCheck();
  }, 1000);
}