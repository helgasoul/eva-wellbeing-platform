import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PasswordResetDebug = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [debugInfo, setDebugInfo] = useState({
    urlParams: null,
    supabaseSession: null,
    authEvents: [],
    routingFlow: [],
    authContext: null,
    userProfile: null,
    currentPath: null,
    sessionError: null
  });

  const [testEmail, setTestEmail] = useState('');
  const [resetTestResult, setResetTestResult] = useState(null);

  useEffect(() => {
    runPasswordResetDiagnostics();
    
    // Отслеживаем изменения auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth State Change:', { event, session });
      setDebugInfo(prev => ({
        ...prev,
        authEvents: [...prev.authEvents, { 
          event, 
          session: session ? { 
            user_id: session.user?.id, 
            email: session.user?.email,
            access_token: session.access_token ? 'present' : 'missing'
          } : null,
          timestamp: new Date().toISOString()
        }]
      }));
    });

    return () => subscription.unsubscribe();
  }, [location]);

  const runPasswordResetDiagnostics = async () => {
    console.log('🔍 ДИАГНОСТИКА СБРОСА ПАРОЛЯ');
    console.log('📍 Текущий URL:', window.location.href);
    console.log('📍 Location object:', location);

    // 1. Анализ URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    
    const urlAnalysis = {
      search: window.location.search,
      hash: window.location.hash,
      pathname: window.location.pathname,
      searchParams: Object.fromEntries(urlParams.entries()),
      hashParams: Object.fromEntries(hashParams.entries()),
      hasAccessToken: urlParams.has('access_token') || hashParams.has('access_token'),
      hasRefreshToken: urlParams.has('refresh_token') || hashParams.has('refresh_token'),
      hasType: urlParams.has('type') || hashParams.has('type'),
      type: urlParams.get('type') || hashParams.get('type')
    };

    // 2. Проверка текущей сессии
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // 3. Проверка профиля пользователя (если есть сессия)
    let userProfile = null;
    if (session?.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      userProfile = profile;
    }

    // 4. Анализ роутинга
    const routingAnalysis = {
      currentPath: location.pathname,
      currentSearch: location.search,
      currentHash: location.hash,
      locationState: location.state
    };

    setDebugInfo({
      urlParams: urlAnalysis,
      supabaseSession: session ? {
        user_id: session.user?.id,
        email: session.user?.email,
        expires_at: session.expires_at,
        token_type: session.token_type
      } : null,
      sessionError: sessionError?.message,
      userProfile,
      currentPath: location.pathname,
      routingFlow: [...debugInfo.routingFlow, {
        timestamp: new Date().toISOString(),
        path: location.pathname,
        search: location.search,
        hash: location.hash
      }],
      authEvents: debugInfo.authEvents,
      authContext: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted
      } : null
    });

    console.log('📊 Результаты диагностики:', {
      urlAnalysis,
      session,
      userProfile,
      currentLocation: location,
      authContextUser: user
    });
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      setResetTestResult({ error: 'Введите email для тестирования' });
      return;
    }

    console.log('🧪 ТЕСТИРОВАНИЕ СБРОСА ПАРОЛЯ для:', testEmail);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('❌ Ошибка сброса пароля:', error);
        setResetTestResult({
          success: false,
          error: error.message
        });
      } else {
        console.log('✅ Сброс пароля инициирован:', data);
        setResetTestResult({
          success: true,
          message: 'Письмо отправлено! Проверьте почту и перейдите по ссылке.',
          redirectUrl: `${window.location.origin}/reset-password`
        });
      }
    } catch (e) {
      console.error('💥 Критическая ошибка:', e);
      setResetTestResult({
        error: e.message
      });
    }
  };

  const analyzeCurrentUrl = () => {
    const url = window.location.href;
    const isPasswordResetUrl = url.includes('access_token') && url.includes('type=recovery');
    const isOnboardingPage = location.pathname.includes('onboarding');
    
    return {
      isPasswordResetUrl,
      isOnboardingPage,
      shouldBePasswordReset: isPasswordResetUrl && !isOnboardingPage,
      problem: isPasswordResetUrl && isOnboardingPage ? 'ПРОБЛЕМА: Пользователь на онбординге вместо сброса пароля' : 'OK'
    };
  };

  const checkAuthFlow = () => {
    const analysis = analyzeCurrentUrl();
    const session = debugInfo.supabaseSession;
    const profile = debugInfo.userProfile;
    const authUser = debugInfo.authContext;

    return {
      step1_url_correct: analysis.isPasswordResetUrl,
      step2_session_created: !!session,
      step3_profile_loaded: !!profile,
      step4_auth_context: !!authUser,
      step5_onboarding_check: profile?.onboarding_completed || authUser?.onboardingCompleted,
      step6_redirect_logic: analysis.isOnboardingPage,
      
      recommendations: [
        !analysis.isPasswordResetUrl && 'URL не содержит токены сброса пароля',
        !session && analysis.isPasswordResetUrl && 'Сессия не создалась из URL токенов',
        session && !profile && 'Профиль пользователя не найден в базе',
        session && !authUser && 'AuthContext не обновился с пользователем',
        (profile && !profile.onboarding_completed || authUser && !authUser.onboardingCompleted) && analysis.isOnboardingPage && 'Пользователь редиректится на онбординг из-за onboarding_completed: false',
        analysis.problem !== 'OK' && analysis.problem
      ].filter(Boolean)
    };
  };

  const urlAnalysis = analyzeCurrentUrl();
  const authFlow = checkAuthFlow();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-full overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🔍 Диагностика сброса пароля</h2>
          <button 
            onClick={() => onClose?.()}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Быстрый анализ проблемы */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">🚨 Анализ текущей ситуации</h3>
          <div className="space-y-2 text-sm">
            <div className={`p-2 rounded ${urlAnalysis.problem === 'OK' ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Статус:</strong> {urlAnalysis.problem}
            </div>
            <div><strong>Это ссылка сброса пароля:</strong> {urlAnalysis.isPasswordResetUrl ? '✅ Да' : '❌ Нет'}</div>
            <div><strong>Находится на онбординге:</strong> {urlAnalysis.isOnboardingPage ? '⚠️ Да' : '✅ Нет'}</div>
          </div>
        </div>

        {/* Анализ потока аутентификации */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔄 Анализ потока аутентификации</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(authFlow).map(([key, value]) => {
              if (key === 'recommendations') return null;
              return (
                <div key={key} className="flex justify-between">
                  <span>{key.replace(/_/g, ' ')}:</span>
                  <span className={value ? 'text-green-600' : 'text-red-600'}>
                    {value ? '✅' : '❌'} {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
          {authFlow.recommendations.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-100 rounded">
              <strong>Рекомендации:</strong>
              <ul className="list-disc list-inside mt-1">
                {authFlow.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Тестирование сброса пароля */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🧪 Тестирование сброса пароля</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button 
              onClick={testPasswordReset}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Отправить сброс
            </button>
          </div>
          {resetTestResult && (
            <div className={`p-2 rounded text-sm ${resetTestResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              {resetTestResult.error && <div>❌ Ошибка: {resetTestResult.error}</div>}
              {resetTestResult.message && <div>✅ {resetTestResult.message}</div>}
              {resetTestResult.redirectUrl && <div>🔗 Redirect URL: {resetTestResult.redirectUrl}</div>}
            </div>
          )}
        </div>

        {/* Детальная информация */}
        <div className="space-y-4">
          <details>
            <summary className="cursor-pointer font-semibold">📋 URL параметры</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.urlParams, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">👤 Сессия Supabase</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.supabaseSession, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">🔐 AuthContext пользователь</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.authContext, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">📄 Профиль пользователя</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.userProfile, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">🔄 События аутентификации</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.authEvents, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer font-semibold">🚦 История роутинга</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo.routingFlow, null, 2)}
            </pre>
          </details>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={runPasswordResetDiagnostics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Обновить диагностику
          </button>
          <button
            onClick={() => {
              console.log('📋 ПОЛНЫЙ ОТЧЕТ ДИАГНОСТИКИ СБРОСА ПАРОЛЯ:');
              console.log('URL Analysis:', urlAnalysis);
              console.log('Auth Flow:', authFlow);
              console.log('Debug Info:', debugInfo);
              alert('Полный отчет сохранен в консоль браузера (F12)');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📋 Экспорт отчета
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetDebug;