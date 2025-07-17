# Supabase Authentication Fixes for Eva Wellbeing Platform

## 🚨 Проблемы, выявленные из ошибки:

### 1. Ошибка авторизации
- **Проблема**: "Произошла ошибка авторизации"
- **Причина**: Неправильная конфигурация Supabase URLs
- **Воздействие**: Пациенты не могут войти в систему

### 2. Ошибка создания профиля
- **Проблема**: "Ошибка создания профиля пользователя"
- **Причина**: Проблемы с базой данных или RLS политиками
- **Воздействие**: Новые пользователи не могут зарегистрироваться

## 🔧 Технические исправления:

### 1. Конфигурация Supabase URLs

```typescript
// src/config/supabase.ts
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
  // Исправленные настройки аутентификации
  auth: {
    // Правильные redirect URLs для Eva платформы
    redirectTo: process.env.NODE_ENV === 'production' 
      ? 'https://eva-wellbeing-platform.vercel.app/auth/callback'
      : 'http://localhost:3000/auth/callback',
    
    // Настройки для медицинской платформы
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    
    // Безопасность для медицинских данных
    flowType: 'pkce',
    
    // Дополнительные домены для разработки
    additionalRedirectUrls: [
      'http://localhost:3000/patient/dashboard',
      'http://localhost:3000/doctor/dashboard', 
      'http://localhost:3000/admin/dashboard'
    ]
  }
};
```

### 2. Исправление создания профиля пользователя

```typescript
// src/utils/auth-helpers.ts
import { supabase } from '@/config/supabase';
import { UserRole } from '@/types/roles';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export async function createUserProfile(
  userId: string, 
  email: string, 
  role: UserRole,
  additionalData?: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Проверяем существование профиля
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return { success: true }; // Профиль уже существует
    }

    // Создаем новый профиль с медицинскими полями
    const profileData: Partial<UserProfile> = {
      id: userId,
      email,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { 
        success: false, 
        error: `Ошибка создания профиля: ${profileError.message}` 
      };
    }

    // Создаем медицинскую запись для пациентов
    if (role === 'patient') {
      const { error: medicalError } = await supabase
        .from('patient_medical_data')
        .insert([{
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (medicalError) {
        console.error('Medical data creation error:', medicalError);
        // Не блокируем регистрацию из-за этой ошибки
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return { 
      success: false, 
      error: 'Неожиданная ошибка при создании профиля' 
    };
  }
}
```

### 3. Улучшенная обработка ошибок аутентификации

```typescript
// src/components/auth/AuthErrorHandler.tsx
import React from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string;
  onRetry: () => void;
  onShowDiagnostics?: () => void;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({
  error,
  onRetry,
  onShowDiagnostics
}) => {
  const isConfigError = error.includes('URL') || error.includes('redirect');
  const isProfileError = error.includes('профиль') || error.includes('profile');

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-red-800 text-center mb-2">
        Ошибка авторизации
      </h2>
      
      <p className="text-red-600 text-center mb-6">
        {isProfileError 
          ? "Ошибка создания профиля пользователя. Обратитесь к администратору."
          : "Не волнуйтесь! Мы автоматически восстановили безопасное состояние."
        }
      </p>

      {/* Распространенные решения */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-3">
          Распространенные решения:
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Проверьте настройки Site URL и Redirect URLs в Supabase</li>
          <li>• Убедитесь, что домен добавлен в разрешенные</li>
          <li>• Очистите кэш браузера и cookies</li>
          <li>• Попробуйте открыть в режиме инкогнито</li>
        </ul>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-3">
        {onShowDiagnostics && (
          <button
            onClick={onShowDiagnostics}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Показать диагностику сети
          </button>
        )}
        
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Попробовать снова
        </button>
      </div>
    </div>
  );
};
```

### 4. Supabase RLS Политики для медицинских данных

```sql
-- SQL для исправления RLS политик в Supabase

-- Политика для профилей пользователей
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политика для создания профилей (только при регистрации)
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика для медицинских данных пациентов
CREATE POLICY "Patients can view own medical data" ON patient_medical_data
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('doctor', 'admin')
    )
  );

-- Политика для создания медицинских записей
CREATE POLICY "Enable insert for patients and doctors" ON patient_medical_data
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('doctor', 'admin')
    )
  );
```

## 🔒 Безопасность для медицинской платформы:

### 1. Проверка окружения
```typescript
// src/utils/env-validation.ts
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL не установлен');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY не установлен');
  }
  
  // Проверка URL для медицинской платформы
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    errors.push('Некорректный URL Supabase');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 2. Логирование ошибок для медицинского аудита
```typescript
// src/utils/medical-audit-logger.ts
export async function logAuthError(
  error: string,
  userId?: string,
  additionalData?: Record<string, any>
) {
  try {
    await supabase
      .from('auth_audit_log')
      .insert([{
        event_type: 'auth_error',
        user_id: userId,
        error_message: error,
        additional_data: additionalData,
        created_at: new Date().toISOString(),
        ip_address: getClientIP(), // Для медицинского аудита
        user_agent: getUserAgent()
      }]);
  } catch (logError) {
    console.error('Failed to log auth error:', logError);
  }
}
```

## ✅ Чеклист исправлений:

- [ ] Обновить конфигурацию Supabase URLs
- [ ] Исправить функцию создания профиля пользователя  
- [ ] Добавить улучшенную обработку ошибок
- [ ] Обновить RLS политики в Supabase
- [ ] Добавить валидацию окружения
- [ ] Настроить медицинский аудит логирование
- [ ] Тестировать регистрацию новых пациентов
- [ ] Тестировать вход существующих пользователей

## 🏥 Критичность для медицинской платформы:

**Высокий приоритет** - эти ошибки блокируют доступ пациентов к их медицинским данным и нарушают работу всей платформы Eva.

## 📱 Тестирование после исправлений:

1. Регистрация нового пациента
2. Вход существующего пользователя  
3. Переход между ролями (patient/doctor/admin)
4. Проверка создания медицинских записей
5. Валидация безопасности медицинских данных