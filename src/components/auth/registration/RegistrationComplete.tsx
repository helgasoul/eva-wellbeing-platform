import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRegistration } from '@/context/RegistrationContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Sparkles, Heart, Shield, ArrowRight, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { dataBridge } from '@/services/dataBridge';

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
  const [isDataTransferred, setIsDataTransferred] = useState(false);
  const [newUser, setNewUser] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  
  const selectedPersona = state.step3Data.selectedPersona 
    ? menopausePersonas[state.step3Data.selectedPersona]
    : null;

  useEffect(() => {
    // ✅ ИСПРАВЛЕНИЕ: Завершаем регистрацию и сохраняем данные ПЕРЕД очисткой
    const completeAuthRegistration = async () => {
      if (!state.isCompleted || isDataTransferred) return;

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

        // Завершаем регистрацию и получаем созданного пользователя
        const createdUser = await completeRegistration(registrationData);
        setNewUser(createdUser);
        
        // ✅ НОВОЕ: Используем DataBridge для безопасной передачи данных
        const result = dataBridge.transferRegistrationToOnboarding(createdUser, {
          step1: state.step1Data,
          step2: state.step2Data,
          step3: state.step3Data
        });
        
        setTransferResult(result);
        
        if (result.success) {
          setIsDataTransferred(true);
          
          // Логируем успешную передачу с аналитикой
          const analytics = dataBridge.getTransferAnalytics();
          console.log('✅ DataBridge analytics:', analytics);
        } else {
          console.error('❌ DataBridge transfer failed:', result.errors);
          // Fallback to old method
          const onboardingPresets = {
            fromRegistration: true,
            personaId: state.step3Data.selectedPersona,
            registrationTimestamp: new Date().toISOString(),
            basicInfo: {
              firstName: state.step4Data.firstName,
              lastName: state.step4Data.lastName,
              email: state.step1Data.email,
              phone: state.step1Data.phone
            },
            consents: {
              ...state.step2Data,
              timestamp: new Date().toISOString()
            },
            expectedOnboardingPath: getOnboardingPathByPersona(state.step3Data.selectedPersona)
          };
          
          localStorage.setItem('eva_onboarding_presets', JSON.stringify(onboardingPresets));
          setIsDataTransferred(true);
        }
        
        toast({
          title: 'Регистрация завершена!',
          description: `Добро пожаловать, ${createdUser.firstName}!`,
        });

        console.log('✅ Registration data successfully transferred and saved');
        
      } catch (error) {
        console.error('❌ Error completing registration:', error);
        toast({
          title: 'Ошибка',
          description: error instanceof Error ? error.message : 'Произошла ошибка при завершении регистрации',
          variant: 'destructive',
        });
      }
    };

    completeAuthRegistration();
  }, [state, completeRegistration, isDataTransferred]);

  // ✅ ИСПРАВЛЕНИЕ: Переход только после успешной передачи данных
  const handleContinueManually = () => {
    if (!isDataTransferred) {
      toast({
        title: 'Подождите',
        description: 'Завершается подготовка ваших данных...',
        variant: 'default',
      });
      return;
    }

    // Теперь безопасно очищаем регистрационные данные
    resetRegistration();
    navigate('/patient/onboarding');
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