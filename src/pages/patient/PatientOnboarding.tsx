
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
import { OnboardingData } from '@/types/onboarding';
import { detectMenopausePhase } from '@/utils/menopausePhaseDetector';
import { generateRecommendations } from '@/utils/personalizedRecommendations';
import { toast } from '@/hooks/use-toast';

const TOTAL_STEPS = 7;
const STORAGE_KEY = 'eva-onboarding-data';

const stepTitles = [
  'Добро пожаловать',
  'Базовая информация',
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
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to load saved onboarding data:', error);
      }
    }
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

  const handleOnboardingComplete = () => {
    // Clear saved data
    localStorage.removeItem(STORAGE_KEY);
    
    // Mark onboarding as completed in user context
    // This would typically involve an API call to update user profile
    
    // Navigate to patient dashboard
    navigate('/patient/dashboard');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Welcome step
      case 2:
        return formData.basicInfo && 
               formData.basicInfo.age > 0 && 
               formData.basicInfo.height > 0 && 
               formData.basicInfo.weight > 0;
      case 3:
        return formData.menstrualHistory && 
               formData.menstrualHistory.ageOfFirstPeriod > 0;
      case 4:
        return formData.symptoms !== undefined;
      case 5:
        return formData.medicalHistory !== undefined;
      case 6:
        return formData.lifestyle !== undefined;
      case 7:
        return formData.goals !== undefined;
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
        return <WelcomeStep />;
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
    <PatientLayout title="Онбординг Eva">
      <div className="min-h-screen">
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
            description="Пожалуйста, заполните информацию для персонализации вашего опыта"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eva-dusty-rose mx-auto mb-4"></div>
              <p className="text-foreground">Анализируем ваши данные...</p>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default PatientOnboarding;
