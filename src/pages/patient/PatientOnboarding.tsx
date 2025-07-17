
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

// ✅ ИСПРАВЛЕНО: Правильная 7-шаговая структура онбординга
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
  const [showGeolocation, setShowGeolocation] = useState(false); // ✅ НОВОЕ: состояние для геолокации
  const [phaseResult, setPhaseResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [onboardingPresets, setOnboardingPresets] = useState<OnboardingPresets | null>(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState({
    registration: false,
    onboarding: false,
    dataBridge: false,
    geolocation: false // ✅ НОВОЕ: статус геолокации
  });
  
  const { user, completeOnboarding, updateUser, saveUserData, loadUserData } = useAuth();
  const navigate = useNavigate();

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверка статуса онбординга при загрузке
  useEffect(() => {
    if (!user) return;

    // Проверяем, завершен ли онбординг в профиле пользователя
    if (user.onboardingCompleted) {
      console.log('✅ User has already completed onboarding, redirecting to dashboard');
      navigate('/patient/dashboard', { replace: true });
      return;
    }

    // Проверяем миграцию данных из localStorage
    const migrationResult = migrateOnboardingData();
    if (migrationResult.migrationPerformed && migrationResult.onboardingCompleted) {
      console.log('✅ Migrated onboarding completion from localStorage');
      
      // Обновляем пользователя через AuthContext
      updateUser({ 
        onboardingCompleted: true,
        onboardingData: migrationResult.onboardingData
      });
      
      // Показываем уведомление и перенаправляем
      toast({
        title: 'Добро пожаловать обратно!',
        description: 'Ваши данные онбординга восстановлены',
      });
      
      navigate('/patient/dashboard', { replace: true });
      return;
    }

    console.log('🔄 User needs to complete onboarding');
  }, [user, navigate, updateUser]);

  // ✅ УЛУЧШЕННАЯ ЗАГРУЗКА: Загружаем данные через DataBridge
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user?.id) return;
      
      try {
        console.log('🔄 PatientOnboarding: Загрузка данных через DataBridge...');
        
        // 1. Сначала пытаемся загрузить сохраненный прогресс
        const savedProgress = await loadUserData('onboarding_progress');
        if (savedProgress) {
          setFormData(prev => ({ ...prev, ...savedProgress.data }));
          setCurrentStep(savedProgress.currentStep || 1);
          setDataLoadingStatus(prev => ({ ...prev, onboarding: true }));
          console.log(`📥 PatientOnboarding: Восстановлен прогресс на шаге ${savedProgress.currentStep}`);
          
          toast({
            title: 'Прогресс восстановлен',
            description: 'Ваши данные онбординга загружены',
          });
          return;
        }

        // 2. Загружаем данные из Supabase
        const { data: supabaseData } = await onboardingService.loadUserOnboarding(user.id);
        
        if (supabaseData && Object.keys(supabaseData).length > 0) {
          console.log('✅ Loading onboarding data from Supabase:', Object.keys(supabaseData));
          setFormData(supabaseData);
          setDataLoadingStatus(prev => ({ ...prev, onboarding: true }));
          
          toast({
            title: 'Прогресс восстановлен',
            description: 'Ваши данные онбординга загружены из облака',
          });
        } else {
          // 3. Fallback: пытаемся загрузить данные через DataBridge
          const dataBridge = DataBridge.getInstance();
          const presets = dataBridge.getOnboardingPresets();
          
          if (presets) {
            console.log('✅ Loading data via DataBridge:', presets);
            setOnboardingPresets(presets);
            
            const presetsFormData = {
              basicInfo: {
                age: 0,
                height: 0,
                weight: 0,
                location: '',
                occupation: '',
                hasChildren: false,
                ...presets.prefills.basicInfo
              },
              registrationPersona: presets.persona.id,
              fromRegistration: true,
              expectedPath: presets.persona.onboardingPath,
              onboardingConfig: presets.onboardingConfig
            };
            
            setFormData(presetsFormData);
            setDataLoadingStatus(prev => ({ ...prev, dataBridge: true }));
            
            toast({
              title: 'Персональная анкета готова!',
              description: `Анкета адаптирована для профиля "${getPersonaTitle(presets.persona.id)}" • ${presets.onboardingConfig.estimatedDuration}`,
            });
          } else {
            // 4. Последний fallback: localStorage
            const savedOnboardingData = localStorage.getItem(STORAGE_KEY);
            if (savedOnboardingData) {
              try {
                const saved = JSON.parse(savedOnboardingData);
                setFormData(saved);
                setDataLoadingStatus(prev => ({ ...prev, onboarding: true }));
                console.log('✅ Loading saved onboarding progress from localStorage');
              } catch (error) {
                console.error('Failed to load saved onboarding data:', error);
              }
            }
          }
        }
        
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      }
    };
    
    loadOnboardingData();
  }, [user?.id, loadUserData]);

  // ✅ УЛУЧШЕННОЕ АВТОСОХРАНЕНИЕ: Через DataBridge с резервированием в Supabase
  useEffect(() => {
    const saveOnboardingData = async () => {
      if (!user?.id || Object.keys(formData).length === 0) return;
      
      try {
        // 1. Автосохранение прогресса через DataBridge
        await saveUserData('onboarding_progress', {
          data: formData,
          currentStep,
          timestamp: new Date().toISOString()
        });

        // 2. Резервное сохранение в localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        
        // 3. Определяем какой шаг сохранять в Supabase
        const stepMapping = [
          { key: 'basicInfo', stepNumber: 2, stepName: 'basicInfo' },
          { key: 'menstrualHistory', stepNumber: 3, stepName: 'menstrualHistory' },
          { key: 'symptoms', stepNumber: 4, stepName: 'symptoms' },
          { key: 'medicalHistory', stepNumber: 5, stepName: 'medicalHistory' },
          { key: 'lifestyle', stepNumber: 6, stepName: 'lifestyle' },
          { key: 'goals', stepNumber: 7, stepName: 'goals' }
        ];
        
        // 4. Асинхронно сохраняем в Supabase (не блокируем UI)
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
        
        console.log('💾 Onboarding data auto-saved:', {
          step: currentStep,
          dataKeys: Object.keys(formData),
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        // Показываем уведомление только при критической ошибке
        if (!localStorage.getItem(STORAGE_KEY)) {
          showNotification('Ошибка сохранения прогресса', 'warning');
        }
      }
    };
    
    // Дебаунсим сохранение для избежания избыточных запросов
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

  // ✅ НОВОЕ: Обработка геолокационного шага после основного онбординга
  const handleGeolocationComplete = async (data: { location: any, weather: any }) => {
    try {
      const { location, weather } = data;
      
      const geolocationData = {
        location,
        weather,
        recordedAt: new Date().toISOString()
      };

      // Обновляем данные формы
      updateFormData({ geolocation: geolocationData });

      // Сохраняем местоположение пользователя в базу данных
      if (user?.id) {
        const { error: locationError } = await supabase
          .from('user_locations')
          .upsert({
            user_id: user.id,
            location_data: location,
            is_active: true
          });

        if (locationError) {
          console.error('Error saving user location:', locationError);
        }

        // Сохраняем погодные данные
        await weatherService.saveWeatherData(user.id, location, weather);
        
        console.log('✅ Location and weather data saved for user:', user.id);
      }

      setDataLoadingStatus(prev => ({ ...prev, geolocation: true }));
      setShowGeolocation(false);
      setShowResults(true); // ✅ ИСПРАВЛЕНО: возвращаемся к результатам
      
      toast({
        title: 'Геолокация настроена!',
        description: 'Теперь вы будете получать персонализированные рекомендации на основе климата.',
      });

    } catch (error) {
      console.error('Error handling geolocation completion:', error);
      toast({
        title: 'Ошибка геолокации',
        description: 'Не удалось сохранить данные местоположения. Вы можете настроить это позже.',
        variant: 'destructive',
      });
    }
  };

  const handleStartGeolocation = () => {
    setShowResults(false);
    setShowGeolocation(true);
  };

  const handleSkipGeolocation = () => {
    console.log('📍 User skipped geolocation setup');
    setShowGeolocation(false);
    setShowResults(true); // ✅ ИСПРАВЛЕНО: возвращаемся к результатам без геолокации
  };

  const handleOnboardingComplete = async () => {
    try {
      console.log('🎯 Starting onboarding completion process', {
        userId: user?.id,
        hasPhaseResult: !!phaseResult,
        hasRecommendations: !!recommendations,
        hasFormData: !!formData,
        hasGeolocation: !!formData.geolocation
      });

      // Clear forced onboarding flag
      sessionStorage.removeItem('forcedOnboarding');
      console.log('🧹 Cleared forced onboarding flag');

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сначала обновляем статус в AuthContext
      const onboardingSummary = {
        phaseResult,
        recommendations,
        formData,
        completedAt: new Date().toISOString()
      };
      
      // 1. Сохраняем финальные данные через DataBridge
      await saveUserData('onboarding_data', {
        ...formData,
        phaseResult,
        recommendations,
        completedAt: new Date().toISOString(),
        version: '1.0'
      });

      // 2. Обновляем пользователя локально для немедленного эффекта
      await updateUser({ 
        onboardingCompleted: true,
        onboardingData: onboardingSummary
      });
      
      // 3. Сохраняем в localStorage для совместимости
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('onboardingData', JSON.stringify(onboardingSummary));
      
      // 4. Асинхронно завершаем онбординг в Supabase
      try {
        await completeOnboarding(onboardingSummary);
        console.log('✅ Onboarding saved to Supabase');
      } catch (supabaseError) {
        console.warn('⚠️ Failed to save onboarding to Supabase, but user updated locally:', supabaseError);
      }
      
      // 5. Очищаем временные данные
      const dataBridge = DataBridge.getInstance();
      dataBridge.cleanupTransferData();
      await saveUserData('onboarding_progress', null); // Очищаем прогресс
      localStorage.removeItem(STORAGE_KEY);
      
      console.log('✅ Onboarding completion successful, navigating to dashboard');
      
      // 5. Перенаправляем на dashboard
      navigate('/patient/dashboard', { replace: true });
      
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при завершении онбординга. Попробуйте еще раз.',
        variant: 'destructive',
      });
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

  // ✅ НОВОЕ: Рендеринг геолокационного шага
  if (showGeolocation) {
    return (
      <PatientLayout title="Настройка персонализации" hideSidebar={true}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-playfair font-bold text-foreground mb-2">
              Последний шаг - настроим геолокацию
            </h2>
            <p className="text-muted-foreground">
              Это поможет получать персонализированные рекомендации на основе климата и окружающей среды
            </p>
          </div>
          
          <GeolocationStep
            data={formData.geolocation}
            onChange={handleGeolocationComplete}
            onSkip={handleSkipGeolocation}
          />
        </div>
      </PatientLayout>
    );
  }

  if (showResults && phaseResult && recommendations) {
    return (
      <PatientLayout title="Результаты онбординга" hideSidebar={true}>
        <OnboardingResults
          phaseResult={phaseResult}
          recommendations={recommendations}
          onboardingData={formData}
          onComplete={handleOnboardingComplete}
          onSetupGeolocation={handleStartGeolocation}
          hasGeolocation={!!formData.geolocation}
        />
      </PatientLayout>
    );
  }

  // ✅ ИСПРАВЛЕНО: Правильная последовательность шагов 1-7
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={(data) => updateFormData({ basicInfo: data })}
          />
        );
      case 3:
        return (
          <MenstrualHistoryStep
            data={formData.menstrualHistory}
            onChange={(data) => updateFormData({ menstrualHistory: data })}
          />
        );
      case 4:
        return (
          <SymptomsStep
            data={formData.symptoms}
            onChange={(data) => updateFormData({ symptoms: data })}
          />
        );
      case 5:
        return (
          <MedicalHistoryStep
            data={formData.medicalHistory}
            onChange={(data) => updateFormData({ medicalHistory: data })}
          />
        );
      case 6:
        return (
          <LifestyleStep
            data={formData.lifestyle}
            onChange={(data) => updateFormData({ lifestyle: data })}
          />
        );
      case 7:
        return (
          <GoalsStep
            data={formData.goals}
            onChange={(data) => updateFormData({ goals: data })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PatientLayout title={onboardingPresets ? `Персональная анкета для "${getPersonaTitle(onboardingPresets.persona.id)}"` : "Онбординг без | паузы"} hideSidebar={true}>
      <div className="min-h-screen">
        {/* ✅ НОВОЕ: Индикатор загрузки данных */}
        {(dataLoadingStatus.dataBridge || dataLoadingStatus.registration) && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800">
                ✅ Данные из регистрации загружены
                {onboardingPresets && ` • ${onboardingPresets.onboardingConfig.estimatedDuration}`}
              </span>
            </div>
          </div>
        )}

        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepTitles={stepTitles}
        />

        {currentStep === 1 ? (
          renderCurrentStep()
        ) : (
          <StepWrapper
            title={stepTitles[currentStep - 1]}
            description={onboardingPresets ? 
              `Персонализированные вопросы для вашего профиля "${getPersonaTitle(onboardingPresets.persona.id)}"` :
              "Пожалуйста, заполните информацию для персонализации вашего опыта"
            }
            onNext={handleNext}
            onPrev={handlePrev}
            canGoNext={canGoNext()}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === TOTAL_STEPS}
          >
            {renderCurrentStep()}
          </StepWrapper>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bloom-dusty-rose mx-auto mb-4"></div>
              <p className="text-foreground">Анализируем ваши данные...</p>
            </div>
          </div>
        )}

        {/* ✅ НОВОЕ: Отладочная информация для диагностики проблем */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-sm">🔍 Debug Info:</h3>
            <div className="text-xs space-y-1">
              <p>Current Step: {currentStep}/{TOTAL_STEPS}</p>
              <p>Step Title: {stepTitles[currentStep - 1]}</p>
              <p>Can Go Next: {canGoNext() ? '✅' : '❌'}</p>
              <p>Form Data Keys: {Object.keys(formData).join(', ')}</p>
              <p>Data Status: {JSON.stringify(dataLoadingStatus)}</p>
            </div>
            <details className="mt-2">
              <summary className="text-xs font-medium cursor-pointer">View Form Data</summary>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </details>
          </div>
        )}
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
