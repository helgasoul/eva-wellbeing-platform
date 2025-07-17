import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wrench } from 'lucide-react';
import { logger } from '@/utils/logger';
import { onboardingService } from '@/services/onboardingService';
import { runOnboardingDiagnostics, autoRepairOnboarding } from '@/utils/onboardingDiagnostics';

const DatabaseCheck = () => {
  const [checks, setChecks] = useState({
    userProfiles: { status: 'loading', data: null, error: null },
    currentUser: { status: 'loading', data: null, error: null },
    consistency: { status: 'loading', data: null, error: null },
    onboardingDiagnostics: { status: 'loading', data: null, error: null }
  });

  const runChecks = async () => {
    logger.info('Starting database checks...');

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
    setTimeout(async () => {
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

      // 4. Расширенная диагностика онбординга
      if (session?.user) {
        try {
          const diagnostics = await runOnboardingDiagnostics(session.user.id);
          
          let diagnosticsStatus = 'success';
          if (diagnostics.systemStatus === 'error') {
            diagnosticsStatus = 'error';
          } else if (diagnostics.systemStatus === 'warning') {
            diagnosticsStatus = 'warning';
          }

          setChecks(prev => ({
            ...prev,
            onboardingDiagnostics: {
              status: diagnosticsStatus,
              data: diagnostics,
              error: null
            }
          }));
        } catch (error: any) {
          setChecks(prev => ({
            ...prev,
            onboardingDiagnostics: {
              status: 'error',
              data: null,
              error: error.message
            }
          }));
        }
      }
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
      logger.error('No active session');
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
        logger.error('Profile creation error', error);
      } else {
        logger.info('Profile created for user', { email: session.user.email });
      }
    } catch (error) {
      logger.error('Critical profile creation error', error);
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

        {/* Onboarding Diagnostics */}
        {checks.currentUser.data?.user && (
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
            {getStatusIcon(checks.onboardingDiagnostics.status)}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Диагностика онбординга</h3>
              {checks.onboardingDiagnostics.data && (
                <div className="text-sm text-muted-foreground">
                  <p>Статус системы: <span className={
                    checks.onboardingDiagnostics.data.systemStatus === 'healthy' ? 'text-green-600' :
                    checks.onboardingDiagnostics.data.systemStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }>{checks.onboardingDiagnostics.data.systemStatus}</span></p>
                  <p>Онбординг завершен: {checks.onboardingDiagnostics.data.checks.onboardingCompleted ? 'Да' : 'Нет'}</p>
                  <p>Есть анализ менопаузы: {checks.onboardingDiagnostics.data.checks.hasMenopauseAnalysis ? 'Да' : 'Нет'}</p>
                  <p>Процент завершения: {checks.onboardingDiagnostics.data.validation.completionPercentage}%</p>
                  <p>Количество шагов: {checks.onboardingDiagnostics.data.dataIntegrity.onboardingDataCount}</p>
                  
                  {checks.onboardingDiagnostics.data.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Рекомендации:</p>
                      <ul className="list-disc list-inside text-xs">
                        {checks.onboardingDiagnostics.data.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {checks.onboardingDiagnostics.data.systemStatus !== 'healthy' && (
                    <button
                      onClick={async () => {
                        const session = checks.currentUser.data;
                        if (session?.user) {
                          try {
                            const repair = await autoRepairOnboarding(session.user.id);
                            if (repair.repaired) {
                              alert(`Исправлено: ${repair.actions.join(', ')}`);
                              setTimeout(runChecks, 1000);
                            } else {
                              alert('Нет проблем для исправления');
                            }
                          } catch (error: any) {
                            alert(`Ошибка автоисправления: ${error.message}`);
                          }
                        }
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      Автоисправление
                    </button>
                  )}
                </div>
              )}
              {checks.onboardingDiagnostics.error && (
                <p className="text-sm text-destructive">{checks.onboardingDiagnostics.error}</p>
              )}
            </div>
          </div>
        )}
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