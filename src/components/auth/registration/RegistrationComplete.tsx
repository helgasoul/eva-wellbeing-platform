import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/context/RegistrationContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Sparkles, Heart, Shield, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const { completeRegistration } = useAuth();
  const navigate = useNavigate();
  
  const selectedPersona = state.step3Data.selectedPersona 
    ? menopausePersonas[state.step3Data.selectedPersona]
    : null;

  useEffect(() => {
    // Завершаем регистрацию в системе аутентификации
    const completeAuthRegistration = async () => {
      try {
        const registrationData = {
          step1: state.step1Data,
          step2: state.step2Data,
          step3: {
            personaId: state.step3Data.selectedPersona!,
            additionalData: state.step3Data.additionalAnswers
          },
          password: state.step4Data.password,
          firstName: state.step4Data.firstName,
          lastName: state.step4Data.lastName
        };

        // Используем новый метод из AuthContext
        const newUser = await completeRegistration(registrationData);
        
        toast({
          title: 'Регистрация завершена!',
          description: `Добро пожаловать, ${newUser.firstName}!`,
        });

        // Автоматический переход к онбордингу через 3 секунды
        setTimeout(() => {
          resetRegistration();
          navigate('/patient/onboarding');
        }, 3000);
        
      } catch (error) {
        console.error('Ошибка завершения регистрации:', error);
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Произошла ошибка при завершении регистрации',
          variant: 'destructive',
        });
      }
    };

    if (state.isCompleted) {
      completeAuthRegistration();
    }
  }, [state, completeRegistration, navigate, resetRegistration]);

  const handleContinueManually = () => {
    resetRegistration();
    navigate('/patient/onboarding');
  };

  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bloom-card p-8">
          {/* Иконка успеха */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-playfair font-bold text-foreground mb-4">
            Добро пожаловать в Eva! 
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Ваш профиль создан успешно. Сейчас мы перейдем к детальному анкетированию 
            для персонализации рекомендаций.
          </p>
          
          {/* Информация о выбранной персоне */}
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
          
          {/* Что дальше */}
          <div className="bg-card rounded-lg p-4 mb-6 border border-muted">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Что дальше?
            </h3>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">📋</span>
                <span>Медицинская анкета (5-7 минут)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">🎯</span>
                <span>Персональные рекомендации</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">📊</span>
                <span>Начало отслеживания симптомов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">💬</span>
                <span>Доступ к AI-помощнику</span>
              </li>
            </ul>
          </div>

          {/* Кнопка продолжения */}
          <Button
            onClick={handleContinueManually}
            className="bloom-button w-full mb-4"
          >
            Продолжить к анкете
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Переход произойдет автоматически через несколько секунд...
          </p>
        </div>

        {/* Мотивирующее сообщение */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
          <p className="text-sm text-foreground">
            <strong>🌟 Вы сделали важный шаг!</strong> <br />
            Теперь у вас есть персональный помощник для навигации через этот важный этап жизни.
          </p>
        </div>
      </div>
    </div>
  );
};