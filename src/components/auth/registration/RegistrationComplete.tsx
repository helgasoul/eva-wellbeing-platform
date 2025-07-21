
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/context/RegistrationContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Sparkles, Heart, Shield, ArrowRight, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { PersonaType } from '@/types/auth';

const menopausePersonas = {
  first_signs: {
    title: 'Первые признаки',
    icon: <Sparkles className="h-8 w-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  active_phase: {
    title: 'Активная фаза',
    icon: <Heart className="h-8 w-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  postmenopause: {
    title: 'Постменопауза',
    icon: <Shield className="h-8 w-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
};

export const RegistrationComplete: React.FC = () => {
  const { state, resetRegistration } = useRegistration();
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [isDataTransferred, setIsDataTransferred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedPersona = state.step3Data.selectedPersona 
    ? menopausePersonas[state.step3Data.selectedPersona as keyof typeof menopausePersonas]
    : null;

  const handleCompleteRegistration = async () => {
    try {
      setIsLoading(true);
      
      // Mock registration completion for m4p
      const registrationData = {
        firstName: state.step4Data.firstName,
        lastName: state.step4Data.lastName, 
        email: state.step1Data.email,
        role: 'patient',
        selectedPersona: state.step3Data.selectedPersona,
        agreedToTerms: true,
        agreedToPrivacy: true,
        registrationCompleted: true
      };
      
      // Mock data transfer
      try {
        localStorage.setItem('registration_data', JSON.stringify(registrationData));
        localStorage.setItem('onboarding_presets', JSON.stringify({
          persona: state.step3Data.selectedPersona,
          userName: state.step4Data.firstName,
          startStep: getPersonaStartStep(state.step3Data.selectedPersona)
        }));
      } catch (error) {
        console.warn('Storage not available, continuing without persistence');
      }
      
      setIsDataTransferred(true);
      
      toast({
        title: 'Регистрация завершена!',
        description: `Добро пожаловать, ${state.step4Data.firstName}!`,
      });
      
    } catch (error) {
      console.error('Error completing registration:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при завершении регистрации',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.isCompleted && !isDataTransferred) {
      handleCompleteRegistration();
    }
  }, [state.isCompleted, isDataTransferred]);

  const handleContinueManually = async () => {
    if (!isDataTransferred) {
      toast({
        title: 'Подождите',
        description: 'Завершается подготовка ваших данных...',
        variant: 'default',
      });
      return;
    }

    try {
      // Clear registration context
      resetRegistration();
      
      // Navigate to dashboard for m4p
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Error completing registration:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить регистрацию. Попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isDataTransferred) {
      const timer = setTimeout(() => {
        handleContinueManually();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isDataTransferred]);

  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bloom-card p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-playfair font-bold text-foreground mb-4">
            Добро пожаловать в Eva! 
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Ваш профиль создан успешно. Сейчас мы подготавливаем персонализированную анкету 
            специально для вашего этапа.
          </p>

          <div className="bg-card rounded-lg p-4 mb-6 border border-muted">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Статус подготовки
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Сохранение профиля</span>
                <span className="text-green-600">✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Подготовка данных</span>
                <span className={isDataTransferred ? "text-green-600" : "text-yellow-600"}>
                  {isDataTransferred ? "✅" : "⏳"}
                </span>
              </div>
            </div>
          </div>
          
          {selectedPersona && (
            <div className={`${selectedPersona.bgColor} rounded-lg p-4 mb-6 border border-muted`}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={selectedPersona.color}>
                  {selectedPersona.icon}
                </div>
                <h3 className="font-semibold text-foreground">
                  Профиль: {selectedPersona.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Рекомендации будут адаптированы под ваш текущий этап
              </p>
            </div>
          )}

          <Button
            onClick={handleContinueManually}
            disabled={!isDataTransferred}
            className={`w-full mb-4 ${
              isDataTransferred 
                ? 'bloom-button' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isDataTransferred ? 'Перейти к платформе' : 'Подготовка данных...'}
          </Button>
          
          {isDataTransferred ? (
            <p className="text-xs text-muted-foreground">
              Автоматический переход через 3 секунды...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Пожалуйста, подождите завершения подготовки...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const getPersonaStartStep = (persona: string | null) => {
  switch(persona) {
    case 'first_signs': return 1;
    case 'active_phase': return 2; 
    case 'postmenopause': return 3;
    default: return 1;
  }
};
