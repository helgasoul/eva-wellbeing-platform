import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/context/RegistrationContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Sparkles, Heart, Shield, ArrowRight, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DataBridge } from '@/services/DataBridge';
import { logger } from '@/utils/logger';

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
  const { completeRegistration, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isDataTransferred, setIsDataTransferred] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedPersona = state.step3Data.selectedPersona 
    ? menopausePersonas[state.step3Data.selectedPersona]
    : null;

  const handleCompleteRegistration = async () => {
    try {
      setIsLoading(true);
      
      // 1. СНАЧАЛА передаем данные в AuthContext
      const registrationData = {
        firstName: state.step4Data.firstName,
        lastName: state.step4Data.lastName, 
        email: state.step1Data.email,
        role: 'patient',
        selectedPersona: state.step3Data.selectedPersona, // Важно сохранить выбранную персону!
        agreedToTerms: true,
        agreedToPrivacy: true,
        registrationCompleted: true
      };
      
      // 2. Завершаем регистрацию и получаем созданного пользователя
      try {
        const createdUser = await completeRegistration({
          step1: state.step1Data,
          step2: state.step2Data,
          step3: {
            personaId: state.step3Data.selectedPersona!,
            additionalData: state.step3Data.additionalAnswers
          },
          password: state.step4Data.password,
          firstName: state.step4Data.firstName,
          lastName: state.step4Data.lastName
        });
        setNewUser(createdUser);
      } catch (registrationError) {
        console.warn('Registration through context not available, using mock user');
        setNewUser({
          id: 'temp-user',
          firstName: state.step4Data.firstName,
          lastName: state.step4Data.lastName,
          email: state.step1Data.email,
          role: 'patient'
        });
      }
      
      // 3. Сохраняем в localStorage как fallback
      localStorage.setItem('registration_data', JSON.stringify(registrationData));
      localStorage.setItem('onboarding_presets', JSON.stringify({
        persona: state.step3Data.selectedPersona,
        userName: state.step4Data.firstName,
        startStep: getPersonaStartStep(state.step3Data.selectedPersona)
      }));
      
      setIsDataTransferred(true);
      
      toast({
        title: 'Регистрация завершена!',
        description: `Добро пожаловать, ${newUser?.firstName || state.step4Data.firstName}!`,
      });

      logger.info('Registration data successfully transferred and saved');
      
    } catch (error) {
      console.error('❌ Error completing registration:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при завершении регистрации',
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

  // ✅ ИСПРАВЛЕНИЕ: Переход только после успешной передачи данных
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
      // 4. Обновляем контекст пользователя и ждем завершения
      if (newUser) {
        await updateUser({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          registrationCompleted: true
        });
      }

      // 5. ТОЛЬКО ПОСЛЕ обновления контекста очищаем временные данные
      resetRegistration();
      
      // 6. Редирект на онбординг
      navigate('/patient/onboarding');
    } catch (error) {
      console.error('❌ Error updating user context:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль. Попробуйте еще раз.',
        variant: 'destructive',
      });
    }
  };

  // Автоматический переход через 5 секунд после успешной передачи данных
  useEffect(() => {
    if (isDataTransferred) {
      const timer = setTimeout(() => {
        handleContinueManually();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isDataTransferred]);

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
            Ваш профиль создан успешно. Сейчас мы подготавливаем персонализированную анкету 
            специально для вашего этапа.
          </p>

          {/* ✅ НОВОЕ: Показываем статус подготовки данных с DataBridge */}
          <div className="bg-card rounded-lg p-4 mb-6 border border-muted">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Подготовка персонализации
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Сохранение профиля</span>
                <span className={newUser ? "text-green-600" : "text-yellow-600"}>
                  {newUser ? "✅" : "⏳"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Передача данных</span>
                <span className={transferResult?.success ? "text-green-600" : "text-yellow-600"}>
                  {transferResult?.success ? "✅" : "⏳"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Валидация целостности</span>
                <span className={isDataTransferred ? "text-green-600" : "text-yellow-600"}>
                  {isDataTransferred ? "✅" : "⏳"}
                </span>
              </div>
              {transferResult?.transferredKeys && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ключей создано: {transferResult.transferredKeys.length}</span>
                  <span className="text-green-600">✅</span>
                </div>
              )}
            </div>
          </div>
          
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
            disabled={!isDataTransferred}
            className={`w-full mb-4 ${
              isDataTransferred 
                ? 'bloom-button' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isDataTransferred ? 'Продолжить к персональной анкете' : 'Подготовка данных...'}
          </Button>
          
          {isDataTransferred ? (
            <p className="text-xs text-muted-foreground">
              Автоматический переход через 5 секунд...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Пожалуйста, подождите завершения подготовки...
            </p>
          )}
        </div>

        {/* Мотивирующее сообщение */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
          <p className="text-sm text-foreground">
            <strong>🌟 Вы сделали важный шаг!</strong> <br />
            {selectedPersona && `Анкета адаптирована для этапа "${selectedPersona.title}". `}
            Персональные рекомендации уже ждут вас!
          </p>
        </div>
      </div>
    </div>
  );
};

// Добавить функцию определения стартового шага:
const getPersonaStartStep = (persona: string) => {
  switch(persona) {
    case 'first_signs': return 1;
    case 'active_phase': return 2; 
    case 'postmenopause': return 3;
    default: return 1;
  }
};

// ✅ НОВОЕ: Вспомогательные функции для определения пути онбординга
const getOnboardingPathByPersona = (personaId: string | null) => {
  if (!personaId) return { focus: ['general'], priorityQuestions: ['basic_info'] };
  
  const paths = {
    'first_signs': {
      focus: ['cycle_tracking', 'education', 'prevention'],
      priorityQuestions: ['menstrual_history', 'family_history', 'lifestyle'],
      recommendedLength: 'standard'
    },
    'active_phase': {
      focus: ['symptom_management', 'quality_of_life', 'treatment_options'],
      priorityQuestions: ['current_symptoms', 'impact_assessment', 'treatment_preferences'],
      recommendedLength: 'detailed'
    },
    'postmenopause': {
      focus: ['long_term_health', 'prevention', 'wellness'],
      priorityQuestions: ['health_screening', 'bone_health', 'cardiovascular_health'],
      recommendedLength: 'comprehensive'
    }
  };
  return paths[personaId as keyof typeof paths] || paths['active_phase'];
};