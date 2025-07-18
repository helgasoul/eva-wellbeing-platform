
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

  // ✅ ИСПРАВЛЕНИЕ: Инициализация данных онбординга
  useEffect(() => {
    // Загружаем данные из всех источников
    loadOnboardingData();
  }, [user]);

  const loadOnboardingData = () => {
    try {
      // 1. Данные из AuthContext (приоритет)
      const userData = user;
      
      // 2. Данные из localStorage
      const registrationData = JSON.parse(localStorage.getItem('registration_data') || '{}');
      const onboardingPresets = JSON.parse(localStorage.getItem('onboarding_presets') || '{}');
      const savedProgress = JSON.parse(localStorage.getItem(`onboarding_progress_${user?.id}`) || '{}');
      
      // 3. Объединяем данные
      const mergedData = {
        // Базовая информация из регистрации
        firstName: userData?.firstName || registrationData.firstName,
        lastName: userData?.lastName || registrationData.lastName,
        email: userData?.email || registrationData.email,
        selectedPersona: (userData as any)?.selectedPersona || onboardingPresets.persona,
        
        // Прогресс онбординга
        ...savedProgress,
        
        // Предзаполненные поля на основе персоны
        ...getPersonaDefaults(onboardingPresets.persona)
      };
      
      // 4. Устанавливаем данные и текущий шаг
      setFormData(prev => ({ ...prev, ...mergedData }));
      
      // Если есть сохраненный прогресс и онбординг не завершен
      if (savedProgress.currentStep && !savedProgress.completed) {
        setCurrentStep(savedProgress.currentStep);
      } else if (onboardingPresets.startStep) {
        setCurrentStep(onboardingPresets.startStep);
      }
      
      console.log('Данные онбординга загружены:', mergedData);
      
    } catch (error) {
      console.error('Ошибка загрузки данных онбординга:', error);
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
      console.log('🧹 Cleared forced onboarding flag');

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сначала обновляем статус в AuthContext
      const onboardingSummary = {
        phaseResult,
        recommendations,
        formData,
        completedAt: new Date().toISOString()
      };
      
      // 1. Сохраняем финальные данные через AuthContext
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

      // 4. Используем completeOnboarding для финальной записи в базу
      await completeOnboarding(onboardingSummary);

      console.log('✅ Onboarding completed successfully, redirecting to profile setup');
      
      toast({
        title: 'Поздравляем!',
        description: 'Анкета завершена. Переходим к настройке профиля.',
      });

      // 5. Редирект на настройку профиля (геолокация)
      navigate('/patient/profile-setup', { replace: true });

    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Произошла ошибка при сохранении данных. Попробуйте еще раз.',
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
