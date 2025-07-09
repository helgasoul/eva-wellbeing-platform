
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
import { detectMenopausePhase } from '@/utils/menopausePhaseDetector';
import { generateRecommendations } from '@/utils/personalizedRecommendations';
import { toast } from '@/hooks/use-toast';
import { dataBridge, OnboardingPresets } from '@/services/dataBridge';

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'bloom-onboarding-data';

const stepTitles = [
  'Добро пожаловать',
  'Базовая информация',
  'Местоположение и климат',
  'История менструального цикла',
  'Текущие симптомы',
  'Медицинская история',
  'Образ жизни',
  'Цели и приоритеты'
];

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
  
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  // ✅ ИСПРАВЛЕНИЕ: Загружаем данные через DataBridge
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        // 1. Пытаемся загрузить данные через DataBridge
        const presets = dataBridge.getOnboardingPresets();
        
        if (presets) {
          console.log('✅ Loading data via DataBridge:', presets);
          setOnboardingPresets(presets);
          
          // Предзаполняем данные из DataBridge
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
          console.log('⚠️ No DataBridge presets found, falling back to legacy method');
          
          // 2. Fallback: проверяем старый метод
          const legacyPresets = localStorage.getItem('eva_onboarding_presets');
          if (legacyPresets) {
            try {
              const presets = JSON.parse(legacyPresets);
              console.log('✅ Loading legacy registration presets:', presets);
              
              const presetsFormData = {
                basicInfo: {
                  age: 0,
                  height: 0,
                  weight: 0,
                  location: '',
                  occupation: '',
                  hasChildren: false,
                  ...presets.basicInfo
                },
                registrationPersona: presets.personaId,
                fromRegistration: true,
                expectedPath: presets.expectedOnboardingPath
              };
              
              setFormData(presetsFormData);
              setDataLoadingStatus(prev => ({ ...prev, registration: true }));
              
              toast({
                title: 'Добро пожаловать!',
                description: `Анкета подготовлена для профиля "${getPersonaTitle(presets.personaId)}"`,
              });
              
            } catch (error) {
              console.error('Failed to load registration presets:', error);
            }
          }
        }
        
        // 3. Загружаем сохраненный прогресс онбординга
        const savedOnboardingData = localStorage.getItem(STORAGE_KEY);
        if (savedOnboardingData) {
          try {
            const saved = JSON.parse(savedOnboardingData);
            setFormData(prev => ({ ...prev, ...saved }));
            setDataLoadingStatus(prev => ({ ...prev, onboarding: true }));
            console.log('✅ Loading saved onboarding progress');
          } catch (error) {
            console.error('Failed to load saved onboarding data:', error);
          }
        }
        
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      }
    };
    
    loadOnboardingData();
  }, []);

  // Save data whenever formData changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = (stepData: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
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
      // ✅ ИСПРАВЛЕНИЕ: Используем AuthContext для завершения онбординга
      // Подготавливаем данные онбординга для сохранения
      const onboardingSummary = {
        phaseResult,
        recommendations,
        formData,
        completedAt: new Date().toISOString()
      };
      
      // Завершаем онбординг через AuthContext
      await completeOnboarding(onboardingSummary);
      
      // ✅ Используем DataBridge для безопасной очистки
      dataBridge.cleanupTransferData();
      
      // Очищаем локальные данные онбординга
      localStorage.removeItem(STORAGE_KEY);
      
      // Navigate to patient dashboard
      navigate('/patient/dashboard');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при завершении онбординга. Попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Welcome step
      case 2:
        // BasicInfoStep - требуются обязательные поля
        return formData.basicInfo && 
               formData.basicInfo.age > 0 && 
               formData.basicInfo.height > 0 && 
               formData.basicInfo.weight > 0;
      case 3:
        // GeolocationStep - требуется выбранное местоположение
        return !!(formData.geolocation && 
                formData.geolocation.location && 
                formData.geolocation.weather);
      case 4:
        // MenstrualHistoryStep - требуется возраст первой менструации
        return formData.menstrualHistory && 
               formData.menstrualHistory.ageOfFirstPeriod > 0;
      case 5:
        // SymptomsStep - требуется хотя бы заполнение базовых симптомов
        return formData.symptoms && (
          formData.symptoms.hotFlashes?.frequency !== undefined ||
          formData.symptoms.nightSweats?.frequency !== undefined ||
          formData.symptoms.sleepProblems?.frequency !== undefined ||
          formData.symptoms.moodChanges?.frequency !== undefined
        );
      case 6:
        // MedicalHistoryStep - принимаем любые данные (даже пустые массивы)
        return formData.medicalHistory !== undefined;
      case 7:
        // LifestyleStep - требуется заполнение основных полей
        return formData.lifestyle && 
               formData.lifestyle.exerciseFrequency !== undefined &&
               formData.lifestyle.dietType !== undefined &&
               formData.lifestyle.smokingStatus !== undefined &&
               formData.lifestyle.alcoholConsumption !== undefined;
      case 8:
        // GoalsStep - требуется выбор хотя бы одной цели или заботы
        return formData.goals && (
          (formData.goals.primaryConcerns && formData.goals.primaryConcerns.length > 0) ||
          (formData.goals.goals && formData.goals.goals.length > 0)
        );
      default:
        return false;
    }
  };

  if (showResults && phaseResult && recommendations) {
    return (
      <PatientLayout title="Результаты онбординга">
        <OnboardingResults
          phaseResult={phaseResult}
          recommendations={recommendations}
          onComplete={handleOnboardingComplete}
        />
      </PatientLayout>
    );
  }

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
          <GeolocationStep
            data={formData.geolocation}
            onChange={(data) => updateFormData({ geolocation: { ...data, recordedAt: new Date().toISOString() } })}
          />
        );
      case 4:
        return (
          <MenstrualHistoryStep
            data={formData.menstrualHistory}
            onChange={(data) => updateFormData({ menstrualHistory: data })}
          />
        );
      case 5:
        return (
          <SymptomsStep
            data={formData.symptoms}
            onChange={(data) => updateFormData({ symptoms: data })}
          />
        );
      case 6:
        return (
          <MedicalHistoryStep
            data={formData.medicalHistory}
            onChange={(data) => updateFormData({ medicalHistory: data })}
          />
        );
      case 7:
        return (
          <LifestyleStep
            data={formData.lifestyle}
            onChange={(data) => updateFormData({ lifestyle: data })}
          />
        );
      case 8:
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
    <PatientLayout title={onboardingPresets ? `Персональная анкета для "${getPersonaTitle(onboardingPresets.persona.id)}"` : "Онбординг bloom"}>
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
