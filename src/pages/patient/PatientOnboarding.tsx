import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { generateId, showNotification } from '@/utils/dataUtils';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { StepWrapper } from '@/components/onboarding/StepWrapper';
import { OnboardingResults } from '@/components/onboarding/OnboardingResults';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { BasicInfoStep } from '@/components/onboarding/steps/BasicInfoStep';
import { MenstrualHistoryStep } from '@/components/onboarding/steps/MenstrualHistoryStep';
import { SymptomsStep } from '@/components/onboarding/steps/SymptomsStep';
import { MedicalHistoryStep } from '@/components/onboarding/steps/MedicalHistoryStep';
import { LifestyleStep } from '@/components/onboarding/steps/LifestyleStep';
import { GoalsStep } from '@/components/onboarding/steps/GoalsStep';
import GeolocationStep from '@/components/onboarding/steps/GeolocationStep';
import { OnboardingData } from '@/types/onboarding';
import { weatherService } from '@/services/weatherService';
import { supabase } from '@/integrations/supabase/client';
import { detectMenopausePhase } from '@/utils/menopausePhaseDetector';
import { generateRecommendations } from '@/utils/personalizedRecommendations';
import { toast } from '@/hooks/use-toast';
import { DataBridge, OnboardingPresets } from '@/services/DataBridge';
import { onboardingService } from '@/services/onboardingService';
import { migrateOnboardingData } from '@/utils/onboardingMigration';
import { EmergencyRecoveryService } from '@/services/emergencyRecovery';

// ✅ ИСПРАВЛЕНО: Убираем геолокацию из онбординга - делаем 7 шагов
const TOTAL_STEPS = 7;
const STORAGE_KEY = 'bloom-onboarding-data';

// КРИТИЧЕСКИ ВАЖНО: Правильная последовательность шагов согласно ТЗ
const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Добро пожаловать',
    component: 'WelcomeStep',
    isRequired: true,
    dataKey: null
  },
  {
    step: 2, 
    title: 'Базовая информация',
    component: 'BasicInfoStep',
    isRequired: true,
    dataKey: 'basicInfo'
  },
  {
    step: 3,
    title: 'История менструального цикла', 
    component: 'MenstrualHistoryStep',
    isRequired: true,
    dataKey: 'menstrualHistory'
  },
  {
    step: 4,
    title: 'Текущие симптомы менопаузы',
    component: 'SymptomsStep',
    isRequired: true,
    dataKey: 'symptoms'
  },
  {
    step: 5,
    title: 'Медицинская история',
    component: 'MedicalHistoryStep',
    isRequired: true,
    dataKey: 'medicalHistory'
  },
  {
    step: 6,
    title: 'Образ жизни',
    component: 'LifestyleStep',
    isRequired: true,
    dataKey: 'lifestyle'
  },
  {
    step: 7,
    title: 'Цели и приоритеты', 
    component: 'GoalsStep',
    isRequired: true,
    dataKey: 'goals'
  }
];

const stepTitles = ONBOARDING_STEPS.map(step => step.title);

const PatientOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [phaseResult, setPhaseResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [onboardingPresets, setOnboardingPresets] = useState<OnboardingPresets | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState({
    registration: false,
    onboarding: false,
    dataBridge: false
  });
  
  const { user, completeOnboarding, updateUser, saveUserData, loadUserData } = useAuth();
  const navigate = useNavigate();

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Улучшенная проверка с восстановлением
  useEffect(() => {
    if (!user) {
      console.log('🔄 User not found, attempting emergency recovery...');
      
      const attemptRecovery = async () => {
        try {
          setIsLoading(true);
          
          const recovery = await EmergencyRecoveryService.recoverUserSession();
          
          if (recovery.success && recovery.user) {
            console.log('✅ User recovered, continuing onboarding');
            
            // Обновляем пользователя через AuthContext
            await updateUser(recovery.user);
            
            toast({
              title: 'Сессия восстановлена',
              description: 'Ваши данные были успешно восстановлены. Продолжаем онбординг.',
            });
            
            // Продолжаем с проверкой онбординга
            await checkOnboardingStatus(recovery.user);
            
          } else {
            console.log('❌ Recovery failed, redirecting to login');
            navigate('/login', { 
              state: { 
                message: 'Сессия истекла. Пожалуйста, войдите снова.',
                returnPath: '/patient/onboarding' 
              } 
            });
          }
        } catch (error) {
          console.error('Recovery attempt failed:', error);
          navigate('/login');
        } finally {
          setIsLoading(false);
        }
      };
      
      attemptRecovery();
      return;
    }

    // Проверяем, завершен ли онбординг
    checkOnboardingStatus(user);
  }, [user, navigate, updateUser]);

  // ✅ УЛУЧШЕННАЯ функция проверки онбординга из всех источников
  const checkOnboardingStatus = async (currentUser: any) => {
    try {
      setIsLoading(true);
      
      // 1. Проверяем флаг пользователя
      if (currentUser.onboardingCompleted) {
        console.log('✅ User has completed onboarding according to profile');
        navigate('/patient/dashboard', { replace: true });
        return;
      }
      
      // 2. Проверяем миграцию данных из localStorage
      const migrationResult = migrateOnboardingData();
      if (migrationResult.migrationPerformed && migrationResult.onboardingCompleted) {
        console.log('✅ Migrated onboarding completion from localStorage');
        
        await updateUser({ 
          onboardingCompleted: true,
          onboardingData: migrationResult.onboardingData
        });
        
        toast({
          title: 'Данные восстановлены',
          description: 'Ваши данные онбординга были успешно восстановлены',
        });
        
        navigate('/patient/dashboard', { replace: true });
        return;
      }
      
      // 3. Проверяем статус в Supabase
      const onboardingCheck = await onboardingService.isOnboardingComplete(currentUser.id);
      
      if (onboardingCheck.completed) {
        console.log('✅ Onboarding completed according to Supabase');
        
        // Синхронизируем локальные данные
        await updateUser({ 
          onboardingCompleted: true,
          onboardingData: onboardingCheck.progress 
        });
        
        navigate('/patient/dashboard', { replace: true });
        return;
      }
      
      // 4. Проверяем данные в различных источниках localStorage
      const sources = [
        'onboarding_data',
        'eva_onboarding_data',
        `onboarding_progress_${currentUser.id}`,
        'bloom-onboarding-data'
      ];
      
      for (const source of sources) {
        try {
          const data = localStorage.getItem(source);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.completed || parsed.onboardingCompleted) {
              console.log(`✅ Found completed onboarding in ${source}`);
              
              // Синхронизируем с Supabase
              await updateUser({ 
                onboardingCompleted: true,
                onboardingData: parsed 
              });
              
              toast({
                title: 'Онбординг найден',
                description: 'Ваши данные онбординга были найдены и восстановлены',
              });
              
              navigate('/patient/dashboard', { replace: true });
              return;
            }
          }
        } catch (error) {
          console.warn(`Failed to parse ${source}:`, error);
        }
      }
      
      console.log('🔄 User needs to complete onboarding');
      
      // Загружаем частичные данные если есть
      loadOnboardingData();
      
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      toast({
        title: 'Ошибка проверки',
        description: 'Произошла ошибка при проверке статуса онбординга',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ УЛУЧШЕННАЯ функция загрузки данных онбординга
  const loadOnboardingData = async () => {
    try {
      console.log('📥 Loading onboarding data from all sources...');
      
      // 1. Данные из AuthContext (приоритет)
      const userData = user;
      
      // 2. Данные из различных источников localStorage
      const sources = [
        'registration_data',
        'onboarding_presets',
        `onboarding_progress_${user?.id}`,
        'eva_registration_data',
        'bloom-registration-data'
      ];
      
      let mergedData: any = {
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email
      };
      
      // Загружаем данные из всех источников
      for (const source of sources) {
        try {
          const data = localStorage.getItem(source);
          if (data) {
            const parsed = JSON.parse(data);
            mergedData = { ...mergedData, ...parsed };
            console.log(`📥 Loaded data from ${source}`);
          }
        } catch (error) {
          console.warn(`Failed to load ${source}:`, error);
        }
      }
      
      // 3. Предзаполненные поля на основе персоны
      if (mergedData.persona || mergedData.selectedPersona) {
        const personaDefaults = getPersonaDefaults(mergedData.persona || mergedData.selectedPersona);
        mergedData = { ...mergedData, ...personaDefaults };
      }
      
      // 4. Устанавливаем данные и текущий шаг
      setFormData(prev => ({ ...prev, ...mergedData }));
      
      // Определяем текущий шаг на основе сохраненного прогресса
      if (mergedData.currentStep && mergedData.currentStep <= TOTAL_STEPS) {
        setCurrentStep(mergedData.currentStep);
      } else if (mergedData.startStep && mergedData.startStep <= TOTAL_STEPS) {
        setCurrentStep(mergedData.startStep);
      }
      
      console.log('✅ Onboarding data loaded successfully:', {
        hasData: Object.keys(mergedData).length > 3,
        currentStep: currentStep,
        dataKeys: Object.keys(mergedData)
      });
      
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      toast({
        title: 'Предупреждение',
        description: 'Некоторые данные не удалось загрузить. Вы можете продолжить онбординг.',
        variant: 'destructive',
      });
    }
  };

  // Функция персонализированных дефолтов:
  const getPersonaDefaults = (persona: string) => {
    switch(persona) {
      case 'first_signs':
        return {
          expectedSymptoms: ['irregular_periods', 'mood_swings', 'sleep_issues'],
          phase: 'perimenopause'
        };
      case 'active_phase': 
        return {
          expectedSymptoms: ['hot_flashes', 'night_sweats', 'mood_changes'],
          phase: 'menopause'
        };
      case 'postmenopause':
        return {
          expectedSymptoms: ['bone_density', 'heart_health', 'cognitive_health'],
          phase: 'postmenopause'
        };
      default: return {};
    }
  };

  // ✅ УЛУЧШЕННОЕ АВТОСОХРАНЕНИЕ с множественным резервированием
  useEffect(() => {
    const saveOnboardingData = async () => {
      if (!user?.id || Object.keys(formData).length === 0) return;
      
      try {
        const saveData = {
          data: formData,
          currentStep,
          timestamp: new Date().toISOString(),
          userId: user.id,
          version: '1.0'
        };
        
        // 1. Сохранение через DataBridge
        await saveUserData('onboarding_progress', saveData);

        // 2. Множественное резервирование в localStorage
        const backupKeys = [
          'bloom-onboarding-data',
          `onboarding_progress_${user.id}`,
          'eva_onboarding_progress',
          'onboarding_backup'
        ];
        
        backupKeys.forEach(key => {
          try {
            localStorage.setItem(key, JSON.stringify(saveData));
          } catch (error) {
            console.warn(`Failed to save to ${key}:`, error);
          }
        });
        
        // 3. Асинхронная синхронизация с Supabase
        const stepMapping = [
          { key: 'basicInfo', stepNumber: 2, stepName: 'basicInfo' },
          { key: 'menstrualHistory', stepNumber: 3, stepName: 'menstrualHistory' },
          { key: 'symptoms', stepNumber: 4, stepName: 'symptoms' },
          { key: 'medicalHistory', stepNumber: 5, stepName: 'medicalHistory' },
          { key: 'lifestyle', stepNumber: 6, stepName: 'lifestyle' },
          { key: 'goals', stepNumber: 7, stepName: 'goals' }
        ];
        
        const currentStepData = stepMapping.find(s => s.stepNumber === currentStep);
        if (currentStepData && formData[currentStepData.key]) {
          onboardingService.saveStep(
            user.id,
            currentStepData.stepNumber,
            currentStepData.stepName,
            formData[currentStepData.key]
          ).catch(error => {
            console.warn('⚠️ Supabase save failed, but data saved locally:', error);
          });
        }
        
        console.log('💾 Onboarding data saved with multiple backups:', {
          step: currentStep,
          dataKeys: Object.keys(formData),
          backupCount: backupKeys.length
        });
        
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        
        // Экстренное сохранение в случае ошибки
        try {
          localStorage.setItem('emergency_onboarding_backup', JSON.stringify({
            formData,
            currentStep,
            timestamp: new Date().toISOString(),
            userId: user.id
          }));
        } catch (emergencyError) {
          console.error('Emergency backup also failed:', emergencyError);
          showNotification('Критическая ошибка сохранения данных', 'error');
        }
      }
    };
    
    // Дебаунсим сохранение
    const timeoutId = setTimeout(saveOnboardingData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, user?.id, saveUserData]);

  // ✅ ИСПРАВЛЕНО: Улучшенная функция обновления данных с валидацией
  const updateFormData = (stepData: Partial<OnboardingData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...stepData };
      console.log('📝 Form data updated:', {
        step: currentStep,
        updated: Object.keys(stepData),
        newKeys: Object.keys(newData)
      });
      return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Detect menopause phase
      const phase = detectMenopausePhase(formData);
      
      // Generate recommendations
      const recs = generateRecommendations(
        phase,
        formData.symptoms!,
        formData.lifestyle!
      );

      setPhaseResult(phase);
      setRecommendations(recs);
      setShowResults(true);

      toast({
        title: 'Онбординг завершен!',
        description: 'Ваши данные проанализированы и сохранены.',
      });

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при завершении онбординга. Попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ УЛУЧШЕННОЕ завершение онбординга с восстановлением
  const handleOnboardingComplete = async () => {
    try {
      console.log('🎯 Starting onboarding completion process', {
        userId: user?.id,
        hasPhaseResult: !!phaseResult,
        hasRecommendations: !!recommendations,
        hasFormData: !!formData
      });

      // Clear forced onboarding flag
      sessionStorage.removeItem('forcedOnboarding');

      const onboardingSummary = {
        phaseResult,
        recommendations,
        formData,
        completedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // 1. Множественное сохранение финальных данных
      const finalData = {
        ...formData,
        phaseResult,
        recommendations,
        completedAt: new Date().toISOString(),
        version: '1.0',
        completed: true
      };
      
      // Сохранение в множественных источниках
      const savePromises = [
        saveUserData('onboarding_data', finalData),
        updateUser({ 
          onboardingCompleted: true,
          onboardingData: onboardingSummary
        })
      ];
      
      // Сохранение в localStorage резервы
      const backupKeys = [
        'onboardingCompleted',
        'onboardingData',
        'bloom-onboarding-completed',
        'eva_onboarding_completed'
      ];
      
      backupKeys.forEach(key => {
        try {
          if (key === 'onboardingCompleted') {
            localStorage.setItem(key, 'true');
          } else {
            localStorage.setItem(key, JSON.stringify(finalData));
          }
        } catch (error) {
          console.warn(`Failed to save ${key}:`, error);
        }
      });
      
      // 2. Завершение через AuthContext
      await Promise.all(savePromises);
      
      // 3. Завершение в Supabase
      await completeOnboarding(onboardingSummary);

      console.log('✅ Onboarding completed successfully with multiple backups');
      
      toast({
        title: 'Поздравляем!',
        description: 'Анкета завершена. Переходим к настройке профиля.',
      });

      // 4. Редирект на настройку профиля
      navigate('/patient/profile-setup', { replace: true });

    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      
      // Экстренное сохранение при ошибке
      try {
        localStorage.setItem('emergency_onboarding_complete', JSON.stringify({
          formData,
          phaseResult,
          recommendations,
          completedAt: new Date().toISOString(),
          completed: true,
          emergency: true
        }));
        
        toast({
          title: 'Данные сохранены',
          description: 'Онбординг сохранен локально. Попробуйте обновить страницу.',
          variant: 'destructive',
        });
      } catch (emergencyError) {
        console.error('Emergency save failed:', emergencyError);
        toast({
          title: 'Критическая ошибка',
          description: 'Не удалось сохранить данные. Пожалуйста, повторите попытку.',
          variant: 'destructive',
        });
      }
    }
  };

  // ✅ ИСПРАВЛЕНО: Правильная валидация для 7-шагового процесса с улучшенным логированием
  const canGoNext = () => {
    console.log(`🔍 Validating step ${currentStep}:`, {
      step: currentStep,
      formData: formData,
      stepName: ONBOARDING_STEPS[currentStep - 1]?.title
    });

    switch (currentStep) {
      case 1:
        return true; // Welcome step
      case 2:
        // BasicInfoStep - требуются обязательные поля
        const basicValid = formData.basicInfo && 
               formData.basicInfo.age > 0 && 
               formData.basicInfo.height > 0 && 
               formData.basicInfo.weight > 0;
        console.log(`📊 BasicInfo validation:`, { basicValid, data: formData.basicInfo });
        return basicValid;
      case 3:
        // MenstrualHistoryStep - требуется возраст первой менструации
        const menstrualValid = formData.menstrualHistory && 
               formData.menstrualHistory.ageOfFirstPeriod > 0;
        console.log(`🩸 MenstrualHistory validation:`, { menstrualValid, data: formData.menstrualHistory });
        return menstrualValid;
      case 4:
        // SymptomsStep - считается завершенным если:
        // 1. Заполнена хотя бы одна частота симптомов (включая "never") ИЛИ
        // 2. Выбрано "ничего из перечисленного" для физических/когнитивных симптомов
        const symptomsValid = formData.symptoms && (
          // Проверяем частотные симптомы
          (formData.symptoms.hotFlashes?.frequency !== undefined ||
           formData.symptoms.nightSweats?.frequency !== undefined ||
           formData.symptoms.sleepProblems?.frequency !== undefined ||
           formData.symptoms.moodChanges?.frequency !== undefined) ||
          // Или проверяем наличие данных о симптомах (включая "none_of_the_above")
          (formData.symptoms.physicalSymptoms?.length > 0 ||
           formData.symptoms.cognitiveSymptoms?.length > 0)
        );
        console.log(`😷 Symptoms validation:`, { 
          symptomsValid, 
          hasFrequencyData: !!(formData.symptoms?.hotFlashes?.frequency !== undefined ||
                              formData.symptoms?.nightSweats?.frequency !== undefined ||
                              formData.symptoms?.sleepProblems?.frequency !== undefined ||
                              formData.symptoms?.moodChanges?.frequency !== undefined),
          hasSymptomArrays: !!(formData.symptoms?.physicalSymptoms?.length > 0 ||
                              formData.symptoms?.cognitiveSymptoms?.length > 0),
          data: formData.symptoms 
        });
        return symptomsValid;
      case 5:
        // MedicalHistoryStep - принимаем любые данные (даже пустые массивы)
        const medicalValid = formData.medicalHistory !== undefined;
        console.log(`🏥 MedicalHistory validation:`, { medicalValid, data: formData.medicalHistory });
        return medicalValid;
      case 6:
        // LifestyleStep - считается завершенным если заполнены ключевые поля
        // Пользователь может пропустить детали, если выбрал базовые параметры
        const lifestyleValid = formData.lifestyle && 
               formData.lifestyle.exerciseFrequency !== undefined &&
               formData.lifestyle.dietType !== undefined &&
               formData.lifestyle.smokingStatus !== undefined &&
               formData.lifestyle.alcoholConsumption !== undefined &&
               formData.lifestyle.stressLevel !== undefined &&
               formData.lifestyle.sleepHours !== undefined;
        console.log(`🏃‍♀️ Lifestyle validation:`, { lifestyleValid, data: formData.lifestyle });
        return lifestyleValid;
      case 7:
        // GoalsStep - требуется выбор хотя бы одной цели или заботы
        const goalsValid = formData.goals && (
          (formData.goals.primaryConcerns && formData.goals.primaryConcerns.length > 0) ||
          (formData.goals.goals && formData.goals.goals.length > 0)
        );
        console.log(`🎯 Goals validation:`, { goalsValid, data: formData.goals });
        return goalsValid;
      default:
        console.warn(`⚠️ Unknown step ${currentStep}`);
        return false;
    }
  };

  // Show loading state during recovery
  if (isLoading) {
    return (
      <PatientLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Восстанавливаем ваши данные...</h2>
            <p className="text-gray-500">Пожалуйста, подождите</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // Show the onboarding results without geolocation step
  if (showResults) {
    return (
      <PatientLayout>
        <OnboardingResults
          phaseResult={phaseResult}
          recommendations={recommendations}
          onboardingData={formData}
          onComplete={handleOnboardingComplete}
        />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <OnboardingProgress 
            currentStep={currentStep} 
            totalSteps={TOTAL_STEPS}
            stepTitles={stepTitles}
          />
          
          <div className="space-y-6"
          >
            {/* Шаг 1: Добро пожаловать */}
            {currentStep === 1 && (
              <WelcomeStep 
                onNext={handleNext}
              />
            )}

            {/* Шаги 2-7: С навигацией */}
            {currentStep > 1 && (
              <div className="space-y-6">
                <div className="bloom-card p-6">
                  <h2 className="text-2xl font-playfair font-bold text-foreground mb-6">
                    {stepTitles[currentStep - 1]}
                  </h2>
                  
                  {/* Шаг 2: Базовая информация */}
                  {currentStep === 2 && (
                    <BasicInfoStep
                      data={formData.basicInfo}
                      onChange={(data) => updateFormData({ basicInfo: data })}
                    />
                  )}

                  {/* Шаг 3: Менструальная история */}
                  {currentStep === 3 && (
                    <MenstrualHistoryStep
                      data={formData.menstrualHistory}
                      onChange={(data) => updateFormData({ menstrualHistory: data })}
                    />
                  )}

                  {/* Шаг 4: Симптомы */}
                  {currentStep === 4 && (
                    <SymptomsStep
                      data={formData.symptoms}
                      onChange={(data) => updateFormData({ symptoms: data })}
                    />
                  )}

                  {/* Шаг 5: Медицинская история */}
                  {currentStep === 5 && (
                    <MedicalHistoryStep
                      data={formData.medicalHistory}
                      onChange={(data) => updateFormData({ medicalHistory: data })}
                    />
                  )}

                  {/* Шаг 6: Образ жизни */}
                  {currentStep === 6 && (
                    <LifestyleStep
                      data={formData.lifestyle}
                      onChange={(data) => updateFormData({ lifestyle: data })}
                    />
                  )}

                  {/* Шаг 7: Цели */}
                  {currentStep === 7 && (
                    <GoalsStep
                      data={formData.goals}
                      onChange={(data) => updateFormData({ goals: data })}
                    />
                  )}
                  
                  {/* Навигационные кнопки */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrev}
                      disabled={currentStep === 1}
                      className="px-6 py-2 border border-muted-foreground/20 text-muted-foreground rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Назад
                    </button>
                    
                    <button
                      onClick={currentStep === TOTAL_STEPS ? handleComplete : handleNext}
                      disabled={!canGoNext()}
                      className="px-6 py-2 bloom-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Загрузка...' : currentStep === TOTAL_STEPS ? 'Завершить' : 'Далее'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};


// ✅ НОВОЕ: Вспомогательная функция для получения названия персоны
const getPersonaTitle = (personaId: string) => {
  const titles = {
    'first_signs': 'Первые признаки',
    'active_phase': 'Активная фаза', 
    'postmenopause': 'Постменопауза'
  };
  return titles[personaId as keyof typeof titles] || 'Персональный профиль';
};

export default PatientOnboarding;
