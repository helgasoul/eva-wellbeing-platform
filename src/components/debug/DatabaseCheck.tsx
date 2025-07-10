import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DatabaseCheck = () => {
  const [checks, setChecks] = useState({
    userProfiles: { status: 'loading', data: null, error: null },
    currentUser: { status: 'loading', data: null, error: null },
    consistency: { status: 'loading', data: null, error: null }
  });

  const runChecks = async () => {
    console.log('🔍 Запуск проверок базы данных...');

    // 1. Проверка текущего пользователя
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setChecks(prev => ({
        ...prev,
        currentUser: {
          status: sessionError ? 'error' : (session ? 'success' : 'warning'),
          data: session,
          error: sessionError?.message || (!session ? 'Нет активной сессии' : null)
        }
      }));
    } catch (e) {
      setChecks(prev => ({
        ...prev,
        currentUser: {
          status: 'error',
          data: null,
          error: 'Не удалось получить сессию'
        }
      }));
    }

    // 2. Проверка профилей в user_profiles
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
      
      setChecks(prev => ({
        ...prev,
        userProfiles: {
          status: profilesError ? 'error' : 'success',
          data: profilesData || [],
          error: profilesError?.message
        }
      }));
    } catch (e) {
      setChecks(prev => ({
        ...prev,
        userProfiles: {
          status: 'error',
          data: null,
          error: e.message
        }
      }));
    }

    // 3. Проверка консистентности данных (после небольшой задержки)
    setTimeout(() => {
      const session = checks.currentUser.data;
      const profiles = checks.userProfiles.data || [];
      
      let consistencyStatus = 'success';
      let consistencyData = {
        profilesCount: profiles.length,
        currentUserHasProfile: false,
        profilesWithMissingFields: []
      };

      if (session?.user) {
        const userProfile = profiles.find(p => p.id === session.user.id);
        consistencyData.currentUserHasProfile = !!userProfile;
        
        if (!userProfile) {
          consistencyStatus = 'error';
        }
      }

      // Проверяем профили на недостающие поля
      const profilesWithMissingFields = profiles.filter(profile => 
        !profile.email || !profile.role || profile.first_name === undefined
      );
      consistencyData.profilesWithMissingFields = profilesWithMissingFields;

      if (profilesWithMissingFields.length > 0) {
        consistencyStatus = 'warning';
      }
      
      setChecks(prev => ({
        ...prev,
        consistency: {
          status: consistencyStatus,
          data: consistencyData,
          error: null
        }
      }));
    }, 1000);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const fixCurrentUserProfile = async () => {
    const session = checks.currentUser.data;
    if (!session?.user) {
      console.error('❌ Нет активной сессии');
      return;
    }

    try {
      const { error } = await supabase.from('user_profiles').insert({
        id: session.user.id,
        email: session.user.email,
        first_name: session.user.user_metadata?.first_name || '',
        last_name: session.user.user_metadata?.last_name || '',
        role: session.user.user_metadata?.role || 'patient',
        onboarding_completed: false
      });

      if (error) {
        console.error(`❌ Ошибка создания профиля:`, error);
      } else {
        console.log(`✅ Создан профиль для ${session.user.email}`);
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка создания профиля:`, error);
    }
    
    // Перезапускаем проверки
    setTimeout(runChecks, 1000);
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">🔍 Проверка базы данных</h2>
        <button
          onClick={runChecks}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      <div className="space-y-4">
        {/* Current User */}
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          {getStatusIcon(checks.currentUser.status)}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Текущая сессия</h3>
            <p className="text-sm text-muted-foreground">
              {checks.currentUser.data?.user 
                ? `Пользователь: ${checks.currentUser.data.user.email}` 
                : 'Нет активной сессии'}
            </p>
            {checks.currentUser.error && (
              <p className="text-sm text-destructive">{checks.currentUser.error}</p>
            )}
          </div>
        </div>

        {/* User Profiles */}
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          {getStatusIcon(checks.userProfiles.status)}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Профили в user_profiles</h3>
            <p className="text-sm text-muted-foreground">
              Найдено: {checks.userProfiles.data?.length || 0} профилей
            </p>
            {checks.userProfiles.error && (
              <p className="text-sm text-destructive">{checks.userProfiles.error}</p>
            )}
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          {getStatusIcon(checks.consistency.status)}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Консистентность данных</h3>
            {checks.consistency.data && (
              <div className="text-sm text-muted-foreground">
                <p>Всего профилей: {checks.consistency.data.profilesCount}</p>
                <p>У текущего пользователя есть профиль: {checks.consistency.data.currentUserHasProfile ? 'Да' : 'Нет'}</p>
                <p>Профилей с недостающими полями: {checks.consistency.data.profilesWithMissingFields?.length || 0}</p>
                {!checks.consistency.data.currentUserHasProfile && checks.currentUser.data?.user && (
                  <button
                    onClick={fixCurrentUserProfile}
                    className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                  >
                    Создать профиль для текущего пользователя
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Детальная информация */}
      <details className="mt-6">
        <summary className="cursor-pointer font-semibold text-foreground mb-2">
          📋 Детальная информация
        </summary>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto text-muted-foreground">
          {JSON.stringify(checks, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DatabaseCheck;