import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    supabaseConnection: null,
    localStorageData: null,
    supabaseSession: null,
    supabaseUser: null,
    environmentVars: null,
    databaseTables: null,
    authUsers: null
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    console.log('🔍 ЗАПУСК ДИАГНОСТИКИ АУТЕНТИФИКАЦИИ');
    
    // 1. Проверка подключения к Supabase
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        return { 
          status: error ? 'error' : 'success', 
          message: error ? error.message : 'Подключение работает',
          data: data 
        };
      } catch (e) {
        return { status: 'error', message: e.message };
      }
    };

    // 2. Проверка localStorage
    const checkLocalStorage = () => {
      const userData = localStorage.getItem('eva_user_data');
      const onboardingData = localStorage.getItem('eva_onboarding_data');
      
      return {
        hasUserData: !!userData,
        hasOnboardingData: !!onboardingData,
        userData: userData ? JSON.parse(userData) : null,
        onboardingData: onboardingData ? JSON.parse(onboardingData) : null,
        allLocalStorageKeys: Object.keys(localStorage)
      };
    };

    // 3. Проверка текущей сессии
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      return {
        hasSession: !!session,
        session: session,
        error: error
      };
    };

    // 4. Проверка переменных окружения
    const checkEnvironment = () => {
      return {
        supabaseUrl: window.location.origin.includes('lovable') ? 'ИСПОЛЬЗУЕТ ВСТРОЕННЫЙ SUPABASE' : 'ВНЕШНИЙ',
        nodeEnv: import.meta.env.MODE || 'unknown',
        isLovableEnv: window.location.origin.includes('lovable')
      };
    };

    // 5. Проверка таблиц в базе данных
    const checkDatabaseTables = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(5);

        const { data: onboarding, error: onboardingError } = await supabase
          .from('onboarding_data')
          .select('*')
          .limit(5);

        return {
          userProfiles: {
            error: profilesError?.message || null,
            count: profiles?.length || 0,
            data: profiles || []
          },
          onboardingData: {
            error: onboardingError?.message || null,
            count: onboarding?.length || 0,
            data: onboarding || []
          }
        };
      } catch (e) {
        return { error: e.message };
      }
    };

    // 6. Проверка пользователей в auth.users
    const checkAuthUsers = async () => {
      try {
        // Пытаемся получить текущего пользователя через auth
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Получаем информацию о всех пользователях через RPC
        const { data: usersInfo, error: usersError } = await supabase
          .rpc('get_auth_users_info');
        
        return {
          currentUser: user,
          error: error?.message || null,
          allUsersInfo: usersInfo || [],
          usersError: usersError?.message || null
        };
      } catch (e) {
        return { error: e.message };
      }
    };

    // Запускаем все проверки
    const results = {
      supabaseConnection: await checkSupabaseConnection(),
      localStorageData: checkLocalStorage(),
      supabaseSession: await checkSession(),
      supabaseUser: null, // Placeholder для совместимости
      environmentVars: checkEnvironment(),
      databaseTables: await checkDatabaseTables(),
      authUsers: await checkAuthUsers()
    };

    console.log('📊 РЕЗУЛЬТАТЫ ДИАГНОСТИКИ:', results);
    setDebugInfo(results);
  };

  const testLogin = async () => {
    if (!testEmail || !testPassword) {
      setTestResults({ error: 'Введите email и пароль для тестирования' });
      return;
    }

    console.log('🧪 ТЕСТИРОВАНИЕ ВХОДА:', { email: testEmail });
    
    try {
      // Тест 1: Прямой вход через Supabase
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        console.error('❌ Ошибка входа:', loginError);
        
        setTestResults({
          loginError: loginError.message,
          loginSuccess: false,
          errorCode: loginError.status,
          suggestion: loginError.message === 'Invalid login credentials' 
            ? 'Пользователь не существует или неверный пароль'
            : 'Другая ошибка аутентификации'
        });
      } else {
        console.log('✅ Успешный вход:', loginData);
        setTestResults({
          loginSuccess: true,
          user: loginData.user,
          session: loginData.session
        });
      }
    } catch (e) {
      console.error('💥 Критическая ошибка:', e);
      setTestResults({
        criticalError: e.message
      });
    }
  };

  const testRegistration = async () => {
    if (!testEmail || !testPassword) {
      setTestResults({ error: 'Введите email и пароль для тестирования' });
      return;
    }

    console.log('🧪 ТЕСТИРОВАНИЕ РЕГИСТРАЦИИ:', { email: testEmail });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: 'Test',
            last_name: 'User',
            user_role: 'patient'
          }
        }
      });

      if (error) {
        console.error('❌ Ошибка регистрации:', error);
        setTestResults({
          registrationError: error.message,
          registrationSuccess: false
        });
      } else {
        console.log('✅ Успешная регистрация:', data);
        setTestResults({
          registrationSuccess: true,
          user: data.user,
          session: data.session,
          needsEmailConfirmation: !data.session
        });
      }
    } catch (e) {
      console.error('💥 Критическая ошибка регистрации:', e);
      setTestResults({
        criticalError: e.message
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🔍 Диагностика аутентификации</h2>
          <button 
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Блок тестирования */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Тестирование входа/регистрации</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="password123"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={testLogin} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Тест входа
            </button>
            <button onClick={testRegistration} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Тест регистрации
            </button>
          </div>
          {testResults && (
            <div className="mt-2">
              <h4 className="font-semibold text-sm mb-1">Результаты тестирования:</h4>
              <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Результаты диагностики */}
        <div className="space-y-4">
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="border rounded p-3">
              <h3 className="font-semibold mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Обновить диагностику
          </button>
          <button
            onClick={() => {
              console.log('📋 Полный отчет диагностики:', debugInfo);
              console.log('🧪 Результаты тестирования:', testResults);
              alert('Результаты сохранены в консоль браузера (F12)');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📋 Сохранить отчет
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;